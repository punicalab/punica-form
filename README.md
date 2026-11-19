# Punica Form

> A **headless** and **framework-agnostic** form engine that separates business logic from UI logic.

[![npm version](https://img.shields.io/npm/v/@punica/form.svg)](https://www.npmjs.com/package/@punica/form)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Punica Form** provides the core form management infrastructure, while you design and implement your own UI layer according to your project's needs and preferences.

## ✨ Features

- 🎯 **Headless & Framework Agnostic** - Works with React, Vue, Angular, or vanilla JavaScript
- 🔧 **Business Logic Separation** - Keep your form logic independent of UI frameworks
- 🎨 **Custom Form Architecture** - Build your own FormItems, decorators, readers, and starters
- ⚡ **Dynamic Form Creation** - Generate and modify forms at runtime based on metadata
- 🛠️ **Modular Services** - Extensible service layer for validation, data handling, and state management
- 📦 **Type Safe** - Services, events and items are typed against your form class
- 🧊 **Immutable State** - Every change is a new form object; subscribe to it from any UI library
- 🚀 **Performance Focused** - Lightweight and efficient, activating only necessary components

## 📦 Installation

Install the core form engine:

```bash
npm install @punica/form
```

Install built-in services (optional but recommended):

```bash
npm install @punica/form-service
```

## ⚙️ Requirements

Punica Form uses TypeScript decorators. Both implementations work: the legacy
one (`"experimentalDecorators": true`) and the standard one of TypeScript 5.
No reflection polyfill is needed.

## 🚀 Quick Start

`Title`, `FormItemInputText` and `Reader` below are part of **your** form
system (see [Building Your Form System](https://form.punicalab.com/docs/building-your-form/building-form-overview)).

```typescript
import { FormController, Readers, Services } from "@punica/form";
import { GetValues, SetValue, Validate } from "@punica/form-service";
import { Title, FormItemInputText, Reader } from "@/commons";

// Define your form class
@Title("Create User")
@Readers([new Reader()])
@Services([GetValues, SetValue, Validate])
export class UserForm {
  @FormItemInputText({ label: "Name", required: true })
  name: string = "";
}

// Use FormController
const controller = await FormController.fromEntity(new UserForm());

controller.subscribe(() => render(controller.getForm()));
await controller.start();

// Services are read by class and are bound to UserForm
await controller.getService(SetValue).run("name", "John");

if (await controller.getService(Validate).run()) {
  const values = await controller.getService(GetValues).run(); // UserForm
}
```

The form is immutable: every change produces a new form object, so it plugs
into `useSyncExternalStore(controller.subscribe, controller.getForm)` and
other stores directly.

## 📚 Documentation

For complete documentation, examples, and guides, visit:

**👉 [Full Documentation](https://form.punicalab.com)**

The documentation covers:

- [Quick Start Guide](https://form.punicalab.com/docs/quick-start)
- [Core Concepts](https://form.punicalab.com/docs/core-concepts/basic-usage)
- [Building Your Form System](https://form.punicalab.com/docs/building-your-form/building-form-overview)
- [Form Items](https://form.punicalab.com/docs/form-items/formItemIntroduction)
- [Decorators](https://form.punicalab.com/docs/decorators/decorator)
- [Validation](https://form.punicalab.com/docs/validation/validation-introduction)
- [Advanced Topics](https://form.punicalab.com/docs/advanced/building-form-architecture)
- [API Reference](https://form.punicalab.com/docs/category/api-reference)

## 🏗️ Architecture

Punica Form operates on a foundation of modularity and flexibility:

```
┌─────────────────────────────────────┐
│   Punica Form (Headless Engine)    │
├─────────────────────────────────────┤
│  • Form State Management            │
│  • Metadata Processing              │
│  • Validation Engine                │
│  • Service Layer                    │
│  • Form Lifecycle Management        │
│  • Event System                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Your Form Architecture         │
├─────────────────────────────────────┤
│  • FormItem Components              │
│  • Custom Decorators                │
│  • Readers & Starters               │
│  • Layout System                    │
│  • Form Renderer                    │
└─────────────────────────────────────┘
```

## 🎯 What Punica Form Provides

**Business Logic Layer:**
- ✅ Form state management
- ✅ Metadata processing (decorators, readers)
- ✅ Validation engine
- ✅ Service layer (GetValues, SetValue, Validate, etc.)
- ✅ Form lifecycle management
- ✅ Event system
- ✅ Framework-agnostic form data structure

## 🛠️ What You Build

**Your Form System:**
- 🎨 FormItem Components (InputText, Select, Textarea, etc.)
- 📝 Custom Decorators (@Layout, @FormItemInputText, etc.)
- 🔄 Custom Readers (process your UI decorators)
- 🚀 Starters (dynamically modify forms)
- 📐 Layout System (Grid, CSS, your choice)
- 🎭 Form Renderer (your UI implementation)

## 🔧 Packages

This repository is a monorepo containing the following packages:

- **[@punica/form](./packages/form)** - Core form engine
- **[@punica/form-service](./packages/service)** - Built-in services (GetValues, SetValue, Validate, etc.)
- **[@punica/form-kit](./packages/kit)** - A ready-made form system: field decorators, validation rules and React components built on `@punica/components`
- **[@punica/form-react](./packages/react)** - React hooks: `useFormController` and `useForm`
- **[@punica/form-mcp](./packages/mcp)** - MCP server that lets AI assistants look up the API and check their code

## 🤖 AI Assistants

Punica Form ships an [MCP](https://modelcontextprotocol.io) server, so an
assistant reads the real API instead of guessing it:

```bash
claude mcp add punica-form -- npx -y @punica/form-mcp
```

See [packages/mcp](./packages/mcp) for other clients and the list of tools.

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build packages
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test-watch

# Lint
pnpm lint

# Format code
pnpm format

# Describe a change for the next release
pnpm changeset
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👤 Author

**Uryan Sezgin TEKE**

- GitHub: [@uryansezginteke](https://github.com/uryansezginteke)
- Email: uryan.sezgin.teke@gmail.com

## 🙏 Acknowledgments

- Built with TypeScript
- Uses [pnpm](https://pnpm.io/) workspaces and [Changesets](https://github.com/changesets/changesets) for monorepo management
- Inspired by the need for maintainable, scalable form management

## 📞 Support

- 📖 [Documentation](https://form.punicalab.com)
- 💬 [GitHub Discussions](https://github.com/punicalab/punica-form/discussions)
- 🐛 [Issue Tracker](https://github.com/punicalab/punica-form/issues)

---

**⭐ If you find Punica Form useful, please consider giving it a star on GitHub!**

