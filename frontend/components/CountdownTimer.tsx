'use client';

import { useState, useEffect } from 'react';

interface Props {
  endAt: string;
  onExpire?: () => void;
  compact?: boolean;
}

function computeRemaining(endAt: string) {
  const diff = Math.max(0, new Date(endAt).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    hours:   Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: diff === 0,
  };
}

export default function CountdownTimer({ endAt, onExpire, compact = false }: Props) {
  const [remaining, setRemaining] = useState(() => computeRemaining(endAt));

  useEffect(() => {
    if (remaining.expired) {
      onExpire?.();
      return;
    }
    const id = setInterval(() => {
      const next = computeRemaining(endAt);
      setRemaining(next);
      if (next.expired) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [endAt, onExpire, remaining.expired]);

  if (remaining.expired) {
    return (
      <span className="text-red-500 font-bold text-xs">
        Terminée
      </span>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  if (compact) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono font-bold text-xs text-shopee-orange">
        <span className="countdown-block">{pad(remaining.hours)}</span>
        <span className="text-gray-400">:</span>
        <span className="countdown-block">{pad(remaining.minutes)}</span>
        <span className="text-gray-400">:</span>
        <span className="countdown-block">{pad(remaining.seconds)}</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <TimeBlock value={pad(remaining.hours)} label="h" />
      <span className="text-white font-bold text-lg mb-3">:</span>
      <TimeBlock value={pad(remaining.minutes)} label="min" />
      <span className="text-white font-bold text-lg mb-3">:</span>
      <TimeBlock value={pad(remaining.seconds)} label="sec" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white text-shopee-orange font-extrabold text-xl w-12 h-12 flex items-center justify-center rounded-md shadow font-mono tabular-nums">
        {value}
      </div>
      <span className="text-white/70 text-[0.6rem] mt-0.5 uppercase tracking-wide">{label}</span>
    </div>
  );
}
