import {NestFactory} from "@nestjs/core"
import {AppModule} from "./app.module"
import {ValidationPipe} from "@nestjs/common"
import {ConfigService} from "@nestjs/config"
import {Config} from "./config/config"
import {SimpleLogger} from "./errors/SimpleLogger"
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger"

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    app.useGlobalPipes(new ValidationPipe({transform: true, whitelist: true}))
    app.useLogger(new SimpleLogger(true))

    const configService = app.get(ConfigService)
    const port = configService.get<string>(Config.APP_PORT)

    const configSwagger = new DocumentBuilder()
        .setTitle("Survey API")
        .setDescription("Для работы на платформе необходимо зарегистрироваться `POST` `/users` и получить *Bearer Token* для авторизации.")
        .setVersion("1.0")
        .build()

    const document = SwaggerModule.createDocument(app, configSwagger)
    SwaggerModule.setup("docs", app, document)

    await app.listen(port)
}

bootstrap()

// TODO: в swagger неправильно отображается POST /surveys Request body >>>> answers почему-то не массив объектов
// TODO: подготовить postman коллекцию
