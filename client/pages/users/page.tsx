import * as Lucide from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useApiClient } from '#/context/hooks/use-api-client'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

export default function Component() {
  const { pageTitle } = useSEOMeta('Users')

  const apiClient = useRef(useApiClient()).current

  useEffect(() => {
    apiClient.user.getAll().then((res) => {
      console.info('DEBUG', res.data.users)
    })
  }, [apiClient])

  return (
    <div className="mx-auto flex size-full items-center justify-center">
      <div className="flex max-w-xl flex-col items-center p-4 text-center">
        <div className="mb-8">
          <Lucide.Construction className="size-24 text-muted-foreground hover:text-primary" />
        </div>
        <h1 className="mb-4 font-bold text-xl">{pageTitle} Coming Soon!</h1>
        <div className="space-y-4 text-muted-foreground">
          <p className="leading-7">
            This feature is part of our upcoming release.
            <br className="hidden md:inline-block" /> Our team is working hard to deliver a robust
            and user-friendly solution.
          </p>
        </div>
      </div>
    </div>
  )
}

Component.displayName = 'UsersPage'
