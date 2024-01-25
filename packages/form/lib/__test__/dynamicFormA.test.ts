import { Form, FormController } from '..';

describe('form', () => {
  let formData: Form<any, any> = {
    services: [],
    itemsMap: {},
    items: [
      {
        property: 'property1',
        type: 'form-item-a',
        label: 'Property 1',
        required: false,
        value: 'a|b|c',
        initialValue: 'a|b|c',
        disabled: true
      },
      {
        property: 'property2',
        type: 'form-item-c',
        label: 'Property 2',
        required: true,
        value: 'deneme',
        initialValue: 'deneme',
        hidden: true
      },
      {
        property: 'property3',
        type: 'form-item-b',
        label: 'Property 3',
        required: true,
        value: '2023-09-20T03:30:48.348Z',
        initialValue: '2023-09-20T03:30:48.348Z'
      }
    ]
  };

  /**
   *
   */
  beforeAll(async () => {
    const formController = new FormController(formData);

    formData = await formController.start();
  });

  /**
   *
   */
  test('disable check', () => {
    const formItem = formData?.items?.[0];

    expect(formItem.disabled).toEqual(true);
  });
});
