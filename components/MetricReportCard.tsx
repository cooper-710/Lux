import type { MetricReport } from "@/data/reportData";
import { cn, statusClasses } from "@/lib/utils";

type MetricReportCardProps = {
  metric: MetricReport;
};

function Sparkline({ data, status }: { data: number[]; status: MetricReport["status"] }) {
  if (data.length < 2) {
    return (
      <svg className="mt-8 h-12 w-full overflow-visible" viewBox="0 0 100 48" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" x2="100" y1="42" y2="42" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <line x1="0" x2="100" y1="24" y2="24" stroke="rgba(255,255,255,0.24)" strokeDasharray="4 5" strokeWidth="1.5" />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 42 - ((value - min) / range) * 34;
      return `${x},${y}`;
    })
    .join(" ");

  const stroke =
    status === "Needs Attention" ? "#ff8a3d" : status === "Monitor" || status === "Needs Review" ? "#f59e0b" : "#e4e4e7";

  return (
    <svg className="mt-8 h-12 w-full overflow-visible" viewBox="0 0 100 48" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" x2="100" y1="42" y2="42" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ExplanationRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="grid gap-2 border-t border-white/10 py-5 md:grid-cols-[180px_1fr]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="text-base leading-7 text-zinc-300">{text}</p>
    </div>
  );
}

export default function MetricReportCard({ metric }: MetricReportCardProps) {
  return (
    <article className="report-panel print-break-avoid grid gap-8 p-6 md:grid-cols-[340px_1fr] md:p-8">
      <div className="border-b border-white/10 pb-7 md:border-b-0 md:border-r md:pb-0 md:pr-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sequence-orange">{metric.eyebrow}</p>
        <h3 className="mt-4 max-w-xs text-2xl font-semibold leading-tight tracking-[-0.02em] text-white">{metric.name}</h3>
        <p className="mt-8 text-6xl font-semibold tracking-[-0.05em] text-white">{metric.value}</p>
        <Sparkline data={metric.sparkline} status={metric.status} />
      </div>

      <div>
        <div className="mb-3 flex justify-end">
          <span
            className={cn(
              "inline-flex border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]",
              statusClasses(metric.status),
            )}
          >
            {metric.status}
          </span>
        </div>
        <ExplanationRow label="Finding" text={metric.finding} />
        <ExplanationRow label="Why It Matters" text={metric.whyItMatters} />
        <ExplanationRow label="Training Focus" text={metric.trainingFocus} />
      </div>
    </article>
  );
}
