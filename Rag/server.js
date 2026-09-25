import express from "express";
import { ingest, ingestDir, answer, storeSize } from "./rag.js";

const app = express();
app.use(express.json({ limit: "5mb" }));

app.get("/health", async (_req, res, next) => {
  try {
    res.json({ ok: true, chunks: await storeSize() });
  } catch (e) {
    next(e);
  }
});

app.post("/ingest", async (req, res, next) => {
  try {
    const { source, text } = req.body ?? {};
    if (!source || !text) return res.status(400).json({ error: "source and text are required" });
    const chunks = await ingest(source, text);
    res.json({ source, chunks });
  } catch (e) {
    next(e);
  }
});

app.post("/ask", async (req, res, next) => {
  try {
    const { question, topK } = req.body ?? {};
    if (!question) return res.status(400).json({ error: "question is required" });
    res.json(await answer(question, topK ?? 4));
  } catch (e) {
    next(e);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const port = process.env.PORT || 3000;

const count = await storeSize();
if (count === 0) {
  console.log("Indexing ./docs ...", await ingestDir("docs"));
}

app.listen(port, () => {
  console.log(`RAG server running on http://localhost:${port} (${count} chunks indexed)`);
});
