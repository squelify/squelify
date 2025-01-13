import * as Lucide from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '#/components/base-ui'
import { Link } from '#/components/link'

const shortcuts = [
  {
    title: 'Content Management',
    description: 'Create and manage content types',
    icon: Lucide.FileText,
    actions: [
      { label: 'New Content', icon: Lucide.Plus, href: '/content/collections' },
      { label: 'View All', icon: Lucide.List, href: '/content/collections' },
    ],
  },
  {
    title: 'Media Library',
    description: 'Upload and organize files',
    icon: Lucide.Image,
    actions: [
      { label: 'Upload Files', icon: Lucide.Upload, href: '/content/media-library' },
      { label: 'Browse Files', icon: Lucide.FolderOpen, href: '/content/media-library' },
    ],
  },
  {
    title: 'API & Webhooks',
    description: 'Manage API keys and webhooks',
    icon: Lucide.Bolt,
    actions: [
      { label: 'API Key', icon: Lucide.Key, href: '/api-keys' },
      { label: 'Webhooks', icon: Lucide.Webhook, href: '/webhooks' },
    ],
  },
]

export default function CardQuickAccess() {
  return (
    <>
      {shortcuts.map((shortcut) => (
        <Card key={shortcut.title}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <shortcut.icon className="size-5" />
              {shortcut.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground text-sm">{shortcut.description}</p>
            <div className="flex gap-4">
              {shortcut.actions.map((action) => (
                <Button key={action.label} variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={action.href}>
                    <action.icon className="-ml-1 mr-1 size-4" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
