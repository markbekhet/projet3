import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeormConfigDevDB: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'admin',
  password: 'password',
  database: 'colorimage',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  uuidExtension: 'pgcrypto',
};
