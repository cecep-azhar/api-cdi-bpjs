import { db } from "@/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const [tindakanCount, diagnosaCount, bpjsCount, icd10Count, icd9Count] = await Promise.all([
    db.query.actions.findMany().then((r) => r.length),
    db.query.diagnoses.findMany().then((r) => r.length),
    db.query.bpjs.findMany().then((r) => r.length),
    db.query.icd10.findMany().then((r) => r.length),
    db.query.icd9.findMany().then((r) => r.length),
  ]);

  const stats = [
    {
      label: "Tindakan",
      value: tindakanCount,
      href: "/admin/actions",
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
      href: "/admin/diagnoses",
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
      href: "/admin/icd10",
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
      href: "/admin/icd9",
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
    <div className="animate-in fade-in duration-500">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-desc">Ringkasan statistik data master dan status sistem CDI BPJS</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <Link href={s.href} key={s.label} className="stat-card" style={{ textDecoration: "none" }}>
            <div className="stat-header">
              <div className="stat-label">Total {s.label}</div>
              <div className="stat-icon" style={{ 
                background: s.color + '15',
                color: s.color,
                padding: '10px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {s.icon}
              </div>
            </div>
            <div className="stat-value">{s.value.toLocaleString()}</div>
            <div className="stat-desc">Data {s.label.toLowerCase()} saat ini</div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h2 className="card-title">Aksi Cepat</h2>
          </div>
          <div className="card-content">
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Pintasan untuk mengelola dan menambah data master baru ke dalam sistem.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/admin/actions" className="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tindakan
              </Link>
              <Link href="/admin/diagnoses" className="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Diagnosa
              </Link>
              <Link href="/admin/bpjs" className="btn btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                BPJS
              </Link>
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h2 className="card-title">Endpoint API</h2>
          </div>
          <div className="card-content">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { method: "GET", path: "/api/sync/get", desc: "Data Fetching" },
                { method: "POST", path: "/api/sync/post", desc: "Data Sync" },
              ].map((ep) => (
                <div key={ep.path} style={{
                  display: "flex", gap: "1rem", alignItems: "center",
                  padding: "1rem",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}>
                  <span style={{
                    padding: "0.25rem 0.6rem",
                    borderRadius: "6px",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    background: ep.method === "GET" ? "#dcfce7" : "#e0e7ff",
                    color: ep.method === "GET" ? "#166534" : "#3730a3",
                    flexShrink: 0,
                  }}>
                    {ep.method}
                  </span>
                  <code style={{ color: "#0f172a", fontSize: "0.85rem", fontWeight: 600, flex: 1, wordBreak: "break-all" }}>{ep.path}</code>
                  <span style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: "center", padding: "1rem 0 3rem 0", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 500 }}>
        © 2026 RND SOFTWARE ENGINEERING • PREMIUM ADMIN INTERFACE
      </div>
    </div>
  );
}
