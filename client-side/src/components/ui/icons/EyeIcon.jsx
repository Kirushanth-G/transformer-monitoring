import React from 'react';

const EyeIcon = ({ className = 'w-6 h-6', ...props }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M1.458 12C2.732 7.943 6.477 5 12 5c5.523 0 9.268 2.943 10.542 7-1.274 4.057-5.019 7-10.542 7-5.523 0-9.268-2.943-10.542-7z"
    />
    <circle cx="12" cy="12" r="3" strokeWidth={2} stroke="currentColor" />
  </svg>
);

export default EyeIcon;
