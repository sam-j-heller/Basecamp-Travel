# Basecamp — Packing Lists

A travel-themed packing list app. Create trips, organize items into categories, check things off as you pack, and everything syncs live to Firestore so it's up to date on every device.

## Tech stack

- React + Vite
- Firebase Auth (email link / passwordless sign-in)
- Firebase Firestore (real-time sync, no save button)
- Plain CSS, no UI framework

## Data model

```
users/{uid}/trips/{tripId}
  name, startDate, endDate, themeColor, themeMotif, createdAt, updatedAt
  categories: [
    { id, name, items: [ { id, name, quantity, notes, packed } ] }
  ]
```

Each trip is a single Firestore document (categories/items are nested arrays inside it, not subcollections). Packing lists are small, so one document per trip keeps real-time sync simple — the whole trip updates from one `onSnapshot` listener and one `updateDoc` call per edit.

---

## 1. Firebase setup

1. Go to the [Firebase console](https://console.firebase.google.com/) and click **Add project** (you can decline Google Analytics, it's not needed here).
2. Once created, click the **Web** icon (`</>`) on the project overview page to register a web app. Give it any nickname. You don't need Firebase Hosting for this step.
3. Firebase will show you a `firebaseConfig` object — you'll need those values in step 5 below.
4. In the left sidebar, go to **Build → Authentication → Get started**.
   - Under **Sign-in method**, enable **Email link (passwordless sign-in)**.
5. In the left sidebar, go to **Build → Firestore Database → Create database**.
   - Choose **production mode** (the app ships its own security rules — see below).
   - Pick any region close to you.
6. **Deploy the security rules** in [`firestore.rules`](./firestore.rules), which restrict each signed-in user to only their own `users/{their-uid}/trips/**` documents. Paste the contents of `firestore.rules` into **Firestore Database → Rules** in the console and click **Publish**.
7. Copy `.env.example` to `.env.local` and fill in the values from your `firebaseConfig`:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

   `.env.local` is gitignored — never commit real config to source control (it's not secret in the way an API key normally is, since Firestore rules do the real access control, but keep it out of git regardless).

8. Once you deploy the app (step 3 below), go back to **Authentication → Settings → Authorized domains** and add the domain you deploy to (e.g. `your-project.vercel.app` or `yourname.github.io`). Sign-in links only work from authorized domains.

## 2. Local development

```bash
npm install
npm run dev
```

Open the printed `localhost` URL. Enter your email, then check your inbox for the sign-in link — clicking it (in the same browser) finishes sign-in. No password, ever.

## 3. Deployment (GitHub Pages via GitHub Actions)

The app is a static site (`npm run build` outputs to `dist/`), and this repo includes a GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) that builds and deploys it to GitHub Pages automatically on every push to `main` — no local build step needed.

1. Push this repo to a GitHub repository.
2. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Go to **Settings → Secrets and variables → Actions → New repository secret** and add each of these six secrets (values from your `.env.local`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Push a commit (or go to the **Actions** tab and manually run the "Deploy to GitHub Pages" workflow). It builds with the right base path automatically (derived from your repo name) and publishes `dist/`.
5. Once it's deployed, find the live URL under **Settings → Pages** (usually `https://your-username.github.io/your-repo-name/`). Add that domain to Firebase's **Authorized domains** list (step 8 above) — sign-in links won't work until you do.

The app uses a hash-based router (`HashRouter`), so URLs look like `.../#/trip/abc123`. This is deliberate — GitHub Pages serves static files with no server-side rewrites, and a hash router avoids the usual SPA 404-on-refresh problem without needing a `404.html` redirect hack.

### Alternative: Vercel

Vercel also works if you'd rather not use GitHub Actions — **New Project → Import** your repo (Framework preset: Vite, auto-detected), add the same six `VITE_FIREBASE_*` env vars under **Settings → Environment Variables**, deploy, then add the resulting `*.vercel.app` domain to Firebase's **Authorized domains** list.

## Features

- **Dashboard** — lists all your trips with a progress bar, create/rename/duplicate/delete.
- **Duplicate trip** — clones a trip's categories and items (packed status resets, so you can reuse a good list as a template).
- **Trip page** — categories are reorderable (↑/↓), each with an add-item form; items have a packed checkbox, quantity stepper, optional notes, and are also reorderable.
- **Per-trip theme** — pick a motif (mountain / jungle / desert) and accent color when creating or editing a trip; it colors the trip's header band and progress bars.
- **Real-time sync** — every change writes straight to Firestore; no save button, and other devices signed into the same account update live.

## Project structure

```
src/
  firebase.js           Firebase app/auth/db init from env vars
  context/AuthContext   Email-link sign-in state
  lib/tripModel.js      Pure helpers for the categories/items array (add/rename/move/etc.)
  lib/tripsApi.js       Firestore reads/writes
  hooks/useTrips.js      Real-time trip list
  hooks/useTrip.js       Real-time single trip + mutate helper
  pages/                 Login, Dashboard, TripPage
  components/            TripCard, CategorySection, ItemRow, ProgressBar, modals, ThemePicker
  data/sampleTrip.js     The Galápagos & Peru starter list seeded from the dashboard
```

---

Have a great trip! If anything breaks or looks off, reach out to Sam (atlantaheller@gmail.com) and I'll take a look.
