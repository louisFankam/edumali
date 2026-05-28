export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Ekima API",
    version: "1.0.0",
    description: "API de gestion scolaire Ekima — élèves, classes, matières, paramètres",
  },
  servers: [{ url: "/", description: "Local" }],
  paths: {
    "/api/students": {
      get: {
        tags: ["Élèves"],
        summary: "Liste des élèves",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Recherche par nom/prénom/parent" },
          { name: "classId", in: "query", schema: { type: "string" }, description: "Filtrer par classe" },
          { name: "stats", in: "query", schema: { type: "string", enum: ["true"] }, description: "Retourner les stats (total/filles/garçons)" },
        ],
        responses: { "200": { description: "Liste des élèves ou statistiques" } },
      },
      post: {
        tags: ["Élèves"],
        summary: "Créer un élève",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateStudent" } } },
        },
        responses: { "201": { description: "Élève créé" } },
      },
    },
    "/api/students/{id}": {
      get: {
        tags: ["Élèves"],
        summary: "Détail d'un élève",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Élève trouvé" }, "404": { description: "Non trouvé" } },
      },
      put: {
        tags: ["Élèves"],
        summary: "Modifier un élève",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateStudent" } } } },
        responses: { "200": { description: "Élève modifié" } },
      },
      delete: {
        tags: ["Élèves"],
        summary: "Supprimer un élève",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Supprimé" } },
      },
    },
    "/api/classes": {
      get: {
        tags: ["Classes"],
        summary: "Liste des classes",
        responses: { "200": { description: "Liste des classes" } },
      },
    },
    "/api/settings/school": {
      get: {
        tags: ["Paramètres"],
        summary: "Infos de l'école",
        responses: { "200": { description: "Informations de l'école" } },
      },
      put: {
        tags: ["Paramètres"],
        summary: "Modifier les infos de l'école",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SchoolInfo" } } } },
        responses: { "200": { description: "École mise à jour" } },
      },
    },
    "/api/academic-years": {
      get: {
        tags: ["Paramètres"],
        summary: "Liste des années scolaires",
        parameters: [{ name: "current", in: "query", schema: { type: "string", enum: ["true"] }, description: "Année en cours uniquement" }],
        responses: { "200": { description: "Liste des années" } },
      },
      post: {
        tags: ["Paramètres"],
        summary: "Créer une année scolaire",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateAcademicYear" } } } },
        responses: { "201": { description: "Année créée" } },
      },
    },
    "/api/academic-years/{id}": {
      put: {
        tags: ["Paramètres"],
        summary: "Modifier une année scolaire",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Année modifiée" } },
      },
      delete: {
        tags: ["Paramètres"],
        summary: "Supprimer une année scolaire",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Supprimée" } },
      },
    },
    "/api/subjects": {
      get: {
        tags: ["Paramètres"],
        summary: "Liste des matières",
        responses: { "200": { description: "Liste des matières" } },
      },
      post: {
        tags: ["Paramètres"],
        summary: "Créer une matière",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateSubject" } } } },
        responses: { "201": { description: "Matière créée" } },
      },
    },
    "/api/subjects/{id}": {
      put: {
        tags: ["Paramètres"],
        summary: "Modifier une matière",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Matière modifiée" } },
      },
      delete: {
        tags: ["Paramètres"],
        summary: "Supprimer une matière",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Supprimée" } },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Connexion",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Login" } } } },
        responses: { "200": { description: "Connecté" }, "401": { description: "Identifiants incorrects" } },
      },
    },
    "/api/auth/session": {
      get: {
        tags: ["Auth"],
        summary: "Vérifier la session",
        responses: { "200": { description: "Session valide" } },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Déconnexion",
        responses: { "200": { description: "Déconnecté" } },
      },
    },
  },
  components: {
    schemas: {
      CreateStudent: {
        type: "object",
        required: ["firstName", "lastName", "gender", "birthDate", "parentName", "parentPhone", "classId"],
        properties: {
          firstName: { type: "string", example: "Amadou" },
          lastName: { type: "string", example: "Diallo" },
          gender: { type: "string", enum: ["Masculin", "Féminin"] },
          birthDate: { type: "string", format: "date", example: "2015-05-12" },
          nationality: { type: "string", example: "Malienne" },
          parentName: { type: "string", example: "Moussa Diallo" },
          parentPhone: { type: "string", example: "70123456" },
          classId: { type: "string", example: "1" },
        },
      },
      UpdateStudent: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          gender: { type: "string", enum: ["Masculin", "Féminin"] },
          parentName: { type: "string" },
          status: { type: "string", enum: ["Actif", "Inactif"] },
        },
      },
      SchoolInfo: {
        type: "object",
        properties: {
          name: { type: "string", example: "Mon École" },
          address: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", format: "email" },
          director: { type: "string" },
          foundedYear: { type: "integer" },
        },
      },
      CreateAcademicYear: {
        type: "object",
        required: ["name", "startDate", "endDate"],
        properties: {
          name: { type: "string", example: "2026-2027" },
          startDate: { type: "string", format: "date", example: "2026-09-01" },
          endDate: { type: "string", format: "date", example: "2027-08-31" },
          isCurrent: { type: "boolean", default: false },
        },
      },
      CreateSubject: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Mathématiques" },
          code: { type: "string", example: "MA" },
          coefficient: { type: "integer", example: 4 },
          hoursPerWeek: { type: "integer", example: 6 },
          color: { type: "string", example: "#3b82f6" },
        },
      },
      Login: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@ekima.ml" },
          password: { type: "string", format: "password", example: "admin12345" },
          rememberMe: { type: "boolean", default: false },
        },
      },
    },
  },
};
