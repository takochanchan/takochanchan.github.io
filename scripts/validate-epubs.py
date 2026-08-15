#!/usr/bin/env python3
"""Validate the archive's EPUB 3 files with only the Python standard library."""

from __future__ import annotations

import argparse
import json
import posixpath
import re
import subprocess
import zipfile
from pathlib import Path
from urllib.parse import unquote
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ROOT = ROOT / "dist"
CONTAINER_NS = {"c": "urn:oasis:names:tc:opendocument:xmlns:container"}
OPF_NS = {
    "opf": "http://www.idpf.org/2007/opf",
    "dc": "http://purl.org/dc/elements/1.1/",
}
XHTML_NS = "http://www.w3.org/1999/xhtml"
EPUB_NS = "http://www.idpf.org/2007/ops"


def catalogue() -> list[dict]:
    script = (
        "import {publications} from './src/publications.mjs';"
        "process.stdout.write(JSON.stringify(publications));"
    )
    result = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
    )
    return json.loads(result.stdout)


def archive_path(base: str, href: str) -> str:
    path = posixpath.normpath(posixpath.join(base, unquote(href.split("#", 1)[0])))
    if path == ".." or path.startswith("../") or path.startswith("/"):
        raise AssertionError(f"unsafe archive path: {href}")
    return path


def require_text(element: ElementTree.Element | None, label: str) -> str:
    assert element is not None and element.text and element.text.strip(), label
    return element.text.strip()


