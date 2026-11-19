import { Readers, Services, type ErrorDetail } from '@punica/form';
import {
  GetValues,
  Reset,
  SetValue,
  Trigger,
  Validate
} from '@punica/form-service';
import { FormItemSelect, FormItemText, Reader, Title } from './formSystem';

const CITIES: Record<string, string[]> = {
  Tunisia: ['Tunis', 'Sfax'],
  Türkiye: ['Ankara', 'İzmir']
};

const required = (label: string) => {
  return async ({
    formItem
  }: {
    formItem: { value?: unknown };
  }): Promise<ErrorDetail> => ({
    error: !formItem.value,
    errorMessages: formItem.value ? [] : [`${label} is required`]
  });
};

@Title('Create User')
@Readers([new Reader()])
@Services([GetValues, SetValue, Validate, Trigger, Reset])
export class UserForm {
  @FormItemText({ label: 'Name', required: true, validation: required('Name') })
  name = '';

  @FormItemSelect({
    label: 'Country',
    options: Object.keys(CITIES),
    // Choosing a country shows the city, with the cities of that country
    control: async ({ formItem, getItem }) => [
      {
        ...getItem('city')!,
        hidden: !formItem.value,
        value: '',
        options: CITIES[formItem.value] ?? []
      }
    ]
  })
  country = '';

  @FormItemSelect({ label: 'City', hidden: true, validation: required('City') })
  city = '';
}
