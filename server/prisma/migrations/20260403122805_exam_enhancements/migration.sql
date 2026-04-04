-- CreateTable
CREATE TABLE "ExamSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "roomNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExamSchedule_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SeatingArrangement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "seatNumber" INTEGER NOT NULL,
    "invigilatorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SeatingArrangement_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SeatingArrangement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SeatingArrangement_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ExamRoom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExamRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "floor" TEXT,
    "building" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InvigilatorDuty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "shift" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InvigilatorDuty_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InvigilatorDuty_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ExamRoom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnswerBook" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "examId" TEXT,
    "studentId" TEXT,
    "subjectId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNUSED',
    "distributedAt" DATETIME,
    "collectedAt" DATETIME,
    "checkedBy" TEXT,
    "checkedAt" DATETIME,
    "marksEntered" BOOLEAN NOT NULL DEFAULT false,
    "returnedToOffice" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnswerBook_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarkVerificationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "markId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "reason" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CompartmentExam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "parentExamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "feeAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CompartmentStudent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "compartmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "originalMarks" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "newMarks" REAL,
    "newGrade" TEXT,
    "feePaid" BOOLEAN NOT NULL DEFAULT false,
    "feePaymentId" TEXT,
    "noticeSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompartmentStudent_compartmentId_fkey" FOREIGN KEY ("compartmentId") REFERENCES "CompartmentExam" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeritCertificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "certificateType" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "pdfUrl" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeritCertificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MeritCertificate_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentHealthRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "height" REAL,
    "weight" REAL,
    "bloodGroup" TEXT,
    "vision" TEXT,
    "dental" TEXT,
    "generalHealth" TEXT,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentHealthRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecheckApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "feeAmount" REAL NOT NULL,
    "feePaid" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "processedBy" TEXT,
    "newMarks" REAL,
    "remarks" TEXT,
    CONSTRAINT "RecheckApplication_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecheckApplication_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "maxMarks" INTEGER NOT NULL DEFAULT 100,
    "passMarks" INTEGER NOT NULL DEFAULT 33,
    "weightage" REAL NOT NULL DEFAULT 100,
    "isCce" BOOLEAN NOT NULL DEFAULT false,
    "scholastic" BOOLEAN NOT NULL DEFAULT true,
    "coScholastic" BOOLEAN NOT NULL DEFAULT false,
    "resultsPublished" BOOLEAN NOT NULL DEFAULT false,
    "boardType" TEXT,
    "graceMarks" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Exam_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exam_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Exam" ("academicYearId", "classId", "coScholastic", "createdAt", "endDate", "id", "isCce", "maxMarks", "name", "passMarks", "resultsPublished", "scholastic", "schoolId", "startDate", "type", "updatedAt", "weightage") SELECT "academicYearId", "classId", "coScholastic", "createdAt", "endDate", "id", "isCce", "maxMarks", "name", "passMarks", "resultsPublished", "scholastic", "schoolId", "startDate", "type", "updatedAt", "weightage" FROM "Exam";
