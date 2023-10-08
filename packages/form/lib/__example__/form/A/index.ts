import { Services, Starters } from '../../..';
import {
  Title,
  Description,
  Layout,
  FormItemA,
  FormItemB,
  FormItemC,
  Service,
  Starter
} from '../../design';
import {
  formItemProperty1,
  formItemProperty2,
  formItemProperty3
} from './items';

//@ts-ignore
@Title('Title')
//@ts-ignore
@Description('Description')
//@ts-ignore
@Services([new Service()])
//@ts-ignore
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
}

export default FormA;
