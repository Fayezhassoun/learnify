# Learnify

Learnify is a cross-platform learning app built with Flutter. Users can upload PDFs or video links and interact with an AI tutor that helps summarize, explain, and quiz them on the material. The app uses Firebase for backend services and integrates with OpenAI APIs for transcription and chat features.

## High-Level Architecture

### Frontend
- **Flutter** for iOS, Android, and Web.
- Chat-based interface for discussing uploaded material with an AI tutor.
- Flashcards and quizzes generated automatically from user content.
- Responsive mobile-first UI styled with Cupertino widgets.

### Backend
- **Firebase Authentication** for user accounts.
- **Firebase Storage** for uploaded PDFs and audio/video files.
- **Cloud Firestore** for storing transcripts, summaries, flashcards, and quiz results.
- **Cloud Functions** as a lightweight Node.js service that calls OpenAI APIs (Whisper and GPT-4) and returns results to the client.

### AI Integration
1. User uploads a PDF or video URL.
2. Cloud Function detects the type of content:
   - For video/audio, Whisper is used to generate a transcript.
   - For PDFs/text, the file is uploaded to Storage and parsed server-side.
3. GPT-4 receives the transcript or text chunks to produce summaries, explanations, and quiz questions.
4. The client displays answers in a chat interface and stores results in Firestore.

### Data Flow
1. **Client** uploads file/URL -> **Firebase Storage** (via Flutter).
2. Triggers **Cloud Function** -> processes file, calls **OpenAI APIs**.
3. Cloud Function writes processed data (summaries, flashcards, quiz) to **Firestore**.
4. Client listens to Firestore updates and displays content in real time.
5. User interactions (quiz answers, chat messages) are stored back in Firestore for sync across devices.

## Development Phases

1. **Project Setup**
   - Initialize Flutter project and connect to Firebase.
   - Configure GitHub repo and CI (optional).
2. **User Authentication & Uploads**
   - Implement sign up/login with Firebase Auth.
   - Allow PDF upload or URL input.
3. **AI Processing**
   - Create Cloud Functions for Whisper transcription and GPT-4 summaries/quizzes.
   - Store results in Firestore.
4. **Chat Interface & Learning Tools**
   - Build chat UI for interacting with the AI tutor.
   - Display generated flashcards and quizzes.
5. **Polish & Deployment**
   - Responsive design improvements.
   - Publish to iOS, Android, and web.

## Project Scaffold

This repository contains a minimal Flutter skeleton:

```
learnify/
├── lib/
│   └── main.dart
├── pubspec.yaml
└── README.md
```

Run `flutter pub get` to fetch dependencies once Flutter is installed.

## OpenAI API Setup

1. Create an OpenAI account and generate an API key.
2. In Firebase Functions (Node.js), install the OpenAI SDK:
   ```bash
   npm install openai
   ```
3. Store the API key as an environment variable or Secret Manager entry in Firebase.
4. Example Cloud Function snippet:
   ```javascript
   const { Configuration, OpenAIApi } = require('openai');
   const functions = require('firebase-functions');

   const configuration = new Configuration({
     apiKey: functions.config().openai.key,
   });
   const openai = new OpenAIApi(configuration);

   exports.summarizeText = functions.https.onCall(async (data, context) => {
     const response = await openai.createChatCompletion({
       model: 'gpt-4',
       messages: [{ role: 'user', content: data.text }],
     });
     return response.data;
   });
   ```
5. Deploy the function with `firebase deploy --only functions`.

## Firebase Setup

1. Install the Firebase CLI and initialize in this project:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```
2. Enable Authentication, Firestore, and Storage in the Firebase console.
3. Add the generated `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) files to the respective directories.
4. In `pubspec.yaml`, ensure `firebase_core`, `firebase_auth`, and `cloud_firestore` dependencies are included (already added). Then initialize Firebase in `main.dart`:
   ```dart
   void main() async {
     WidgetsFlutterBinding.ensureInitialized();
     await Firebase.initializeApp();
     runApp(const LearnifyApp());
   }
   ```
5. Run `flutterfire configure` (from the FlutterFire CLI) to configure platform-specific files.

## Running the App

```bash
flutter pub get
flutter run
```

This will launch the basic scaffold. From there you can start building features as outlined in the milestones.

