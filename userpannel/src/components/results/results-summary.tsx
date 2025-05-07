"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import Image from "next/image"

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

interface ResultsSummaryProps {
  results: QuestionResult[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function ResultsSummary({ results }: ResultsSummaryProps) {
  if (!results || results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Results Summary</CardTitle>
          <CardDescription>No results available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {results.map((questionResult) => {
        // Prepare data for pie chart
        const pieData = questionResult.candidates.map((candidate) => ({
          name: candidate.name,
          value: candidate.votes,
        }))

        // Calculate total votes
        const totalVotes = questionResult.candidates.reduce((sum, c) => sum + c.votes, 0)

        return (
          <Card key={questionResult.question_id}>
            <CardHeader>
              <CardTitle>{questionResult.title}</CardTitle>
              <CardDescription>Total votes: {totalVotes}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} votes`, "Votes"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Candidates List */}
                <div className="space-y-4">
                  {questionResult.candidates.map((candidate) => {
                    const percentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0

                    return (
                      <div key={candidate.id} className="space-y-2">
                        <div className="flex items-center gap-4">
                          {candidate.photo && (
                            <Image
                              src={candidate.photo || "/placeholder.svg"}
                              alt={candidate.name}
                              width={60}
                              height={60}
                              className="rounded-md object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{candidate.name}</span>
                              <span className="text-gray-500">
                                {candidate.votes} votes ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
