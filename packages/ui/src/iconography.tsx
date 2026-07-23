import type { SVGAttributes } from 'react';

export type NexoIconName =
  | 'home'
  | 'receipt'
  | 'cash-register'
  | 'package'
  | 'warehouse'
  | 'users'
  | 'user-cog'
  | 'chart'
  | 'settings'
  | 'life-buoy'
  | 'search'
  | 'menu'
  | 'close'
  | 'log-out'
  | 'chevron-down'
  | 'check'
  | 'upload'
  | 'image'
  | 'inbox'
  | 'coffee'
  | 'utensils'
  | 'briefcase'
  | 'archive';

const paths: Record<NexoIconName, readonly string[]> = {
  home: ['M3 11.5 12 4l9 7.5', 'M5.5 10v10h13V10', 'M9.5 20v-6h5v6'],
  receipt: ['M6 3h12v18l-3-2-3 2-3-2-3 2V3Z', 'M9 8h6', 'M9 12h6', 'M9 16h3'],
  'cash-register': ['M5 10h14v10H5z', 'M8 10V6h8v4', 'M7 14h4', 'M15 14h2', 'M8 17h8'],
  package: ['m4 7 8-4 8 4-8 4-8-4Z', 'M4 7v10l8 4 8-4V7', 'M12 11v10'],
  warehouse: ['M3 10 12 4l9 6v10H3V10Z', 'M7 13h3v3H7z', 'M14 13h3v3h-3z', 'M7 20v-2h10v2'],
  users: [
    'M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20',
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    'M17 4.2a4 4 0 0 1 0 7.6',
    'M22 20v-1.5a4 4 0 0 0-3-3.9',
  ],
  'user-cog': [
    'M12 20H4v-1.5a4 4 0 0 1 4-4h3',
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    'M17 14v2',
    'M17 20v2',
    'M13.5 16l1.7 1',
    'M18.8 19l1.7 1',
    'M13.5 20l1.7-1',
    'M18.8 17l1.7-1',
  ],
  chart: ['M4 20V10', 'M10 20V4', 'M16 20v-7', 'M22 20H2'],
  settings: [
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
    'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21h-4v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z',
  ],
  'life-buoy': [
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'm5.6 5.6 4.3 4.3',
    'm14.1 14.1 4.3 4.3',
    'm18.4 5.6-4.3 4.3',
    'm9.9 14.1-4.3 4.3',
  ],
  search: ['m21 21-4.4-4.4', 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['m6 6 12 12', 'M18 6 6 18'],
  'log-out': ['M10 17l5-5-5-5', 'M15 12H3', 'M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5'],
  'chevron-down': ['m6 9 6 6 6-6'],
  check: ['m5 12 4 4L19 6'],
  upload: ['M12 16V4', 'm7 9 5-5 5 5', 'M5 20h14'],
  image: ['M4 4h16v16H4z', 'm4 16 5-5 4 4 2-2 5 5', 'M15.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z'],
  inbox: ['M4 5h16l2 10v4H2v-4L4 5Z', 'M2 15h5l2 2h6l2-2h5'],
  coffee: [
    'M5 8h12v7a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z',
    'M17 10h1a3 3 0 0 1 0 6h-2',
    'M8 4v2',
    'M12 3v3',
  ],
  utensils: ['M7 3v8', 'M4 3v5a3 3 0 0 0 6 0V3', 'M7 11v10', 'M16 3v18', 'M16 3c3 2 4 5 4 8h-4'],
  briefcase: ['M4 7h16v12H4z', 'M9 7V5h6v2', 'M4 12h16', 'M10 12v2h4v-2'],
  archive: ['M4 7h16v13H4z', 'M3 4h18v3H3z', 'M9 11h6'],
};

export interface NexoIconProps extends SVGAttributes<SVGSVGElement> {
  name: NexoIconName;
  label?: string;
  decorative?: boolean;
}

export function NexoIcon({
  name,
  label,
  decorative = !label,
  className = '',
  ...props
}: NexoIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`nexo-icon ${className}`}
      aria-hidden={decorative ? true : undefined}
      aria-label={!decorative ? label : undefined}
      role={!decorative ? 'img' : undefined}
      focusable="false"
      {...props}
    >
      {paths[name].map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}
