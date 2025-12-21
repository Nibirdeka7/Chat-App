import express from 'express';
import dotenv from 'dotenv';
import { startSendOtpConsumer } from './consumer.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT;
app.use(express.json());

startSendOtpConsumer();

app.listen(PORT, () => {
  console.log(`Mail service is running on port ${PORT}`);
});