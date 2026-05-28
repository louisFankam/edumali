"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useSchoolInfo } from '@/hooks/use-school-info'
import { ChevronDown, ChevronRight, LayoutDashboard, GraduationCap, Users, UserCheck, DollarSign, Calendar, Settings, Menu, X, FileText, Clock, Palette, LogOutIcon, RotateCcw, CalendarCheck, CreditCard, BookOpen, ClipboardCheck, CalendarDays, Database, HelpCircle } from "lucide-react"

interface NavigationItem {
  name: string
  href: string
  icon: any
  current?: boolean
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Élèves",
    href: "/students",
    icon: GraduationCap,
    children: [
      { name: "Liste", href: "/students", icon: Users },
      { name: "Réinscription", href: "/students/reinscription", icon: RotateCcw },
      { name: "Présence", href: "/students/presence", icon: CalendarCheck },
      { name: "Paiements", href: "/students/paiements", icon: CreditCard },
    ],
  },
  {
    name: "Professeurs",
    href: "/teachers/liste",
    icon: Users,
    children: [
      { name: "Liste", href: "/teachers/liste", icon: Users },
      { name: "Salaires", href: "/teachers/salaire", icon: DollarSign },
      { name: "Présence", href: "/teachers/presence", icon: CalendarCheck },

    ],
  },
  {
    name: "Notes",
    href: "/notes",
    icon: FileText,
    children: [
      { name: "Examen", href: "/notes/examen", icon: BookOpen },
      { name: "Bulletin", href: "/notes/bulletin", icon: ClipboardCheck },
    ],
  },
  {
    name: "Planning",
    href: "/planning",
    icon: Clock,
    children: [
      { name: "Emploi du temps", href: "/planning/emploi-du-temps", icon: Clock },
      { name: "Examens", href: "/planning/examens", icon: CalendarDays },
    ],
  },
  { name: "Années scolaires", href: "/school-years", icon: Calendar },
  { name: "Trésorerie", href: "/finances", icon: DollarSign },
  { name: "Historique académique", href: "/academic-history", icon: BookOpen },
  { name: "Base de données", href: "/settings/database", icon: Database },
  { name: "Paramètres", href: "/settings", icon: Settings },
  { name: "Personnalisation", href: "/personalization", icon: Palette },
  { name: "Aide", href: "/aide", icon: HelpCircle },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const pathname = usePathname()

  const { user, logout, isAuthenticated } = useAuth()
  const { schoolInfo } = useSchoolInfo()

  useEffect(() => {
    const getCurrentParent = () => {
      if (pathname.startsWith('/students')) return 'Élèves'
      if (pathname.startsWith('/teachers')) return 'Professeurs'
      if (pathname.startsWith('/notes')) return 'Notes'
      if (pathname.startsWith('/planning')) return 'Planning'
      return null
    }

    const currentParent = getCurrentParent()
    if (currentParent) {
      setOpenItems(prev => ({ ...prev, [currentParent]: true }))
    }
  }, [pathname])

  const toggleItem = (itemName: string) => {
    setOpenItems(prev => ({ ...prev, [itemName]: !prev[itemName] }))
  }

  const isActive = (href: string) => pathname === href

  const hasActiveChild = (item: NavigationItem) => {
    if (!item.children) return false
    return item.children.some(child => isActive(child.href))
  }

  if (!isAuthenticated) return null

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center px-6 py-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-serif font-bold text-sidebar-foreground">EduMali</h1>
                <p className="text-xs text-sidebar-foreground/60">Gestion Scolaire</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-4 overflow-y-auto">
            <nav className="space-y-1 pb-4">
              {navigation.map((item) => (
                <div key={item.name} className="sidebar-item">
                  {item.children ? (
                    <button
                      onClick={() => toggleItem(item.name)}
                      className={cn(
                        "flex w-full items-center justify-start text-left font-normal py-2 px-4 rounded-md transition-colors",
                        isActive(item.href) || hasActiveChild(item)
                          ? "sidebar-active-bg sidebar-active-text hover:opacity-90"
                          : "text-sidebar-foreground hover:sidebar-hover-bg hover:sidebar-hover-text",
                      )}
                    >
                      <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 sidebar-text">{item.name}</span>
                      <span className="ml-2">
                        {openItems[item.name] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex w-full items-center justify-start text-left font-normal py-2 px-4 rounded-md transition-colors",
                        isActive(item.href)
                          ? "sidebar-active-bg sidebar-active-text hover:opacity-90"
                          : "text-sidebar-foreground hover:sidebar-hover-bg hover:sidebar-hover-text",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 sidebar-text">{item.name}</span>
                    </Link>
                  )}

                  {item.children && (
                    <div className={cn("sidebar-submenu hidden", openItems[item.name] && "block pl-8 mt-1")}>
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            "flex w-full items-center justify-start text-left font-normal py-2 px-4 rounded-md transition-colors",
                            isActive(child.href)
                              ? "text-red-600 hover:opacity-90"
                              : "text-sidebar-foreground hover:sidebar-hover-bg hover:sidebar-hover-text",
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {child.icon && <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />}
                          <span className="flex-1 sidebar-text">{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-sidebar-accent-foreground">
                    {user?.fullName?.substring(0, 2).toUpperCase() || "AD"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.fullName}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{schoolInfo?.name}</p>
                </div>
              </div>
            </div>
            <Button className="w-full sidebar-active-bg sidebar-active-text hover:opacity-90 justify-start" onClick={logout}>
              <LogOutIcon className="h-4 w-4 mr-2" />
              Deconnexion
            </Button>
          </div>
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
