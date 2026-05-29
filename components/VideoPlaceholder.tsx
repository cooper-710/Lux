import { Play } from "lucide-react";

type VideoPlaceholderProps = {
  title?: string;
};

export default function VideoPlaceholder({ title = "Motion Capture Playback" }: VideoPlaceholderProps) {
  return (
    <div className="report-panel print-break-avoid relative min-h-[320px] overflow-hidden bg-[#0b0b0b]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-20 w-20 place-items-center rounded-surface border border-white/15 bg-black/35">
          <Play className="ml-1 h-8 w-8 text-zinc-300" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 border-t border-white/10 bg-black/35 px-6 py-5">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-300">{title}</p>
        <p className="text-right text-xs uppercase tracking-[0.18em] text-zinc-500">Video Integration Pending</p>
      </div>
    </div>
  );
}
