import LoginPage from '@/pages/login/Page'
import React from 'react'
import { type Locale, getDictionary } from "@/lib/dictionary"

const Login = async ({
  params: {lang},
}: {
  params: {lang: Locale}
}) => {

  const dictionary = await getDictionary(lang)
  return (
    
      <LoginPage dictionary={dictionary} locale={lang}/>
    
  )
}

export default Login
