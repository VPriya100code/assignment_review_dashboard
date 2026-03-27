import { useApp } from "@/context/AppContext";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { BookOpenCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Login from "@/pages/Login";

const Index = () => {
  const { currentUser, logout } = useApp();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <BookOpenCheck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">AssignTrack</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {currentUser.name}
            </span>
            <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded font-medium uppercase hidden sm:block">
              {currentUser.role === "admin" ? "Professor" : "Student"}
            </span>
            <NotificationBell />
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-3xl">
        {currentUser.role === "student" ? <StudentDashboard /> : <AdminDashboard />}
      </main>
    </div>
  );
};

export default Index;
