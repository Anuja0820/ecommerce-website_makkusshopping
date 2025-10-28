// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Allow VS Code Live Server (port 5500)
app.use(
  cors({
    origin: [/^http:\/\/127\.0\.0\.1:5500$/, /^http:\/\/localhost:5500$/],
    credentials: true
  })
);
app.use(express.json());

// Static /img serving from your frontend folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👉 Set this to the folder that CONTAINS your /img directory
const FRONTEND_ROOT = "D:/ecommerce_webiste/Build-and-Deploy-Ecommerce-Website";

app.use("/img", express.static(path.join(FRONTEND_ROOT, "img")));

// Helper: build absolute image URL that always points to /img/...
function toAbsoluteImageUrl(req, storedImagePath) {
  const host = `${req.protocol}://${req.get("host")}`;
  const p = String(storedImagePath || "")
    .replace(/^\/+/, "")
    .replace(/^img\//, ""); // remove leading img/ if present
  return `${host}/img/${p}`;
}

// ---------- Products ----------
app.get("/api/products", (req, res) => {
  const rows = db
    .prepare("SELECT id,title,price_cents,image,description FROM products")
    .all();
  rows.forEach(r => (r.image = toAbsoluteImageUrl(req, r.image)));
  res.json(rows);
});

app.get("/api/products/:id", (req, res) => {
  const r = db
    .prepare("SELECT id,title,price_cents,image,description FROM products WHERE id=?")
    .get(req.params.id);
  if (!r) return res.status(404).json({ error: "Not found" });
  r.image = toAbsoluteImageUrl(req, r.image);
  res.json(r);
});

// ---------- Orders ----------
// body: { email, name, address, city, country, items:[{id, qty}] }
app.post("/api/orders", (req, res) => {
  try {
    const { email, name, address, city, country, items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const find = db.prepare("SELECT id,title,price_cents FROM products WHERE id=?");
    let total = 0;
    const lines = items.map(it => {
      const p = find.get(it.id);
      if (!p) throw new Error(`Product ${it.id} not found`);
      const qty = Math.max(1, parseInt(it.qty || 1, 10));
      total += p.price_cents * qty;
      return { ...p, qty };
    });

    const orderStmt = db.prepare(`
      INSERT INTO orders (email,name,address,city,country,total_cents,status)
      VALUES (?,?,?,?,?,?, 'pending')
    `);
    const info = orderStmt.run(
      email || null,
      name || null,
      address || null,
      city || null,
      country || null,
      total
    );
    const orderId = info.lastInsertRowid;

    const itemStmt = db.prepare(`
      INSERT INTO order_items (order_id,product_id,title,price_cents,qty)
      VALUES (?,?,?,?,?)
    `);
    const tx = db.transaction(rows =>
      rows.forEach(r => itemStmt.run(orderId, r.id, r.title, r.price_cents, r.qty))
    );
    tx(lines);

    res.status(201).json({
      order_id: orderId,
      total_cents: total,
      currency: "USD",
      items: lines
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/orders/:id", (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE id=?").get(req.params.id);
  if (!order) return res.status(404).json({ error: "Not found" });
  const items = db.prepare("SELECT * FROM order_items WHERE order_id=?").all(order.id);
  res.json({ ...order, items });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
