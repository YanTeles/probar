# Deploy Tabacaria Premium no Netlify ✅

## 🚀 Instruções Rápidas

1. **Netlify Deploy:**
   ```
   1. netlify.com → New site from Git → GitHub → probar repo
   2. Build settings:
      - Build command: (vazio)
      - Publish directory: dist
   3. Deploy automático! ✅
   ```

2. **Ou Drag & Drop:**
   - netlify.com/drop → arraste pasta `dist/`
   - Site live em 30s.

3. **Config Netlify.toml (já incluso):**
   ```
   /* /index.html 200  (corrige 404)
   publish = "dist"
   ```

4. **Teste Local:**
   ```
   npx serve dist
   http://localhost:3000
   ```

5. **Funcionalidades Production:**
   - Firebase Firestore (produtos)
   - Age-gate 18+
   - Carrinho WhatsApp
   - Admin login (senha: admin123)
   - Mobile-first, PWA-ready

**Site:** https://tabacaria.netlify.app (após deploy)

**Backend separado:** server.js porta 3000 (/api produtos)

🎉 Pronto para produção!

