import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { Accordion, AccordionTrigger } from '#/components/base-ui'
import { AccordionContent, AccordionItem } from '#/components/base-ui'
import { Card, CardContent, CardHeader } from '#/components/base-ui'
import { CardDescription, CardTitle } from '#/components/base-ui'
import { Badge, Button, Input, Separator, TabsContent } from '#/components/base-ui'
import { useAuthProviders } from '#/context/hooks/use-auth-providers'

import PageWrapper from '#/layouts/page-wrapper'
import { EmailProviderSettings } from './email-provider-settings'
import { SocialProviderSettings } from './social-provider-settings'

export default function Page() {
  const { providers } = useAuthProviders()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PageWrapper title="Authentication Settings">
      <TabsContent value="authentication" tabIndex={-1}>
        <Card>
          <CardHeader className="md:px-10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Authentication Providers</CardTitle>
                <CardDescription>
                  Configure authentication methods for your application
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Input
                  placeholder="Search providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8"
                />
                <Lucide.Search className="-translate-y-1/2 absolute top-1/2 right-3 size-4 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="grid gap-6 pt-6 pb-8 md:px-10">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {filteredProviders.map((provider) => (
                <AccordionItem value={provider.id} key={provider.id} className="rounded-lg border">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    <div className="flex w-full items-center gap-4">
                      <div className="shrink-0 rounded-lg border bg-muted/50 p-2.5">
                        {provider.icon}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex w-full items-center justify-between gap-4 pr-4">
                          <div className="flex flex-col items-start justify-start">
                            <h4 className="font-medium text-sm">{provider.name}</h4>
                            <p className="text-left text-muted-foreground text-sm">
                              {provider.description}
                            </p>
                          </div>
                          <Badge
                            rounded="full"
                            variant={
                              provider.status === 'active'
                                ? 'success'
                                : provider.status === 'configured'
                                  ? 'info'
                                  : 'ghost'
                            }
                            className="shrink-0 font-medium"
                          >
                            {provider.status === 'active'
                              ? 'Active'
                              : provider.status === 'configured'
                                ? 'Configured'
                                : 'Not Configured'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <Separator />
                    <div className="grid gap-6 p-6">
                      {provider.id === 'email' ? (
                        <EmailProviderSettings />
                      ) : (
                        <SocialProviderSettings
                          providerId={provider.id}
                          providerName={provider.name}
                        />
                      )}

                      <div className="flex items-center justify-end gap-2">
                        {provider.status !== 'not_configured' && (
                          <Button
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                          >
                            <Lucide.Power className="mr-2 size-4" />
                            Disable
                          </Button>
                        )}
                        <Button>
                          {provider.status === 'not_configured' ? 'Configure' : 'Save Changes'}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </TabsContent>
    </PageWrapper>
  )
}
