"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MetricTimelineChart from "@/components/MetricTimelineChart";
import ReportSection from "@/components/ReportSection";
import SectionNav from "@/components/SectionNav";
import SequenceChart from "@/components/SequenceChart";
import {
  hittingSection,
  movementSection,
  navItems,
  reportMeta,
  sectionCards,
  throwingSection,
  type MetricTimelineGraph,
} from "@/data/reportData";
import { cn } from "@/lib/utils";

type MocapPdfReport = typeof hittingSection.report;
type MocapPdfSection = (typeof hittingSection.report.sections)[number];
type MovementReasoningSectionData = (typeof movementSection.report.sections)[number];

/** Matches `scroll-margin-top` on sections in globals.css */
const HEADER_ACTIVE_LINE = 112;

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;

  const anchor = element.querySelector<HTMLElement>("[data-section-anchor]") ?? element;
  const top = anchor.getBoundingClientRect().top + window.scrollY - HEADER_ACTIVE_LINE;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

function getActiveSectionId(nav: typeof navItems): string {
  let activeId = nav[0]?.id ?? "overview";

  for (const item of nav) {
    const section = document.getElementById(item.id);
    if (!section) continue;

    const anchor = section.querySelector<HTMLElement>("[data-section-anchor]") ?? section;
    if (anchor.getBoundingClientRect().top <= HEADER_ACTIVE_LINE) {
      activeId = item.id;
    }
  }

  return activeId;
}

function resultClasses(result: string) {
  if (result === "Pass") return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  if (result === "Fail") return "border-sequence-orange/35 bg-sequence-orange/10 text-sequence-orange";
  if (result === "Needs Review") return "border-amber-300/30 bg-amber-300/10 text-amber-200";
  return "border-zinc-500/25 bg-zinc-500/10 text-zinc-500";
}

function ResultPill({ value }: { value: string }) {
  return (
    <span className={cn("inline-flex w-fit rounded-sm border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]", resultClasses(value))}>
      {value}
    </span>
  );
}

