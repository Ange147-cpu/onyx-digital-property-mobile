# 📱 Onyx Digital Property — Application Mobile

Application mobile React Native + Expo, migration fidèle de la plateforme web SaaS de gestion immobilière **Onyx Digital Property**, pensée pour l'Afrique francophone.

---

## 🏗️ Architecture & Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | React Native 0.76 + Expo SDK 53 |
| Navigation | Expo Router (file-based routing) |
| Langage | TypeScript 5 |
| State management | Zustand 5 |
| Backend / Auth | Supabase (même instance que le web) |
| Stockage sécurisé | expo-secure-store |
| UI | Composants custom (design system Onyx) |
| Animations | React Native Reanimated 3 |
| Dégradés | expo-linear-gradient |
| Toast | react-native-toast-message |

---

## 🎨 Design System

- **Couleur primaire (background)** : `#0A1628` (dark navy)
- **Accent gold** : `#C9A84C`
- **Surface** : `#111E35`
- **Surface elevated** : `#182540`
- **Polices** : Sora (display) + Plus Jakarta Sans (corps)

---

## 👥 Rôles & Navigation

| Rôle | Route | Fonctionnalités |
|------|-------|-----------------|
| **Propriétaire** | `/(app)/proprietaire/` | Dashboard KPIs, Gestion biens, Locataires, Loyers, Maintenance, Rappels, Activité |
| **Locataire** | `/(app)/locataire/` | Dashboard logement, Déclaration de paiement, Quittances, Maintenance, Documents |
| **Investisseur** | `/(app)/investisseur/` | Dashboard portefeuille, KPIs financiers, Analytiques |
| **Prestataire** | `/(app)/prestataire/` | Missions reçues, Mise à jour statuts |

---

## 📂 Structure des dossiers

```
onyx-digital-property-mobile/
├── app/                          # Expo Router — Écrans et layouts
│   ├── _layout.tsx               # Root layout (GestureHandler + Toast)
│   ├── index.tsx                 # Redirect selon auth/rôle
│   ├── (auth)/                   # Écrans non authentifiés
│   │   ├── _layout.tsx
│   │   ├── login.tsx             # Connexion email/password
│   │   ├── register.tsx          # Demande d'accès
│   │   └── forgot-password.tsx   # Réinitialisation mot de passe
│   └── (app)/                    # Écrans authentifiés
│       ├── _layout.tsx           # Tab navigation par rôle
│       ├── proprietaire/
│       │   ├── index.tsx         # Dashboard propriétaire
│       │   ├── properties/       # Gestion des biens
│       │   ├── tenants/          # Gestion des locataires
│       │   ├── payments/         # Loyers & paiements
│       │   ├── maintenance/      # Tickets maintenance
│       │   └── notifications.tsx
│       ├── locataire/
│       │   ├── index.tsx         # Dashboard locataire
│       │   ├── declare-payment.tsx
│       │   ├── payments.tsx      # Historique + quittances
│       │   ├── maintenance.tsx   # Signalement + suivi
│       │   └── documents.tsx
│       ├── investisseur/
│       │   └── index.tsx         # Dashboard portefeuille
│       └── prestataire/
│           └── index.tsx         # Missions + mise à jour
│
├── src/
│   ├── components/
│   │   └── ui/                   # Composants réutilisables
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Badge.tsx
│   │       ├── KpiTile.tsx
│   │       ├── EmptyState.tsx
│   │       ├── OnyxLogo.tsx
│   │       ├── SectionHeader.tsx
│   │       └── ToastConfig.tsx
│   ├── constants/
│   │   └── theme.ts              # Couleurs, fontes, espacements
│   ├── services/
│   │   └── supabase.ts           # Client Supabase (SecureStore)
│   ├── store/
│   │   ├── authStore.ts          # Auth + session + rôles (Zustand)
│   │   ├── proprietaireStore.ts  # Données propriétaire (Zustand)
│   │   └── tenantStore.ts        # Portail locataire (Zustand)
│   ├── types/
│   │   └── database.ts           # Types TypeScript (mirror DB)
│   └── utils/
│       └── format.ts             # Formatage FCFA, dates, labels
│
├── .env.example
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

---

## 🚀 Installation & Démarrage

### Prérequis

- **Node.js** >= 18.x
- **npm** ou **yarn** ou **bun**
- **Expo CLI** : `npm install -g expo-cli`
- **EAS CLI** (optionnel, pour build) : `npm install -g eas-cli`
- **Android Studio** (pour Android) ou **Xcode** (pour iOS sur macOS)
- Application **Expo Go** sur votre téléphone (pour test rapide)

### Étape 1 — Cloner et installer

```bash
cd onyx-digital-property-mobile
npm install
# ou
yarn install
# ou
bun install
```

### Étape 2 — Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez `.env` :

```env
EXPO_PUBLIC_SUPABASE_URL=https://umemlwbofbahscwfdjya.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Note** : Les clés Supabase sont les mêmes que le projet web (même BDD, même auth).

