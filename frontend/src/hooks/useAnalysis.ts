import { useState, useEffect } from 'react'
import type { Analysis } from '@/components/analysis/columns'

interface AnalysisData {
  analyses: Analysis[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export function useAnalysis(): AnalysisData {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalyses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE_URL}/api/v1/history`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch analyses')
      }
      
      const data = await response.json()
      setAnalyses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyses()
  }, [])

  return { 
    analyses, 
    isLoading, 
    error,
    refetch: fetchAnalyses
  }
}