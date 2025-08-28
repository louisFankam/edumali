import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function StatsGrid({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            {stat.icon && <stat.icon className={`h-5 w-5 ${stat.iconColor || "text-primary"}`} />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            {stat.change && (
              <p
                className={`text-xs mt-1 ${
                  stat.change.startsWith("+")
                    ? "text-green-600"
                    : stat.change.startsWith("-")
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                {stat.change} par rapport au mois dernier
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
