import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'

import connectDB from '../config/db.js';
import chatRoutes from '../route/chat.route.js';
import { app, server } from '../config/socket.js';
dotenv.config();


connectDB();

app.use(express.json());
app.use(cors());

app.use("/api/v1", chatRoutes);

server.listen(process.env.PORT , () => {
  console.log(`Chat Server is running on port ${process.env.PORT || 3002}`);
});