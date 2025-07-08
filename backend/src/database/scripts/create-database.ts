import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';

// Load environment variables from .env file
const envPath = join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('Loaded environment variables from .env file');
} else {
  console.warn('No .env file found, using default environment variables');
  dotenv.config();
}

async function createDatabase() {
  // Get database configuration from environment variables
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
  const dbUsername = process.env.DB_USERNAME || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'nestjs_db';

  console.log(`Attempting to create database ${dbName} if it doesn't exist...`);

  // Create connection to MySQL server without specifying the database
  let connection: mysql.Connection | null = null;

  try {
    // Connect to MySQL server
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUsername,
      password: dbPassword,
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database ${dbName} created or already exists`);

    // Verify database exists by trying to use it
    await connection.query(`USE \`${dbName}\``);
    console.log(`Successfully connected to database ${dbName}`);

    console.log('Database setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error creating database:', error);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
}

// Only run the script directly if it's not being imported
if (require.main === module) {
  createDatabase()
    .then((success) => {
      if (success) {
        console.log('Database initialization successful');
        process.exit(0);
      } else {
        console.error('Database initialization failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Unhandled error during database initialization:', error);
      process.exit(1);
    });
}

export default createDatabase;

