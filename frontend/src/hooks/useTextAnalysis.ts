import { useState } from 'react'

interface AnalysisResult {
  id: number
  text: string
  toxicity_score: number
  education_score: number
  timestamp: string
}

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retries: number = MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetch(url, options)
    if (!response.ok && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return fetchWithRetry(url, options, retries - 1)
    }
    return response
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return fetchWithRetry(url, options, retries - 1)
    }
    throw error
  }
}

export function useTextAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null)

  const generateText = async () => {
    try {
      setIsAnalyzing(true)
      setError(null)
      const response = await fetchWithRetry(`${API_BASE_URL}/api/v1/generate-text`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to generate text')
      }

      const data = await response.json()
      return data.text as string
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate text')
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeText = async (text: string): Promise<AnalysisResult | null> => {
    try {
      setIsAnalyzing(true)
      setError(null)
      setCurrentResult(null)

      if (text.length > 4096) {
        throw new Error('Text exceeds maximum length of 4096 characters')
      }

      const response = await fetchWithRetry(`${API_BASE_URL}/api/v1/analyze`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze text')
      }

      const data = await response.json()
      setCurrentResult(data)
      return data as AnalysisResult
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze text')
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }

  return {
    generateText,
    analyzeText,
    isAnalyzing,
    error,
    currentResult
  }
}