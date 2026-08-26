#!/usr/bin/env python3
"""Build a temporary full-text corpus from approved read-only text sources.

The output is an intermediate build artifact. It contains searchable text and
the verified physical PDF page for each searchable chunk. Source masters are
never modified.
"""

from __future__ import annotations

import argparse
import bisect
import gzip
import hashlib
import html
import json
import os
import posixpath
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote
from xml.etree import ElementTree as ET


# The internal name is retained because the search-index schema still calls the
# field ``originalPage``.  In practice this is a source-location marker: it may
# point to a printed page, a manuscript folio, a digital image, or an explicitly
# described composite source.
ORIGINAL_MARKER_RE = re.compile(
    r"(?:"
    r"〔\s*(?:(?:前付・底本PDF|付録・底本PDF|裏表紙・底本PDF|原刊|原冊|原資料|原書|原写本|写本(?=（)|自筆稿(?!の)|原稿|底本|原誌|原報告|"
    r"クラウス\s*117\s*写本|出所|PMM\s*\d+\s*,|"
    r"主底本|補完底本|合成底本)"
    r"[^〕\r\n]{0,240})〕"
    r"|\{\{\s*SOURCE\s*:\s*[^{}\r\n]{1,240}\s*\}\}"
    r")",
    re.IGNORECASE,
)
DEFAULT_SOURCE_LOCATION = "底本位置なし（前付）"
DOCX_NON_LOCATION_SENTINEL = "\ue000"
DOCX_STYLE_SENSITIVE_MARKER_RE = re.compile(
    r"^\s*〔\s*(?:PMM\s*\d+\s*,|出所|主底本|補完底本|合成底本)"
)
DOCX_SOURCE_LOCATION_STYLES = {"Source Page", "Source Folio"}
OCR_CACHE_VERSION = 1
TRANSLATION_HEADING_RE = re.compile(
    r"^\s*(?:#{1,6}\s*)?(?:\*{0,2})?日本語全訳(?:\*{0,2})?\s*$",
    re.MULTILINE,
)
FRONT_MATTER_HEADING_RE = re.compile(
    r"^\s*#{1,6}\s*(?:\*{0,2}|_{0,2})"
    r"原刊(?:略標題紙|標題紙|内表紙|表紙|扉|前付)"
    r"(?:\*{0,2}|_{0,2})\s*$",
    re.MULTILINE,
)
FRONT_MATTER_TEXT_RE = re.compile(
    r"^\s*原刊(?:略標題紙|標題紙|内表紙|表紙|扉|前付)\s*$"
)
WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W = f"{{{WORD_NS}}}"
EPUB_CONTAINER_NS = "urn:oasis:names:tc:opendocument:xmlns:container"
EPUB_OPF_NS = "http://www.idpf.org/2007/opf"
EPUB_BLOCK_TAGS = {
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "li",
    "blockquote",
    "figcaption",
    "caption",
    "th",
    "td",
    "pre",
}
FACSIMILE_ONLY_RE = re.compile(r"^原資料(?:画像)?頁\s*\d+$")
STANDALONE_SOURCE_PAGE_RE = re.compile(
    r"^(?:原資料(?:画像)?頁\s*\d+(?:\s*[–-]\s*\d+)?|"
    r"(?:未丁付)?第\s*\d+\s*葉[表裏])$"
)
EPUB_METADATA_HEADING_RE = re.compile(
    r"^(?:書誌(?:・底本)?|底本|著作権(?:・(?:利用条件|翻訳方針))?|利用条件)$"
)


