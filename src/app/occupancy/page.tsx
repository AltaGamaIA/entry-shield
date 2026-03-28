import React from 'react';
import prisma from '@/lib/prisma';
import CheckoutButton from '@/components/CheckoutButton';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export default async function OccupancyPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams?.q || "";

  const insideVisits = await prisma.visit.findMany({
    where: { 
      checkOutTime: null,
      ...(q ? {
        visitor: {
          name: { contains: q }
        }
      } : {})
    },
    include: { visitor: true },
    orderBy: { checkInTime: 'desc' },
  });

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-6 h-20 w-full fixed top-0 z-50 bg-[#131313]/60 backdrop-blur-lg bg-gradient-to-b from-[#131313] to-transparent shadow-none">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <span className="material-symbols-outlined text-[#adc6ff] text-2xl" data-icon="shield">shield</span>
          <h1 className="text-xl font-extrabold text-[#e7e5e5] tracking-tighter font-['Manrope']">EntryShield</h1>
        </Link>

      </header>
      
      <main className="pt-28 pb-32 px-6 max-w-7xl mx-auto">
        {/* Header Section & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(105,246,184,0.6)] animate-pulse"></span>
              <span className="text-tertiary font-label text-sm font-semibold tracking-wider uppercase">Estado del Sistema en Vivo</span>
            </div>
            <h2 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface leading-none">
                                En el Interior
                            </h2>
            <p className="text-on-surface-variant max-w-md font-medium">
                                Monitoreo en tiempo real de credenciales activas y acceso de invitados dentro del perímetro.
                            </p>
          </div>
          <div className="bg-surface-container-high p-6 rounded-2xl flex items-center gap-6 min-w-[240px]">
            <div className="bg-primary-container/20 p-4 rounded-xl">
              <span className="material-symbols-outlined text-primary text-3xl" data-icon="group">group</span>
            </div>
            <div>
              <p className="text-4xl font-headline font-black text-on-surface leading-tight">{insideVisits.length.toString().padStart(2, '0')}</p>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Personas Adentro</p>
            </div>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <form method="GET" action="/occupancy" className="flex items-center bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/10 focus-within:border-primary/40 transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-xl mr-3" data-icon="search">search</span>
            <input name="q" defaultValue={q} className="bg-transparent border-none focus:ring-0 p-0 text-sm text-on-surface placeholder:text-on-surface-variant/50 w-48 outline-none" placeholder="Buscar visitantes..." type="text"/>
            <button type="submit" className="hidden">Buscar</button>
          </form>

        </div>
        
        {/* Visitor Grid (Asymmetric Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insideVisits.map((visit) => {
            const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={visit.id} className="bg-surface-container-high rounded-xl p-6 relative overflow-hidden group hover:bg-surface-bright transition-all duration-300">
                <div className="absolute top-4 right-4 bg-tertiary-container/10 text-tertiary-fixed-dim text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
                   Visitante
                </div>
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-surface-variant text-on-surface-variant border border-outline-variant/20">
                    <span className="material-symbols-outlined text-4xl" data-icon="person">person</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-headline font-bold text-on-surface">{visit.visitor.name}</h3>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs" data-icon="badge">badge</span>
                      {visit.visitor.documentType} {visit.visitor.documentId}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-container-lowest p-3 rounded-lg">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter mb-1">Llegada</p>
                    <p className="text-sm font-semibold text-on-surface">{formatTime(visit.checkInTime)}</p>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-lg">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter mb-1">Estado</p>
                    <p className="text-[11px] font-bold text-tertiary-fixed">ACTIVO</p>
                  </div>
                </div>
                <CheckoutButton visitId={visit.id} />
              </div>
            );
          })}
          
          {/* Quick Action Card */}
          <Link href="/visitors/register" className="bg-surface-container-low rounded-xl p-6 flex flex-col items-center justify-center text-center group border-2 border-dashed border-outline-variant/20 hover:border-primary/40 transition-all cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-primary-container/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-3xl" data-icon="person_add">person_add</span>
            </div>
            <h3 className="text-lg font-headline font-bold text-on-surface">Nueva Entrada</h3>
            <p className="text-xs text-on-surface-variant mt-1">Registrar un visitante manualmente</p>
          </Link>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-xl border-t border-[#e7e5e5]/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] rounded-t-2xl">
        <a className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] active:scale-90 duration-200" href="/dashboard">
          <span className="material-symbols-outlined mb-1" data-icon="dashboard">dashboard</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Panel</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] active:scale-90 duration-200" href="/reservations/search">
          <span className="material-symbols-outlined mb-1" data-icon="search">search</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Buscar</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-[#1f2020] text-[#adc6ff] rounded-xl px-4 py-2 active:scale-90 duration-200" href="/occupancy">
          <span className="material-symbols-outlined mb-1" data-icon="group" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Visitantes</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] active:scale-90 duration-200" href="/incidents/report">
          <span className="material-symbols-outlined mb-1" data-icon="warning">warning</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Incidentes</span>
        </a>
      </nav>
    </div>
  );
}
