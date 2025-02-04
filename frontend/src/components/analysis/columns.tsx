"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Analysis = {
  id: number
  text: string
  toxicity_score: number
  education_score: number
  created_at: string
}

export const columns: ColumnDef<Analysis>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "text",
    header: "Text",
    cell: ({ row }) => {
      const text: string = row.getValue("text")
      return <div className="max-w-[500px] truncate">{text}</div>
    },
  },
  {
    accessorKey: "toxicity_score",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Toxicity Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const score = parseFloat(row.getValue("toxicity_score"))
      return <div className="text-center font-medium">{score.toFixed(2)}</div>
    },
  },
  {
    accessorKey: "education_score",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Education Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const score = parseFloat(row.getValue("education_score"))
      return <div className="text-center font-medium">{score.toFixed(2)}</div>
    },
  },
  {
    accessorKey: "created_at",
    id: "time",
    header: "Time",
    cell: ({ row }) => {
      const timestamp: string = row.original.created_at
      try {
        const date = new Date(timestamp)
        const formatted = date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
        return <div className="min-w-[180px] text-center">{formatted}</div>
      } catch (error) {
        console.error('Date parsing error:', error)
        return 'Error parsing date'
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const analysis = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(analysis.text)}>
              Copy text
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]