import { ConfigModule, ConfigService } from "@nestjs/config"
import { Config } from "../config/config"

export const jwtConfig = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    global: true,
    secret: configService.get<string>(Config.JWT_SECRET),
    signOptions: { expiresIn: configService.get<string>(Config.JWT_EXPIRES) },
  }),
  inject: [ConfigService],
}