import {TypeOrmModule} from "@nestjs/typeorm"
import {ConfigService} from "@nestjs/config"
import {User} from "../users/user.entity"
import { Config } from '../config/config';

export const databaseProvider = TypeOrmModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>(Config.DATABASE_URL),
        entities: [User],
        synchronize: true,
    }),
    inject: [ConfigService],
})

// TODO: продолжить
// https://docs.nestjs.com/techniques/database