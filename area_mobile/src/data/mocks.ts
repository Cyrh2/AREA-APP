import { Area, Service, ActivityItem } from "../types";

export const MOCK_AREAS: Area[] = [
  {
    id: "1",
    name: "Notif email important",
    description: "Quand je reçois un email marqué important → m’envoyer une notif.",
    services: ["gmail", "discord"],
    active: true,
    favorite: true,
    lastRun: "il y a 5 min",
  },
  {
    id: "2",
    name: "Météo du matin",
    description: "Tous les matins → envoyer la météo sur Discord.",
    services: ["weather", "discord"],
    active: true,
    favorite: false,
    lastRun: "il y a 2 h",
  },
  {
    id: "3",
    name: "Backup GitHub",
    description: "Nouveau commit sur GitHub → créer une tâche.",
    services: ["github", "drive"],
    active: false,
    favorite: true,
    lastRun: "hier",
  },
];

export const MOCK_SERVICES: Service[] = [
  { id: "gmail", name: "Gmail", connected: true },
  { id: "discord", name: "Discord", connected: true },
  { id: "github", name: "GitHub", connected: false },
  { id: "weather", name: "Weather", connected: true },
  { id: "drive", name: "Google Drive", connected: false },
];

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    type: "success",
    message: "AREA “Notif email important” exécuté avec succès.",
    timeAgo: "il y a 5 min",
  },
  {
    id: "a2",
    type: "error",
    message: "AREA “Météo du matin” a échoué (clé API invalide).",
    timeAgo: "il y a 30 min",
  },
  {
    id: "a3",
    type: "success",
    message: "AREA “Backup GitHub” exécuté.",
    timeAgo: "hier",
  },
];
