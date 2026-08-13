import { MARK_OUTLINE, MARK_DETAILS, MARK_VIEWBOX } from './markPaths';

/**
 * The longhorn skull. Bare mark — never inside a tile, chip or rounded box.
 * `detail` draws the bone suture hairlines; drop them below ~40px where they
 * would only muddy the silhouette.
 */
export function Mark({
  size = 40,
  color = 'var(--tan)',
  detail,
  className,
  title,
}: {
  size?: number;
  color?: string;
  detail?: boolean;
  className?: string;
  title?: string;
}) {
  const showDetail = detail ?? size >= 44;
  return (
    <svg
      className={className}
      viewBox={MARK_VIEWBOX}
      width={size}
      height={(size * 55) / 100}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d={MARK_OUTLINE} fill={color} fillRule="evenodd" />
      {showDetail && (
        <g
          stroke="#000"
          strokeOpacity={0.34}
          strokeWidth={0.42}
          fill="none"
          strokeLinecap="round"
        >
          {MARK_DETAILS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      )}
    </svg>
  );
}

/** The tapered rules that flank the year on the business card. */
export function TaperRule({
  width = 90,
  flip = false,
  color = 'var(--tan)',
  opacity = 1,
}: {
  width?: number;
  flip?: boolean;
  color?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 8"
      width={width}
      height={(width * 8) / 100}
      aria-hidden="true"
      focusable="false"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      preserveAspectRatio="none"
    >
      <path d="M0 2.6 L100 4.4 L0 5.4 Z" fill={color} opacity={opacity} />
    </svg>
  );
}
