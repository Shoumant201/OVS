"use client"

import type React from "react"

import { ElectionSidebar } from "./ElectionSidebar"
import { ElectionHeader } from "./ElectionHeader"
import { HelpButton } from "./NeedHelp"
import type { Election } from "@/components/dashboard/ElectionCard"

interface ElectionLayoutProps {
  election: Election
  children: React.ReactNode
  activePage?: "overview" | "settings" | "ballot" | "voters" | "preview" | "addons" | "launch"
}

export function ElectionLayout({ election, children, activePage = "overview" }: ElectionLayoutProps) {

  console.log("ElectionLayout rendering with ID:", election.id)

  return (
    <div className="flex min-h-screen">
      <ElectionSidebar
        startDate={election.start_date}
        endDate={election.end_date}
        votersCount={election.voters || 0}
        electionId={election.id}
        activePage={activePage}
      />

      <div className="flex-1 flex flex-col">
        <ElectionHeader
          title={election.title}
          status={election.status || "Building"}
          votersCount={election.voters || 0}
        />

        <div className="p-6">{children}</div>
      </div>

      <HelpButton />
    </div>
  )
}

