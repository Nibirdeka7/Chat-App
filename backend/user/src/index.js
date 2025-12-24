import express from 'express';
import dotenv from 'dotenv';
import {createClient} from 'redis';
import cors from 'cors';

import connectDB from '../config/db.js';
import userRoutes from '../routes/user.route.js';
import { connectRabbitMQ } from '../config/rabbitmq.js';


dotenv.config();

const app = express();
connectDB();

connectRabbitMQ();
app.use(express.json());

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect().then(()=>console.log("Connected to redis")).catch(console.error);

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5000', // Update this to your new frontend port
  credentials: true
}));
app.use("/api/v1", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});