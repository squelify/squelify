import { useState } from 'react'
import { Button, FormLabel, Input } from '#/components/base-ui'
import { Link } from '#/components/link'

const styles = {
  title: 'text-2xl font-bold text-slate-800 mb-2 text-center',
  subtitle: 'text-slate-600 text-center mb-6',
  form: 'space-y-4',
  inputGroup: 'space-y-1.5',
  footer: 'mt-6 text-center text-sm text-slate-600',
  link: 'text-blue-600 hover:text-blue-700 transition-colors',
} as const

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement password reset logic here
    setIsSent(true)
  }

  if (isSent) {
    return (
      <div>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.subtitle}>We have sent a password reset link to {email}</p>
        <div className={styles.footer}>
          <Link href="/login" className={styles.link}>
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className={styles.title}>Reset password</h1>
      <p className={styles.subtitle}>
        Enter your email address and we'll send you a link to reset your password
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <FormLabel htmlFor="email">Email address</FormLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>

      <div className={styles.footer}>
        <Link href="/login" className={styles.link}>
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
