const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const FAL_API_KEY = process.env.FAL_API_KEY;
const APP_PASSWORD = process.env.APP_PASSWORD || 'MySecret3D2025';

if (!FAL_API_KEY) console.error('⚠️  FAL_API_KEY not set!');
console.log('🔐 Password protection:', APP_PASSWORD ? 'ENABLED' : 'DISABLED');

const requirePassword = (req, res, next) => {
    const p = req.headers['x-app-password'];
    if (!p) return res.status(401).json({ error: 'Password required' });
    if (p !== APP_PASSWORD) return res.status(403).json({ error: 'Incorrect password' });
    next();
};

app.get('/api/health', (req, res) => res.json({ status: 'ok', hasApiKey: !!FAL_API_KEY }));

app.post('/api/generate', requirePassword, upload.single('image'), async (req, res) => {
    try {
        if (!FAL_API_KEY) return res.status(500).json({ error: 'API key not set' });
        if (!req.file) return res.status(400).json({ error: 'No image provided' });
        console.log('📸 Received:', req.file.originalname);
        const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const r = await fetch('https://queue.fal.run/fal-ai/meshy/v6/image-to-3d', {
            method: 'POST',
            headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: imageUrl, topology: 'triangle', target_polycount: 30000, symmetry_mode: 'auto', should_remesh: true, should_texture: true, enable_pbr: true, enable_safety_checker: true }),
        });
        if (!r.ok) { const e = await r.text(); return res.status(r.status).json({ error: r.statusText, details: e }); }
        const data = await r.json();
        console.log('✅ Job submitted:', data.request_id);
        res.json({ success: true, requestId: data.request_id });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/status/:requestId', requirePassword, async (req, res) => {
    try {
        const r = await fetch(`https://queue.fal.run/fal-ai/meshy/requests/${req.params.requestId}/status`, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } });
        res.json(await r.json());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/remove-background', requirePassword, upload.single('image'), async (req, res) => {
    try {
        if (!FAL_API_KEY) return res.status(500).json({ error: 'API key not set' });
        if (!req.file) return res.status(400).json({ error: 'No image provided' });
        console.log('🎨 BG removal:', req.file.originalname);
        const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const r = await fetch('https://queue.fal.run/fal-ai/birefnet/v2', {
            method: 'POST',
            headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: imageUrl }),
        });
        if (!r.ok) { const e = await r.text(); return res.status(r.status).json({ error: r.statusText, details: e }); }
        const data = await r.json();
        console.log('✅ BG job submitted:', data.request_id);
        res.json({ success: true, requestId: data.request_id });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/bg-status/:requestId', requirePassword, async (req, res) => {
    try {
        const r = await fetch(`https://queue.fal.run/fal-ai/birefnet/requests/${req.params.requestId}/status`, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } });
        res.json(await r.json());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/bg-result/:requestId', requirePassword, async (req, res) => {
    try {
        const r = await fetch(`https://queue.fal.run/fal-ai/birefnet/requests/${req.params.requestId}`, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } });
        res.json(await r.json());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/result/:requestId', requirePassword, async (req, res) => {
    try {
        const r = await fetch(`https://queue.fal.run/fal-ai/meshy/requests/${req.params.requestId}`, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } });
        res.json(await r.json());
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
    console.log('🚀 My3DConverter running on port', PORT);
    console.log('🔑 API Key:', FAL_API_KEY ? '✅ Configured' : '❌ Missing');
});
