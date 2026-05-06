export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "Student" | "Teacher" | "Admin";
}

export interface Project {
    id: string;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    teacherId: string;
    status: "Active" | "ReadyForGrade" | "Completed" | "Archived"
}

export interface Stage {
    id: string;
    title: string;
    description?: string;
    stageOrder: number;
    softDeadline?: string;
    hardDeadline?: string;
    parentStageId?: string;
    status: "Active" | "SoftDeadlinePassed" | "Closed" | "Graded";
}

export interface FileAttachment {
    id: string;
    stageResultId: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
}

export interface StageResult {
    id: string;
    stageId: string;
    studentId: string;
    contentText?: string;
    status: "Submitted" | "Returned" | "Graded";
    feedback?: string;
    isLate: boolean;
    isEdited: boolean;
    editedAfterDeadline: boolean;
    submittedAt?: string;
    fileAttachments?: FileAttachment[];
    student?: { id: string; firstName: string; lastName: string; email: string };
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

export interface Notification {
    id: string;
    userId: string;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    referenceId?: string;
    referenceType?: string;
}

export interface StageMaterial {
    id: string;
    stageId: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
}

export interface Grade {
    id: string;
    stageResultId: string;
    score: number;
    feedback?: string;
    gradedAt: string;
    maxScore: number;
    gradedById: string;
}

