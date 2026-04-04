const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

class ExamEnhancedService {
  // ==========================================
  // VERIFICATION WORKFLOW
  // ==========================================
  async submitMarksForVerification(markId, userId) {
    const mark = await prisma.mark.findUnique({
      where: { id: markId },
      include: { exam: true, student: true },
    });

    if (!mark) throw new AppError('Mark entry not found', 404);
    if (mark.enteredBy !== userId) throw new AppError('You can only submit your own entries', 403);
    if (mark.status !== 'DRAFT') throw new AppError('Only draft entries can be submitted', 400);

    const updated = await prisma.mark.update({
      where: { id: markId },
      data: {
        status: 'SUBMITTED',
        verificationLevel: 1,
      },
    });

    await prisma.markVerificationLog.create({
      data: {
        markId,
        action: 'SUBMITTED_FOR_VERIFICATION',
        performedBy: userId,
        oldValue: 'DRAFT',
        newValue: 'SUBMITTED',
      },
    });

    return updated;
  }

  async hodVerifyMark(markId, userId, action, remarks) {
    const mark = await prisma.mark.findUnique({
      where: { id: markId },
      include: { exam: true },
    });

    if (!mark) throw new AppError('Mark entry not found', 404);
    if (mark.status !== 'SUBMITTED') throw new AppError('Only submitted entries can be verified', 400);

    let newStatus, newLevel;
    if (action === 'APPROVE') {
      newStatus = 'VERIFIED';
      newLevel = 2;
    } else if (action === 'SEND_BACK') {
      newStatus = 'DRAFT';
      newLevel = 0;
    } else {
      throw new AppError('Invalid action. Use APPROVE or SEND_BACK', 400);
    }

    const updated = await prisma.mark.update({
      where: { id: markId },
      data: {
        status: newStatus,
        verificationLevel: newLevel,
        verifiedByHod: userId,
        verifiedByHodAt: new Date(),
        hodRemarks: remarks,
      },
    });

    await prisma.markVerificationLog.create({
      data: {
        markId,
        action: action === 'APPROVE' ? 'HOD_VERIFIED' : 'HOD_SENT_BACK',
        performedBy: userId,
        reason: remarks,
        oldValue: mark.status,
        newValue: newStatus,
      },
    });

    return updated;
  }

  async principalApproveMark(markId, userId, action, remarks) {
    const mark = await prisma.mark.findUnique({ where: { id: markId } });
    if (!mark) throw new AppError('Mark entry not found', 404);
    if (mark.status !== 'VERIFIED') throw new AppError('Only verified entries can be approved', 400);

    let newStatus;
    if (action === 'APPROVE') {
      newStatus = 'APPROVED';
    } else if (action === 'SEND_BACK') {
      newStatus = 'SUBMITTED';
    } else {
      throw new AppError('Invalid action', 400);
    }

    const updated = await prisma.mark.update({
      where: { id: markId },
      data: {
        status: newStatus,
        verificationLevel: action === 'APPROVE' ? 3 : 1,
        approvedByPrincipal: userId,
        approvedByPrincipalAt: new Date(),
        principalRemarks: remarks,
      },
    });

    await prisma.markVerificationLog.create({
      data: {
        markId,
        action: action === 'APPROVE' ? 'PRINCIPAL_APPROVED' : 'PRINCIPAL_SENT_BACK',
        performedBy: userId,
        reason: remarks,
        oldValue: mark.status,
        newValue: newStatus,
      },
    });

    return updated;
  }

  async getPendingVerifications(schoolId, role, userId) {
    let where = { exam: { schoolId } };

    if (role === 'TEACHER') {
      where.enteredBy = userId;
      where.status = { in: ['DRAFT', 'SUBMITTED'] };
    } else if (role === 'HOD' || role === 'COORDINATOR') {
      where.status = 'SUBMITTED';
    } else if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      where.status = 'VERIFIED';
    }

    const marks = await prisma.mark.findMany({
      where,
      include: {
        student: { include: { profile: true, class: true, section: true } },
        subject: true,
        exam: true,
      },
      orderBy: { enteredAt: 'asc' },
    });

