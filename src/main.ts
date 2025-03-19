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
        .setDescription("Описание API")
        .setVersion("1.0")
        // .addBearerAuth()
        .build()

    const document = SwaggerModule.createDocument(app, configSwagger)
    // document.components.responses = {
    //   Unauthorized: {
    //     description: "Unauthorized",
    //     content: {
    //       "application/json": {
    //         schema: {
    //           type: "object",
    //           properties: {
    //             statusCode: { type: "number", example: 401 },
    //             message: { type: "string", example: "Unauthorized" },
    //           },
    //         },
    //       },
    //     },
    //   },
    // }

    SwaggerModule.setup("api", app, document)

    await app.listen(port)
}

bootstrap()
