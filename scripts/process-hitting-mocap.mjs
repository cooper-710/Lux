import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import readWorkbook from "read-excel-file/node";

const DEFAULT_INPUT = "data/raw/Gavin_Hitting.xlsx";
const DEFAULT_OUTPUT = "data/processed/hitting-mocap.json";
const CHART_COLORS = {
  pelvis: "#38bdf8",
  torso: "#a3e635",
  elbow: "#f97316",
};

// Human-confirmed timing from the reviewed hitting report sequence.
// The workbook-derived series remains unchanged; these values only place the sequence markers.
const CONFIRMED_SEQUENCE_PEAK_TIMES_SECONDS = {
  pelvis: 2.290,
  torso: 2.293,
};

const REPORT_GRAPH_SPECS = [
  {
    id: "shoulder-hip-separation",
    title: "Shoulder Hip Separation",
    column: "/Calc/Trunk/Separation X",
    markerTime: 2.2,
    markerValue: -5.153,
    unit: "deg",
  },
  {
    id: "shoulder-horizontal-adduction",
    title: "Shoulder Horizontal Adduction",
    column: "/Calc/Shoulder/Other/Horizontal X",
    markerTime: 2.15,
    markerValue: 117.141,
    unit: "deg",
  },
  {
    id: "torso-lateral-flexion",
    title: "Torso Lateral Flexion",
    column: "/Calc/Trunk/Tilt/LeftRight X",
    markerTime: 2.333,
    markerValue: -22.506,
    unit: "deg",
  },
  {
    id: "rear-hip-internal-rotation",
    title: "Rear Hip Internal Rotation",
    column: "/Calc/Hip/Plant/InternalExternal X",
    markerTime: 2.26,
    markerValue: 29.575,
    unit: "deg",
  },
  {
    id: "torso-counter-rotation",
    title: "Torso Counter Rotation",
    column: "/Calc/Shoulder/Twist X",
    markerTime: 2.013,
    markerValue: -27.805,
    unit: "deg",
  },
  {
    id: "torso-rotation",
    title: "Torso Rotation",
    column: "/Calc/Shoulder/Twist X",
    markerTime: 2.333,
    markerValue: 80.725,
    unit: "deg",
  },
  {
    id: "lead-hip-internal-rotation",
    title: "Lead Hip Internal Rotation",
    column: "/Calc/Hip/Lead/InternalExternal X",
    markerTime: 2.347,
    markerValue: 10.437,
    unit: "deg",
  },
  {
    id: "lead-hip-external-rotation",
    title: "Lead Hip External Rotation",
    column: "/Calc/Hip/Lead/InternalExternal X",
    markerTime: 2.231,
    markerValue: -12.369,
    unit: "deg",
  },
  {
    id: "torso-tilt-during-load-phase",
    title: "Torso Tilt During Load Phase",
    column: "/Calc/Trunk/Tilt/ForwardsBackwards X",
    markerTime: 1.997,
    markerValue: 5.627,
    unit: "deg",
  },
  {
    id: "torso-extension-during-rotation-and-blocking-phase",
    title: "Torso Extension During Rotation And Blocking Phase",
    // The legacy PDF graph for this section points to dominant shoulder horizontal position.
    // Keep that mapping so the rebuilt graph follows the report reference marker.
    column: "/Calc/Shoulder/Dominant/Horizontal X",
    markerTime: 1.977,
    markerValue: -29.018,
    unit: "deg",
  },
  {
    id: "right-shoulder-horizontal-abduction-during-loading-phase",
    title: "Right Shoulder Horizontal Abduction During Loading Phase",
    column: "/Calc/Shoulder/Dominant/Horizontal X",
    markerTime: 1.977,
    markerValue: -29.018,
    unit: "deg",
  },
  {
    id: "right-shoulder-rotation-unloading-phase",
    title: "Right Shoulder Rotation Unloading Phase",
    column: "/Calc/Shoulder/Dominant/Rotation X",
    markerTime: 2.277,
    markerValue: -12.482,
    unit: "deg",
  },
  {
    id: "lateral-pelvic-tilt",
    title: "Lateral Pelvic Tilt",
    column: "/Calc/Trunk/Tilt/LeftRight X",
    markerTime: 2.333,
    markerValue: -22.506,
    unit: "deg",
  },
  {
    id: "center-of-gravity-z",
    title: "Center Of Gravity Z",
    column: "/Calc/CenterOfGravity/Z X",
    markerTime: 2.25,
    markerValue: 0.565,
    unit: "m",
  },
];

