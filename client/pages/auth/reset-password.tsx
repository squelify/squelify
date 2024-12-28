import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button, FormLabel, Input } from '#/components/base-ui'

const styles = {
  title: 'text-2xl font-bold text-gray-800 mb-2 text-center',
  subtitle: 'text-gray-600 text-center mb-6',
  form: 'space-y-4',
  inputGroup: 'space-y-1.5',
  footer: 'mt-6 text-center text-sm text-gray-600',
  link: 'text-brand-600 hover:text-brand-700 transition-colors',
  error: 'text-sm text-red-600 mt-1',
} as const

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsSuccess(true)
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className={styles.title}>Invalid Reset Link</h1>
        <p className={styles.subtitle}>This password reset link is invalid or has expired.</p>
        <div className={styles.footer}>
          <Link to="/forgot-password" className={styles.link}>
            Request a new reset link
          </Link>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <h1 className={styles.title}>Password Reset Complete</h1>
        <p className={styles.subtitle}>Your password has been successfully reset.</p>
        <div className={styles.footer}>
          <Link to="/login" className={styles.link}>
            Sign in with new password
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className={styles.title}>Create new password</h1>
      <p className={styles.subtitle}>Please enter your new password below</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <FormLabel htmlFor="password" hidden>
            New password
          </FormLabel>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter new password"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <FormLabel htmlFor="confirmPassword" hidden>
            Confirm password
          </FormLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            required
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <Button type="submit" className="w-full">
          Reset password
        </Button>
      </form>

      <div className={styles.footer}>
        <Link to="/login" className={styles.link}>
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
