type IconProps = { size?: number; strokeWidth?: number; className?: string };

const base = (size: number, strokeWidth: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
  "aria-hidden": true,
});

export const ClockIcon = ({ size = 14, strokeWidth = 2.25, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
  </svg>
);

export const PeopleIcon = ({ size = 14, strokeWidth = 2.25, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0113 0" />
    <path d="M16 4.5a3.5 3.5 0 010 7" />
    <path d="M17.5 13.5a6 6 0 014 6.5" />
  </svg>
);

export const PlusIcon = ({ size = 18, strokeWidth = 2.5, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const CheckIcon = ({ size = 18, strokeWidth = 3, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <polyline points="4 12.5 9.5 18 20 6.5" />
  </svg>
);

export const CloseIcon = ({ size = 18, strokeWidth = 2.5, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const SearchIcon = ({ size = 18, strokeWidth = 2.25, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <circle cx="11" cy="11" r="7" />
    <line x1="20" y1="20" x2="16.5" y2="16.5" />
  </svg>
);

export const BasketIcon = ({ size = 18, strokeWidth = 2.25, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M3 10h18l-1.6 9.2a2 2 0 01-2 1.8H6.6a2 2 0 01-2-1.8L3 10z" />
    <path d="M8 10l3-6M16 10l-3-6" />
    <line x1="9.5" y1="14" x2="9.5" y2="17" />
    <line x1="14.5" y1="14" x2="14.5" y2="17" />
  </svg>
);

export const CameraIcon = ({ size = 18, strokeWidth = 2.25, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M4 8h3l2-3h6l2 3h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
    <circle cx="12" cy="13.5" r="3.5" />
  </svg>
);

export const LinkIcon = ({ size = 16, strokeWidth = 2.25, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
  </svg>
);

export const TrashIcon = ({ size = 16, strokeWidth = 2.25, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

export const SparkIcon = ({ size = 18, strokeWidth = 2.25, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
  </svg>
);

export const PotIcon = ({ size = 40, strokeWidth = 2, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M4 10h16v6a4 4 0 01-4 4H8a4 4 0 01-4-4v-6z" />
    <path d="M2 10h20" />
    <path d="M9 6c0-1.5 1-1.5 1-3M14 6c0-1.5 1-1.5 1-3" />
  </svg>
);

export const BackIcon = ({ size = 18, strokeWidth = 2.5, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="11 6 5 12 11 18" />
  </svg>
);
