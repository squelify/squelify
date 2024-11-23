import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { Button } from '#/components/base-ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/base-ui/dialog'
import { Input } from '#/components/base-ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '#/components/base-ui/input-otp'
import { Label } from '#/components/base-ui/label'
import { Separator } from '#/components/base-ui/separator'

export function TwoFactorSetup() {
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [setupStep, setSetupStep] = useState<'qr' | 'verify'>('qr')
  const [_verificationCode, setVerificationCode] = useState('')
  const [method, _setMethod] = useState<'authenticator' | 'email'>('authenticator')

  const handleSetup = () => {
    setShowSetupDialog(true)
    setSetupStep('qr')
  }

  const handleVerification = () => {
    setShowSetupDialog(false)
    setSetupStep('qr')
    setVerificationCode('')
  }

  return (
    <div className="grid gap-6">
      <div className="divide-y rounded-md border">
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="grid flex-1 gap-1">
              <div className="flex items-center gap-2">
                <Lucide.Smartphone className="size-4 text-muted-foreground" />
                <span className="font-medium">Authenticator App</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Use an authenticator app like Google Authenticator or Authy
              </p>
            </div>
            <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleSetup}>
                  {method === 'authenticator' ? 'Setup' : 'Change'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Setup Authenticator</DialogTitle>
                  <DialogDescription>
                    {setupStep === 'qr'
                      ? 'Scan the QR code below with your authenticator app'
                      : 'Enter the verification code from your authenticator app'}
                  </DialogDescription>
                </DialogHeader>

                {setupStep === 'qr' ? (
                  <div className="grid gap-6">
                    <div className="mx-auto rounded-lg bg-white p-4">
                      <div className="size-48 rounded bg-muted" />
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label>Secret Key</Label>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Lucide.Copy className="mr-2 size-4" />
                          Copy
                        </Button>
                      </div>
                      <Input
                        value="ABCD EFGH IJKL MNOP"
                        readOnly
                        className="text-center font-mono"
                      />
                      <p className="text-muted-foreground text-xs">
                        If you can't scan the QR code, enter this secret key manually in your
                        authenticator app
                      </p>
                    </div>

                    <Button onClick={() => setSetupStep('verify')}>Continue</Button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label className="text-center">Enter Verification Code</Label>
                        <InputOTP maxLength={6} className="justify-center gap-2">
                          <InputOTPGroup className="mx-auto mt-2 gap-2">
                            <InputOTPSlot index={0} className="size-10 text-lg" />
                            <InputOTPSlot index={1} className="size-10 text-lg" />
                            <InputOTPSlot index={2} className="size-10 text-lg" />
                            <InputOTPSeparator className="mx-2 text-muted-foreground" />
                            <InputOTPSlot index={3} className="size-10 text-lg" />
                            <InputOTPSlot index={4} className="size-10 text-lg" />
                            <InputOTPSlot index={5} className="size-10 text-lg" />
                          </InputOTPGroup>
                        </InputOTP>
                        <p className="text-center text-muted-foreground text-xs">
                          Enter the 6-digit code from your authenticator app
                        </p>
                      </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button variant="outline" onClick={() => setSetupStep('qr')}>
                        Back
                      </Button>
                      <Button onClick={handleVerification}>Verify and Enable</Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="grid flex-1 gap-1">
              <div className="flex items-center gap-2">
                <Lucide.Mail className="size-4 text-muted-foreground" />
                <span className="font-medium">Email OTP</span>
              </div>
              <p className="text-muted-foreground text-sm">Receive verification codes via email</p>
            </div>
            <Button variant="outline" size="sm">
              Setup
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-muted/50 p-4">
        <div className="flex gap-2 text-sm">
          <Lucide.Info className="mt-0.5 size-4 flex-shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground">
            Two-factor authentication adds an extra layer of security to your account. You'll need
            to enter both your password and a verification code when signing in.
          </p>
        </div>
      </div>
    </div>
  )
}
