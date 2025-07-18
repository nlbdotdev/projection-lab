"use client"

import * as React from "react"
import { MoreVertical, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"

interface ExtrasMenuProps {
  onThemeChange?: (theme: string) => void
}

export function ExtrasMenu({ onThemeChange }: ExtrasMenuProps) {
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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette className="mr-2 h-4 w-4" /> Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onThemeChange && onThemeChange("default")}>Default</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onThemeChange && onThemeChange("gumroad")}>Gumroad</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onThemeChange && onThemeChange("linear")}>Linear</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onThemeChange && onThemeChange("notion")}>Notion</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 