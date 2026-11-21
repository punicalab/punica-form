import { createElement } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { FormController } from '@punica/form';
import { SetValue, Trigger } from '@punica/form-service';
import {
  ArrayField,
  DateField,
  FileField,
  FormKit,
  KitItem,
  MultiSelectField,
  Option,
  PasswordField,
  RadioGroupField,
  SelectField,
  TextField
} from '..';
import { KitForm } from '../react';

const loadCities = jest.fn(async (): Promise<Option[]> => [
  'Tunis',
  { value: 'ANK', label: 'Ankara' }
]);

class LineForm {
  @TextField({ label: 'Product', required: true })
  public product = '';

  @TextField({ label: 'Note' })
  public note = '';
}

@FormKit({ title: 'Order' })
class OrderForm {
  @RadioGroupField({
    label: 'Delivery',
    options: ['Post', { value: 'pickup', label: 'Pick up' }],
    orientation: 'horizontal',
    required: true
  })
  public delivery = '';

  @DateField({
    label: 'Day',
    minDate: '2026-01-10',
    maxDate: '2026-01-20',
    locale: 'tr'
  })
  public day?: string;

  @MultiSelectField({
    label: 'Extras',
    options: ['Wrap', 'Card', 'Bag'],
    minItems: 1,
    maxItems: 2
  })
  public extras: string[] = [];

  @PasswordField({ label: 'Code', minLength: 4 })
  public code = '';

  @FileField({ label: 'Receipt', accept: '.pdf', maxFileSize: 1024 })
  public receipt?: File;

  @FileField({ label: 'Photos', multiple: true, maxItems: 2 })
  public photos: File[] = [];

  @SelectField({ label: 'City', options: loadCities, loadingText: 'Wait…' })
  public city = '';

  @ArrayField({
    label: 'Lines',
    row: () => new LineForm(),
    minItems: 1,
    maxItems: 2,
    addLabel: 'Add line',
    removeLabel: 'Drop'
  })
  public lines: LineForm[] = [];
}

/** The custom elements are not defined in jsdom: events are fired by hand. */
const fire = (element: Element, type: string, detail: unknown) =>
  act(async () => {
    element.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
  });

const click = (element: Element) =>
  act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

const file = (name: string, size: number) =>
  new File([new Uint8Array(size)], name);

describe('the rules of the new fields', () => {
  const start = async () => {
    const controller = await FormController.fromEntity<
      OrderForm,
      KitItem<OrderForm>
    >(new OrderForm());

    await controller.start();

    return async (property: keyof OrderForm, value: unknown) => {
      await controller.getService(SetValue).run(property, value);
      await controller.getService(Trigger).run(property);

      const item = controller
        .getForm()
        .items.find((other) => other.property === property);

      return item?.error ? item.errorMessages?.[0] : undefined;
    };
  };

  test('a date has to be in its range', async () => {
    const errorOf = await start();

    expect(await errorOf('day', '2026-01-09')).toEqual(
      'Day must be 2026-01-10 or later'
    );
    expect(await errorOf('day', '2026-01-21')).toEqual(
      'Day must be 2026-01-20 or earlier'
    );
    expect(await errorOf('day', '2026-01-15')).toBeUndefined();
    expect(await errorOf('day', undefined)).toBeUndefined();
  });

  test('choices and files are counted, and a file has a largest size', async () => {
    const errorOf = await start();

    expect(await errorOf('extras', [])).toEqual('Extras needs at least 1');
    expect(await errorOf('extras', ['Wrap', 'Card', 'Bag'])).toEqual(
      'Extras takes at most 2'
    );
    expect(await errorOf('extras', ['Wrap'])).toBeUndefined();

    expect(await errorOf('receipt', file('a.pdf', 2048))).toEqual(
      'Receipt must not be larger than 1 KB'
    );
    expect(await errorOf('receipt', file('a.pdf', 10))).toBeUndefined();
    expect(
      await errorOf('photos', [file('a', 1), file('b', 1), file('c', 1)])
    ).toEqual('Photos takes at most 2');
    expect(await errorOf('delivery', '')).toEqual('Delivery is required');
    expect(await errorOf('code', 'abc')).toEqual(
      'Code must be at least 4 characters'
    );
  });
});

