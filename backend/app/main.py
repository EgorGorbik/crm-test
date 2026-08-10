from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .payroll import calculate_payroll

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"

app = FastAPI(title="Payroll API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/payroll")
def get_payroll(month: str = Query(..., pattern=r"^\d{4}-\d{2}$")):
    """
    Calculate payroll for the given month (YYYY-MM).

    Assignment target period: 2026-07.
    """
    try:
        return calculate_payroll(month, data_dir=DATA_DIR)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/health")
def health():
    return {"status": "ok"}
