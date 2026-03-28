import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import StartShiftButton from '@/components/StartShiftButton';

export const dynamic = "force-dynamic";

export default async function PropertySelectPage() {
  const dbProperties = await prisma.property.findMany();

  const properties = await Promise.all(
    dbProperties.map(async (prop) => {
      const activeVisits = await prisma.visit.count({
        where: {
          checkOutTime: null,
          visitor: {
            reservation: {
              propertyId: prop.id,
            },
          },
        },
      });

      return {
        ...prop,
        activeVisits,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKpmUoOT2YPJ3CNCVwoCkIklEzEvNIwfRNT3ErYv5gy5hAk2DGBTgywjhI73lF8wDiXOvpnXTwvF6NoDN4Kgyv0aroC4DqtdcQWOcn2NDydk2SLcIl2oCVTTbD3s4rFlgupmTSXbIj4IVM15s2sNRuywpmLIY0HopnrS-gquCwKaoAzut1KLpY24dE8YcbaCnk1aPGWVfUjfF6zXFcf9FANQIReC3A7OJ7dHti_pmJCJ7WXSsiX3eFgk4eVnsw1Lo80qlFA5J_7XPE", // Imagen estática placeholder
      };
    })
  );

  // Si no hay propiedades creadas, podemos mostrar un mensaje vacío
  const mainProperty = properties.length > 0 ? properties[0] : null;
  const secondaryProperties = properties.slice(1);

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen pb-24 md:pb-0">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-6 h-20 w-full fixed top-0 z-50 bg-[#131313]/60 backdrop-blur-lg border-b border-outline-variant/10">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <span className="material-symbols-outlined text-[#adc6ff]" data-icon="shield">shield</span>
          <span className="text-xl font-extrabold text-[#e7e5e5] tracking-tighter font-headline">EntryShield</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary-container/10 border border-tertiary-container/20">
            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(105,246,184,0.6)] animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-widest text-tertiary uppercase font-label">NODO CENTRAL</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGloLRFI2BZlc7IFzdrIaWk-5ll1pZP3bUD7NP_S5FFd0gvJ5SHC_L3panPxT5OUS30eQge3dVMWOvUJWGXDBeONWoXvgiZ0yKa3r_M5-9cVVtAXZuAqfKefmpLRmRGPNCWwWUIU2QgyfMK_YzSDLiHDm-joDMpySNRTHoLGhTFLaYoyCgjCpPMDOxsGJSbvRN3KqO6G442fNV3oerFXrU48jUybRi1CSC6pI9ibaaBt9LzjuTPwjMziMJIx00WE2pYVPf07KI9oNd" alt="Profile" />
          </div>
        </div>
      </header>
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        {/* Hero Section / Header */}
        <section className="mb-12">
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-[-0.03em] mb-4">
            Seleccionar Ubicación
          </h2>
          <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
            Bienvenido. Por favor, designe la propiedad principal para su turno actual para iniciar el monitoreo en tiempo real.
          </p>
        </section>
        
        {/* Properties Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Featured Property (Large) */}
          {mainProperty && (
            <div className="md:col-span-8 group relative overflow-hidden rounded-2xl bg-surface-container-low transition-all hover:translate-y-[-4px] shadow-xl">
              <Link href={`/properties/${mainProperty.id}`} className="block aspect-[16/9] w-full overflow-hidden cursor-pointer">
                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 hover:opacity-100" src={mainProperty.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBKpmUoOT2YPJ3CNCVwoCkIklEzEvNIwfRNT3ErYv5gy5hAk2DGBTgywjhI73lF8wDiXOvpnXTwvF6NoDN4Kgyv0aroC4DqtdcQWOcn2NDydk2SLcIl2oCVTTbD3s4rFlgupmTSXbIj4IVM15s2sNRuywpmLIY0HopnrS-gquCwKaoAzut1KLpY24dE8YcbaCnk1aPGWVfUjfF6zXFcf9FANQIReC3A7OJ7dHti_pmJCJ7WXSsiX3eFgk4eVnsw1Lo80qlFA5J_7XPE"} alt={mainProperty.name} />
              </Link>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary-fixed text-xs font-bold uppercase tracking-widest mb-3 border border-primary/30">Propiedad Principal</span>
                    <h3 className="text-3xl md:text-4xl font-headline font-black text-[#e7e5e5] mb-2">{mainProperty.name}</h3>
                    <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined text-sm" data-icon="location_on">location_on</span>
                      <span>{mainProperty.address && mainProperty.address !== 'null' ? mainProperty.address : 'Sin dirección'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end w-full md:w-auto">
                    <div className="flex items-center gap-3 mb-4 bg-surface-container-highest/60 backdrop-blur-md px-4 py-2 rounded-xl border border-outline-variant/20">
                      <span className="text-tertiary-fixed font-black text-3xl tracking-tight">{mainProperty.activeVisits}</span>
                      <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest leading-tight text-left md:text-right">Visitantes<br/>Activos</span>
                    </div>
                    <StartShiftButton propertyId={mainProperty.id} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Secondary Properties */}
          {secondaryProperties.map(prop => (
            <div key={prop.id} className="md:col-span-4 group bg-surface-container-high rounded-2xl overflow-hidden flex flex-col transition-all hover:bg-surface-bright border border-outline-variant/10 shadow-lg">
              <Link href={`/properties/${prop.id}`} className="block h-48 overflow-hidden cursor-pointer">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 hover:opacity-100" src={prop.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAcieqvC_9zD98VWDT12eMkFi3_T4tP3vcVW0ceJCFIkayccO41IQL3xgCPXGP7m6YoePkFlJQwCY0bPfC87sVt8H1BLrfElIuO4BEaNKiN6ObT3hac6Lwe-BzJpLj26zstZloHo2e_AldDOCMjb3zOQy-FqbSjHqMH8nZ6wNTQl_fQRhIsoZsenY6-8zdzeii1cTV0OtATIsGyooXi08thtcjdsRE1uYlgnE2gQsw6m2s2r8XYHCLCViPa82gF3ECApyAJxYMIh8tY"} alt={prop.name} />
              </Link>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-headline font-bold text-on-surface mb-2">{prop.name}</h3>
                <p className="text-on-surface-variant text-sm mb-6 flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  {prop.address && prop.address !== 'null' ? prop.address : 'Sin dirección'}
                </p>
                <div className="mt-auto flex justify-between items-center bg-surface-container-low p-3 rounded-xl border border-outline-variant/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest leading-tight">Visitantes<br/>Activos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-on-surface">{prop.activeVisits}</span>
                    <Link href={`/dashboard?propertyId=${prop.id}`} className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container-highest text-primary hover:bg-primary hover:text-on-primary transition-colors">
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Property Card 5 (Small List Style) */}
          <div className="md:col-span-4 group bg-surface-container-high rounded-2xl p-6 transition-all hover:bg-surface-bright border border-outline-variant/10 flex flex-col justify-center items-center border-dashed border-2 opacity-60">
            <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant" data-icon="add_business">add_business</span>
            <span className="text-on-surface font-semibold">Solicitar Acceso a Propiedad</span>
            <p className="text-xs text-on-surface-variant text-center mt-2 px-8 leading-relaxed">Contacte a su supervisor regional para añadir una nueva propiedad a su perfil.</p>
          </div>
        </section>
      </main>

      {/* BottomNavBar from Shared Components JSON */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-xl border-t border-[#e7e5e5]/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] md:hidden">
        <Link className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] active:scale-90 duration-200" href="/dashboard">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="font-label text-[11px] font-medium tracking-wide uppercase mt-1">Panel</span>
        </Link>
        {/* ACTIVE TAB: Properties */}
        <Link className="flex flex-col items-center justify-center bg-[#1f2020] text-[#adc6ff] rounded-xl px-4 py-2 active:scale-90 duration-200" href="/properties/select">
          <span className="material-symbols-outlined" data-icon="apartment">apartment</span>
          <span className="font-label text-[11px] font-medium tracking-wide uppercase mt-1">Turno Actual</span>
        </Link>
      </nav>
    </div>
  );
}
