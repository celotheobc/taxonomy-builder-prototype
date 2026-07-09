/** Canonical Context Model iconography — use everywhere for objects, events, and relationships. */

export const CM_ICON_COLORS = {
  object: {
    stroke: '#5eb0ff',
    fill: '#1b6fd1',
    bg: '#eff6ff',
  },
  event: {
    stroke: '#2db87a',
    fill: '#2db87a',
    bg: '#ecfdf5',
  },
  relationship: {
    stroke: '#059669',
    fill: '#059669',
    bg: '#ecfdf5',
  },
  perspective: {
    top: '#7096FF',
    left: '#4D7BFF',
    right: '#2C59E0',
    symbol: '#ffffff',
  },
};

function svgProps({ size = 20, className, title, viewBox = '0 0 20 20' }) {
  return {
    width: size,
    height: size,
    viewBox,
    className,
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': title ? undefined : true,
    role: title ? 'img' : undefined,
  };
}

/** Object type — square outline with accent block top-left. */
export function ObjectTypeIcon({ size = 20, className, title, monochrome = false }) {
  const stroke = monochrome ? 'currentColor' : CM_ICON_COLORS.object.stroke;
  const fill = monochrome ? 'currentColor' : CM_ICON_COLORS.object.fill;
  return (
    <svg {...svgProps({ size, className, title })}>
      {title ? <title>{title}</title> : null}
      <rect x="3" y="3" width="14" height="14" rx="1.5" stroke={stroke} strokeWidth="1.5" />
      <rect
        x="4.5"
        y="4.5"
        width="5.5"
        height="5.5"
        rx="0.75"
        fill={fill}
        opacity={monochrome ? 0.95 : 1}
      />
    </svg>
  );
}

/** Event source — linked nodes with vertical stem. */
export function EventSourceIcon({ size = 20, className, title, monochrome = false }) {
  const stroke = monochrome ? 'currentColor' : CM_ICON_COLORS.event.stroke;
  return (
    <svg {...svgProps({ size, className, title })}>
      {title ? <title>{title}</title> : null}
      <circle cx="6" cy="10" r="2.25" stroke={stroke} strokeWidth="1.5" />
      <circle cx="14" cy="10" r="2.25" stroke={stroke} strokeWidth="1.5" />
      <path d="M8.25 10h3.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 6.5v7" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Relationship — cube with circular flow arrows. */
export function RelationshipIcon({ size = 20, className, title }) {
  const { stroke } = CM_ICON_COLORS.relationship;
  return (
    <svg {...svgProps({ size, className, title })}>
      {title ? <title>{title}</title> : null}
      <path
        d="M10 5.5 13.5 7.5v4L10 13.5 6.5 11.5v-4L10 5.5z"
        stroke={stroke}
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M10 5.5v8M6.5 7.5 10 9.5 13.5 7.5" stroke={stroke} strokeWidth="1.35" strokeLinejoin="round" />
      <path
        d="M4.5 10a5.5 5.5 0 0 1 9.2-4"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M15.5 10a5.5 5.5 0 0 1-9.2 4"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="M13.2 4.8 14.8 6.2 13.4 7.8M6.8 15.2 5.2 13.8 6.6 12.2" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Process — three-node flow (unchanged semantic). */
export function ProcessFlowIcon({ size = 20, className, title }) {
  return (
    <svg {...svgProps({ size, className, title })}>
      {title ? <title>{title}</title> : null}
      <circle cx="5" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="5.5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="14.5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.1 9.1 11.8 6.6M7.1 10.9l4.7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Flat hierarchy icon for tabs and compact UI. */
export function PerspectiveHierarchyIcon({ size = 20, className, title }) {
  return (
    <svg {...svgProps({ size, className, title, viewBox: '0 0 24 24' })}>
      {title ? <title>{title}</title> : null}
      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 7v2.5M6 9.5h12M6 9.5V12.5M18 9.5V12.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="3.5" y="12.5" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.75" />
      <rect x="15.5" y="12.5" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function ContextModelIcon({ kind, size = 20, className, title, monochrome = false }) {
  switch (kind) {
    case 'event':
    case 'eventSource':
    case 'events':
      return (
        <EventSourceIcon size={size} className={className} title={title} monochrome={monochrome} />
      );
    case 'relationship':
    case 'relationships':
      return <RelationshipIcon size={size} className={className} title={title} />;
    case 'process':
      return <ProcessFlowIcon size={size} className={className} title={title} />;
    case 'perspective':
      return <PerspectiveHierarchyIcon size={size} className={className} title={title} />;
    case 'object':
    case 'objects':
    default:
      return (
        <ObjectTypeIcon size={size} className={className} title={title} monochrome={monochrome} />
      );
  }
}
