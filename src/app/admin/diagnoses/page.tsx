"use client";

/**
 * ============================================
 * CDI BPJS - Medical Data Synchronization API
 * ============================================
 * Author    : Cecep Saeful Azhar Hidayat, ST
 * WhatsApp  : 0852-2069-6117
 * Email     : cecepazhar126@gmail.com
 * ============================================
 */

import { useEffect, useState, useRef, useCallback } from "react";

type Diagnosis = { id: number; cdiCode: string; name: string; description?: string; icd10Id?: number | null; isActive: boolean; };
type Icd10Item = { id: number; code: string; nameId: string };
type PaginationInfo = { page: number; limit: number; total: number; totalPages: number; hasMore: boolean };
type ImportResult = { success: boolean; message: string; summary?: { total: number; success: number; errors: number }; errors?: { row: number; code: string; status: "error"; message?: string }[] };

const emptyForm = { cdiCode: "", name: "", description: "", icd10Id: "", isActive: true };

export default function DiagnosesPage() {
  const [data, setData] = useState<Diagnosis[]>([]);
  const [filtered, setFiltered] = useState<Diagnosis[]>([]);
  const [icd10List, setIcd10List] = useState<Icd10Item[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 50, total: 0, totalPages: 0, hasMore: false });
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Diagnosis | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportResult, setShowImportResult] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (page: number = 1, searchText: string = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "50", ...(searchText ? { search: searchText } : {}) });
      const [res, icd10Res] = await Promise.all([fetch(`/api/diagnoses?${params}`), fetch("/api/icd10")]);
      const json = await res.json();
      const icd10Json = await icd10Res.json();
      if (json.success) { setData(json.data || []); setFiltered(json.data || []); if (json.pagination) setPagination(json.pagination); setSelectedRows(new Set()); }
      else setData([]);
      if (icd10Json.success) setIcd10List(icd10Json.data || []); else setIcd10List([]);
    } catch (err) { console.error("Fetch error:", err); setData([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(1, search); }, [fetchData]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchData(1, search), 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [search, fetchData]);

  const handlePageChange = (newPage: number) => fetchData(newPage, search);
  const getIcd10Code = (id: number | null | undefined) => { if (!id) return "-"; const t = icd10List.find(t => t.id === id); return t ? t.code : id.toString(); };
  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item: Diagnosis) => { setEditItem(item); setForm({ cdiCode: item.cdiCode, name: item.name, description: item.description || "", icd10Id: item.icd10Id?.toString() || "", isActive: item.isActive }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.cdiCode || !form.name) { alert("Kode dan Nama harus diisi"); return; }
    setSaving(true);
    try {
      const method = editItem ? "PUT" : "POST";
      const payload = { ...(editItem ? { id: editItem.id } : {}), ...form, icd10Id: form.icd10Id ? parseInt(form.icd10Id) : null };
      const res = await fetch("/api/diagnoses", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) { setShowModal(false); fetchData(pagination.page, search); }
      else alert("Error: " + json.message);
    } catch (err) { console.error(err); alert("Terjadi kesalahan"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus data ini?")) return;
    try {
      const res = await fetch("/api/diagnoses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const json = await res.json();
      if (json.success) fetchData(pagination.page, search); else alert(json.message || "Gagal menghapus data");
    } catch (err) { console.error(err); alert("Terjadi kesalahan"); }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;
    if (!confirm(`Hapus ${selectedRows.size} item yang dipilih?`)) return;
    setLoading(true); let successCount = 0; let errorCount = 0;
    for (const id of selectedRows) {
      try {
        const res = await fetch("/api/diagnoses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        const json = await res.json();
        if (json.success) successCount++; else errorCount++;
      } catch { errorCount++; }
    }
    setLoading(false); setShowDeleteModal(false); setSelectedRows(new Set());
    alert(`Berhasil hapus ${successCount} item${errorCount > 0 ? `, ${errorCount} gagal` : ''}`);
    fetchData(1, search);
  };

  const toggleSelectRow = (id: number) => { const newSelected = new Set(selectedRows); newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id); setSelectedRows(newSelected); };
  const toggleSelectAll = () => selectedRows.size === filtered.length ? setSelectedRows(new Set()) : setSelectedRows(new Set(filtered.map(d => d.id)));

  const downloadCsv = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.setAttribute("download", filename);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleExportSelected = () => {
    if (selectedRows.size === 0) { alert("Pilih item yang akan di-export"); return; }
    const selectedData = data.filter(d => selectedRows.has(d.id));
    const headers = ["cdi_code", "diagnosis_name", "icd10_id", "is_active"];
    const rows = selectedData.map(d => `${d.cdiCode},"${d.name.replace(/"/g, '""')}",${d.icd10Id || ""},${d.isActive ? 1 : 0}`);
    downloadCsv("diagnoses_selected_export.csv", [headers.join(","), ...rows].join("\n"));
  };

  const handleExportAll = () => {
    const headers = ["cdi_code", "diagnosis_name", "icd10_id", "is_active"];
    const rows = data.map(d => `${d.cdiCode},"${d.name.replace(/"/g, '""')}",${d.icd10Id || ""},${d.isActive ? 1 : 0}`);
    downloadCsv("diagnoses_export.csv", [headers.join(","), ...rows].join("\n"));
  };

  const handleExportFiltered = () => {
    const headers = ["cdi_code", "diagnosis_name", "icd10_id", "is_active"];
    const rows = filtered.map(d => `${d.cdiCode},"${d.name.replace(/"/g, '""')}",${d.icd10Id || ""},${d.isActive ? 1 : 0}`);
    downloadCsv("diagnoses_filtered_export.csv", [headers.join(","), ...rows].join("\n"));
  };

  const handleDownloadSample = () => downloadCsv("diagnoses_template.csv", "cdi_code,diagnosis_name,icd10_id,is_active\nD001,Sample Diagnosis,null,1\nD002,Dengue Fever,null,1");

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
            payload.push({ cdiCode: cols[0].replace(/^"|"$/g, "").trim(), name: cols[1].replace(/^"|"$/g, "").trim(), icd10Id: cols[2] ? parseInt(cols[2].replace(/^"|"$/g, "").trim()) || null : null, isActive: cols[3] ? cols[3].replace(/^"|"$/g, "").trim() === "1" : true });
          }
        }
        const res = await fetch("/api/diagnoses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const json = await res.json();
        setImportResult(json); setShowImportResult(true);
        if (json.success || (json.summary && json.summary.errors < json.summary.total)) fetchData(1, search);
      } catch (err) { alert("An error occurred while processing the CSV file."); console.error(err); }
      finally { setLoading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="page-header">
        <div className="header-left"><h1 className="page-title">Diagnosis Data</h1><p className="page-desc">Manage CDI medical diagnoses master data centrally</p></div>
        <button className="btn btn-primary" onClick={openAdd}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Add Diagnosis</button>
      </div>

      {showImportResult && importResult && (
        <div style={{ background: importResult.success ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", border: `1px solid ${importResult.success ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`, borderRadius: "12px", padding: "1rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <h3 style={{ color: importResult.success ? "#4ade80" : "#f87171", margin: 0 }}>{importResult.message}</h3>
            <button onClick={() => setShowImportResult(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.25rem" }}>×</button>
          </div>
          {importResult.summary && <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Total: {importResult.summary.total} | Berhasil: {importResult.summary.success} | Gagal: {importResult.summary.errors}</div>}
          {importResult.errors && importResult.errors.length > 0 && (
            <div style={{ marginTop: "0.75rem", maxHeight: "200px", overflowY: "auto" }}>
              <div style={{ color: "#f87171", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.5rem" }}>Detail Error:</div>
              {importResult.errors.slice(0, 10).map((err, idx) => <div key={idx} style={{ fontSize: "0.75rem", color: "#f87171", marginBottom: "0.25rem" }}>Row {err.row}: {err.code} - {err.message}</div>)}
              {importResult.errors.length > 10 && <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>... dan {importResult.errors.length - 10} error lainnya</div>}
            </div>
          )}
        </div>
      )}

      <div className="admin-card">
        <div className="card-header">
          <h2 className="card-title">Diagnosis List ({pagination.total} total)</h2>
          <div className="toolbar" style={{ margin: 0 }}>
            <div className="search-container" style={{ width: "300px" }}>
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input className="search-input" type="text" placeholder="Search code or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {selectedRows.size > 0 && (<>
                <button className="btn btn-secondary" onClick={handleExportSelected}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>Export ({selectedRows.size})</button>
                <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>Delete ({selectedRows.size})</button>
              </>)}
              <button className="btn btn-secondary" onClick={handleDownloadSample} title="Download Template"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button>
              <button className="btn btn-secondary" onClick={handleExportAll} title="Export All"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg></button>
              <button className="btn btn-secondary" onClick={handleExportFiltered} title="Export Filtered"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg></button>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} style={{ display: "none" }} />
              <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} title="Import CSV"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg></button>
            </div>
          </div>
        </div>

        <div className="card-content" style={{ padding: 0 }}>
          {loading ? (<div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>Loading data...</div>) : filtered.length === 0 ? (
            <div style={{ padding: "5rem", textAlign: "center" }}>
              <div style={{ color: "#e2e8f0", marginBottom: "1rem" }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: "0 auto" }}><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
              </div>
              <p style={{ color: "#94a3b8", fontWeight: 500 }}>No diagnoses data yet</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead><tr><th style={{ width: "40px" }}><input type="checkbox" checked={selectedRows.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} style={{ cursor: "pointer", width: "16px", height: "16px" }} /></th><th>CDI Code</th><th>Diagnosis Name</th><th>ICD-10</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} style={{ backgroundColor: selectedRows.has(item.id) ? "rgba(99, 102, 241, 0.1)" : "transparent" }}>
                        <td><input type="checkbox" checked={selectedRows.has(item.id)} onChange={() => toggleSelectRow(item.id)} style={{ cursor: "pointer", width: "16px", height: "16px" }} /></td>
                        <td style={{ fontWeight: 600, color: "#0f172a" }}>{item.cdiCode}</td>
                        <td>{item.name}</td>
                        <td style={{ fontSize: "0.85rem", color: "#64748b" }}>{item.icd10Id ? <span style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>{getIcd10Code(item.icd10Id)}</span> : "-"}</td>
                        <td><span className={`badge ${item.isActive ? "badge-active" : "badge-inactive"}`}>{item.isActive ? "Active" : "Inactive"}</span></td>
                        <td><div style={{ display: "flex", gap: "0.25rem", justifyContent: "flex-end" }}>
                          <button className="btn-icon" onClick={() => openEdit(item)} title="Edit"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                          <button className="btn-icon danger" onClick={() => handleDelete(item.id)} title="Delete"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pagination.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", padding: "1rem", borderTop: "1px solid #e2e8f0" }}>
                  <button className="btn btn-secondary" disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)} style={{ padding: "0.5rem 1rem" }}>Previous</button>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total})</span>
                  <button className="btn btn-secondary" disabled={!pagination.hasMore} onClick={() => handlePageChange(pagination.page + 1)} style={{ padding: "0.5rem 1rem" }}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">{editItem ? "Edit Diagnosis" : "Add New Diagnosis"}</div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>CDI Code <span style={{ color: "#ef4444" }}>*</span></label>
                  <input className="search-input" style={{ paddingLeft: "1rem" }} type="text" placeholder="Example: D001" value={form.cdiCode} onChange={(e) => setForm({ ...form, cdiCode: e.target.value.toUpperCase() })} />
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Format: awali dengan "D" atau "D-" (contoh: D001, D-BRN-01)</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>Diagnosis Name <span style={{ color: "#ef4444" }}>*</span></label>
                  <input className="search-input" style={{ paddingLeft: "1rem" }} type="text" placeholder="Medical diagnosis name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>ICD-10 ID (Optional)</label>
                  <select className="search-input" style={{ paddingLeft: "1rem", appearance: "auto" }} value={form.icd10Id} onChange={(e) => setForm({ ...form, icd10Id: e.target.value })}>
                    <option value="">-- No ICD-10 Mapping --</option>
                    {icd10List.map(t => <option key={t.id} value={t.id}>{t.code} - {t.nameId}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>Description (Optional)</label>
                  <textarea className="search-input" style={{ padding: "0.75rem 1rem", minHeight: "80px", resize: "vertical" }} placeholder="Detailed explanation of the diagnosis" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>Status</label>
                  <select className="search-input" style={{ paddingLeft: "1rem", appearance: "auto" }} value={form.isActive ? "1" : "0"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "1" })}>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-box" style={{ maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Confirm Delete</div>
            <div className="modal-body"><p style={{ color: "#0f172a", margin: 0 }}>Are you sure you want to delete <strong>{selectedRows.size}</strong> selected items? This action cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleBulkDelete}>Delete All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}