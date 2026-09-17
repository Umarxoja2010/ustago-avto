import { useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
}) {
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const start = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 0 && !busy) start.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (start.current === null) return;
    const delta = e.touches[0].clientY - start.current;
    if (delta > 0) setPull(Math.min(delta * 0.45, 90));
  };
  const onTouchEnd = async () => {
    start.current = null;
    if (pull > 55) {
      setBusy(true);
      setPull(46);
      await onRefresh();
      setBusy(false);
    }
    setPull(0);
  };

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: pull }}
      >
        <Loader2
          className={cn("h-5 w-5 text-primary", busy && "animate-spin")}
          style={{ opacity: Math.min(pull / 55, 1), transform: `rotate(${pull * 4}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}
