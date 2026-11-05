"use client"

import * as React from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Cloud, HardDrive, LogOut, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [showEmailInput, setShowEmailInput] = React.useState(false)
  const [emailSent, setEmailSent] = React.useState(false)

  const supabase = createClient()
  const isCloud = isSupabaseConfigured()

  React.useEffect(() => {
    if (!isCloud) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      setUser(data.user)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event: any, session: any) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [isCloud, supabase])

  const handleGoogleLogin = async () => {
    if (!isCloud) return
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isCloud || !email) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    if (!error) {
      setEmailSent(true)
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    if (!isCloud) return
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">همگام‌سازی حساب کاربری</DialogTitle>
          <DialogDescription className="text-right">
            حساب کاربری خود را متصل کنید تا پیشرفتتان در همه دستگاه‌ها ذخیره شود.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-muted/50 border">
            {isCloud ? (
              <Cloud className="w-5 h-5 text-success" />
            ) : (
              <HardDrive className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {isCloud ? "همگام‌سازی ابری فعال است" : "حالت محلی (بدون نیاز به ورود)"}
            </span>
          </div>

          {!isCloud && (
            <div className="text-sm text-center text-muted-foreground leading-relaxed">
              متغیرهای محیطی Supabase تنظیم نشده‌اند. در حال استفاده از حالت ذخیره‌سازی محلی مرورگر هستید.
            </div>
          )}

          {isCloud && !user && (
            <div className="flex flex-col gap-3">
              {!showEmailInput ? (
                <>
                  <Button onClick={handleGoogleLogin} disabled={loading} className="w-full justify-start text-right" variant="outline">
                    <svg className="ml-2 h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    ورود با حساب گوگل
                  </Button>
                  <Button onClick={() => setShowEmailInput(true)} disabled={loading} className="w-full justify-start text-right" variant="outline">
                    <Mail className="ml-2 h-4 w-4 shrink-0" /> ورود با ایمیل
                  </Button>
                </>
              ) : (
                <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 text-right">
                  {emailSent ? (
                    <div className="text-sm text-center text-success bg-success/10 p-3 rounded-md">
                      لینک ورود به ایمیل شما ارسال شد!
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="block text-right">ایمیل</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          required
                          value={email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                          dir="ltr"
                          className="text-left"
                        />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full">
                        ارسال لینک ورود
                      </Button>
                    </>
                  )}
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setShowEmailInput(false)}>
                    بازگشت
                  </Button>
                </form>
              )}
            </div>
          )}

          {isCloud && user && (
            <div className="flex flex-col gap-4 items-center">
              <div className="text-center">
                <p className="text-sm font-medium">وارد شده به عنوان</p>
                <p className="text-sm text-muted-foreground" dir="ltr">{user.email}</p>
              </div>
              <Button onClick={handleSignOut} disabled={loading} variant="destructive" className="w-full">
                <LogOut className="ml-2 h-4 w-4 shrink-0" /> خروج از حساب
              </Button>
            </div>
          )}

          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {isCloud && !user ? "ادامه به عنوان کاربر مهمان" : "بستن"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
