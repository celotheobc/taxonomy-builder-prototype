export default function CutRelationshipIcon({
  size = 18,
  className,
  title = 'Remove relationship',
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="6.5" cy="6.5" r="2.75" stroke="currentColor" strokeWidth="2.25" />
      <circle cx="6.5" cy="17.5" r="2.75" stroke="currentColor" strokeWidth="2.25" />
      <path
        d="M9 9l10.5 10.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M9 15l10.5-10.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
