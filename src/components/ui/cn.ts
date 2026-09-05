/** Minimal class-name joiner — avoids pulling a dependency for one helper. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
