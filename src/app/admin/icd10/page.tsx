"use client";

/**
 * ============================================
 * CDI BPJS - Medical Data Synchronization API
 * ============================================
 * Author    : Cecep Saeful Azhar Hidayat, ST
 * WhatsApp  : 0852-2069-9117
 * Email     : cecepazhar126@gmail.com
 * ============================================
 */

import { useEffect, useState, useRef } from "react";

type ICD10Item = {
  id: number;
  code: string;
  nameId: string;
  nameEn?: string;
  isActive: boolean;
};

const emptyForm = { code: "", nameId: "", nameEn: "", isActive: true };

export default function ICD10Page() {
  const [data, setData] = useState<ICD10Item[]>([]);
  const [filtered, setFiltered] = useState<ICD10Item[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ICD10Item | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/icd10");
      const json = await res.json();
      if (json.success) {
        setData(json.data || []);
      } else {
        console.error("Failed to load data:", json.message);
        setData([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(data.filter((d) =>
      d.code.toLowerCase().includes(q) || d.nameId.toLowerCase().includes(q)
    ));
  }, [data, search]);

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item: ICD10Item) => {
    setEditItem(item);
    setForm({
      code: item.code,
      nameId: item.nameId,
      nameEn: item.nameEn || "",
      isActive: item.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.nameId) {
      alert("Kode dan Nama ID harus diisi");
      return;
    }

    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const payload = editItem ? { id: editItem.id, ...form } : form;

      const res = await fetch("/api/icd10", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        fetchData();
      } else {
        alert("Error: " + json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus data ini?")) return;
    try {
      const res = await fetch("/api/icd10", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        alert("Error: " + json.message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    }
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
    const headers = ["code", "name_id", "name_en", "is_active"];
    const rows = data.map((d) => `${d.code},"${d.nameId.replace(/"/g, '""')}","${(d.nameEn || "").replace(/"/g, '""')}",${d.isActive ? 1 : 0}`);
    downloadCsv("icd10_export.csv", [headers.join(","), ...rows].join("\n"));
  };

  const handleDownloadSample = () => {
    const content = "code,name_id,name_en,is_active\nA00,Kolera,Cholera,1\nA01,Demam Tifoid,Typhoid fever,1";
    downloadCsv("icd10_template.csv", content);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
              code: cols[0].replace(/^"|"$/g, "").trim(),
              nameId: cols[1].replace(/^"|"$/g, "").trim(),
              nameEn: cols[2] ? cols[2].replace(/^"|"$/g, "").trim() : "",
              isActive: cols[3] ? cols[3].replace(/^"|"$/g, "").trim() === "1" : true,
            });
          }
        }

        const res = await fetch("/api/icd10", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();

        if (json.success) {
          alert(`Success: ${json.message}`);
          fetchData();
        } else {
          alert(`Failed: ${json.message}`);
        }
      } catch (err) {
        alert("An error occurred while processing the CSV file.");
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
          <h1 className="page-title">ICD-10 Data</h1>
          <p className="page-desc">Manage ICD-10 master data centrally</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add ICD-10
        </button>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <h2 className="card-title">ICD-10 List</h2>
          <div className="toolbar" style={{ margin: 0 }}>
            <div className="search-container" style={{ width: "300px" }}>
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search code or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-secondary" onClick={handleDownloadSample} title="Download Template">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </button>
              <button className="btn btn-secondary" onClick={handleExport} title="Export CSV">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </button>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} style={{ display: "none" }} />
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
            <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Loading data...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "5rem", textAlign: "center" }}>
              <div style={{ color: "#e2e8f0", marginBottom: "1rem" }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: "0 auto" }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p style={{ color: "#94a3b8", fontWeight: 500 }}>No ICD-10 data yet</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name (ID)</th>
                    <th>Name (EN)</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>{item.code}</td>
                      <td>{item.nameId}</td>
                      <td>{item.nameEn || "-"}</td>
                      <td>
                        <span className={`badge ${item.isActive ? "badge-active" : "badge-inactive"}`}>
                          {item.isActive ? "Active" : "Inactive"}
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
                          <button className="btn-icon danger" onClick={() => handleDelete(item.id)} title="Delete">
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
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">{editItem ? "Edit ICD-10" : "Add New ICD-10"}</div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>Code</label>
                  <input
                    className="search-input"
                    style={{ paddingLeft: "1rem" }}
                    type="text"
                    placeholder="Example: A00"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>Name (Indonesia)</label>
                  <input
                    className="search-input"
                    style={{ paddingLeft: "1rem" }}
                    type="text"
                    placeholder="Nama diagnosis"
                    value={form.nameId}
                    onChange={(e) => setForm({ ...form, nameId: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>Name (English)</label>
                  <input
                    className="search-input"
                    style={{ paddingLeft: "1rem" }}
                    type="text"
                    placeholder="Diagnosis name"
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>Status</label>
                  <select
                    className="search-input"
                    style={{ paddingLeft: "1rem", appearance: "auto" }}
                    value={form.isActive ? "1" : "0"}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === "1" })}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
