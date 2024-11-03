import { AppConfig } from '~/app.config'

export default defineEventHandler((event) => {
  const appConfig = useAppConfig(event) as AppConfig

  logger.debug('[FUKKKKKK]', appConfig)

  event.context.appConfig = appConfig
})

declare module 'h3' {
  interface H3EventContext {
    appConfig?: AppConfig
  }
}
