# @rushing/rjsf-shadcn

React JSON Schema Form theme and widgets for shadcn/ui

## Installation

```bash
npm install @rushing/rjsf-shadcn
```

## Usage

```tsx
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { shadcnTheme } from '@rushing/rjsf-shadcn';

function MyForm() {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string', title: 'Name' },
    }
  };

  return (
    <Form
      schema={schema}
      validator={validator}
      {...shadcnTheme}
    />
  );
}
```

## Features

- 🎨 shadcn/ui Integration
- 🔧 TypeScript Support
- 🏥 Medical Widgets
- 🤖 AI/ML Model Config Widgets

## License

MIT
