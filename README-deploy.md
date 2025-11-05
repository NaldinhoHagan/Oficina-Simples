# Guia de Deploy no Render
1) Crie Postgres → copie `DATABASE_URL`.
2) Web Service → Runtime Node, Start `node server.js`.
3) Defina variáveis (`DATABASE_URL`, `SESSION_SECRET`, etc.).
4) Abra `/login` e acesse.
5) Para demo: `POST /admin/seed`. Ver logs em `/admin/logs`.
