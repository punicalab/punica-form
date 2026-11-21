// Checked by `pnpm typecheck`, not run: a form class whose properties do not
// have the types its schema takes must not compile.
import { defineForm, field } from '@punica/form';
import * as v from 'valibot';
import { z } from 'zod';
import { Schema } from '..';

const User = z.object({ email: z.string(), age: z.number().min(18) });

// Properties may be left out, start empty and be more than the schema knows
@Schema(User)
export class Fits {
  email = '';
  age?: number;
  newsletter = false;
}

// @ts-expect-error age is a string, the schema takes a number
@Schema(User)
export class Wrong {
  email = '';
  age = '';
}

// @ts-expect-error the same with a schema of Valibot
@Schema(v.object({ email: v.string(), age: v.number() }))
export class WrongValibot {
  email = 1;
}

export const Defined = defineForm(
  { email: field(''), age: field<number | undefined>(undefined) },
  Schema(User)
);

export const DefinedWrong = defineForm(
  { email: field(1) },
  // @ts-expect-error email is a number, the schema takes a string
  Schema(User)
);
