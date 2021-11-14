import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Kyro DB
 export const typeormConfigDevDB: TypeOrmModuleOptions = {
   type: 'postgres',
   host: 'localhost',
   port: 5432,
   username: 'postgres',
   password: '1234',
   database: 'postgres',
   entities: [__dirname + '/../**/*.entity{.ts,.js}'],
   synchronize: true,
   uuidExtension: 'pgcrypto',
  };

// Paul DB
//export const typeormConfigDevDB: TypeOrmModuleOptions = {
//  type: 'postgres',
//  host: 'localhost',
//  port: 5432,
//  username: 'admin',
//  password: 'password',
//  database: 'colorimage',
//  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
//  synchronize: true,
//  uuidExtension: 'pgcrypto',
//};
