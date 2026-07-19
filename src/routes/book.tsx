import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, CheckCircle2, Loader2, Sparkles, LogIn } from "lucide-react";
import { toast } from "sonner";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FloatingActions } from "@/components/site/FloatingActions";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { createAppointment, getBookedSlotsForDate } from "@/lib/db-service";
import { LoginDialog } from "@/components/site/LoginDialog";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{7,15}$/, "Please enter a valid phone number"),
  email: z.string().email("Invalid email").or(z.literal("")),
  age: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, "Enter a valid age")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["female", "male", "other", ""]).optional(),
  date: z.string().min(1, "Choose a date"),
  slot: z.string().min(1, "Choose a time slot"),
  reason: z.string().trim().min(3, "Tell us the reason for visit").max(300),
  notes: z.string().max(500).optional(),
});
type FormData = z.infer<typeof schema>;

const SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
];

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book an Appointment — Dr. Kalhyanie Dental Clinic" },
      {
        name: "description",
        content: "Book your dental appointment in under a minute. Pick a slot that works for you.",
      },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile?.name || "",
      phone: profile?.phone || "",
      email: profile?.email || user?.email || "",
      date: today,
      gender: "",
      slot: "",
    },
  });

  const selectedDate = watch("date");

  // Autofill if logged in
  useEffect(() => {
    if (profile) {
      setValue("name", profile.name);
      setValue("phone", profile.phone);
      setValue("email", profile.email || user?.email || "");
    }
  }, [profile, user, setValue]);

  // Load booked slots dynamically when date changes
  useEffect(() => {
    async function loadBookedSlots() {
      if (!selectedDate) return;
      try {
        const booked = await getBookedSlotsForDate(selectedDate);
        setBookedSlots(booked);
      } catch (err) {
        console.error("Failed to load booked slots:", err);
      }
    }
    loadBookedSlots();
  }, [selectedDate]);

  async function onSubmit(data: FormData) {
    let patientId = user?.uid;
    const finalEmail = data.email || `${data.phone.replace(/[^0-9]/g, "")}@kalhyaniedental.com`;

    if (!patientId) {
      // Auto-create an account
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, finalEmail, data.phone);
        patientId = userCredential.user.uid;

        const isDoctorEmail = finalEmail === "shubhuusinha777@gmail.com";
        const newProfile = {
          uid: patientId,
          email: finalEmail,
          name: data.name,
          phone: data.phone,
          role: isDoctorEmail ? ("admin" as const) : ("patient" as const),
          createdAt: new Date().toISOString(),
        };

        try {
          const setDocPromise = setDoc(doc(db, "users", patientId), newProfile);
          const setDocTimeout = new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 1500),
          );
          await Promise.race([setDocPromise, setDocTimeout]);
        } catch (writeErr) {
          console.warn("Could not write auto-created profile (offline/slow):", writeErr);
        }
        toast.success("Account auto-created! Use your email and phone number to log in.");
      } catch (err: unknown) {
        console.log("User might already exist in auth or signup failed:", err);
        // Standard user association if exists, or guest fallback
        patientId = "guest_" + Date.now();
      }
    }

    try {
      await createAppointment({
        patientId: patientId || "guest",
        patientName: data.name,
        patientEmail: finalEmail,
        patientPhone: data.phone,
        patientAge: data.age,
        patientGender: data.gender,
        date: data.date,
        slot: data.slot,
        reason: data.reason,
        notes: data.notes,
        status: "Pending",
      });

      setSubmitted(true);
      toast.success("Appointment request submitted successfully!");
    } catch (err: unknown) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to book appointment. Please try again.",
      );
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface grid place-items-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full rounded-3xl border border-border bg-card p-8 md:p-10 shadow-card text-center"
        >
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-blue-600/10 text-blue-600">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="mt-6 font-display text-2xl md:text-3xl font-bold">You're all set!</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            We've received your appointment request. You'll get a WhatsApp/Email confirmation once
            the clinic approves it — usually within a few minutes.
          </p>
          <Button className="mt-8 rounded-full w-full" onClick={() => navigate({ to: "/" })}>
            Back to home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="container-page py-8 md:py-12">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          {!user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLoginOpen(true)}
              className="rounded-full flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="size-4" /> Already have an account? Log In
            </Button>
          )}
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-5">
          <aside className="lg:col-span-2">
            <div className="sticky top-24 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-soft">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="size-5" strokeWidth={2.5} />
              </span>
              <h1 className="mt-5 font-display text-3xl md:text-4xl font-bold tracking-tight">
                Book your visit
              </h1>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                It takes less than a minute. Account is automatically created — we'll send a
                WhatsApp/Email confirmation as soon as the clinic approves your slot.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "No advanced payment required",
                  "Pay at the clinic",
                  "Free reschedule until approved",
                  "WhatsApp / Email reminders",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-foreground/85">
                    <CheckCircle2 className="size-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="relative overflow-hidden lg:col-span-3 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-soft"
          >
            <AnimatePresence>
              {isSubmitting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-50"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="max-w-xs flex flex-col items-center"
                  >
                    <div className="relative mb-6">
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                      <Loader2 className="size-12 animate-spin text-primary relative z-10" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Securing your appointment...
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Please wait while we verify slot availability and reserve your appointment.
                    </p>

                    <div className="mt-8 space-y-3.5 w-full text-left">
                      <BookingStep label="Checking profile registration" delay={0.1} />
                      <BookingStep label="Reserving requested time slot" delay={1.4} />
                      <BookingStep label="Creating appointment request" delay={2.7} />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" error={errors.name?.message} className="sm:col-span-2">
                <Input placeholder="Jane Doe" {...register("name")} />
              </Field>
              <Field label="Phone number" error={errors.phone?.message}>
                <Input inputMode="tel" placeholder="+91 98765 43210" {...register("phone")} />
              </Field>
              <Field label="Email (optional)" error={errors.email?.message}>
                <Input type="email" placeholder="you@example.com" {...register("email")} />
              </Field>
              <Field label="Age (optional)" error={errors.age?.message}>
                <Input inputMode="numeric" placeholder="30" {...register("age")} />
              </Field>
              <Field label="Gender (optional)">
                <select
                  {...register("gender")}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field label="Preferred date" error={errors.date?.message}>
                <Input type="date" min={today} {...register("date")} />
              </Field>
              <Field label="Payment method">
                <div className="h-10 flex items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                  Pay at clinic
                </div>
              </Field>

              <div className="sm:col-span-2">
                <Label className="text-sm font-medium text-foreground/85">
                  Preferred time slot
                </Label>
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {SLOTS.map((s) => {
                    const booked = bookedSlots.includes(s);
                    const active = selectedSlot === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={booked}
                        onClick={() => {
                          setSelectedSlot(s);
                          setValue("slot", s, { shouldValidate: true });
                        }}
                        className={`h-10 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                          booked
                            ? "border-border bg-muted text-muted-foreground/60 line-through cursor-not-allowed"
                            : active
                              ? "border-primary bg-primary text-primary-foreground shadow-soft"
                              : "border-border bg-background hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {errors.slot?.message && (
                  <p className="mt-2 text-xs text-destructive">{errors.slot.message}</p>
                )}
              </div>

              <Field
                label="Reason for visit"
                error={errors.reason?.message}
                className="sm:col-span-2"
              >
                <Input
                  placeholder="e.g., Toothache, cleaning, consultation"
                  {...register("reason")}
                />
              </Field>
              <Field label="Notes (optional)" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  placeholder="Anything the doctor should know"
                  {...register("notes")}
                />
              </Field>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="mt-8 w-full rounded-full h-12 text-base bg-primary hover:bg-primary/90 shadow-soft cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Calendar className="size-4" /> Confirm appointment
                </>
              )}
            </Button>
            <p className="mt-3 text-xs text-center text-muted-foreground">
              By submitting, you agree to receive WhatsApp/Email updates about your appointment.
            </p>
          </form>
        </div>
      </div>
      <FloatingActions />
      <LoginDialog isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label className="text-sm font-medium text-foreground/85">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function BookingStep({ label, delay }: { label: string; delay: number }) {
  const [status, setStatus] = useState<"pending" | "loading" | "done">("pending");

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setStatus("loading");
    }, delay * 1000);

    const doneTimer = setTimeout(
      () => {
        setStatus("done");
      },
      (delay + 1.2) * 1000,
    );

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(doneTimer);
    };
  }, [delay]);

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full">
        {status === "pending" && (
          <div className="size-2 rounded-full bg-muted-foreground/30 animate-pulse" />
        )}
        {status === "loading" && <Loader2 className="size-3.5 animate-spin text-primary" />}
        {status === "done" && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex size-5 items-center justify-center rounded-full bg-blue-600/10 text-blue-600"
          >
            <CheckCircle2 className="size-3.5 text-blue-600" />
          </motion.div>
        )}
      </div>
      <span
        className={`transition-colors duration-300 ${
          status === "done"
            ? "text-foreground font-medium"
            : status === "loading"
              ? "text-foreground font-medium"
              : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
