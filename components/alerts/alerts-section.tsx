"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"

interface AlertItem {
  type: "payment" | "attendance" | "exam" | "general"
  title: string
  urgency: "high" | "medium" | "low"
  description: string
  amount?: number
  link: string
}

interface AlertsSectionProps {
  alerts: AlertItem[]
}

const alertConfig = {
  payment: {
    icon: DollarSign,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    lightTextColor: "text-red-600",
    badgeColor: "bg-red-500",
  },
  attendance: {
    icon: Clock,
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-800",
    lightTextColor: "text-orange-600",
    badgeColor: "bg-orange-500",
  },
  exam: {
    icon: Calendar,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    lightTextColor: "text-blue-600",
    badgeColor: "bg-blue-500",
  },
  general: {
    icon: AlertTriangle,
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-800",
    lightTextColor: "text-gray-600",
    badgeColor: "bg-gray-500",
  },
}

export function AlertsSection({ alerts }: AlertsSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertes importantes</CardTitle>
        <CardDescription>Actions requises</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aucune alerte</p>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, i) => {
              const config = alertConfig[alert.type]
              const IconComponent = config.icon

              return (
                <div
                  key={i}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                >
                  <div className={`w-2 h-2 rounded-full ${config.badgeColor}`} />

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <IconComponent className={`h-4 w-4 ${config.textColor}`} />
                      <p className={`text-sm font-medium ${config.textColor}`}>
                        {alert.title}
                      </p>
                      {alert.urgency === 'high' && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>

                    <p className={`text-xs ${config.lightTextColor} mt-1`}>
                      {alert.description}
                      {alert.amount ? ` • ${formatCurrency(alert.amount)} à récupérer` : ''}
                    </p>
                  </div>

                  <Link href={alert.link}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-current"
                    >
                      Voir
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
