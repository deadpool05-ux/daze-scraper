# Technical Architecture

The Aaditri Signal Engine is built as a modern Next.js application using React (Frontend) and API Routes (Backend).

## Data Flow

1. **Scraping Layer (`/api/reddit`)**:
   - Accepts a `layer` parameter (direct, intent, tech, india).
   - Maps the layer to a list of relevant subreddits.
   - Fetches the latest 50 posts from those subreddits using the Reddit JSON API.
   - Returns raw post data to the frontend.

2. **Qualification Layer (Frontend)**:
   - The frontend iterates through posts and applies a keyword-matching algorithm.
   - It calculates a `matchCount` based on a curated list of high-intent keywords.
   - Users can filter leads dynamically by adjusting the `Min Keywords` threshold.

3. **AI Generation Layer (`/api/draft` & `/api/generate-post`)**:
   - **Service Selection**: The backend checks for `GEMINI_API_KEY`. If present, it initializes the Gemini 2.5 Flash model.
   - **Fallback Mechanism**: If Gemini fails or the key is missing, it automatically switches to the Groq API using the `llama-3.3-70b-versatile` model.
   - **Contextual Injection**: Relevant post data (titles, bodies) is injected into specialized prompts designed for the "Aaditri Voice".

## Frontend Components
- **Lead Layers Sidebar**: Navigation for different scraping targets.
- **Signal Feed**: Real-time display of qualified leads with keyword highlighting.
- **AI Modal**: Interface for viewing and copying generated inbound posts.
- **Drafting Tool**: Inline generation of comment replies for specific leads.

## Technology Stack
- **Framework**: Next.js 16 (Turbopack)
- **Styling**: Tailwind CSS (Custom Dark Theme)
- **AI Models**: Google Gemini & Groq (Llama 3)
- **State Management**: React Hooks (useState, useEffect)
