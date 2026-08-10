.PHONY: backend frontend test

backend:
	python3 -m pip install -r backend/requirements.txt
	python3 -m uvicorn backend.app.main:app --reload --port 8000

frontend:
	cd frontend && npm install && npm run dev

test:
	python3 -m pytest -q
