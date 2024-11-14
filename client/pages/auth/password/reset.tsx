import { zodResolver } from '@hookform/resolvers/zod'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '#/components/base-ui/button'
import { Card, CardContent } from '#/components/base-ui/card'
import { Form, FormControl, FormField, FormItem } from '#/components/base-ui/form'
import { FormLabel, FormMessage } from '#/components/base-ui/form'
import { Input } from '#/components/base-ui/input'
import { Link } from '#/components/link'
import { useApiClient } from '#/context/hooks/use-api-client'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import logger from '#/utils/logger'

const FormSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain uppercase letters')
      .regex(/[a-z]/, 'Password must contain lowercase letters')
      .regex(/[0-9]/, 'Password must contain numbers')
      .regex(/[^A-Za-z0-9]/, 'Password must contain special characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type FormType = z.infer<typeof FormSchema>

export default function Page() {
  const { pageTitle } = useSEOMeta('Reset Password')
  const apiClient = useApiClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
  })

  const onSubmit: SubmitHandler<FormType> = async (data) => {
    if (!token) {
      toast.error('Invalid reset token')
      return
    }

    toast.promise(apiClient.auth.resetPassword(token, data.password), {
      loading: 'Resetting password..',
      success: () => {
        setTimeout(() => navigate('/login'), 1000)
        return 'Password reset successful!'
      },
      error: (err) => {
        logger.error('[RESET_PASSWORD]', err)
        form.setFocus('password')
        return `Failed to reset password: ${err.message}`
      },
    })
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="font-semibold text-2xl tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground text-sm">
            Enter your new password below. <br />
            Make sure it's secure and easy to remember.
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField
                  name="password"
                  control={form.control}
                  render={({ field, formState }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          disabled={formState.isLoading || formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="confirmPassword"
                  control={form.control}
                  render={({ field, formState }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
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
                  Reset Password
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
