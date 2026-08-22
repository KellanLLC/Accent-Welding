/** US-first E.164. Null when the input cannot be a real number. */
export function normalisePhone(input: unknown): string | null {
  const digits = String(input ?? '').replace(/\D+/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return null;
}

export function prettyPhone(e164: unknown) {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(String(e164 || ''));
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : String(e164 || '');
}

export function firstName(name: unknown) {
  return String(name || '').trim().split(/\s+/)[0] || 'there';
}
