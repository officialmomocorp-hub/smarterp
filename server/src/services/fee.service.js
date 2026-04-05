const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

class FeeService {
  async createFeeStructure(data, schoolId) {
    const { class: className, academicYear, feeHeads, installmentType, dueDates, lateFinePerDay, gstPercentage, classId, academicYearId } = data;

    let classRecord;
    if (classId) {
      classRecord = await prisma.class.findFirst({ where: { id: classId, schoolId } });
    } else if (className) {
      classRecord = await prisma.class.findFirst({ where: { schoolId, name: className } });
    }

    if (!classRecord) {
      throw new AppError('Class not found', 404);
    }

    let year;
    if (academicYearId) {
      year = await prisma.academicYear.findFirst({ where: { id: academicYearId, schoolId } });
    } else if (academicYear) {
      year = await prisma.academicYear.findFirst({ where: { schoolId, name: academicYear } });
    }

    if (!year) {
      throw new AppError('Academic year not found', 404);
    }

    let totalAmount = 0;
    const heads = typeof feeHeads === 'string' ? JSON.parse(feeHeads) : feeHeads;

    for (const head of heads) {
      totalAmount += parseFloat(head.amount);
    }

    const feeStructure = await prisma.feeStructure.create({
      data: {
        schoolId,
        academicYearId: year.id,
        classId: classRecord.id,
        name: data.name || `${className} Fee Structure`,
        feeHeads: typeof heads === 'string' ? heads : JSON.stringify(heads),
        totalAmount,
        installmentType: installmentType || 'QUARTERLY',
        dueDates: typeof dueDates === 'string' ? dueDates : JSON.stringify(dueDates),
        lateFinePerDay: lateFinePerDay || 0,
        gstPercentage: gstPercentage || 0,
      },
      include: { class: true },
    });

    return feeStructure;
  }

  async getFeeStructure(schoolId, classId, academicYearId) {
    const feeStructure = await prisma.feeStructure.findFirst({
      where: {
        schoolId,
        classId,
        academicYearId,
        isActive: true,
      },
      include: { concessions: true, class: true },
    });

    return feeStructure;
  }

  async createConcession(data, schoolId) {
    const concession = await prisma.feeConcession.create({
      data: {
        feeStructureId: data.feeStructureId,
        name: data.name,
        type: data.type,
        discountType: data.discountType,
        discountValue: data.discountValue,
        applicableCaste: data.applicableCaste || [],
        applicableIncome: data.applicableIncome,
        maxDiscountAmount: data.maxDiscountAmount,
        description: data.description,
      },
    });

    return concession;
  }

