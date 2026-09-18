import * as React from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="relative flex flex-col gap-4 border-b border-[#cfd8d6] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-600 shadow-[0_0_0_4px_rgba(184,138,59,0.11)]" />
          Holiday Light Pro
        </div>
        <h1 className="text-2xl font-extrabold tracking-[-0.025em] text-[#0b1f33] sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pb-0.5">{actions}</div> : null}
      <span aria-hidden="true" className="absolute -bottom-px left-0 h-px w-20 bg-amber-600" />
    </header>
  );
}
