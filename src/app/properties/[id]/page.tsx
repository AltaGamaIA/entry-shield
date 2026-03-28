import React from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from 'next/link';

export const dynamic = "force-dynamic";

export default async function PropertyDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { reservations: true, users: true }
      }
    }
  });

  if (!property) {
    redirect("/properties/select");
  }

  // Fetch some recent visitors to this property
  const recentVisits = await prisma.visit.findMany({
    where: {
      visitor: {
        reservation: {
          propertyId: property.id
        }
      }
    },
    take: 5,
    orderBy: { checkInTime: 'desc' },
    include: { visitor: { include: { reservation: true } } } as any
  });

  let configData: any = {};
  if (property.config) {
    try {
      configData = JSON.parse(property.config);
    } catch(e) {}
  }

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen pb-24 md:pb-0">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-6 h-20 w-full fixed top-0 z-50 bg-[#131313]/60 backdrop-blur-lg border-b border-outline-variant/5">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <Link href="/properties/select" className="material-symbols-outlined text-[#e7e5e5] hover:text-primary transition-colors cursor-pointer mr-2">arrow_back</Link>
          <span className="material-symbols-outlined text-[#adc6ff]" data-icon="shield">shield</span>
          <span className="text-xl font-extrabold text-[#e7e5e5] tracking-tighter font-headline">EntryShield</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="h-10 w-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-primary" data-icon="apartment">apartment</span>
          </div>
        </div>
      </header>
      
      <main className="pt-32 p-6 md:p-12 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-12">
          <span className="text-primary font-label text-sm font-semibold tracking-widest uppercase mb-2 block">Detalles de la Sede</span>
          <h2 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-4">{property.name}</h2>
          <div className="flex items-center gap-2 text-on-surface-variant text-lg">
            <span className="material-symbols-outlined">location_on</span>
            <span>{property.address && property.address !== 'null' ? property.address : 'Dirección no especificada'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <div className="bg-surface-container-low p-6 rounded-3xl border-l-4 border-primary">
             <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-2">Visitas Históricas</p>
             <p className="text-4xl font-extrabold text-on-surface font-headline">{property._count.reservations}</p>
           </div>
           <div className="bg-surface-container-low p-6 rounded-3xl border-l-4 border-tertiary">
             <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-2">Personal Asignado</p>
             <p className="text-4xl font-extrabold text-on-surface font-headline">{property._count.users}</p>
           </div>
           <div className="bg-surface-container-low p-6 rounded-3xl border-l-4 border-secondary">
             <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-2">Estado</p>
             <div className="flex items-center gap-2 mt-2">
                 <span className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_8px_rgba(205,229,255,0.6)] animate-pulse"></span>
                 <span className="text-xl font-extrabold text-on-surface font-headline uppercase tracking-widest">Activa</span>
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <h3 className="text-2xl font-bold font-headline text-on-surface border-b border-outline-variant/10 pb-4">Configuración de Seguridad</h3>
                <div className="bg-surface-container-high rounded-2xl p-6">
                    <h4 className="font-bold text-sm text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">gavel</span>
                        Protocolo de Turno Actual
                    </h4>
                    <p className="text-on-surface-variant leading-relaxed text-sm">
                        {configData.shiftProtocol || "Políticas estándar de acceso en efecto. Sin protocolos especiales definidos."}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-2xl font-bold font-headline text-on-surface border-b border-outline-variant/10 pb-4 flex justify-between items-center">
                    Últimos Accesos
                </h3>
                <div className="space-y-3">
                    {(recentVisits as any[]).map(visit => {
                        const name = visit.visitor?.name || "Visitante";
                        const isOut = !!visit.checkOutTime;
                        return (
                            <div key={visit.id} className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-surface-container-highest">
                                        {visit.visitor?.selfieUrl ? (
                                            <img src={visit.visitor.selfieUrl} className="w-full h-full object-cover" alt="visitor" />
                                        ) : (
                                            <span className="material-symbols-outlined text-on-surface-variant">person</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-on-surface">{name}</p>
                                        <p className="text-xs text-on-surface-variant">{new Date(visit.checkInTime).toLocaleString()} </p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter w-20 text-center ${!isOut ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant border border-outline-variant/20'}`}>
                                    {!isOut ? 'Adentro' : 'Salió'}
                                </span>
                            </div>
                        )
                    })}
                    {recentVisits.length === 0 && (
                        <p className="text-sm text-on-surface-variant italic p-4 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/20">No hay registros recientes para esta sede.</p>
                    )}
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}
