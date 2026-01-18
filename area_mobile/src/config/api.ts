// ⚠️ Configuration de l'URL du backend
// 
// Pour l'APK en production, utilisez :
// - Une URL publique (ex: https://votre-api.com)
// - Ngrok/Cloudflare Tunnel pour exposer votre serveur local
// - Un serveur déployé (Heroku, Railway, DigitalOcean, etc.)
//
// Pour le développement local :
// - Émulateur Android : "http://10.0.2.2:8080"
// - Émulateur iOS : "http://localhost:8080"
// - Tunnel Expo : L'URL fournie par le tunnel
//
// ⚠️ IMPORTANT : Remplacez par votre URL de production avant de build l'APK
export const API_BASE_URL = __DEV__ 
  ? "http://192.168.1.162:8080"  // Dev : IP locale ou tunnel
  : "https://votre-api-production.com"; // Production : URL publique

// Alternative : Utiliser une variable d'environnement
// export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.3:8080";
