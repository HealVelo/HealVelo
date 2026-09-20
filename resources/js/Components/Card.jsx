import React from 'react';

export default function Card({
  title,
  subtitle,
  children,
  className = '',
  headerAction = null,
}) {
  return (
    <div
      className={`border border-slate-200 bg-white shadow-xs rounded-sm overflow-hidden ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

export { Card };