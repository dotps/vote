import {ConfigModule, ConfigService} from "@nestjs/config"
import {Config} from "./config"

export const jwtConfig = {
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>(Config.JwtSecret),
        signOptions: {expiresIn: configService.get<string>(Config.JwtExpires)},
    }),
    inject: [ConfigService],
}