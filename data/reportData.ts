import type { StatusTone } from "@/lib/utils";
import hittingMocapJson from "@/data/processed/hitting-mocap.json";
import throwingMocapJson from "@/data/processed/gavinThrowing.json";
import throwingPdfGraphsJson from "@/data/throwingPdfGraphs.json";
import { buildThrowingSequenceChart } from "@/data/buildThrowingSequenceChart";
import { hittingPdfReport } from "@/data/hittingPdfReport";
import { movementPdfReport } from "@/data/movementPdfReport";
import { throwingPdfReport } from "@/data/throwingPdfReport";

export type Status = StatusTone;

export type NavItem = {
  id: string;
  label: string;
};

export type SummaryItem = {
  title: string;
  status: Status;
  main: string;
  supporting: string;
};

export type Priority = {
  number: string;
  title: string;
  detail: string;
};

export type Finding = {
  number: string;
  title: string;
  body: string;
};

export type SequenceStep = {
  number: string;
  label: string;
  status?: Status;
};

export type ChartLine = {
  key: string;
  label: string;
  color: string;
};

export type EventMarker = {
  label: string;
  x: number;
  /** Reference peak value (deg/s) when matching a PDF report marker. */
  y?: number;
  color?: string;
};

export type ChartPoint = {
  time: number;
  [key: string]: number;
};

export type SequenceChartData = {
  title: string;
  lines: ChartLine[];
  markers: EventMarker[];
  data: ChartPoint[];
  /** When true, plot workbook values as-is (no client-side peak flattening). */
  workbookValues?: boolean;
  /** When true, clamp smoothed series to PDF reference peak times/values. */
  pdfReferencePeaks?: boolean;
};

export type PeakPoint = {
  label: string;
  value: string;
};

export type MetricTimelineGraph = {
  id: string;
  title: string;
  status: "Ready" | "Data Pending";
  unit: string;
  sourceColumn: string | null;
  marker: {
    time: number;
    value: number;
    label: string;
  };
  data: Array<{
    time: number;
    value: number;
  }>;
};

export type MetricReport = {
  eyebrow: string;
  name: string;
  value: string;
  status: Status;
  sparkline: number[];
  finding: string;
  whyItMatters: string;
  trainingFocus: string;
};

type ProcessedMocap = {
  source: {
    workbook: string;
    sheet: string;
    framesProcessed: number;
  };
  quality: {
    reviewMetricCount: number;
    eventMarkers?: {
      status: string;
      note: string;
    };
  };
  chart: SequenceChartData;
  peaks: PeakPoint[];
  metrics: MetricReport[];
  reportGraphs?: MetricTimelineGraph[];
};

export type MovementTile = {
  title: string;
  status: Status;
  detail: string;
  notes?: string[];
};

export type ScreeningResult = "Pass" | "Fail" | "Needs Review";

export type MovementScreenRow = {
  group: "Spine / Trunk" | "Hip" | "Shoulder" | "Lower Body";
  test: string;
  right?: ScreeningResult | "N/A";
  left?: ScreeningResult | "N/A";
  note?: string;
};

const gaussian = (x: number, peakX: number, amplitude: number, width: number) =>
  Math.round(amplitude * Math.exp(-Math.pow((x - peakX) / width, 2)));

const makeChartData = (
  specs: Array<{ key: string; peakX: number; amplitude: number; width: number }>,
) =>
  Array.from({ length: 21 }, (_, index) => {
    const time = Number((index / 20).toFixed(2));
    return specs.reduce<ChartPoint>(
      (point, spec) => {
        point[spec.key] = gaussian(time, spec.peakX, spec.amplitude, spec.width);
        return point;
      },
      { time },
    );
  });

const hittingMocap = hittingMocapJson as ProcessedMocap;
const throwingMocap = throwingMocapJson as ProcessedMocap;
const throwingPdfGraphs = throwingPdfGraphsJson as Pick<ProcessedMocap, "chart" | "peaks" | "reportGraphs">;
const hittingSourceLine = `Source: ${hittingMocap.source.workbook} · ${hittingMocap.source.sheet} · ${hittingMocap.source.framesProcessed} frames processed`;
const throwingSourceLine = `Source: ${throwingMocap.source.workbook} · ${throwingMocap.source.sheet} · ${throwingMocap.source.framesProcessed} frames processed`;

function sequenceFromPeakMarkers(
  markers: EventMarker[],
  labelMap: Record<string, string>,
): SequenceStep[] {
  return [...markers]
    .sort((a, b) => a.x - b.x)
    .map((marker, index) => ({
      number: String(index + 1).padStart(2, "0"),
      label: labelMap[marker.label] ?? marker.label.replace(/^Peak\s+/, ""),
      status: "Needs Review" as const,
    }));
}

const hittingAthleteSequence = sequenceFromPeakMarkers(hittingMocap.chart.markers, {
  "Peak Pelvis": "Pelvis Rotation",
  "Peak Torso": "Torso Rotation",
  "Peak Elbow": "Dominant Elbow Flexion Extension",
});

