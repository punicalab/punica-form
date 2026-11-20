import { createElement } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { FormKit, SelectField, TextField, CheckboxField } from '..';
import { KitForm } from '../react';

@FormKit({
  title: 'Create User',
  description: 'Tell us who you are',
  columns: 2
})
class UserForm {
  @TextField({ label: 'Name', required: true, help: 'Your full name' })
  public name = '';

  @SelectField({
    label: 'Country',
    options: ['Tunisia', { value: 'TR', label: 'Türkiye' }]
  })
  public country = '';

  @CheckboxField({ label: 'I accept the terms' })
  public terms = false;
}

/** The custom elements are not defined in jsdom: events are fired by hand. */
const fire = (element: Element, type: string, detail: unknown) =>
  act(async () => {
    element.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
  });

const renderForm = async (
  props: Partial<Parameters<typeof KitForm<UserForm>>[0]> = {}
) => {
  const { container } = render(
    createElement(KitForm<UserForm>, { entity: () => new UserForm(), ...props })
  );

  await screen.findByRole('heading', { name: 'Create User' });

  const field = (index: number) =>
    container.querySelectorAll('punica-field')[index];

  return {
    container,
    field,
    form: container.querySelector('form') as HTMLFormElement
  };
};

const submit = (form: HTMLFormElement) =>
  act(async () => {
    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
  });

describe('KitForm', () => {
  test('renders the title, the layout and one field for every item', async () => {
    const { container, field } = await renderForm();

    expect(screen.getByText('Tell us who you are')).toBeTruthy();
    expect(
      container.querySelector('punica-form-layout')?.getAttribute('columns')
    ).toEqual('2');
    expect(container.querySelectorAll('punica-field')).toHaveLength(3);
    expect(field(0).getAttribute('label')).toEqual('Name');
    expect(field(0).getAttribute('help')).toEqual('Your full name');
    expect(field(0).querySelector('punica-input')).toBeTruthy();
    expect(
      [...field(1).querySelectorAll('punica-option')].map((o) => o.textContent)
    ).toEqual(['Tunisia', 'Türkiye']);
    // A checkbox shows its label itself
    expect(field(2).getAttribute('label')).toEqual('');
    expect(field(2).querySelector('punica-checkbox')?.textContent).toEqual(
      'I accept the terms'
    );
  });

  test('a field is validated when it is left and shows its message', async () => {
    const { field } = await renderForm();

    await act(async () => {
      field(0).dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    });

    await waitFor(() =>
      expect(field(0).getAttribute('error')).toEqual('Name is required')
    );
  });

  test('an invalid form is not submitted, a valid one is, with its values', async () => {
    const onSubmit = jest.fn();
    const { field, form } = await renderForm({ onSubmit });

    await submit(form);

    await waitFor(() =>
      expect(field(0).getAttribute('error')).toEqual('Name is required')
    );
    expect(onSubmit).not.toHaveBeenCalled();

    await fire(
      field(0).querySelector('punica-input') as Element,
      'punica-input',
      { value: 'Jane' }
    );
    await fire(
      field(1).querySelector('punica-select') as Element,
      'punica-change',
      { value: 'TR' }
    );
    await fire(
      field(2).querySelector('punica-checkbox') as Element,
      'punica-change',
      { checked: true }
    );
    await submit(form);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: 'Jane',
      country: 'TR',
      terms: true
    });
    expect(field(0).getAttribute('error')).toEqual('');
  });

  test('a form that is being submitted is not submitted again', async () => {
    let finish: () => void = () => undefined;
    const onSubmit = jest.fn(
      () => new Promise<void>((resolve) => (finish = resolve))
    );
    const { field, form } = await renderForm({ onSubmit });

    await fire(
      field(0).querySelector('punica-input') as Element,
      'punica-input',
      { value: 'Jane' }
    );
    await submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await submit(form);
    await act(async () => finish());

    expect(onSubmit).toHaveBeenCalledTimes(1);

    await submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    await act(async () => finish());
  });

  test('what onSubmit throws is given to onError', async () => {
    const onError = jest.fn();
    const { field, form } = await renderForm({
      onError,
      onSubmit: async () => {
        throw new Error('server is down');
      }
    });

    await fire(
      field(0).querySelector('punica-input') as Element,
      'punica-input',
      { value: 'Jane' }
    );
    await submit(form);

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(new Error('server is down'))
    );
    expect(screen.getByRole('alert').textContent).toEqual('server is down');
  });

  test('your own component replaces the one of a type', async () => {
    const { field } = await renderForm({
      components: {
        'kit:text': ({ item }) =>
          createElement('output', null, `custom ${item.label}`)
      }
    });

    expect(field(0).querySelector('output')?.textContent).toEqual(
      'custom Name'
    );
  });
});
