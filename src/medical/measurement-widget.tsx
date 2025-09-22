/**
 * MeasurementWidget - Clinical measurements with unit conversion support
 * Specialized widget for handling clinical measurements with various medical units
 */

import React, { useState, useCallback, useMemo } from 'react';
import type { WidgetProps } from '@rjsf/utils';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '../utils';

// Placeholder components - replace with actual shadcn/ui components in consuming app
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}


interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  children?: React.ReactNode;
}

interface AlertProps {
  variant?: 'default' | 'destructive';
  className?: string;
  children?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ className, ...props }) => (
  <input className={cn('flex h-10 w-full rounded-md border px-3 py-2', className)} {...props} />
);

const Select: React.FC<SelectProps> = ({ value, onValueChange, children, ...props }) => (
  <select
    value={value}
    onChange={(e) => onValueChange?.(e.target.value)}
    className="flex h-10 w-full rounded-md border px-3 py-2"
    {...props}
  >
    {children}
  </select>
);

const SelectItem: React.FC<{ value: string; children?: React.ReactNode }> = ({ value, children }) => (
  <option value={value}>{children}</option>
);

const Badge: React.FC<BadgeProps> = ({ className, children }) => (
  <div className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', className)}>
    {children}
  </div>
);

const Alert: React.FC<AlertProps> = ({ className, children }) => (
  <div className={cn('relative w-full rounded-lg border p-4', className)}>
    {children}
  </div>
);

const AlertDescription: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className, children }) => (
  <div className={cn('text-sm', className)}>{children}</div>
);

interface MeasurementValue {
  value: number | null;
  unit: string;
}

interface MeasurementConfig {
  type: string;
  defaultUnit: string;
  units: Array<{ value: string; label: string; conversion?: number | ((val: number) => number) }>;
  ranges?: {
    normal?: { min: number; max: number };
    critical?: { min: number; max: number };
  };
  precision?: number;
}

// Medical measurement configurations
const MEASUREMENT_CONFIGS: Record<string, MeasurementConfig> = {
  weight: {
    type: 'weight',
    defaultUnit: 'kg',
    units: [
      { value: 'kg', label: 'kg' },
      { value: 'lb', label: 'lbs', conversion: 2.20462 },
      { value: 'g', label: 'g', conversion: 1000 }
    ],
    ranges: {
      normal: { min: 40, max: 200 }, // kg
      critical: { min: 30, max: 300 }
    },
    precision: 1
  },
  height: {
    type: 'height',
    defaultUnit: 'cm',
    units: [
      { value: 'cm', label: 'cm' },
      { value: 'in', label: 'inches', conversion: 0.393701 },
      { value: 'm', label: 'm', conversion: 0.01 }
    ],
    ranges: {
      normal: { min: 140, max: 220 }, // cm
      critical: { min: 100, max: 250 }
    },
    precision: 1
  },
  heart_rate: {
    type: 'heart_rate',
    defaultUnit: 'bpm',
    units: [{ value: 'bpm', label: 'BPM' }],
    ranges: {
      normal: { min: 60, max: 100 },
      critical: { min: 40, max: 200 }
    },
    precision: 0
  },
  temperature: {
    type: 'temperature',
    defaultUnit: 'celsius',
    units: [
      { value: 'celsius', label: '°C' },
      { value: 'fahrenheit', label: '°F', conversion: (c: number) => (c * 9/5) + 32 }
    ],
    ranges: {
      normal: { min: 36.1, max: 37.2 }, // celsius
      critical: { min: 35, max: 42 }
    },
    precision: 1
  },
  blood_glucose: {
    type: 'blood_glucose',
    defaultUnit: 'mg/dL',
    units: [
      { value: 'mg/dL', label: 'mg/dL' },
      { value: 'mmol/L', label: 'mmol/L', conversion: 0.0555 }
    ],
    ranges: {
      normal: { min: 70, max: 140 }, // mg/dL
      critical: { min: 50, max: 400 }
    },
    precision: 0
  }
};

