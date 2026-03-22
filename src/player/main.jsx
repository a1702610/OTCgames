import React from 'react'
import { createRoot } from 'react-dom/client'
import { PlayerApp } from './PlayerApp.jsx'
import { demoModule } from '../data/demoModule.js'

async function startup() {
  let moduleData = null
  let isDemoMode = false

  try {
    const resp = await fetch('./content.json')
    if (resp.ok) {
      const json = await resp.json()
      if (json.module && json.shelves && json.products) {
        moduleData = json
      }
    }
  } catch {
    // No content.json — fall through to demo
  }

  if (!moduleData) {
    moduleData = demoModule
    isDemoMode = true
  }

  createRoot(document.getElementById('root')).render(
    <PlayerApp moduleData={moduleData} isDemoMode={isDemoMode} />
  )
}

startup()
