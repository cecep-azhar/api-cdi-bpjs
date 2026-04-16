import { db } from "@/db";
import { icd9, icd10, procedures, diagnoses, bpjsMappings } from "@/db/schema";
import { eq } from "drizzle-orm";

// ICD-9 codes for respiratory/lung and bronchial diseases
const icd9Data = [
  // Acute bronchitis and bronchiolitis
  { code: "466.0", nameId: "Bronchitis akut - bronchiolitis", nameEn: "Acute bronchitis with bronchiolitis" },
  { code: "466.1", nameId: "Bronchitis akut tanpa penyebutan bronchiolitis", nameEn: "Acute bronchitis without mention of bronchiolitis" },
  
  // Chronic obstructive pulmonary disease
  { code: "490", nameId: "Bronkitis kronis tidak spesifik", nameEn: "Chronic bronchitis not specified as obstructive" },
  { code: "491.0", nameId: "PPOK - emfisema dengan eksaserbasi akut", nameEn: "Emphysema with acute exacerbation" },
  { code: "491.20", nameId: "PPOK - obstruktif dengan eksaserbasi akut", nameEn: "Obstructive chronic bronchitis with acute exacerbation" },
  { code: "491.21", nameId: "PPOK - obstruktif dengan riwayat eksaserbasi akut", nameEn: "Obstructive chronic bronchitis with history of acute exacerbation" },
  
  // Asthma
  { code: "493.0", nameId: "Asma eksogena", nameEn: "Extrinsic asthma" },
  { code: "493.1", nameId: "Asma endogena", nameEn: "Nonallergic asthma" },
  { code: "493.2", nameId: "Asma kronik obstruktif campuran", nameEn: "Chronic obstructive asthma" },
  { code: "493.9", nameId: "Asma tidak spesifik", nameEn: "Asthma unspecified" },
  { code: "493.02", nameId: "Asma eksogena dengan status asthmatikus", nameEn: "Extrinsic asthma with status asthmaticus" },
  { code: "493.92", nameId: "Asma tidak spesifik dengan status asthmatikus", nameEn: "Asthma unspecified with status asthmaticus" },
  
  // Pneumonia
  { code: "481", nameId: "Pneumonia pneumococcal", nameEn: "Pneumococcal pneumonia" },
  { code: "482.0", nameId: "Pneumonia streptococcal", nameEn: "Streptococcal pneumonia" },
  { code: "482.1", nameId: "Pneumonia hemophilus influenzae", nameEn: "Hemophilus influenzae pneumonia" },
  { code: "482.2", nameId: "Pneumonia streptococcus anaerob", nameEn: "Anaerobic streptococcal pneumonia" },
  { code: "482.3", nameId: "Pneumonia mycoplasma", nameEn: "Mycoplasma pneumoniae pneumonia" },
  { code: "482.8", nameId: "Pneumonia bakteri lainnya", nameEn: "Bacterial pneumonia other" },
  { code: "485", nameId: "Pneumonia bronkus", nameEn: "Bronchopneumonia" },
  { code: "486", nameId: "Pneumonia virus tidak spesifik", nameEn: "Viral pneumonia unspecified" },
  
  // Pulmonary edema
  { code: "514", nameId: "Edema paru akut", nameEn: "Acute pulmonary edema" },
  { code: "515.0", nameId: "Fibrosis paru idiopatik", nameEn: "Idiopathic pulmonary fibrosis" },
  
  // Lung abscess
  { code: "513.8", nameId: "Abses paru dan ekstension", nameEn: "Lung abscess with extension" },
  
  // Pleurisy
  { code: "511.0", nameId: "Pleuritis dengan efusi", nameEn: "Pleurisy with effusion" },
  { code: "511.1", nameId: "Pleuritis tanpa penyebutan efusi", nameEn: "Pleurisy without mention of effusion" },
  
  // Pneumothorax
  { code: "512.0", nameId: "Pneumotoraks spontan primer", nameEn: "Primary spontaneous pneumothorax" },
  { code: "512.1", nameId: "Pneumotoraks spontan sekunder", nameEn: "Secondary spontaneous pneumothorax" },
  
  // Tuberculosis
  { code: "011.0", nameId: "Tuberkulosis paru terbuka primer", nameEn: "Primary tuberculosis of lung" },
  { code: "011.1", nameId: "Tuberkulosis paru terbuka dari tuberkel kaseosa", nameEn: "Tuberculosis of lung with cavitation" },
  
  // Interstitial lung diseases
  { code: "516.1", nameId: "Pneumokoniosis - asbestosis", nameEn: "Asbestosis" },
  { code: "516.2", nameId: "Pneumokoniosis - silikosis", nameEn: "Silicosis" },
  { code: "516.3", nameId: "Pneumokoniosis - talcosis", nameEn: "Talcosis" },
];

