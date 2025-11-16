// messaging/localAdapter.js
const Queue = require("bull"); // Redis Queue
const MessageBus = require("./messageBus");

class LocalAdapter extends MessageBus {
  constructor() {
    super();
    this.queues = {};
  }

  async publish(queueName, message) {
    if (!this.queues[queueName]) {
      this.queues[queueName] = new Queue(queueName, {
        redis: {
          maxRetriesPerRequest: 3, // Giảm từ 20 xuống 3
          enableReadyCheck: false,
          retryStrategy: (times) => {
            if (times > 3) return null; // Dừng retry sau 3 lần
            return Math.min(times * 100, 1000); // Max 1s giữa các retry
          }
        },
        defaultJobOptions: {
          attempts: 3, // Chỉ thử 3 lần
          backoff: {
            type: 'fixed',
            delay: 500 // 500ms giữa các lần thử
          },
          removeOnComplete: true,
          removeOnFail: false
        }
      });
    }
    await this.queues[queueName].add(message);
  }

  async consume(queueName, handler) {
    if (!this.queues[queueName]) {
      this.queues[queueName] = new Queue(queueName, {
        redis: {
          maxRetriesPerRequest: 3,
          enableReadyCheck: false
        }
      });
    }
    this.queues[queueName].process(async (job) => handler(job.data));
  }
}

module.exports = new LocalAdapter();
