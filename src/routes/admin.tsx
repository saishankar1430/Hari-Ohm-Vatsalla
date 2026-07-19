import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  LogOut,
  Plus,
  Trash2,
  Check,
  X,
  Edit2,
  Eye,
  EyeOff,
  Upload,
  Sparkles,
  Award,
  Clock4,
  CheckCircle,
  XCircle,
  Megaphone,
  Sliders,
  Image,
  Star,
  Search,
  Filter,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Loader2,
  ListFilter,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  getAllAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  getServices,
  addService,
  updateService,
  deleteService,
  getGallery,
  addGalleryItem,
  deleteGalleryItem,
  updateGalleryItemOrder,
  getAvailability,
  updateAvailability,
  getNotice,
  updateNotice,
  getAllReviews,
  approveReview,
  deleteReview,
  getClinicSettings,
  updateClinicSettings,
  uploadImage,
  Appointment,
  DentalService,
  GalleryItem,
  DoctorAvailability,
  NoticeBoard,
  Review,
  ClinicSettings,
} from "@/lib/db-service";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardPage,
});

// Zod schemas for Admin Panel
const serviceSchema = z.object({
  name: z.string().trim().min(2, "Service name required"),
  desc: z.string().trim().min(5, "Service description required"),
  price: z.string().trim().min(1, "Price required"),
  iconName: z.string().trim().min(1, "Icon name required"),
  isVisible: z.boolean(),
});

