import { renderToStaticMarkup } from 'react-dom/server'
import BaseLayout from '~/resources/layouts/base-layout'
import InstallerPage from '~/resources/views/installer'

export default defineEventHandler((event) => {
  const appConfig = event.context.appConfig

  const html = renderToStaticMarkup(
    <BaseLayout title={appConfig.title} csrfToken="xxxxxxxxxxxxxxxxxxxxxxxxx">
      <InstallerPage />
    </BaseLayout>
  )

  return `<!DOCTYPE html>${html}`
})
