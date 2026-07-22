import { Router } from "express";
import { db } from "@workspace/db";
import { quotesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

// GET /api/quotes
router.get("/quotes", async (req, res) => {
  const { category } = req.query as { category?: string };
  let quotes;
  if (category) {
    quotes = await db
      .select()
      .from(quotesTable)
      .where(eq(quotesTable.category, category));
  } else {
    quotes = await db.select().from(quotesTable);
  }
  res.json(
    quotes.map((q) => ({
      id: q.id,
      text: q.text,
      author: q.author,
      category: q.category,
      categoryLabel: q.categoryLabel,
      imageUrl: q.imageUrl,
      imageAlt: q.imageAlt,
    }))
  );
});

// GET /api/quotes/random  — must come before /:id
router.get("/quotes/random", async (req, res) => {
  const { category } = req.query as { category?: string };
  let query = db
    .select()
    .from(quotesTable)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (category) {
    const quotes = await db
      .select()
      .from(quotesTable)
      .where(eq(quotesTable.category, category))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    if (!quotes.length) {
      res.status(404).json({ error: "No quotes found for that category" });
      return;
    }
    const q = quotes[0];
    res.json({
      id: q.id,
      text: q.text,
      author: q.author,
      category: q.category,
      categoryLabel: q.categoryLabel,
      imageUrl: q.imageUrl,
      imageAlt: q.imageAlt,
    });
    return;
  }

  const quotes = await query;
  if (!quotes.length) {
    res.status(404).json({ error: "No quotes found" });
    return;
  }
  const q = quotes[0];
  res.json({
    id: q.id,
    text: q.text,
    author: q.author,
    category: q.category,
    categoryLabel: q.categoryLabel,
    imageUrl: q.imageUrl,
    imageAlt: q.imageAlt,
  });
});

// GET /api/quotes/categories
router.get("/quotes/categories", async (_req, res) => {
  const rows = await db
    .select({
      category: quotesTable.category,
      categoryLabel: quotesTable.categoryLabel,
      count: sql<number>`count(*)::int`,
    })
    .from(quotesTable)
    .groupBy(quotesTable.category, quotesTable.categoryLabel);

  res.json(
    rows.map((r) => ({
      slug: r.category,
      label: r.categoryLabel,
      count: r.count,
    }))
  );
});

// GET /api/quotes/:id
router.get("/quotes/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const quotes = await db
    .select()
    .from(quotesTable)
    .where(eq(quotesTable.id, id))
    .limit(1);
  if (!quotes.length) {
    res.status(404).json({ error: "Quote not found" });
    return;
  }
  const q = quotes[0];
  res.json({
    id: q.id,
    text: q.text,
    author: q.author,
    category: q.category,
    categoryLabel: q.categoryLabel,
    imageUrl: q.imageUrl,
    imageAlt: q.imageAlt,
  });
});

export default router;
