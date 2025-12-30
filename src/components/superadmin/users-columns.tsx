"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { UserActionsCell } from "@/components/superadmin/user-actions-cell"
import { Doc } from "@convex/_generated/dataModel"

type User = Doc<"users">

// Helper to get initials
function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase()
  }
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return "??"
}

// Helper to format date
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString()
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "profileImageUrl",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Avatar" />
    ),
    cell: ({ row }) => {
      const user = row.original
      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.profileImageUrl} alt={user.email} />
          <AvatarFallback className="text-xs">
            {getInitials(user.firstName, user.lastName, user.email)}
          </AvatarFallback>
        </Avatar>
      )
    },
    enableSorting: false,
  },
  {
    id: "name",
    accessorFn: (row) => 
      row.firstName && row.lastName 
        ? `${row.firstName} ${row.lastName}` 
        : row.firstName || row.email,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const user = row.original
      const name = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || "—"
      return <span className="font-medium">{name}</span>
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("phone") || "—"}</span>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string | undefined
      return (
        <Badge variant={role === "superadmin" ? "default" : "secondary"}>
          {role === "superadmin" ? "Super Admin" : "User"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value === row.getValue(id)
    },
  },
  {
    accessorKey: "residenceCountry",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Country" />
    ),
    cell: ({ row }) => (
      <span>{row.getValue("residenceCountry") || "—"}</span>
    ),
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
    cell: ({ row }) => <UserActionsCell user={row.original} />,
  },
]
