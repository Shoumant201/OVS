"use client";
import withAuth from '@/hoc/withAuth';
import React from 'react'
import { useState } from 'react';

const Home = () => {

  const [count, setCount] = useState(0);

  let counter = () =>{
    setCount(count+1)
  };

  return (
    <div className='w-screen h-screen flex justify-center items-center flex-col'>
      <div className=''>
        <p>{count}</p>
      </div>
      <button type="button" onClick={counter} className=' w-[100px] h-[30px] rounded-4xl bg-green-600 flex justify-center items-center'>
        <p>Click ME!</p>
      </button>
    </div>
  )
}

export default withAuth(Home)
