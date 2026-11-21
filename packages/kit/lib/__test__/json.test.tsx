import { createElement } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { FormDefinitionError } from '@punica/form-json';
import { JsonForm } from '../json';

const definition = {
  version: 1,
  title: 'Contact',
  items: [
    {
      property: 'email',
      type: 'text',
      label: 'Email',
      rules: [{ rule: 'required' }, { rule: 'email' }],
      props: { inputType: 'email' }
    },
    { property: 'phone', type: 'checkbox', label: 'Call me' },
    {
      property: 'number',
      type: 'text',
      label: 'Phone number',
      visibleWhen: { property: 'phone', equals: true }
    }
  ]
};

/** The custom elements are not defined in jsdom: events are fired by hand. */
const fire = (element: Element, type: string, detail: unknown) =>
  act(async () => {
    element.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
  });

describe('JsonForm', () => {
  test('renders a form definition with the components of the kit', async () => {
    const onSubmit = jest.fn();
    const { container } = render(
      createElement(JsonForm, { definition, onSubmit })
    );

    await screen.findByRole('heading', { name: 'Contact' });

    const fields = () => [...container.querySelectorAll('punica-field')];

    // The phone number is hidden until the box is ticked
    expect(fields().map((field) => field.getAttribute('label'))).toEqual([
      'Email',
      ''
    ]);
    expect(
      fields()[0].querySelector('punica-input')?.getAttribute('type')
    ).toEqual('email');

    await fire(
      container.querySelector('punica-checkbox') as Element,
      'punica-change',
      { checked: true }
    );

    await waitFor(() => expect(fields()).toHaveLength(3));

    await act(async () => {
      container
        .querySelector('form')
        ?.dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true })
        );
    });

    await waitFor(() =>
      expect(fields()[0].getAttribute('error')).toEqual('Email is required')
    );

    await fire(
      fields()[0].querySelector('punica-input') as Element,
      'punica-input',
      { value: 'jane@example.com' }
    );
    await act(async () => {
      container
        .querySelector('form')
        ?.dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true })
        );
    });

    await waitFor(() =>
      expect(onSubmit.mock.calls[0]?.[0]).toEqual({
        email: 'jane@example.com',
        phone: true,
        number: undefined
      })
    );
  });

  test('a definition that is not valid is not rendered', async () => {
    const failed = jest.fn((error: unknown) =>
      createElement('p', { role: 'alert' }, String(error))
    );

    render(
      createElement(JsonForm, {
        failed,
        definition: {
          version: 1,
          items: [
            { property: 'a', type: 'text', label: 'A', onChange: 'alert(1)' },
            { property: 'b', type: 'html', label: '<b>B</b>' }
          ]
        }
      })
    );

    expect((await screen.findByRole('alert')).textContent).toContain(
      'items[0].onChange'
    );
    expect(failed.mock.calls[0][0]).toBeInstanceOf(FormDefinitionError);
  });

  test('the rules of the kit a definition sets with props are validated', async () => {
    const onSubmit = jest.fn();
    const { container } = render(
      createElement(JsonForm, {
        onSubmit,
        definition: {
          version: 1,
          title: 'Extras',
          items: [
            {
              property: 'extras',
              type: 'multiselect',
              label: 'Extras',
              options: ['Wrap', 'Card', 'Bag'],
              props: { maxItems: 2 }
            },
            {
              property: 'day',
              type: 'date',
              label: 'Day',
              rules: [{ rule: 'required', message: 'Pick a day' }],
              props: { maxDate: '2026-01-20' }
            }
          ]
        }
      })
    );

    await screen.findByRole('heading', { name: 'Extras' });

    const fields = () => [...container.querySelectorAll('punica-field')];

    await fire(
      fields()[0].querySelector('punica-select') as Element,
      'punica-change',
      { value: ['Wrap', 'Card', 'Bag'] }
    );
    await waitFor(() =>
      expect(fields()[0].getAttribute('error')).toEqual(
        'Extras takes at most 2'
      )
    );

    // The rules of the definition come first, with their own messages
    await act(async () => {
      container
        .querySelector('form')
        ?.dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true })
        );
    });
    await waitFor(() =>
      expect(fields()[1].getAttribute('error')).toEqual('Pick a day')
    );

    await fire(
      fields()[1].querySelector('punica-date-picker') as Element,
      'punica-change',
      { value: '2026-02-01' }
    );
    await waitFor(() =>
      expect(fields()[1].getAttribute('error')).toEqual(
        'Day must be 2026-01-20 or earlier'
      )
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
