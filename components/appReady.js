"use client"

import { createContext, useContext, useEffect, useState } from "react"

const AppReadyContext = createContext(false)

export function AppReadyProvider({ children }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    
    setReady(true)
  }, [])

  return (
    <AppReadyContext.Provider value={ready}>
      {children}
    </AppReadyContext.Provider>
  )
}

export function useAppReady() {
  return useContext(AppReadyContext)
}
