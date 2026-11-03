import type { Screen } from '@funnel/schema';
import { blockId } from './block-id';
import { checkboxProps, datePickerProps, ratingProps, textInputProps } from './element-schemas';
export { defaultPickerPlan, pickerPlanKeys } from './element-schemas';

function valueOf(values: Record<string, string>, screenId: string, id: string): string {
  return (values[`${screenId}:${id}`] ?? '').trim();
}

export function screenGate(screen: Screen, values: Record<string, string>): string | null {
  for (const [index, item] of screen.content.content.entries()) {
    const id = blockId(item, index);
    if (item.type === 'TextInput') {
      const p = textInputProps.safeParse(item.props);
      if (!p.success) continue;
      const v = valueOf(values, screen.id, id);
      if (p.data.required && v === '') return `Please fill in "${p.data.label || 'the field'}".`;
      if (v !== '' && p.data.inputType === 'number') {
        const n = Number(v);
        if (!Number.isFinite(n)) return `"${p.data.label || 'The field'}" must be a number.`;
        if (p.data.min !== undefined && n < p.data.min) {
          return `"${p.data.label || 'The value'}" must be at least ${p.data.min}.`;
        }
        if (p.data.max !== undefined && n > p.data.max) {
          return `"${p.data.label || 'The value'}" must be at most ${p.data.max}.`;
        }
      }
      if (v !== '' && p.data.inputType === 'tel' && !/^[+()\d\s-]{6,20}$/.test(v)) {
        return 'Enter a valid phone number.';
      }
    } else if (item.type === 'DatePicker') {
      const p = datePickerProps.safeParse(item.props);
      if (p.success && p.data.required && valueOf(values, screen.id, id) === '') {
        return `Please pick "${p.data.label || 'a date'}".`;
      }
    } else if (item.type === 'Checkbox') {
      const p = checkboxProps.safeParse(item.props);
      if (p.success && p.data.required && valueOf(values, screen.id, id) !== '1') {
        return 'Please tick the box to continue.';
      }
    } else if (item.type === 'Rating') {
      const p = ratingProps.safeParse(item.props);
      if (p.success && p.data.required && valueOf(values, screen.id, id) === '') {
        return 'Please choose a rating.';
      }
    }
  }
  return null;
}
