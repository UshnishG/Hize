"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion"

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let mounted = true
    const duration = 1500
    const steps = 30
    const stepDuration = duration / steps
    let currentStep = 0

    const interval = setInterval(() => {
      if (!mounted) return
      currentStep++
      const easeProgress = 1 - Math.pow(1 - currentStep / steps, 2)
      setProgress(Math.min(Math.floor(easeProgress * 100), 100))

      if (currentStep >= steps) {
        clearInterval(interval)
        if (mounted) {
          setTimeout(() => {
            if (mounted) {
              setIsComplete(true)
              setTimeout(() => {
                if (mounted) onLoadingComplete()
              }, 600)
            }
          }, 200)
        }
      }
    }, stepDuration)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [onLoadingComplete])

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {!isComplete && (
          <m.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.1),transparent_70%)]" />

            <div className="relative z-10 flex flex-col items-center gap-8 max-w-md mx-auto px-6">
              <m.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <h1 className="text-6xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-orange-500 via-orange-300 to-orange-500 bg-clip-text text-transparent text-center">
                  IEEE CS SYP HIZE
                </h1>
              </m.div>

              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full space-y-4"
              >
                <div className="relative h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                  <m.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                </div>

                <m.p
                  className="text-center text-orange-300/60 text-sm tracking-wider"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Loading...
                </m.p>
              </m.div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  )
}
