import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const setup = () => {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    return {
      select: () => ({
        from: () => [],
      }),
    };
  }

  // Connection pooling configuration for better performance
  const connectionConfig = {
    max: parseInt(process.env.DB_POOL_MAX || "10"),
    idle_timeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || "30000"),
    max_lifetime: 60 * 30, // 30 minutes
    prepare: false, // Better for dynamic queries
  };

  // Create connection with pooling
  const queryClient = postgres(process.env.DATABASE_URL, connectionConfig);
  const db = drizzle(queryClient);
  
  return db;
};

export default setup();
