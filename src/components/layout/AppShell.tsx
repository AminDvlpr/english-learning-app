"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { Smile, Trophy, Compass, Swords, User } from "lucide-react"

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  topBar?: React.ReactNode
}

export function AppShell({ children, topBar, className, ...props }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isBuilder = pathname?.startsWith('/builder')

  const [mounted, setMounted] = React.useState(false)
  const [userName, setUserName] = React.useState<string | null>(null)
  const [inputName, setInputName] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("اکسپلور")

  React.useEffect(() => {
    setMounted(true)
    const savedName = localStorage.getItem('english-app-user-name')
    if (savedName) setUserName(savedName)

    const savedTab = localStorage.getItem('english-app-active-tab')
    if (savedTab) setActiveTab(savedTab)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputName.trim()) return
    localStorage.setItem('english-app-user-name', inputName.trim())
    setUserName(inputName.trim())
  }

  const containerClass = isBuilder
    ? "w-full max-w-none h-[100dvh] bg-background flex flex-col overflow-hidden relative"
    : "w-full max-w-[430px] h-[100dvh] sm:h-[95dvh] sm:max-h-[890px] sm:rounded-[38px] sm:border-[6px] sm:border-neutral-800 bg-background flex flex-col overflow-hidden relative shadow-2xl mx-auto"

  const navItems = [
    { id: "پروفایل", icon: User, label: "پروفایل" },
    { id: "چالش", icon: Swords, label: "چالش" },
    { id: "اکسپلور", icon: Compass, label: "اکسپلور", isCenter: true },
    { id: "رنکینگ", icon: Trophy, label: "رنکینگ" },
    { id: "دایی‌جان", icon: Smile, label: "دایی‌جان" }
  ]

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    localStorage.setItem('english-app-active-tab', tabId)
    window.dispatchEvent(new Event('tab-changed'))
    if (tabId === "اکسپلور") {
      router.push("/")
    } else {
      router.push("/dashboard")
    }
  }

  if (!mounted) return null

  return (
    <div className="bg-neutral-950 min-h-[100dvh] flex items-center justify-center">
      <div className={cn(containerClass, className, "font-sans antialiased")} dir="rtl" {...props}>

        {!isBuilder && !userName ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
            <div className="mb-8 text-center animate-in zoom-in duration-500">
               <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                  <span className="text-4xl">✨</span>
               </div>
               <h1 className="text-2xl font-black mb-2">سفر در زبان</h1>
               <p className="text-muted-foreground text-sm">برای شروع یادگیری، نام خود را وارد کنید</p>
            </div>
            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
              <input
                type="text"
                className="flex h-12 w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 text-right"
                placeholder="مثلاً: علی گیمر"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold h-12 rounded-xl border-2 border-neutral-900 shadow-[3px_3px_0px_#171717] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#171717] transition-all active:translate-y-[3px] active:shadow-none"
              >
                ورود به برنامه
              </button>
            </form>
          </div>
        ) : (
          <>
            {topBar && (
              <div className="flex-none">
                {topBar}
              </div>
            )}
            <main className="flex-1 flex flex-col w-full h-full relative overflow-hidden">
              {children}
            </main>

            {!isBuilder && (
              <nav className="h-16 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 shrink-0 z-40 dir-rtl">
                 {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                       <button
                          key={item.id}
                          onClick={() => handleTabChange(item.id)}
                          className={cn(
                             "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all",
                             isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                             item.isCenter && "relative"
                          )}
                       >
                          {item.isCenter ? (
                             <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center -mt-6 border-[3px] shadow-sm",
                                isActive ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground"
                             )}>
                               <Icon className="w-6 h-6" />
                             </div>
                          ) : (
                             <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
                          )}
                          <span className={cn(
                             "text-[10px] font-medium",
                             isActive && "font-bold",
                             item.isCenter && "sr-only"
                          )}>
                             {item.label}
                          </span>
                       </button>
                    )
                 })}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}