// ICD-10 codes for respiratory/lung and bronchial diseases
const icd10Data = [
  // Acute bronchitis
  { code: "J20.0", nameId: "Bronkitis akut - kausanya mycoplasma", nameEn: "Acute bronchitis caused by Mycoplasma pneumoniae" },
  { code: "J20.1", nameId: "Bronkitis akut - kausanya hemophilus influenzae", nameEn: "Acute bronchitis caused by Hemophilus influenzae" },
  { code: "J20.2", nameId: "Bronkitis akut - kausanya streptococcus", nameEn: "Acute bronchitis caused by Streptococcus" },
  { code: "J20.3", nameId: "Bronkitis akut - kausanya coxsackievirus", nameEn: "Acute bronchitis caused by Coxsackievirus" },
  { code: "J20.9", nameId: "Bronkitis akut - penyebab tidak spesifik", nameEn: "Acute bronchitis unspecified" },
  
  // Acute bronchiolitis
  { code: "J21.0", nameId: "Bronkiolitis akut - kausanya virus respiratory syncytial", nameEn: "Acute bronchiolitis due to respiratory syncytial virus" },
  { code: "J21.1", nameId: "Bronkiolitis akut - kausanya human metapneumovirus", nameEn: "Acute bronchiolitis due to human metapneumovirus" },
  { code: "J21.9", nameId: "Bronkiolitis akut - penyebab tidak spesifik", nameEn: "Acute bronchiolitis unspecified" },
  
  // Chronic bronchitis
  { code: "J41.0", nameId: "Bronkitis kronis sederhana", nameEn: "Simple chronic bronchitis" },
  { code: "J41.1", nameId: "Bronkitis kronis mukoperiosteal", nameEn: "Mucopurulent chronic bronchitis" },
  { code: "J41.8", nameId: "Bronkitis kronis campuran", nameEn: "Mixed simple and mucopurulent chronic bronchitis" },
  
  // Chronic obstructive pulmonary disease
  { code: "J43.0", nameId: "Emfisema golongan unilateral", nameEn: "Unilateral emphysema" },
  { code: "J43.1", nameId: "Emfisema golongan pars", nameEn: "Panlobular emphysema" },
  { code: "J43.2", nameId: "Emfisema golongan irregular", nameEn: "Centrilobular emphysema" },
  { code: "J43.9", nameId: "Emfisema tidak spesifik", nameEn: "Emphysema unspecified" },
  
  { code: "J44.0", nameId: "PPOK dengan eksaserbasi akut infeksi saluran napas bawah", nameEn: "COPD with acute lower respiratory infection" },
  { code: "J44.1", nameId: "PPOK dengan eksaserbasi akut tanpa infeksi", nameEn: "COPD with acute exacerbation" },
  { code: "J44.9", nameId: "PPOK kronis tidak spesifik", nameEn: "Chronic obstructive pulmonary disease unspecified" },
  
  // Asthma
  { code: "J45.0", nameId: "Asma predominan alergetik", nameEn: "Predominantly allergic asthma" },
  { code: "J45.1", nameId: "Asma non-alergetik", nameEn: "Nonallergic asthma" },
  { code: "J45.8", nameId: "Asma campuran", nameEn: "Mixed asthma" },
  { code: "J45.9", nameId: "Asma tidak spesifik", nameEn: "Asthma unspecified" },
  
  { code: "J45.01", nameId: "Asma alergetik dengan eksaserbasi akut", nameEn: "Allergic asthma with exacerbation" },
  { code: "J45.02", nameId: "Asma alergetik dengan status asthmatikus", nameEn: "Allergic asthma with status asthmaticus" },
  { code: "J45.11", nameId: "Asma non-alergetik dengan eksaserbasi akut", nameEn: "Nonallergic asthma with exacerbation" },
  { code: "J45.12", nameId: "Asma non-alergetik dengan status asthmatikus", nameEn: "Nonallergic asthma with status asthmaticus" },
  { code: "J45.901", nameId: "Asma tidak spesifik dengan eksaserbasi akut", nameEn: "Unspecified asthma with exacerbation" },
  { code: "J45.902", nameId: "Asma tidak spesifik dengan status asthmatikus", nameEn: "Unspecified asthma with status asthmaticus" },
  
  // Pneumonia
  { code: "J12.0", nameId: "Pneumonia adenoviral", nameEn: "Adenoviral pneumonia" },
  { code: "J12.1", nameId: "Pneumonia Respiratory Syncytial Virus", nameEn: "Respiratory syncytial virus pneumonia" },
  { code: "J12.2", nameId: "Pneumonia parainfluenza virus", nameEn: "Parainfluenza virus pneumonia" },
  { code: "J12.3", nameId: "Pneumonia coronavirus", nameEn: "Coronavirus pneumonia" },
  { code: "J12.9", nameId: "Pneumonia virus tidak spesifik", nameEn: "Viral pneumonia unspecified" },
  
  { code: "J13", nameId: "Pneumonia pneumococcal", nameEn: "Pneumococcal pneumonia" },
  { code: "J14", nameId: "Pneumonia hemophilus influenzae", nameEn: "Hemophilus influenzae pneumonia" },
  
  { code: "J15.0", nameId: "Pneumonia streptococcus grup B", nameEn: "Streptococcus group B pneumonia" },
  { code: "J15.1", nameId: "Pneumonia staphylococcus", nameEn: "Staphylococcal pneumonia" },
  { code: "J15.2", nameId: "Pneumonia streptococcus lainnya", nameEn: "Streptococcus pneumonia other" },
  { code: "J15.8", nameId: "Pneumonia bakteri lainnya", nameEn: "Bacterial pneumonia other" },
  { code: "J15.9", nameId: "Pneumonia bakteri tidak spesifik", nameEn: "Bacterial pneumonia unspecified" },
  
  { code: "J18.0", nameId: "Pneumonia bronk", nameEn: "Bronchopneumonia" },
  { code: "J18.1", nameId: "Pneumonia lobar", nameEn: "Lobar pneumonia" },
  { code: "J18.8", nameId: "Pneumonia lainnya", nameEn: "Pneumonia other" },
  { code: "J18.9", nameId: "Pneumonia tidak spesifik", nameEn: "Pneumonia unspecified" },
  
  // Pulmonary edema
  { code: "J81.0", nameId: "Edema paru akut", nameEn: "Acute pulmonary edema" },
  { code: "J81.1", nameId: "Edema paru kronis", nameEn: "Chronic pulmonary edema" },
  
  // Lung abscess
  { code: "J85.0", nameId: "Abses paru", nameEn: "Lung abscess" },
  { code: "J85.2", nameId: "Empiema dada", nameEn: "Empyema" },
  
  // Pleurisy and pleural effusion
  { code: "R06.02", nameId: "Pleuritis dengan efusi", nameEn: "Pleurisy with effusion" },
  { code: "J91.8", nameId: "Efusi pleura dalam kondisi lainnya", nameEn: "Pleural effusion in other conditions" },
  
  // Pneumothorax
  { code: "J93.0", nameId: "Pneumotoraks spontan primer", nameEn: "Primary spontaneous pneumothorax" },
  { code: "J93.1", nameId: "Pneumotoraks spontan sekunder", nameEn: "Secondary spontaneous pneumothorax" },
  { code: "J93.8", nameId: "Pneumotoraks lainnya", nameEn: "Other pneumothorax" },
  
  // Tuberculosis
  { code: "A15.0", nameId: "Tuberkulosis paru", nameEn: "Tuberculosis of lung" },
  { code: "A15.9", nameId: "Tuberkulosis paru tidak spesifik", nameEn: "Tuberculosis of lung unspecified" },
  
  // Interstitial lung diseases
  { code: "J61", nameId: "Pneumokoniosis - asbestosis", nameEn: "Asbestosis" },
  { code: "J62.0", nameId: "Pneumokoniosis - silikosis", nameEn: "Silicosis" },
  { code: "J62.8", nameId: "Pneumokoniosis - talcosis dan lainnya", nameEn: "Talcosis and other pneumoconiosis" },
  
  // Chronic pulmonary diseases
  { code: "J84.0", nameId: "Pulmonary fibrosis", nameEn: "Pulmonary fibrosis" },
  { code: "J84.1", nameId: "Penyakit paru kronik - pneumokoniosis", nameEn: "Chronic pulmonary disease with pneumoconiosis" },
];

