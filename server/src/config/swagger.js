const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AREA API Documentation',
      version: '1.3.0', // Mise à jour de version
      description: 'API officielle pour le projet AREA (G-DEV-500).',
    },
    servers: [
      { url: 'http://localhost:8080', description: 'Serveur Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],

    tags: [
      { name: 'Auth', description: 'Gestion complète du compte utilisateur' },
      { name: 'Services', description: 'Catalogue des services & Statuts' },
      { name: 'OAuth', description: 'Connexion aux services tiers (GitHub, Google, Discord...)' },
      { name: 'Areas', description: 'Création et gestion des automatisations' }
    ],

    paths: {
      '/auth/register': {

        post: {

          summary: 'Inscrire un nouvel utilisateur',

          tags: ['Auth'],

          security: [], // Public

          requestBody: {

            required: true,

            content: {

              'application/json': {

                schema: {

                  type: 'object',

                  properties: {

                    email: { type: 'string', example: 'area35174@gmail.com' },

                    password: { type: 'string', example: 'tonPassword123!' },

                    username: { type: 'string', example: 'TestUser' }

                  }

                }

              }

            },

          },

          responses: {

            201: { description: 'Utilisateur créé avec succès' },

            400: { description: 'Données invalides' }

          }

        }

      },

      '/auth/login': {

        post: {

          summary: 'Se connecter',

          tags: ['Auth'],

          security: [], // Public

          requestBody: {

            required: true,

            content: {

              'application/json': {

                schema: {

                  type: 'object',

                  properties: {

                    email: { type: 'string', example: 'area35174@gmail.com' },

                    password: { type: 'string', example: 'tonPassword123!' }

                  }

                }

              }

            },

          },

          responses: {

            200: { description: 'Succès - Retourne le Token JWT' },

            401: { description: 'Identifiants incorrects' }

          }

        }

      },


      '/auth/forgot-password': {

        post: {

          summary: 'Mot de passe oublié (Demander Email)',

          description: "Envoie un email contenant un lien magique pour réinitialiser le mot de passe.",

          tags: ['Auth'],

          security: [], // Public

          requestBody: {

            required: true,

            content: {

              'application/json': {

                schema: {

                  type: 'object',

                  properties: {

                    email: { type: 'string', example: 'user@example.com' }

                  }

                }

              }

            }

          },

          responses: {

            200: { description: 'Email envoyé (si le compte existe)' },

            400: { description: 'Email manquant' }

          }

        }

      },


      '/auth/reset-password': {

        post: {

          summary: 'Définir le nouveau mot de passe',

          description: "Utiliser le Token reçu dans l'URL (après clic mail) pour définir un nouveau mot de passe.",

          tags: ['Auth'],

          security: [{ bearerAuth: [] }], // Token requis (celui de l'URL)

          requestBody: {

            required: true,

            content: {

              'application/json': {

                schema: {

                  type: 'object',

                  properties: {

                    new_password: { type: 'string', example: 'NouveauSuperPass99!' }

                  }

                }

              }

            }

          },

          responses: {

            200: { description: 'Mot de passe mis à jour avec succès' },

            401: { description: 'Token invalide ou expiré' }

          }

        }

      },


      '/auth/user': {

        put: {

          summary: 'Mettre à jour le profil',

          description: "Permet de changer l'email, le mot de passe ou le nom d'utilisateur.",

          tags: ['Auth'],

          security: [{ bearerAuth: [] }],

          requestBody: {

            required: true,

            content: {

              'application/json': {

                schema: {

                  type: 'object',

                  properties: {

                    email: { type: 'string', example: 'new_email@example.com' },

                    password: { type: 'string', example: 'NewPass123' },

                    data: {

                      type: 'object',

                      properties: {

                        username: { type: 'string', example: 'NouveauPseudo' }

                      }

                    }

                  }

                }

              }

            }

          },

          responses: {

            200: { description: 'Profil mis à jour' },

            401: { description: 'Non autorisé' }

          }

        },

        delete: {

          summary: 'Supprimer mon compte',

          description: "Supprime définitivement l'utilisateur et toutes ses AREAs.",

          tags: ['Auth'],

          security: [{ bearerAuth: [] }],

          responses: {

            200: { description: 'Compte supprimé définitivement' },

            401: { description: 'Non autorisé' }

          }

        }

      },


      // ============================================================
      // 🧩 CATALOGUE SERVICES
      // ============================================================
      '/services': {
        get: {
          summary: 'Récupérer la liste des services disponibles',
          description: 'Retourne le catalogue complet pour générer l\'interface Drag & Drop.',
          tags: ['Services'],
          responses: {
            200: { description: 'Succès' }
          }
        }
      },

      '/services/my-connections': {
        get: {
          summary: 'Vérifier l\'état des connexions aux services',
          description: 'Renvoie true/false pour chaque service.',
          tags: ['Services'],
          parameters: [
            {
              in: 'query',
              name: 'userId',
              required: true,
              schema: { type: 'string' },
              description: 'UUID de l\'utilisateur'
            }
          ],
          responses: {
            200: {
              description: 'Succès',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    example: { "github": true, "discord": true, "google": true, "youtube": true }
                  }
                }
              }
            }
          }
        }
      },

      '/services/{provider}': {
        delete: {
          summary: 'Déconnecter un service (Supprimer le token)',
          description: 'Supprime le token OAuth de la base de données. Utile pour changer de compte ou reset les permissions (Scopes).',
          tags: ['Services'],
          parameters: [
            {
              in: 'path',
              name: 'provider',
              required: true,
              schema: { type: 'string', enum: ['google', 'github', 'discord', 'spotify'] },
              description: 'Nom du service (ex: google)'
            },
            {
              in: 'query', // On le met en query pour faciliter le test via Swagger UI
              name: 'userId',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID de l\'utilisateur'
            }
          ],
          responses: {
            200: { description: 'Déconnexion réussie' },
            404: { description: 'Aucun token trouvé pour ce service' },
            400: { description: 'Paramètres manquants' }
          }
        }
      },

      // ============================================================
      // 🔗 OAUTH CONNECTIONS
      // ============================================================

      // --- GITHUB ---
      '/services/github/connect': {
        get: {
          summary: 'Démarrer la connexion GitHub',
          tags: ['OAuth'],
          security: [],
          parameters: [
            { in: 'query', name: 'userId', required: true, schema: { type: 'string' } },
            { in: 'query', name: 'redirect', schema: { type: 'string', enum: ['web', 'mobile'] } }
          ],
          responses: { 302: { description: 'Redirection vers GitHub' } }
        }
      },

      '/services/github/callback': {
        get: {
          summary: 'Callback GitHub (Interne)',
          tags: ['OAuth'],
          security: [],
          responses: { 302: { description: 'Redirection vers le Dashboard' } }
        }
      },

      // --- DISCORD ---
      '/services/discord/connect': {
        get: {
          summary: 'Démarrer la connexion Discord',
          tags: ['OAuth'],
          security: [],
          parameters: [
            { in: 'query', name: 'userId', required: true, schema: { type: 'string' } },
            { in: 'query', name: 'redirect', schema: { type: 'string' } }
          ],
          responses: { 302: { description: 'Redirection vers Discord' } }
        }
      },

      '/services/discord/callback': {
        get: {
          summary: 'Callback Discord (Interne)',
          tags: ['OAuth'],
          security: [],
          responses: { 302: { description: 'Redirection vers le Dashboard' } }
        }
      },

      '/services/discord/invite-bot': {
        get: {
          summary: 'Inviter le Bot Discord sur un serveur',
          description: "Redirige vers l'URL officielle Discord pour ajouter le bot à un serveur (scope=bot).",
          tags: ['OAuth'],
          security: [],
          parameters: [
            {
              in: 'query',
              name: 'userId',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: "UUID de l'utilisateur qui invite le bot"
            },
            {
              in: 'query',
              name: 'redirect',
              schema: { type: 'string', enum: ['web', 'mobile'] },
              description: "Redirection après l'ajout (défaut: web)"
            }
          ],
          responses: {
            302: { description: 'Redirection vers Discord Authorization' },
            400: { description: 'User ID manquant' }
          }
        }
      },

      // --- GOOGLE (Gmail) ---
      '/services/google/connect': {
        get: {
          summary: 'Démarrer la connexion Google / Gmail',
          tags: ['OAuth'],
          security: [],
          parameters: [
            { in: 'query', name: 'userId', required: true, schema: { type: 'string' } },
            { in: 'query', name: 'redirect', schema: { type: 'string' } }
          ],
          responses: { 302: { description: 'Redirection vers Google' } }
        }
      },

      '/services/google/callback': {
        get: {
          summary: 'Callback Google (Interne)',
          tags: ['OAuth'],
          security: [],
          responses: { 302: { description: 'Redirection vers le Dashboard' } }
        }
      },

      // --- YOUTUBE ---
      '/services/youtube/connect': {
        get: {
          summary: 'Démarrer la connexion YouTube',
          description: "Redirige vers la connexion Google avec les permissions YouTube.",
          tags: ['OAuth'],
          security: [],
          parameters: [
            { in: 'query', name: 'userId', required: true, schema: { type: 'string' } },
            { in: 'query', name: 'redirect', schema: { type: 'string' } }
          ],
          responses: { 302: { description: 'Redirection vers Google' } }
        }
      },

      // ============================================================
      // ⚡ AREAS (AUTOMATISATIONS)
      // ============================================================
      '/areas': {
        post: {
          summary: 'Créer une nouvelle AREA',
          tags: ['Areas'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    action_id: { type: 'integer', example: 1 },
                    reaction_id: { type: 'integer', example: 2 },
                    action_params: { type: 'object' },
                    reaction_params: { type: 'object' },
                    name: { type: 'string', example: 'Mon Super AREA' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'AREA créée' },
            400: { description: 'Erreur paramètres' }
          }
        },
        get: {
          summary: 'Lister mes AREAs',
          tags: ['Areas'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Liste récupérée' }
          }
        }
      },
      '/areas/{id}': {
        put: {
          summary: 'Modifier une AREA existante',
          tags: ['Areas'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              // 👇 C'EST ICI QU'ON CHANGE
              schema: { 
                type: 'string', 
                format: 'uuid' // (Optionnel) Précise que c'est un UUID
              },
              description: 'UUID de l\'AREA à modifier'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    is_active: { type: 'boolean' },
                    action_params: { type: 'object' },
                    reaction_params: { type: 'object' },
                    name: { type: 'string', example: 'Nom mis à jour de mon AREA' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Area mise à jour' },
            404: { description: 'Area introuvable' }
          }
        },
        delete: {
          summary: 'Supprimer une AREA',
          tags: ['Areas'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              // 👇 PAREIL ICI
              schema: { 
                type: 'string', 
                format: 'uuid' 
              },
              description: 'UUID de l\'AREA à supprimer'
            }
          ],
          responses: {
            200: { description: 'Area supprimée' },
            404: { description: 'Area introuvable' }
          }
        }
      }
    }
  },
  // IMPORTANT : Si tu utilises les commentaires JSDoc dans tes routes,
  // décommente cette ligne :
  // apis: ['./src/routes/*.js'], 
  apis: [],
};

const specs = swaggerJsdoc(options);
module.exports = specs;