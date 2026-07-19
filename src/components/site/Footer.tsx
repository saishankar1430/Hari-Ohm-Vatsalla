import { useState, useEffect } from "react";
import { Sparkles, MapPin, Phone, Mail, Instagram, Facebook, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";

function ClinicStatus() {
  const [status, setStatus] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });

  useEffect(() => {
    function updateStatus() {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours + minutes / 60;

      if (day === 0) {
        setStatus({
          isOpen: false,
          message: "Closed (Opens Mon 9:00 AM)",
        });
      } else {
        if (currentTime >= 9 && currentTime < 20) {
          setStatus({
            isOpen: true,
            message: "Open (Closes at 8:00 PM)",
          });
        } else if (currentTime < 9) {
          setStatus({
            isOpen: false,
            message: "Closed (Opens today at 9:00 AM)",
          });
        } else {
          if (day === 6) {
            setStatus({
              isOpen: false,
              message: "Closed (Opens Mon 9:00 AM)",
            });
          } else {
            setStatus({
              isOpen: false,
              message: "Closed (Opens tomorrow at 9:00 AM)",
            });
          }
        }
      }
    }

    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-blue-600/10 p-3 border border-blue-600/20">
      <div className="relative flex size-2 items-center justify-center shrink-0">
        {status.isOpen ? (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-blue-400"></span>
          </>
        ) : (
          <span className="relative inline-flex size-2 rounded-full bg-amber-500"></span>
        )}
      </div>
      <div className="flex flex-col min-w-0 leading-tight">
        <span className="text-[11px] font-bold text-slate-100">
          {status.isOpen ? "OPEN NOW" : "CLOSED NOW"}
        </span>
        <span className="text-[10px] text-slate-300 font-mono mt-0.5">{status.message}</span>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[#1E2E4A] bg-gradient-to-br from-[#070B14] via-[#0D1525] to-[#070B14] text-slate-100">
      <div className="container-page py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-soft">
                <Sparkles className="size-4.5" strokeWidth={2.5} />
              </span>
              <span className="font-display font-bold text-base leading-tight text-white flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-400 leading-none">
                  Hari Ohm
                </span>
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight leading-normal">
                  Vatsalla Dental Clinic
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-300 max-w-xs leading-relaxed">
              Gentle, trusted dental care for families in your neighborhood.
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href="#"
                aria-label="Instagram"
                className="grid size-9 place-items-center rounded-full border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="grid size-9 place-items-center rounded-full border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Facebook className="size-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about-doctor" className="hover:text-white transition-colors">
                  About Doctor
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">
                  Gallery
                </a>
              </li>
              <li>
                <Link to="/book" className="hover:text-white transition-colors">
                  Book Appointment
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-white">Working Hours</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-300">
              <li className="flex justify-between items-center gap-4 border-b border-slate-800 pb-1.5">
                <span>Mon – Sat</span>
                <span className="text-white font-medium">9:00 AM – 8:00 PM</span>
              </li>
              <li className="flex justify-between items-center gap-4 border-b border-slate-800 pb-1.5">
                <span>Sunday</span>
                <span className="text-destructive font-medium text-xs bg-destructive/20 px-2 py-0.5 rounded">
                  Closed
                </span>
              </li>
              <li className="flex justify-between items-center gap-4 pb-0.5">
                <span>Emergency</span>
                <span className="text-blue-400 font-medium text-xs bg-blue-600/20 px-2 py-0.5 rounded animate-pulse">
                  24/7 Available
                </span>
              </li>
            </ul>
            <ClinicStatus />
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-white">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="size-4 mt-0.5 text-primary shrink-0" />
                <span>
                  Shop No. 2, Near Muthyalu Complex, Suraram Market Road, Fish Market Road, Suraram,
                  Hyderabad-500055, Telangana
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary shrink-0" />
                <a href="tel:+919603776252" className="hover:text-white">
                  +91 96037 76252
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary shrink-0" />
                <a href="mailto:hello@kalhyaniedental.com" className="hover:text-white">
                  hello@kalhyaniedental.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Hari Ohm Vatsalla Dental Clinic. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
