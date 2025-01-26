import { Heading, Hr, Link, Preview, Section, Text } from 'jsx-email'
import appConfig from '~~/app.config'
import pkg from '~~/package.json'
import EmailMarketingTemplate from '../layouts/marketing-layout'

export interface PasswordChangedEmailProps {
  name: string
}

export default function PasswordChangedEmail(data: PasswordChangedEmailProps) {
  return (
    <EmailMarketingTemplate
      preview={<Preview>Your {pkg.config.appName} password has been changed</Preview>}
    >
      <Section>
        <Hr className="mt-8 border-gray-200 pb-2" />
        <Heading as="h4" className="text-gray-900">
          Howdy {data.name}
        </Heading>
        <Text className="font-light text-base text-gray-600 leading-7">
          Your {pkg.config.appName} account password has been successfully updated. If you initiated
          this change, no further action is required. However, if you did not request this password
          change, please contact our support team immediately. To maintain the security of your
          account, we recommend not sharing this email with anyone.
        </Text>
        <Text className="font-light text-base text-gray-600 leading-7">
          See our Help Center for{' '}
          <Link href={`${appConfig.baseURL}/docs`}>more security tips.</Link>
        </Text>
        <Text className="font-light text-base text-gray-600 leading-7">Thank you!</Text>
      </Section>
    </EmailMarketingTemplate>
  )
}
