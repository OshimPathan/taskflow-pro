# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created and configured
- For mobile: Xcode (iOS) and/or Android Studio (Android)

---

## Web Deployment

### Option 1: Firebase Hosting (Recommended)

1. **Login to Firebase**
   \`\`\`bash
   firebase login
   \`\`\`

2. **Initialize Firebase Hosting** (if not already done)
   \`\`\`bash
   firebase init hosting
   \`\`\`
   - Select your Firebase project
   - Set public directory to: `dist`
   - Configure as single-page app: `Yes`
   - Don't overwrite `index.html`

3. **Build and Deploy**
   \`\`\`bash
   npm run deploy:web
   \`\`\`

4. **Your app is live!**
   - URL: `https://your-project-id.web.app`
   - Custom domain: Configure in Firebase Console

### Option 2: Vercel

1. **Install Vercel CLI**
   \`\`\`bash
   npm install -g vercel
   \`\`\`

2. **Deploy**
   \`\`\`bash
   vercel
   \`\`\`

3. **Set Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all `VITE_FIREBASE_*` variables

### Option 3: Netlify

1. **Build the app**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Deploy via Netlify CLI or drag-and-drop**
   - Drag `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)
   - Or use CLI: `netlify deploy --prod --dir=dist`

3. **Configure Environment Variables**
   - Site Settings → Build & Deploy → Environment
   - Add all Firebase config variables

---

## iOS App Store Deployment

### 1. Prepare the Build

\`\`\`bash
# Build web app
npm run build

# Sync with iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
\`\`\`

### 2. Configure in Xcode

1. **Update Bundle Identifier**
   - Select project → General
   - Change Bundle Identifier to your unique ID (e.g., `com.yourcompany.taskflowpro`)

2. **Configure Signing**
   - Signing & Capabilities tab
   - Select your Team (Apple Developer Account required)
   - Enable "Automatically manage signing"

3. **Set App Version**
   - General → Identity
   - Version: `1.0.0`
   - Build: `1`

4. **Add App Icons**
   - Assets.xcassets → AppIcon
   - Drag your 1024x1024 icon

### 3. Create Archive

1. **Select Target Device**
   - Product → Destination → Any iOS Device

2. **Archive**
   - Product → Archive
   - Wait for archive to complete

3. **Validate**
   - Window → Organizer → Archives
   - Select your archive → Validate App
   - Fix any issues

### 4. Upload to App Store Connect

1. **Distribute App**
   - Click "Distribute App"
   - Select "App Store Connect"
   - Upload

2. **Configure in App Store Connect**
   - Go to [App Store Connect](https://appstoreconnect.apple.com/)
   - My Apps → + → New App
   - Fill in:
     - Name: TaskFlow Pro
     - Primary Language: English
     - Bundle ID: (select yours)
     - SKU: taskflowpro001

3. **Add App Information**
   - Screenshots (required sizes: 6.5", 5.5")
   - Description
   - Keywords
   - Support URL
   - Privacy Policy URL

4. **Submit for Review**
   - App Store → Prepare for Submission
   - Select build
   - Submit

**Review Time**: Typically 1-3 days

---

## Android Play Store Deployment

### 1. Prepare the Build

\`\`\`bash
# Build web app
npm run build

# Sync with Android
npx cap sync android

# Open in Android Studio
npx cap open android
\`\`\`

### 2. Configure in Android Studio

1. **Update Package Name**
   - `android/app/build.gradle`
   - Change `applicationId` to your unique ID

2. **Set Version**
   - `android/app/build.gradle`
   - `versionCode 1`
   - `versionName "1.0.0"`

3. **Add App Icon**
   - `android/app/src/main/res/`
   - Replace icons in `mipmap-*` folders

### 3. Generate Signed APK/AAB

1. **Create Keystore** (first time only)
   \`\`\`bash
   keytool -genkey -v -keystore taskflowpro.keystore -alias taskflowpro -keyalg RSA -keysize 2048 -validity 10000
   \`\`\`
   - Save keystore file securely
   - Remember password!

2. **Build Signed Bundle**
   - Build → Generate Signed Bundle / APK
   - Select "Android App Bundle"
   - Choose keystore file
   - Enter passwords
   - Select "release" build variant
   - Click Finish

### 4. Upload to Play Console

1. **Create App**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create app
   - Fill in app details

2. **Upload AAB**
   - Production → Create new release
   - Upload the `.aab` file from `android/app/release/`

3. **Complete Store Listing**
   - App details
   - Graphics (icon, feature graphic, screenshots)
   - Categorization
   - Contact details
   - Privacy policy

4. **Content Rating**
   - Complete questionnaire
   - Get rating

5. **Pricing & Distribution**
   - Set countries
   - Free or paid

6. **Submit for Review**
   - Review and roll out to production

**Review Time**: Typically a few hours to 1 day

---

## Environment Variables for Production

Make sure to set these in your hosting platform:

\`\`\`env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
\`\`\`

---

## Post-Deployment Checklist

- [ ] Test authentication (Google + Email)
- [ ] Verify Firestore data sync
- [ ] Test on multiple devices
- [ ] Check analytics are working
- [ ] Monitor error logs
- [ ] Set up alerts for crashes
- [ ] Prepare customer support channels

---

## Troubleshooting

### Build Fails
- Clear cache: `rm -rf node_modules dist && npm install`
- Check Node version: `node -v` (should be 18+)

### Firebase Connection Issues
- Verify environment variables are set
- Check Firebase project is active
- Ensure Firestore rules are deployed

### iOS Build Issues
- Clean build folder: Product → Clean Build Folder
- Update CocoaPods: `cd ios/App && pod install`

### Android Build Issues
- Invalidate caches: File → Invalidate Caches / Restart
- Sync Gradle: File → Sync Project with Gradle Files

---

## Support

For deployment issues, contact:
- Email: support@taskflowpro.app
- GitHub Issues: [Report Issue](https://github.com/yourusername/taskflow-pro/issues)
