"use client";

import React, { useState } from 'react';
import { updateShiftProtocol } from '@/app/actions/settings';

export default function DashboardProtocol({ initialText, propertyId }: { initialText: string, propertyId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await updateShiftProtocol(propertyId, text);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert("Error guardando el protocolo");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/10 mt-8 relative group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-tertiary" data-icon="gavel">gavel</span>
          <h3 className="font-bold text-on-surface">Protocolo de Turno</h3>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span> Editar
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => { setIsEditing(false); setText(initialText); }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase text-on-surface-variant hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-primary text-on-primary hover:bg-primary-dim disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      )}
    </div>
  );
}
