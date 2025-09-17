'use client'
import { useMemo, useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError("");
  };

  const analyze = async (formData) => {
    const res = await fetch(`/api/analyze`, { method: "POST", body: formData });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || `Analysis failed (${res.status})`);
    }
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return res.json();
    const text = await res.text();
    return { raw: text };
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const data = await analyze(formData);
      setResult(data);
      setSelectedIndex(0);
    } catch (err) {
      setError(err.message || "Error analyzing file");
    } finally {
      setLoading(false);
    }
  };

  const handleUseExisting = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const resp = await fetch("/students_with_clusters.csv");
      if (!resp.ok) throw new Error("Sample CSV not found in public folder");
      const csvText = await resp.text();
      const blob = new Blob([csvText], { type: "text/csv" });
      const sampleFile = new File([blob], "students_with_clusters.csv", { type: "text/csv" });
      const formData = new FormData();
      formData.append("file", sampleFile);
      const data = await analyze(formData);
      setResult(data);
      setSelectedIndex(0);
    } catch (e) {
      setError(e.message || "Unable to load existing CSV");
    } finally {
      setLoading(false);
    }
  };

  // Derived data for charts and table
  const preview = result?.preview || [];
  const overview = result?.overview || null;
  const correlations = result?.correlations || null;
  const skillKeys = useMemo(() => {
    if (!overview) return [];
    return Object.keys(overview).filter((k) => k !== "assessment_score");
  }, [overview]);

  const filteredRows = useMemo(() => {
    if (!preview.length) return [];
    const q = search.trim().toLowerCase();
    let rows = preview.filter((r) =>
      !q || String(r.name || "").toLowerCase().includes(q) || String(r.student_id || "").toLowerCase().includes(q)
    );
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const va = sortKey === 'learning_persona' ? formatPersona(a[sortKey]) : a[sortKey];
        const vb = sortKey === 'learning_persona' ? formatPersona(b[sortKey]) : b[sortKey];
        if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
        return sortDir === "asc"
          ? String(va || "").localeCompare(String(vb || ""))
          : String(vb || "").localeCompare(String(va || ""));
      });
    }
    return rows;
  }, [preview, search, sortKey, sortDir]);

  const selected = preview[selectedIndex] || null;

  return (
    <div className="grid gap-10">
      <section className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Analyze <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-amber-500">Student Performance</span>
        </h1>
        <p className="text-sm md:text-base text-black/70 dark:text-white/70 max-w-2xl mx-auto">
          Upload your CSV or use a sample dataset to compute metrics, correlations, and personas.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700" />
            <h2 className="text-lg font-semibold">Upload CSV</h2>
          </div>
          <p className="text-sm mb-4 text-black/70 dark:text-white/70">Bring your own data to run analysis via the backend API.</p>
          <form onSubmit={handleUpload} className="flex flex-col gap-3">
            <input type="file" accept=".csv" onChange={handleFileChange} className="border rounded p-2 bg-white/70 dark:bg-white/10" />
            <button type="submit" className="btn-primary" disabled={!file || loading}>{loading ? "Analyzing..." : "Upload & Analyze"}</button>
          </form>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600" />
            <h2 className="text-lg font-semibold">Use Existing CSV</h2>
          </div>
          <p className="text-sm mb-4 text-black/70 dark:text-white/70">Try the dashboard with a bundled sample dataset.</p>
          <button onClick={handleUseExisting} className="btn-secondary" disabled={loading}>Use Sample Data</button>
        </div>
      </div>

      {error && <div className="text-red-400 mt-2">{error}</div>}

      {overview && (
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard title="Students" value={result?.count ?? preview.length} />
          <StatCard title="Avg Score" value={round(overview.assessment_score)} suffix="" />
          <StatCard title="Avg Engagement" value={round(overview.engagement_time)} suffix=" hrs" />
          <StatCard title="Top Skill" value={topSkill(overview)} />
        </section>
      )}

      {overview && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Skill Averages</h3>
            <BarChart dataKeys={skillKeys} values={skillKeys.map((k) => overview[k])} />
          </div>
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Attention vs Assessment Score</h3>
            <ScatterChart points={(preview || []).slice(0, 150).map((r) => ({ x: r.attention, y: r.assessment_score }))} />
          </div>
        </section>
      )}

      {selected && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Student Profile (Radar)</h3>
            <div className="text-sm mb-2 text-black/70 dark:text-white/70">{selected.name} • {selected.student_id}</div>
            <RadarChart
              labels={["comprehension", "attention", "focus", "retention", "engagement_time"]}
              values={[selected.comprehension, selected.attention, selected.focus, selected.retention, normalizeEngagement(selected.engagement_time)]}
            />
          </div>
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Insights</h3>
            <Insights correlations={correlations} />
          </div>
        </section>
      )}

      {preview.length > 0 && (
        <section className="card p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <h3 className="font-semibold">Students</h3>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID"
              className="border rounded px-3 py-2 bg-white/70 dark:bg-white/10"
            />
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/10">
                  {[
                    ["student_id", "ID"],
                    ["name", "Name"],
                    ["class", "Class"],
                    ["assessment_score", "Score"],
                    ["attention", "Attention"],
                    ["comprehension", "Comprehension"],
                    ["focus", "Focus"],
                    ["retention", "Retention"],
                    ["engagement_time", "Engagement"],
                    ["learning_persona", "Persona"],
                  ].map(([key, label]) => (
                    <th key={key} className="py-2 pr-3 cursor-pointer select-none" onClick={() => toggleSort(key, { sortKey, setSortKey, sortDir, setSortDir })}>
                      {label} {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r, i) => (
                  <tr key={i} className={`border-b border-white/5 hover:bg-white/5 ${i === selectedIndex ? 'bg-white/10' : ''}`} onClick={() => setSelectedIndex(i)}>
                    <td className="py-2 pr-3 whitespace-nowrap">{r.student_id}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{r.name}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{r.class}</td>
                    <td className="py-2 pr-3">{round(r.assessment_score)}</td>
                    <td className="py-2 pr-3">{round(r.attention)}</td>
                    <td className="py-2 pr-3">{round(r.comprehension)}</td>
                    <td className="py-2 pr-3">{round(r.focus)}</td>
                    <td className="py-2 pr-3">{round(r.retention)}</td>
                    <td className="py-2 pr-3">{round(r.engagement_time)}</td>
                    <td className="py-2 pr-3">{formatPersona(r.learning_persona)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function round(v) {
  if (v === undefined || v === null) return "-";
  return Math.round(Number(v) * 10) / 10;
}

function topSkill(overview) {
  if (!overview) return "-";
  const entries = Object.entries(overview).filter(([k]) => k !== "assessment_score");
  if (!entries.length) return "-";
  entries.sort((a, b) => b[1] - a[1]);
  const [name] = entries[0];
  return name.replace(/_/g, ' ');
}

function normalizeEngagement(v) {
  const clamped = Math.max(0, Math.min(100, Number(v)));
  return clamped;
}

function toggleSort(key, ctx) {
  const { sortKey, setSortKey, sortDir, setSortDir } = ctx;
  if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
  else {
    setSortKey(key);
    setSortDir("asc");
  }
}

function StatCard({ title, value, suffix }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-white/60 mb-1">{title}</div>
      <div className="text-2xl font-bold">{value}{suffix || ''}</div>
    </div>
  );
}

function BarChart({ dataKeys, values, width = 520, height = 220 }) {
  if (!dataKeys?.length) return <div className="text-sm text-white/60">No data</div>;
  const pad = 30;
  const maxV = Math.max(...values, 1);
  const chartW = width - pad * 2;
  const chartH = height - pad * 2;
  const barW = chartW / dataKeys.length - 10;
  return (
    <svg width={width} height={height} role="img" aria-label="Bar chart">
      <g transform={`translate(${pad},${pad})`}>
        {values.map((v, i) => {
          const h = (v / maxV) * chartH;
          const x = i * (barW + 10);
          const y = chartH - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} fill="#0ea5e9" opacity="0.8" rx="6" />
              <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fontSize="10" fill="currentColor">
                {shortLabel(dataKeys[i])}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function ScatterChart({ points, width = 520, height = 220 }) {
  if (!points?.length) return <div className="text-sm text-white/60">No data</div>;
  const pad = 30;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = 0, maxX = Math.max(100, Math.max(...xs));
  const minY = 0, maxY = Math.max(100, Math.max(...ys));
  const chartW = width - pad * 2;
  const chartH = height - pad * 2;
  const mapX = (x) => pad + ((x - minX) / (maxX - minX)) * chartW;
  const mapY = (y) => pad + chartH - ((y - minY) / (maxY - minY)) * chartH;
  return (
    <svg width={width} height={height} role="img" aria-label="Scatter chart">
      <g>
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="currentColor" opacity="0.3" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="currentColor" opacity="0.3" />
        {points.map((p, i) => (
          <circle key={i} cx={mapX(p.x)} cy={mapY(p.y)} r={3} fill="#f97316" opacity="0.7" />
        ))}
      </g>
    </svg>
  );
}

function RadarChart({ labels, values, size = 260 }) {
  if (!labels?.length || !values?.length) return <div className="text-sm text-white/60">No data</div>;
  const N = labels.length;
  const radius = size / 2 - 24;
  const center = { x: size / 2, y: size / 2 };
  const angle = (i) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const point = (i, v) => {
    const r = (v / 100) * radius;
    return [center.x + r * Math.cos(angle(i)), center.y + r * Math.sin(angle(i))];
  };
  const polygon = values.map((v, i) => point(i, v)).map((p) => p.join(",")).join(" ");
  return (
    <svg width={size} height={size} role="img" aria-label="Radar chart">
      <g>
        {[20, 40, 60, 80, 100].map((t, idx) => (
          <circle key={idx} cx={center.x} cy={center.y} r={(t / 100) * radius} fill="none" stroke="currentColor" opacity="0.15" />
        ))}
        {labels.map((lab, i) => {
          const [x, y] = point(i, 100);
          return <line key={i} x1={center.x} y1={center.y} x2={x} y2={y} stroke="currentColor" opacity="0.15" />;
        })}
        <polygon points={polygon} fill="#0ea5e9" opacity="0.35" stroke="#0ea5e9" strokeWidth="2" />
        {labels.map((lab, i) => {
          const [x, y] = point(i, 110);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" fontSize="10" fill="currentColor">
              {shortLabel(lab)}
            </text>
          );
        })}
      </g>
    </svg>
  );
}

function shortLabel(s) {
  return String(s).replace(/_/g, ' ').replace('engagement', 'eng.');
}

function Insights({ correlations }) {
  if (!correlations) return <div className="text-sm text-white/60">No correlations available</div>;
  const entries = Object.entries(correlations).filter(([k]) => k !== 'assessment_score');
  const sorted = [...entries].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const top = sorted.slice(0, 3);
  return (
    <ul className="text-sm list-disc pl-5 space-y-1">
      {top.map(([k, v]) => (
        <li key={k}>
          <span className="font-semibold">{k.replace(/_/g, ' ')}</span>: correlation {v > 0 ? 'positively' : 'negatively'} related to assessment_score ({round(v)}).
        </li>
      ))}
    </ul>
  );
}

function formatPersona(code) {
  const n = Number(code);
  if (n === 0) return 'need support';
  if (n === 1) return 'developing learner';
  if (n === 2) return 'consistent learner';
  return String(code ?? '-');
}