function ScreeningDetail({ rows }: { rows: typeof movementSection.screeningDetail }) {
  const groups = ["Spine / Trunk", "Hip", "Shoulder", "Lower Body"] as const;

  return (
    <div className="report-panel print-break-avoid p-6 md:p-8">
      <p className="mb-7 border-b border-white/10 pb-5 text-xs font-semibold uppercase tracking-[0.24em] text-sequence-orange">
        Screening
      </p>
      <div className="grid gap-7">
        {groups.map((group) => (
          <div key={group}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">{group}</p>
            <div className="overflow-hidden rounded-surface border border-white/10">
              <div className="grid min-w-[520px] grid-cols-[1.35fr_0.55fr_0.55fr] border-b border-white/10 bg-white/[0.025] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                <span>Test</span>
                <span>Right</span>
                <span>Left</span>
              </div>
              {rows
                .filter((row) => row.group === group)
                .map((row) => (
                  <div
                    key={`${row.group}-${row.test}`}
                    className="grid min-w-[520px] grid-cols-[1.35fr_0.55fr_0.55fr] items-center gap-3 border-b border-white/10 px-4 py-4 text-sm last:border-b-0"
                  >
                    <p className="font-medium text-zinc-200">{row.test}</p>
                    {row.note ? (
                      <p className="col-span-2 text-center text-sm font-medium uppercase tracking-[0.14em] text-zinc-300">{row.note}</p>
                    ) : (
                      <>
                        <ResultPill value={row.right ?? "N/A"} />
                        <ResultPill value={row.left ?? "N/A"} />
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MovementReasoningSection({
  section,
  index,
}: {
  section: MovementReasoningSectionData;
  index: number;
}) {
  return (
    <article className="report-panel print-break-avoid p-6 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(280px,0.36fr)_minmax(0,1fr)] lg:gap-12">
        <div className="border-b border-white/10 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">{String(index + 1).padStart(2, "0")}</p>
          <h3 className="mt-5 max-w-[320px] break-words text-2xl font-semibold leading-tight tracking-[-0.03em] text-white md:text-3xl">
            {section.title}
          </h3>
        </div>
        <div className="space-y-6 text-base leading-7 text-zinc-300 md:text-lg md:leading-8">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}

function MocapReportFindings({ report }: { report: MocapPdfReport }) {
  return (
    <div className="report-panel print-break-avoid p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sequence-orange">{report.findings.title}</p>
      <div className="mt-7 max-w-5xl space-y-5 text-lg leading-8 text-zinc-300">
        {report.findings.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-8 grid gap-5 border-t border-white/10 pt-6 lg:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Optimal Kinematic Sequence</p>
          <p className="mt-3 text-xl font-medium text-white">{report.findings.optimalSequence}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Gavin's Kinematic Sequence</p>
          <p className="mt-3 text-xl font-medium text-white">{report.findings.athleteSequence}</p>
        </div>
      </div>
    </div>
  );
}

function MocapMediaPanel({
  section,
  graph,
  reverseBorder,
}: {
  section: MocapPdfSection;
  graph?: MetricTimelineGraph;
  reverseBorder?: boolean;
}) {
  return (
    <div className={cn("grid gap-4 border-t border-white/10 bg-black/35 p-4 lg:border-t-0", reverseBorder ? "lg:border-r" : "lg:border-l")}>
      {section.image ? (
        <div className="relative aspect-[19/12] w-full overflow-hidden rounded-surface border border-white/10 bg-black">
          <Image src={section.image} alt="" fill sizes="(max-width: 1024px) 100vw, 500px" className="object-contain" />
        </div>
      ) : null}
      <MetricTimelineChart graph={graph} />
    </div>
  );
}

function MocapNarrativeSection({
  section,
  index,
  graph,
}: {
  section: MocapPdfSection;
  index: number;
  graph?: MetricTimelineGraph;
}) {
  const imageFirst = index % 2 === 1;

  return (
    <article className="report-panel print-break-avoid overflow-hidden">
      <div className={cn("grid gap-0 lg:grid-cols-[minmax(0,1fr)_500px]", imageFirst && "lg:grid-cols-[500px_minmax(0,1fr)]")}>
        {imageFirst ? <MocapMediaPanel section={section} graph={graph} reverseBorder /> : null}

        <div className="p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">{String(index + 1).padStart(2, "0")}</p>
          <h3 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">{section.title}</h3>
          <div className="mt-7 space-y-5 text-base leading-7 text-zinc-300 md:text-lg md:leading-8">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        {!imageFirst ? <MocapMediaPanel section={section} graph={graph} /> : null}
      </div>
    </article>
  );
}

function MocapSuggestions({ report }: { report: MocapPdfReport }) {
  return (
    <div className="report-panel print-break-avoid p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sequence-orange">{report.suggestions.title}</p>
      <div className="mt-7 max-w-5xl space-y-5 text-lg leading-8 text-zinc-300">
        {report.suggestions.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("overview");

  const handleNavigate = (id: string) => {
    setActiveSection(id);
    scrollToSection(id);
  };

  useEffect(() => {
    const syncActiveSection = () => {
      const nextId = getActiveSectionId(navItems);
      setActiveSection((current) => (current === nextId ? current : nextId));
    };

    syncActiveSection();

    document.addEventListener("scroll", syncActiveSection, { passive: true, capture: true });
    window.addEventListener("resize", syncActiveSection);
    window.addEventListener("load", syncActiveSection);

    const resizeObserver = new ResizeObserver(syncActiveSection);
    navItems.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) resizeObserver.observe(section);
    });

    return () => {
      document.removeEventListener("scroll", syncActiveSection, { capture: true });
      window.removeEventListener("resize", syncActiveSection);
      window.removeEventListener("load", syncActiveSection);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <Header navItems={navItems} activeSection={activeSection} onNavigate={handleNavigate} />
      <main className="mx-auto w-full max-w-report px-5 pb-20 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <section id="overview" className="py-16 md:py-24">
          <div className="grid content-between gap-14 border-b border-white/10 pb-14">
            <div data-section-anchor>
              <h1 className="text-7xl font-semibold tracking-[-0.06em] text-white md:text-9xl">{reportMeta.athlete}</h1>
              <p className="mt-8 text-3xl font-medium tracking-[-0.03em] text-zinc-200 md:text-5xl">{reportMeta.title}</p>
            </div>
          </div>

          <div className="mt-10 md:mt-14">
            <SectionNav cards={sectionCards} onNavigate={handleNavigate} prominent />
          </div>
        </section>

        <ReportSection id="movement" eyebrow="01" title={movementSection.title}>
          <div className="grid gap-5">
            <ScreeningDetail rows={movementSection.screeningDetail} />

            {movementSection.report.sections.map((section, index) => (
              <MovementReasoningSection key={section.id} section={section} index={index} />
            ))}
            <SectionNav
              cards={[
                {
                  id: "hitting",
                  number: "Next",
                  title: "Hitting Motion Capture",
                  detail: "Continue into swing sequence and metric-by-metric report.",
                },
              ]}
              onNavigate={handleNavigate}
            />
          </div>
        </ReportSection>

        <ReportSection id="hitting" eyebrow="02" title={hittingSection.title}>
          <div className="grid gap-5">
            <MocapReportFindings report={hittingSection.report} />
            <SequenceChart chart={hittingSection.chart} />
            <div className="mt-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sequence-orange">{hittingSection.report.kpiHeading}</p>
                <h3 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white">Mocap Analysis</h3>
              </div>
              <div className="grid gap-5">
                {hittingSection.report.sections.map((section, index) => {
                  const graph = hittingSection.reportGraphs.find((item) => item.id === section.id);
                  return <MocapNarrativeSection key={section.id} section={section} index={index} graph={graph} />;
                })}
              </div>
            </div>
            <MocapSuggestions report={hittingSection.report} />
            <SectionNav
              compact
              cards={[
                {
                  id: "movement",
                  number: "Previous",
                  title: "Movement Assessment",
                  detail: "Return to readiness context.",
                },
                {
                  id: "throwing",
                  number: "Next",
                  title: "Throwing Motion Capture",
                  detail: "Review throwing transfer and durability indicators.",
                },
              ]}
              onNavigate={handleNavigate}
            />
          </div>
        </ReportSection>

        <ReportSection id="throwing" eyebrow="03" title={throwingSection.title}>
          <div className="grid gap-5">
            <MocapReportFindings report={throwingSection.report} />
            <SequenceChart chart={throwingSection.chart} />
            <div className="mt-8 grid gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sequence-orange">{throwingSection.report.kpiHeading}</p>
                <h3 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white">Mocap Analysis</h3>
              </div>
              <div className="grid gap-5">
                {throwingSection.report.sections.map((section, index) => {
                  const graph = throwingSection.reportGraphs.find((item) => item.id === section.id);
                  return <MocapNarrativeSection key={section.id} section={section} index={index} graph={graph} />;
                })}
              </div>
            </div>
            <MocapSuggestions report={throwingSection.report} />
            <SectionNav
              cards={[
                {
                  id: "hitting",
                  number: "Previous",
                  title: "Hitting Motion Capture",
                  detail: "Return to swing sequence and lead-side posting.",
                },
              ]}
              onNavigate={handleNavigate}
            />
          </div>
        </ReportSection>
      </main>
      <Footer />
    </>
  );
}
