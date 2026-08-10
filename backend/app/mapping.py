from __future__ import annotations


def build_dev_maps(devs: list[dict]) -> tuple[dict[str, dict], dict[str, dict]]:
    """Map tracker name and git login to developer records."""
    by_name = {d["name"]: d for d in devs}
    by_git = {d["gitLogin"]: d for d in devs}
    return by_name, by_git
