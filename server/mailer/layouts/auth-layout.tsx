import { Body, ColorScheme, Container, Head, Hr, Html, Preview, Section, Text } from 'jsx-email'
import { Tailwind } from 'jsx-email'
import type React from 'react'
import { isProduction } from 'std-env'
import appConfig from '~/config'
import AppLogo from './app-logo'

interface EmailAuthTemplateProps {
  children: React.ReactNode
  preview?: JSX.Element | string
}

export default function EmailAuthTemplate({ children, preview }: EmailAuthTemplateProps) {
  return (
    <Tailwind production={isProduction}>
      <Html lang="en" dir="ltr">
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
              <Text className="text-gray-400 text-xs">
                &copy; {new Date().getFullYear()} {appConfig.title}, {appConfig.address}
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}
