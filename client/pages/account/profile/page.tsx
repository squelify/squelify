import consola from 'consola'
import * as Lucide from 'lucide-react'
import { useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage, SelectGroup, SelectLabel } from '#/components/base-ui'
import { Card, CardContent, CardHeader } from '#/components/base-ui'
import { CardDescription, CardTitle } from '#/components/base-ui'
import { Select, SelectItem, SelectValue } from '#/components/base-ui'
import { SelectContent, SelectTrigger } from '#/components/base-ui'
import { Button, Input, Label, TabsContent } from '#/components/base-ui'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

export default function Page() {
  useSEOMeta('Profile')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Handle file upload logic here
      consola.log('Selected file:', file)
    }
  }

  return (
    <TabsContent value="profile">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile information and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="mx-auto mb-6">
              <div className="group relative">
                <Avatar className="size-32">
                  <AvatarImage
                    src="https://avatars.githubusercontent.com/u/921834?v=4"
                    alt="Profile photo"
                  />
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-transparent hover:text-white"
                    onClick={handleFileSelect}
                  >
                    <Lucide.Upload className="mr-2 size-4" />
                    Change
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter first name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter last name" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>North America</SelectLabel>
                      <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                      <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                      <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
                      <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                      <SelectItem value="akst">Alaska Standard Time (AKST)</SelectItem>
                      <SelectItem value="hst">Hawaii Standard Time (HST)</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Europe & Africa</SelectLabel>
                      <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                      <SelectItem value="cet">Central European Time (CET)</SelectItem>
                      <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
                      <SelectItem value="west">Western European Summer Time (WEST)</SelectItem>
                      <SelectItem value="cat">Central Africa Time (CAT)</SelectItem>
                      <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Asia</SelectLabel>
                      <SelectItem value="msk">Moscow Time (MSK)</SelectItem>
                      <SelectItem value="ist">India Standard Time (IST)</SelectItem>
                      <SelectItem value="cst_china">China Standard Time (CST)</SelectItem>
                      <SelectItem value="jst">Japan Standard Time (JST)</SelectItem>
                      <SelectItem value="kst">Korea Standard Time (KST)</SelectItem>
                      <SelectItem value="ist_indonesia">
                        Indonesia Central Standard Time (WITA)
                      </SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Australia & Pacific</SelectLabel>
                      <SelectItem value="awst">Australian Western Standard Time (AWST)</SelectItem>
                      <SelectItem value="acst">Australian Central Standard Time (ACST)</SelectItem>
                      <SelectItem value="aest">Australian Eastern Standard Time (AEST)</SelectItem>
                      <SelectItem value="nzst">New Zealand Standard Time (NZST)</SelectItem>
                      <SelectItem value="fjt">Fiji Time (FJT)</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>South America</SelectLabel>
                      <SelectItem value="art">Argentina Time (ART)</SelectItem>
                      <SelectItem value="bot">Bolivia Time (BOT)</SelectItem>
                      <SelectItem value="brt">Brasilia Time (BRT)</SelectItem>
                      <SelectItem value="clt">Chile Standard Time (CLT)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
