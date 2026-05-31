# Learnify

Learnify is a short-form learning app concept: a social-style vertical feed where users scroll through AI-generated micro lessons for a topic they want to learn.

This repository currently contains a front-end MVP built with Vite, React, and TypeScript. The app uses mock lesson data and placeholder media so the product shape is clear before wiring real AI video generation.

## What is included

- Topic onboarding with starter learning paths
- TikTok-style lesson feed with For You, Focus, and Saved modes
- AI lesson cards with hook, transcript, key points, quiz reveal, and next step
- Persistent local progress for completed lessons, saved lessons, and daily goal
- Saved lessons queue
- Topic switching without leaving the feed
- AI generation briefs on each lesson to prepare future script/video generation
- Responsive mobile-first UI

## Tech stack

- Vite
- React
- TypeScript
- CSS modules via plain CSS files

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Build

```bash
npm run build
```

## Environment

Copy `.env.example` to `.env` when real AI providers are added.

```bash
cp .env.example .env
```

## Product direction

The current MVP is intentionally front-end only. The next production steps are:

1. Add auth and user profiles.
2. Store topics, progress, saves, and watch history in a database.
3. Add an AI lesson generation endpoint that creates lesson scripts from the saved briefs.
4. Add a video rendering pipeline for lesson scripts and voiceover.
5. Replace placeholder thumbnails with generated or uploaded lesson media.
6. Add recommendations based on completed lessons and quiz answers.
