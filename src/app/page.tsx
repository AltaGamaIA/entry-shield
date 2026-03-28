"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId || !password) return setError("Por favor ingrese sus credenciales.");
    
    setLoading(true);
    setError("");
    
    const res = await signIn("credentials", {
      staffId,
      password,
      redirect: false,
    });
    
    if (res?.error) {
      setError("Credenciales incorrectas o acceso denegado.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary selection:text-on-primary min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Cinematic Element */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,68,147,0.15),transparent_70%)]"></div>
        <div className="absolute inset-0 opacity-40 mix-blend-overlay" data-alt="abstract high-tech server room background with glowing blue lights and depth of field blur in a dark environment" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCsOELDd4H4xZ7GsFl4J8_AOaOu-w91NHVaGGsqGb6SqGMR53XSN_smGZnr253Xubwi54eKA0XTGSlZna7J9vMp3F-E-wkbaYNvNhYdYB2iWR__570lq14gMDrf69mLddSalq6Xe60h6sDpxxE0k7sZ7wiDwgkB-lmdyjDGbmu6yIbAOZyYZAE8O1_15P0DPJ5drgAR6b9HQAHtEeYOkQK9Qhg0GQZShNbB7-Xz37y486Empua7IPQsO_msQwLIPNYquhDcqPus8V5R')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
      </div>
      <main className="relative z-10 w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-center p-6 md:p-12 gap-12 lg:gap-24">
      {/* Branding & Value Prop (Asymmetric Layout) */}
      <div className="w-full md:w-1/2 flex flex-col items-start space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary text-2xl" data-icon="shield">shield</span>
          </div>
          <span className="text-3xl font-extrabold tracking-tighter text-on-surface brand-font">EntryShield</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-[-0.03em] leading-tight text-on-surface">
            Seguridad <span className="text-primary">Evolucionada</span>.
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
            Acceda a la próxima generación de protección de propiedades. Monitoreo integrado y cumplimiento para personal autorizado.
          </p>
        </div>
        {/* Trust Indicator */}
        <div className="flex items-center gap-4 pt-4">
          <div className="security-pulse">
            <span className="material-symbols-outlined text-tertiary-fixed text-3xl" data-icon="verified_user">verified_user</span>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface uppercase tracking-widest">Estado del Sistema</p>
            <p className="text-xs text-tertiary-fixed-dim font-medium">Encriptado y Operativo</p>
          </div>
        </div>
      </div>
      {/* Login Card */}
      <div className="w-full md:w-[480px]">
        <div className="glass-panel border border-outline-variant/20 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Top Decorative Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          <header className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface mb-2">Acceso al Portal de Personal</h2>
            <p className="text-on-surface-variant text-sm">Por favor, identifíquese para continuar.</p>
            {error && (
              <div className="mt-4 flex items-center gap-2 text-error-dim bg-error-container/20 px-3 py-2 rounded-lg text-sm font-semibold">
                <span className="material-symbols-outlined text-sm" data-icon="error">error</span>
                <span>{error}</span>
              </div>
            )}
          </header>
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-on-surface/60 uppercase tracking-widest ml-1">Rol del Personal</label>
              <div className="grid grid-cols-3 gap-2">
                <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:bg-surface-bright hover:text-primary transition-all duration-300" type="button">
                  <span className="material-symbols-outlined text-xl" data-icon="security">security</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Seguridad</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-container-high border border-primary/50 text-primary transition-all duration-300 ring-1 ring-primary/20" type="button">
                  <span className="material-symbols-outlined text-xl" data-icon="badge">badge</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Gerente</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:bg-surface-bright hover:text-primary transition-all duration-300" type="button">
                  <span className="material-symbols-outlined text-xl" data-icon="admin_panel_settings">admin_panel_settings</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Administrador</span>
                </button>
              </div>
            </div>
            {/* Input Fields */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface/60 uppercase tracking-widest ml-1" htmlFor="staff-id">ID de Personal</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl" data-icon="fingerprint">fingerprint</span>
                  <input 
                    className="w-full h-14 bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                    id="staff-id" 
                    placeholder="ES-000-000" 
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-[11px] font-bold text-on-surface/60 uppercase tracking-widest ml-1" htmlFor="password">Contraseña</label>
                  <a className="text-[10px] font-semibold text-primary/70 hover:text-primary uppercase tracking-wider transition-colors" href="/dashboard">Recuperar Clave</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl" data-icon="lock">lock</span>
                  <input 
                    className="w-full h-14 bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-12 pr-12 text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                    id="password" 
                    placeholder="••••••••" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface" type="button">
                    <span className="material-symbols-outlined text-xl" data-icon="visibility">visibility</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Action Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
              <span>{loading ? "Verificando..." : "Autorizar Acceso"}</span>
              {!loading && <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>}
            </button>
          </form>
          {/* Disclaimer */}
          <footer className="mt-8 pt-6 border-t border-outline-variant/10">
            <div className="flex items-start gap-3 bg-error-container/10 p-4 rounded-xl">
              <span className="material-symbols-outlined text-error-dim mt-0.5" data-icon="warning">warning</span>
              <p className="text-[10px] leading-relaxed text-on-surface-variant uppercase tracking-tighter">
                <span className="text-error-dim font-bold">Solo Personal Autorizado.</span> Los intentos de acceso no autorizados son monitoreados, registrados y sujetos a acciones legales bajo los protocolos Alpha-9.
              </p>
            </div>
          </footer>
        </div>
        {/* Secondary Actions */}
        <div className="mt-6 flex justify-between items-center px-2">
          <p className="text-[11px] text-on-surface-variant font-medium">EntryShield v2.4.0-Stable</p>
          <div className="flex gap-4">
            <a className="text-[11px] text-on-surface-variant hover:text-primary transition-colors" href="/dashboard">Privacidad</a>
            <a className="text-[11px] text-on-surface-variant hover:text-primary transition-colors" href="/dashboard">Términos</a>
          </div>
        </div>
      </div>
      </main>
      {/* Footer Security Banner */}
      <div className="fixed bottom-0 left-0 w-full h-12 glass-panel border-t border-outline-variant/10 flex items-center justify-center z-20 overflow-hidden px-6">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Zona A: Asegurada</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Perímetro: Activo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">AES-256 Habilitado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Bio-Sync: Listo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
