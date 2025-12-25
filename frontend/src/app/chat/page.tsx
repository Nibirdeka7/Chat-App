"use client"
import ChatSideBar from '@/components/ChatSideBar';
import Loading from '@/components/Loading';
import { chat_service, useAppData, User } from '@/context/AppContext'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from 'axios';
import ChatHeader from '@/components/ChatHeader';
import ChatMessages from '@/components/ChatMessages';
import MessageInput from '@/components/MessageInput';
import { SocketData } from '@/context/SocketContext';

export interface Message{
  _id: string;
  chatId: string,
  sender: string,
  text?: string,
  image?:{
    url: string,
    publicId: string,
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: string;
}

const ChatApp = () => {
  const {loading, isAuth, logoutUser, chats, user: loggedInUser, users, fetchChats, setChats} = useAppData();
  const {onlineUsers} = SocketData();
  console.log(onlineUsers);

  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null)
  const [user, setUser] = useState<User | null>(null)   // for the user that we will be chatting with
  const [showAllUser, setShowAllUser] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(null)

  
  const router = useRouter();
  useEffect(()=>{
    if(!isAuth && !loading){
      router.push("/login");
    }
  },[isAuth,router, loading]);
  

  const handleLogout = () => logoutUser();

  async function fetchChat(){
    const token = Cookies.get("token")
    try {
      const {data} = await axios.get(`${chat_service}/api/v1/message/${selectedUser}`,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setMessages(data.messages);
      setUser(data.user.user);
      await fetchChats();
    } catch (error) {
      console.log(error);
      toast.error("Failed to load messages");
    }
  }
  async function createChat(u: User){
    
    try {
      const token = Cookies.get("token")
      const {data} = await axios.post(`${chat_service}/api/v1/chat/new`, {
        userId: loggedInUser?._id, 
        otherUserId: u._id,
      },
     {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(data);
    setSelectedUser(data.chatId);
    setShowAllUser(false);
    await fetchChats();
    } catch (error) {
      toast.error("Failed to start chat");    
    }
  }

  const handleMessageSend = async (e: any, imageFile?: File | null)=>{
    e.preventDefault();

    if(!message.trim() && !imageFile) return
    if(!selectedUser) return
    // TODO: Socket ka kaam

    const token = Cookies.get("token");
    try {
      const formData = new FormData()

      formData.append("chatId", selectedUser);

      if(message.trim())
        formData.append('text', message)
      if(imageFile){
        formData.append("image", imageFile);
      }

      const {data} = await axios.post(`${chat_service}/api/v1/message`, formData,{
        headers:{
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        }
      })

      setMessages((prev) => {
        const currentMessages = prev || []
        const messageExists = currentMessages.some(
          (msg) => msg._id === data.message._id
        )

        if(!messageExists){
          return [...currentMessages, data.message]
        }
        return currentMessages
      });
      setMessage("")

      const displayText = imageFile ? "📷 photu" : message
    } catch (error: any) {
      toast.error(error.response.data.message);

    }
  }
  const handleTyping = (value: string)=> {
    setMessage(value);
    if(!selectedUser) return
    // TODO: Socket setup
  }

  



  useEffect(() => {
    if(selectedUser){
      fetchChat();
    }
  }, [selectedUser]);
  if(loading) return <Loading/>
  
  return (
    <div className='min-h-screen flex relative overflow-hidden '>
      <ChatSideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} showAllUsers={showAllUser}
        setShowAllUsers={setShowAllUser} users={users} loggedInUser={loggedInUser} chats={chats} selectedUser={selectedUser}
        setSelectedUser={setSelectedUser} handleLogout={handleLogout}
        createChat = {createChat} onlineUsers={onlineUsers}
      />
      <div className='flex-1 text-black flex flex-col justify-between p-4 backdrop-blur-xl border-1'>
        <ChatHeader user={user} setSidebarOpen={setSidebarOpen} isTyping={isTyping} onlineUsers={onlineUsers}/>
        <ChatMessages selectedUser={selectedUser} messages={messages} loggedInUser={loggedInUser}/>
        <MessageInput selectedUser={selectedUser} message={message} setMessage={handleTyping} handleMessageSend={handleMessageSend}/>
      </div>
    </div>
  )
}

export default ChatApp