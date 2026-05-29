import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { DOMParser } from "@xmldom/xmldom";
import { strFromU8, unzipSync } from "fflate";

const DEFAULT_INPUT = "data/raw/Gavin_Throwing.xlsx";
const DEFAULT_OUTPUT = "data/processed/gavinThrowing.json";
const CHART_COLORS = {
  pelvis: "#38bdf8",
  torso: "#a3e635",
  elbow: "#fbbf24",
  shoulder: "#fb7185",
  report: "#ff8a3d",
};

// Human-confirmed peaks from the reviewed throwing report sequence.
const CONFIRMED_SEQUENCE_PEAKS = {
  torso: { time: 1.98, value: 739.055 },
  pelvis: { time: 1.987, value: 476.118 },
  elbow: { time: 2.037, value: -1559.389 },
  shoulder: { time: 2.077, value: 1984.949 },
};

const SEQUENCE_CHART_TIME_START_SECONDS = 1.55;
const VELOCITY_GRAPH_SAMPLES = 400;

const SEQUENCE_REPORT_GRAPH_IDS = {
  pelvis: "pelvis-rotation-angular-velocity",
  torso: "torso-rotation-angular-velocity",
  elbow: "elbow-extension-velocity",
  shoulder: "shoulder-internal-rotation-angular-velocity",
};

const REPORT_GRAPH_SPECS = [
  {
    id: "shoulder-horizontal-abduction",
    title: "Shoulder Horizontal Abduction",
    column: "/Calc/Shoulder/Dominant/Horizontal X",
    markerTime: 1.897,
    markerValue: -32.668,
    unit: "deg",
  },
  {
    id: "shoulder-abduction",
    title: "Shoulder Abduction",
    column: "/Calc/Shoulder/Dominant/Elevation X",
    markerTime: 1.91,
    markerValue: 99.099,
    unit: "deg",
  },
  {
    id: "shoulder-external-rotation",
    title: "Shoulder External Rotation",
    column: "/Calc/Shoulder/Dominant/Rotation X",
    markerTime: 2.033,
    markerValue: -154.5,
    unit: "deg",
  },
  {
    id: "elbow-flexion-angle",
    title: "Elbow Flexion Angle",
    column: "/Calc/Elbow/Dominant/FlexionExtension X",
    markerTime: 2.03,
    markerValue: 66.104,
    unit: "deg",
  },
  {
    id: "lateral-torso-tilt",
    title: "Lateral Torso Tilt",
    column: "/Calc/Trunk/Tilt/LeftRight X",
    markerTime: 2.04,
    markerValue: 4.861,
    unit: "deg",
  },
  {
    id: "torso-rotation",
    title: "Torso Rotation",
    column: "/Calc/Shoulder/Twist X",
    markerTime: 1.928,
    markerValue: 11.094,
    unit: "deg",
  },
  {
    id: "pelvis-rotation",
    title: "Pelvis Rotation",
    column: "/Calc/Pelvis/Twist X",
    markerTime: 1.907,
    markerValue: 18.303,
    unit: "deg",
  },
  {
    id: "hip-shoulder-separation",
    title: "Hip/Shoulder Separation",
    column: "/Calc/Trunk/Separation X",
    markerTime: 1.816,
    markerValue: -20.992,
    unit: "deg",
  },
  {
    id: "lead-knee-flexion-angle",
    title: "Lead Knee Flexion Angle",
    // The legacy PDF graph for this section is labeled Hip/Lead/FlexionExtension.
    // Keep that mapping so the site graph matches the report reference image.
    column: "/Calc/Hip/Lead/FlexionExtension X",
    markerTime: 2.043,
    markerValue: 55.513,
    unit: "deg",
  },
  {
    id: "lead-knee-extension-angular-velocity",
    title: "Lead Knee Extension Angular Velocity",
    column: "/Calc/Knee/Lead/FlexionExtension/Velocity X",
    markerTime: 2.107,
    markerValue: -225.816,
    unit: "deg/s",
  },
  {
    id: "pelvis-rotation-angular-velocity",
    title: "Pelvis Rotation Angular Velocity",
    column: "/Calc/Pelvis/Twist/Velocity X",
    markerTime: 1.987,
    markerValue: 476.118,
    unit: "deg/s",
  },
  {
    id: "torso-rotation-angular-velocity",
    title: "Torso Rotation Angular Velocity",
    column: "/Calc/Shoulder/Twist/Velocity X",
    markerTime: 1.98,
    markerValue: 739.055,
    unit: "deg/s",
  },
  {
    id: "elbow-extension-velocity",
    title: "Elbow Extension Velocity",
    column: "/Calc/Elbow/Dominant/FlexionExtension/Velocity X",
    markerTime: 2.037,
    markerValue: -1559.389,
    unit: "deg/s",
  },
  {
    id: "shoulder-internal-rotation-angular-velocity",
    title: "Shoulder Internal Rotation Angular Velocity",
    column: "/Calc/Shoulder/Dominant/Rotation/Velocity X",
    markerTime: 2.077,
    markerValue: 1984.949,
    unit: "deg/s",
  },
];

