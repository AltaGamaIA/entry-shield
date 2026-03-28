"use client";

import React, { useState } from 'react';
import { updateComplianceSettings, exportComplianceAudit } from '@/app/actions/settings';

interface ComplianceSettings {
  retentionPeriod: string;
  maskSensitiveData: boolean;
  consentText: string;
}

export default function ComplianceForm({ propertyId, initialConfig }: { propertyId: string, initialConfig: ComplianceSettings }) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [maskData, setMaskData] = useState(initialConfig.maskSensitiveData);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    formData.set("maskData", maskData ? "true" : "false");

    const res = await updateComplianceSettings(propertyId, formData);
    if (res.success) {
      setSuccessMsg("Configuración de cumplimiento guardada exitosamente.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      setErrorMsg(res.error || "Ocurrió un error.");
    }
    setLoading(false);
  };

  const handleExport = async () => {
    const res = await exportComplianceAudit();
    if (res.success && res.csvData) {
      // Create a blob and trigger download
      const blob = new Blob([res.csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'compliance_audit.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(res.error || "Error de exportación.");
    }
  };

  return (
    <div className="lg:col-span-7 space-y-6">
      {/* Data Retention & Privacy Settings */}
      <section className="bg-surface-container-high rounded-xl p-8 shadow-sm border border-outline-variant/5">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-primary" data-icon="auto_delete">auto_delete</span>
          <h3 className="text-xl font-bold font-headline flex-1">Política de Retención de Datos</h3>
          {successMsg && <span className="text-tertiary text-xs font-bold animate-pulse">{successMsg}</span>}
          {errorMsg && <span className="text-error text-xs font-bold animate-pulse">{errorMsg}</span>}
        </div>
        
        <form action={handleSubmit} className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-on-surface">Auto-eliminar registros de ID</p>
              <p className="text-sm text-on-surface-variant">Purgar escaneos de identificación oficial y fotos de la base de datos.</p>
            </div>
            <select name="retentionPeriod" defaultValue={initialConfig.retentionPeriod} className="bg-surface-container-lowest border-none rounded-lg text-sm px-4 py-3 text-primary focus:ring-2 focus:ring-primary w-full md:w-56 appearance-none shadow-inner cursor-pointer">
              <option value="Tras 24 Horas">Tras 24 Horas</option>
              <option value="Tras 7 Días">Tras 7 Días</option>
              <option value="Tras 30 Días">Tras 30 Días</option>
              <option value="Nunca (No recomendado)">Nunca (No recomendado)</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between py-6 border-y border-outline-variant/10">
            <div>
              <p className="font-semibold text-on-surface">Enmascarar datos sensibles</p>
              <p className="text-sm text-on-surface-variant">Ocultar números de documentos (ej., PASAPORTE-****-4231) en los registros.</p>
            </div>
            <button 
              type="button" 
              onClick={() => setMaskData(!maskData)} 
              className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${maskData ? 'bg-primary' : 'bg-surface-container-lowest'}`}
            >
              <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${maskData ? 'translate-x-5' : 'translate-x-0'}`}></span>
            </button>
          </div>
          
          <div>
            <label className="block font-semibold text-on-surface mb-3">Texto de Consentimiento Personalizado</label>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
              <textarea 
                name="consentText"
                className="w-full bg-transparent border-none text-on-surface-variant text-sm focus:ring-0 resize-none outline-none" 
                rows={4}
                defaultValue={initialConfig.consentText}
              ></textarea>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-[10px] text-outline uppercase font-bold tracking-widest">Activo en el Kiosco y Formularios</span>
                <button type="submit" disabled={loading} className="px-4 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary font-bold text-xs rounded-full transition-colors disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
      
      {/* Export Section */}
      <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined" data-icon="download_for_offline">download_for_offline</span>
            </div>
            <div>
              <h3 className="font-bold font-headline text-lg">Exportar Auditoría de Cumplimiento</h3>
              <p className="text-sm text-on-surface-variant mt-1">Descargue un historial completo de acceso a datos y cambios de configuración.</p>
            </div>
          </div>
          <button onClick={handleExport} className="bg-gradient-to-br from-tertiary-container to-tertiary-fixed text-tertiary-fixed-dim font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex-shrink-0">
            <span>Generar CSV</span>
            <span className="material-symbols-outlined text-sm" data-icon="file_export">file_export</span>
          </button>
        </div>
      </section>
    </div>
  );
}
