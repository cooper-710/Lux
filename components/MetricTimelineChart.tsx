import type { MetricTimelineGraph } from "@/data/reportData";

type MetricTimelineChartProps = {
  graph?: MetricTimelineGraph;
};

const WIDTH = 560;
const HEIGHT = 250;
const PLOT = {
  left: 54,
  right: 18,
  top: 18,
  bottom: 34,
};

function formatTick(value: number) {
  if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)}k`;
  return `${Math.round(value)}`;
}

function xScale(time: number) {
  const plotWidth = WIDTH - PLOT.left - PLOT.right;
  return PLOT.left + (Math.min(3, Math.max(0, time)) / 3) * plotWidth;
}

function yScale(value: number, yMin: number, yMax: number) {
  const plotHeight = HEIGHT - PLOT.top - PLOT.bottom;
  const ratio = (value - yMin) / (yMax - yMin || 1);
  return HEIGHT - PLOT.bottom - ratio * plotHeight;
}

function linePath(points: MetricTimelineGraph["data"], yMin: number, yMax: number) {
  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command}${xScale(point.time).toFixed(2)},${yScale(point.value, yMin, yMax).toFixed(2)}`;
    })
    .join(" ");
}

export default function MetricTimelineChart({ graph }: MetricTimelineChartProps) {
  if (!graph || graph.status !== "Ready" || graph.data.length === 0) {
    return (
      <div className="rounded-surface border border-white/10 bg-white/[0.025] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Section Graph</p>
        <p className="mt-4 text-sm text-zinc-500">Data Pending</p>
      </div>
    );
  }

  const values = graph.data.map((point) => point.value);
  const minValue = Math.min(...values, graph.marker.value);
  const maxValue = Math.max(...values, graph.marker.value);
  const range = maxValue - minValue || 1;
  const yMin = minValue - range * 0.14;
  const yMax = maxValue + range * 0.14;
  const yTicks = [yMin, yMin + (yMax - yMin) / 2, yMax];
  const xTicks = [0, 0.75, 1.5, 2.25, 3];
  const markerX = xScale(graph.marker.time);
  const markerY = yScale(graph.marker.value, yMin, yMax);

  return (
    <div className="rounded-surface border border-white/10 bg-[#090909] p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Section Graph</p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-white">{graph.title}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">PDF Marker</p>
          <p className="mt-2 text-sm font-semibold text-sequence-orange">
            {graph.marker.label} · {graph.marker.time.toFixed(3)}s
          </p>
        </div>
      </div>

      <svg className="block h-auto w-full overflow-visible" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${graph.title} section graph`}>
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#050505" />

        {yTicks.map((tick) => {
          const y = yScale(tick, yMin, yMax);
          return (
            <g key={`y-${tick}`}>
              <line x1={PLOT.left} x2={WIDTH - PLOT.right} y1={y} y2={y} stroke="rgba(255,255,255,0.07)" />
              <text x={PLOT.left - 10} y={y + 4} textAnchor="end" fill="#71717a" fontSize="11">
                {formatTick(tick)}
              </text>
            </g>
          );
        })}

        {xTicks.map((tick) => {
          const x = xScale(tick);
          return (
            <g key={`x-${tick}`}>
              <line x1={x} x2={x} y1={PLOT.top} y2={HEIGHT - PLOT.bottom} stroke="rgba(255,255,255,0.035)" />
              <text x={x} y={HEIGHT - 10} textAnchor="middle" fill="#71717a" fontSize="11">
                {tick === 0 || tick === 3 ? tick.toFixed(0) : tick.toFixed(2)}
              </text>
            </g>
          );
        })}

        <line x1={PLOT.left} x2={WIDTH - PLOT.right} y1={HEIGHT - PLOT.bottom} y2={HEIGHT - PLOT.bottom} stroke="rgba(255,255,255,0.15)" />
        <line x1={PLOT.left} x2={PLOT.left} y1={PLOT.top} y2={HEIGHT - PLOT.bottom} stroke="rgba(255,255,255,0.1)" />

        <line x1={markerX} x2={markerX} y1={PLOT.top} y2={HEIGHT - PLOT.bottom} stroke="#ff8a3d" strokeDasharray="4 6" opacity="0.85" />
        <line x1={PLOT.left} x2={WIDTH - PLOT.right} y1={markerY} y2={markerY} stroke="#ff8a3d" strokeDasharray="2 7" opacity="0.28" />

        <path d={linePath(graph.data, yMin, yMax)} fill="none" stroke="#f4f4f5" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={markerX} cy={markerY} r="4.5" fill="#050505" stroke="#ff8a3d" strokeWidth="2" />

        <text x={WIDTH - PLOT.right} y={PLOT.top + 10} textAnchor="end" fill="#52525b" fontSize="10" fontWeight="700" letterSpacing="2">
          {graph.unit}
        </text>
      </svg>
    </div>
  );
}
