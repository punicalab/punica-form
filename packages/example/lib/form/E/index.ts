import { Title, Chapter, Store } from '@punica/form';
import { FormItemA, FormItemB, FormItemC } from '../../formItems';
import chapter1 from './chapter/chapter1';
import chapter2 from './chapter/chapter2';
import property1 from './items/property1';
import property2 from './items/property2';
import property3 from './items/property3';

@Title('E Form')
@Store(
  new Map([
    ['country', 'Chile'],
    ['name', 'Tom']
  ])
)
class FormE {
  public id = '';
  @Chapter(chapter1)
  @FormItemA(property1)
  public property1 = 'a|b|c';
  @Chapter(chapter2)
  @FormItemC(property2)
  public property2 = 'deneme';
  @FormItemB(property3)
  public property3: Date = new Date();
}

export default FormE;
