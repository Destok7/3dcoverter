const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const FAL_API_KEY = process.env.FAL_API_KEY;
const APP_PASSWORD = process.env.APP_PASSWORD || 'MySecret3D2025';

if (!FAL_API_KEY) {
    console.error('⚠️  FAL_API_KEY environment variable is not set!');
    console.error('Please add your fal.ai API key in Railway environment variables.');
}

console.log('🔐 Password protection:', APP_PASSWORD ? 'ENABLED' : 'DISABLED');

// Password middleware - protects all /api/* endpoints
const requirePassword = (req, res, next) => {
    const providedPassword = req.headers['x-app-password'];
    
    if (!providedPassword) {
        return res.status(401).json({ 
            error: 'Password required',
            message: 'Please enter password to access this service'
        });
    }
    
    if (providedPassword !== APP_PASSWORD) {
        return res.status(403).json({ 
            error: 'Incorrect password',
            message: 'The password you entered is incorrect'
        });
    }
    
    next();
};

// Health check endpoint (no password required)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'My3DConverter API is running!',
        hasApiKey: !!FAL_API_KEY,
        passwordProtection: true
    });
});

// Submit image to Meshy-6 (password protected)
app.post('/api/generate', requirePassword, upload.single('image'), async (req, res) => {
    try {
        if (!FAL_API_KEY) {
            return res.status(500).json({ 
                error: 'Server configuration error: API key not set' 
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        console.log('📸 Received image:', req.file.originalname, `(${(req.file.size / 1024).toFixed(2)} KB)`);

        // Convert to base64
        const base64Image = req.file.buffer.toString('base64');
        const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        console.log('🚀 Submitting to Meshy-6...');

        // Submit to fal.ai Meshy-6
        const submitRes = await fetch('https://queue.fal.run/fal-ai/meshy/v6/image-to-3d', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${FAL_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_url: imageUrl,
                topology: 'triangle',
                target_polycount: 30000,
                symmetry_mode: 'auto',
                should_remesh: true,
                should_texture: true,
                enable_pbr: true,
                enable_safety_checker: true
            }),
        });

        if (!submitRes.ok) {
            const errText = await submitRes.text();
            console.error('❌ Submit failed:', submitRes.status, errText);
            return res.status(submitRes.status).json({ 
                error: `Failed to submit: ${submitRes.statusText}`,
                details: errText
            });
        }

        const submitData = await submitRes.json();
        const requestId = submitData.request_id;

        console.log('✅ Job submitted! ID:', requestId);

        // Return job ID to frontend
        res.json({ 
            success: true, 
            requestId,
            message: 'Job submitted successfully'
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Check job status (password protected)
app.get('/api/status/:requestId', requirePassword, async (req, res) => {
    try {
        if (!FAL_API_KEY) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const { requestId } = req.params;
        console.log('🔍 Checking status for:', requestId);

        const statusRes = await fetch(
            `https://queue.fal.run/fal-ai/meshy/requests/${requestId}/status`,
            {
                headers: { 'Authorization': `Key ${FAL_API_KEY}` }
            }
        );

        if (!statusRes.ok) {
            return res.status(statusRes.status).json({ 
                error: `Status check failed: ${statusRes.statusText}` 
            });
        }

        const statusData = await statusRes.json();
        console.log('📊 Status:', statusData.status);

        res.json(statusData);

    } catch (error) {
        console.error('❌ Status check error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Remove background using BiRefNet v2 (password protected)
app.post('/api/remove-background', requirePassword, upload.single('image'), async (req, res) => {
    try {
        if (!FAL_API_KEY) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        console.log('🎨 Background removal requested:', req.file.originalname);

        // Convert to base64
        const base64Image = req.file.buffer.toString('base64');
        const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        console.log('🚀 Removing background with BiRefNet v2...');

        // Call BiRefNet v2 API
        const response = await fetch('https://queue.fal.run/fal-ai/birefnet/v2', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${FAL_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_url: imageUrl
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('❌ Background removal failed:', response.status, errText);
            return res.status(response.status).json({ 
                error: `Background removal failed: ${response.statusText}`,
                details: errText
            });
        }

        const result = await response.json();
        console.log('✅ Background removed successfully!');
        console.log('BiRefNet result structure:', JSON.stringify(result, null, 2));

        // BiRefNet v2 returns the image directly in the response
        const resultImageUrl = result.image?.url || result.url || result.data?.image?.url;
        
        if (!resultImageUrl) {
            console.error('No image URL found in response:', result);
            return res.status(500).json({ 
                error: 'Background removal succeeded but no image URL returned',
                debug: result
            });
        }

        res.json({ 
            success: true, 
            image: {
                url: resultImageUrl
            }
        });

    } catch (error) {
        console.error('❌ Background removal error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get final result (password protected)
app.get('/api/result/:requestId', requirePassword, async (req, res) => {
    try {
        if (!FAL_API_KEY) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        const { requestId } = req.params;
        console.log('📥 Fetching result for:', requestId);

        const resultRes = await fetch(
            `https://queue.fal.run/fal-ai/meshy/requests/${requestId}`,
            {
                headers: { 'Authorization': `Key ${FAL_API_KEY}` }
            }
        );

        if (!resultRes.ok) {
            return res.status(resultRes.status).json({ 
                error: `Result fetch failed: ${resultRes.statusText}` 
            });
        }

        const resultData = await resultRes.json();
        console.log('✅ Result retrieved successfully!');

        res.json(resultData);

    } catch (error) {
        console.error('❌ Result fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log('🚀 My3DConverter server running on port', PORT);
    console.log('🔑 API Key status:', FAL_API_KEY ? '✅ Configured' : '❌ Missing');
    console.log('📍 Visit: http://localhost:' + PORT);
});
