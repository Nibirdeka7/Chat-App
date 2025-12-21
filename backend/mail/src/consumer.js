import amqp from 'amqplib';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

export const startSendOtpConsumer = async()=>{
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASSWORD,
        });
        const channel = await connection.createChannel();

        const queueName = "sendOtp";
        await channel.assertQueue(queueName, { durable: true });

        console.log("Mail service consumer started..")
        channel.consume(queueName, async(msg) => {
            if(msg){
                try {
                    const {to, subject, body} = JSON.parse(msg.content.toString());

                    const transporter = nodemailer.createTransport({
                        host:"smtp.gmail.com",
                        port: 465,
                        auth:{
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASSWORD,
                        }
                    });
                    await transporter.sendMail({
                        from: "Chat App",
                        to,
                        subject,
                        text: body,
                    });
                    console.log(`OTP mail sent to ${to}`);
                    channel.ack(msg);
                } catch (error) {
                    console.log("Failed to send OTP mail", error);
                }
            }
        });
    } catch (error) {
        console.log("Failed to start rabbitmq consumer", error);
    }
}