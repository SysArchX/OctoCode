# OctoTutor server

Express + CORS na porta 4000, exclusivamente OpenRouter.

```bash
cd server
npm install
OPENROUTER_API_KEY=sua_chave npm start
```

Endpoints:

- `GET /health` → status, número de modelos na cascata e se a chave está configurada.
- `POST /tutor` → `{ "question": "...", "context": "..." }` retorna `{ answer, model, sources }`.

Variáveis:

- `OPENROUTER_API_KEY` (obrigatória)
- `PORT` (padrão 4000)
- `ALLOW_ORIGIN` (padrão `*`)

O app aponta para `http://163.176.170.31:4000` por padrão. Para testar local:

```bash
EXPO_PUBLIC_TUTOR_URL=http://SEU_IP:4000 npx expo start
```
