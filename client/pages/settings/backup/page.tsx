import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import PageWrapper from '#/layouts/page-wrapper'

export default function Page() {
  const { pageTitle } = useSEOMeta('Backup Settings')

  return (
    <PageWrapper>
      <h1>{pageTitle}</h1>
    </PageWrapper>
  )
}
