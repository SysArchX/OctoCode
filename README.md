# OctoCode

[![React Native](https://img.shields.io/badge/React%20Native-000.svg?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-FFFFFF?style=for-the-badge&logo=expo&logoColor=000)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![OctoCoreOS 1.0](https://img.shields.io/badge/OctoCoreOS-1.0-00FF00?style=for-the-badge&logo=linux&logoColor=white)](https://octocoreos.sysarchx.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

> Gamified native mobile platform for learning Programming, Linux (OctoCoreOS), and Ethical Hacking — without placebo tests.

---

## 📖 Table of Contents

1. [About](#about)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Internationalization](#internationalization)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Download](#download)
8. [Official Website](#official-website)
9. [License](#license)
10. [Credits](#credits)

---

## About

**OctoCode** is a 100% native mobile application built with React Native (Expo) and TypeScript that teaches programming logic, Linux (OctoCoreOS 1.0), and ethical hacking through real, hands-on challenges. There are no placebo tests — only real problems, real code, and real progress.

Built for both Android and iOS, OctoCode adapts its UI to the platform: Material 3 Expressive on Android and Liquid Glass on iOS. A 5-question adaptive placement test determines your starting rank (Beginner / Intermediate / Advanced), and you earn XP immediately on every correct answer.

### What you will learn

- **Programming Logic** — Portugol (`se / senao`, `enquanto`, `escreva`) when the app language is set to pt-BR, or International Standard Pseudocode (`IF / ELSE`, `WHILE`, `FOR`, `PRINT`, `INPUT`) for English and all other languages.
- **Linux (OctoCoreOS 1.0)** — a full POSIX permission system with `octofetch`, a real terminal emulator, and an AI-powered tutor server at `http://163.176.170.31:4000`.
- **Ethical Hacking** — concepts, tool awareness, and safe, responsible practice.

### Target audience

- Beginners who want to learn programming logic from zero.
- Experienced developers who want a fun way to sharpen and test their skills.
- Anyone interested in Linux internals and ethical hacking fundamentals.

No watch-and-forget. No fake "placebo tests." Just real problems and real progress.

---

## Architecture

### OctoCoreOS 1.0

- **octofetch** — ASCII art octopus (`• <`) displaying `OS: OctoCoreOS 1.0`. No "Rolling" text, no technical terms leaked.
- **POSIX permissions** — real file ownership and permissions model.
- **Terminal** — real emulator with commands such as `whoami`, `ls`, `cd`, and more.
- **Server** — `http://163.176.170.31:4000` powered by `OPENROUTER_API_KEY` and a free model cascade fallback chain.

### Provider Stack

```
AuthProvider > ProgressProvider > ThemeProvider
```

Theme is derived from the current track via `useProgress()`. Platform detection uses `globalThis.__OCTO_UI__` — there is no manual theme toggle.

### Platform Visual Identity

- **Android**: Material 3 Expressive
- **iOS**: Liquid Glass

---

## Features

### Progression & Personalization

- **5-question adaptive placement test** — question weight increases as you progress. Your answer set determines your starting rank.
- **XP credited immediately** — earned the moment you get it right.
- **Language-specific leaderboards** — `(device_id, language_slug)` upserted per language.
- **Anti-cheat topic filter** — prevents off-topic spending before tokens are used.
- **Hearts system** — 5 hearts, only inside the class. Off-topic answers are blocked locally.
- **OctoAI chat** — a half-mascot face in the bottom-right corner opens OctoAI (outside the drawer).

### Tracks

- 15 knowledge tracks covering logic, leveling, OctoCoreOS, ranking, notebook, OctoAI, and more.
- 4 brand colors:
  - Python `#3776AB`
  - JavaScript `#F7DF1E`
  - Linux `#EAB308`
  - Hacking `#DC2626`
- Brand purple `#5B21B6` used where appropriate.

### Platform & PWA

- **PWA with install lock** — iPhone Safari blocks OctoCode usage outside standalone mode; the desktop PWA is fully usable.
- **Liquid Glass tutorial** — share → add to home screen walkthrough for PWA users.
- **Offline first** — core functionality works offline; progress saves and syncs when the connection returns.

### Content Adaptation (i18n)

See [Internationalization](#internationalization) for the full multilingual system.

---

## Internationalization

### Supported Languages

- **English (en)**
- **Português (pt-BR)**

### Automatic & Manual Detection

- `expo-localization` detects the device language automatically on first launch.
- A manual selector in the **Settings** screen lets the user switch between `EN` and `PT`.
- The chosen language persists across sessions using `@react-native-async-storage/async-storage`.

### Logic Track Adaptation

**When the active language is `pt-BR`:**

- Unit 1 (Logic) uses **Portugol** — `se / senao`, `enquanto`, `para`, `escreva`, `leia`.
- The OctoAI tutor server responds in Portuguese.
- Website and PWA texts are in Portuguese.

**When the active language is `en` (or any language other than `pt-BR`):**

- Unit 1 (Logic) uses **International Standard Pseudocode** — `IF / ELSE`, `WHILE`, `FOR`, `PRINT`, `INPUT`.
- The OctoAI tutor server responds in English.
- Website and PWA texts are in the selected language.

The keyword list and off-topic filter adjust per language so that the correct concept set is enforced in every locale.

### Directory Layout

```
src/i18n/
  index.ts                 # provider, detector, switcher
  en/
    translations.ts        # English strings
    index.ts              # re-export
  pt-BR/
    translations.ts        # Portuguese (Brazil) strings
    index.ts              # re-export
  logic/
    en.ts                  # International Standard Pseudocode keywords
    pt-BR.ts              # Portugol keywords
```

---

## Installation

### Prerequisites

- Node.js 20+
- npm (Bun is no longer used — `bun.lock` has been removed)
- Git

### Local Setup

```bash
git clone https://github.com/SysArchX/OctoCode.git
cd OctoCode
npm install
npm run dev
```

### Build Native Apps

```bash
# Android
cd android && chmod +x gradlew && ./gradlew assembleRelease

# iOS (macOS only)
cd ios
pod install
xcodebuild -workspace *.xcworkspace -scheme *.xcodeproj -sdk iphoneos \
  -configuration Release -derivedDataPath build \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO build
```

Pre-built binaries are published automatically in the [Releases](https://github.com/SysArchX/OctoCode/releases) tab.

---

## Usage

1. Open OctoCode and complete the 5-question placement test.
2. Your rank is set: Beginner, Intermediate, or Advanced.
3. Start a track (Logic, Linux/OctoCoreOS, Hacking, etc.).
4. Answer 5 questions per session — XP is awarded instantly.
5. Check the leaderboard for your language group.
6. Tap the half-mascot eye in the corner to open the OctoAI chat.
7. If you are on PWA, follow the Liquid Glass tutorial to install on your home screen.

Off-topic answers are blocked locally by the anti-cheat filter. Progress syncs automatically when you are back online.

---

## Download

### GitHub Releases

All native builds are published automatically to the [Releases](https://github.com/SysArchX/OctoCode/releases) tab.

| Package | Architecture | Approximate size |
|---------|--------------|------------------|
| `OctoCode-universal.apk` | All Android ABIs | ~38 MB |
| `OctoCode-arm64-v8a.apk` | ARM64 | ~26 MB |
| `OctoCode-armeabi-v7a.apk` | ARMv7 (older devices) | ~24 MB |
| `OctoCode-x86_64.apk` | x86_64 (emulators / Chromebooks) | ~27 MB |
| `OctoCode-unsigned.ipa` | iOS arm64 (AltStore / SideStore) | ~40 MB |

All APKs are ABI-split for smaller downloads on most devices. The universal APK covers every architecture but is larger.

### GitHub Pages (Web)

The official website and PWA are hosted on GitHub Pages:

- **Website**: [https://sysarchx.github.io/OctoCode/](https://sysarchx.github.io/OctoCode/)
- **PWA (offline app)**: [https://sysarchx.github.io/OctoCode/app/](https://sysarchx.github.io/OctoCode/app/)

The site is always up to date with the latest successful `main` branch build.

### Short link

[https://is.gd/gzRq3n](https://is.gd/gzRq3n) — points to the GitHub Pages site.

---

## Official Website

🌐 **https://sysarchx.github.io/OctoCode/**

The official site includes:

- Project overview and features
- Download links to GitHub Releases
- The OctoCode PWA (offline-capable web app) at `/app/`
- Documentation and track descriptions

---

## License

MIT — see the [LICENSE](LICENSE) file in the repository root.

---

## Credits

- **Developer / Maintainer**: [SysArchX](https://github.com/SysArchX)
- **React Native + Expo**: [expo.dev](https://expo.dev/)
- **TypeScript**: [typescriptlang.org](https://www.typescriptlang.org/)
- **OctoCoreOS 1.0**: Linux console environment built for OctoCode
- **Supabase**: authentication and database backend
- **GitHub Pages**: free static hosting for the official site
- **GitHub Actions**: CI/CD native builds and release publishing
- **OctoAI server**: `http://163.176.170.31:4000` with free model cascade fallback

---

## Contributing

Contributions, bug reports, and feature requests are welcome. Please open an issue or submit a pull request.

By contributing, you agree that your contributions will be licensed under the same MIT License as the project.

---

© SysArchX. Built with ❤️ and lots of ☕.
