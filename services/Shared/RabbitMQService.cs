using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace Shared
{
    public interface IRabbitMQService
    {
        void PublishMessage<T>(string queueName, T message);
        void StartConsuming<T>(string queueName, Action<T> messageHandler);
        void Dispose();
    }

    public class RabbitMQService : IRabbitMQService, IDisposable
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private readonly string _host;
        private readonly string _username;
        private readonly string _password;

        public RabbitMQService(string host, string username, string password)
        {
            _host = host;
            _username = username;
            _password = password;

            var factory = new ConnectionFactory()
            {
                HostName = host,
                UserName = username,
                Password = password,
                Port = 5672,
                VirtualHost = "/"
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();
        }

        public void PublishMessage<T>(string queueName, T message)
        {
            // Ensure queue exists
            _channel.QueueDeclare(queue: queueName,
                                durable: true,
                                exclusive: false,
                                autoDelete: false,
                                arguments: null);

            var jsonString = JsonSerializer.Serialize(message);
            var body = Encoding.UTF8.GetBytes(jsonString);

            var properties = _channel.CreateBasicProperties();
            properties.Persistent = true;

            _channel.BasicPublish(exchange: "",
                                routingKey: queueName,
                                basicProperties: properties,
                                body: body);

            Console.WriteLine($" [x] Sent message to {queueName}: {jsonString}");
        }

        public void StartConsuming<T>(string queueName, Action<T> messageHandler)
        {
            // Ensure queue exists
            _channel.QueueDeclare(queue: queueName,
                                durable: true,
                                exclusive: false,
                                autoDelete: false,
                                arguments: null);

            var consumer = new RabbitMQ.Client.Events.EventingBasicConsumer(_channel);
            consumer.Received += (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var messageObject = JsonSerializer.Deserialize<T>(message);

                if (messageObject != null)
                {
                    try
                    {
                        messageHandler(messageObject);
                        _channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error processing message: {ex.Message}");
                        _channel.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: false);
                    }
                }
            };

            _channel.BasicConsume(queue: queueName,
                                autoAck: false,
                                consumer: consumer);

            Console.WriteLine($" [*] Started consuming from {queueName}");
        }

        public void Dispose()
        {
            _channel?.Close();
            _connection?.Close();
        }
    }
}