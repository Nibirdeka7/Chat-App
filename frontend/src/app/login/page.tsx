"use client"
import Loading from "@/components/Loading"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppData, user_service } from "@/context/AppContext"
import axios from "axios"
import { ArrowRight, Loader, Loader2 } from "lucide-react"
import { redirect, useRouter } from "next/navigation"
import React, { useState } from 'react'
import toast from "react-hot-toast"

const loginPage = () => {
    const [email, setEmail] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const {isAuth, loading: userLoading} = useAppData();

    const handleSubmit = async(e: React.FormEvent<HTMLElement>): Promise<void>=>{
        e.preventDefault();
        setLoading(true);
        try {
            const {data} = await axios.post(`${user_service}/api/v1/login`, {
                email,
            });
            
            toast.success(data.message);
            router.push(`/verify?email=${email}`)
        } catch (error : any) {
            console.log(error);
            toast.error( error?.response?.data?.message ||
    error?.message ||
    "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    if(userLoading) return <Loading/>
    if(isAuth) return redirect("/chat");
  return (
    <div className="flex justify-center items-center min-h-screen ">
        <Card className="w-full max-w-sm">
            <CardHeader>
            <CardTitle>Welcome to do Chaplusi</CardTitle>
            <CardDescription>
            Enter your email below to begin your chaplusi
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6 mb-6">
                <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                />
                </div>
            </div>
            
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <div className="flex items-center gap-1">
                        <Loader2 className="w-5 h-5"/>
                        Sending OTP...
                    </div> :  
                        <div className="flex items-center gap-1"> 
                             Send OTP 
                            <ArrowRight className="h-4 w-4"/>
                        </div>
                    }
                </Button>
           
            </form>
        </CardContent>
        
        </Card>
    </div>
  )
}

export default loginPage