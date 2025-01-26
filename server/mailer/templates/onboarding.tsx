import { Heading, Hr, Link, Preview, Section, Text } from 'jsx-email'
import appConfig from '~~/app.config'
import EmailMarketingTemplate from '../layouts/marketing-layout'

export interface OnboardingEmailProps {
  name: string
}

export default function OnboardingEmail(data: OnboardingEmailProps) {
  return (
    <EmailMarketingTemplate preview={<Preview>Welcome to {appConfig.title}!</Preview>}>
      <Section>
        <Hr className="mt-8 border-gray-200 pb-2" />
        <Heading as="h4" className="text-gray-900">
          Howdy {data.name}
        </Heading>
        <Text className="font-light text-base text-gray-600 leading-7">
          Congratulations and welcome to {appConfig.title}. <br />
          We are thrilled to have you on board as our newest registered user. 🎉
        </Text>
        <Text className="font-light text-base text-gray-600 leading-7">
          First things first, let&apos;s get you started. Head to the login page and use the{' '}
          <Link href={`${appConfig.baseURL}/login?auth_state=onboarding`} className="font-medium">
            login page
          </Link>{' '}
          and use the login details you&apos;ve set up. Once you&apos;re in, take a moment to
          explore our dashboard – it&apos;s designed to make your tasks a breeze.
        </Text>

        <Text className="font-light text-base text-gray-600 leading-7">
          Got any questions? We&apos;ve got a remarkable collection of tips and tricks on the{' '}
          <Link href={`${appConfig.baseURL}/docs`} className="font-medium">
            documentation page
          </Link>{' '}
          that will take your experience with {appConfig.title} to the next level.
        </Text>
        <Text className="font-light text-base text-gray-600 leading-7">
          We are looking forward to achieving greatness together.
        </Text>
      </Section>

      <Section>
        <Text className="text-base text-gray-700 leading-4 tracking-tight">
          Best regards, <br />
          The {appConfig.title} Team
        </Text>
      </Section>

      <Section>
        <Hr className="mt-4 border-gray-200 pb-2" />
        <Text className="font-light text-gray-600 text-sm leading-7">
          If you&apos;re into social stuff, let&apos;s connect! Follow us on{' '}
          <Link href="https://x.com/squelify">Twitter/X</Link>
          {' and '}
          <Link href="https://github.com/squelify">GitHub</Link> to stay in the loop about the
          latest news, updates, and cool happenings.
        </Text>
      </Section>
    </EmailMarketingTemplate>
  )
}
