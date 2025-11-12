import React from 'react';

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor"
};

export const LandscapeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
);

export const ArchitectureIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
);

export const PortraitIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
);

export const StreetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 21L9 3h6l5 18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.5m0 4v2.5m0 4v2.5" />
    </svg>
);

export const LongExposureIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v.01M6.38 6.38l.01-.01M3 12h.01M6.38 17.62l.01.01M12 21v-.01M17.62 17.62l-.01.01M21 12h-.01M17.62 6.38l-.01-.01M12 6a6 6 0 100 12 6 6 0 000-12z" /></svg>
);

export const MacroIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" /></svg>
);

export const LostPlaceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...iconProps} className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
);

export const WildlifeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.015-4.5-4.5-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 8.25c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
    </svg>
);

export const AstroIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...iconProps} className={className} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.418a.562.562 0 01.321.988l-4.204 3.06a.563.563 0 00-.182.658l1.413 5.348a.562.562 0 01-.812.622l-4.48-3.26a.563.563 0 00-.658 0l-4.48 3.26a.562.562 0 01-.812-.622l1.413-5.348a.563.563 0 00-.182-.658L2.474 9.91a.562.562 0 01.321-.988h5.418a.563.563 0 00.475-.31L11.48 3.5z" />
    </svg>
);