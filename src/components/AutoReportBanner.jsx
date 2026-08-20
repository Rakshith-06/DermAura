/**
 * AutoReportBanner.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Auto-Attached Diagnostics Drawer — Doctor's Clinical Chat Interface
 *
 * Renders a pinned card at the top of the doctor's chat view whenever a patient
 * generates a new AI DermScan or Stress Analyzer report.
 *
 * Data sources (in priority order):
 *   1. `reports` prop — passed from DoctorDashboard when API data is available.
 *   2. localStorage keys written by Dashboard.jsx on the patient side:
 *        - "dermaura_auto_scan_report"   (DermScan)
 *        - "dermaura_shared_stress_report" (Stress)
 *   3. Nothing — renders null cleanly if no reports exist.
 *
 * Props:
 *   reports         {object}   — { dermScan, stress } (optional, from API)
 *   patientName     {string}   — Display name of the patient
 *   onMarkReviewed  {function} — Called with (reportId, reportType) on dismiss
 */

import React, { useState, useEffect } from 'react';
import {
  Bot, Scan, HeartPulse, ChevronDown, ChevronUp,
  ShieldCheck, AlertTriangle, CheckCircle2, Eye,
  Activity, Zap, Brain, TrendingUp, X, ExternalLink
} from 'lucide-react';

// ── Severity colour mapping ───────────────────────────────────────────────────
const severityStyle = (level = '') => {
  const l = level.toUpperCase();
  if (l.includes('HIGH') || l.includes('SEVERE') || l.includes('CRITICAL'))
    return { badge: 'bg-rose-950 text-rose-300 border-rose-800', dot: 'bg-rose-400' };
  if (l.includes('MODERATE') || l.includes('MEDIUM'))
    return { badge: 'bg-amber-950 text-amber-300 border-amber-800', dot: 'bg-amber-400' };
  return { badge: 'bg-emerald-950 text-emerald-300 border-emerald-800', dot: 'bg-emerald-400' };
};

// ── Cortisol tier label → icon ────────────────────────────────────────────────
const cortisolIcon = (tier = '') => {
  if (['HIGH', 'CRITICAL'].includes(tier.toUpperCase())) return '🔴';
  if (tier.toUpperCase() === 'MODERATE') return '🟡';
  return '🟢';
};

