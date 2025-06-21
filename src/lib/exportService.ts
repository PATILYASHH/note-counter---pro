import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportData {
  totalAmount: number;
  totalCount: number;
  denominationCounts: Record<number, number>;
  currency: string;
  date: string;
  note?: string;
}

export const exportService = {
  // Export to PDF
  exportToPDF(data: ExportData[], title: string = 'Note Counter Report') {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    // Add generation date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 35);
    
    // Prepare table data
    const tableData = data.map((entry, index) => [
      index + 1,
      entry.date,
      entry.currency,
      entry.totalCount,
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: entry.currency,
        minimumFractionDigits: entry.currency === 'USD' ? 2 : 0,
      }).format(entry.totalAmount),
      entry.note || '-'
    ]);
    
    // Add table
    doc.autoTable({
      head: [['#', 'Date', 'Currency', 'Total Count', 'Total Amount', 'Note']],
      body: tableData,
      startY: 45,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [79, 70, 229], // Indigo color
        textColor: 255,
      },
    });
    
    // Add detailed breakdown for each entry
    let yPosition = (doc as any).lastAutoTable.finalY + 20;
    
    data.forEach((entry, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`Entry ${index + 1} - Denomination Breakdown`, 20, yPosition);
      yPosition += 10;
      
      const denomData = Object.entries(entry.denominationCounts)
        .filter(([_, count]) => Number(count) > 0)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([denom, count]) => [
          `${entry.currency === 'INR' ? '₹' : '$'}${denom}`,
          count,
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: entry.currency,
            minimumFractionDigits: entry.currency === 'USD' ? 2 : 0,
          }).format(Number(denom) * Number(count))
        ]);
      
      doc.autoTable({
        head: [['Denomination', 'Count', 'Subtotal']],
        body: denomData,
        startY: yPosition,
        styles: {
          fontSize: 9,
          cellPadding: 2,
        },
        margin: { left: 30 },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    });
    
    // Save the PDF
    doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
  },

  // Export to Excel
  exportToExcel(data: ExportData[], title: string = 'Note Counter Report') {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = data.map((entry, index) => ({
      'Entry #': index + 1,
      'Date': entry.date,
      'Currency': entry.currency,
      'Total Count': entry.totalCount,
      'Total Amount': entry.totalAmount,
      'Note': entry.note || '-'
    }));
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Detailed breakdown sheet
    const detailedData: any[] = [];
    data.forEach((entry, entryIndex) => {
      Object.entries(entry.denominationCounts)
        .filter(([_, count]) => Number(count) > 0)
        .forEach(([denom, count]) => {
          detailedData.push({
            'Entry #': entryIndex + 1,
            'Date': entry.date,
            'Currency': entry.currency,
            'Denomination': `${entry.currency === 'INR' ? '₹' : '$'}${denom}`,
            'Count': count,
            'Subtotal': Number(denom) * Number(count),
            'Note': entry.note || '-'
          });
        });
    });
    
    const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Breakdown');
    
    // Save the Excel file
    XLSX.writeFile(workbook, `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  // Print current data
  printData(data: ExportData[], title: string = 'Note Counter Report') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #4f46e5; margin-bottom: 10px; }
            .meta { color: #666; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4f46e5; color: white; }
            .breakdown { margin-bottom: 30px; }
            .breakdown h3 { color: #4f46e5; margin-bottom: 10px; }
            .breakdown table { margin-left: 20px; width: calc(100% - 20px); }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="meta">Generated on: ${new Date().toLocaleString()}</div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Currency</th>
                <th>Total Count</th>
                <th>Total Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entry.date}</td>
                  <td>${entry.currency}</td>
                  <td>${entry.totalCount}</td>
                  <td>${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: entry.currency,
                    minimumFractionDigits: entry.currency === 'USD' ? 2 : 0,
                  }).format(entry.totalAmount)}</td>
                  <td>${entry.note || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${data.map((entry, index) => `
            <div class="breakdown">
              <h3>Entry ${index + 1} - Denomination Breakdown</h3>
              <table>
                <thead>
                  <tr>
                    <th>Denomination</th>
                    <th>Count</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(entry.denominationCounts)
                    .filter(([_, count]) => Number(count) > 0)
                    .sort(([a], [b]) => Number(b) - Number(a))
                    .map(([denom, count]) => `
                      <tr>
                        <td>${entry.currency === 'INR' ? '₹' : '$'}${denom}</td>
                        <td>${count}</td>
                        <td>${new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: entry.currency,
                          minimumFractionDigits: entry.currency === 'USD' ? 2 : 0,
                        }).format(Number(denom) * Number(count))}</td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  }
};