### Étape 3 — Lancer l'application

```bash
# Mode développement (QR code pour Expo Go)
npm start

# Android directement
npm run android

# iOS (macOS uniquement)
npm run ios
```

### Étape 4 — Tester avec Expo Go

1. Installez **Expo Go** sur Android ou iOS
2. Scannez le QR code affiché dans le terminal
3. L'app se charge directement sur votre appareil

---

## 📦 Dépendances principales

```bash
# Navigation
@react-navigation/native
@react-navigation/native-stack
@react-navigation/bottom-tabs
expo-router

# Supabase
@supabase/supabase-js
expo-secure-store          # Stockage sécurisé des tokens

# UI
expo-linear-gradient       # Dégradés
@expo/vector-icons         # Icônes (Ionicons)
react-native-toast-message # Notifications toast

# State
zustand                    # Gestion d'état

# Utilitaires
date-fns                   # Formatage des dates
react-native-safe-area-context
react-native-gesture-handler
react-native-reanimated
react-native-screens
react-native-svg
```

---

## 🔧 Build de production

### Android APK / AAB

```bash
# Build local (nécessite Android Studio)
eas build --platform android --profile preview

# APK téléchargeable
eas build --platform android --profile preview --local
```

### iOS IPA

```bash
eas build --platform ios --profile preview
```

### Configuration EAS (`eas.json`)

```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "ios": { "simulator": true }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

---

## 🗄️ Base de données — Tables utilisées

| Table | Usage |
|-------|-------|
| `profiles` | Profils utilisateurs |
| `organization_members` | Rôles par organisation |
| `organizations` | Organisations (pack, abonnement) |
| `properties` | Biens immobiliers |
| `tenants` | Locataires |
| `leases` | Contrats de bail |
| `rent_payments` | Paiements de loyer |
| `payment_declarations` | Déclarations de paiement (locataires) |
| `maintenance_tickets` | Tickets maintenance |
| `documents` | Coffre-fort documents |
| `notifications` | Notifications in-app |
| `activity_feed` | Journal d'activité |
| `reminders` | Rappels propriétaire |
| `trial_applications` | Demandes d'accès essai |

---

## 🔐 Sécurité

- Tokens JWT stockés dans **SecureStore** (chiffrement natif iOS Keychain / Android Keystore)
- Row Level Security (RLS) Supabase actif — chaque utilisateur n'accède qu'à ses données
- Auto-refresh des sessions
- Déconnexion sécurisée avec nettoyage des stores

---

## 🌍 Fonctionnalités Mobile Money

Paiements supportés (déclaration locataire) :

| Opérateur | Code |
|-----------|------|
| 💙 Wave | `wave` |
| 🟠 Orange Money | `orange_money` |
| 🟡 MTN MoMo | `mtn_money` |
| 💚 Moov Money | `moov_money` |
| 💵 Espèces | `cash` |
| 🏦 Virement | `bank_transfer` |

---

## 🛣️ Roadmap fonctionnelle

### Phase 2 (à développer)
- [ ] Génération de quittances PDF (via `jspdf` React Native)
- [ ] Notifications push (Expo Notifications + Supabase Edge Functions)
- [ ] Scanner QR de confirmation de paiement
- [ ] Upload de photos/documents (expo-image-picker)
- [ ] Signature électronique de baux
- [ ] Mode hors-ligne (AsyncStorage + sync)
- [ ] Analytics investisseur (Recharts → Victory Native)
- [ ] Chat propriétaire-locataire (Supabase Realtime)

### Phase 3 (avancé)
- [ ] Deep links pour validation de paiement
- [ ] Biométrie (Face ID / fingerprint) via expo-local-authentication
- [ ] Internationalisation (fr, en, ar)
- [ ] Dark/Light mode toggle

---

## 🐛 Dépannage courant

### `Module not found: expo-router`
```bash
npx expo install expo-router
```

### Problème Metro bundler
```bash
npx expo start --clear
```

### Erreur Supabase "JWT expired"
Le `onAuthStateChange` gère le refresh automatique. Si persistant :
```bash
# Vider le SecureStore (déconnexion manuelle)
# Puis se reconnecter
```

### Build Android échoue
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

---

## 👨‍💻 Développeur

Application mobile développée par **KOUAI Ange-Élisé** — B2DEV, IFRAN Abidjan (Groupe 14)  
Migration fidèle de la plateforme web **Onyx Digital Property** vers React Native + Expo.

---

*Onyx Digital Property — Pilotez votre patrimoine immobilier en toute sécurité, où que vous soyez.*
