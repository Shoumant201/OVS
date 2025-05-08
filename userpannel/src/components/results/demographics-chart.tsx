"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts"
import axiosInstance from "@/services/axiosInstance"

interface CandidateVotes {
  id: number
  name: string
  votes: number
  photo?: string
}

interface QuestionResult {
  question_id: number
  title: string
  candidates: CandidateVotes[]
}

interface DemographicData {
  age: Record<string, number>
  gender: Record<string, number>
  education: Record<string, number>
  location: Record<string, number>
  occupation: Record<string, number>
}

interface DemographicChartsProps {
  results: QuestionResult[]
  electionId: string | number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

export function DemographicCharts({ results, electionId }: DemographicChartsProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string>(results[0]?.question_id.toString() || "")
  const [selectedCandidate, setSelectedCandidate] = useState<string>("")
  const [demographicType, setDemographicType] = useState<string>("age")
  const [demographicData, setDemographicData] = useState<DemographicData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Find the current question and candidate
  const currentQuestion = results.find((q) => q.question_id.toString() === selectedQuestion)
  const currentCandidate = currentQuestion?.candidates.find((c) => c.id.toString() === selectedCandidate)

  // When question changes, reset candidate selection to the first candidate
  const handleQuestionChange = (value: string) => {
    setSelectedQuestion(value)
    const question = results.find((q) => q.question_id.toString() === value)
    if (question && question.candidates.length > 0) {
      setSelectedCandidate(question.candidates[0].id.toString())
    } else {
      setSelectedCandidate("")
    }
  }

  // Initialize the first candidate when component mounts
  useEffect(() => {
    if (currentQuestion && currentQuestion.candidates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(currentQuestion.candidates[0].id.toString())
    }
  }, [currentQuestion, selectedCandidate])

  // Fetch demographic data when candidate selection changes
  useEffect(() => {
    if (!selectedQuestion || !selectedCandidate) return

    const fetchDemographicData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get(
          `/elections/${electionId}/questions/${selectedQuestion}/candidates/${selectedCandidate}/demographics`,
        )
        setDemographicData(response.data.data)
      } catch (err) {
        console.error("Error fetching demographic data:", err)
        setError("Failed to load demographic data")
        setDemographicData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDemographicData()
  }, [electionId, selectedQuestion, selectedCandidate])

  // Prepare chart data based on demographic type
  const prepareChartData = () => {
    if (!demographicData) return []

    switch (demographicType) {
      case "age":
        return Object.entries(demographicData.age).map(([age, count]) => ({
          name: age,
          votes: count,
        }))
      case "gender":
        return Object.entries(demographicData.gender).map(([gender, count]) => ({
          name: gender === "prefer_not_to_say" ? "Prefer not to say" : gender.charAt(0).toUpperCase() + gender.slice(1),
          votes: count,
        }))
      case "education":
        return Object.entries(demographicData.education).map(([edu, count]) => ({
          name:
            edu === "high_school"
              ? "High School"
              : edu === "bachelors"
                ? "Bachelor's"
                : edu === "masters"
                  ? "Master's"
                  : edu === "phd"
                    ? "PhD"
                    : edu.charAt(0).toUpperCase() + edu.slice(1),
          votes: count,
        }))
      case "location":
        return Object.entries(demographicData.location)
          .sort((a, b) => b[1] - a[1]) // Sort by count descending
          .slice(0, 6) // Take top 6 countries
          .map(([country, count]) => ({
            name: country,
            votes: count,
          }))
      case "occupation":
        return Object.entries(demographicData.occupation)
          .sort((a, b) => b[1] - a[1]) // Sort by count descending
          .slice(0, 6) // Take top 6 occupations
          .map(([occupation, count]) => ({
            name: occupation,
            votes: count,
          }))
      default:
        return []
    }
  }

  const chartData = prepareChartData()

  // Determine if we should use a pie chart or bar chart
  const shouldUsePieChart = demographicType === "gender"

  // Format labels for better display
  const formatDemographicType = (type: string) => {
    switch (type) {
      case "age":
        return "Age Group"
      case "gender":
        return "Gender"
      case "education":
        return "Education Level"
      case "location":
        return "Country"
      case "occupation":
        return "Occupation"
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demographic Analysis</CardTitle>
          <CardDescription>No results available for demographic analysis</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Demographic Analysis</CardTitle>
        <CardDescription>Analyze voting patterns by demographic factors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="question-select">Select Question</Label>
            <Select value={selectedQuestion} onValueChange={handleQuestionChange}>
              <SelectTrigger id="question-select">
                <SelectValue placeholder="Select a question" />
              </SelectTrigger>
              <SelectContent>
                {results.map((question) => (
                  <SelectItem key={question.question_id} value={question.question_id.toString()}>
                    {question.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="candidate-select">Select Candidate</Label>
            <Select value={selectedCandidate} onValueChange={setSelectedCandidate} disabled={!currentQuestion}>
              <SelectTrigger id="candidate-select">
                <SelectValue placeholder="Select a candidate" />
              </SelectTrigger>
              <SelectContent>
                {currentQuestion?.candidates.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id.toString()}>
                    {candidate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={demographicType} onValueChange={setDemographicType} className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="age">Age</TabsTrigger>
            <TabsTrigger value="gender">Gender</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="occupation">Occupation</TabsTrigger>
          </TabsList>

          {["age", "gender", "education", "location", "occupation"].map((type) => (
            <TabsContent key={type} value={type} className="pt-4">
              <h3 className="text-lg font-medium mb-4">
                Votes for {currentCandidate?.name || "Selected Candidate"} by {formatDemographicType(type)}
              </h3>

              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-[300px] w-full rounded-md" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : currentCandidate && demographicData ? (
                <div className="w-full h-[400px]">
                  {shouldUsePieChart ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="votes"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} votes`, "Votes"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => [`${value} votes`, "Votes"]} />
                        <Bar dataKey="votes" fill={COLORS[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Please select a candidate to view demographic data
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
