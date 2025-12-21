import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const isAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized access, Please login" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded || !decoded.user){
            return res.status(401).json({ message: "Invalid token " });
        }
        req.user = decoded.user;
        next();

    } catch (error) {
        res.status(401).json({ message: "Unauthorized access, Please login from catch",error });
    }
    
}