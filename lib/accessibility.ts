/**
 * Accessibility Utilities
 * Provides ARIA labels and accessibility helpers
 */

/**
 * Generate ARIA label for form fields
 */
export function getFieldAriaLabel(label: string, required?: boolean): string {
  return required ? `${label} (required)` : label
}

/**
 * Generate ARIA describedby for error messages
 */
export function getFieldAriaDescribedBy(fieldId: string, hasError: boolean): string | undefined {
  return hasError ? `${fieldId}-error` : undefined
}

/**
 * Generate ARIA invalid state
 */
export function getFieldAriaInvalid(hasError: boolean): boolean | undefined {
  return hasError ? true : undefined
}

/**
 * Generate ARIA live region for form errors
 */
export function getFormAriaLiveRegion(errors: Record<string, string>): 'polite' | 'assertive' | 'off' {
  return Object.keys(errors).length > 0 ? 'assertive' : 'off'
}

/**
 * Keyboard navigation helpers
 */
export const KeyboardKeys = {
  Enter: 'Enter',
  Escape: 'Escape',
  Tab: 'Tab',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
  Space: ' ',
} as const

/**
 * Handle keyboard events for accessibility
 */
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  handlers: {
    onEnter?: () => void
    onEscape?: () => void
    onArrowUp?: () => void
    onArrowDown?: () => void
    onHome?: () => void
    onEnd?: () => void
  }
) {
  switch (event.key) {
    case KeyboardKeys.Enter:
      handlers.onEnter?.()
      break
    case KeyboardKeys.Escape:
      handlers.onEscape?.()
      break
    case KeyboardKeys.ArrowUp:
      handlers.onArrowUp?.()
      break
    case KeyboardKeys.ArrowDown:
      handlers.onArrowDown?.()
      break
    case KeyboardKeys.Home:
      handlers.onHome?.()
      break
    case KeyboardKeys.End:
      handlers.onEnd?.()
      break
  }
}

/**
 * Generate unique ID for form fields
 */
export function generateFieldId(prefix: string, fieldName: string): string {
  return `${prefix}-${fieldName}`
}

/**
 * Generate error message ID for form fields
 */
export function generateErrorId(fieldId: string): string {
  return `${fieldId}-error`
}

/**
 * Generate help text ID for form fields
 */
export function generateHelpId(fieldId: string): string {
  return `${fieldId}-help`
}

/**
 * Common ARIA roles
 */
export const AriaRoles = {
  button: 'button',
  link: 'link',
  navigation: 'navigation',
  main: 'main',
  complementary: 'complementary',
  banner: 'banner',
  contentinfo: 'contentinfo',
  form: 'form',
  dialog: 'dialog',
  alert: 'alert',
  status: 'status',
  progressbar: 'progressbar',
} as const

/**
 * Common ARIA states
 */
export interface AriaStates {
  expanded?: boolean
  selected?: boolean
  checked?: boolean
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  invalid?: boolean
  busy?: boolean
}

/**
 * Generate ARIA attributes object
 */
export function generateAriaAttributes(states: AriaStates): Record<string, string | boolean | undefined> {
  const attrs: Record<string, string | boolean | undefined> = {}

  if (states.expanded !== undefined) attrs['aria-expanded'] = states.expanded
  if (states.selected !== undefined) attrs['aria-selected'] = states.selected
  if (states.checked !== undefined) attrs['aria-checked'] = states.checked
  if (states.disabled !== undefined) attrs['aria-disabled'] = states.disabled
  if (states.readonly !== undefined) attrs['aria-readonly'] = states.readonly
  if (states.required !== undefined) attrs['aria-required'] = states.required
  if (states.invalid !== undefined) attrs['aria-invalid'] = states.invalid
  if (states.busy !== undefined) attrs['aria-busy'] = states.busy

  return attrs
}

