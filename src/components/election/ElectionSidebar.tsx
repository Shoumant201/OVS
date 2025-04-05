"use client"

import type React from "react"
import Link from "next/link"
import { Home, Settings, FileText, Users, Eye, Package } from "lucide-react"
import { DateTime } from "luxon"

// Update the ElectionSidebar component to include the electionId prop and use it for navigation
interface ElectionSidebarProps {
  startDate: string
  endDate: string
  votersCount: number
  electionId: string
  activePage?: "overview" | "settings" | "ballot" | "voters" | "preview" | "addons"
}

export function ElectionSidebar({
  startDate,
  endDate,
  votersCount,
  electionId,
  activePage = "overview",
}: ElectionSidebarProps) {
  return (
    <div className="w-[208px] bg-[#1e2a3a] text-white flex flex-col">
      <nav className="flex-1 py-4">
        <NavItem icon={<Home />} label="Overview" active={activePage === "overview"} href={`/election/${electionId}`} />
        <NavItem
          icon={<Settings />}
          label="Settings"
          active={activePage === "settings"}
          href={`/election/${electionId}/settings`}
        />
        <NavItem
          icon={<FileText />}
          label="Ballot"
          active={activePage === "ballot"}
          href={`/election/${electionId}/ballot`}
        />
        <NavItem
          icon={<Users />}
          label="Voters"
          active={activePage === "voters"}
          href={`/election/${electionId}/voters`}
        />
        <NavItem
          icon={<Eye />}
          label="Preview"
          active={activePage === "preview"}
          href={`/election/${electionId}/preview`}
        />
        <NavItem
          icon={<Package />}
          label="Add-ons"
          active={activePage === "addons"}
          href={`/election/${electionId}/addons`}
        />
      </nav>

      <div className="p-4 text-xs text-gray-400 mt-auto">
        <div className="mb-2">
          <div className="text-xs uppercase font-semibold mb-1">BASE PRICE</div>
          <div className="flex items-center">
            <span className="bg-green-500 text-white text-xs px-1 mr-1">FREE</span>
            <span>{votersCount} Voters</span>
          </div>
        </div>

        <div className="mb-2">
          <div className="text-xs uppercase font-semibold mb-1">START DATE</div>
          <div>{DateTime.fromISO(startDate).toFormat("M/d/yy, h:mm a")}</div>
        </div>

        <div className="mb-2">
          <div className="text-xs uppercase font-semibold mb-1">END DATE</div>
          <div>{DateTime.fromISO(endDate).toFormat("M/d/yy, h:mm a")}</div>
        </div>

        <div className="mb-2">
          <div className="text-xs uppercase font-semibold mb-1">TIMEZONE</div>
          <div>Asia/Kathmandu</div>
        </div>

        {/* <div className="mt-4 text-[10px]">
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          <span className="mx-2">·</span>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
        </div> */}
      </div>
    </div>
  )
}

// Update the NavItem component to use Next.js Link for client-side navigation
function NavItem({
  icon,
  label,
  active = false,
  href,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  href: string
}) {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-2 text-sm ${active ? "bg-[#2c3e50] text-white" : "text-gray-300 hover:bg-[#2c3e50] hover:text-white"}`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  )
}

