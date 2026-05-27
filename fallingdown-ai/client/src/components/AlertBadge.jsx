import React from 'react';
import { Warning, ShieldCheck, Siren, SpeakerHigh } from '@phosphor-icons/react';

const AlertBadge = ({ status }) => {
  if (status === 'NORMAL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <ShieldCheck weight="fill" /> NORMAL
      </span>
    );
  }
  if (status === 'MODERATE FALL' || status === 'WARNING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
        <Warning weight="fill" /> MODERATE FALL
      </span>
    );
  }
  if (status === 'FALL DETECTED' || status === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse">
        <Siren weight="fill" /> FALL DETECTED
      </span>
    );
  }
  if (status === 'AUDIO DISTRESS') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
        <SpeakerHigh weight="fill" /> AUDIO DISTRESS
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
      UNKNOWN
    </span>
  );
};

export default AlertBadge;
