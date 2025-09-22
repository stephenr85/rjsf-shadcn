/**
 * Medical Widgets Package
 * Specialized form widgets for healthcare and medical applications
 */

export { MeasurementWidget } from './measurement-widget';

// Placeholder for vital signs - to be implemented
export const VitalSignsWidget = () => null;

// Widget registry for easy import
import { MeasurementWidget } from './measurement-widget';

export const medicalWidgets = {
  MeasurementWidget,
  VitalSignsWidget,
};

// Default export
export default medicalWidgets;