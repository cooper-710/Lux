/**
 * Freeze throwing chart + KPI graph data from the PDF-aligned processor output.
 * The site reads data/throwingPdfGraphs.json — not the live xlsx workbook.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "data/processed/gavinThrowing.json");
const outputPath = path.join(root, "data/throwingPdfGraphs.json");

const THROWING_SEQUENCE_TIME_START_SECONDS = 1.55;
const THROWING_SEQUENCE_TIME_END_SECONDS = 2.5;

function isInSequenceTimeWindow(time) {
  return time >= THROWING_SEQUENCE_TIME_START_SECONDS && time <= THROWING_SEQUENCE_TIME_END_SECONDS;
}

const THROWING_SEQUENCE_KPI_GRAPH_IDS = {
  pelvis: "pelvis-rotation-angular-velocity",
  torso: "torso-rotation-angular-velocity",
  elbow: "elbow-extension-velocity",
  shoulder: "shoulder-internal-rotation-angular-velocity",
};

function graphById(reportGraphs, id) {
  return reportGraphs.find((graph) => graph.id === id);
}

function valueAtTime(points, time) {
  return points.find((point) => Math.abs(point.time - time) < 0.00005)?.value;
}

function buildThrowingSequenceChartData(reportGraphs) {
  const series = Object.fromEntries(
    Object.entries(THROWING_SEQUENCE_KPI_GRAPH_IDS).map(([key, id]) => [
      key,
      graphById(reportGraphs, id)?.data ?? [],
    ]),
  );

  const timeSet = new Set();
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
      const row = { time: Number(time.toFixed(3)) };

      for (const [key, points] of Object.entries(series)) {
        const value = valueAtTime(points, time);
        if (value !== undefined) {
          row[key] = Math.abs(value);
        }
      }

      return row;
    });
}

function buildThrowingSequenceChart(reportGraphs, baseChart) {
  const markerSpecs = [
    { label: "Peak Torso", graphId: THROWING_SEQUENCE_KPI_GRAPH_IDS.torso },
    { label: "Peak Pelvis", graphId: THROWING_SEQUENCE_KPI_GRAPH_IDS.pelvis },
    { label: "Peak Elbow", graphId: THROWING_SEQUENCE_KPI_GRAPH_IDS.elbow },
    { label: "Peak Shoulder IR", graphId: THROWING_SEQUENCE_KPI_GRAPH_IDS.shoulder },
  ];

  const markers = markerSpecs
    .map(({ label, graphId }) => {
      const graph = graphById(reportGraphs, graphId);
      if (!graph) return null;

      if (!isInSequenceTimeWindow(graph.marker.time)) return null;

      const lineKey = Object.entries(THROWING_SEQUENCE_KPI_GRAPH_IDS).find(([, id]) => id === graphId)?.[0];
      const color = baseChart.lines.find((line) => line.key === lineKey)?.color;

      return {
        label,
        x: graph.marker.time,
        y: Math.abs(graph.marker.value),
        color: color ?? "#a1a1aa",
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.x - b.x);

  return {
    ...baseChart,
    title: "Angular Velocity · Throwing Sequence",
    data: buildThrowingSequenceChartData(reportGraphs),
    markers,
    workbookValues: true,
  };
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Missing ${sourcePath}. Run: npm run process:throwing`);
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const output = {
  generatedAt: new Date().toISOString(),
  sourceNote:
    "PDF reference curves exported from process-throwing-mocap.mjs. Sequence chart reuses the four KPI velocity graphs exactly. Regenerate with npm run process:throwing && npm run export:throwing-graphs.",
  chart: buildThrowingSequenceChart(source.reportGraphs, source.chart),
  peaks: source.peaks,
  reportGraphs: source.reportGraphs,
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
console.log(`  chart points: ${output.chart.data.length}`);
console.log(`  report graphs: ${output.reportGraphs.length}`);
