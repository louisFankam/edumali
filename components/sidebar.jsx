"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link';

import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  DollarSign,
  Calendar,
  Building2,
  Settings,
  Menu,
  X,
  FileText,
  Clock,
  Palette,
} from "lucide-react"

const navigation = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    current: true,
  },
  {
    name: "Élèves",
    href: "/students",
    icon: GraduationCap,
    current: false,
    children: [
      {
        name: "Inscription",
        href: "/students/inscription",
      },
      {
        name: "Réinscription",
        href: "/students/reinscription",
      },
      {
        name: "Présence",
        href: "/students/presence",
      },
      {
        name: "Paiements",
        href: "/students/paiements",
        icon: DollarSign,
      },
    ],
  },
  
  {
    name: "Professeurs",
    href: "/teachers",
    icon: Users,
    current: false,
    children: [
      {
        name: "Liste",
        href: "/teachers/liste",
      },
      {
        name: "Salaires",
        href: "/teachers/salaire",
      },
      {
        name: "Présence",
        href: "/teachers/presence",
      },
      {
        name: "Remplaçants",
        href: "/teachers/remplacant",
      },
    ],
  },
  {
    name: "Notes",
    href: "/notes",
    icon: FileText,
    current: false,
    children: [
      {
        name: "Examen",
        href: "/notes/examen",
      },
      {
        name: "Bulletin",
        href: "/notes/bulletin",
      },
    ],
  },
  {
    name: "Planning",
    href: "/planning",
    icon: Clock,
    current: false,
    children: [
      {
        name: "Emploi du temps",
        href: "/planning/emploi-du-temps",
      },
      {
        name: "Examens",
        href: "/planning/examens",
      },
    ],
  },
  {
    name: "Années scolaires",
    href: "/school-years",
    icon: Calendar,
    current: false,
  },
  {
    name: "Paramètres",
    href: "/settings",
    icon: Settings,
    current: false,
  },
  {
    name: "Personnalisation",
    href: "/personalization",
    icon: Palette,
    current: false,
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileText,
    current: false,
  },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [isTeachersOpen, setIsTeachersOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isPlanningOpen, setIsPlanningOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
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

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  onMouseEnter={() => {
                    if (item.name === "Élèves") setIsStudentsOpen(true);
                    if (item.name === "Professeurs") setIsTeachersOpen(true);
                    if (item.name === "Notes") setIsNotesOpen(true);
                    if (item.name === "Planning") setIsPlanningOpen(true);
                  }}
                  onMouseLeave={() => {
                    if (item.name === "Élèves") setIsStudentsOpen(false);
                    if (item.name === "Professeurs") setIsTeachersOpen(false);
                    if (item.name === "Notes") setIsNotesOpen(false);
                    if (item.name === "Planning") setIsPlanningOpen(false);
                  }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex w-full items-center justify-start text-left font-normal py-2 px-4 rounded-md transition-colors",
                      item.current
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "text-sidebar-foreground hover:bg-red-50 hover:text-red-600",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Link>

                  {/* Students, Teachers, Notes and Planning submenu */}
                  {item.children && (item.name === "Élèves" && isStudentsOpen || item.name === "Professeurs" && isTeachersOpen || item.name === "Notes" && isNotesOpen || item.name === "Planning" && isPlanningOpen) && (
                    <div className="pl-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="flex w-full items-center justify-start text-left font-normal py-2 px-4 rounded-md transition-colors text-sidebar-foreground hover:bg-red-50 hover:text-red-600"
                          onClick={() => setIsOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* User info */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-sidebar-accent-foreground">AD</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">Administrateur</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">École Primaire Bamako</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
