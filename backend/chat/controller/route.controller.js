import Chat from "../model/chat.model.js";
import Message from "../model/message.model.js";
import axios from "axios";

export const createNewChat = async (req, res)=>{
    try {
        const userId = req.user._id;
        const {otheUserId} = req.body;
        if(!otheUserId){
            return res.status(400).json({message: 'Other user id is required'});
        }
        const existingChat = await Chat.findOne({
            users: { $all: [userId, otheUserId] , $size: 2 },
        })

        if(existingChat){
            return res.status(200).json({
                message: 'Chat already exists',
                chatId: existingChat._id
            });
        }

        const newChat = await Chat.create({
            users: [userId, otheUserId]
        })

        res.status(201).json({
            message: 'New chat created successfully',
            chatId: newChat._id
        });
    } catch (error) {
        return res.status(500).json({message: 'Server error', error});
    }
}

export const getAllChats = async (req, res)=>{
    try {
        const userId = req.user._id;
        if(!userId){
            return res.status(400).json({message: 'User id is required'});
        }
        const chats = await Chat.find({users: userId}).sort({ updatedAt: -1 });

        const chatWithUserData = await Promise.all(
            chats.map(async(chat)=>{
                const otherUserId = chat.users.find((id)=>id !== userId);

                const unseenCount = await Message.countDocuments({
                    chatId: chat._id,
                    sender: { $ne: userId },
                    seen: false
                })
                try {
                    const {data} = await axios.get(`
                        ${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
                    );

                    return {
                        user: data,
                        chat: {
                            ...chat.toObject(),
                            latestMessage: chat.latestMessage || null,
                            unseenCount: unseenCount 
                        }
                    }
                } catch (error) {
                    console.log(error);
                    return {
                        user: {_id: otherUserId, name: "Unknown User"},
                        chat: {
                            ...chat.toObject(),
                            latestMessage: chat.latestMessage || null,
                            unseenCount: unseenCount 
                        }
                    }
                }
            })
        )

        res.status(200).json({
            message: 'Chats fetched successfully',
            chats: chatWithUserData
        })
    } catch (error) {
        return res.status(500).json({message: 'Server error', error});
    }
}

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const {chatId, text} = req.body;
        const imageFile = req.file;
        if(!senderId){
            return res.status(401).json({message: 'Unauthorized'});
        }
        if(!chatId  ){
            return res.status(400).json({message: 'Chat id is required'});
        }
        if(!text && !imageFile){
            return res.status(400).json({message: 'Either Message text or image is required'});
        }
        const chat = await Chat.findById(chatId);
        if(!chat){
            return res.status(404).json({message: 'Chat not found'});
        }
        const isUserinChat = chat.users.some((id)=>id.toString() === senderId.toString())
        if(!isUserinChat){
            return res.status(403).json({message: 'You are not a member of this chat'});
        }

        const otherUserId = chat.users.find((id)=>id.toString() !== senderId.toString());
        if(!otherUserId){
            return res.status(401).json({message: 'No other user in this chat'});
        }

        // TODO: SOCKET SETUP

        let messageData = {
            chatId: chatId,
            sender: senderId,
            seen: false,
            seenAt: undefined,
        }

        if(imageFile){
            messageData.image = {
                url: imageFile.path,
                publicId: imageFile.filename,
            };
            messageData.messageType = 'image';
            messageData.text = text || '';
        } else {
            messageData.text = text;
            messageData.messageType = 'text';
        }

        const message = new Message(messageData);
        const savedMessage = await message.save();

        const latestMessageText = imageFile ? "📷 Image" : text

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: {
                text: latestMessageText,
                sender: senderId,
             
            },
            updatedAt: Date.now(),
        }, {new: true});

        // emit to skocket here

        res.status(201).json({
            message: savedMessage,
            sender: senderId,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Server error', error});
    }
}

export const getMessagesByChat = async(req, res)=>{
    try {
        const userId = req.user._id;
        const {chatId} = req.params;
        if(!userId){
            return res.status(401).json({message: 'Unauthorized'});
        }
        if(!chatId){
            return res.status(400).json({message: 'Chat id is required'});
        }

        const chat = await Chat.findById(chatId);
        if(!chat){
            return res.status(404).json({message: 'Chat not found'});
        }
        const isUserinChat = chat.users.some((id)=>id.toString() === userId.toString())
        if(!isUserinChat){
            return res.status(403).json({message: 'You are not a member of this chat'});
        }

        const messagesToMarkSeen = await Message.find({
            chatId: chatId,
            sender: { $ne: userId },
            seen: false,
        });

        await Message.updateMany({
            chatId: chatId,
            sender: { $ne: userId },
            seen: false,
        }, {
            seen: true,
            seenAt: new Date(),
        })

        const messages = await Message.find({chatId: chatId}).sort({createdAt: 1});
        const otherUserId = chat.users.find((id)=>id.toString() !== userId.toString());

        try {
            const {data} = await axios.get(`
                ${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
            );

            if(!otherUserId){
                return res.status(400).json({message: 'No other user in this chat'});
            }

            // TODO: SOCKET SETUP TO NOTIFY SENDER ABOUT SEEN MESSAGES

            res.status(200).json({
                messages,
                user: data,
            });
        } catch (error) {
                console.log(error);
                res.json({
                    messages,
                    user: {_id: otherUserId, name: "Unknown User"}
                }) 
                return; 
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Server error', error});
    }
}