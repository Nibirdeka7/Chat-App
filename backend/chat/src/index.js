import express from 'express';
import dotenv from 'dotenv';

import connectDB from '../config/db.js';
import chatRoutes from '../route/chat.route.js';
dotenv.config();

const app = express();
connectDB();

app.use(express.json());

app.use("/api/v1", chatRoutes);

app.listen(process.env.PORT , () => {
  console.log(`Chat Server is running on port ${process.env.PORT || 3002}`);
});