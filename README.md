# Event-Driven Order Analytics (NestJS + Kafka)

This project is a simple event-driven order processing system built with **Node.js 20**, **NestJS**, **Kafka**, **Redis**, and **MongoDB**. It includes:

- **API Service (Producer)**: POST `/orders` to publish orders to Kafka and cache recent orders in Redis.
- **Consumer Service**: reads Kafka messages and persists orders to MongoDB.
- **Analytics Service**: exposes daily aggregates from MongoDB and recent orders from Redis.

## Prerequisites

- Node.js 20
- Docker + Docker Compose

## Infrastructure (Kafka, MongoDB, Redis)

Start the infrastructure locally:

```bash
docker-compose up -d
```

Kafka will be available at `localhost:9092`, MongoDB at `localhost:27017`, and Redis at `localhost:6379`.

## Install Dependencies

```bash
npm install
```

## Run the Services

In separate terminals:

```bash
npm run start:api
npm run start:consumer
npm run start:analytics
```

Default ports:

- API Service: `http://localhost:3000`
- Analytics Service: `http://localhost:3001`

## Environment Variables

Each service can be configured via environment variables:

| Variable | Description | Default |
| --- | --- | --- |
| `KAFKA_BROKERS` | Kafka broker list | `localhost:9092` |
| `KAFKA_TOPIC` | Kafka topic for orders | `orders` |
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017/orders` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `API_PORT` | API service port | `3000` |
| `ANALYTICS_PORT` | Analytics service port | `3001` |

## Usage

### Submit an order

```bash
curl -X POST http://localhost:3000/orders \
  -H 'Content-Type: application/json' \
  -d '{"orderId":"o-1001","userId":"u-42","price":29.99,"items":["coffee","mug"]}'
```

Response:

```json
{"status":"queued"}
```

### Daily analytics

```bash
curl http://localhost:3001/analytics/daily
```

### Recent orders (Redis cache)

```bash
curl http://localhost:3001/analytics/recent-orders
```

## Project Structure

```
services/
  api/          # Producer: POST /orders
  consumer/     # Kafka consumer -> MongoDB
  analytics/    # Analytics APIs
```

## Notes

- The API service writes the last 10 orders to Redis under `orders:recent`.
- The consumer logs each saved order once written to MongoDB.
