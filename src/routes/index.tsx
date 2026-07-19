import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import {
  Calendar,
  Phone,
  Clock,
  ShieldCheck,
  Heart,
  Star,
  MapPin,
  Mail,
  ChevronDown,
  Sparkles,
  Stethoscope,
  Baby,
  Smile,
  Zap,
  Award,
  Users,
  BadgeCheck,
  Wallet,
  Wrench,
  HeartHandshake,
  LifeBuoy,
  ArrowRight,
  Quote,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { FadeIn } from "@/components/site/FadeIn";

import doctorHero from "@/assets/doctor-hero.jpg";
import galReception from "@/assets/gallery-reception.jpg";
import galTreatment from "@/assets/gallery-treatment.jpg";
import galEquipment from "@/assets/gallery-equipment.jpg";
import galWaiting from "@/assets/gallery-waiting.jpg";
import galPatient from "@/assets/gallery-patient.jpg";
import galExterior from "@/assets/gallery-exterior.jpg";

import {
  getClinicSettings,
  getServices,
  getGallery,
  getAvailability,
  getNotice,
  getApprovedReviews,
  ClinicSettings,
  DentalService,
  GalleryItem,
  DoctorAvailability,
  NoticeBoard,
  Review,
} from "@/lib/db-service";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ property: "og:image", content: "https://kalhyaniedental.com/og.jpg" }],
  }),
  component: HomePage,
});

// Helper to resolve icon name to Lucide Component
function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as Record<string, unknown>)[name] as
    React.ComponentType<{ className?: string }> | undefined;
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  return <Stethoscope className={className} />;
}

const WhatsAppIcon = ({ className = "size-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5.28" fill="#25D366" />
    <g transform="scale(0.65) translate(6.46, 6.46)">
      <path
        d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.13.668 4.11 1.81 5.74L2.03 22l4.414-1.155c1.551.847 3.318 1.332 5.19 1.332 5.494 0 9.99-4.5 9.99-10S17.498 2 12.004 2zm5.795 13.568c-.24.68-.1.2-.1.2s-.36 1.055-1.185 1.57c-.645.405-1.425.435-1.425.435-.435.03-1.605-.33-3.21-1.02-2.31-.99-4.02-3.135-4.44-3.69-.075-.105-.72-.96-.72-1.83 0-1.005.51-1.485.69-1.68.18-.195.39-.24.525-.24H8.48c.12 0 .285.015.42.33.15.345.51 1.245.555 1.335.045.09.075.195.015.315-.06.12-.09.195-.18.3-.09.105-.195.24-.285.33-.105.105-.21.225-.09.435.12.21.54.885 1.155 1.44.795.705 1.455.93 1.665 1.035.21.105.33.09.45-.045.12-.135.51-.6.645-.81.135-.21.27-.18.45-.105.18.075 1.14.54 1.335.645.195.09.33.135.375.21.045.075.045.435-.195 1.11z"
        fill="white"
      />
    </g>
  </svg>
);

// Map default gallery index to local assets to avoid empty images initially
const localGalleryFallbackMap: Record<number, string> = {
  0: galReception,
  1: galEquipment,
  2: galTreatment,
  3: galWaiting,
  4: galPatient,
  5: galExterior,
};

const DecorativeElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
    {/* Subtle blurred circles */}
    <div className="absolute top-[10%] left-[5%] size-64 sm:size-96 rounded-full bg-blue-300/8 blur-3xl" />
    <div className="absolute top-[40%] right-[5%] size-72 sm:size-[500px] rounded-full bg-cyan-300/8 blur-3xl animate-pulse" />
    <div className="absolute bottom-[20%] left-[10%] size-80 sm:size-[400px] rounded-full bg-indigo-300/5 blur-3xl" />

    {/* Floating Plus Icons */}
    <div className="absolute top-[12%] left-[15%] text-blue-500/10 animate-bounce duration-[6s] hidden sm:block">
      <Icons.Plus className="size-6" strokeWidth={2} />
    </div>
    <div className="absolute top-[38%] right-[12%] text-cyan-500/10 animate-bounce duration-[8s] hidden sm:block">
      <Icons.Plus className="size-5" strokeWidth={2} />
    </div>
    <div className="absolute bottom-[30%] left-[8%] text-blue-500/10 animate-pulse hidden sm:block">
      <Icons.Plus className="size-7" strokeWidth={1.5} />
    </div>
    <div className="absolute bottom-[10%] right-[14%] text-indigo-500/10 animate-pulse hidden sm:block">
      <Icons.Plus className="size-6" strokeWidth={1.5} />
    </div>

    {/* Grid / Dots overlays */}
    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-25" />
  </div>
);

const WaveSeparator = ({ className = "text-[#FCFCFD]" }: { className?: string }) => (
  <div className="absolute left-0 right-0 bottom-[-1.5px] w-full h-8 md:h-12 overflow-hidden pointer-events-none select-none z-10">
    <svg
      className={`absolute bottom-0 w-full h-8 md:h-12 ${className}`}
      viewBox="0 0 1440 74"
      fill="currentColor"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,74L1320,74C1200,74,960,74,720,74C480,74,240,74,120,74L0,74Z"></path>
    </svg>
  </div>
);

const WaveSeparatorTop = ({ className = "text-[#FCFCFD]" }: { className?: string }) => (
  <div className="absolute left-0 right-0 top-[-1.5px] w-full h-8 md:h-12 overflow-hidden pointer-events-none select-none z-10">
    <svg
      className={`absolute top-0 w-full h-8 md:h-12 rotate-180 ${className}`}
      viewBox="0 0 1440 74"
      fill="currentColor"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,74L1320,74C1200,74,960,74,720,74C480,74,240,74,120,74L0,74Z"></path>
    </svg>
  </div>
);

/* ---------------- HERO ---------------- */

