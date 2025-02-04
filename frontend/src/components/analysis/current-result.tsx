import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CurrentResultProps {
  result: {
    toxicity_score: number
    education_score: number
    timestamp: string
  } | null
  isLoading: boolean
}

export function CurrentResult({ result, isLoading }: CurrentResultProps) {
  if (isLoading) {
    return (
      <Card className="mt-4 border-4 border-gray-900 bg-[#fff4da]">
        <div className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (!result) return null

  const toxicityLevel = result.toxicity_score < 0.5 ? "Low" : "High"
  
  let educationLevel = "Elementary"
  if (result.education_score >= 0.8) {
    educationLevel = "Graduate"
  } else if (result.education_score >= 0.6) {
    educationLevel = "Undergraduate"
  } else if (result.education_score >= 0.4) {
    educationLevel = "High School"
  } else if (result.education_score >= 0.2) {
    educationLevel = "Middle School"
  }

  return (
    <Card className="mt-4 border-4 border-gray-900 bg-[#fff4da]">
      <div className="p-6 space-y-4">
        <Alert variant={toxicityLevel === "Low" ? "default" : "destructive"}>
          {toxicityLevel === "Low" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>Analysis Result</AlertTitle>
          <AlertDescription>
            Toxicity: {toxicityLevel} ({(result.toxicity_score * 100).toFixed(1)}%)
            <br />
            Education Level: {educationLevel} (Score: {(result.education_score * 100).toFixed(1)}%)
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  )
}