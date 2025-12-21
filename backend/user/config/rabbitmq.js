import amqp from 'amqplib';

let channel;
export const connectRabbitMQ = async() => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: 5672,
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASSWORD,
        });
        channel = await connection.createChannel();
        console.log("Connected to rabbitmq");
    } catch (error) {
        console.log("Failed to connect to rabbitmq", error);
    }
}


export const publishToQueue = async(queueName, msg) => {
    if(!channel){
        console.log("Rabbitmq channel is not initialized");
        return;
    }

    await channel.assertQueue(queueName, { durable: true });

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)), { persistent: true });
}
