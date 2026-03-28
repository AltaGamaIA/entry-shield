"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import Script from 'next/script';

export default function DocumentListClient({ visitors }: { visitors: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = visitors?.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.documentId?.includes(searchTerm)) || [];

  const convertUrlToBase64 = async (url: string): Promise<string> => {
    try {
      if (url.startsWith('data:')) return url;
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return url; // Fallback to raw url if fetch fails
    }
  };

  const handleDownloadPDF = async (visitor: any, action: 'view' | 'download') => {
    try {
      if ((window as any).jspdf) {
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.text("Registro Biometrico de Visitante", 20, 20);
        
        doc.setFontSize(14);
        doc.text(`Documentos de: ${visitor.name}`, 20, 35);
        
        let fileOffsetY = 45;
        if (visitor.approximateAge === 'Menor') {
            doc.setTextColor(220, 38, 38); // error red
            doc.setFontSize(12);
            doc.text("[ ALERTA: MENOR DE EDAD CLASIFICADO ]", 20, 42);
            doc.setTextColor(0, 0, 0);
            fileOffsetY = 50;
        }
        
        doc.setFontSize(11);
        doc.text(`Identificacion: ${visitor.documentType} ${visitor.documentId}`, 20, fileOffsetY);
        


        let frontUrl = null;
        let backUrl = null;
        if (visitor.idCardUrl) {
           try {
              const parsed = JSON.parse(visitor.idCardUrl);
              if (Array.isArray(parsed)) {
                 frontUrl = parsed[0];
                 backUrl = parsed[1];
              }
           } catch (e) {
              frontUrl = visitor.idCardUrl;
           }
        }
        
        const addImageProportionally = (docObj: any, b64: string, startX: number, startY: number, maxW: number, maxH: number) => {
            try {
                const props = docObj.getImageProperties(b64);
                const ratio = Math.min(maxW / props.width, maxH / props.height);
                const finalW = props.width * ratio;
                const finalH = props.height * ratio;
                // Center horizontally within the bounding box
                const offsetX = startX + (maxW - finalW) / 2;
                docObj.addImage(b64, "JPEG", offsetX, startY, finalW, finalH);
            } catch (e) {
                // Fallback if formatting fails
                docObj.addImage(b64, "JPEG", startX, startY, maxW, maxH);
            }
        };

        if (frontUrl) {
           const finalFrontUrl = await convertUrlToBase64(frontUrl);
           doc.addPage();
           doc.setFontSize(14);
           doc.text("Frente del Documento:", 20, 20);
           // Maximized size for A4 page (A4 dimensions: 210 x 297 mm)
           addImageProportionally(doc, finalFrontUrl, 10, 30, 190, 240);
        }
        if (backUrl) {
           const finalBackUrl = await convertUrlToBase64(backUrl);
           doc.addPage();
           doc.setFontSize(14);
           doc.text("Reverso del Documento:", 20, 20);
           addImageProportionally(doc, finalBackUrl, 10, 30, 190, 240);
        }
        
        if (visitor.selfieUrl) {
           const finalSelfieUrl = await convertUrlToBase64(visitor.selfieUrl);
           doc.addPage();
           doc.setFontSize(14);
           doc.text("Fotografia Facial / Biometria:", 20, 20);
           addImageProportionally(doc, finalSelfieUrl, 10, 30, 190, 240);
        }
        
        const fileName = `Documentos_${visitor.name.replace(/\s+/g, '_')}.pdf`;
        
        if (action === 'download') {
           doc.save(fileName);
        } else {
           window.open(doc.output('bloburl'), '_blank');
        }
      } else {
        alert("Librería PDF no cargada aún. Por favor, intenta de nuevo.");
      }
    } catch (e) {
      console.error("Error generando PDF", e);
      alert("No se pudo generar el archivo de los documentos capturados.");
    }
  };

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />
      <div className="bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-primary min-h-screen pb-24">
        {/* TopAppBar */}
        <header className="flex justify-between items-center px-6 h-20 w-full fixed top-0 z-50 bg-[#131313]/60 backdrop-blur-lg border-b border-outline-variant/10">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-[#adc6ff] text-2xl" data-icon="shield">shield</span>
            <h1 className="text-xl font-extrabold text-[#e7e5e5] tracking-tighter">EntryShield</h1>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" data-icon="person">person</span>
            </div>
          </div>
        </header>

        {/* Side Nav */}
        <aside className="hidden md:flex fixed left-0 top-20 h-[calc(100vh-80px)] w-20 flex-col items-center py-8 bg-[#0e0e0e] border-r border-outline-variant/10 z-40">
          <div className="flex flex-col gap-8">
            <Link href="/dashboard" className="material-symbols-outlined text-on-surface/40 hover:text-primary transition-colors cursor-pointer" data-icon="dashboard">dashboard</Link>
            <Link href="/documents" className="material-symbols-outlined text-[#adc6ff]" data-icon="folder_shared" style={{ fontVariationSettings: "'FILL' 1" }}>folder_shared</Link>
          </div>
        </aside>

        <main className="pt-28 px-4 max-w-6xl mx-auto md:pl-28 space-y-8">
          <div>
            <h2 className="text-3xl font-bold font-headline">Documentos de Identidad</h2>
            <p className="text-on-surface-variant text-sm mt-1">Librería de biometría y escaneos de seguridad de todos los visitantes verificados.</p>
          </div>

          <div className="relative max-w-2xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
            <input 
              type="text" 
              placeholder="Buscar por nombre o número de identificación..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 bg-surface-container pl-12 pr-4 rounded-xl shadow-inner border border-outline-variant/10 focus:ring-2 focus:ring-[#adc6ff]/40 focus:border-[#adc6ff] transition-all text-sm outline-none font-medium text-on-surface"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length === 0 ? (
               <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-50">
                 <span className="material-symbols-outlined text-6xl mb-4" data-icon="folder_off">folder_off</span>
                 <p className="font-bold text-lg">No se encontraron expedientes</p>
               </div>
            ) : (
              filtered.map((visitor) => (
                <div key={visitor.id} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 hover:bg-surface-container hover:border-[#adc6ff]/30 transition-all flex flex-col justify-between group">
                  <div className="flex items-start gap-4 mb-6">
                    {visitor.selfieUrl ? (
                      <img src={visitor.selfieUrl} alt="Selfie de visitante" className="w-16 h-16 rounded-full object-cover border-2 border-[#adc6ff]/50 shadow-md" style={{ transform: 'scaleX(-1)' }}/>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center border-2 border-outline-variant/20">
                        <span className="material-symbols-outlined text-on-surface/40">person</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg leading-tight line-clamp-2 text-on-surface">{visitor.name}</h3>
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="text-xs text-on-surface-variant flex items-center gap-1.5 bg-surface-container-high px-2 py-1 rounded inline-flex self-start">
                          <span className="material-symbols-outlined text-[14px]">id_card</span>
                          <span className="font-mono font-medium">{visitor.documentId}</span>
                        </div>
                        {visitor.approximateAge === 'Menor' && (
                          <div className="text-[10px] font-bold text-error uppercase tracking-widest flex items-center gap-1 bg-error/10 px-2 py-1 rounded inline-flex self-start border border-error/20">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            Menor de Edad
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full mt-auto">
                    <button 
                      onClick={() => handleDownloadPDF(visitor, 'view')} 
                      className="flex-1 bg-surface-container hover:bg-surface-bright text-[#e7e5e5] font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-outline-variant/10 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      Visualizar
                    </button>
                    <button 
                      onClick={() => handleDownloadPDF(visitor, 'download')}
                      className="flex-1 bg-[#004493]/20 hover:bg-[#004493]/40 text-[#adc6ff] font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-[#004493]/30 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Expediente
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
        
        {/* Bottom Navigation for Mobile */}
        <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-xl border-t border-[#e7e5e5]/10 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] md:hidden rounded-t-2xl">
          <a className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] duration-200" href="/dashboard">
            <span className="material-symbols-outlined mb-1" data-icon="dashboard">dashboard</span>
            <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Tablero</span>
          </a>
          <a className="flex flex-col items-center justify-center bg-[#1f2020] text-[#adc6ff] rounded-xl px-4 py-2 duration-200" href="/documents">
            <span className="material-symbols-outlined mb-1" data-icon="folder_shared">folder_shared</span>
            <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Documentos</span>
          </a>
          <a className="flex flex-col items-center justify-center text-[#e7e5e5]/40 px-4 py-2 hover:text-[#e7e5e5] duration-200" href="/reservations/search">
            <span className="material-symbols-outlined mb-1" data-icon="search">search</span>
            <span className="font-['Inter'] text-[11px] font-medium tracking-wide uppercase">Buscar</span>
          </a>
        </nav>
      </div>
    </>
  );
}
