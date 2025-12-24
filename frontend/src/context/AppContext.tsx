"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { Toaster } from "react-hot-toast";

export const user_service = "http://localhost:3000";
export const chat_service = "http://localhost:3002";


export interface User{
    _id: string;
    name: string;
    email: string;
}

export interface Chat{
    _id: string;
    users: string[];
    latestMessage: {
        text: string;
        sender: string;
    };
    createdAt: string;
    updatedAt: string;
    unseenCount?: number;
}

export interface Chats{
    _id: string;
    user: User;
    chat: Chat;
}

interface AppContextType{
    user: User | null;
    loading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    async function fetchUser(){
        try {
            const token = Cookies.get("token");
            const {data} = await axios.get(`${user_service}/api/v1/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            
            setUser(data);
            setIsAuth(true);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    return <AppContext.Provider value={{user, setUser, isAuth, setIsAuth, loading}}>
        {children}
        <Toaster/>
        </AppContext.Provider>
}


export const useAppData = (): AppContextType => {
    const context = useContext(AppContext)
    if(!context){
        throw new Error("user app data must be within app provider");
    }
    return context;
}