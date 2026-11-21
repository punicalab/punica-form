# @punica/form-schema

Validate [Punica Form](https://form.punicalab.com) forms with the schemas you
already have. It is written against [Standard Schema](https://standardschema.dev),
so Zod, Valibot, ArkType, Yup and every other library that implements it work
as they are. The package has no dependency of its own.

```bash
npm install @punica/form-schema
```

## The schema of a form

`@Schema` gives a form class its schema; the `SchemaValidation` service
applies it.

```ts
import { Services } from '@punica/form';
import { Schema, SchemaValidation } from '@punica/form-schema';
import {
  GetValues,
  SetValue,
  Submit,
  Trigger,
  Validate
} from '@punica/form-service';
import { z } from 'zod';

const User = z.object({
  email: z.email('Enter an email'),
  age: z.number('Enter a number').min(18, 'Adults only')
});

@Schema(User)
@Services([SchemaValidation, GetValues, SetValue, Validate, Trigger, Submit])
class UserForm {
  @TextField({ label: 'Email' })
  email = '';

  @NumberField({ label: 'Age' })
  age?: number;
}
```

- Every issue of the schema is shown on the item it is about, found by its
  path. An issue about `address.city` belongs to the item of the path
  `address/city`, or else to the item of `address`.
- Issues that belong to no item, such as a rule about two values, become
  errors of the form (`state.errors`) when it is validated or submitted. The
  form is not valid then (`state.valid`) and not submitted.
- `Trigger` validates one item: the schema is asked about the whole form and
  only that item is written.
- A `validation` function of an item still runs, before the schema.
- A class whose properties do not have the types the schema takes does not
  compile. Properties may be left out and may start empty.

With `defineForm`, `Schema(User)` goes where the class decorators go. With
the form kit: `@FormKit({ services: [SchemaValidation] })`.

For a form that is not made from a class, give the schema to the service:

```ts
const controller = await FormController.fromForm({
  items,
  services: [SchemaValidation.of(User), Validate, Submit]
});
```

## The schema of one value

`schema` turns a schema into the `validation` of a form item. It needs no
service:

```ts
import { schema } from '@punica/form-schema';

@TextField({ label: 'Email', validation: schema(z.email('Enter an email')) })
email = '';
```

## Notes

- The messages are the ones of the schema library; translate them there.
- Only issues are read: what a schema transforms a value into is not written
  back to the form.
- Hidden and disabled items are not validated, as everywhere in Punica Form.
- The rows of a list are forms of their own: give the row class its own
  `@Schema`. A schema given with `SchemaValidation.of` is the schema of that
  form only, not of its rows.
- The schema is asked about what the form would be submitted as: its entity
  with the values of its items.
