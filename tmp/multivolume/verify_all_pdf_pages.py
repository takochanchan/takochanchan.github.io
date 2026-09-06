#!/usr/bin/env python3
"""Compare every approved source page with its page in the split PDF outputs."""

from __future__ import annotations

import json
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import fitz


ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / "tmp" / "multivolume"
CONFIG = WORK / "volume-split-config.json"
INPUT = WORK / "inputs"
OUTPUT = ROOT / "output" / "multivolume" / "pdf"


def expanded_pages(volume: dict) -> list[int]:
    return [
        page
        for first, last in volume["pdf_ranges"]
        for page in range(first, last + 1)
    ]


def image_digests(page: fitz.Page) -> list[str]:
    return [item["digest"].hex() for item in page.get_image_info(hashes=True)]


def verify_publication(publication: dict) -> dict:
    source_path = INPUT / publication["slug"] / publication["input_pdf"]
    checked = 0
    volumes = []
    with fitz.open(source_path) as source:
        for volume in publication["volumes"]:
            output_path = OUTPUT / f"{volume['stem']}.pdf"
            source_pages = expanded_pages(volume)
            with fitz.open(output_path) as split:
                if split.page_count != len(source_pages) + 2:
                    raise RuntimeError(f"Page count mismatch: {output_path.name}")
                for output_index, source_number in enumerate(source_pages, start=2):
                    source_page = source[source_number - 1]
                    output_page = split[output_index]
                    if source_page.read_contents() != output_page.read_contents():
                        raise RuntimeError(
                            f"Content stream mismatch: {output_path.name} source {source_number}"
                        )
                    if source_page.rect != output_page.rect or source_page.rotation != output_page.rotation:
                        raise RuntimeError(
                            f"Page geometry mismatch: {output_path.name} source {source_number}"
                        )
                    if image_digests(source_page) != image_digests(output_page):
                        raise RuntimeError(
                            f"Image digest mismatch: {output_path.name} source {source_number}"
                        )
                checked += len(source_pages)
                volumes.append({
                    "id": volume["id"],
                    "output": output_path.name,
                    "approved_pages_verified": len(source_pages),
                })
    return {
        "slug": publication["slug"],
        "approved_pages_verified": checked,
        "volumes": volumes,
    }


def main() -> None:
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    with ProcessPoolExecutor(max_workers=len(config["publications"])) as executor:
        reports = list(executor.map(verify_publication, config["publications"]))
    report = {
        "schema_version": 1,
        "status": "passed",
        "publications": reports,
        "approved_pages_verified": sum(
            item["approved_pages_verified"] for item in reports
        ),
    }
    path = WORK / "pdf-full-verification.json"
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
