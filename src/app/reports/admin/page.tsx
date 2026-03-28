import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import ReportActions from '@/components/ReportActions';

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [totalVisits, deniedEntries, incidentCount] = await Promise.all([
    prisma.visit.count(),
    prisma.visitor.count({ where: { status: 'DENIED' } }),
    prisma.incident.count()
  ]);

  const incidentRate = totalVisits > 0 ? ((incidentCount / totalVisits) * 100).toFixed(2) : "0.00";

  const topVisitors = await prisma.visitor.findMany({
    include: { _count: { select: { visits: true } } },
    orderBy: { visits: { _count: 'desc' } },
    take: 4
  });

  const dbProperties = await prisma.property.findMany();
  
  // Optimization: Raw Query to avoid N+1 Property count issue
  type PropertyVisitCount = { id: string; count: bigint | number };
  const propertyVisitCounts = await prisma.$queryRaw<PropertyVisitCount[]>`
    SELECT p.id, COUNT(v.id) as count
    FROM "Property" p
    LEFT JOIN "Reservation" r ON r."propertyId" = p.id
    LEFT JOIN "Visitor" vis ON vis."reservationId" = r.id
    LEFT JOIN "Visit" v ON v."visitorId" = vis.id
    GROUP BY p.id
  `;

  const countsMap = propertyVisitCounts.reduce((acc, curr) => {
     acc[curr.id] = Number(curr.count);
     return acc;
  }, {} as Record<string, number>);

  const propertiesWithActivity = dbProperties.map((prop) => ({
    ...prop,
    totalVisits: countsMap[prop.id] || 0,
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPk7yWDojyD0B6Wuc_9RrLlvOlEfvZilBqiGTyprnuPaIjPx3p3TCf8C88gOJ0i4bAObUMcKLzpjEkImMJaX3zu_nI8f2rWk1KFeyb6MnHPDmNqnXZgDy0K16XcFaZmtzzYKV31Fy-iO9qe9Ksr4dq0XxVda1VFElA_Oyb-zO-4enee2ayIAvY8JOpEixkvbaBoUtHR8x0DOcBBZ22VjG27gLtrCuJs7ChzXpwMjOqbC8SOmay-XPVD_ULM04GXhaesVfiSaxX9r4g" // placeholder
  }));
  const topProperties = propertiesWithActivity.sort((a, b) => b.totalVisits - a.totalVisits).slice(0, 4);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentVisits = await prisma.visit.findMany({
    where: { checkInTime: { gte: sevenDaysAgo } },
    select: { checkInTime: true }
  });
  
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  recentVisits.forEach(v => dayCounts[v.checkInTime.getDay()]++);
  const useMock = recentVisits.length === 0;

  const chartData = [
    { day: 'Lun', visits: useMock ? 15 : dayCounts[1] },
    { day: 'Mar', visits: useMock ? 28 : dayCounts[2] },
    { day: 'Mié', visits: useMock ? 12 : dayCounts[3] },
    { day: 'Jue', visits: useMock ? 40 : dayCounts[4] },
    { day: 'Vie', visits: useMock ? 45 : dayCounts[5] },
    { day: 'Sáb', visits: useMock ? 25 : dayCounts[6] },
    { day: 'Dom', visits: useMock ? 10 : dayCounts[0] },
  ];
  const maxVisits = Math.max(...chartData.map(d => d.visits), 1);

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-6 h-20 w-full fixed top-0 z-50 bg-[#131313]/60 backdrop-blur-lg text-[#adc6ff] font-headline font-bold tracking-[-0.02em] shadow-none bg-gradient-to-b from-[#131313] to-transparent">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
             <span className="material-symbols-outlined text-2xl" data-icon="shield">shield</span>
             <h1 className="text-xl font-extrabold text-[#e7e5e5] tracking-tighter">EntryShield</h1>
          </Link>
          <div className="ml-4 flex items-center gap-2 px-3 py-1 bg-tertiary-container/10 rounded-full border border-tertiary/20">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="text-[10px] font-bold text-tertiary tracking-widest uppercase">Sistema En Vivo</span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto space-y-8">
        {/* Header Section with Exports */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">Panel de Analíticas</h2>
            <p className="text-on-surface-variant font-medium">Monitoreo de protocolos de seguridad y flujo de visitantes en todas las propiedades.</p>
          </div>
          <ReportActions
            stats={{ totalVisits, deniedEntries, incidentCount, incidentRate }}
            topProperties={topProperties}
            topVisitors={topVisitors}
          />
        </section>

        {/* Filters Bar */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2 bg-surface-container-low rounded-xl">
          <div className="relative">
            <select className="w-full bg-surface-container-lowest border-none text-on-surface text-sm rounded-lg focus:ring-1 focus:ring-primary py-3 pl-10 appearance-none">
              <option>Últimos 30 Días</option>
              <option>Últimos 7 Días</option>
              <option>Año a la Fecha</option>
            </select>
            <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-lg pointer-events-none" data-icon="calendar_today">calendar_today</span>
          </div>
          <div className="relative">
            <select className="w-full bg-surface-container-lowest border-none text-on-surface text-sm rounded-lg focus:ring-1 focus:ring-primary py-3 pl-10 appearance-none">
              <option>Todas las Propiedades</option>
              <option>Alpha Heights</option>
              <option>The Meridian</option>
              <option>Azure Villas</option>
            </select>
            <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-lg pointer-events-none" data-icon="apartment">apartment</span>
          </div>
          <div className="relative">
            <select className="w-full bg-surface-container-lowest border-none text-on-surface text-sm rounded-lg focus:ring-1 focus:ring-primary py-3 pl-10 appearance-none">
              <option>Todos los Estados</option>
              <option>Aprobado</option>
              <option>Denegado</option>
              <option>Marcado</option>
            </select>
            <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-lg pointer-events-none" data-icon="verified_user">verified_user</span>
          </div>
          <button className="bg-surface-bright text-on-surface font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-outline-variant transition-colors py-3">
            Aplicar Filtros
          </button>
        </section>

        {/* Stats Grid (Bento Style) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Visitors */}
          <div className="bg-surface-container-high p-8 rounded-xl flex flex-col justify-between group hover:bg-surface-bright transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label text-xs font-bold tracking-widest uppercase">Total de Visitantes</span>
              <span className="material-symbols-outlined text-primary">group</span>
            </div>
            <div className="mt-8">
              <h3 className="text-5xl font-headline font-extrabold text-on-surface">{totalVisits}</h3>
              <div className="flex items-center gap-2 mt-2 text-tertiary text-sm font-bold">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                En Tiempo Real
              </div>
            </div>
          </div>
          
          {/* Denied Entries */}
          <div className="bg-surface-container-high p-8 rounded-xl flex flex-col justify-between hover:bg-surface-bright transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label text-xs font-bold tracking-widest uppercase">Entradas Denegadas</span>
              <span className="material-symbols-outlined text-error">block</span>
            </div>
            <div className="mt-8">
              <h3 className="text-5xl font-headline font-extrabold text-on-surface">{deniedEntries}</h3>
              <div className="flex items-center gap-2 mt-2 text-error text-sm font-bold">
                <span className="material-symbols-outlined text-sm">warning</span>
                Vigilancia
              </div>
            </div>
          </div>
          
          {/* Incident Rate */}
          <div className="bg-surface-container-high p-8 rounded-xl flex flex-col justify-between hover:bg-surface-bright transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-on-surface-variant font-label text-xs font-bold tracking-widest uppercase">Tasa de Incidentes</span>
              <span className="material-symbols-outlined text-tertiary">query_stats</span>
            </div>
            <div className="mt-8">
              <h3 className="text-5xl font-headline font-extrabold text-on-surface">{incidentRate}%</h3>
              <div className="flex items-center gap-2 mt-2 text-on-surface-variant text-sm font-medium">
                ({incidentCount} incidentes reportados)
              </div>
            </div>
          </div>
        </section>

        {/* Main Chart & Sidebar Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visits by Day Chart (Visual Representation) */}
          <div className="lg:col-span-2 bg-surface-container-high p-8 rounded-xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-headline font-bold text-xl">Visitas por Día</h3>
              <div className="flex gap-2 items-center">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Autenticado</span>
              </div>
            </div>
            {/* Vertical Bar Chart: X = Day of week, Y = Visits */}
            <div className="flex items-end justify-between h-72 w-full gap-3 mt-6">
              {chartData.map((data) => {
                const percentage = Math.max((data.visits / maxVisits) * 100, 5);
                const isMax = data.visits === maxVisits;
                return (
                  <div key={data.day} className="flex flex-col items-center h-full w-full group">
                    <div className="flex flex-col items-center justify-end h-full w-full border-b border-outline-variant/30 pb-2 relative">
                      <span className={`text-xs font-bold mb-3 transition-opacity duration-300 ${isMax ? 'text-primary' : 'text-on-surface-variant opacity-0 group-hover:opacity-100'}`}>
                        {data.visits}
                      </span>
                      <div 
                        className={`w-full max-w-[48px] rounded-t-lg transition-all duration-700 ease-out ${isMax ? 'bg-primary shadow-[0_0_20px_rgba(173,198,255,0.4)]' : 'bg-primary/20 group-hover:bg-primary/40'}`}
                        style={{ height: `${percentage}%` }}
                      ></div>
                    </div>
                    {/* Day label directly under the bar */}
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mt-3">
                      {data.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Frequent Visitors List */}
          <div className="bg-surface-container-high p-8 rounded-xl overflow-hidden flex flex-col">
            <h3 className="font-headline font-bold text-xl mb-6">Visitantes Frecuentes</h3>
            <div className="space-y-6 flex-1 overflow-y-auto hide-scrollbar">
              {topVisitors.map(visitor => (
                <div key={visitor.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center border border-outline-variant">
                      <span className="material-symbols-outlined text-on-surface-variant" data-icon="badge">badge</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{visitor.name}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{visitor.documentType} • {visitor.documentId}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary">{visitor._count.visits} Entradas</span>
                </div>
              ))}
              {topVisitors.length === 0 && (
                <p className="text-sm text-on-surface-variant text-center mt-8">No hay registros suficientes.</p>
              )}
            </div>
            <button className="mt-6 text-center text-[10px] font-bold tracking-widest text-primary uppercase hover:underline">Ver Registro Global</button>
          </div>
        </section>

        {/* Properties with Most Activity */}
        <section className="bg-surface-container-low p-8 rounded-2xl">
          <h3 className="font-headline font-bold text-xl mb-8">Propiedades con Alta Actividad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topProperties.map((prop, idx) => {
              const isPeak = idx === 0 && prop.totalVisits > 0;
              return (
                <div key={prop.id} className="relative h-48 rounded-xl overflow-hidden group cursor-pointer border border-outline-variant/10">
                  <img 
                    alt={prop.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    src={prop.imageUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
                    {isPeak ? (
                      <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-1">Tráfico Pico</p>
                    ) : (
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Estable</p>
                    )}
                    <h4 className="font-bold text-on-surface">{prop.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-on-surface/60">{prop.totalVisits} Visitas Globales</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isPeak ? 'bg-tertiary/20 text-tertiary' : 'bg-secondary/20 text-secondary'}`}>
                        {isPeak ? 'Alto Vol.' : 'Normal'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {topProperties.length === 0 && (
              <div className="col-span-full py-8 text-center text-on-surface-variant opacity-50">
                 No hay propiedades reportadas actualmente.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-xl border-t border-[#e7e5e5]/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] rounded-t-2xl font-label text-[11px] font-medium tracking-wide uppercase md:hidden">
        <div className="flex flex-col items-center justify-center bg-[#1f2020] text-[#adc6ff] rounded-xl px-4 py-2 active:scale-90 duration-200 cursor-pointer">
          <span className="material-symbols-outlined mb-1" data-icon="dashboard">dashboard</span>
          <span>Panel</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] active:scale-90 duration-200 cursor-pointer">
          <span className="material-symbols-outlined mb-1" data-icon="search">search</span>
          <span>Buscar</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] active:scale-90 duration-200 cursor-pointer">
          <span className="material-symbols-outlined mb-1" data-icon="group">group</span>
          <span>Visitantes</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] active:scale-90 duration-200 cursor-pointer">
          <span className="material-symbols-outlined mb-1" data-icon="warning">warning</span>
          <span>Incidentes</span>
        </div>
      </nav>
    </div>
  );
}
