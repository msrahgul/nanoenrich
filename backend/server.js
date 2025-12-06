const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 5000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json());

// Helper to read data
const readData = async () => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { products: [], categories: ["All"], orders: [] };
    }
};

// Helper to write data
const writeData = async (data) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};

// --- PRODUCTS ---

app.get('/api/products', async (req, res) => {
    const data = await readData();
    res.json(data.products || []);
});

app.post('/api/products', async (req, res) => {
    const data = await readData();
    if (!data.products) data.products = [];

    const newProduct = { ...req.body, id: Date.now().toString() };
    data.products.push(newProduct);
    await writeData(data);

    res.status(201).json(newProduct);
});

app.put('/api/products/:id', async (req, res) => {
    const data = await readData();
    const index = data.products.findIndex(p => p.id === req.params.id);

    if (index !== -1) {
        data.products[index] = { ...data.products[index], ...req.body };
        await writeData(data);
        res.json(data.products[index]);
    } else {
        res.status(404).json({ message: "Product not found" });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const data = await readData();
    data.products = data.products.filter(p => p.id !== req.params.id);
    await writeData(data);
    res.json({ message: "Product deleted" });
});

// --- CATEGORIES ---

app.get('/api/categories', async (req, res) => {
    const data = await readData();
    res.json(data.categories || ["All"]);
});

app.post('/api/categories', async (req, res) => {
    const data = await readData();
    if (!data.categories) data.categories = ["All"];

    if (!data.categories.includes(req.body.name)) {
        data.categories.push(req.body.name);
        await writeData(data);
    }

    res.status(201).json(data.categories);
});

app.delete('/api/categories/:name', async (req, res) => {
    const data = await readData();
    const name = decodeURIComponent(req.params.name);
    if (name !== 'All') {
        data.categories = data.categories.filter(c => c !== name);
        await writeData(data);
    }
    res.json(data.categories);
});

// --- NEW ORDER ROUTES ---

// GET All Orders
app.get('/api/orders', async (req, res) => {
    const data = await readData();
    // Initialize orders array if it doesn't exist
    if (!data.orders) data.orders = [];
    res.json(data.orders);
});

// POST New Order
app.post('/api/orders', async (req, res) => {
    const data = await readData();
    if (!data.orders) data.orders = [];

    // Generate Sequential ID
    let nextId = 1;
    if (data.orders.length > 0) {
        // Extract numeric IDs, filter out non-numeric ones if any (from old data)
        const ids = data.orders
            .map(o => parseInt(o.id))
            .filter(id => !isNaN(id));

        if (ids.length > 0) {
            nextId = Math.max(...ids) + 1;
        }
    }

    const newOrder = {
        id: nextId.toString(),
        date: new Date().toISOString(),
        status: 'Pending',
        ...req.body
    };

    data.orders.unshift(newOrder); // Add to top
    await writeData(data);

    res.status(201).json(newOrder);
});

// PUT Update Order Status (Optional, for Admin)
app.put('/api/orders/:id', async (req, res) => {
    const data = await readData();
    const index = data.orders.findIndex(o => o.id === req.params.id);

    if (index !== -1) {
        data.orders[index] = { ...data.orders[index], ...req.body };
        await writeData(data);
        res.json(data.orders[index]);
    } else {
        res.status(404).json({ message: "Order not found" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});