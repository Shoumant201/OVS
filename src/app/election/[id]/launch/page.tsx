'use client'
import { ElectionLayout } from '@/components/election/ElectionLayout'
import React from 'react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getElectionById } from '@/services/api/Authentication'

import type { Election } from "@/components/dashboard/ElectionCard"

const page = () => {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    
  return (
    <div>
      <ElectionLayout   activePage= "launch">
        <p>
            hello
        </p>
      </ElectionLayout>
    </div>
  )
}

export default page
