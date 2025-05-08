"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import axiosInstance from "@/services/axiosInstance"

interface VoterTurnoutData {
  totalVoters: number
  actualVoters: number
  turnoutPercentage: number
  turnoutByDemographic: {
    age: Record<string, number>
    gender: Record<string, number>
    education: Record<string, number>
    location: Record<string, number>
  }
}

interface VoterTurnoutProps {
  electionId: string | number
}

export function VoterTurnout({ electionId }: VoterTurnoutProps) {
  const [turnoutData, setTurnoutData] = useState<VoterTurnoutData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTurnoutData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get(`/elections/${electionId}/turnout`)
        setTurnoutData(response.data.data)
      } catch (err) {
        console.error("Error fetching turnout data:", err)
        setError("Failed to load voter turnout data")
      } finally {
        setLoading(false)
      }
    }

    fetchTurnoutData()
  }, [electionId])

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Voter Turnout</CardTitle>
          <CardDescription>Loading turnout data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[50px] w-full rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-[250px] w-full rounded-md" />
              <Skeleton className="h-[250px] w-full rounded-md" />
              <Skeleton className="h-[250px] w-full rounded-md" />
              <Skeleton className="h-[250px] w-full rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !turnoutData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Voter Turnout</CardTitle>
          <CardDescription>Error loading turnout data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || "Failed to load data"}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const ageData = Object.entries(turnoutData.turnoutByDemographic.age).map(([age, percentage]) => ({
    name: age,
    turnout: percentage,
  }))

  const genderData = Object.entries(turnoutData.turnoutByDemographic.gender).map(([gender, percentage]) => ({
    name: gender === "prefer_not_to_say" ? "Prefer not to say" : gender.charAt(0).toUpperCase() + gender.slice(1),
    turnout: percentage,
  }))

  const educationData = Object.entries(turnoutData.turnoutByDemographic.education).map(([edu, percentage]) => ({
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
    turnout: percentage,
  }))

  const locationData = Object.entries(turnoutData.turnoutByDemographic.location)
    .sort((a, b) => b[1] - a[1]) // Sort by percentage descending
    .slice(0, 6) // Take top 6 countries
    .map(([country, percentage]) => ({
      name: country,
      turnout: percentage,
    }))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Voter Turnout</CardTitle>
        <CardDescription>
          {turnoutData.actualVoters} out of {turnoutData.totalVoters} eligible voters participated (
          {turnoutData.turnoutPercentage}
          %)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-100">Overall Turnout</h3>
              <p className="text-blue-700 dark:text-blue-200">
                {turnoutData.turnoutPercentage}% of eligible voters participated in this election
              </p>
            </div>
            <div className="text-3xl font-bold text-blue-800 dark:text-blue-100">
              {turnoutData.actualVoters} / {turnoutData.totalVoters}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age Turnout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Turnout by Age Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, "Turnout"]} />
                    <Bar dataKey="turnout" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gender Turnout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Turnout by Gender</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genderData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, "Turnout"]} />
                    <Bar dataKey="turnout" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Education Turnout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Turnout by Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={educationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, "Turnout"]} />
                    <Bar dataKey="turnout" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Location Turnout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Turnout by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, "Turnout"]} />
                    <Bar dataKey="turnout" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
