export type Role = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  course: string;
  dueDate: string;
  driveLink?: string;
  createdBy: string;
  createdAt: string;
  order?: number;
}

export interface Submission {
  assignmentId: string;
  studentId: string;
  submitted: boolean;
  submittedAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "deadline";
  read: boolean;
  createdAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSubmissionDate: string | null;
  streakDates: string[];
}
