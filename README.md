# 🛡️ CYBER TYPING DEFENSE — Fortress Protocol

A vibrant cyberpunk Typing Tower Defense game built with **React**, **TypeScript**, **Tailwind CSS**, and **HTML5 Web Audio API**. Defend your fortress core by typing words floating above enemy bots before they breach your perimeter.

![Version](https://img.shields.io/badge/version-1.0.0-cyan.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-teal.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🎮 Game Features

- **Dynamic 60 FPS Arena**: 4 Horizontal Defense Lanes with continuous movement engine.
- **Smart Target-Locking Engine**: First-letter lock-on targeting prioritizing the closest and most threatening hostiles.
- **Enemy Modifiers**:
  - **Cyber Drone (Scout)**: Fast-moving units with quick words.
  - **Assault Mech**: Balanced armored units.
  - **Siege Juggernaut (Tank)**: High HP units with long complex words.
  - **2-Layer Armored Units**: Shield Bubble requires typing `[SHIELD]` word before exposing hull word.
  - **Mirror Drones (Reverse)**: Reverse typing mechanics (right-to-left typing `[<- REV]`).
- **Wave 5 Boss Encounter**:
  - **`TITAN-0 // CORE OVERMIND`**: Multi-phase boss battle with dedicated Segmented Boss HUD.
- **Strategic Turrets & Upgrades**:
  - **Cryo Pylon (150g)**: 35% permanent lane slow aura.
  - **Tesla Coil (250g)**: Chain lightning arc auto-types adjacent hostiles.
  - **Kinetic Overclock (200g)**: +50% Gold bonus and a 1-hit kinetic breach shield.
- **Tactical Panic Commands**:
  - `NUKE` (300g): Orbital wipe across all lanes.
  - `FREEZE` (150g): 5-second cryogenic stasis.
  - `REPAIR` (100g): Restores +25 Core HP.
- **Procedural Web Audio Engine**: Zero external audio dependencies — realistic mechanical switch keyclicks, laser beams, explosions, and alarm sirens synthesized via Web Audio API.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation
```bash
git clone https://github.com/asgar-vibe/typing-tower-defense.git
cd typing-tower-defense
npm install
npm run dev
```

---

## 📦 Deployment to GitHub Pages

### Method 1: Direct Branch Deployment via `gh-pages` (Recommended & Zero Hassle)
```bash
npm run deploy
```
Then go to **GitHub Repository Settings ➔ Pages**:
- **Source**: Deploy from a branch
- **Branch**: `gh-pages` / `/(root)`

### Method 2: GitHub Actions
Push to `main` branch. The pre-configured `.github/workflows/deploy.yml` workflow will automatically build and publish to GitHub Pages.
*(Ensure **Settings ➔ Pages ➔ Source** is set to **GitHub Actions**)*

---

## 📄 License
MIT License.
