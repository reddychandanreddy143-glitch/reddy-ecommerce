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

async function run() {
  try {
    await AppDataSource.initialize();
    const orders = await AppDataSource.query(`SELECT id, "userId", "customerEmail", "productSummary", "totalAmount", status FROM orders ORDER BY "createdAt" DESC;`);
    console.log(`Total orders in DB: ${orders.length}`);
    console.log(orders);
    await AppDataSource.destroy();
  } catch (e) {
    console.error('Error:', e.message);
  }
}
run();