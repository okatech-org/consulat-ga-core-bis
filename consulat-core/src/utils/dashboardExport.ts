import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExportData {
  title: string;
  dateRange: { from: Date; to: Date };
  stats: { label: string; value: string | number }[];
  requestsByType: { name: string; value: number }[];
  monthlyTrends: { month: string; demandes: number; traitees: number }[];
  agentPerformance: { agent: string; traites: number; enCours: number; satisfaction: number }[];
}

export function exportToPDF(data: ExportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(data.title, pageWidth / 2, 20, { align: 'center' });
  
  // Date range
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const dateRangeText = `Période: ${format(data.dateRange.from, 'dd MMMM yyyy', { locale: fr })} - ${format(data.dateRange.to, 'dd MMMM yyyy', { locale: fr })}`;
  doc.text(dateRangeText, pageWidth / 2, 28, { align: 'center' });
  
  // Generated date
  doc.text(`Généré le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, pageWidth / 2, 34, { align: 'center' });
  
  let yPosition = 45;
  
  // Stats Summary
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Indicateurs Clés', 14, yPosition);
  yPosition += 8;
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Indicateur', 'Valeur', 'Évolution']],
    body: data.stats.map(stat => [stat.label, String(stat.value), '-']),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Requests by Type
  doc.setFontSize(14);
  doc.text('Répartition par Type de Demande', 14, yPosition);
  yPosition += 8;
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Type', 'Nombre', 'Pourcentage']],
    body: data.requestsByType.map(item => {
      const total = data.requestsByType.reduce((sum, i) => sum + i.value, 0);
      const percent = ((item.value / total) * 100).toFixed(1);
      return [item.name, String(item.value), `${percent}%`];
    }),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Check if we need a new page
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Monthly Trends
  doc.setFontSize(14);
  doc.text('Tendances Mensuelles', 14, yPosition);
  yPosition += 8;
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Mois', 'Demandes Reçues', 'Demandes Traitées', 'Taux de Traitement']],
    body: data.monthlyTrends.map(item => {
      const rate = item.demandes > 0 ? ((item.traitees / item.demandes) * 100).toFixed(1) : '0';
      return [item.month, String(item.demandes), String(item.traitees), `${rate}%`];
    }),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Agent Performance
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.text('Performance des Agents', 14, yPosition);
  yPosition += 8;
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Agent', 'Dossiers Traités', 'En Cours', 'Satisfaction']],
    body: data.agentPerformance.map(item => [
      item.agent,
      String(item.traites),
      String(item.enCours),
      `${item.satisfaction}/5`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });
  
  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} / ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`rapport-consulaire-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function exportToExcel(data: ExportData) {
  // Create CSV content (simple Excel-compatible format)
  const lines: string[] = [];
  
  // Header
  lines.push(data.title);
  lines.push(`Période: ${format(data.dateRange.from, 'dd/MM/yyyy')} - ${format(data.dateRange.to, 'dd/MM/yyyy')}`);
  lines.push(`Généré le: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`);
  lines.push('');
  
  // Stats
  lines.push('INDICATEURS CLÉS');
  lines.push('Indicateur;Valeur');
  data.stats.forEach(stat => {
    lines.push(`${stat.label};${stat.value}`);
  });
  lines.push('');
  
  // Requests by Type
  lines.push('RÉPARTITION PAR TYPE');
  lines.push('Type;Nombre;Pourcentage');
  const total = data.requestsByType.reduce((sum, i) => sum + i.value, 0);
  data.requestsByType.forEach(item => {
    const percent = ((item.value / total) * 100).toFixed(1);
    lines.push(`${item.name};${item.value};${percent}%`);
  });
  lines.push('');
  
  // Monthly Trends
  lines.push('TENDANCES MENSUELLES');
  lines.push('Mois;Demandes Reçues;Demandes Traitées;Taux');
  data.monthlyTrends.forEach(item => {
    const rate = item.demandes > 0 ? ((item.traitees / item.demandes) * 100).toFixed(1) : '0';
    lines.push(`${item.month};${item.demandes};${item.traitees};${rate}%`);
  });
  lines.push('');
  
  // Agent Performance
  lines.push('PERFORMANCE DES AGENTS');
  lines.push('Agent;Traités;En Cours;Satisfaction');
  data.agentPerformance.forEach(item => {
    lines.push(`${item.agent};${item.traites};${item.enCours};${item.satisfaction}/5`);
  });
  
  // Create and download file
  const csvContent = '\uFEFF' + lines.join('\n'); // BOM for Excel UTF-8
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `rapport-consulaire-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
