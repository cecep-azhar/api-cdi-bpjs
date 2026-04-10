"use client";

import { useEffect, useState, useRef } from "react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bpjsRes, tindakanRes, diagnosaRes] = await Promise.all([
        fetch("/api/bpjs"),
        fetch("/api/tindakan"),
        fetch("/api/diagnosa"),
      ]);
      const [bpjsJson, tindakanJson, diagnosaJson] = await Promise.all([
        bpjsRes.json(),
        tindakanRes.json(),
        diagnosaRes.json(),
      ]);
      setData(bpjsJson.success ? bpjsJson.data || [] : []);
      setTindakanList(tindakanJson.success ? tindakanJson.data || [] : []);
      setDiagnosaList(diagnosaJson.success ? diagnosaJson.data || [] : []);
    } catch (err) {
      console.error("Fetch error:", err);
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
    const headers = ["kode_bpjs", "kode_tindakan", "kode_diagnosa", "tarif", "is_active"];
    const rows = data.map(d => {
      const t = tindakanList.find(x => x.id === d.tindakanId)?.kodeCdi || "";
      const dg = diagnosaList.find(x => x.id === d.diagnosaId)?.kodeCdi || "";
      return `${d.kodeBpjs},${t},${dg},${d.tariff},${d.isActive ? 1 : 0}`;
    });
    downloadCsv("bpjs_export.csv", [headers.join(","), ...rows].join("\n"));
  };

  const handleDownloadSample = () => {
    const content = "kode_bpjs,kode_tindakan,kode_diagnosa,tarif,is_active\nB001,T001,D001,150000,1\nB002,T002,,50000,1\nB003,,D002,75000,1";
    downloadCsv("bpjs_template.csv", content);
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
          if (cols.length >= 4) {
            const kB = cols[0].replace(/^"|"$/g, "").trim();
            const kT = cols[1]?.replace(/^"|"$/g, "").trim();
            const kD = cols[2]?.replace(/^"|"$/g, "").trim();
            const tarif = parseFloat(cols[3].replace(/^"|"$/g, "").trim()) || 0;
            const isAct = cols[4] ? cols[4].replace(/^"|"$/g, "").trim() === "1" : true;

            const tMatch = tindakanList.find(x => x.kodeCdi.toLowerCase() === kT.toLowerCase());
            const dMatch = diagnosaList.find(x => x.kodeCdi.toLowerCase() === kD.toLowerCase());

            payload.push({
              kodeBpjs: kB,
              tindakanId: tMatch ? tMatch.id : null,
              diagnosaId: dMatch ? dMatch.id : null,
              tariff: tarif,
              isActive: isAct
            });
          }
        }

        const res = await fetch("/api/bpjs", {
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
    <div className="animate-in fade-in duration-500">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Mapping BPJS</h1>
          <p className="page-desc">Kelola tarif/mapping kode BPJS dengan tindakan & diagnosa medical</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Mapping
        </button>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <h2 className="card-title">Daftar Mapping BPJS</h2>
          <div className="toolbar" style={{ margin: 0 }}>
            <div className="search-container" style={{ width: '300px' }}>
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Cari kode BPJS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={handleDownloadSample} title="Unduh Template">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button className="btn btn-secondary" onClick={handleExport} title="Export CSV">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </button>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImport} style={{ display: 'none' }} />
              <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} title="Import CSV">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="card-content" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Memuat data...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '5rem', textAlign: 'center' }}>
              <div style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto' }}>
                  <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
                </svg>
              </div>
              <p style={{ color: '#94a3b8', fontWeight: 500 }}>Belum ada data BPJS</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kode BPJS</th>
                    <th>Ref Tindakan</th>
                    <th>Ref Diagnosa</th>
                    <th>Tarif</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.kodeBpjs}</td>
                      <td style={{ fontSize: '0.85rem' }}>{getTindakanName(item.tindakanId)}</td>
                      <td style={{ fontSize: '0.85rem' }}>{getDiagnosaName(item.diagnosaId)}</td>
                      <td style={{ fontWeight: 700, color: '#16a34a' }}>{formatRupiah(item.tariff)}</td>
                      <td>
                        <span className={`badge ${item.isActive ? "badge-active" : "badge-inactive"}`}>
                          {item.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.25rem", justifyContent: "flex-end" }}>
                          <button className="btn-icon" onClick={() => openEdit(item)} title="Edit">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button className="btn-icon danger" onClick={() => handleDelete(item.id)} title="Hapus">
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {editItem ? "Edit Mapping BPJS" : "Tambah Mapping BPJS Baru"}
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Kode BPJS</label>
                  <input
                    className="search-input"
                    style={{ paddingLeft: '1rem' }}
                    type="text"
                    placeholder="Contoh: B001"
                    value={form.kodeBpjs}
                    onChange={(e) => setForm({ ...form, kodeBpjs: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Tindakan (Opsional)</label>
                  <select
                    className="search-input"
                    style={{ paddingLeft: '1rem', appearance: 'auto' }}
                    value={form.tindakanId}
                    onChange={(e) => setForm({ ...form, tindakanId: e.target.value })}
                  >
                    <option value="">-- Pilih Tindakan --</option>
                    {tindakanList.map((t) => (
                      <option key={t.id} value={t.id}>{t.kodeCdi} - {t.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Diagnosa (Opsional)</label>
                  <select
                    className="search-input"
                    style={{ paddingLeft: '1rem', appearance: 'auto' }}
                    value={form.diagnosaId}
                    onChange={(e) => setForm({ ...form, diagnosaId: e.target.value })}
                  >
                    <option value="">-- Pilih Diagnosa --</option>
                    {diagnosaList.map((d) => (
                      <option key={d.id} value={d.id}>{d.kodeCdi} - {d.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Tarif (Rp)</label>
                  <input
                    className="search-input"
                    style={{ paddingLeft: '1rem' }}
                    type="number"
                    placeholder="0"
                    value={form.tariff}
                    onChange={(e) => setForm({ ...form, tariff: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Status</label>
                  <select
                    className="search-input"
                    style={{ paddingLeft: '1rem', appearance: 'auto' }}
                    value={form.isActive ? "1" : "0"}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === "1" })}
                  >
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
