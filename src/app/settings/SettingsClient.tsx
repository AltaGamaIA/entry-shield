"use client";

import React from 'react';
import { signOut } from "next-auth/react";

export default function SettingsClient() {
  return (
    <>
      {/* UI Preferences */}
      <section className="bg-surface-container-high rounded-xl p-8 shadow-sm border border-outline-variant/5">
        <h3 className="font-bold font-headline mb-6">Preferencias Visuales</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6">
            <div>
              <p className="font-semibold text-on-surface">Tema de la Interfaz</p>
              <p className="text-sm text-on-surface-variant">Cambiar entre modo claro y oscuro.</p>
            </div>
            <div className="flex bg-surface-container-lowest rounded-lg p-1 border border-outline-variant/10 cursor-not-allowed opacity-70" title="Actualmente bloqueado al Modo Nocturno por directiva de Seguridad">
               <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Claro</div>
               <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-primary/20 text-primary rounded-md shadow-inner">Oscuro</div>
            </div>
          </div>
          <div className="flex items-center justify-between pb-2">
            <div>
              <p className="font-semibold text-on-surface">Idioma del Operativo</p>
            </div>
            <select className="bg-surface-container-lowest border-none rounded-lg text-sm px-4 py-2 text-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
              <option value="es">Español (Latam)</option>
              <option value="en">English (US)</option>
              <option value="pt">Português (BR)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-error-container/5 outline outline-1 outline-error/20 rounded-xl p-8 mb-24 md:mb-0">
        <h3 className="font-bold font-headline text-error mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg" data-icon="warning">warning</span>
            Zona de Seguridad Acrítica
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">El cierre de sesión detendrá la captura biométrica activa en este terminal y borrará el historial temporal en memoria de la base de registros.</p>
        <button 
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full bg-error-container text-on-error-container font-headline font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-error hover:text-on-error transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
          Finalizar Turno Seguro
        </button>
      </section>
    </>
  );
}
