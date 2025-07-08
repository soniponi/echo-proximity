
# Echo - Proximity Social Network

Una rete sociale basata sulla prossimità in tempo reale che connette le persone in base alla vicinanza fisica. Sviluppata con React, TypeScript, Supabase e progettata per esperienze mobile-first.

## 🌟 Caratteristiche

### ✅ Implementate
- **Autenticazione Utenti** - Registrazione e login con email/password
- **Profili Utente** - Profili personalizzabili con bio, interessi e foto
- **Integrazione Database** - Backend Supabase con Row Level Security
- **Design Responsive** - UI mobile-first con Tailwind CSS
- **Gestione Profili** - Modifica informazioni profilo, interessi e visibilità
- **Scansione Prossimità** - Rilevamento utenti nelle vicinanze (simulato)

### 🚧 In Sviluppo
- **Servizi GPS** - Localizzazione accurata con gestione permessi
- **Bluetooth Low Energy** - Rilevamento dispositivi vicini
- **Notifiche Real-time** - Avvisi quando gli utenti sono nelle vicinanze
- **Sistema Chat** - Messaggistica diretta tra utenti
- **Sistema Match** - Espressione di interesse reciproco

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+ e npm
- Account Supabase
- Browser moderno

### Installazione

1. **Clona il repository**
```bash
git clone https://github.com/your-username/echo-proximity-social.git
cd echo-proximity-social
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Avvia il server di sviluppo**
```bash
npm run dev
```

4. **Accedi all'app**
   - Apri [http://localhost:5173](http://localhost:5173)
   - Vai su `/auth` per creare un account o accedere

## 📱 Deployment su App Store e Google Play

### 🎯 Perché Pubblicare negli Store?

Pubblicare Echo negli store è fondamentale per:
- **Acquisire i primi utenti** - Gli store sono i principali canali di distribuzione mobile
- **Dare vita all'app** - Gli utenti reali creano il network effect necessario
- **Validare il prodotto** - Feedback reale da utenti in contesti d'uso reali
- **Crescita organica** - Visibilità attraverso le classifiche degli store

### 🔧 Preparazione per il Deployment

#### 1. Configurazione Capacitor
```bash
# Installa Capacitor se non già installato
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Inizializza Capacitor
npx cap init
```

#### 2. Build dell'App
```bash
# Build per produzione
npm run build

# Aggiungi piattaforme native
npx cap add ios
npx cap add android

# Sincronizza con le piattaforme native
npx cap sync
```

### 📱 Deployment iOS (App Store)

#### Prerequisiti
- **macOS** con Xcode 14+ installato
- **Apple Developer Account** ($99/anno)
- **Certificati di sviluppo** configurati

#### Passi per il Deployment

1. **Configurazione Xcode**
```bash
npx cap open ios
```

2. **Impostazioni Progetto**
   - Configura Bundle Identifier unico (es: `com.tuonome.echo`)
   - Imposta Team di sviluppo
   - Configura versione e build number

3. **Permessi iOS** (Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Echo ha bisogno della posizione per trovare utenti nelle vicinanze</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Echo usa la posizione per connetterti con persone vicine</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>Echo usa il Bluetooth per rilevare utenti nelle vicinanze</string>
```

