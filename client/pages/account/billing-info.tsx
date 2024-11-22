import * as Lucide from 'lucide-react'
import { Button } from '#/components/base-ui/button'

export function BillingInfo() {
  return (
    <div className="grid gap-4">
      <div className="rounded-lg border p-3">
        <div className="flex items-center gap-4">
          <Lucide.CreditCard className="h-5 w-5" />
          <div className="flex-1">
            <p className="font-medium">•••• 4242</p>
            <p className="text-muted-foreground text-sm">Expires 12/24</p>
          </div>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </div>
      </div>
      <div className="rounded-lg border p-3">
        <div className="flex items-center gap-4">
          <Lucide.MapPin className="h-5 w-5" />
          <div className="flex-1">
            <p className="font-medium">Billing Address</p>
            <p className="text-muted-foreground text-sm">123 Main St, City, Country</p>
          </div>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </div>
      </div>
    </div>
  )
}
