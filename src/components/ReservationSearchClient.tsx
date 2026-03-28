"use client";

import Link from 'next/link';import React, { useState } from 'react';
import { searchReservations, createReservation, updateReservation, deleteReservation } from '@/app/actions/reservation';
import { deleteVisitor } from '@/app/actions/visitor';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

export default function ReservationSearchClient({ initialQuery = "" }: { initialQuery?: string }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [selectedRes, setSelectedRes] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResId, setEditingResId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ guestName: '', guestCount: 1, checkIn: '', checkOut: '', visitorPolicy: '' });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  React.useEffect(() => {
    const propId = localStorage.getItem('activePropertyId') || undefined;
    handleSearchQuery(initialQuery || "", propId);
  }, [initialQuery]);

  const handleSearchQuery = async (searchStr: string, activePropId?: string) => {
    setLoading(true);
    const res = await searchReservations(searchStr, activePropId);
    if (res.success && res.reservations) {
      setResults(res.reservations);
      setSelectedRes(res.reservations.length > 0 ? res.reservations[0] : null);
    } else {
      alert(res.error || "Error buscando reservas");
    }
    setLoading(false);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const propId = localStorage.getItem('activePropertyId') || undefined;
    await handleSearchQuery(query, propId);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const combinedPolicy = `#GUESTS:${formData.guestCount}#\n${formData.visitorPolicy}`;
    try {
      if (editingResId) {
         const res = await updateReservation(editingResId, {
            guestName: formData.guestName,
            visitorPolicy: combinedPolicy,
            checkIn: new Date(formData.checkIn),
            checkOut: new Date(formData.checkOut)
         });
         if (res.success) {
            setIsModalOpen(false);
            handleSearchQuery(query); 
         } else {
            alert(res.error);
         }
      } else {
         const activeProp = localStorage.getItem('activePropertyId') || ''; 
         if (!activeProp) {
            alert('Debe seleccionar una sede ("Turno Actual") antes de crear la reserva.');
            setSaving(false);
            return;
         }
         const res = await createReservation({
            guestName: formData.guestName,
            visitorPolicy: combinedPolicy,
            checkIn: new Date(formData.checkIn),
            checkOut: new Date(formData.checkOut),
            propertyId: activeProp
         });
         if (res.success) {
            setIsModalOpen(false);
            if (!query) setQuery(formData.guestName);
            handleSearchQuery(formData.guestName);
         } else {
            alert(res.error);
         }
      }
    } catch(e) {
      alert("Error inesperado guardando reserva.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta reserva? Esta acción no se puede deshacer.")) return;
    const res = await deleteReservation(id);
    if (res.success) {
      setSelectedRes(null);
      const propId = localStorage.getItem('activePropertyId') || undefined;
      handleSearchQuery(query, propId);
    } else {
      alert(res.error || "Error al eliminar");
    }
  };

  const handleDeleteVisitor = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Está seguro de que desea eliminar este acompañante?")) return;
    const res = await deleteVisitor(id);
    if (res.success) {
      const propId = localStorage.getItem('activePropertyId') || undefined;
      handleSearchQuery(query, propId); // Reload to update visitors list
    } else {
      alert(res.error || "Error al eliminar acompañante");
    }
  };

  const handleCheckIn = () => {
    if (!selectedRes) return;
    if (selectedRes.type === 'VISITOR') {
      router.push(`/verification/id?visitorId=${selectedRes.original.id}&guestName=${encodeURIComponent(selectedRes.guestName)}`);
    } else {
      router.push(`/verification/id?reservationId=${selectedRes.id}&guestName=${encodeURIComponent(selectedRes.guestName)}`);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen pb-24 md:pb-0">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-6 h-20 w-full fixed top-0 z-50 bg-[#131313]/60 backdrop-blur-lg border-b border-outline-variant/10">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <span className="material-symbols-outlined text-[#adc6ff]" data-icon="shield">shield</span>
          <span className="text-xl font-extrabold text-[#e7e5e5] tracking-tighter font-headline">EntryShield</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6 font-['Manrope'] font-bold tracking-[-0.02em]">
            <a className="text-[#e7e5e5]/60 hover:bg-[#1f2020] transition-all duration-300 px-3 py-1 rounded-lg" href="/dashboard">Panel</a>
            <a className="text-[#adc6ff] transition-all duration-300 px-3 py-1 rounded-lg" href="/reservations/search">Reservas</a>
            <a className="text-[#e7e5e5]/60 hover:bg-[#1f2020] transition-all duration-300 px-3 py-1 rounded-lg" href="/occupancy">Visitantes</a>
            <a className="text-[#e7e5e5]/60 hover:bg-[#1f2020] transition-all duration-300 px-3 py-1 rounded-lg" href="/incidents/report">Incidentes</a>
          </nav>
          <div className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGloLRFI2BZlc7IFzdrIaWk-5ll1pZP3bUD7NP_S5FFd0gvJ5SHC_L3panPxT5OUS30eQge3dVMWOvUJWGXDBeONWoXvgiZ0yKa3r_M5-9cVVtAXZuAqfKefmpLRmRGPNCWwWUIU2QgyfMK_YzSDLiHDm-joDMpySNRTHoLGhTFLaYoyCgjCpPMDOxsGJSbvRN3KqO6G442fNV3oerFXrU48jUybRi1CSC6pI9ibaaBt9LzjuTPwjMziMJIx00WE2pYVPf07KI9oNd" alt="Profile" />
          </div>
        </div>
      </header>

      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Search Section */}
        <section className="lg:col-span-4 space-y-6">
          <form onSubmit={handleSearch} className="bg-surface-container-high rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
               <h1 className="font-headline font-bold text-2xl tracking-tight">Reservas</h1>
               <button 
                  type="button" 
                  onClick={() => {
                     setEditingResId(null);
                     const now = new Date();
                     const tomorrow = new Date(now);
                     tomorrow.setDate(tomorrow.getDate() + 1);
                     // Format to YYYY-MM-DDThh:mm string for datetime-local
                     setFormData({ guestName: '', guestCount: 1, checkIn: now.toISOString().slice(0, 16), checkOut: tomorrow.toISOString().slice(0, 16), visitorPolicy: '' });
                     setIsModalOpen(true);
                  }}
                  className="bg-primary hover:bg-[#92c5ff] text-on-primary text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-primary/20"
               >
                 <span className="material-symbols-outlined text-[16px]" data-icon="add">add</span> Añadir
               </button>
            </div>
            <div className="space-y-4">
              <div className="group relative">
                <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Buscar Huésped o Código</label>
                <div className="flex items-center bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 focus-within:border-primary/50 transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant mr-3 text-sm" data-icon="search">search</span>
                  <input 
                    className="bg-transparent border-none focus:ring-0 text-on-surface w-full font-body text-sm placeholder:text-on-surface-variant/40 outline-none" 
                    placeholder="ej. Julianne Moore" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="text"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-[#adc6ff] to-[#004493] text-[#003d87] font-headline font-extrabold py-4 rounded-xl shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined" data-icon="search">search</span>
                {loading ? "Buscando..." : "Ejecutar Búsqueda"}
              </button>
            </div>
          </form>
          
          {/* Search Results List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-label text-on-surface-variant uppercase tracking-widest">Resultados</h3>
              <span className="text-xs text-primary font-medium">{results.length} Reservas</span>
            </div>
            
            {results.length === 0 && !loading && (
                <div className="p-4 text-center text-on-surface-variant text-sm border-2 border-dashed border-outline-variant/30 rounded-xl">
                    Busque un nombre para ver los resultados aquí.
                </div>
            )}

            {results.map((res: any) => (
              <div 
                key={res.id}
                onClick={() => setSelectedRes(res)}
                className={`transition-colors p-4 rounded-xl flex items-center gap-4 cursor-pointer group border ${selectedRes?.id === res.id ? 'bg-surface-container-high ring-1 ring-primary/30 border-primary/20' : 'bg-surface-container-low hover:bg-surface-bright border-transparent hover:border-outline-variant/10'}`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-surface-container-highest flex justify-center items-center">
                    <span className="material-symbols-outlined text-on-surface-variant">person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1.5 justify-center">
                    <h4 className="font-headline font-bold text-on-surface text-[17px] truncate">{res.guestName}</h4>
                    <div className="flex flex-wrap items-center gap-2">
                       <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${res.type === 'RESERVATION' ? 'bg-primary/20 text-primary' : 'bg-tertiary/20 text-tertiary'}`}>
                          {res.type === 'RESERVATION' ? 'Reservación' : 'Visitante'}
                       </span>
                       <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-container text-secondary uppercase flex items-center gap-1">
                          {res.status}
                          {res.type === 'RESERVATION' && (
                             <>
                             <button
                                type="button"
                                onClick={(e) => {
                                   e.stopPropagation();
                                   setEditingResId(res.id);
                                   const ci = new Date(res.original.checkIn).toISOString().slice(0, 16);
                                   const co = new Date(res.original.checkOut).toISOString().slice(0, 16);
                                   let gc = 1;
                                   let vp = res.original.visitorPolicy || '';
                                   const match = vp.match(/#GUESTS:(\d+)#\n?/);
                                   if (match) {
                                      gc = parseInt(match[1]);
                                      vp = vp.replace(match[0], '');
                                   }
                                   setFormData({ guestName: res.guestName, guestCount: gc, checkIn: ci, checkOut: co, visitorPolicy: vp });
                                   setIsModalOpen(true);
                                }}
                                className="ml-1 hover:text-primary transition-colors flex items-center justify-center p-1 rounded-full hover:bg-surface-container-highest"
                             >
                                <span className="material-symbols-outlined text-[12px]">edit</span>
                             </button>
                             {isAdmin && (
                               <button
                                  type="button"
                                  onClick={(e) => {
                                     e.stopPropagation();
                                     handleDeleteReservation(res.id);
                                  }}
                                  className="hover:text-error transition-colors flex items-center justify-center p-1 rounded-full hover:bg-surface-container-highest"
                                  title="Eliminar reserva"
                               >
                                  <span className="material-symbols-outlined text-[12px]">delete</span>
                               </button>
                             )}
                             </>
                          )}
                       </span>
                    </div>
                  </div>
                </div>
                {selectedRes?.id === res.id && (
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(173,198,255,0.6)]"></div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Reservation Details Section */}
        <section className="lg:col-span-8 space-y-8">
          {selectedRes ? (
            <div className="bg-surface rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/10 relative">
              {/* Header Hero */}
              <div className="h-48 relative overflow-hidden bg-surface-container-highest">
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
                <div className="absolute bottom-6 left-8 flex items-end gap-6">
                  <div className="w-24 h-24 rounded-2xl border-4 border-surface shadow-2xl overflow-hidden bg-surface-container flex justify-center items-center">
                     <span className="material-symbols-outlined text-5xl text-on-surface-variant">qr_code_2</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-headline font-extrabold text-3xl tracking-tight text-on-surface">{selectedRes.guestName}</h2>
                      <span className="bg-tertiary/20 text-tertiary-fixed text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> {selectedRes.status}
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> Verificado
                      </span>
                    </div>
                    <p className="text-on-surface-variant font-medium flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" data-icon="location_on">location_on</span>
                      {selectedRes.type === 'VISITOR' ? 'Pase Manual' : (selectedRes.property?.name || 'Urbanización Central')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Bento Info Grid */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Core Info */}
                <div className="md:col-span-2 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-container-low p-5 rounded-2xl">
                      <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest block mb-2">Ingreso Aprobado</span>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-on-surface">{selectedRes.type === 'VISITOR' ? 'Acceso Directo' : new Date(selectedRes.original?.checkIn || selectedRes.checkIn).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="bg-surface-container-low p-5 rounded-2xl">
                        <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest block mb-2">Checkout Límite</span>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-on-surface">{selectedRes.type === 'VISITOR' ? 'Ilimitado (Turno)' : new Date(selectedRes.original?.checkOut || selectedRes.checkOut).toLocaleString()}</span>
                        </div>
                    </div>
                  </div>
                  
                  <div className="bg-surface-container-low p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-6xl" data-icon="policy">policy</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary" data-icon="gavel">gavel</span>
                      <h3 className="font-headline font-bold text-lg">Reglas Asociadas</h3>
                    </div>
                    <div className="bg-secondary-container/20 border border-secondary-container/30 p-4 rounded-xl mb-4">
                      {(() => {
                        let vp = selectedRes.type === 'VISITOR' ? 'Visita manual registrada en recepción.' : (selectedRes.visitorPolicy || selectedRes.original?.visitorPolicy || '');
                        let gc = 1;
                        const match = vp.match(/#GUESTS:(\d+)#\n?/);
                        if (match) {
                           gc = parseInt(match[1]);
                           vp = vp.replace(match[0], '').trim();
                        }
                        return (
                          <div className="flex gap-3">
                            <span className="material-symbols-outlined text-secondary" data-icon="info">info</span>
                            <div className="w-full">
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-sm font-bold text-on-secondary-container">Notas de Seguridad</p>
                                {selectedRes.type === 'RESERVATION' && (
                                  <span className="text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">group</span>
                                    {gc} Huésped{gc !== 1 ? 'es' : ''}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-on-secondary-container/80 whitespace-pre-wrap">{vp || 'Sin notas adicionales.'}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {selectedRes.type === 'RESERVATION' && selectedRes.original.visitors && selectedRes.original.visitors.length > 0 && (
                  <div className="bg-surface-container-low p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-6xl" data-icon="group">group</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-tertiary" data-icon="how_to_reg">how_to_reg</span>
                      <h3 className="font-headline font-bold text-lg">Invitados Registrados</h3>
                    </div>
                    <div className="space-y-2">
                       {selectedRes.original.visitors.map((v: any, i: number) => (
                         <div key={i} className="bg-surface-container-high rounded-xl p-3 flex justify-between items-center border border-outline-variant/10">
                            <div>
                               <p className="text-sm font-bold text-on-surface">{v.name}</p>
                               <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{v.documentId}</p>
                            </div>
                            <div className="flex items-center gap-2">
                               <span className="material-symbols-outlined text-tertiary/60 text-lg" data-icon="badge">badge</span>
                               {isAdmin && (
                                 <button 
                                   type="button" 
                                   onClick={(e) => handleDeleteVisitor(v.id, e)}
                                   className="text-error/60 hover:text-error transition-colors p-1.5 rounded-full hover:bg-surface-container-highest flex items-center justify-center"
                                   title="Eliminar reservación de invitado"
                                 >
                                   <span className="material-symbols-outlined text-base" data-icon="delete">delete</span>
                                 </button>
                               )}
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                  )}

                </div>
                
                {/* Right: Quick Actions */}
                <div className="space-y-6">
                  <div className="bg-surface-container-low p-6 rounded-2xl border border-primary/10">
                    <h3 className="text-xs font-label text-on-surface-variant uppercase tracking-widest mb-4">Acciones Seguras</h3>
                    <div className="space-y-3">
                      {selectedRes.status === 'En Instalaciones' ? (
                        <button 
                          onClick={() => router.push('/occupancy')}
                          className="w-full bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary font-headline font-extrabold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                        >
                          <span className="material-symbols-outlined text-xl transition-transform group-hover:scale-110">login</span>
                          Ver en Ocupación
                        </button>
                      ) : (
                        <button 
                          onClick={handleCheckIn}
                          className="w-full bg-primary hover:bg-primary/90 text-on-primary text-sm font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                          Iniciar Check-In
                        </button>
                      )}
                      {selectedRes.type === 'RESERVATION' && (
                        <button 
                          onClick={() => router.push(`/visitors/register?reservationId=${selectedRes.id}&guestName=${encodeURIComponent(selectedRes.guestName)}`)}
                          className="w-full bg-surface-container-highest hover:bg-surface-bright text-on-surface text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-outline-variant/10"
                        >
                          <span className="material-symbols-outlined text-lg" data-icon="person_add">person_add</span>
                          Añadir Acompañante
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedRes(null)}
                        className="w-full bg-surface-container-high hover:bg-surface-bright text-error text-sm font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg" data-icon="warning">warning</span>
                        Denegar Entrada
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-3xl h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 p-8 text-center text-on-surface-variant">
                 <span className="material-symbols-outlined text-6xl mb-4 opacity-50">quick_reference_all</span>
                 <p className="font-headline text-xl mb-2">Vista de Resultados</p>
                 <p className="text-sm max-w-sm">Busque una reserva y selecciónela para habilitar el proceso guiado de Check-in Biométrico.</p>
            </div>
          )}
        </section>
      </main>

      {/* Reservation Form Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-[100] bg-[#000000]/80 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-surface-container-low rounded-3xl w-full max-w-lg shadow-2xl border border-outline-variant/10 overflow-hidden flex flex-col">
               <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                  <h2 className="font-headline font-bold text-2xl tracking-tight text-on-surface">
                     {editingResId ? "Editar Reserva" : "Nueva Reserva"}
                  </h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-surface-container-highest">close</button>
               </div>
               <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="md:col-span-3">
                        <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Nombre Completo</label>
                        <input required autoFocus type="text" value={formData.guestName} onChange={(e) => setFormData({...formData, guestName: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface focus:border-primary/50 outline-none transition-colors" placeholder="Ej. Carlos Ramirez" />
                     </div>
                     <div className="md:col-span-1">
                        <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1" title="Cantidad de Huéspedes">Cant.</label>
                        <input required type="number" min="1" max="99" value={formData.guestCount} onChange={(e) => setFormData({...formData, guestCount: parseInt(e.target.value) || 1})} className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface focus:border-primary/50 outline-none transition-colors text-center font-bold" />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Entrada (Check-In)</label>
                        <input required type="datetime-local" value={formData.checkIn} onChange={(e) => setFormData({...formData, checkIn: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface focus:border-primary/50 outline-none transition-colors [color-scheme:dark]" />
                     </div>
                     <div>
                        <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Salida (Check-Out)</label>
                        <input required type="datetime-local" value={formData.checkOut} onChange={(e) => setFormData({...formData, checkOut: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface focus:border-primary/50 outline-none transition-colors [color-scheme:dark]" />
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-label text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Política / Instrucciones Especiales</label>
                     <textarea rows={3} value={formData.visitorPolicy} onChange={(e) => setFormData({...formData, visitorPolicy: e.target.value})} className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface focus:border-primary/50 outline-none transition-colors" placeholder="Ej. Dejar carnet en recepción y acompañar al piso 3." />
                  </div>
                  <div className="pt-4 flex gap-3">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-headline font-bold text-on-surface-variant bg-surface-container-high rounded-xl hover:bg-surface-bright transition-colors">Cancelar</button>
                     <button type="submit" disabled={saving} className="flex-1 py-4 font-headline font-bold text-on-primary bg-primary rounded-xl hover:bg-[#92c5ff] transition-all disabled:opacity-50">
                        {saving ? "Guardando..." : "Guardar Reserva"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl flex justify-around items-center px-4 pb-6 pt-2 border-t border-[#e7e5e5]/10 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        <a href="/dashboard" className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] cursor-pointer">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Panel</span>
        </a>
        <a href="/reservations/search" className="flex flex-col items-center justify-center bg-[#1f2020] text-[#adc6ff] rounded-xl px-4 py-2 cursor-pointer">
          <span className="material-symbols-outlined" data-icon="edit_calendar">edit_calendar</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Reservas</span>
        </a>
        <a href="/occupancy" className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] cursor-pointer">
          <span className="material-symbols-outlined" data-icon="group">group</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Visitantes</span>
        </a>
        <a href="/incidents/report" className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] cursor-pointer">
          <span className="material-symbols-outlined" data-icon="warning">warning</span>
          <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase mt-1">Incidentes</span>
        </a>
      </nav>
    </div>
  );
}
