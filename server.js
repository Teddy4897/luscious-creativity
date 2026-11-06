// ============================================================
// server.js: main file for the Luscious Creativity website
// ============================================================


// ---------- 1. PACKAGES ----------
// Load the tools this site depends on
const express = require('express');          // web framework (runs the server)
const bodyParser = require('body-parser');   // reads data sent from forms
const session = require('express-session');  // remembers each visitor's cart

// ---------- 2. APP SETUP ----------
const app = express();   // create the app
const port = process.env.PORT || 3000;       // online host's port, or 3000 on your computer'

// ---------- 3. SETTINGS ----------
// Use EJS for the pages in the "views" folder
app.set('view engine', 'ejs');

// ---------- 4. MIDDLEWARE ----------
// Code that runs on every visit, before the routes

// Read form data (needed for search and cart buttons)
app.use(bodyParser.urlencoded({ extended: true }));

// Serve files from the "public" folder (CSS, images)
app.use(express.static('public'));

// Remember each visitor's cart between page loads
app.use(session({
    secret: 'luscious-creativity-secret',
    resave: false,
    saveUninitialized: true
}));

// Make the cart item count available on every page header
app.use((req, res, next) => {
    const cart = req.session.cart || {};
    res.locals.cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
    next();
});

// ---------- 5. PRODUCT DATA ----------
// All products in the shop (later this can come from a database)
const products = [
    { id: 1, name: 'Fogg Fragrance Set', category: 'Fragrance', price: 250, image: '/images/IMG-20261105-WA0014.jpg', description: 'Fogg Roll-On, Fogg Body Spray and Fogg Pocket Spray' },
{ id: 2, name: 'Body Scrub Collection', category: 'Body Care', price: 800, image: '/images/IMG-20261105-WA0015.jpg', description: 'Scrub: Cucumber, Strawberry, Milk, Honey, Papaya and Coffee Sea Salt Bath' },
{ id: 3, name: 'Luron Body Splash', category: 'Fragrance', price: 350, image: '/images/IMG-20261105-WA0016.jpg', description: 'Luron Body Splash for Men and Women' },
{ id: 4, name: 'Shower Gel Collection', category: 'Body Care', price: 1200, image: '/images/IMG-20261105-WA0017.jpg', description: 'Shower gels for every mood: WaterLily, Creme, Lemongrass and more' }
];

// ---------- 6. ROUTES: SHOP PAGES ----------

// Homepage: shows all products
app.get('/', (req, res) => {
    res.render('index', { products, heading: 'Featured Products', showHero: true });
});

// Search: shows products whose name or description match the search text
app.get('/search', (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    const results = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
    );
    res.render('index', { products: results, heading: `Results for "${req.query.q}"` });
});

// Category: shows products from one category (e.g. /category/Fragrance)
app.get('/category/:name', (req, res) => {
    const name = req.params.name;
    const results = products.filter(p => p.category.toLowerCase() === name.toLowerCase());
    res.render('index', { products: results, heading: name });
});

// Product page: shows one product, found by its id in the URL
app.get('/product/:id', (req, res) => {
    const product = products.find(p => p.id === Number(req.params.id));
    if (!product) {
        return res.status(404).send('Product not found');
    }
    res.render('product', { product });
});

// ---------- 7. ROUTES: CART ----------

// Add one of a product to the cart, then open the cart page
app.post('/cart/add/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!req.session.cart) req.session.cart = {};
    req.session.cart[id] = (req.session.cart[id] || 0) + 1;
    res.redirect('/cart');
});

// Cart page: lists items, quantities, subtotals and the total
app.get('/cart', (req, res) => {
    const cart = req.session.cart || {};
    const items = Object.keys(cart).map(id => {
        const product = products.find(p => p.id === Number(id));
        return { ...product, quantity: cart[id], subtotal: product.price * cart[id] };
    });
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    res.render('cart', { items, total });
});

// Remove a product from the cart
app.post('/cart/remove/:id', (req, res) => {
    if (req.session.cart) delete req.session.cart[req.params.id];
    res.redirect('/cart');
});

// ---------- 8. START THE SERVER ----------
// Begin listening for visitors
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
