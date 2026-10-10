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

    console.log('Adding missing columns to orders table...');
    await AppDataSource.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deliveryAddress" text;`);
    await AppDataSource.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customerName" varchar(255);`);
    await AppDataSource.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customerEmail" varchar(255);`);
    await AppDataSource.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "paymentMethod" varchar(100) DEFAULT 'Cash on Delivery';`);
    await AppDataSource.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "productSummary" text;`);

    // Ensure status enum allows confirmed
    try {
      await AppDataSource.query(`ALTER TYPE "orders_status_enum" ADD VALUE IF NOT EXISTS 'confirmed';`);
    } catch (e) {
      // Ignore if enum value already exists or not an enum type
    }

    console.log('Columns created successfully!');

    const cols = await AppDataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders';
    `);
    console.log('Updated orders table columns:');
    cols.forEach(c => console.log(` - ${c.column_name}`));

    await AppDataSource.destroy();
  } catch (err) {
    console.error('Migration failed:', err.message);
  }
}

run();