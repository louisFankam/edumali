"use client"

import { AppLayout } from "@/components/app-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"

const sections = [
  { id: "tableau-de-bord", title: "Tableau de bord" },
  { id: "eleves", title: "Élèves" },
  { id: "professeurs", title: "Professeurs" },
  { id: "notes", title: "Notes" },
  { id: "planning", title: "Planning" },
  { id: "annees-scolaires", title: "Années scolaires" },
  { id: "tresorerie", title: "Trésorerie" },
  { id: "historique-academique", title: "Historique académique" },
  { id: "parametres", title: "Paramètres" },
  { id: "base-de-donnees", title: "Base de données" },
  { id: "personnalisation", title: "Personnalisation" },
]

function TableOfContents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sommaire</CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="space-y-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="block text-sm text-muted-foreground hover:text-foreground hover:underline py-1"
            >
              {s.title}
            </a>
          ))}
        </nav>
      </CardContent>
    </Card>
  )
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div id={id} className="scroll-mt-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

function Step({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="font-semibold text-foreground shrink-0 w-32">{label}</span>
      <span>{children}</span>
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted rounded-lg p-3 text-xs border-l-4 border-primary">
      <span className="font-semibold text-foreground">Astuce : </span>
      {children}
    </div>
  )
}

export default function AidePage() {
  return (
    <AppLayout>
      <PageHeader
        title="Aide et documentation"
        description="Tout ce que vous devez savoir pour utiliser Ekima"
      />

      <TableOfContents />

      <div className="space-y-6">
        <Section id="tableau-de-bord" title="Tableau de bord">
          <p>
            Le tableau de bord est la première page que vous voyez en vous connectant.
            Elle vous donne un aperçu rapide de l&apos;état de votre établissement.
          </p>
          <div className="font-semibold text-foreground">Comment l&apos;utiliser :</div>
          <div className="space-y-2">
            <Step label="Consultation">Les chiffres clés (élèves, professeurs, finances) s&apos;affichent automatiquement.</Step>
            <Step label="Filtre">Utilisez le menu déroulant pour choisir une période (mois en cours, trimestre, année).</Step>
            <Step label="Rafraîchir">Cliquez sur le bouton d&apos;actualisation pour mettre à jour les données.</Step>
          </div>
          <Tip>
            Le tableau de bord se met à jour automatiquement au chargement. Si vous venez d&apos;ajouter des données,
            cliquez sur Actualiser pour voir les changements.
          </Tip>
        </Section>

        <Section id="eleves" title="Élèves">
          <p>
            La section Élèves vous permet de gérer tous les aspects liés aux élèves :
            inscriptions, présence, paiements et réinscriptions.
          </p>

          <div className="border-t pt-4 space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">Liste des élèves</div>
              <p>Affiche tous les élèves inscrits. Vous pouvez :</p>
              <div className="space-y-1 mt-1">
                <Step label="Ajouter">Cliquez sur &quot;Nouvel élève&quot; et remplissez le formulaire (nom, classe, parent, etc.).</Step>
                <Step label="Modifier">Cliquez sur l&apos;icône crayon à côté d&apos;un élève pour changer ses informations.</Step>
                <Step label="Rechercher">Utilisez la barre de recherche pour trouver un élève par son nom ou sa classe.</Step>
                <Step label="Profil">Cliquez sur le nom d&apos;un élève pour voir sa fiche détaillée (paiements, notes, présence).</Step>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">Réinscription</div>
              <p>Permet de réinscrire les anciens élèves pour la nouvelle année scolaire.</p>
              <div className="space-y-1 mt-1">
                <Step label="Sélection">Choisissez l&apos;année scolaire précédente et la nouvelle année.</Step>
                <Step label="Choix">Cochez les élèves à réinscrire ou cliquez sur &quot;Tout sélectionner&quot;.</Step>
                <Step label="Valider">Cliquez sur &quot;Réinscrire&quot; pour confirmer. Les élèves seront copiés dans la nouvelle année.</Step>
              </div>
            </div>
            <Tip>Les élèves conservent leur classe d&apos;origine. Vous pouvez changer leur classe après la réinscription.</Tip>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">Présence</div>
              <p>Enregistrez les présences et absences des élèves au quotidien.</p>
              <div className="space-y-1 mt-1">
                <Step label="Date">Sélectionnez la date du jour (ou une date passée).</Step>
                <Step label="Classe">Choisissez la classe.</Step>
                <Step label="Marquage">Pour chaque élève, cliquez sur Présent, Absent ou Retard.</Step>
                <Step label="Valider">Cliquez sur &quot;Enregistrer&quot; pour sauvegarder les présences.</Step>
              </div>
            </div>
            <Tip>Vous pouvez aussi voir l&apos;historique des présences pour un élève ou une classe sur une période donnée.</Tip>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">Paiements</div>
              <p>Suivez les paiements de scolarité des élèves.</p>
              <div className="space-y-1 mt-1">
                <Step label="Enregistrer">Cliquez sur &quot;Nouveau paiement&quot; et entrez le montant, la date et le mois concerné.</Step>
                <Step label="Filtre">Utilisez les filtres pour voir les paiements par classe, mois ou statut.</Step>
                <Step label="Reçu">Chaque paiement peut être imprimé comme reçu.</Step>
              </div>
            </div>
            <Tip>Les paiements sont liés à l&apos;année scolaire en cours. Pensez à vérifier l&apos;année sélectionnée.</Tip>
          </div>
        </Section>

        <Section id="professeurs" title="Professeurs">
          <p>
            La section Professeurs vous permet de gérer le personnel enseignant :
            fiches, salaires et présence.
          </p>

          <div className="space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">Liste des professeurs</div>
              <div className="space-y-1 mt-1">
                <Step label="Ajouter">Cliquez sur &quot;Nouveau professeur&quot; et remplissez la fiche (nom, spécialité, contrat, etc.).</Step>
                <Step label="Modifier">Cliquez sur le crayon à côté d&apos;un professeur pour modifier ses informations.</Step>
                <Step label="Profil">Cliquez sur le nom pour voir la fiche détaillée avec les matières enseignées.</Step>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">Salaires</div>
              <p>Calculez et gérez les rémunérations des professeurs.</p>
              <div className="space-y-1 mt-1">
                <Step label="Calcul">Les salaires sont calculés automatiquement selon le type de contrat (mensuel ou horaire).</Step>
                <Step label="Paiement">Marquez un salaire comme payé une fois le versement effectué.</Step>
                <Step label="Export">Cliquez sur &quot;Exporter CSV&quot; pour télécharger la liste des salaires dans Excel.</Step>
              </div>
            </div>
            <Tip>Pour les professeurs horaires, le salaire dépend du nombre d&apos;heures effectuées dans le mois.</Tip>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">Présence</div>
              <p>Suivez les présences quotidiennes des professeurs.</p>
              <div className="space-y-1 mt-1">
                <Step label="Date">Choisissez la date.</Step>
                <Step label="Marquage">Pour chaque professeur, indiquez Présent, Absent ou Retard.</Step>
                <Step label="Historique">Consultez l&apos;historique des présences sur une période.</Step>
              </div>
            </div>
          </div>
        </Section>

        <Section id="notes" title="Notes">
          <p>
            La section Notes permet de gérer les évaluations et les bulletins scolaires.
          </p>

          <div className="space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">Examen / Évaluations</div>
              <p>Créez des devoirs, examens et évaluations pour chaque classe et matière.</p>
              <div className="space-y-1 mt-1">
                <Step label="Créer">Cliquez sur &quot;Ajouter&quot; et choisissez la classe, la matière et le type d&apos;évaluation.</Step>
                <Step label="Noter">Entrez les notes des élèves pour chaque évaluation.</Step>
                <Step label="Moyenne">La moyenne de la classe est calculée automatiquement.</Step>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">Bulletin</div>
              <p>Générez les bulletins scolaires par classe et par trimestre.</p>
              <div className="space-y-1 mt-1">
                <Step label="Classe">Sélectionnez la classe et le trimestre.</Step>
                <Step label="Générer">Le bulletin se construit automatiquement à partir des notes saisies.</Step>
                <Step label="Imprimer">Cliquez sur &quot;Tout imprimer&quot; pour imprimer les bulletins de toute la classe.</Step>
              </div>
            </div>
            <Tip>Vérifiez que toutes les notes sont saisies avant de générer les bulletins pour éviter des moyennes incomplètes.</Tip>
          </div>
        </Section>

        <Section id="planning" title="Planning">
          <p>
            La section Planning vous aide à organiser le temps scolaire : emplois du temps et calendrier des examens.
          </p>

          <div className="space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">Emploi du temps</div>
              <p>Créez et gérez les emplois du temps par classe.</p>
              <div className="space-y-1 mt-1">
                <Step label="Classe">Sélectionnez la classe.</Step>
                <Step label="Créneau">Cliquez sur une case vide pour ajouter une matière, un professeur et une salle.</Step>
                <Step label="Modifier">Cliquez sur un créneau existant pour le modifier ou le supprimer.</Step>
                <Step label="Export">Téléchargez l&apos;emploi du temps au format PDF ou image.</Step>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">Examens</div>
              <p>Planifiez le calendrier des examens.</p>
              <div className="space-y-1 mt-1">
                <Step label="Ajouter">Cliquez sur &quot;Ajouter&quot; et remplissez la date, la matière, la classe et la salle.</Step>
                <Step label="Vue">Le calendrier affiche tous les examens planifiés par classe et par période.</Step>
                <Step label="Filtre">Filtrez par classe pour voir uniquement les examens d&apos;une classe spécifique.</Step>
              </div>
            </div>
          </div>
        </Section>

        <Section id="annees-scolaires" title="Années scolaires">
          <p>
            Gérez les années scolaires de votre établissement. Chaque année a une date de début, une date de fin et un statut (active ou inactive).
          </p>
          <div className="space-y-2">
            <Step label="Ajouter">Cliquez sur &quot;Nouvelle année&quot; et entrez les dates de début et de fin.</Step>
            <Step label="Activer">Une seule année peut être active à la fois. L&apos;année active est utilisée par défaut dans toutes les sections.</Step>
            <Step label="Modifier">Vous pouvez changer les dates ou le statut d&apos;une année existante.</Step>
          </div>
          <Tip>
            Pensez à créer la nouvelle année scolaire avant de faire les réinscriptions. Les données (classes, élèves) sont liées à l&apos;année active.
          </Tip>
        </Section>

        <Section id="tresorerie" title="Trésorerie">
          <p>
            La trésorerie vous permet de suivre les revenus et les dépenses de l&apos;établissement.
          </p>
          <div className="space-y-2">
            <Step label="Revenus">Les paiements des élèves sont automatiquement enregistrés comme revenus.</Step>
            <Step label="Dépenses">Ajoutez manuellement les dépenses (fournitures, électricité, salaires, etc.).</Step>
            <Step label="Solde">Le solde (revenus - dépenses) se calcule automatiquement.</Step>
            <Step label="Période">Utilisez les filtres pour voir la trésorerie par mois ou par année.</Step>
          </div>
          <Tip>Le solde affiché tient compte de l&apos;année scolaire sélectionnée. Vérifiez que la bonne année est active.</Tip>
        </Section>

        <Section id="historique-academique" title="Historique académique">
          <p>
            Consultez le suivi des résultats scolaires et la progression des élèves sur plusieurs années.
          </p>
          <div className="space-y-2">
            <Step label="Trimestre">Sélectionnez le trimestre (1er, 2ème ou 3ème).</Step>
            <Step label="Consultation">Les résultats s&apos;affichent par classe avec les moyennes de chaque élève.</Step>
            <Step label="Export">Téléchargez les résultats au format CSV pour les ouvrir dans Excel.</Step>
          </div>
          <Tip>
            L&apos;historique conserve les résultats des années précédentes. Vous pouvez comparer les performances d&apos;un élève d&apos;une année à l&apos;autre.
          </Tip>
        </Section>

        <Section id="parametres" title="Paramètres">
          <p>
            La page Paramètres est le centre de configuration de votre établissement.
            Elle est organisée en plusieurs onglets.
          </p>

          <div className="space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">Classes</div>
              <p>Gérez les classes : ajoutez, modifiez ou supprimez des classes.</p>
              <div className="space-y-1 mt-1">
                <Step label="Ajouter">Cliquez sur &quot;Nouvelle classe&quot;, donnez un nom (ex: CM1, 6ème A) et choisissez un niveau.</Step>
                <Step label="Détails">Cliquez sur une classe pour gérer les matières enseignées et les professeurs associés.</Step>
                <Step label="Supprimer">Utilisez l&apos;icône de corbeille pour supprimer une classe (attention : les données liées seront perdues).</Step>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">Compte</div>
              <p>Gérez votre compte utilisateur.</p>
              <div className="space-y-1 mt-1">
                <Step label="Nom">Modifiez votre nom complet.</Step>
                <Step label="Identifiant">Changez votre nom d&apos;utilisateur (utilisé pour vous connecter).</Step>
                <Step label="Mot de passe">Changez votre mot de passe en entrant d&apos;abord l&apos;ancien, puis le nouveau.</Step>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <div className="font-semibold text-foreground mb-1">École</div>
              <p>Modifiez les informations de votre établissement : nom, adresse, téléphone, email, logo.</p>
            </div>
          </div>
        </Section>

        <Section id="base-de-donnees" title="Base de données">
          <p>
            La page Base de données vous permet de gérer les sauvegardes et la maintenance de votre base de données.
          </p>
          <div className="space-y-2">
            <Step label="Statistiques">Consultez la taille de la base et le nombre d&apos;enregistrements par table.</Step>
            <Step label="Exporter">Téléchargez une copie complète de la base de données (fichier .db).</Step>
            <Step label="Importer">Restaurez une base de données à partir d&apos;un fichier .db précédemment exporté.</Step>
            <Step label="Vider">Supprimez toutes les données d&apos;une table (par exemple pour repartir à zéro sur une section).</Step>
          </div>
          <Tip>
            Faites régulièrement des sauvegardes ! Exportez votre base au moins une fois par semaine ou avant une opération importante.
          </Tip>
        </Section>

        <Section id="personnalisation" title="Personnalisation">
          <p>
            Personnalisez l&apos;apparence et le comportement de l&apos;application selon vos préférences.
          </p>
          <div className="space-y-2">
            <Step label="Thème">Choisissez entre le mode clair, le mode sombre ou le mode automatique (suit les préférences de votre appareil).</Step>
            <Step label="Langue">Sélectionnez la langue d&apos;affichage de l&apos;application.</Step>
            <Step label="Notifications">Activez ou désactivez les notifications sonores.</Step>
          </div>
          <Tip>
            Les modifications sont sauvegardées automatiquement et appliquées immédiatement.
          </Tip>
        </Section>
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <ArrowUp className="h-4 w-4 mr-2" />
          Retour en haut
        </Button>
      </div>
    </AppLayout>
  )
}
