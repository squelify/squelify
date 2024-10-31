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
  const { pageTitle } = useSEOMeta('Reset Password')

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{pageTitle}</CardTitle>
        <CardDescription>
          Enter your new password below. Make sure it&apos;s at least 8 characters long and includes
          at least one number and one uppercase letter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" placeholder="*************" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" placeholder="*************" required />
          </div>
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </div>
        <div className="mt-6 text-center text-sm">
          Remember your password?{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
