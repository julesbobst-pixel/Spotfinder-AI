import React from 'react';

const DuotoneIcon: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    {children}
  </svg>
);

export const DuotoneSunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <DuotoneIcon className={className}>
    <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0112 2.25zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM12 18a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
    <path d="M12 21.75a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5a.75.75 0 01-.75.75zM5.106 17.834a.75.75 0 001.06 1.06l1.06-1.06a.75.75 0 00-1.06-1.06l-1.06 1.06zM21.75 12a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM4.5 12a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75z" opacity="0.5" />
  </DuotoneIcon>
);

export const DuotoneCloudIcon: React.FC<{ className?: string }> = ({ className }) => (
  <DuotoneIcon className={className}>
    <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5z" clipRule="evenodd" />
    <path d="M3 19.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" opacity="0.5" />
  </DuotoneIcon>
);

export const DuotonePartlyCloudyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <DuotoneIcon className={className}>
    <path d="M12.965 3.033a.75.75 0 01.815 1.229 3.75 3.75 0 00-4.06 4.06.75.75 0 01-1.23-.815 5.25 5.25 0 015.475-4.474zM16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    <path d="M12.75 18.75a.75.75 0 01-1.5 0V7.953a7.464 7.464 0 01-1.85-1.04 7.5 7.5 0 1011.35 6.34 3.75 3.75 0 00-4.24-4.24 7.465 7.465 0 01-1.04-1.85H12.75v10.5z" opacity="0.5" />
  </DuotoneIcon>
);

export const DuotoneRainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <DuotoneIcon className={className}>
    <path d="M12 2.25a.75.75 0 01.75.75v16.5a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" />
    <path d="M8.25 4.5a.75.75 0 01.75.75v13.5a.75.75 0 01-1.5 0V5.25a.75.75 0 01.75-.75zM15.75 4.5a.75.75 0 01.75.75v13.5a.75.75 0 01-1.5 0V5.25a.75.75 0 01.75-.75z" opacity="0.5" />
  </DuotoneIcon>
);

export const DuotoneWindIcon: React.FC<{ className?: string }> = ({ className }) => (
  <DuotoneIcon className={className}>
    <path d="M12.965 3.033a.75.75 0 01.815 1.229 3.75 3.75 0 00-4.06 4.06.75.75 0 01-1.23-.815 5.25 5.25 0 015.475-4.474z" />
    <path d="M17.25 10.5a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h13.5a.75.75 0 01.75.75zM14.25 15a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h10.5a.75.75 0 01.75.75zM18.75 19.5a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h15a.75.75 0 01.75.75z" opacity="0.5" />
  </DuotoneIcon>
);

export const DuotoneSnowIcon: React.FC<{ className?: string }> = ({ className }) => (
  <DuotoneIcon className={className}>
    <path d="M12 2.25a.75.75 0 01.75.75v18a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" />
    <path d="M3.53 7.47a.75.75 0 011.06 0l14.999 15a.75.75 0 11-1.06 1.06l-15-15a.75.75 0 010-1.06zM19.53 7.47a.75.75 0 010 1.06l-15 15a.75.75 0 11-1.06-1.06l15-15a.75.75 0 011.06 0z" opacity="0.5" />
  </DuotoneIcon>
);

export const DuotoneFogIcon: React.FC<{ className?: string }> = ({ className }) => (
  <DuotoneIcon className={className}>
    <path d="M3 10.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" />
    <path d="M3 15a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" opacity="0.5" />
  </DuotoneIcon>
);