  async processPayment(data, schoolId) {
    const { studentId, feeStructureId, installmentNumber, paymentMode, transactionId, amount, concessionId, remarks } = data;

    let student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      include: { class: true, feePayments: true },
    });

    if (!student) {
      student = await prisma.student.findFirst({
        where: { studentId, schoolId },
        include: { class: true, feePayments: true },
      });
    }

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    if (!feeStructureId) {
      throw new AppError('Fee structure ID is required', 400);
    }

    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
      include: { concessions: true },
    });

    if (!feeStructure) {
      throw new AppError('Fee structure not found', 404);
    }

    const installmentData = feeStructure.dueDates[installmentNumber - 1];
    if (!installmentData) {
      throw new AppError('Invalid installment number', 400);
    }

    const dueDate = new Date(installmentData.date);
    const now = new Date();
    let lateFine = 0;

    if (now > dueDate && feeStructure.lateFinePerDay > 0) {
      const daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
      lateFine = daysLate * parseFloat(feeStructure.lateFinePerDay);
    }

    let concessionAmount = 0;
    if (concessionId) {
      const concession = feeStructure.concessions.find(c => c.id === concessionId);
      if (concession) {
        if (concession.discountType === 'PERCENTAGE') {
          concessionAmount = (parseFloat(installmentData.amount) * parseFloat(concession.discountValue)) / 100;
        } else {
          concessionAmount = parseFloat(concession.discountValue);
        }

        if (concession.maxDiscountAmount && concessionAmount > parseFloat(concession.maxDiscountAmount)) {
          concessionAmount = parseFloat(concession.maxDiscountAmount);
        }
      }
    }

    const installmentAmount = parseFloat(installmentData.amount) - concessionAmount;
    const gstAmount = (installmentAmount * parseFloat(feeStructure.gstPercentage)) / 100;
    const totalAmount = installmentAmount + gstAmount + lateFine;
    const paidAmount = parseFloat(amount) || totalAmount;
    const balanceAmount = totalAmount - paidAmount;

    let status = 'PAID';
    if (balanceAmount > 0 && paidAmount > 0) {
      status = 'PARTIAL';
    } else if (paidAmount === 0) {
      status = 'PENDING';
    }

    if (now > dueDate && status !== 'PAID') {
      status = 'OVERDUE';
    }

    const receiptNumber = this.generateReceiptNumber(schoolId);

    const feePayment = await prisma.feePayment.create({
      data: {
        schoolId,
        academicYearId: student.academicYearId,
        studentId: student.id,
        feeStructureId,
        concessionId,
        receiptNumber,
        installmentNumber,
        dueDate,
        paymentDate: now,
        totalAmount,
        concessionAmount,
        gstAmount,
        lateFine,
        paidAmount,
        balanceAmount,
        status,
        paymentMode: paymentMode || 'CASH',
        transactionId,
        remarks,
        createdBy: 'system',
      },
      include: {
        student: { include: { profile: true, class: true, section: true } },
        feeStructure: true,
      },
    });

    return feePayment;
  }

  async getStudentFeeStatus(studentIdOrCode, schoolId, academicYearId) {
    // First resolve the student - could be UUID or display ID like STU2025001
    let student = await prisma.student.findFirst({
      where: { id: studentIdOrCode, schoolId },
      include: { profile: true, class: true, section: true },
    });

    if (!student) {
      // Try by display studentId field
      student = await prisma.student.findFirst({
        where: { studentId: studentIdOrCode, schoolId },
        include: { profile: true, class: true, section: true },
      });
    }

    if (!student) {
      // Try by aadhar or partial match
      student = await prisma.student.findFirst({
        where: {
          schoolId,
          OR: [
            { studentId: { contains: studentIdOrCode } },
            { profile: { aadharNumber: studentIdOrCode } },
          ],
        },
        include: { profile: true, class: true, section: true },
      });
    }

    if (!student) {
      return {
        student: null,
        payments: [],
        summary: { totalDue: 0, totalPaid: 0, totalBalance: 0, totalLateFine: 0, paymentPercentage: 0 },
      };
    }

    const wherePayments = {
      studentId: student.id,
      schoolId,
    };
    if (academicYearId && academicYearId !== 'demo-academic-year') {
      wherePayments.academicYearId = academicYearId;
    }

    const feePayments = await prisma.feePayment.findMany({
      where: wherePayments,
      orderBy: { installmentNumber: 'asc' },
    });

    // If no payments exist, try to calculate from fee structure
    let totalDue = feePayments.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0);
    const totalPaid = feePayments.reduce((sum, p) => sum + parseFloat(p.paidAmount), 0);
    let totalBalance = feePayments.reduce((sum, p) => sum + parseFloat(p.balanceAmount), 0);
    const totalLateFine = feePayments.reduce((sum, p) => sum + parseFloat(p.lateFine), 0);

    // If no payments, look up fee structure for this class
    if (feePayments.length === 0) {
      const feeStructure = await prisma.feeStructure.findFirst({
        where: { classId: student.classId, schoolId, isActive: true },
      });
      if (feeStructure) {
        totalDue = feeStructure.totalAmount;
        totalBalance = feeStructure.totalAmount;
        student.activeFeeStructure = feeStructure;
      }
    } else {
      // If there are payments, the first payment's structure is the active one
      student.activeFeeStructure = { id: feePayments[0].feeStructureId };
    }

    return {
      student,
      payments: feePayments,
      summary: {
        totalDue,
        totalPaid,
        totalBalance,
        totalLateFine,
        paymentPercentage: totalDue > 0 ? ((totalPaid / totalDue) * 100).toFixed(2) : 0,
      },
    };
  }

  async getDefaulterList(schoolId, academicYearId, query = {}) {
    const { class: className, section } = query;

    const where = {
      schoolId,
      academicYearId,
      status: { in: ['PENDING', 'OVERDUE'] },
      balanceAmount: { gt: 0 },
    };

    if (className) {
      where.student = { class: { name: className } };
    }

    if (section) {
      where.student = { section: { name: section } };
    }

    const defaulters = await prisma.feePayment.findMany({
      where,
      include: {
        student: {
          include: {
            profile: true,
            class: true,
            section: true,
            parents: { include: { parent: true } },
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { balanceAmount: 'desc' }],
    });

    return defaulters;
  }

  async getCollectionReport(schoolId, academicYearId, query = {}) {
    const { startDate, endDate, class: className } = query;

    const where = {
      schoolId,
      academicYearId,
      paymentDate: { not: null },
    };

    if (startDate && endDate) {
      where.paymentDate = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    if (className) {
      where.student = { class: { name: className } };
    }

    const [payments, summary] = await Promise.all([
      prisma.feePayment.findMany({
        where,
        include: {
          student: { include: { profile: true, class: true, section: true } },
        },
        orderBy: { paymentDate: 'desc' },
      }),
      prisma.feePayment.aggregate({
        where,
        _sum: {
          paidAmount: true,
          totalAmount: true,
          concessionAmount: true,
          gstAmount: true,
          lateFine: true,
        },
        _count: true,
      }),
    ]);

    return {
      payments,
      summary: {
        totalCollected: summary._sum.paidAmount || 0,
        totalDue: summary._sum.totalAmount || 0,
        totalConcession: summary._sum.concessionAmount || 0,
        totalGst: summary._sum.gstAmount || 0,
        totalLateFine: summary._sum.lateFine || 0,
        totalTransactions: summary._count,
      },
    };
  }

  async createRazorpayOrder(studentId, feePaymentId, amount) {
    const razorpay = require('razorpay');

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new AppError('Razorpay not configured', 500);
    }

    const instance = new razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount: Math.round(parseFloat(amount) * 100),
      currency: 'INR',
      receipt: `receipt_${feePaymentId}`,
      payment_capture: 1,
    });

    await prisma.feePayment.update({
      where: { id: feePaymentId },
      data: {
        razorpayOrderId: order.id,
      },
    });

    return order;
  }

  async verifyRazorpayPayment(paymentData) {
    const crypto = require('crypto');

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, feePaymentId } = paymentData;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new AppError('Invalid payment signature', 400);
    }

    await prisma.feePayment.update({
      where: { id: feePaymentId },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: 'PAID',
        paymentDate: new Date(),
        paymentMode: 'RAZORPAY',
        transactionId: razorpay_payment_id,
      },
    });

    return { verified: true };
  }

  generateReceiptNumber(schoolId) {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `REC${year}${month}${random}`;
  }
}

module.exports = new FeeService();
