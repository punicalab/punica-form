import { Form, FormEvents, FormItem } from '..';

export type CommandService<E, F extends FormItem<E>> = {
  initialFormData: Form<E, F>;
  formData: Form<E, F>;
  entity: E;
  fireEvent: (eventType: FormEvents, data: any) => void;
};