export const MeasurementWidget: React.FC<WidgetProps> = (props) => {
  const {
    id,
    value,
    onChange,
    onBlur,
    onFocus,
    schema,
    uiSchema = {},
    disabled = false,
    readonly = false,
    required = false,
    rawErrors = []
  } = props;

  // Parse measurement type from schema or uiSchema
  const measurementType = (schema as any)['x-measurement-type'] ||
                         uiSchema['ui:measurementType'] ||
                         'weight';
  const config = MEASUREMENT_CONFIGS[measurementType] || MEASUREMENT_CONFIGS.weight;

  // Parse current value
  const parsedValue = useMemo((): MeasurementValue => {
    if (!value) {
      return { value: null, unit: config.defaultUnit };
    }

    if (typeof value === 'object' && value !== null) {
      return {
        value: (value as any).value || null,
        unit: (value as any).unit || config.defaultUnit
      };
    }

    if (typeof value === 'number') {
      return { value, unit: config.defaultUnit };
    }

    return { value: null, unit: config.defaultUnit };
  }, [value, config.defaultUnit]);

  const [currentValue, setCurrentValue] = useState<MeasurementValue>(parsedValue);

  // Validation state
  const validationState = useMemo(() => {
    if (!currentValue.value || !config.ranges) return null;

    const val = currentValue.value;
    const ranges = config.ranges;

    // Convert to base unit for validation if needed
    let baseValue = val;
    const currentUnitConfig = config.units.find(u => u.value === currentValue.unit);
    if (currentUnitConfig?.conversion && typeof currentUnitConfig.conversion === 'number') {
      baseValue = val / currentUnitConfig.conversion;
    }

    if (ranges.critical) {
      if (baseValue < ranges.critical.min || baseValue > ranges.critical.max) {
        return 'critical';
      }
    }

    if (ranges.normal) {
      if (baseValue < ranges.normal.min || baseValue > ranges.normal.max) {
        return 'warning';
      }
    }

    return 'normal';
  }, [currentValue, config]);

  // Convert value between units
  const convertValue = useCallback((val: number, fromUnit: string, toUnit: string): number => {
    if (fromUnit === toUnit) return val;

    const fromUnitConfig = config.units.find(u => u.value === fromUnit);
    const toUnitConfig = config.units.find(u => u.value === toUnit);

    if (!fromUnitConfig || !toUnitConfig) return val;

    // Convert to base unit first
    let baseValue = val;
    if (fromUnitConfig.conversion) {
      if (typeof fromUnitConfig.conversion === 'function') {
        // For complex conversions like temperature
        baseValue = val; // Simplified for now
      } else {
        baseValue = val / fromUnitConfig.conversion;
      }
    }

    // Convert from base unit to target unit
    let targetValue = baseValue;
    if (toUnitConfig.conversion) {
      if (typeof toUnitConfig.conversion === 'function') {
        targetValue = toUnitConfig.conversion(baseValue);
      } else {
        targetValue = baseValue * toUnitConfig.conversion;
      }
    }

    return Number(targetValue.toFixed(config.precision || 1));
  }, [config]);

  // Handle value change
  const handleValueChange = useCallback((newValue: string) => {
    const numValue = parseFloat(newValue);
    const updatedValue: MeasurementValue = {
      value: isNaN(numValue) ? null : numValue,
      unit: currentValue.unit
    };

    setCurrentValue(updatedValue);
    onChange(updatedValue);
  }, [currentValue.unit, onChange]);

  // Handle unit change
  const handleUnitChange = useCallback((newUnit: string) => {
    let convertedValue = currentValue.value;

    if (currentValue.value !== null && !isNaN(currentValue.value)) {
      convertedValue = convertValue(currentValue.value, currentValue.unit, newUnit);
    }

    const updatedValue: MeasurementValue = {
      value: convertedValue,
      unit: newUnit
    };

    setCurrentValue(updatedValue);
    onChange(updatedValue);
  }, [currentValue, convertValue, onChange]);

  const hasError = rawErrors.length > 0;

  return (
    <div className="prognosix-measurement-widget measurement-widget space-y-3">
      {/* Input and Unit Selection */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            id={id}
            type="number"
            value={currentValue.value?.toString() || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={onBlur && (() => onBlur(id, currentValue.value?.toString() || ''))}
            onFocus={() => {
              onFocus && onFocus(id, currentValue.value?.toString() || '');
            }}
            disabled={disabled}
            readOnly={readonly}
            required={required}
            step={config.precision === 0 ? 1 : Math.pow(10, -(config.precision || 1))}
            className={cn(
              hasError && 'border-destructive focus-visible:ring-destructive',
              validationState === 'critical' && 'border-red-500 bg-red-50',
              validationState === 'warning' && 'border-yellow-500 bg-yellow-50',
              validationState === 'normal' && 'border-green-500 bg-green-50'
            )}
            placeholder={`Enter ${config.type}`}
          />
        </div>

        {config.units.length > 1 && (
          <Select value={currentValue.unit} onValueChange={handleUnitChange}>
            {config.units.map((unitOption) => (
              <SelectItem key={unitOption.value} value={unitOption.value}>
                {unitOption.label}
              </SelectItem>
            ))}
          </Select>
        )}
      </div>

      {/* Validation Status */}
      {validationState && !isNaN(currentValue.value || 0) && (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              validationState === 'critical' ? 'destructive' :
              validationState === 'warning' ? 'outline' :
              'secondary'
            }
            className={cn(
              validationState === 'normal' && 'bg-green-100 text-green-800',
              validationState === 'warning' && 'bg-yellow-100 text-yellow-800'
            )}
          >
            {validationState === 'normal' && 'Normal'}
            {validationState === 'warning' && 'Outside Normal Range'}
            {validationState === 'critical' && 'Critical'}
          </Badge>

          {config.ranges?.normal && (
            <span className="text-xs text-muted-foreground">
              Normal: {config.ranges.normal.min}-{config.ranges.normal.max} {config.defaultUnit}
            </span>
          )}
        </div>
      )}

      {/* Validation Messages */}
      {validationState === 'critical' && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Critical value detected. Please verify the measurement.
          </AlertDescription>
        </Alert>
      )}

      {validationState === 'warning' && (
        <Alert className="py-2 border-yellow-200 bg-yellow-50">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-700">
            Value is outside the normal range.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Messages */}
      {hasError && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {rawErrors.map((error: any, index: number) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};