import { useState } from "react";

const SCREENS = ["setup", "preview", "results"];

const sampleFeatures = [
  "Single sign-on (SSO)",
  "Custom dashboards",
  "Slack integration",
  "Audit logs",
  "Mobile app",
  "Advanced permissions",
  "API access",
  "Bulk data export",
  "Workflow automation",
  "White-labeling",
];

const resultsData = [
  { name: "Single sign-on (SSO)", score: 94, wtp: "$28/mo", segment: "Enterprise", index: 0 },
  { name: "API access", score: 81, wtp: "$22/mo", segment: "Technical", index: 1 },
  { name: "Workflow automation", score: 76, wtp: "$19/mo", segment: "All", index: 2 },
  { name: "Advanced permissions", score: 68, wtp: "$14/mo", segment: "Enterprise", index: 3 },
  { name: "Slack integration", score: 61, wtp: "$11/mo", segment: "SMB", index: 4 },
  { name: "Audit logs", score: 54, wtp: "$10/mo", segment: "Enterprise", index: 5 },
  { name: "Custom dashboards", score: 47, wtp: "$9/mo", segment: "All", index: 6 },
  { name: "Bulk data export", score: 38, wtp: "$6/mo", segment: "Technical", index: 7 },
  { name: "Mobile app", score: 29, wtp: "$4/mo", segment: "SMB", index: 8 },
  { name: "White-labeling", score: 18, wtp: "$3/mo", segment: "Enterprise", index: 9 },
];

const maxDiffSets = [
  {
    options: ["Single sign-on (SSO)", "Slack integration", "Custom dashboards", "Audit logs"],
  },
  {
    options: ["API access", "Mobile app", "Workflow automation", "White-labeling"],
  },
  {
    options: ["Advanced permissions", "Bulk data export", "Single sign-on (SSO)", "Slack integration"],
  },
];

const segmentColors = {
  Enterprise: "bg-violet-100 text-violet-700",
  Technical: "bg-blue-100 text-blue-700",
  SMB: "bg-emerald-100 text-emerald-700",
  All: "bg-slate-100 text-slate-600",
};

