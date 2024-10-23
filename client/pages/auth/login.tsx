import { zodResolver } from '@hookform/resolvers/zod'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '#/components/base-ui/button'
import { Card, CardHeader, CardTitle } from '#/components/base-ui/card'
import { CardContent, CardDescription } from '#/components/base-ui/card'
import { Checkbox } from '#/components/base-ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/base-ui/form'
import { Input } from '#/components/base-ui/input'
import { Link } from '#/components/link'
import { useAuth } from '#/context/hooks/use-auth'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

const FormSchema = z.object({
  identity: z.string().min(1, { message: 'Email address or username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
  remember: z.boolean().optional().default(false),
})

type FormType = z.infer<typeof FormSchema>

export default function Page() {
  const { pageTitle } = useSEOMeta('Sign In')

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect_to') || '/dashboard'

  const auth = useAuth()

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { remember: false },
  })

  const onSubmit: SubmitHandler<FormType> = async ({ identity, password, remember }) => {
    toast.promise(auth.login(identity, password), {
      loading: 'Signing in...',
      success: (ctx) => {
        console.info('[LOGIN]', remember, ctx)
        // if (ctx.error) {
        //   throw ctx.error // Trigger the error handler
        // }
        // if (ctx.data?.user && !ctx.data.user.emailVerified) {
        //   toast.warning('Your email not verified, check your inbox!')
        //   return
        // }
        setTimeout(() => navigate(redirectTo), 500)
        return `Sign in successful!`
      },
      error: (err) => {
        console.error('[LOGIN]', err)
        form.setFocus('identity')
        return `Failed to sign in: ${err.message}`
      },
      finally: () => {
        form.reset()
      },
    })
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{pageTitle}</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              name="identity"
              control={form.control}
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel hidden>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Email Address"
                      disabled={formState.isLoading || formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field, formState }) => (
                <FormItem>
                  <FormLabel hidden>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="*************"
                      disabled={formState.isLoading || formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="remember"
              control={form.control}
              render={({ field, formState }) => (
                <FormItem>
                  <div className="flex items-center">
                    <div className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          disabled={formState.isLoading || formState.isSubmitting}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="leading-none">
                        <FormLabel>Remember me</FormLabel>
                      </div>
                    </div>
                    <Link
                      href="/auth/forgot-password"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isLoading || form.formState.isSubmitting}
            >
              Login
            </Button>
          </form>
        </Form>

        <Button variant="outline" className="w-full">
          Login with Google
        </Button>

        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
