import { Services, Starters, Readers } from '../../..';
import {
  Title,
  Description,
  Layout,
  FormItemA,
  FormItemB,
  FormItemC,
  Service,
  Starter,
  Reader
} from '../../design';
import {
  formItemProperty1,
  formItemProperty2,
  formItemProperty3,
  formItemProperty4
} from './items';

@Title('Title')
@Description('Description')
@Services([new Service()])
@Readers([new Reader()])
@Starters([new Starter()])
class FormA {
  public id = '';

  @Layout({ grid: { xs: 12 } })
  @FormItemA(formItemProperty1)
  public property1 = 'a|b|c';

  @Layout({ grid: { xs: 12 } })
  @FormItemC(formItemProperty2)
  public property2 = 'deneme';

  @Layout({ grid: { xs: 12 } })
  @FormItemB(formItemProperty3)
  public property3: Date = new Date();

  @Layout({ grid: { xs: 12 } })
  @FormItemB(formItemProperty4)
  public property4 = { name: 'property name' };
}

export default FormA;
