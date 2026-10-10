const { DataSource } = require('typeorm');
require('dotenv').config({ path: 'C:/BCA/REDDY E-COMMERCE/.env' });
require('dotenv').config({ path: 'C:/BCA/REDDY E-COMMERCE/apps/api/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: '52.14.39.200',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
    servername: 'ep-snowy-mud-b44fmsix-pooler.c-6.us-east-2.aws.neon.tech',
  },
  synchronize: false,
});

async function showAudit() {
  try {
    await AppDataSource.initialize();
    console.log('\n======================================================');
    console.log('       REDDY STORE - NEON DATABASE AUDIT REPORT       ');
    console.log('======================================================\n');

    // 1. All Users
    console.log('--- [1] REGISTERED USERS ---');
    const users = await AppDataSource.query(`
      SELECT id, name, email, role, "isEmailVerified", "createdAt" 
      FROM users 
      ORDER BY "createdAt" DESC;
    `);
    console.table(users);

    // 2. Login Audit History
    console.log('\n--- [2] USER LOGIN & SESSION AUDIT LOGS ---');
    try {
      const logins = await AppDataSource.query(`
        SELECT id, email, "loginMethod", status, "loginTime" 
        FROM user_logins 
        ORDER BY "loginTime" DESC 
        LIMIT 15;
      `);
      if (logins.length === 0) {
        console.log('No login events logged yet. Log in via frontend to generate entries.');
      } else {
        console.table(logins);
      }
    } catch (e) {
      console.log('user_logins table initializing on next server restart.');
    }

    // 3. Customer Orders
    console.log('\n--- [3] LIVE CUSTOMER ORDERS & FULFILLMENT ---');
    const orders = await AppDataSource.query(`
      SELECT id, "customerName", "customerEmail", "totalAmount", status, "paymentMethod", "createdAt" 
      FROM orders 
      ORDER BY "createdAt" DESC 
      LIMIT 10;
    `);
    console.table(orders);

    console.log('\n======================================================\n');
    await AppDataSource.destroy();
  } catch (err) {
    console.error('Audit Error:', err.message);
  }
}

showAudit();