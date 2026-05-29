"use client";

import type { ReactNode } from "react";

type ReportSectionProps = {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
};

export default function ReportSection({
  id,
  eyebrow,
  title,
  subtitle,
  badge,
  children,
}: ReportSectionProps) {
  return (
    <section id={id} className="py-16 md:py-24">
      <div
        data-section-anchor
        className="mb-10 flex flex-col gap-6 border-t border-white/10 pt-10 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="max-w-5xl">
          {eyebrow ? (
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-sequence-orange">{eyebrow}</p>
          ) : null}
          <h2 className="text-5xl font-semibold tracking-[-0.03em] text-white md:text-7xl">{title}</h2>
          {subtitle ? (
            <p className="mt-5 max-w-4xl text-lg leading-8 text-zinc-400 md:text-xl">{subtitle}</p>
          ) : null}
        </div>
        {badge ? (
          <span className="w-fit rounded-sm border border-sky-400/25 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}
