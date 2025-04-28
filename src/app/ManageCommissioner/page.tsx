"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axiosInstance from "@/services/axiosInstance"
import { Endpoints } from "@/services/Endpoints"
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
import { Search, Plus, ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { jwtDecode, type JwtPayload } from "jwt-decode"
import AccessDeniedDialog from "@/components/ui/AccessDenied"

interface Commissioner {
  id: number
  name: string
  email: string
  role: string
  elections: number
}

interface CustomJwtPayload extends JwtPayload {
  id: number
  role: String
}

export default function ManageCommissioners() {
  
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [commissioners, setCommissioners] = useState<Commissioner[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [commissionerToDelete, setCommissionerToDelete] = useState<Commissioner | null>(null)
  const [newCommissioner, setNewCommissioner] = useState<{ name: string; email: string } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter();

  const filteredCommissioners = commissioners.filter(
    (commissioner) =>
      commissioner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commissioner.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getAdminIdFromToken = () => {
    try {
      const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken")
      if (!token) return null

      const decoded = jwtDecode<CustomJwtPayload>(token)
      console.log("Decoded token:", decoded)

      // Return the admin ID using the correct field name
      return decoded.id
    } catch (error) {
      console.error("Error decoding token:", error)
      return null
    }
  }

  // Fetch commissioners from API
  useEffect(() => {
    axiosInstance
      .get(Endpoints.COMMISSIONER.getCommissioners)
      .then((res) => setCommissioners(res.data))
      .catch((err) => console.error("Error fetching commissioners:", err))
  }, [])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleAddCommissioner = async () => {
    try {
      // Make sure we have a valid admin email
      if (!getAdminIdFromToken()) {
        alert("Admin email not found. Please log in again.")
        return
      }

      const payload = {
        ...formData,
        // Use the admin email as the addedBy value
        addedBy: getAdminIdFromToken(),
      }

      console.log("Endpoint:", Endpoints.COMMISSIONER.addCommissioner)
      console.log("Form data:", payload)

      const res = await axiosInstance.post(Endpoints.COMMISSIONER.addCommissioner, payload)
      console.log("Response:", res.data)

      // Store the new commissioner data for the success dialog
      setNewCommissioner({
        name: formData.name,
        email: formData.email,
      })

      // Add the new commissioner to the list
      setCommissioners([...commissioners, res.data.commissioner])

      // Close the add dialog and open the success dialog
      setIsAddDialogOpen(false)
      setIsSuccessDialogOpen(true)

      // Reset the form
      setFormData({ name: "", email: "", password: "", role: "Commissioner" })
    } catch (error: any) {
      console.error("Error adding commissioner:", error)
      console.error("Response data:", error.response?.data)
      alert(error.response?.data?.message || "Failed to add commissioner")
    }
  }

  const openDeleteDialog = (commissioner: Commissioner) => {
    setCommissionerToDelete(commissioner)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteCommissioner = async () => {
    if (!commissionerToDelete) return

    try {
      const endpoint = Endpoints.COMMISSIONER.deleteCommissioner.replace(":id", commissionerToDelete.id.toString())
      await axiosInstance.delete(endpoint)
      setCommissioners(commissioners.filter((comm) => comm.id !== commissionerToDelete.id))
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting commissioner:", error)
      alert("Failed to delete commissioner. Please try again.")
    }
  }

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role" },
    {
      header: "Action",
      accessor: "id",
      cell: (commissioner: Commissioner) => (
        <ActionButtons showEdit={false} onDelete={() => openDeleteDialog(commissioner)} />
      ),
    },
  ]

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) {
      router.push("/login"); // Redirect to login if no token is found
      return;
    }

    const decodedToken = jwtDecode<CustomJwtPayload>(token);
    if (decodedToken.role === "commissioner") {
      setIsAccessDenied(true); // Show the Access Denied dialog
    }
  }, [router]);

  // Function to close the Access Denied dialog
  const closeAccessDeniedDialog = () => {
    setIsAccessDenied(false);
    router.push("/Dashboard"); // Redirect back to the dashboard if denied
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button> */}
      <PageHeader
        highlightedText="Commissioners"
        title="Management"
        description="Manage your election commissioners and their roles"
        buttonText="Add Commissioner"
        onButtonClick={() => setIsAddDialogOpen(true)}
      />

      


      <div className="border-t border-gray-200 pt-6">
        <SectionHeader title="All Commissioners" description="View and manage all your election commissioners" />
        <div className="mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search commissioners..."
                className="pl-3 pr-10 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </button>
            </div>
        </div>
        <DataTable columns={columns} data={filteredCommissioners} />
      </div>

      {/* Add Commissioner Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Commissioner</DialogTitle>
            <DialogDescription>Enter the details of the new commissioner below.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={handleChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleChange} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
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
            <Button className="bg-green-500 hover:bg-green-600 mt-4 sm:mt-0" onClick={handleAddCommissioner}>
              Add Commissioner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete commissioner{" "}
              <span className="font-semibold">{commissionerToDelete?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCommissioner}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Commissioner Added Successfully
            </DialogTitle>
            <DialogDescription>
              <p className="mb-2">
                {newCommissioner?.name} has been added as a commissioner with the email {newCommissioner?.email}.
              </p>
              <p>They can now log in using their email and the password you provided.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end mt-4">
            <Button onClick={() => setIsSuccessDialogOpen(false)} className="bg-green-500 hover:bg-green-600">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AccessDeniedDialog open={isAccessDenied} onClose={closeAccessDeniedDialog} />
    </div>
  )
}

