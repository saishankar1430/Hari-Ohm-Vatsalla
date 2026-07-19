import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PHONE = "+919603776252";
const WHATSAPP = "919603776252";

const WhatsAppIcon = ({ className = "size-6" }: { className?: string }) => (
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

export function FloatingActions() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 120) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed right-4 bottom-24 md:right-6 md:bottom-8 z-40 flex flex-col gap-3"
        >
          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className="relative group flex size-12 items-center justify-center rounded-xl text-white shadow-elevated hover:scale-110 active:scale-95 transition-all duration-300"
          >
            {/* Soft Ripple / Pulse */}
            <span className="absolute -inset-1 rounded-xl bg-[#25D366]/25 animate-ping opacity-75 group-hover:opacity-100" />
            <WhatsAppIcon className="size-full relative z-10" />
            <span className="sr-only">WhatsApp</span>
          </a>

          {/* Phone Call Button */}
          <a
            href={`tel:${PHONE}`}
            aria-label="Call clinic"
            className="relative group flex size-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-elevated hover:scale-110 active:scale-95 transition-all duration-300"
          >
            <span className="absolute -inset-1 rounded-full bg-blue-600/20 animate-ping opacity-75 group-hover:opacity-100" />
            <Phone className="size-5 relative z-10" strokeWidth={2.5} />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
