import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import {
  Menu,
  X,
  Sparkles,
  LogOut,
  LayoutDashboard,
  Calendar,
  User,
  Home,
  Phone,
  Image as ImageIcon,
  Stethoscope,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LoginDialog } from "./LoginDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const links = [
  { label: "Home", href: "/#home" },
  { label: "About Doctor", href: "/#about-doctor" },
  { label: "Services", href: "/#services" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const { user, profile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("/#home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);

      // Scroll spy active tab highlighting
      const scrollPos = window.scrollY + 120;
      const hashLinks = ["home", "about-doctor", "services", "gallery", "contact"];

      for (const sec of hashLinks) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(`/#${sec}`);
            return;
          }
        }
      }
      if (window.scrollY < 100) {
        setActiveSection("/#home");
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isHashLink = href.startsWith("/#");
    if (isHashLink && location.pathname === "/") {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-4 inset-x-4 md:inset-x-8 z-50 mx-auto max-w-[76rem] transition-all duration-300 ${
          scrolled
            ? "rounded-3xl md:rounded-full border border-slate-200/50 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 text-slate-900 dark:text-white backdrop-blur-xl shadow-elevated"
            : "rounded-3xl md:rounded-full border border-slate-800/40 bg-slate-950/75 text-white backdrop-blur-xl shadow-sm"
        }`}
      >
        <div className="w-full flex h-14 md:h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="flex flex-col leading-none">
              <span
                className={`font-sans text-[9px] md:text-[10px] uppercase tracking-[0.25em] font-extrabold transition-colors duration-300 ${
                  scrolled ? "text-blue-600 dark:text-blue-400" : "text-blue-400"
                }`}
              >
                Hari Ohm
              </span>
              <span
                className={`font-display font-extrabold text-sm sm:text-base md:text-lg tracking-tight transition-colors duration-300 ${
                  scrolled ? "text-slate-900 dark:text-white" : "text-white"
                }`}
              >
                Vatsalla Dental Clinic
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5">
            {links.map((l) => {
              const active = activeSection === l.href;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => handleLinkClick(e, l.href)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
                    active
                      ? scrolled
                        ? "bg-blue-600 text-white shadow-soft"
                        : "bg-white text-slate-950 font-extrabold"
                      : scrolled
                        ? "text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-900"
                        : "text-slate-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {l.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200"
                  >
                    <Avatar className="h-9 w-9 border border-blue-200/50 dark:border-slate-800 shadow-soft">
                      <AvatarFallback className="bg-blue-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                        {getInitials(profile?.name || user.email || "Patient")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-2xl p-2 border border-border bg-card shadow-card"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-semibold leading-none text-foreground">
                        {profile?.name || "Patient"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin ? (
                    <DropdownMenuItem asChild className="rounded-xl p-2.5 cursor-pointer">
                      <Link to="/admin">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild className="rounded-xl p-2.5 cursor-pointer">
                      <Link to="/dashboard">
                        <Calendar className="mr-2 h-4 w-4" />
                        My Appointments
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl p-2.5 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setLoginOpen(true)}
                className={`hidden md:inline-flex rounded-full text-xs font-bold cursor-pointer h-9 px-4 transition-all duration-300 ${
                  scrolled
                    ? "text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-blue-50"
                    : "text-slate-200 hover:text-white hover:bg-white/10"
                }`}
              >
                Login / Register
              </Button>
            )}

            <Button
              asChild
              className="hidden md:inline-flex rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-soft font-bold text-xs h-9 px-4 cursor-pointer"
            >
              <Link to="/book">Book Appointment</Link>
            </Button>

            <button
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex size-9 items-center justify-center rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors relative cursor-pointer"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={open ? "close" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {open ? (
                    <X className="size-4.5" style={{ color: "#006dff" }} />
                  ) : (
                    <Menu className="size-4.5" style={{ color: "#006dff" }} />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="lg:hidden overflow-hidden border-t border-blue-100/30 dark:border-slate-900 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl rounded-b-3xl"
            >
              <div className="py-4 px-5 flex flex-col gap-1">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={(e) => {
                      setOpen(false);
                      handleLinkClick(e, l.href);
                    }}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-900 grid grid-cols-2 gap-2">
                  {user ? (
                    <>
                      <Button asChild variant="outline" className="rounded-full text-xs h-9">
                        <Link to={isAdmin ? "/admin" : "/dashboard"} onClick={() => setOpen(false)}>
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full text-xs h-9 text-destructive border-destructive/20 hover:bg-destructive/5"
                        onClick={() => {
                          setOpen(false);
                          handleLogout();
                        }}
                      >
                        Log out
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="rounded-full text-xs h-9 text-[#0100bc] border-[#000000] hover:text-[#0100bc] hover:border-[#000000]"
                      onClick={() => {
                        setOpen(false);
                        setLoginOpen(true);
                      }}
                    >
                      Login
                    </Button>
                  )}
                  <Button
                    asChild
                    className="rounded-full text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    <Link to="/book" onClick={() => setOpen(false)}>
                      Book
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <LoginDialog isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-5 inset-x-4 z-40 md:hidden pointer-events-none">
        <div className="bg-white/80 dark:bg-slate-950/85 backdrop-blur-xl border border-blue-100/40 dark:border-blue-950/30 rounded-2xl shadow-card p-2 px-3 flex items-center justify-between max-w-md mx-auto pointer-events-auto">
          {[
            { label: "Home", href: "/#home", hash: "home", icon: Home },
            { label: "Services", href: "/#services", hash: "services", icon: Stethoscope },
            { label: "Book", href: "/book", icon: Calendar, highlight: true },
            { label: "Gallery", href: "/#gallery", hash: "gallery", icon: ImageIcon },
            { label: "Contact", href: "/#contact", hash: "contact", icon: Phone },
          ].map((item) => {
            const isHighlight = item.highlight;
            const isBookPage = location.pathname === "/book";
            const isActive = isHighlight ? isBookPage : activeSection === item.href && !isBookPage;

            if (isHighlight) {
              return (
                <Link
                  key={item.label}
                  to="/book"
                  className="relative -top-5 flex flex-col items-center justify-center size-14 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white shadow-[0_8px_20px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <item.icon className="size-6 text-white" />
                  <span className="sr-only">{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1.5 size-1.5 rounded-full bg-blue-500 shadow-sm" />
                  )}
                </Link>
              );
            }

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  const isHashLink = item.href.startsWith("/#");
                  if (isHashLink && location.pathname === "/") {
                    e.preventDefault();
                    const targetId = item.href.replace("/#", "");
                    const element = document.getElementById(targetId);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  } else if (isHashLink && location.pathname !== "/") {
                    navigate({ to: item.href });
                  }
                }}
                className="relative flex flex-col items-center justify-center flex-1 py-1 px-2.5 transition-colors duration-200 group text-center"
              >
                <item.icon
                  className={`size-5 transition-transform duration-200 group-active:scale-90 ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 scale-110"
                      : "text-muted-foreground/75 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                />
                <span
                  className={`text-[9.5px] font-bold mt-1 tracking-tight transition-colors duration-200 ${
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground/60"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="mobileActiveDot"
                    className="absolute -bottom-1.5 size-1 rounded-full bg-blue-600 dark:bg-blue-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}
