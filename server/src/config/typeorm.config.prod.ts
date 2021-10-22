// This configuration file is used in production to connect to the DataBase on the virtual machine.
// To not be used for development tests
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeormConfigProdDB: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'admin',
    password: '1234',
    database: 'production_db',
    entities: [
        __dirname + '/../**/*.entity{.ts,.js}',
    ],
    synchronize: true,
    uuidExtension: 'pgcrypto'
}