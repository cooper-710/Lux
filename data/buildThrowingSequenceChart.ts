import type { ChartPoint, MetricTimelineGraph, SequenceChartData } from "@/data/reportData";

/** Sequence chart window (KPI graphs below still show full signed capture). */
export const THROWING_SEQUENCE_TIME_START_SECONDS = 1.55;
export const THROWING_SEQUENCE_TIME_END_SECONDS = 2.5;

function isInSequenceTimeWindow(time: number) {
  return time >= THROWING_SEQUENCE_TIME_START_SECONDS && time <= THROWING_SEQUENCE_TIME_END_SECONDS;
}

/** KPI section ids for the four angular-velocity graphs in the throwing report. */
export const THROWING_SEQUENCE_KPI_GRAPH_IDS = {
  pelvis: "pelvis-rotation-angular-velocity",
  torso: "torso-rotation-angular-velocity",
  elbow: "elbow-extension-velocity",
  shoulder: "shoulder-internal-rotation-angular-velocity",
} as const;

function graphById(reportGraphs: MetricTimelineGraph[], id: string) {
  return reportGraphs.find((graph) => graph.id === id);
}

function valueAtTime(points: MetricTimelineGraph["data"], time: number) {
  return points.find((point) => Math.abs(point.time - time) < 0.00005)?.value;
}

/** Overlay the four KPI velocity curves using each graph's exact time/value pairs. */
export function buildThrowingSequenceChartData(reportGraphs: MetricTimelineGraph[]): ChartPoint[] {
  const series = Object.fromEntries(
    Object.entries(THROWING_SEQUENCE_KPI_GRAPH_IDS).map(([key, id]) => [
      key,
      graphById(reportGraphs, id)?.data ?? [],
    ]),
  ) as Record<keyof typeof THROWING_SEQUENCE_KPI_GRAPH_IDS, MetricTimelineGraph["data"]>;

  const timeSet = new Set<number>();
  for (const points of Object.values(series)) {
    for (const point of points) {
      if (isInSequenceTimeWindow(point.time)) {
        timeSet.add(point.time);
      }
    }
  }

  return Array.from(timeSet)
    .sort((a, b) => a - b)
    .map((time) => {
      const row: ChartPoint = { time: Number(time.toFixed(3)) };

      for (const key of Object.keys(series) as Array<keyof typeof THROWING_SEQUENCE_KPI_GRAPH_IDS>) {
        const value = valueAtTime(series[key], time);
        if (value !== undefined) {
          row[key] = Math.abs(value);
        }
      }

      return row;
    });
}

export function buildThrowingSequenceChart(
  reportGraphs: MetricTimelineGraph[],
  baseChart: SequenceChartData,
): SequenceChartData {
  const markers = [
    {
      label: "Peak Torso",
      graphId: THROWING_SEQUENCE_KPI_GRAPH_IDS.torso,
      lineKey: "torso",
      color: baseChart.lines.find((line) => line.key === "torso")?.color,
    },
    {
      label: "Peak Pelvis",
      graphId: THROWING_SEQUENCE_KPI_GRAPH_IDS.pelvis,
      lineKey: "pelvis",
      color: baseChart.lines.find((line) => line.key === "pelvis")?.color,
    },
    {
      label: "Peak Elbow",
      graphId: THROWING_SEQUENCE_KPI_GRAPH_IDS.elbow,
      lineKey: "elbow",
      color: baseChart.lines.find((line) => line.key === "elbow")?.color,
    },
    {
      label: "Peak Shoulder IR",
      graphId: THROWING_SEQUENCE_KPI_GRAPH_IDS.shoulder,
      lineKey: "shoulder",
      color: baseChart.lines.find((line) => line.key === "shoulder")?.color,
    },
  ]
    .map(({ label, graphId, lineKey, color }) => {
      const graph = graphById(reportGraphs, graphId);
      if (!graph) return null;

      if (!isInSequenceTimeWindow(graph.marker.time)) return null;

      return {
        label,
        x: graph.marker.time,
        y: Math.abs(graph.marker.value),
        color: color ?? "#a1a1aa",
        lineKey,
      };
    })
    .filter((marker): marker is NonNullable<typeof marker> => marker !== null)
    .sort((a, b) => a.x - b.x);

  return {
    ...baseChart,
    data: buildThrowingSequenceChartData(reportGraphs),
    markers: markers.map(({ label, x, y, color }) => ({ label, x, y, color })),
    workbookValues: true,
    pdfReferencePeaks: false,
  };
}
