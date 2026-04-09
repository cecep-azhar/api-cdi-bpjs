"use client";

import { useEffect, useState } from "react";

type Tindakan = { id: number; kodeCdi: string; name: string };
type Diagnosa = { id: number; kodeCdi: string; name: string };
type BpjsItem = {
  id: number;
  kodeBpjs: string;
  tindakanId: number | null;
  diagnosaId: number | null;
  tariff: number;
  isActive: boolean;
};

const emptyForm = {
  kodeBpjs: "",
  tindakanId: "",
  diagnosaId: "",
  tariff: "",
  isActive: true,
};

export default function BpjsPage() {
  const [data, setData] = useState<BpjsItem[]>([]);
  const [filtered, setFiltered] = useState<BpjsItem[]>([]);
  const [tindakanList, setTindakanList] = useState<Tindakan[]>([]);
  const [diagnosaList, setDiagnosaList] = useState<Diagnosa[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<BpjsItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync/get?last_sync=0");
      const json = await res.json();
      setData(json.data?.bpjs || []);
      setTindakanList(json.data?.tindakan || []);
      setDiagnosaList(json.data?.diagnosa || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(data.filter((d) => d.kodeBpjs.toLowerCase().includes(q)));
  }, [data, search]);

  const getTindakanName = (id: number | null) => {
    if (!id) return "-";
    const t = tindakanList.find((t) => t.id === id);
    return t ? `${t.kodeCdi} - ${t.name}` : id;
  };

  const getDiagnosaName = (id: number | null) => {
    if (!id) return "-";
    const d = diagnosaList.find((d) => d.id === id);
    return d ? `${d.kodeCdi} - ${d.name}` : id;
  };

  const formatRupiah = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item: BpjsItem) => {
    setEditItem(item);
    setForm({
      kodeBpjs: item.kodeBpjs,
      tindakanId: item.tindakanId?.toString() || "",
      diagnosaId: item.diagnosaId?.toString() || "",
      tariff: item.tariff.toString(),
      isActive: item.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const body = {
        ...(editItem ? { id: editItem.id } : {}),
        kodeBpjs: form.kodeBpjs,
        tindakanId: form.tindakanId ? parseInt(form.tindakanId) : null,
        diagnosaId: form.diagnosaId ? parseInt(form.diagnosaId) : null,
        tariff: parseFloat(form.tariff) || 0,
        isActive: form.isActive,
      };
      const res = await fetch("/api/bpjs", {
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
    await fetch("/api/bpjs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">BPJS</h1>
        <p className="page-desc">Kelola mapping kode BPJS dengan tindakan & diagnosa</p>
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
              placeholder="Cari kode BPJS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)" }} onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah BPJS
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
            </svg>
            <p>Belum ada data BPJS</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode BPJS</th>
                  <th>Tindakan</th>
                  <th>Diagnosa</th>
                  <th>Tarif</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td><code style={{ color: "#67e8f9", fontSize: "0.8rem" }}>{item.kodeBpjs}</code></td>
                    <td style={{ fontSize: "0.8rem", color: "rgba(230,237,243,0.65)" }}>{getTindakanName(item.tindakanId)}</td>
                    <td style={{ fontSize: "0.8rem", color: "rgba(230,237,243,0.65)" }}>{getDiagnosaName(item.diagnosaId)}</td>
                    <td style={{ color: "#4ade80", fontWeight: 600 }}>{formatRupiah(item.tariff)}</td>
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
            <div className="modal-title">{editItem ? "Edit BPJS" : "Tambah BPJS"}</div>
            <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="form-field">
                <label>Kode BPJS</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Contoh: B001"
                  value={form.kodeBpjs}
                  onChange={(e) => setForm({ ...form, kodeBpjs: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label>Tindakan (opsional)</label>
                <select
                  className="form-input"
                  value={form.tindakanId}
                  onChange={(e) => setForm({ ...form, tindakanId: e.target.value })}
                >
                  <option value="">-- Pilih Tindakan --</option>
                  {tindakanList.map((t) => (
                    <option key={t.id} value={t.id}>{t.kodeCdi} - {t.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Diagnosa (opsional)</label>
                <select
                  className="form-input"
                  value={form.diagnosaId}
                  onChange={(e) => setForm({ ...form, diagnosaId: e.target.value })}
                >
                  <option value="">-- Pilih Diagnosa --</option>
                  {diagnosaList.map((d) => (
                    <option key={d.id} value={d.id}>{d.kodeCdi} - {d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Tarif (Rp)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="0"
                  value={form.tariff}
                  onChange={(e) => setForm({ ...form, tariff: e.target.value })}
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
