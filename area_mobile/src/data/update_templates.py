#!/usr/bin/env python3
"""Script pour remplacer les templates Spotify par YouTube"""

import re

# Lire le fichier
with open('areaTemplates.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# AREA 6 - Nouvel artiste → Nouvelle vidéo
content = content.replace(
    '''  {
    id: "area6_spotify_gmail_new_artist",
    title: "Nouvel artiste suivi → email récap",
    description:
      "Quand je suis un nouvel artiste sur Spotify, envoyer un mail récapitulatif.",
    theme: "Thème 2 : Ambiance & Lifestyle",
    actionServiceSlug: "spotify",
    actionName: "new_artist_followed",
    reactionServiceSlug: "gmail",
    reactionName: "send_email",
    actionFields: [],
    reactionFields: [
      {
        name: "recipient",
        label: "Destinataire",
        type: "email",
      },
      {
        name: "subject",
        label: "Sujet",
        type: "text",
        placeholder: "Nouvel artiste suivi sur Spotify",
      },
      {
        name: "body",
        label: "Corps du mail",
        type: "textarea",
        placeholder: "Détails sur l'artiste suivi / la musique...",
      },
    ],
  },''',
    '''  {
    id: "area6_youtube_gmail_new_video",
    title: "Nouvelle vidéo → email récap",
    description:
      "Quand un youtubeur sort une vidéo, envoyer un mail récapitulatif.",
    theme: "Thème 2 : Ambiance & Lifestyle",
    actionServiceSlug: "youtube",
    actionName: "new_video_by_channel",
    reactionServiceSlug: "gmail",
    reactionName: "send_email",
    actionFields: [
      {
        name: "channel_id",
        label: "ID de la chaîne YouTube",
        type: "text",
        placeholder: "UC-lHJZR3Gqxm24_Vd_AJ5Yw",
      },
    ],
    reactionFields: [
      {
        name: "recipient",
        label: "Destinataire",
        type: "email",
      },
      {
        name: "subject",
        label: "Sujet",
        type: "text",
        placeholder: "Nouvelle vidéo disponible !",
      },
      {
        name: "body",
        label: "Corps du mail",
        type: "textarea",
        placeholder: "Détails sur la vidéo...",
      },
    ],
  },'''
)

# AREA 7 - Météo → playlist/vidéo adaptée
content = content.replace(
    '''  {
    id: "area7_weather_spotify_mood_playlist",
    title: "Météo → playlist adaptée",
    description:
      "En fonction de la météo (Rain / Clear / Clouds / Snow), lancer une playlist Spotify adaptée.",
    theme: "Thème 2 : Ambiance & Lifestyle",
    actionServiceSlug: "weather",
    actionName: "condition_check",
    reactionServiceSlug: "spotify",
    reactionName: "start_playlist",
    actionFields: [
      {
        name: "city",
        label: "Ville",
        type: "text",
        placeholder: "Cotonou",
      },
      {
        name: "condition",
        label: "Condition météo",
        type: "select",
        options: [
          { label: "Rain", value: "Rain" },
          { label: "Clear", value: "Clear" },
          { label: "Clouds", value: "Clouds" },
          { label: "Snow", value: "Snow" },
        ],
      },
    ],
    reactionFields: [
      {
        name: "track_uri",
        label: "URI de la playlist / piste",
        type: "text",
        placeholder: "spotify:playlist:...",
        helperText:
          "Colle l'URI Spotify de la playlist à lancer selon la météo.",
      },
    ],
  },''',
    '''  {
    id: "area7_weather_youtube_mood_video",
    title: "Météo → vidéo adaptée",
    description:
      "En fonction de la météo (Rain / Clear / Clouds / Snow), ajouter une vidéo YouTube à une playlist adaptée.",
    theme: "Thème 2 : Ambiance & Lifestyle",
    actionServiceSlug: "weather",
    actionName: "condition_check",
    reactionServiceSlug: "youtube",
    reactionName: "add_video_to_playlist",
    actionFields: [
      {
        name: "city",
        label: "Ville",
        type: "text",
        placeholder: "Cotonou",
      },
      {
        name: "condition",
        label: "Condition météo",
        type: "select",
        options: [
          { label: "Rain", value: "Rain" },
          { label: "Clear", value: "Clear" },
          { label: "Clouds", value: "Clouds" },
          { label: "Snow", value: "Snow" },
        ],
      },
    ],
    reactionFields: [
      {
        name: "video_id",
        label: "ID de la vidéo",
        type: "text",
        placeholder: "dQw4w9WgXcQ",
      },
      {
        name: "playlist_id",
        label: "ID de la playlist YouTube",
        type: "text",
        placeholder: "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
      },
    ],
  },'''
)

# AREA 13 - Musique/Vidéo du matin
content = content.replace(
    '''  {
    id: "area13_timer_spotify_morning_music",
    title: "Musique du matin",
    description:
      "Tous les matins à 8h, ajouter une musique ou playlist à la file d'attente Spotify.",
    theme: "Thème 3 : Automatisation Temporelle",
    actionServiceSlug: "timer",
    actionName: "daily_cron",
    reactionServiceSlug: "spotify",
    reactionName: "add_to_queue",
    actionFields: [
      {
        name: "time",
        label: "Heure",
        type: "time",
        placeholder: "08:00",
      },
    ],
    reactionFields: [
      {
        name: "track_uri",
        label: "URI Spotify",
        type: "text",
        placeholder: "spotify:track:...",
      },
    ],
  },''',
    '''  {
    id: "area13_timer_youtube_morning_video",
    title: "Vidéo du matin",
    description:
      "Tous les matins à 8h, ajouter une vidéo à une playlist YouTube.",
    theme: "Thème 3 : Automatisation Temporelle",
    actionServiceSlug: "timer",
    actionName: "daily_cron",
    reactionServiceSlug: "youtube",
    reactionName: "add_video_to_playlist",
    actionFields: [
      {
        name: "time",
        label: "Heure",
        type: "time",
        placeholder: "08:00",
      },
    ],
    reactionFields: [
      {
        name: "video_id",
        label: "ID de la vidéo",
        type: "text",
        placeholder: "dQw4w9WgXcQ",
      },
      {
        name: "playlist_id",
        label: "ID de la playlist YouTube",
        type: "text",
        placeholder: "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
      },
    ],
  },'''
)

# AREA 16 - Retirer track_uri
content = content.replace(
    '''    reactionFields: [
      {
        name: "playlist_id",
        label: "ID de la playlist YouTube",
        type: "text",
        placeholder: "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
        helperText:
          "ID ou URI de la playlist cible (pour l'instant saisie manuelle).",
      },
      {
        name: "track_uri",
        label: "URI du titre",
        type: "text",
      },
    ],
  },''',
    '''    reactionFields: [
      {
        name: "playlist_id",
        label: "ID de la playlist YouTube",
        type: "text",
        placeholder: "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
        helperText:
          "ID ou URI de la playlist cible (pour l'instant saisie manuelle).",
      },
    ],
  },'''
)

# AREA 18 - Nouvelle playlist → issue GitHub
content = content.replace(
    '''  {
    id: "area18_spotify_github_playlist_issue",
    title: "Nouvelle playlist → issue GitHub",
    description:
      'Quand une nouvelle playlist est créée sur Spotify, créer une issue "Update project music vibe" sur GitHub.',
    theme: "Thème 4 : Cross-Platform avancé",
    actionServiceSlug: "spotify",
    actionName: "playlist_created",
    reactionServiceSlug: "github",
    reactionName: "create_issue",
    actionFields: [],
    reactionFields: [
      {
        name: "repository",
        label: "Dépôt GitHub",
        type: "text",
      },
      {
        name: "title",
        label: "Titre de l'issue",
        type: "text",
        placeholder: "Update project music vibe",
      },
    ],
  },''',
    '''  {
    id: "area18_youtube_github_playlist_issue",
    title: "Nouvelle playlist → issue GitHub",
    description:
      'Quand une nouvelle playlist est créée sur YouTube, créer une issue "Update project video collection" sur GitHub.',
    theme: "Thème 4 : Cross-Platform avancé",
    actionServiceSlug: "youtube",
    actionName: "playlist_created",
    reactionServiceSlug: "github",
    reactionName: "create_issue",
    actionFields: [],
    reactionFields: [
      {
        name: "repository",
        label: "Dépôt GitHub",
        type: "text",
      },
      {
        name: "title",
        label: "Titre de l'issue",
        type: "text",
        placeholder: "Update project video collection",
      },
    ],
  },'''
)

# Écrire le fichier modifié
with open('areaTemplates.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Modifications effectuées avec succès!")
print("- AREA 6: Spotify → YouTube (nouvel artiste → nouvelle vidéo)")
print("- AREA 7: Spotify → YouTube (météo → vidéo)")
print("- AREA 13: Spotify → YouTube (musique matin → vidéo matin)")
print("- AREA 16: Retrait du champ track_uri")
print("- AREA 18: Spotify → YouTube (playlist → video collection)")

