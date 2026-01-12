"use client";

import { useEffect, useCallback, useState } from "react";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  X,
  Calendar,
  MapPin,
  ExternalLink,
  Sparkles,
  Award,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";

/* -------------------------------
   Types
-------------------------------- */
interface RegistrationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

/* -------------------------------
   Animation Variants
-------------------------------- */
const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const mobileSheetVariants: Variants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.32, 0.72, 0, 1],
    },
  },
  exit: {
    y: "100%",
    transition: {
      duration: 0.25,
      ease: [0.32, 0.72, 0, 1],
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/* -------------------------------
   Component
-------------------------------- */
export default function RegistrationPopup({
  isOpen,
  onClose,
}: RegistrationPopupProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [includeGoodies, setIncludeGoodies] = useState(false);
  const [isIEEEMember, setIsIEEEMember] = useState(false);
  const [ieeeNumber, setIeeeNumber] = useState("");
  const [isSRMStudent, setIsSRMStudent] = useState(false);

  // Calculate price based on selections
  const calculatePrice = () => {
    let basePrice = 0;
    
    if (isIEEEMember && isSRMStudent) {
      basePrice = 99;
    } else if (!isIEEEMember && isSRMStudent) {
      basePrice = 149;
    } else if (isIEEEMember && !isSRMStudent) {
      basePrice = 149;
    } else {
      basePrice = 199;
    }
    
    return basePrice + (includeGoodies ? 400 : 0);
  };

  const getPriceLabel = () => {
    if (isIEEEMember && isSRMStudent) {
      return "IEEE Member + SRM Student";
    } else if (!isIEEEMember && isSRMStudent) {
      return "Non-IEEE Member + SRM Student";
    } else if (isIEEEMember && !isSRMStudent) {
      return "IEEE Member + Non-SRM Student";
    } else {
      return "Non-IEEE Member + Non-SRM Student";
    }
  };

  // Detect mobile and tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ESC key close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  const handleRegisterOnKonfHub = () => {
    window.open("https://konfhub.com/checkout/high-impact-zonal-event-2026", "_blank", "noopener,noreferrer");
  };

  if (!isOpen) return null;

  return (
    <LazyMotion features={domAnimation} strict>
    <AnimatePresence mode="wait">
      <m.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-title"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center bg-black/90 backdrop-blur-sm overflow-hidden"
        onClick={onClose}
      >
        {/* Desktop & Tablet Modal */}
        {!isMobile && (
          <m.div
            variants={modalVariants}
            className="relative w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 to-black border border-[#FACC15]/40 shadow-[0_0_80px_rgba(250,204,21,0.15)] backdrop-blur-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Border Glow */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
              <m.div
                className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#FACC15] via-[#F97316] to-[#FACC15] opacity-20 blur-xl"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ backgroundSize: "200% 100%" }}
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close registration modal"
              className="absolute right-4 top-4 z-30 rounded-full bg-gradient-to-br from-zinc-900/90 to-black/90 border-2 border-[#FACC15]/50 p-2.5 text-white hover:bg-[#FACC15]/20 hover:border-[#FACC15] hover:scale-110 transition-all duration-300 shadow-lg shadow-[#FACC15]/20 backdrop-blur-md group"
            >
              <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0 relative z-10 overflow-hidden">
              {/* Left Panel - Visual */}
              <div className="relative bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4 lg:p-6 flex flex-col justify-between overflow-hidden min-h-0">
                {/* Animated Background Gradients */}
                <div className="absolute inset-0">
                  <m.div
                    className="absolute top-0 right-0 w-96 h-96 bg-[#FACC15]/20 rounded-full blur-[100px]"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <m.div
                    className="absolute bottom-0 left-0 w-96 h-96 bg-[#F97316]/20 rounded-full blur-[100px]"
                    animate={{
                      scale: [1.2, 1, 1.2],
                      opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(250,204,21,0.05),transparent_70%)]" />
                </div>

                <div className="relative z-10 space-y-4">
                  {/* Logo with Glow */}
                  <m.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-4"
                  >
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-[#FACC15]/20 blur-xl rounded-full" />
                      <Image
                        src="/logo_white.png"
                        alt="HIZE Logo"
                        width={140}
                        height={47}
                        className="h-10 lg:h-12 w-auto relative"
                        priority
                      />
                    </div>
                  </m.div>

                  {/* Tagline with Animation */}
                  <m.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black text-white mb-2 leading-tight tracking-tight">
                      High Impact.
                      <br />
                      <span className="relative inline-block">
                        <span className="absolute inset-0 bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#F97316] blur-lg opacity-50" />
                        <span className="relative bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#F97316] bg-clip-text text-transparent">
                          Real Innovation.
                        </span>
                      </span>
                    </h2>
                    <p className="text-gray-400 text-xs lg:text-sm mt-2">
                      Join India's premier tech event bringing together innovators, creators, and industry leaders
                    </p>
                  </m.div>

                  {/* Event Details Cards */}
                  <div className="space-y-3">
                    <m.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#FACC15] to-[#F97316] shadow-lg shadow-[#FACC15]/30">
                        <Calendar className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Event Dates</p>
                        <p className="text-white font-semibold">Jan 29th - Jan 31st, 2026</p>
                      </div>
                    </m.div>

                    <m.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#F97316] to-[#F59E0B] shadow-lg shadow-[#F97316]/30">
                        <MapPin className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Venue</p>
                        <p className="text-white font-semibold">SRM IST, Chennai</p>
                      </div>
                    </m.div>

                    <m.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#FACC15] to-[#F97316] shadow-lg shadow-[#FACC15]/30">
                        <Users className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Expected Attendees</p>
                        <p className="text-white font-semibold">500+ Innovators</p>
                      </div>
                    </m.div>
                  </div>
                </div>

                {/* Bottom Decorative Bar */}
                <m.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="relative z-10 mt-auto space-y-3"
                >
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <m.div
                        key={i}
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                        className="h-1.5 flex-1 bg-gradient-to-r from-[#FACC15] to-[#F97316] rounded-full shadow-lg shadow-[#FACC15]/30"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Powered by IEEE Computer Society SYP
                  </p>
                </m.div>
              </div>

              {/* Right Panel - Registration Form */}
              <div className="bg-gradient-to-br from-zinc-950 to-black p-4 lg:p-6 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-[#FACC15]/30 scrollbar-track-transparent min-h-0">
                {/* Header */}
                <div className="mb-4">
                  <m.h3
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    id="registration-title"
                    className="text-xl lg:text-2xl font-black bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#F97316] bg-clip-text text-transparent mb-1"
                  >
                    Event Registration
                  </m.h3>
                  <m.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-400 text-xs lg:text-sm flex items-center gap-2"
                  >
                    <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Jan 29th - Jan 31st, 2026 • Configure your registration
                  </m.p>
                </div>

                {/* Registration Form */}
                <div className="space-y-3 mb-4">
                  {/* Goodies Toggle */}
                  <m.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="group relative p-4 lg:p-5 rounded-xl border border-[#FACC15]/30 bg-gradient-to-br from-black/50 to-zinc-900/30 hover:border-[#FACC15]/60 hover:bg-gradient-to-br hover:from-black/70 hover:to-zinc-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FACC15]/10"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FACC15]/5 via-transparent to-[#F97316]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between gap-4 relative z-10">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#FACC15]/20 to-[#F97316]/20 border border-[#FACC15]/30">
                          <Sparkles className="h-5 w-5 text-[#FACC15]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-white font-bold block text-sm lg:text-base">
                            Include Goodies
                          </span>
                          <span className="text-gray-400 text-xs lg:text-sm">
                            Event swag & merchandise{" "}
                            <span className="text-[#FACC15] font-semibold">+₹400</span>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIncludeGoodies(!includeGoodies)}
                        className={`relative w-14 lg:w-16 h-7 lg:h-8 rounded-full transition-all flex-shrink-0 shadow-lg ${
                          includeGoodies
                            ? "bg-gradient-to-r from-[#FACC15] to-[#F97316] shadow-[#FACC15]/50"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        aria-label="Toggle goodies"
                      >
                        <m.div
                          animate={{
                            x: includeGoodies ? 28 : 2,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="absolute top-1 w-5 lg:w-6 h-5 lg:h-6 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>
                  </m.div>

                  {/* IEEE Member Toggle */}
                  <m.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="group relative p-4 lg:p-5 rounded-xl border border-[#FACC15]/30 bg-gradient-to-br from-black/50 to-zinc-900/30 hover:border-[#FACC15]/60 hover:bg-gradient-to-br hover:from-black/70 hover:to-zinc-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FACC15]/10"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FACC15]/5 via-transparent to-[#F97316]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between gap-4 mb-3 relative z-10">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-white font-bold block text-sm lg:text-base">
                            IEEE Member
                          </span>
                          <span className="text-gray-400 text-xs lg:text-sm">
                            Are you an IEEE member?
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsIEEEMember(!isIEEEMember);
                          if (!isIEEEMember) setIeeeNumber("");
                        }}
                        className={`relative w-14 lg:w-16 h-7 lg:h-8 rounded-full transition-all flex-shrink-0 shadow-lg ${
                          isIEEEMember
                            ? "bg-gradient-to-r from-[#FACC15] to-[#F97316] shadow-[#FACC15]/50"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        aria-label="Toggle IEEE membership"
                      >
                        <m.div
                          animate={{
                            x: isIEEEMember ? 28 : 2,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="absolute top-1 w-5 lg:w-6 h-5 lg:h-6 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>
                  </m.div>

                  {/* SRM Student Toggle */}
                  <m.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="group relative p-4 lg:p-5 rounded-xl border border-[#FACC15]/30 bg-gradient-to-br from-black/50 to-zinc-900/30 hover:border-[#FACC15]/60 hover:bg-gradient-to-br hover:from-black/70 hover:to-zinc-900/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#FACC15]/10"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FACC15]/5 via-transparent to-[#F97316]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between gap-4 relative z-10">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-white font-bold block text-sm lg:text-base">
                            SRM Student
                          </span>
                          <span className="text-gray-400 text-xs lg:text-sm">
                            Are you a SRM student?
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsSRMStudent(!isSRMStudent)}
                        className={`relative w-14 lg:w-16 h-7 lg:h-8 rounded-full transition-all flex-shrink-0 shadow-lg ${
                          isSRMStudent
                            ? "bg-gradient-to-r from-[#FACC15] to-[#F97316] shadow-[#FACC15]/50"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        aria-label="Toggle SRM student status"
                      >
                        <m.div
                          animate={{
                            x: isSRMStudent ? 28 : 2,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                          className="absolute top-1 w-5 lg:w-6 h-5 lg:h-6 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>
                  </m.div>
                </div>

                {/* Price Summary */}
                <div className="mb-4">
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative p-4 lg:p-5 rounded-2xl border-2 border-[#FACC15]/50 bg-gradient-to-br from-[#FACC15]/10 via-[#F97316]/5 to-transparent overflow-hidden"
                  >
                    {/* Animated Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FACC15]/10 via-[#F97316]/10 to-[#FACC15]/10 animate-pulse" />
                    
                    <div className="relative z-10 text-center">
                      <h4 className="text-white font-black text-base lg:text-lg mb-2 tracking-wide">
                        {getPriceLabel()}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-300 mb-3">
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                          <span className="font-medium">Base Price:</span>
                          <span className="font-bold text-white">₹{calculatePrice() - (includeGoodies ? 400 : 0)}</span>
                        </div>
                        {includeGoodies && (
                          <m.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex justify-between items-center py-2 border-b border-white/10"
                          >
                            <span className="font-medium flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-[#FACC15]" />
                              Goodies:
                            </span>
                            <span className="font-bold text-[#F97316]">+₹400</span>
                          </m.div>
                        )}
                        <div className="pt-2 flex justify-between items-center">
                          <span className="text-base lg:text-lg font-black text-white">Total Amount:</span>
                          <m.span
                            key={calculatePrice()}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-xl lg:text-2xl font-black bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#F97316] bg-clip-text text-transparent"
                          >
                            ₹{calculatePrice()}
                          </m.span>
                        </div>
                      </div>
                    </div>
                  </m.div>
                </div>

                {/* Register Button */}
                <m.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegisterOnKonfHub}
                  className="relative w-full py-3 lg:py-4 rounded-xl font-black text-sm lg:text-base bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#F97316] text-black hover:shadow-2xl hover:shadow-[#F97316]/50 transition-all group overflow-hidden flex items-center justify-center"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Register on KonfHub
                    <ExternalLink className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F97316] via-[#F59E0B] to-[#FACC15] opacity-0 group-hover:opacity-100 transition-opacity" />
                </m.button>

                <m.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center text-gray-500 text-xs lg:text-sm mt-3 flex items-center justify-center gap-1"
                >
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Redirects to KonfHub for secure registration
                </m.p>
              </div>
            </div>
          </m.div>
        )}

        {/* Mobile Bottom Sheet */}
        {isMobile && (
          <>
            <m.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/85 -z-10"
              onClick={onClose}
            />
            <m.div
              variants={mobileSheetVariants}
              className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-t-2 border-[#FACC15]/50 rounded-t-3xl shadow-[0_-10px_80px_rgba(250,204,21,0.2)] max-h-[92vh] overflow-y-auto overscroll-contain"
              onClick={(e) => e.stopPropagation()}
              style={{ touchAction: "pan-y" }}
            >
              {/* Drag Handle */}
              <div className="sticky top-0 z-10 flex justify-center pt-3 pb-2 bg-gradient-to-b from-zinc-900 to-transparent">
                <div className="w-12 h-1.5 bg-gradient-to-r from-[#FACC15] to-[#F97316] rounded-full shadow-lg shadow-[#FACC15]/30" />
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Close registration modal"
                className="absolute right-4 top-4 z-20 rounded-full bg-gradient-to-br from-zinc-900/90 to-black/90 border-2 border-[#FACC15]/50 p-2.5 text-white backdrop-blur-sm shadow-lg active:scale-95 transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="px-4 pb-8 pt-2 safe-area-inset-bottom">
                {/* Header */}
                <div className="mb-6 text-center">
                  <h3 className="text-2xl font-black bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#F97316] bg-clip-text text-transparent mb-2">
                    Event Registration
                  </h3>
                  <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Jan 29th - Jan 31st, 2026
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                      <Calendar className="h-4 w-4 text-[#FACC15]" />
                      <span>Jan 2026</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                      <MapPin className="h-4 w-4 text-[#FACC15]" />
                      <span>SRM IST</span>
                    </div>
                  </div>
                </div>

                {/* Registration Form */}
                <div className="space-y-4 mb-6">
                  {/* Goodies Toggle */}
                  <div className="p-4 rounded-xl border border-[#FACC15]/30 bg-gradient-to-br from-black/50 to-zinc-900/30 active:border-[#FACC15]/60 active:bg-gradient-to-br active:from-black/70 active:to-zinc-900/50 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[#FACC15]/20 to-[#F97316]/20 border border-[#FACC15]/30">
                          <Sparkles className="h-4 w-4 text-[#FACC15]" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-white font-bold text-sm block">
                            Include Goodies
                          </span>
                          <span className="text-gray-400 text-xs">
                            <span className="text-[#FACC15] font-semibold">+₹400</span>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIncludeGoodies(!includeGoodies)}
                        className={`relative w-12 h-6 rounded-full transition-all touch-manipulation flex-shrink-0 shadow-lg ${
                          includeGoodies
                            ? "bg-gradient-to-r from-[#FACC15] to-[#F97316] shadow-[#FACC15]/50"
                            : "bg-gray-700"
                        }`}
                        aria-label="Toggle goodies"
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                            includeGoodies ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* IEEE Member Toggle */}
                  <div className="p-4 rounded-xl border border-[#FACC15]/30 bg-gradient-to-br from-black/50 to-zinc-900/30 active:border-[#FACC15]/60 active:bg-gradient-to-br active:from-black/70 active:to-zinc-900/50 transition-all">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                          <Award className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-white font-bold text-sm block">
                            IEEE Member
                          </span>
                          <span className="text-gray-400 text-xs">
                            IEEE member?
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsIEEEMember(!isIEEEMember);
                          if (!isIEEEMember) setIeeeNumber("");
                        }}
                        className={`relative w-12 h-6 rounded-full transition-all touch-manipulation flex-shrink-0 shadow-lg ${
                          isIEEEMember
                            ? "bg-gradient-to-r from-[#FACC15] to-[#F97316] shadow-[#FACC15]/50"
                            : "bg-gray-700"
                        }`}
                        aria-label="Toggle IEEE membership"
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                            isIEEEMember ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* SRM Student Toggle */}
                  <div className="p-4 rounded-xl border border-[#FACC15]/30 bg-gradient-to-br from-black/50 to-zinc-900/30 active:border-[#FACC15]/60 active:bg-gradient-to-br active:from-black/70 active:to-zinc-900/50 transition-all">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30">
                          <Zap className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-white font-bold text-sm block">
                            SRM Student
                          </span>
                          <span className="text-gray-400 text-xs">
                            SRM student?
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsSRMStudent(!isSRMStudent)}
                        className={`relative w-12 h-6 rounded-full transition-all touch-manipulation flex-shrink-0 shadow-lg ${
                          isSRMStudent
                            ? "bg-gradient-to-r from-[#FACC15] to-[#F97316] shadow-[#FACC15]/50"
                            : "bg-gray-700"
                        }`}
                        aria-label="Toggle SRM student status"
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${
                            isSRMStudent ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="mb-6">
                  <div className="relative p-5 rounded-2xl border-2 border-[#FACC15]/50 bg-gradient-to-br from-[#FACC15]/10 via-[#F97316]/5 to-transparent overflow-hidden">
                    {/* Animated Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FACC15]/10 via-[#F97316]/10 to-[#FACC15]/10 animate-pulse" />
                    
                    <div className="relative z-10 text-center">
                      <h4 className="text-white font-black text-base mb-3 tracking-wide">
                        {getPriceLabel()}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-300 mb-3">
                        <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                          <span className="font-medium">Base Price:</span>
                          <span className="font-bold text-white">₹{calculatePrice() - (includeGoodies ? 400 : 0)}</span>
                        </div>
                        {includeGoodies && (
                          <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                            <span className="font-medium flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-[#FACC15]" />
                              Goodies:
                            </span>
                            <span className="font-bold text-[#F97316]">+₹400</span>
                          </div>
                        )}
                        <div className="pt-2 flex justify-between items-center">
                          <span className="text-base font-black text-white">Total:</span>
                          <span className="text-2xl font-black bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#F97316] bg-clip-text text-transparent">
                            ₹{calculatePrice()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                <m.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleRegisterOnKonfHub}
                  className="relative w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#F97316] text-black transition-all touch-manipulation active:scale-95 shadow-lg shadow-[#FACC15]/30 group overflow-hidden flex items-center justify-center"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Register on KonfHub
                    <ExternalLink className="h-5 w-5 group-active:translate-x-1 group-active:-translate-y-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F97316] via-[#F59E0B] to-[#FACC15] opacity-0 group-active:opacity-100 transition-opacity" />
                </m.button>

                <p className="text-center text-gray-500 text-xs mt-3 flex items-center justify-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Redirects to KonfHub for secure registration
                </p>
              </div>
            </m.div>
          </>
        )}
      </m.div>
    </AnimatePresence>
    </LazyMotion>
  );
}
