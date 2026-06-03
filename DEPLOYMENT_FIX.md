# Deployment Troubleshooting: "Could not read package.json"

The build error `ENOENT: no such file or directory, open '/opt/buildhome/repo/package.json'` occurred because Cloudflare Pages is looking for your app in the **root** folder, but your frontend code is actually inside the `frontend/` folder.

### **How to Fix (In Cloudflare Dashboard):**

Go to your **Pages Project Settings** -> **Build & deployments** and update these three fields:

1.  **Root Directory:** `frontend`
2.  **Build Command:** `npm run build`
3.  **Build Output Directory:** `dist`

### **Why this happens:**
Cloudflare clones the whole repository. By setting the **Root Directory** to `frontend`, you tell Cloudflare to "CD" into that folder before running `npm install` and `npm run build`.

---

### **Alternative: Using a root-level wrangler.toml (Advanced)**
If you want to keep the root directory as `/`, you would need a configuration that tells Cloudflare where the sub-project is, but the steps above (setting the Root Directory to `frontend`) is the standard and easiest way for your current structure.
