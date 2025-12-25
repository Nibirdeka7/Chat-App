import { User } from '@/context/AppContext';
import React, { useState } from 'react'
import { Button } from './ui/button';
import { CornerDownRight, CornerUpLeft, LogOut, MessageCircle, MessageCircleMoreIcon, Plus, Search, UserCircle, X } from 'lucide-react';
import { Input } from './ui/input';
import Link from 'next/link';

interface ChatSideBarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    showAllUsers: boolean;
    setShowAllUsers: (show: boolean | ((prev: boolean) => boolean)) => void;
    users: User[] | null;
    loggedInUser: User | null;
    chats: any[] | null;
    selectedUser: string | null;
    setSelectedUser: (userId: string | null) => void;
    handleLogout: () => void;
    createChat: (user: User)=>void;
    onlineUsers: string[]
}


const ChatSideBar = ({sidebarOpen, setSidebarOpen, setShowAllUsers, showAllUsers, users, loggedInUser, chats, selectedUser, setSelectedUser, handleLogout, createChat, onlineUsers} : ChatSideBarProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    
  return (
    <aside className={`fixed z-20 sm:static top-0 left-0 h-screen w-80 bg-white border-r border-gray-500 
    transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
     sm:translate-x-0 transition-transform duration-300 flex flex-col
    `}>
        <div className="p-6 border-b border-gray-700">
            <div className='sm:hidden fle justify-end mb-0'>
                <Button variant="outline" size="icon" 
                onClick={() => setSidebarOpen(false)}
                ><X className='w-4 h-4'/></Button>
            </div>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 justify-between'>
                        <MessageCircleMoreIcon className='w-5 h-5'/>
                    </div>
                    <h2 className='text-xl font-bold'>{showAllUsers ? "New Chat" : "Messages"}</h2>
                </div>
                <Button variant="default" size="icon" 
                onClick={() => setShowAllUsers((prev) => !prev)}
                >
                    {
                        showAllUsers ? <X className='w-4 h-4'/> : <Plus className='w-4 h-4'/>
                    }
                </Button>
            </div>
        </div>

       {/* content */}
       <div className="flex-1 overflow-hidden px-4 py-2">
        {
            showAllUsers ? (<div className="space-y-4 h-full">
                <div className='relative  '>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-700'/>
                    <Input type='text' placeholder='Search User...' className='w-full pl-10 pr-4 py-3 border border-gray-700 bg-gray-100'
                    value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}/>
                </div>

                {/* users listing */}
                <div className="space-y-2 overflow-y-auto h-full pb-4">{
                    users?.filter((u) => u._id !== loggedInUser?._id && u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(
                        (u)=>(
                            <Button variant="outline" key={u._id} className='w-full p-5 rounded-lg border transition-colors text-left border-gray-700 hover:border-gray-600 hover:bg-gray-200'
                              onClick={()=>createChat(u)}
                            >
                                <div className='relative'>
                                    <UserCircle className='w-6 h-6'/>
                                    {
                                    onlineUsers.includes(u._id) && (
                                        <span className='absolute left-60 top-0.5 w-3.5 h-3.5
                                        rounded-full bg-green-600 border border-gray-900'/>
                                    )
                                }
                               </div>
                                <div className="flex-1 min-w-0 ">
                                    <span className='font-medium'>{u.name}</span>
                                    <div className="text-xs ">
                                        {/* TODO: online offline text */}
                                        {
                                            onlineUsers.includes(u._id) ? <span className='text-green-700'>online</span> :  <span className='text-gray-400'>offline</span>
                                        }
                                    </div>
                                </div>
                            </Button>
                        )
                    )
                }</div>
            </div>) :( chats && chats.length > 0 ? <div className="space-y-2 overflow-y-auto h-full pb-4">{
                    chats.map((chat)=>{
                        const latestMessage = chat.chat.latestMessage;
                        const isSelected = selectedUser === chat.chat._id;
                        const isSentByMe = latestMessage?.sender === loggedInUser?._id;
                        const unseenCount = chat.chat.unseenCount || 0;
                        
                        return <button  key={chat.chat._id} onClick={()=>{
                            setSelectedUser(chat.chat._id);
                            setSidebarOpen(false);
                        }} className={`w-full text-left p-4 rounded-lg transition-colors ${
                                    isSelected
                                    ? "bg-black border border-gray-500 "
                                    : "border border-gray-700 hover:bg-gray-300  hover:border-gray-600 "
                        }`}>
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="relative">
                                    <div>
                                        <UserCircle className={`w-8 h-8 ${isSelected ? "text-white": "text-black"}`} />
                                    </div>
                    
                                    {onlineUsers.includes(chat.user.user._id) && (
                                        <span className='absolute -top-0.5 -right-0.5 w-3.5 h-3.5
                                        rounded-full bg-green-500 border border-gray-900'/>
                                    )}
                                </div>

                                {/* Text + badge */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                    <span
                                        className={`font-semibold truncate ${
                                        isSelected
                                            ? "text-white"
                                            : "text-gray-900"

                                        }`}
                                    >
                                        {chat.user.user.name}
                                    </span>

                                    {unseenCount > 0 && (
                                        <div className="bg-red-600 text-white text-xs font-bold  ml-5 rounded-full min-w-[22px] h-5.5 flex items-center justify-center px-2">
                                        {unseenCount > 99 ? "99+" : unseenCount}
                                        </div>
                                    )}
                                    </div>
                                    {
                                        latestMessage && <div className="flex items-center gap-2">
                                            {
                                                isSentByMe? <CornerUpLeft size={14} className="text-shrink-0 text-blue-400" /> : <CornerDownRight size={14}  className="text-shrink-0 text-green-400" />
                                            }
                                            <span className={`text-sm truncate flex-1 ${isSelected? "text-gray-400" : "text-black"}`}>{latestMessage.text}</span>
                                        </div>
                                    }
                                </div>
                                </div>

                        </button>
                    })
                }</div> : 
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className='p-4 rounded-full mb-4'>
                        <MessageCircle className='w-8 h-8 text-gray-900'/>
                    </div>
                    <p className='text-gray-400 font-medium'>No conversation yet.</p>
                    <p className='text-sm text-gray-500 mt-1'>Start a new chat to begin messaging</p>
                </div>
        )}
       </div>

       {/* sidebar footer  */}
       <div className='border-t border-gray-900 space-y-2 m-3'>
        <Link href={'/profile'}>
        <Button className="w-full h-10 hover:scale-101">
            <UserCircle className='w-4 h-4'/>
            
            <span className='font-medium '>Profile</span>
        </Button>
        </Link>
        <Button onClick={handleLogout} variant="outline" className='w-full mt-2 h-10 border border-red-300 bg-red-200 hover:bg-red-700 hover:text-white text-red-700 transition'>
            <LogOut/>
             <span className='font-medium '>Logout</span>
        </Button>
        </div>
    </aside>
  )
}

export default ChatSideBar