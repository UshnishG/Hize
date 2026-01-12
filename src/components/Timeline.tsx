"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { memo, useRef, useState, useMemo } from "react";
import { Calendar, Users, Trophy, Coffee, Mic, Code, Lightbulb, ChevronDown, Sparkles } from "lucide-react";
import { getMobileOptimizedVariants, shouldReduceAnimations, isMobile } from "@/lib/mobileOptimization";
import { useRouter } from "next/navigation";

// Type definitions for timeline events
interface TimelineEvent {
  time: string;
  label: string;
  icon: React.ComponentType<any>;
  isSpecial?: boolean;
  buttonText?: string;
  buttonUrl?: string;
  isHackathon?: boolean;
  hackathonButtonText?: string;
}

interface TimelineDay {
  day: string;
  date: string;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  icon: React.ComponentType<any>;
  position: { x: number; y: number };
  events: TimelineEvent[];
}

// Enhanced timeline data
const timelineData: TimelineDay[] = [
  {
    day: "XPRESSION",
    date: "28th JANUARY",
    title: "Open Mic",
    subtitle: "Express Yourself",
    color: "purple-blue",
    bgColor: "#8B5CF620",
    borderColor: "#7C3AED50",
    glowColor: "#7C3AED",
    icon: Mic,
    position: { x: 0, y: 0 },
    events: [
      {
        time: "9:00 AM Onwards",
        label: "Open Mic - Showcase your talent! Poetry, music, comedy, or any creative expression.",
        icon: Mic,
        isSpecial: true,
        buttonText: "Register with Futurix",
        buttonUrl: "https://futurix.in/register"
      },
    ],
  },
  {
    // UPDATED: Changed Theme to Red/Dark for Stranger Things Vibe
    day: "DAY 0",
    date: "29th JANUARY",
    title: "Hackathon",
    subtitle: "Enter The Void",
    color: "red-black",
    bgColor: "#00000040", // Darker background
    borderColor: "#DC262650", // Red border
    glowColor: "#DC2626", // Red Glow
    icon: Code,
    position: { x: 0, y: 0 },
    events: [
      {
        time: "9:30 AM Onwards",
        label: "Hackathon Kickoff - The gate opens. coding is the only key.",
        icon: Trophy,
        isHackathon: true,
        hackathonButtonText: "THE UPSIDE DOWN"
      },
    ],
  },
  {
    day: "DAY 1",
    date: "30th JANUARY",
    title: "Conference Day",
    subtitle: "Knowledge & Networking",
    color: "orange-black",
    bgColor: "#FB923C20",
    borderColor: "#EA580C50",
    glowColor: "#EA580C",
    icon: Users,
    position: { x: 0, y: 0 },
    events: [
      { time: "9:00 AM – 9:30 AM", label: "Registration", icon: Calendar },
      { time: "9:30 AM – 9:50 AM", label: "Guest Arrival", icon: Users },
      { time: "10:00 AM – 10:40 AM", label: "Inauguration", icon: Trophy },
      { time: "10:40 AM – 11:00 AM", label: "Tea Break & Networking", icon: Coffee },
      { time: "11:00 AM – 12:30 PM", label: "Panel Discussion", icon: Mic },
      { time: "12:30 PM – 1:30 PM", label: "Tech Talk", icon: Lightbulb },
      { time: "1:30 PM – 2:30 PM", label: "Lunch", icon: Coffee },
      { time: "2:30 PM – 4:00 PM", label: "Quiz Finale | Coding Contest", icon: Code },
      { time: "4:00 PM – 4:30 PM", label: "Tea Break & Networking", icon: Coffee },
      { time: "4:30 PM – 6:00 PM", label: "Tech Talk", icon: Lightbulb },
      { time: "6:00 PM – 7:30 PM", label: "Culturals", icon: Users },
    ],
  },
  {
    day: "DAY 2",
    date: "31st JANUARY",
    title: "Workshops & Showcase",
    subtitle: "Skills & Innovation",
    color: "black-orange",
    bgColor: "#00000030",
    borderColor: "#EA580C50",
    glowColor: "#EA580C",
    icon: Lightbulb,
    position: { x: 0, y: 0 },
    events: [
      { time: "9:00 AM – 10:30 AM", label: "Tech Talk", icon: Lightbulb },
      { time: "10:30 AM – 11:00 AM", label: "Tea Break & Networking", icon: Coffee },
      { time: "11:00 AM – 12:30 PM", label: "Startup Showcase", icon: Trophy },
      { time: "11:00 AM – 1:00 PM", label: "Tech Talk", icon: Lightbulb },
      { time: "1:00 PM – 2:00 PM", label: "Lunch", icon: Coffee },
      { time: "2:00 PM – 3:30 PM", label: "Tech Talk", icon: Lightbulb },
      { time: "2:30 PM – 3:30 PM", label: "Interview Fair", icon: Users },
      { time: "3:30 PM Onwards", label: "Valedictory Ceremony", icon: Trophy },
    ],
  },
];

