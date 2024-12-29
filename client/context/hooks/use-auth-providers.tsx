import * as Lucide from 'lucide-react'

export function useAuthProviders() {
  const providers = [
    {
      id: 'email',
      name: 'Email/Password',
      description: 'Traditional email and password authentication',
      status: 'active' as const,
      icon: <Lucide.Mail className="size-5" />,
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'OAuth authentication with GitHub',
      status: 'configured' as const,
      icon: <Lucide.Github className="size-5" />,
    },
    {
      id: 'google',
      name: 'Google',
      description: 'OAuth authentication with Google',
      status: 'not_configured' as const,
      icon: <Lucide.Globe className="size-5" />,
    },
    {
      id: 'apple',
      name: 'Apple',
      description: 'OAuth authentication with Apple',
      status: 'not_configured' as const,
      icon: <Lucide.Apple className="size-5" />,
    },
    {
      id: 'twitter',
      name: 'Twitter',
      description: 'OAuth authentication with Twitter',
      status: 'not_configured' as const,
      icon: <Lucide.Twitter className="size-5" />,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'OAuth authentication with Facebook',
      status: 'not_configured' as const,
      icon: <Lucide.Facebook className="size-5" />,
    },
  ]

  return { providers }
}