    return marks;
  }

  // ==========================================
  // EXCEL BULK MARKS UPLOAD
  // ==========================================
  async generateMarksTemplate(examId) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examSubjects: { include: { subject: true } },
        class: true,
      },
    });

    if (!exam) throw new AppError('Exam not found', 404);

    const students = await prisma.student.findMany({
      where: { classId: exam.classId, status: 'ACTIVE' },
      include: { profile: true, section: true },
      orderBy: { rollNumber: 'asc' },
    });

    const headers = ['Student ID', 'Student Name', 'Roll Number'];
    exam.examSubjects.forEach(es => {
      headers.push(`${es.subject.name} (Max: ${es.maxMarks})`);
    });

    const rows = [headers];
    students.forEach(s => {
      const row = [s.studentId, `${s.profile.firstName} ${s.profile.lastName}`, s.rollNumber];
      exam.examSubjects.forEach(() => row.push(''));
      rows.push(row);
    });

    return { headers, rows, students, exam };
  }

  async bulkUploadMarks(examId, marksData, enteredBy) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { examSubjects: { include: { subject: true } } },
    });

    if (!exam) throw new AppError('Exam not found', 404);

    const results = { success: 0, errors: [], updated: 0 };

    for (const entry of marksData) {
      try {
        const student = await prisma.student.findFirst({
          where: {
            OR: [
              { studentId: entry.studentId },
              { profile: { firstName: { contains: entry.studentName, mode: 'insensitive' } } },
            ],
            classId: exam.classId,
          },
          include: { profile: true },
        });

        if (!student) {
          results.errors.push({ studentId: entry.studentId, error: 'Student not found' });
          continue;
        }

        for (const es of exam.examSubjects) {
          const marksKey = es.subject.name;
          const marksValue = entry[marksKey];

          if (marksValue !== undefined && marksValue !== null && marksValue !== '') {
            const marksNum = parseFloat(marksValue);

            if (isNaN(marksNum)) {
              results.errors.push({
                studentId: student.studentId,
                subject: es.subject.name,
                error: 'Invalid marks value',
              });
              continue;
            }

            if (marksNum > es.maxMarks) {
              results.errors.push({
                studentId: student.studentId,
                subject: es.subject.name,
                error: `Marks (${marksNum}) exceed max marks (${es.maxMarks})`,
              });
              continue;
            }

            const grade = this.calculateGrade(marksNum, es.maxMarks, exam);

            await prisma.mark.upsert({
              where: {
                examId_studentId_subjectId: {
                  examId,
                  studentId: student.id,
                  subjectId: es.subjectId,
                },
              },
              update: {
                marksObtained: marksNum,
                grade,
                enteredBy,
                status: 'DRAFT',
              },
              create: {
                examId,
                studentId: student.id,
                subjectId: es.subjectId,
                marksObtained: marksNum,
                maxMarks: es.maxMarks,
                grade,
                enteredBy,
                status: 'DRAFT',
              },
            });

            results.success++;
          }
        }
      } catch (error) {
        results.errors.push({ studentId: entry.studentId, error: error.message });
      }
    }

    return results;
  }

  // ==========================================
  // ENHANCED GRADE CALCULATION
  // ==========================================
  calculateGrade(marks, maxMarks, exam) {
    const percentage = (marks / maxMarks) * 100;

    if (exam?.boardType === 'CBSE') {
      if (percentage >= 91) return 'A1';
      if (percentage >= 81) return 'A2';
      if (percentage >= 71) return 'B1';
      if (percentage >= 61) return 'B2';
      if (percentage >= 51) return 'C1';
      if (percentage >= 41) return 'C2';
      if (percentage >= 33) return 'D';
      return 'E';
    }

    if (exam?.isCce) {
      if (percentage >= 91) return 'A+';
      if (percentage >= 81) return 'A';
      if (percentage >= 71) return 'B+';
      if (percentage >= 61) return 'B';
      if (percentage >= 51) return 'C+';
      if (percentage >= 41) return 'C';
      if (percentage >= 33) return 'D';
      return 'Need Improvement';
    }

    if (exam?.boardType === 'STATE_BOARD') {
      if (percentage >= 60) return 'First Division';
      if (percentage >= 45) return 'Second Division';
      if (percentage >= 33) return 'Third Division';
      return 'Fail';
    }

    if (percentage >= 91) return 'A1';
    if (percentage >= 81) return 'A2';
    if (percentage >= 71) return 'B1';
    if (percentage >= 61) return 'B2';
    if (percentage >= 51) return 'C1';
    if (percentage >= 41) return 'C2';
    if (percentage >= 33) return 'D';
    return 'E';
  }

  async calculateCBSEResult(studentId, examId) {
    const marks = await prisma.mark.findMany({
      where: { studentId, examId },
      include: { subject: true },
    });

    let totalObtained = 0, totalMax = 0, totalInternal = 0, totalExternal = 0;
    let failedSubjects = [], passedSubjects = [];

    for (const mark of marks) {
      const theoryMax = mark.maxMarks * 0.8;
      const internalMax = mark.maxMarks * 0.2;
      const theoryMarks = mark.marksObtained * 0.8;
      const internalMarks = mark.marksObtained * 0.2;

      totalObtained += mark.marksObtained || 0;
      totalMax += mark.maxMarks;
      totalInternal += internalMarks;
      totalExternal += theoryMarks;

      const theoryPct = theoryMarks / theoryMax * 100;
      const internalPct = internalMarks / internalMax * 100;

      if (theoryPct < 33 || internalPct < 33) {
        failedSubjects.push(mark.subject.name);
      } else {
        passedSubjects.push(mark.subject.name);
      }
    }

    const percentage = totalMax > 0 ? (totalObtained / totalMax * 100).toFixed(2) : 0;
    const overallGrade = this.calculateGrade(totalObtained, totalMax, { boardType: 'CBSE' });

    return {
      totalObtained,
      totalMax,
      percentage,
      overallGrade,
      failedSubjects,
      passedSubjects,
      result: failedSubjects.length === 0 ? 'PASS' : failedSubjects.length === 1 ? 'COMPARTMENT' : 'FAIL',
      internalMarks: totalInternal.toFixed(2),
      externalMarks: totalExternal.toFixed(2),
    };
  }

  async calculateCCEResult(studentId, examId) {
    const marks = await prisma.mark.findMany({
      where: { studentId, examId },
      include: { subject: true },
    });

    let totalWeighted = 0, totalMaxWeighted = 0;

    for (const mark of marks) {
      const weightage = mark.exam?.weightage || 100;
      const weightedMarks = (mark.marksObtained / mark.maxMarks) * weightage;
      totalWeighted += weightedMarks;
      totalMaxWeighted += weightage;
    }

    const percentage = totalMaxWeighted > 0 ? (totalWeighted / totalMaxWeighted * 100).toFixed(2) : 0;

    let grade;
    if (percentage >= 91) grade = 'A+';
    else if (percentage >= 81) grade = 'A';
    else if (percentage >= 71) grade = 'B+';
    else if (percentage >= 61) grade = 'B';
    else if (percentage >= 51) grade = 'C+';
    else if (percentage >= 41) grade = 'C';
    else if (percentage >= 33) grade = 'D';
    else grade = 'Need Improvement';

    return {
      totalWeighted: totalWeighted.toFixed(2),
      totalMaxWeighted,
      percentage,
      grade,
      result: 'PASS',
      noDetention: true,
    };
  }

  async calculateStateBoardResult(studentId, examId) {
    const marks = await prisma.mark.findMany({
      where: { studentId, examId },
      include: { subject: true },
    });

    let totalObtained = 0, totalMax = 0;
    let failedSubjects = [];

    for (const mark of marks) {
      totalObtained += mark.marksObtained || 0;
      totalMax += mark.maxMarks;

      if ((mark.marksObtained / mark.maxMarks * 100) < 33) {
        failedSubjects.push(mark.subject.name);
      }
    }

    const percentage = totalMax > 0 ? (totalObtained / totalMax * 100).toFixed(2) : 0;

    let division;
    if (percentage >= 60) division = 'First Division';
    else if (percentage >= 45) division = 'Second Division';
    else if (percentage >= 33) division = 'Third Division';
    else division = 'Fail';

    return {
      totalObtained,
      totalMax,
      percentage,
      division,
      failedSubjects,
      result: failedSubjects.length === 0 ? 'PASS' : failedSubjects.length === 1 ? 'COMPARTMENT' : 'FAIL',
    };
  }

  // ==========================================
  // COMPARTMENT MANAGEMENT
  // ==========================================
  async identifyCompartmentEligible(examId, classId) {
    const students = await prisma.student.findMany({
      where: { classId, status: 'ACTIVE' },
      include: { profile: true, section: true },
    });

    const eligible = [];

    for (const student of students) {
      const result = await this.calculateCBSEResult(student.id, examId);

      if (result.result === 'COMPARTMENT') {
        eligible.push({
          student,
          failedSubjects: result.failedSubjects,
          percentage: result.percentage,
        });
      }
    }

    return eligible;
  }

  async createCompartmentExam(data, schoolId) {
    const compartment = await prisma.compartmentExam.create({
      data: {
        schoolId,
        parentExamId: data.parentExamId,
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        feeAmount: data.feeAmount || 500,
      },
    });

    for (const entry of data.students) {
      await prisma.compartmentStudent.create({
        data: {
          compartmentId: compartment.id,
          studentId: entry.studentId,
          subjectId: entry.subjectId,
          originalMarks: entry.originalMarks,
        },
      });
    }

    return compartment;
  }

  // ==========================================
  // HALL TICKET GENERATION
  // ==========================================
  async generateHallTicket(studentId, examId, schoolId) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        profile: true,
        class: true,
        section: true,
        parents: { include: { parent: true } },
      },
    });

    if (!student) throw new AppError('Student not found', 404);

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        schedules: { include: { subject: true }, orderBy: { date: 'asc' } },
        class: true,
      },
    });

    if (!exam) throw new AppError('Exam not found', 404);

    const seating = await prisma.seatingArrangement.findFirst({
      where: { examId, studentId },
      include: { room: true },
    });

    const aadhar = student.profile?.aadharNumber || '';
    const maskedAadhar = aadhar.length > 4
      ? `XXXX-XXXX-${aadhar.slice(-4)}`
      : aadhar;

    return {
      student: {
        name: `${student.profile.firstName} ${student.profile.lastName}`,
        fatherName: student.parents?.[0]?.parent?.fatherName || '',
        class: student.class.name,
        section: student.section.name,
        rollNumber: student.rollNumber,
        admissionNumber: student.studentId,
        aadhar: maskedAadhar,
        photo: student.profile?.photoUrl,
      },
      exam: {
        name: exam.name,
        type: exam.type,
      },
      schedule: exam.schedules.map(s => ({
        date: s.date,
        day: s.dayOfWeek,
        subject: s.subject.name,
        time: `${s.startTime} - ${s.endTime}`,
        room: seating?.room?.roomNumber || s.roomNumber || 'TBA',
        seat: seating?.seatNumber || 'TBA',
      })),
      qrData: `${student.studentId}|${examId}`,
      instructions: [
        'Report 30 minutes before exam start time.',
        'Bring hall ticket and school ID card.',
        'No electronic devices allowed.',
        'Use only blue/black ballpoint pen.',
        'No extra sheets will be provided.',
        'Malpractice will result in disqualification.',
        'Leave only with permission from invigilator.',
        'Write roll number on answer book.',
        'Check question paper before starting.',
        'Follow all invigilator instructions.',
      ],
    };
  }

  async generateSeatingArrangement(examId, classId, schoolId) {
    const students = await prisma.student.findMany({
      where: { classId, status: 'ACTIVE' },
      include: { profile: true, section: true },
      orderBy: [{ section: { name: 'asc' } }, { rollNumber: 'asc' }],
    });

    const rooms = await prisma.examRoom.findMany({
      where: { schoolId },
      orderBy: { roomNumber: 'asc' },
    });

    if (rooms.length === 0) {
      throw new AppError('No exam rooms configured. Please add rooms first.', 400);
    }

    // Mix students from different sections
    const shuffled = [...students].sort(() => Math.random() - 0.5);

    const arrangements = [];
    let currentRoom = 0;
    let currentSeat = 0;
    let currentRow = 1;
    const seatsPerRow = 5;

    for (const student of shuffled) {
      const room = rooms[currentRoom];

      if (currentSeat >= room.capacity) {
        currentRoom++;
        if (currentRoom >= rooms.length) {
          throw new AppError('Not enough room capacity for all students', 400);
        }
        currentSeat = 0;
        currentRow = 1;
      }

      const seatNum = (currentRow - 1) * seatsPerRow + (currentSeat % seatsPerRow) + 1;

      const arrangement = await prisma.seatingArrangement.create({
        data: {
          examId,
          studentId: student.id,
          roomId: room.id,
          rowNumber: currentRow,
          seatNumber: seatNum,
        },
        include: { room: true },
      });

      arrangements.push(arrangement);

      currentSeat++;
      if (currentSeat % seatsPerRow === 0) currentRow++;
    }

    return {
      arrangements,
      rooms: rooms.map(r => ({
        ...r,
        assignedStudents: arrangements.filter(a => a.roomId === r.id).length,
      })),
    };
  }

  // ==========================================
  // MERIT LIST & CERTIFICATES
  // ==========================================
  async generateEnhancedMeritList(examId, classId) {
    const students = await prisma.student.findMany({
      where: { classId, status: 'ACTIVE' },
      include: { profile: true, section: true },
    });

    const results = [];

    for (const student of students) {
      try {
        const result = await this.calculateCBSEResult(student.id, examId);
        results.push({
          student: {
            id: student.id,
            studentId: student.studentId,
            name: `${student.profile.firstName} ${student.profile.lastName}`,
            rollNumber: student.rollNumber,
            section: student.section.name,
          },
          ...result,
        });
      } catch (e) {
        continue;
      }
    }

    results.sort((a, b) => {
      if (a.result === 'PASS' && b.result !== 'PASS') return -1;
      if (a.result !== 'PASS' && b.result === 'PASS') return 1;
      return parseFloat(b.percentage) - parseFloat(a.percentage);
    });

    results.forEach((r, index) => { r.rank = index + 1; });

    const schoolTopper = results[0] || null;
    const subjectToppers = {};

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { examSubjects: { include: { subject: true } } },
    });

    for (const es of exam?.examSubjects || []) {
      const subjectMarks = results
        .map(r => ({
          ...r,
          marks: r.marks?.find(m => m.subjectId === es.subjectId),
        }))
        .filter(r => r.marks)
        .sort((a, b) => b.marks.marksObtained - a.marks.marksObtained);

      if (subjectMarks.length > 0) {
        subjectToppers[es.subject.name] = subjectMarks[0];
      }
    }

    return {
      meritList: results,
      schoolTopper,
      subjectToppers,
      totalStudents: results.length,
    };
  }

  // ==========================================
  // RESULT ANALYTICS
  // ==========================================
  async getExamAnalytics(examId, classId) {
    const marks = await prisma.mark.findMany({
      where: { examId },
      include: {
        student: { include: { profile: true, class: true, section: true } },
        subject: true,
      },
    });

    const totalStudents = marks.length > 0 ? new Set(marks.map(m => m.studentId)).size : 0;
    let passCount = 0, failCount = 0, compartmentCount = 0;
    const subjectStats = {};
    const studentResults = {};

    for (const mark of marks) {
      if (!studentResults[mark.studentId]) {
        studentResults[mark.studentId] = {
          student: mark.student,
          totalObtained: 0,
          totalMax: 0,
          failedSubjects: [],
        };
      }

      studentResults[mark.studentId].totalObtained += mark.marksObtained || 0;
      studentResults[mark.studentId].totalMax += mark.maxMarks;

      if (!subjectStats[mark.subjectId]) {
        subjectStats[mark.subjectId] = {
          subject: mark.subject,
          totalMarks: 0,
          count: 0,
          passCount: 0,
          failCount: 0,
          maxMarks: mark.maxMarks,
        };
      }

      subjectStats[mark.subjectId].totalMarks += mark.marksObtained || 0;
      subjectStats[mark.subjectId].count++;

      if ((mark.marksObtained / mark.maxMarks * 100) >= 33) {
        subjectStats[mark.subjectId].passCount++;
      } else {
        subjectStats[mark.subjectId].failCount++;
        studentResults[mark.studentId].failedSubjects.push(mark.subject.name);
      }
    }

    const results = Object.values(studentResults).map(s => {
      const pct = s.totalMax > 0 ? (s.totalObtained / s.totalMax * 100) : 0;
      const failedCount = s.failedSubjects.length;

      if (failedCount === 0) passCount++;
      else if (failedCount === 1) compartmentCount++;
      else failCount++;

      return {
        ...s,
        percentage: pct.toFixed(2),
        result: failedCount === 0 ? 'PASS' : failedCount === 1 ? 'COMPARTMENT' : 'FAIL',
      };
    });

    results.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
    results.forEach((r, i) => { r.rank = i + 1; });

    const top10 = results.slice(0, 10);
    const bottom10 = results.slice(-10).reverse();

    const subjectAverages = Object.values(subjectStats).map(s => ({
      ...s,
      average: s.count > 0 ? (s.totalMarks / s.count).toFixed(2) : 0,
      passPercentage: s.count > 0 ? ((s.passCount / s.count) * 100).toFixed(2) : 0,
    }));

    return {
      summary: {
        totalStudents,
        passCount,
        failCount,
        compartmentCount,
        passPercentage: totalStudents > 0 ? ((passCount / totalStudents) * 100).toFixed(2) : 0,
      },
      subjectAverages,
      top10,
      bottom10,
      fullResults: results,
    };
  }

  // ==========================================
  // AI REMARKS GENERATION
  // ==========================================
  async generateSmartRemarks(marks, attendance, studentName) {
    const subjectRemarks = [];

    for (const mark of marks) {
      const pct = (mark.marksObtained / mark.maxMarks) * 100;
      let remark;

      if (pct >= 90) {
        remark = {
          english: `Excellent performance in ${mark.subject.name}. Outstanding analytical and problem-solving skills.`,
          hindi: `${mark.subject.name} mein uttam pradarshan. Vishleshan aur samasya samadhan kushalta uchch star ki hai.`,
        };
      } else if (pct >= 75) {
        remark = {
          english: `Very good performance in ${mark.subject.name}. Shows strong understanding with minor areas for improvement.`,
          hindi: `${mark.subject.name} mein bahut achha pradarshan. Thodi aur mehnat se aur behtar kar sakte hain.`,
        };
      } else if (pct >= 60) {
        remark = {
          english: `Good performance in ${mark.subject.name}. Regular practice will help improve further.`,
          hindi: `${mark.subject.name} mein achha pradarshan. Niyamit abhyas se aur sudhar hoga.`,
        };
      } else if (pct >= 33) {
        remark = {
          english: `Satisfactory in ${mark.subject.name}. Needs focused effort on weak areas.`,
          hindi: `${mark.subject.name} mein aur mehnat ki zaroorat hai. Kamzor vishayon par dhyan den.`,
        };
      } else {
        remark = {
          english: `Needs significant improvement in ${mark.subject.name}. Extra classes and regular practice recommended.`,
          hindi: `${mark.subject.name} mein kaphi sudhar ki zaroorat hai. Extra classes aur niyamit abhyas ki salah di jaati hai.`,
        };
      }

      subjectRemarks.push({ subject: mark.subject.name, marks: mark.marksObtained, maxMarks: mark.maxMarks, ...remark });
    }

    const totalPct = marks.reduce((s, m) => s + (m.marksObtained / m.maxMarks * 100), 0) / marks.length;

    let overallRemark;
    if (totalPct >= 90) {
      overallRemark = {
        english: `An outstanding student! ${studentName} has demonstrated exceptional academic performance. Keep up the excellent work!`,
        hindi: `${studentName} ne uttam shikshak pradarshan dikhaya hai. Aise hi mehnat karte rahein!`,
      };
    } else if (totalPct >= 75) {
      overallRemark = {
        english: `${studentName} is a diligent student with consistent performance. With a bit more focus, can achieve excellence.`,
        hindi: `${studentName} ek mehnati vidyarthi hain. Thode aur dhyan se uttam prapti kar sakte hain.`,
      };
    } else if (totalPct >= 60) {
      overallRemark = {
        english: `${studentName} shows good potential. Regular study habits and extra practice will lead to better results.`,
        hindi: `${studentName} mein achhi kshamata hai. Niyamit padhai se behtar parinaam milenge.`,
      };
    } else {
      overallRemark = {
        english: `${studentName} needs to work harder. Parents and teachers should collaborate to improve academic performance.`,
        hindi: `${studentName} ko aur mehnat karne ki zaroorat hai. Mata-pita aur shikshak milkar pradarshan sudhar sakte hain.`,
      };
    }

    return { subjectRemarks, overallRemark, totalPercentage: totalPct.toFixed(2) };
  }

  // ==========================================
  // RECHECK APPLICATION
  // ==========================================
  async applyForRecheck(data, schoolId) {
    const { studentId, examId, subjectId, reason, feeAmount } = data;

    const application = await prisma.recheckApplication.create({
      data: {
        schoolId,
        studentId,
        examId,
        subjectId,
        reason,
        feeAmount: feeAmount || 500,
      },
      include: { student: { include: { profile: true } }, exam: true },
    });

    return application;
  }
}

module.exports = new ExamEnhancedService();
