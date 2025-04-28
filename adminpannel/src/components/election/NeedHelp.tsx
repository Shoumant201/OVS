"use client"

import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function HelpButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-orange-500 text-white hover:bg-orange-600 shadow-lg"
          >
            <HelpCircle className="h-6 w-6" />
            <span className="sr-only">Help</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Need help?</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

