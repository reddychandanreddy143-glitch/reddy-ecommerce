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
  logging: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to Neon PostgreSQL!');

    const orders = await AppDataSource.query(`SELECT id, "userId", status, "totalAmount", "customerEmail", "createdAt" FROM orders ORDER BY "createdAt" DESC LIMIT 10;`);
    console.log('--- RECENT ORDERS IN DATABASE ---');
    console.log(orders);

    const users = await AppDataSource.query(`SELECT id, email, name FROM users LIMIT 5;`);
    console.log('--- USERS IN DATABASE ---');
    console.log(users);

    await AppDataSource.destroy();
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

run();