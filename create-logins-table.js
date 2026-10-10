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
    console.log('Connected to Neon PostgreSQL!');

    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS "user_logins" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL,
        "loginMethod" varchar(100) DEFAULT 'Email/Password',
        "status" varchar(50) DEFAULT 'Success',
        "loginTime" TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    console.log('user_logins table created successfully in Neon database!');

    await AppDataSource.destroy();
  } catch (err) {
    console.error('Table creation error:', err.message);
  }
}

run();