'use client'
import { ElectionLayout } from '@/components/election/ElectionLayout'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getElectionById, launchElection } from '@/services/api/Authentication'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle  } from 'lucide-react'
import type { Election } from '@/components/dashboard/ElectionCard'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'


const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center p-3 bg-white">
    <span className="font-medium">{label}</span>
    <span>{value}</span>
  </div>
)

const page = () => {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [election, setElection] = useState<Election | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)


  useEffect(() => {
    const fetchElection = async () => {
      try {
        const electionId = id && id !== 'undefined' ? id : localStorage.getItem('currentElectionId')

        if (!electionId) {
          console.error('No election ID available for fetching')
          return
        }

        const data = await getElectionById(electionId)

        if (data) {
          setElection(data)
        } else {
          console.error('Election not found in settings page')
        }
      } catch (error) {
        console.error('Error fetching election:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchElection()
  }, [id])

  const handleLaunchElection = async () => {
      try {
  
        // Update the election to publish results
        if (election) {
          await launchElection(election.id)
  
          // Update local state
          setElection({
            ...election,
            launched: true,
          })
  
          
      setShowDialog(true) // show the success dialog

        }
      } catch (error) {
        console.error("Error publishing results:", error)
      }
    }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!election) {
    return <div className="flex items-center justify-center h-screen">Election not found</div>
  }

  const startDate = new Date(election.start_date)
  const endDate = new Date(election.end_date)
  const now = new Date()

  const formattedStart = startDate.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })
  const formattedEnd = endDate.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })

  const showWarning = startDate < now

  return (
    <div>
      <ElectionLayout election={election} activePage="launch">
        <div className="max-w-3xl mx-auto p-4 space-y-6">
          <h2 className="text-xl font-semibold">✔ Confirm Election Details</h2>

          <div className="bg-gray-100 rounded-lg shadow-sm divide-y">
            <DetailRow label="Title" value={election.title} />
            <DetailRow label="Start Date" value={formattedStart} />
            <DetailRow label="End Date" value={formattedEnd} />
          </div>

          {showWarning && (
            <Alert variant="destructive">
              <AlertTriangle  className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This election's start date is in the past. It will start automatically within two minutes of launching.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-end">
            <Button
              onClick={handleLaunchElection}
              className="bg-green-500 hover:bg-green-600"
            >
              Continue
            </Button>
          </div>
          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Election Launched</AlertDialogTitle>
                <AlertDialogDescription>
                  The election has been successfully launched. It will start shortly according to the configured start date.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => router.push(`/election/${election.id}`)}>
                  Go to Overview
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      </ElectionLayout>
    </div>
  )
}

export default page