const settingsSchema = z.object({
  clinicName: z.string().trim().min(2, "Clinic name required"),
  doctorName: z.string().trim().min(2, "Doctor name required"),
  qualification: z.string().trim().min(2, "Qualification required"),
  experience: z.string().trim().min(1, "Experience required"),
  phone: z.string().trim().min(1, "Phone required"),
  whatsapp: z.string().trim().min(1, "WhatsApp required"),
  email: z.string().email("Invalid email"),
  address: z.string().trim().min(5, "Address required"),
  openingHours: z.string().trim().min(2, "Opening hours required"),
  emergencyContact: z.string().trim().min(1, "Emergency contact required"),
  googleMapsUrl: z.string().trim().url("Must be a valid URL"),
  aboutDoctor: z.string().trim().min(10, "About info required"),
  clinicDescription: z.string().trim().min(10, "Clinic description required"),
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

function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  // Selected tab
  const [activeTab, setActiveTab] = useState<
    "appointments" | "services" | "gallery" | "notice" | "settings" | "reviews"
  >("appointments");

  // Collections state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<DentalService[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [notice, setNotice] = useState<NoticeBoard | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);

  const [loading, setLoading] = useState(true);

  // Filters & searches for appointments
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals / Edit targets
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");

  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<DentalService | null>(null);
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);

  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);
  const [galleryAlt, setGalleryAlt] = useState("");
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // Security check redirect
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast.error("Access denied. Admin access only.");
      navigate({ to: "/" });
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Load all admin collections
  const loadAllData = async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    try {
      const [
        fetchedAppointments,
        fetchedServices,
        fetchedGallery,
        fetchedAvailability,
        fetchedNotice,
        fetchedReviews,
        fetchedSettings,
      ] = await Promise.all([
        getAllAppointments(),
        getServices(),
        getGallery(),
        getAvailability(),
        getNotice(),
        getAllReviews(),
        getClinicSettings(),
      ]);

      setAppointments(fetchedAppointments);
      setServices(fetchedServices);
      setGallery(fetchedGallery);
      setAvailability(fetchedAvailability);
      setNotice(fetchedNotice);
      setReviews(fetchedReviews);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error("Failed to load admin dashboard details:", err);
      toast.error("Error loading administration parameters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  // Forms
  const {
    register: regService,
    handleSubmit: handleServiceSubmit,
    formState: { errors: serviceErrors, isSubmitting: isServiceSaving },
    reset: resetServiceForm,
    setValue: setServiceValue,
  } = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", desc: "", price: "", iconName: "Stethoscope", isVisible: true },
  });

  const {
    register: regSettings,
    handleSubmit: handleSettingsSubmit,
    formState: { errors: settingsErrors, isSubmitting: isSettingsSaving },
    reset: resetSettingsForm,
  } = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (settings) {
      resetSettingsForm({
        clinicName: settings.clinicName,
        doctorName: settings.doctorName,
        qualification: settings.qualification,
        experience: settings.experience,
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        email: settings.email,
        address: settings.address,
        openingHours: settings.openingHours,
        emergencyContact: settings.emergencyContact,
        googleMapsUrl: settings.googleMapsUrl,
        aboutDoctor: settings.aboutDoctor,
        clinicDescription: settings.clinicDescription,
      });
    }
  }, [settings, resetSettingsForm]);

  if (authLoading || loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground font-medium">Loading Admin Suite…</p>
      </div>
    );
  }

  // ==========================================
  // APPOINTMENTS MANAGEMENT
  // ==========================================

  const handleStatusChange = async (app: Appointment, status: Appointment["status"]) => {
    if (!app.id) return;
    try {
      await updateAppointmentStatus(app.id, status, app.date, app.slot);
      toast.success(`Appointment status updated to ${status}`);
      // refresh
      const fetchedAppointments = await getAllAppointments();
      setAppointments(fetchedAppointments);
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleRescheduleConfirm = async () => {
    if (!rescheduleTarget || !rescheduleTarget.id || !rescheduleDate || !rescheduleSlot) {
      toast.error("Please select a date and slot.");
      return;
    }
    try {
      await rescheduleAppointment(
        rescheduleTarget.id,
        rescheduleTarget.date,
        rescheduleTarget.slot,
        rescheduleDate,
        rescheduleSlot,
      );
      toast.success("Rescheduled appointment successfully.");
      setRescheduleTarget(null);
      // refresh
      const fetchedAppointments = await getAllAppointments();
      setAppointments(fetchedAppointments);
    } catch (err) {
      toast.error("Failed to reschedule. Slot might be booked.");
    }
  };

  const getFilteredAppointments = () => {
    return appointments
      .filter((app) => {
        const matchesSearch =
          app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.patientPhone.includes(searchTerm) ||
          app.reason.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || app.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.slot}`).getTime();
        const dateB = new Date(`${b.date} ${b.slot}`).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  };

  // Stats
  const stats = {
    today: appointments.filter((a) => a.date === new Date().toISOString().slice(0, 10)).length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    approved: appointments.filter((a) => a.status === "Approved").length,
    completed: appointments.filter((a) => a.status === "Completed").length,
  };

  // ==========================================
  // SERVICES MANAGEMENT
  // ==========================================

  const onServiceSave = async (data: z.infer<typeof serviceSchema>) => {
    try {
      let imageUrl = editingService?.imageUrl || "";

      if (serviceImageFile) {
        imageUrl = await uploadImage(serviceImageFile, "services");
      }

      if (editingService?.id) {
        // Edit mode
        await updateService(editingService.id, {
          ...data,
          imageUrl,
        });
        toast.success("Service updated successfully!");
      } else {
        // Add mode
        await addService({
          ...data,
          imageUrl,
          orderIndex: services.length,
        });
        toast.success("Service added successfully!");
      }

      setIsAddingService(false);
      setEditingService(null);
      setServiceImageFile(null);
      resetServiceForm();

      // Refresh services
      const srvs = await getServices();
      setServices(srvs);
    } catch (err) {
      toast.error("Failed to save service.");
    }
  };

  const handleEditServiceClick = (service: DentalService) => {
    setEditingService(service);
    resetServiceForm({
      name: service.name,
      desc: service.desc,
      price: service.price,
      iconName: service.iconName,
      isVisible: service.isVisible,
    });
    setIsAddingService(true);
  };

  const handleDeleteService = async (service: DentalService) => {
    if (!service.id) return;
    if (confirm(`Are you sure you want to delete ${service.name}?`)) {
      try {
        await deleteService(service.id, service.imageUrl);
        toast.success("Service deleted.");
        // Refresh services
        const srvs = await getServices();
        setServices(srvs);
      } catch (err) {
        toast.error("Failed to delete service.");
      }
    }
  };

  // ==========================================
  // GALLERY MANAGEMENT
  // ==========================================

  const handleGalleryUpload = async () => {
    if (!galleryImageFile) {
      toast.error("Choose an image to upload.");
      return;
    }
    setIsUploadingGallery(true);
    try {
      const url = await uploadImage(galleryImageFile, "gallery");
      await addGalleryItem({
        imageUrl: url,
        alt: galleryAlt || "Clinic image",
        tall: false,
        orderIndex: gallery.length,
      });
      toast.success("Image added to gallery!");
      setGalleryImageFile(null);
      setGalleryAlt("");
      // Refresh gallery
      const items = await getGallery();
      setGallery(items);
    } catch (err) {
      toast.error("Upload failed.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleDeleteGallery = async (item: GalleryItem) => {
    if (!item.id) return;
    if (confirm("Delete this gallery item?")) {
      try {
        await deleteGalleryItem(item.id, item.imageUrl);
        toast.success("Deleted image.");
        const items = await getGallery();
        setGallery(items);
      } catch (err) {
        toast.error("Failed to delete image.");
      }
    }
  };

  const handleMoveGallery = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;

    const itemA = gallery[index];
    const itemB = gallery[targetIndex];

    if (!itemA.id || !itemB.id) return;

    try {
      await Promise.all([
        updateGalleryItemOrder(itemA.id, targetIndex),
        updateGalleryItemOrder(itemB.id, index),
      ]);
      const items = await getGallery();
      setGallery(items);
      toast.success("Order rearranged.");
    } catch (err) {
      toast.error("Failed to shift order.");
    }
  };

  // ==========================================
  // NOTICE & AVAILABILITY BOARD
  // ==========================================

  const handleNoticeUpdate = async (content: string) => {
    try {
      await updateNotice(content);
      toast.success("Notice board updated!");
      const fetchedNotice = await getNotice();
      setNotice(fetchedNotice);
    } catch (err) {
      toast.error("Failed to save notice.");
    }
  };

  const handleAvailabilityUpdate = async (data: Partial<DoctorAvailability>) => {
    try {
      await updateAvailability(data);
      toast.success("Availability parameters saved!");
      const fetchedAvailability = await getAvailability();
      setAvailability(fetchedAvailability);
    } catch (err) {
      toast.error("Failed to update availability.");
    }
  };

  // ==========================================
  // REVIEWS CONTROL
  // ==========================================

  const handleApproveReview = async (id: string, approve: boolean) => {
    try {
      await approveReview(id, approve);
      toast.success(approve ? "Review approved publicly!" : "Review unapproved.");
      const rvs = await getAllReviews();
      setReviews(rvs);
    } catch (err) {
      toast.error("Failed to change review permission.");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (confirm("Delete this review permanently?")) {
      try {
        await deleteReview(id);
        toast.success("Review deleted.");
        const rvs = await getAllReviews();
        setReviews(rvs);
      } catch (err) {
        toast.error("Failed to delete review.");
      }
    }
  };

  // ==========================================
  // CLINIC SETTINGS
  // ==========================================

  const onSettingsSave = async (data: z.infer<typeof settingsSchema>) => {
    try {
      await updateClinicSettings(data);
      toast.success("Clinic settings updated dynamically!");
      const fetchedSettings = await getClinicSettings();
      setSettings(fetchedSettings);
    } catch (err) {
      toast.error("Failed to update settings.");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-soft">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <Sparkles className="size-4.5" />
            </span>
            <span className="font-display font-bold text-lg">Dr. Kalhyanie Admin Panel</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadAllData}
              className="rounded-full border border-border"
              title="Refresh Data"
            >
              <RefreshCw className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                navigate({ to: "/" });
              }}
              className="rounded-full flex items-center gap-2 border-border text-destructive hover:bg-destructive/5"
            >
              <LogOut className="size-4" /> Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 py-8 md:py-12">
        <div className="container-page grid gap-8 lg:grid-cols-4">
          {/* Admin Navigation Options */}
          <aside className="lg:col-span-1 flex flex-col gap-2">
            {[
              {
                id: "appointments",
                label: "Appointments",
                icon: CalendarIcon,
                badge: stats.pending,
              },
              { id: "services", label: "Services (CRUD)", icon: Sliders },
              { id: "gallery", label: "Gallery Store", icon: Image },
              { id: "notice", label: "Notice & Hours", icon: Megaphone },
              {
                id: "reviews",
                label: "Patient Reviews",
                icon: Star,
                badge: reviews.filter((r) => !r.isApproved).length,
              },
              { id: "settings", label: "Clinic Profile", icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as
                        "appointments" | "services" | "gallery" | "notice" | "settings" | "reviews",
                    )
                  }
                  className={`flex items-center justify-between w-full text-left px-5 py-4 rounded-2xl border font-semibold text-sm transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary border-primary text-primary-foreground shadow-soft"
                      : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-5" />
                    {tab.label}
                  </div>
                  {tab.badge && tab.badge > 0 ? (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white text-primary" : "bg-primary text-white"}`}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </aside>

          {/* Tab Screen Core */}
          <section className="lg:col-span-3 space-y-6">
            {/* ---------------- APPOINTMENTS TAB ---------------- */}
            {activeTab === "appointments" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="rounded-2xl border-border bg-card shadow-soft p-4">
                    <div className="text-xs text-muted-foreground uppercase font-semibold">
                      Today's Visits
                    </div>
                    <div className="text-3xl font-bold text-foreground mt-2">{stats.today}</div>
                  </Card>
                  <Card className="rounded-2xl border-border bg-card shadow-soft p-4">
                    <div className="text-xs text-muted-foreground uppercase font-semibold text-blue-600">
                      Pending
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mt-2">{stats.pending}</div>
                  </Card>
                  <Card className="rounded-2xl border-border bg-card shadow-soft p-4">
                    <div className="text-xs text-muted-foreground uppercase font-semibold text-emerald-600">
                      Approved
                    </div>
                    <div className="text-3xl font-bold text-emerald-600 mt-2">{stats.approved}</div>
                  </Card>
                  <Card className="rounded-2xl border-border bg-card shadow-soft p-4">
                    <div className="text-xs text-muted-foreground uppercase font-semibold">
                      Completed
                    </div>
                    <div className="text-3xl font-bold text-foreground mt-2">{stats.completed}</div>
                  </Card>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-3xl">
                  {/* Search bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patient, phone, or reason…"
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <ListFilter className="size-4 text-muted-foreground" />
                      <select
                        className="border border-input rounded-md text-xs px-2.5 py-1.5 bg-background focus:outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="rounded-md flex items-center gap-1.5 border-border h-8"
                    >
                      <ArrowUpDown className="size-3.5" /> Date{" "}
                      {sortOrder === "asc" ? "Asc" : "Desc"}
                    </Button>
                  </div>
                </div>

                {/* Grid Lists of appointments */}
                <div className="space-y-4">
                  {getFilteredAppointments().length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      No matching appointments found.
                    </div>
                  ) : (
                    getFilteredAppointments().map((app) => (
                      <Card
                        key={app.id}
                        className={`rounded-3xl border border-border bg-card overflow-hidden shadow-soft transition-colors ${
                          app.status === "Pending" ? "border-blue-200 bg-blue-50/10" : ""
                        }`}
                      >
                        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-3 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-lg text-foreground truncate">
                                {app.patientName}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ({app.patientAge || "Age not set"},{" "}
                                {app.patientGender || "Prefer not to say"})
                              </span>
                              <span className="ml-auto md:ml-0">
                                {app.status === "Pending" && (
                                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                    New Booking
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Phone className="size-4 text-primary" /> {app.patientPhone}
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="size-4" /> {app.patientEmail}
                              </div>
                              <div className="flex items-center gap-2 mt-1 sm:col-span-2 text-foreground font-semibold">
                                <CalendarIcon className="size-4.5 text-primary" />
                                {app.date} @ {app.slot}
                              </div>
                            </div>

                            <div className="text-sm">
                              <strong className="text-foreground">Reason:</strong>{" "}
                              <span className="text-muted-foreground">{app.reason}</span>
                            </div>
                            {app.notes && (
                              <div className="text-xs italic bg-surface p-3 rounded-xl border border-border">
                                <strong>Patient Notes:</strong> {app.notes}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            {app.status === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(app, "Approved")}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Check className="size-4" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(app, "Cancelled")}
                                  className="text-destructive border-destructive/20 hover:bg-destructive/5 rounded-full flex items-center gap-1.5 cursor-pointer"
                                >
                                  <X className="size-4" /> Reject
                                </Button>
                              </>
                            )}

                            {app.status === "Approved" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusChange(app, "Completed")}
                                  className="bg-primary hover:bg-primary/90 text-white rounded-full flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Check className="size-4" /> Mark Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRescheduleTarget(app);
                                    setRescheduleDate(app.date);
                                    setRescheduleSlot(app.slot);
                                  }}
                                  className="rounded-full flex items-center gap-1.5 cursor-pointer border-border"
                                >
                                  <Clock className="size-4" /> Reschedule
                                </Button>
                              </>
                            )}

                            {app.status === "Completed" && (
                              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle className="size-4" /> Completed
                              </span>
                            )}

                            {app.status === "Cancelled" && (
                              <span className="text-xs font-bold text-destructive flex items-center gap-1">
                                <XCircle className="size-4" /> Cancelled
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ---------------- SERVICES TAB ---------------- */}
            {activeTab === "services" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold">Services & Pricing</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Manage all available treatments, prices and visibilities.
                    </p>
                  </div>
                  {!isAddingService && (
                    <Button
                      onClick={() => setIsAddingService(true)}
                      className="rounded-full cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="size-4" /> Add Service
                    </Button>
                  )}
                </div>

                {isAddingService ? (
                  <Card className="rounded-3xl border border-border bg-card p-6 md:p-8">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="font-display text-xl font-bold">
                        {editingService ? "Edit Treatment" : "Add Treatment"}
                      </CardTitle>
                    </CardHeader>

                    <form onSubmit={handleServiceSubmit(onServiceSave)} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Treatment Name</Label>
                          <Input placeholder="e.g. Tooth Whitening" {...regService("name")} />
                          {serviceErrors.name && (
                            <p className="text-xs text-destructive">{serviceErrors.name.message}</p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label>Starting Price</Label>
                          <Input placeholder="e.g. ₹5,000" {...regService("price")} />
                          {serviceErrors.price && (
                            <p className="text-xs text-destructive">
                              {serviceErrors.price.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label>Short Description</Label>
                        <Textarea
                          rows={3}
                          placeholder="Provide details about standard procedure duration..."
                          {...regService("desc")}
                        />
                        {serviceErrors.desc && (
                          <p className="text-xs text-destructive">{serviceErrors.desc.message}</p>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 items-center">
                        <div className="space-y-1.5">
                          <Label>Lucide Icon Name</Label>
                          <Input
                            placeholder="Stethoscope, Sparkles, Wrench, Smile..."
                            {...regService("iconName")}
                          />
                          {serviceErrors.iconName && (
                            <p className="text-xs text-destructive">
                              {serviceErrors.iconName.message}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 h-10 mt-6">
                          <input
                            type="checkbox"
                            id="isVisible"
                            className="rounded border-border size-4 text-primary"
                            {...regService("isVisible")}
                          />
                          <Label htmlFor="isVisible">Visible publicly on homepage</Label>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <Label>Treatment Image (Firebase Storage Upload)</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setServiceImageFile(e.target.files?.[0] || null)}
                          />
                          <Upload className="size-5 text-muted-foreground shrink-0" />
                        </div>
                        {editingService?.imageUrl && (
                          <p className="text-xs text-muted-foreground">
                            Current Image: {editingService.imageUrl.slice(0, 50)}…
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <Button
                          type="submit"
                          disabled={isServiceSaving}
                          className="rounded-full px-6"
                        >
                          {isServiceSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Treatment
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setIsAddingService(false);
                            setEditingService(null);
                            setServiceImageFile(null);
                            resetServiceForm();
                          }}
                          className="rounded-full"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {services.map((srv) => (
                      <Card
                        key={srv.id}
                        className="rounded-3xl border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0 mt-1">
                            {srv.iconName ? (
                              <Sliders className="size-5" />
                            ) : (
                              <Sparkles className="size-5" />
                            )}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-display font-semibold text-lg">{srv.name}</h3>
                              <span className="text-xs font-bold bg-surface rounded-full px-2.5 py-0.5 border border-border">
                                {srv.price}
                              </span>
                              {!srv.isVisible && (
                                <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <EyeOff className="size-3" /> Hidden
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mt-1 leading-relaxed max-w-xl">
                              {srv.desc}
                            </p>
                            {srv.imageUrl && (
                              <img
                                src={srv.imageUrl}
                                alt={srv.name}
                                className="mt-3 h-20 w-32 object-cover rounded-lg border border-border"
                              />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:flex-col shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditServiceClick(srv)}
                            className="rounded-full flex items-center gap-1.5 border-border cursor-pointer"
                          >
                            <Edit2 className="size-3.5" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteService(srv)}
                            className="rounded-full flex items-center gap-1.5 border-border text-destructive hover:bg-destructive/5 cursor-pointer"
                          >
                            <Trash2 className="size-3.5" /> Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ---------------- GALLERY TAB ---------------- */}
            {activeTab === "gallery" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">Gallery Photos</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Upload and delete images shown in clinic peek slider.
                  </p>
                </div>

                <Card className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <h3 className="font-display font-semibold text-lg mb-4">Upload New Photo</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Select Image File</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setGalleryImageFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Alt Label Description</Label>
                      <Input
                        placeholder="e.g. Modern consultation suite, digital xray..."
                        value={galleryAlt}
                        onChange={(e) => setGalleryAlt(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleGalleryUpload}
                    disabled={isUploadingGallery}
                    className="rounded-full mt-4 cursor-pointer"
                  >
                    {isUploadingGallery ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading to Storage…
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" /> Upload Photo
                      </>
                    )}
                  </Button>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((g, index) => (
                    <div
                      key={g.id || g.imageUrl}
                      className="group relative rounded-2xl overflow-hidden border border-border bg-card shadow-soft aspect-square"
                    >
                      <img src={g.imageUrl} alt={g.alt} className="size-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium truncate pr-2">{g.alt}</span>
                          <button
                            onClick={() => handleDeleteGallery(g)}
                            className="text-destructive hover:scale-105 shrink-0"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 self-center">
                          <button
                            disabled={index === 0}
                            onClick={() => handleMoveGallery(index, "up")}
                            className="p-1 rounded-full bg-white/20 hover:bg-white/40 disabled:opacity-30"
                          >
                            <ChevronUp className="size-4" />
                          </button>
                          <button
                            disabled={index === gallery.length - 1}
                            onClick={() => handleMoveGallery(index, "down")}
                            className="p-1 rounded-full bg-white/20 hover:bg-white/40 disabled:opacity-30"
                          >
                            <ChevronDown className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- NOTICE & AVAILABILITY TAB ---------------- */}
            {activeTab === "notice" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">Notice Board & Availabilities</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Configure doctor schedule changes, vacations, or holidays.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Notice Board */}
                  <Card className="rounded-3xl border border-border bg-card p-6 shadow-soft h-full flex flex-col">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                        <Megaphone className="size-5 text-primary" /> Edit Notice Board
                      </CardTitle>
                      <CardDescription>A persistent text shown on homepage alerts.</CardDescription>
                    </CardHeader>
                    <div className="space-y-3 flex-1 flex flex-col justify-between">
                      <Textarea
                        rows={6}
                        defaultValue={notice?.content || ""}
                        id="noticeContent"
                        placeholder="Enter announcement text..."
                      />
                      <Button
                        onClick={() => {
                          const val = (
                            document.getElementById("noticeContent") as HTMLTextAreaElement
                          )?.value;
                          handleNoticeUpdate(val);
                        }}
                        className="rounded-full mt-4 self-start cursor-pointer"
                      >
                        Publish Notice
                      </Button>
                    </div>
                  </Card>

                  {/* Availability */}
                  <Card className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                        <Sliders className="size-5 text-primary" /> Session Timing Hours
                      </CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label>Morning Shift Hours</Label>
                        <Input
                          id="morningSession"
                          defaultValue={availability?.morningSession || ""}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Evening Shift Hours</Label>
                        <Input
                          id="eveningSession"
                          defaultValue={availability?.eveningSession || ""}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Doctor Status Label</Label>
                        <select
                          id="docStatus"
                          defaultValue={availability?.status || "available"}
                          className="w-full h-10 border border-input rounded-md px-3 bg-background text-sm"
                        >
                          <option value="available">Available</option>
                          <option value="unavailable">Unavailable</option>
                          <option value="vacation">Vacation Leave</option>
                          <option value="holiday">Holiday Closure</option>
                          <option value="emergency-leave">Emergency Leave</option>
                        </select>
                      </div>
                      <Button
                        onClick={() => {
                          const morning = (
                            document.getElementById("morningSession") as HTMLInputElement
                          )?.value;
                          const evening = (
                            document.getElementById("eveningSession") as HTMLInputElement
                          )?.value;
                          const status = (document.getElementById("docStatus") as HTMLSelectElement)
                            ?.value as DoctorAvailability["status"];
                          handleAvailabilityUpdate({
                            morningSession: morning,
                            eveningSession: evening,
                            status,
                          });
                        }}
                        className="rounded-full cursor-pointer mt-2"
                      >
                        Update Timings
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ---------------- REVIEWS TAB ---------------- */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">Patient Reviews Approval</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Audit, approve, or remove review testimonials.
                  </p>
                </div>

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      No reviews submitted yet.
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <Card
                        key={rev.id}
                        className={`rounded-3xl border border-border bg-card p-6 flex flex-col sm:flex-row justify-between items-start gap-4 transition-colors ${!rev.isApproved ? "border-amber-200 bg-amber-50/5" : ""}`}
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{rev.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                            {!rev.isApproved && (
                              <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                Pending Approval
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-primary">
                            {[...Array(rev.stars)].map((_, i) => (
                              <Star key={i} className="size-3.5 fill-primary" />
                            ))}
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            “{rev.body}”
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {rev.isApproved ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveReview(rev.id!, false)}
                              className="rounded-full border-border"
                            >
                              Unapprove
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleApproveReview(rev.id!, true)}
                              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            >
                              Approve Publicly
                            </Button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(rev.id!)}
                            className="text-destructive hover:scale-105 p-1"
                          >
                            <Trash2 className="size-5" />
                          </button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ---------------- CLINIC SETTINGS TAB ---------------- */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold">Clinic Settings</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Customize Qualification contacts, maps embeds, and Doctor description profiles.
                  </p>
                </div>

                <Card className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-soft">
                  <form onSubmit={handleSettingsSubmit(onSettingsSave)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Clinic Display Name</Label>
                        <Input {...regSettings("clinicName")} />
                        {settingsErrors.clinicName && (
                          <p className="text-xs text-destructive">
                            {settingsErrors.clinicName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Doctor Full Name</Label>
                        <Input {...regSettings("doctorName")} />
                        {settingsErrors.doctorName && (
                          <p className="text-xs text-destructive">
                            {settingsErrors.doctorName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Qualification Credentials</Label>
                        <Input {...regSettings("qualification")} />
                        {settingsErrors.qualification && (
                          <p className="text-xs text-destructive">
                            {settingsErrors.qualification.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Doctor Practice Experience</Label>
                        <Input {...regSettings("experience")} />
                        {settingsErrors.experience && (
                          <p className="text-xs text-destructive">
                            {settingsErrors.experience.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label>Primary Phone</Label>
                        <Input {...regSettings("phone")} />
                        {settingsErrors.phone && (
                          <p className="text-xs text-destructive">{settingsErrors.phone.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>WhatsApp Hotline</Label>
                        <Input {...regSettings("whatsapp")} />
                        {settingsErrors.whatsapp && (
                          <p className="text-xs text-destructive">
                            {settingsErrors.whatsapp.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Email Address</Label>
                        <Input {...regSettings("email")} />
                        {settingsErrors.email && (
                          <p className="text-xs text-destructive">{settingsErrors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Clinic Full Address</Label>
                      <Input {...regSettings("address")} />
                      {settingsErrors.address && (
                        <p className="text-xs text-destructive">{settingsErrors.address.message}</p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Opening Schedule Hours</Label>
                        <Input {...regSettings("openingHours")} />
                        {settingsErrors.openingHours && (
                          <p className="text-xs text-destructive">
                            {settingsErrors.openingHours.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Emergency Contact Number</Label>
                        <Input {...regSettings("emergencyContact")} />
                        {settingsErrors.emergencyContact && (
                          <p className="text-xs text-destructive">
                            {settingsErrors.emergencyContact.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Google Maps Iframe Embed URL</Label>
                      <Input {...regSettings("googleMapsUrl")} />
                      {settingsErrors.googleMapsUrl && (
                        <p className="text-xs text-destructive">
                          {settingsErrors.googleMapsUrl.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label>Clinic Description Overview</Label>
                      <Textarea rows={3} {...regSettings("clinicDescription")} />
                      {settingsErrors.clinicDescription && (
                        <p className="text-xs text-destructive">
                          {settingsErrors.clinicDescription.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label>Doctor Complete Profile About Text</Label>
                      <Textarea rows={4} {...regSettings("aboutDoctor")} />
                      {settingsErrors.aboutDoctor && (
                        <p className="text-xs text-destructive">
                          {settingsErrors.aboutDoctor.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSettingsSaving}
                      className="rounded-full px-6 cursor-pointer"
                    >
                      {isSettingsSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Profile Clinic Settings
                    </Button>
                  </form>
                </Card>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Reschedule Dialog Modal */}
      <Dialog open={!!rescheduleTarget} onOpenChange={(open) => !open && setRescheduleTarget(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl border border-border bg-card p-6 shadow-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Reschedule Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label>Target Date</Label>
              <Input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Target Slot Time</Label>
              <select
                className="w-full h-10 border border-input rounded-md px-3 bg-background text-sm"
                value={rescheduleSlot}
                onChange={(e) => setRescheduleSlot(e.target.value)}
              >
                {SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleRescheduleConfirm}
              className="w-full h-11 rounded-full bg-primary font-semibold"
            >
              Save Rescheduled Slot
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
