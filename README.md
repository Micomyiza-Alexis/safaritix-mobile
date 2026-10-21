# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Native map configuration

The Track Bus screen uses `react-native-maps`. For Android Google map tiles, provide
the build-time environment variable `GOOGLE_MAPS_ANDROID_API_KEY` (or
`EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY`) before creating/rebuilding the native app.
`GOOGLE_MAPS_API_KEY` remains supported as a shared fallback. When no native key is
set, `app.config.js` reads the existing local web value from
`../project_safatiTix-developer/.env.local` and then `.env.production`; that fallback
must be an Android-authorized key, not a key restricted only to web referrers.

The key is consumed by the Expo config plugin and is not stored in source control.
The Android key must allow the `com.anonymous.safaritixmobile` package and the
development/release certificate SHA-1 fingerprints, with Maps SDK for Android
enabled. A key restricted only to web HTTP referrers will not work for Android.

After changing this value, rebuild the development client with `npx expo run:android`
or the equivalent EAS build; an already-installed binary will not receive native
configuration changes automatically.

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
