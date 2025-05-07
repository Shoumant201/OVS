    "use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface TurnoutData {
  age?: {
    "18-24": number
    "25-34": number
    "35-44": number
    "45-54": number
    "55-64": number
    "65+": number
  }
  gender?: {
    male: number
    female: number
    other: number
    prefer_not_to_say: number
  }
  education?: {
    high_school: number
    bachelors: number
    masters: number
    phd: number
    other: number
  }
  location?: {
    [country: string]: number
  }
}

interface VoterTurnoutProps {
  totalVoters: number
  actualVoters: number
  turnoutData?: TurnoutData
}

export function VoterTurnout({ totalVoters, actualVoters, turnoutData }: VoterTurnoutProps) {
  const turnoutPercentage = Math.round((actualVoters / totalVoters) * 100)

  // Mock turnout data for demonstration
  // In a real app, this would come from your API
  const mockTurnoutData: TurnoutData = turnoutData || {
    age: {
      "18-24": 45,
      "25-34": 62,
      "35-44": 71,
      "45-54": 78,
      "55-64": 83,
      "65+": 85,
    },
    gender: {
      male: 68,
      female: 72,
      other: 65,
      prefer_not_to_say: 58,
    },
    education: {
      high_school: 58,
      bachelors: 72,
      masters: 85,
      phd: 92,
      other: 63,
    },
    location: {
      "United States": 74,
      India: 68,
      "United Kingdom": 71,
      Canada: 76,
      Australia: 79,
      Germany: 82,
      Other: 65,
    },
  }

  // Prepare chart data
  const ageData = Object.entries(mockTurnoutData.age || {}).map(([age, percentage]) => ({
    name: age,
    turnout: percentage,
  }))

  const genderData = Object.entries(mockTurnoutData.gender || {}).map(([gender, percentage]) => ({
    name: gender === "prefer_not_to_say" ? "Prefer not to say" : gender.charAt(0).toUpperCase() + gender.slice(1),
    turnout: percentage,
  }))

  const educationData = Object.entries(mockTurnoutData.education || {}).map(([edu, percentage]) => ({
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

  const locationData = Object.entries(mockTurnoutData.location || {})
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
          {actualVoters} out of {totalVoters} eligible voters participated ({turnoutPercentage}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age Turnout */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Turnout by Age Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ChartContainer
                  config={{
                    turnout: {
                      label: "Turnout %",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <BarChart data={ageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="turnout" fill="var(--color-turnout)" />
                  </BarChart>
                </ChartContainer>
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
                <ChartContainer
                  config={{
                    turnout: {
                      label: "Turnout %",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <BarChart data={genderData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="turnout" fill="var(--color-turnout)" />
                  </BarChart>
                </ChartContainer>
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
                <ChartContainer
                  config={{
                    turnout: {
                      label: "Turnout %",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <BarChart data={educationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="turnout" fill="var(--color-turnout)" />
                  </BarChart>
                </ChartContainer>
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
                <ChartContainer
                  config={{
                    turnout: {
                      label: "Turnout %",
                      color: "hsl(var(--chart-5))",
                    },
                  }}
                  className="h-[250px]"
                >
                  <BarChart data={locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="turnout" fill="var(--color-turnout)" />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
