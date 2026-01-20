/**
 * Utility for conditionally joining class names
 * Similar to clsx/classnames but minimal implementation
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs
    .filter((input): input is string => typeof input === 'string' && input.length > 0)
    .join(' ')
}
