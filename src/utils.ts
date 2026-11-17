/** Klassennamen zusammensetzen, falsy-Werte werden ignoriert. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

let idCounter = 0;
/** Fallback-ID für Formularelemente, falls React.useId nicht genutzt werden kann. */
export function nextId(prefix = "cui"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}
