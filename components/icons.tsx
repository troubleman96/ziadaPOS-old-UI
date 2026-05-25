'use client';

import React from 'react';

interface IconProps {
  d: React.ReactNode;
  size?: number;
  stroke?: number;
  fill?: string;
}

export function Icon({ d, size = 16, stroke = 1.5, fill = 'none' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {d}
      </g>
    </svg>
  );
}

export const Icons = {
  dashboard: (
    <Icon d={<>
      <rect x="2" y="2" width="5" height="5.5" rx="1" />
      <rect x="9" y="2" width="5" height="3.5" rx="1" />
      <rect x="2" y="9.5" width="5" height="4.5" rx="1" />
      <rect x="9" y="7.5" width="5" height="6.5" rx="1" />
    </>} />
  ),
  pos: (
    <Icon d={<>
      <rect x="2" y="3" width="12" height="9" rx="1.5" />
      <path d="M2 6h12" />
      <path d="M5 14h6" />
      <path d="M8 12v2" />
    </>} />
  ),
  txn: (
    <Icon d={<>
      <path d="M3 5h9" /><path d="M10 3l2 2-2 2" />
      <path d="M13 11H4" /><path d="M6 9l-2 2 2 2" />
    </>} />
  ),
  inventory: (
    <Icon d={<>
      <path d="M2 4.5l6-2.5 6 2.5v7L8 14l-6-2.5z" />
      <path d="M2 4.5L8 7l6-2.5" />
      <path d="M8 7v7" />
    </>} />
  ),
  credit: (
    <Icon d={<>
      <rect x="1.5" y="4" width="13" height="8" rx="1.5" />
      <path d="M1.5 7h13" />
      <path d="M4 10h2.5" />
    </>} />
  ),
  analytics: (
    <Icon d={<>
      <path d="M2 13h12" />
      <path d="M4 10v2" /><path d="M7 7v5" /><path d="M10 9v3" /><path d="M13 5v7" />
    </>} />
  ),
  reports: (
    <Icon d={<>
      <path d="M4 1.5h5l3 3v9.5a.5.5 0 0 1-.5.5h-7.5a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5z" />
      <path d="M9 1.5v3h3" />
      <path d="M5.5 8h5" /><path d="M5.5 10.5h5" /><path d="M5.5 12.5h3" />
    </>} />
  ),
  customers: (
    <Icon d={<>
      <circle cx="6" cy="6" r="2.5" />
      <path d="M2 13c.5-2 2-3 4-3s3.5 1 4 3" />
      <path d="M11 6a2 2 0 0 0 0-4" />
      <path d="M14 12c-.3-1.4-1.3-2.2-2.5-2.6" />
    </>} />
  ),
  suppliers: (
    <Icon d={<>
      <path d="M1.5 6h7v6h-7z" />
      <path d="M8.5 8h4l2 2v2h-6z" />
      <circle cx="4" cy="13" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="13" r="1.2" fill="currentColor" stroke="none" />
    </>} />
  ),
  ai: (
    <Icon d={<>
      <path d="M8 1.5l1.4 3.6 3.6 1.4-3.6 1.4L8 11.5 6.6 7.9 3 6.5 6.6 5.1z" />
      <path d="M12.5 11.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" />
    </>} />
  ),
  settings: (
    <Icon d={<>
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.5v1.7M8 12.8v1.7M14.5 8h-1.7M3.2 8H1.5M12.6 3.4l-1.2 1.2M4.6 11.4l-1.2 1.2M12.6 12.6l-1.2-1.2M4.6 4.6L3.4 3.4" />
    </>} />
  ),
  help: (
    <Icon d={<>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M6 6.2a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.5" />
      <circle cx="8" cy="11.6" r="0.6" fill="currentColor" stroke="none" />
    </>} />
  ),
  search: (
    <Icon d={<>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </>} />
  ),
  bell: (
    <Icon d={<>
      <path d="M3.5 12V8a4.5 4.5 0 0 1 9 0v4" />
      <path d="M2.5 12h11" />
      <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" />
    </>} />
  ),
  plus: <Icon d={<><path d="M8 3v10M3 8h10" /></>} />,
  chevDown: <Icon d={<><path d="M4 6l4 4 4-4" /></>} />,
  chevRight: <Icon d={<><path d="M6 4l4 4-4 4" /></>} />,
  arrowUpRight: <Icon d={<><path d="M5 11L11 5" /><path d="M6 5h5v5" /></>} />,
  arrowDownRight: <Icon d={<><path d="M5 5l6 6" /><path d="M11 6v5h-5" /></>} />,
  sparkles: (
    <Icon d={<>
      <path d="M5 1.5l.8 2 2 .8-2 .8L5 7l-.8-2-2-.8 2-.8z" />
      <path d="M11 7l1.1 2.6L14.7 11l-2.6 1.1L11 14.7l-1.1-2.6L7.3 11l2.6-1.4z" />
    </>} />
  ),
  store: (
    <Icon d={<>
      <path d="M2 6l1-3h10l1 3" />
      <path d="M2 6v7h12V6" />
      <path d="M2 6c0 1.4 1 2.5 2 2.5S6 7.4 6 6c0 1.4 1 2.5 2 2.5S10 7.4 10 6c0 1.4 1 2.5 2 2.5S14 7.4 14 6" />
    </>} />
  ),
  filter: <Icon d={<><path d="M2 4h12" /><path d="M4 8h8" /><path d="M6 12h4" /></>} />,
  download: <Icon d={<><path d="M8 2v8" /><path d="M5 7l3 3 3-3" /><path d="M2.5 13.5h11" /></>} />,
  command: (
    <Icon d={<>
      <path d="M5.5 2a1.5 1.5 0 0 1 1.5 1.5V7H5.5a1.5 1.5 0 1 1 0-3z" />
      <path d="M10.5 2a1.5 1.5 0 1 1 0 3H9V3.5A1.5 1.5 0 0 1 10.5 2z" />
      <path d="M14 5.5A1.5 1.5 0 0 1 12.5 7H9V5.5h3.5z" transform="translate(-2 0)" />
      <rect x="6" y="6" width="4" height="4" />
    </>} />
  ),
  close: <Icon d={<><path d="M3 3l10 10M13 3L3 13" /></>} />,
  check: <Icon d={<><path d="M2.5 8l4 4 7-8" /></>} />,
  edit: (
    <Icon d={<>
      <path d="M11 2.5l2.5 2.5-8 8H3v-2.5z" />
      <path d="M9.5 4l2.5 2.5" />
    </>} />
  ),
  trash: (
    <Icon d={<>
      <path d="M3 4.5h10" />
      <path d="M5.5 4.5V3a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v1.5" />
      <path d="M4.5 4.5l.8 9h5.4l.8-9" />
    </>} />
  ),
  grid: (
    <Icon d={<>
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </>} />
  ),
  list: (
    <Icon d={<>
      <path d="M6 4h8" /><path d="M6 8h8" /><path d="M6 12h8" />
      <circle cx="3" cy="4" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="3" cy="8" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="3" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </>} />
  ),
  warning: (
    <Icon d={<>
      <path d="M8 2l6.5 12h-13z" />
      <path d="M8 6.5v3.5" />
      <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none" />
    </>} />
  ),
  receipt: (
    <Icon d={<>
      <path d="M3 1.5v13l1.5-1 1.5 1 1.5-1 1.5 1 1.5-1 1.5 1 1.5-1V1.5z" />
      <path d="M5.5 6h5" /><path d="M5.5 8.5h5" /><path d="M5.5 11h3" />
    </>} />
  ),
  package: (
    <Icon d={<>
      <path d="M2 4.5l6-2.5 6 2.5v7L8 14l-6-2.5z" />
      <path d="M2 4.5L8 7l6-2.5" />
      <path d="M8 7v7" />
      <path d="M5 5.8l6-2.5" />
    </>} />
  ),
};

export type IconName = keyof typeof Icons;
