import { zodResolver } from '@hookform/resolvers/zod'
import consola from 'consola'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { Button, Card, CardContent, Input, toast } from '#/components/base-ui'
import { Form, FormControl, FormField, FormItem } from '#/components/base-ui'
import { FormLabel, FormMessage } from '#/components/base-ui'
import { Link } from '#/components/base-ui'
import { useApiClient } from '#/context/hooks/use-api-client'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

const FormSchema = z.object({
  email: z.string().min(1, { message: 'Email address is required' }).email('Invalid email address'),
})

type FormType = z.infer<typeof FormSchema>

export default function Page() {
  const { pageTitle } = useSEOMeta('Forgot Password')
  const apiClient = useApiClient()
  const navigate = useNavigate()

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
  })

  const onSubmit: SubmitHandler<FormType> = async (data) => {
    toast.promise(apiClient.auth.forgotPassword(data.email), {
      loading: 'Sending reset instructions..',
      success: () => {
        setTimeout(() => navigate('/login'), 1000)
        return 'Reset instructions sent to your email'
      },
      error: (err) => {
        consola.error('[FORGOT_PASSWORD]', err)
        form.setFocus('email')
        return `Failed to send reset instructions: ${err.message}`
      },
    })
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="font-semibold text-2xl tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email below to receive password reset instructions
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isLoading || form.formState.isSubmitting}
                >
                  Send Instructions
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-sm">
          Remember your password?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
