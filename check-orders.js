const { DataSource } = require('typeorm');
require('dotenv').config({ path: 'C:/BCA/REDDY E-COMMERCE/apps/api/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/reddy_ecommerce',
  synchronize: false,
  logging: false,
});

async function checkOrders() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully.');

    // Check table columns
    const columns = await AppDataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders';
    `);
    console.log('Orders table columns:');
    columns.forEach(c => console.log(` - ${c.column_name} (${c.data_type})`));

    // Check existing records in orders table
    const records = await AppDataSource.query(`SELECT * FROM orders ORDER BY "createdAt" DESC LIMIT 5;`);
    console.log(`Total orders found: ${records.length}`);
    console.log(JSON.stringify(records, null, 2));

    await AppDataSource.destroy();
  } catch (err) {
    console.error('Database query error:', err.message);
  }
}

checkOrders();