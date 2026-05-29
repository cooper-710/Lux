"use client";

import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SequenceChartData } from "@/data/reportData";

type SequenceChartProps = {
  chart: SequenceChartData;
};

function markerLabelLayout(markers: SequenceChartData["markers"]) {
  const lastXByLevel: number[] = [];

  return markers.map((marker) => {
    const level = lastXByLevel.findIndex((lastX) => Math.abs(marker.x - lastX) > 0.06);
    const labelLevel = level >= 0 ? level : lastXByLevel.length;
    lastXByLevel[labelLevel] = marker.x;

    return { ...marker, level: Math.min(labelLevel, 3) };
  });
}

export default function SequenceChart({ chart }: SequenceChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const markerLabels = markerLabelLayout(chart.markers);
  const yMax = Math.max(
    300,
    ...chart.data.flatMap((point) => chart.lines.map((line) => Math.abs(point[line.key] ?? 0))),
  );
  const yCeiling = Math.ceil(yMax / 300) * 300;
  const yTicks = Array.from({ length: Math.floor(yCeiling / 300) + 1 }, (_, index) => index * 300);

  useEffect(() => {
    if (!chartRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry.contentRect.width);
      const height = Math.floor(entry.contentRect.height);
      if (width > 0 && height > 0) {
        setSize({ width, height });
      }
    });

    observer.observe(chartRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="report-panel print-break-avoid p-5 md:p-7">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Sequence Chart</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">{chart.title}</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          {chart.lines.map((line) => (
            <div key={line.key} className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-zinc-400">
              <span className="h-px w-7" style={{ backgroundColor: line.color }} />
              {line.label}
            </div>
          ))}
        </div>
      </div>

      <div ref={chartRef} className="relative h-[380px] min-h-[380px] w-full min-w-0 md:h-[470px] md:min-h-[470px]">
        <span className="pointer-events-none absolute left-0 top-[76px] z-10 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
          deg/s
        </span>
        {size.width > 0 ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
            {markerLabels.map((marker) => (
              <span
                key={marker.label}
                className="absolute -translate-x-1/2 whitespace-nowrap bg-[#101010]/90 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                style={{
                  left: 48 + marker.x * Math.max(size.width - 72, 0),
                  top: 6 + marker.level * 22,
                  color: marker.color ?? "#a1a1aa",
                }}
              >
                {marker.label}
              </span>
            ))}
          </div>
        ) : null}
        {size.width > 0 && size.height > 0 ? (
            <LineChart width={size.width} height={size.height} data={chart.data} margin={{ top: 86, right: 24, bottom: 12, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.055)" vertical={false} />
              <XAxis
                dataKey="time"
                type="number"
                domain={[0, 1]}
                ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                tickFormatter={(value: number) => value.toFixed(1)}
                stroke="rgba(255,255,255,0.26)"
                tick={{ fill: "#71717a", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                tickLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.26)"
                tick={{ fill: "#71717a", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                domain={[0, yCeiling]}
                ticks={yTicks}
                width={48}
              />
              <Tooltip
                cursor={{ stroke: "rgba(255,138,61,0.28)", strokeWidth: 1 }}
                contentStyle={{
                  background: "#101010",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 0,
                  color: "#fff",
                }}
                labelFormatter={(label) => `Time ${Number(label).toFixed(2)}`}
              />
              {chart.markers.map((marker) => (
                <ReferenceLine
                  key={marker.label}
                  x={marker.x}
                  stroke={marker.color ?? "rgba(255,138,61,0.36)"}
                  strokeDasharray="3 5"
                />
              ))}
              {chart.lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.label}
                  stroke={line.color}
                  strokeWidth={line.key === "barrel" || line.key === "shoulder" ? 3.4 : 2.8}
                  dot={false}
                  activeDot={{ r: 4, stroke: line.color, fill: "#050505" }}
                />
              ))}
            </LineChart>
        ) : null}
      </div>
    </div>
  );
}
