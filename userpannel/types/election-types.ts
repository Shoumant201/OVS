export interface ElectionResult {
    election_id: number | string
    title: string
    end_date: string
    results: QuestionResult[]
  }
  
  export interface QuestionResult {
    question_id: number
    title: string
    candidates: CandidateVotes[]
  }
  
  export interface CandidateVotes {
    id: number
    name: string
    votes: number
    photo?: string
    demographics?: DemographicData
  }
  
  export interface DemographicData {
    age: Record<string, number>
    gender: Record<string, number>
    education: Record<string, number>
    location: Record<string, number>
    occupation: Record<string, number>
  }
  
  export interface VoterTurnoutData {
    totalVoters: number
    actualVoters: number
    turnoutPercentage: number
    turnoutByDemographic: {
      age: Record<string, number>
      gender: Record<string, number>
      education: Record<string, number>
      location: Record<string, number>
    }
  }
  