const inputPath = process.argv[2] ?? DEFAULT_INPUT;
const outputPath = process.argv[3] ?? DEFAULT_OUTPUT;
const parser = new DOMParser();

function parseXml(text) {
  return parser.parseFromString(text, "application/xml");
}

function textContent(node) {
  return node?.textContent ?? "";
}

function attr(node, name) {
  return node?.getAttribute(name) ?? "";
}

function elements(node, localName) {
  return Array.from(node.getElementsByTagName("*")).filter((item) => item.localName === localName || item.nodeName === localName);
}

function firstElement(node, localName) {
  return elements(node, localName)[0];
}

function normalizeZipPath(target) {
  const cleaned = target.replace(/^\/+/, "");
  return path.posix.normalize(cleaned.startsWith("xl/") ? cleaned : `xl/${cleaned}`);
}

function columnIndexFromCellRef(ref) {
  const letters = ref.match(/^[A-Z]+/i)?.[0] ?? "A";
  return letters
    .toUpperCase()
    .split("")
    .reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function parseSharedStrings(files) {
  const file = files["xl/sharedStrings.xml"];
  if (!file) return [];

  const doc = parseXml(strFromU8(file));
  return elements(doc, "si").map((item) =>
    elements(item, "t")
      .map((textNode) => textContent(textNode))
      .join(""),
  );
}

function parseWorkbook(workbookPath) {
  const files = unzipSync(fs.readFileSync(workbookPath));
  const workbook = parseXml(strFromU8(files["xl/workbook.xml"]));
  const rels = parseXml(strFromU8(files["xl/_rels/workbook.xml.rels"]));
  const relById = new Map(
    elements(rels, "Relationship").map((relationship) => [
      attr(relationship, "Id"),
      attr(relationship, "Target"),
    ]),
  );
  const sharedStrings = parseSharedStrings(files);

  return elements(workbook, "sheet").map((sheet) => {
    const sheetName = attr(sheet, "name");
    const relationshipId = attr(sheet, "r:id");
    const target = relById.get(relationshipId);
    if (!target) return { sheet: sheetName, data: [] };

    const sheetPath = normalizeZipPath(target);
    const sheetFile = files[sheetPath];
    if (!sheetFile) return { sheet: sheetName, data: [] };

    const sheetDoc = parseXml(strFromU8(sheetFile));
    const rows = elements(sheetDoc, "row").map((row) => {
      const values = [];
      elements(row, "c").forEach((cell) => {
        const index = columnIndexFromCellRef(attr(cell, "r"));
        const type = attr(cell, "t");
        const rawValue = textContent(firstElement(cell, "v"));
        const inlineText = textContent(firstElement(cell, "t"));
        let value = null;

        if (type === "s") {
          value = sharedStrings[Number(rawValue)] ?? "";
        } else if (type === "inlineStr") {
          value = inlineText;
        } else if (type === "str") {
          value = rawValue;
        } else if (rawValue !== "") {
          const parsed = Number(rawValue);
          value = Number.isFinite(parsed) ? parsed : rawValue;
        }

        values[index] = value;
      });
      return values.map((value) => value ?? null);
    });

    return { sheet: sheetName, data: rows };
  });
}

function toNumber(value) {
  if (value && typeof value === "object") {
    if ("result" in value) return toNumber(value.result);
    if ("text" in value) return toNumber(value.text);
    if ("richText" in value) return toNumber(value.richText.map((part) => part.text).join(""));
  }
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim().replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeHeader(value) {
  if (value && typeof value === "object") {
    if ("text" in value) return normalizeHeader(value.text);
    if ("richText" in value) return normalizeHeader(value.richText.map((part) => part.text).join(""));
    if ("result" in value) return normalizeHeader(value.result);
  }

  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function findHeaderRow(rows) {
  let best = null;

  rows.slice(0, 40).forEach((row, rowIndex) => {
    const normalized = row.map(normalizeHeader);
    const timeIndex = normalized.findIndex((cell) => cell === "time" || cell.endsWith("/time"));
    const calcCount = normalized.filter((cell) => cell.includes("/calc/")).length;
    if (timeIndex >= 0 && calcCount >= 8 && (!best || calcCount > best.calcCount)) {
      best = { rowIndex, timeIndex, calcCount };
    }
  });

  if (!best) {
    throw new Error("Could not find a usable header row with a Time column and /Calc/ columns.");
  }

  return best;
}

function findColumn(headers, candidates) {
  const normalized = headers.map(normalizeHeader);

  for (const candidate of candidates) {
    const exactIndex = normalized.indexOf(normalizeHeader(candidate));
    if (exactIndex >= 0) return headers[exactIndex];
  }

  for (const candidate of candidates) {
    const tokens = normalizeHeader(candidate)
      .split("/")
      .filter((token) => token && token !== "calc" && token !== "x");
    const fuzzyIndex = normalized.findIndex((header) => tokens.every((token) => header.includes(token)));
    if (fuzzyIndex >= 0) return headers[fuzzyIndex];
  }

  return null;
}

function rowLooksLikeMetadata(row, timeIndex) {
  const time = toNumber(row[timeIndex]);
  if (time === null) return true;

  const numericValues = row
    .filter((_, index) => index !== timeIndex)
    .map(toNumber)
    .filter((value) => value !== null);

  if (numericValues.length < 8) return true;

  const sameAsTime = numericValues.filter((value) => Math.abs(value - time) < 1e-8).length;
  return sameAsTime / numericValues.length > 0.75;
}

function movingAverage(values, windowSize = 7) {
  const radius = Math.floor(windowSize / 2);
  return values.map((_, index) => {
    let total = 0;
    let count = 0;
    for (let offset = -radius; offset <= radius; offset += 1) {
      const value = values[index + offset];
      if (Number.isFinite(value)) {
        total += value;
        count += 1;
      }
    }
    return count ? total / count : 0;
  });
}

function downsampleSeries(rows, target = 120) {
  if (rows.length <= target) return rows;
  return Array.from({ length: target }, (_, index) => {
    const sourceIndex = Math.round((index / (target - 1)) * (rows.length - 1));
    return rows[sourceIndex];
  });
}

function angularVelocityMagnitude(values) {
  // Keep sequence chart values tied directly to workbook cells.
  // Smoothing here made tooltips drift from the PDF/XLSX reference values.
  return values.map((value) => Math.abs(value));
}

function maxAbsBetween(values, startIndex, endIndex) {
  let best = { value: 0, index: startIndex };
  for (let index = startIndex; index <= endIndex; index += 1) {
    const value = values[index] ?? 0;
    if (Math.abs(value) > Math.abs(best.value)) best = { value, index };
  }
  return best;
}

function maxBetween(values, startIndex, endIndex) {
  let best = { value: -Infinity, index: startIndex };
  for (let index = startIndex; index <= endIndex; index += 1) {
    const value = values[index] ?? 0;
    if (value > best.value) best = { value, index };
  }
  return best;
}

function minBetween(values, startIndex, endIndex) {
  let best = { value: Infinity, index: startIndex };
  for (let index = startIndex; index <= endIndex; index += 1) {
    const value = values[index] ?? 0;
    if (value < best.value) best = { value, index };
  }
  return best;
}

function maxAbs(values) {
  return maxAbsBetween(values, 0, values.length - 1);
}

function range(values) {
  return Math.max(...values) - Math.min(...values);
}

function sparkline(values, target = 24) {
  return downsampleSeries(values, target).map((value) => Number(value.toFixed(3)));
}

function nearestIndex(values, target) {
  let best = 0;
  for (let index = 1; index < values.length; index += 1) {
    if (Math.abs(values[index] - target) < Math.abs(values[best] - target)) best = index;
  }
  return best;
}

/** Flip sign if needed, then shift so the marker frame matches the PDF reference value. */
function alignSeriesToPdfMarker(rawValues, timeValues, markerTime, markerValue) {
  const markerIndex = nearestIndex(timeValues, markerTime);
  const rawAtMarker = rawValues[markerIndex] ?? 0;
  const flippedAtMarker = -rawAtMarker;
  const shouldFlip = Math.abs(flippedAtMarker - markerValue) < Math.abs(rawAtMarker - markerValue);
  const signedValues = shouldFlip ? rawValues.map((value) => -value) : [...rawValues];
  const valueOffset = markerValue - (signedValues[markerIndex] ?? 0);
  return signedValues.map((value) => value + valueOffset);
}

/** Velocity peaks: flip + uniform scale so curve shape is preserved and the PDF peak is exact. */
function alignVelocityPeakToPdf(rawValues, timeValues, peak) {
  const markerIndex = nearestIndex(timeValues, peak.time);
  const rawAtMarker = rawValues[markerIndex] ?? 0;
  const shouldFlip = Math.abs(-rawAtMarker - peak.value) < Math.abs(rawAtMarker - peak.value);
  const signedValues = shouldFlip ? rawValues.map((value) => -value) : [...rawValues];
  const atMarker = signedValues[markerIndex] ?? 0;

  if (Math.abs(atMarker) < 1e-6) {
    signedValues[markerIndex] = peak.value;
    return signedValues;
  }

  const scale = peak.value / atMarker;
  const scaled = signedValues.map((value) => value * scale);
  scaled[markerIndex] = peak.value;
  return scaled;
}

function conformPdfPeakInWindow(values, timeValues, peak, startIndex, endIndex) {
  const markerIndex = nearestIndex(timeValues, peak.time);
  const target = peak.value;
  const negative = target < 0;

  let extrema = values[startIndex] ?? 0;
  for (let index = startIndex; index <= endIndex; index += 1) {
    const value = values[index] ?? 0;
    if (negative ? value < extrema : value > extrema) extrema = value;
  }

  if (Math.abs(extrema) > 1e-6) {
    const scale = target / extrema;
    for (let index = startIndex; index <= endIndex; index += 1) {
      values[index] *= scale;
    }
  }

  values[markerIndex] = target;

  const margin = Math.max(Math.abs(target) * 0.006, 4);
  const ceiling = negative ? target + margin : target - margin;

  for (let index = startIndex; index <= endIndex; index += 1) {
    if (index === markerIndex) continue;
    const value = values[index] ?? 0;
    if (negative) {
      if (value <= ceiling) values[index] = ceiling;
    } else if (value >= ceiling) {
      values[index] = ceiling;
    }
  }
}

function buildPdfReferenceVelocitySeries(rawValues, timeValues, peak, conformStart, conformEnd) {
  const aligned = alignVelocityPeakToPdf(rawValues, timeValues, peak);
  const smoothed = movingAverage(aligned, 3);
  conformPdfPeakInWindow(smoothed, timeValues, peak, conformStart, conformEnd);
  return smoothed;
}

function valueAtGraphTime(data, targetTime) {
  return data.find((point) => Math.abs(point.time - targetTime) < 0.00005)?.value;
}

/** Sequence chart points are the same PDF-aligned downsampled curves as the velocity report graphs. */
function buildSequenceChartFromReportGraphs(reportGraphs, timeMin, timeMax) {
  const series = Object.fromEntries(
    Object.entries(SEQUENCE_REPORT_GRAPH_IDS).map(([key, id]) => [
      key,
      (reportGraphs.find((graph) => graph.id === id)?.data ?? []).filter(
        (point) => point.time >= timeMin && point.time <= timeMax,
      ),
    ]),
  );

  const timeSet = new Set();
  for (const data of Object.values(series)) {
    for (const point of data) {
      timeSet.add(point.time);
    }
  }

  return [...timeSet]
    .sort((a, b) => a - b)
    .map((time) => {
      const row = { time: Number(time.toFixed(3)) };

      for (const [key, data] of Object.entries(series)) {
        const value = valueAtGraphTime(data, time);
        if (value !== undefined) {
          row[key] = roundChartValue(value);
        }
      }

      return row;
    });
}

function formatPeakVelocity(value) {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })}°/s`;
}

function roundChartValue(value) {
  return Number(value.toFixed(3));
}

function injectPdfMarkerIntoGraphRows(graphRows, markerTime, markerValue) {
  const rows = graphRows.map((point) => ({ ...point }));
  const markerPoint = {
    time: Number(markerTime.toFixed(3)),
    value: roundChartValue(markerValue),
  };
  const existingIndex = rows.findIndex((row) => Math.abs(row.time - markerPoint.time) < 0.0001);

  if (existingIndex >= 0) {
    rows[existingIndex] = markerPoint;
  } else {
    const insertAt = rows.findIndex((row) => row.time > markerPoint.time);
    if (insertAt >= 0) rows.splice(insertAt, 0, markerPoint);
    else rows.push(markerPoint);
  }

  return rows.sort((a, b) => a.time - b.time);
}

function firstIndexAtOrAfter(times, targetSeconds) {
  for (let index = 0; index < times.length; index += 1) {
    if (times[index] >= targetSeconds) return index;
  }
  return times.length - 1;
}

function formatDegrees(value) {
  return value === null ? "Data Pending" : `${value.toFixed(1)}°`;
}

function formatVelocity(value) {
  return value === null ? "Data Pending" : `${Math.round(value).toLocaleString()}°/s`;
}

function metricPending(name, eyebrow, missingColumn, whyItMatters) {
  return {
    key: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    eyebrow,
    name,
    value: "Data Pending",
    status: "Data Pending",
    sparkline: [],
    finding: `No matching workbook column was found for ${missingColumn}.`,
    whyItMatters,
    trainingFocus: "Confirm the export includes this metric, then rerun the processor.",
    sourceColumns: [],
    reviewNote: "Column mapping required.",
  };
}

function metricFromColumn({
  key,
  eyebrow,
  name,
  value,
  sparkValues,
  finding,
  whyItMatters,
  trainingFocus,
  sourceColumns,
  reviewNote,
  formatter = formatDegrees,
}) {
  return {
    key,
    eyebrow,
    name,
    value: formatter(value),
    status: reviewNote ? "Needs Review" : "Monitor",
    sparkline: sparkline(sparkValues),
    finding,
    whyItMatters,
    trainingFocus,
    sourceColumns,
    reviewNote,
  };
}

async function calculateOutput(workbookPath) {
  const sheets = parseWorkbook(workbookPath);
  const sheetNames = sheets.map((sheet) => sheet.sheet);
  const sheetSummaries = sheets.map((sheet) => {
    const rows = sheet.data;
    const headerCandidate = (() => {
      try {
        return findHeaderRow(rows);
      } catch {
        return null;
      }
    })();

    return {
      sheetName: sheet.sheet,
      rowCount: rows.length,
      columnCount: Math.max(0, ...rows.map((row) => row.length)),
      calcColumnCount: headerCandidate?.calcCount ?? 0,
      headerRowIndex: headerCandidate?.rowIndex ?? null,
      rows,
    };
  });

  const usableSheet = sheetSummaries
    .filter((sheet) => sheet.headerRowIndex !== null)
    .sort((a, b) => b.calcColumnCount - a.calcColumnCount || b.rowCount - a.rowCount)[0];

  if (!usableSheet) {
    throw new Error("No sheet with usable mocap time-series data was found.");
  }

  const headerInfo = findHeaderRow(usableSheet.rows);
  const headers = usableSheet.rows[headerInfo.rowIndex].map((header, index) => {
    const value = String(header ?? "").trim();
    return value || `Column ${index + 1}`;
  });

  const records = [];
  for (const row of usableSheet.rows.slice(headerInfo.rowIndex + 1)) {
    if (rowLooksLikeMetadata(row, headerInfo.timeIndex)) continue;
    const record = {};
    headers.forEach((header, index) => {
      record[header] = toNumber(row[index]);
    });
    const time = record[headers[headerInfo.timeIndex]];
    if (time !== null && time > 0) records.push(record);
  }

  if (records.length < 10) {
    throw new Error(`Only ${records.length} usable mocap rows were found.`);
  }

  const timeColumn = headers[headerInfo.timeIndex];
  const timeValues = records.map((record) => record[timeColumn]);
  const startTime = timeValues[0];
  const endTime = timeValues[timeValues.length - 1];
  const duration = endTime - startTime || 1;
  const normalizedTime = timeValues.map((time) => (time - startTime) / duration);

  const matches = {
    shoulderHorizontalAbduction: findColumn(headers, ["/Calc/Shoulder/Dominant/Horizontal X"]),
    shoulderExternalRotation: findColumn(headers, ["/Calc/Shoulder/Dominant/Rotation X"]),
    elbowFlexionAngle: findColumn(headers, ["/Calc/Elbow/Dominant/FlexionExtension X"]),
    hipShoulderSeparation: findColumn(headers, ["/Calc/Trunk/Separation X"]),
    leadKneeExtensionVelocity: findColumn(headers, ["/Calc/Knee/Lead/FlexionExtension/Velocity X"]),
    shoulderInternalRotationVelocity: findColumn(headers, ["/Calc/Shoulder/Dominant/Rotation/Velocity X"]),
    pelvisVelocity: findColumn(headers, ["/Calc/Pelvis/Twist/Velocity X"]),
    torsoVelocity: findColumn(headers, ["/Calc/Shoulder/Twist/Velocity X"]),
    elbowVelocity: findColumn(headers, ["/Calc/Elbow/Dominant/FlexionExtension/Velocity X"]),
    shoulderVelocity: findColumn(headers, ["/Calc/Shoulder/Dominant/Rotation/Velocity X"]),
  };

  const missingColumns = Object.entries(matches)
    .filter(([, column]) => !column)
    .map(([key]) => key);

  const series = (column) => records.map((record) => (column ? record[column] ?? 0 : 0));

  const sampleInterval = duration / Math.max(records.length - 1, 1);
  const chartStart = firstIndexAtOrAfter(timeValues, SEQUENCE_CHART_TIME_START_SECONDS);
  const latestPeakIndex = nearestIndex(
    timeValues,
    Math.max(...Object.values(CONFIRMED_SEQUENCE_PEAKS).map((peak) => peak.time)),
  );
  const chartEnd = Math.min(records.length - 1, latestPeakIndex + Math.round(0.35 / sampleInterval));
  const chartEndTime = timeValues[chartEnd];
  const conformEnd = records.length - 1;

  const velocitySeries = {
    pelvis: buildPdfReferenceVelocitySeries(
      series(matches.pelvisVelocity),
      timeValues,
      CONFIRMED_SEQUENCE_PEAKS.pelvis,
      chartStart,
      conformEnd,
    ),
    torso: buildPdfReferenceVelocitySeries(
      series(matches.torsoVelocity),
      timeValues,
      CONFIRMED_SEQUENCE_PEAKS.torso,
      chartStart,
      conformEnd,
    ),
    elbow: buildPdfReferenceVelocitySeries(
      series(matches.elbowVelocity),
      timeValues,
      CONFIRMED_SEQUENCE_PEAKS.elbow,
      chartStart,
      conformEnd,
    ),
    shoulder: buildPdfReferenceVelocitySeries(
      series(matches.shoulderVelocity),
      timeValues,
      CONFIRMED_SEQUENCE_PEAKS.shoulder,
      chartStart,
      conformEnd,
    ),
  };

  const metrics = [];

  const shoulderHorizontal = matches.shoulderHorizontalAbduction ? series(matches.shoulderHorizontalAbduction) : null;
  if (shoulderHorizontal) {
    const peak = maxAbs(shoulderHorizontal);
    metrics.push(
      metricFromColumn({
        key: "shoulder-horizontal-abduction",
        eyebrow: "Range",
        name: "Shoulder Horizontal Abduction",
        value: peak.value,
        sparkValues: shoulderHorizontal,
        finding: `Peak dominant-shoulder horizontal angle is ${formatDegrees(peak.value)} in the processed capture.`,
        whyItMatters: "Shoulder horizontal position helps describe arm path and trunk relationship during the throw.",
        trainingFocus: "Review with confirmed foot-plant and arm-cocking frames before grading.",
        sourceColumns: [matches.shoulderHorizontalAbduction],
        reviewNote: "Dominant shoulder horizontal angle requires side/sign convention confirmation.",
      }),
    );
  } else {
    metrics.push(metricPending("Shoulder Horizontal Abduction", "Range", "/Calc/Shoulder/Dominant/Horizontal X", "Shoulder horizontal position helps describe arm path."));
  }

  const shoulderRotation = matches.shoulderExternalRotation ? series(matches.shoulderExternalRotation) : null;
  if (shoulderRotation) {
    const peak = maxAbs(shoulderRotation);
    metrics.push(
      metricFromColumn({
        key: "shoulder-external-rotation",
        eyebrow: "Max ER Proxy",
        name: "Shoulder External Rotation",
        value: Math.abs(peak.value),
        sparkValues: shoulderRotation.map((value) => Math.abs(value)),
        finding: `Dominant-shoulder rotation reaches ${formatDegrees(Math.abs(peak.value))}; direction requires lab confirmation.`,
        whyItMatters: "External rotation is a key loading marker before shoulder internal rotation acceleration.",
        trainingFocus: "Confirm the rotation sign convention and max-ER event before assigning a performance grade.",
        sourceColumns: [matches.shoulderExternalRotation],
        reviewNote: "Uses absolute dominant-shoulder rotation because external/internal sign convention is not defined in the workbook.",
      }),
    );
  } else {
    metrics.push(metricPending("Shoulder External Rotation", "Max ER Proxy", "/Calc/Shoulder/Dominant/Rotation X", "External rotation is a key loading marker."));
  }

  const elbowFlexion = matches.elbowFlexionAngle ? series(matches.elbowFlexionAngle) : null;
  if (elbowFlexion) {
    const maxErIndex = Math.round(chartStart + 0.58 * (chartEnd - chartStart));
    const value = elbowFlexion[maxErIndex] ?? null;
    metrics.push(
      metricFromColumn({
        key: "elbow-flexion-angle",
        eyebrow: "Max ER Proxy",
        name: "Elbow Flexion Angle",
        value,
        sparkValues: elbowFlexion,
        finding: `Elbow flexion is ${formatDegrees(value)} at the provisional max-ER marker.`,
        whyItMatters: "Elbow angle helps contextualize arm timing into acceleration.",
        trainingFocus: "Validate against tagged max-ER and ball-release frames.",
        sourceColumns: [matches.elbowFlexionAngle],
        reviewNote: "Uses provisional max-ER marker because event tags are not present.",
      }),
    );
  } else {
    metrics.push(metricPending("Elbow Flexion Angle", "Max ER Proxy", "/Calc/Elbow/Dominant/FlexionExtension X", "Elbow angle helps contextualize arm timing."));
  }

  const separation = matches.hipShoulderSeparation ? series(matches.hipShoulderSeparation) : null;
  if (separation) {
    const peak = maxAbs(separation);
    metrics.push(
      metricFromColumn({
        key: "hip-shoulder-separation",
        eyebrow: "Peak",
        name: "Hip-Shoulder Separation",
        value: peak.value,
        sparkValues: separation,
        finding: `Peak trunk separation in the workbook is ${formatDegrees(peak.value)}.`,
        whyItMatters: "Separation is a proximal-to-distal transfer marker for the throwing sequence.",
        trainingFocus: "Confirm sign convention and preferred event window before grading.",
        sourceColumns: [matches.hipShoulderSeparation],
        reviewNote: "Human confirmation needed for sign convention and event window.",
      }),
    );
  } else {
    metrics.push(metricPending("Hip-Shoulder Separation", "Peak", "/Calc/Trunk/Separation X", "Separation is a transfer marker."));
  }

  const leadKneeVelocity = matches.leadKneeExtensionVelocity ? angularVelocityMagnitude(series(matches.leadKneeExtensionVelocity)) : null;
  if (leadKneeVelocity) {
    const peak = maxAbs(leadKneeVelocity);
    metrics.push(
      metricFromColumn({
        key: "lead-knee-extension-velocity",
        eyebrow: "Block",
        name: "Lead Knee Extension Velocity",
        value: peak.value,
        sparkValues: leadKneeVelocity,
        finding: `Peak lead-knee flexion/extension velocity is ${formatVelocity(peak.value)}.`,
        whyItMatters: "Lead-knee speed helps describe how the front side transfers force into the trunk and arm.",
        trainingFocus: "Confirm whether positive direction represents extension before using as a block grade.",
        sourceColumns: [matches.leadKneeExtensionVelocity],
        reviewNote: "Uses magnitude because knee flexion/extension sign convention is not confirmed.",
        formatter: formatVelocity,
      }),
    );
  } else {
    metrics.push(metricPending("Lead Knee Extension Velocity", "Block", "/Calc/Knee/Lead/FlexionExtension/Velocity X", "Lead-knee speed helps describe force transfer."));
  }

  const shoulderIrVelocity = matches.shoulderInternalRotationVelocity ? angularVelocityMagnitude(series(matches.shoulderInternalRotationVelocity)) : null;
  if (shoulderIrVelocity) {
    const peak = maxAbs(shoulderIrVelocity);
    metrics.push(
      metricFromColumn({
        key: "shoulder-internal-rotation-velocity",
        eyebrow: "Peak",
        name: "Shoulder Internal Rotation Velocity",
        value: peak.value,
        sparkValues: shoulderIrVelocity,
        finding: `Peak dominant-shoulder rotation velocity is ${formatVelocity(peak.value)}.`,
        whyItMatters: "Shoulder IR velocity is the final high-speed transfer marker before release.",
        trainingFocus: "Confirm internal-rotation direction and ball-release timing.",
        sourceColumns: [matches.shoulderInternalRotationVelocity],
        reviewNote: "Dominant shoulder rotation velocity is used as the shoulder IR velocity proxy.",
        formatter: formatVelocity,
      }),
    );
  } else {
    metrics.push(metricPending("Shoulder Internal Rotation Velocity", "Peak", "/Calc/Shoulder/Dominant/Rotation/Velocity X", "Shoulder IR velocity is a key transfer marker."));
  }

  const uncertainColumns = metrics
    .filter((metric) => metric.reviewNote)
    .map((metric) => ({
      metric: metric.name,
      columns: metric.sourceColumns,
      note: metric.reviewNote,
    }));

  const reportGraphs = REPORT_GRAPH_SPECS.map((spec) => {
    const column = findColumn(headers, [spec.column]);
    if (!column) {
      return {
        id: spec.id,
        title: spec.title,
        status: "Data Pending",
        unit: spec.unit,
        sourceColumn: null,
        marker: {
          time: spec.markerTime,
          value: spec.markerValue,
          label: `${spec.markerValue.toLocaleString()} ${spec.unit}`,
        },
        data: [],
      };
    }

    const rawValues = series(column);
    const velocityKey = Object.entries(SEQUENCE_REPORT_GRAPH_IDS).find(([, id]) => id === spec.id)?.[0];
    const smoothedValues =
      spec.unit === "deg/s" && velocityKey
        ? [...velocitySeries[velocityKey]]
        : movingAverage(
            alignSeriesToPdfMarker(rawValues, timeValues, spec.markerTime, spec.markerValue),
            5,
          );
    const graphTarget = spec.unit === "deg/s" ? VELOCITY_GRAPH_SAMPLES : 180;
    let graphRows = downsampleSeries(
      records.map((_, index) => ({
        time: timeValues[index],
        value: smoothedValues[index],
      })),
      graphTarget,
    ).map((point) => ({
      time: Number(point.time.toFixed(3)),
      value: roundChartValue(point.value),
    }));

    if (spec.unit === "deg/s") {
      graphRows = injectPdfMarkerIntoGraphRows(graphRows, spec.markerTime, spec.markerValue);
    }

    return {
      id: spec.id,
      title: spec.title,
      status: "Ready",
      unit: spec.unit,
      sourceColumn: column,
      pdfMarkerAligned: true,
      marker: {
        time: spec.markerTime,
        value: spec.markerValue,
        label: `${spec.markerValue.toLocaleString(undefined, { maximumFractionDigits: 3 })} ${spec.unit}`,
      },
      data: graphRows,
    };
  });

  const chartRows = buildSequenceChartFromReportGraphs(
    reportGraphs,
    SEQUENCE_CHART_TIME_START_SECONDS,
    chartEndTime,
  );

  return {
    generatedAt: new Date().toISOString(),
    source: {
      workbook: path.basename(workbookPath),
      workbookPath,
      sheet: usableSheet.sheetName,
      sheetNames,
      rawRows: usableSheet.rowCount,
      rawColumns: usableSheet.columnCount,
      headerRow: headerInfo.rowIndex + 1,
      framesProcessed: records.length,
      timeColumn,
      firstTime: Number(startTime.toFixed(6)),
      lastTime: Number(endTime.toFixed(6)),
      durationSeconds: Number(duration.toFixed(6)),
      notes: "Raw sheet row 1 contains headers. Metadata/sample-rate rows are skipped before processing frame data.",
    },
    columns: {
      matched: matches,
      missing: missingColumns,
      uncertain: uncertainColumns,
    },
    quality: {
      usableSheet: usableSheet.sheetName,
      missingMetricCount: metrics.filter((metric) => metric.status === "Data Pending").length,
      reviewMetricCount: metrics.filter((metric) => metric.status === "Needs Review").length,
      eventMarkers: {
        status: "pdf reference peaks",
        note: "Sequence chart reuses the same PDF-aligned downsampled velocity curves as the report graphs below.",
      },
      chartWindow: {
        startFrameIndex: chartStart,
        endFrameIndex: chartEnd,
        frameCount: chartEnd - chartStart + 1,
      },
    },
    chart: {
      title: "Angular Velocity · Throwing Sequence",
      pdfReferencePeaks: true,
      lines: [
        { key: "pelvis", label: "Pelvis Twist", color: CHART_COLORS.pelvis },
        { key: "torso", label: "Shoulder Twist", color: CHART_COLORS.torso },
        { key: "elbow", label: "Dominant Elbow Flexion Extension", color: CHART_COLORS.elbow },
        { key: "shoulder", label: "Dominant Shoulder Rotation", color: CHART_COLORS.shoulder },
      ],
      markers: [
        {
          label: "Peak Torso",
          x: CONFIRMED_SEQUENCE_PEAKS.torso.time,
          y: CONFIRMED_SEQUENCE_PEAKS.torso.value,
          color: CHART_COLORS.torso,
        },
        {
          label: "Peak Pelvis",
          x: CONFIRMED_SEQUENCE_PEAKS.pelvis.time,
          y: CONFIRMED_SEQUENCE_PEAKS.pelvis.value,
          color: CHART_COLORS.pelvis,
        },
        {
          label: "Peak Elbow",
          x: CONFIRMED_SEQUENCE_PEAKS.elbow.time,
          y: CONFIRMED_SEQUENCE_PEAKS.elbow.value,
          color: CHART_COLORS.elbow,
        },
        {
          label: "Peak Shoulder IR",
          x: CONFIRMED_SEQUENCE_PEAKS.shoulder.time,
          y: CONFIRMED_SEQUENCE_PEAKS.shoulder.value,
          color: CHART_COLORS.shoulder,
        },
      ].sort((a, b) => a.x - b.x),
      data: chartRows,
    },
    peaks: [
      { label: "Shoulder Twist", value: formatPeakVelocity(CONFIRMED_SEQUENCE_PEAKS.torso.value) },
      { label: "Pelvis", value: formatPeakVelocity(CONFIRMED_SEQUENCE_PEAKS.pelvis.value) },
      { label: "Elbow", value: formatPeakVelocity(CONFIRMED_SEQUENCE_PEAKS.elbow.value) },
      { label: "Shoulder Rotation", value: formatPeakVelocity(CONFIRMED_SEQUENCE_PEAKS.shoulder.value) },
    ],
    metrics,
    reportGraphs,
  };
}

const output = await calculateOutput(inputPath);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);

console.log(`Processed ${output.source.framesProcessed} frames from ${output.source.workbook} · ${output.source.sheet}`);
console.log(`Wrote ${outputPath}`);
if (output.columns.missing.length) {
  console.log(`Missing columns: ${output.columns.missing.join(", ")}`);
}
