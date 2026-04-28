# API Documentation

The following internal API endpoints power the Aaditri Signal Engine.

## 1. Reddit Scraper
`GET /api/reddit`

Fetches posts from targeted subreddits based on the intent layer.

**Parameters:**
- `layer` (optional): `direct` | `intent` | `tech` | `india` (Default: `direct`)

**Response:**
Standard Reddit JSON API response containing a list of posts.

---

## 2. Comment Drafter
`POST /api/draft`

Generates a targeted Reddit reply for a specific post.

**Request Body:**
```json
{
  "postTitle": "string",
  "postText": "string",
  "subreddit": "string"
}
```

**Response:**
```json
{
  "draft": "The generated comment text..."
}
```

---

## 3. Viral Post Generator
`POST /api/generate-post`

Analyzes multiple posts to generate a single high-authority inbound post.

**Request Body:**
```json
{
  "posts": [
    { "title": "string", "selftext": "string" }
  ],
  "layer": "string"
}
```

**Response:**
```json
{
  "title": "Viral Post Title",
  "body": "Viral Post Body Content",
  "suggestedSubreddit": "r/SaaS"
}
```

---

## Error Handling
All endpoints return a 500 status code with an error message if they fail:
```json
{
  "error": "Detailed error message",
  "details": "Optional stack trace or API specifics"
}
```
