# XaISE Core V4 - API Documentation

## Overview
This document provides comprehensive documentation for the XaISE Core V4 API endpoints, including rewards tracking, statistics management, and cron job operations.

## Base URL
```
http://localhost:3001/api
```

## Authentication
All endpoints require user authentication. Include the user ID in the request headers or as a parameter where specified.

---

## Rewards API

### 1. Create Reward
**POST** `/rewards`

Creates a new reward entry for a user.

**Request Body:**
```json
{
  "userId": "string",
  "protocolId": "string", 
  "amount": "number",
  "type": "daily" | "compound",
  "calculatedAt": "string (ISO date)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "protocolId": "string",
    "amount": 100.50,
    "type": "daily",
    "status": "pending",
    "calculatedAt": "2024-01-15T10:00:00Z",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. Get User Rewards
**GET** `/rewards/user/:userId`

Retrieves all rewards for a specific user with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by reward status (`pending`, `claimed`, `expired`)
- `type` (optional): Filter by reward type (`daily`, `compound`)
- `protocolId` (optional): Filter by protocol ID
- `limit` (optional): Number of results to return (default: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "protocolId": "string",
      "amount": 100.50,
      "type": "daily",
      "status": "pending",
      "calculatedAt": "2024-01-15T10:00:00Z",
      "claimedAt": null,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### 3. Update Reward
**PUT** `/rewards/:id`

Updates an existing reward entry.

**Request Body:**
```json
{
  "amount": "number (optional)",
  "status": "pending" | "claimed" | "expired" (optional),
  "claimedAt": "string (ISO date, optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "protocolId": "string",
    "amount": 105.75,
    "type": "daily",
    "status": "claimed",
    "calculatedAt": "2024-01-15T10:00:00Z",
    "claimedAt": "2024-01-15T12:00:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

### 4. Claim Reward
**POST** `/rewards/:id/claim`

Claims a pending reward for a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "amount": 100.50,
    "status": "claimed",
    "claimedAt": "2024-01-15T12:00:00Z"
  }
}
```

### 5. Delete Reward
**DELETE** `/rewards/:id`

Deletes a reward entry (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Reward deleted successfully"
}
```

---

## Statistics API

### 1. Get User Statistics
**GET** `/statistics/user/:userId`

Retrieves user performance statistics with filtering options.

