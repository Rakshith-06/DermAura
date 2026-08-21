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
    return { badge: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' };
  if (l.includes('MODERATE') || l.includes('MEDIUM'))
    return { badge: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' };
  return { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };
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
    <div className="mx-4 mt-3 rounded-2xl border border-emerald-300 bg-emerald-50/40 shadow-xs overflow-hidden">

      {/* ── Banner Header ─────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 bg-emerald-100/80 border-b border-emerald-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-emerald-700 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
            🤖 SYSTEM AUTOMATION — Auto-Attached Patient Diagnostics
          </span>
          <span className="px-2 py-0.5 bg-emerald-600 border border-emerald-700 rounded-full text-[9px] font-mono text-white font-bold animate-pulse">
            NEW
          </span>
        </div>
        <button
          onClick={handleDismiss}
          title="Mark as reviewed & dismiss"
          className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-2">

        {/* ── AI DERMSCAN SECTION ─────────────────────────────────────────── */}
        {dermScanData && (
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
            {/* Section header (always visible) */}
            <button
              onClick={() => setScanOpen(o => !o)}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-stone-50 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Scan className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-bold text-stone-900">AI DermScan Report</span>
                {/* Severity badge */}
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${scanSeverityStyle.badge}`}>
                  {dermScanData.severity || 'Pending'}
                </span>
                {/* Confidence chip */}
                {dermScanData.confidence && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    {dermScanData.confidence} confidence
                  </span>
                )}
              </div>
              {scanOpen
                ? <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                : <ChevronDown className="w-3.5 h-3.5 text-stone-500" />}
            </button>

            {/* Expandable body */}
            {scanOpen && (
              <div className="px-3 pb-3 space-y-3 border-t border-stone-100">

                {/* Condition + Area */}
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200">
                    <span className="text-[9px] font-mono text-stone-500 uppercase font-bold block">Detected Condition</span>
                    <span className="text-xs font-bold text-stone-900 mt-0.5 block">{dermScanData.condition || '—'}</span>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200">
                    <span className="text-[9px] font-mono text-stone-500 uppercase font-bold block">Affected Region</span>
                    <span className="text-xs font-bold text-emerald-700 mt-0.5 block">{dermScanData.affectedArea || '—'}</span>
                  </div>
                </div>

                {/* Scan thumbnail + overlay toggle */}
                {dermScanData.scanImageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-stone-200 cursor-pointer group"
                    onClick={() => setImgOverlay(true)}>
                    <img
                      src={dermScanData.scanImageUrl}
                      alt="Scan"
                      className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Eye className="w-6 h-6 text-white" />
                      <span className="text-white text-xs font-bold ml-1">View High-Res</span>
                    </div>
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-stone-900/80 text-white text-[9px] font-mono rounded-full border border-stone-700">
                      AI Scan Thumbnail
                    </span>
                  </div>
                )}

                {/* Fullscreen overlay */}
                {imgOverlay && dermScanData.scanImageUrl && (
                  <div
                    className="fixed inset-0 z-[999] bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-6"
                    onClick={() => setImgOverlay(false)}
                  >
                    <div className="relative max-w-2xl w-full">
                      <img src={dermScanData.scanImageUrl} alt="Scan full" className="w-full rounded-2xl shadow-2xl" />
                      <button
                        className="absolute top-3 right-3 p-2 bg-stone-900/80 rounded-xl text-white hover:bg-rose-900 transition-all"
                        onClick={() => setImgOverlay(false)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-3 left-3 px-3 py-1 bg-stone-900/80 text-emerald-300 text-[10px] font-mono rounded-full border border-stone-700">
                        {dermScanData.condition} • {dermScanData.confidence}
                      </span>
                    </div>
                  </div>
                )}

                {/* AI Summary */}
                {dermScanData.summary && (
                  <p className="text-[11px] text-stone-700 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                    {dermScanData.summary}
                  </p>
                )}

                {/* AI Recommendations */}
                {dermScanData.recommendations?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-stone-500 uppercase font-bold">AI Recommendations</span>
                    {dermScanData.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start space-x-2 text-[11px] text-stone-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
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
            <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
              <button
                onClick={() => setStressOpen(o => !o)}
                className="w-full px-3 py-2 flex items-center justify-between hover:bg-stone-50 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <HeartPulse className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-stone-900">Stress & Cortisol Analysis</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${stressSeverityStyle.badge}`}>
                    {cortisolIcon(cortisolRisk)} {cortisolRisk} RISK
                  </span>
                  <span className="text-[9px] font-mono text-stone-500 font-bold">
                    {pct}% score
                  </span>
                </div>
                {stressOpen
                  ? <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                  : <ChevronDown className="w-3.5 h-3.5 text-stone-500" />}
              </button>

              {stressOpen && (
                <div className="px-3 pb-3 space-y-3 border-t border-stone-100 pt-2">

                  {/* Metric cards */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Cortisol */}
                    <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200 text-center">
                      <Brain className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                      <span className="text-[9px] font-mono text-stone-500 font-bold block">Cortisol Level</span>
                      <span className={`text-[10px] font-bold block mt-0.5 ${cortisolRisk === 'HIGH' || cortisolRisk === 'CRITICAL' ? 'text-rose-700' : cortisolRisk === 'MODERATE' ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {cortisolRisk}
                      </span>
                    </div>
                    {/* HRV */}
                    <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200 text-center">
                      <Activity className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                      <span className="text-[9px] font-mono text-stone-500 font-bold block">HRV Analysis</span>
                      <span className="text-[10px] font-bold text-stone-900 block mt-0.5 leading-tight">
                        {hrv.split('(')[0].trim()}
                      </span>
                    </div>
                    {/* Score */}
                    <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200 text-center">
                      <TrendingUp className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                      <span className="text-[9px] font-mono text-stone-500 font-bold block">Stress Score</span>
                      <span className="text-[10px] font-bold text-amber-800 block mt-0.5">
                        {rd.score || stressData.score || 0}/{rd.maxPts || stressData.maxPts || 20}
                      </span>
                    </div>
                  </div>

                  {/* Stress gauge bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-stone-500 font-bold">
                      <span>Cortisol Stress Index</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${pct >= 65 ? 'bg-gradient-to-r from-rose-500 to-rose-400' : pct >= 30 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Skin-stress correlation */}
                  <div className="flex items-start space-x-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                    <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-mono text-stone-500 uppercase font-bold block">Skin-Stress Correlation</span>
                      <span className="text-[11px] text-stone-700">{skinCorr}</span>
                    </div>
                  </div>

                  {/* Clinical summary */}
                  {(rd.summary || stressData.summary) && (
                    <p className="text-[11px] text-stone-700 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      {rd.summary || stressData.summary}
                    </p>
                  )}

                  {/* Doctor recommendations */}
                  {(rd.recommendations || stressData.recommendations)?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-stone-500 uppercase font-bold">Clinical Recommendations</span>
                      {(rd.recommendations || stressData.recommendations).map((r, i) => (
                        <div key={i} className="flex items-start space-x-2 text-[11px] text-stone-700">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
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
          <span className="text-[9px] font-mono text-stone-500 font-semibold">
            Patient: {patientName} • Auto-routed by DermAura System
          </span>
          <button
            onClick={handleDismiss}
            className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 transition-all cursor-pointer"
          >
            <Eye className="w-3 h-3 text-emerald-600" />
            <span>Mark Reviewed & Dismiss</span>
          </button>
        </div>
      </div>
    </div>
  );
}
