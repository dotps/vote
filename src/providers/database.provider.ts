import {TypeOrmModule} from "@nestjs/typeorm"
import {ConfigService} from "@nestjs/config"
import {User} from "../users/user.entity"

export const databaseProvider = TypeOrmModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get<string>("DATABASE_URL"),
        entities: [User],
        synchronize: true,
    }),
    inject: [ConfigService],
})

// TODO: продолжить
// https://docs.nestjs.com/techniques/database