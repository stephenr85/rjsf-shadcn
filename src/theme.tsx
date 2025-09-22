/**
 * React JSON Schema Form Theme for shadcn/ui
 * Core theme implementation for RJSF forms
 */

import React from 'react';
import type { WidgetProps, FieldProps } from '@rjsf/utils';
import { getDefaultRegistry } from '@rjsf/core';
import { cn } from './utils';

// Simplified placeholder components for now
const Input: React.FC<any> = ({ className, ...props }) => (
  <input className={cn('flex h-10 w-full rounded-md border px-3 py-2', className)} {...props} />
);

const Label: React.FC<any> = ({ className, children, ...props }) => (
  <label className={cn('text-sm font-medium leading-none', className)} {...props}>
    {children}
  </label>
);

const Button: React.FC<any> = ({ variant = 'default', size = 'default', className, children, ...props }) => (
  <button className={cn('inline-flex items-center justify-center rounded-md text-sm font-medium', className)} {...props}>
    {children}
  </button>
);

// Basic field template
const FieldTemplate = (props: FieldProps) => {
  const {
    id,
    classNames = '',
    style = {},
    label,
    help,
    required,
    description,
    errors,
    children,
    displayLabel = true,
    hidden = false,
  } = props;

  if (hidden) {
    return <div className="hidden">{children}</div>;
  }

  const hasError = errors && errors.length > 0;

  return (
    <div
      className={cn('form-field space-y-2', hasError && 'has-error', classNames)}
      style={style}
    >
      {displayLabel && label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      {description && (
        <div className="text-sm text-muted-foreground">{description}</div>
      )}

      <div className="form-control">
        {children}
      </div>

      {help && (
        <div className="text-xs text-muted-foreground">{help}</div>
      )}

      {hasError && (
        <div className="text-xs text-destructive">
          {errors.map((error: any, index: number) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// Basic text widget
const TextWidget = (props: WidgetProps) => {
  const {
    id,
    placeholder = '',
    required = false,
    disabled = false,
    readonly = false,
    value = '',
    onChange,
    rawErrors = [],
  } = props;

  const hasError = rawErrors.length > 0;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <Input
      id={id}
      type="text"
      value={value || ''}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      readOnly={readonly}
      onChange={handleChange}
      className={cn(hasError && 'border-destructive')}
    />
  );
};

// Submit button
const SubmitButton = (props: any) => (
  <Button type="submit" {...props}>
    {props.children || 'Submit'}
  </Button>
);

// Create the theme object
export const shadcnTheme = {
  templates: {
    FieldTemplate,
    ButtonTemplates: {
      SubmitButton,
    },
  },
  widgets: {
    TextWidget,
  },
};

// Registry helper
export const createShadcnRegistry = () => {
  const defaultRegistry = getDefaultRegistry();

  return {
    ...defaultRegistry,
    templates: {
      ...defaultRegistry.templates,
      ...shadcnTheme.templates,
    },
    widgets: {
      ...defaultRegistry.widgets,
      ...shadcnTheme.widgets,
    },
  };
};