# Migração PostgreSQL → Firebase Firestore - ✅ Aprovado

## 📋 Status Atual
- [x] Plano aprovado pelo usuário
- [ ] 1. Configurar Firebase Admin SDK (serviceAccountKey.json)
- [x] 2. Atualizar package.json (remover pg, adicionar firebase-admin) ✅ **npm install OK**
- [x] 3. Deletar db.js (obsoleto com fallback)\n- [x] 4. Reescrever server.js com Firestore + fallback Postgres ✅
- [ ] 5. Script de migração dados PostgreSQL → Firestore
- [ ] 6. Atualizar frontends (Firebase SDK)
- [ ] 7. Testar rotas/admin
- [ ] 8. Configurar Firestore Rules
- [ ] 9. ✅ Completo!

## Próximos passos (automáticos):
1. Baixe serviceAccountKey.json do Firebase Console → projeto root
2. Execute `npm install` após package.json
3. Rode script migração (passo 5)
4. `npm start` e teste http://localhost:3000/api/products
