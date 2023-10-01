import { Services, Starters } from '../../../decorator';
import { CustomTitle, CustomDescription } from '../../decorator';
import { FormItemA, FormItemB, FormItemC } from '../../formItems';
import { Service } from '../../service';
import { Starter } from '../../starter';
import {
  formItemProperty1,
  formItemProperty2,
  formItemProperty3
} from './items';

//@ts-ignore
@Services([new Service()])
//@ts-ignore
@Starters([new Starter()])
//@ts-ignore
@CustomTitle('Title')
//@ts-ignore
@CustomDescription('Description')
class FormA {
  public id = '';
  @FormItemA(formItemProperty1)
  public property1 = 'a|b|c';
  @FormItemC(formItemProperty2)
  public property2 = 'deneme';
  @FormItemB(formItemProperty3)
  public property3: Date = new Date();
}

export default FormA;
