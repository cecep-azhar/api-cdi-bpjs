"use client";

import { useEffect, useState } from "react";

type Diagnosa = {
  id: number;
  kodeCdi: string;
  name: string;
  isActive: boolean;
};

const emptyForm = { kodeCdi: "", name: "", isActive: true };

export default function DiagnosaPage() {
  const [data, setData] = useState<Diagnosa[]>([]);
  const [filtered, setFiltered] = useState<Diagnosa[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Diagnosa | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync/get?last_sync=0");
      const json = await res.json();
      setData(json.data?.diagnosa || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(data.filter((d) =>
      d.kodeCdi.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)
    ));
  }, [data, search]);

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item: Diagnosa) => {
    setEditItem(item);
    setForm({ kodeCdi: item.kodeCdi, name: item.name, isActive: item.isActive });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const body = editItem ? { ...form, id: editItem.id } : form;
      const res = await fetch("/api/diagnosa", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        fetchData();
      } else {
        alert(json.message || "Gagal menyimpan");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus data ini?")) return;
    await fetch("/api/diagnosa", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Diagnosa</h1>
        <p className="page-desc">Kelola data master diagnosa CDI</p>
      </div>

      <div className="admin-card">
        <div className="toolbar">
          <div className="search-bar-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className="search-bar"
              type="text"
              placeholder="Cari kode atau nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" style={{ background: "linear-gradient(135deg, #8b5cf6, #a855f7)" }} onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Diagnosa
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
            <p>Belum ada data diagnosa</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode CDI</th>
                  <th>Nama</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td><code style={{ color: "#c4b5fd", fontSize: "0.8rem" }}>{item.kodeCdi}</code></td>
                    <td>{item.name}</td>
                    <td>
                      <span className={item.isActive ? "badge-active" : "badge-inactive"}>
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-secondary" onClick={() => openEdit(item)}>Edit</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{editItem ? "Edit Diagnosa" : "Tambah Diagnosa"}</div>
            <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="form-field">
                <label>Kode CDI</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Contoh: D001"
                  value={form.kodeCdi}
                  onChange={(e) => setForm({ ...form, kodeCdi: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Nama Diagnosa</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Nama diagnosa medis"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Status</label>
                <select
                  className="form-input"
                  value={form.isActive ? "1" : "0"}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === "1" })}
                >
                  <option value="1">Aktif</option>
                  <option value="0">Nonaktif</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
