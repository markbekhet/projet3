// This configuration file is used in production to connect to the DataBase on the virtual machine.
// To not be used for development tests
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeormConfigProdDB: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'projet3-101.eastus.cloudapp.azure.com',
    port: 5000,
    username: 'postgres',
    password: '1234',
    database: 'postgres',
    entities: [
        __dirname + '/../**/*.entity{.ts,.js}',
    ],
    synchronize: true,
    uuidExtension: 'pgcrypto'
}