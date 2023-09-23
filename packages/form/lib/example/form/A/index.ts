import { Services } from '../../../decorator';
import { FormItemA, FormItemB, FormItemC } from '../../formItems';
import { Service } from '../../service';
import property1 from './items/property1';
import property2 from './items/property2';
import property3 from './items/property3';

@Services([new Service()])
class FormA {
  public id = '';
  @FormItemA(property1)
  public property1 = 'a|b|c';
  @FormItemC(property2)
  public property2 = 'deneme';
  @FormItemB(property3)
  public property3: Date = new Date();
}

export default FormA;
