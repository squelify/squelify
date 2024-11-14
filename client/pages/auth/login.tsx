import { zodResolver } from '@hookform/resolvers/zod'
import * as Lucide from 'lucide-react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '#/components/base-ui/button'
import { Card, CardContent } from '#/components/base-ui/card'
import { Checkbox } from '#/components/base-ui/checkbox'
import { Form, FormControl, FormField, FormItem } from '#/components/base-ui/form'
import { FormLabel, FormMessage } from '#/components/base-ui/form'
import { Input } from '#/components/base-ui/input'
import { Link } from '#/components/link'
import { useAuth } from '#/context/hooks/use-auth'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import logger from '#/utils/logger'

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
    toast.promise(auth.login(identity, password, remember), {
      loading: 'Signing in..',
      success: (response) => {
        if (!response?.data) throw new Error('Invalid response')
        setTimeout(() => navigate(redirectTo), 500)
        return `Sign in successful!`
      },
      error: (err) => {
        logger.error('[LOGIN]', err)
        form.setFocus('identity')
        return `Failed to sign in: ${err.message}`
      },
    })
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="font-semibold text-2xl tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground text-sm">
            Enter your credentials to access your account
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  name="identity"
                  control={form.control}
                  render={({ field, formState }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="name@example.com"
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              disabled={formState.isLoading || formState.isSubmitting}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Remember me
                          </FormLabel>
                        </div>
                        <Link
                          href="/forgot-password"
                          className="text-muted-foreground text-sm hover:text-primary"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isLoading || form.formState.isSubmitting}
                >
                  Sign In
                </Button>
              </form>
            </Form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" type="button">
              <Lucide.Chrome className="mr-2 h-4 w-4" /> Google
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