describe('the components of the new fields', () => {
  const renderForm = async (
    props: Partial<Parameters<typeof KitForm<OrderForm>>[0]> = {}
  ) => {
    const { container } = render(
      createElement(KitForm<OrderForm>, {
        entity: () => new OrderForm(),
        ...props
      })
    );

    await screen.findByRole('heading', { name: 'Order' });

    const fields = () =>
      [
        ...container.querySelectorAll('punica-form-layout > punica-field')
      ].filter((field) => !field.closest('[data-kit-row]'));

    return {
      container,
      field: (index: number) => fields()[index],
      form: container.querySelector('form') as HTMLFormElement
    };
  };

  const submit = (form: HTMLFormElement) =>
    act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    });

  beforeEach(() => loadCities.mockClear());

  test('every field is rendered with its component', async () => {
    const { field } = await renderForm();
    const radios = field(0).querySelector('punica-radio-group') as Element;

    expect(radios.getAttribute('orientation')).toEqual('horizontal');
    expect(
      [...radios.querySelectorAll('punica-radio')].map((radio) => [
        radio.getAttribute('value'),
        radio.textContent
      ])
    ).toEqual([
      ['Post', 'Post'],
      ['pickup', 'Pick up']
    ]);

    const date = field(1).querySelector('punica-date-picker') as Element;

    expect(date.getAttribute('min')).toEqual('2026-01-10');
    expect(date.getAttribute('max')).toEqual('2026-01-20');
    expect(date.getAttribute('locale')).toEqual('tr');
    expect(
      field(2).querySelector('punica-select')?.hasAttribute('multiple')
    ).toBe(true);
    expect(
      field(3).querySelector('punica-input')?.getAttribute('type')
    ).toEqual('password');
    expect(
      field(4).querySelector('punica-file-input')?.getAttribute('accept')
    ).toEqual('.pdf');
    expect(
      field(5).querySelector('punica-file-input')?.hasAttribute('multiple')
    ).toBe(true);
  });

  test('their values reach the form as the types they stand for', async () => {
    const onSubmit = jest.fn();
    const { field, form } = await renderForm({ onSubmit });
    const receipt = file('a.pdf', 10);
    const photos = [file('a.png', 1), file('b.png', 1)];

    await fire(
      field(0).querySelector('punica-radio-group') as Element,
      'punica-change',
      { value: 'pickup' }
    );
    await fire(
      field(1).querySelector('punica-date-picker') as Element,
      'punica-change',
      { value: '2026-01-12' }
    );
    await fire(
      field(2).querySelector('punica-select') as Element,
      'punica-change',
      { value: ['Wrap', 'Bag'] }
    );
    await fire(
      field(3).querySelector('punica-input') as Element,
      'punica-input',
      { value: 'secret' }
    );
    await fire(
      field(4).querySelector('punica-file-input') as Element,
      'punica-change',
      { files: [receipt] }
    );
    await fire(
      field(5).querySelector('punica-file-input') as Element,
      'punica-change',
      { files: photos }
    );
    await click(screen.getByText('Add line'));
    await waitFor(() =>
      expect(field(7).querySelectorAll('[data-kit-row]')).toHaveLength(1)
    );
    await fire(
      field(7).querySelector('[data-kit-row] punica-input') as Element,
      'punica-input',
      { value: 'Paper' }
    );
    await submit(form);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    const values: OrderForm = onSubmit.mock.calls[0][0];

    expect(values).toMatchObject({
      delivery: 'pickup',
      day: '2026-01-12',
      extras: ['Wrap', 'Bag'],
      code: 'secret',
      lines: [{ product: 'Paper', note: '' }]
    });
    expect(values.receipt).toBe(receipt);
    expect(values.photos).toEqual(photos);
    expect(values.photos[0]).toBe(photos[0]);

    // An emptied date is no value, an emptied file field no file
    await fire(
      field(1).querySelector('punica-date-picker') as Element,
      'punica-change',
      { value: null }
    );
    await fire(
      field(4).querySelector('punica-file-input') as Element,
      'punica-change',
      { files: [] }
    );
    await submit(form);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1][0].day).toBeUndefined();
    expect(onSubmit.mock.calls[1][0].receipt).toBeUndefined();
  });

  test('choices that are loaded show that they are, and are loaded once', async () => {
    let finish: (options: Option[]) => void = () => undefined;
    const load = jest.fn(
      () => new Promise<Option[]>((resolve) => (finish = resolve))
    );

    @FormKit({ title: 'Order' })
    class CityForm {
      @SelectField({ label: 'City', options: load, loadingText: 'Wait…' })
      public city = '';
    }

    const show = () =>
      render(
        createElement(KitForm<CityForm>, { entity: () => new CityForm() })
      );
    const { container } = show();

    await screen.findByRole('heading', { name: 'Order' });

    const city = () => container.querySelector('punica-select') as Element;

    expect(city().getAttribute('placeholder')).toEqual('Wait…');
    expect(city().hasAttribute('disabled')).toBe(true);
    expect(city().querySelectorAll('punica-option')).toHaveLength(0);

    await act(async () => finish(['Tunis', { value: 'ANK', label: 'Ankara' }]));

    await waitFor(() =>
      expect(
        [...city().querySelectorAll('punica-option')].map((o) => o.textContent)
      ).toEqual(['Tunis', 'Ankara'])
    );
    expect(city().hasAttribute('disabled')).toBe(false);

    // A second form with the same function does not ask again
    const second = show();

    await waitFor(() =>
      expect(second.container.querySelectorAll('punica-option')).toHaveLength(2)
    );
    expect(load).toHaveBeenCalledTimes(1);
  });

  test('choices that cannot be loaded are reported and asked for again', async () => {
    const onError = jest.fn();
    const failing = async (): Promise<Option[]> => {
      throw new Error('offline');
    };

    @FormKit({ title: 'Order' })
    class Failing {
      @RadioGroupField({ label: 'City', options: failing })
      public city = '';
    }

    render(
      createElement(KitForm<Failing>, { entity: () => new Failing(), onError })
    );

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(new Error('offline'))
    );
    expect(document.querySelector('punica-radio-group')).toBeTruthy();
  });

  test('a list shows a form for every row, with buttons to add and remove', async () => {
    const { field, form } = await renderForm();
    const rows = () => [...field(7).querySelectorAll('[data-kit-row]')];
    const add = () => screen.getByText('Add line');

    expect(rows()).toHaveLength(0);

    await click(add());
    await waitFor(() => expect(rows()).toHaveLength(1));
    await click(add());
    await waitFor(() => expect(rows()).toHaveLength(2));

    // The fields of the row class, side by side
    expect(
      [...rows()[0].querySelectorAll('punica-field')].map((row) =>
        row.getAttribute('label')
      )
    ).toEqual(['Product', 'Note']);
    expect(
      rows()[0].querySelector('punica-form-layout')?.getAttribute('columns')
    ).toEqual('2');
    // No more than maxItems
    expect(add().hasAttribute('disabled')).toBe(true);

    await fire(
      rows()[1].querySelector('punica-input') as Element,
      'punica-input',
      { value: 'Ink' }
    );
    await click(rows()[0].querySelector('punica-button') as Element);
    await waitFor(() => expect(rows()).toHaveLength(1));

    expect(
      rows()[0].querySelector('punica-input')?.getAttribute('value')
    ).toEqual('Ink');
    expect(add().hasAttribute('disabled')).toBe(false);

    await click(rows()[0].querySelector('punica-button') as Element);
    await waitFor(() => expect(rows()).toHaveLength(0));
    await submit(form);

    await waitFor(() =>
      expect(field(7).getAttribute('error')).toEqual('Lines needs at least 1')
    );
  });

  test('a value that is chosen is validated at once, one that is typed when the field is left', async () => {
    const { field } = await renderForm();

    await fire(
      field(1).querySelector('punica-date-picker') as Element,
      'punica-change',
      { value: '2026-02-01' }
    );
    await waitFor(() =>
      expect(field(1).getAttribute('error')).toEqual(
        'Day must be 2026-01-20 or earlier'
      )
    );

    await fire(
      field(3).querySelector('punica-input') as Element,
      'punica-input',
      { value: 'abc' }
    );

    expect(field(3).getAttribute('error')).toEqual('');
  });

  test('leaving a button of a list does not validate its rows', async () => {
    const { field } = await renderForm();
    const add = screen.getByText('Add line');

    await click(add);
    await waitFor(() =>
      expect(field(7).querySelectorAll('[data-kit-row]')).toHaveLength(1)
    );
    await act(async () => {
      add.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    });
    await act(async () => new Promise((resolve) => setTimeout(resolve)));

    expect(
      field(7)
        .querySelector('[data-kit-row] punica-field')
        ?.getAttribute('error')
    ).toEqual('');
  });

  test('leaving a field of a row validates that field, not the list', async () => {
    const { field } = await renderForm();

    await click(screen.getByText('Add line'));
    await waitFor(() =>
      expect(field(7).querySelectorAll('[data-kit-row]')).toHaveLength(1)
    );
    await click(screen.getByText('Add line'));
    await waitFor(() =>
      expect(field(7).querySelectorAll('[data-kit-row]')).toHaveLength(2)
    );

    const products = () =>
      [...field(7).querySelectorAll('[data-kit-row]')].map(
        (row) => row.querySelector('punica-field') as Element
      );

    await act(async () => {
      products()[0].dispatchEvent(
        new FocusEvent('focusout', { bubbles: true })
      );
    });

    await waitFor(() =>
      expect(products()[0].getAttribute('error')).toEqual('Product is required')
    );
    // The other row was not looked at
    expect(products()[1].getAttribute('error')).toEqual('');
  });
});