DROP TABLE "Exam";
ALTER TABLE "new_Exam" RENAME TO "Exam";
CREATE INDEX "Exam_schoolId_academicYearId_classId_idx" ON "Exam"("schoolId", "academicYearId", "classId");
CREATE TABLE "new_Mark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "marksObtained" REAL,
    "maxMarks" INTEGER NOT NULL,
    "grade" TEXT,
    "remarks" TEXT,
    "enteredBy" TEXT NOT NULL,
    "enteredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "theoryMarks" REAL,
    "practicalMarks" REAL,
    "internalMarks" REAL,
    "isAbsent" BOOLEAN NOT NULL DEFAULT false,
    "isExempted" BOOLEAN NOT NULL DEFAULT false,
    "medicalLeave" BOOLEAN NOT NULL DEFAULT false,
    "coscholasticGrade" TEXT,
    "coscholasticSports" TEXT,
    "coscholasticArt" TEXT,
    "coscholasticDiscipline" TEXT,
    "teacherRemarks" TEXT,
    "previousMarks" REAL,
    "verificationLevel" INTEGER NOT NULL DEFAULT 0,
    "verifiedByHod" TEXT,
    "verifiedByHodAt" DATETIME,
    "hodRemarks" TEXT,
    "approvedByPrincipal" TEXT,
    "approvedByPrincipalAt" DATETIME,
    "principalRemarks" TEXT,
    "recheckRequested" BOOLEAN NOT NULL DEFAULT false,
    "recheckReason" TEXT,
    "recheckFeePaid" BOOLEAN NOT NULL DEFAULT false,
    "recheckFeeAmount" REAL,
    "answerBookBarcode" TEXT,
    "answerBookStatus" TEXT,
    "checkedBy" TEXT,
    "checkedAt" DATETIME,
    "returnedToOffice" BOOLEAN NOT NULL DEFAULT false,
    "blindEvaluation" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Mark_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mark_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mark_enteredBy_fkey" FOREIGN KEY ("enteredBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Mark" ("enteredAt", "enteredBy", "examId", "grade", "id", "marksObtained", "maxMarks", "remarks", "studentId", "subjectId", "updatedAt") SELECT "enteredAt", "enteredBy", "examId", "grade", "id", "marksObtained", "maxMarks", "remarks", "studentId", "subjectId", "updatedAt" FROM "Mark";
DROP TABLE "Mark";
ALTER TABLE "new_Mark" RENAME TO "Mark";
CREATE INDEX "Mark_studentId_idx" ON "Mark"("studentId");
CREATE INDEX "Mark_examId_idx" ON "Mark"("examId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ExamSchedule_examId_idx" ON "ExamSchedule"("examId");

-- CreateIndex
CREATE INDEX "ExamSchedule_date_idx" ON "ExamSchedule"("date");

-- CreateIndex
CREATE INDEX "SeatingArrangement_examId_roomId_idx" ON "SeatingArrangement"("examId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatingArrangement_examId_studentId_key" ON "SeatingArrangement"("examId", "studentId");

-- CreateIndex
CREATE INDEX "ExamRoom_schoolId_idx" ON "ExamRoom"("schoolId");

-- CreateIndex
CREATE INDEX "InvigilatorDuty_examId_teacherId_idx" ON "InvigilatorDuty"("examId", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "AnswerBook_barcode_key" ON "AnswerBook"("barcode");

-- CreateIndex
CREATE INDEX "AnswerBook_schoolId_status_idx" ON "AnswerBook"("schoolId", "status");

-- CreateIndex
CREATE INDEX "AnswerBook_barcode_idx" ON "AnswerBook"("barcode");

-- CreateIndex
CREATE INDEX "MarkVerificationLog_markId_idx" ON "MarkVerificationLog"("markId");

-- CreateIndex
CREATE INDEX "MarkVerificationLog_performedBy_idx" ON "MarkVerificationLog"("performedBy");

-- CreateIndex
CREATE INDEX "CompartmentExam_schoolId_idx" ON "CompartmentExam"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "CompartmentStudent_compartmentId_studentId_subjectId_key" ON "CompartmentStudent"("compartmentId", "studentId", "subjectId");

-- CreateIndex
CREATE INDEX "MeritCertificate_schoolId_idx" ON "MeritCertificate"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "MeritCertificate_studentId_examId_certificateType_key" ON "MeritCertificate"("studentId", "examId", "certificateType");

-- CreateIndex
CREATE UNIQUE INDEX "StudentHealthRecord_studentId_academicYear_key" ON "StudentHealthRecord"("studentId", "academicYear");

-- CreateIndex
CREATE INDEX "RecheckApplication_schoolId_status_idx" ON "RecheckApplication"("schoolId", "status");

-- CreateIndex
CREATE INDEX "RecheckApplication_studentId_idx" ON "RecheckApplication"("studentId");
