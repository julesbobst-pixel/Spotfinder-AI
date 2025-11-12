import React from 'react';

const DuotoneIcon: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    {children}
  </svg>
);

export const DuotoneParkingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <DuotoneIcon className={className}>
    <path fillRule="evenodd" d="M9.75 3.75a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.053a6.75 6.75 0 00-5.83 6.192.75.75 0 01-1.49-.153 8.25 8.25 0 016.7-7.589.75.75 0 01.87.248z" clipRule="evenodd" />
    <path d="M11.25 3.75a.75.75 0 01.75.75v15.75a.75.75 0 01-1.5 0V4.5a.75.75 0 01.75-.75z" opacity="0.5" />
  </DuotoneIcon>
);

export const DuotoneTrainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <DuotoneIcon className={className}>
    <path d="M5.25 3.75a.75.75 0 01.75-.75h12a.75.75 0 01.75.75v12a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75V3.75z" />
    <path d="M3 18.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM9 20.25a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5H9.75a.75.75 0 01-.75-.75z" opacity="0.5" />
  </DuotoneIcon>
);