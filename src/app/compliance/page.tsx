import Link from 'next/link';
import React from 'react';
import prisma from '@/lib/prisma';
import ComplianceForm from '@/components/ComplianceForm';

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  const property = await prisma.property.findFirst({
    where: { name: "Alpha Heights" }
  });

  let config = {
    retentionPeriod: "Tras 30 Días",
    maskSensitiveData: false,
    consentText: "Por la presente doy mi consentimiento para la recopilación y procesamiento de mis datos personales con el fin de gestionar la seguridad del edificio y las visitas, de acuerdo con la ley local de protección de datos."
  };

  if (property?.config) {
    try {
      const parsed = JSON.parse(property.config);
      if (parsed.compliance) {
        config = { ...config, ...parsed.compliance };
      }
    } catch(e) {}
  }
  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-6 h-20 w-full fixed top-0 z-50 bg-[#131313]/60 backdrop-blur-lg border-b border-outline-variant/5">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <span className="material-symbols-outlined text-[#adc6ff]" data-icon="shield">shield</span>
          <span className="text-xl font-extrabold text-[#e7e5e5] tracking-tighter font-headline">EntryShield</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8">
            <a className="text-[#e7e5e5]/60 hover:text-[#adc6ff] font-label transition-colors" href="/dashboard">Panel</a>
            <a className="text-[#e7e5e5]/60 hover:text-[#adc6ff] font-label transition-colors" href="/occupancy">Visitantes</a>
            <a className="text-[#adc6ff] font-label transition-colors border-b-2 border-[#adc6ff] pb-1" href="/compliance">Cumplimiento</a>
          </div>
          <div className="h-10 w-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden">
            <img 
              alt="Security Manager Profile"
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrVwSu4hk18n53wJrqRMztFOfEbXvxiku2cvAPN4sdtJKEqvym8m-2WLsCm7SAgGJ587ppAxn-5yKQoQ-jqAtvHzg865l9qJgbAC7GigEKt5MOCULKlB2NULwKTuy90TCiYgXk0D-qjzipR1NIy6LEAEeHx16pdm7_cgf6M3FczbcM09_aKKuChQYtbh89vLKrOYxI8R3AXH3xbVS4EFEcjgtHF1CnspNr6haSEd5a9CpNxbwbNf14ZW4gc8bv4i-TuG45RPyFaO4N"
            />
          </div>
        </div>
      </header>
      
      <div className="flex pt-20 pb-24 md:pb-0">
        {/* NavigationDrawer (Sidebar) */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-5rem)] w-80 bg-[#0e0e0e] fixed left-0 border-r border-outline-variant/10 py-8 z-40">
          <div className="px-8 mb-10">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[#e7e5e5] font-black font-headline">Modo Personal</span>
              <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(155,255,206,0.6)]"></span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">Luxury Estates Alpha • v2.4.0</p>
          </div>
          <nav className="flex flex-col gap-1">
            <a className="flex items-center gap-4 text-[#e7e5e5]/50 px-8 py-4 hover:bg-[#131313] hover:text-[#e7e5e5] transition-all" href="/reports/admin">
              <span className="material-symbols-outlined" data-icon="assessment">assessment</span>
              <span className="font-headline font-semibold">Reportes</span>
            </a>
            <a className="flex items-center gap-4 text-[#e7e5e5]/50 px-8 py-4 hover:bg-[#131313] hover:text-[#e7e5e5] transition-all" href="/properties">
              <span className="material-symbols-outlined" data-icon="apartment">apartment</span>
              <span className="font-headline font-semibold">Propiedades</span>
            </a>
            <a className="flex items-center gap-4 text-[#e7e5e5]/50 px-8 py-4 hover:bg-[#131313] hover:text-[#e7e5e5] transition-all" href="/rules">
              <span className="material-symbols-outlined" data-icon="gavel">gavel</span>
              <span className="font-headline font-semibold">Reglas</span>
            </a>
            <a className="flex items-center gap-4 bg-gradient-to-r from-[#adc6ff]/10 to-transparent text-[#adc6ff] border-l-4 border-[#adc6ff] px-8 py-4 transition-all" href="/compliance">
              <span className="material-symbols-outlined" data-icon="verified_user">verified_user</span>
              <span className="font-headline font-semibold">Cumplimiento</span>
            </a>
            <a className="flex items-center gap-4 text-[#e7e5e5]/50 px-8 py-4 hover:bg-[#131313] hover:text-[#e7e5e5] transition-all" href="/settings">
              <span className="material-symbols-outlined" data-icon="settings">settings</span>
              <span className="font-headline font-semibold">Ajustes</span>
            </a>
          </nav>
        </aside>
        
        {/* Main Content Canvas */}
        <main className="flex-1 md:ml-80 p-6 md:p-12 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="mb-12">
            <span className="text-primary font-label text-sm font-semibold tracking-widest uppercase mb-2 block">Configuración del Sistema</span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-4">Cumplimiento y Privacidad</h2>
            <p className="text-on-surface-variant max-w-2xl leading-relaxed">Configure cómo se capturan, retienen y enmascaran los datos de los visitantes para cumplir con el GDPR, PDPA y los requisitos de inmigración locales.</p>
          </div>
          
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Primary Settings Card */}
            {property ? (
              <ComplianceForm propertyId={property.id} initialConfig={config} />
            ) : (
              <div className="lg:col-span-7 bg-error-container/20 p-8 rounded-xl text-error text-center font-bold">Error: No se encontró la propiedad por defecto.</div>
            )}
            
            {/* Secondary Data/Status Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* Audit Log View */}
              <section className="bg-surface-container-high rounded-xl p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold font-headline">Actividad Reciente del Personal</h3>
                  <span className="text-xs font-bold text-tertiary uppercase tracking-tighter">Transmisión en vivo</span>
                </div>
                <div className="space-y-4 flex-1">
                  {/* Log Item */}
                  <div className="flex gap-4 p-4 rounded-lg hover:bg-surface-bright transition-colors cursor-default">
                    <div className="w-2 h-2 rounded-full bg-tertiary-fixed-dim mt-2"></div>
                    <div>
                      <p className="text-sm font-semibold">Admin (Marcus) actualizó Texto de Consentimiento</p>
                      <p className="text-[11px] text-on-surface-variant mt-1">Hace 2 horas • IP: 192.168.1.42</p>
                    </div>
                  </div>
                  {/* Log Item */}
                  <div className="flex gap-4 p-4 rounded-lg hover:bg-surface-bright transition-colors cursor-default">
                    <div className="w-2 h-2 rounded-full bg-secondary-fixed-dim mt-2"></div>
                    <div>
                      <p className="text-sm font-semibold">El sistema eliminó automáticamente 24 registros de visitantes</p>
                      <p className="text-[11px] text-on-surface-variant mt-1">Hace 5 horas • Tarea del Sistema</p>
                    </div>
                  </div>
                  {/* Log Item */}
                  <div className="flex gap-4 p-4 rounded-lg hover:bg-surface-bright transition-colors cursor-default">
                    <div className="w-2 h-2 rounded-full bg-error-dim mt-2"></div>
                    <div>
                      <p className="text-sm font-semibold">Exportación de datos solicitada por J. Doe</p>
                      <p className="text-[11px] text-on-surface-variant mt-1">Ayer, 14:30 • Solicitud GDPR</p>
                    </div>
                  </div>
                </div>
                
                {/* Legal Disclaimer Block */}
                <div className="mt-8 p-6 rounded-xl bg-surface-container-lowest border-l-4 border-primary">
                  <div className="flex gap-2 items-center mb-2">
                    <span className="material-symbols-outlined text-xs" data-icon="info">info</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Aviso Legal de Cumplimiento</span>
                  </div>
                  <p className="text-xs leading-relaxed text-on-surface-variant">
                    EntryShield proporciona herramientas técnicas para el cumplimiento normativo. Consulte con asesores legales locales para asegurar que su configuración cumpla con las leyes específicas de inmigración y hostelería de su jurisdicción.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-xl border-t border-[#e7e5e5]/10 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        <button className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 active:scale-90 duration-200">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Panel</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 active:scale-90 duration-200">
          <span className="material-symbols-outlined" data-icon="search">search</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Buscar</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 active:scale-90 duration-200">
          <span className="material-symbols-outlined" data-icon="group">group</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Visitantes</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-[#1f2020] text-[#adc6ff] rounded-xl px-4 py-2 active:scale-90 duration-200">
          <span className="material-symbols-outlined" data-icon="warning">warning</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Incidentes</span>
        </button>
      </nav>
    </div>
  );
}
