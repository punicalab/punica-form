# Example: form kit

A form built with `@punica/form-kit`: the class in `src/UserForm.ts` and one
`<KitForm>` in `src/main.tsx`. The fields are rendered with the real
`@punica/components` elements.

```bash
pnpm install
pnpm build                                 # in the repository root: builds the packages
pnpm --filter @punica/example-kit dev      # http://localhost:5173
pnpm e2e                                   # production builds, driven in Chromium
```
