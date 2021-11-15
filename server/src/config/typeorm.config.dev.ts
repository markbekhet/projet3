import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Kyro DB
//  export const typeormConfigDevDB: TypeOrmModuleOptions = {
//    type: 'postgres',
//    host: 'localhost',
//    port: 5432,
//    username: 'test_user',
//    password: 'GetThisHands98',
//    database: 'test_db',
//    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
//    synchronize: true,
//    uuidExtension: 'pgcrypto',
//  };

// Paul DB
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
