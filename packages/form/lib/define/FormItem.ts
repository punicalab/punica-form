import { setFormItemProperty } from '../metadata';
import {
  defaultFormItemRegister,
  FormItemRegister,
  Renderer
} from '../register';
import { FormPropertyDecorator, propertyDecorator } from './decorator';

/** The key the form items of a class are stored under. */
export const FORM_ITEMS = 'form-items';

/**
 * Defines a form item type: registers its renderer and returns the property
 * decorator that turns a property of a form class into an item of that type.
 * @param type - The form item type
 * @param renderer - What renders items of the type; Punica Form only stores it
 * @param options.register - The register to use instead of the default one
 */
const defineFormItem = <T extends object>(
  type: string,
  renderer: Renderer,
  options: { register?: FormItemRegister } = {}
): ((data: T) => FormPropertyDecorator) => {
  (options.register ?? defaultFormItemRegister).register(type, renderer);

  return (data) =>
    propertyDecorator((target, property) =>
      setFormItemProperty(target, FORM_ITEMS, property, { ...data, type })
    );
};

export default defineFormItem;
