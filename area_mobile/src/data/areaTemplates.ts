// src/data/areaTemplates.ts
import { AreaTemplate } from "../types";

/**
 * 18 AREAs logiques du sujet.
 * Les noms actionName / reactionName sont indicatifs :
 * on utilise simplement la première action / réaction de chaque service
 * côté frontend pour appeler POST /areas.
 */
export const AREA_TEMPLATES: AreaTemplate[] = [
  // ---------- THÈME 1 : Productivité & Dev ----------
  {
    id: "area1_github_discord_issue_assigned",
    title: "Issue assignée → message Discord",
    description:
      "Quand une issue m’est assignée sur GitHub, envoyer un message dans un salon Discord.",
    theme: "Thème 1 : Productivité & Dev",
    actionServiceSlug: "github",
    actionName: "issue_assigned",
    reactionServiceSlug: "discord",
    reactionName: "post_message",
    actionFields: [
      {
        name: "repository",
        label: "Dépôt GitHub",
        type: "text",
        placeholder: "ex : mon-org/mon-repo",
        helperText:
          "Pour l’instant on tape le nom du repo à la main (org/repo).",
      },
    ],
    reactionFields: [
      {
        name: "channel_id",
        label: "ID du salon Discord",
        type: "text",
        helperText:
          "Active le mode développeur sur Discord, clic droit sur le salon → Copier l’identifiant.",
      },
      {
        name: "message",
        label: "Message à envoyer",
        type: "text",
        placeholder: 'ex : "Une issue t’a été assignée sur GitHub !"',
      },
    ],
  },

  {
    id: "area2_github_gmail_push_main",
    title: 'Push sur "main" → email "Deployment Started"',
    description:
      'Quand un push arrive sur la branche "main", envoyer un email "Deployment Started".',
    theme: "Thème 1 : Productivité & Dev",
    actionServiceSlug: "github",
    actionName: "push_on_branch",
    reactionServiceSlug: "gmail",
    reactionName: "send_email",
    actionFields: [
      {
        name: "repository",
        label: "Dépôt GitHub",
        type: "text",
        placeholder: "ex : mon-org/mon-repo",
      },
      {
        name: "branch",
        label: "Branche à surveiller",
        type: "text",
        placeholder: "main",
      },
    ],
    reactionFields: [
      {
        name: "recipient",
        label: "Destinataire",
        type: "email",
        placeholder: "client@exemple.com",
      },
      {
        name: "subject",
        label: "Sujet",
        type: "text",
        placeholder: "Deployment Started",
      },
      {
        name: "body",
        label: "Contenu du mail",
        type: "textarea",
        placeholder: "Texte du mail envoyé au client / manager.",
      },
    ],
  },

  {
    id: "area3_discord_github_bug_command",
    title: "Commande !bug → création d’issue GitHub",
    description:
      "Quand un message commence par !bug sur Discord, créer une issue sur GitHub.",
    theme: "Thème 1 : Productivité & Dev",
    actionServiceSlug: "discord",
    actionName: "message_with_keyword",
    reactionServiceSlug: "github",
    reactionName: "create_issue",
    actionFields: [
      {
        name: "channel_id",
        label: "ID du salon Discord",
        type: "text",
        helperText: "Salon dans lequel la commande !bug sera tapée.",
      },
      {
        name: "keyword",
        label: "Mot-clé déclencheur",
        type: "text",
        placeholder: "!bug",
      },
    ],
    reactionFields: [
      {
        name: "repository",
        label: "Dépôt GitHub",
        type: "text",
        placeholder: "ex : mon-org/mon-repo",
      },
      {
        name: "title",
        label: "Titre de l’issue",
        type: "text",
        placeholder: "Bug remonté depuis Discord",
      },
      {
        name: "body",
        label: "Description",
        type: "textarea",
        placeholder: "Optionnel : description du bug.",
      },
    ],
  },

  {
    id: "area4_gmail_discord_critical_email",
    title: "Email critique → alerte Discord",
    description:
      "Quand je reçois un email d’une adresse précise, envoyer un message important dans un salon Discord.",
    theme: "Thème 1 : Productivité & Dev",
    actionServiceSlug: "gmail",
    actionName: "email_from",
    reactionServiceSlug: "discord",
    reactionName: "post_message",
    actionFields: [
      {
        name: "from_address",
        label: "Adresse email à surveiller",
        type: "email",
        placeholder: "boss@epitech.eu",
      },
    ],
    reactionFields: [
      {
        name: "channel_id",
        label: "ID du salon Discord",
        type: "text",
      },
      {
        name: "message",
        label: "Message d’alerte",
        type: "text",
        placeholder: "⚠ Mail important reçu !",
      },
    ],
  },

  // ---------- THÈME 2 : Ambiance & Lifestyle ----------
  {
    id: "area5_youtube_discord_liked_video",
    title: "Vidéo likée → message Discord",
    description:
      "Quand je like une vidéo sur YouTube, envoyer un message dans un salon Discord.",
    theme: "Thème 2 : Ambiance & Lifestyle",
    actionServiceSlug: "youtube",
    actionName: "new_liked_video",
    reactionServiceSlug: "discord",
    reactionName: "post_message",
    actionFields: [],
    reactionFields: [
      {
        name: "channel_id",
        label: "ID du salon Discord",
        type: "text",
      },
      {
        name: "message",
        label: "Message",
        type: "text",
        placeholder: "J'ai kiffé cette vidéo, regardez !",
      },
    ],
  },

  {
    id: "area6_youtube_gmail_new_video",
    title: "Nouvelle vidéo → email récap",
    description:
      "Quand un youtubeur sort une nouvelle vidéo, envoyer un mail récapitulatif.",
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
        helperText: "L'ID de la chaîne YouTube, commence par UC...",
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
        placeholder: "Détails sur l’vidéo...",
      },
    ],
  },

  {
    id: "area7_weather_youtube_mood_video",
    title: "Météo → vidéo adaptée",
    description:
      "En fonction de la météo (Rain / Clear / Clouds / Snow), ajouter une vidéo YouTube à une playlist.",
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
        name: "playlist_id",
        label: "ID de la playlist YouTube",
        type: "text",
        placeholder: "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
        helperText: "L'ID de votre playlist 'Ambiance'",
      },
      {
        name: "video_id",
        label: "ID de la vidéo",
        type: "text",
        placeholder: "jfKfPfyJRdk",
        helperText:
          "L'ID de la vidéo YouTube à ajouter selon la météo (ex: Lofi Girl).",
      },
    ],
  },

  {
    id: "area8_weather_gmail_temp_drop",
    title: "Chute de température → email “Prends un manteau !”",
    description:
      "Quand la température passe en dessous d’un certain seuil, envoyer un mail d’alerte.",
    theme: "Thème 2 : Ambiance & Lifestyle",
    actionServiceSlug: "weather",
    actionName: "temp_drop",
    reactionServiceSlug: "gmail",
    reactionName: "send_email",
    actionFields: [
      {
        name: "city",
        label: "Ville",
        type: "text",
      },
      {
        name: "threshold",
        label: "Seuil de température (°C)",
        type: "number",
        placeholder: "10",
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
        placeholder: "Prends un manteau !",
      },
      {
        name: "body",
        label: "Message",
        type: "textarea",
        placeholder: "Il fait froid, couvre-toi ❄️",
      },
    ],
  },

  {
    id: "area9_weather_discord_sunny",
    title: "Il fait beau → message Discord",
    description:
      "Quand la météo devient 'Clear/Sunny', envoyer un message sur Discord pour proposer une activité dehors.",
    theme: "Thème 2 : Ambiance & Lifestyle",
    actionServiceSlug: "weather",
    actionName: "condition_check",
    reactionServiceSlug: "discord",
    reactionName: "post_message",
    actionFields: [
      {
        name: "city",
        label: "Ville",
        type: "text",
      },
      {
        name: "condition",
        label: "Condition météo",
        type: "select",
        options: [
          { label: "Clear", value: "Clear" },
          { label: "Clouds", value: "Clouds" },
          { label: "Rain", value: "Rain" },
        ],
      },
    ],
    reactionFields: [
      {
        name: "channel_id",
        label: "ID du salon Discord",
        type: "text",
      },
      {
        name: "message",
        label: "Message",
        type: "text",
        placeholder: "Il fait super beau, on sort ? ☀️",
      },
    ],
  },

  // ---------- THÈME 3 : Automatisation Temporelle (Timer) ----------
  {
    id: "area10_timer_discord_daily",
    title: "Rappel quotidien sur Discord",
    description:
      "Tous les jours à une heure donnée, envoyer un message de rappel dans un salon Discord.",
    theme: "Thème 3 : Automatisation Temporelle",
    actionServiceSlug: "timer",
    actionName: "daily_cron",
    reactionServiceSlug: "discord",
    reactionName: "post_message",
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
        name: "channel_id",
        label: "ID du salon Discord",
        type: "text",
      },
      {
        name: "message",
        label: "Message",
        type: "text",
        placeholder: "Daily stand-up dans 5 minutes !",
      },
    ],
  },

  {
    id: "area11_timer_github_monthly_issue",
    title: "Tâche mensuelle → issue GitHub",
    description:
      "Chaque mois à une date donnée, créer une issue sur GitHub (ex : récap mensuel).",
    theme: "Thème 3 : Automatisation Temporelle",
    actionServiceSlug: "timer",
    actionName: "monthly_cron",
    reactionServiceSlug: "github",
    reactionName: "create_issue",
    actionFields: [
      {
        name: "day",
        label: "Jour du mois",
        type: "number",
        placeholder: "1-31",
      },
      {
        name: "time",
        label: "Heure",
        type: "time",
        placeholder: "09:00",
      },
    ],
    reactionFields: [
      {
        name: "repository",
        label: "Dépôt GitHub",
        type: "text",
      },
      {
        name: "title",
        label: "Titre de l’issue",
        type: "text",
        placeholder: "Récap mensuel",
      },
      {
        name: "body",
        label: "Description",
        type: "textarea",
        placeholder: "Checklist des choses à faire ce mois-ci.",
      },
    ],
  },

  {
    id: "area12_timer_gmail_weekly",
    title: "Mail hebdomadaire (vendredi 18h, par ex.)",
    description:
      "Toutes les semaines à un jour/heure donnée, envoyer un mail.",
    theme: "Thème 3 : Automatisation Temporelle",
    actionServiceSlug: "timer",
    actionName: "weekly_cron",
    reactionServiceSlug: "gmail",
    reactionName: "send_email",
    actionFields: [
      {
        name: "day",
        label: "Jour de la semaine",
        type: "select",
        options: [
          { label: "Lundi", value: "Mon" },
          { label: "Mardi", value: "Tue" },
          { label: "Mercredi", value: "Wed" },
          { label: "Jeudi", value: "Thu" },
          { label: "Vendredi", value: "Fri" },
          { label: "Samedi", value: "Sat" },
          { label: "Dimanche", value: "Sun" },
        ],
      },
      {
        name: "time",
        label: "Heure",
        type: "time",
        placeholder: "18:00",
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
      },
      {
        name: "body",
        label: "Corps du mail",
        type: "textarea",
      },
    ],
  },

  {
    id: "area13_timer_youtube_morning_video",
    title: "Vidéo du matin",
    description:
      "Tous les matins à 8h, ajouter une vidéo à une playlist YouTube (ex: JT France 24).",
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
        name: "playlist_id",
        label: "ID de la playlist YouTube",
        type: "text",
        placeholder: "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
        helperText: "L'ID de votre playlist 'À regarder plus tard'",
      },
      {
        name: "video_id",
        label: "ID de la vidéo",
        type: "text",
        placeholder: "dQw4w9WgXcQ",
        helperText: "L'ID de la vidéo à ajouter (ex: JT France 24)",
      },
    ],
  },

  // ---------- THÈME 4 : Cross-Platform avancé ----------
  {
    id: "area14_github_youtube_pr_video",
    title: "Nouvelle PR → vidéo de victoire",
    description:
      "Quand une Pull Request est créée sur GitHub, ajouter une vidéo de victoire à une playlist YouTube.",
    theme: "Thème 4 : Cross-Platform avancé",
    actionServiceSlug: "github",
    actionName: "pr_created",
    reactionServiceSlug: "youtube",
    reactionName: "add_video_to_playlist",
    actionFields: [
      {
        name: "repository",
        label: "Dépôt GitHub",
        type: "text",
        placeholder: "owner/repo",
      },
    ],
    reactionFields: [
      {
        name: "video_id",
        label: "ID de la vidéo de victoire",
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
  },

  {
    id: "area15_gmail_github_bug_report",
    title: 'Sujet "Bug Report" → issue GitHub',
    description:
      'Quand le sujet d’un email contient "Bug Report", créer une issue sur GitHub.',
    theme: "Thème 4 : Cross-Platform avancé",
    actionServiceSlug: "gmail",
    actionName: "subject_match",
    reactionServiceSlug: "github",
    reactionName: "create_issue",
    actionFields: [
      {
        name: "keyword",
        label: "Mot-clé dans le sujet",
        type: "text",
        placeholder: "Bug Report",
      },
    ],
    reactionFields: [
      {
        name: "repository",
        label: "Dépôt GitHub",
        type: "text",
      },
      {
        name: "title",
        label: "Titre de l’issue",
        type: "text",
        placeholder: "Bug signalé par email",
      },
    ],
  },

  {
    id: "area16_discord_youtube_link_to_playlist",
    title: "Lien YouTube → ajout à une playlist",
    description:
      "Quand un message contient un lien YouTube sur Discord, ajouter la vidéo à une playlist.",
    theme: "Thème 4 : Cross-Platform avancé",
    actionServiceSlug: "discord",
    actionName: "link_posted",
    reactionServiceSlug: "youtube",
    reactionName: "add_video_to_playlist",
    actionFields: [
      {
        name: "channel_id",
        label: "ID du salon Discord",
        type: "text",
        placeholder: "Collez l'ID du salon ici...",
      },
    ],
    reactionFields: [
      {
        name: "playlist_id",
        label: "ID de la playlist YouTube",
        type: "text",
        placeholder: "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
        helperText:
          "L'ID de la playlist cible.",
      },
      {
        name: "video_id",
        label: "ID de la vidéo",
        type: "text",
        placeholder: "dQw4w9WgXcQ",
        helperText:
          "L'ID de la vidéo sera extrait du lien Discord, ou saisi manuellement.",
      },
    ],
  },

  {
    id: "area17_discord_gmail_announcement",
    title: "Annonce Discord → email à l’équipe",
    description:
      "Quand un message qui contient un mot-clé est posté dans un salon, envoyer un email à l’équipe.",
    theme: "Thème 4 : Cross-Platform avancé",
    actionServiceSlug: "discord",
    actionName: "message_keyword",
    reactionServiceSlug: "gmail",
    reactionName: "send_email",
    actionFields: [
      {
        name: "channel_id",
        label: "ID du salon Discord",
        type: "text",
      },
      {
        name: "keyword",
        label: "Mot-clé",
        type: "text",
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
        placeholder: "Annonce Discord",
      },
      {
        name: "body",
        label: "Corps du mail",
        type: "textarea",
      },
    ],
  },

  {
    id: "area18_youtube_github_playlist_issue",
    title: "Nouvelle vidéo postée → issue GitHub",
    description:
      'Quand une nouvelle vidéo est postée sur ta chaîne YouTube, créer une issue "Faire la promo de la nouvelle vidéo" sur GitHub.',
    theme: "Thème 4 : Cross-Platform avancé",
    actionServiceSlug: "youtube",
    actionName: "new_video_posted_by_channel",
    reactionServiceSlug: "github",
    reactionName: "create_issue",
    actionFields: [
      {
        name: "channel_id",
        label: "ID de ta chaîne YouTube",
        type: "text",
        placeholder: "UCxxxxxxxxxxxxxx",
        helperText: "Ton ID de chaîne YouTube (commence par UC...)",
      },
    ],
    reactionFields: [
      {
        name: "repository",
        label: "Dépôt GitHub",
        type: "text",
        placeholder: "owner/repo",
      },
      {
        name: "title",
        label: "Titre de l'issue",
        type: "text",
        placeholder: "Faire la promo de la nouvelle vidéo",
      },
    ],
  },
];
