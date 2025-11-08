// Setup file for Jest tests
import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config({ path: '.env.test' });

// Set test environment variable
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
