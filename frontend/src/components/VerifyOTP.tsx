"use client"
import React, { useEffect, useRef, useState } from 'react'
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
import { ArrowLeft, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react'
import { useSearchParams, useRouter, redirect } from 'next/navigation'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useAppData, user_service } from '@/context/AppContext'
import Loading from './Loading'
import toast from 'react-hot-toast'

const VerifyOtp = () => {
    const {isAuth, setIsAuth, setUser, loading: userLoading} = useAppData();

    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState<string[]>(["","","","","",""]);
    const [error, setError] = useState<string>("");
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const router = useRouter();

    const searchParams = useSearchParams();
    const email : string = searchParams.get("email") || "";

    useEffect(() => {
        if(timer > 0){
            const interval = setInterval(()=>{
                setTimer((prev)=>prev-1);
            },1000);
            return ()=>clearInterval(interval);
        }
    },[timer]);

    const handleInputChange = (index: number, value: string): void => {
        if(value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError("");

        if(value && index < 5){
            inputRefs.current[index+1]?.focus()
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLElement>): void => {
        if(e.key === "Backspace" && !otp[index] && index > 0){
            inputRefs.current[index-1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");
        const digits = pastedData.replace(/\D/g, "").slice(0,6);
        if(digits.length === 6){
            const newOtp = digits.split("");
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
        }
    };
    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const otpString = otp.join("");
        if(otpString.length !== 6){
            setError("Please enter all 6 digits");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const {data} = await axios.post(`http://localhost:3000/api/v1/verify`,{
                email,
                otp: otpString,
            });
           
            toast.success(data.message);
            Cookies.set("token", data.token, {
                expires: 15,
                secure: false,
                path: "/"
            });
            setOtp(["","","","","",""]);
            inputRefs.current[0]?.focus();
            setUser(data.user);
            setIsAuth(true);
        } catch (error : any) {
            setError(error.response.data.message);
        } finally{
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true)
        setError("")
        try {
            const {data} = await axios.post(`${user_service}/api/v1/login`, {
                email,
            });
            toast.success(data.message);
            setTimer(60);
        } catch (error: any) {
            setError(error.response.data.message);
        } finally {
            setResendLoading(false);
        }
    }
    if(userLoading) return <Loading/>

    if(isAuth) redirect("/chat");
  return (
    <div className="flex justify-center items-center min-h-screen ">
        <Card className="w-full max-w-sm">
            <CardHeader className='relative'>
                <Button variant="outline" size="icon" className='absolute top-0 left-2'
                    onClick={() => router.push("/login")}
                ><ChevronLeft className='w-4 h-4'/></Button>
            <CardTitle className='flex items-center justify-center'>Verify your mail</CardTitle>
            <CardDescription className='text-center'>
            We have sent an OTP to your email:
            <p className='text-blue-600 flex justify-center'>{email}</p>
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6 mb-6">
                <div className="grid gap-2">
                <Label >Enter your 6 digit OTP here</Label>
                <div className='flex justify-center in-checked: space-x-3'>
                    {
                        otp.map((digit, index)=>(
                            <input key={index} ref={(el: HTMLInputElement | null)=>{
                                inputRefs.current[index] = el;
                            }} type="text" maxLength={1} value={digit} 
                                onChange={e=>handleInputChange(index, e.target.value)}
                                onKeyDown={e=> handleKeyDown(index, e)}
                                onPaste={index === 0 ? handlePaste: undefined}
                                className='w-12 h-12 text-center text-xl border border-gray-600 rounded-lg bg-gray-100'
                            />
                            
                        ))
                    }
                </div>
                </div>
            </div>
                    {
                        error && <div className='bg-red-300 p-2 rounded-lg mb-2'>
                            <p className='text-red-800 text-sm text-center'>{error}</p>
                        </div>
                    }
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <div className="flex items-center gap-1">
                        <Loader2 className="w-5 h-5"/>
                        Verifying OTP...
                    </div> :  
                        <div className="flex items-center gap-1"> 
                             Verify
                            <ArrowRight className="h-4 w-4"/>
                        </div>
                    }
                </Button>
           
            </form>
            <div className="mt-6 text-center">
                <p className='text-gray-500 text-sm mb-3'>Didn't receive the code?</p>{
                    timer > 0 ? <p className='text-gray-400 text-sm'>Resend code in {timer} seconds</p> : 
                    <button className='text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50' 
                        disabled={resendLoading}
                        onClick={handleResendOTP}>
                        {
                            resendLoading? "Sending..." : "Resend Code"
                        }
                    </button>
                }
            </div>
        </CardContent>
        
        </Card>
    </div>
  )
}

export default VerifyOtp;