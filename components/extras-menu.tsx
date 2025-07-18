"use client"

import * as React from "react"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExtrasMenuProps {
  onExportPDF: () => void
}

/**
 * ExtrasMenu - Floating top-right button for extra actions
 * Currently supports exporting the forecast as PDF.
 */
export function ExtrasMenu({ onExportPDF }: ExtrasMenuProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full shadow-lg">
            <MoreVertical className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Extras</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onExportPDF}>
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 