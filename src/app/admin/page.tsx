import { db } from "@/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const [tindakanCount, diagnosaCount, bpjsCount, icd10Count, icd9Count] = await Promise.all([
    db.query.tindakan.findMany().then((r) => r.length),
    db.query.diagnosa.findMany().then((r) => r.length),
    db.query.bpjs.findMany().then((r) => r.length),
    db.query.icd10.findMany().then((r) => r.length),
    db.query.icd9.findMany().then((r) => r.length),
  ]);

  const stats = [
    {
      label: "Tindakan",
      value: tindakanCount,
      href: "/admin/tindakan",
      color: "#6366f1",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      label: "Diagnosa",
      value: diagnosaCount,
      href: "/admin/diagnosa",
      color: "#8b5cf6",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      ),
    },
    {
      label: "BPJS",
      value: bpjsCount,
      href: "/admin/bpjs",
      color: "#06b6d4",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      ),
    },
    {
      label: "ICD-10",
      value: icd10Count,
      href: "#",
      color: "#10b981",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      label: "ICD-9",
      value: icd9Count,
      href: "#",
      color: "#f59e0b",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-desc">Ringkasan data master CDI BPJS API</p>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <Link href={s.href} key={s.label} className="stat-card" style={{ textDecoration: "none" }}>
            <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-value">{s.value.toLocaleString()}</div>
            <div className="stat-label">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="admin-card">
        <h2 style={{ color: "#e6edf3", fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
          Aksi Cepat
        </h2>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/admin/tindakan" className="btn btn-primary">
            + Tambah Tindakan
          </Link>
          <Link href="/admin/diagnosa" className="btn btn-primary" style={{ background: "linear-gradient(135deg, #8b5cf6, #a855f7)" }}>
            + Tambah Diagnosa
          </Link>
          <Link href="/admin/bpjs" className="btn btn-primary" style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)" }}>
            + Tambah BPJS
          </Link>
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ color: "#e6edf3", fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Endpoint Sinkronisasi
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            { method: "GET", path: "/api/sync/get?last_sync=<timestamp>", desc: "Ambil data terbaru dari server" },
            { method: "POST", path: "/api/sync/post", desc: "Kirim data batch dari klien" },
          ].map((ep) => (
            <div key={ep.path} style={{
              display: "flex", gap: "1rem", alignItems: "center",
              padding: "0.75rem 1rem",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <span style={{
                padding: "0.2rem 0.6rem",
                borderRadius: "6px",
                fontSize: "0.7rem",
                fontWeight: 700,
                background: ep.method === "GET" ? "rgba(34, 197, 94, 0.12)" : "rgba(99, 102, 241, 0.12)",
                color: ep.method === "GET" ? "#4ade80" : "#818cf8",
                border: ep.method === "GET" ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(99,102,241,0.2)",
                flexShrink: 0,
              }}>
                {ep.method}
              </span>
              <code style={{ color: "#7dd3fc", fontSize: "0.8rem", flex: 1, wordBreak: "break-all" }}>{ep.path}</code>
              <span style={{ color: "rgba(230,237,243,0.4)", fontSize: "0.8rem", flexShrink: 0 }}>{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
