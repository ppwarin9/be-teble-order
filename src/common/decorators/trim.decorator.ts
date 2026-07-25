import { Transform } from 'class-transformer';

/**
 * Trims leading/trailing whitespace from an incoming string field before
 * validation runs. Non-string values (undefined, null, numbers, ...) pass
 * through untouched so it is safe on optional fields.
 */
export const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
