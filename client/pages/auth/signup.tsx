import { zodResolver } from '@hookform/resolvers/zod'
import * as Lucide from 'lucide-react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { Button, Card, CardContent, toast } from '#/components/base-ui'
import { Form, FormControl, FormItem, FormMessage } from '#/components/base-ui'
import { FormField, FormLabel, Input } from '#/components/base-ui'
import { Link } from '#/components/link'
import { useApiClient } from '#/context/hooks/use-api-client'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

const FormSchema = z.object({
  email: z.string().min(1, { message: 'Email address is required' }).email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letters')
    .regex(/[a-z]/, 'Password must contain lowercase letters')
    .regex(/[0-9]/, 'Password must contain numbers')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special characters'),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
})

type FormType = z.infer<typeof FormSchema>

export default function Page() {
  const { pageTitle } = useSEOMeta('Create Account')
  const apiClient = useApiClient()

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect_to') || '/dashboard'

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
  })

  // TODO: fix signup implementation
  const onSubmit: SubmitHandler<FormType> = async (data) => {
    toast.promise(
      apiClient.auth.signup({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      }),
      {
        loading: 'Creating account..',
        success: (response) => {
          if (!response?.data?.accessToken) throw new Error('Invalid response')
          setTimeout(() => navigate(redirectTo), 500)
          return `Account created successfully!`
        },
        error: (err) => {
          logger.error('[SIGNUP]', err)
          form.setFocus('email')
          return `Failed to create account: ${err.message}`
        },
      }
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="font-semibold text-2xl tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground text-sm">Create a new account to get started</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    name="firstName"
                    control={form.control}
                    render={({ field, formState }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
                            disabled={formState.isLoading || formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="lastName"
                    control={form.control}
                    render={({ field, formState }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            disabled={formState.isLoading || formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  name="email"
                  control={form.control}
                  render={({ field, formState }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
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
                          placeholder="Create a password"
                          disabled={formState.isLoading || formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isLoading || form.formState.isSubmitting}
                >
                  Create Account
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
          Already have an account?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