4. **App Store Connect**
   - Crea nuova app su [App Store Connect](https://appstoreconnect.apple.com)
   - Configura metadati dell'app
   - Carica screenshot e descrizioni
   - Imposta prezzo (gratuita consigliata per il lancio)

5. **Submission Process**
   - Archive dell'app in Xcode
   - Upload tramite Xcode Organizer
   - Sottometti per review (7-14 giorni)

#### 📝 Checklist iOS
- [ ] Apple Developer Account attivo
- [ ] Bundle ID configurato
- [ ] Certificati di sviluppo validi
- [ ] Permessi configurati correttamente
- [ ] Screenshot per tutte le dimensioni richieste
- [ ] Descrizione app completa
- [ ] Privacy policy pubblicata
- [ ] Testato su dispositivi reali

### 🤖 Deployment Android (Google Play)

#### Prerequisiti
- **Android Studio** installato
- **Google Play Console Account** ($25 una tantum)
- **Keystore** per il signing dell'app

#### Passi per il Deployment

1. **Configurazione Android Studio**
```bash
npx cap open android
```

2. **Generazione Keystore**
```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

3. **Configurazione Build** (android/app/build.gradle)
```gradle
android {
    signingConfigs {
        release {
            storeFile file('path/to/my-release-key.jks')
            storePassword 'your-store-password'
            keyAlias 'my-key-alias'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

4. **Permessi Android** (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.INTERNET" />
```

5. **Build APK/AAB**
```bash
# Genera AAB (Android App Bundle - consigliato)
./gradlew bundleRelease

# Oppure APK
./gradlew assembleRelease
```

6. **Google Play Console**
   - Crea nuova app su [Google Play Console](https://play.google.com/console)
   - Carica AAB/APK
   - Configura store listing
   - Imposta distribuzione e prezzo

#### 📝 Checklist Android
- [ ] Google Play Console account attivo
- [ ] Keystore generato e sicuro
- [ ] App firmata correttamente
- [ ] Permessi configurati
- [ ] Screenshots per diverse dimensioni
- [ ] Descrizione completa
- [ ] Privacy policy disponibile
- [ ] Testato su dispositivi Android reali

### 🎨 Materiali per gli Store

#### Screenshot Richiesti
- **iOS**: iPhone 6.7", 6.5", 5.5" + iPad 12.9", 11"
- **Android**: Phone, 7" tablet, 10" tablet

#### Descrizioni Ottimizzate per ASO
```
Titolo: Echo - Scopri Chi Ti Circonda
Sottotitolo: Social Network di Prossimità

Descrizione:
🌟 Connettiti con persone interessanti nelle tue vicinanze
📍 Trova chi condivide i tuoi interessi vicino a te  
💬 Chatta solo con persone che hai incontrato davvero
🔒 Privacy e sicurezza al primo posto
✨ Esperienze social autentiche e locali

Parole chiave: social network, prossimità, amici, incontri, chat, locale
```

#### Icone e Grafiche
- **Icona App**: 1024x1024px, design semplice e riconoscibile
- **Feature Graphic**: 1024x500px per Google Play
- **Screenshots**: Mostra le funzionalità principali

### 🚀 Strategia di Lancio

#### Pre-Lancio (2-4 settimane prima)
1. **Beta Testing**
   - TestFlight (iOS) / Internal Testing (Android)
   - Invita 50-100 beta tester
   - Raccogli feedback e correggi bug

2. **Content Marketing**
   - Landing page con email signup
   - Post su social media
   - Contatta influencer locali

#### Lancio
1. **Soft Launch**
   - Rilascia in mercati piccoli prima
   - Monitora metriche e feedback
   - Ottimizza basandoti sui dati

2. **Full Launch**
   - Rilascio globale
   - Campagna PR
   - App Store Optimization (ASO)

#### Post-Lancio
1. **Acquisizione Utenti**
   - Campagne pubblicitarie mirate
   - Referral program
   - Community building

2. **Retention**
   - Push notifications strategiche
   - Nuove features basate su feedback
   - Gamification elements

### 📊 Metriche da Monitorare

#### Store Metrics
- **Download/Install rate**
- **Rating e recensioni**
- **Ranking nelle categorie**
- **Conversion rate store page**

#### App Metrics
- **Daily/Monthly Active Users**
- **Session duration**
- **User retention (D1, D7, D30)**
- **Feature adoption rates**

#### Business Metrics
- **Cost per install (CPI)**
- **Lifetime value (LTV)**
- **Churn rate**
- **Network effect metrics**

### ⚠️ Considerazioni Legali

#### Privacy e GDPR
- Privacy policy completa
- Consenso per localizzazione
- Gestione dati personali
- Diritto alla cancellazione

#### Sicurezza
- Crittografia end-to-end per messaggi
- Validazione input lato server
- Rate limiting per API
- Moderazione contenuti

### 🛠️ Tools Utili

#### Development & Testing
- **Expo Application Services** - Build service
- **BrowserStack** - Testing su dispositivi reali
- **Firebase App Distribution** - Beta testing

#### Analytics
- **Google Analytics** - Web analytics
- **Firebase Analytics** - App analytics
- **Mixpanel** - Event tracking

#### Marketing
- **App Store Optimization (ASO)**
  - Sensor Tower
  - App Annie
  - Mobile Action

## 🏗️ Architettura Tecnica

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Componenti

### Backend
- **Supabase** - Backend as a Service
  - Database PostgreSQL
  - Authentication
  - Real-time subscriptions
  - Row Level Security

### Mobile
- **Capacitor** - Deployment nativo
- **PWA** - Progressive Web App

## 📄 Documentazione

### Link Utili
- [Documentazione Lovable](https://docs.lovable.dev/)
- [Guida Capacitor](https://capacitorjs.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Community Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)

### Testing Mobile
Per testare su dispositivi reali, segui la [guida completa di testing mobile](https://lovable.dev/blogs/mobile-testing-guide).

## 🤝 Contribuire

1. Fork del repository
2. Crea feature branch
3. Testa su dispositivi reali
4. Invia pull request

## 📋 Roadmap

### Fase 1: MVP ✅
- Autenticazione e profili
- UI responsive
- Database setup

### Fase 2: Core Features 🚧
- Geolocalizzazione reale
- Bluetooth proximity
- Sistema match

### Fase 3: Social Features
- Chat real-time
- Gruppi di interesse
- Eventi locali

### Fase 4: Crescita
- Referral system
- Gamification
- Analytics avanzati

## 📄 Licenza

Questo progetto è sotto licenza MIT - vedi il file [LICENSE](LICENSE) per dettagli.

## 🙏 Riconoscimenti

- Sviluppato con [Lovable](https://lovable.dev)
- UI da [Shadcn/ui](https://ui.shadcn.com/)
- Backend [Supabase](https://supabase.com/)
- Icone [Lucide](https://lucide.dev/)

---

**Pronto a connettere le persone attraverso la prossimità? Costruiamo insieme il futuro del social networking locale!** 🌍✨
