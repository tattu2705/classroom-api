import { DataSource, DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: process.env.DB_TYPE as any,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: ['src/common/database/migration/*.ts'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
