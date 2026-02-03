// Configuration Mapbox
// Note: Les tokens publics Mapbox (commençant par "pk.") peuvent être stockés en toute sécurité côté client
// Pour obtenir votre token: https://account.mapbox.com/

export const MAPBOX_CONFIG = {
  // Token public Mapbox configuré
  accessToken: 'pk.eyJ1Ijoib2thdGVjaCIsImEiOiJjbWhweXp5NG0wYzE1MmtyNHVsdDc0cXdzIn0.Uka_hUGnqJw9no7swQ8xVg',
  
  // Style de carte par défaut
  mapStyle: 'mapbox://styles/mapbox/light-v11',
  
  // Centre par défaut (Gabon)
  defaultCenter: [9.4673, 0.4162] as [number, number],
  defaultZoom: 2,
};

// Instructions pour configurer:
// 1. Allez sur https://account.mapbox.com/
// 2. Créez un compte ou connectez-vous
// 3. Copiez votre token public (commence par "pk.")
// 4. Remplacez 'VOTRE_TOKEN_MAPBOX_PUBLIC_ICI' ci-dessus par votre token
