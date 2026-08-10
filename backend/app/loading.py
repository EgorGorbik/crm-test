from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def load_json(path: Path) -> Any:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_payroll_data(data_dir: Path) -> tuple[list[dict], list[dict], list[dict]]:
    return (
        load_json(data_dir / "devs.json"),
        load_json(data_dir / "tasks.json"),
        load_json(data_dir / "commits.json"),
    )