const inputPath = process.argv[2] ?? DEFAULT_INPUT;
const outputPath = process.argv[3] ?? DEFAULT_OUTPUT;

function toNumber(value) {
  if (value && typeof value === "object") {
    if ("result" in value) return toNumber(value.result);
    if ("text" in value) return toNumber(value.text);
    if ("richText" in value) return toNumber(value.richText.map((part) => part.text).join(""));
  }
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.trim().replace(/,/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
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

function movingAverage(values, windowSize = 9) {
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

function downsampleSeries(rows, target = 81) {
  if (rows.length <= target) return rows;
  return Array.from({ length: target }, (_, index) => {
    const sourceIndex = Math.round((index / (target - 1)) * (rows.length - 1));
    return rows[sourceIndex];
  });
}

function normalizeSeries(values) {
  const max = Math.max(...values.map((value) => Math.abs(value)), 1);
  return values.map((value) => (Math.abs(value) / max) * 100);
}

function angularVelocityMagnitude(values) {
  // Keep sequence chart values tied directly to workbook cells.
  // Smoothing here made tooltips drift from the PDF/XLSX reference values.
  return values.map((value) => Math.abs(value));
}

function maxAbs(values) {
  return values.reduce(
    (best, value, index) => (Math.abs(value) > Math.abs(best.value) ? { value, index } : best),
    { value: 0, index: 0 },
  );
}

function maxAbsBetween(values, startIndex, endIndex) {
  let best = { value: 0, index: startIndex };
  for (let index = startIndex; index <= endIndex; index += 1) {
    const value = values[index] ?? 0;
    if (Math.abs(value) > Math.abs(best.value)) best = { value, index };
  }
  return best;
}

function isLocalMaximum(values, index, radius = 2) {
  const value = Math.abs(values[index] ?? 0);
  for (let offset = -radius; offset <= radius; offset += 1) {
    if (offset === 0) continue;
    const neighbor = values[index + offset];
    if (neighbor === undefined) return false;
    if (Math.abs(neighbor) > value) return false;
  }
  return true;
}

// Pelvis velocity often has a late capture artifact; use the first major local peak.
function firstMajorPeakBetween(values, startIndex, endIndex, { radius = 2, minRatio = 0.5 } = {}) {
  const global = maxAbsBetween(values, startIndex, endIndex);
  const threshold = Math.abs(global.value) * minRatio;

  for (let index = startIndex + radius; index <= endIndex - radius; index += 1) {
    const value = values[index] ?? 0;
    if (Math.abs(value) < threshold) continue;
    if (isLocalMaximum(values, index, radius)) return { value, index };
  }

  return global;
}

function range(values) {
  return Math.max(...values) - Math.min(...values);
}

function valueAt(values, index) {
  return Number.isFinite(values[index]) ? values[index] : null;
}

function formatDegrees(value) {
  return value === null ? "Data Pending" : `${value.toFixed(1)}°`;
}

function formatCentimeters(value) {
  return value === null ? "Data Pending" : `${value.toFixed(1)} cm`;
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
  const sheets = await readWorkbook(workbookPath);
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
    if (time !== null) records.push(record);
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
    shoulderHipSeparation: findColumn(headers, ["/Calc/Trunk/Separation X"]),
    torsoRotation: findColumn(headers, ["/Calc/Shoulder/Twist X"]),
    leadHipInternalRotation: findColumn(headers, ["/Calc/Hip/Lead/InternalExternal X"]),
    torsoLateralFlexion: findColumn(headers, ["/Calc/Trunk/Tilt/LeftRight X"]),
    rearShoulderLoading: findColumn(headers, ["/Calc/Shoulder/Dominant/Horizontal X"]),
    centerOfGravityX: findColumn(headers, ["/Calc/CenterOfGravity/X X"]),
    pelvisVelocity: findColumn(headers, ["/Calc/Pelvis/Twist/Velocity X"]),
    torsoVelocity: findColumn(headers, ["/Calc/Shoulder/Twist/Velocity X"]),
    elbowVelocity: findColumn(headers, ["/Calc/Elbow/Dominant/FlexionExtension/Velocity X"]),
    wristAngularVelocity: findColumn(headers, ["/Calc/Wrist/Dominant/FlexionExtension/Velocity X"]),
    wristVelocityX: findColumn(headers, ["/Calc/Wrist/Dominant/VelocityX X"]),
    wristVelocityY: findColumn(headers, ["/Calc/Wrist/Dominant/VelocityY X"]),
    wristVelocityZ: findColumn(headers, ["/Calc/Wrist/Dominant/VelocityZ X"]),
  };

  const missingColumns = Object.entries(matches)
    .filter(([, column]) => !column)
    .map(([key]) => key);

  const series = (column) => records.map((record) => (column ? record[column] ?? 0 : 0));
  const pelvisVelocity = angularVelocityMagnitude(series(matches.pelvisVelocity));
  const torsoVelocity = angularVelocityMagnitude(series(matches.torsoVelocity));
  const elbowVelocity = angularVelocityMagnitude(series(matches.elbowVelocity));
  const wristAngularVelocity = angularVelocityMagnitude(series(matches.wristAngularVelocity));
  const wristSpeed = movingAverage(
    normalizeSeries(
      records.map((record) => {
        const x = matches.wristVelocityX ? record[matches.wristVelocityX] ?? 0 : 0;
        const y = matches.wristVelocityY ? record[matches.wristVelocityY] ?? 0 : 0;
        const z = matches.wristVelocityZ ? record[matches.wristVelocityZ] ?? 0 : 0;
        return Math.hypot(x, y, z);
      }),
    ),
  );

  const centralStart = Math.floor(records.length * 0.1);
  const centralEnd = Math.ceil(records.length * 0.9);
  // Human review: the workbook does not include contact labels, so peak wrist speed
  // inside the central 80% of the capture is used as a repeatable impact proxy.
  const impactProxy = maxAbsBetween(wristSpeed, centralStart, centralEnd);
  const sampleInterval = duration / Math.max(records.length - 1, 1);
  const preImpactFrames = Math.round(0.45 / sampleInterval);
  const postImpactFrames = Math.round(0.42 / sampleInterval);
  const chartStart = Math.max(0, impactProxy.index - preImpactFrames);
  const chartEnd = Math.min(records.length - 1, impactProxy.index + postImpactFrames);
  const peakPelvis = firstMajorPeakBetween(pelvisVelocity, chartStart, chartEnd);
  const peakTorso = maxAbsBetween(torsoVelocity, chartStart, chartEnd);
  const peakElbow = maxAbsBetween(elbowVelocity, chartStart, chartEnd);

  const chartRows = records.slice(chartStart, chartEnd + 1)
    .map((_, offset) => {
      const index = chartStart + offset;
      return {
        time: timeValues[index],
        pelvis: pelvisVelocity[index],
        torso: torsoVelocity[index],
        elbow: elbowVelocity[index],
      };
    })
    .map((point) => ({
    time: Number(point.time.toFixed(3)),
    pelvis: Number(point.pelvis.toFixed(1)),
    torso: Number(point.torso.toFixed(1)),
    elbow: Number(point.elbow.toFixed(1)),
  }));

  const metrics = [];
  const shoulderHip = matches.shoulderHipSeparation ? series(matches.shoulderHipSeparation) : null;
  if (shoulderHip) {
    const peak = maxAbs(shoulderHip);
    metrics.push(
      metricFromColumn({
        key: "shoulder-hip-separation",
        eyebrow: "Peak",
        name: "Shoulder-Hip Separation",
        value: peak.value,
        sparkValues: shoulderHip,
        finding: `Peak trunk separation in the workbook is ${formatDegrees(peak.value)} at ${(normalizedTime[peak.index] * 100).toFixed(0)}% of the capture.`,
        whyItMatters: "Separation describes how the pelvis and upper trunk are organizing rotational stretch before delivery.",
        trainingFocus: "Use as a measured reference point after confirming the lab's positive/negative convention.",
        sourceColumns: [matches.shoulderHipSeparation],
        reviewNote: "Human confirmation needed for sign convention and preferred event window.",
      }),
    );
  } else {
    metrics.push(metricPending("Shoulder-Hip Separation", "Peak", "/Calc/Trunk/Separation X", "Separation is a primary rotational sequencing marker."));
  }

  const torsoRotation = matches.torsoRotation ? series(matches.torsoRotation) : null;
  if (torsoRotation) {
    metrics.push(
      metricFromColumn({
        key: "torso-rotation",
        eyebrow: "Total ROM",
        name: "Torso Rotation",
        value: range(torsoRotation),
        sparkValues: torsoRotation,
        finding: `Shoulder twist range across the processed capture is ${formatDegrees(range(torsoRotation))}.`,
        whyItMatters: "Torso rotation range is a practical proxy for the rotational movement available to transfer into the barrel.",
        trainingFocus: "Review against the intended capture window before using it as a normative grade.",
        sourceColumns: [matches.torsoRotation],
        reviewNote: "Workbook does not label load, foot plant, or contact events, so this uses the full processed capture.",
      }),
    );
  } else {
    metrics.push(metricPending("Torso Rotation", "Total ROM", "/Calc/Shoulder/Twist X", "Torso rotation helps describe the rotational range feeding the swing."));
  }

  const leadHipIR = matches.leadHipInternalRotation ? series(matches.leadHipInternalRotation) : null;
  if (leadHipIR) {
    const value = valueAt(leadHipIR, impactProxy.index);
    metrics.push(
      metricFromColumn({
        key: "lead-hip-internal-rotation",
        eyebrow: "Impact Proxy",
        name: "Lead Hip Internal Rotation",
        value,
        sparkValues: leadHipIR,
        finding: `Lead hip internal/external rotation is ${formatDegrees(value)} at the wrist-speed impact proxy.`,
        whyItMatters: "Lead-hip rotation helps indicate how the front side is accepting and redirecting force.",
        trainingFocus: "Confirm axis orientation before assigning a performance grade.",
        sourceColumns: [matches.leadHipInternalRotation],
        reviewNote: "Uses peak dominant-wrist speed as an impact proxy because the workbook has no contact event marker.",
      }),
    );
  } else {
    metrics.push(metricPending("Lead Hip Internal Rotation", "Impact Proxy", "/Calc/Hip/Lead/InternalExternal X", "Lead hip rotation informs front-side transfer."));
  }

  const torsoLateralFlexion = matches.torsoLateralFlexion ? series(matches.torsoLateralFlexion) : null;
  if (torsoLateralFlexion) {
    const value = valueAt(torsoLateralFlexion, impactProxy.index);
    metrics.push(
      metricFromColumn({
        key: "torso-lateral-flexion",
        eyebrow: "Impact Proxy",
        name: "Torso Lateral Flexion",
        value,
        sparkValues: torsoLateralFlexion,
        finding: `Trunk left/right tilt is ${formatDegrees(value)} at the wrist-speed impact proxy.`,
        whyItMatters: "Lateral trunk position helps describe posture through the delivery window.",
        trainingFocus: "Review with video/contact timing before converting this to a coaching conclusion.",
        sourceColumns: [matches.torsoLateralFlexion],
        reviewNote: "Left/right sign direction requires human confirmation.",
      }),
    );
  } else {
    metrics.push(metricPending("Torso Lateral Flexion", "Impact Proxy", "/Calc/Trunk/Tilt/LeftRight X", "Torso tilt helps describe posture through contact."));
  }

  const rearShoulderLoading = matches.rearShoulderLoading ? series(matches.rearShoulderLoading) : null;
  if (rearShoulderLoading) {
    const preImpact = rearShoulderLoading.slice(0, Math.max(impactProxy.index + 1, 1));
    const peak = maxAbs(preImpact);
    metrics.push(
      metricFromColumn({
        key: "rear-shoulder-loading",
        eyebrow: "Pre-Impact",
        name: "Rear Shoulder Loading",
        value: peak.value,
        sparkValues: rearShoulderLoading,
        finding: `Peak dominant-shoulder horizontal angle before the impact proxy is ${formatDegrees(peak.value)}.`,
        whyItMatters: "Rear-shoulder position helps describe how the upper body stores and releases into the swing.",
        trainingFocus: "Confirm whether dominant shoulder maps to rear shoulder for this capture setup.",
        sourceColumns: [matches.rearShoulderLoading],
        reviewNote: "Dominant-side shoulder is used as the rear-shoulder proxy and needs lab confirmation.",
      }),
    );
  } else {
    metrics.push(metricPending("Rear Shoulder Loading", "Pre-Impact", "/Calc/Shoulder/Dominant/Horizontal X", "Rear-shoulder loading helps describe upper-body preparation."));
  }

  const centerOfGravityX = matches.centerOfGravityX ? series(matches.centerOfGravityX) : null;
  if (centerOfGravityX) {
    const displacementMeters = valueAt(centerOfGravityX, impactProxy.index) - centerOfGravityX[0];
    metrics.push(
      metricFromColumn({
        key: "center-of-gravity",
        eyebrow: "Drift",
        name: "Center of Gravity",
        value: displacementMeters * 100,
        sparkValues: centerOfGravityX.map((value) => (value - centerOfGravityX[0]) * 100),
        finding: `Center of gravity X changes ${formatCentimeters(displacementMeters * 100)} from first frame to the wrist-speed impact proxy.`,
        whyItMatters: "CoG drift helps describe how the athlete moves mass into the hitting window.",
        trainingFocus: "Confirm global X direction and units before interpreting forward/backward drift.",
        sourceColumns: [matches.centerOfGravityX],
        reviewNote: "Assumes CenterOfGravity/X is in meters and converts displacement to centimeters.",
        formatter: formatCentimeters,
      }),
    );
  } else {
    metrics.push(metricPending("Center of Gravity", "Drift", "/Calc/CenterOfGravity/X X", "CoG drift helps describe mass transfer."));
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
    const markerIndex = nearestIndex(timeValues, spec.markerTime);
    const rawAtMarker = rawValues[markerIndex] ?? 0;
    const flippedAtMarker = -rawAtMarker;
    const shouldFlip = Math.abs(flippedAtMarker - spec.markerValue) < Math.abs(rawAtMarker - spec.markerValue);
    const signedValues = shouldFlip ? rawValues.map((value) => -value) : rawValues;
    const valueOffset = spec.markerValue - (signedValues[markerIndex] ?? 0);

    // The legacy PDF graph marker is the client-approved reference point.
    // Use the workbook series shape, then align its sign/offset to the PDF marker value.
    const alignedValues = signedValues.map((value) => value + valueOffset);
    const smoothedValues = movingAverage(alignedValues, spec.unit === "deg/s" ? 3 : 5);
    const graphRows = downsampleSeries(
      records.map((_, index) => ({
        time: timeValues[index],
        value: smoothedValues[index],
      })),
      180,
    ).map((point) => ({
      time: Number(point.time.toFixed(3)),
      value: Number(point.value.toFixed(3)),
    }));

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
      notes: "Raw Data row 1 contains headers. Metadata/sample-rate rows are skipped before processing frame data.",
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
      impactProxy: {
        method: "Peak smoothed dominant-wrist speed within central 80% of capture",
        frameIndex: impactProxy.index,
        normalizedTime: Number(normalizedTime[impactProxy.index].toFixed(3)),
      },
      chartWindow: {
        startFrameIndex: chartStart,
        endFrameIndex: chartEnd,
        frameCount: chartEnd - chartStart + 1,
      },
    },
    chart: {
      title: "Angular Velocity · Workbook Mocap",
      lines: [
        { key: "pelvis", label: "Pelvis Twist", color: CHART_COLORS.pelvis },
        { key: "torso", label: "Torso Twist", color: CHART_COLORS.torso },
        { key: "elbow", label: "Dominant Elbow Flexion Extension", color: CHART_COLORS.elbow },
      ],
      markers: [
        { label: "Peak Pelvis", x: CONFIRMED_SEQUENCE_PEAK_TIMES_SECONDS.pelvis, color: CHART_COLORS.pelvis },
        { label: "Peak Torso", x: CONFIRMED_SEQUENCE_PEAK_TIMES_SECONDS.torso, color: CHART_COLORS.torso },
        { label: "Peak Elbow", x: Number(timeValues[peakElbow.index].toFixed(3)), color: CHART_COLORS.elbow },
      ].sort((a, b) => a.x - b.x),
      data: chartRows,
    },
    peaks: [
      { label: "Pelvis", value: `${Math.round(peakPelvis.value)}°/s` },
      { label: "Torso", value: `${Math.round(peakTorso.value)}°/s` },
      { label: "Elbow Flexion Extension", value: `${Math.round(peakElbow.value)}°/s` },
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
