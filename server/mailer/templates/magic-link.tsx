import { Button, Heading, Hr, Link, Preview, Section, Text } from 'jsx-email'
import * as React from 'react'
import appConfig from '~~/app.config'
import EmailAuthTemplate from '../layouts/auth-layout'

export interface MagicLinkProps {
  email: string
  url: string
  token: string
}

export default function MagicLink(data: MagicLinkProps) {
  return (
    <EmailAuthTemplate preview={<Preview>Verify your {appConfig.title} account</Preview>}>
      <Section>
        <Hr className="mt-8 border-gray-200 pb-2" />
        <Heading as="h4" className="text-gray-900">
          Howdy {data.email}
        </Heading>
        <Text className="font-light text-base text-gray-600 leading-7">
          Thanks for starting the new {appConfig.title} account creation process. We want to make
          sure it's really you. If you don't want to create an account, you can ignore this message.
          To complete the signup process, please verify your email address by clicking the button
          below.
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
          Login to {appConfig.title}
        </Button>
      </Section>

      <Section>
        <Text className="font-light text-base text-gray-600 leading-7">
          This link and code will only be valid for the next 15 minutes. If the button does not
          work, you can copy and paste the following link into your browser:
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
          To keep your account secure, please don't forward this email to anyone. <br />
          See our Help Center for{' '}
          <Link href={`${appConfig.baseURL}/docs`}>more security tips.</Link>
        </Text>
        <Text className="font-light text-base text-gray-600 leading-7">Thank you!</Text>
      </Section>
    </EmailAuthTemplate>
  )
}
