import React, { useState } from 'react'
import { Button } from './ui/button';
import { Loader2, Paperclip, Send, X } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface MessageInputProps{
    selectedUser: string | null;
    message: string;
    setMessage: (message: string) => void;
    handleMessageSend: (e: any, imageFile?:File | null) => void;

}

const MessageInput = ({selectedUser, message, setMessage, handleMessageSend}: MessageInputProps) => {
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [isUploading, setisUploading] = useState(false)
    
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if(!message.trim() && !imageFile) return
        setisUploading(true);
        await handleMessageSend(e, imageFile)
        setImageFile(null)
        setisUploading(false)
    }
    if(!selectedUser) return null;
  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-2 pt-2 border-t border-gray-800'>
        {
            imageFile && <div className="relative w-fit">
                <img src={URL.createObjectURL(imageFile)} alt="preview" className='w-24 h-24 object-cover rounder-lg border border-gray-800'/>
                <Button type='button' size="icon" variant="default" className='absolute -top-2 -right-2 rounded-full'
                    onClick={()=>setImageFile(null)}
                >
                    <X className='w-4 h-4'/>
                </Button>
            </div>
        }
        <div className="flex items-center gap-2">
            <label className='cursor-pointer px-3 py-2' >
                <Paperclip size={22} className='hover:text-gray-600'/>
                <input type='file' accept="image/*" className="hidden" 
                    onChange={e=>{
                        const file = e.target.files?.[0];
                        if(file && file.type.startsWith("image/")){
                            setImageFile(file);
                        }
                    }}
                />
            </label>
            <Input type='text' className='flex-1 border h-10 border-gray-800 text-black placeholder-gray-600'
            placeholder={imageFile ? "Add caption...":"Type a message..."}
            value={message}
            onChange={e=>setMessage(e.target.value)}
            />
            <Button type="submit" variant="outline" disabled={(!imageFile && !message) || isUploading}
             className='border border-black  disabled:opacity-50 disabled:cursor-not-allowed' 
            >
                {
                    isUploading ? <Loader2 className='w-4 h-4 animate-spin'/> : <Send className='w-4 h-4'/>
                }
            </Button>
        </div>
    </form>
  )
}

export default MessageInput