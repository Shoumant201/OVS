"use client"

import { useState } from "react"
import { Copy, HelpCircle } from "lucide-react"
import { Input } from "../ui/input"

interface CopyableFieldProps {
  label: string
  value: string
  helpText?: string
}

export function CopyableField({ label, value, helpText }: CopyableFieldProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  return (
    <div>
      <div className="font-medium mb-2">{label}</div>
      <div className="flex">
        <Input type="text" value={value} readOnly className="flex-1 border rounded-l-md px-3 py-2 bg-gray-50" />
        <button
          onClick={copyToClipboard}
          className="border border-l-0 rounded-r-md px-3 py-2 bg-gray-100 hover:bg-gray-200 flex items-center"
        >
          <Copy className="h-5 w-5 mr-1" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {helpText && (
        <div className="text-gray-500 text-sm mt-1 flex items-center">
          <HelpCircle className="h-4 w-4 mr-1" />
          {helpText}
        </div>
      )}
    </div>
  )
}