class ForgivingEpubBlockParser(HTMLParser):
    """Extract block text when a published XHTML file is not well-formed XML."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.in_body = False
        self.ignored_depth = 0
        self.block_open = False
        self.buffer: list[str] = []
        self.paragraphs: list[str] = []

    def flush(self) -> None:
        value = re.sub(r"\s+", " ", "".join(self.buffer)).strip()
        self.buffer.clear()
        if value:
            self.paragraphs.append(value)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag == "body":
            self.in_body = True
            return
        if tag in {"script", "style"}:
            self.ignored_depth += 1
            return
        if not self.in_body or self.ignored_depth:
            return
        if tag in EPUB_BLOCK_TAGS:
            if self.block_open:
                self.flush()
            self.block_open = True
        elif tag == "br" and self.block_open:
            self.buffer.append(" ")

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in {"script", "style"} and self.ignored_depth:
            self.ignored_depth -= 1
            return
        if tag == "body":
            self.flush()
            self.block_open = False
            self.in_body = False
            return
        if self.in_body and not self.ignored_depth and tag in EPUB_BLOCK_TAGS:
            self.flush()
            self.block_open = False

    def handle_data(self, data: str) -> None:
        if self.in_body and not self.ignored_depth and self.block_open:
            self.buffer.append(data)

    def close(self) -> None:
        super().close()
        self.flush()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalize_for_match(value: str) -> str:
    value = unicodedata.normalize("NFKC", value).lower()
    value = value.replace("\u00ad", "").replace("\u200b", "")
    return "".join(character for character in value if character.isalnum())


def clean_markdown_inline(value: str) -> str:
    value = value.replace(DOCX_NON_LOCATION_SENTINEL, "")
    value = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", value)
    value = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", value)
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    value = re.sub(r"^\s{0,3}#{1,6}\s*", "", value)
    value = re.sub(r"^\s*(?:[-+*]|\d+[.)])\s+", "", value)
    value = re.sub(r"^\s*>\s?", "", value)
    value = value.replace(chr(96), "").replace("**", "").replace("__", "")
    value = re.sub(r"(?<!\w)[*_~]+|[*_~]+(?!\w)", "", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def original_marker_label(value: str) -> str:
    marker = value.strip()
    if marker.startswith("{{"):
        label = re.sub(
            r"^\{\{\s*SOURCE\s*:\s*|\s*\}\}$",
            "",
            marker,
            flags=re.IGNORECASE,
        )
        return "出所 " + re.sub(r"\s+", " ", label).strip()
    label = re.sub(r"\s+", " ", marker[1:-1]).strip()
    # Some legacy PMM 9 masters put a location and a full editorial note in one
    # Source Page paragraph.  Keep the searchable location concise; the note is
    # recovered separately by embedded_source_note(). Revised masters split the
    # two paragraphs at source.
    if re.match(r"^PMM\s*\d+\s*,", label, re.IGNORECASE):
        label = label.split("。", 1)[0].rstrip("。")
        label = re.split(r"[：、]", label, maxsplit=1)[0].strip()
    return label


def embedded_source_note(value: str) -> str | None:
    """Recover a note attached to a legacy PMM source-location paragraph."""
    if not value.strip().startswith("〔"):
        return None
    label = re.sub(r"\s+", " ", value.strip()[1:-1]).strip()
    if not re.match(r"^PMM\s*\d+\s*,", label, re.IGNORECASE):
        return None
    separators = [
        (position, separator)
        for separator in ("。", "：", "、")
        if (position := label.find(separator)) > 0
    ]
    if separators:
        position, separator = min(separators)
        tail = label[position + len(separator) :].strip()
        if tail:
            return tail
    return None


def is_original_page_marker(value: str) -> bool:
    label = (
        original_marker_label(value)
        if value.lstrip().startswith(("〔", "{{"))
        else value.strip()
    )
    if re.match(r"^原資料\s*[:：]", label):
        return True
    if STANDALONE_SOURCE_PAGE_RE.fullmatch(label):
        return True
    if re.match(r"^出所\b", label):
        return bool(
            re.search(
                r"(?:\b\d{4}年版\s*p\.?\s*\d|"
                r"\b(?:f|ff|fol|fols)\.\s*\d+[rv]?|"
                r"\b(?:p|pp|n)\.\s*\d)",
                label,
                re.IGNORECASE,
            )
        )
    if re.match(r"^PMM\s*\d+\s*,", label, re.IGNORECASE):
        return bool(
            re.search(
                r"\b(?:f|ff|fol|fols)\.\s*\d+[rv]?",
                label,
                re.IGNORECASE,
            )
        )
    if re.match(r"^(?:主底本|補完底本|合成底本)\b", label):
        return bool(
            re.search(
                r"(?:\bp\.?\s*\d|\b(?:f|ff|fol|fols)\.\s*\d+[rv]?|"
                r"(?:底本|デジタル)画像\s*\d)",
                label,
                re.IGNORECASE,
            )
        )
    return bool(
        re.match(
            r"^(?:"
            r"(?:前付|付録|裏表紙)・底本PDF\s+p\."
            r"|"
            r"原刊(?:\s+(?:p\.?|fol\.?)|第二冊|旧付番|前付|巻頭書目|楽譜|図版|PDF|"
            r"注\d+・原刊|\d|[ivxlcdm]+頁|・|半標題紙|外装表紙|折込地図|"
            r"表紙|扉|標題紙)"
            r"|原冊(?:\s*f\.?\s*\d+[rv]|第\s*\d+\s*葉[表裏])"
            r"|原書(?:\s+p\.?|折込図版)"
            r"|原写本(?:\s+p\.?|・第|・無番号挿入葉)"
            r"|写本（[^）\r\n]+）\s*f\.?\s*\d+[rv]"
            r"|自筆稿(?:\s+第\d+巻\s+f\.?\s*\d+[rv]?|\s+f\.?\s*\d+[rv]?)"
            r"|原稿\s+p\."
            r"|底本(?:\s+p\.?|画像\s*\d)"
            r"|デジタル画像\s*\d"
            r"|原誌(?:\s*p\.?|\d+頁)"
            r"|原報告第\d+(?:[–-]\d+)?頁"
            r"|クラウス\s*117\s*写本\s+f\.?\s*\d+[rv]"
            r")",
            label,
            re.IGNORECASE,
        )
    )


def is_placeholder_original_marker(value: str) -> bool:
    label = (
        original_marker_label(value)
        if value.lstrip().startswith(("〔", "{{"))
        else value.strip()
    )
    return bool(
        re.fullmatch(
            r"(?:原刊(?:旧付番)?|原書|原写本|原稿|底本|原誌)"
            r"\s+p\.?\s*(?:X|fX)",
            label,
            re.IGNORECASE,
        )
        or re.fullmatch(r"原資料\s*[:：]\s*(?:X|○+)", label, re.IGNORECASE)
        or re.fullmatch(r"出所\s+(?:X|○+)", label, re.IGNORECASE)
    )


def first_concrete_original_marker(value: str) -> re.Match[str] | None:
    return next(
        (
            marker
            for marker in ORIGINAL_MARKER_RE.finditer(value)
            if is_original_page_marker(marker.group(0))
            and not is_placeholder_original_marker(marker.group(0))
        ),
        None,
    )


def markdown_paragraphs(path: Path) -> list[str]:
    source = path.read_text(encoding="utf-8")
    heading = TRANSLATION_HEADING_RE.search(source)
    front_matter = FRONT_MATTER_HEADING_RE.search(source)
    marker = first_concrete_original_marker(source)
    if heading and (not marker or heading.start() <= marker.start()):
        source = source[heading.end() :]
    elif front_matter and (not marker or front_matter.start() <= marker.start()):
        source = source[front_matter.start() :]
    elif marker:
        source = source[marker.start() :]

    paragraphs: list[str] = []
    buffer: list[str] = []
    in_fence = False

    def flush() -> None:
        if not buffer:
            return
        text = " ".join(part.strip() for part in buffer if part.strip())
        buffer.clear()
        if text:
            paragraphs.append(text)

    for raw_line in source.splitlines():
        line = raw_line.rstrip()
        if re.match(r"^\s*" + re.escape(chr(96) * 3), line):
            flush()
            in_fence = not in_fence
            continue
        if in_fence:
            buffer.append(line)
            continue
        if not line.strip():
            flush()
            continue
        if re.match(r"^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*$", line):
            flush()
            continue
        if line.lstrip().startswith("#"):
            flush()
            paragraphs.append(line)
            continue
        if ORIGINAL_MARKER_RE.search(line):
            flush()
            paragraphs.append(line)
            continue
        if STANDALONE_SOURCE_PAGE_RE.fullmatch(line.strip()):
            flush()
            paragraphs.append(line.strip())
            continue
        if "|" in line and line.strip().startswith("|"):
            flush()
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            paragraphs.append("　".join(cell for cell in cells if cell))
            continue
        buffer.append(line)
    flush()
    return paragraphs


def docx_part_paragraphs(archive: zipfile.ZipFile, name: str) -> list[str]:
    try:
        root = ET.fromstring(archive.read(name))
    except KeyError:
        return []
    style_names: dict[str, str] = {}
    try:
        styles_root = ET.fromstring(archive.read("word/styles.xml"))
    except KeyError:
        styles_root = None
    if styles_root is not None:
        for style in styles_root.findall(f"{W}style"):
            style_id = style.get(f"{W}styleId")
            name_node = style.find(f"{W}name")
            if style_id and name_node is not None and name_node.get(f"{W}val"):
                style_names[style_id] = str(name_node.get(f"{W}val"))

    paragraphs: list[str] = []
    for paragraph in root.iter(f"{W}p"):
        pieces: list[str] = []
        for node in paragraph.iter():
            if node.tag == f"{W}t" and node.text:
                pieces.append(node.text)
            elif node.tag == f"{W}tab":
                pieces.append("\t")
            elif node.tag in {f"{W}br", f"{W}cr"}:
                pieces.append("\n")
        text = re.sub(r"[ \t]+", " ", "".join(pieces))
        text = re.sub(r"\s*\n\s*", " ", text).strip()
        if text:
            ppr = paragraph.find(f"{W}pPr")
            style_node = ppr.find(f"{W}pStyle") if ppr is not None else None
            style_id = style_node.get(f"{W}val") if style_node is not None else None
            style_name = style_names.get(style_id or "", "")
            if (
                DOCX_STYLE_SENSITIVE_MARKER_RE.match(text)
                and style_name not in DOCX_SOURCE_LOCATION_STYLES
            ):
                text = re.sub(
                    r"^(\s*〔\s*)",
                    rf"\1{DOCX_NON_LOCATION_SENTINEL}",
                    text,
                    count=1,
                )
            paragraphs.append(text)
    return paragraphs


def docx_paragraphs(path: Path) -> list[str]:
    with zipfile.ZipFile(path) as archive:
        main = docx_part_paragraphs(archive, "word/document.xml")
        notes = docx_part_paragraphs(archive, "word/footnotes.xml")
        notes.extend(docx_part_paragraphs(archive, "word/endnotes.xml"))

    heading_index = next(
        (
            index
            for index, paragraph in enumerate(main)
            if TRANSLATION_HEADING_RE.match(paragraph)
        ),
        None,
    )
    front_matter_index = next(
        (
            index
            for index, paragraph in enumerate(main)
            if FRONT_MATTER_TEXT_RE.match(paragraph)
        ),
        None,
    )
    marker_index = next(
        (
            index
            for index, paragraph in enumerate(main)
            if first_concrete_original_marker(paragraph)
        ),
        None,
    )
    if heading_index is not None and (
        marker_index is None or heading_index <= marker_index
    ):
        main = main[heading_index + 1 :]
    elif front_matter_index is not None and (
        marker_index is None or front_matter_index <= marker_index
    ):
        main = main[front_matter_index:]
    elif marker_index is not None:
        main = main[marker_index:]
    if notes:
        main.extend(["原注", *notes])
    return main


def xml_local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def epub_block_elements(element: ET.Element) -> list[ET.Element]:
    """Return leaf-level textual blocks in EPUB reading order."""
    output: list[ET.Element] = []

    def visit(node: ET.Element) -> None:
        if xml_local_name(node.tag) in EPUB_BLOCK_TAGS:
            output.append(node)
            return
        for child in list(node):
            visit(child)

    visit(element)
    return output


def epub_link_target(document_member: str, href: str) -> str | None:
    """Resolve a same-EPUB fragment link without allowing outside paths."""
    path, separator, fragment = href.partition("#")
    if not separator or not fragment:
        return None
    target_member = document_member
    if path:
        target_member = posixpath.normpath(
            posixpath.join(posixpath.dirname(document_member), unquote(path))
        )
    if target_member == ".." or target_member.startswith("../"):
        return None
    return f"{target_member}#{unquote(fragment)}"


def epub_footnote_reference_pages(
    documents: list[tuple[str, ET.Element]],
) -> dict[str, str]:
    """Map EPUB noteref anchors to the source page current at the citation."""
    current_marker = DEFAULT_SOURCE_LOCATION
    output: dict[str, str] = {}
    for member, body in documents:
        for block in epub_block_elements(body):
            value = re.sub(r"\s+", " ", "".join(block.itertext())).strip()
            for marker in ORIGINAL_MARKER_RE.finditer(value):
                if is_original_page_marker(marker.group(0)) and not (
                    is_placeholder_original_marker(marker.group(0))
                ):
                    current_marker = original_marker_label(marker.group(0))
            for node in block.iter():
                anchor_id = node.get("id")
                classes = set((node.get("class") or "").split())
                role = node.get("role") or ""
                if anchor_id and (
                    anchor_id.startswith("fnref")
                    or "footnote-ref" in classes
                    or role == "doc-noteref"
                ):
                    output[f"{member}#{anchor_id}"] = current_marker
    return output


def epub_block_paragraphs(
    element: ET.Element,
    *,
    document_member: str = "",
    reference_pages: dict[str, str] | None = None,
) -> list[str]:
    """Return EPUB text, restoring cited pages on end-of-chapter footnotes."""
    output: list[str] = []
    skipping_metadata_section = False
    for block in epub_block_elements(element):
        value = re.sub(r"\s+", " ", "".join(block.itertext())).strip()
        if not value:
            continue
        is_heading = xml_local_name(block.tag) in {
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
        }
        if is_heading:
            if EPUB_METADATA_HEADING_RE.fullmatch(value):
                skipping_metadata_section = True
                continue
            if skipping_metadata_section:
                skipping_metadata_section = False
        elif skipping_metadata_section and first_concrete_original_marker(value):
            # Some compact editions keep the rights preface and the translated
            # body in one section. The first printed-page marker is the explicit
            # boundary between them.
            skipping_metadata_section = False
        if skipping_metadata_section:
            continue
        cited_page: str | None = None
        if reference_pages:
            for node in block.iter():
                classes = set((node.get("class") or "").split())
                role = node.get("role") or ""
                href = node.get("href") or ""
                if "footnote-back" not in classes and role != "doc-backlink":
                    continue
                target = epub_link_target(document_member, href)
                if target and target in reference_pages:
                    cited_page = reference_pages[target]
                    break
        if cited_page and not first_concrete_original_marker(value):
            value = f"〔{cited_page}〕{value}"
        output.append(value)
    return output


def facsimile_labels_only(paragraphs: list[str]) -> bool:
    return bool(paragraphs) and all(FACSIMILE_ONLY_RE.fullmatch(p) for p in paragraphs)


def trim_paragraphs_to_translation(
    paragraphs: list[str], *, allow_marker_fallback: bool = True
) -> list[str]:
    heading_index = next(
        (
            index
            for index, paragraph in enumerate(paragraphs)
            if TRANSLATION_HEADING_RE.match(paragraph)
        ),
        None,
    )
    front_matter_index = next(
        (
            index
            for index, paragraph in enumerate(paragraphs)
            if FRONT_MATTER_TEXT_RE.match(paragraph)
        ),
        None,
    )
    marker_index = next(
        (
            index
            for index, paragraph in enumerate(paragraphs)
            if first_concrete_original_marker(paragraph)
        ),
        None,
    )
    if heading_index is not None and (
        marker_index is None or heading_index <= marker_index
    ):
        return paragraphs[heading_index + 1 :]
    if front_matter_index is not None and (
        marker_index is None or front_matter_index <= marker_index
    ):
        return paragraphs[front_matter_index:]
    if marker_index is not None and allow_marker_fallback:
        return paragraphs[marker_index:]
    return paragraphs


def epub_paragraphs(path: Path) -> list[str]:
    """Read the approved reflow EPUB mirror when a private LFS master is absent."""
    with zipfile.ZipFile(path) as archive:
        container = ET.fromstring(archive.read("META-INF/container.xml"))
        rootfile = container.find(
            f".//{{{EPUB_CONTAINER_NS}}}rootfile"
        )
        if rootfile is None or not rootfile.get("full-path"):
            raise ValueError(f"{path}: EPUB rootfile is missing")
        opf_name = rootfile.get("full-path")
        assert opf_name is not None
        opf = ET.fromstring(archive.read(opf_name))
        manifest = {
            item.get("id"): item.get("href")
            for item in opf.findall(f".//{{{EPUB_OPF_NS}}}manifest/{{{EPUB_OPF_NS}}}item")
            if item.get("id") and item.get("href")
        }
        navigation_items = {
            item.get("id")
            for item in opf.findall(f".//{{{EPUB_OPF_NS}}}manifest/{{{EPUB_OPF_NS}}}item")
            if item.get("id")
            and "nav" in (item.get("properties") or "").split()
        }
        spine = [
            item.get("idref")
            for item in opf.findall(f".//{{{EPUB_OPF_NS}}}spine/{{{EPUB_OPF_NS}}}itemref")
            if item.get("idref")
        ]
        opf_parent = Path(opf_name).parent
        paragraphs: list[str] = []
        documents: list[tuple[str, ET.Element]] = []
        for item_id in spine:
            # Navigation documents duplicate the book's headings and are often
            # placed before the chapters in the spine. Indexing them would both
            # duplicate hits and break the source-to-PDF reading order.
            if item_id in navigation_items:
                continue
            href = manifest.get(item_id)
            if not href:
                continue
            member = (opf_parent / unquote(href.split("#", 1)[0])).as_posix()
            try:
                raw_document = archive.read(member)
            except KeyError as error:
                raise ValueError(f"{path}: unreadable EPUB document {member}") from error
            try:
                document = ET.fromstring(raw_document)
            except ET.ParseError:
                parser = ForgivingEpubBlockParser()
                parser.feed(raw_document.decode("utf-8", errors="replace"))
                parser.close()
                if not facsimile_labels_only(parser.paragraphs):
                    paragraphs.extend(parser.paragraphs)
                continue
            body = next(
                (node for node in document.iter() if xml_local_name(node.tag) == "body"),
                document,
            )
            documents.append((member, body))
        reference_pages = epub_footnote_reference_pages(documents)
        for member, body in documents:
            document_paragraphs = epub_block_paragraphs(
                body,
                document_member=member,
                reference_pages=reference_pages,
            )
            if not facsimile_labels_only(document_paragraphs):
                paragraphs.extend(document_paragraphs)
    # An EPUB spine already supplies reading order. A first concrete marker can
    # occur very late in archival editions whose earlier records use headings
    # rather than bracketed page labels, so it must not be used as a trim point.
    return trim_paragraphs_to_translation(paragraphs, allow_marker_fallback=False)


def paragraphs_with_original_pages(paragraphs: list[str]) -> list[tuple[str, str]]:
    current_marker = DEFAULT_SOURCE_LOCATION
    output: list[tuple[str, str]] = []
    for paragraph in paragraphs:
        standalone_marker = STANDALONE_SOURCE_PAGE_RE.fullmatch(paragraph.strip())
        if standalone_marker:
            current_marker = re.sub(r"\s+", " ", paragraph.strip())
            output.append((current_marker, current_marker))
            continue
        paragraph = ORIGINAL_MARKER_RE.sub(
            lambda match: ""
            if is_placeholder_original_marker(match.group(0))
            else match.group(0),
            paragraph,
        )
        cursor = 0
        for marker in (
            match
            for match in ORIGINAL_MARKER_RE.finditer(paragraph)
            if is_original_page_marker(match.group(0))
            and not is_placeholder_original_marker(match.group(0))
        ):
            before = clean_markdown_inline(paragraph[cursor : marker.start()])
            if before:
                output.append((current_marker, before))
            current_marker = original_marker_label(marker.group(0))
            embedded_note = embedded_source_note(marker.group(0))
            if embedded_note:
                output.append((current_marker, f"訳注　{embedded_note}"))
            cursor = marker.end()
        after = clean_markdown_inline(paragraph[cursor:])
        if after:
            output.append((current_marker, after))
    return output


def original_labels_for_pdf_pages(pages: list[str]) -> list[list[str]]:
    output: list[list[str]] = []
    for page in pages:
        labels: list[str] = []
        for marker in ORIGINAL_MARKER_RE.finditer(page):
            if not is_original_page_marker(marker.group(0)):
                continue
            if is_placeholder_original_marker(marker.group(0)):
                continue
            label = original_marker_label(marker.group(0))
            if label not in labels:
                labels.append(label)
        for line in page.splitlines():
            candidate = re.sub(r"\s+", " ", line).strip()
            if (
                STANDALONE_SOURCE_PAGE_RE.fullmatch(candidate)
                and candidate not in labels
            ):
                labels.append(candidate)
        output.append(labels)
    return output


ALIGNMENT_METHODS = (
    "exact",
    "fingerprint",
    "fuzzy",
    "sourcePage",
    "inherited",
    "unmapped",
)
VERIFIED_ALIGNMENT_METHODS = {"exact", "fingerprint", "fuzzy", "sourcePage"}


def alignment_summary(chunks: list[dict[str, str]]) -> dict[str, int]:
    return {
        method: sum(1 for chunk in chunks if chunk["alignment"] == method)
        for method in ALIGNMENT_METHODS
    }


def apply_source_page_alignment(
    chunks: list[dict[str, str]], pdf_original_labels: list[list[str]]
) -> None:
    """Use an unambiguous printed-page label for otherwise weak alignments."""
    label_pages: dict[str, set[int]] = {}
    for page_number, labels in enumerate(pdf_original_labels, start=1):
        for label in labels:
            label_pages.setdefault(normalize_for_match(label), set()).add(page_number)

    for chunk in chunks:
        if chunk["alignment"] in {"exact", "fingerprint"}:
            continue
        candidate_pages: set[int] = set()
        for label in chunk.get("originalPage", "").split("／"):
            candidate_pages.update(label_pages.get(normalize_for_match(label), set()))
        if len(candidate_pages) == 1:
            chunk["pdfPage"] = next(iter(candidate_pages))
            chunk["alignment"] = "sourcePage"


def split_long_text(value: str, maximum: int = 190) -> list[str]:
    if len(value) <= maximum:
        return [value]
    parts: list[str] = []
    rest = value
    while len(rest) > maximum:
        minimum = max(80, maximum - 55)
        cut = max(
            (rest.rfind(mark, minimum, maximum + 1) for mark in "、；;：:，,"),
            default=-1,
        )
        if cut < minimum:
            cut = maximum
        else:
            cut += 1
        parts.append(rest[:cut].strip())
        rest = rest[cut:].strip()
    if rest:
        parts.append(rest)
    return parts


def searchable_chunks(
    annotated: list[tuple[str, str]], target: int = 170
) -> list[dict[str, str]]:
    chunks: list[dict[str, str]] = []
    for original_page, paragraph in annotated:
        sentence_parts = [
            part.strip()
            for part in re.split(r"(?<=[。！？!?])", paragraph)
            if part.strip()
        ]
        if not sentence_parts:
            continue
        buffer = ""
        pieces: list[str] = []
        for sentence in sentence_parts:
            for piece in split_long_text(sentence):
                candidate = f"{buffer}{piece}" if buffer else piece
                if buffer and len(candidate) > target:
                    pieces.append(buffer)
                    buffer = piece
                else:
                    buffer = candidate
        if buffer:
            pieces.append(buffer)
        for piece in pieces:
            piece = re.sub(r"\s+", " ", piece).strip()
            if len(normalize_for_match(piece)) >= 2:
                chunks.append({"originalPage": original_page, "text": piece})
    for index, chunk in enumerate(chunks, start=1):
        chunk["id"] = f"b{index:05d}"
    return chunks


def pdf_pages(path: Path) -> list[str]:
    command = ["pdftotext", "-enc", "UTF-8", "-layout", str(path), "-"]
    completed = subprocess.run(
        command,
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    pages = completed.stdout.decode("utf-8", errors="replace").split("\f")
    if pages and not pages[-1].strip():
        pages.pop()
    if not pages:
        raise RuntimeError(f"No PDF text extracted: {path}")
    return pages


def ocr_pdf_pages(path: Path, page_count: int, page_limit: int) -> list[str]:
    if page_limit < 1 or page_limit > page_count:
        raise ValueError(f"{path}: invalid OCR page limit {page_limit}")
    project_root = Path(__file__).resolve().parents[2]
    compressed_model = (
        project_root
        / "node_modules"
        / "@tesseract.js-data"
        / "jpn"
        / "4.0.0_best_int"
        / "jpn.traineddata.gz"
    )
    if not compressed_model.is_file():
        raise RuntimeError(
            "Japanese OCR model is missing; run npm ci before building search"
        )
    for command in ("pdftoppm", "tesseract"):
        if not shutil.which(command):
            raise RuntimeError(f"{command} is required for image-only PDF mapping")

    cache_directory = project_root / ".cache" / "fulltext-ocr"
    cache_filename = (
        f"v{OCR_CACHE_VERSION}-{sha256_file(path)}-pages-{page_limit}.json"
    )
    cache_path = cache_directory / cache_filename
    if cache_path.is_file():
        cached = json.loads(cache_path.read_text(encoding="utf-8"))
        if isinstance(cached, list) and len(cached) == page_count:
            print(f"{path.stem}: reused {page_limit}-page OCR cache", file=sys.stderr)
            return [str(page) for page in cached]

    with tempfile.TemporaryDirectory(prefix="fulltext-ocr-") as directory:
        temporary = Path(directory)
        tessdata = temporary / "tessdata"
        tessdata.mkdir()
        with gzip.open(compressed_model, "rb") as source, (
            tessdata / "jpn.traineddata"
        ).open("wb") as destination:
            shutil.copyfileobj(source, destination)

        render_prefix = temporary / "page"
        subprocess.run(
            [
                "pdftoppm",
                "-f",
                "1",
                "-l",
                str(page_limit),
                "-r",
                "160",
                "-jpeg",
                "-jpegopt",
                "quality=82",
                str(path),
                str(render_prefix),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
        )
        images = sorted(
            temporary.glob("page-*.jpg"),
            key=lambda image: int(image.stem.rsplit("-", 1)[1]),
        )
        if len(images) != page_limit:
            raise RuntimeError(
                f"{path}: rendered {len(images)} OCR pages, expected {page_limit}"
            )

        def recognize(image: Path) -> tuple[int, str]:
            completed = subprocess.run(
                [
                    "tesseract",
                    str(image),
                    "stdout",
                    "--tessdata-dir",
                    str(tessdata),
                    "-l",
                    "jpn",
                    "--psm",
                    "6",
                    "-c",
                    "preserve_interword_spaces=1",
                ],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            page_number = int(image.stem.rsplit("-", 1)[1])
            return page_number, completed.stdout.decode("utf-8", errors="replace")

        output = [""] * page_count
        completed_pages = 0
        with ThreadPoolExecutor(max_workers=min(2, os.cpu_count() or 1)) as executor:
            futures = [executor.submit(recognize, image) for image in images]
            for future in as_completed(futures):
                page_number, text = future.result()
                output[page_number - 1] = text
                completed_pages += 1
                if completed_pages % 10 == 0 or completed_pages == page_limit:
                    print(
                        f"{path.stem}: OCR {completed_pages}/{page_limit} pages",
                        file=sys.stderr,
                        flush=True,
                    )
        cache_directory.mkdir(parents=True, exist_ok=True)
        cache_path.write_text(
            json.dumps(output, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        return output


def ngrams(value: str, width: int = 6) -> set[str]:
    if len(value) <= width:
        return {value} if value else set()
    return {value[index : index + width] for index in range(len(value) - width + 1)}


def fingerprint_position(
    needle: str, haystack: str, search_start: int, search_end: int
) -> tuple[int | None, str]:
    position = haystack.find(needle, search_start, search_end)
    if position >= 0:
        return position, "exact"
    if len(needle) < 18:
        position = haystack.find(needle, search_start, search_end)
        return (position, "exact") if position >= 0 else (None, "unmapped")

    window_size = min(48, max(20, len(needle) // 2))
    offsets = sorted(
        {
            0,
            max(0, len(needle) // 4),
            max(0, len(needle) // 2),
            max(0, len(needle) - window_size),
        }
    )
    candidates: list[int] = []
    for offset in offsets:
        fingerprint = needle[offset : offset + window_size]
        if len(fingerprint) < 16:
            continue
        found = haystack.find(fingerprint, search_start, search_end)
        if found >= 0:
            candidates.append(max(0, found - offset))
    if candidates:
        return min(candidates), "fingerprint"
    return None, "unmapped"


def align_chunks_to_pdf(
    chunks: list[dict[str, str]], pages: list[str]
) -> dict[str, int]:
    normalized_pages = [normalize_for_match(page) for page in pages]
    page_ngrams = [ngrams(page) for page in normalized_pages]
    page_starts: list[int] = []
    total = 0
    for page in normalized_pages:
        page_starts.append(total)
        total += len(page)
    combined = "".join(normalized_pages)

    def physical_page(position: int) -> int:
        page_number = bisect.bisect_right(page_starts, position)
        return min(max(page_number, 1), len(pages))

    def verified() -> list[int]:
        return [
            index
            for index, chunk in enumerate(chunks)
            if chunk["alignment"] in {"exact", "fingerprint", "fuzzy"}
        ]

    def context(
        index: int, verified_indices: list[int]
    ) -> tuple[int | None, int | None, int, int, float]:
        anchor_position = bisect.bisect_left(verified_indices, index)
        previous_index = (
            verified_indices[anchor_position - 1] if anchor_position > 0 else None
        )
        next_index = (
            verified_indices[anchor_position]
            if anchor_position < len(verified_indices)
            else None
        )
        previous_page = (
            chunks[previous_index]["pdfPage"] if previous_index is not None else None
        )
        next_page = chunks[next_index]["pdfPage"] if next_index is not None else None
        if previous_index is not None and next_index is not None:
            span = next_index - previous_index
            ratio = (index - previous_index) / span if span else 0.0
            target_page = previous_page + (next_page - previous_page) * ratio
        else:
            target_page = next_page or previous_page or 1
        lower_page = max(1, min(previous_page or 1, next_page or len(pages)) - 2)
        upper_page = min(
            len(pages), max(previous_page or 1, next_page or len(pages)) + 2
        )
        return previous_index, next_index, lower_page, upper_page, target_page

    # EPUB generators may place a chapter's notes after its body even though the
    # PDF keeps them on their cited pages. Map strong text independently across
    # the complete PDF so those intentional source-order changes cannot poison
    # later chapters.
    for chunk in chunks:
        needle = normalize_for_match(chunk["text"])
        position: int | None = None
        method = "unmapped"
        if len(needle) >= 18:
            first = combined.find(needle)
            if first >= 0 and combined.find(needle, first + 1) < 0:
                position, method = first, "exact"
            elif first < 0:
                position, method = fingerprint_position(
                    needle, combined, 0, len(combined)
                )
        elif len(needle) >= 12:
            first = combined.find(needle)
            if first >= 0 and combined.find(needle, first + 1) < 0:
                position, method = first, "exact"
        chunk["pdfPage"] = physical_page(position) if position is not None else None
        chunk["alignment"] = method if position is not None else "unmapped"

    # Resolve remaining substantive text by similarity only within the physical
    # page interval established by its two nearest reliable source neighbours.
    verified_indices = verified()
    for index, chunk in enumerate(chunks):
        needle = normalize_for_match(chunk["text"])
        if chunk["pdfPage"] is not None or len(needle) < 12:
            continue
        _, _, lower_page, upper_page, target_page = context(index, verified_indices)
        chunk_grams = ngrams(needle)
        best_score = 0.0
        best_page: int | None = None
        for page_number in range(lower_page, upper_page + 1):
            if not normalized_pages[page_number - 1]:
                continue
            score = len(chunk_grams & page_ngrams[page_number - 1]) / len(
                chunk_grams
            )
            if score > best_score or (
                score == best_score
                and best_page is not None
                and abs(page_number - target_page) < abs(best_page - target_page)
            ):
                best_score = score
                best_page = page_number
        if best_page is not None and best_score >= 0.24:
            chunk["pdfPage"] = best_page
            chunk["alignment"] = "fuzzy"

    # Finally place short headings/table values and the rare unmatched passage.
    # Short text never acts as an anchor, so repeated values such as "20" cannot
    # move unrelated results to a distant page.
    verified_indices = verified()
    for index, chunk in enumerate(chunks):
        if chunk["pdfPage"] is not None:
            continue
        previous_index, next_index, lower_page, upper_page, target_page = context(
            index, verified_indices
        )
        needle = normalize_for_match(chunk["text"])
        matching_pages = [
            page_number
            for page_number in range(lower_page, upper_page + 1)
            if needle and needle in normalized_pages[page_number - 1]
        ]
        if matching_pages:
            chunk["pdfPage"] = min(
                matching_pages,
                key=lambda page_number: abs(page_number - target_page),
            )
            chunk["alignment"] = "exact" if len(needle) >= 12 else "inherited"
            continue

        previous_page = (
            chunks[previous_index]["pdfPage"] if previous_index is not None else None
        )
        next_page = chunks[next_index]["pdfPage"] if next_index is not None else None
        marker = chunk.get("originalPage")
        if (
            next_index is not None
            and marker
            and chunks[next_index].get("originalPage") == marker
        ):
            chunk["pdfPage"] = next_page
        elif (
            previous_index is not None
            and marker
            and chunks[previous_index].get("originalPage") == marker
        ):
            chunk["pdfPage"] = previous_page
        elif previous_index is None:
            chunk["pdfPage"] = next_page
        elif next_index is None:
            chunk["pdfPage"] = previous_page
        elif index - previous_index < next_index - index:
            chunk["pdfPage"] = previous_page
        else:
            chunk["pdfPage"] = next_page
        chunk["alignment"] = (
            "inherited" if chunk["pdfPage"] is not None else "unmapped"
        )

    return alignment_summary(chunks)


def resolve_path(manifest_path: Path, value: str) -> Path:
    candidate = Path(value)
    if not candidate.is_absolute():
        candidate = manifest_path.parent / candidate
    return candidate.resolve()


def build_work(manifest_path: Path, spec: dict) -> dict:
    slug = spec["slug"]
    source = resolve_path(manifest_path, spec.get("source") or spec["master"])
    pdf = resolve_path(manifest_path, spec["pdf"])
    source_format = spec.get("format") or source.suffix.lstrip(".").lower()
    if source_format in {"md", "markdown"}:
        paragraphs = markdown_paragraphs(source)
        source_format = "markdown"
    elif source_format == "docx":
        paragraphs = docx_paragraphs(source)
    elif source_format == "epub":
        paragraphs = epub_paragraphs(source)
    else:
        raise ValueError(f"{slug}: unsupported search source format {source_format}")

    source_sha256 = sha256_file(source)
    pdf_sha256 = sha256_file(pdf)
    if spec.get("sourceSha256") and source_sha256 != spec["sourceSha256"]:
        raise ValueError(f"{slug}: search source SHA-256 mismatch")
    if spec.get("pdfSha256") and pdf_sha256 != spec["pdfSha256"]:
        raise ValueError(f"{slug}: PDF SHA-256 mismatch")

    annotated = paragraphs_with_original_pages(paragraphs)
    chunks = searchable_chunks(annotated)
    if not chunks:
        raise ValueError(f"{slug}: no searchable chunks")
    if any(is_placeholder_original_marker(chunk["originalPage"]) for chunk in chunks):
        raise ValueError(f"{slug}: placeholder original-page marker reached index")
    pages = pdf_pages(pdf)
    pdf_text_mode = "embedded"
    if not any(normalize_for_match(page) for page in pages):
        page_limit = spec.get("ocrPageLimit")
        if not page_limit:
            raise ValueError(
                f"{slug}: PDF has no embedded text and no approved OCR page limit"
            )
        pages = ocr_pdf_pages(pdf, len(pages), int(page_limit))
        pdf_text_mode = "japanese-ocr"
    align_chunks_to_pdf(chunks, pages)
    pdf_original_labels = original_labels_for_pdf_pages(pages)
    apply_source_page_alignment(chunks, pdf_original_labels)
    alignment = alignment_summary(chunks)
    for chunk in chunks:
        labels = pdf_original_labels[chunk["pdfPage"] - 1]
        if labels:
            chunk["originalPage"] = "／".join(labels)
    substantive = sum(
        1 for chunk in chunks if len(normalize_for_match(chunk["text"])) >= 12
    )
    verified = sum(
        1
        for chunk in chunks
        if len(normalize_for_match(chunk["text"])) >= 12
        and chunk["alignment"] in VERIFIED_ALIGNMENT_METHODS
    )
    verified_rate = verified / substantive if substantive else 1.0
    minimum_rate = float(spec.get("minimumAlignmentRate", 0.9))
    if verified_rate < minimum_rate:
        raise ValueError(
            f"{slug}: PDF alignment {verified_rate:.1%} is below {minimum_rate:.1%}"
        )
    if any(chunk["pdfPage"] is None for chunk in chunks):
        raise ValueError(f"{slug}: at least one chunk has no PDF page")

    return {
        "slug": slug,
        "title": spec["title"],
        "author": spec["author"],
        "originalTitle": spec.get("originalTitle"),
        "originalAuthor": spec.get("originalAuthor"),
        "originalPublication": spec.get("originalPublication"),
        "attributedTo": spec.get("attributedTo"),
        "attributionStatus": spec.get("attributionStatus"),
        "attributionNote": spec.get("attributionNote"),
        "recordClass": spec["recordClass"],
        "url": spec.get("url", f"/publications/{slug}/"),
        "pdfUrl": spec["pdfUrl"],
        "sourceFormat": source_format,
        "sourceMode": spec.get("sourceMode", "canonical-master"),
        "sourceSha256": source_sha256,
        "masterPath": spec.get("masterPath"),
        "pdfSha256": pdf_sha256,
        "pdfPageCount": len(pages),
        "chunks": chunks,
        "mappingSummary": {
            **alignment,
            "verifiedRate": round(verified_rate, 6),
            "pdfTextMode": pdf_text_mode,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    manifest_path = args.manifest.resolve()
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("schemaVersion") != 1:
        raise ValueError("Unsupported manifest schema")
    works = []
    for spec in manifest["works"]:
        work = build_work(manifest_path, spec)
        works.append(work)
        summary = work["mappingSummary"]
        print(
            f"{work['slug']}: {len(work['chunks'])} chunks, "
            f"{work['pdfPageCount']} PDF pages, "
            f"{summary['verifiedRate']:.1%} verified",
            file=sys.stderr,
            flush=True,
        )
    corpus = {
        "schemaVersion": 1,
        "searchShard": manifest.get("searchShard"),
        "archiveCommit": manifest.get("archiveCommit"),
        "assetManifestSha256": manifest.get("assetManifestSha256"),
        "bibliographicManifestSha256": manifest.get(
            "bibliographicManifestSha256"
        ),
        "works": works,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(corpus, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
