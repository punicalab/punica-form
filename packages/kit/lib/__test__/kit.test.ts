import { FormController } from '@punica/form';
import { GetValues, SetValue, Trigger, Validate } from '@punica/form-service';
import {
  CheckboxField,
  FormKit,
  KitItem,
  NumberField,
  SelectField,
  TextField,
  setMessages
} from '..';

@FormKit({ title: 'Create User', columns: 2 })
class UserForm {
  @TextField({
    label: 'Name',
    required: true,
    minLength: 2,
    maxLength: 5,
    // Runs only for a value that passed the rules
    validation: async ({ formItem }) => ({
      error: formItem.value === 'admin',
      errorMessages: ['Name is taken']
    })
  })
  public name = '';

  @TextField({
    label: 'Email',
    inputType: 'email',
    pattern: /^\S+@\S+$/,
    messages: { pattern: () => 'Enter an email address' }
  })
  public email = '';

  @NumberField({ label: 'Age', min: 18, max: 99 })
  public age?: number;

  @SelectField({ label: 'Country', options: ['Tunisia', 'Türkiye'], span: 2 })
  public country = '';

  @CheckboxField({ label: 'I accept the terms', required: true })
  public terms = false;
}

const start = async () => {
  const controller = await FormController.fromEntity<
    UserForm,
    KitItem<UserForm>
  >(new UserForm());

  await controller.start();

  const set = (property: keyof UserForm, value: unknown) =>
    controller.getService(SetValue).run(property, value);
  const errorOf = async (property: keyof UserForm) => {
    await controller.getService(Trigger).run(property);

    const item = controller
      .getForm()
      .items.find((i) => i.property === property);

    return item?.error ? item.errorMessages?.[0] : undefined;
  };

  return { controller, set, errorOf };
};

describe('form kit', () => {
  test('@FormKit sets up the form, its services and its options', async () => {
    const { controller } = await start();
    const form = controller.getForm();

    expect(form).toMatchObject({ title: 'Create User', columns: 2 });
    expect(form.items.map((item) => [item.property, item.type])).toEqual([
      ['name', 'kit:text'],
      ['email', 'kit:text'],
      ['age', 'kit:number'],
      ['country', 'kit:select'],
      ['terms', 'kit:checkbox']
    ]);
    expect(form.items[3]).toMatchObject({
      span: 2,
      options: ['Tunisia', 'Türkiye']
    });
    expect(controller.getService(GetValues)).toBeInstanceOf(GetValues);
  });

  test('the rules of a field are validated, the first broken one is reported', async () => {
    const { set, errorOf } = await start();

    expect(await errorOf('name')).toEqual('Name is required');

    await set('name', 'a');
    expect(await errorOf('name')).toEqual('Name must be at least 2 characters');

    await set('name', 'abcdef');
    expect(await errorOf('name')).toEqual('Name must be at most 5 characters');

    await set('name', 'Jane');
    expect(await errorOf('name')).toBeUndefined();

    await set('age', 17);
    expect(await errorOf('age')).toEqual('Age must be at least 18');

    await set('age', 100);
    expect(await errorOf('age')).toEqual('Age must be at most 99');

    expect(await errorOf('terms')).toEqual('I accept the terms is required');

    await set('terms', true);
    expect(await errorOf('terms')).toBeUndefined();
  });

  test('an empty field that is not required is valid', async () => {
    const { errorOf } = await start();

    expect(await errorOf('email')).toBeUndefined();
    expect(await errorOf('age')).toBeUndefined();
  });

  test('the own validation of a field runs after its rules', async () => {
    const { set, errorOf } = await start();

    await set('name', 'admin');

    expect(await errorOf('name')).toEqual('Name is taken');
  });

  test('messages can be replaced for a field and for every form', async () => {
    const { set, errorOf } = await start();

    await set('email', 'nope');
    expect(await errorOf('email')).toEqual('Enter an email address');

    setMessages({ required: (label) => `${label} zorunludur` });
    expect(await errorOf('name')).toEqual('Name zorunludur');
    setMessages({ required: (label) => `${label} is required` });
  });

  test('a valid form is submitted with the values of the entity', async () => {
    const { controller, set } = await start();

    expect(await controller.getService(Validate).run()).toBe(false);

    await set('name', 'Jane');
    await set('terms', true);

    expect(await controller.getService(Validate).run()).toBe(true);
    expect(await controller.getService(GetValues).run()).toMatchObject({
      name: 'Jane',
      terms: true
    });
  });
});

describe('validation of a field', () => {
  @FormKit()
  class CodeForm {
    @TextField({ label: 'Zip', pattern: /^\d{5}$/g })
    public zip = '12345';

    @TextField({ label: 'Code', validation: async () => ({ error: true }) })
    public code = 'x';
  }

  const errorOf = async (property: keyof CodeForm) => {
    const controller = await FormController.fromEntity<
      CodeForm,
      KitItem<CodeForm>
    >(new CodeForm());

    await controller.start();
    await controller.getService(Trigger).run(property);
    await controller.getService(Trigger).run(property);

    const item = controller
      .getForm()
      .items.find((i) => i.property === property);

    return item?.error ? item.errorMessages : undefined;
  };

  test('a pattern with the g flag gives the same result every time', async () => {
    expect(await errorOf('zip')).toBeUndefined();
  });

  test('an error without a message gets the message of an invalid value', async () => {
    expect(await errorOf('code')).toEqual(['Code is not valid']);
  });
});

describe('email and URL fields', () => {
  @FormKit()
  class ContactForm {
    @TextField({ label: 'Email', inputType: 'email' })
    public email = '';

    @TextField({ label: 'Site', inputType: 'url' })
    public site = '';

    @TextField({
      label: 'Work email',
      inputType: 'email',
      pattern: /@example\.com$/,
      messages: { pattern: () => 'Use your work address' }
    })
    public work = '';
  }

  const errorOf = async (property: keyof ContactForm, value: string) => {
    const controller = await FormController.fromEntity<
      ContactForm,
      KitItem<ContactForm>
    >(new ContactForm());

    await controller.start();
    await controller.getService(SetValue).run(property, value);
    await controller.getService(Trigger).run(property);

    const item = controller
      .getForm()
      .items.find((i) => i.property === property);

    return item?.error ? item.errorMessages?.[0] : undefined;
  };

  test('an email field takes only an email address', async () => {
    expect(await errorOf('email', 'jane')).toEqual(
      'Email must be an email address'
    );
    expect(await errorOf('email', 'jane@example')).toEqual(
      'Email must be an email address'
    );
    expect(await errorOf('email', 'jane@example.com')).toBeUndefined();
    expect(await errorOf('email', '')).toBeUndefined();
  });

  test('a URL field takes only an absolute URL', async () => {
    expect(await errorOf('site', 'example.com')).toEqual('Site must be a URL');
    expect(await errorOf('site', 'https://example.com')).toBeUndefined();
  });

  test('a pattern of the field decides instead, with its message', async () => {
    expect(await errorOf('work', 'jane')).toEqual('Use your work address');
    expect(await errorOf('work', 'jane@example.com')).toBeUndefined();
  });

  test('setMessages replaces the email message', async () => {
    setMessages({ email: (label) => `${label}: bir e-posta adresi girin` });
    expect(await errorOf('email', 'jane')).toEqual(
      'Email: bir e-posta adresi girin'
    );
    setMessages({ email: (label) => `${label} must be an email address` });
  });
});
