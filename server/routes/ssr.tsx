import { renderToStaticMarkup } from 'react-dom/server'
import BaseLayout from '~/resources/layouts/base-layout'
import Home from '~/resources/views/home'

export default defineEventHandler((event) => {
  const appConfig = event.context.appConfig

  const html = renderToStaticMarkup(
    <BaseLayout title={appConfig.title} csrfToken="xxxxxxxxxxxxxxxxxxxxxxxxx">
      <Home title={appConfig.title} />
    </BaseLayout>
  )

  return `<!DOCTYPE html>${html}`
})