export default function App() {
  const [screen, setScreen] = useState("setup");
  const [inputText, setInputText] = useState(sampleFeatures.join("\n"));
  const [features, setFeatures] = useState(sampleFeatures);
  const [studyName, setStudyName] = useState("Q2 Roadmap Prioritization");
  const [previewSet, setPreviewSet] = useState(0);
  const [maxBest, setMaxBest] = useState(null);
  const [maxWorst, setMaxWorst] = useState(null);
  const [resultTab, setResultTab] = useState("priority");
  const [hoveredBar, setHoveredBar] = useState(null);

  const handleImport = () => {
    const parsed = inputText.split("\n").map(f => f.trim()).filter(Boolean);
    setFeatures(parsed.slice(0, 12));
    setScreen("preview");
  };

  const handleNextSet = () => {
    if (previewSet < maxDiffSets.length - 1) {
      setPreviewSet(previewSet + 1);
      setMaxBest(null);
      setMaxWorst(null);
    } else {
      setScreen("results");
    }
  };

  const currentSet = maxDiffSets[previewSet];
  const canAdvance = maxBest !== null && maxWorst !== null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Nav */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <span className="font-semibold text-slate-800 text-sm">Backlog</span>
        </div>
        <div className="flex items-center gap-6">
          {["setup", "preview", "results"].map((s, i) => (
            <button
              key={s}
              onClick={() => s !== "results" || screen === "results" ? setScreen(s) : null}
              className={`text-xs font-medium flex items-center gap-1.5 ${
                screen === s ? "text-indigo-600" : "text-slate-400"
              } ${s === "results" && screen !== "results" ? "opacity-40 cursor-default" : "cursor-pointer"}`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold border ${
                screen === s ? "bg-indigo-600 text-white border-indigo-600" :
                (SCREENS.indexOf(s) < SCREENS.indexOf(screen)) ? "bg-slate-200 text-slate-500 border-slate-200" :
                "border-slate-300 text-slate-400"
              }`}>{i + 1}</span>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="w-20" />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">

        {/* ── SETUP SCREEN ── */}
        {screen === "setup" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">What are you trying to prioritize?</h1>
              <p className="text-slate-500 mt-1 text-sm">Paste your feature list or backlog items below. We'll turn them into a customer-validated ranking.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Study name</label>
                <input
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={studyName}
                  onChange={e => setStudyName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Feature list</label>
                <p className="text-xs text-slate-400 mt-0.5">One feature per line. 5–15 items works best.</p>
                <textarea
                  className="mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none font-mono"
                  rows={10}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 border border-slate-200 rounded-lg px-3 py-2 bg-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                Connect Jira
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 border border-slate-200 rounded-lg px-3 py-2 bg-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                Import CSV
              </div>
            </div>

            <button
              onClick={handleImport}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
            >
              Build study →
            </button>

            <p className="text-xs text-center text-slate-400">Study auto-configured using MaxDiff. ~8 min for respondents · Results in 24–48 hrs with our panel.</p>
          </div>
        )}

        {/* ── PREVIEW SCREEN ── */}
        {screen === "preview" && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Preview — respondent view</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">This is what your customers will see</h1>
              <p className="text-slate-500 mt-1 text-sm">We've designed the study automatically. Click through a few rounds to get a feel for it.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">Round {previewSet + 1} of {maxDiffSets.length}</span>
                <div className="flex gap-1">
                  {maxDiffSets.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i <= previewSet ? "bg-indigo-500" : "bg-slate-200"}`} />
                  ))}
                </div>
              </div>
              <div className="px-5 py-6 space-y-4">
                <p className="text-sm font-medium text-slate-700 text-center">Which of these features would be <span className="text-green-600 font-semibold">most</span> and <span className="text-red-500 font-semibold">least</span> valuable to you?</p>
                <div className="space-y-2">
                  {currentSet.options.map((opt) => {
                    const isBest = maxBest === opt;
                    const isWorst = maxWorst === opt;
                    return (
                      <div key={opt} className={`rounded-lg border-2 px-4 py-3 flex items-center justify-between transition-all ${
                        isBest ? "border-green-400 bg-green-50" :
                        isWorst ? "border-red-300 bg-red-50" :
                        "border-slate-200 bg-white hover:border-slate-300"
                      }`}>
                        <span className={`text-sm font-medium ${isBest ? "text-green-700" : isWorst ? "text-red-600" : "text-slate-700"}`}>{opt}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setMaxBest(isBest ? null : opt === maxWorst ? null : opt)}
                            className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                              isBest ? "bg-green-500 text-white border-green-500" : "border-slate-200 text-slate-500 hover:border-green-400 hover:text-green-600"
                            }`}
                          >Most</button>
                          <button
                            onClick={() => setMaxWorst(isWorst ? null : opt === maxBest ? null : opt)}
                            className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                              isWorst ? "bg-red-400 text-white border-red-400" : "border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500"
                            }`}
                          >Least</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={handleNextSet}
                  disabled={!canAdvance}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    canAdvance ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {previewSet < maxDiffSets.length - 1 ? "Next round →" : "See results →"}
                </button>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700">
              <span className="font-semibold">Auto-configured:</span> {features.length} features · {Math.round(features.length * 1.5)} rounds per respondent · Balanced incomplete block design
            </div>
          </div>
        )}

        {/* ── RESULTS SCREEN ── */}
        {screen === "results" && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{studyName}</h1>
                <p className="text-slate-500 mt-1 text-sm">312 respondents · Completed March 14, 2026</p>
              </div>
              <button className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 font-medium">Export →</button>
            </div>

            {/* Recommendation card */}
            <div className="bg-indigo-600 text-white rounded-xl px-5 py-4 space-y-1 shadow">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">Top recommendation</p>
              <p className="text-base font-semibold">Build SSO before Custom Dashboards. Customers value it 2× more and will pay a $28/mo premium for it.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
              {[["priority", "Feature priority"], ["wtp", "Willingness to pay"], ["segments", "By segment"]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setResultTab(key)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${resultTab === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >{label}</button>
              ))}
            </div>

            {/* Priority tab */}
            {resultTab === "priority" && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="text-xs text-slate-500">Preference score out of 100 — higher means customers value it more</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {resultsData.map((item, i) => (
                    <div
                      key={item.name}
                      className={`px-5 py-3 flex items-center gap-3 transition-colors ${hoveredBar === i ? "bg-slate-50" : ""}`}
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <span className="text-xs font-bold text-slate-400 w-4 text-right">{i + 1}</span>
                      <span className="text-sm text-slate-700 w-44 truncate font-medium">{item.name}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${i < 3 ? "bg-indigo-500" : i < 6 ? "bg-indigo-300" : "bg-slate-300"}`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 w-6 text-right">{item.score}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${segmentColors[item.segment]}`}>{item.segment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WTP tab */}
            {resultTab === "wtp" && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="text-xs text-slate-500">Estimated monthly price premium customers would pay per feature, above base plan</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {resultsData.slice(0, 7).map((item, i) => (
                    <div key={item.name} className="px-5 py-3 flex items-center gap-3">
                      <span className="text-sm text-slate-700 flex-1 font-medium">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-slate-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-emerald-400"
                            style={{ width: `${(parseInt(item.wtp) / 28) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-emerald-600 w-14 text-right">{item.wtp}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Based on Gabor-Granger pricing model · n=312</p>
                </div>
              </div>
            )}

            {/* Segments tab */}
            {resultTab === "segments" && (
              <div className="space-y-3">
                {[
                  { label: "Enterprise customers", color: "violet", top: ["Single sign-on (SSO)", "Audit logs", "Advanced permissions"], note: "Security and compliance drive almost all of their feature value." },
                  { label: "Technical users", color: "blue", top: ["API access", "Bulk data export", "Workflow automation"], note: "Control and automation. Will self-serve if tooling is solid." },
                  { label: "SMB teams", color: "emerald", top: ["Slack integration", "Mobile app", "Workflow automation"], note: "Integrations and accessibility. Price-sensitive; bundle carefully." },
                ].map(seg => (
                  <div key={seg.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full bg-${seg.color}-400`} />
                      <span className="text-sm font-semibold text-slate-800">{seg.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">{seg.note}</p>
                    <div className="flex gap-2 flex-wrap">
                      {seg.top.map(f => (
                        <span key={f} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">{f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
