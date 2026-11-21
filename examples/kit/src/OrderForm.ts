import {
  ArrayField,
  DateField,
  FileField,
  FormKit,
  MultiSelectField,
  NumberField,
  PasswordField,
  RadioGroupField,
  SelectField,
  TextField,
  type Option
} from '@punica/form-kit';

/** Stands in for a request: the cities arrive a moment later. */
const loadCities = (): Promise<Option[]> =>
  new Promise((resolve) =>
    setTimeout(() => resolve(['Tunis', 'Sfax', 'Ankara']), 300)
  );

/** A row of the order. It needs no decorator of its own. */
export class LineForm {
  @TextField({ label: 'Product', required: true })
  product = '';

  @NumberField({ label: 'Quantity', min: 1 })
  quantity?: number = 1;
}

@FormKit({ title: 'Order', columns: 2 })
export class OrderForm {
  @RadioGroupField({
    label: 'Delivery',
    options: ['Post', { value: 'pickup', label: 'Pick up' }],
    orientation: 'horizontal',
    required: true
  })
  delivery = '';

  @SelectField({ label: 'City', options: loadCities, required: true })
  city = '';

  @DateField({ label: 'Day', minDate: '2026-01-10', maxDate: '2026-01-20' })
  day?: string;

  @MultiSelectField({
    label: 'Extras',
    options: ['Wrap', 'Card', 'Bag'],
    maxItems: 2
  })
  extras: string[] = [];

  @PasswordField({ label: 'Coupon', minLength: 4 })
  coupon = '';

  @FileField({ label: 'Receipt', accept: '.txt', maxFileSize: 1024 })
  receipt?: File;

  @ArrayField({
    label: 'Lines',
    row: () => new LineForm(),
    minItems: 1,
    addLabel: 'Add line',
    span: 'full'
  })
  lines: LineForm[] = [];
}