// Mobile-optimized animation variants
const getMobileVariants = () => {
  const isReducedMotion = shouldReduceAnimations();
  const mobile = isMobile();

  return {
    containerVariants: {
      hidden: { opacity: isReducedMotion ? 1 : 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: isReducedMotion ? 0 : (mobile ? 0.1 : 0.2),
          delayChildren: isReducedMotion ? 0 : 0.1
        }
      }
    },
    dayVariants: {
      hidden: { opacity: 0, scale: 0.95, y: 20 },
      visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } }
    },
    eventVariants: {
      hidden: { opacity: 0, y: -5 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, y: -5 }
    },
    eventsContainerVariants: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
      exit: { opacity: 0 }
    }
  };
};

const Timeline = memo(function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const router = useRouter();

  const mobile = useMemo(() => isMobile(), []);
  const reducedMotion = useMemo(() => shouldReduceAnimations(), []);
  const variants = useMemo(() => getMobileVariants(), []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"]
  });

  const toggleDay = (dayIndex: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayIndex)) {
        newSet.delete(dayIndex);
      } else {
        newSet.add(dayIndex);
      }
      return newSet;
    });
  };

  return (
    <div ref={containerRef} className="relative w-full py-8 overflow-hidden">
      {/* Backgrounds omitted for brevity - same as original code */}
      {!mobile && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          {/* Re-add your original SVG path code here if needed */}
        </svg>
      )}

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 md:px-6"
        variants={variants.containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {timelineData.map((day, index) => {
          const IconComponent = day.icon;

          return (
            <motion.div
              key={day.day}
              variants={variants.dayVariants}
              className="relative mb-4 flex justify-center"
            >
              <motion.div
                className="relative w-full max-w-2xl mx-auto cursor-pointer"
                onClick={() => toggleDay(index)}
              >
                {/* Day Header Card */}
                <motion.div
                  className="relative p-5 rounded-2xl backdrop-blur-xl border shadow-xl overflow-hidden"
                  style={{
                    background: day.bgColor,
                    borderColor: day.borderColor
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Glowing background */}
                  <div
                    className="absolute -inset-1 rounded-2xl blur-lg opacity-30 -z-10"
                    style={{ background: `linear-gradient(135deg, ${day.glowColor}, ${day.glowColor}60)` }}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{day.day}</h3>
                        <p className={`text-sm font-medium ${day.glowColor === '#DC2626' ? 'text-red-400' : 'text-yellow-300'}`}>{day.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-left sm:text-right">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white">{day.title}</h2>
                        <p className="text-sm font-medium opacity-80 text-white">{day.subtitle}</p>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedDays.has(index) ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Events Container */}
                <AnimatePresence>
                  {expandedDays.has(index) && (
                    <motion.div
                      variants={variants.eventsContainerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="mt-4 overflow-hidden"
                    >
                      <motion.div
                        className="p-1 rounded-xl"
                        style={{
                          background: day.glowColor === '#DC2626' ? 'transparent' : `${day.bgColor}80`,
                        }}
                      >
                        {/* Event List Header (Standard) */}
                        {!day.events.some(e => e.isHackathon) && (
                          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2 px-4 pt-2">
                            <Calendar className="w-5 h-5" style={{ color: day.glowColor }} />
                            Event Schedule
                          </h4>
                        )}

                        <div className="space-y-3">
                          {day.events.map((event, i) => {
                            // --- STRANGER THINGS THEME LOGIC ---
                            if (event.isHackathon) {
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="relative group overflow-hidden rounded-xl border border-red-900/50"
                                >
                                  {/* Spooky Animated Background */}
                                  <div className="absolute inset-0 bg-black z-0" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-red-950/40 via-black to-black z-0" />

                                  {/* Flickering Light Effect */}
                                  <motion.div
                                    className="absolute inset-0 bg-red-600/10 mix-blend-overlay z-0"
                                    animate={{ opacity: [0.1, 0.3, 0.1, 0.4, 0.1] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                  />

                                  {/* Floating "Spores" (Dust Motes) */}
                                  {[...Array(5)].map((_, k) => (
                                    <motion.div
                                      key={k}
                                      className="absolute w-1 h-1 bg-gray-400 rounded-full blur-[1px] z-0"
                                      style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`
                                      }}
                                      animate={{
                                        y: [-20, 20],
                                        x: [-10, 10],
                                        opacity: [0, 0.8, 0]
                                      }}
                                      transition={{
                                        duration: 3 + Math.random() * 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                      }}
                                    />
                                  ))}

                                  <div className="relative z-10 flex flex-col items-center justify-center p-8 gap-6 text-center">
                                    {/* Icon with Red Glow */}
                                    <motion.div
                                      className="p-3 rounded-full bg-red-950/30 border border-red-800/50 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                                      whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(220,38,38,0.6)" }}
                                    >
                                      <Trophy className="w-8 h-8 text-red-500" />
                                    </motion.div>

                                    <div className="space-y-2 max-w-md">
                                      <p className="text-red-400 font-mono text-sm tracking-widest uppercase">
                                        {event.time}
                                      </p>
                                      <p className="text-gray-300 text-lg font-serif italic leading-relaxed">
                                        "{event.label}"
                                      </p>
                                    </div>

                                    {/* THE STRANGER THINGS BUTTON */}
                                    {event.hackathonButtonText && (
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push('/hackathon');
                                        }}
                                        className="relative mt-2 px-8 py-4 group/btn"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        {/* Button Border / Glow */}
                                        <div className="absolute inset-0 border-2 border-red-700 rounded-lg opacity-80 group-hover/btn:opacity-100 group-hover/btn:border-red-500 transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.2)] group-hover/btn:shadow-[0_0_20px_rgba(220,38,38,0.6)]" />

                                        {/* Inner Bevel line */}
                                        <div className="absolute inset-[3px] border border-red-900 rounded-md opacity-50" />

                                        {/* Text Styling - Mimicking the Title Card */}
                                        <span
                                          className="relative z-10 block text-2xl md:text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-red-600 to-red-900 stroke-red-500"
                                          style={{
                                            textShadow: `
                                              0 0 2px #000,
                                              0 0 10px rgba(220, 38, 38, 0.8),
                                              0 2px 0px rgba(0,0,0,0.5)
                                            `,
                                            fontFamily: 'serif',
                                            fontWeight: 900,
                                            letterSpacing: '-0.02em',
                                            WebkitTextStroke: '1px #7f1d1d'
                                          }}
                                        >
                                          THE UPSIDE DOWN
                                        </span>

                                        {/* Top Bar Line (Signature Style) */}
                                        <motion.div
                                          className="absolute top-2 left-4 right-4 h-[2px] bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                                          initial={{ width: "0%" }}
                                          whileInView={{ width: "auto" }}
                                          transition={{ duration: 1, delay: 0.2 }}
                                        />
                                      </motion.button>
                                    )}
                                  </div>

                                  {/* Vines / Overlay Image (Optional - using CSS gradient to simulate vines) */}
                                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
                                </motion.div>
                              );
                            }

                            // --- STANDARD EVENT CARD RENDER ---
                            const EventIcon = event.icon;
                            return (
                              <motion.div
                                key={i}
                                variants={variants.eventVariants}
                                className="group flex flex-col gap-3 p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 hover:border-yellow-400/50 hover:bg-black/40 transition-all duration-300"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-white/10 mt-1">
                                    <EventIcon className="w-4 h-4" style={{ color: day.glowColor }} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-yellow-300 text-xs font-bold uppercase mb-1">{event.time}</p>
                                    <p className="text-white text-sm">{event.label}</p>
                                  </div>
                                </div>
                                {event.isSpecial && (
                                  <a href={event.buttonUrl} className="mt-2 w-full py-2 bg-violet-600 rounded-lg text-white text-center text-sm font-semibold hover:bg-violet-700 transition">
                                    {event.buttonText}
                                  </a>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
});

Timeline.displayName = 'Timeline';

export default Timeline;