"use client";

import Image from "next/image";
import type { NavItem } from "@/data/reportData";
import { cn } from "@/lib/utils";

type HeaderProps = {
  navItems: NavItem[];
  activeSection: string;
  onNavigate: (id: string) => void;
};

export default function Header({ navItems, activeSection, onNavigate }: HeaderProps) {
  return (
    <header className="print-hidden sticky top-0 z-50 border-b border-white/10 bg-[#050505]/88 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 w-full max-w-report items-center justify-between gap-5 px-5 py-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <button
          type="button"
          onClick={() => onNavigate("overview")}
          className="flex shrink-0 items-center gap-3 text-left"
          aria-label="Go to report overview"
        >
          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-white/15 bg-black">
            <Image
              src="/sequence-logo.png"
              alt=""
              width={48}
              height={48}
              priority
              className="h-full w-full object-cover"
            />
          </span>
          <span>
            <span className="block text-sm font-medium tracking-wide text-white">Sequence BioLab</span>
            <span className="block text-[10px] uppercase tracking-[0.28em] text-zinc-500">Biomechanics Assessment</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.025] p-1 md:flex">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] transition-colors",
                  isActive ? "bg-white/[0.06] text-white" : "text-zinc-500 hover:text-zinc-200",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute inset-x-4 -bottom-1 h-px bg-sequence-orange transition-opacity",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
