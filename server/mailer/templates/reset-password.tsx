import { Button, Heading, Hr, Link, Preview, Section, Text } from 'jsx-email'
import * as React from 'react'
import appConfig from '~/config'
import EmailAuthTemplate from '../layouts/auth-layout'

export interface ResetPasswordEmailProps {
  name: string
  url: string
}

export default function ResetPasswordEmail(data: ResetPasswordEmailProps) {
  return (
    <EmailAuthTemplate preview={<Preview>Reset your {appConfig.title} password</Preview>}>
      <Section>
        <Hr className="mt-8 border-gray-200 pb-2" />
        <Heading as="h4" className="text-gray-900">
          Howdy {data.name}
        </Heading>
        <Text className="font-light text-base text-gray-600 leading-7">
          Someone recently requested a password change for your {appConfig.title} account. If this
          was you, you can set a new password here:
        </Text>
      </Section>

      <Section align="center">
        <Button
          href={data.url}
          borderRadius={6}
          backgroundColor="#000"
          textColor="#fff"
          fontSize={14}
          height={40}
          width={240}
        >
          Reset password
        </Button>
      </Section>

      <Section>
        <Text className="font-light text-base text-gray-600 leading-7">
          This link will only be valid for the next 15 minutes. If the button does not work, you can
          copy and paste the following link into your browser:
        </Text>
      </Section>

      <Section
        className="overflow-hidden rounded-md border-gray-200 bg-gray-100 text-sm leading-5"
        disableDefaultStyle
      >
        <Text
          className="overflow-wrap-anywhere h-auto max-w-sm whitespace-normal break-all px-4 font-mono text-gray-600"
          disableDefaultStyle
        >
          {data.url}
        </Text>
      </Section>

      <Section>
        <Text className="font-light text-base text-gray-600 leading-7">
          If you don&apos;t want to change your password or didn&apos;t request this, just ignore
          and delete this message. To keep your account secure, please don&apos;t forward this email
          to anyone.
        </Text>
        <Text className="font-light text-base text-gray-600 leading-7">
          See our Help Center for{' '}
          <Link href={`${appConfig.baseURL}/docs`}>more security tips.</Link>
        </Text>
        <Text className="font-light text-base text-gray-600 leading-7">Thank you!</Text>
      </Section>
    </EmailAuthTemplate>
  )
}
