import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  LogOut,
  ChevronRight,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock4,
  Edit2,
  Trash2,
  Star,
  MessageSquare,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { useAuth, UserProfile } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  getPatientAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  submitReview,
  Appointment,
} from "@/lib/db-service";

export const Route = createFileRoute("/dashboard")({
  component: PatientDashboardPage,
});

const profileSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || /^[+\d][\d\s-]{5,18}$/.test(val),
      "Please enter a valid phone number (at least 5 digits, e.g., +91 98765 43210)",
    ),
});

const reviewSchema = z.object({
  stars: z.number().min(1).max(5),
  body: z.string().trim().min(5, "Review must be at least 5 characters").max(500),
});

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

function PatientDashboardPage() {
  const { user, profile, loading: authLoading, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [activeTab, setActiveTab] = useState<"appointments" | "profile">("appointments");

  // Dialog State
  const [reviewApp, setReviewApp] = useState<Appointment | null>(null);
  const [rescheduleApp, setRescheduleApp] = useState<Appointment | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSaving },
    reset: resetProfile,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile?.name || "", phone: profile?.phone || "" },
  });

  const [newDate, setNewDate] = useState("");
  const [newSlot, setNewSlot] = useState("");

  const {
    register: regReview,
    handleSubmit: handleReviewSubmit,
    setValue: setReviewValue,
    watch: watchReview,
    formState: { errors: reviewErrors, isSubmitting: isReviewSubmitting },
    reset: resetReview,
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { stars: 5, body: "" },
  });

  const selectedStars = watchReview("stars");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      resetProfile({ name: profile.name, phone: profile.phone || "" });
    }
  }, [profile, resetProfile]);

  useEffect(() => {
    async function loadAppointments() {
      if (!user) return;
      try {
        const apps = await getPatientAppointments(user.uid);
        setAppointments(apps);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      } finally {
        setLoadingApps(false);
      }
    }
    loadAppointments();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground font-medium">Checking auth state…</p>
      </div>
    );
  }

  const onProfileSave = async (data: { name: string; phone: string }) => {
    try {
      await updateProfile(data);
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  const handleCancelApp = async (app: Appointment) => {
    if (!app.id) return;
    if (confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await updateAppointmentStatus(app.id, "Cancelled", app.date, app.slot);
        toast.success("Appointment cancelled successfully.");
        // refresh
        const updated = await getPatientAppointments(user.uid);
        setAppointments(updated);
      } catch (err) {
        toast.error("Failed to cancel appointment.");
      }
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleApp || !rescheduleApp.id || !newDate || !newSlot) {
      toast.error("Please pick both a date and a slot.");
      return;
    }

    try {
      await rescheduleAppointment(
        rescheduleApp.id,
        rescheduleApp.date,
        rescheduleApp.slot,
        newDate,
        newSlot,
      );
      toast.success("Rescheduled successfully!");
      setRescheduleApp(null);
      setNewDate("");
      setNewSlot("");
      // refresh
      const updated = await getPatientAppointments(user.uid);
      setAppointments(updated);
    } catch (err) {
      toast.error("Failed to reschedule slot. It may already be booked.");
    }
  };

  const onReviewSubmit = async (data: { stars: number; body: string }) => {
    if (!reviewApp) return;
    try {
      await submitReview({
        name: profile?.name || "Patient",
        body: data.body,
        stars: data.stars,
        appointmentId: reviewApp.id,
      });
      toast.success("Thank you! Your review has been submitted for approval.");
      setReviewApp(null);
      resetReview();
    } catch (err) {
      toast.error("Failed to submit review.");
    }
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Clock4 className="size-3" /> Pending
          </span>
        );
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="size-3" /> Approved
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-muted text-foreground border border-border">
            <CheckCircle className="size-3" /> Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle className="size-3" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container-page flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all font-medium"
          >
            <ArrowLeft className="size-4" />
            Home
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-medium hidden md:inline">
              Logged in as{" "}
              <strong className="text-foreground">{profile?.name || user.email}</strong>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await logout();
                navigate({ to: "/" });
              }}
              className="rounded-full flex items-center gap-2 border border-border cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/5"
            >
              <LogOut className="size-4" /> Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 py-8 md:py-12">
        <div className="container-page grid gap-8 lg:grid-cols-4">
          {/* Sidebar Tabs */}
          <aside className="lg:col-span-1 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl border font-semibold text-sm transition-all cursor-pointer ${
                activeTab === "appointments"
                  ? "bg-primary border-primary text-primary-foreground shadow-soft"
                  : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              <Calendar className="size-5" />
              My Appointments
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl border font-semibold text-sm transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-primary border-primary text-primary-foreground shadow-soft"
                  : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              <User className="size-5" />
              My Profile
            </button>
            <Button
              asChild
              size="lg"
              className="rounded-2xl mt-4 bg-primary text-primary-foreground shadow-soft w-full cursor-pointer"
            >
              <Link to="/book">
                <PlusCircle className="size-5" /> Book Appointment
              </Link>
            </Button>
          </aside>

          {/* Core Content */}
          <section className="lg:col-span-3">
            {activeTab === "appointments" ? (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-3xl font-bold">Appointment History</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Track status, cancel or reschedule your dental visits.
                  </p>
                </div>

                {loadingApps ? (
                  <div className="py-12 text-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                    <p className="mt-3 text-sm text-muted-foreground">Loading history…</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <Card className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
                    <AlertCircle className="size-12 text-muted-foreground mx-auto" />
                    <CardTitle className="mt-4 font-display text-lg font-bold">
                      No appointments found
                    </CardTitle>
                    <CardDescription className="mt-2 max-w-sm mx-auto">
                      You haven't scheduled any appointments yet. Click the book button to secure
                      your slot in under a minute!
                    </CardDescription>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {appointments.map((app) => (
                      <Card
                        key={app.id}
                        className="rounded-3xl border border-border bg-card overflow-hidden shadow-soft"
                      >
                        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              {getStatusBadge(app.status)}
                              <span className="text-xs text-muted-foreground font-mono">
                                Registered: {new Date(app.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-6">
                              <div className="flex items-center gap-2 text-foreground font-semibold">
                                <Calendar className="size-4.5 text-primary" />
                                {new Date(app.date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                                <Clock className="size-4.5" />
                                {app.slot}
                              </div>
                            </div>

                            <div className="text-sm">
                              <strong className="text-foreground">Reason:</strong>{" "}
                              <span className="text-muted-foreground">{app.reason}</span>
                            </div>
                            {app.notes && (
                              <div className="text-sm">
                                <strong className="text-foreground">Your Notes:</strong>{" "}
                                <span className="text-muted-foreground">{app.notes}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-row md:flex-col gap-2 shrink-0">
                            {app.status === "Pending" ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setRescheduleApp(app)}
                                  className="rounded-full flex items-center gap-2 border-border"
                                >
                                  <Edit2 className="size-3.5" /> Reschedule
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelApp(app)}
                                  className="rounded-full flex items-center gap-2 border-border text-destructive hover:bg-destructive/5 hover:text-destructive"
                                >
                                  <Trash2 className="size-3.5" /> Cancel
                                </Button>
                              </>
                            ) : app.status === "Approved" ? (
                              <div className="text-xs text-muted-foreground bg-surface rounded-2xl border border-border p-3 max-w-[200px] text-center">
                                Locked editing. Please contact clinic to reschedule.
                              </div>
                            ) : app.status === "Completed" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReviewApp(app)}
                                className="rounded-full flex items-center gap-2 border-border text-primary hover:bg-primary/5"
                              >
                                <MessageSquare className="size-3.5" /> Write Review
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground text-center font-medium">
                                Closed
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h1 className="font-display text-3xl font-bold">Profile Details</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Manage your personal dental record contacts.
                  </p>
                </div>

                <Card className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-soft">
                  {isEditingProfile ? (
                    <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label>Full Name</Label>
                        <Input {...regProfile("name")} />
                        {profileErrors.name && (
                          <p className="text-xs text-destructive">{profileErrors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Phone Number</Label>
                        <Input {...regProfile("phone")} />
                        {profileErrors.phone && (
                          <p className="text-xs text-destructive">{profileErrors.phone.message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          type="submit"
                          disabled={isProfileSaving}
                          className="rounded-full px-5"
                        >
                          {isProfileSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setIsEditingProfile(false)}
                          className="rounded-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0">
                          <User className="size-6" />
                        </span>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            Full Name
                          </div>
                          <div className="text-lg font-semibold text-foreground mt-0.5">
                            {profile?.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0">
                          <Phone className="size-6" />
                        </span>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            Phone Number
                          </div>
                          <div className="text-lg font-semibold text-foreground mt-0.5">
                            {profile?.phone || "Not set"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0">
                          <Mail className="size-6" />
                        </span>
                        <div>
                          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            Email Address
                          </div>
                          <div className="text-lg font-semibold text-foreground mt-0.5">
                            {profile?.email}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => setIsEditingProfile(true)}
                        className="rounded-full mt-2 w-full sm:w-auto"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Review Dialog */}
      <Dialog open={!!reviewApp} onOpenChange={(open) => !open && setReviewApp(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl border border-border bg-card p-6 shadow-card">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold">Write a Review</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Share your experience with Dr. Kalhyanie. Reviews appear on the homepage once
              approved.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleReviewSubmit(onReviewSubmit)} className="space-y-4 mt-4">
            <div className="space-y-1.5 text-center">
              <Label className="text-sm font-medium">Rating</Label>
              <div className="flex items-center justify-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewValue("stars", star)}
                    className="cursor-pointer focus:outline-none transition-transform active:scale-110"
                  >
                    <Star
                      className={`size-8 ${
                        star <= selectedStars ? "fill-primary text-primary" : "text-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Your Message</Label>
              <Textarea
                rows={4}
                placeholder="How was your cleaning, dental filling, etc.? We love hearing details!"
                {...regReview("body")}
              />
              {reviewErrors.body && (
                <p className="text-xs text-destructive">{reviewErrors.body.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isReviewSubmitting}
              className="w-full h-11 rounded-full bg-primary font-semibold"
            >
              {isReviewSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit for Approval
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleApp} onOpenChange={(open) => !open && setRescheduleApp(null)}>
        <DialogContent className="sm:max-w-[460px] rounded-3xl border border-border bg-card p-6 shadow-card">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold">Reschedule Visit</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Select a new preferred date and time slot.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <div className="space-y-1.5">
              <Label>Preferred Date</Label>
              <Input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Preferred Slot</Label>
              <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {SLOTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewSlot(s)}
                    className={`h-9 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      newSlot === s
                        ? "border-primary bg-primary text-primary-foreground shadow-soft"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleRescheduleSubmit}
              className="w-full h-11 rounded-full bg-primary font-semibold mt-2"
            >
              Confirm Reschedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
