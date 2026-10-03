const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'dev.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
    return;
  }
  console.log('Connected to SQLite database for seeding.');
});

const products = [
  { name: 'Flavoured Mabuyu Vinto', category: 'Mabuyu', price: 60, tag: 'Best Selling', image: '/assets/hero.png', description: 'Sweet and spicy traditional mabuyu.' },
  { name: 'Flavoured Mabuyu Blueberry', category: 'Mabuyu', price: 60, tag: 'Fresh', image: '/assets/mabuyu.jpeg', description: 'Delicious blueberry coated mabuyu.' },
  { name: 'Spicy Tangy Achari', category: 'Achari', price: 70, tag: 'Hot Seller', image: '/assets/achari.jpeg', description: 'Authentic tangy mango achari.' },
  { name: 'Crunchy Coconut Kashata', category: 'Kashata', price: 30, tag: 'Sweet', image: '/assets/kashata.jpeg', description: 'Crispy coconut peanut brittle.' },
  { name: 'Fresh Salted Popcorn', category: 'Snacks', price: 60, tag: 'Hot', image: '/assets/popcorn.jpeg', description: 'Freshly popped crunchy popcorn.' },
  { name: 'Njugu Mraba Pack', category: 'Nuts', price: 130, tag: 'Value Pack', image: '/assets/njugu mraba.jpeg', description: 'Crunchy squared peanuts.' },
  { name: 'Rich Swahili Labania Pack', category: 'Labania', price: 130, tag: 'Delicacy', image: '/assets/labania.jpeg', description: 'Traditional creamy Swahili sweet.' }
];

db.serialize(() => {
  db.run('PRAGMA foreign_keys = OFF;');
  db.run('CREATE TABLE IF NOT EXISTS category (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, createdAt TEXT DEFAULT CURRENT_TIMESTAMP)');
  db.run('CREATE TABLE IF NOT EXISTS product (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, price REAL NOT NULL, image TEXT NOT NULL, badge TEXT, categoryId INTEGER NOT NULL, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (categoryId) REFERENCES category(id))');

  db.run(`DELETE FROM product`);
  db.run(`DELETE FROM category`, (err) => {
    if (err) {
      console.error("Error clearing tables:", err);
      return;
    }

    const categories = [...new Set(products.map(p => p.category))];
    let categoriesInserted = 0;
    const categoryMap = {};

    categories.forEach(catName => {
      db.run(`INSERT INTO category (name) VALUES (?)`, [catName], function(err) {
        if (err) {
          console.error(`Error inserting category ${catName}:`, err.message);
          return;
        }
        categoryMap[catName] = this.lastID;
        categoriesInserted++;

        if (categoriesInserted === categories.length) {
          const stmt = db.prepare(`INSERT INTO product (name, categoryId, price, badge, image, description) VALUES (?, ?, ?, ?, ?, ?)`);
          
          products.forEach((p) => {
            const catId = categoryMap[p.category] || 1;
            stmt.run(p.name, catId, p.price, p.tag, p.image, p.description);
          });

          stmt.finalize(() => {
            db.run('PRAGMA foreign_keys = ON;');
            console.log('Database seeded successfully with all categories and products!');
            db.close();
          });
        }
      });
    });
  });
});