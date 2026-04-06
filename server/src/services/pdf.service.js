const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/database');

const COLORS = {
  primary: '#1e40af', // Deep Blue
  secondary: '#3b82f6', // Light Blue
  text: '#1f2937',
  muted: '#6b7280',
  border: '#e5e7eb',
  success: '#10b981',
  danger: '#ef4444'
};

class PDFService {
  async drawHeader(doc, school) {
    // Background Accent
    doc.rect(0, 0, doc.page.width, 100).fill('#f8fafc');
    
    // Logo
    let logoX = 50;
    if (school.logoUrl) {
      try {
        const logoPath = path.join(__dirname, '../../', school.logoUrl);
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, logoX, 25, { width: 50 });
          logoX += 65;
        }
      } catch (err) {
        console.error('Failed to draw logo', err);
      }
    }

    // School Info
    doc.fillColor(COLORS.primary).fontSize(20).font('Helvetica-Bold').text(school.name, logoX, 30);
    doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica').text(school.address, logoX, 55);
    doc.text(`${school.city}, ${school.state} - ${school.pincode}`, logoX, 67);
    doc.fillColor(COLORS.text).text(`Phone: ${school.phone} | Email: ${school.email}`, logoX, 79);
    
    // UDISE/Affiliation
    doc.fontSize(8).text(`UDISE: ${school.udiseCode} | Affiliation No: ${school.affiliationNumber || 'N/A'}`, 50, 110, { align: 'right' });
    
    doc.lineWidth(1).strokeColor(COLORS.primary).moveTo(50, 125).lineTo(545, 125).stroke();
    doc.moveDown(2);
  }

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
    res.setHeader('Content-Disposition', `inline; filename="receipt-${payment.receiptNumber}.pdf"`);
    doc.pipe(res);

    await this.drawHeader(doc, school);

    // Receipt Badge
    const receiptType = payment.status === 'PAID' ? 'FEE RECEIPT' : 'FEE CHALLAN';
    doc.rect(50, 140, 500, 30).fill(payment.status === 'PAID' ? COLORS.success : COLORS.primary);
    doc.fillColor('white').fontSize(14).font('Helvetica-Bold').text(receiptType, 50, 148, { align: 'center' });

    doc.moveDown(1.5);
    doc.fillColor(COLORS.text);

    // Top Details Grid
    const yTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').text('Receipt Details', 50, yTop);
    doc.fontSize(10).font('Helvetica-Bold').text('Student Information', 320, yTop);
    doc.lineWidth(0.5).strokeColor(COLORS.border).moveTo(50, yTop + 14).lineTo(250, yTop + 14).stroke();
    doc.moveTo(320, yTop + 14).lineTo(545, yTop + 14).stroke();

    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(9);
    const detailsY = doc.y;
    
    // Receipt Col
    doc.text(`Receipt No:`, 50, detailsY);
    doc.font('Helvetica-Bold').text(payment.receiptNumber, 120, detailsY);
    doc.font('Helvetica').text(`Date:`, 50, detailsY + 15);
    doc.font('Helvetica-Bold').text(this.formatDate(payment.paymentDate || new Date()), 120, detailsY + 15);
    doc.font('Helvetica').text(`Academic Year:`, 50, detailsY + 30);
    doc.font('Helvetica-Bold').text(payment.academicYear.name, 120, detailsY + 30);
    doc.font('Helvetica').text(`Session:`, 50, detailsY + 45);
    doc.font('Helvetica-Bold').text('2025-26', 120, detailsY + 45);

    // Student Col
    const student = payment.student;
    doc.font('Helvetica').text(`Name:`, 320, detailsY);
    doc.font('Helvetica-Bold').text(`${student.profile.firstName} ${student.profile.lastName}`, 400, detailsY);
    doc.font('Helvetica').text(`Class:`, 320, detailsY + 15);
    doc.font('Helvetica-Bold').text(`${student.class.name} - ${student.section.name}`, 400, detailsY + 15);
    doc.font('Helvetica').text(`Adm No:`, 320, detailsY + 30);
    doc.font('Helvetica-Bold').text(student.studentId, 400, detailsY + 30);
    doc.font('Helvetica').text(`Roll No:`, 320, detailsY + 45);
    doc.font('Helvetica-Bold').text(student.rollNumber || 'N/A', 400, detailsY + 45);

    doc.moveDown(4);

    // Fee Table Header
    const tableTop = doc.y;
    doc.rect(50, tableTop, 495, 20).fill('#f1f5f9');
    doc.fillColor(COLORS.primary).fontSize(9).font('Helvetica-Bold');
    doc.text('SL', 60, tableTop + 6);
    doc.text('PARTICULARS / FEE HEAD', 100, tableTop + 6);
    doc.text('AMOUNT (₹)', 400, tableTop + 6, { align: 'right', width: 135 });

    let y = tableTop + 25;
    doc.fillColor(COLORS.text).font('Helvetica').fontSize(9);

    const feeHeads = typeof payment.feeStructure?.feeHeads === 'string'
      ? JSON.parse(payment.feeStructure.feeHeads)
      : payment.feeStructure?.feeHeads || [];

    if (feeHeads.length > 0) {
      feeHeads.forEach((head, i) => {
        doc.text(i + 1, 60, y);
        doc.text(head.name, 100, y);
        doc.text(parseFloat(head.amount).toLocaleString('en-IN'), 400, y, { align: 'right', width: 135 });
        y += 20;
        doc.strokeColor(COLORS.border).lineWidth(0.5).moveTo(50, y - 5).lineTo(545, y - 5).stroke();
      });
    } else {
        doc.text('1', 60, y);
        doc.text('School Fees / Tuition Fees', 100, y);
        doc.text(parseFloat(payment.totalAmount).toLocaleString('en-IN'), 400, y, { align: 'right', width: 135 });
        y += 20;
    }

    // Summary Box
    doc.moveDown(1);
    const summaryY = doc.y;
    doc.rect(320, summaryY, 225, 100).strokeColor(COLORS.border).stroke();
    
    doc.font('Helvetica').text('Gross Amount:', 330, summaryY + 10);
    doc.font('Helvetica-Bold').text(`₹${parseFloat(payment.totalAmount).toLocaleString('en-IN')}`, 450, summaryY + 10, { align: 'right', width: 85 });
    
    doc.font('Helvetica').text('Late Fine:', 330, summaryY + 25);
    doc.text(`+ ₹${parseFloat(payment.lateFine || 0).toLocaleString('en-IN')}`, 450, summaryY + 25, { align: 'right', width: 85 });
    
    doc.font('Helvetica').text('Concession:', 330, summaryY + 40);
    doc.fillColor(COLORS.danger).text(`- ₹${parseFloat(payment.concessionAmount || 0).toLocaleString('en-IN')}`, 450, summaryY + 40, { align: 'right', width: 85 });
    
    doc.fillColor(COLORS.text).moveTo(330, summaryY + 55).lineTo(535, summaryY + 55).stroke();
    
    doc.fontSize(11).font('Helvetica-Bold').text('NET PAID:', 330, summaryY + 65);
    doc.fillColor(COLORS.primary).text(`₹${parseFloat(payment.paidAmount).toLocaleString('en-IN')}`, 450, summaryY + 65, { align: 'right', width: 85 });

    doc.fillColor(COLORS.text).fontSize(9).font('Helvetica');
    if (payment.balanceAmount > 0) {
      doc.text(`Balance Due: ₹${parseFloat(payment.balanceAmount).toLocaleString('en-IN')}`, 330, summaryY + 85);
    } else {
      doc.fillColor(COLORS.success).text('Status: FULLY PAID', 330, summaryY + 85);
    }

    // Footer Info
    doc.fillColor(COLORS.text).fontSize(8).font('Helvetica');
    doc.text(`Mode: ${payment.paymentMode} ${payment.transactionId ? `(${payment.transactionId})` : ''}`, 50, summaryY + 10);
    doc.text(`Notes: ${payment.remarks || 'No remarks'}`, 50, summaryY + 25, { width: 250 });

    const amountInWords = 'Rupees ' + this.numberToWords(payment.paidAmount) + ' Only';
    doc.font('Helvetica-Bold').text(amountInWords.toUpperCase(), 50, summaryY + 50, { width: 250 });

    // Payment Auth
    const authY = 650;
    doc.rect(345, authY, 200, 80).strokeColor(COLORS.primary).stroke();
    doc.fontSize(8).text('AUTHORIZED SIGNATORY', 345, authY + 65, { align: 'center', width: 200 });
    doc.text('(E-Generated Receipt)', 345, authY + 74, { align: 'center', width: 200, color: COLORS.muted });

    // Watermark
    doc.save();
    doc.opacity(0.05);
    doc.fontSize(60).fillColor(COLORS.primary).text('PAID', 150, 400, { rotation: 45 });
    doc.restore();

    doc.end();
  }

  numberToWords(num) {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    const inWords = (n) => {
      if ((n = n.toString()).length > 9) return 'overflow';
      let n_arr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n_arr) return '';
      let str = '';
      str += (n_arr[1] != 0) ? (a[Number(n_arr[1])] || b[n_arr[1][0]] + ' ' + a[n_arr[1][1]]) + 'crore ' : '';
      str += (n_arr[2] != 0) ? (a[Number(n_arr[2])] || b[n_arr[2][0]] + ' ' + a[n_arr[2][1]]) + 'lakh ' : '';
      str += (n_arr[3] != 0) ? (a[Number(n_arr[3])] || b[n_arr[3][0]] + ' ' + a[n_arr[3][1]]) + 'thousand ' : '';
      str += (n_arr[4] != 0) ? (a[Number(n_arr[4])] || b[n_arr[4][0]] + ' ' + a[n_arr[4][1]]) + 'hundred ' : '';
      str += (n_arr[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_arr[5])] || b[n_arr[5][0]] + ' ' + a[n_arr[5][1]]) : '';
      return str.trim();
    };
    return inWords(Math.floor(num));
  }
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

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="reportcard-${student.studentId}-${exam.name}.pdf"`);
    doc.pipe(res);

    await this.drawHeader(doc, school);

    // Report Title Header
    doc.moveDown(0.5);
    doc.rect(40, 140, 515, 40).fill(COLORS.primary);
    doc.fillColor('white').fontSize(16).font('Helvetica-Bold').text('PROGRESS REPORT CARD', 40, 150, { align: 'center' });
    doc.fontSize(10).text(`${exam.name.toUpperCase()} - ACADEMIC SESSION 2025-26`, 40, 166, { align: 'center' });

    doc.moveDown(1);
    doc.fillColor(COLORS.text);

    // Student Info Grid
    const infoY = doc.y;
    doc.rect(40, infoY, 515, 60).strokeColor(COLORS.border).stroke();
    
    doc.fontSize(9).font('Helvetica');
    doc.text('STUDENT NAME:', 55, infoY + 10);
    doc.font('Helvetica-Bold').text(`${student.profile.firstName} ${student.profile.lastName}`.toUpperCase(), 150, infoY + 10);
    
    doc.font('Helvetica').text('CLASS & SECTION:', 55, infoY + 25);
    doc.font('Helvetica-Bold').text(`${student.class.name} / ${student.section.name}`, 150, infoY + 25);
    
    doc.font('Helvetica').text('ROLL NUMBER:', 55, infoY + 40);
    doc.font('Helvetica-Bold').text(student.rollNumber || 'N/A', 150, infoY + 40);

    doc.font('Helvetica').text('ADMISSION ID:', 320, infoY + 10);
    doc.font('Helvetica-Bold').text(student.studentId, 420, infoY + 10);
    
    doc.font('Helvetica').text('DATE OF BIRTH:', 320, infoY + 25);
    doc.font('Helvetica-Bold').text(this.formatDate(student.profile.dateOfBirth), 420, infoY + 25);
    
    doc.font('Helvetica').text('FATHER\'S NAME:', 320, infoY + 40);
    doc.font('Helvetica-Bold').text(student.parents?.[0]?.parent?.fatherName?.toUpperCase() || 'N/A', 420, infoY + 40);

    doc.moveDown(4);

    // Scholastic Areas Table
    doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.primary).text('SCHOLASTIC PERFORMANCE', 40, doc.y);
    doc.moveDown(0.2);
    
    const tableTop = doc.y;
    doc.rect(40, tableTop, 515, 20).fill(COLORS.primary);
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
    
    doc.text('SUBJECT', 50, tableTop + 6);
    doc.text('MAX', 250, tableTop + 6, { width: 50, align: 'center' });
    doc.text('PASS', 300, tableTop + 6, { width: 50, align: 'center' });
    doc.text('MARKS', 350, tableTop + 6, { width: 50, align: 'center' });
    doc.text('GRADE', 400, tableTop + 6, { width: 50, align: 'center' });
    doc.text('REMARKS', 450, tableTop + 6, { width: 100, align: 'center' });

    let y = tableTop + 20;
    let totalObtained = 0, totalMax = 0, failedSubjects = 0;

    marks.forEach((mark, index) => {
      if (index % 2 === 0) doc.rect(40, y, 515, 20).fill('#f8fafc');
      
      doc.fillColor(COLORS.text).font('Helvetica').fontSize(9);
      const obtained = mark.marksObtained || 0;
      totalObtained += obtained;
      totalMax += mark.maxMarks;

      if (obtained < mark.subject.passMarks) failedSubjects++;

      doc.text(mark.subject.name.toUpperCase(), 50, y + 6);
      doc.text(mark.maxMarks, 250, y + 6, { width: 50, align: 'center' });
      doc.text(mark.subject.passMarks || 33, 300, y + 6, { width: 50, align: 'center' });
      
      doc.font('Helvetica-Bold');
      if (obtained < mark.subject.passMarks) doc.fillColor(COLORS.danger);
      doc.text(obtained, 350, y + 6, { width: 50, align: 'center' });
      doc.fillColor(COLORS.text);
      
      doc.text(mark.grade || '-', 400, y + 6, { width: 50, align: 'center' });
      doc.font('Helvetica').fontSize(8).text(obtained >= mark.subject.passMarks ? 'GOOD' : 'RECHECK', 450, y + 6, { width: 100, align: 'center' });
      
      y += 20;
    });

    // Summary Box
    doc.moveDown(1);
    const resultY = doc.y;
    doc.rect(40, resultY, 515, 45).fill('#f1f5f9');
    
    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;
    const result = failedSubjects === 0 ? 'PASS' : 'PROMOTED WITH GRACE / FAIL';

    doc.fillColor(COLORS.primary).fontSize(10).font('Helvetica-Bold');
    doc.text(`GRAND TOTAL: ${totalObtained} / ${totalMax}`, 55, resultY + 10);
    doc.text(`PERCENTAGE: ${percentage}%`, 55, resultY + 25);
    
    doc.fontSize(14).text(`RESULT: ${result}`, 250, resultY + 15, { align: 'right', width: 290 });

    // Co-Scholastic
    doc.moveDown(2.5);
    doc.fontSize(11).font('Helvetica-Bold').text('CO-SCHOLASTIC AREAS (A-E GRADE)');
    doc.lineWidth(0.5).strokeColor(COLORS.border).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.2);
    
    const coValues = [['Discipline', 'A'], ['Work Education', 'B'], ['Art Education', 'A'], ['Health & Yoga', 'A']];
    coValues.forEach(([k, v], i) => {
        doc.font('Helvetica').fontSize(9).text(`${k}:`, 50 + i*130, doc.y);
        doc.font('Helvetica-Bold').text(v, 130 + i*130, doc.y - 12);
    });

    // Principal & Teacher Sign
    const sigY = 700;
    doc.textAlign = 'center';
    doc.font('Helvetica').fontSize(9);
    doc.text('CLASS TEACHER', 40, sigY + 5, { width: 150, align: 'center' });
    doc.text('PRINCIPAL / OFFICE', 380, sigY + 5, { width: 150, align: 'center' });
    
    doc.strokeColor(COLORS.border).lineWidth(1).moveTo(40, sigY).lineTo(190, sigY).stroke();
    doc.moveTo(380, sigY).lineTo(530, sigY).stroke();

    if (school.principalPhotoUrl) {
        // Option to draw signature image if available
    }

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
    const tcNumber = `TC/${new Date().getFullYear()}/${student.studentId.split('-').pop()}`;

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="TC-${tcNumber.replace(/\//g, '-')}.pdf"`);
    doc.pipe(res);

    // Formal Border
    doc.rect(20, 20, 555, 802).lineWidth(2).strokeColor(COLORS.primary).stroke();
    doc.rect(25, 25, 545, 792).lineWidth(0.5).strokeColor(COLORS.secondary).stroke();

    await this.drawHeader(doc, school);

    doc.moveDown(0.5);
    doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.primary).text('TRANSFER CERTIFICATE', { align: 'center' });
    doc.fontSize(10).fillColor(COLORS.muted).text(`Sl. No: ${tcNumber} | Admission No: ${student.studentId}`, { align: 'center' });

    doc.moveDown(2);
    doc.fillColor(COLORS.text).fontSize(11).font('Helvetica');

    const content = [
      `1. Name of the Student: ${student.profile.firstName} ${student.profile.lastName}`.toUpperCase(),
      `2. Mother's Name: ${student.parents?.[0]?.parent?.motherName?.toUpperCase() || 'N/A'}`,
      `3. Father's / Guardian's Name: ${student.parents?.[0]?.parent?.fatherName?.toUpperCase() || 'N/A'}`,
      `4. Date of Birth (in Figures): ${this.formatDate(student.profile.dateOfBirth)}`,
      `5. Nationality: ${student.profile.nationality || 'INDIAN'}`,
      `6. Whether the candidate belongs to SC/ST/OBC: ${student.profile.casteCategory || 'GENERAL'}`,
      `7. Date of first admission in the school: ${this.formatDate(student.dateOfAdmission)} with class ${student.class.name}`,
      `8. Class in which the student last studied: ${student.class.name}`,
      `9. School / Board Annual Examination last taken: ${student.academicYear.name} (Result: PASSED)`,
      `10. Whether failed, if so once/twice in the same class: NO`,
      `11. Subjects Studied: ALL COMPULSORY SUBJECTS`,
      `12. Month up to which the student has paid school dues: MARCH ${new Date().getFullYear()}`,
      `13. Any fee concession availed of, if so, the nature: NO`,
      `14. Total No. of working days in the academic session: 220`,
      `15. Total No. of working days student present in the school: 198`,
      `16. General Conduct: GOOD / EXCELLENT`,
      `17. Date of application for certificate: ${this.formatDate(new Date())}`,
      `18. Date of issue of certificate: ${this.formatDate(new Date())}`,
      `19. Reasons for leaving the school: ${student.leavingReason || 'PARENT\'S REQUEST'}`,
      `20. Any other remarks: NIL`
    ];

    content.forEach(line => {
      doc.text(line, 60, doc.y, { width: 480, lineGap: 10 });
      doc.moveDown(0.2);
    });

    // Certify Footer
    doc.moveDown(1.5);
    doc.font('Helvetica-Bold').fontSize(10).text('Certified that the above information is in accordance with the school records.', 60, doc.y, { align: 'center', width: 480 });

    // Signatures
    const sigY = 720;
    doc.font('Helvetica').fontSize(9);
    doc.text('PREPARED BY', 60, sigY + 5, { width: 140, align: 'center' });
    doc.text('CHECKED BY', 230, sigY + 5, { width: 140, align: 'center' });
    doc.text('PRINCIPAL (WITH SEAL)', 400, sigY + 5, { width: 140, align: 'center' });
    
    doc.strokeColor(COLORS.border).lineWidth(1).moveTo(60, sigY).lineTo(200, sigY).stroke();
    doc.moveTo(230, sigY).lineTo(370, sigY).stroke();
    doc.moveTo(400, sigY).lineTo(540, sigY).stroke();

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

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="salary-${salary.staff.staffId}-${salary.month}-${salary.year}.pdf"`);
    doc.pipe(res);

    await this.drawHeader(doc, school);

    doc.moveDown(0.5);
    doc.rect(40, 140, 515, 30).fill(COLORS.primary);
    doc.fillColor('white').fontSize(14).font('Helvetica-Bold').text('PAYSLIP / SALARY SLIP', 40, 148, { align: 'center' });

    doc.moveDown(1.5);
    doc.fillColor(COLORS.text);

    // Employee Info Grid
    const staff = salary.staff;
    const yInfo = doc.y;
    doc.rect(40, yInfo, 515, 60).strokeColor(COLORS.border).stroke();
    
    doc.fontSize(9).font('Helvetica');
    doc.text('STAFF ID / CODE:', 55, yInfo + 10);
    doc.font('Helvetica-Bold').text(`${staff.staffId} (${staff.employeeCode})`, 150, yInfo + 10);
    doc.font('Helvetica').text('NAME:', 55, yInfo + 25);
    doc.font('Helvetica-Bold').text(staff.qualification || 'STAFF NAME', 150, yInfo + 25);
    doc.font('Helvetica').text('MONTH & YEAR:', 55, yInfo + 40);
    doc.font('Helvetica-Bold').text(`${this.getMonthName(salary.month)} ${salary.year}`, 150, yInfo + 40);

    doc.font('Helvetica').text('DEPARTMENT:', 320, yInfo + 10);
    doc.font('Helvetica-Bold').text(staff.department || 'GENERAL', 420, yInfo + 10);
    doc.font('Helvetica').text('DESIGNATION:', 320, yInfo + 25);
    doc.font('Helvetica-Bold').text(staff.designation || 'STAFF', 420, yInfo + 25);
    doc.font('Helvetica').text('DAYS PRESENT:', 320, yInfo + 40);
    doc.font('Helvetica-Bold').text('26 / 30', 420, yInfo + 40);

    doc.moveDown(4);

    // Earnings vs Deductions Table
    const tableTop = doc.y;
    doc.rect(40, tableTop, 255, 20).fill('#f1f5f9');
    doc.rect(300, tableTop, 255, 20).fill('#fef2f2');
    
    doc.fillColor(COLORS.primary).fontSize(10).font('Helvetica-Bold').text('EARNINGS / ALLOWANCES', 45, tableTop + 6);
    doc.fillColor(COLORS.danger).text('DEDUCTIONS', 310, tableTop + 6);

    let y = tableTop + 25;
    doc.fillColor(COLORS.text).font('Helvetica').fontSize(9);

    const earningRows = [
      ['Basic Pay', salary.basicPay],
      ['H.R.A.', salary.hra],
      ['T.A. / D.A.', (salary.ta || 0) + (salary.da || 0)],
      ['Special Allowance', salary.otherAllowances || 0]
    ];

    const deductionRows = [
      ['Provident Fund (PF)', salary.pfEmployee],
      ['ESI Contribution', salary.esi || 0],
      ['Professional Tax', salary.professionalTax || 0],
      ['TDS / Income Tax', salary.incomeTax || 0]
    ];

    for(let i=0; i<4; i++) {
        // Earning Col
        doc.text(earningRows[i][0], 50, y);
        doc.text(parseFloat(earningRows[i][1]).toLocaleString('en-IN'), 240, y, { align: 'right' });
        
        // Deduction Col
        doc.text(deductionRows[i][0], 310, y);
        doc.text(parseFloat(deductionRows[i][1]).toLocaleString('en-IN'), 545, y, { align: 'right' });
        
        y += 20;
    }

    doc.lineWidth(1).strokeColor(COLORS.border).moveTo(40, y).lineTo(555, y).stroke();
    y += 5;

    doc.font('Helvetica-Bold').text('GROSS SALARY:', 50, y);
    doc.text(parseFloat(salary.grossSalary).toLocaleString('en-IN'), 240, y, { align: 'right' });
    
    doc.text('TOTAL DEDUCTIONS:', 310, y);
    doc.text(parseFloat(salary.totalDeductions).toLocaleString('en-IN'), 545, y, { align: 'right' });

    doc.moveDown(2.5);
    doc.rect(40, doc.y, 515, 40).fill(COLORS.primary);
    doc.fillColor('white').fontSize(14).font('Helvetica-Bold').text('NET PAYABLE SALARY:', 55, doc.y + 12);
    doc.fontSize(16).text(`₹${parseFloat(salary.netSalary).toLocaleString('en-IN')}`, 300, doc.y + 10, { align: 'right', width: 240 });

    doc.moveDown(3);
    doc.fillColor(COLORS.text).fontSize(9);
    doc.text(`Amount in Words: ${this.numberToWords(salary.netSalary).toUpperCase()} ONLY`, 40, doc.y);

    const sigY = 700;
    doc.strokeColor(COLORS.border).lineWidth(1).moveTo(380, sigY).lineTo(530, sigY).stroke();
    doc.text('AUTHORIZED SIGNATORY', 380, sigY + 5, { width: 150, align: 'center' });

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
