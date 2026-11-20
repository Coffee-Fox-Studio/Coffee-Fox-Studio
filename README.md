# ☕🦊 Coffee Fox Studio — site « bientôt disponible »

Page d'attente du studio : un site 100 % statique (HTML, CSS, JS), sans build ni dépendance, prêt pour **GitHub Pages**.

## Fonctionnalités

- Renard animé : il remue la queue, cligne des yeux, suit la souris du regard et penche la tête, ses oreilles frétillent, il sourit au survol et s'endort si on ne fait rien (Zzz)
- Vapeur du café animée, grains et braises en fond avec effet de profondeur, halo lumineux qui suit la souris
- Écran de chargement (une tasse qui se remplit), titre lettre par lettre, texte tapé à la machine
- Barre « Infusion du site » qui bloque à 87 % (évidemment)
- **Mini-jeu « Attrape les grains »** : souris, tactile ou clavier, combos, grains dorés, bugs à éviter, record sauvegardé
- **11 succès façon Steam** avec notifications (code Konami, oiseau de nuit, page 404…)
- Page **404** sur le même thème, qui fonctionne même dans les sous-dossiers
- Responsive, accessible (clavier, `prefers-reduced-motion`), favicon, manifest, image d'aperçu pour les réseaux

## Mettre en ligne sur GitHub Pages

1. Créez un dépôt sur GitHub (par exemple `coffee-fox-studio`).
2. Envoyez **le contenu de ce dossier** à la racine du dépôt (y compris le fichier caché `.nojekyll`).
   ```bash
   git init
   git add .
   git commit -m "Site en préparation"
   git branch -M main
   git remote add origin https://github.com/VOTRE-PSEUDO/coffee-fox-studio.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings → Pages → Build and deployment → Source : Deploy from a branch → Branch : `main` / `/ (root)` → Save**.
4. Une à deux minutes plus tard, le site est en ligne sur `https://VOTRE-PSEUDO.github.io/coffee-fox-studio/`.

> Pour avoir l'adresse `https://VOTRE-PSEUDO.github.io/` sans sous-dossier, nommez le dépôt `VOTRE-PSEUDO.github.io`.
> Pour un nom de domaine perso, ajoutez-le dans **Settings → Pages → Custom domain** (GitHub crée le fichier `CNAME` tout seul).

Tous les chemins sont relatifs : le site marche à la racine, dans un sous-dossier, ou en ouvrant simplement `index.html` sur votre PC.

## Personnaliser

Tout se règle en haut de **`assets/js/main.js`**, dans l'objet `CONFIG` :

| Réglage      | Rôle |
|--------------|------|
| `links`      | URL de vos réseaux (Discord, TikTok, Instagram, X, YouTube, itch.io, Steam). Ceux laissés vides ne s'affichent pas. |
| `email`      | Adresse de contact. Le bouton « Nous écrire » n'apparaît que si elle est remplie. |
| `phrases`    | Phrases tapées sous le titre. |
| `quips`      | Répliques du renard quand on clique dessus. |
| `sleepAfter` | Délai avant que le renard s'endorme (en ms). |

Les couleurs sont dans `:root` en haut de `assets/css/style.css`.
Les succès sont listés dans `assets/js/achievements.js`.

### Image d'aperçu (Discord, X, Facebook…)

Une fois le site en ligne, remplacez dans `index.html` :
```html
<meta property="og:image" content="assets/img/og-image.png">
```
par l'adresse complète, par exemple :
```html
<meta property="og:image" content="https://VOTRE-PSEUDO.github.io/coffee-fox-studio/assets/img/og-image.png">
```
(Certains réseaux n'acceptent que les adresses complètes.)

## Structure

```
.
├── index.html            Page principale
├── 404.html              Page d'erreur (servie automatiquement par GitHub Pages)
├── site.webmanifest      Infos pour « ajouter à l'écran d'accueil »
├── robots.txt
├── .nojekyll             Dit à GitHub Pages de servir les fichiers tels quels
└── assets/
    ├── css/style.css
    ├── js/
    │   ├── main.js          Animations, renard, configuration
    │   ├── minigame.js      Mini-jeu « Attrape les grains »
    │   └── achievements.js  Système de succès
    └── img/                 Favicon, icônes, image d'aperçu
```

## Easter eggs

- Cliquer sur le renard (et insister…)
- Le laisser tranquille 20 secondes
- ↑ ↑ ↓ ↓ ← → ← → B A
- Ouvrir la console du navigateur
- Visiter une page qui n'existe pas
