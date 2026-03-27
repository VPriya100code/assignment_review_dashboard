import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpenCheck, GraduationCap, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login, register } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as "student" | "admin",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (!form.name || !form.email || !form.password) {
        toast.error("Please fill all fields");
        return;
      }
      if (form.password.length < 4) {
        toast.error("Password must be at least 4 characters");
        return;
      }
      const ok = register(form.name, form.email, form.password, form.role);
      if (!ok) {
        toast.error("An account with this email already exists");
      } else {
        toast.success("Account created successfully!");
      }
    } else {
      if (!form.email || !form.password) {
        toast.error("Please fill all fields");
        return;
      }
      const ok = login(form.email, form.password);
      if (!ok) {
        toast.error("Invalid email or password");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpenCheck className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AssignTrack</h1>
          <p className="text-muted-foreground text-sm">
            {isRegister ? "Create your account to get started" : "Sign in to your account"}
          </p>
        </div>

        {/* Form */}
        <div className="glass-card rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="space-y-2">
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "student" })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      form.role === "student"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <GraduationCap className="h-5 w-5" />
                    <span className="font-medium text-sm">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "admin" })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      form.role === "admin"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    <span className="font-medium text-sm">Professor</span>
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full">
              {isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isRegister
                ? "Already have an account? Sign in"
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
