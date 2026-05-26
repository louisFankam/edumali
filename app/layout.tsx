import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "EduMali - Gestion Scolaire",
  description: "Application de gestion scolaire pour l'École Primaire de Bamako",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider>
            <ErrorBoundary>
              {children}
              <Toaster />
            </ErrorBoundary>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
