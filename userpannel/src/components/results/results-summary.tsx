"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [activeQuestion, setActiveQuestion] = useState<string>(results[0]?.question_id.toString() || "")

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
      {results.length > 1 && (
        <Tabs value={activeQuestion} onValueChange={setActiveQuestion} className="w-full">
          <TabsList className="w-full flex overflow-x-auto">
            {results.map((question) => (
              <TabsTrigger key={question.question_id} value={question.question_id.toString()} className="flex-shrink-0">
                {question.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {results.map((questionResult) => {
        // Only show the active question if there are multiple questions
        if (results.length > 1 && questionResult.question_id.toString() !== activeQuestion) {
          return null
        }

        // Prepare data for pie chart
        const pieData = questionResult.candidates.map((candidate) => ({
          name: candidate.name,
          value: candidate.votes,
        }))

        // Calculate total votes
        const totalVotes = questionResult.candidates.reduce((sum, c) => sum + c.votes, 0)

        // Sort candidates by votes (descending)
        const sortedCandidates = [...questionResult.candidates].sort((a, b) => b.votes - a.votes)

        // Determine winner
        const winner = sortedCandidates[0]
        const isWinner = winner && winner.votes > 0

        return (
          <Card key={questionResult.question_id}>
            <CardHeader>
              <CardTitle>{questionResult.title}</CardTitle>
              <CardDescription>Total votes: {totalVotes}</CardDescription>
            </CardHeader>
            <CardContent>
              {isWinner && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-100 mb-2">Winner</h3>
                  <div className="flex items-center gap-4">
                    {winner.photo && (
                      <Image
                        src={winner.photo || "/placeholder.svg"}
                        alt={winner.name}
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold text-xl">{winner.name}</p>
                      <p className="text-green-700 dark:text-green-200">
                        {winner.votes} votes ({Math.round((winner.votes / totalVotes) * 100)}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                  {sortedCandidates.map((candidate, index) => {
                    const percentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0
                    const isLeading = index === 0 && candidate.votes > 0

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
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{candidate.name}</span>
                                {isLeading && (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                    Leading
                                  </Badge>
                                )}
                              </div>
                              <span className="text-gray-500 dark:text-gray-400">
                                {candidate.votes} votes ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                              <div
                                className={`h-2.5 rounded-full ${isLeading ? "bg-green-600" : "bg-blue-600"}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
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
