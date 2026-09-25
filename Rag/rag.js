import fs from "node:fs/promises";
import path from "node:path";
import { ChromaClient } from "chromadb";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";
import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const COLLECTION_NAME = process.env.CHROMA_COLLECTION || "rag_docs";

// ---------- 1. Embedding Function ----------
const embedder = new DefaultEmbeddingFunction();

// ---------- 2. Chunking ----------
export function chunkText(text, size = 800, overlap = 150) {
  const clean = text.replace(/\r\n/g, "\n").trim();
  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);
    if (end < clean.length) {
      const window = clean.slice(start, end);
      const cut = Math.max(window.lastIndexOf("\n\n"), window.lastIndexOf(". "));
      if (cut > size * 0.5) end = start + cut + 1;
    }
    const piece = clean.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end >= clean.length) break;
    start = end - overlap;
  }
  return chunks;
}

// ---------- 3. Vector store (Chroma) ----------
const chromaUrl = new URL(CHROMA_URL);
const client = new ChromaClient({
  host: chromaUrl.hostname,
  port: parseInt(chromaUrl.port || (chromaUrl.protocol === "https:" ? "443" : "8000")),
  ssl: chromaUrl.protocol === "https:",
});

let collection;

export async function getCollection() {
  collection ??= await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    metadata: { "hnsw:space": "cosine" },
    embeddingFunction: embedder,
  });
  return collection;
}

export async function storeSize() {
  const col = await getCollection();
  return col.count();
}

export async function ingest(source, text) {
  const col = await getCollection();

  await col.delete({ where: { source } }).catch(() => {});

  const chunks = chunkText(text);
  if (chunks.length === 0) return 0;

  const ids = chunks.map((_, i) => `${source}#${i}`);
  const metadatas = chunks.map(() => ({ source }));

  // Pass plain text - Chroma automatically generates embeddings
  await col.add({ ids, documents: chunks, metadatas });
  return chunks.length;
}

export async function ingestDir(dir = "docs") {
  try {
    const files = (await fs.readdir(dir)).filter((f) => /\.(md|txt)$/i.test(f));
    let total = 0;
    for (const f of files) {
      total += await ingest(f, await fs.readFile(path.join(dir, f), "utf8"));
    }
    return { files: files.length, chunks: total };
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.mkdir(dir, { recursive: true });
      return { files: 0, chunks: 0 };
    }
    throw err;
  }
}

// ---------- 4. Retrieval ----------
export async function retrieve(query, k = 4, minScore = 0.2) {
  const col = await getCollection();

  // Pass query text - Chroma automatically generates query embeddings
  const res = await col.query({ queryTexts: [query], nResults: k });

  const docs = res.documents[0] ?? [];
  const metas = res.metadatas[0] ?? [];
  const dists = res.distances[0] ?? [];
  const ids = res.ids[0] ?? [];

  return ids
    .map((id, i) => ({
      id,
      text: docs[i],
      source: metas[i]?.source,
      score: 1 - dists[i],
    }))
    .filter((c) => c.score >= minScore);
}

// ---------- 5. Generation ----------
let ai;
const getClient = () => (ai ??= new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY 
}));

export async function answer(question, k = 4) {
  const hits = await retrieve(question, k);

  if (hits.length === 0) {
    return { answer: "I couldn't find anything relevant in the knowledge base.", sources: [] };
  }

  const context = hits
    .map((h, i) => `[${i + 1}] (source: ${h.source})\n${h.text}`)
    .join("\n\n");

  const res = await getClient().models.generateContent({
    model: MODEL,
    contents: `Context:\n${context}\n\nQuestion: ${question}`,
    config: {
      systemInstruction:
        "You answer questions using ONLY the provided context. " +
        "Cite sources inline like [1], [2]. " +
        "If the context doesn't contain the answer, say you don't know.",
      maxOutputTokens: 1000,
    },
  });

  return {
    answer: res.text,
    sources: hits.map((h, i) => ({
      ref: i + 1,
      source: h.source,
      score: +h.score.toFixed(3),
      snippet: h.text.slice(0, 200),
    })),
  };
}