function Hero({
  settings,
  availability,
  notice,
}: {
  settings: ClinicSettings;
  availability: DoctorAvailability;
  notice: NoticeBoard;
}) {
  const getAvailabilityLabel = () => {
    switch (availability.status) {
      case "available":
        return {
          label: "Available Today",
          color: "bg-emerald-500",
          border: "border-emerald-100",
          text: "text-emerald-800",
          bg: "bg-emerald-50/40",
        };
      case "unavailable":
        return {
          label: "Unavailable Today",
          color: "bg-rose-500",
          border: "border-rose-100",
          text: "text-rose-800",
          bg: "bg-rose-50/40",
        };
      case "vacation":
        return {
          label: "On Vacation",
          color: "bg-amber-500",
          border: "border-amber-100",
          text: "text-amber-800",
          bg: "bg-amber-50/40",
        };
      case "holiday":
        return {
          label: "Holiday (Closed)",
          color: "bg-amber-500",
          border: "border-amber-100",
          text: "text-amber-800",
          bg: "bg-amber-50/40",
        };
      case "emergency-leave":
        return {
          label: "Emergency Leave",
          color: "bg-rose-500",
          border: "border-rose-100",
          text: "text-rose-800",
          bg: "bg-rose-50/40",
        };
      default:
        return {
          label: "Available Today",
          color: "bg-emerald-500",
          border: "border-emerald-100",
          text: "text-emerald-800",
          bg: "bg-emerald-50/40",
        };
    }
  };

  const statusInfo = getAvailabilityLabel();

  return (
    <section
      id="home"
      className="relative pt-24 md:pt-36 pb-20 md:pb-32 overflow-hidden bg-gradient-to-b from-[#FAFBFF] via-[#F4F8FD] to-[#FCFCFD] text-foreground border-b border-blue-100/25"
    >
      {/* Background radial gradients & subtle grids */}
      <DecorativeElements />
      <WaveSeparator className="text-[#FCFCFD]" />

      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16 items-center">
        {/* Left/Top Content Column */}
        <div className="lg:col-span-7 order-1 flex flex-col justify-center text-left">
          <FadeIn>
            <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50/50 pl-3.5 pr-4 py-2 text-xs font-bold text-blue-700 shadow-sm w-full max-w-[320px] sm:max-w-md overflow-hidden relative select-none">
              <style>{`
                @keyframes marquee {
                  0% { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
                .animate-marquee-slow {
                  display: inline-block;
                  white-space: nowrap;
                  animation: marquee 16s linear infinite;
                }
              `}</style>
              <span className="flex items-center gap-1.5 shrink-0 bg-blue-100/95 text-blue-800 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold shadow-sm mr-3">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full size-1.5 bg-blue-600" />
                </span>
                Today's Note
              </span>
              <div className="flex-1 overflow-hidden relative py-0.5 select-none flex items-center">
                <div className="animate-marquee-slow text-slate-700 font-semibold text-[11px] sm:text-xs">
                  {notice.content}
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="mt-6 flex flex-col gap-5">
            <FadeIn delay={0.05}>
              <h1 className="font-display text-4xl sm:text-6xl md:text-[5.25rem] font-extrabold tracking-tight text-slate-900 leading-[1.05]">
                {settings.clinicName.includes("Vatsalla") ? (
                  <>
                    Vatsalla <span className="text-blue-600 block sm:inline">Dental</span>
                  </>
                ) : settings.clinicName.includes("Clinic") ? (
                  <>
                    Innovation <span className="text-blue-600 block sm:inline">Clinic</span>
                  </>
                ) : (
                  <>
                    Gentle <span className="text-blue-600 block sm:inline">Smiles</span>
                  </>
                )}
              </h1>
            </FadeIn>
          </div>

          <FadeIn delay={0.15}>
            <p className="mt-6 max-w-xl text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-medium">
              {settings.clinicDescription ||
                "Experience premium family dental care delivered with exceptional skill, modern technology, and a warm, patient-first approach."}
            </p>
          </FadeIn>

          <FadeIn delay={0.18}>
            <div className="mt-6.5 flex flex-wrap gap-2.5">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className={`inline-flex items-center gap-2 rounded-full border ${statusInfo.border} ${statusInfo.bg} px-4 py-2 text-xs font-bold ${statusInfo.text} shadow-sm cursor-default`}
              >
                <span className="flex size-2 relative shrink-0">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusInfo.color} opacity-75`}
                  />
                  <span
                    className={`relative inline-flex rounded-full size-2 ${statusInfo.color}`}
                  />
                </span>
                {statusInfo.label}
              </motion.span>

              {availability.morningSession && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.4 }}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-100/80 bg-blue-50/30 px-4 py-2 text-xs font-bold text-blue-800 shadow-sm cursor-default"
                >
                  <Clock className="size-3.5 text-blue-600 shrink-0" />
                  <span>Morning: {availability.morningSession}</span>
                </motion.span>
              )}

              {availability.eveningSession && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.36, duration: 0.4 }}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-100/80 bg-blue-50/30 px-4 py-2 text-xs font-bold text-blue-800 shadow-sm cursor-default"
                >
                  <Clock className="size-3.5 text-blue-600 shrink-0" />
                  <span>Evening: {availability.eveningSession}</span>
                </motion.span>
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 max-w-xl">
              <Button
                asChild
                size="lg"
                className="rounded-full h-13 px-8 text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-soft font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Link to="/book">
                  <span>Schedule Appointment</span>
                  <div className="flex size-6 items-center justify-center rounded-full bg-white/20">
                    <Icons.Calendar className="size-3 text-white" />
                  </div>
                </Link>
              </Button>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full h-13 px-5 text-xs font-bold border border-emerald-100 bg-emerald-50/25 hover:bg-emerald-50/50 text-emerald-800 shadow-soft transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <a href="https://wa.me/919603776252" target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon className="size-5 rounded-[22%]" />
                    <span>WhatsApp</span>
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full h-13 px-5 text-xs font-bold border-blue-100 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-soft transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <a href={`tel:${settings.phone.replace(/\s+/g, "")}`}>
                    <Icons.Phone className="size-4 text-blue-600 animate-pulse" />
                    <span>Call Clinic</span>
                  </a>
                </Button>
              </div>
            </div>
          </FadeIn>

          {/* Key Results Stats Section (Glassmorphism) */}
          <FadeIn delay={0.25}>
            <div className="mt-10 rounded-[2rem] border border-blue-100/60 bg-white/65 backdrop-blur-md p-6 shadow-soft max-w-lg">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Clinical Excellence Indicators
              </div>
              <div className="grid gap-6 grid-cols-3">
                {[
                  { k: settings.experience || "10+ Yrs", v: "Expertise", barWidth: "w-4/5" },
                  { k: "5,000+", v: "Smiles restored", barWidth: "w-[95%]" },
                  { k: "100%", v: "Sterile & safe", barWidth: "w-full" },
                ].map((s) => (
                  <div key={s.v} className="flex flex-col">
                    <div className="font-display text-lg sm:text-xl font-extrabold text-slate-800 leading-none">
                      {s.k}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-1 leading-tight min-h-[16px]">
                      {s.v}
                    </div>
                    <div className="mt-2.5 h-1.5 w-full rounded-full bg-blue-100/30 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-500 ${s.barWidth}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Right Doctor Image Column with Animated Blobs */}
        <div className="lg:col-span-5 order-2 flex flex-col justify-center items-center relative">
          <FadeIn y={16}>
            <div className="relative mx-auto w-full max-w-[240px] sm:max-w-[310px] lg:max-w-none">
              {/* Subtle animated blobs */}
              <motion.div
                animate={{
                  scale: [1, 1.06, 1],
                  rotate: [0, 15, 0],
                  borderRadius: [
                    "42% 58% 70% 30% / 45% 45% 55% 55%",
                    "50% 50% 50% 50%",
                    "42% 58% 70% 30% / 45% 45% 55% 55%",
                  ],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -inset-8 -z-10 bg-gradient-to-tr from-blue-300/25 via-cyan-300/15 to-transparent blur-3xl"
              />

              <div className="relative overflow-hidden rounded-[2.2rem] border border-blue-100 bg-white p-3.5 shadow-elevated group">
                <img
                  src={settings.heroImage || doctorHero}
                  alt={`${settings.doctorName}, senior dentist at ${settings.clinicName}`}
                  width={1200}
                  height={1408}
                  className="aspect-[4/5] w-full object-cover rounded-[1.8rem] transition-all duration-700"
                />

                {/* Rating Badge Overlay */}
                <div className="absolute top-6 left-6 rounded-xl bg-white/95 backdrop-blur-md border border-blue-100/80 px-3 py-1.5 shadow-soft flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="text-[10px] font-black text-slate-800 tracking-tight border-l border-slate-100 pl-2">
                    4.9 Rated
                  </div>
                </div>

                {/* Specialization Badge Overlay */}
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/95 backdrop-blur-md border border-blue-100/80 p-3 shadow-soft flex items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 shadow-sm">
                    <BadgeCheck className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-slate-800 leading-tight truncate">
                      {settings.doctorName}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">
                      Senior Dentist • {settings.qualification}
                    </div>
                  </div>
                </div>

                {/* Floating tags */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute left-[-1rem] top-[30%] hidden lg:flex items-center gap-1.5 rounded-full border border-blue-100 bg-white/95 backdrop-blur-md px-3.5 py-1.5 shadow-card"
                >
                  <div className="size-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[10px] font-extrabold text-slate-700">Trusted</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="absolute right-[-1rem] top-[15%] hidden lg:flex items-center gap-1.5 rounded-full border border-blue-100 bg-white/95 backdrop-blur-md px-3.5 py-1.5 shadow-card"
                >
                  <div className="size-2 rounded-full bg-cyan-500" />
                  <span className="text-[10px] font-extrabold text-slate-700">Certified</span>
                </motion.div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ---------------- AVAILABILITY + NOTICE ---------------- */

function AvailabilityAndNotice({
  availability,
  notice,
}: {
  availability: DoctorAvailability;
  notice: NoticeBoard;
}) {
  const getAvailabilityLabel = () => {
    switch (availability.status) {
      case "available":
        return { label: "Available Today", color: "bg-emerald-500" };
      case "unavailable":
        return { label: "Unavailable Today", color: "bg-destructive" };
      case "vacation":
        return { label: "On Vacation", color: "bg-amber-500" };
      case "holiday":
        return { label: "Holiday (Closed)", color: "bg-amber-500" };
      case "emergency-leave":
        return { label: "Emergency Leave", color: "bg-destructive" };
      default:
        return { label: "Available Today", color: "bg-emerald-500" };
    }
  };

  const statusInfo = getAvailabilityLabel();

  return (
    <section className="relative z-20 -mt-12 md:-mt-20 pb-10 bg-[#FCFCFD]">
      <div className="container-page grid gap-6 md:grid-cols-3 items-stretch">
        <FadeIn className="md:col-span-2 flex flex-col">
          <div className="flex-1 rounded-[2.2rem] border border-blue-100/60 bg-white p-6 md:p-8 shadow-elevated hover:shadow-[0_24px_50px_rgba(37,99,235,0.06)] transition-all duration-300 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <span className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100/40">
                  <Clock className="size-5.5" />
                </span>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Doctor Availability
                  </div>
                  <div className="font-display font-extrabold text-slate-800 flex items-center gap-2 mt-0.5">
                    <span className={`size-2.5 rounded-full ${statusInfo.color} animate-pulse`} />
                    {statusInfo.label}
                  </div>
                </div>
              </div>
              <Button
                asChild
                variant="ghost"
                className="rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 font-bold text-xs gap-1 cursor-pointer"
              >
                <Link to="/book">
                  Book Custom Slot <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#FCFCFD] p-4 border border-blue-100/20 hover:border-blue-100/50 transition-all duration-300 group">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Morning Session
                </div>
                <div className="mt-1.5 font-display text-base md:text-lg font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {availability.morningSession}
                </div>
              </div>
              <div className="rounded-2xl bg-[#FCFCFD] p-4 border border-blue-100/20 hover:border-blue-100/50 transition-all duration-300 group">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Evening Session
                </div>
                <div className="mt-1.5 font-display text-base md:text-lg font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {availability.eveningSession}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.05} className="flex flex-col">
          <div className="flex-1 rounded-[2rem] border border-blue-200/20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white p-6 md:p-8 shadow-[0_12px_32px_rgba(37,99,235,0.22)] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-16 -top-16 size-36 rounded-full bg-white/5 blur-2xl group-hover:scale-110 transition-transform duration-500" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-white shadow-sm">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-widest text-blue-200 block">
                    Information
                  </span>
                  <span className="font-display font-extrabold text-base tracking-wide mt-0.5 block">
                    Today's Notice
                  </span>
                </div>
              </div>
              <p className="mt-4.5 text-xs sm:text-sm leading-relaxed text-blue-50/90 font-medium">
                {notice.content}
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ---------------- ABOUT DOCTOR ---------------- */

function AboutDoctor({ settings }: { settings: ClinicSettings }) {
  return (
    <section
      id="about-doctor"
      className="py-24 md:py-32 bg-[#FCFCFD] relative overflow-hidden border-b border-blue-100/20"
    >
      <DecorativeElements />

      <div className="container-page grid gap-12 lg:grid-cols-12 items-center">
        <FadeIn className="lg:col-span-5">
          <div className="relative group">
            {/* Ambient background glow ring */}
            <div
              className="absolute -inset-4 rounded-[2.8rem] bg-gradient-to-tr from-blue-400/10 via-cyan-400/5 to-transparent blur-2xl transition-all duration-700 group-hover:scale-105"
              aria-hidden
            />

            {/* The Floating Frame */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-100 bg-white p-3.5 shadow-elevated group-hover:shadow-[0_20px_50px_rgba(37,99,235,0.08)] transition-all duration-300">
              <img
                src={settings.heroImage || doctorHero}
                alt={`${settings.doctorName} in the clinic`}
                width={1200}
                height={1408}
                loading="lazy"
                className="w-full aspect-[4/5] object-cover rounded-[2rem] transition-transform duration-700 group-hover:scale-[1.02]"
              />

              {/* Luxury Floating Experience Badge */}
              <div className="absolute bottom-6 right-6 rounded-2xl bg-white/95 backdrop-blur-md border border-blue-100 px-4.5 py-3 shadow-card flex items-center gap-3 hover:scale-105 transition-transform duration-300">
                <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600 shrink-0 shadow-sm">
                  <Award className="size-5" />
                </span>
                <div>
                  <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 leading-none">
                    Experience
                  </div>
                  <div className="mt-1 text-sm font-black font-display text-slate-800 leading-none">
                    {settings.experience || "10+ Years"}
                  </div>
                </div>
              </div>

              {/* Luxury Trust Badge */}
              <div className="absolute top-6 left-6 rounded-2xl bg-white/90 backdrop-blur-md border border-blue-100 px-4 py-2 shadow-card flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-800 tracking-wide uppercase">
                  Available Today
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="lg:col-span-7 text-left">
          <FadeIn>
            {/* Premium Gold Star Rating Row */}
            <div className="flex items-center gap-1.5 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-blue-700 ml-1.5 uppercase tracking-wider">
                Top Rated Specialist
              </span>
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Meet Our Chief Doctor
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950">
              Meet {settings.doctorName}
            </h2>
            <p className="mt-5 text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-medium">
              {settings.aboutDoctor}
            </p>
          </FadeIn>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { icon: Award, title: settings.qualification, sub: "Expert Qualifications" },
              { icon: Users, title: "5,000+ patients", sub: "Trusted Track Record" },
              { icon: Stethoscope, title: "Special interest", sub: "Kids & senior care" },
              { icon: HeartHandshake, title: "Gentle approach", sub: "Pain-free treatments" },
            ].map((f) => (
              <FadeIn key={f.sub} delay={0.05}>
                <div className="group rounded-2xl border border-blue-100 bg-white p-4 flex items-start gap-3.5 shadow-soft hover:shadow-card hover:border-blue-200 transition-all duration-300">
                  <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white shrink-0 shadow-sm">
                    <f.icon className="size-5.5" />
                  </span>
                  <div>
                    <div className="font-display font-extrabold text-[15px] text-slate-800 leading-snug">
                      {f.title}
                    </div>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5">{f.sub}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- SERVICES ---------------- */

function Services({ services }: { services: DentalService[] }) {
  const seenNames = new Set<string>();
  const visibleServices = services
    .filter((s) => {
      if (!s.isVisible) return false;
      const normalizedName = s.name.trim().toLowerCase();
      if (seenNames.has(normalizedName)) return false;
      seenNames.add(normalizedName);
      return true;
    })
    .slice(0, 5);

  return (
    <section
      id="services"
      className="py-24 md:py-32 bg-[#FCFCFD] relative overflow-hidden border-b border-blue-100/20"
    >
      <DecorativeElements />
      <div className="container-page">
        <FadeIn>
          <div className="max-w-3xl text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Our Clinical Services
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
              A full suite of world-class dental care —
              <br />
              tailored to your unique smile
            </h2>
            <p className="mt-4 text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
              Experience the absolute highest standard of care with transparent pricing, gentle
              procedures, and state-of-the-art diagnostics.
            </p>
          </div>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:grid-cols-3">
          {visibleServices.map((s, i) => {
            const indexStr = String(i + 1).padStart(2, "0");

            // Alternate backgrounds: Light Blue, White, Very Light Cyan, Soft Lavender, Soft Mint, Light Sky
            let bgClass = "";
            let borderClass = "";
            let accentShape = "";
            let iconBg = "";

            if (i % 6 === 0) {
              bgClass = "bg-gradient-to-br from-[#EAF2FF]/60 via-white to-blue-50/25";
              borderClass = "border-blue-100/40";
              accentShape = "bg-blue-500/4";
              iconBg = "bg-blue-50 text-blue-600 border-blue-100/30";
            } else if (i % 6 === 1) {
              bgClass = "bg-gradient-to-br from-white to-slate-50/60";
              borderClass = "border-slate-100/80";
              accentShape = "bg-slate-400/4";
              iconBg = "bg-slate-50 text-slate-600 border-slate-100/40";
            } else if (i % 6 === 2) {
              bgClass = "bg-gradient-to-br from-[#E0FAFF]/60 via-white to-cyan-50/25";
              borderClass = "border-cyan-100/30";
              accentShape = "bg-cyan-500/4";
              iconBg = "bg-cyan-50 text-cyan-600 border-cyan-100/30";
            } else if (i % 6 === 3) {
              bgClass = "bg-gradient-to-br from-[#F5EFFF]/50 via-white to-purple-50/20";
              borderClass = "border-purple-100/30";
              accentShape = "bg-purple-500/4";
              iconBg = "bg-purple-50 text-purple-600 border-purple-100/30";
            } else if (i % 6 === 4) {
              bgClass = "bg-gradient-to-br from-[#E8FFF5]/50 via-white to-emerald-50/20";
              borderClass = "border-emerald-100/30";
              accentShape = "bg-emerald-500/4";
              iconBg = "bg-emerald-50 text-emerald-600 border-emerald-100/30";
            } else {
              bgClass = "bg-gradient-to-br from-[#E0F2FE]/50 via-white to-sky-50/20";
              borderClass = "border-sky-100/35";
              accentShape = "bg-sky-500/4";
              iconBg = "bg-sky-50 text-sky-600 border-sky-100/30";
            }

            return (
              <FadeIn key={s.id || s.name} delay={i * 0.03}>
                <motion.div
                  whileHover={{ y: -10, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`group relative h-full rounded-[2.2rem] p-8 md:p-10 flex flex-col justify-between border ${borderClass} ${bgClass} shadow-soft hover:shadow-elevated transition-shadow duration-300 overflow-hidden`}
                >
                  {/* Small decorative abstract shape in the top-right corner */}
                  <div
                    className={`absolute -right-4 -top-4 size-24 rounded-full ${accentShape} pointer-events-none transition-transform duration-500 group-hover:scale-125`}
                  />
                  <div className="absolute left-0 top-12 bottom-12 w-[3px] rounded-r-md bg-blue-500/5 group-hover:bg-blue-600/60 transition-colors" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <span className="text-2xl md:text-3xl font-black font-mono leading-none tracking-tight text-slate-200">
                        {indexStr}
                      </span>
                      <span
                        className={`grid size-14 place-items-center rounded-full border shadow-inner transition-all duration-300 ${iconBg} group-hover:scale-110`}
                      >
                        <ServiceIcon
                          name={s.iconName}
                          className="size-7 transition-transform duration-300 group-hover:rotate-6"
                        />
                      </span>
                    </div>

                    <h3 className="mt-8 font-display font-extrabold text-xl sm:text-2xl text-slate-950 leading-tight">
                      {s.name}
                    </h3>
                    <p className="mt-4 text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                      {s.desc}
                    </p>

                    {s.imageUrl && (
                      <div className="mt-6 overflow-hidden rounded-2xl border border-blue-100/20">
                        <img
                          src={s.imageUrl}
                          alt={s.name}
                          loading="lazy"
                          className="w-full h-28 sm:h-36 object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-10 pt-6 border-t border-slate-100/60 flex items-center justify-between gap-3 relative z-10">
                    <Link
                      to="/book"
                      className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-600 hover:text-blue-700 transition-all bg-blue-50/70 hover:bg-blue-100/90 px-4.5 py-2.5 rounded-full cursor-pointer shadow-sm"
                    >
                      Book Slot
                      <Icons.ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <span className="text-[11px] sm:text-xs font-bold px-3.5 py-2 rounded-full bg-slate-50 border border-slate-100/50 text-slate-600 leading-none">
                      from {s.price}
                    </span>
                  </div>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- ABOUT CLINIC ---------------- */

function AboutClinic() {
  const facilities = [
    "State-of-the-art sterilization",
    "Digital X-ray & OPG imaging",
    "Comfortable AC waiting lounge",
    "Wheelchair accessible",
    "Ample free parking",
    "Card & UPI payments accepted",
  ];
  return (
    <section
      id="about-clinic"
      className="py-24 md:py-32 relative overflow-hidden bg-[#FCFCFD] border-b border-blue-100/20"
    >
      <DecorativeElements />

      <div className="container-page grid gap-12 lg:grid-cols-2 items-center">
        <FadeIn>
          <div className="relative group">
            <div className="absolute -inset-4 rounded-[2.8rem] bg-gradient-to-tr from-blue-400/10 via-cyan-400/5 to-transparent blur-2xl transition-all duration-700" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-blue-100 bg-white p-3.5 shadow-elevated transition-transform duration-300 group-hover:shadow-[0_20px_40px_rgba(37,99,235,0.06)]">
              <img
                src={galTreatment}
                alt="Modern dental treatment room"
                width={1200}
                height={900}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover rounded-[2rem] transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </FadeIn>
        <div className="text-left">
          <FadeIn>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Our Clinic Facility
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950">
              A calm space, thoughtfully designed
            </h2>
            <p className="mt-4 text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
              Our clinic is built around your absolute comfort — bright, exceptionally quiet, and
              spotlessly clean, with modern equipment and a clinical team that genuinely listens.
            </p>
          </FadeIn>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {facilities.map((f, i) => (
              <FadeIn key={f} delay={i * 0.03}>
                <div className="flex items-center gap-3 bg-white border border-blue-50 p-3 rounded-2xl shadow-sm hover:border-blue-200 transition-colors group">
                  <span className="grid size-7 place-items-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white shrink-0 shadow-sm transition-all duration-300">
                    <BadgeCheck className="size-4" />
                  </span>
                  <span className="text-slate-700 text-xs sm:text-sm font-semibold">{f}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHY CHOOSE US ---------------- */

function CountingNumber({ value }: { value: string }) {
  const [count, setCount] = useState(0);
  const target = parseFloat(value.replace(/[^0-9.]/g, ""));
  const suffix = value.replace(/[0-9.]/g, "");

  useEffect(() => {
    if (isNaN(target)) return;
    let start = 0;
    const duration = 1500; // 1.5 seconds duration
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start * 10) / 10);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  // Format count to match decimal format if needed
  const displayValue = value.includes(".") ? count.toFixed(1) : Math.floor(count);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
}

function WhyChooseUs() {
  const advantages = [
    {
      num: "10+",
      label: "Years of Experience",
      desc: "Expert care built on over a decade of clinical excellence.",
      borderGradient: "border-t-blue-500",
      icon: Award,
    },
    {
      num: "15+",
      label: "Specialist Services",
      desc: "From routine cleanings to advanced cosmetics and oral surgery.",
      borderGradient: "border-t-cyan-500",
      icon: Stethoscope,
    },
    {
      num: "95%",
      label: "Patient Satisfaction",
      desc: "Our patients love our gentle approach and painless procedures.",
      borderGradient: "border-t-emerald-500",
      icon: Smile,
    },
    {
      num: "9.8",
      label: "Diagnostic Rating",
      desc: "Highly precise state-of-the-art dental imaging & diagnostics.",
      borderGradient: "border-t-indigo-500",
      icon: Zap,
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#F2F8FF] relative overflow-hidden border-b border-blue-100/20">
      <DecorativeElements />
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Left Column - Beautiful Illustrated Card */}
          <FadeIn className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white p-8 md:p-10 shadow-[0_24px_50px_rgba(37,99,235,0.12)] group">
              <div className="absolute -right-16 -top-16 size-48 rounded-full bg-white/5 blur-3xl transition-all duration-500 group-hover:scale-110" />
              <div className="absolute -left-16 -bottom-16 size-48 rounded-full bg-blue-400/10 blur-3xl transition-all duration-500 group-hover:scale-110" />

              <div className="relative z-10 text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 bg-white/10 px-3.5 py-1.5 rounded-full">
                  Advantages
                </span>
                <h3 className="mt-5 font-display text-2xl md:text-3xl font-extrabold leading-tight">
                  Premium Dental Care
                </h3>
                <p className="mt-3 text-sm text-blue-50/90 leading-relaxed font-medium">
                  We combine clinical precision with warm, family-oriented service to make your
                  visit exceptionally comfortable.
                </p>

                {/* Doctor Picture Box inside the card */}
                <div className="mt-8 relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 aspect-[4/3] flex items-center justify-center">
                  <img
                    src={galPatient}
                    alt="Pristine clinical care"
                    loading="lazy"
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Floating Tags over Doctor Picture inside the card */}
                  <div className="absolute bottom-3 left-3 rounded-lg bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-soft hover:scale-105 transition-transform">
                    Experienced Doctors
                  </div>
                  <div className="absolute top-3 right-3 rounded-lg bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-soft hover:scale-105 transition-transform">
                    Certified Clinic
                  </div>
                  <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-soft hover:scale-105 transition-transform">
                    Modern Equipment
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right Column - Beautiful Statistics Grid */}
          <div className="lg:col-span-7 text-left">
            <FadeIn>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Why Choose Us
              </span>
              <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950">
                A clinic designed around you
              </h2>
              <p className="mt-4 text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
                We believe everyone deserves access to exceptional dental care in an environment
                that feels calm, modern, and trustworthy.
              </p>
            </FadeIn>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {advantages.map((adv, idx) => (
                <FadeIn key={adv.label} delay={idx * 0.05}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.015 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={`group rounded-[2.2rem] border border-cyan-100/40 bg-gradient-to-br from-[#E0FAFF]/50 via-white to-cyan-50/20 p-6 md:p-8 shadow-soft hover:shadow-elevated hover:border-cyan-200/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden border-t-4 ${adv.borderGradient}`}
                  >
                    <div className="absolute -right-8 -top-8 size-24 rounded-full bg-cyan-100/10 group-hover:bg-cyan-100/25 blur-xl transition-all duration-500" />

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="grid size-12 place-items-center rounded-2xl bg-white/90 border border-cyan-100/30 text-cyan-600 transition-all duration-300 group-hover:bg-cyan-600 group-hover:text-white shadow-sm">
                          <adv.icon className="size-6" />
                        </span>
                        <span className="font-display text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-600 tracking-tight">
                          <CountingNumber value={adv.num} />
                        </span>
                      </div>
                      <h4 className="mt-5 font-display font-extrabold text-base text-slate-800 leading-snug">
                        {adv.label}
                      </h4>
                      <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                        {adv.desc}
                      </p>
                    </div>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- GALLERY ---------------- */

function Gallery({ gallery }: { gallery: GalleryItem[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  return (
    <section
      id="gallery"
      className="py-24 md:py-32 bg-[#F8FAFC] relative overflow-hidden border-b border-blue-100/20"
    >
      <DecorativeElements />
      <div className="container-page">
        <FadeIn>
          <div className="max-w-2xl text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Clinic Gallery
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950">
              A peek inside our premium facility
            </h2>
            <p className="mt-4 text-slate-600 text-sm md:text-base leading-relaxed font-medium">
              We maintain pristine cleanliness and state-of-the-art equipment to ensure your
              absolute comfort, premium safety, and clinical ease.
            </p>
          </div>
        </FadeIn>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {gallery.map((g, i) => {
            const finalSrc = g.imageUrl.startsWith("/src")
              ? localGalleryFallbackMap[i] || g.imageUrl
              : g.imageUrl;

            return (
              <FadeIn
                key={g.id || g.imageUrl}
                delay={i * 0.04}
                className={g.tall ? "row-span-2" : ""}
              >
                <button
                  onClick={() => setLightbox(finalSrc)}
                  className={`group relative w-full overflow-hidden rounded-2xl md:rounded-[2rem] border border-blue-50 bg-white shadow-soft hover:shadow-[0_20px_40px_rgba(37,99,235,0.08)] transition-all block cursor-zoom-in ${
                    g.tall ? "aspect-[3/4] md:aspect-[3/5]" : "aspect-[4/3]"
                  }`}
                >
                  <img
                    src={finalSrc}
                    alt={g.alt}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Elegant overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4.5">
                    <span className="text-white text-xs font-medium translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      {g.alt || "View Facility"}
                    </span>
                    <span className="grid size-8 place-items-center rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/25 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Icons.Eye className="size-4" />
                    </span>
                  </div>
                  <span className="sr-only">{g.alt}</span>
                </button>
              </FadeIn>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md grid place-items-center p-4 cursor-zoom-out"
          >
            <button
              aria-label="Close"
              className="absolute top-5 right-5 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X className="size-5" />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={lightbox}
              alt=""
              className="max-h-[86vh] max-w-[92vw] rounded-2xl object-contain border border-white/10 shadow-elevated"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */

function Testimonials({ reviews }: { reviews: Review[] }) {
  const [i, setI] = useState(0);
  if (reviews.length === 0) return null;
  const r = reviews[i] || reviews[0];

  const handleNext = () => {
    setI((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setI((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section
      id="testimonials"
      className="py-24 md:py-32 bg-[#FCFCFD] relative overflow-hidden border-b border-blue-100/20"
    >
      <DecorativeElements />
      <div className="container-page relative">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Patient Stories
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950">
              What our patients say
            </h2>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="mt-12 max-w-4xl mx-auto relative px-4 md:px-16">
            {/* Elegant Double-Layered Glass / Gradient Border Card */}
            <div className="p-[1.5px] rounded-[2.6rem] bg-gradient-to-tr from-blue-200 via-cyan-100 to-indigo-200 shadow-elevated">
              <div className="rounded-[2.5rem] bg-white/95 backdrop-blur-md p-8 md:p-14 relative overflow-hidden text-left">
                {/* Giant Luxury Quote mark */}
                <div className="absolute top-6 left-6 text-blue-500/10 select-none">
                  <Quote className="size-20 fill-current" />
                </div>

                <div className="relative z-10 min-h-[160px] md:min-h-[140px] flex flex-col justify-between">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className="flex gap-1 mb-6">
                        {[...Array(r.stars)].map((_, k) => (
                          <Star key={k} className="size-5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-lg md:text-2xl md:leading-relaxed text-slate-700 font-display font-semibold italic">
                        “{r.body}”
                      </p>
                      <div className="mt-8 flex items-center gap-4">
                        {/* Avatar with luxury glowing ring */}
                        <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-blue-500 via-sky-400 to-cyan-400 shadow-sm shrink-0">
                          <div className="size-11 rounded-full bg-white flex items-center justify-center font-bold font-display text-blue-600 text-sm shadow-inner shrink-0">
                            {r.name.slice(0, 2).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="font-extrabold text-base text-slate-800">{r.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-0.5">
                            Verified Patient
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom Pagination Dots */}
                <div className="mt-10 flex items-center gap-2 justify-center">
                  {reviews.map((_, k) => (
                    <button
                      key={k}
                      onClick={() => setI(k)}
                      aria-label={`Show review ${k + 1}`}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        k === i ? "w-10 bg-blue-600" : "w-2.5 bg-slate-200 hover:bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Navigation Controls */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 md:-left-4 z-20">
              <button
                onClick={handlePrev}
                aria-label="Previous review"
                className="grid size-11 md:size-12 place-items-center rounded-2xl bg-white border border-blue-50 shadow-soft text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-[0_8px_20px_rgba(37,99,235,0.15)] transition-all cursor-pointer animate-none"
              >
                <Icons.ArrowLeft className="size-4 md:size-5" />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-0 md:-right-4 z-20">
              <button
                onClick={handleNext}
                aria-label="Next review"
                className="grid size-11 md:size-12 place-items-center rounded-2xl bg-white border border-blue-50 shadow-soft text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-[0_8px_20px_rgba(37,99,235,0.15)] transition-all cursor-pointer animate-none"
              >
                <Icons.ArrowRight className="size-4 md:size-5" />
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

const FAQS = [
  {
    q: "Do I need an appointment?",
    a: "Appointments are recommended so you don't have to wait. You can also walk in — we'll accommodate you as soon as possible.",
  },
  {
    q: "Do you accept walk-ins?",
    a: "Yes. Walk-ins are welcome during clinic hours, though scheduled patients are seen first.",
  },
  {
    q: "What payment methods are accepted?",
    a: "Cash, all major cards, UPI, and net banking. EMI is available for treatments above ₹10,000.",
  },
  {
    q: "How long does a root canal take?",
    a: "Most single-sitting root canals are completed in 45–90 minutes, depending on the tooth.",
  },
  {
    q: "Is parking available?",
    a: "Yes, we have free two-wheeler and car parking right in front of the clinic.",
  },
  {
    q: "Do you treat children?",
    a: "Absolutely. Dr. Kalhyanie has a special interest in gentle pediatric dentistry.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="container-page grid gap-10 lg:grid-cols-12 text-left">
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <FadeIn>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              FAQ
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
              Answers to common questions
            </h2>
            <p className="mt-4 text-slate-600 text-sm md:text-base leading-relaxed font-medium">
              Can't find what you're looking for? Just click the call icon to get in touch with our
              clinical team — we are always happy to help.
            </p>
          </FadeIn>
        </div>
        <div className="lg:col-span-8 flex flex-col gap-4">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <FadeIn key={f.q} delay={i * 0.03}>
                <div
                  className={`rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-blue-200 ring-1 ring-blue-100/50 bg-gradient-to-br from-white to-blue-50/10 shadow-soft"
                      : "border-slate-100 bg-white hover:border-blue-200 shadow-soft"
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 py-5 px-5 md:px-7 text-left cursor-pointer group"
                  >
                    <span className="font-display font-extrabold text-sm md:text-[17px] text-slate-800 transition-colors group-hover:text-blue-600">
                      {f.q}
                    </span>
                    <span
                      className={`grid size-8 place-items-center rounded-xl transition-colors shrink-0 shadow-sm ${
                        isOpen
                          ? "bg-blue-600 text-white"
                          : "bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                      }`}
                    >
                      <ChevronDown
                        className={`size-4.5 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 px-5 md:px-7 text-xs sm:text-sm md:text-[15px] text-slate-600 leading-relaxed border-t border-slate-100/50 pt-4 font-medium">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CONTACT + MAP ---------------- */

function Contact({ settings }: { settings: ClinicSettings }) {
  return (
    <section id="contact" className="py-20 md:py-28 bg-white relative overflow-hidden">
      <div className="absolute -top-12 -left-12 size-72 rounded-full bg-blue-300/10 blur-3xl -z-10" />
      <div className="absolute -bottom-12 -right-12 size-72 rounded-full bg-cyan-300/10 blur-3xl -z-10" />

      <div className="container-page">
        <FadeIn>
          <div className="max-w-2xl text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Visit our facility
            </span>
            <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
              We'd love to welcome you
            </h2>
            <p className="mt-4 text-slate-600 text-sm md:text-lg leading-relaxed font-medium">
              Walk in or reach us on any channel — we usually reply within minutes and accommodate
              sudden slots gracefully.
            </p>
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-8 lg:grid-cols-5 text-left">
          <FadeIn className="lg:col-span-2">
            <div className="rounded-[2.5rem] border border-blue-100 bg-white p-6 md:p-8 shadow-soft h-full flex flex-col justify-between gap-6 relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(37,99,235,0.06)] transition-all duration-300">
              <div className="absolute -right-8 -top-8 size-24 rounded-full bg-blue-50/20 group-hover:bg-blue-50/40 blur-xl transition-all duration-500" />

              <div className="flex flex-col gap-6">
                {[
                  {
                    icon: Phone,
                    label: "Direct Line",
                    value: settings.phone,
                    href: `tel:${settings.phone.replace(/\s+/g, "")}`,
                    highlight: true,
                  },
                  {
                    icon: Mail,
                    label: "Email Address",
                    value: settings.email,
                    href: `mailto:${settings.email}`,
                  },
                  { icon: MapPin, label: "Clinic Location", value: settings.address },
                  { icon: Clock, label: "Consultation Hours", value: settings.openingHours },
                  {
                    icon: LifeBuoy,
                    label: "Emergency Support",
                    value: settings.emergencyContact,
                    href: `tel:${settings.emergencyContact.replace(/\s+/g, "")}`,
                  },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-4">
                    <span
                      className={`grid size-11 place-items-center rounded-2xl shrink-0 transition-transform duration-300 hover:scale-105 shadow-sm ${c.highlight ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]" : "bg-blue-50 text-blue-600"}`}
                    >
                      <c.icon className="size-5.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 leading-none">
                        {c.label}
                      </div>
                      {c.href ? (
                        <a
                          href={c.href}
                          className="mt-1.5 block font-display font-extrabold text-sm md:text-base text-slate-800 hover:text-blue-600 transition-colors break-words"
                        >
                          {c.value}
                        </a>
                      ) : (
                        <div className="mt-1.5 font-display font-extrabold text-sm md:text-base text-slate-800/90 leading-relaxed">
                          {c.value}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                asChild
                size="lg"
                className="w-full mt-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_24px_rgba(37,99,235,0.2)] font-bold cursor-pointer h-12 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(37,99,235,0.3)]"
              >
                <Link to="/book" className="flex items-center justify-center gap-2">
                  <Calendar className="size-4.5" />
                  Schedule Visit
                </Link>
              </Button>
            </div>
          </FadeIn>

          <FadeIn className="lg:col-span-3" delay={0.05}>
            <div className="rounded-[2.5rem] border border-blue-100 bg-white p-3.5 shadow-soft overflow-hidden h-full min-h-[380px] group transition-all duration-300 hover:shadow-[0_20px_50px_rgba(37,99,235,0.06)]">
              <iframe
                title="Clinic location"
                className="w-full h-full min-h-[380px] rounded-[2rem] border-0 opacity-95 group-hover:opacity-100 transition-opacity duration-300"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={settings.googleMapsUrl}
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ---------------- APPOINTMENT CTA ---------------- */

function AppointmentCTA({ settings }: { settings: ClinicSettings }) {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-br from-[#0B1528] via-[#102A4E] to-[#0B1528] text-white">
      {/* Animated glowing decorative shapes */}
      <div className="absolute top-[-20%] left-[-10%] size-[500px] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] size-[500px] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse" />

      {/* Decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none select-none" />

      {/* Float plus icons */}
      <div className="absolute top-[20%] right-[15%] text-cyan-400/10 pointer-events-none select-none hidden md:block">
        <Icons.Plus className="size-10" strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-[20%] left-[15%] text-blue-400/10 pointer-events-none select-none hidden md:block">
        <Icons.Plus className="size-12" strokeWidth={1.5} />
      </div>

      <div className="container-page relative z-10 text-center max-w-4xl mx-auto">
        <FadeIn>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-4.5 py-2 text-xs font-bold text-blue-300 tracking-wider uppercase mb-8 shadow-sm">
            <Sparkles className="size-3.5 text-cyan-400 animate-pulse shrink-0" />
            <span>Premium Dental Experience</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-3xl mx-auto">
            Ready to experience
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 mt-2">
              painless, premium care?
            </span>
          </h2>

          <p className="mt-8 text-sm sm:text-base md:text-lg text-slate-300/90 leading-relaxed max-w-2xl mx-auto font-medium">
            Join thousands of satisfied families who trust Dr. Kalhyanie for their smiles. Book your
            session today and discover gentle, modern dentistry.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 max-w-md mx-auto">
            <Button
              asChild
              size="lg"
              className="rounded-full h-14 px-8 text-sm font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-[0_4px_24px_rgba(37,99,235,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              <Link to="/book">
                <span>Book Appointment Now</span>
                <ArrowRight className="size-4 text-white" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full h-14 px-8 text-sm font-bold border-white/20 bg-white/5 hover:bg-white/10 text-white shadow-soft transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
            >
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`}>
                <Phone className="size-4 text-cyan-300" />
                <span>Call {settings.phone}</span>
              </a>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ---------------- PAGE ---------------- */

function HomePage() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [services, setServices] = useState<DentalService[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [notice, setNotice] = useState<NoticeBoard | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash, loading]);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          fetchedSettings,
          fetchedServices,
          fetchedGallery,
          fetchedAvailability,
          fetchedNotice,
          fetchedReviews,
        ] = await Promise.all([
          getClinicSettings(),
          getServices(),
          getGallery(),
          getAvailability(),
          getNotice(),
          getApprovedReviews(),
        ]);

        setSettings(fetchedSettings);
        setServices(fetchedServices);
        setGallery(fetchedGallery);
        setAvailability(fetchedAvailability);
        setNotice(fetchedNotice);
        setReviews(fetchedReviews);
      } catch (error) {
        console.warn("Error loading home page data from Firestore:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground font-medium">Loading clinic details…</p>
      </div>
    );
  }

  const activeSettings = settings || {
    clinicName: "Dr. Kalhyanie Dental Clinic",
    doctorName: "Dr. Kalhyanie",
    qualification: "BDS, MDS",
    experience: "12+ Years",
    phone: "+91 96037 76252",
    whatsapp: "+91 96037 76252",
    email: "hello@kalhyaniedental.com",
    address:
      "Shop No. 2, Near Muthyalu Complex, Suraram Market Road, Fish Market Road, Suraram, Hyderabad-500055, Telangana",
    openingHours: "Mon – Sat • 9 AM – 8 PM",
    emergencyContact: "+91 96037 76252",
    googleMapsUrl: "https://maps.google.com/maps?q=17.540793,78.434383&z=17&output=embed",
    heroImage: "",
    logo: "",
    aboutDoctor: "A warm, family-focused dentist with over a decade of experience.",
    clinicDescription: "Providing gentle, affordable, and trusted dental care.",
  };

  const activeAvailability = availability || {
    morningSession: "9 AM – 1 PM",
    eveningSession: "4 PM – 8 PM",
    status: "available" as const,
  };

  const activeNotice = notice || {
    content: "Doctor will be available as per schedule.",
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero settings={activeSettings} availability={activeAvailability} notice={activeNotice} />
        <AvailabilityAndNotice availability={activeAvailability} notice={activeNotice} />
        <AboutDoctor settings={activeSettings} />
        <Services services={services} />
        <AboutClinic />
        <WhyChooseUs />
        <Gallery gallery={gallery} />
        <Testimonials reviews={reviews} />
        <AppointmentCTA settings={activeSettings} />
        <FAQ />
        <Contact settings={activeSettings} />
      </main>
      <Footer />
      <FloatingActions />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dentist",
            name: activeSettings.clinicName,
            image: activeSettings.heroImage || "https://kalhyaniedental.com/og.jpg",
            telephone: activeSettings.phone,
            address: {
              "@type": "PostalAddress",
              streetAddress: activeSettings.address,
              addressLocality: "New Delhi",
              postalCode: "110016",
              addressCountry: "IN",
            },
            openingHours: "Mo-Sa 09:00-20:00",
            priceRange: "₹₹",
          }),
        }}
      />
    </div>
  );
}

// Inline fallback loader icon
function Loader2({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
