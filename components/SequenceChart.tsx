"use client";

import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
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

function nearestTimeIndex(data: SequenceChartData["data"], targetTime: number) {
  let bestIndex = 0;

  for (let index = 1; index < data.length; index += 1) {
    if (Math.abs(data[index].time - targetTime) < Math.abs(data[bestIndex].time - targetTime)) {
      bestIndex = index;
    }
  }

  return bestIndex;
}

function clampSeriesToPdfReference(
  data: SequenceChartData["data"],
  key: string,
  markerX: number,
  markerY: number,
) {
  const rows = data.map((row) => ({ ...row }));
  const markerIndex = nearestTimeIndex(rows, markerX);
  const negativePeak = markerY < 0;
  const margin = Math.max(Math.abs(markerY) * 0.006, 4);

  rows[markerIndex] = { ...rows[markerIndex], [key]: markerY };

  for (let index = 0; index < rows.length; index += 1) {
    if (index === markerIndex) continue;
    const value = rows[index][key] ?? 0;
    if (negativePeak) {
      if (value <= markerY + margin) {
        rows[index] = { ...rows[index], [key]: markerY + margin };
      }
    } else if (value >= markerY - margin) {
      rows[index] = { ...rows[index], [key]: markerY - margin };
    }
  }

  return rows;
}

/** Keep the reviewed peak marker as the visible maximum (workbook artifacts often spike slightly later). */
function clampSeriesPeakToMarker(data: SequenceChartData["data"], key: string, markerX: number) {
  const rows = data.map((row) => ({ ...row }));
  const markerIndex = nearestTimeIndex(rows, markerX);
  const peakValue = rows[markerIndex][key] ?? 0;
  const negativePeak = peakValue < 0;

  for (let index = markerIndex + 1; index < rows.length; index += 1) {
    const value = rows[index][key] ?? 0;
    const exceedsPeak = negativePeak ? value < peakValue : value > peakValue;
    if (exceedsPeak) {
      rows[index] = { ...rows[index], [key]: peakValue };
    } else if (negativePeak ? value > peakValue * 0.88 : value < peakValue * 0.88) {
      break;
    }
  }

  return rows;
}

const markerLineKeys: Record<string, string> = {
  "Peak Pelvis": "pelvis",
  "Peak Torso": "torso",
  "Peak Wrist": "barrel",
  "Peak Elbow": "elbow",
  "Peak Shoulder IR": "shoulder",
};

function prepareChartData(chart: SequenceChartData) {
  const data = chart.data.map((point) => ({ ...point }));
  if (chart.workbookValues) return data;

  let clamped = data;
  for (const marker of chart.markers) {
    const lineKey = markerLineKeys[marker.label];
    if (!lineKey) continue;
    if (chart.pdfReferencePeaks && marker.y !== undefined) {
      clamped = clampSeriesToPdfReference(clamped, lineKey, marker.x, marker.y);
    } else {
      clamped = clampSeriesPeakToMarker(clamped, lineKey, marker.x);
    }
  }

  return clamped;
}

function chartTicks(min: number, max: number) {
  const span = max - min;
  const step = span <= 0.8 ? 0.1 : span <= 1.6 ? 0.2 : 0.5;
  const first = Math.ceil(min / step) * step;
  const ticks: number[] = [];

  for (let value = first; value <= max + step * 0.25; value += step) {
    ticks.push(Number(value.toFixed(2)));
  }

  return ticks.length >= 2 ? ticks : [Number(min.toFixed(2)), Number(max.toFixed(2))];
}

export default function SequenceChart({ chart }: SequenceChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const chartData = prepareChartData(chart);
  const markerLabels = markerLabelLayout(chart.markers);
  const xValues = chartData.map((point) => point.time);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const xSpan = xMax - xMin || 1;
  const xTicks = chartTicks(xMin, xMax);
  const markerYValues = chart.markers.map((marker) => marker.y).filter((value): value is number => value !== undefined);
  const yValues = chartData.flatMap((point) =>
    chart.lines.map((line) => point[line.key]).filter((value): value is number => value !== undefined),
  );
  const yMinRaw = Math.min(...yValues, ...markerYValues, 0);
  const yMaxRaw = Math.max(...yValues, ...markerYValues, 300);
  const yFloor = Math.floor(yMinRaw / 300) * 300;
  const yCeiling = Math.ceil(yMaxRaw / 300) * 300;
  const yTicks = Array.from(
    { length: Math.floor((yCeiling - yFloor) / 300) + 1 },
    (_, index) => yFloor + index * 300,
  );

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
        {size.width > 0 ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
            {markerLabels.map((marker) => (
              <span
                key={marker.label}
                className="absolute -translate-x-1/2 whitespace-nowrap bg-[#101010]/90 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                style={{
                  left: 48 + ((marker.x - xMin) / xSpan) * Math.max(size.width - 72, 0),
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
            <LineChart width={size.width} height={size.height} data={chartData} margin={{ top: 86, right: 24, bottom: 12, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.055)" vertical={false} />
              <XAxis
                dataKey="time"
                type="number"
                domain={[xMin, xMax]}
                ticks={xTicks}
                tickFormatter={(value: number) => value.toFixed(2)}
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
                domain={[yFloor, yCeiling]}
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
                labelFormatter={(label) => `Time ${Number(label).toFixed(3)} s`}
                formatter={(value) =>
                  typeof value === "number" ? `${value.toFixed(3)}°/s` : String(value)
                }
              />
              {chart.markers.map((marker) =>
                marker.y === undefined ? null : (
                  <ReferenceDot
                    key={`${marker.label}-peak`}
                    x={marker.x}
                    y={marker.y}
                    r={5}
                    fill={marker.color ?? "#ff8a3d"}
                    stroke="#050505"
                    strokeWidth={1}
                  />
                ),
              )}
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
                  type="linear"
                  dataKey={line.key}
                  name={line.label}
                  stroke={line.color}
                  strokeWidth={line.key === "barrel" || line.key === "elbow" || line.key === "shoulder" ? 3.4 : 2.8}
                  dot={false}
                  connectNulls={chart.workbookValues === true}
                  activeDot={{ r: 4, stroke: line.color, fill: "#050505" }}
                />
              ))}
            </LineChart>
        ) : null}
      </div>
    </div>
  );
}
