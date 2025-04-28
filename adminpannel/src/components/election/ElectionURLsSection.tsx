"use client"

import { CopyableField } from "./CopyableField"
import { Globe } from "lucide-react"

interface ElectionURLsSectionProps {
  electionId: string
}

export function ElectionURLsSection({ electionId }: ElectionURLsSectionProps) {
  const electionUrl = `https://vote.electionrunner.com/election/${electionId}`
  const previewUrl = `https://vote.electionrunner.com/preview/${electionId}/iXCHW9JjH9KaNPHb`
  const notAccessibleText = "This URL will not be accessible until after the election has been launched."

  return (
    <div className="border rounded-md mb-6">
      <div className="border-b px-4 py-3 bg-gray-50 flex items-center">
        <Globe className="mr-2 h-5 w-5" />
        <h3 className="font-semibold">Election URLs</h3>
      </div>

      <div className="p-4 space-y-4">
        <CopyableField label="Election URL" value={electionUrl} helpText={notAccessibleText} />

        <CopyableField label="Short URL" value="" helpText={notAccessibleText} />

        <CopyableField label="Preview URL" value={previewUrl} />

        <div>
          <div className="font-medium mb-2">Organization Subdomain</div>
          <a href="#" className="text-blue-500 hover:underline">
            Click here to set up your organization's subdomain
          </a>
        </div>
      </div>
    </div>
  )
}

