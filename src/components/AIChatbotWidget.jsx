import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../api.js';
import { query50kCohortDataset } from '../utils/aiKnowledgeEngine.js';
import datasetIndex from '../../data/dermatology_ai_index.json';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Activity,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  Droplets,
  Wind,
  Brain,
  ChevronRight,
  Flame,
  Zap,
  Info
} from 'lucide-react';

export default function AIChatbotWidget({ isOpen = false, onClose = () => { } }) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'analyzer'
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: '👋 Hello! I am **DermaGuide**, your empathetic AI assistant specializing in scalp and facial health. My knowledge is rooted in our **50,000-patient empirical study** across urban and semi-urban India.\n\nTell me about your scalp or skin concerns today, or switch to the "50k Cohort Symptom Analyzer" tab to run an instant differential diagnosis!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Analyzer Form State
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [waterHardness, setWaterHardness] = useState('Hard (>300 ppm)');
  const [pollutionLevel, setPollutionLevel] = useState('High (PM2.5 > 100)');
  const [stressLevel, setStressLevel] = useState('High');
  const [otcSteroidMisuse, setOtcSteroidMisuse] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const symptomOptions = [
    'Pustules',
    'Perifollicular Erythema',
    'Tenderness',
    'Flaking',
    'Erythema',
    'Pruritus (Itching)',
    'Hairline Recession',
    'Crown Thinning',
    'Diffuse Thinning',
    'Comedones',
    'Papules',
    'Skin Peeling',
    'Melasma Patches',
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    const newMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE || 'http://localhost:5000'}/api/chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply || query50kCohortDataset(userText),
          matchedStats: data.matchedStats,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setIsTyping(false);
      // Instant Client-Side 50k Cohort Query Engine
      const reply = query50kCohortDataset(userText);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-resp-${Date.now()}`,
          sender: 'bot',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const toggleSymptom = (sym) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleRunAnalysis = async () => {
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom to run the cohort analysis!');
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch(`${API_BASE || 'http://localhost:5000'}/api/chatbot/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          waterHardness,
          pollutionLevel,
          stressLevel,
          otcSteroidMisuse,
        }),
      });
      const data = await res.json();
      setAnalyzing(false);
      setAnalysisResult(data);
    } catch (err) {
      setAnalyzing(false);
      // Dynamic Client-Side Computation from 50k dataset index
      const conditionScores = {};
      selectedSymptoms.forEach((sym) => {
        const cleanSym = sym.replace(' (Itching)', '');
        const matchMap = datasetIndex.symptomToConditionMap[cleanSym] || datasetIndex.symptomToConditionMap[sym] || {};
        Object.entries(matchMap).forEach(([cond, count]) => {
          conditionScores[cond] = (conditionScores[cond] || 0) + count;
        });
      });

      Object.keys(conditionScores).forEach((cond) => {
        let mult = 1.0;
        if (waterHardness.includes('Hard') && datasetIndex.riskFactorImpact?.hardWater?.[cond]) mult += 0.25;
        if (pollutionLevel.includes('High') && datasetIndex.riskFactorImpact?.highPollution?.[cond]) mult += 0.20;
        if (stressLevel === 'High' && datasetIndex.riskFactorImpact?.highStress?.[cond]) mult += 0.15;
        if (otcSteroidMisuse && datasetIndex.riskFactorImpact?.otcSteroidMisuse?.[cond]) mult += 0.35;
        conditionScores[cond] = Math.round(conditionScores[cond] * mult);
      });

      const totalScore = Object.values(conditionScores).reduce((a, b) => a + b, 0);
      const probabilities = Object.entries(conditionScores)
        .map(([condition, score]) => ({
          condition,
          percentage: totalScore > 0 ? Math.round((score / totalScore) * 100) : 0,
          cohortMatchCount: datasetIndex.conditionCounts[condition] || 0,
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);

      const primary = probabilities[0] || { condition: 'General Dermatosis', percentage: 70, cohortMatchCount: 5000 };

      setAnalysisResult({
        success: true,
        cohortSize: 50000,
        differentialDiagnosis: probabilities.length > 0 ? probabilities : [
          { condition: 'Seborrheic Dermatitis', percentage: 65, cohortMatchCount: 15188 },
          { condition: 'Acne Vulgaris', percentage: 25, cohortMatchCount: 13563 },
          { condition: 'Contact Dermatitis', percentage: 10, cohortMatchCount: 4389 },
        ],
        clinicalTriage: {
          urgencyLevel: otcSteroidMisuse ? 'URGENT_WARNING' : stressLevel === 'High' && waterHardness.includes('Hard') ? 'MODERATE_ELEVATED' : 'ROUTINE',
          triageAdvice: otcSteroidMisuse
            ? '⚠️ High risk of Steroid-Induced Rebound! Discontinue unprescribed OTC creams immediately and consult a dermatologist.'
            : 'Elevated flare risk due to Hard Water mineral deposits & Stress. Consider installing a water softener filter.',
          recommendedSpecialist: primary.condition.includes('Scalp') || primary.condition.includes('Alopecia') || primary.condition.includes('Telogen')
            ? 'Trichology & Scalp Specialist'
            : 'Facial Dermatologist',
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl h-[650px] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white tracking-wide">DermaGuide AI Assistant</h3>
                <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Cohort Intelligence
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">Trained on Indian Patient Records</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all ${activeTab === 'chat'
              ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
              : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
          >
            <Bot className="w-4 h-4" />
            <span>Interactive AI Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-all ${activeTab === 'analyzer'
              ? 'border-emerald-600 text-emerald-700 bg-white shadow-sm'
              : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
          >
            <Brain className="w-4 h-4" />
            <span>Cohort Symptom Analyzer</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col justify-between bg-stone-50/50 overflow-hidden">
            {/* Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-700 text-white shadow-sm'
                      }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
                      }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {msg.text ? msg.text.split(/(\*\*.*?\*\*)/g).map((part, idx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={idx} className="font-bold text-stone-900">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      }) : ''}
                    </div>

                    <span
                      className={`block text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-emerald-100' : 'text-stone-400'
                        }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center space-x-2 text-stone-400 text-xs italic p-2">
                  <Bot className="w-4 h-4 animate-bounce text-emerald-600" />
                  <span>Analyzing 50,000 patient records...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-2 bg-stone-100/70 border-t border-stone-200/80 flex items-center space-x-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider shrink-0">Quick Prompts:</span>
              <button
                onClick={() => {
                  setInputMsg('I have scalp itching and hair fall');
                  handleSendMessage();
                }}
                className="text-[11px] bg-white border border-stone-200 hover:border-emerald-500 text-stone-700 font-medium px-2.5 py-1 rounded-full shrink-0 shadow-2xs hover:text-emerald-700 transition-all cursor-pointer"
              >
                💇 Hair Fall & Itching
              </button>
              <button
                onClick={() => {
                  setInputMsg('How does Hard Water affect my scalp?');
                  handleSendMessage();
                }}
                className="text-[11px] bg-white border border-stone-200 hover:border-emerald-500 text-stone-700 font-medium px-2.5 py-1 rounded-full shrink-0 shadow-2xs hover:text-emerald-700 transition-all cursor-pointer"
              >
                💧 Hard Water Risk (&gt;300 ppm)
              </button>
              <button
                onClick={() => {
                  setInputMsg('Check OTC Steroid misuse danger');
                  handleSendMessage();
                }}
                className="text-[11px] bg-white border border-stone-200 hover:border-emerald-500 text-stone-700 font-medium px-2.5 py-1 rounded-full shrink-0 shadow-2xs hover:text-emerald-700 transition-all cursor-pointer"
              >
                💊 OTC Steroid Misuse Risk
              </button>
              <button
                onClick={() => {
                  setInputMsg('Facial acne and PM2.5 pollution');
                  handleSendMessage();
                }}
                className="text-[11px] bg-white border border-stone-200 hover:border-emerald-500 text-stone-700 font-medium px-2.5 py-1 rounded-full shrink-0 shadow-2xs hover:text-emerald-700 transition-all cursor-pointer"
              >
                🧴 PM2.5 Pollution & Acne
              </button>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-200 flex space-x-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ask about scalp flaking, hair fall, hard water, PM2.5 pollution..."
                className="flex-1 bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          /* Cohort Analyzer Tab */
          <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-white">
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                <span>Select Reported Symptoms</span>
                <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
                  Matches 50k Dataset
                </span>
              </h4>
              <div className="flex flex-wrap gap-2 mt-2.5">
                {symptomOptions.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      onClick={() => toggleSymptom(sym)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold shadow-sm'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                    >
                      {sym} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Environmental Selectors */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-stone-700 flex items-center space-x-1 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tap Water Hardness</span>
                </label>
                <select
                  value={waterHardness}
                  onChange={(e) => setWaterHardness(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 font-medium"
                >
                  <option value="Hard (>300 ppm)">Hard (&gt;300 ppm)</option>
                  <option value="Moderate (150-300 ppm)">Moderate (150-300 ppm)</option>
                  <option value="Soft (<150 ppm)">Soft (&lt;150 ppm)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 flex items-center space-x-1 mb-1">
                  <Wind className="w-3.5 h-3.5 text-slate-500" />
                  <span>Air Pollution Exposure</span>
                </label>
                <select
                  value={pollutionLevel}
                  onChange={(e) => setPollutionLevel(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2 font-medium"
                >
                  <option value="High (PM2.5 > 100)">High (PM2.5 &gt; 100)</option>
                  <option value="Moderate (PM2.5 50-100)">Moderate (PM2.5 50-100)</option>
                  <option value="Low (PM2.5 < 50)">Low (PM2.5 &lt; 50)</option>
                </select>
              </div>
            </div>

            {/* Steroid Checkbox */}
            <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 p-3 rounded-xl">
              <input
                type="checkbox"
                id="steroidCheck"
                checked={otcSteroidMisuse}
                onChange={(e) => setOtcSteroidMisuse(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-amber-300 focus:ring-emerald-500"
              />
              <label htmlFor="steroidCheck" className="text-xs font-medium text-amber-900 cursor-pointer">
                History of Over-the-Counter (OTC) topical steroid misuse / unprescribed creams
              </label>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {analyzing ? (
                <span>Matching against 50,000 Cohort Records...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Compute Differential Diagnosis (50k Dataset)</span>
                </>
              )}
            </button>

            {/* Results Display */}
            {analysisResult && (
              <div className="mt-4 p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                  <h5 className="font-bold text-xs text-emerald-950 flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Cohort Differential Diagnosis</span>
                  </h5>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    {analysisResult.cohortSize.toLocaleString()} Cohort Sample
                  </span>
                </div>

                <div className="space-y-2.5">
                  {analysisResult.differentialDiagnosis?.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-stone-800">
                        <span>{item.condition}</span>
                        <span className="text-emerald-700">{item.percentage}% match</span>
                      </div>
                      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clinical Triage Alert */}
                <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-stone-900">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Clinical Triage Recommendation</span>
                  </div>
                  <p className="text-stone-700 text-[11px] leading-relaxed">
                    {analysisResult.clinicalTriage?.triageAdvice}
                  </p>
                  <div className="mt-2 text-[10px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md inline-block">
                    Suggested Specialist: {analysisResult.clinicalTriage?.recommendedSpecialist}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
