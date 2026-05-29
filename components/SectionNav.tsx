import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionCard = {
  id: string;
  number: string;
  title: string;
  detail?: string;
};

type SectionNavProps = {
  cards: SectionCard[];
  onNavigate: (id: string) => void;
  compact?: boolean;
  prominent?: boolean;
};

export default function SectionNav({ cards, onNavigate, compact = false, prominent = false }: SectionNavProps) {
  return (
    <div className={cn("grid gap-4", compact ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3", prominent && "gap-5 lg:gap-6")}>
      {cards.map((card, index) => {
        const ArrowIcon = index === 0 && compact ? ArrowLeft : ArrowRight;

        return (
          <button
            key={`${card.id}-${card.number}`}
            type="button"
            onClick={() => onNavigate(card.id)}
            className={cn(
              "group rounded-surface border border-white/10 bg-white/[0.025] text-left transition-all",
              "hover:border-sequence-orange/45 hover:bg-white/[0.04]",
              card.detail ? "p-6" : prominent ? "min-h-[7.5rem] p-6 md:min-h-[8.5rem] md:p-8 lg:min-h-[9.5rem] lg:px-10" : "p-5 md:p-6",
            )}
          >
            {card.detail ? (
              <>
                <div className="mb-8 flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-sequence-orange">{card.number}</span>
                  <ArrowIcon className="h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-sequence-orange" />
                </div>
                <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white">{card.title}</h3>
                <p className="mt-4 text-sm leading-6 text-zinc-500">{card.detail}</p>
              </>
            ) : (
              <div className={cn("flex items-center justify-between", prominent ? "gap-6" : "gap-4")}>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "font-semibold uppercase tracking-[0.22em] text-sequence-orange",
                      prominent ? "text-xs md:text-sm" : "text-[10px]",
                    )}
                  >
                    {card.number}
                  </p>
                  <h3
                    className={cn(
                      "mt-2 font-semibold leading-snug tracking-[-0.02em] text-white",
                      prominent ? "mt-3 text-xl md:text-2xl lg:text-[1.75rem]" : "text-lg md:text-xl",
                    )}
                  >
                    {card.title}
                  </h3>
                </div>
                <span
                  className={cn(
                    "grid shrink-0 place-items-center rounded-surface border border-white/10 bg-black/20 transition-colors group-hover:border-sequence-orange/40 group-hover:bg-sequence-orange/10",
                    prominent ? "h-12 w-12 md:h-14 md:w-14" : "h-10 w-10",
                  )}
                >
                  <ArrowIcon
                    className={cn(
                      "text-zinc-500 transition-colors group-hover:text-sequence-orange",
                      prominent ? "h-5 w-5 md:h-6 md:w-6" : "h-4 w-4",
                    )}
                  />
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
