"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from 'next/link'
import { Code2, Lightbulb, Mic2, Mail, Phone, ArrowDown, ChevronUp, X, FileText } from "lucide-react"
import { FaTwitter } from 'react-icons/fa'
import Image from "next/image"
import dynamic from "next/dynamic"
import facultyContacts from "@/lib/facultyContacts"
import { isMobile, shouldReduceAnimations, getMobileOptimizedVariants } from "@/lib/mobileOptimization"
import RegistrationPopup from "@/components/RegistrationPopup"

// Conditionally load heavy components based on device capabilities
const LoadingScreen = dynamic(() => import("@/components/LoadingScreen"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black flex items-center justify-center"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
})

// Only load background on desktop for performance
const DynamicBackground = dynamic(() => import("@/components/DynamicBackground"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black"></div>
})

const ScrollProgress = dynamic(() => import("@/components/ScrollProgress"), {
  ssr: false,
  loading: () => null
})

// Only load magnetic cursor on desktop
const MagneticCursor = dynamic(() => import("@/components/MagneticCursor"), {
  ssr: false,
  loading: () => null
})



// Simplified marquee loading
const Marquee = dynamic(() => import("react-fast-marquee").then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => <div className="h-16 bg-gradient-to-r from-orange-600/5 to-orange-400/5 rounded-lg"></div>
})

const PartnersMarquee = dynamic(() => import("@/components/PartnersMarquee"), {
  ssr: false,
  loading: () => <div className="h-32 bg-white"></div>
})

const SpeakerCard = dynamic(() => import('@/components/SpeakerCard'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gradient-to-br from-black/40 to-zinc-900/40 rounded-xl animate-pulse"></div>
})

const Navigation = dynamic(() => import('@/components/Navigation'), {
  ssr: false,
  loading: () => <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/80 backdrop-blur-sm"></div>
})

const Timeline = dynamic(() => import('@/components/Timeline'), {
  ssr: false,
  loading: () => <div className="max-w-7xl mx-auto px-4 py-8"><div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 bg-gradient-to-br from-black/40 to-zinc-900/40 rounded-xl"></div>)}</div></div>
})

interface Speaker {
  name: string
  title?: string
  image?: string
  bio?: string
  social?: {
    linkedin?: string
    x?: string
  }
}

interface EventItem {
  icon?: string
  title: string
  tags?: string[]
  description?: string
  color?: string
}

interface StudentMember {
  name: string
  role: string
  image: string
}

interface DomainTeam {
  domain: string
  head: StudentMember
  team?: StudentMember[]
}

const ICON_MAP: Record<string, any> = {
  Code2,
  Lightbulb,
  Mic2,
} as const

