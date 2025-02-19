import { zodResolver } from '@hookform/resolvers/zod'
import consola from 'consola'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'
import { LoginRequest, LoginRequestSchema } from '~/trpc/schema/auth.schema'
import { Button, Card, CardContent, Checkbox, Input, toast } from '#/components/base-ui'
import { Form, FormControl, FormField, FormItem } from '#/components/base-ui'
import { FormLabel, FormMessage } from '#/components/base-ui'
import { Link } from '#/components/base-ui'
import { useAuth } from '#/context/hooks/use-auth'
import PageWrapper from '#/layouts/page-wrapper'

export default function Page() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect_to') || '/dashboard'
  const auth = useAuth()

  const form = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { remember: false },
  })

  const isDisabled = form.formState.isLoading || form.formState.isSubmitting

  const onSubmit: SubmitHandler<LoginRequest> = async ({ email, password }) => {
    toast.promise(auth.login(email, password), {
      loading: 'Signing in..',
      success: (response) => {
        if (!response?.user) throw new Error('Invalid response')
        setTimeout(() => navigate(redirectTo), 500)
        return `Sign in successful!`
      },
      error: (err) => {
        form.setFocus('email')
        consola.withTag('login').error(err)
        return `Failed to sign in: ${err.message}`
      },
    })
  }

  return (
    <PageWrapper
      title="Sign In"
      className="flex min-h-screen w-full flex-col items-center justify-center"
    >
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="font-semibold text-2xl tracking-tight">Sign In</h1>
          <p className="text-muted-foreground text-sm">
            Enter your credentials to access your account
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  name="email"
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
                          <FormLabel>Remember me</FormLabel>
                        </div>
                        <Link
                          href="/forgot-password"
                          className="font-medium text-muted-foreground text-sm hover:text-primary"
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
                  disabled={isDisabled}
                  isLoading={isDisabled}
                >
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
