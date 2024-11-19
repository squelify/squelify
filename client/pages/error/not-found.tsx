import * as Lucide from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '#/components/base-ui/button'
import { Link } from '#/components/link'

export default function NotFound() {
  const canGoBack = window?.history?.length > 2
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex size-full h-full min-h-screen items-center justify-center">
      <div className="flex h-full max-w-2xl flex-col items-center p-4 text-center">
        <div className="mb-10">
          <Lucide.Frown
            className="size-24 text-muted-foreground hover:text-primary"
            strokeWidth={2.4}
          />
        </div>
        <div>
          <h1 className="mb-6 font-bold text-2xl">404 Not found</h1>
          <h3 className="font-semibold text-foreground text-xl tracking-tight">
            Sorry, we can't find that page.
          </h3>
          <p className="mt-4 text-muted-foreground leading-7">
            Check that you typed the address correctly. Let's get you back on track.
            <br className="hidden md:inline-block" /> Our main page has everything you need to
            explore and manage your data.
          </p>
        </div>
        <div className="mt-8">
          {canGoBack ? (
            <Button variant="default" className="min-w-40" onClick={() => navigate(-1)}>
              <Lucide.ArrowLeft className="size-4" strokeWidth={1.8} />
              <span>Go Back</span>
            </Button>
          ) : (
            <Button variant="default" className="min-w-40" asChild>
              <Link href="/">
                <Lucide.ArrowLeft className="size-4" strokeWidth={1.8} />
                <span>Go to Main Page</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
