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
    const users = await AppDataSource.query(`SELECT id, name, email, role FROM users;`);
    console.log('--- ALL USERS IN DB ---');
    console.log(users);
    await AppDataSource.destroy();
  } catch (e) {
    console.error('Error:', e.message);
  }
}
run();