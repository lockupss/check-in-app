"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils"; // Adjust path if needed

export type Register = {
  userId: string;
  name: string;
  laptopBrand: string;
  department?: string;
  inTime: string | Date;
  outTime: string | Date;
};

export const columns: ColumnDef<Register>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "laptopBrand",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Laptop Brand <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => row.getValue("department") ?? "—",
  },
  {
    accessorKey: "inTime",
    header: "Check-In",
    cell: ({ row }) => <span className="text-muted-foreground">{formatTime(row.getValue("inTime"))}</span>,
  },
  {
    accessorKey: "outTime",
    header: "Check-Out",
    cell: ({ row }) => <span className="text-muted-foreground">{formatTime(row.getValue("outTime"))}</span>,
  },
];
