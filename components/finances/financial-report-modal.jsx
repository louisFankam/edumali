"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, TrendingUp, DollarSign, Users, Download } from "lucide-react"

export function FinancialReportModal({ open, onOpenChange }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Rapports Financiers</span>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monthly">Mensuel</TabsTrigger>
            <TabsTrigger value="yearly">Annuel</TabsTrigger>
            <TabsTrigger value="outstanding">Impayés</TabsTrigger>
            <TabsTrigger value="analysis">Analyse</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              <Select defaultValue="2024-01">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-01">Janvier 2024</SelectItem>
                  <SelectItem value="2023-12">Décembre 2023</SelectItem>
                  <SelectItem value="2023-11">Novembre 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Recettes totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">18,750,000 FCFA</div>
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-600">+12%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Paiements reçus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">245</div>
                  <div className="text-sm text-gray-600">transactions</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Taux de recouvrement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">84%</div>
                  <div className="text-sm text-gray-600">des frais dus</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Impayés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">3,250,000 FCFA</div>
                  <div className="text-sm text-gray-600">134 élèves</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des recettes par type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Frais de scolarité</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-4/5 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="font-semibold">14,062,500 FCFA (75%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cantine</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-1/6 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="font-semibold">2,812,500 FCFA (15%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Transport</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-1/12 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <span className="font-semibold">1,312,500 FCFA (7%)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Uniformes</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div className="w-1/20 h-2 bg-purple-500 rounded-full"></div>
                      </div>
                      <span className="font-semibold">562,500 FCFA (3%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yearly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Résumé annuel 2024</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-green-600">225,000,000 FCFA</div>
                    <div className="text-sm text-gray-600">Recettes totales</div>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-blue-600">890</div>
                    <div className="text-sm text-gray-600">Élèves inscrits</div>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-purple-600">87%</div>
                    <div className="text-sm text-gray-600">Taux de recouvrement moyen</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution mensuelle des recettes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { month: "Janvier", amount: 18750000, growth: "+12%" },
                    { month: "Décembre", amount: 16750000, growth: "+8%" },
                    { month: "Novembre", amount: 15500000, growth: "+5%" },
                    { month: "Octobre", amount: 14750000, growth: "+3%" },
                  ].map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{data.month}</span>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold">{formatCurrency(data.amount)}</span>
                        <Badge className="bg-green-100 text-green-800">{data.growth}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outstanding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analyse des impayés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Par durée de retard</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <span className="text-sm">0-30 jours</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">45 élèves</span>
                          <span className="text-sm text-gray-600">1,250,000 FCFA</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                        <span className="text-sm">31-60 jours</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">32 élèves</span>
                          <span className="text-sm text-gray-600">950,000 FCFA</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm">+60 jours</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">57 élèves</span>
                          <span className="text-sm text-gray-600">1,050,000 FCFA</span>
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analyse financière</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Tendances positives</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Augmentation de 12% des recettes ce mois</span>
                      </div>
                      <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Amélioration du taux de recouvrement (+3%)</span>
                      </div>
                      <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Réduction des impayés de longue durée</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Points d'attention</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm">134 élèves ont des impayés (15% des effectifs)</span>
                      </div>

                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Recommandations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <span>Mettre en place un système de relance automatique pour les impayés</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <span>Proposer des facilités de paiement pour les familles en difficulté</span>
                      </div>

                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
