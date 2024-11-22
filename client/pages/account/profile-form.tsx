import consola from 'consola'
import * as Lucide from 'lucide-react'
import { useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/base-ui/avatar'
import { Button } from '#/components/base-ui/button'
import { Input } from '#/components/base-ui/input'
import { Label } from '#/components/base-ui/label'
import { Select, SelectItem, SelectValue } from '#/components/base-ui/select'
import { SelectContent, SelectTrigger } from '#/components/base-ui/select'

export function ProfileForm() {
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
    <div className="flex flex-col gap-6">
      <div className="mx-auto mb-6">
        <div className="group relative">
          <Avatar className="size-32">
            <AvatarImage src="https://github.com/riipandi.png" alt="Profile photo" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-transparent hover:text-white"
              onClick={handleFileSelect}
            >
              <Lucide.Upload className="mr-2 h-4 w-4" />
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
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utc+7">Western Indonesia Time (UTC+7)</SelectItem>
              <SelectItem value="utc+8">Singapore Time (UTC+8)</SelectItem>
              <SelectItem value="utc+0">UTC</SelectItem>
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
              <SelectItem value="id">Bahasa Indonesia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}
