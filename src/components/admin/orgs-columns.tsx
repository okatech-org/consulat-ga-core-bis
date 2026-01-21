"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { OrgActionsCell } from "@/components/admin/org-actions-cell"
import { Doc } from "@convex/_generated/dataModel"
import { Building2 } from "lucide-react"

type Org = Doc<"orgs">


function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString()
}


function getOrgTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    consulate: "Consulate",
    embassy: "Embassy",
    ministry: "Ministry",
    other: "Other",
  }
  return labels[type] || type
}

export const columns: ColumnDef<Org>[] = [
  {
    accessorKey: "logoUrl",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Logo" />
    ),
    cell: ({ row }) => {
      const org = row.original
      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={org.logoUrl} alt={org.name} />
          <AvatarFallback className="text-xs bg-primary/10">
            <Building2 className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "slug",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
    cell: ({ row }) => (
      <code className="text-xs bg-muted px-1 py-0.5 rounded">
        {row.getValue("slug")}
      </code>
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant="secondary">
          {getOrgTypeLabel(type)}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value === row.getValue(id)
    },
  },
  {
    id: "address",
    accessorFn: (row) => `${row.address.city}, ${row.address.country}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    cell: ({ row }) => {
      const org = row.original
      return (
        <span className="text-muted-foreground">
          {org.address.city}, {org.address.country}
        </span>
      )
    },
  },
  {
    id: "contact",
    accessorFn: (row) => row.email || row.phone || "",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
    cell: ({ row }) => {
      const org = row.original
      return (
        <span className="text-sm text-muted-foreground">
          {org.email || org.phone || "—"}
        </span>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <Badge variant={isActive ? "default" : "outline"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const isActive = row.getValue(id) as boolean
      return value === String(isActive)
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => formatDate(row.getValue("createdAt") as number),
  },
  {
    id: "actions",
    cell: ({ row }) => <OrgActionsCell org={row.original} />,
  },
]
