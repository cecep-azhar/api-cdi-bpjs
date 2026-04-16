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

type Procedure = { id: number; cdiCode: string; name: string; icd9Id?: number | null };
type Diagnosis = { id: number; cdiCode: string; name: string; icd10Id?: number | null };
type Icd9Item = { id: number; code: string; nameId: string };
type Icd10Item = { id: number; code: string; nameId: string };
type BpjsItem = {
  id: number;
  bpjsCode: string;
  procedureId: number | null;
  diagnosisId: number | null;
  baseTariff: number;
  isActive: boolean;
};

const emptyForm = {
  bpjsCode: "",
  procedureId: "",
  diagnosisId: "",
  baseTariff: "",
  isActive: true,
};

export default function BpjsPage() {
  const [data, setData] = useState<BpjsItem[]>([]);
  const [filtered, setFiltered] = useState<BpjsItem[]>([]);
  const [procedureList, setProcedureList] = useState<Procedure[]>([]);
  const [diagnosisList, setDiagnosisList] = useState<Diagnosis[]>([]);
  const [icd9List, setIcd9List] = useState<Icd9Item[]>([]);
  const [icd10List, setIcd10List] = useState<Icd10Item[]>([]);
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
      const [bpjsRes, proceduresRes, diagnosesRes, icd9Res, icd10Res] = await Promise.all([
        fetch("/api/bpjs"),
        fetch("/api/procedures"),
        fetch("/api/diagnoses"),
        fetch("/api/icd9"),
        fetch("/api/icd10"),
      ]);
      const [bpjsJson, proceduresJson, diagnosesJson, icd9Json, icd10Json] = await Promise.all([
        bpjsRes.json(),
        proceduresRes.json(),
        diagnosesRes.json(),
        icd9Res.json(),
        icd10Res.json(),
      ]);
      setData(bpjsJson.success ? bpjsJson.data || [] : []);
      setProcedureList(proceduresJson.success ? proceduresJson.data || [] : []);
      setDiagnosisList(diagnosesJson.success ? diagnosesJson.data || [] : []);
      setIcd9List(icd9Json.success ? icd9Json.data || [] : []);
      setIcd10List(icd10Json.success ? icd10Json.data || [] : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(data.filter((d) => d.bpjsCode.toLowerCase().includes(q)));
  }, [data, search]);

  const getProcedureName = (id: number | null) => {
    if (!id) return "-";
    const t = procedureList.find((t) => t.id === id);
    return t ? `${t.cdiCode} - ${t.name}` : id;
  };

  const getDiagnosisName = (id: number | null) => {
    if (!id) return "-";
    const d = diagnosisList.find((d) => d.id === id);
    return d ? `${d.cdiCode} - ${d.name}` : id;
  };

  const getIcd9CodeForProcedure = (procedureId: number | null) => {
    if (!procedureId) return "-";
    const proc = procedureList.find((p) => p.id === procedureId);
    if (!proc || !proc.icd9Id) return "-";
    const icd9 = icd9List.find((i) => i.id === proc.icd9Id);
    return icd9 ? icd9.code : "-";
  };

  const getIcd10CodeForDiagnosis = (diagnosisId: number | null) => {
    if (!diagnosisId) return "-";
    const diag = diagnosisList.find((d) => d.id === diagnosisId);
    if (!diag || !diag.icd10Id) return "-";
    const icd10 = icd10List.find((i) => i.id === diag.icd10Id);
    return icd10 ? icd10.code : "-";
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
      bpjsCode: item.bpjsCode,
      procedureId: item.procedureId?.toString() || "",
      diagnosisId: item.diagnosisId?.toString() || "",
      baseTariff: item.baseTariff.toString(),
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
        bpjsCode: form.bpjsCode,
        procedureId: form.procedureId ? parseInt(form.procedureId) : null,
        diagnosisId: form.diagnosisId ? parseInt(form.diagnosisId) : null,
        baseTariff: parseFloat(form.baseTariff) || 0,
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
        alert(json.message || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
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
    const headers = ["bpjs_code", "procedure_code", "diagnosis_code", "base_tariff", "is_active"];
    const rows = data.map(d => {
      const t = procedureList.find(x => x.id === d.procedureId)?.cdiCode || "";
      const dg = diagnosisList.find(x => x.id === d.diagnosisId)?.cdiCode || "";
      return `${d.bpjsCode},${t},${dg},${d.baseTariff},${d.isActive ? 1 : 0}`;
    });
    downloadCsv("bpjs_export.csv", [headers.join(","), ...rows].join("\n"));
  };

  const handleDownloadSample = () => {
    const content = "bpjs_code,procedure_code,diagnosis_code,base_tariff,is_active\nB001,P-BRN-01,D-BRN-01,1500000,1\nB002,P-NEB-01,,250000,1\nB003,,D-PNE-01,1000000,1";
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

            const tMatch = procedureList.find(x => x.cdiCode.toLowerCase() === kT.toLowerCase());
            const dMatch = diagnosisList.find(x => x.cdiCode.toLowerCase() === kD.toLowerCase());

            payload.push({
              bpjsCode: kB,
              procedureId: tMatch ? tMatch.id : null,
              diagnosisId: dMatch ? dMatch.id : null,
              baseTariff: tarif,
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
          <h1 className="page-title">BPJS Mapping</h1>
          <p className="page-desc">Manage BPJS code tariffs/mappings with medical procedures & diagnoses</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Mapping
        </button>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <h2 className="card-title">BPJS Mapping List</h2>
          <div className="toolbar" style={{ margin: 0 }}>
            <div className="search-container" style={{ width: '300px' }}>
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search BPJS code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading data...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '5rem', textAlign: 'center' }}>
              <div style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto' }}>
                  <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
                </svg>
              </div>
              <p style={{ color: '#94a3b8', fontWeight: 500 }}>No BPJS data yet</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>BPJS Code</th>
                    <th>Procedure Ref</th>
                    <th>ICD-9</th>
                    <th>Diagnosis Ref</th>
                    <th>ICD-10</th>
                    <th>Tariff</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.bpjsCode}</td>
                      <td style={{ fontSize: '0.85rem' }}>{getProcedureName(item.procedureId)}</td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {getIcd9CodeForProcedure(item.procedureId) !== "-" ? <span style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{getIcd9CodeForProcedure(item.procedureId)}</span> : "-"}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{getDiagnosisName(item.diagnosisId)}</td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {getIcd10CodeForDiagnosis(item.diagnosisId) !== "-" ? <span style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{getIcd10CodeForDiagnosis(item.diagnosisId)}</span> : "-"}
                      </td>
                      <td style={{ fontWeight: 700, color: '#16a34a' }}>{formatRupiah(item.baseTariff)}</td>
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
          <div className="modal-box" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {editItem ? "Edit BPJS Mapping" : "Add New BPJS Mapping"}
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>BPJS Code</label>
                  <input
                    className="search-input"
                    style={{ paddingLeft: '1rem' }}
                    type="text"
                    placeholder="Example: B001"
                    value={form.bpjsCode}
                    onChange={(e) => setForm({ ...form, bpjsCode: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Procedure (Optional)</label>
                  <select
                    className="search-input"
                    style={{ paddingLeft: '1rem', appearance: 'auto' }}
                    value={form.procedureId}
                    onChange={(e) => setForm({ ...form, procedureId: e.target.value })}
                  >
                    <option value="">-- Select Procedure --</option>
                    {procedureList.map((t) => (
                      <option key={t.id} value={t.id}>{t.cdiCode} - {t.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Diagnosis (Optional)</label>
                  <select
                    className="search-input"
                    style={{ paddingLeft: '1rem', appearance: 'auto' }}
                    value={form.diagnosisId}
                    onChange={(e) => setForm({ ...form, diagnosisId: e.target.value })}
                  >
                    <option value="">-- Select Diagnosis --</option>
                    {diagnosisList.map((d) => (
                      <option key={d.id} value={d.id}>{d.cdiCode} - {d.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Tariff (Rp)</label>
                  <input
                    className="search-input"
                    style={{ paddingLeft: '1rem' }}
                    type="number"
                    placeholder="0"
                    value={form.baseTariff}
                    onChange={(e) => setForm({ ...form, baseTariff: e.target.value })}
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
