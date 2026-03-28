import React from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from 'next/link';

export const dynamic = "force-dynamic";

export default async function PropertiesAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const properties = await prisma.property.findMany({
    include: {
      _count: {
        select: { reservations: true, users: true }
      }
    }
  });

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen pb-24 md:pb-0">
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
            <a className="text-[#adc6ff] font-label transition-colors border-b-2 border-[#adc6ff] pb-1" href="/properties">Propiedades</a>
          </div>
          <div className="h-10 w-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-primary" data-icon="apartment">apartment</span>
          </div>
        </div>
      </header>
      
      <div className="flex pt-20">
        {/* NavigationDrawer (Sidebar) */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-5rem)] w-80 bg-[#0e0e0e] fixed left-0 border-r border-outline-variant/10 py-8 z-40">
          <div className="px-8 mb-10">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[#e7e5e5] font-black font-headline">Modo Personal</span>
              <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(155,255,206,0.6)]"></span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium">Alpha Heights • v2.4.0</p>
          </div>
          <nav className="flex flex-col gap-1">
            <a className="flex items-center gap-4 text-[#e7e5e5]/50 px-8 py-4 hover:bg-[#131313] hover:text-[#e7e5e5] transition-all" href="/reports/admin">
              <span className="material-symbols-outlined" data-icon="assessment">assessment</span>
              <span className="font-headline font-semibold">Reportes</span>
            </a>
            <a className="flex items-center gap-4 bg-gradient-to-r from-[#adc6ff]/10 to-transparent text-[#adc6ff] border-l-4 border-[#adc6ff] px-8 py-4 transition-all" href="/properties">
              <span className="material-symbols-outlined" data-icon="apartment">apartment</span>
              <span className="font-headline font-semibold">Propiedades</span>
            </a>
            <a className="flex items-center gap-4 text-[#e7e5e5]/50 px-8 py-4 hover:bg-[#131313] hover:text-[#e7e5e5] transition-all" href="/rules">
              <span className="material-symbols-outlined" data-icon="gavel">gavel</span>
              <span className="font-headline font-semibold">Reglas</span>
            </a>
            <a className="flex items-center gap-4 text-[#e7e5e5]/50 px-8 py-4 hover:bg-[#131313] hover:text-[#e7e5e5] transition-all" href="/compliance">
              <span className="material-symbols-outlined" data-icon="verified_user">verified_user</span>
              <span className="font-headline font-semibold">Cumplimiento</span>
            </a>
            <a className="flex items-center gap-4 text-[#e7e5e5]/50 px-8 py-4 hover:bg-[#131313] hover:text-[#e7e5e5] transition-all" href="/settings">
              <span className="material-symbols-outlined" data-icon="settings">settings</span>
              <span className="font-headline font-semibold">Ajustes</span>
            </a>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 md:ml-80 p-6 md:p-12 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-primary font-label text-sm font-semibold tracking-widest uppercase mb-2 block">Portafolio Inmobiliario</span>
              <h2 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Sedes Registradas</h2>
              <p className="text-on-surface-variant max-w-2xl leading-relaxed">Gestione y monitorice el estatus activo de todas las localizaciones integradas al ecosistema EntryShield.</p>
            </div>
            <button className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto justify-center shadow-lg shadow-primary/20 cursor-not-allowed opacity-50" title="Función restringida en el MVP">
              <span className="material-symbols-outlined" data-icon="add">add</span>
              <span>Añadir Sede</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {properties.map((prop) => (
               <Link href={`/properties/${prop.id}`} key={prop.id} className="block bg-surface-container-high rounded-2xl p-6 border border-outline-variant/10 hover:border-primary/30 transition-all flex flex-col relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0 pointer-events-none group-hover:bg-primary/20 transition-colors"></div>
                   
                   <div className="flex justify-between items-start mb-6 relative z-10">
                     <div className="flex gap-4 items-center">
                       <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-inner border border-outline-variant/5">
                         <span className="material-symbols-outlined" data-icon="location_city">location_city</span>
                       </div>
                       <div>
                         <h3 className="text-xl font-bold font-headline text-on-surface">{prop.name}</h3>
                         <p className="text-xs text-on-surface-variant line-clamp-1 max-w-[200px]">{prop.address}</p>
                       </div>
                     </div>
                     <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-widest shadow-sm border border-tertiary/20">Activa</span>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-outline-variant/5 relative z-10">
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Visitas Asignadas</p>
                        <p className="text-2xl font-bold text-on-surface font-mono">{prop._count.reservations}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Personal de Seguridad</p>
                        <p className="text-2xl font-bold text-on-surface font-mono flex items-center gap-2">
                           {prop._count.users}
                           <span className="material-symbols-outlined text-sm text-secondary" data-icon="local_police">local_police</span>
                        </p>
                      </div>
                   </div>
               </Link>
            ))}
            
            {properties.length === 0 && (
                <div className="col-span-full p-12 text-center rounded-2xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-4" data-icon="domain_disabled">domain_disabled</span>
                    <p className="font-bold">No hay sedes registradas en el portafolio.</p>
                </div>
            )}
          </div>
        </main>
      </div>
      
       {/* BottomNavBar (Mobile) */}
       <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-xl border-t border-[#e7e5e5]/10 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        <Link href="/dashboard" className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-white transition-colors duration-200">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Panel</span>
        </Link>
        <Link href="/reports/admin" className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-white transition-colors duration-200">
          <span className="material-symbols-outlined" data-icon="assessment">assessment</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Reportes</span>
        </Link>
        <Link href="/properties" className="flex flex-col items-center justify-center bg-[#1f2020] text-[#adc6ff] rounded-xl px-4 py-2 active:scale-90 duration-200">
          <span className="material-symbols-outlined" data-icon="apartment">apartment</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Turno Actual</span>
        </Link>
        <Link href="/rules" className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-white transition-colors duration-200">
           <span className="material-symbols-outlined" data-icon="gavel">gavel</span>
           <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Reglas</span>
        </Link>
      </nav>
    </div>
  );
}
