# Firebase Configuration Instructions

## Setup Steps

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Name: "TaskFlow Pro"
   - Enable Google Analytics (optional)

2. **Enable Services**
   - **Authentication**: Enable Google Sign-In provider
   - **Firestore Database**: Create database in production mode
   - **Cloud Messaging**: Enable for push notifications
   - **Analytics**: Enable (optional)

3. **Get Configuration**
   - Go to Project Settings → General
   - Under "Your apps", click Web icon (</>) 
   - Register app: "TaskFlow Pro Web"
   - Copy the firebaseConfig object

4. **Create Environment File**
   - Create `.env.local` in project root
   - Add your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

5. **Firestore Security Rules**
   - Go to Firestore Database → Rules
   - Replace with production rules (see firestore.rules file)

6. **Enable Google Sign-In**
   - Go to Authentication → Sign-in method
   - Enable "Google" provider
   - Add your domain to authorized domains

## For Mobile Apps (iOS/Android)

1. **iOS Setup**
   - Download `GoogleService-Info.plist`
   - Add to `ios/App/App/` directory

2. **Android Setup**
   - Download `google-services.json`
   - Add to `android/app/` directory

## Testing

After setup, the app will use real Firebase authentication and database instead of localStorage.
