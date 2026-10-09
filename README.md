<div align="center">

# 📸 Photo Narration

### *Turn Your Photos into Meaningful Stories with AI*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

<br/>

> **Photo Narration** is an AI-powered web application that transforms any image into rich, natural-language descriptions — powered by Google Gemini 2.5 Flash. Upload a photo, and let AI tell its story.

<br/>

![Demo Banner](https://img.shields.io/badge/🚀_Live_Demo-Click_Here-FF6B6B?style=for-the-badge)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖼️ **Smart Photo Narration** | Upload any photo and get an AI-generated description in seconds |
| 🤖 **Gemini 2.5 Flash** | Powered by Google's latest multimodal AI model |
| 👤 **User Authentication** | Secure login & signup via Firebase Auth |
| 🗂️ **Story Dashboard** | Manage, edit, and revisit your past narrated stories |
| 🌍 **Explore Feed** | Browse stories shared by the community |
| ❤️ **Like & Interact** | Engage with stories through likes |
| ⚡ **Blazing Fast** | Vite-powered frontend with instant HMR |
| 🎨 **Modern UI** | Glassmorphism design with smooth Framer Motion animations |
| 🔐 **Secure by Design** | API keys server-side only, Firestore security rules enforced |

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React + TypeScript | `19.x` / `5.8` |
| **Build Tool** | Vite | `6.x` |
| **Styling** | Tailwind CSS | `4.x` |
| **Animations** | Motion (Framer) | `12.x` |
| **Icons** | Lucide React | `0.546` |
| **Backend** | Express.js | `4.x` |
| **AI Model** | Google Gemini 2.5 Flash | `@google/genai 2.x` |
| **Database** | Cloud Firestore | Firebase `12.x` |
| **Auth** | Firebase Authentication | Firebase `12.x` |
| **Runtime** | Node.js + tsx | `v24+` |

</div>

---

## 📁 Project Structure

```
📦 Photo_Narration/
├── 📂 src/
│   ├── 📂 components/        # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── AuthModal.tsx
│   │   ├── StoryCard.tsx
│   │   ├── PhotoUploadZone.tsx
│   │   ├── LikeButton.tsx
│   │   ├── Toast.tsx
│   │   └── ...
│   ├── 📂 pages/             # Application pages
│   │   ├── HomePage.tsx
│   │   ├── UploadPage.tsx
│   │   ├── ExplorePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── StoryDetailPage.tsx
│   │   └── EditStoryPage.tsx
│   ├── 📂 firebase/          # Firebase config & Firestore helpers
│   ├── 📂 context/           # React context providers
│   ├── 📂 hooks/             # Custom React hooks
│   ├── 📂 types/             # TypeScript type definitions
│   ├── App.tsx               # Root component & routing
│   └── main.tsx              # Application entry point
├── 📄 server.ts              # Express server + Gemini AI endpoint
├── 📄 index.html             # HTML entry point
├── 📄 vite.config.ts         # Vite configuration
├── 📄 tsconfig.json          # TypeScript configuration
├── 📄 firestore.rules        # Firestore security rules
├── 📄 package.json           # Dependencies & scripts
└── 📄 .env.example           # Environment variable template
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have:

- [Node.js](https://nodejs.org/) `v18+` installed
- [Git](https://git-scm.com/) installed
- A **Google AI Studio API Key** → [Get one here](https://aistudio.google.com/app/apikey)
- A **Firebase Project** → [Create one here](https://console.firebase.google.com/)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Eclipse1911/Photo_Narration.git
cd Photo_Narration
```

### Step 2 — Install Dependencies

```bash
# Using npm
npm install

# Or using Bun (faster)
bun install
```

### Step 3 — Configure Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
# Required — Your Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional — Public URL of your deployment
APP_URL=http://localhost:3000
```

> [!WARNING]
> **Never commit your `.env` file.** It is already added to `.gitignore` to keep your secrets safe.

### Step 4 — Start the Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser. 🎉

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server (Express + Vite HMR) |
| `npm run build` | Build for production (frontend + server bundle) |
| `npm run start` | Run the production server |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Type-check the TypeScript code |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/narrate` | Send a base64 image → get AI narration |
| `GET` | `/api/health` | Server health check |

**Example request to `/api/narrate`:**
```json
{
  "imageBase64": "<base64_encoded_image>",
  "mimeType": "image/jpeg",
  "hint": "a sunset at the beach"
}
```

---

## 📖 How to Use

1. **Sign up / Log in** using the Auth modal
2. **Go to Upload** — drag & drop or select a photo
3. **Let AI narrate** — Gemini 2.5 Flash analyzes the image
4. **Read your story** — view the generated narration
5. **Explore** — browse stories from other users
6. **Manage** — edit or delete your stories from the Dashboard

---

## 🔮 Future Enhancements

- [ ] 🔊 **Text-to-Speech** — Listen to AI narrations out loud
- [ ] 🌍 **Multilingual Support** — Narrations in multiple languages
- [ ] 📚 **Batch Processing** — Narrate multiple images at once
- [ ] ♿ **Accessibility Mode** — Screen-reader optimized output
- [ ] 🗂️ **Export Stories** — Download narrations as PDF / text
- [ ] 📝 **Custom Prompts** — Let users guide the AI narration style

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** this repository
2. **Create** a new branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to your branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 🔒 Security

- 🔑 API keys are **server-side only** — never exposed to the client
- 🛡️ Firestore security rules enforce **per-user data access**
- 🚫 `.env` and secret files are **gitignored** by default
- 📋 Review `firestore.rules` before deploying to production

---

## 👨‍💻 Author

<div align="center">

**Aryan** · [@Eclipse1911](https://github.com/Eclipse1911)

[![GitHub](https://img.shields.io/badge/GitHub-Eclipse1911-181717?style=for-the-badge&logo=github)](https://github.com/Eclipse1911)

*Built with ❤️ at MIT-WPU*

</div>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

⭐ **If you found this project helpful, please give it a star!** ⭐

[![GitHub Repo](https://img.shields.io/badge/🔗_Repository-Photo__Narration-blue?style=for-the-badge)](https://github.com/Eclipse1911/Photo_Narration)

</div>
