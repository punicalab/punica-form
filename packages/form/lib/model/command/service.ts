import { Form, FormEvents, FormItem } from '..';
import { CommandItem } from '.';

export type CommandService<E, F extends FormItem<E>> = {
  initialFormData: Form<E, F>;
  formData: Form<E, F>;
  initialEntity: E;
  itemsMap: Record<keyof E, number>;
  createCommandItem: (item: F) => Promise<CommandItem<E, F>>;
  fireEvent: (eventType: FormEvents, data: any) => void;
  getItem: (property: keyof E) => F;
  writeItems: (items: Array<FormItem<E>>) => Promise<void>;
};
