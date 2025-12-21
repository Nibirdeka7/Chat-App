import express from "express";
import { isAuth } from "../middlewares/auth.middleware.js";
import { createNewChat } from "../controller/route.controller.js";

const router = express.Router();


router.post("/chat/new", isAuth, createNewChat)
  

export default router;