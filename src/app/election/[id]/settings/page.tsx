"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Settings, Calendar, Users, MessageSquare, Mail, PieChart, Copy, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ElectionLayout } from "@/components/election/ElectionLayout"
import { deleteElection, getElectionById, updateElection } from "@/services/api/Authentication"
import type { Election } from "@/components/dashboard/ElectionCard"
import withAuth from "@/hoc/withAuth"


import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { DateTime } from 'luxon';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";


function SettingsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [election, setElection] = useState<Election | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("general")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [start_date, setStartDate] = useState<Date | null>(null)
  const [end_date, setEndDate] = useState<Date | null>(null)

  const [timezone, setTimezone] = useState("Asia/Kathmandu")
  const [hideResults, setHideResults] = useState(false)
  const [allowDuplicateWriteIn, setAllowDuplicateWriteIn] = useState(false)

  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  

  // Check for ID in localStorage if not in params
  useEffect(() => {
    if (id === "undefined" || !id) {
      const storedId = localStorage.getItem("currentElectionId")
      if (storedId) {
        console.log("Settings page - Retrieved election ID from localStorage:", storedId)
        router.replace(`/election/${storedId}/settings`)
      } else {
        console.error("No election ID available in settings page")
        router.push("/dashboard")
      }
    }
  }, [id, router])

  useEffect(() => {
    const fetchElection = async () => {
      try {
        // Use the ID from params or from localStorage as a fallback
        const electionId = id && id !== "undefined" ? id : localStorage.getItem("currentElectionId")

        if (!electionId) {
          console.error("No election ID available for fetching")
          return
        }

        console.log("Settings page - Fetching election with ID:", electionId)
        const data = await getElectionById(electionId)

        if (data) {
          console.log("Settings page - Election data loaded:", data)
          setElection(data)

          // Initialize form values
          setTitle(data.title)
          setDescription(data.description || "")
          setStartDate(data.start_date)
          setEndDate(data.start_date)
        } else {
          console.error("Election not found in settings page")
        }
      } catch (error) {
        console.error("Error fetching election:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchElection()
  }, [id])

  const handleSaveGeneral =async () => {
    const response = await updateElection(election?.id, {title,description});

    console.log("Saving general settings:", { title, description })
    setSuccessMessage("General settings saved successfully!")
    setShowSuccessDialog(true)
    // Show success message
    
  }

  const handleSaveDates = async () => {

    if (!start_date || !end_date) {
      setSuccessMessage("Please select both start and end dates")
      setShowSuccessDialog(true)
      return
    }

    const formatedStartDate = DateTime.fromJSDate(start_date).toFormat("yyyy-MM-dd HH:mm:ss.SSS")
    const formatedEndDate = DateTime.fromJSDate(end_date).toFormat("yyyy-MM-dd HH:mm:ss.SSS")
    const response = await updateElection(election?.id, {start_date: formatedStartDate, end_date: formatedEndDate,});
    console.log("Saving dates:", { formatedStartDate, formatedEndDate, timezone })
    // Show success message
    setSuccessMessage("Election dates saved successfully!")
    setShowSuccessDialog(true)
  }

  const handleSaveResults = () => {
    // In a real app, you would call an API to save the changes
    console.log("Saving results settings:", { hideResults, allowDuplicateWriteIn })
    // Show success message
    alert("Results settings saved successfully!")
  }

  const handleDeleteElection = async () => {
    try {
      const response = await deleteElection(election?.id);
    // Redirect to dashboard
      router.push("/Dashboard")
    } catch (error){
      console.error("Error deleting election:", error)
    }
    
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!election) {
    return <div className="flex items-center justify-center h-screen">Election not found</div>
  }

  return (
    <ElectionLayout election={election} activePage="settings">
      <div className="flex items-center mb-4">
        <Settings className="mr-2 h-5 w-5" />
        <h2 className="text-xl font-semibold">Settings</h2>
      </div>

      <div className="flex">
        {/* Left sidebar */}
        <div className="w-[220px] border-r pr-4">
          <nav className="space-y-1">
            <SettingsNavItem
              icon={<Settings className="h-4 w-4" />}
              label="General"
              active={activeSection === "general"}
              onClick={() => setActiveSection("general")}
            />
            <SettingsNavItem
              icon={<Calendar className="h-4 w-4" />}
              label="Dates"
              active={activeSection === "dates"}
              onClick={() => setActiveSection("dates")}
            />
            <SettingsNavItem
              icon={<Users className="h-4 w-4" />}
              label="Voters"
              active={activeSection === "voters"}
              onClick={() => setActiveSection("voters")}
            />
            <SettingsNavItem
              icon={<MessageSquare className="h-4 w-4" />}
              label="Messages"
              active={activeSection === "messages"}
              onClick={() => setActiveSection("messages")}
            />
            <SettingsNavItem
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              active={activeSection === "email"}
              onClick={() => setActiveSection("email")}
            />
            <SettingsNavItem
              icon={<PieChart className="h-4 w-4" />}
              label="Results"
              active={activeSection === "results"}
              onClick={() => setActiveSection("results")}
            />
            <SettingsNavItem
              icon={<Copy className="h-4 w-4" />}
              label="Duplicate"
              active={activeSection === "duplicate"}
              onClick={() => setActiveSection("duplicate")}
            />
            <SettingsNavItem
              icon={<Trash2 className="h-4 w-4" />}
              label="Delete"
              active={activeSection === "delete"}
              onClick={() => setActiveSection("delete")}
            />
          </nav>
        </div>

        {/* Right content area */}
        <div className="flex-1 pl-6">
          {/* General Settings */}
          {activeSection === "general" && (
            <div className="border rounded-md p-6">
              <div className="flex items-center mb-4">
                <Settings className="mr-2 h-5 w-5" />
                <h3 className="text-lg font-semibold">General Settings</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="font-medium">
                    Title
                  </Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="description" className="font-medium">
                    Description
                  </Label>
                  <div className="border rounded-md mt-1 overflow-hidden">
                    <div className="flex items-center gap-1 p-1 border-b bg-gray-50">
                      <Button variant="ghost" size="sm" className="h-8 w-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 7V4h16v3" />
                          <path d="M9 20h6" />
                          <path d="M12 4v16" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 7V4H5v3" />
                          <path d="M9 20h6" />
                          <path d="M12 4v16" />
                        </svg>
                      </Button>
                      <div className="h-6 w-px bg-gray-300 mx-1"></div>
                      <Button variant="ghost" size="sm">
                        Formats
                      </Button>
                      <div className="h-6 w-px bg-gray-300 mx-1"></div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 font-bold">
                        B
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 italic">
                        I
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 underline">
                        U
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 18h12" />
                          <path d="M6 6h12" />
                          <path d="M13 12H6" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 18h12" />
                          <path d="M6 6h12" />
                          <path d="M18 12h-6" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 18h12" />
                          <path d="M6 6h12" />
                          <path d="M12 12h6" />
                        </svg>
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="border-0 focus-visible:ring-0 min-h-[200px]"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Max Length: 5,000 characters. ({5000 - description.length} remaining)
                  </p>
                </div>

                <Button className="bg-green-500 hover:bg-green-600" onClick={handleSaveGeneral}>
                  Save
                </Button>
              </div>
              <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Success</AlertDialogTitle>
                      <AlertDialogDescription>{successMessage}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
                        OK
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          )}

          {/* Dates Settings */}
          {activeSection === "dates" && (
            <div className="border rounded-md p-6">
              <div className="flex items-center mb-4">
                <Calendar className="mr-2 h-5 w-5" />
                <h3 className="text-lg font-semibold">Election Dates</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="start-date" className="font-medium">
                      Start Date
                    </Label>
                    <div className="relative mt-1">
                      <DatePicker
                        selected={start_date ? new Date(start_date) : null}
                        onChange={(date) => setStartDate(date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="LLL dd, yyyy, h:mm:ss a"
                        className="pl-10 w-full border rounded-md py-2 px-3"
                        placeholderText="Select start date and time"
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="end-date" className="font-medium">
                      End Date
                    </Label>
                    <div className="relative mt-1">
                      <DatePicker
                        selected={end_date ? new Date(end_date) : null}
                        onChange={(date) => setEndDate(date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="LLL dd, yyyy, h:mm:ss a"
                        className="pl-10 w-full border rounded-md py-2 px-3"
                        placeholderText="Select end date and time"
                      />
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="timezone" className="font-medium">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full mt-1 border rounded-md p-2"
                  >
                    <option value="Asia/Kathmandu">(GMT+05:45) Asia/Kathmandu</option>
                    <option value="America/New_York">(GMT-04:00) America/New_York</option>
                    <option value="America/Los_Angeles">(GMT-07:00) America/Los_Angeles</option>
                    <option value="Europe/London">(GMT+01:00) Europe/London</option>
                    <option value="Asia/Tokyo">(GMT+09:00) Asia/Tokyo</option>
                  </select>
                </div>

                <Button className="bg-green-500 hover:bg-green-600" onClick={handleSaveDates}>
                  Save
                </Button>
              </div>
              <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Success</AlertDialogTitle>
                      <AlertDialogDescription>{successMessage}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
                        OK
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          )}

          {/* Results Settings */}
          {activeSection === "results" && (
            <div className="border rounded-md p-6">
              <div className="flex items-center mb-4">
                <PieChart className="mr-2 h-5 w-5" />
                <h3 className="text-lg font-semibold">Results Settings</h3>
              </div>

              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Hide Results During Election</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Enabling this option will hide the election results from the election administrator until the
                        election has ended. Voters will not be able to view election results regardless of this setting.
                        This setting cannot be changed after your election launches.
                      </p>
                    </div>
                    <Switch checked={hideResults} onCheckedChange={setHideResults} />
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Allow Duplicate Write-In Values</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Enabling this option will allow voters to provide the same values for all write-in options on a
                        given ballot question.
                      </p>
                    </div>
                    <Switch checked={allowDuplicateWriteIn} onCheckedChange={setAllowDuplicateWriteIn} />
                  </div>
                </div>

                <Button className="bg-green-500 hover:bg-green-600" onClick={handleSaveResults}>
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* Delete Election */}
          {activeSection === "delete" && (
            <div className="border rounded-md">
              <div className="bg-red-600 text-white p-4 flex items-center">
                <Trash2 className="mr-2 h-5 w-5" />
                <h3 className="text-lg font-semibold">Delete Election</h3>
              </div>

              <div className="p-6">
                <p className="mb-6">
                  Are you sure you want to delete this election? This action is not reversible. Please contact support
                  if you need to make a change to an election that has already launched.
                </p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                      Delete Election
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the election.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleDeleteElection}
                      >
                        Yes, delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          {/* Placeholder for other sections */}
          {(activeSection === "voters" ||
            activeSection === "messages" ||
            activeSection === "email" ||
            activeSection === "duplicate") && (
            <div className="border rounded-md p-6">
              <h3 className="text-lg font-semibold mb-4 capitalize">{activeSection} Settings</h3>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          )}
        </div>
      </div>
    </ElectionLayout>
  )
}

function SettingsNavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
        active ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className={`mr-3 ${active ? "text-blue-600" : "text-gray-500"}`}>{icon}</span>
      {label}
    </button>
  )
}

export default withAuth(SettingsPage)
