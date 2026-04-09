"use client";

import { useEffect, useState } from "react";

type ApiKey = {
  id: number;
  name: string;
  key: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function ApiKeysPage() {
  const [data, setData] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", expirationYears: "1" });
  const [newKey, setNewKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/api-keys");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setNewKey(json.key);
        fetchData();
      } else {
        alert(json.message || "Gagal membuat kunci");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus API Key ini? Akses client menggunakan kunci ini akan segera terhenti.")) return;
    try {
      const res = await fetch("/api/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setNewKey(null);
    setForm({ name: "", expirationYears: "1" });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Selamanya";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Master API Keys</h1>
        <p className="page-desc">Kelola kunci akses untuk sinkronisasi client desktop</p>
      </div>

      <div className="admin-card">
        <div className="toolbar">
          <div style={{ flex: 1 }}></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Generate New Key
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p>Belum ada API Key yang dibuat</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Identitas</th>
                  <th>Prefix Kunci</th>
                  <th>Kedaluwarsa</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>Dibuat: {formatDate(item.createdAt)}</div>
                    </td>
                    <td>
                      <code style={{ color: "#818cf8", background: "rgba(129, 140, 248, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                        {item.key.substring(0, 10)}...
                      </code>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      {formatDate(item.expiresAt)}
                    </td>
                    <td>
                      <span className={item.isActive ? "badge-active" : "badge-inactive"}>
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon danger" onClick={() => handleDelete(item.id)} title="Hapus">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Generate API Key Baru</div>
            
            {newKey ? (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ 
                  background: "rgba(34, 197, 94, 0.1)", 
                  border: "1px dashed #22c55e", 
                  padding: "1.5rem", 
                  borderRadius: "12px",
                  marginBottom: "1.5rem"
                }}>
                  <p style={{ color: "#4ade80", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                    Salin kunci ini sekarang. Kunci ini tidak akan ditampilkan lagi demi keamanan.
                  </p>
                  <code style={{ 
                    display: "block", 
                    fontSize: "1.1rem", 
                    color: "#0f172a", 
                    wordBreak: "break-all",
                    background: "#f1f5f9",
                    padding: "1rem",
                    borderRadius: "8px",
                    userSelect: "all"
                  }}>
                    {newKey}
                  </code>
                </div>
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={closeModal}>
                  Selesai
                </button>
              </div>
            ) : (
              <>
                <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                  <div className="form-field">
                    <label>Nama Identitas Client</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Misal: PC Kasir 01"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Masa Berlaku</label>
                    <select
                      className="form-input"
                      value={form.expirationYears}
                      onChange={(e) => setForm({ ...form, expirationYears: e.target.value })}
                    >
                      <option value="1">1 Tahun</option>
                      <option value="2">2 Tahun</option>
                      <option value="3">3 Tahun</option>
                      <option value="forever">Selamanya</option>
                    </select>
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={closeModal}>Batal</button>
                  <button className="btn btn-primary" onClick={handleCreate} disabled={saving || !form.name}>
                    {saving ? "Generating..." : "Generate Key"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
