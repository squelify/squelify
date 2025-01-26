import { zodResolver } from '@hookform/resolvers/zod'
import consola from 'consola'
import * as Lucide from 'lucide-react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { Button, Card, CardContent, Checkbox, Input, toast } from '#/components/base-ui'
import { Form, FormControl, FormField, FormItem } from '#/components/base-ui'
import { FormLabel, FormMessage } from '#/components/base-ui'
import { Link } from '#/components/base-ui'
import { useAuth } from '#/context/hooks/use-auth'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

const FormSchema = z.object({
  identity: z.string({ message: 'Email address required' }).min(1),
  password: z.string({ message: 'Password required' }).min(1),
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

  const isDisabled = form.formState.isLoading || form.formState.isSubmitting

  const onSubmit: SubmitHandler<FormType> = async ({ identity, password }) => {
    consola.info('DEBUG:onSubmit', { identity, password })
    toast.promise(auth.login(identity, password), {
      loading: 'Signing in..',
      success: (response) => {
        if (!response?.data) throw new Error('Invalid response')
        setTimeout(() => navigate(redirectTo), 500)
        return `Sign in successful!`
      },
      error: (err) => {
        consola.error('[LOGIN]', err)
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
          <CardContent className="p-8">
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="w-full" type="button">
                <Lucide.Chrome className="mr-2 size-4" />
                <span>Google</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="underline underline-offset-4" size="sm">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
