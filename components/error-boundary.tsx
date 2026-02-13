"use client"

import { Component, ReactNode } from "react"
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

// Fallback component par défaut
function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Une erreur est survenue</CardTitle>
          <CardDescription className="mt-2">
            Désolé, une erreur inattendue s'est produite. Nos équipes ont été notifiées.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error?.message && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button onClick={resetErrorBoundary} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/"}
              className="w-full"
            >
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary FallbackComponent={fallback || DefaultErrorFallback}>
      {children}
    </ReactErrorBoundary>
  )
}

// Hook pour utiliser ErrorBoundary dans les composants fonctionnels
export function useErrorHandler() {
  return (error: Error) => {
    throw error
  }
}
