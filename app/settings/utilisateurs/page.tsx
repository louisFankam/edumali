"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { HelpButton } from "@/components/help-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Trash2, Shield, Loader2 } from "lucide-react"

interface UserAccount {
  id: number
  email: string
  fullName: string
  role: string
  createdAt: number | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("manager")
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      if (data.ok) setUsers(data.users)
    } catch {
      toast.error("Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetch("/api/auth/session").then(r => r.json()).then(d => {
      if (d.ok && d.user?.id) setCurrentUserId(d.user.id)
    }).catch(() => {})
  }, [])

  const isSelf = (userId: number) => currentUserId === userId

  const handleCreate = async () => {
    if (!username || !fullName || !password) {
      toast.error("Veuillez remplir tous les champs")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, fullName, password, role }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success("Utilisateur créé avec succès")
        setShowCreate(false)
        setUsername("")
        setFullName("")
        setPassword("")
        setRole("manager")
        fetchUsers()
      } else {
        toast.error(data.message || "Erreur lors de la création")
      }
    } catch {
      toast.error("Erreur serveur")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (user: UserAccount) => {
    if (!confirm(`Supprimer l'utilisateur "${user.fullName}" (${user.email}) ?`)) return
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.ok) {
        toast.success("Utilisateur supprimé")
        fetchUsers()
      } else {
        toast.error(data.message || "Erreur lors de la suppression")
      }
    } catch {
      toast.error("Erreur serveur")
    }
  }

  const handleRoleChange = async (user: UserAccount, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success("Rôle mis à jour")
        fetchUsers()
      } else {
        toast.error(data.message || "Erreur lors de la mise à jour")
      }
    } catch {
      toast.error("Erreur serveur")
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="Utilisateurs"
        description="Gérer les comptes administrateurs et gestionnaires"
      >
        <HelpButton />
      </PageHeader>

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Comptes</CardTitle>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun utilisateur</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom d'utilisateur</TableHead>
                    <TableHead>Nom complet</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell>{u.fullName}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                          <Shield className="h-3 w-3 mr-1" />
                          {u.role === "admin" ? "Administrateur" : "Gestionnaire"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={u.role}
                            disabled={isSelf(u.id)}
                            onValueChange={(v) => handleRoleChange(u, v)}
                          >
                            <SelectTrigger className="h-8 w-36" title={isSelf(u.id) ? "Vous ne pouvez pas modifier votre propre rôle" : ""}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrateur</SelectItem>
                              <SelectItem value="manager">Gestionnaire</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            disabled={isSelf(u.id)}
                            onClick={() => handleDelete(u)}
                            title={isSelf(u.id) ? "Vous ne pouvez pas vous supprimer" : ""}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom d'utilisateur</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Identifiant de connexion"
              />
            </div>
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nom et prénom"
              />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
              />
            </div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="manager">Gestionnaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
