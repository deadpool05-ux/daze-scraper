# Setup and Installation

Follow these steps to get the Daze Signal Engine running locally.

## Prerequisites
- **Node.js**: v18.x or higher
- **NPM**: v9.x or higher

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/deadpool05-ux/daze-scraper.git
   cd daze-scraper
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```
   *Note: The engine will try Gemini first and fallback to Groq if the Gemini key is missing or the request fails.*

## Running the Application

### Development Mode
Run the development server with Turbopack:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Production Build
To create an optimized production build:
```bash
npm run build
npm start
```

## Troubleshooting
- **API Errors**: Ensure your API keys are valid and have sufficient quota.
- **Reddit Rate Limits**: If scraping fails, wait 60 seconds. The engine includes a local cache to minimize requests.
- **Missing Modules**: If you see "Module not found", run `npm install` again.
