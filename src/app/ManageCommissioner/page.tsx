"use client"

import { PageHeader } from "@/components/page-header"
import { SectionHeader } from "@/components/section-header"
import { DataTable } from "@/components/data-table"
import { ActionButtons } from "@/components/actionButton"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog"
  import { Label } from "@/components/ui/label"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { useEffect, useState } from "react"

export default function ManageCommissioners() {

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    const handleAddCommissioner = () => {
        setIsAddDialogOpen(false)

      }

      const handleDeleteCommissioner =  (id: any) => {
        if (confirm("Are you sure you want to delete this commissioner?")) {

        }
      }

  // Sample commissioner data
  const commissioners = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      role: "Head Commissioner",
      elections: 5,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "Assistant Commissioner",
      elections: 3,
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael.brown@example.com",
      role: "Commissioner",
      elections: 4,
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Commissioner",
      elections: 2,
    },
    {
      id: 5,
      name: "Robert Wilson",
      email: "robert.wilson@example.com",
      role: "Assistant Commissioner",
      elections: 3,
    },
    {
      id: 6,
      name: "Jennifer Lee",
      email: "jennifer.lee@example.com",
      role: "Commissioner",
      elections: 1,
    },
  ]

  // Table columns configuration
  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role" },
    { header: "Elections", accessor: "elections" },
    {
      header: "Action",
      accessor: "id",
      cell: (commissioner: any) => (
        <ActionButtons showEdit={false} onDelete={() => handleDeleteCommissioner(commissioner.id)} />
      ),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        highlightedText="Commissioners"
        title="Management"
        description="Manage your election commissioners and their roles"
        buttonText="Add Commissioner"
        onButtonClick={() => setIsAddDialogOpen(true)}
      />

      <div className="border-t border-gray-200 pt-6">
        <SectionHeader title="All Commissioners" description="View and manage all your election commissioners" />

        <DataTable columns={columns} data={commissioners} />
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Commissioner</DialogTitle>
            <DialogDescription>Enter the details of the new commissioner below.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                // value={}
                // onChange={}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                // value={}
                // onChange={}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                // value={}
                // onChange={}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                // value={}
                // onValueChange={}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Commissioner">Commissioner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-500 hover:bg-green-600 mt-4 sm:mt-0" onClick={() => setIsAddDialogOpen(false)}>Add Commissioner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

