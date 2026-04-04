const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/database');

class PDFService {
  // ==========================================
  // FEATURE 1: FEE RECEIPT PDF
  // ==========================================
  async generateFeeReceipt(paymentId, schoolId, res) {
    const payment = await prisma.feePayment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          include: {
            profile: true,
            class: true,
            section: true,
            parents: { include: { parent: true } },
          },
        },
        academicYear: true,
      },
    });

    if (!payment) throw new Error('Payment not found');

    const school = await prisma.school.findUnique({ where: { id: schoolId } });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment.receiptNumber}.pdf"`);
    doc.pipe(res);

    // School Header
    doc.fontSize(22).font('Helvetica-Bold').text(school.name, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(school.address, { align: 'center' });
    doc.text(`Phone: ${school.phone} | Email: ${school.email}`, { align: 'center' });
    doc.text(`UDISE Code: ${school.udiseCode} | Affiliation: ${school.affiliationNumber || 'N/A'}`, { align: 'center' });
    doc.moveDown(0.3);
    doc.lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Receipt Title
    doc.moveDown(0.3);
    doc.fontSize(16).font('Helvetica-Bold').text('FEE RECEIPT', { align: 'center', underline: true });
    doc.moveDown(0.3);

    // Receipt Details
    doc.fontSize(10).font('Helvetica');
    doc.text(`Receipt No: ${payment.receiptNumber}`, { align: 'right' });
    doc.text(`Date: ${this.formatDate(payment.paymentDate || new Date())}`, { align: 'right' });
    doc.text(`Academic Year: ${payment.academicYear.name}`, { align: 'right' });
    doc.moveDown(0.5);

    // Student Details
    doc.fontSize(12).font('Helvetica-Bold').text('Student Details');
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.2);
    doc.fontSize(10).font('Helvetica');
    const student = payment.student;
    doc.text(`Name: ${student.profile.firstName} ${student.profile.lastName}`, 50, doc.y, { width: 250 });
    doc.text(`Class: ${student.class.name} - ${student.section.name}`, 320, doc.y - 15, { width: 200 });
    doc.text(`Roll No: ${student.rollNumber}`, 50, doc.y, { width: 250 });
    doc.text(`Admission No: ${student.studentId}`, 320, doc.y - 15, { width: 200 });
    doc.text(`Father's Name: ${student.parents?.[0]?.parent?.fatherName || 'N/A'}`, 50, doc.y, { width: 250 });
    doc.moveDown(0.3);

    // Fee Breakdown Table
    doc.fontSize(12).font('Helvetica-Bold').text('Fee Breakdown');
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.2);

    const feeHeads = typeof payment.feeStructure?.feeHeads === 'string'
      ? JSON.parse(payment.feeStructure.feeHeads)
      : payment.feeStructure?.feeHeads || [];

    const tableTop = doc.y;
    const colWidths = [250, 100, 100];
    const headers = ['Fee Type', 'Amount (₹)', 'Paid (₹)'];

    doc.fontSize(9).font('Helvetica-Bold');
    let x = 50;
    headers.forEach((header, i) => {
      doc.text(header, x, tableTop, { width: colWidths[i], align: i === 0 ? 'left' : 'center' });
      x += colWidths[i];
    });
    doc.moveTo(50, tableTop + 14).lineTo(550, tableTop + 14).stroke();

    let y = tableTop + 20;
    doc.fontSize(9).font('Helvetica');

    // Fee heads
    if (feeHeads.length > 0) {
      feeHeads.forEach(head => {
        x = 50;
        doc.text(head.name, x, y, { width: colWidths[0], align: 'left' });
        doc.text(`₹${parseFloat(head.amount).toLocaleString('en-IN')}`, x + colWidths[0], y, { width: colWidths[1], align: 'center' });
        doc.text(`₹${parseFloat(payment.paidAmount).toLocaleString('en-IN')}`, x + colWidths[0] + colWidths[1], y, { width: colWidths[2], align: 'center' });
        y += 16;
      });
    } else {
      x = 50;
      doc.text('Tuition & Other Fees', x, y, { width: colWidths[0], align: 'left' });
      doc.text(`₹${parseFloat(payment.totalAmount).toLocaleString('en-IN')}`, x + colWidths[0], y, { width: colWidths[1], align: 'center' });
      doc.text(`₹${parseFloat(payment.paidAmount).toLocaleString('en-IN')}`, x + colWidths[0] + colWidths[1], y, { width: colWidths[2], align: 'center' });
      y += 16;
    }

    // Separator
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 5;

    // Additional charges
    if (payment.lateFine > 0) {
      doc.text('Late Fine', 50, y, { width: colWidths[0] });
      doc.text(`₹${parseFloat(payment.lateFine).toLocaleString('en-IN')}`, 50 + colWidths[0], y, { width: colWidths[1], align: 'center' });
      y += 16;
    }
    if (payment.gstAmount > 0) {
      doc.text('GST', 50, y, { width: colWidths[0] });
      doc.text(`₹${parseFloat(payment.gstAmount).toLocaleString('en-IN')}`, 50 + colWidths[0], y, { width: colWidths[1], align: 'center' });
      y += 16;
    }
    if (payment.concessionAmount > 0) {
      doc.text('Concession', 50, y, { width: colWidths[0] });
      doc.text(`-₹${parseFloat(payment.concessionAmount).toLocaleString('en-IN')}`, 50 + colWidths[0], y, { width: colWidths[1], align: 'center' });
      y += 16;
    }

    // Total
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 5;
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('Total Paid', 50, y, { width: colWidths[0] });
    doc.text(`₹${parseFloat(payment.paidAmount).toLocaleString('en-IN')}`, 50 + colWidths[0], y, { width: colWidths[1], align: 'center' });
    y += 20;

    // Balance
    doc.fontSize(10).font('Helvetica');
    if (payment.balanceAmount > 0) {
      doc.text(`Balance Due: ₹${parseFloat(payment.balanceAmount).toLocaleString('en-IN')}`, 50, y);
      y += 15;
    }

    // Payment details
    doc.text(`Payment Mode: ${payment.paymentMode}`, 50, y);
    if (payment.transactionId) {
      doc.text(`Transaction ID: ${payment.transactionId}`, 50, y + 15);
    }
    if (payment.remarks) {
      doc.text(`Remarks: ${payment.remarks}`, 50, y + (payment.transactionId ? 30 : 15));
    }

    // Signature area
    const sigY = 680;
    doc.lineWidth(1).moveTo(350, sigY).lineTo(550, sigY).stroke();
    doc.fontSize(9).font('Helvetica').text('Authorized Signatory', 350, sigY + 5);
    doc.text('Received with thanks', 50, sigY + 5);

    // Duplicate section (dotted line)
    doc.moveDown(0.5);
    doc.lineWidth(1).dash(5, { space: 5 }).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.undash();
    doc.moveDown(0.3);
    doc.fontSize(12).font('Helvetica-Bold').text('DUPLICATE COPY', { align: 'center' });
    doc.moveDown(0.3);

    // Duplicate content (simplified)
    doc.fontSize(10).font('Helvetica');
    doc.text(`Receipt No: ${payment.receiptNumber} | Date: ${this.formatDate(payment.paymentDate || new Date())}`, { align: 'center' });
    doc.text(`Student: ${student.profile.firstName} ${student.profile.lastName} | Class: ${student.class.name}-${student.section.name}`, { align: 'center' });
    doc.text(`Amount Paid: ₹${parseFloat(payment.paidAmount).toLocaleString('en-IN')} | Mode: ${payment.paymentMode}`, { align: 'center' });
    doc.text(`Balance: ₹${parseFloat(payment.balanceAmount).toLocaleString('en-IN')}`, { align: 'center' });

    doc.end();
  }

  // ==========================================
  // FEATURE 2: REPORT CARD PDF
  // ==========================================
  async generateReportCard(studentId, examId, schoolId, res) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        profile: true,
        class: true,
        section: true,
        parents: { include: { parent: true } },
      },
    });

    if (!student) throw new Error('Student not found');

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        academicYear: true,
        examSubjects: { include: { subject: true } },
      },
    });

    if (!exam) throw new Error('Exam not found');

    const marks = await prisma.mark.findMany({
      where: { studentId, examId },
      include: { subject: true },
      orderBy: { subject: { name: 'asc' } },
    });

    const school = await prisma.school.findUnique({ where: { id: schoolId } });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reportcard-${student.studentId}-${exam.name}.pdf"`);
    doc.pipe(res);

    // School Header
    doc.fontSize(20).font('Helvetica-Bold').text(school.name, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(school.address, { align: 'center' });
    doc.text(`Affiliation No: ${school.affiliationNumber || 'N/A'} | UDISE: ${school.udiseCode}`, { align: 'center' });
    doc.lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Title
    doc.moveDown(0.3);
    doc.fontSize(16).font('Helvetica-Bold').text('REPORT CARD', { align: 'center', underline: true });
    doc.fontSize(12).text(`${exam.name} - ${exam.academicYear.name}`, { align: 'center' });
    doc.moveDown(0.3);

    // Student Details
    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: ${student.profile.firstName} ${student.profile.lastName}`, 50, doc.y, { width: 250 });
    doc.text(`Class: ${student.class.name} - ${student.section.name}`, 320, doc.y - 15, { width: 200 });
    doc.text(`Roll No: ${student.rollNumber}`, 50, doc.y, { width: 250 });
    doc.text(`Admission No: ${student.studentId}`, 320, doc.y - 15, { width: 200 });
    doc.text(`DOB: ${this.formatDate(student.profile.dateOfBirth)}`, 50, doc.y, { width: 250 });
    doc.moveDown(0.3);

    // Marks Table
    doc.fontSize(12).font('Helvetica-Bold').text('Academic Performance');
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.2);

    const tableTop = doc.y;
    const colWidths = [120, 60, 60, 60, 60, 60, 60, 60];
    const headers = ['Subject', 'Max', 'UT1', 'HY', 'UT2', 'Annual', 'Total', 'Grade'];

    doc.fontSize(8).font('Helvetica-Bold');
    let x = 50;
    headers.forEach((header, i) => {
      doc.text(header, x, tableTop, { width: colWidths[i], align: i === 0 ? 'left' : 'center' });
      x += colWidths[i];
    });
    doc.moveTo(50, tableTop + 12).lineTo(550, tableTop + 12).stroke();

    let y = tableTop + 18;
    doc.fontSize(8).font('Helvetica');

    let totalObtained = 0, totalMax = 0, failedSubjects = 0;

    marks.forEach(mark => {
      x = 50;
      const obtained = mark.marksObtained || 0;
      totalObtained += obtained;
      totalMax += mark.maxMarks;

      if (obtained < mark.subject.passMarks) failedSubjects++;

      doc.text(mark.subject.name, x, y, { width: colWidths[0], align: 'left' });
      doc.text(mark.maxMarks.toString(), x + colWidths[0], y, { width: colWidths[1], align: 'center' });
      doc.text('-', x + colWidths[0] + colWidths[1], y, { width: colWidths[2], align: 'center' });
      doc.text('-', x + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3], align: 'center' });
      doc.text('-', x + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y, { width: colWidths[4], align: 'center' });
      doc.text(obtained.toString(), x + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], y, { width: colWidths[5], align: 'center' });
      doc.text(obtained.toString(), x + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], y, { width: colWidths[6], align: 'center' });
      doc.text(mark.grade || '-', x + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6], y, { width: colWidths[7], align: 'center' });
      y += 14;
    });

    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 5;

    // Summary
    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;
    const result = failedSubjects === 0 ? 'PASS' : failedSubjects === 1 ? 'COMPARTMENT' : 'FAIL';

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Total: ${totalObtained}/${totalMax}  |  Percentage: ${percentage}%  |  Result: ${result}`, 50, y);

    doc.end();
  }

  // ==========================================
  // FEATURE 3: TC (TRANSFER CERTIFICATE) PDF
  // ==========================================
  async generateTC(studentId, schoolId, res) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        profile: true,
        class: true,
        section: true,
        parents: { include: { parent: true } },
        academicYear: true,
      },
    });

    if (!student) throw new Error('Student not found');

    const school = await prisma.school.findUnique({ where: { id: schoolId } });

    // Generate TC number
    const tcNumber = `TC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="TC-${tcNumber}.pdf"`);
    doc.pipe(res);

    // School Header
    doc.fontSize(20).font('Helvetica-Bold').text(school.name, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(school.address, { align: 'center' });
    doc.text(`UDISE Code: ${school.udiseCode}`, { align: 'center' });
    doc.lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown(0.3);
    doc.fontSize(16).font('Helvetica-Bold').text('TRANSFER CERTIFICATE', { align: 'center', underline: true });
    doc.fontSize(10).text(`TC No: ${tcNumber}`, { align: 'right' });
    doc.moveDown(0.5);

    // TC Fields
    const fields = [
      ['1. Admission Number', student.studentId],
      ['2. Student Name', `${student.profile.firstName} ${student.profile.lastName}`],
      ["3. Father's Name", student.parents?.[0]?.parent?.fatherName || 'N/A'],
      ["4. Mother's Name", student.parents?.[0]?.parent?.motherName || 'N/A'],
      ['5. Nationality', student.profile.nationality || 'Indian'],
      ['6. Religion', student.profile.religion],
      ['7. Category', student.profile.casteCategory],
      ['8. Date of Birth', this.formatDate(student.profile.dateOfBirth)],
      ['9. Date of Admission', this.formatDate(student.dateOfAdmission)],
      ['10. Class at Time of Leaving', `${student.class.name} - ${student.section.name}`],
      ['11. Date of Application for TC', this.formatDate(new Date())],
      ['12. Date of Issue of TC', this.formatDate(new Date())],
      ['13. Reason for Leaving', student.leavingReason || 'Parent Request'],
      ['14. Character & Conduct', 'Good'],
    ];

    doc.fontSize(10).font('Helvetica');
    fields.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(`${label}: `, 50, doc.y, { continued: true });
      doc.font('Helvetica').text(value);
      doc.moveDown(0.2);
    });

    // Signatures
    const sigY = 700;
    doc.moveTo(50, sigY).lineTo(250, sigY).stroke();
    doc.moveTo(350, sigY).lineTo(550, sigY).stroke();
    doc.fontSize(9).text('Class Teacher Signature', 50, sigY + 5);
    doc.text('Principal Signature + School Stamp', 350, sigY + 5, { align: 'center' });

    doc.end();
  }

  // ==========================================
  // FEATURE 7: SALARY SLIP PDF
  // ==========================================
  async generateSalarySlip(salaryId, schoolId, res) {
    const salary = await prisma.salary.findUnique({
      where: { id: salaryId },
      include: { staff: true },
    });

    if (!salary) throw new Error('Salary record not found');

    const school = await prisma.school.findUnique({ where: { id: schoolId } });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="salary-${salary.staff.staffId}-${salary.month}-${salary.year}.pdf"`);
    doc.pipe(res);

    // School Header
    doc.fontSize(18).font('Helvetica-Bold').text(school.name, { align: 'center' });
    doc.fontSize(10).text(school.address, { align: 'center' });
    doc.lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown(0.3);
    doc.fontSize(14).font('Helvetica-Bold').text('SALARY SLIP', { align: 'center', underline: true });
    doc.fontSize(10).text(`Month: ${this.getMonthName(salary.month)} ${salary.year}`, { align: 'center' });
    doc.moveDown(0.3);

    // Employee Details
    doc.fontSize(10).font('Helvetica');
    doc.text(`Employee: ${salary.staff.designation} - ${salary.staff.department}`, 50, doc.y, { width: 250 });
    doc.text(`Employee ID: ${salary.staff.staffId}`, 320, doc.y - 15, { width: 200 });
    doc.text(`Name: ${salary.staff.qualification}`, 50, doc.y, { width: 250 });
    doc.moveDown(0.3);

    // Earnings Table
    doc.fontSize(12).font('Helvetica-Bold').text('EARNINGS');
    doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.2);

    const colWidths = [250, 100, 250, 100];
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Earnings', 50, doc.y, { width: colWidths[0] });
    doc.text('Amount (₹)', 50 + colWidths[0], doc.y, { width: colWidths[1], align: 'right' });
    doc.text('Deductions', 50 + colWidths[0] + colWidths[1] + 50, doc.y, { width: colWidths[2] });
    doc.text('Amount (₹)', 50 + colWidths[0] + colWidths[1] + 50 + colWidths[2], doc.y, { width: colWidths[3], align: 'right' });
    doc.moveDown(0.3);

    doc.fontSize(9).font('Helvetica');
    const earnings = [
      ['Basic Salary', salary.basicPay],
      ['HRA (40%)', salary.hra],
      ['Dearness Allowance', salary.da],
      ['Transport Allowance', salary.ta],
      ['Other Allowances', salary.otherAllowances],
    ];

    const deductions = [
      ['PF (12%)', salary.pfEmployee],
      ['ESI', salary.esi],
      ['Professional Tax', salary.professionalTax],
      ['Income Tax (TDS)', salary.incomeTax],
      ['Other Deductions', salary.otherDeductions],
    ];

    let y = doc.y;
    earnings.forEach(([name, amount], i) => {
      doc.text(name, 50, y + i * 16, { width: colWidths[0] });
      doc.text(`₹${parseFloat(amount).toLocaleString('en-IN')}`, 50 + colWidths[0], y + i * 16, { width: colWidths[1], align: 'right' });
    });

    deductions.forEach(([name, amount], i) => {
      doc.text(name, 50 + colWidths[0] + colWidths[1] + 50, y + i * 16, { width: colWidths[2] });
      doc.text(`₹${parseFloat(amount).toLocaleString('en-IN')}`, 50 + colWidths[0] + colWidths[1] + 50 + colWidths[2], y + i * 16, { width: colWidths[3], align: 'right' });
    });

    y += earnings.length * 16 + 10;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 5;

    // Totals
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Gross Earnings: ₹${parseFloat(salary.grossSalary).toLocaleString('en-IN')}`, 50, y, { width: colWidths[0] + colWidths[1] });
    doc.text(`Total Deductions: ₹${parseFloat(salary.totalDeductions).toLocaleString('en-IN')}`, 50 + colWidths[0] + colWidths[1] + 50, y, { width: colWidths[2] + colWidths[3] });
    y += 20;

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(`Net Salary: ₹${parseFloat(salary.netSalary).toLocaleString('en-IN')}`, 50, y);
    y += 20;

    // Bank Details
    doc.fontSize(10).font('Helvetica');
    doc.text(`Bank Account: XXXX XXXX XXXX ${salary.staff.bankAccount?.slice(-4) || 'N/A'}`, 50, y);

    // Signature
    const sigY = 700;
    doc.moveTo(350, sigY).lineTo(550, sigY).stroke();
    doc.fontSize(9).text('Authorized Signatory', 350, sigY + 5);

    doc.end();
  }

  // ==========================================
  // FEATURE 9: STUDENT ID CARD
  // ==========================================
  async generateIDCard(studentId, schoolId, res) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { profile: true, class: true, section: true, academicYear: true },
    });

    if (!student) throw new Error('Student not found');

    const school = await prisma.school.findUnique({ where: { id: schoolId } });

    const doc = new PDFDocument({ margin: 20, size: [242, 153] }); // Credit card size: 85.6mm x 54mm
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="idcard-${student.studentId}.pdf"`);
    doc.pipe(res);

    // Front side
    doc.rect(0, 0, 242, 153).fill('#1e40af');
    doc.fillColor('white').fontSize(12).font('Helvetica-Bold').text(school.name, { align: 'center', width: 242 });
    doc.fontSize(8).text(school.address, { align: 'center', width: 242 });

    doc.fillColor('white').fontSize(10).font('Helvetica-Bold').text(`${student.profile.firstName} ${student.profile.lastName}`, 20, 50);
    doc.fontSize(8).font('Helvetica');
    doc.text(`Class: ${student.class.name} - ${student.section.name}`, 20, 65);
    doc.text(`Roll No: ${student.rollNumber}`, 20, 78);
    doc.text(`Adm No: ${student.studentId}`, 20, 91);
    doc.text(`DOB: ${this.formatDate(student.profile.dateOfBirth)}`, 20, 104);
    doc.text(`Blood: ${student.profile.bloodGroup || 'N/A'}`, 20, 117);
    doc.text(`Academic Year: ${student.academicYear.name}`, 20, 130);

    doc.fontSize(6).text(school.phone, { align: 'center', width: 242 });

    doc.end();
  }

  // Helper
  formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  getMonthName(month) {
    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month] || '';
  }
}

module.exports = new PDFService();
