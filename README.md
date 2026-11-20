# OctoCode

## Gamified native mobile platform for learning Programming, Linux (OctoCoreOS), and Ethical Hacking without placebo tests.

---

## 📖 Table of Contents

1. [The Idea](#the-idea)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Download](#download)
7. [License](#license)

---

## 💡 The Idea

OctoCode was created to transform how people learn programming. Starting from the basics with Portugol (for Portuguese speakers) or Standard Pseudocode (for international users), through 15 knowledge tracks, to building real applications. No placebo tests, no watched videos - just real coding.

---

## 🏗️ Architecture

### OctoCoreOS 1.0

- **POSIX Permissions**: Full POSIX-compliant permission system with `octofetch` for system information
- **Terminal**: Real terminal emulator with commands like `whoami`, `ls`, `cd`, and OctoCoreOS-specific utilities
- **Model Cascade**: OctoAI with free model fallback chain running at `http://163.176.170.31:4000`
- **Offline First**: All core functionality works offline without internet connection

### Platform-Aware UI

- **Android**: Material 3 Expressive design
- **iOS**: Liquid Glass design
- **Auto-detection**: Platform detection via `globalThis.__OCTO_UI__`, no manual theme toggle

### Provider Order

```
AuthProvider > ProgressProvider > ThemeProvider
```

(Theme derives from track via `useProgress()`)

---

## ✨ Features

### Core Features

- **5-Question Placement Test**: Adaptive ranking from Beginner → Intermediate → Advanced
- **XP Credited Immediately**: Experience points awarded instantly upon correct answers
- **Language Leaderboards**: XP per language tracked by `(device_id, language_slug)` with upsert
- **Mascot Peek**: Half mascote face in bottom-right corner, opens OctoAI chat (outside drawer)
- **5 Hearts**: Only inside the class (off-topic filter prevents token waste)

### Tracks & Content

- **15 Tracks**: Programming logic, leveling, OctoCoreOS, Ranking, Notebook, OctoAI
- **4 Track Colors**: Python `#3776AB`, JavaScript `#F7DF1E`, Linux `#EAB308`, Hacking `#DC2626`
- **Brand Purple**: `#5B21B6`
- **Platform Visual**: Auto by platform (Android = Material 3, iOS = Liquid Glass)

### Advanced Features

- **Anti-Cheat Topic Filter**: Local topic prohibition before spending tokens
- **PWA with Install Lock**: Safari iPhone blocks usage outside standalone mode
- **Liquid Glass Tutorial**: Share → Add to Home Screen tutorial
- **Progress Saving**: Offline XP sync when connection returns

### Downloadable Packages

- 4 Android APKs (split by ABI: arm64-v8a, armeabi-v7a, x86_64, universal)
- 1 iOS IPA (unsigned)
- PWA standalone compatible

---

## 🏛️ Architecture Details

### OctoCoreOS

```
├─ octofetch - ASCII art octopus (• <), shows OS: OctoCoreOS 1.0
├─ No "Rolling" text
├─ Displays: OS: OctoCoreOS 1.0
├─ No technical terms leaked
└─ Server at http://163.176.170.31:4000 with OPENROUTER_API_KEY and free model cascade
```

### Provider Stack

```
AuthProvider
  └─ ProgressProvider
       └─ ThemeProvider
            └─ Platform (auto Android/iOS)
```

---

## 📦 Download

### GitHub Releases

[https://github.com/SysArchX/OctoCode/releases](https://github.com/SysArchX/OctoCode/releases)

| Package | Architecture | Size |
|---------|-------------|------|
| `OctoCode-universal.apk` | All | ~38 MB |
| `OctoCode-arm64-v8a.apk` | arm64 | ~26 MB |
| `OctoCode-armeabi-v7a.apk` | armv7 | ~24 MB |
| `OctoCode-x86_64.apk` | x86_64 | ~27 MB |
| `OctoCode-unsigned.ipa` | arm64 | ~40 MB |

### GitHub Pages (Web)

[https://sysarchx.github.io/OctoCode/](https://sysarchx.github.io/OctoCode/)

### is.gd Short Link

[https://is.gd/gtTeT0](https://is.gd/gtTeT0)

---

## 🌐 Internationalization (i18n)

### Supported Languages

- **English (en)**
- **Português (pt-BR)**
- **Español (es)**
- **Français (fr)**
- **Deutsch (de)**

### Language Detection

- Automatic detection via `expo-localization`
- Manual selector in Sidebar Settings (top of app)
- Persisted across sessions via AsyncStorage

### Unit 1: Lógica Adaptation

#### When Active Language = Português (pt-BR)

- Logic track uses **Portugol** (`se / senao`, `enquanto`, `escreva`, `leia`)
- OctoAI server responses in Portuguese
- Website and PWA texts in Portuguese

#### When Active Language = English or Other

- Logic track uses **Standard Pseudocode** (`IF / ELSE`, `WHILE`, `FOR`, `PRINT`, `INPUT`)
- OctoAI server responses translated to current language
- Website and PWA texts in current language
- All keyword lists adapted (off-topic words per language)

### i18n Directory Structure

```
src/i18n/
  en/
    tutor.json
    website.json
    pwa.json
    off_topic.json
  pt-BR/
    tutor.json
    website.json
    pwa.json
    off_topic.json
  es/
    tutor.json
    website.json
    pwa.json
    off_topic.json
  fr/
    tutor.json
    website.json
    pwa.json
    off_topic.json
  de/
    tutor.json
    website.json
    pwa.json
    off_topic.json
  translator/
    index.ts
    en.ts
    pt-BR.ts
    es.ts
    fr.ts
    de.ts
```

### Language Detection Implementation

```typescript
import { useEffect } from 'react';
import * as Localization from 'expo-localization';
import { useState } from 'react';

export const useLanguageDetector = () => {
  const [language, setLanguage] = useState<string>(Localization.locale);
  
  useEffect(() => {
    const handleChange = () => {
      setLanguage(Localization.locale);
    };
    const subscription = Localization.addEventListener('change', handleChange);
    return () => subscription.remove();
  }, []);
  
  return language;
};
```

---

## 🚀 Installation

### Prerequisites

- Node.js 20+
- npm or bun
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/SysArchX/OctoCode.git

# Install dependencies
cd OctoCode
npm install

# Start development
npm run dev
```

### iOS Specific

- Requires macOS with Xcode
- Run on macOS-latest GitHub Actions runner or local Mac

### Android Specific

- No Bun required (uses npm + Node.js 20)
- `bun.lock` removed to avoid package manager conflicts

---

## 🛠️ Usage

### First Time

1. Open the app and complete the 5-question placement test
2. Your rank (Beginner/Intermediate/Advanced) is determined
3. XP starts accumulating from the first correct answer
4. Your progress is saved locally and syncs when connection returns

### Daily Use

1. Select your language from the sidebar settings
2. Start a new logic track session
3. Answer 5 questions with increasing weight
4. Earn XP and watch your rank progress
5. Check the leaderboard for your language group
6. Use the mascot peek to open OctoAI chat

### Offline Mode

- All core functionality works without internet
- Progress saved locally, syncs when online
- PWA can be installed on iPhone (standalone mode) and desktop

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📬 Contact

- **GitHub**: [@SysArchX](https://github.com/SysArchX)
- **Repository**: [OctoCode](https://github.com/SysArchX/OctoCode)
- **Site**: [sysarchx.github.io/OctoCode](https://sysarchx.github.io/OctoCode/)