**Query Parameters:**
- `period` (optional): Time period (`daily`, `weekly`, `monthly`)
- `startDate` (optional): Start date for filtering (ISO format)
- `endDate` (optional): End date for filtering (ISO format)
- `limit` (optional): Number of results (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "period": "daily",
      "date": "2024-01-15",
      "totalStaked": 10000.00,
      "totalRewards": 150.75,
      "apy": 5.5,
      "protocolCount": 3,
      "riskScore": 0.65,
      "diversificationIndex": 0.8,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 2. Get Portfolio Snapshots
**GET** `/statistics/portfolio/:userId`

Retrieves historical portfolio snapshots for a user.

**Query Parameters:**
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)
- `limit` (optional): Number of results (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "date": "2024-01-15",
      "totalValue": 10150.75,
      "stakedAmount": 10000.00,
      "unclaimedRewards": 150.75,
      "apy": 5.5,
      "protocolDistribution": {
        "protocol1": 0.4,
        "protocol2": 0.35,
        "protocol3": 0.25
      },
      "riskLevel": "medium",
      "diversificationIndex": 0.8,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 3. Get Protocol Performance
**GET** `/statistics/protocols`

Retrieves performance statistics for all protocols.

**Query Parameters:**
- `protocolId` (optional): Filter by specific protocol
- `period` (optional): Time period (`daily`, `weekly`, `monthly`)
- `limit` (optional): Number of results (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "protocolId": "string",
      "protocolName": "Uniswap V3",
      "period": "daily",
      "date": "2024-01-15",
      "totalValueLocked": 1000000.00,
      "averageApy": 6.2,
      "userCount": 150,
      "totalRewardsDistributed": 5000.00,
      "riskScore": 0.3,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 4. Get Portfolio Dashboard
**GET** `/statistics/dashboard/:userId`

Retrieves comprehensive dashboard data for a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPortfolioValue": 10150.75,
    "totalStaked": 10000.00,
    "unclaimedRewards": 150.75,
    "totalRewardsClaimed": 500.25,
    "averageApy": 5.5,
    "protocolCount": 3,
    "riskLevel": "medium",
    "diversificationIndex": 0.8,
    "performance30Days": {
      "growth": 2.5,
      "bestDay": {
        "date": "2024-01-10",
        "growth": 0.8
      },
      "worstDay": {
        "date": "2024-01-05",
        "growth": -0.3
      }
    },
    "protocolDistribution": [
      {
        "protocolId": "protocol1",
        "name": "Uniswap V3",
        "percentage": 40,
        "value": 4000.00,
        "apy": 6.2
      }
    ]
  }
}
```

### 5. Create Portfolio Snapshot
**POST** `/statistics/portfolio/:userId`

Creates a new portfolio snapshot for a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "date": "2024-01-15",
    "totalValue": 10150.75,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

## Cron Jobs API

### 1. Trigger Reward Calculation
**POST** `/cron/trigger/rewards`

Manually triggers the reward calculation process.

**Response:**
```json
{
  "success": true,
  "message": "Reward calculation triggered successfully",
  "data": {
    "processedUsers": 150,
    "totalRewards": 5000.75,
    "executionTime": 2500
  }
}
```

### 2. Trigger Daily Statistics
**POST** `/cron/trigger/statistics/daily`

Manually triggers daily statistics calculation.

**Response:**
```json
{
  "success": true,
  "message": "Daily statistics calculation triggered successfully",
  "data": {
    "processedUsers": 150,
    "executionTime": 1800
  }
}
```

### 3. Trigger Weekly Statistics
**POST** `/cron/trigger/statistics/weekly`

Manually triggers weekly statistics calculation.

### 4. Trigger Monthly Statistics
**POST** `/cron/trigger/statistics/monthly`

Manually triggers monthly statistics calculation.

### 5. Get Cron Status
**GET** `/cron/status`

Retrieves the current status of all scheduled cron jobs.

**Response:**
```json
{
  "success": true,
  "data": {
    "rewardCalculation": {
      "schedule": "0 0 * * *",
      "description": "Daily reward calculation at midnight UTC",
      "isActive": true,
      "lastRun": "2024-01-15T00:00:00Z",
      "nextRun": "2024-01-16T00:00:00Z"
    },
    "dailyStatistics": {
      "schedule": "0 1 * * *",
      "description": "Daily statistics calculation at 1 AM UTC",
      "isActive": true,
      "lastRun": "2024-01-15T01:00:00Z",
      "nextRun": "2024-01-16T01:00:00Z"
    },
    "weeklyStatistics": {
      "schedule": "0 2 * * 0",
      "description": "Weekly statistics calculation on Sunday at 2 AM UTC",
      "isActive": true,
      "lastRun": "2024-01-14T02:00:00Z",
      "nextRun": "2024-01-21T02:00:00Z"
    },
    "monthlyStatistics": {
      "schedule": "0 3 1 * *",
      "description": "Monthly statistics calculation on 1st at 3 AM UTC",
      "isActive": true,
      "lastRun": "2024-01-01T03:00:00Z",
      "nextRun": "2024-02-01T03:00:00Z"
    }
  }
}
```

### 6. Cron Health Check
**GET** `/cron/health`

Performs a health check on all cron job systems.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "checks": {
      "database": true,
      "rewardCalculation": true,
      "statisticsCalculation": true,
      "portfolioSnapshots": true
    },
    "lastHealthCheck": "2024-01-15T10:00:00Z"
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Common Error Codes:
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `INTERNAL_ERROR`: Server error
- `DATABASE_ERROR`: Database operation failed
- `CALCULATION_ERROR`: Reward/statistics calculation failed

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Standard endpoints**: 100 requests per minute per IP
- **Cron trigger endpoints**: 10 requests per minute per IP
- **Statistics endpoints**: 50 requests per minute per IP

---

## Data Types

### Reward Status
- `pending`: Reward calculated but not claimed
- `claimed`: Reward has been claimed by user
- `expired`: Reward has expired and can no longer be claimed

### Reward Type
- `daily`: Daily staking rewards
- `compound`: Compound interest rewards

### Statistics Period
- `daily`: Daily aggregated statistics
- `weekly`: Weekly aggregated statistics  
- `monthly`: Monthly aggregated statistics

### Risk Level
- `low`: Risk score 0.0 - 0.33
- `medium`: Risk score 0.34 - 0.66
- `high`: Risk score 0.67 - 1.0

---

## Usage Examples

### JavaScript/TypeScript Example

```typescript
// Get user rewards
const getUserRewards = async (userId: string) => {
  const response = await fetch(`/api/rewards/user/${userId}?status=pending&limit=10`);
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.error.message);
  }
};

// Claim a reward
const claimReward = async (rewardId: string) => {
  const response = await fetch(`/api/rewards/${rewardId}/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
};

// Get portfolio dashboard
const getPortfolioDashboard = async (userId: string) => {
  const response = await fetch(`/api/statistics/dashboard/${userId}`);
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.error.message);
  }
};
```

### cURL Examples

```bash
# Get user rewards
curl -X GET "http://localhost:3001/api/rewards/user/user123?status=pending" \
  -H "Content-Type: application/json"

# Claim a reward
curl -X POST "http://localhost:3001/api/rewards/reward123/claim" \
  -H "Content-Type: application/json"

# Trigger reward calculation
curl -X POST "http://localhost:3001/api/cron/trigger/rewards" \
  -H "Content-Type: application/json"

# Get cron status
curl -X GET "http://localhost:3001/api/cron/status" \
  -H "Content-Type: application/json"
```

---

## Testing

The API includes comprehensive test suites:

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:rewards
npm run test:statistics
npm run test:cron
npm run test:integration

# Run health check
npm run test:health

# Run performance benchmark
npm run test:performance
```

---

## Support

For API support and questions:
- Check the error response codes and messages
- Review the test files for usage examples
- Ensure proper authentication and request formatting
- Verify database connectivity and permissions

---

*Last updated: January 15, 2024*