/**
 * @rushing/rjsf-shadcn
 * React JSON Schema Form theme and widgets for shadcn/ui
 */

// Core theme
export { shadcnTheme, createShadcnRegistry } from './theme';

// Medical widgets
export { MeasurementWidget, VitalSignsWidget, medicalWidgets } from './medical';

// Model config widgets
export { NumberSliderWidget, modelConfigWidgets } from './model-config';

// Utilities
export { cn } from './utils';

// Default export - the complete theme with all widgets
import { shadcnTheme } from './theme';
export default shadcnTheme;