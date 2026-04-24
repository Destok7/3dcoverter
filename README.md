# My3DConverter 🎨

Professional image to 3D model converter using Meshy-6 AI, deployed on Railway.

## ✨ Features

- 🎯 **Highest Quality** - Uses Meshy-6 AI for best results
- 📦 **Multiple Formats** - Download GLB, OBJ, FBX, USDZ, STL
- 🚀 **No CORS Issues** - Backend server handles all API calls
- 📱 **Mobile Friendly** - Works on all devices
- 🔒 **Secure** - API key hidden on server
- ⚡ **Fast** - Optimized processing

---

## 🚀 Deploy to Railway - Step by Step

### Step 1: Upload Files to Railway

You have two options:

#### Option A: Using GitHub (Recommended)

1. Create a GitHub repository
2. Upload all these files to the repository
3. In Railway, click "Connect Repo"
4. Select your repository

#### Option B: Direct Upload

1. In Railway dashboard, you should see your service "natural-dream"
2. Look for **"Deploy from GitHub"** or **"Source"** section
3. You can also use Railway CLI:
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   railway up
   ```

### Step 2: Add Environment Variables (CRITICAL!)

**You need to add TWO environment variables:**

1. In Railway dashboard, click on your service **"natural-dream"**
2. Click the **"Variables"** tab
3. Click **"+ New Variable"**

**Add these TWO variables:**

#### Variable 1: FAL_API_KEY
- **Name:** `FAL_API_KEY`
- **Value:** `8499dd62-555a-4743-8a99-be95ef50ac95:7076ec71c993aecfd132d994a6d458b5`

#### Variable 2: APP_PASSWORD 🔒
- **Name:** `APP_PASSWORD`
- **Value:** Choose your own password! (e.g., `MySecurePassword123`)

**IMPORTANT:** 
- This password protects your website from unauthorized use
- Choose something secure but memorable
- Users will need this password to access your website
- Default is `MySecret3D2025` (but you should change it!)

4. Click **"Add"** for each variable

### Step 3: Deploy!

1. Railway will automatically detect Node.js project
2. It will install dependencies from `package.json`
3. It will run `npm start` which starts `server.js`
4. Wait 2-3 minutes for deployment
5. ✅ Done!

### Step 4: Get Your Live URL

1. In Railway, click on your service
2. Go to **"Settings"** tab
3. Look for **"Public Networking"** or **"Domains"** section
4. Click **"Generate Domain"**
5. You'll get a URL like: `https://natural-dream-production.up.railway.app`
6. ✅ Visit that URL - your My3DConverter is LIVE!

---

## 📁 Project Structure

```
my3dconverter/
├── server.js              # Backend API server
├── package.json           # Node.js dependencies
├── .env.example          # Environment variables template
├── public/
│   └── index.html        # Frontend website
└── README.md             # This file
```

---

## 🔧 Local Development (Optional)

If you want to test locally before deploying:

### 1. Install Node.js
Download from: https://nodejs.org (version 18 or higher)

### 2. Install Dependencies
```bash
cd my3dconverter
npm install
```

### 3. Create .env File
```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```
FAL_API_KEY=8499dd62-555a-4743-8a99-be95ef50ac95:7076ec71c993aecfd132d994a6d458b5
```

### 4. Run Server
```bash
npm start
```

### 5. Open Browser
Visit: http://localhost:3000

---

## 🎯 How to Use Your Website

1. **Visit your Railway URL**
2. **Enter your password** (the APP_PASSWORD you set in Railway)
3. **Click "Unlock"** - Password is remembered in your browser session
4. **Click upload** and select an image
5. **Click "Generate 3D Model"**
6. **Wait 5-10 minutes** (you'll see progress)
7. **Download** your 3D model in multiple formats!

### Password Security:
- 🔒 Password is checked on the server (secure)
- 💾 Saved in browser session (until you close browser)
- 🚫 Wrong password = Access denied
- ✅ Only people with password can use your website

### Best Images for Conversion:
- ✅ Clear subject with simple background
- ✅ Good lighting
- ✅ Objects: toys, products, sculptures
- ❌ Avoid: complex scenes, reflective surfaces

---

## 📊 API Endpoints

Your backend provides these endpoints:

- `GET /` - Frontend website
- `GET /api/health` - Health check
- `POST /api/generate` - Submit image for conversion
- `GET /api/status/:requestId` - Check job status
- `GET /api/result/:requestId` - Get final 3D model

---

## 🔒 Security

- ✅ API key stored in environment variables (not in code)
- ✅ Backend proxies all fal.ai requests
- ✅ No CORS issues
- ✅ File size limits (10MB max)
- ✅ Image type validation

---

## 💰 Costs

### Railway Free Tier:
- **$5 free credit** (one-time trial)
- Your app uses ~$0.10-$0.50/month
- Free tier lasts several months!

### fal.ai Costs:
- Meshy-6: ~$0.50 per generation
- Check your fal.ai dashboard for usage

---

## 🛠️ Troubleshooting

### "API key not configured" error
- Make sure you added `FAL_API_KEY` in Railway Variables
- Check spelling exactly matches: `FAL_API_KEY`

### Deployment failed
- Check Railway logs for errors
- Ensure `package.json` has all dependencies
- Verify Node.js version is 18+

### Website not loading
- Wait 2-3 minutes after deployment
- Check if Railway generated a public domain
- Look for errors in Railway logs

### Generation timeout
- Complex images take 5-10 minutes
- Simple images (cartoons) take 2-3 minutes
- Check fal.ai dashboard for job status

---

## 📝 Environment Variables

Required:
- `FAL_API_KEY` - Your fal.ai API key (for 3D generation)
- `APP_PASSWORD` - Password to access your website (for security)

Optional:
- `PORT` - Server port (Railway sets automatically)

---

## 🔄 Updating Your Website

### To update code:

1. Edit files locally
2. Commit to GitHub (if using GitHub)
3. Railway auto-deploys new changes!

OR use Railway CLI:
```bash
railway up
```

---

## 🗑️ Delete/Stop Your Website

### To pause:
1. Railway dashboard → Your service
2. Settings → Pause

### To delete:
1. Railway dashboard → Your project
2. Settings → Delete Project
3. ✅ Instant deletion, no charges

---

## 📞 Support

### Issues with:
- **Railway**: Check https://railway.app/help
- **fal.ai API**: Check https://fal.ai/docs
- **This code**: Review logs in Railway dashboard

---

## 🎉 Success Checklist

- [ ] Files uploaded to Railway
- [ ] Environment variable `FAL_API_KEY` added
- [ ] Deployment succeeded (check Railway logs)
- [ ] Public domain generated
- [ ] Website loads in browser
- [ ] Image upload works
- [ ] 3D model generation works
- [ ] Downloads work

---

## 📄 License

MIT License - Free to use and modify!

---

## 🚀 Next Steps

After successful deployment:

1. **Test with simple image** (like Tom & Jerry)
2. **Share your Railway URL** with trusted people (optional)
3. **Monitor usage** in fal.ai dashboard
4. **Enjoy your 3D converter!** 🎨

---

**Need help?** Check Railway logs or fal.ai documentation.

**Ready to deploy?** Follow Step 1 above! 🚀
