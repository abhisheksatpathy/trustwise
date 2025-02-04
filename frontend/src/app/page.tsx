"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { GithubIcon, MessageSquareIcon, Wand2Icon, AlertCircle } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { columns } from "@/components/analysis/columns"
import { DataTable } from "@/components/analysis/data-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAnalysis } from "@/hooks/useAnalysis"
import { useTextAnalysis } from "@/hooks/useTextAnalysis"
import { Skeleton } from "@/components/ui/skeleton"
import { CurrentResult } from "@/components/analysis/current-result"

const chartConfig = {
  toxicity_score: {
    label: "Toxicity Score",
    color: "#FE4A60",
  },
  education_score: {
    label: "Education Level",
    color: "#FFC480",
  },
} satisfies ChartConfig

// Loading skeleton for the chart
function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[300px] w-full" />
      <div className="flex justify-center gap-4">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  )
}

// Loading skeleton for the table
function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}

export default function Home() {
  const [inputText, setInputText] = useState("")
  const { analyses, isLoading: isLoadingHistory, error: historyError, refetch } = useAnalysis()
  const { generateText, analyzeText, isAnalyzing, error: analysisError, currentResult } = useTextAnalysis()

  const handleGenerateText = async () => {
    const generatedText = await generateText()
    if (generatedText) {
      setInputText(generatedText)
    }
  }

  const handleAnalyzeText = async () => {
    if (!inputText.trim()) {
      return
    }

    const result = await analyzeText(inputText)
    if (result) {
      await refetch() // Refresh the analysis history
      setInputText("") // Clear the input after successful analysis
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF8]">
      <header className="sticky top-0 bg-[#FFFDF8] border-b-4 border-gray-900 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold">
              <span className="text-gray-900">Trust</span>
              <span className="text-[#FE4A60]">Wise</span>
            </h1>
            
            <nav className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="gap-2 text-gray-900 hover:bg-[#FFC480]"
                onClick={() => window.open('https://github.com/abhisheksatpathy/trustwise', '_blank')}
              >
                <GithubIcon className="w-4 h-4" />
                GitHub
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="relative border-4 border-gray-900 bg-[#fff4da]">
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter">
                  Text Analysis
                </h1>
                <p className="text-gray-600 text-lg">
                  Analyze any text for toxicity and educational value using AI models.
                </p>
              </div>

              <div className="space-y-4">
                <Input 
                  placeholder="Enter text to analyze... (max 512 characters for toxicity, 4096 for education)"
                  className="border-2 border-gray-900 border-primary rounded-lg h-24 text-lg p-4"
                  maxLength={4096}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="flex gap-4">
                  <Button 
                    className="bg-[#ffc480] hover:bg-[#FE4A60] text-gray-900 flex-1 h-12 gap-2 border-4 border-gray-900"
                    variant="outline"
                    onClick={handleGenerateText}
                    disabled={isAnalyzing}
                  >
                    <Wand2Icon className="w-4 h-4" />
                    Generate Text
                  </Button>
                  <Button 
                    className="flex-1 h-12 border-4 border-gray-900 bg-[#EBDBB7] hover:bg-[#FFC480] text-gray-800"
                    onClick={handleAnalyzeText}
                    disabled={isAnalyzing || !inputText.trim()}
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Current Result */}
          <CurrentResult 
            result={currentResult} 
            isLoading={isAnalyzing} 
          />

          {(historyError || analysisError) && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {historyError || analysisError}. Please try again.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Analysis History Chart */}
          <Card className="mt-8 relative border-4 border-gray-900 bg-[#fff4da]">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4">Analysis History</h2>
              {isLoadingHistory ? (
                <ChartSkeleton />
              ) : (
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                  <BarChart data={analyses}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="id"
                      tickLine={false}
                      tickMargin={20}
                      axisLine={false}
                    />
                    <YAxis
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      domain={[0, 1]}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend 
                      content={<ChartLegendContent />}
                      verticalAlign="bottom"
                      height={36}
                    />
                    <Bar 
                      dataKey="toxicity_score"
                      name={chartConfig.toxicity_score.label}
                      fill="var(--color-toxicity_score)" 
                      radius={4}
                    />
                    <Bar 
                      dataKey="education_score"
                      name={chartConfig.education_score.label}
                      fill="var(--color-education_score)" 
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </div>
          </Card>

          {/* Analysis History Table */}
          <Card className="mt-8 relative border-4 border-gray-900 bg-[#fff4da]">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4">Detailed History</h2>
              {isLoadingHistory ? (
                <TableSkeleton />
              ) : (
                <DataTable columns={columns} data={analyses} />
              )}
            </div>
          </Card>
        </div>
      </main>

      <footer className="border-t-4 border-gray-900 bg-[#FFFDF8] mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 items-center text-gray-900 text-sm">
            <div className="flex items-center space-x-4">
              <Button 
                variant="link" 
                className="text-gray-900 hover:text-gray-600"
                onClick={() => window.open('https://github.com/abhisheksatpathy/trustwise', '_blank')}
              >
                <GithubIcon className="w-4 h-4 mr-1" />
                Suggest Feature
              </Button>
            </div>
            <div className="flex justify-center text-muted-foreground">
              Made with ❤️ by Abhishek Satpathy
            </div>
            <div className="flex justify-end">
              <Button 
                variant="link" 
                className="text-gray-900 hover:text-gray-600"
                onClick={() => window.open('https://github.com/abhisheksatpathy/trustwise', '_blank')}
              >
                <MessageSquareIcon className="w-4 h-4 mr-1" />
                Feedback
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}