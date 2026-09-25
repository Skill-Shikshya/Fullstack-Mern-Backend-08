
# 🚀 RAG API Instructions

This document explains how to set up, run, and test the RAG Express API.

---

## 1. Prerequisites

Before starting the API server, make sure the following are available:

### ChromaDB

ChromaDB should be running locally, for example:

```text
http://localhost:8000
```

### Gemini API Key

Create a `.env` file in the project root and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 2. Start the Express Server

Install the project dependencies if you haven't already:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The API should be available at:

```text
http://localhost:3000
```

---

# 📡 API Endpoints

## 3. Health Check

Use the health endpoint to verify that the Express server is running and to see the current number of indexed vector chunks in ChromaDB.

### Endpoint

```http
GET /health
```

### Request

```bash
curl http://localhost:3000/health
```

### Expected Response

```json
{
  "ok": true,
  "chunks": 0
}
```

### Response Fields

| Field    | Description                                      |
| -------- | ------------------------------------------------ |
| `ok`     | Indicates whether the server is running          |
| `chunks` | Number of vector chunks currently stored/indexed |

---

# 4. Ingest Document Text

The `/ingest` endpoint adds document text to ChromaDB.

The text is split into chunks, converted into embeddings, and stored for later retrieval.

If a document with the same `source` already exists, re-ingesting it will overwrite its previous chunks.

### Endpoint

```http
POST /ingest
```

### Headers

```http
Content-Type: application/json
```

### Request Body

| Field    | Type   | Required | Description                              |
| -------- | ------ | -------- | ---------------------------------------- |
| `source` | string | Yes      | File name or identifier for the document |
| `text`   | string | Yes      | Plain text content to chunk and store    |

### Example Request

```bash
curl -X POST http://localhost:3000/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "company_policy.md",
    "text": "Remote Work Policy: Employees are permitted to work remotely up to 2 days per week with manager approval. Core collaboration hours are between 10:00 AM and 4:00 PM. All hardware requests must be submitted through the IT Help Desk portal."
  }'
```

### Expected Response

```json
{
  "source": "company_policy.md",
  "chunks": 1
}
```

---

# 5. Ask a Question

The `/ask` endpoint performs the main RAG workflow:

1. Receives a question.
2. Searches ChromaDB for relevant document chunks.
3. Retrieves the most relevant context.
4. Sends the context and question to Gemini.
5. Gemini generates an answer.
6. The API returns the answer along with its sources.

The API uses:

```text
gemini-2.5-flash
```

for answer generation.

### Endpoint

```http
POST /ask
```

### Headers

```http
Content-Type: application/json
```

### Request Body

| Field      | Type   | Required | Default | Description                                   |
| ---------- | ------ | -------- | ------- | --------------------------------------------- |
| `question` | string | Yes      | —       | Question that should be answered              |
| `topK`     | number | No       | `4`     | Number of relevant context chunks to retrieve |

### Example Request

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the rules for working remotely?",
    "topK": 4
  }'
```

### Expected Response

```json
{
  "answer": "According to the company policy, employees can work remotely up to 2 days per week provided they have manager approval [1].",
  "sources": [
    {
      "ref": 1,
      "source": "company_policy.md",
      "score": 0.852,
      "snippet": "Remote Work Policy: Employees are permitted to work remotely up to 2 days per week with manager approval..."
    }
  ]
}
```

### Response Fields

| Field     | Description                                      |
| --------- | ------------------------------------------------ |
| `answer`  | Generated answer from Gemini                     |
| `sources` | Documents/chunks used to generate the answer     |
| `ref`     | Reference number used for inline citations       |
| `source`  | Original document identifier                     |
| `score`   | Similarity/relevance score returned by retrieval |
| `snippet` | Relevant piece of the source document            |

---

# 🧪 Testing with Postman or Thunder Client

You can also test the API using:

* Postman
* Thunder Client
* VS Code REST Client
* Any HTTP client

For JSON requests, make sure the following header is present:

```http
Content-Type: application/json
```

---

## 6. Test `/ingest`

### Method

```http
POST
```

### URL

```text
http://localhost:3000/ingest
```

### Body

Select:

```text
Body → raw → JSON
```

Then use:

```json
{
  "source": "onboarding.txt",
  "text": "New hires must complete security compliance training within their first two weeks of employment."
}
```

---

## 7. Test `/ask`

### Method

```http
POST
```

### URL

```text
http://localhost:3000/ask
```

### Body

```json
{
  "question": "When must new employees complete training?",
  "topK": 2
}
```

---

# 🔄 Recommended Testing Flow

When testing the complete RAG system, follow this order:

### Step 1 — Start ChromaDB

Make sure ChromaDB is running:

```text
http://localhost:8000
```

### Step 2 — Start the Express API

```bash
npm run dev
```

### Step 3 — Check the server

```bash
curl http://localhost:3000/health
```

### Step 4 — Ingest a document

```bash
curl -X POST http://localhost:3000/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "onboarding.txt",
    "text": "New hires must complete security compliance training within their first two weeks of employment."
  }'
```

### Step 5 — Ask a question

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "When must new employees complete training?",
    "topK": 2
  }'
```

### Step 6 — Verify the response

The response should contain:

* A generated `answer`
* A `sources` array
* The relevant document
* A similarity/relevance `score`
* A relevant `snippet`

---

# 🧠 RAG Request Flow

The overall system works like this:

```text
                 ┌──────────────┐
                 │    Client    │
                 │ Postman/cURL │
                 └──────┬───────┘
                        │
                        ▼
              ┌───────────────────┐
              │   Express API     │
              └─────────┬─────────┘
                        │
             ┌──────────┴──────────┐
             │                     │
             ▼                     ▼
       POST /ingest            POST /ask
             │                     │
             ▼                     ▼
       Split document        Embed question
             │                     │
             ▼                     ▼
       Create embeddings     Search ChromaDB
             │                     │
             ▼                     ▼
          ChromaDB ◄──────── Retrieve chunks
                                   │
                                   ▼
                              Gemini API
                                   │
                                   ▼
                              Final answer
                                   │
                                   ▼
                               Client
```

---

# ⚠️ Common Issues

## ChromaDB Connection Error

If the API cannot connect to ChromaDB, verify that ChromaDB is running and accessible at:

```text
http://localhost:8000
```

## Gemini API Error

Verify that your `.env` contains:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Also make sure the Express application loads environment variables before accessing the key.

## Empty Search Results

If `/ask` does not return useful sources, first verify that documents have been successfully ingested:

```bash
curl http://localhost:3000/health
```

Check the `chunks` value.

If it is `0`, ingest a document before asking questions.

---

# ✅ Quick Reference

| Endpoint  | Method | Purpose                                 |
| --------- | ------ | --------------------------------------- |
| `/health` | `GET`  | Check API and indexed chunk count       |
| `/ingest` | `POST` | Add document text to ChromaDB           |
| `/ask`    | `POST` | Retrieve context and generate an answer |

### Base URL

```text
http://localhost:3000
```

### ChromaDB

```text
http://localhost:8000
```
