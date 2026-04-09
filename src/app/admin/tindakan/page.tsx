"use client";

import { useEffect, useState, useRef } from "react";

type Tindakan = {
  id: number;
  kodeCdi: string;
  name: string;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

const emptyForm = { kodeCdi: "", name: "", isActive: true };

export default function TindakanPage() {
  const [data, setData] = useState<Tindakan[]>([]);
  const [filtered, setFiltered] = useState<Tindakan[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Tindakan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync/get?last_sync=0");
      const json = await res.json();
      setData(json.data?.tindakan || []);
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

  const openEdit = (item: Tindakan) => {
    setEditItem(item);
    setForm({ kodeCdi: item.kodeCdi, name: item.name, isActive: item.isActive });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const body = editItem ? { ...form, id: editItem.id } : form;
      const res = await fetch("/api/tindakan", {
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
    await fetch("/api/tindakan", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const downloadCsv = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    const headers = ["kode_tindakan", "nama_tindakan", "is_active"];
    const rows = data.map(d => `${d.kodeCdi},"${d.name.replace(/"/g, '""')}",${d.isActive ? 1 : 0}`);
    downloadCsv("tindakan_export.csv", [headers.join(","), ...rows].join("\n"));
  };

  const handleDownloadSample = () => {
    const content = "kode_tindakan,nama_tindakan,is_active\nT001,\"Tindakan Contoh\",1\nT002,\"Suntik Vitamin\",1";
    downloadCsv("tindakan_template.csv", content);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r?\n/);
        const payload = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (cols.length >= 2) {
            payload.push({
              kodeCdi: cols[0].replace(/^"|"$/g, "").trim(),
              name: cols[1].replace(/^"|"$/g, "").trim(),
              isActive: cols[2] ? cols[2].replace(/^"|"$/g, "").trim() === "1" : true
            });
          }
        }

        const res = await fetch("/api/tindakan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        
        if (json.success) {
          alert(`Sukses: ${json.message}`);
          fetchData();
        } else {
          alert(`Gagal: ${json.message}`);
        }
      } catch (err) {
        alert("Terjadi kesalahan saat memproses file CSV.");
        console.error(err);
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tindakan</h1>
        <p className="page-desc">Kelola data master tindakan medis CDI</p>
      </div>

      <div className="admin-card">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
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
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handleDownloadSample}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Template
            </button>
            <button className="btn btn-secondary" onClick={handleExport}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Export
            </button>
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} style={{ display: 'none' }} />
            <button className="btn btn-success" onClick={() => fileInputRef.current?.click()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              Import CSV
            </button>
            <button className="btn btn-primary" onClick={openAdd}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tambah
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
            <p>Belum ada data tindakan</p>
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
                    <td><code style={{ color: "#7dd3fc", fontSize: "0.8rem" }}>{item.kodeCdi}</code></td>
                    <td>{item.name}</td>
                    <td>
                      <span className={item.isActive ? "badge-active" : "badge-inactive"}>
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn-icon" onClick={() => openEdit(item)} title="Edit">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button className="btn-icon danger" onClick={() => handleDelete(item.id)} title="Hapus">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{editItem ? "Edit Tindakan" : "Tambah Tindakan"}</div>
            <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="form-field">
                <label>Kode CDI</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Contoh: T001"
                  value={form.kodeCdi}
                  onChange={(e) => setForm({ ...form, kodeCdi: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Nama Tindakan</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Nama tindakan medis"
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
