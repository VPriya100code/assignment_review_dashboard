import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, Assignment, Submission, Role, Notification, StreakData } from "@/types";

interface AppState {
  currentUser: User | null;
  users: User[];
  assignments: Assignment[];
  submissions: Submission[];
  notifications: Notification[];
  streak: StreakData;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string, role: Role) => boolean;
  logout: () => void;
  addAssignment: (a: Omit<Assignment, "id" | "createdAt" | "createdBy">) => void;
  deleteAssignment: (id: string) => void;
  submitAssignment: (assignmentId: string) => void;
  getStudentSubmissions: (studentId: string) => Submission[];
  getAssignmentSubmissions: (assignmentId: string) => Submission[];
  reorderAssignments: (startIndex: number, endIndex: number) => void;
  dismissNotification: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
}

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = "assignTrack";
const USERS_KEY = "assignTrack_users";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  password: string;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(data: Record<string, unknown>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function calculateStreak(submissions: Submission[], studentId: string): StreakData {
  const submitted = submissions
    .filter((s) => s.submitted && s.studentId === studentId && s.submittedAt)
    .map((s) => s.submittedAt!.split("T")[0])
    .sort();

  const uniqueDates = [...new Set(submitted)];
  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastSubmissionDate: null, streakDates: [] };
  }

  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Check if the last submission is recent (within 1 day)
  const lastDate = uniqueDates[uniqueDates.length - 1];
  const today = new Date().toISOString().split("T")[0];
  const daysSinceLast = (new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceLast <= 1) {
    // Count backwards from the end
    currentStreak = 1;
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const curr = new Date(uniqueDates[i + 1]);
      const prev = new Date(uniqueDates[i]);
      if ((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24) <= 1) {
        currentStreak++;
      } else break;
    }
  } else {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak,
    lastSubmissionDate: lastDate,
    streakDates: uniqueDates,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const saved = loadState();

  const [currentUser, setCurrentUser] = useState<User | null>(saved?.currentUser || null);
  const [assignments, setAssignments] = useState<Assignment[]>(saved?.assignments || []);
  const [submissions, setSubmissions] = useState<Submission[]>(saved?.submissions || []);
  const [notifications, setNotifications] = useState<Notification[]>(saved?.notifications || []);

  useEffect(() => {
    saveState({
      currentUser,
      assignments,
      submissions,
      notifications,
    });
  }, [currentUser, assignments, submissions, notifications]);

  // Generate deadline notifications
  useEffect(() => {
    if (!currentUser || currentUser.role !== "student") return;
    const now = new Date();
    assignments.forEach((a) => {
      const due = new Date(a.dueDate);
      const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
      const sub = submissions.find(
        (s) => s.assignmentId === a.id && s.studentId === currentUser.id
      );
      if (!sub?.submitted && hoursLeft > 0 && hoursLeft < 48) {
        const exists = notifications.some(
          (n) => n.type === "deadline" && n.message.includes(a.id)
        );
        if (!exists) {
          const newNotif: Notification = {
            id: crypto.randomUUID(),
            title: "Deadline Approaching",
            message: `"${a.title}" is due in ${Math.round(hoursLeft)} hours. [${a.id}]`,
            type: "deadline",
            read: false,
            createdAt: new Date().toISOString(),
          };
          setNotifications((prev) => [newNotif, ...prev]);
        }
      }
    });
  }, [currentUser, assignments, submissions]);

  const streak = currentUser?.role === "student"
    ? calculateStreak(submissions, currentUser.id)
    : { currentStreak: 0, longestStreak: 0, lastSubmissionDate: null, streakDates: [] };

  const register = useCallback((name: string, email: string, password: string, role: Role): boolean => {
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return false;
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      password,
    };
    users.push(newUser);
    saveUsers(users);
    const user: User = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    setCurrentUser(user);
    return true;
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const users = loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return false;
    const user: User = { id: found.id, name: found.name, email: found.email, role: found.role };
    setCurrentUser(user);
    return true;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setNotifications([]);
  }, []);

  const addNotification = useCallback((n: Omit<Notification, "id" | "read" | "createdAt">) => {
    const notif: Notification = {
      ...n,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const addAssignment = useCallback((a: Omit<Assignment, "id" | "createdAt" | "createdBy">) => {
    if (!currentUser) return;
    const newAssignment: Assignment = {
      ...a,
      id: crypto.randomUUID(),
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      order: assignments.length,
    };
    setAssignments((prev) => [...prev, newAssignment]);
    // Create submissions for all registered students
    const users = loadUsers();
    const students = users.filter((u) => u.role === "student");
    const newSubs: Submission[] = students.map((s) => ({
      assignmentId: newAssignment.id,
      studentId: s.id,
      submitted: false,
    }));
    setSubmissions((prev) => [...prev, ...newSubs]);
    addNotification({
      title: "Assignment Created",
      message: `"${newAssignment.title}" has been created.`,
      type: "success",
    });
  }, [currentUser, assignments.length, addNotification]);

  const deleteAssignment = useCallback((id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setSubmissions((prev) => prev.filter((s) => s.assignmentId !== id));
  }, []);

  const submitAssignment = useCallback((assignmentId: string) => {
    if (!currentUser) return;
    setSubmissions((prev) =>
      prev.map((s) =>
        s.assignmentId === assignmentId && s.studentId === currentUser.id
          ? { ...s, submitted: true, submittedAt: new Date().toISOString() }
          : s
      )
    );
    addNotification({
      title: "Submission Recorded",
      message: `Your submission has been recorded successfully.`,
      type: "success",
    });
  }, [currentUser, addNotification]);

  const getStudentSubmissions = useCallback(
    (studentId: string) => submissions.filter((s) => s.studentId === studentId),
    [submissions]
  );

  const getAssignmentSubmissions = useCallback(
    (assignmentId: string) => submissions.filter((s) => s.assignmentId === assignmentId),
    [submissions]
  );

  const reorderAssignments = useCallback((startIndex: number, endIndex: number) => {
    setAssignments((prev) => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((a, i) => ({ ...a, order: i }));
    });
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users: loadUsers().map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })),
        assignments,
        submissions,
        notifications,
        streak,
        login,
        register,
        logout,
        addAssignment,
        deleteAssignment,
        submitAssignment,
        getStudentSubmissions,
        getAssignmentSubmissions,
        reorderAssignments,
        dismissNotification,
        markAllNotificationsRead,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
