import { Form, StoreManager, FormController } from '..';

describe('form', () => {
  let formData: Form<any> = {
    items: [
      {
        type: 'form-item-a',
        label: 'Property 1',
        required: false,
        property: 'property1',
        value: 'a|b|c',
        initialValue: 'a|b|c',
        layout: [Object],
        disabled: true
      },
      {
        type: 'form-item-c',
        label: 'Property 2',
        required: true,
        property: 'property2',
        value: 'deneme',
        initialValue: 'deneme',
        layout: [Object],
        hidden: true
      },
      {
        type: 'form-item-b',
        label: 'Property 3',
        required: true,
        property: 'property3',
        value: null,
        initialValue: '2023-09-20T03:30:48.348Z',
        layout: [Object]
      }
    ],
    initializer: undefined,
    store: {},
    itemsMap: { property1: 0, property2: 1, property3: 2 }
  };

  /**
   *
   */
  beforeAll(async () => {
    const storeManager = new StoreManager();
    const formController = new FormController(storeManager, formData);

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