const throwingAthleteSequence = sequenceFromPeakMarkers(throwingMocap.chart.markers, {
  "Peak Torso": "Shoulder Twist",
  "Peak Pelvis": "Pelvis Rotation",
  "Peak Elbow": "Elbow Extension",
  "Peak Shoulder IR": "Shoulder Internal Rotation",
});

export const reportMeta = {
  athlete: "Gavin Lux",
  label: "Integrated Biomechanics Assessment · May 22, 2026",
  title: "Integrated Biomechanics Assessment",
  subtitle: "Movement Assessment · Hitting Motion Capture · Throwing Motion Capture",
  organization: "Sequence BioLab",
  reportType: "Performance Report",
};

export const navItems: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "movement", label: "01 Movement" },
  { id: "hitting", label: "02 Hitting" },
  { id: "throwing", label: "03 Throwing" },
];

export const overviewSummary: SummaryItem[] = [
  {
    title: "Movement Readiness",
    status: "Needs Review",
    main: "Screen Entered",
    supporting: "Right hip, trunk rotation, posterior-chain, and shoulder horizontal abduction flags noted.",
  },
  {
    title: "Hitting Sequence",
    status: "Needs Review",
    main: "Workbook Loaded",
    supporting: `${hittingMocap.source.framesProcessed} mocap frames parsed from ${hittingMocap.source.sheet}.`,
  },
  {
    title: "Throwing Sequence",
    status: "Needs Review",
    main: "PDF Graphs Loaded",
    supporting: "Sequence and KPI charts use reviewed PDF reference curves and peak markers.",
  },
];

export const keyPriorities: Priority[] = [
  {
    number: "01",
    title: "Lead hip internal rotation at contact",
    detail: "Improve front-side posting in the swing.",
  },
  {
    number: "02",
    title: "Lateral torso tilt at release",
    detail: "Control trunk stack during throw deceleration.",
  },
  {
    number: "03",
    title: "Lead-leg block: knee flexion at foot plant",
    detail: "Develop a stiffer landing for force transfer.",
  },
];

export const sectionCards = [
  {
    id: "movement",
    number: "01",
    title: "Movement Assessment",
  },
  {
    id: "hitting",
    number: "02",
    title: "Hitting Motion Capture",
  },
  {
    id: "throwing",
    number: "03",
    title: "Throwing Motion Capture",
  },
];

export const movementSection = {
  badge: "Movement Screen Entered",
  title: "Movement Assessment",
  subtitle:
    "Functional screen, mobility, stability, and assessment reasoning for hitting and throwing interpretation.",
  source: "Source: Staff whiteboard notes · Manual entry",
  reasoningSource: movementPdfReport.source,
  report: movementPdfReport,
  summary:
    "Gavin's screen shows the clearest flags through right hip rotation, bilateral straight-leg raise, toe touch, bilateral shoulder horizontal abduction, right trunk rotation, and a flat T-spine presentation. Shoulder flexion and shoulder internal rotation screen clear bilaterally, while adduction is clear on both sides. These findings should be used as context for the hitting and throwing mocap interpretation rather than treated as standalone conclusions.",
  tiles: [
    {
      title: "Mobility",
      status: "Needs Review",
      detail: "Hip · posterior chain · toe touch",
      notes: ["Right hip IR/ER flagged", "Straight-leg raise failed bilaterally", "Toe touch failed"],
    },
    {
      title: "Stability",
      status: "Monitor",
      detail: "Adduction · single-leg follow-up",
      notes: ["Adduction passed bilaterally", "Single-leg control not provided", "Add follow-up if more staff notes are available"],
    },
    {
      title: "Rotation",
      status: "Needs Review",
      detail: "Trunk rotation · T-spine",
      notes: ["Right trunk rotation failed", "Left trunk rotation passed", "T-spine noted as flat"],
    },
    {
      title: "Shoulder",
      status: "Monitor",
      detail: "Horizontal abduction · flexion · IR",
      notes: ["Horizontal abduction failed bilaterally", "Shoulder flexion passed bilaterally", "Shoulder IR passed bilaterally"],
    },
  ] satisfies MovementTile[],
  screeningDetail: [
    {
      group: "Spine / Trunk",
      test: "Trunk rotation",
      right: "Fail",
      left: "Pass",
    },
    {
      group: "Spine / Trunk",
      test: "T-spine presentation",
      note: "T-spine Flat",
    },
    {
      group: "Hip",
      test: "Hip internal rotation",
      right: "Fail",
      left: "Pass",
    },
    {
      group: "Hip",
      test: "Hip external rotation",
      right: "Fail",
      left: "Pass",
    },
    {
      group: "Hip",
      test: "Adduction",
      right: "Pass",
      left: "Pass",
    },
    {
      group: "Shoulder",
      test: "30° shoulder abduction",
      right: "Pass",
      left: "Pass",
    },
    {
      group: "Shoulder",
      test: "90° shoulder abduction",
      right: "Pass",
      left: "Pass",
    },
    {
      group: "Shoulder",
      test: "Horizontal abduction",
      right: "Fail",
      left: "Fail",
    },
    {
      group: "Shoulder",
      test: "Shoulder flexion",
      right: "Pass",
      left: "Pass",
    },
    {
      group: "Shoulder",
      test: "Shoulder internal rotation",
      right: "Pass",
      left: "Pass",
    },
    {
      group: "Lower Body",
      test: "Straight-leg raise",
      right: "Fail",
      left: "Fail",
    },
    {
      group: "Lower Body",
      test: "Toe touch",
      right: "Fail",
      left: "Fail",
    },
  ] satisfies MovementScreenRow[],
};

