/**
 * The Standard Schema interface (https://standardschema.dev), version 1, as
 * far as this package uses it. Zod, Valibot, ArkType and others implement
 * it, so their schemas are accepted as they are.
 */
export interface StandardSchema<Input = unknown, Output = Input> {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown
    ) => StandardResult<Output> | Promise<StandardResult<Output>>;
    readonly types?:
      { readonly input: Input; readonly output: Output } | undefined;
  };
}

export type StandardResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<StandardIssue> };

export type StandardIssue = {
  readonly message: string;
  readonly path?:
    ReadonlyArray<PropertyKey | { readonly key: PropertyKey }> | undefined;
};

/** What a schema accepts. */
export type InputOf<S extends StandardSchema> = NonNullable<
  S['~standard']['types']
>['input'];
