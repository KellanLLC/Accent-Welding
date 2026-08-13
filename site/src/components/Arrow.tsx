/**
 * The house arrow: a diagonal, pointing up and out, with a rounded cap and a
 * head drawn as an open corner rather than a filled triangle. Matches the
 * stroke weight of the drawing language. Used everywhere an arrow is needed,
 * so the glyph belongs to the brand rather than to a component kit.
 */
export function Arrow({ size = 13 }: { size?: number }) {
  return (
    <svg
      className="arrow"
      width={size}
      height={size}
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 11 L11 2" />
      <path d="M4.6 2 H11 V8.4" />
    </svg>
  );
}
