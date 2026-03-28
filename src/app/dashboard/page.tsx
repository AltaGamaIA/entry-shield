import React from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DashboardSearch from "@/components/DashboardSearch";
import DashboardProtocol from "@/components/DashboardProtocol";
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayVisits = await prisma.visit.count({
    where: { checkInTime: { gte: startOfToday } }
  });

  const insideVisits = await prisma.visit.count({
    where: { checkOutTime: null }
  });

  const pendingAlerts = await prisma.incident.count({
    where: { severity: { in: ['HIGH', 'CRITICAL'] } }
  });

  const isAdmin = session?.user?.role === 'ADMIN';

  const property = await prisma.property.findFirst({
    where: { name: "Alpha Heights" }
  });

  let shiftProtocol = "Asegúrese de que todas las entregas se registren a través de la Entrada de Servicio. El mantenimiento no programado requiere la autorización del gerente.";
  if (property?.config && !isAdmin) {
    try {
      const config = JSON.parse(property.config);
      if (config.shiftProtocol) shiftProtocol = config.shiftProtocol;
    } catch (e) {}
  } else if (isAdmin) {
    shiftProtocol = "MODO ADMINISTRADOR: Viendo resumen global sumado de todas las sucursales y operaciones activas.";
  }

  const recentVisits = await prisma.visit.findMany({
    take: 5,
    orderBy: { checkInTime: 'desc' },
    include: { visitor: { include: { reservation: { include: { property: true } } } } } as any
  });
  return (
    <div className="bg-background text-on-surface min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-6 h-20 w-full fixed top-0 z-50 bg-[#131313]/60 backdrop-blur-lg bg-gradient-to-b from-[#131313] to-transparent">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <span className="material-symbols-outlined text-[#adc6ff] text-2xl" data-icon="shield">shield</span>
          <span className="text-xl font-extrabold text-[#e7e5e5] tracking-tighter font-['Manrope']">EntryShield</span>
        </Link>
        <div className="hidden lg:flex items-center gap-6">
          <nav className="flex gap-4">
            <Link className="text-[#adc6ff] font-['Manrope'] font-bold tracking-[-0.02em] transition-all duration-300 px-2 py-1 bg-[#1f2020] rounded-lg" href="/dashboard">Panel</Link>
            <Link className="text-[#e7e5e5]/60 font-['Manrope'] font-bold tracking-[-0.02em] hover:text-[#e7e5e5] transition-all duration-300 px-2 py-1" href="/properties/select">Turno Actual</Link>
            <Link className="text-[#e7e5e5]/60 font-['Manrope'] font-bold tracking-[-0.02em] hover:text-[#e7e5e5] transition-all duration-300 px-2 py-1" href="/reservations/search">Reservas</Link>
            <Link className="text-[#e7e5e5]/60 font-['Manrope'] font-bold tracking-[-0.02em] hover:text-[#e7e5e5] transition-all duration-300 px-2 py-1" href="/occupancy">Visitantes</Link>
            <Link className="text-[#e7e5e5]/60 font-['Manrope'] font-bold tracking-[-0.02em] hover:text-[#e7e5e5] transition-all duration-300 px-2 py-1" href="/incidents/report">Incidentes</Link>
            <Link className="text-[#e7e5e5]/60 font-['Manrope'] font-bold tracking-[-0.02em] hover:text-[#e7e5e5] transition-all duration-300 px-2 py-1" href="/reports/admin">Reportes</Link>
            <Link className="text-[#e7e5e5]/60 font-['Manrope'] font-bold tracking-[-0.02em] hover:text-[#e7e5e5] transition-all duration-300 px-2 py-1" href="/rules">Reglas</Link>
            <Link className="text-[#e7e5e5]/60 font-['Manrope'] font-bold tracking-[-0.02em] hover:text-[#e7e5e5] transition-all duration-300 px-2 py-1" href="/settings">Ajustes</Link>
          </nav>
        </div>
        <Link href="/settings" className="flex items-center gap-4 hover:bg-surface-container-high/50 transition-colors p-2 rounded-xl cursor-pointer">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{session?.user?.name || 'Personal'} ({session?.user?.role || 'INVITADO'})</span>
            <span className="text-xs text-tertiary-fixed-dim flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container shadow-[0_0_8px_rgba(105,246,184,0.6)]"></span>
              Sistemas Nominales
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden shadow-sm shadow-black/20">
            <img className="w-full h-full object-cover" alt="Headshot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6HJfnBwVFI7NAV21-cwprze_dxQ1T_Pf9XsCkufI9Uhwr3E6wmHiU06GV3hvq_AoWawXd1CO7lUIonokJ4CIoaFIS3VspCT4TJf1vI2ybb0aTQkTZOcf85sJY_JkfDSFqu5_cRxgFx31WobBmn3KQEkCFVveNSYoJR9hsl74xuodDRlqVkiHiiAZsUNGzrkyx_fXIEPb99fLCqacUyj9ru4SJbfwUaeqM2cLa4Cjx6UvU3TXDdqPM7ZZsPtu6f3no0Dw3qYkfXTlA"/>
          </div>
        </Link>
      </header>
      <main className="pt-28 px-6 max-w-7xl mx-auto space-y-8">
        {/* Welcome & Property Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-secondary tracking-[0.2em] uppercase text-[11px] font-bold mb-1">{isAdmin ? "Resumen Global" : "Ubicación Actual"}</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">{isAdmin ? "Todas las Sedes (Sumadas)" : (property?.name || "Luxury Estates Alpha")}</h1>
          </div>
          <DashboardSearch />
        </div>
        {/* Bento Grid Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/reports/admin" className="bg-surface-container-low hover:bg-surface-container-high transition-colors p-6 rounded-3xl border-l-4 border-primary flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-md">
            <div>
              <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-1">Visitantes Hoy</p>
              <p className="text-3xl font-bold text-on-surface font-headline">{todayVisits.toString().padStart(2, '0')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface-container-high group-hover:bg-primary/10 transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform" data-icon="group">group</span>
            </div>
          </Link>
          <Link href="/occupancy" className="bg-surface-container-low hover:bg-surface-container-high transition-colors p-6 rounded-3xl border-l-4 border-tertiary flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-md">
            <div>
              <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-1">En el Interior</p>
              <p className="text-3xl font-bold text-on-surface font-headline">{insideVisits.toString().padStart(2, '0')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface-container-high group-hover:bg-tertiary/10 transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary group-hover:scale-110 transition-transform" data-icon="sensor_door">sensor_door</span>
            </div>
          </Link>
          <Link href="/incidents/report" className="bg-surface-container-low hover:bg-surface-container-high transition-colors p-6 rounded-3xl border-l-4 border-error flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-md">
            <div>
              <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-1">Alertas Pendientes</p>
              <p className="text-3xl font-bold text-error font-headline">{pendingAlerts.toString().padStart(2, '0')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface-container-high group-hover:bg-error/10 transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-error group-hover:scale-110 transition-transform" data-icon="warning">warning</span>
            </div>
          </Link>
        </div>
        {/* Layout Tension: Actions vs Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Quick Actions */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xl font-bold tracking-tight px-2">Operaciones Principales</h2>
            <div className="grid grid-cols-1 gap-4">
              <Link href="/visitors/register" className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg active:scale-95 transition-all">
                <span className="material-symbols-outlined text-2xl" data-icon="login">login</span>
                <div className="text-left">
                  <p className="font-bold">Registrar Entrada</p>
                  <p className="text-xs opacity-80">Escanear ID o entrada manual</p>
                </div>
                <span className="material-symbols-outlined ml-auto" data-icon="chevron_right">chevron_right</span>
              </Link>
              <Link href="/occupancy" className="flex items-center gap-4 p-5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/20 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-2xl text-secondary" data-icon="logout">logout</span>
                <div className="text-left">
                  <p className="font-bold">Registrar Salida</p>
                  <p className="text-xs text-on-surface-variant">Registrar salida y anular pase</p>
                </div>
                <span className="material-symbols-outlined ml-auto" data-icon="chevron_right">chevron_right</span>
              </Link>
              <Link href="/documents" className="flex items-center gap-4 p-5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/20 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-2xl text-tertiary" data-icon="folder_shared">folder_shared</span>
                <div className="text-left">
                  <p className="font-bold">Documentos de Identidad</p>
                  <p className="text-xs text-on-surface-variant">Consultar identificaciones biométricas</p>
                </div>
                <span className="material-symbols-outlined ml-auto" data-icon="chevron_right">chevron_right</span>
              </Link>
            </div>
            {isAdmin ? (
               <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/10 mt-8">
                 <div className="flex items-center gap-3 mb-4">
                   <span className="material-symbols-outlined text-tertiary">admin_panel_settings</span>
                   <h3 className="font-bold text-on-surface">Modo Administrador</h3>
                 </div>
                 <p className="text-sm text-on-surface-variant leading-relaxed text-justify">
                   {shiftProtocol}
                 </p>
               </div>
            ) : (
               <DashboardProtocol initialText={shiftProtocol} propertyId={property?.id || ""} />
            )}
          </div>
          {/* Right: Recent Activity Feed */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold tracking-tight">Actividad Reciente</h2>
              <Link href="/occupancy" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Ver Todos los Registros</Link>
            </div>
            <div className="space-y-4">
              {(recentVisits as any[]).map((visit: any) => {
                const name = visit.visitor?.name || "Visitante";
                const isOut = !!visit.checkOutTime;
                return (
                  <Link key={visit.id} href="/occupancy" className="flex items-center gap-5 p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-colors group border border-transparent hover:border-outline-variant/20">
                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-outline-variant/30 flex justify-center items-center bg-surface-container-highest">
                      {visit.visitor?.selfieUrl ? (
                         <img className="w-full h-full object-cover" src={visit.visitor.selfieUrl} alt={name}/>
                      ) : (
                         <span className="material-symbols-outlined text-on-surface-variant text-2xl">person</span>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-on-surface truncate pr-2 max-w-[150px]">{name}</h4>
                        <span className="text-[10px] text-on-surface-variant font-medium whitespace-nowrap">{new Date(visit.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant truncate">
                         {visit.visitor?.reservation?.property?.name || 'Alpha Heights'} • {isOut ? 'Salió' : 'Entró'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${!isOut ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'}`}>
                        {!isOut ? 'Pase Activo' : 'Completado'}
                      </span>
                    </div>
                  </Link>
                );
              })}
              {recentVisits.length === 0 && (
                <div className="text-sm text-on-surface-variant p-4 text-center border-2 border-dashed border-outline-variant/30 rounded-2xl">No hay actividad reciente.</div>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-6 pt-2 bg-[#131313]/90 backdrop-blur-xl border-t border-[#e7e5e5]/10 rounded-t-2xl lg:hidden overflow-x-auto gap-2">
        <Link className="flex flex-col items-center justify-center bg-[#1f2020] text-[#adc6ff] rounded-xl px-3 py-2 min-w-[64px]" href="/dashboard">
          <span className="material-symbols-outlined mb-1 text-[20px]" data-icon="dashboard">dashboard</span>
          <span className="font-['Inter'] text-[9px] font-bold tracking-wide uppercase">Panel</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-[#e7e5e5]/40 hover:text-[#e7e5e5] active:scale-90 duration-200 px-3 py-2 min-w-[64px]" href="/properties/select">
          <span className="material-symbols-outlined mb-1 text-[20px]" data-icon="apartment">apartment</span>
          <span className="font-['Inter'] text-[9px] font-bold tracking-wide uppercase mt-1">Turno Actual</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-[#e7e5e5]/40 hover:text-[#e7e5e5] active:scale-90 duration-200 px-3 py-2 min-w-[64px]" href="/reservations/search">
          <span className="material-symbols-outlined mb-1 text-[20px]" data-icon="search">search</span>
          <span className="font-['Inter'] text-[9px] font-bold tracking-wide uppercase">Reservas</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-[#e7e5e5]/40 hover:text-[#e7e5e5] active:scale-90 duration-200 px-3 py-2 min-w-[64px]" href="/reports/admin">
          <span className="material-symbols-outlined mb-1 text-[20px]" data-icon="assessment">assessment</span>
          <span className="font-['Inter'] text-[9px] font-bold tracking-wide uppercase">Reportes</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-[#e7e5e5]/40 hover:text-[#e7e5e5] active:scale-90 duration-200 px-3 py-2 min-w-[64px]" href="/rules">
          <span className="material-symbols-outlined mb-1 text-[20px]" data-icon="gavel">gavel</span>
          <span className="font-['Inter'] text-[9px] font-bold tracking-wide uppercase">Reglas</span>
        </Link>
      </nav>
      {/* Floating Action Button */}
      <Link href="/visitors/register" className="fixed right-6 bottom-24 md:bottom-8 w-16 h-16 rounded-full bg-primary text-on-primary shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined text-3xl" data-icon="add" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </Link>
    </div>
  );
}
