export const MAX_NOTE_LENGTH = 500;

// Strips control characters and collapses whitespace so a note is one plain line.
export function cleanNote(note: string | null | undefined): string {
  // \p{Cc} is the control-character class, so tabs and newlines fold into spaces below.
  return (note ?? '')
    .replace(/\p{Cc}+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NOTE_LENGTH);
}
