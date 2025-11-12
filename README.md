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
- 📦 **TypeScript Support** - Full TypeScript support with comprehensive type definitions
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

## 🚀 Quick Start

```typescript
import { FormController, Readers, Services } from "@punica/form";
import { GetValues, SetValue, Validate } from "@punica/form-service";

// Define your form class
@Title("Create User")
@Readers([new Reader()])
@Services([new GetValues(), new SetValue(), new Validate()])
export class UserForm {
  @Layout({ xs: 12 })
  @FormItemInputText(name)
  name: string = "";
}

// Use FormController
const userForm = new UserForm();
const controller = await FormController.fromEntity(userForm);
const form = await controller.start();

// Access services
const validateService = controller.getServices("Validate");
const getValuesService = controller.getServices("GetValues");
```

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
- [API Reference](https://form.punicalab.com/docs/advanced/api-reference)

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

## 📖 Example

```typescript
import { FormController, Readers, Services } from "@punica/form";
import { GetValues, SetValue, Validate } from "@punica/form-service";
import { Title, FormItemInputText, Layout, Reader } from "@/commons";

@Title("Create User")
@Readers([new Reader()])
@Services([new GetValues(), new SetValue(), new Validate()])
export class UserForm {
  @Layout({ xs: 12 })
  @FormItemInputText({
    property: "name",
    label: "Name",
    required: true,
    minLength: 4,
    maxLength: 30
  })
  name: string = "";
}

// Initialize form
const userForm = new UserForm();
const controller = await FormController.fromEntity(userForm);
const form = await controller.start();

// Use services
const validateService = controller.getServices("Validate");
const isValid = await validateService.validate(form);

if (isValid) {
  const getValuesService = controller.getServices("GetValues");
  const values = await getValuesService.getValues(form);
  // Submit values...
}
```

## 🔧 Packages

This repository is a monorepo containing the following packages:

- **[@punica/form](./packages/form)** - Core form engine
- **[@punica/form-service](./packages/service)** - Built-in services (GetValues, SetValue, Validate, etc.)

## 🛠️ Development

```bash
# Install dependencies
yarn install

# Build packages
yarn build

# Run tests
yarn test

# Run tests in watch mode
yarn test-watch

# Lint
yarn lint

# Format code
yarn format
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
- Uses [Lerna](https://lerna.js.org/) for monorepo management
- Inspired by the need for maintainable, scalable form management

## 📞 Support

- 📖 [Documentation](https://form.punicalab.com)
- 💬 [GitHub Discussions](https://github.com/uryansezginteke/punica-form/discussions)
- 🐛 [Issue Tracker](https://github.com/uryansezginteke/punica-form/issues)

---

**⭐ If you find Punica Form useful, please consider giving it a star on GitHub!**

