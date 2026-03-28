"use client";

import React, { useState } from 'react';
import { createIncident } from '@/app/actions/incident';

export default function IncidentForm({ activeVisits }: { activeVisits: any[] }) {
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState("LOW");
  const [description, setDescription] = useState("");
  const [visitId, setVisitId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("description", description);
    formData.append("severity", severity);
    if (visitId) formData.append("visitId", visitId);

    const res = await createIncident(formData);
    setLoading(false);
    
    if (res.success) {
      alert("Incidente reportado exitosamente.");
      setDescription("");
      setSeverity("LOW");
      setVisitId("");
    } else {
      alert(res.error || "Ocurrió un error.");
    }
  };

  const applyTemplate = (text: string) => {
    setDescription(text);
  };

  return (
    <form className="space-y-10" onSubmit={handleSubmit}>
      {/* Search & Link */}
      <div className="space-y-4">
        <label className="font-headline font-bold text-sm tracking-wide text-primary uppercase">Vincular Sujeto (Opcional)</label>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant top-4">search</span>
          <select 
            value={visitId}
            onChange={(e) => setVisitId(e.target.value)}
            className="w-full bg-surface-container-lowest border-none rounded-lg py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
          >
            <option value="">-- Sin vincular visitante específico --</option>
            {activeVisits.map(v => (
              <option key={v.id} value={v.id}>{v.visitor.name} - {v.visitor.documentId}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates & Severity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="font-headline font-bold text-sm tracking-wide text-primary uppercase">Plantillas Rápidas</label>
          <div className="flex flex-col gap-2">
            <button onClick={() => applyTemplate("Música a alto volumen detectada")} className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-surface-bright rounded-lg border border-transparent hover:border-outline-variant/30 transition-all text-left group" type="button">
              <span className="text-sm">Música Alta</span>
              <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">bolt</span>
            </button>
            <button onClick={() => applyTemplate("Invitado no autorizado en el perímetro")} className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-surface-bright rounded-lg border border-transparent hover:border-outline-variant/30 transition-all text-left group" type="button">
              <span className="text-sm">Invitado No Autorizado</span>
              <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">bolt</span>
            </button>
            <button onClick={() => applyTemplate("Se encontraron daños a la propiedad del lobby")} className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-surface-bright rounded-lg border border-transparent hover:border-outline-variant/30 transition-all text-left group" type="button">
              <span className="text-sm">Daños a la Propiedad</span>
              <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">bolt</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="font-headline font-bold text-sm tracking-wide text-primary uppercase">Nivel de Gravedad</label>
          <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-1 rounded-xl">
            <button onClick={() => setSeverity("LOW")} className={`py-3 px-2 rounded-lg text-xs font-bold uppercase tracking-tighter transition-all ${severity === "LOW" ? "bg-tertiary-container/30 text-tertiary-fixed border border-tertiary-container/30" : "text-on-surface-variant hover:bg-surface-bright"}`} type="button">Bajo</button>
            <button onClick={() => setSeverity("MEDIUM")} className={`py-3 px-2 rounded-lg text-xs font-bold uppercase tracking-tighter transition-all ${severity === "MEDIUM" ? "bg-secondary-container/30 text-on-secondary-container border border-secondary-container/30" : "text-on-surface-variant hover:bg-surface-bright"}`} type="button">Medio</button>
            <button onClick={() => setSeverity("HIGH")} className={`py-3 px-2 rounded-lg text-xs font-bold uppercase tracking-tighter transition-all ${severity === "HIGH" ? "bg-error-container/30 text-on-error-container border border-error-container/30" : "text-on-surface-variant hover:bg-surface-bright"}`} type="button">Alto</button>
          </div>
          <div className="p-4 rounded-lg bg-surface-variant/30 border-l-2 border-tertiary-fixed">
            <p className="text-[11px] leading-relaxed text-on-surface-variant">La gravedad clasifica cómo se alertará a los supervisores.</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4">
        <label className="font-headline font-bold text-sm tracking-wide text-primary uppercase">Notas del Personal sobre el Incidente</label>
        <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-surface-container-lowest border-none rounded-xl p-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none" placeholder="Proporcione una descripción detallada del evento..." rows={5}></textarea>
      </div>

      {/* Actions */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-outline-variant/20">
        <button disabled={loading} className="w-full sm:w-auto px-12 py-4 rounded-lg bg-gradient-to-br from-[#adc6ff] to-[#004493] text-on-primary font-headline font-extrabold text-base tracking-tight shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50" type="submit">
          {loading ? "Enviando..." : "Enviar Incidente"}
        </button>
      </div>
    </form>
  );
}
