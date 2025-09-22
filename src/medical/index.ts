/**
 * Medical Widgets Package
 * Specialized form widgets for healthcare and medical applications
 */

// For now, just export placeholder functions
export const MeasurementWidget = () => null;
export const VitalSignsWidget = () => null;

// Widget registry for easy import
export const medicalWidgets = {
  MeasurementWidget: MeasurementWidget,
  VitalSignsWidget: VitalSignsWidget,
};

// Default export
export default medicalWidgets;