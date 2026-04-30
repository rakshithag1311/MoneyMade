import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface Income {
  id: string;
  source: string;
  amount: number;
  date: string;
}

interface Expense {
  id: string;
  title?: string;
  amount: number;
  category: string;
  created_at?: string;
  date?: string;
}

interface ReportData {
  incomes: Income[];
  expenses: Expense[];
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  categoryData: Array<{ name: string; value: number; percentage: string }>;
  dateRange: string;
  userName?: string;
}

export const generateMonthlyReport = (data: ReportData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header - Black background
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Title - White text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Financial Report', pageWidth / 2, 20, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.dateRange, pageWidth / 2, 30, { align: 'center' });
  
  if (data.userName) {
    doc.text(`Generated for: ${data.userName}`, pageWidth / 2, 36, { align: 'center' });
  }

  yPosition = 50;

  // Reset text color to black
  doc.setTextColor(0, 0, 0);

  // Summary Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary', 14, yPosition);
  yPosition += 10;

  // Summary boxes with grayscale design
  const boxWidth = (pageWidth - 40) / 3;
  const boxHeight = 30;
  const boxY = yPosition;

  // Income Box - Light gray
  doc.setFillColor(240, 240, 240);
  doc.rect(14, boxY, boxWidth, boxHeight, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, boxY, boxWidth, boxHeight, 'S');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Income', 14 + boxWidth / 2, boxY + 10, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹${data.totalIncome.toFixed(2)}`, 14 + boxWidth / 2, boxY + 22, { align: 'center' });

  // Expenses Box - Medium gray
  doc.setFillColor(220, 220, 220);
  doc.rect(14 + boxWidth + 5, boxY, boxWidth, boxHeight, 'F');
  doc.setDrawColor(180, 180, 180);
  doc.rect(14 + boxWidth + 5, boxY, boxWidth, boxHeight, 'S');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Expenses', 14 + boxWidth + 5 + boxWidth / 2, boxY + 10, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹${data.totalExpenses.toFixed(2)}`, 14 + boxWidth + 5 + boxWidth / 2, boxY + 22, { align: 'center' });

  // Savings Box - Dark gray or light gray based on value
  const savingsColor = data.savings >= 0 ? 200 : 160;
  doc.setFillColor(savingsColor, savingsColor, savingsColor);
  doc.rect(14 + (boxWidth + 5) * 2, boxY, boxWidth, boxHeight, 'F');
  doc.setDrawColor(140, 140, 140);
  doc.rect(14 + (boxWidth + 5) * 2, boxY, boxWidth, boxHeight, 'S');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Savings', 14 + (boxWidth + 5) * 2 + boxWidth / 2, boxY + 10, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹${data.savings.toFixed(2)}`, 14 + (boxWidth + 5) * 2 + boxWidth / 2, boxY + 22, { align: 'center' });

  yPosition = boxY + boxHeight + 15;

  // Category Breakdown
  if (data.categoryData.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Expense Breakdown by Category', 14, yPosition);
    yPosition += 5;

    const categoryTableData = data.categoryData.map(cat => [
      cat.name,
      `₹${cat.value.toFixed(2)}`,
      `${cat.percentage}%`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Amount', 'Percentage']],
      body: categoryTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255]
      },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 20;
  }

  // Income Statement
  if (data.incomes.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Income Statement', 14, yPosition);
    yPosition += 5;

    const incomeTableData = data.incomes.map(income => [
      income.source,
      format(new Date(income.date), 'MMM dd, yyyy'),
      `₹${Number(income.amount).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Source', 'Date', 'Amount']],
      body: incomeTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255]
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Check if we need a new page for expenses
  if (yPosition > pageHeight - 80 && data.expenses.length > 0) {
    doc.addPage();
    yPosition = 20;
  }

  // Expense Statement
  if (data.expenses.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Expense Statement', 14, yPosition);
    yPosition += 5;

    const expenseTableData = data.expenses.slice(0, 20).map(expense => [
      expense.title || expense.category,
      expense.category,
      format(new Date(expense.created_at || expense.date || new Date()), 'MMM dd, yyyy'),
      `₹${Number(expense.amount).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Description', 'Category', 'Date', 'Amount']],
      body: expenseTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255]
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    if (data.expenses.length > 20) {
      yPosition = (doc as any).lastAutoTable.finalY + 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`Showing 20 of ${data.expenses.length} expenses`, 14, yPosition);
    }
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')} | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text('MoneyMade - Personal Finance Manager', pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  return doc;
};

export const downloadReport = (doc: jsPDF, fileName: string) => {
  doc.save(fileName);
};

export const getReportBlob = (doc: jsPDF): Blob => {
  return doc.output('blob');
};
