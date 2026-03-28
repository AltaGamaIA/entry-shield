import React from 'react';
import VideoUploader from '@/components/VideoUploader';

export default function SelfieVerificationPage() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col">
      {/* Top Navigation Shell */}
      <header className="flex justify-between items-center px-6 h-20 w-full fixed top-0 z-50 bg-gradient-to-b from-[#131313] to-transparent">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl" data-icon="shield">shield</span>
          <h1 className="text-xl font-extrabold text-[#e7e5e5] tracking-tighter font-headline">EntryShield</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_rgba(155,255,206,0.6)]"></div>
          <span className="text-[10px] font-label font-bold tracking-widest uppercase opacity-60">Sistema Activo</span>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center pt-24 pb-12 px-6 gap-8 max-w-7xl mx-auto w-full">
        {/* Left Column: Camera / Capture Zone */}
        <section className="w-full md:w-[60%] flex flex-col gap-6">
           <VideoUploader />
        </section>
        
        {/* Right Column: Verification Stats & Details */}
        <section className="w-full md:w-[40%] flex flex-col gap-6">
          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 shadow-xl">
            <h2 className="font-headline text-2xl font-bold tracking-tight mb-2">Verificación Biométrica</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">Utilizamos mapeo facial encriptado para garantizar una entrada segura y la protección de su identidad.</p>
            <div className="space-y-6">
              {/* Metric Card */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-label uppercase tracking-widest opacity-50">Puntaje de Coincidencia</span>
                  <span className="text-tertiary font-headline font-extrabold text-lg">98%</span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full w-[98%] rounded-full shadow-[0_0_10px_rgba(105,246,184,0.4)]"></div>
                </div>
              </div>
              
              {/* Details List */}
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface-bright transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                    <span className="material-symbols-outlined" data-icon="check_circle">check_circle</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Mapa 3D Generado</p>
                    <p className="text-xs text-on-surface-variant">Escaneo facial topográfico completado.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface-bright transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                    <span className="material-symbols-outlined" data-icon="security">security</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Identidad Confirmada</p>
                    <p className="text-xs text-on-surface-variant">Vinculado al Perfil de Residente: Alpha-09.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl border border-error/10 bg-error-container/5">
                  <div className="w-10 h-10 rounded-lg bg-error-container/20 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined" data-icon="notification_important">notification_important</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-error">Requiere Revisión Humana</p>
                    <p className="text-xs text-on-surface-variant">Sujeto con gafas no estándares.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Consent Notice */}
            <div className="mt-8 pt-8 border-t border-outline-variant/10">
              <div className="flex gap-3">
                <div className="mt-1">
                  <span className="material-symbols-outlined text-primary text-sm" data-icon="info">info</span>
                </div>
                <p className="text-[11px] leading-relaxed text-on-surface-variant italic">
                                            Al proceder, usted consiente el procesamiento de sus datos biométricos para fines de verificación de seguridad. Los datos se encriptan y se eliminan según el Protocolo v2.4.0.
                                        </p>
              </div>
            </div>
          </div>
          
          {/* Contextual Details */}
          <div className="px-4 flex flex-col gap-2">
            <div className="flex justify-between text-[10px] font-label font-bold uppercase tracking-[0.15em] opacity-40">
              <span>Referencia de Visita</span>
              <span>EV-9902-XJ</span>
            </div>
            <div className="flex justify-between text-[10px] font-label font-bold uppercase tracking-[0.15em] opacity-40">
              <span>Marca de Tiempo</span>
              <span>24 oct, 2023 | 14:22:09 UTC</span>
            </div>
          </div>
        </section>
      </main>
      
      {/* Bottom Action Bar */}
      <footer className="w-full py-8 flex justify-center border-t border-outline-variant/10 bg-surface-container-low mt-auto">
        <div className="flex items-center gap-8 opacity-40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg" data-icon="lock">lock</span>
            <span className="text-[10px] font-label font-semibold uppercase tracking-widest">Encriptado de Punto a Punto</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg" data-icon="verified_user">verified_user</span>
            <span className="text-[10px] font-label font-semibold uppercase tracking-widest">Cumple con GDPR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