const proceduresData = [
  { cdiCode: "P-BRN-01", name: "Bronkoskopi Serat Optik", description: "Pemeriksaan saluran napas menggunakan bronkoskop fleksibel", icd9Code: "466.0" },
  { cdiCode: "P-OXY-01", name: "Terapi Oksigen Tambahan", description: "Pemberian oksigen via nasal kanula atau masker", icd9Code: "490" },
  { cdiCode: "P-NEB-01", name: "Nebulisasi Salbutamol", description: "Terapi uap untuk membuka saluran napas", icd9Code: "493.0" },
  { cdiCode: "P-PUL-01", name: "Rehabilitasi Pulmonal", description: "Program latihan untuk pasien PPOK", icd9Code: "491.20" },
  { cdiCode: "P-THOR-01", name: "Torakosentesis", description: "Pengambilan cairan dari rongga pleura", icd9Code: "511.0" }
];

const diagnosesData = [
  { cdiCode: "D-BRN-01", name: "Bronkitis Akut Tipe A", description: "Infeksi saluran pernapasan utama (bronkus)", icd10Code: "J20.9" },
  { cdiCode: "D-ASM-01", name: "Asma Bronkial Eksaserbasi", description: "Penyempitan saluran napas akibat alergi", icd10Code: "J45.01" },
  { cdiCode: "D-PNE-01", name: "Pneumonia Lobi Bilateral", description: "Infeksi paru-paru berat pada kedua lobus", icd10Code: "J18.1" },
  { cdiCode: "D-TBC-01", name: "TB Paru Aktif", description: "Infeksi Mycobacterium tuberculosis pada paru", icd10Code: "A15.0" },
  { cdiCode: "D-PPOK-01", name: "PPOK Stadium Lanjut", description: "Penyakit paru obstruktif kronik persisten", icd10Code: "J44.9" }
];

