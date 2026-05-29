import type { SummaryItem } from "@/data/reportData";
import { statusClasses, statusDotClasses } from "@/lib/utils";

type SummaryCardProps = {
  item: SummaryItem;
};

export default function SummaryCard({ item }: SummaryCardProps) {
  return (
    <article className="border-t border-white/10 pt-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">{item.title}</h3>
        <span className={`inline-flex items-center gap-2 border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusClasses(item.status)}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusDotClasses(item.status)}`} />
          {item.status}
        </span>
      </div>
      <p className="text-3xl font-semibold tracking-[-0.02em] text-white">{item.main}</p>
      <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">{item.supporting}</p>
    </article>
  );
}
