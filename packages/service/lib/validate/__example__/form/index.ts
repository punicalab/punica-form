import { Services } from '@punica/form';
import { FormItemA, FormItemB, FormItemC } from '../formItems';
import { Validate } from '../..';
import property1 from './items/property1';
import property2 from './items/property2';
import property3 from './items/property3';

//@ts-ignore
@Services([new Validate()])
class FormSample {
  public id = '';
  @FormItemA(property1)
  public property1 = 'a|b|c';
  @FormItemC(property2)
  public property2 = 'deneme';
  @FormItemB(property3)
  public property3: Date = new Date();
}

export default FormSample;
