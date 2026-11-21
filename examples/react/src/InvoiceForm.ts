import { Readers, Services } from '@punica/form';
import {
  FieldArray,
  GetValues,
  Reset,
  SetValue,
  Submit,
  Trigger,
  Validate
} from '@punica/form-service';
import { FormItemList, FormItemText, Reader, Title } from './formSystem';
import { required } from './UserForm';

/** A row of the invoice. It has no services: it gets the ones of the invoice. */
export class LineForm {
  @FormItemText({ label: 'Product', validation: required('Product') })
  product = '';

  @FormItemText({ label: 'Price' })
  price = '';
}

@Title('Invoice')
@Readers([new Reader()])
@Services([FieldArray, GetValues, SetValue, Validate, Trigger, Reset, Submit])
export class InvoiceForm {
  @FormItemText({ label: 'Customer', validation: required('Customer') })
  customer = '';

  // Every line is a form of its own, created from LineForm
  @FormItemList({
    label: 'Lines',
    row: () => new LineForm(),
    validation: async ({ formItem }) => ({
      error: !formItem.value.length,
      errorMessages: formItem.value.length ? [] : ['Add a line']
    })
  })
  lines: LineForm[] = [new LineForm()];
}
