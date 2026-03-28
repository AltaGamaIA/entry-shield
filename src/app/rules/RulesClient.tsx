"use client";

import React, { useState } from 'react';
import { savePropertyConfig } from '@/app/actions/adminActions';

export default function RulesClient({ 
  propertyId, 
  initialRules 
}: { 
  propertyId?: string, 
  initialRules?: any 
}) {
  const [rules, setRules] = useState(initialRules || {
    requireId: true,
    requireSelfie: true,
    allowWalkins: true,
    autoBan: false,
    maxOccupancy: 150
  });
  const [saving, setSaving] = useState(false);

  const toggleRule = (key: keyof typeof rules) => {
    setRules((prev: typeof rules) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!propertyId) return;
    setSaving(true);
    try {
      const result = await savePropertyConfig(propertyId, rules);
      if (!result.success) {
        alert("Error al guardar: " + result.error);
      }
    } catch(e) {
      alert("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-6">
        
        {/* Core Identity Engine */}
        <section className="bg-surface-container-high rounded-xl p-8 shadow-sm border border-outline-variant/5">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary" data-icon="fingerprint">fingerprint</span>
            <h3 className="text-xl font-bold font-headline">Requisitos de Identidad</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
              <div>
                <p className="font-semibold text-on-surface">Escaneo Obligatorio de Documento (OCR)</p>
                <p className="text-sm text-on-surface-variant">Los visitantes deben proveer una identificación gubernamental oficial para entrar.</p>
              </div>
              <button 
                onClick={() => toggleRule('requireId')}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${rules.requireId ? 'bg-primary' : 'bg-surface-container-lowest'}`}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${rules.requireId ? 'translate-x-5' : 'translate-x-0'}`}></span>
              </button>
            </div>
            
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
              <div>
                <p className="font-semibold text-on-surface">Verificación Biométrica Facial</p>
                <p className="text-sm text-on-surface-variant">Requerir Selfie en vivo para cotejar similitud contra la credencial o el pase emitido.</p>
              </div>
              <button 
                onClick={() => toggleRule('requireSelfie')}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${rules.requireSelfie ? 'bg-primary' : 'bg-surface-container-lowest'}`}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${rules.requireSelfie ? 'translate-x-5' : 'translate-x-0'}`}></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-on-surface">Permitir Transeúntes (Walk-Ins)</p>
                <p className="text-sm text-on-surface-variant">Autorizar el registro espontáneo de personas sin reservación o cita previa.</p>
              </div>
              <button 
                onClick={() => toggleRule('allowWalkins')}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${rules.allowWalkins ? 'bg-primary' : 'bg-surface-container-lowest'}`}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${rules.allowWalkins ? 'translate-x-5' : 'translate-x-0'}`}></span>
              </button>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-4">
          {saving && <span className="text-tertiary text-xs font-bold animate-pulse">Sincronizando con Kioscos...</span>}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-on-primary font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-primary-dim transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined font-light" data-icon="save">save</span>
            {saving ? 'Guardando...' : 'Guardar Configuración Lógica'}
          </button>
        </div>

      </div>

      <div className="lg:col-span-5 space-y-6">
        {/* Anti-Intrusion Section */}
        <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-6 text-error">
             <span className="material-symbols-outlined" data-icon="emergency">emergency</span>
             <h3 className="font-bold font-headline">Prevención Analítica</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-error-container/10 p-4 rounded-xl border border-error/20">
              <div>
                <p className="font-semibold text-on-surface text-sm">Bloqueo Automático (Ban List)</p>
                <p className="text-[11px] text-on-surface-variant mt-1">Rechazar instantáneamente IPs / IDs marcadas.</p>
              </div>
              <button 
                onClick={() => toggleRule('autoBan')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${rules.autoBan ? 'bg-error' : 'bg-surface-container-lowest'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${rules.autoBan ? 'translate-x-5' : 'translate-x-0'}`}></span>
              </button>
            </div>

            <div>
               <p className="font-semibold text-on-surface text-sm mb-3">Límite Crítico de Ocupación</p>
               <div className="flex items-center gap-4">
                 <input 
                   type="range" 
                   min="50" 
                   max="1000" 
                   step="10" 
                   value={rules.maxOccupancy} 
                   onChange={(e) => setRules((p: any) => ({...p, maxOccupancy: parseInt(e.target.value)}))}
                   className="w-full accent-secondary"
                 />
                 <div className="w-16 text-center font-mono font-bold bg-surface-container-lowest p-2 rounded-lg text-secondary">
                   {rules.maxOccupancy}
                 </div>
               </div>
               <p className="text-[10px] text-on-surface-variant mt-2 text-right">Detener check-ins al superar el umbral</p>
            </div>
          </div>
        </section>

        {/* Global info lock */}
        <div className="mt-8 p-6 rounded-xl bg-surface-container-lowest border-l-4 border-tertiary">
            <div className="flex gap-2 items-center mb-2">
              <span className="material-symbols-outlined text-xs" data-icon="lock">lock</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Nota de Herencia</span>
            </div>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Las reglas configuradas aquí se propagarán a todos los Kioscos y iPads asociados a esta propiedad dentro de los siguientes 5 minutos debido a las políticas de caché perimetral (Edge Caching).
            </p>
        </div>
      </div>
    </div>
  );
}
