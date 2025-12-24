import Loading from '@/components/Loading'
import VerifyOtp from '@/components/VerifyOTP'
import React, { Suspense } from 'react'

const verifyPage = () => {
  return (
    <Suspense fallback={<Loading/>}>
      <VerifyOtp/>
    </Suspense>
  )
}

export default verifyPage