export const hittingSection = {
  title: "Hitting Motion Capture",
  subtitle:
    "Workbook-driven hitting sequence paired with the full Sequence report narrative and player images.",
  source: hittingSourceLine,
  report: hittingPdfReport,
  findings: [
    {
      number: "01",
      title: "Workbook mocap is driving this section.",
      body: `${hittingMocap.source.sheet} supplied ${hittingMocap.source.framesProcessed} usable frames after header, metadata, and sample-rate rows were removed.`,
    },
    {
      number: "02",
      title: "Impact is currently proxied.",
      body: "The workbook does not include explicit load, foot plant, or contact labels, so chart timing still uses peak dominant-wrist speed as a repeatable impact proxy while the orange sequence trace follows dominant elbow flexion/extension velocity.",
    },
    {
      number: "03",
      title: "Interpretation needs lab review.",
      body: `${hittingMocap.quality.reviewMetricCount} KPI values are real workbook calculations, but sign conventions and side mappings should be confirmed before grading the athlete.`,
    },
  ] satisfies Finding[],
  optimalSequence: [
    { number: "01", label: "Pelvis Rotation" },
    { number: "02", label: "Torso Rotation" },
    { number: "03", label: "Dominant Elbow Flexion Extension" },
  ] satisfies SequenceStep[],
  athleteSequence: hittingAthleteSequence,
  chart: hittingMocap.chart,
  peaks: hittingMocap.peaks,
  metrics: hittingMocap.metrics,
  reportGraphs: hittingMocap.reportGraphs ?? [],
  trainingFocus: [
    {
      number: "01",
      title: "Confirm event markers",
      detail: "Map load, foot plant, and contact before final grading.",
    },
    {
      number: "02",
      title: "Confirm sign conventions",
      detail: "Review lead/plant side, left/right tilt, and CoG direction.",
    },
    {
      number: "03",
      title: "Sync with video",
      detail: "Validate the wrist-speed impact proxy against actual contact.",
    },
    {
      number: "04",
      title: "Assign performance bands",
      detail: "Apply athlete/lab norms after data definitions are confirmed.",
    },
  ] satisfies Priority[],
};

export const throwingSection = {
  title: "Throwing Motion Capture",
  subtitle:
    "Workbook-driven throwing sequence paired with the full Sequence report narrative and player images.",
  source: throwingSourceLine,
  report: throwingPdfReport,
  findings: [
    {
      number: "01",
      title: "Graphs match the reviewed throwing report.",
      body: "Sequence and KPI charts use PDF reference curves and marker values — not live workbook exports. Regenerate from scripts only when the reference report changes.",
    },
    {
      number: "02",
      title: "Peak timing matches the reviewed report.",
      body: "Confirmed peaks: shoulder twist 739.055°/s @ 1.980 s, pelvis 476.118°/s @ 1.987 s, elbow -1559.389°/s @ 2.037 s, shoulder rotation 1984.949°/s @ 2.077 s.",
    },
    {
      number: "03",
      title: "Interpretation needs lab review.",
      body: `${throwingMocap.quality.reviewMetricCount} KPI summary values still reference workbook metrics where applicable; sign conventions and event frames should be confirmed before grading.`,
    },
  ] satisfies Finding[],
  optimalSequence: [
    { number: "01", label: "Pelvis Rotation" },
    { number: "02", label: "Torso Rotation" },
    { number: "03", label: "Elbow Extension" },
    { number: "04", label: "Shoulder Internal Rotation" },
  ] satisfies SequenceStep[],
  athleteSequence: throwingAthleteSequence,
  chart: buildThrowingSequenceChart(throwingPdfGraphs.reportGraphs ?? [], throwingPdfGraphs.chart),
  peaks: throwingPdfGraphs.peaks,
  metrics: throwingMocap.metrics,
  reportGraphs: throwingPdfGraphs.reportGraphs ?? [],
  trainingFocus: [
    {
      number: "01",
      title: "Confirm event tags",
      detail: "Add confirmed frame tags before final grading of timing windows.",
    },
    {
      number: "02",
      title: "Confirm shoulder rotation convention",
      detail: "Review external/internal rotation direction before interpreting shoulder velocity.",
    },
    {
      number: "03",
      title: "Review lead-leg transfer",
      detail: "Map knee extension velocity to confirmed block timing.",
    },
    {
      number: "04",
      title: "Sync with video",
      detail: "Use the workbook outputs as mocap context until release timing is confirmed.",
    },
  ] satisfies Priority[],
};
