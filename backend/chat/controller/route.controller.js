import Chat from "../model/chat.model.js";

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