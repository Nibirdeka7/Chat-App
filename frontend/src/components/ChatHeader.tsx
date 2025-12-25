import React from 'react'
import { Button } from './ui/button'
import { Menu, UserCircle } from 'lucide-react'
import { User } from '@/context/AppContext';



interface ChatHeaderProps{
    user: User | null;
    setSidebarOpen: (open: boolean)=>void;
    isTyping: boolean;
    onlineUsers: string[]
}
const ChatHeader = ({user, setSidebarOpen, isTyping, onlineUsers}: ChatHeaderProps) => {
   const isOnlineUser = user && onlineUsers.includes(user._id)

  return (
    <>
        {/* mobile menu toggle button*/}
        <div className="sm:hidden fixed top-4 right-4 z-30">
            <Button size="icon" variant="outline" className='' 
               onClick={() => setSidebarOpen(true)}>
                <Menu className='w-5 h-5'/>
            </Button>
        </div>

        <div className="mb-6 rounded-lg p-6 border border-gray-800 ">
            <div className="flex items-center gap-4">
                {
                    user? <>
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center">
                                <UserCircle className='w-10 h-10'/>
                            </div>
                            {/* TODO: online user  */}
                            {
                                isOnlineUser && (
                                    <span className='absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border border-black'>
                                        <span className='absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75'></span>
                                    </span>
                                )
                            }
                            
                        </div>
                        {/* user info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className='text-2xl font-semibold text-black truncate'>
                                    {user.name}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {
                                    isTyping ? <div className="flex items-center gap-2 text-sm ">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></div>
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                                        </div>
                                        <span className="text-blue-500 font-medium ">typing...</span>
                                    </div> : <div className='flex items-center gap-2'>
                                        <div className={`w-2 h-2 rounded-full ${isOnlineUser ? "bg-green-500" : "bg-gray-500"}`}></div>
                                        <span className={`text-sm font-medium ${isOnlineUser ? "text-green-500" : "text-gray-400"}`}>{isOnlineUser? "Online" : "Offline"}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </> : <div className='flex items-center gap-4'>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center">
                            <UserCircle className='w-8 h-8'/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-600">
                                Select a conversation
                            </h2>
                            <p className="text-sm mt-1">
                                Choose chat from sidebar to start messaging
                            </p>
                        </div>

                    </div>
                }
            </div>
        </div>
    </>
  )
}

export default ChatHeader