import ms, { type StringValue } from 'ms';

/**
 * Parses a time duration string to milliseconds using the `ms` library.
 * Throws an error if the format is invalid.
 *
 * @param expiresIn - Time duration string (e.g., '15m', '30d', '2h')
 * @returns Duration in milliseconds
 * @throws Error if the format is invalid
 */
export function parseToMs(expiresIn: string): number {
  const result = ms(expiresIn as StringValue);
  if (typeof result === 'undefined') {
    throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  }
  return result;
}
