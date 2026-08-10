FROM node:20-bookworm AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app

COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY data ./data
COPY backend ./backend
COPY --from=frontend /app/frontend/dist ./frontend/dist

ENV PORT=8000
CMD ["sh", "-c", "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}"]
