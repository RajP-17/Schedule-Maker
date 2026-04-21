import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Pencil, X, Check, GraduationCap, ArrowUpDown } from "lucide-react";

export default function ScheduleMaker() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sortBy, setSortBy] = useState("semester");
  const [sortDir, setSortDir] = useState("asc");
  const [form, setForm] = useState({
    name: "",
    semester: "",
    credits: "",
    instructor: "",
    schedule: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("schedule_classes");
      if (raw) setClasses(JSON.parse(raw));
    } catch (e) {
      // no data yet
    }
    setLoading(false);
  }, []);

  function persist(next) {
    try {
      localStorage.setItem("schedule_classes", JSON.stringify(next));
    } catch (e) {
      console.error("Save failed:", e);
    }
  }

  function resetForm() {
    setForm({ name: "", semester: "", credits: "", instructor: "", schedule: "" });
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit() {
    const name = form.name.trim();
    const semester = form.semester.trim();
    const credits = Number(form.credits);
    if (!name || !semester || !credits || credits < 0) return;

    const entry = {
      id: editingId || `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      semester,
      credits,
      instructor: form.instructor.trim(),
      schedule: form.schedule.trim(),
    };

    const next = editingId
      ? classes.map((c) => (c.id === editingId ? entry : c))
      : [...classes, entry];

    setClasses(next);
    persist(next);
    resetForm();
  }

  function handleEdit(c) {
    setForm({
      name: c.name,
      semester: c.semester,
      credits: String(c.credits),
      instructor: c.instructor || "",
      schedule: c.schedule || "",
    });
    setEditingId(c.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    const next = classes.filter((c) => c.id !== id);
    setClasses(next);
    persist(next);
  }

  function toggleSort(key) {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  }

  const termOrder = { winter: 0, spring: 1, summer: 2, fall: 3, autumn: 3 };
  function semesterSortValue(s) {
    const m = s.match(/^(\w+)\s*(\d{4})?/i);
    const year = m?.[2] ? parseInt(m[2]) : 9999;
    const term = termOrder[m?.[1]?.toLowerCase()] ?? 99;
    return year * 10 + term;
  }

  const sortedClasses = useMemo(() => {
    const copy = [...classes];
    copy.sort((a, b) => {
      let va, vb;
      if (sortBy === "semester") {
        va = semesterSortValue(a.semester);
        vb = semesterSortValue(b.semester);
      } else if (sortBy === "credits") {
        va = a.credits;
        vb = b.credits;
      } else {
        va = (a[sortBy] || "").toLowerCase();
        vb = (b[sortBy] || "").toLowerCase();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [classes, sortBy, sortDir]);

  const totalCredits = classes.reduce((s, c) => s + c.credits, 0);
  const uniqueSemesters = new Set(classes.map((c) => c.semester)).size;
  const semesterPresets = ["Fall 2025", "Spring 2026", "Summer 2026", "Fall 2026", "Spring 2027"];

  // theme tokens
  const bg = "#EFE9DC";
  const ink = "#1C1B18";
  const accent = "#6B3A2E";
  const paper = "#FBF7EC";
  const rule = "#C9BFA6";
  const subtle = "#5C5A53";

  return (
    <div style={{ background: bg, color: ink, minHeight: "100vh", fontFamily: "'Inter Tight', ui-sans-serif, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=Inter+Tight:wght@400;500;600&display=swap');
        .display { font-family: 'Fraunces', 'Times New Roman', serif; font-optical-sizing: auto; letter-spacing: -0.02em; }
        .num { font-family: 'Fraunces', serif; font-variant-numeric: tabular-nums; }
        .rule-top { border-top: 1px solid ${rule}; }
        .rule-bottom { border-bottom: 1px solid ${rule}; }
        .rule-all { border: 1px solid ${rule}; }
        .btn-primary { background: ${ink}; color: ${paper}; transition: background 0.15s ease, transform 0.15s ease; }
        .btn-primary:hover { background: ${accent}; transform: translateY(-1px); }
        .btn-ghost { background: transparent; color: ${ink}; transition: color 0.15s ease; }
        .btn-ghost:hover { color: ${accent}; }
        .input { background: ${paper}; border: 1px solid ${rule}; color: ${ink}; padding: 10px 14px; width: 100%; font-size: 14px; outline: none; transition: border-color 0.15s ease; }
        .input:focus { border-color: ${ink}; }
        .preset { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; padding: 4px 10px; border: 1px solid ${rule}; color: ${ink}; background: transparent; cursor: pointer; transition: all 0.15s ease; border-radius: 999px; }
        .preset:hover { border-color: ${ink}; background: ${ink}; color: ${paper}; }
        .tbl { width: 100%; border-collapse: collapse; background: ${paper}; }
        .tbl thead th { text-align: left; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: ${subtle}; font-weight: 500; padding: 14px 16px; border-bottom: 1px solid ${ink}; background: ${paper}; }
        .tbl thead th.sortable { cursor: pointer; user-select: none; transition: color 0.15s ease; }
        .tbl thead th.sortable:hover { color: ${ink}; }
        .tbl tbody tr { border-bottom: 1px solid ${rule}; transition: background 0.15s ease; }
        .tbl tbody tr:hover { background: #F5EFDF; }
        .tbl tbody tr:last-child { border-bottom: none; }
        .tbl tbody td { padding: 16px; font-size: 14px; vertical-align: middle; }
        .tbl tfoot td { padding: 14px 16px; border-top: 1px solid ${ink}; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: ${subtle}; background: ${paper}; }
        .chip { display: inline-block; padding: 3px 10px; border: 1px solid ${rule}; border-radius: 999px; font-size: 11px; letter-spacing: 0.06em; }
        .row-action { opacity: 0.35; transition: opacity 0.15s ease; }
        tr:hover .row-action { opacity: 1; }
        .fade-in { animation: fadeIn 0.3s ease both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px);} to { opacity: 1; transform: translateY(0);} }
        .grain::before { content: ""; position: fixed; inset: 0; pointer-events: none; opacity: 0.04; background-image: radial-gradient(${ink} 1px, transparent 1px); background-size: 3px 3px; z-index: 0; }
        .arrow { display: inline-flex; vertical-align: middle; margin-left: 4px; opacity: 0.4; }
        .arrow.active { opacity: 1; color: ${accent}; }
      `}</style>

      <div className="grain" />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 28px 120px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header className="rule-bottom" style={{ paddingBottom: 28, marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 12 }}>
                Academic Planner · Est. {new Date().getFullYear()}
              </div>
              <h1 className="display" style={{ fontSize: 64, fontWeight: 800, lineHeight: 0.95, margin: 0 }}>
                The <em style={{ color: accent, fontStyle: "italic" }}>Course</em> Ledger
              </h1>
              <p style={{ marginTop: 14, maxWidth: 520, color: subtle, fontSize: 15, lineHeight: 1.5 }}>
                One tidy table of every class, semester, and credit. Saved automatically.
              </p>
            </div>

            <div style={{ display: "flex", gap: 32, alignItems: "flex-end" }}>
              <Stat label="Classes" value={classes.length} />
              <Stat label="Credits" value={totalCredits} />
              <Stat label="Semesters" value={uniqueSemesters} />
            </div>
          </div>
        </header>

        {/* Add button */}
        {!showForm && (
          <button
            className="btn-primary"
            onClick={() => setShowForm(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 22px",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.04em",
              border: "none",
              cursor: "pointer",
              marginBottom: 32,
            }}
          >
            <Plus size={16} strokeWidth={2} />
            Add a class
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="rule-all fade-in" style={{ background: paper, padding: 28, marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 600 }}>
                {editingId ? "Edit class" : "New class"}
              </h2>
              <button className="btn-ghost" onClick={resetForm} style={{ border: "none", cursor: "pointer", padding: 6 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Class name" span={2}>
                <input
                  className="input"
                  placeholder="e.g. Intro to Linear Algebra"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
              </Field>

              <Field label="Semester">
                <input
                  className="input"
                  placeholder="e.g. Fall 2025"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {semesterPresets.map((s) => (
                    <button key={s} type="button" className="preset" onClick={() => setForm({ ...form, semester: s })}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Credits">
                <input
                  className="input num"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="3"
                  value={form.credits}
                  onChange={(e) => setForm({ ...form, credits: e.target.value })}
                />
              </Field>

              <Field label="Instructor (optional)">
                <input
                  className="input"
                  placeholder="Prof. Ramirez"
                  value={form.instructor}
                  onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                />
              </Field>

              <Field label="Days / time (optional)">
                <input
                  className="input"
                  placeholder="MWF 10:00-10:50"
                  value={form.schedule}
                  onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                />
              </Field>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                className="btn-ghost"
                onClick={resetForm}
                style={{ padding: "12px 20px", border: `1px solid ${rule}`, cursor: "pointer", fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500 }}
              >
                <Check size={16} />
                {editingId ? "Save changes" : "Add class"}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && classes.length === 0 && !showForm && (
          <div className="rule-all fade-in" style={{ padding: "80px 40px", textAlign: "center", borderStyle: "dashed", background: paper }}>
            <GraduationCap size={42} strokeWidth={1.2} style={{ color: accent, marginBottom: 16 }} />
            <h3 className="display" style={{ fontSize: 28, margin: "0 0 8px", fontWeight: 600 }}>
              Your ledger awaits
            </h3>
            <p style={{ color: subtle, fontSize: 14, margin: 0 }}>
              Add your first class to start building your schedule.
            </p>
          </div>
        )}

        {/* Table */}
        {classes.length > 0 && (
          <div className="rule-all fade-in" style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <SortHeader label="Class" k="name" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                    <SortHeader label="Semester" k="semester" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                    <SortHeader label="Credits" k="credits" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} align="right" />
                    <SortHeader label="Instructor" k="instructor" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                    <SortHeader label="Days / Time" k="schedule" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                    <th style={{ width: 80, textAlign: "right" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedClasses.map((c) => (
                    <tr key={c.id}>
                      <td className="display" style={{ fontWeight: 500 }}>
                        <span style={{ fontSize: 17 }}>{c.name}</span>
                      </td>
                      <td>
                        <span className="chip">{c.semester}</span>
                      </td>
                      <td className="num" style={{ textAlign: "right", fontSize: 16, fontWeight: 600 }}>
                        {c.credits}
                      </td>
                      <td style={{ color: subtle }}>{c.instructor || <span style={{ opacity: 0.4 }}>—</span>}</td>
                      <td style={{ color: subtle, fontStyle: c.schedule ? "italic" : "normal", fontFamily: c.schedule ? "'Fraunces', serif" : "inherit" }}>
                        {c.schedule || <span style={{ opacity: 0.4, fontStyle: "normal", fontFamily: "inherit" }}>—</span>}
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => handleEdit(c)}
                          className="btn-ghost row-action"
                          style={{ border: "none", cursor: "pointer", padding: 6, marginRight: 4 }}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="btn-ghost row-action"
                          style={{ border: "none", cursor: "pointer", padding: 6 }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td>{uniqueSemesters} {uniqueSemesters === 1 ? "semester" : "semesters"}</td>
                    <td className="num" style={{ textAlign: "right", fontSize: 16, color: ink, fontWeight: 600 }}>{totalCredits}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        {classes.length > 0 && (
          <footer style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: subtle, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <span>Saved automatically</span>
            <span>Click any column header to sort</span>
          </footer>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div className="num" style={{ fontSize: 36, fontWeight: 600, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#5C5A53", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

function Field({ label, children, span = 1 }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: `span ${span}` }}>
      <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#5C5A53" }}>{label}</span>
      {children}
    </label>
  );
}

function SortHeader({ label, k, sortBy, sortDir, onClick, align = "left" }) {
  const active = sortBy === k;
  return (
    <th className="sortable" style={{ textAlign: align }} onClick={() => onClick(k)}>
      {label}
      <span className={`arrow ${active ? "active" : ""}`}>
        <ArrowUpDown size={11} />
      </span>
    </th>
  );
}
