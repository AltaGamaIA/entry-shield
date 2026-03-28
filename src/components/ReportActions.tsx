"use client";

import React, { useState } from 'react';
import Script from 'next/script';

export default function ReportActions({
  stats,
  topProperties,
  topVisitors
}: {
  stats: { totalVisits: number, deniedEntries: number, incidentCount: number, incidentRate: string },
  topProperties: any[],
  topVisitors: any[]
}) {
  const [loadingPdf, setLoadingPdf] = useState(false);

  const generatePDF = () => {
    if (!(window as any).jspdf) {
      alert("La librería PDF aún no ha cargado, por favor intenta en unos segundos.");
      return;
    }
    setLoadingPdf(true);
    try {
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.text("Reporte de Analíticas de Seguridad", 20, 20);
      
      doc.setFontSize(14);
      doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, 20, 30);

      // Metricas Principales
      doc.setFontSize(12);
      doc.text("Métricas Principales:", 20, 45);
      doc.text(`- Visitantes Totales: ${stats.totalVisits}`, 25, 52);
      doc.text(`- Entradas Denegadas: ${stats.deniedEntries}`, 25, 59);
      doc.text(`- Total de Incidentes: ${stats.incidentCount}`, 25, 66);
      doc.text(`- Tasa de Incidentes: ${stats.incidentRate}%`, 25, 73);

      // Sedes Activas
      doc.text("Top 4 Sedes con Mayor Actividad:", 20, 88);
      topProperties.forEach((prop, i) => {
        doc.text(`${i + 1}. ${prop.name} - ${prop.totalVisits} visitas`, 25, 95 + (i * 7));
      });

      // Top Visitantes
      doc.text("Top Visitantes Recurrentes:", 20, 130);
      topVisitors.forEach((v, i) => {
        doc.text(`${i + 1}. ${v.name} (${v.documentType} ${v.documentId}) - ${v._count.visits} visitas`, 25, 137 + (i * 7));
      });

      doc.save("Reporte_EntryShield_Seguridad.pdf");
    } catch (e) {
      console.error(e);
      alert("Error al generar PDF");
    } finally {
      setLoadingPdf(false);
    }
  };

  const generateCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "Metricas de Seguridad\n";
    csvContent += `Visitantes Totales,${stats.totalVisits}\n`;
    csvContent += `Entradas Denegadas,${stats.deniedEntries}\n`;
    csvContent += `Total de Incidentes,${stats.incidentCount}\n`;
    csvContent += `Tasa de Incidentes (%),${stats.incidentRate}\n\n`;

    csvContent += "Sedes Mas Activas\n";
    csvContent += "Nombre,Visitas\n";
    topProperties.forEach(prop => {
      csvContent += `"${prop.name}",${prop.totalVisits}\n`;
    });

    csvContent += "\nVisitantes Frecuentes\n";
    csvContent += "Nombre,Documento,Visitas\n";
    topVisitors.forEach(v => {
      csvContent += `"${v.name}","${v.documentType} ${v.documentId}",${v._count.visits}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Reporte_EntryShield_Datos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" strategy="lazyOnload" />
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button 
          onClick={generatePDF}
          disabled={loadingPdf}
          className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high hover:bg-surface-bright transition-all text-on-surface text-sm font-semibold rounded-lg disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg" data-icon="picture_as_pdf">picture_as_pdf</span>
          {loadingPdf ? "Generando..." : "Exportar PDF"}
        </button>
        <button 
          onClick={generateCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-bold rounded-lg shadow-lg shadow-primary/10 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-lg" data-icon="csv">csv</span>
          Exportar CSV
        </button>
      </div>
    </>
  );
}
