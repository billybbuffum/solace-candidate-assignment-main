import { NextRequest } from "next/server";
import db from "../../../db";
import { advocates } from "../../../db/schema";
import { searchCache } from "../../../lib/cache";

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    cache: {
      status: 'up' | 'down';
      size: number;
    };
    api: {
      status: 'up';
      uptime: number;
    };
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: {
        status: 'down',
      },
      cache: {
        status: 'up',
        size: searchCache.size(),
      },
      api: {
        status: 'up',
        uptime: process.uptime(),
      },
    },
  };

  // Test database connection
  try {
    const dbStartTime = Date.now();
    await db.select().from(advocates).limit(1);
    const responseTime = Date.now() - dbStartTime;
    
    healthStatus.services.database = {
      status: 'up',
      responseTime,
    };
  } catch (error) {
    healthStatus.services.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
    healthStatus.status = 'degraded';
  }

  // Determine overall status
  const hasUnhealthyServices = Object.values(healthStatus.services).some(
    service => service.status === 'down'
  );

  if (hasUnhealthyServices) {
    // If database is down but we have cache, it's degraded
    if (healthStatus.services.database.status === 'down' && healthStatus.services.cache.status === 'up') {
      healthStatus.status = 'degraded';
    } else {
      healthStatus.status = 'unhealthy';
    }
  }

  const httpStatus = healthStatus.status === 'healthy' ? 200 : 
                    healthStatus.status === 'degraded' ? 200 : 503;

  return Response.json(healthStatus, { 
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Response-Time': `${Date.now() - startTime}ms`
    }
  });
}

// Also support HEAD requests for basic health checks
export async function HEAD(request: NextRequest) {
  try {
    await db.select().from(advocates).limit(1);
    return new Response(null, { status: 200 });
  } catch {
    return new Response(null, { status: 503 });
  }
}