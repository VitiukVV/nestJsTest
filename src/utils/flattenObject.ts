export type Primitive = string | number | boolean | null | undefined;

export type FlatObject = Record<string, Primitive | Primitive[]>;

export function flattenObject<T extends object>(
  obj: T,
  prefix = '',
  result: FlatObject = {},
): FlatObject {
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;

    const path = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value as Record<string, unknown>, path, result);
    } else {
      result[path] = value as Primitive | Primitive[];
    }
  }

  return result;
}
