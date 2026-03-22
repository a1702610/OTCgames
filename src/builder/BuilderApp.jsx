import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BuilderProvider, useBuilder } from './BuilderContext.jsx'
import { Step0_Home } from './steps/Step0_Home.jsx'
import { Step1_Setup } from './steps/Step1_Setup.jsx'
import { Step2_Authoring } from './steps/Step2_Authoring.jsx'
import { Step3_Preview } from './steps/Step3_Preview.jsx'
import { Step4_Export } from './steps/Step4_Export.jsx'

const STEPS = [Step0_Home, Step1_Setup, Step2_Authoring, Step3_Preview, Step4_Export]

function BuilderInner() {
  const { state } = useBuilder()
  const StepComponent = STEPS[state.step] || Step0_Home

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        style={{ minHeight: '100vh' }}
      >
        <StepComponent />
      </motion.div>
    </AnimatePresence>
  )
}

export function BuilderApp() {
  return (
    <BuilderProvider>
      <BuilderInner />
    </BuilderProvider>
  )
}
