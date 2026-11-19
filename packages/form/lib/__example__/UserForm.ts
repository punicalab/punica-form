import { IService, Readers, Services, Starters } from '..';
import { FormItemText, Layout, Reader, Starter, Title } from './formSystem';

/** A service without behaviour, to read back from the controller. */
export class Marker implements IService {
  public get name() {
    return 'marker';
  }
}

@Title('Create User')
@Readers([new Reader()])
@Starters([new Starter()])
@Services([Marker])
export class UserForm {
  // Not decorated: no form item
  public id = 1;

  @Layout({ xs: 6 })
  @FormItemText({
    label: 'Name',
    required: true,
    initialize: async ({ formItem }) => [{ ...formItem, disabled: true }]
  })
  public name = 'Jane';

  @FormItemText({ label: 'City', path: 'address/city' })
  public address = { city: 'Tunis' };
}

@Title('Create Admin')
export class AdminForm extends UserForm {
  @FormItemText({ label: 'Role' })
  public role = 'admin';
}
