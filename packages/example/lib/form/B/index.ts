import { IEntity } from '@punica/common';
import { Title } from '@punica/form-model';
import { FormItemA, FormItemB } from '../../formItems';
import property4 from './items/property4';
import property5 from './items/property5';
import property6 from './items/property6';

@Title('B Form')
class FormB implements IEntity {
  @FormItemA(property4)
  public property4 = '';
  @FormItemA(property5)
  public property5 = '';
  @FormItemB(property6)
  public property6: Date = new Date();

  public id = '';
}

export default FormB;
