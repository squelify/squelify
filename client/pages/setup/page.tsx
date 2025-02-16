import * as Lucide from 'lucide-react'
import { Suspense } from 'react'
import { Navigate, useSearchParams } from 'react-router'
import { Button, Card, Input, Label, Link } from '#/components/base-ui'
import AppLoader from '#/components/loaders/page-loader'

export default function Page() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const errorMessage = null

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <title>Install Squelify</title>
      <Suspense fallback={<AppLoader />}>
        <main className="min-h-screen bg-gray-100 text-foreground dark:bg-gray-950">
          <div className="mx-auto max-w-xl px-4 py-14 sm:py-20">
            <div className="mb-8 text-center">
              <img src="/favicon.svg" className="mx-auto mb-4 size-20" alt="Squelify" />
              <h1 className="font-bold text-2xl text-foreground">Welcome to Squelify</h1>
              <p className="mt-2 text-muted-foreground">Let's set up your administrator account</p>
              {errorMessage && (
                <div className="-mb-4 mt-6">
                  <div className="rounded-[0.3rem] bg-error p-4 text-error-foreground">
                    <div className="flex">
                      <div className="shrink-0">
                        <Lucide.BadgeInfo className="size-5 text-error" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-error-foreground text-sm">{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Card className="p-8">
              <form className="space-y-4">
                <div className="space-y-4">
                  <h2 className="font-semibold text-foreground text-lg">Create Admin Account</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        type="text"
                        name="firstName"
                        required
                        minLength={2}
                        maxLength={50}
                        pattern="[A-Za-z\s]+"
                        placeholder="Admin"
                        title="First name should only contain letters and spaces"
                      />
                      <span className="mt-1 text-error text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        type="text"
                        name="lastName"
                        required
                        minLength={2}
                        maxLength={50}
                        pattern="[A-Za-z\s]+"
                        placeholder="Sistem"
                        title="Last name should only contain letters and spaces"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      name="email"
                      required
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      placeholder="admin@example.com"
                      title="Please enter a valid email address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        type="password"
                        name="password"
                        id="password"
                        required
                        minLength={8}
                        placeholder="Enter your secure password"
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$"
                        title="Password must contain at least 8 characters, including uppercase, lowercase, number and special character"
                      />
                    </div>
                    <p className="mt-2.5 px-0.5 text-muted-foreground text-xs">
                      Min 8 characters with 1 uppercase, 1 lowercase, 1 number &amp; 1 character
                      (!@#$%^&amp;*)
                    </p>
                  </div>
                </div>

                <div className="border-border border-t pt-0" />

                <div className="flex items-start p-0">
                  <div className="mt-1 flex h-5 items-center">
                    <Input
                      id="newsletter"
                      name="newsletter"
                      type="checkbox"
                      className="size-4 rounded-[0.3rem] border-border text-primary focus:border-ring focus:ring-ring"
                    />
                  </div>
                  <div className="ml-2">
                    <Label
                      htmlFor="newsletter"
                      className="text-muted-foreground text-sm tracking-tight"
                    >
                      Keep me updated about new features &amp; upcoming improvements. By doing this
                      you accept the{' '}
                      <Link href="https://squelify.com/terms" size="sm" newTab>
                        Terms
                      </Link>
                      {' and the '}
                      <Link href="https://squelify.com/privacy" size="sm" newTab>
                        Privacy Policy
                      </Link>
                      .
                    </Label>
                  </div>
                </div>

                <div className="pt-1.5">
                  <Button type="submit" variant="default" className="w-full" disabled={false}>
                    Complete Installation
                  </Button>
                </div>
              </form>
            </Card>

            <div className="mt-6 text-center text-muted-foreground text-sm">
              Need help? Check out our{' '}
              <Link href="https://squelify.com/docs" size="sm" newTab>
                documentation
              </Link>
            </div>
          </div>
        </main>
      </Suspense>
    </>
  )
}
