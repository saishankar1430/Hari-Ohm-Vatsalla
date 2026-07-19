import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, Phone, User, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{7,15}$/, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

function getFriendlyAuthErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const errorWithCode = err as { code?: string; message?: string };
    if (errorWithCode.code) {
      switch (errorWithCode.code) {
        case "auth/email-already-in-use":
          return "This email address is already registered. Please sign in instead.";
        case "auth/weak-password":
          return "The password is too weak. It must be at least 6 characters.";
        case "auth/invalid-email":
          return "The email address is invalid.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          return "Incorrect email or password. Please try again.";
        case "auth/too-many-requests":
          return "Too many unsuccessful attempts. Please try again later.";
        case "auth/popup-closed-by-user":
          return "The login popup was closed. Please try again.";
        case "auth/cancelled-popup-request":
          return "Only one login popup can be opened at a time.";
        default:
          break;
      }
    }
    return errorWithCode.message || "An authentication error occurred.";
  }
  return err instanceof Error ? err.message : "An unexpected error occurred.";
}

export function LoginDialog({ isOpen, onClose, defaultTab = "login" }: LoginDialogProps) {
  const { login, registerPatient } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", phone: "", email: "", password: "" },
  });

  async function onLoginSubmit(data: z.infer<typeof loginSchema>) {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      onClose();
    } catch (err: unknown) {
      console.warn(err);
      toast.error(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onSignupSubmit(data: z.infer<typeof signupSchema>) {
    setLoading(true);
    try {
      await registerPatient(data.email, data.password, data.name, data.phone);
      toast.success("Account created successfully!");
      onClose();
    } catch (err: unknown) {
      console.warn(err);
      toast.error(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl border border-border bg-card p-6 md:p-8 shadow-card">
        <DialogHeader className="text-center">
          <DialogTitle className="font-display text-2xl font-bold tracking-tight">
            {tab === "login" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {tab === "login"
              ? "Sign in to manage your appointments and profile."
              : "Register to book appointments faster and track history."}
          </DialogDescription>
        </DialogHeader>

        {/* Custom Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-surface rounded-full p-1 border border-border mt-4">
          <button
            onClick={() => setTab("login")}
            className={`rounded-full py-2 text-xs font-semibold tracking-wide transition-all ${
              tab === "login"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`rounded-full py-2 text-xs font-semibold tracking-wide transition-all ${
              tab === "signup"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="name@example.com"
                  className="pl-9"
                  type="email"
                  {...loginForm.register("email")}
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  {...loginForm.register("password")}
                />
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full h-11 bg-primary hover:bg-primary/90 mt-2 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in…
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-3 mt-6">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Jane Doe" className="pl-9" {...signupForm.register("name")} />
              </div>
              {signupForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {signupForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  inputMode="tel"
                  placeholder="+91 98765 43210"
                  className="pl-9"
                  {...signupForm.register("phone")}
                />
              </div>
              {signupForm.formState.errors.phone && (
                <p className="text-xs text-destructive">
                  {signupForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="name@example.com"
                  className="pl-9"
                  type="email"
                  {...signupForm.register("email")}
                />
              </div>
              {signupForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {signupForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  {...signupForm.register("password")}
                />
              </div>
              {signupForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {signupForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full h-11 bg-primary hover:bg-primary/90 mt-2 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering…
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Create Account
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
