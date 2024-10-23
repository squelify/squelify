import { useSEOMeta } from '#/context/hooks/use-seo-meta'

export default function Page() {
  const { pageTitle } = useSEOMeta('Create Account')

  return (
    <div>
      <div>
        <h1>{pageTitle}</h1>
      </div>
    </div>
  )
}
