import { useState } from 'react'
import { Button, FormLabel, Input } from '#/components/base-ui'
import { Link } from '#/components/link'

const styles = {
  title: 'text-2xl font-bold text-slate-800 mb-6 text-center',
  form: 'space-y-4',
  inputGroup: 'space-y-1.5',
  links: 'mt-6 flex items-center justify-between text-sm text-slate-600',
  link: 'hover:text-blue-600 transition-colors',
} as const

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement login logic here
  }

  return (
    <div>
      <h1 className={styles.title}>Sign in to your account</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <Button type="submit" variant="default" className="w-full">
          Sign in
        </Button>
      </form>

      <div className={styles.links}>
        <Link href="/forgot-password" className={styles.link}>
          Forgot password?
        </Link>
        <Link href="/register" className={styles.link}>
          Create account
        </Link>
      </div>
    </div>
  )
}
