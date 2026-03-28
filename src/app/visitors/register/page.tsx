"use client";

import Link from 'next/link';
import Script from 'next/script';

import React, { useState } from 'react';
import { registerVisitor } from '@/app/actions/visitor';
import { useRouter, useSearchParams } from 'next/navigation';
import IdScanner from '@/components/IdScanner';
import VideoUploader from '@/components/VideoUploader';

function RegisterVisitorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservationId = searchParams?.get('reservationId');
  const guestName = searchParams?.get('guestName');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeScanner, setActiveScanner] = useState<'idFront' | 'idBack' | 'selfie' | null>(null);
  const [idFrontUrl, setIdFrontUrl] = useState<string | null>(null);
  const [idBackUrl, setIdBackUrl] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [predictedAge, setPredictedAge] = useState<number | null>(null);
  const [approximateAgeValue, setApproximateAgeValue] = useState("Adulto");

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");
    const result = await registerVisitor(formData);
    if (!result?.success) {
      setError(result?.error || "Error desconocido");
    } else {
      setSuccess(true);
      setTimeout(() => router.push(reservationId ? '/reservations/search' : '/dashboard'), 1500);
    }
    setLoading(false);
  };

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js" strategy="lazyOnload" />
      <div className="bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-primary min-h-screen pb-24">
        {/* TopAppBar */}
      <header className="flex justify-between items-center px-6 h-20 w-full fixed top-0 z-50 bg-[#131313]/60 backdrop-blur-lg bg-gradient-to-b from-[#131313] to-transparent">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <span className="material-symbols-outlined text-[#adc6ff] text-2xl" data-icon="shield">shield</span>
          <h1 className="text-xl font-extrabold text-[#e7e5e5] tracking-tighter font-headline">EntryShield</h1>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-full border border-outline-variant/10">
            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(155,255,206,0.6)]"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/60">Sistema Activo</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-primary/20">
            <span className="material-symbols-outlined text-primary" data-icon="person">person</span>
          </div>
        </div>
      </header>

      {/* Side Navigation for larger screens */}
      <aside className="hidden md:flex fixed left-0 top-20 h-[calc(100vh-80px)] w-20 flex-col items-center py-8 bg-[#0e0e0e] border-r border-outline-variant/10 z-40">
        <div className="flex flex-col gap-8">
          <span className="material-symbols-outlined text-on-surface/40 hover:text-primary transition-colors cursor-pointer" data-icon="dashboard">dashboard</span>
          <span className="material-symbols-outlined text-primary" data-icon="person_add" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
          <span className="material-symbols-outlined text-on-surface/40 hover:text-primary transition-colors cursor-pointer" data-icon="assessment">assessment</span>
          <span className="material-symbols-outlined text-on-surface/40 hover:text-primary transition-colors cursor-pointer" data-icon="apartment">apartment</span>
          <span className="material-symbols-outlined text-on-surface/40 hover:text-primary transition-colors cursor-pointer" data-icon="settings">settings</span>
        </div>
      </aside>

      <main className="pt-24 px-4 max-w-2xl mx-auto space-y-8 md:pl-28 md:max-w-3xl">
        {/* Header Section */}
        <section className="space-y-2">
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface leading-tight">
            {reservationId ? "Añadir Acompañante" : "Registro de Visitante"}
          </h2>
          <p className="text-on-surface-variant text-sm font-medium">
            {reservationId ? `Registrando visitante vinculado a la estancia de ${guestName || 'titular'}.` : "Registre un nuevo visitante para acceso a zonas de alta seguridad."}
          </p>
          {error && <div className="p-3 bg-error-container/20 text-error-dim rounded-lg text-sm">{error}</div>}
          {success && <div className="p-3 bg-tertiary-container/30 text-tertiary-fixed-dim rounded-lg text-sm">¡Visitante autorizado correctamente! Redirigiendo...</div>}
        </section>

        {/* Status & Identification Capture */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!idFrontUrl ? (
              <button type="button" onClick={() => setActiveScanner(activeScanner === 'idFront' ? null : 'idFront')} className={`flex flex-col items-center justify-center p-8 rounded-xl border transition-all group active:scale-95 ${activeScanner === 'idFront' ? 'bg-surface-bright border-primary/50' : 'bg-surface-container-high border-outline-variant/10 hover:bg-surface-bright'}`}>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl" data-icon="id_card">id_card</span>
                </div>
                <span className="font-headline font-bold text-on-surface">Frente ID</span>
                <span className="text-[10px] text-on-surface-variant mt-1 text-center">Foto delantera</span>
              </button>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-primary-container/10 rounded-xl border border-primary/20">
                 <img src={idFrontUrl} alt="ID Document Front" className="h-20 object-contain rounded mb-3 shadow" />
                 <p className="font-bold text-primary text-[11px] uppercase tracking-widest text-center">Frente OK</p>
                 <button type="button" onClick={() => {setIdFrontUrl(null); setActiveScanner('idFront');}} className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mt-2 hover:text-primary transition-colors">Reemplazar</button>
              </div>
            )}
            
            {!idBackUrl ? (
              <button type="button" onClick={() => setActiveScanner(activeScanner === 'idBack' ? null : 'idBack')} className={`flex flex-col items-center justify-center p-8 rounded-xl border transition-all group active:scale-95 ${activeScanner === 'idBack' ? 'bg-surface-bright border-primary/50' : 'bg-surface-container-high border-outline-variant/10 hover:bg-surface-bright'}`}>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl" data-icon="barcode_scanner">barcode_scanner</span>
                </div>
                <span className="font-headline font-bold text-on-surface">Reverso ID</span>
                <span className="text-[10px] text-on-surface-variant mt-1 text-center">Foto trasera / código de barras</span>
              </button>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-primary-container/10 rounded-xl border border-primary/20">
                 <img src={idBackUrl} alt="ID Document Back" className="h-20 object-contain rounded mb-3 shadow" />
                 <p className="font-bold text-primary text-[11px] uppercase tracking-widest text-center">Reverso OK</p>
                 <button type="button" onClick={() => {setIdBackUrl(null); setActiveScanner('idBack');}} className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mt-2 hover:text-primary transition-colors">Reemplazar</button>
              </div>
            )}
            
            {!selfieUrl ? (
              <button type="button" onClick={() => setActiveScanner(activeScanner === 'selfie' ? null : 'selfie')} className={`flex flex-col items-center justify-center p-8 rounded-xl border transition-all group active:scale-95 ${activeScanner === 'selfie' ? 'bg-surface-bright border-secondary/50' : 'bg-surface-container-high border-outline-variant/10 hover:bg-surface-bright'}`}>
                <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-secondary text-3xl" data-icon="face">face</span>
                </div>
                <span className="font-headline font-bold text-on-surface">Tomar Selfie</span>
                <span className="text-[10px] text-on-surface-variant mt-1 text-center">Rostro despejado</span>
              </button>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-secondary-container/10 rounded-xl border border-secondary/20">
                 <img src={selfieUrl} alt="Selfie" className="h-20 w-20 object-cover rounded-full mb-3 shadow-lg border-2 border-secondary" style={{ transform: 'scaleX(-1)' }} />
                 <p className="font-bold text-secondary text-[11px] uppercase tracking-widest text-center">Selfie OK</p>
                 <button type="button" onClick={() => {setSelfieUrl(null); setActiveScanner('selfie');}} className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mt-2 hover:text-secondary transition-colors">Reemplazar</button>
              </div>
            )}
          </div>
          
          {/* Active Scanner Areas */}
          {activeScanner === 'idFront' && !idFrontUrl && (
             <div className="p-2 bg-surface-container-lowest rounded-2xl border border-primary/20 shadow-2xl animate-in slide-in-from-top-4 duration-300">
               <div className="border-b border-outline-variant/10 px-4 py-3 mb-4 flex justify-between items-center">
                 <h3 className="font-bold text-sm text-primary uppercase tracking-widest">Frente del Documento</h3>
                 <button type="button" onClick={() => setActiveScanner(null)} className="material-symbols-outlined text-on-surface-variant hover:text-error">close</button>
               </div>
               <div className="p-4 pt-0">
                 <IdScanner onUploadSuccess={(url) => { setIdFrontUrl(url); setActiveScanner(null); }} />
               </div>
             </div>
          )}
          {activeScanner === 'idBack' && !idBackUrl && (
             <div className="p-2 bg-surface-container-lowest rounded-2xl border border-primary/20 shadow-2xl animate-in slide-in-from-top-4 duration-300">
               <div className="border-b border-outline-variant/10 px-4 py-3 mb-4 flex justify-between items-center">
                 <h3 className="font-bold text-sm text-primary uppercase tracking-widest">Reverso del Documento</h3>
                 <button type="button" onClick={() => setActiveScanner(null)} className="material-symbols-outlined text-on-surface-variant hover:text-error">close</button>
               </div>
               <div className="p-4 pt-0">
                 <IdScanner onUploadSuccess={(url) => { setIdBackUrl(url); setActiveScanner(null); }} />
               </div>
             </div>
          )}
          {activeScanner === 'selfie' && !selfieUrl && (
             <div className="p-2 bg-surface-container-lowest rounded-2xl border border-secondary/20 shadow-2xl animate-in slide-in-from-top-4 duration-300">
               <div className="border-b border-outline-variant/10 px-4 py-3 mb-4 flex justify-between items-center">
                 <h3 className="font-bold text-sm text-secondary uppercase tracking-widest">Captura Biométrica</h3>
                 <button type="button" onClick={() => setActiveScanner(null)} className="material-symbols-outlined text-on-surface-variant hover:text-error">close</button>
               </div>
               <div className="p-4 pt-0">
                 <VideoUploader 
                   onUploadSuccess={(url) => { setSelfieUrl(url); setActiveScanner(null); }} 
                   onAgePredicted={(age) => { 
                     setPredictedAge(age); 
                     setApproximateAgeValue(age < 18 ? "Menor" : "Adulto"); 
                   }} 
                 />
               </div>
             </div>
          )}
        </div>

        {/* Registration Form */}
        <form className="space-y-10" action={handleSubmit}>
          {(idFrontUrl || idBackUrl) && <input type="hidden" name="idCardUrl" value={JSON.stringify([idFrontUrl, idBackUrl])} />}
          {selfieUrl && <input type="hidden" name="selfieUrl" value={selfieUrl} />}
          {reservationId && <input type="hidden" name="reservationId" value={reservationId} />}
          <fieldset className="space-y-6">
            <legend className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Detalles del Visitante
            </legend>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="name">Nombre Legal Completo</label>
              <input name="name" required className="w-full h-14 bg-surface-container-lowest border-0 rounded-lg text-on-surface px-4 font-medium transition-all placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 outline-none" id="name" placeholder="Johnathan Doe" type="text"/>
            </div>
            
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1 flex items-center gap-1 text-secondary" htmlFor="approximateAge">
                <span className="material-symbols-outlined text-[14px]">policy</span>
                Clasificación de Edad / Biometría
              </label>
              
              {predictedAge !== null && (
                <div className={`mt-1 mb-2 p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 border shadow-sm animate-in fade-in slide-in-from-top-2 ${predictedAge < 18 ? 'bg-error/10 text-error border-error/20' : 'bg-primary-container/30 text-primary border-primary/20'}`}>
                  <span className="material-symbols-outlined text-[18px]">robot_2</span>
                  <span>
                    IA detectó: <span className="text-base">{Math.round(predictedAge)}</span> años {predictedAge < 18 ? '(Se autoseleccionó Menor de Edad)' : ''}
                  </span>
                </div>
              )}
              
              <select name="approximateAge" required value={approximateAgeValue} onChange={(e) => setApproximateAgeValue(e.target.value)} className="w-full h-14 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-on-surface px-4 font-medium transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-secondary/40 outline-none" id="approximateAge">
                <option value="Adulto">Adulto (18+)</option>
                <option value="Menor">Menor de Edad (0-17)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="id-type">Tipo de Documento</label>
                <select name="documentType" className="w-full h-14 bg-surface-container-lowest border-0 rounded-lg text-on-surface px-4 font-medium transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none" id="id-type">
                  <option value="CC">Cédula</option>
                  <option value="PASSPORT">Pasaporte</option>
                  <option value="CE">Cédula Extranjería</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="id-number">Número de Documento</label>
                <input name="documentId" required className="w-full h-14 bg-surface-container-lowest border-0 rounded-lg text-on-surface px-4 font-medium transition-all placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 outline-none" id="id-number" placeholder="8-000-0000" type="text"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="nationality">Nacionalidad</label>
                <input className="w-full h-14 bg-surface-container-lowest border-0 rounded-lg text-on-surface px-4 font-medium transition-all focus:ring-2 focus:ring-primary/20 outline-none" id="nationality" placeholder="Estados Unidos" type="text"/>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="phone">Teléfono</label>
                <input className="w-full h-14 bg-surface-container-lowest border-0 rounded-lg text-on-surface px-4 font-medium transition-all focus:ring-2 focus:ring-primary/20 outline-none" id="phone" placeholder="+1 (555) 000-0000" type="tel"/>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-6">
            <legend className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Contexto de la Visita
            </legend>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="visit-person">Persona a Visitar</label>
              <input className="w-full h-14 bg-surface-container-lowest border-0 rounded-lg text-on-surface px-4 font-medium transition-all focus:ring-2 focus:ring-primary/20 outline-none" id="visit-person" placeholder="Buscar miembro del personal..." type="text"/>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="visit-reason">Motivo de la Visita</label>
              <textarea className="w-full bg-surface-container-lowest border-0 rounded-lg text-on-surface p-4 font-medium transition-all resize-none focus:ring-2 focus:ring-primary/20 outline-none" id="visit-reason" placeholder="ej. Mantenimiento Técnico, Entrega, Reunión" rows={2}></textarea>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Estado de Entrada Actual</label>
            <div className="flex flex-wrap gap-3">
              <label className="relative flex-1 min-w-[100px] cursor-pointer group">
                <input className="peer sr-only" name="status" type="radio" value="pending"/>
                <div className="h-12 flex items-center justify-center rounded-lg bg-surface-container-low border border-outline-variant/10 text-on-surface/50 font-bold text-xs uppercase tracking-widest peer-checked:bg-secondary-container peer-checked:text-secondary peer-checked:border-secondary/30 transition-all">
                  Pendiente
                </div>
              </label>
              <label className="relative flex-1 min-w-[100px] cursor-pointer group">
                <input defaultChecked className="peer sr-only" name="status" type="radio" value="inside"/>
                <div className="h-12 flex items-center justify-center rounded-lg bg-surface-container-low border border-outline-variant/10 text-on-surface/50 font-bold text-xs uppercase tracking-widest peer-checked:bg-tertiary-container/20 peer-checked:text-tertiary peer-checked:border-tertiary/30 transition-all">
                  Adentro
                </div>
              </label>
              <label className="relative flex-1 min-w-[100px] cursor-pointer group">
                <input className="peer sr-only" name="status" type="radio" value="denied"/>
                <div className="h-12 flex items-center justify-center rounded-lg bg-surface-container-low border border-outline-variant/10 text-on-surface/50 font-bold text-xs uppercase tracking-widest peer-checked:bg-error-container/20 peer-checked:text-error peer-checked:border-error/30 transition-all">
                  Denegado
                </div>
              </label>
            </div>
          </fieldset>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1" htmlFor="staff-notes">Notas Internas del Personal</label>
            <div className="p-1 bg-surface-container-high rounded-xl">
              <textarea className="w-full bg-surface-container-lowest border-0 rounded-lg text-on-surface p-4 font-medium transition-all resize-none focus:ring-2 focus:ring-primary/20 outline-none" id="staff-notes" placeholder="Observaciones adicionales o alertas de seguridad..." rows={3}></textarea>
            </div>
          </div>

          <div className="p-4 bg-surface-container rounded-xl flex gap-4 items-start border border-outline-variant/5">
            <div className="flex items-center h-6">
              <input className="w-5 h-5 bg-surface-container-lowest border-outline-variant rounded-md text-primary focus:ring-2 focus:ring-primary/20" id="consent" type="checkbox"/>
            </div>
            <div className="text-[11px] leading-relaxed text-on-surface-variant">
              Confirmo que el visitante ha sido informado sobre los protocolos de <span className="text-primary font-bold cursor-pointer hover:underline">Privacidad</span> y retención de datos de EntryShield. Al registrar, verifico que toda la documentación proporcionada ha sido inspeccionada manualmente.
            </div>
          </div>

          <div className="pt-6 flex flex-col gap-4">
            <button disabled={loading} className="w-full h-16 bg-gradient-to-br from-[#adc6ff] to-[#004493] text-on-primary font-headline font-extrabold text-lg rounded-xl shadow-lg shadow-primary/10 active:scale-95 transition-transform disabled:opacity-50" type="submit">
              {loading ? "Procesando Entrada..." : "Autorizar Entrada"}
            </button>
            <button className="w-full h-12 text-on-primary-fixed-variant font-headline font-bold text-sm tracking-wide active:opacity-60 transition-opacity" type="button">
              Descartar Registro
            </button>
          </div>
        </form>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-xl border-t border-[#e7e5e5]/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] md:hidden rounded-t-2xl">
        <a className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] active:scale-90 duration-200" href="/dashboard">
          <span className="material-symbols-outlined mb-1" data-icon="dashboard">dashboard</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Tablero</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] active:scale-90 duration-200" href="/reservations/search">
          <span className="material-symbols-outlined mb-1" data-icon="search">search</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Buscar</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-[#1f2020] text-[#adc6ff] rounded-xl px-4 py-2 active:scale-90 duration-200" href="/occupancy">
          <span className="material-symbols-outlined mb-1" data-icon="group">group</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Visitantes</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] active:scale-90 duration-200" href="/incidents/report">
          <span className="material-symbols-outlined mb-1" data-icon="warning">warning</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Incidentes</span>
        </a>
      </nav>
      </div>
    </>
  );
}

export default function RegisterVisitorPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-primary font-headline">Cargando módulos biométricos...</div>}>
      <RegisterVisitorContent />
    </React.Suspense>
  );
}
