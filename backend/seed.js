// seed.js
import db from "./db.js";

const upsert = db.prepare(`
  INSERT INTO products (id, title, price_cents, image, description)
  VALUES (@id, @title, @price_cents, @image, @description)
  ON CONFLICT(id) DO UPDATE SET
    title=excluded.title,
    price_cents=excluded.price_cents,
    image=excluded.image,
    description=excluded.description
`);

const products = [
  { id: "f1", title: "Cartoon Astronaut T-shirt",       price_cents: 7800, image: "img/products/f1.jpg", description: "Soft cotton tee with playful astronaut design." },
  { id: "f2", title: "Tropical Palm Leaf Shirt",         price_cents: 8200, image: "img/products/f2.jpg", description: "Breathable cotton, ideal for summer." },
  { id: "f3", title: "Vintage Floral Casual Shirt",      price_cents: 7600, image: "img/products/f3.jpg", description: "Retro floral with a light feel." },
  { id: "f4", title: "Sakura Blossom Shirt",             price_cents: 8000, image: "img/products/f4.jpg", description: "Elegant sakura pattern." },
  { id: "f5", title: "Navy Garden Print Shirt",          price_cents: 7800, image: "img/products/f5.jpg", description: "Navy floral pattern." },
  { id: "f6", title: "Dual-Tone Linen Shirt",            price_cents: 7800, image: "img/products/f6.jpg", description: "Two-tone breathable linen." },
  { id: "f7", title: "Relaxed Beige Linen Pants",        price_cents: 7800, image: "img/products/f7.jpg", description: "Comfy straight-leg pants." },
  { id: "f8", title: "Abstract Oversized Top",           price_cents: 7800, image: "img/products/f8.jpg", description: "Loose fit with abstract print." },
  { id: "n1", title: "Light Blue Formal Shirt",          price_cents: 8800, image: "img/products/n1.jpg", description: "Classic formal shirt." },
  { id: "n2", title: "Grey Check Business Shirt",        price_cents: 8900, image: "img/products/n2.jpg", description: "Wrinkle-resistant blend." },
  { id: "n3", title: "White Linen Button-Up",            price_cents: 7900, image: "img/products/n3.jpg", description: "Breathable linen." },
  { id: "n4", title: "Desert Khaki Shirt",               price_cents: 7800, image: "img/products/n4.jpg", description: "Casual khaki button-up." },
  { id: "n5", title: "Sky-Blue Casual Shirt",            price_cents: 7800, image: "img/products/n5.jpg", description: "Soft sky-blue tone." },
  { id: "n6", title: "Striped Summer Shorts",            price_cents: 7800, image: "img/products/n6.jpg", description: "Light striped shorts." },
  { id: "n7", title: "Desert Khaki Shirt (Variant)",     price_cents: 7800, image: "img/products/n7.jpg", description: "Casual khaki variant." },
  { id: "n8", title: "Black Formal Shirt",               price_cents: 9500, image: "img/products/n8.jpg", description: "Timeless black formal." }
];

const tx = db.transaction((rows) => rows.forEach(p => upsert.run(p)));
tx(products);

console.log("Seeded products:", products.length);
