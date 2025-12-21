import {publishToQueue} from '../config/rabbitmq.js';
import { redisClient } from '../src/index.js';

import User from '../model/user.model.js';
import { generateToken } from '../config/generateToken.js';

export const loginUser = async (req, res) => {
    try {
        const {email} = req.body;
        const rateLimitKey = `otp:ratelimit:${email}`;
        const ratelimit = await redisClient.get(rateLimitKey);

        if(ratelimit){
            return res.status(429).json({message: 'Too many requests. Please try again later.'});
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpKey = `otp:${email}`;
        await redisClient.setEx(otpKey, 300, otp); // OTP valid for 5 minutes
        await redisClient.setEx(rateLimitKey, 60, '1'); // Rate limit for 1 minute

        const message = {
            to: email,
            subject: 'Your OTP Code',
            body: `Your OTP code is ${otp}. It is valid for 5 minutes.`
        }

        await publishToQueue('sendOtp', message);
        res.status(200).json({message: 'OTP sent successfully'});

    } catch (error) {
        console.log("Error in loginUser:", error);
    }
}

export const verifyUser = async (req, res) =>{
    try {
        const {email, otp} = req.body;
        if(!email || !otp){
            return res.status(400).json({message: 'Email and OTP are required'});
        }
        const otpKey = `otp:${email}`;
        const storedOtp = await redisClient.get(otpKey);
        if(!storedOtp || storedOtp !== otp){
            return res.status(400).json({message: 'Invalid or expired OTP'});
        }
        await redisClient.del(otpKey); 
        let user = await User.findOne({email});
        if(!user){
            const name = email.slice(0,8);
            user = await User.create({name, email});
        }
        const token = generateToken(user);

        res.json({
            message: 'User verified successfully',
            user,
            token
        })
    } catch (error) {
        console.log("Error in verifyUser:", error);
    }
}

export const myProfile = async(req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            message: 'User profile fetched successfully',
            user
        });
    } catch (error) {
        return res.status(500).json({message: 'Server error'});
    }
}


export const updateName = async(req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        user.name = req.body.name;
        await user.save();
        const token = generateToken(user);
        res.status(200).json({
            message: 'User name updated successfully',
            user,
            token
        });
    } catch (error) {
        return res.status(500).json({message: 'Server error'});
    }
}

export const getAllUsers = async(req, res)=>{
    try {
        const users = await User.find();
        res.status(200).json({
            message: 'Users fetched successfully',
            users
        });
    } catch (error) {
        return res.status(500).json({message: 'Server error'});
    }
}

export const getAUser = async(req, res)=>{
    try {
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json({
            message: 'User fetched successfully',
            user
        })
    } catch (error) {
        return res.status(500).json({message: 'Server error'});
    }
}