const bpjsData = [
  { bpjsCode: "BPJS-BRN-001", procedureCdi: "P-BRN-01", diagnosisCdi: "D-BRN-01", baseTariff: 1500000 },
  { bpjsCode: "BPJS-ASM-001", procedureCdi: "P-NEB-01", diagnosisCdi: "D-ASM-01", baseTariff: 250000 },
  { bpjsCode: "BPJS-PNE-001", procedureCdi: "P-OXY-01", diagnosisCdi: "D-PNE-01", baseTariff: 1000000 },
  { bpjsCode: "BPJS-TBC-001", procedureCdi: "P-THOR-01", diagnosisCdi: "D-TBC-01", baseTariff: 2500000 },
  { bpjsCode: "BPJS-PPOK-001", procedureCdi: "P-PUL-01", diagnosisCdi: "D-PPOK-01", baseTariff: 800000 }
];

async function seedData() {
  try {
    console.log("Seeding ICD-9 data...");
    for (const item of icd9Data) {
      await db.insert(icd9).values({
        code: item.code,
        nameId: item.nameId,
        nameEn: item.nameEn,
        isActive: true,
      }).onConflictDoUpdate({
        target: icd9.code,
        set: { nameId: item.nameId, nameEn: item.nameEn, isActive: true, updatedAt: new Date() },
      });
    }
    console.log(`✓ ICD-9 data seeded: ${icd9Data.length} records`);

    console.log("Seeding ICD-10 data...");
    for (const item of icd10Data) {
      await db.insert(icd10).values({
        code: item.code,
        nameId: item.nameId,
        nameEn: item.nameEn,
        isActive: true,
      }).onConflictDoUpdate({
        target: icd10.code,
        set: { nameId: item.nameId, nameEn: item.nameEn, isActive: true, updatedAt: new Date() },
      });
    }
    console.log(`✓ ICD-10 data seeded: ${icd10Data.length} records`);

    console.log("Seeding Procedures data...");
    for (const item of proceduresData) {
      const relatedIcd9 = await db.query.icd9.findFirst({ where: eq(icd9.code, item.icd9Code) });
      await db.insert(procedures).values({
        cdiCode: item.cdiCode,
        name: item.name,
        description: item.description,
        icd9Id: relatedIcd9 ? relatedIcd9.id : null,
        isActive: true,
      }).onConflictDoUpdate({
        target: procedures.cdiCode,
        set: { name: item.name, description: item.description, icd9Id: relatedIcd9 ? relatedIcd9.id : null, isActive: true, updatedAt: new Date() },
      });
    }
    console.log(`✓ Procedures data seeded: ${proceduresData.length} records`);

    console.log("Seeding Diagnoses data...");
    for (const item of diagnosesData) {
      const relatedIcd10 = await db.query.icd10.findFirst({ where: eq(icd10.code, item.icd10Code) });
      await db.insert(diagnoses).values({
        cdiCode: item.cdiCode,
        name: item.name,
        description: item.description,
        icd10Id: relatedIcd10 ? relatedIcd10.id : null,
        isActive: true,
      }).onConflictDoUpdate({
        target: diagnoses.cdiCode,
        set: { name: item.name, description: item.description, icd10Id: relatedIcd10 ? relatedIcd10.id : null, isActive: true, updatedAt: new Date() },
      });
    }
    console.log(`✓ Diagnoses data seeded: ${diagnosesData.length} records`);

    console.log("Seeding BPJS Mappings data...");
    for (const item of bpjsData) {
      const relatedProc = await db.query.procedures.findFirst({ where: eq(procedures.cdiCode, item.procedureCdi) });
      const relatedDiag = await db.query.diagnoses.findFirst({ where: eq(diagnoses.cdiCode, item.diagnosisCdi) });
      
      await db.insert(bpjsMappings).values({
        bpjsCode: item.bpjsCode,
        procedureId: relatedProc ? relatedProc.id : null,
        diagnosisId: relatedDiag ? relatedDiag.id : null,
        baseTariff: item.baseTariff,
        isActive: true,
      }).onConflictDoUpdate({
        target: bpjsMappings.bpjsCode,
        set: { 
          procedureId: relatedProc ? relatedProc.id : null, 
          diagnosisId: relatedDiag ? relatedDiag.id : null, 
          baseTariff: item.baseTariff, 
          isActive: true, 
          updatedAt: new Date() 
        },
      });
    }
    console.log(`✓ BPJS Mappings data seeded: ${bpjsData.length} records`);

    console.log("✓ All interrelated master data seeded successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

seedData();
