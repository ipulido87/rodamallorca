// Setup file for Jest tests
import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config({ path: '.env.test' });

// Set test environment variables (valores mínimos requeridos para tests)
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-secret-key-with-minimum-32-characters-for-security';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.STRIPE_PRICE_ID = 'price_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.RESEND_API_KEY = 're_test_mock_key';
process.env.EMAIL_FROM = 'Test <test@example.com>';
