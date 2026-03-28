import React from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import RulesClient from './RulesClient';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

export default async function RulesAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const property = await prisma.property.findFirst({
    where: { name: "Alpha Heights" }
  });

  let initialRules = null;
  if (property?.config) {
    try {
      initialRules = JSON.parse(property.config);
    } catch(e) {}
  }

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
            <a className="text-[#adc6ff] font-label transition-colors border-b-2 border-[#adc6ff] pb-1" href="/rules">Reglas</a>
          </div>
          <div className="h-10 w-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-primary" data-icon="gavel">gavel</span>
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
            <a className="flex items-center gap-4 text-[#e7e5e5]/50 px-8 py-4 hover:bg-[#131313] hover:text-[#e7e5e5] transition-all" href="/properties">
              <span className="material-symbols-outlined" data-icon="apartment">apartment</span>
              <span className="font-headline font-semibold">Propiedades</span>
            </a>
            <a className="flex items-center gap-4 bg-gradient-to-r from-[#adc6ff]/10 to-transparent text-[#adc6ff] border-l-4 border-[#adc6ff] px-8 py-4 transition-all" href="/rules">
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
          <div className="mb-12">
            <span className="text-secondary font-label text-sm font-semibold tracking-widest uppercase mb-2 block">Motor Lógico</span>
            <h2 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Reglas de Acceso</h2>
            <p className="text-on-surface-variant max-w-2xl leading-relaxed">Configure las normativas de validación y fricción para el control de identidad biométrica en sus propiedades.</p>
          </div>
          
          <RulesClient propertyId={property?.id} initialRules={initialRules} />

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
        <Link href="/properties" className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-white transition-colors duration-200">
          <span className="material-symbols-outlined" data-icon="apartment">apartment</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Turno Actual</span>
        </Link>
        <Link href="/rules" className="flex flex-col items-center justify-center bg-[#1f2020] text-[#adc6ff] rounded-xl px-4 py-2 active:scale-90 duration-200">
           <span className="material-symbols-outlined" data-icon="gavel">gavel</span>
           <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Reglas</span>
        </Link>
      </nav>
    </div>
  );
}
