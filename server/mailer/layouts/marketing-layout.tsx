import { Container, Hr, Html, Link, Preview, Section, Text } from 'jsx-email'
import { Body, ColorScheme, Head, Tailwind } from 'jsx-email'
import type * as React from 'react'
import { isProduction } from 'std-env'
import appConfig from '~~/app.config'
import pkg from '~~/package.json'
import AppLogo from './app-logo'

interface EmailMarketingTemplateProps {
  children: React.ReactNode
  preview?: React.JSX.Element | string
}

export default function EmailMarketingTemplate({ children, preview }: EmailMarketingTemplateProps) {
  return (
    <Tailwind production={isProduction}>
      <Html>
        <Head>
          <ColorScheme mode="light dark only" />
        </Head>
        {typeof preview === 'string' ? <Preview>{preview}</Preview> : preview}
        <Body className="bg-[#f6f9fc] p-0 font-sans sm:py-4 lg:py-8" disableDefaultStyle>
          <Container className="border-gray-200 bg-white p-10 sm:rounded-md" containerWidth={600}>
            <Section className="relative sm:rounded-t-md">
              <AppLogo width={28} height={28} />
            </Section>

            {children}

            <Section>
              <Hr className="border-gray-200 pb-2" />
              <Text className="text-center text-gray-500 text-xs">
                &copy; {new Date().getFullYear()} {pkg.config.appName}, The Internet
              </Text>
              <Text className="text-center text-gray-400 text-xs leading-4" disableDefaultStyle>
                You are receiving this email as it contains important updates and several
                information about your {pkg.config.appName} account. To manage your preferences,
                visit your <Link href={`${appConfig.baseURL}/account`}>account settings</Link>.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}
