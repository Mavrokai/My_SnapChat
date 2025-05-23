# My Snapchat

Une application mobile de messagerie éphémère inspirée de Snapchat, développée avec React Native et Expo.

## 🚀 Fonctionnalités

- 📸 Envoi de snaps (photos) avec durée de visualisation limitée
- 👤 Gestion de profil utilisateur
- 🔐 Authentification sécurisée
- 📱 Interface utilisateur moderne et intuitive
- ⏱️ Timer pour la visualisation des snaps
- 🔄 Actualisation en temps réel des snaps reçus

## 🛠️ Technologies utilisées

- React Native
- Expo
- TypeScript
- AsyncStorage pour la persistance locale
- React Navigation
- Expo Image Picker
- Expo Image Manipulator

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Expo CLI
- Un appareil mobile ou un émulateur

## 🚀 Installation

1. Clonez le repository :

```bash
git clone [git@github.com:EpitechWebAcademiePromo2026/W-JSC-502-LIL-2-1-snapchat-abdellah1.djezzar.git]
cd my_snapchat
```

2. Installez les dépendances :

```bash
npm install
# ou
yarn install
```

3. Configurez les variables d'environnement :
   Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_API_URLSNAP=your_snap_api_url
EXPO_PUBLIC_API_KEY=your_api_key
```

4. Lancez l'application :

```bash
npx expo start --clear
```

## 📱 Utilisation

1. Créez un compte ou connectez-vous
2. Prenez une photo ou sélectionnez-en une depuis votre galerie
3. Définissez la durée de visualisation
4. Envoyez le snap à vos contacts
5. Visualisez les snaps reçus dans la section "Snaps reçus"

## 🔒 Sécurité

- Authentification par JWT
- Stockage sécurisé des données sensibles
- Gestion des sessions utilisateur
- Protection des routes API

## 👥 Auteurs

- Valentin Verscheure
- Abdellah Djezzar
- Bryan Salomé
