# Example: React

A small application built on Punica Form: its own form system
(`src/formSystem.tsx`), a decorated form class (`src/UserForm.ts`) and the
React side with `@punica/form-react` (`src/App.tsx`). The page shows two forms
of the same class side by side.

```bash
pnpm install
pnpm build                                  # in the repository root: builds the packages
pnpm --filter @punica/example-react dev     # http://localhost:5173
pnpm e2e                                    # production build, driven in Chromium
```

## Decorators and your bundler

Punica Form works with the legacy decorators of TypeScript and with the
standard ones. Which of them you can write depends on your bundler: Vite 8
compiles the legacy decorators when `"experimentalDecorators": true` is set in
`tsconfig.json`, as this example does, and leaves standard decorators
untransformed, which browsers do not run.
