"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DemographicData {
  age: {
    "18-24": number
    "25-34": number
    "35-44": number
    "45-54": number
    "55-64": number
    "65+": number
  }
  gender: {
    male: number
    female: number
    other: number
    prefer_not_to_say: number
  }
  education: {
    high_school: number
    bachelors: number
    masters: number
    phd: number
    other: number
  }
  location: {
    [country: string]: number
  }
  occupation: {
    [field: string]: number
  }
}

interface CandidateVotes {
  id: number
  name: string
  votes: number
  photo?: string
  demographics?: DemographicData
}

interface QuestionResult {
  question_id: number
  title: string
  candidates: CandidateVotes[]
}

interface DemographicChartsProps {
  results: QuestionResult[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]

export function DemographicCharts({ results }: DemographicChartsProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string>(results[0]?.question_id.toString() || "")
  const [selectedCandidate, setSelectedCandidate] = useState<string>("")
  const [demographicType, setDemographicType] = useState<string>("age")

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

  // Mock demographic data for demonstration
  // In a real app, this would come from your API
  const getMockDemographicData = (candidateId: number): DemographicData => {
    // Generate random but somewhat realistic data
    return {
      age: {
        "18-24": Math.floor(Math.random() * 100) + 20,
        "25-34": Math.floor(Math.random() * 150) + 50,
        "35-44": Math.floor(Math.random() * 120) + 40,
        "45-54": Math.floor(Math.random() * 100) + 30,
        "55-64": Math.floor(Math.random() * 80) + 20,
        "65+": Math.floor(Math.random() * 60) + 10,
      },
      gender: {
        male: Math.floor(Math.random() * 200) + 100,
        female: Math.floor(Math.random() * 200) + 100,
        other: Math.floor(Math.random() * 20) + 5,
        prefer_not_to_say: Math.floor(Math.random() * 30) + 10,
      },
      education: {
        high_school: Math.floor(Math.random() * 100) + 50,
        bachelors: Math.floor(Math.random() * 150) + 100,
        masters: Math.floor(Math.random() * 80) + 40,
        phd: Math.floor(Math.random() * 30) + 10,
        other: Math.floor(Math.random() * 40) + 20,
      },
      location: {
        "United States": Math.floor(Math.random() * 200) + 100,
        India: Math.floor(Math.random() * 150) + 50,
        "United Kingdom": Math.floor(Math.random() * 100) + 30,
        Canada: Math.floor(Math.random() * 80) + 20,
        Australia: Math.floor(Math.random() * 60) + 10,
        Germany: Math.floor(Math.random() * 50) + 10,
        Other: Math.floor(Math.random() * 100) + 30,
      },
      occupation: {
        Technology: Math.floor(Math.random() * 150) + 80,
        Healthcare: Math.floor(Math.random() * 100) + 50,
        Education: Math.floor(Math.random() * 80) + 40,
        Finance: Math.floor(Math.random() * 70) + 30,
        Government: Math.floor(Math.random() * 60) + 20,
        Retail: Math.floor(Math.random() * 50) + 20,
        Other: Math.floor(Math.random() * 120) + 60,
      },
    }
  }

  // Prepare chart data based on demographic type
  const prepareChartData = () => {
    if (!currentCandidate) return []

    // In a real app, you would use actual data from your API
    // For now, we'll generate mock data
    const demographics = currentCandidate.demographics || getMockDemographicData(currentCandidate.id)

    switch (demographicType) {
      case "age":
        return Object.entries(demographics.age).map(([age, count]) => ({
          name: age,
          votes: count,
        }))
      case "gender":
        return Object.entries(demographics.gender).map(([gender, count]) => ({
          name: gender === "prefer_not_to_say" ? "Prefer not to say" : gender.charAt(0).toUpperCase() + gender.slice(1),
          votes: count,
        }))
      case "education":
        return Object.entries(demographics.education).map(([edu, count]) => ({
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
        return Object.entries(demographics.location)
          .sort((a, b) => b[1] - a[1]) // Sort by count descending
          .slice(0, 6) // Take top 6 countries
          .map(([country, count]) => ({
            name: country,
            votes: count,
          }))
      case "occupation":
        return Object.entries(demographics.occupation)
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

              {currentCandidate ? (
                <div className="w-full h-[400px]">
                  {type === "gender" ? (
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
                    <ChartContainer
                      config={{
                        votes: {
                          label: "Votes",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[400px]"
                    >
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="votes" fill="var(--color-votes)" />
                      </BarChart>
                    </ChartContainer>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
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
