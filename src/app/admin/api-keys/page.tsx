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
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});

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

  const handleCopy = (id: number, keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVisibility = (id: number) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
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
    <div className="animate-in fade-in duration-500">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">API Access Keys</h1>
          <p className="page-desc">Kelola kunci akses untuk sinkronisasi client desktop CDI secara aman</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Generate New Key
        </button>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <h2 className="card-title">Daftar Kunci Akses</h2>
        </div>

        <div className="card-content" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Memuat data...</div>
          ) : data.length === 0 ? (
            <div style={{ padding: '5rem', textAlign: 'center' }}>
              <div style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p style={{ color: '#94a3b8', fontWeight: 500 }}>Belum ada API Key yang terdaftar</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Identitas Client</th>
                    <th>Prefix Kunci</th>
                    <th>Kedaluwarsa</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.15rem" }}>
                          Dibuat: {formatDate(item.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <code style={{ 
                            color: "#6366f1", 
                            background: "#f5f3ff", 
                            padding: "0.25rem 0.6rem", 
                            borderRadius: "6px",
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}>
                            {visibleKeys[item.id] ? item.key : `${item.key.substring(0, 10)}...`}
                          </code>
                          <button 
                            className="btn-icon" 
                            onClick={() => toggleVisibility(item.id)}
                            title={visibleKeys[item.id] ? "Sembunyikan" : "Lihat Detail"}
                            style={{ width: "28px", height: "28px" }}
                          >
                            {visibleKeys[item.id] ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23" stroke="#64748b"></line>
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            )}
                          </button>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleCopy(item.id, item.key)}
                            title="Salin Kunci"
                            style={{ width: "28px", height: "28px" }}
                          >
                            {copiedId === item.id ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                      <td style={{ fontSize: "0.85rem", color: '#64748b' }}>
                        {formatDate(item.expiresAt)}
                      </td>
                      <td>
                        <span className={`badge ${item.isActive ? "badge-active" : "badge-inactive"}`}>
                          {item.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button className="btn-icon danger" onClick={() => handleDelete(item.id)} title="Hapus Kunci">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {newKey ? "Kunci Berhasil Dibuat" : "Generate API Key Baru"}
            </div>
            
            <div className="modal-body">
              {newKey ? (
                <div style={{ padding: "0.5rem 0" }}>
                  <div style={{ 
                    background: "#f0fdf4", 
                    border: "1px dashed #22c55e", 
                    padding: "1.5rem", 
                    borderRadius: "12px",
                    marginBottom: "1rem"
                  }}>
                    <p style={{ color: "#166534", fontSize: "0.85rem", marginBottom: "1rem", fontWeight: 500 }}>
                      ⚠️ Salin dan simpan kunci ini di tempat yang aman. Anda tidak akan bisa melihatnya lagi setelah jendela ini ditutup.
                    </p>
                    <code style={{ 
                      display: "block", 
                      fontSize: "1rem", 
                      color: "#0f172a", 
                      wordBreak: "break-all",
                      background: "#ffffff",
                      border: '1px solid #e2e8f0',
                      padding: "1rem",
                      borderRadius: "8px",
                      userSelect: "all",
                      fontWeight: 700
                    }}>
                      {newKey}
                    </code>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Nama Identitas Client</label>
                    <input
                      className="search-input"
                      style={{ paddingLeft: '1rem' }}
                      type="text"
                      placeholder="Misal: PC Kasir 01"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Masa Berlaku</label>
                    <select
                      className="search-input"
                      style={{ paddingLeft: '1rem', appearance: 'auto' }}
                      value={form.expirationYears}
                      onChange={(e) => setForm({ ...form, expirationYears: e.target.value })}
                    >
                      <option value="1">1 Tahun</option>
                      <option value="2">2 Tahun</option>
                      <option value="3">3 Tahun</option>
                      <option value="forever">Selamanya (Tidak Disarankan)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {newKey ? (
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={closeModal}>
                  Sudah Saya Simpan
                </button>
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={closeModal}>Batal</button>
                  <button className="btn btn-primary" onClick={handleCreate} disabled={saving || !form.name}>
                    {saving ? "Generating..." : "Generate Key"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
