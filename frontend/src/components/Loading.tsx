import React from 'react'
import { Spinner } from './ui/spinner'

const Loading = () => {
  return (
    <div className='fixed inset-0 flex items-center justify-center'>
        <Spinner className='size-6 text-black'/>
    </div>
  )
}

export default Loading