def validate_epub(item: dict) -> tuple[int, int]:
    epub = PUBLIC_ROOT / item["epub"]
    assert epub.is_file(), f"{item['slug']}: EPUB is missing"

    with zipfile.ZipFile(epub) as archive:
        assert archive.testzip() is None, f"{item['slug']}: corrupt ZIP member"
        members = archive.namelist()
        assert members and members[0] == "mimetype", (
            f"{item['slug']}: mimetype must be the first ZIP member"
        )
        mimetype_info = archive.getinfo("mimetype")
        assert mimetype_info.compress_type == zipfile.ZIP_STORED, (
            f"{item['slug']}: mimetype must be stored without compression"
        )
        assert archive.read("mimetype") == b"application/epub+zip", (
            f"{item['slug']}: invalid mimetype"
        )

        container = ElementTree.fromstring(archive.read("META-INF/container.xml"))
        rootfile = container.find(".//c:rootfile", CONTAINER_NS)
        assert rootfile is not None, f"{item['slug']}: rootfile is missing"
        opf_path = rootfile.attrib["full-path"]
        opf = ElementTree.fromstring(archive.read(opf_path))
        assert opf.attrib.get("version", "").startswith("3"), (
            f"{item['slug']}: not EPUB 3"
        )

        title = require_text(opf.find(".//dc:title", OPF_NS), "dc:title is missing")
        assert item["title"] in title, f"{item['slug']}: title mismatch"
        language = require_text(
            opf.find(".//dc:language", OPF_NS),
            "dc:language is missing",
        )
        assert language.lower().startswith("ja"), f"{item['slug']}: language is not ja"
        require_text(opf.find(".//dc:identifier", OPF_NS), "identifier is missing")

        for meta in opf.findall(".//opf:meta", OPF_NS):
            if meta.attrib.get("property") == "rendition:layout":
                assert (meta.text or "").strip() != "pre-paginated", (
                    f"{item['slug']}: fixed-layout rendition is not allowed"
                )

        opf_base = posixpath.dirname(opf_path)
        manifest: dict[str, tuple[str, str, set[str]]] = {}
        for entry in opf.findall(".//opf:manifest/opf:item", OPF_NS):
            entry_id = entry.attrib["id"]
            resolved = archive_path(opf_base, entry.attrib["href"])
            media_type = entry.attrib.get("media-type", "")
            properties = set(entry.attrib.get("properties", "").split())
            assert resolved in members, (
                f"{item['slug']}: manifest member is missing: {resolved}"
            )
            assert archive.getinfo(resolved).file_size > 0, (
                f"{item['slug']}: manifest member is empty: {resolved}"
            )
            manifest[entry_id] = (resolved, media_type, properties)

        navigation_entries = [
            entry for entry in manifest.values() if "nav" in entry[2]
        ]
        assert len(navigation_entries) == 1, (
            f"{item['slug']}: expected exactly one navigation document"
        )
        assert any("cover-image" in entry[2] for entry in manifest.values()), (
            f"{item['slug']}: cover image is missing"
        )

        spine = opf.findall(".//opf:spine/opf:itemref", OPF_NS)
        assert spine, f"{item['slug']}: spine is empty"
        spine_paths: list[str] = []
        for itemref in spine:
            assert itemref.attrib.get("idref") in manifest, (
                f"{item['slug']}: unresolved spine item"
            )
            spine_paths.append(manifest[itemref.attrib["idref"]][0])

        navigation_path = navigation_entries[0][0]
        navigation = ElementTree.fromstring(archive.read(navigation_path))
        toc = next(
            (
                element
                for element in navigation.iter(f"{{{XHTML_NS}}}nav")
                if "toc"
                in element.attrib.get(f"{{{EPUB_NS}}}type", "").split()
            ),
            None,
        )
        assert toc is not None, f"{item['slug']}: toc nav is missing"
        spine_positions = {
            path: position for position, path in enumerate(spine_paths)
        }
        previous_position = -1
        navigation_links = list(toc.iter(f"{{{XHTML_NS}}}a"))
        assert navigation_links, f"{item['slug']}: toc nav is empty"
        for link in navigation_links:
            href = link.attrib.get("href", "")
            target_path = archive_path(posixpath.dirname(navigation_path), href)
            assert target_path in spine_positions, (
                f"{item['slug']}: toc link is outside the spine: {href}"
            )
            position = spine_positions[target_path]
            assert position >= previous_position, (
                f"{item['slug']}: toc links are not in reading order: {href}"
            )
            previous_position = position
            if "#" in href:
                fragment = unquote(href.split("#", 1)[1])
                target = ElementTree.fromstring(archive.read(target_path))
                ids = {
                    element.attrib["id"]
                    for element in target.iter()
                    if "id" in element.attrib
                }
                assert fragment in ids, (
                    f"{item['slug']}: toc fragment is missing: {href}"
                )

        xhtml_paths = [
            path
            for path, media_type, _ in manifest.values()
            if media_type == "application/xhtml+xml"
        ]
        assert xhtml_paths, f"{item['slug']}: no XHTML content"
        Japanese_character_count = 0
        image_references = 0
        missing_image_alt: list[str] = []
        for xhtml_path in xhtml_paths:
            data = archive.read(xhtml_path)
            document = ElementTree.fromstring(data)
            assert document.tag == f"{{{XHTML_NS}}}html", (
                f"{item['slug']}: invalid XHTML namespace in {xhtml_path}"
            )
            text = "".join(document.itertext())
            Japanese_character_count += len(
                re.findall(r"[\u3040-\u30ff\u3400-\u9fff]", text)
            )

            xhtml_base = posixpath.dirname(xhtml_path)
            for element in document.iter():
                for attribute in ("href", "src"):
                    value = element.attrib.get(attribute)
                    if (
                        not value
                        or value.startswith(("#", "data:", "mailto:"))
                        or re.match(r"^[a-z][a-z0-9+.-]*:", value, re.I)
                    ):
                        continue
                    target = archive_path(xhtml_base, value)
                    assert target in members, (
                        f"{item['slug']}: broken {attribute} in {xhtml_path}: {value}"
                    )
                    if attribute == "src":
                        image_references += 1
                if element.tag == f"{{{XHTML_NS}}}img":
                    if not element.attrib.get("alt", "").strip():
                        missing_image_alt.append(
                            f"{xhtml_path}: {element.attrib.get('src', '(no src)')}"
                        )

            for viewport in document.findall(
                f".//{{{XHTML_NS}}}meta[@name='viewport']"
            ):
                content = viewport.attrib.get("content", "")
                assert not re.search(r"\bwidth\s*=\s*\d+", content), (
                    f"{item['slug']}: fixed viewport found in {xhtml_path}"
                )

        assert Japanese_character_count >= 1_000, (
            f"{item['slug']}: implausibly little Japanese reflow text "
            f"({Japanese_character_count} characters)"
        )
        assert not missing_image_alt, (
            f"{item['slug']}: images without alternative text: "
            + ", ".join(missing_image_alt[:5])
        )
        return Japanese_character_count, image_references


def main() -> None:
    global PUBLIC_ROOT
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "public_root",
        nargs="?",
        type=Path,
        default=ROOT / "dist",
        help="built public root containing publication assets (default: dist)",
    )
    parser.add_argument(
        "--slug",
        action="append",
        dest="slugs",
        help="validate only this publication slug (repeatable)",
    )
    args = parser.parse_args()
    PUBLIC_ROOT = args.public_root.resolve()

    items = catalogue()
    assert len(items) == 237, f"expected 237 publications, found {len(items)}"
    if args.slugs:
        selected = set(args.slugs)
        known = {item["slug"] for item in items}
        missing = sorted(selected - known)
        assert not missing, f"unknown publication slugs: {', '.join(missing)}"
        items = [item for item in items if item["slug"] in selected]
    for item in items:
        characters, images = validate_epub(item)
        print(
            f"OK {item['slug']}: "
            f"{characters:,} Japanese characters, {images:,} image references"
        )
    print(f"Validated {len(items)} reflowable EPUB 3 editions.")


if __name__ == "__main__":
    main()
