import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import IncidentForm from '@/components/IncidentForm';

export const dynamic = "force-dynamic";

export default async function IncidentReportPage() {
  const [activeVisits, recentIncidents] = await Promise.all([
    prisma.visit.findMany({
      where: { checkOutTime: null },
      include: { visitor: true }
    }),
    prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-6 h-20 w-full fixed top-0 z-50 bg-[#131313]/60 backdrop-blur-lg bg-gradient-to-b from-[#131313] to-transparent">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
             <span className="material-symbols-outlined text-[#adc6ff]" data-icon="shield">shield</span>
             <span className="text-xl font-extrabold text-[#e7e5e5] tracking-tighter font-headline">EntryShield</span>
          </Link>
          <div className="ml-4 flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_0_0_rgba(105,246,184,0.7)] animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Estado del Sistema</span>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-[-0.02em] text-on-surface">Crear Reporte de Incidente</h1>
            <p className="text-on-surface-variant max-w-2xl">Registre brechas de seguridad, daños a la propiedad o violaciones de políticas. Todos los reportes tienen sello de tiempo y están encriptados para cumplimiento normativo.</p>
          </div>

          {/* Main Form Card */}
          <div className="bg-surface-container-high rounded-xl p-8 shadow-2xl border border-outline-variant/10">
            <IncidentForm activeVisits={activeVisits} />
          </div>
        </div>

        {/* Sidebar / Context */}
        <aside className="lg:col-span-4 space-y-6">

          {/* Compliance Warning */}
          <div className="bg-primary-container/10 rounded-xl p-6 border border-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-xl" data-icon="verified_user" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <h4 className="font-headline font-bold text-sm text-primary">Protocolo de Seguridad</h4>
            </div>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Todos los informes presentados a través de EntryShield están sujetos a la <span className="text-on-surface font-semibold underline underline-offset-4 decoration-primary/30">Ley de Cumplimiento de Privacidad v2.4</span>. La modificación no autorizada de los registros de seguridad es un delito federal. Asegúrese de que todas las pruebas se capturen in situ.
            </p>
          </div>

          {/* Recent Incidents Mini-List */}
          <div className="space-y-4">
            <h3 className="font-headline font-bold text-xs uppercase tracking-[0.15em] text-on-surface-variant/60 ml-2">Su Actividad Reciente</h3>
            <div className="space-y-2">
              {recentIncidents.map(incident => {
                const isHigh = incident.severity === 'HIGH' || incident.severity === 'CRITICAL';
                return (
                  <div key={incident.id} className="bg-surface-container-high/50 p-4 rounded-lg border border-transparent hover:border-outline-variant/10 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${isHigh ? 'bg-error-container/20 text-on-error-container' : 'bg-tertiary-container/20 text-on-tertiary-container'}`}>
                        {incident.severity}
                      </span>
                      <span className="text-[10px] text-on-surface-variant/60 font-mono">
                        {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-on-surface line-clamp-2" title={incident.description}>{incident.description}</p>
                  </div>
                );
              })}
              {recentIncidents.length === 0 && (
                 <p className="text-xs text-on-surface-variant text-center opacity-50 py-4">No hay incidentes reportados.</p>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-xl border-t border-[#e7e5e5]/10 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        <button className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] active:scale-90 duration-200 transition-all">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Panel</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] active:scale-90 duration-200 transition-all">
          <span className="material-symbols-outlined" data-icon="search">search</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Buscar</span>
        </button>
        <button className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] active:scale-90 duration-200 transition-all">
          <span className="material-symbols-outlined" data-icon="group">group</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Visitantes</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-[#1f2020] text-[#adc6ff] rounded-xl px-4 py-2 active:scale-90 duration-200 transition-all">
          <span className="material-symbols-outlined" data-icon="warning">warning</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Incidentes</span>
        </button>
      </footer>
    </div>
  );
}
