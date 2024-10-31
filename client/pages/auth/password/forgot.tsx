import { Button } from '#/components/base-ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/base-ui/card'
import { Input } from '#/components/base-ui/input'
import { Label } from '#/components/base-ui/label'
import { Link } from '#/components/link'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

export default function Page() {
  const { pageTitle } = useSEOMeta('Forgot Password')

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{pageTitle}</CardTitle>
        <CardDescription>
          Enter your email below to reset your password. We will send you an email with a link to
          reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="someone@example.com" required />
          </div>
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </div>
        <div className="mt-6 text-center text-sm">
          Remember your password?{' '}
          <Link href="/auth/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
