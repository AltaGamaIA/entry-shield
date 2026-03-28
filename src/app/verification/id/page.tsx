import Link from 'next/link';
import React from 'react';
import IdScanner from '@/components/IdScanner';

export default function IdVerificationPage({ searchParams }: { searchParams: { reservationId?: string, visitorId?: string, guestName?: string } }) {
  // If we have visitorId, we pass it down
  // The next route should go to selfie verification with the same query params
  const nextParams = new URLSearchParams();
  if (searchParams.reservationId) nextParams.set('reservationId', searchParams.reservationId);
  if (searchParams.visitorId) nextParams.set('visitorId', searchParams.visitorId);
  if (searchParams.guestName) nextParams.set('guestName', searchParams.guestName);
  
  const nextUrl = `/verification/selfie${nextParams.toString() ? `?${nextParams.toString()}` : ''}`;

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-6 h-20 w-full fixed top-0 z-50 bg-[#131313]/60 backdrop-blur-lg">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <span className="material-symbols-outlined text-[#adc6ff]" data-icon="shield">shield</span>
          <span className="text-xl font-extrabold text-[#e7e5e5] tracking-tighter font-headline">EntryShield</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary-container/10 border border-tertiary-container/20">
            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(105,246,184,0.6)] animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-widest text-tertiary uppercase font-label">Estado del Sistema en Vivo</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5">
            <img 
              alt="Perfil de Usuario" 
              className="w-full h-full rounded-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuASDUBIcSori78qP6SOB3yFP14KB3RKAkOJE224vWuqEkJcLCuLb9im6kOtlZ5cAeG_s7ZZOo3xZwZYRvtSJJ8Cxd7FhAePApInKEX58997_FSuISAVhW-yDkaC0H4H9JvqnR459xPUrv_ftpbyAHo285g4nqjbBtj02HrErKV1Kom-N7JQ-NdanAvLCrhqdliwIk5CJ9V47gSr_48mCBWLv1DXGHT5RYn5ANT-DBzGp84dYJGJloOkNv5rQIwkOotaSp3hhYab-He-"
            />
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Camera View */}
          <div className="lg:col-span-12 space-y-6 max-w-4xl mx-auto w-full">
            <h2 className="text-2xl font-extrabold tracking-tight font-headline text-on-surface text-center mb-6">Paso 1: Escanear Documento</h2>
            <IdScanner nextRoute={nextUrl} visitorId={searchParams.visitorId} />
            
            <div className="flex flex-wrap gap-4 items-center justify-between p-6 bg-surface-container-low rounded-3xl mt-8">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Tipos Soportados</h3>
                <div className="flex gap-3 mt-1">
                  <span className="px-3 py-1 rounded-lg bg-surface-container-high text-[11px] font-medium text-primary">Cédula Colombiana</span>
                  <span className="px-3 py-1 rounded-lg bg-surface-container-high text-[11px] font-medium text-primary">Pasaporte</span>
                  <span className="px-3 py-1 rounded-lg bg-surface-container-high text-[11px] font-medium text-primary">Cédula Venezolana</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Removed Right Column Mock OCR completely, as our actual flow captures the base64 and verifies the user via server action. OCR can be a future V2 feature. */}
          
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-xl border-t border-[#e7e5e5]/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] md:hidden">
        <a className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] transition-all" href="/dashboard">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Panel</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-[#1f2020] text-[#adc6ff] rounded-xl px-4 py-2 transition-all" href="/reservations/search">
          <span className="material-symbols-outlined" data-icon="search" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Buscar</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] transition-all" href="/occupancy">
          <span className="material-symbols-outlined" data-icon="group">group</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Visitantes</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] transition-all" href="/incidents/report">
          <span className="material-symbols-outlined" data-icon="warning">warning</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Incidentes</span>
        </a>
      </nav>
    </div>
  );
}