export default function AutoReportBanner({ reports = {}, patientName = 'Patient', onMarkReviewed }) {

  // ── State ─────────────────────────────────────────────────────────────────
  const [dermScanData, setDermScanData] = useState(reports.dermScan || null);
  const [stressData,   setStressData]   = useState(reports.stress   || null);
  const [scanOpen,     setScanOpen]     = useState(true);
  const [stressOpen,   setStressOpen]   = useState(false);
  const [dismissed,    setDismissed]    = useState(false);
  const [imgOverlay,   setImgOverlay]   = useState(false);

  // ── Poll localStorage (demo-mode real-time sync) ──────────────────────────
  useEffect(() => {
    const sync = () => {
      try {
        // DermScan report
        const scanRaw = localStorage.getItem('dermaura_auto_scan_report');
        if (scanRaw) {
          const parsed = JSON.parse(scanRaw);
          setDermScanData(prev =>
            prev?.id === parsed.id ? prev : parsed
          );
        }
        // Stress report
        const stressRaw = localStorage.getItem('dermaura_shared_stress_report');
        if (stressRaw) {
          const parsed = JSON.parse(stressRaw);
          setStressData(prev =>
            prev?.id === parsed.id ? prev : parsed
          );
        }
      } catch (_) {}
    };

    sync();
    window.addEventListener('storage', sync);
    const t = setInterval(sync, 1500);
    return () => { window.removeEventListener('storage', sync); clearInterval(t); };
  }, []);

  // Sync incoming prop changes (when API data arrives)
  useEffect(() => {
    if (reports.dermScan) setDermScanData(reports.dermScan);
    if (reports.stress)   setStressData(reports.stress);
  }, [reports.dermScan, reports.stress]);

  // Nothing to show
  if (dismissed || (!dermScanData && !stressData)) return null;

  const scanSeverityStyle  = severityStyle(dermScanData?.severity || '');
  const stressSeverityStyle = severityStyle(stressData?.reportData?.cortisolRiskLevel || stressData?.category || '');

  const handleDismiss = () => {
    if (onMarkReviewed) {
      if (dermScanData?.id) onMarkReviewed(dermScanData.id, 'DERMSCAN');
      if (stressData?.id)   onMarkReviewed(stressData.id, 'STRESS');
    }
    setDismissed(true);
  };

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-indigo-700/60 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 shadow-2xl shadow-indigo-900/20 overflow-hidden">

      {/* ── Banner Header ─────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 bg-indigo-950/70 border-b border-indigo-800/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
            🤖 SYSTEM AUTOMATION — Auto-Attached Patient Diagnostics
          </span>
          <span className="px-2 py-0.5 bg-indigo-900 border border-indigo-700 rounded-full text-[9px] font-mono text-indigo-300 animate-pulse">
            NEW
          </span>
        </div>
        <button
          onClick={handleDismiss}
          title="Mark as reviewed & dismiss"
          className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-2">

        {/* ── AI DERMSCAN SECTION ─────────────────────────────────────────── */}
        {dermScanData && (
          <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 overflow-hidden">
            {/* Section header (always visible) */}
            <button
              onClick={() => setScanOpen(o => !o)}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-800/30 transition-all"
            >
              <div className="flex items-center space-x-2">
                <Scan className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span className="text-xs font-bold text-white">AI DermScan Report</span>
                {/* Severity badge */}
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${scanSeverityStyle.badge}`}>
                  {dermScanData.severity || 'Pending'}
                </span>
                {/* Confidence chip */}
                {dermScanData.confidence && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-teal-950 text-teal-300 border border-teal-800">
                    {dermScanData.confidence} confidence
                  </span>
                )}
              </div>
              {scanOpen
                ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {/* Expandable body */}
            {scanOpen && (
              <div className="px-3 pb-3 space-y-3 border-t border-slate-800/60">

                {/* Condition + Area */}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Detected Condition</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">{dermScanData.condition || '—'}</span>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Affected Region</span>
                    <span className="text-xs font-bold text-teal-300 mt-0.5 block">{dermScanData.affectedArea || '—'}</span>
                  </div>
                </div>

                {/* Scan thumbnail + overlay toggle */}
                {dermScanData.scanImageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 cursor-pointer group"
                    onClick={() => setImgOverlay(true)}>
                    <img
                      src={dermScanData.scanImageUrl}
                      alt="Scan"
                      className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Eye className="w-6 h-6 text-white" />
                      <span className="text-white text-xs font-bold ml-1">View High-Res</span>
                    </div>
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-slate-950/80 text-teal-300 text-[9px] font-mono rounded-full border border-teal-800">
                      AI Scan Thumbnail
                    </span>
                  </div>
                )}

                {/* Fullscreen overlay */}
                {imgOverlay && dermScanData.scanImageUrl && (
                  <div
                    className="fixed inset-0 z-[999] bg-slate-950/95 flex items-center justify-center p-6"
                    onClick={() => setImgOverlay(false)}
                  >
                    <div className="relative max-w-2xl w-full">
                      <img src={dermScanData.scanImageUrl} alt="Scan full" className="w-full rounded-2xl shadow-2xl" />
                      <button
                        className="absolute top-3 right-3 p-2 bg-slate-900/80 rounded-xl text-white hover:bg-rose-900 transition-all"
                        onClick={() => setImgOverlay(false)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-3 left-3 px-3 py-1 bg-slate-950/80 text-teal-300 text-[10px] font-mono rounded-full border border-teal-800">
                        {dermScanData.condition} • {dermScanData.confidence}
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Summary */}
                {dermScanData.summary && (
                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                    {dermScanData.summary}
                  </p>
                )}

                {/* AI Recommendations */}
                {dermScanData.recommendations?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">AI Recommendations</span>
                    {dermScanData.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start space-x-2 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-teal-400 flex-shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STRESS ANALYZER SECTION ─────────────────────────────────────── */}
        {stressData && (() => {
          const rd = stressData.reportData || stressData;
          const pct = rd.percentage || stressData.percentage || 0;
          const cortisolRisk = rd.cortisolRiskLevel || (pct >= 65 ? 'HIGH' : pct >= 30 ? 'MODERATE' : 'LOW');
          const hrv = rd.hrvIndicator || (pct >= 65 ? 'Significantly Reduced HRV' : 'Normal HRV');
          const skinCorr = rd.skinStressCorrelation || (pct >= 65 ? 'High correlation' : 'Low correlation');

          return (
            <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 overflow-hidden">
              <button
                onClick={() => setStressOpen(o => !o)}
                className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-800/30 transition-all"
              >
                <div className="flex items-center space-x-2">
                  <HeartPulse className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-white">Stress & Cortisol Analysis</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${stressSeverityStyle.badge}`}>
                    {cortisolIcon(cortisolRisk)} {cortisolRisk} RISK
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {pct}% score
                  </span>
                </div>
                {stressOpen
                  ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {stressOpen && (
                <div className="px-3 pb-3 space-y-3 border-t border-slate-800/60 pt-2">

                  {/* Metric cards */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Cortisol */}
                    <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800 text-center">
                      <Brain className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                      <span className="text-[9px] font-mono text-slate-500 block">Cortisol Level</span>
                      <span className={`text-[10px] font-bold block mt-0.5 ${cortisolRisk === 'HIGH' || cortisolRisk === 'CRITICAL' ? 'text-rose-300' : cortisolRisk === 'MODERATE' ? 'text-amber-300' : 'text-emerald-300'}`}>
                        {cortisolRisk}
                      </span>
                    </div>
                    {/* HRV */}
                    <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800 text-center">
                      <Activity className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                      <span className="text-[9px] font-mono text-slate-500 block">HRV Analysis</span>
                      <span className="text-[10px] font-bold text-indigo-300 block mt-0.5 leading-tight">
                        {hrv.split('(')[0].trim()}
                      </span>
                    </div>
                    {/* Score */}
                    <div className="bg-slate-900 rounded-xl p-2.5 border border-slate-800 text-center">
                      <TrendingUp className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <span className="text-[9px] font-mono text-slate-500 block">Stress Score</span>
                      <span className="text-[10px] font-bold text-amber-300 block mt-0.5">
                        {rd.score || stressData.score || 0}/{rd.maxPts || stressData.maxPts || 20}
                      </span>
                    </div>
                  </div>

                  {/* Stress gauge bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                      <span>Cortisol Stress Index</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${pct >= 65 ? 'bg-gradient-to-r from-rose-600 to-rose-400' : pct >= 30 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Skin-stress correlation */}
                  <div className="flex items-start space-x-2 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60">
                    <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">Skin-Stress Correlation</span>
                      <span className="text-[11px] text-slate-300">{skinCorr}</span>
                    </div>
                  </div>

                  {/* Clinical summary */}
                  {(rd.summary || stressData.summary) && (
                    <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                      {rd.summary || stressData.summary}
                    </p>
                  )}

                  {/* Doctor recommendations */}
                  {(rd.recommendations || stressData.recommendations)?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">Clinical Recommendations</span>
                      {(rd.recommendations || stressData.recommendations).map((r, i) => (
                        <div key={i} className="flex items-start space-x-2 text-[11px] text-slate-300">
                          <ShieldCheck className="w-3 h-3 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Footer action row ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[9px] font-mono text-slate-600">
            Patient: {patientName} • Auto-routed by DermAura System
          </span>
          <button
            onClick={handleDismiss}
            className="flex items-center space-x-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-200 transition-all"
          >
            <Eye className="w-3 h-3" />
            <span>Mark Reviewed & Dismiss</span>
          </button>
        </div>
      </div>
    </div>
  );
}