const normalizeStudentImage = (image?: string) => {
  const fallback = "/studentteam/falll.png"

  if (!image || typeof image !== "string") return fallback

  let src = image.trim()

  // Ensure local assets are rooted at /studentteam
  if (!/^https?:\/\//i.test(src)) {
    src = src.startsWith("/") ? src : `/${src}`
    src = src
      .replace(/^\/students\//i, "/studentteam/")
      .replace(/^\/student-team\//i, "/studentteam/")
  }

  return src
}

const INITIAL_STUDENTS = [
  {
    "name": "Keshav Gupta",
    "role": "ChairPerson",
    "image": "/studentteam/chair.png"
  },
  {
    "name": "Ushnish Ghosal",
    "role": "Vice ChairPerson",
    "image": "/studentteam/secretary.jpg"
  },
  {
    "name": "Iraa jayakumar",
    "role": "Secretary",
    "image": "/studentteam/secretary.jpg"
  },
  {
    "name": "Harsh Agarwal",
    "role": "Treasurer",
    "image": "/studentteam/treasurer.jpg"
  }
].map(student => ({
  ...student,
  image: normalizeStudentImage(student.image)
}))

export default function Home() {
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])
  const activeSectionRef = useRef(0)
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [eventsData, setEventsData] = useState<EventItem[] | null>(null) // null = loading, [] = loaded empty
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null)
  const [students, setStudents] = useState<any[]>(INITIAL_STUDENTS);
  const [domains, setDomains] = useState<DomainTeam[]>([])
  const [selectedDomain, setSelectedDomain] = useState<DomainTeam | null>(null)
  const [infoTab, setInfoTab] = useState<"map" | "previous">("map")
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)

  // Auto-open registration popup after 4 seconds (only once)
  useEffect(() => {
    if (hasAutoOpened || !loadingComplete) return

    const timer = setTimeout(() => {
      setShowRegistrationPopup(true)
      setHasAutoOpened(true)
    }, 4000) // 4 seconds

    return () => clearTimeout(timer)
  }, [loadingComplete, hasAutoOpened])

  useEffect(() => {
    let mounted = true
    let abortController = new AbortController()

    // Always pull latest speakers after JSON edits
    fetch("/data/speakers.json", {
      cache: "no-store",
      next: { revalidate: 0 },
      signal: abortController.signal
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load speakers")
        return res.json()
      })
      .then((data) => {
        if (mounted) setSpeakers(data as Speaker[])
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.warn('Failed to load speakers:', error)
        }
      })

    return () => {
      mounted = false
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    let mounted = true
    let abortController = new AbortController()

    // Use static cache with revalidation for better performance
    fetch("/data/events.json", {
      cache: "force-cache",
      next: { revalidate: 3600 }, // Revalidate every hour
      signal: abortController.signal
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load events")
        return res.json()
      })
      .then((data) => {
        if (mounted) {
          // Validate it's an array
          if (Array.isArray(data)) setEventsData(data as EventItem[])
          else setEventsData([])
        }
      })
      .catch((error) => {
        if (mounted && error.name !== 'AbortError') {
          console.warn('Failed to load events:', error)
          setEventsData([])
        }
      })

    return () => {
      mounted = false
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    let mounted = true
    let abortController = new AbortController()

    fetch("/data/student-team.json", {
      // Always pull the latest student data; avoids stale cache after edits
      cache: "no-store",
      next: { revalidate: 0 },
      signal: abortController.signal
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load student team")
        return res.json()
      })
      .then(data => {
        if (!mounted) return

        // New shape: array of domain teams
        if (Array.isArray(data) && data.every(item => typeof item === "object" && "domain" in item && "head" in item)) {
          const normalizedDomains: DomainTeam[] = data.map((domain: any) => ({
            domain: domain.domain,
            head: {
              ...(domain.head || {}),
              image: normalizeStudentImage(domain.head?.image)
            },
            team: (domain.team || []).filter(Boolean).map((member: any) => ({
              ...member,
              image: normalizeStudentImage(member.image)
            }))
          }))

          setDomains(normalizedDomains)
          return
        }

        // Backward compatibility: flat list
        if (Array.isArray(data)) {
          const normalizedStudents = data
            .filter(Boolean)
            .map(student => ({
              ...student,
              image: normalizeStudentImage(student.image)
            }))

          if (normalizedStudents.length > 0) {
            setStudents(normalizedStudents)
          }
        }
      })
      .catch((error) => {
        if (mounted && error.name !== 'AbortError') {
          console.warn('Failed to load student team:', error)
          // Keep the default data instead of setting empty array
        }
      })

    return () => {
      mounted = false
      abortController.abort()
    }
  }, []);

  const sections = ["Hero", "Venue Map", "Events", "Guests", "Partners", "Previous Events", "Student Team", "Contact"]

  // Detect iOS device
  useEffect(() => {
    const checkIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    }
    setIsIOS(checkIOS())
  }, [])

  useEffect(() => {
    activeSectionRef.current = activeSection
  }, [activeSection])

  useEffect(() => {
    if (!loadingComplete) return

    let ticking = false
    let rafId: number | null = null
    let lastScrollY = 0
    let lastSectionUpdate = 0

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Only process if scroll position changed significantly
      if (Math.abs(currentScrollY - lastScrollY) < 10) return
      lastScrollY = currentScrollY

      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const now = Date.now()
          if (now - lastSectionUpdate < 100) {
            ticking = false
            return
          }

          const scrollPosition = currentScrollY + window.innerHeight / 2

          sectionsRef.current.forEach((section, index) => {
            if (section) {
              const { offsetTop, offsetHeight } = section
              if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                if (activeSectionRef.current !== index) {
                  setActiveSection(index)
                  lastSectionUpdate = now
                }
              }
            }
          })
          ticking = false
        })
        ticking = true
      }
    }

    // Use passive listener for better scroll performance with throttling
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [loadingComplete])

  const scrollToSection = useCallback((index: number) => {
    sectionsRef.current[index]?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  if (!loadingComplete) {
    return <LoadingScreen onLoadingComplete={() => setLoadingComplete(true)} />
  }

  return (
    <div ref={containerRef} className="relative bg-black text-white overflow-x-hidden pt-6">
      <Navigation
        sections={sections}
        onSectionClick={scrollToSection}
        activeSection={activeSection}
        onRegisterClick={() => setShowRegistrationPopup(true)}
      />
      <DynamicBackground />
      <MagneticCursor />
      <ScrollProgress
        sections={sections}
        activeSection={activeSection}
        onSectionClick={scrollToSection}
      />

      <section
        ref={(el) => { sectionsRef.current[0] = el }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-0 right-0 opacity-30 hidden md:block">
            <Marquee speed={80} gradient={false}>
              <span className="text-[80px] md:text-[120px] font-black text-orange-600/25 mx-4 md:mx-8">INNOVATE</span>
              <span className="text-[80px] md:text-[120px] font-black text-orange-500/25 mx-4 md:mx-8">CREATE</span>
              <span className="text-[80px] md:text-[120px] font-black text-orange-700/25 mx-4 md:mx-8">INSPIRE</span>
              <span className="text-[80px] md:text-[120px] font-black text-orange-400/25 mx-4 md:mx-8">CONNECT</span>
            </Marquee>
          </div>
          <div className="absolute bottom-[15%] left-0 right-0 opacity-30 hidden md:block">
            <Marquee speed={60} gradient={false} direction="right">
              <span className="text-[80px] md:text-[120px] font-black text-orange-500/25 mx-4 md:mx-8">LEARN</span>
              <span className="text-[80px] md:text-[120px] font-black text-orange-600/25 mx-4 md:mx-8">BUILD</span>
              <span className="text-[80px] md:text-[120px] font-black text-orange-700/25 mx-4 md:mx-8">COMPETE</span>
              <span className="text-[80px] md:text-[120px] font-black text-orange-400/25 mx-4 md:mx-8">EXCEL</span>
            </Marquee>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-12 max-w-6xl mx-auto relative z-10"
        >
          <motion.div className="relative">
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[10rem] xl:text-[14rem] font-black tracking-tighter relative">
              <span className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 bg-clip-text text-transparent blur-2xl opacity-60">
                IEEE CS SYP HIZE
              </span>
              <span className="relative bg-gradient-to-r from-orange-600 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                IEEE CS SYP HIZE
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-orange-600 via-orange-400 to-orange-500 bg-clip-text text-transparent tracking-wider mt-2 md:mt-4"
            >
              2026
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative w-full"
          >
            <div className="px-4 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 rounded-2xl md:rounded-3xl bg-gradient-to-r from-orange-600/15 via-orange-500/15 to-orange-600/15 backdrop-blur-xl border border-orange-500/30">
              <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-orange-500 via-orange-300 to-orange-500 bg-clip-text text-transparent">
                HIGH IMPACT ZONAL EVENTS
              </h2>
            </div>
            <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-orange-600/30 via-orange-500/30 to-orange-600/30 rounded-2xl md:rounded-3xl blur-xl -z-10" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-orange-100/90 font-serif max-w-5xl mx-auto leading-relaxed px-4"
          >
            A flagship IEEE Computer Society initiative bringing together <span className="text-orange-500 font-bold">innovation</span>, <span className="text-orange-400 font-bold">technology</span>, and <span className="text-orange-300 font-bold">academic excellence</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-12 max-w-6xl mx-auto"
          >
            <div className="relative p-6 sm:p-8 md:p-10 lg:p-12 rounded-2xl md:rounded-3xl bg-gradient-to-br from-black/40 to-zinc-900/40 backdrop-blur-xl border border-orange-500/20">
              <div className="space-y-4 sm:space-y-5 md:space-y-6 text-orange-100/90 font-serif leading-relaxed">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl">
                  At the IEEE High Impact Zonal Events (HIZE), we don't just showcase the future — we create it. The stage is now set for our high-impact Zonal Events 2.0, led by <span className="text-orange-400 font-semibold">Abhinav Gambhir, Associate Director at Oracle</span>. This marks the culmination of an inspiring journey that has brought together some of the most creative and driven tech minds from across the country.
                </p>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl">
                  Every edition of HIZE is built on a foundation of <span className="text-orange-500 font-semibold">excellence</span>, <span className="text-orange-400 font-semibold">inclusivity</span>, and <span className="text-orange-300 font-semibold">innovation</span>. From expert-led workshops and panel discussions to dynamic hackathons and startup showcases, the series cultivates a rich environment for skill development and networking. Participants not only gain technical mastery but also experience the collaborative energy that defines the IEEE ecosystem.
                </p>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl">
                  Backed by the global legacy of IEEE and the forward-thinking vision of the IEEE Computer Society, HIZE has become one of India's most anticipated student-driven technology movements. It's more than just a set of events — it's a <span className="text-orange-500 font-semibold">transformative journey</span> that shapes today's learners into tomorrow's leaders.
                </p>
              </div>

              <motion.div
                className="absolute -inset-[1px] bg-gradient-to-r from-orange-600/20 via-orange-500/20 to-orange-600/20 rounded-3xl blur-xl -z-10"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="pt-12 flex flex-col items-center gap-4"
          >
            <motion.button
              onClick={() => setShowRegistrationPopup(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-xl md:rounded-2xl bg-gradient-to-r from-orange-600 to-orange-400 font-black text-base sm:text-lg md:text-xl text-black shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70 transition-all w-full sm:w-auto"
            >
              REGISTER NOW
            </motion.button>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-400/20 backdrop-blur-sm border-2 border-orange-500/30"
            >
              <ArrowDown className="w-7 h-7 text-orange-400" strokeWidth={3} />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section
        ref={(el) => { sectionsRef.current[1] = el }}
        className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-14 md:py-16"
      >
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-3 sm:mb-4 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 bg-clip-text text-transparent">
              VENUE MAP
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-orange-200/80 font-serif max-w-2xl mx-auto px-4">
              Find us on campus. View and open the full Google Map for directions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative p-6 sm:p-8 md:p-10 lg:p-12 rounded-2xl md:rounded-3xl bg-gradient-to-br from-black/60 to-zinc-900/60 backdrop-blur-xl border border-orange-500/20"
          >
            <div className="flex flex-col gap-6 sm:gap-7 md:gap-8">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-orange-500/40 text-sm font-semibold text-orange-200 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  Map
                </div>
                <p className="text-sm text-slate-400">
                  Google Maps embed with campus location
                </p>
              </div>

              <div className="relative w-full rounded-xl md:rounded-2xl overflow-hidden bg-black/40 border border-orange-500/30 shadow-2xl">
                <div className="relative aspect-[4/3] w-full">
                  <iframe
                    src="https://www.google.com/maps/d/embed?mid=1UfC_a8sotHQhQRM1hjjGmziJiRXu-7c&ehbc=2E312F"
                    className="w-full h-full absolute inset-0"
                    title="HIZE Venue Map"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-2 rounded-full bg-black/50 border border-white/10 text-xs text-orange-100">
                    Drag, zoom, or open in Maps
                  </div>
                </div>
              </div>
              

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-slate-300 text-sm sm:text-base font-mono">
                  SRM Institute of Science & Technology, Kattankulathur, Tamil Nadu
                </div>
                <motion.a
                  href="https://www.google.com/maps/d/u/0/viewer?mid=18kGFk2ClDWeZPYT0rkdUHRDRw98Mj5U&ehbc=2E312F"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-400 font-semibold text-black shadow-lg shadow-orange-500/40 hover:shadow-orange-500/70 transition-all duration-300"
                >
                  Open Full Map
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </motion.a>
              </div>
            </div>

            <motion.div
              className="absolute -inset-[1px] bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 rounded-3xl opacity-20 blur-2xl -z-10"
            />
          </motion.div>
        </div>
      </section>

      <section
        ref={(el) => { sectionsRef.current[2] = el }}
        className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-14 md:py-16"
      >
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-3 sm:mb-4 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 bg-clip-text text-transparent">
              EVENTS
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-orange-200/80 font-serif max-w-2xl mx-auto px-4">
              Explore our lineup of competitions, workshops and keynotes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {eventsData === null ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12">
                <p className="text-slate-400">Loading events…</p>
              </div>
            ) : eventsData.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12">
                <p className="text-slate-400">No events available.</p>
              </div>
            ) : (
              eventsData.map((event, index) => {
                const Icon = event.icon ? ICON_MAP[event.icon] ?? Code2 : Code2
                return (
                  <motion.div
                    key={event.title ?? index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" }}
                    className="group relative h-full flex flex-col"
                    style={{ transformStyle: "preserve-3d", willChange: "transform, opacity" }}
                  >
                    <div className="relative p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-black/60 to-zinc-900/60 backdrop-blur-xl border border-orange-500/20 overflow-hidden h-full flex flex-col">

                      <div className="relative z-10 flex flex-col flex-grow space-y-4 sm:space-y-5 md:space-y-6">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${event.color ?? "bg-gradient-to-br from-orange-600 to-orange-400"} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                        </div>

                        <div className="flex-grow">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">{event.title}</h3>
                          <div className="flex gap-1.5 sm:gap-2 flex-wrap mb-3 sm:mb-4">
                            {(event.tags ?? []).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs sm:text-sm font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm sm:text-base text-slate-400 font-serif leading-relaxed">
                            {event.description}
                          </p>
                        </div>

                        <button className="w-full py-2.5 sm:py-3 rounded-lg md:rounded-xl text-sm sm:text-base font-semibold bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-300">
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative py-10 sm:py-12 md:py-14">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-3 sm:mb-4 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 bg-clip-text text-transparent">
              EVENT TIMELINE
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-orange-200/80 font-serif max-w-2xl mx-auto px-4">
              Detailed schedule of all activities across the three days
            </p>
          </motion.div>
          <Timeline />
        </div>
      </section>

      <section
        ref={(el) => { sectionsRef.current[3] = el }}
        className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-14 md:py-16"
      >
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 sm:mb-12 md:mb-14"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-3 sm:mb-4 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 bg-clip-text text-transparent">
              Meet the Visionaries
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 font-serif max-w-2xl mx-auto mb-0 px-4">
              Our distinguished guest speakers and tech thought leaders for HIZE.
            </p>
          </motion.div>
          <div className="flex justify-center">
            <div className="grid gap-6 sm:gap-8 md:gap-10 lg:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
              {speakers.map((speaker, idx) => (
                <motion.div
                  key={speaker.name || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.1,
                    ease: "easeOut"
                  }}
                >
                  <SpeakerCard
                    speaker={speaker}
                    onClick={() => setSelectedSpeaker(speaker)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        {/* Enhanced Speaker detail lightbox modal */}
        <AnimatePresence>
          {selectedSpeaker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-3xl px-4 sm:px-6"
              onClick={() => setSelectedSpeaker(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative max-w-4xl w-full rounded-3xl bg-gradient-to-br from-black/90 via-zinc-900/95 to-black/90 backdrop-blur-2xl shadow-2xl border border-orange-500/30 overflow-hidden"
                onClick={e => e.stopPropagation()}
                style={{ willChange: "transform" }}
              >
                {/* Animated gradient border */}
                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-orange-500 via-pink-500 to-orange-400 opacity-50" />
                <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-orange-400 via-orange-500 to-pink-500 blur-sm opacity-30" />

                {/* Content container */}
                <div className="relative bg-gradient-to-br from-black/95 via-zinc-900/98 to-black/95 rounded-3xl">
                  {/* Header with gradient accent */}
                  <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-pink-500 to-orange-400" />

                  {/* Close button */}
                  <motion.button
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm border border-orange-500/20 text-white hover:border-orange-400/40 shadow-lg transition-all duration-300 group z-10"
                    onClick={() => setSelectedSpeaker(null)}
                    aria-label="Close"
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg width="20" height="20" className="mx-auto group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>

                  <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 p-6 sm:p-8 lg:p-10">
                    {/* Speaker Image */}
                    {selectedSpeaker.image && (
                      <motion.div
                        className="flex-shrink-0 mx-auto lg:mx-0"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl blur-lg opacity-30" />
                          <img
                            src={selectedSpeaker.image}
                            alt={selectedSpeaker.name}
                            className="relative w-48 h-64 sm:w-56 sm:h-72 lg:w-64 lg:h-80 rounded-2xl object-cover object-center border border-orange-400/30 shadow-2xl bg-neutral-900"
                            loading="eager"
                            decoding="async"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Speaker Details */}
                    <motion.div
                      className="flex-1 text-center lg:text-left space-y-4 sm:space-y-6"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent mb-3 leading-tight">
                          {selectedSpeaker.name}
                        </h2>
                        {selectedSpeaker.title && (
                          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-400/30 backdrop-blur-sm">
                            <p className="text-lg sm:text-xl font-semibold text-orange-200">
                              {selectedSpeaker.title}
                            </p>
                          </div>
                        )}
                      </div>

                      {selectedSpeaker.bio && (
                        <div className="prose prose-invert max-w-none">
                          <p className="text-base sm:text-lg text-orange-100/90 leading-relaxed whitespace-pre-line">
                            {selectedSpeaker.bio}
                          </p>
                        </div>
                      )}

                      {/* Social Links */}
                      {selectedSpeaker.social?.x && (
                        <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
                          <motion.a
                            href={selectedSpeaker.social.x}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-gray-800 to-black text-white font-semibold shadow-lg hover:shadow-gray-500/25 transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaTwitter className="w-5 h-5" />
                            <span>X (Twitter)</span>
                          </motion.a>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>


      <section
        ref={(el) => { sectionsRef.current[4] = el }}
        className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-14 md:py-16"
      >
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-3 sm:mb-4 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 bg-clip-text text-transparent">
              PARTNERS
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-orange-200/80 font-serif max-w-2xl mx-auto px-4">
              In collaboration with
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-2xl md:rounded-3xl"
          >
            <PartnersMarquee />
          </motion.div>
        </div>
      </section>

      <section
        ref={(el) => { sectionsRef.current[5] = el }}
        className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-14 md:py-16"
      >
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-3 sm:mb-4 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 bg-clip-text text-transparent">
              PREVIOUS EVENTS
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-orange-200/80 font-serif max-w-2xl mx-auto px-4">
              Revisit highlights from previous HIZE events.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative p-6 sm:p-8 md:p-10 lg:p-12 rounded-2xl md:rounded-3xl bg-gradient-to-br from-black/60 to-zinc-900/60 backdrop-blur-xl border border-orange-500/20"
          >
            <div className="text-center space-y-6 sm:space-y-7 md:space-y-8">

              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-gradient-to-br from-orange-600 to-orange-400 flex items-center justify-center shadow-lg mx-auto">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
              </div>

              <div className="px-4">
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                  Previous HIZE Event Details
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-slate-400 font-serif max-w-3xl mx-auto leading-relaxed">
                  Get comprehensive insights into our previous HIZE event, including event highlights,
                  participant achievements, keynote sessions, and memorable moments that made it a success.
                </p>
              </div>

              <div className="relative w-full">
                <div className="relative aspect-video w-full rounded-xl md:rounded-2xl overflow-hidden bg-black/40 border border-orange-500/30 shadow-2xl">
                  <iframe
                    src="https://www.ieeecshize.com/events"
                    className="w-full h-full absolute inset-0"
                    title="Previous HIZE Events Website Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent via-transparent to-black/20" />
                </div>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <motion.a
                    href="https://www.ieeecshize.com/events"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-orange-600 to-orange-400 font-bold text-base sm:text-lg text-black shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70 transition-all duration-300"
                  >
                    Open in New Tab
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </motion.a>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-slate-500 font-mono">
                  Previous Event Information
                </p>
              </div>
            </div>

            <motion.div
              className="absolute -inset-[1px] bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 rounded-3xl opacity-20 blur-2xl -z-10"
            />
          </motion.div>
        </div>
      </section>


      <section
        ref={(el) => { sectionsRef.current[6] = el }}
        className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-14 md:py-16"
      >
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-3 sm:mb-4 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 bg-clip-text text-transparent">
              STUDENT TEAM
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 font-serif max-w-2xl mx-auto mb-0 px-4">
              Our core student organizing team driving HIZE.
            </p>
          </motion.div>
          {domains.length === 0 && (!students || students.length === 0) ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading student team...</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {(domains.length > 0 ? domains : students).map((item: any, index: number) => {
                const isDomain = domains.length > 0
                const display = isDomain ? item.head : item
                const isCoreTeam = isDomain && item.domain === "CORE TEAM"

                return (
                  <motion.button
                    type="button"
                    key={(display?.name || "") + (display?.role || "") + (item?.domain || "")}
                    onClick={(e) => {
                      if (isCoreTeam) {
                        e.preventDefault()
                        e.stopPropagation()
                        return
                      }
                      if (isDomain) {
                        setSelectedDomain(item as DomainTeam)
                      }
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`relative p-6 sm:p-7 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-black/70 to-zinc-900/70 backdrop-blur-xl border border-orange-500/30 flex flex-col items-center text-center shadow-2xl group w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${isCoreTeam ? "cursor-default" : "cursor-pointer"}`}
                    disabled={isCoreTeam}
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 via-orange-500/20 to-orange-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-orange-500/40 mb-4 sm:mb-5 md:mb-6 group-hover:border-orange-400/60 transition-colors duration-300">
                      <Image
                        src={display.image}
                        alt={display.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 80px, (max-width: 1024px) 96px, 112px"
                      />
                    </div>
                    {isDomain && (
                      <p className="text-xs uppercase tracking-[0.2em] text-orange-400/70 mb-2">
                        {item.domain}
                      </p>
                    )}
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 text-white group-hover:text-orange-100 transition-colors duration-300">{display.name}</h3>
                    <p className="text-orange-400 font-bold text-sm sm:text-base md:text-lg group-hover:text-orange-300 transition-colors duration-300">{display.role}</p>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
      </section>


      <AnimatePresence>
        {selectedDomain && (
          <motion.div
            key="domain-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 py-10 bg-black/70 backdrop-blur"
            onClick={() => setSelectedDomain(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-4xl w-full bg-gradient-to-br from-zinc-950/90 via-zinc-900/90 to-black/90 border border-orange-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedDomain(null)}
                className="absolute top-4 right-4 text-slate-200 hover:text-white transition-colors"
                aria-label="Close team modal"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-orange-400/70">Domain</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white">{selectedDomain.domain}</h3>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-orange-500/30 bg-white/5">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-orange-500/50">
                      <Image
                        src={selectedDomain.head.image}
                        alt={selectedDomain.head.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-slate-300">Head</p>
                      <p className="font-semibold text-white">{selectedDomain.head.name}</p>
                      <p className="text-orange-400 text-sm">{selectedDomain.head.role}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-3">Team Members</p>
                  {selectedDomain.team && selectedDomain.team.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedDomain.team.map((member) => (
                        <div
                          key={member.name + member.role}
                          className="p-4 rounded-2xl border border-white/10 bg-white/5 flex items-center gap-3"
                        >
                          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-orange-500/30 flex-shrink-0">
                            <Image
                              src={member.image}
                              alt={member.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{member.name}</p>
                            <p className="text-sm text-orange-300">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border border-dashed border-white/15 bg-white/5 text-slate-400">
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <section
        ref={(el) => { sectionsRef.current[7] = el }}
        className="relative flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-14 md:py-16"
      >
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16 md:mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-4 sm:mb-6 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 bg-clip-text text-transparent">
              CONTACT
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-orange-200/80 font-serif max-w-2xl mx-auto px-4">
              Reach our faculty coordinators for HIZE 2026
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {facultyContacts.map((coordinator, index) => (
              <motion.div
                key={coordinator.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                className="relative p-6 sm:p-7 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-black/60 to-zinc-900/60 backdrop-blur-xl border border-orange-500/20 space-y-5 sm:space-y-6"
              >
                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  <div className="relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-orange-500/30">
                    <Image
                      src={coordinator.image}
                      alt={coordinator.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 80px, (max-width: 1024px) 88px, 96px"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">{coordinator.name}</h3>
                    <p className="text-sm sm:text-base text-slate-400 font-serif">{coordinator.designation || coordinator.role}</p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-white/10">
                  <motion.a
                    href={`mailto:${coordinator.email}`}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-orange-600 to-orange-400 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-mono break-all">{coordinator.email}</span>
                  </motion.a>

                  <motion.a
                    href={`tel:${coordinator.phone.replace(/\s/g, '')}`}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-mono">{coordinator.phone}</span>
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/10 py-10 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-slate-400">
                © 2026 IEEE CS SRM | In collaboration with SRM Institute of Science & Technology
              </p>
            </div>

            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-600 to-orange-400 flex items-center justify-center shadow-lg hover:shadow-orange-500/50 transition-shadow"
            >
              <ChevronUp className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-orange-600/8 via-orange-500/5 to-transparent pointer-events-none" />
      </footer>

      {/* Lightbox for speaker images */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => setLightboxImage(null)}
          >
            <button
              className="absolute top-4 right-4 z-[10000] p-3 rounded-full bg-orange-600 hover:bg-orange-500 transition-colors shadow-2xl shadow-orange-500/50"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-orange-500/50">
                <img
                  src={lightboxImage}
                  alt="Enlarged view"
                  className="w-full h-full object-contain"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-orange-500/30 rounded-3xl pointer-events-none" />
              </div>

              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-orange-600/30 via-orange-500/30 to-orange-600/30 rounded-3xl blur-3xl -z-10"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Popup */}
      <RegistrationPopup 
        isOpen={showRegistrationPopup} 
        onClose={() => setShowRegistrationPopup(false)} 
      />
    </div>
  )
}