# OpportunityPilot

**A Pre-Meeting Briefing Agent and AI Agent Benchmarking Platform**

## About the Project

OpportunityPilot is a frontend prototype designed to help users prepare for professional meetings by organising meeting-related information and preparation details.

The project aims to bring meeting preparation and AI agent evaluation together in one platform.

## Problem Statement

Preparing for interviews, internships, networking sessions, and professional meetings requires collecting information and organising relevant questions and talking points.

OpportunityPilot is being developed to simplify this preparation process through a structured platform.

## Current Features

The following features are implemented in the current frontend:

- **Home Page:** Introduces OpportunityPilot, its purpose, workflow, and planned capabilities.
- **Preparation Form:** Allows users to enter company or organisation details, meeting information, purpose, personal background, and additional goals.
- **Form Validation:** Required fields are validated before submission.
- **Preparation Summary:** Displays a frontend confirmation of the submitted preparation details.
- **Navigation:** Provides navigation between the main project pages.
- **Responsive Layout:** Uses a responsive frontend layout.

## Pages

| Page | Current Status |
|---|---|
| Home | Implemented |
| Prepare | Frontend form implemented |
| Meeting Briefing | Placeholder |
| Agent Benchmarking | Placeholder |
| About | Placeholder |

## Technology Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React

## Project Setup

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/snidhireddy-eng/opportunitypilot.git
   ```

2. Navigate into the project directory:

   ```bash
   cd opportunitypilot
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in your terminal.

### Available Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Starts development server |
| `npm run build` | Builds the frontend |
| `npm run lint` | Runs ESLint |
| `npm run typecheck` | Checks TypeScript types |
| `npm run preview` | Previews production build |

## Current Development Status

This repository contains the initial frontend implementation.

The following integrations and functionalities are not yet implemented:

- Live web research using Tavily.
- AI agent integration using Bifrost.
- Automated meeting briefing generation.
- Agent benchmarking and scoring.
- Backend services and database integration.

These are planned development areas, not currently working features.

## Project Goal

The goal is to develop OpportunityPilot into a platform that can generate research-backed meeting preparation briefings and evaluate AI agents using measurable performance criteria.

---

**Project:** OpportunityPilot  
**Status:** Frontend prototype  
**Hackathon:** Global AI Hackathon 2026
