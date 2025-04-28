"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  htmlFor, // explicitly extracting htmlFor
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { htmlFor?: string }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      htmlFor={htmlFor} // forwarding htmlFor attribute here
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
