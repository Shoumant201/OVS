export interface Election {
    id: number
    title: string
    status: string
    startDate: string
    endDate: string
  }
  
  interface ElectionCardProps {
    election: Election
  }
  
  export function ElectionCard({ election }: ElectionCardProps) {
    // Function to determine status badge styling
    const getStatusBadgeClasses = (status: string) => {
      switch (status.toLowerCase()) {
        case "scheduled":
          return "text-orange-700 bg-orange-100"
        case "ongoing":
          return "text-green-700 bg-green-100"
        case "finished":
          return "text-red-700 bg-red-100"
        default:
          return "text-gray-700 bg-gray-100"
      }
    }
  
    return (
      <div className="p-4 border-b last:border-b-0 hover:bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">{election.title}</h3>
            <span
              className={`inline-block px-3 py-1 text-sm font-medium rounded-md ${getStatusBadgeClasses(election.status)}`}
            >
              {election.status}
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-6 text-sm text-gray-600">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <span className="font-medium">START DATE</span>
              </div>
              <div>{election.startDate}</div>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <span className="font-medium">END DATE</span>
              </div>
              <div>{election.endDate}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  