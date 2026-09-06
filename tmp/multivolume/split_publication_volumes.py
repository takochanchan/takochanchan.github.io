#!/usr/bin/env python3
"""Create deterministic volume-specific PDF and EPUB editions for seven works."""

from __future__ import annotations

import copy
import hashlib
import io
import json
import os
import posixpath
import re
import shutil
import uuid
import zipfile
from collections import Counter, deque
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import unquote, urlsplit

import fitz
from lxml import etree
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / "tmp" / "multivolume"
CONFIG_PATH = WORK / "volume-split-config.json"
INPUT_ROOT = Path(os.environ.get("MULTIVOLUME_INPUT_ROOT", WORK / "inputs"))
EXTRACT_ROOT = Path(os.environ.get("MULTIVOLUME_EPUB_ROOT", WORK / "epubs"))
OUTPUT_ROOT = Path(os.environ.get("MULTIVOLUME_OUTPUT_ROOT", ROOT / "output" / "multivolume"))
PDF_OUTPUT = OUTPUT_ROOT / "pdf"
EPUB_OUTPUT = OUTPUT_ROOT / "epub"
BUILD_ROOT = WORK / "epub-build" / f"run-{os.getpid()}"
FONT_REGULAR = Path(os.environ.get(
    "MULTIVOLUME_FONT_REGULAR",
    ROOT / "tmp" / "bancroft" / "fonts-full" / "NotoSansJP-Regular.otf",
))
FONT_BOLD = Path(os.environ.get(
    "MULTIVOLUME_FONT_BOLD",
    ROOT / "tmp" / "bancroft" / "fonts-full" / "NotoSansJP-Bold.otf",
))
FONT_LATIN = Path(os.environ.get(
    "MULTIVOLUME_FONT_LATIN",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
))
FONT_LATIN_ITALIC = Path(os.environ.get(
    "MULTIVOLUME_FONT_LATIN_ITALIC",
    "/opt/codex/runtimes/codex-primary-runtime/dependencies/native/"
    "libreoffice-headless/libreoffice/share/fonts/truetype/DejaVuSerif-Italic.ttf",
))

OPF_NS = "http://www.idpf.org/2007/opf"
DC_NS = "http://purl.org/dc/elements/1.1/"
XHTML_NS = "http://www.w3.org/1999/xhtml"
EPUB_NS = "http://www.idpf.org/2007/ops"
NCX_NS = "http://www.daisy.org/z3986/2005/ncx/"
XLINK_NS = "http://www.w3.org/1999/xlink"
NS = {"opf": OPF_NS, "dc": DC_NS, "x": XHTML_NS, "epub": EPUB_NS}
REVISION_TIMESTAMP = (2026, 9, 6, 0, 0, 0)
XML_PARSER = etree.XMLParser(resolve_entities=False, remove_blank_text=False)


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_config() -> dict[str, Any]:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    if config.get("schema_version") != 1:
        raise RuntimeError("Unsupported split configuration")
    volumes = [volume for publication in config["publications"] for volume in publication["volumes"]]
    if len(config["publications"]) != 7 or len(volumes) != 26:
        raise RuntimeError("Expected seven publications and twenty-six outputs")
    stems = [volume["stem"] for volume in volumes]
    if len(stems) != len(set(stems)):
        raise RuntimeError("Duplicate output stem")
    return config


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


def wrap_text(draw: ImageDraw.ImageDraw, value: str,
              typeface: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    tokens = re.findall(r"[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9._:/–—-]*|[ \t]+|.", value)
    for token in tokens:
        candidate = current + token
        width = draw.textbbox((0, 0), candidate, font=typeface)[2]
        if current and width > max_width:
            if token in "、。）」』】〕〉》］｝！？：；":
                lines.append((current + token).rstrip())
                current = ""
            elif current[-1] in "（「『【〔〈《［｛":
                lines.append(current[:-1].rstrip())
                current = current[-1] + token.lstrip()
            else:
                lines.append(current.rstrip())
                current = token.lstrip()
        else:
            current = candidate
    if current:
        lines.append(current.rstrip())
    return lines


def draw_centered(draw: ImageDraw.ImageDraw, y: int, value: str,
                  typeface: ImageFont.FreeTypeFont, fill: str) -> int:
    box = draw.textbbox((0, 0), value, font=typeface)
    draw.text(((1530 - (box[2] - box[0])) / 2, y), value, font=typeface, fill=fill)
    return y + box[3] - box[1]


def draw_centered_wrapped(draw: ImageDraw.ImageDraw, y: int, value: str,
                          typeface: ImageFont.FreeTypeFont, fill: str,
                          max_width: int, line_height: int) -> int:
    for line in wrap_text(draw, value, typeface, max_width):
        draw_centered(draw, y, line, typeface, fill)
        y += line_height
    return y


def draw_wrapped(draw: ImageDraw.ImageDraw, value: str, x: int, y: int,
                 typeface: ImageFont.FreeTypeFont, fill: str,
                 max_width: int, line_height: int) -> int:
    for line in wrap_text(draw, value, typeface, max_width):
        draw.text((x, y), line, font=typeface, fill=fill)
        y += line_height
    return y


def create_cover(publication: dict[str, Any], volume: dict[str, Any]) -> Image.Image:
    image = Image.new("RGB", (1530, 1980), "white")
    draw = ImageDraw.Draw(image)
    navy, grey, brick, blue = "#1f2a32", "#71808a", "#963b2b", "#234f6c"
    header = f"{publication['author']} ｜ {publication['title']} ｜ {volume['volume_label']}"
    draw_centered_wrapped(draw, 102, header, font(FONT_REGULAR, 27), grey, 1180, 42)
    draw_centered_wrapped(draw, 420, publication["series"], font(FONT_BOLD, 25), brick, 1120, 40)
    title_font_size = 62 if len(volume["title"]) <= 18 else 51
    y = draw_centered_wrapped(
        draw, 570, volume["title"], font(FONT_BOLD, title_font_size), navy, 1200, 86
    )
    y += 36
    y = draw_centered_wrapped(
        draw, y, volume["original_title"], font(FONT_LATIN_ITALIC, 25), grey, 1110, 40
    )
    draw.line((380, max(900, y + 54), 1150, max(900, y + 54)), fill=brick, width=3)
    y = max(1000, y + 120)
    y = draw_centered_wrapped(
        draw, y, publication["author"], font(FONT_BOLD, 36), navy, 1120, 54
    )
    draw_centered_wrapped(
        draw, y + 16, publication["original_author"], font(FONT_LATIN, 24), grey, 1100, 38
    )
    draw_centered_wrapped(
        draw, 1390, volume["subtitle"], font(FONT_BOLD, 28), blue, 1120, 46
    )
    draw_centered(draw, 1650, "原刊巻別公開版 · 2026", font(FONT_REGULAR, 25), grey)
    draw_centered(draw, 1840, "1", font(FONT_LATIN, 23), "#3e454a")
    return image


def create_note_page(publication: dict[str, Any], volume: dict[str, Any]) -> Image.Image:
    image = Image.new("RGB", (1530, 1980), "white")
    draw = ImageDraw.Draw(image)
    navy, grey, blue = "#263238", "#71808a", "#26709a"
    regular = font(FONT_REGULAR, 26)
    heading = font(FONT_BOLD, 40)
    subheading = font(FONT_BOLD, 34)
    header = f"{publication['author']} ｜ {publication['title']} ｜ {volume['volume_label']}"
    draw_centered_wrapped(draw, 102, header, font(FONT_REGULAR, 25), grey, 1190, 39)
    draw.text((182, 222), "本分冊について", font=heading, fill=blue)
    paragraph = (
        f"本書は、{publication['original_author']}, {publication['original_title']} の日本語全訳のうち、"
        f"{volume['volume_label']}（{volume['subtitle']}）を収録する。公開時に一冊へ合冊していた校訂版を、"
        "原刊の巻立てに沿ってPDF・EPUBとも分冊した。本文、注、図表、索引の内容と原刊頁標識は合冊版から変更していない。"
    )
    y = draw_wrapped(draw, paragraph, 182, 340, regular, navy, 1165, 48) + 34
    boundary_note = publication.get("boundary_note")
    if boundary_note:
        y = draw_wrapped(draw, boundary_note, 182, y, regular, navy, 1165, 48) + 34
    draw.text((182, y), "底本", font=subheading, fill=blue)
    y = draw_wrapped(draw, publication["source_summary"], 182, y + 75, regular, navy, 1165, 48) + 34
    draw.text((182, y), "権利・利用条件", font=subheading, fill=blue)
    y = draw_wrapped(draw, publication["rights_summary"], 182, y + 75, regular, navy, 1165, 48) + 34
    draw.text((182, y), "分冊方法", font=subheading, fill=blue)
    split_summary = "／".join(f"合冊版PDF {start}–{end}頁" for start, end in volume["pdf_ranges"])
    y = draw_wrapped(
        draw,
        f"本分冊は{split_summary}を収録し、先頭に巻別表紙と本説明を加えた。検索結果の頁リンクも本分冊の対応頁へ接続する。",
        182, y + 75, regular, navy, 1165, 48,
    )
    if y > 1770:
        raise RuntimeError(f"Note page overflow: {publication['slug']} {volume['id']} ({y})")
    draw_centered(draw, 1840, "2", font(FONT_LATIN, 23), "#3e454a")
    return image


def images_to_pdf(images: list[Image.Image]) -> bytes:
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=(612, 792), pageCompression=1, invariant=1)
    for image in images:
        jpeg = io.BytesIO()
        image.save(jpeg, format="JPEG", quality=94, optimize=True, subsampling=0)
        jpeg.seek(0)
        pdf.drawImage(ImageReader(jpeg), 0, 0, 612, 792)
        pdf.showPage()
    pdf.save()
    return buffer.getvalue()


def copied_pdf_pages(volume: dict[str, Any]) -> list[int]:
    return [
        page
        for first, last in volume["pdf_ranges"]
        for page in range(first, last + 1)
    ]


def create_pdf(publication: dict[str, Any], volume: dict[str, Any],
               source: fitz.Document, cover: Image.Image, note: Image.Image) -> Path:
    output = PDF_OUTPUT / f"{volume['stem']}.pdf"
    partial = output.with_suffix(".pdf.part")
    for attempt in range(2):
        front = fitz.open(stream=images_to_pdf([cover, note]), filetype="pdf")
        writer = fitz.open()
        writer.insert_pdf(front)
        for first, last in volume["pdf_ranges"]:
            writer.insert_pdf(source, from_page=first - 1, to_page=last - 1,
                              links=True, annots=True, widgets=True)
        writer.set_toc([[1, volume["volume_label"], 3]])
        writer.set_metadata({
            "title": volume["title"],
            "author": publication["original_author"],
            "subject": f"Japanese complete translation · {volume['volume_label']}",
            "keywords": "Japanese translation; volume edition",
            "creator": "Deterministic volume split from the approved combined edition",
            "producer": "PyMuPDF",
        })
        writer.save(partial, garbage=4, deflate=True, clean=False, no_new_id=True)
        writer.close()
        front.close()
        if partial.read_bytes()[-32:].rstrip().endswith(b"%%EOF"):
            partial.replace(output)
            break
        partial.unlink(missing_ok=True)
        if attempt:
            raise RuntimeError(f"PDF output was truncated twice: {output.name}")
    return output


def package_path(epub_root: Path) -> tuple[Path, str]:
    container = etree.parse(str(epub_root / "META-INF" / "container.xml"), XML_PARSER)
    relative = container.xpath("string(//*[local-name()='rootfile']/@full-path)")
    if not relative:
        raise RuntimeError("EPUB container has no package document")
    return epub_root / relative, relative


def prepare_epub_source(publication: dict[str, Any], epub_path: Path) -> Path:
    extracted = EXTRACT_ROOT / publication["slug"]
    if (extracted / "META-INF" / "container.xml").exists():
        return extracted
    extracted.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(epub_path) as archive:
        archive.extractall(extracted)
    return extracted


def opf_data(epub_root: Path) -> tuple[Path, str, etree._ElementTree, dict[str, etree._Element], list[str]]:
    opf_path, opf_relative = package_path(epub_root)
    tree = etree.parse(str(opf_path), XML_PARSER)
    items = tree.xpath("//*[local-name()='manifest']/*[local-name()='item']")
    by_href = {item.get("href"): item for item in items}
    by_id = {item.get("id"): item.get("href") for item in items}
    spine = [
        by_id[item.get("idref")]
        for item in tree.xpath("//*[local-name()='spine']/*[local-name()='itemref']")
    ]
    return opf_path, opf_relative, tree, by_href, spine


def property_href(by_href: dict[str, etree._Element], property_name: str) -> str:
    for href, item in by_href.items():
        if property_name in (item.get("properties") or "").split():
            return href
    raise RuntimeError(f"Manifest property missing: {property_name}")


def media_type_href(by_href: dict[str, etree._Element], media_type: str) -> str | None:
    for href, item in by_href.items():
        if item.get("media-type") == media_type:
            return href
    return None


def select_epub_content(volume: dict[str, Any], spine: list[str]) -> list[str]:
    positions = {href: index for index, href in enumerate(spine)}
    selected: list[str] = []
    for href in volume.get("epub_prepend", []):
        if href not in positions:
            raise RuntimeError(f"EPUB prepend is not in spine: {href}")
        selected.append(href)
    for first, last in volume["epub_ranges"]:
        if first not in positions or last not in positions or positions[first] > positions[last]:
            raise RuntimeError(f"Invalid EPUB range: {first}–{last}")
        selected.extend(spine[positions[first]:positions[last] + 1])
    excluded = set(volume.get("epub_exclude", []))
    selected = [href for href in selected if href not in excluded]
    return list(dict.fromkeys(selected))


def resolve_href(source_href: str, reference: str) -> str | None:
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc or not parsed.path:
        return None
    path = unquote(parsed.path)
    if path.startswith("/"):
        return path.lstrip("/")
    return posixpath.normpath(posixpath.join(posixpath.dirname(source_href), path))


def write_xml(tree: etree._ElementTree, path: Path, doctype: str | None = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(etree.tostring(
        tree,
        encoding="UTF-8",
        xml_declaration=True,
        doctype=doctype,
        pretty_print=False,
    ))


def xhtml_tree(path: Path) -> etree._ElementTree:
    return etree.parse(str(path), XML_PARSER)


def plain_text(tree: etree._ElementTree) -> str:
    return "".join(tree.getroot().itertext())


def sanitize_cross_volume_links(epub_root: Path, opf_relative: str,
                                selected: set[str]) -> dict[str, str]:
    opf_dir = (epub_root / opf_relative).parent
    hashes: dict[str, str] = {}
    for href in sorted(selected):
        if not href.lower().endswith((".xhtml", ".html", ".htm")):
            continue
        path = opf_dir / href
        tree = xhtml_tree(path)
        before = plain_text(tree)
        changed = False
        # A small portion of the Torquemada source inherited paragraph wrappers
        # around block-level page markers (for example, p > p).  XML accepts the
        # nesting, but EPUB 3's HTML content model does not.  Preserve the class,
        # children, order, and text while changing only the invalid outer wrapper.
        block_names = {
            "address", "article", "aside", "blockquote", "details", "dialog",
            "div", "dl", "fieldset", "figure", "footer", "form", "h1", "h2",
            "h3", "h4", "h5", "h6", "header", "hr", "main", "nav", "ol",
            "p", "pre", "section", "table", "ul",
        }
        for paragraph in tree.xpath("//*[local-name()='p'][*]"):
            if any(etree.QName(child).localname in block_names for child in paragraph):
                paragraph.tag = f"{{{XHTML_NS}}}div"
                changed = True
        for anchor in tree.xpath("//*[local-name()='a'][@href]"):
            reference = anchor.get("href")
            target = resolve_href(href, reference)
            if target and target.lower().endswith((".xhtml", ".html", ".htm")) and target not in selected:
                del anchor.attrib["href"]
                changed = True
        if changed:
            write_xml(tree, path, "<!DOCTYPE html>")
            after = plain_text(xhtml_tree(path))
            if before != after:
                raise RuntimeError(f"Cross-volume link cleanup changed text: {href}")
        hashes[href] = sha256_bytes(before.encode("utf-8"))
    return hashes


def create_volume_note(publication: dict[str, Any], volume: dict[str, Any],
                       path: Path, stylesheet_href: str | None) -> None:
    html = etree.Element(f"{{{XHTML_NS}}}html", nsmap={None: XHTML_NS, "epub": EPUB_NS})
    html.set("lang", "ja")
    html.set("{http://www.w3.org/XML/1998/namespace}lang", "ja")
    head = etree.SubElement(html, f"{{{XHTML_NS}}}head")
    etree.SubElement(head, f"{{{XHTML_NS}}}title").text = volume["title"]
    if stylesheet_href:
        relative_css = posixpath.relpath(stylesheet_href, posixpath.dirname("text/volume_note.xhtml"))
        etree.SubElement(
            head, f"{{{XHTML_NS}}}link", rel="stylesheet", type="text/css", href=relative_css
        )
    body = etree.SubElement(html, f"{{{XHTML_NS}}}body")
    section = etree.SubElement(body, f"{{{XHTML_NS}}}section")
    section.set(f"{{{EPUB_NS}}}type", "frontmatter")
    etree.SubElement(section, f"{{{XHTML_NS}}}h1").text = "本分冊について"
    etree.SubElement(section, f"{{{XHTML_NS}}}p").text = (
        f"本書は『{publication['title']}』日本語全訳のうち{volume['volume_label']}を収録する。"
        "公開時の合冊版を原刊の巻立てに沿って分冊したもので、本文・注・図表・索引と原刊頁標識は変更していない。"
    )
    if publication.get("boundary_note"):
        etree.SubElement(section, f"{{{XHTML_NS}}}p").text = publication["boundary_note"]
    etree.SubElement(section, f"{{{XHTML_NS}}}h2").text = "底本・権利"
    etree.SubElement(section, f"{{{XHTML_NS}}}p").text = publication["source_summary"]
    etree.SubElement(section, f"{{{XHTML_NS}}}p").text = publication["rights_summary"]
    write_xml(etree.ElementTree(html), path, "<!DOCTYPE html>")


def create_cover_xhtml(volume: dict[str, Any], path: Path,
                       cover_image_href: str, stylesheet_href: str | None) -> None:
    html = etree.Element(f"{{{XHTML_NS}}}html", nsmap={None: XHTML_NS, "epub": EPUB_NS})
    html.set("lang", "ja")
    html.set("{http://www.w3.org/XML/1998/namespace}lang", "ja")
    head = etree.SubElement(html, f"{{{XHTML_NS}}}head")
    etree.SubElement(head, f"{{{XHTML_NS}}}title").text = volume["title"]
    if stylesheet_href:
        relative_css = posixpath.relpath(stylesheet_href, posixpath.dirname("text/cover.xhtml"))
        etree.SubElement(
            head, f"{{{XHTML_NS}}}link", rel="stylesheet", type="text/css", href=relative_css
        )
    body = etree.SubElement(html, f"{{{XHTML_NS}}}body")
    body.set(f"{{{EPUB_NS}}}type", "cover")
    section = etree.SubElement(body, f"{{{XHTML_NS}}}section", id="cover-image")
    relative_image = posixpath.relpath(cover_image_href, posixpath.dirname("text/cover.xhtml"))
    etree.SubElement(
        section, f"{{{XHTML_NS}}}img", src=relative_image,
        alt=f"{volume['title']} 表紙",
    )
    write_xml(etree.ElementTree(html), path, "<!DOCTYPE html>")


def nav_link_path(nav_href: str, reference: str) -> str | None:
    return resolve_href(nav_href, reference)


def filtered_nav_item(source: etree._Element, nav_href: str,
                      selected: set[str], counter: list[int]) -> tuple[etree._Element | None, str | None]:
    direct_links = source.xpath("./*[local-name()='a'][1]")
    link = direct_links[0] if direct_links else None
    original_reference = link.get("href") if link is not None else ""
    original_path = nav_link_path(nav_href, original_reference) if original_reference else None
    original_selected = original_path in selected
    nested_lists = source.xpath("./*[local-name()='ol'][1]")
    kept_children: list[tuple[etree._Element, str]] = []
    if nested_lists:
        for child in nested_lists[0].xpath("./*[local-name()='li']"):
            kept, first_href = filtered_nav_item(child, nav_href, selected, counter)
            if kept is not None and first_href:
                kept_children.append((kept, first_href))
    if not original_selected and not kept_children:
        return None, None
    counter[0] += 1
    item = etree.Element(f"{{{XHTML_NS}}}li", id=f"split-toc-{counter[0]}")
    target = original_reference if original_selected else kept_children[0][1]
    label = " ".join("".join(link.itertext()).split()) if link is not None else "目次"
    etree.SubElement(item, f"{{{XHTML_NS}}}a", href=target).text = label
    if kept_children:
        nested = etree.SubElement(item, f"{{{XHTML_NS}}}ol")
        for child, _ in kept_children:
            nested.append(child)
    return item, target


def create_nav(publication: dict[str, Any], volume: dict[str, Any],
               epub_root: Path, opf_relative: str, nav_href: str,
               title_href: str, cover_href: str, selected_content: set[str]) -> list[etree._Element]:
    nav_path = (epub_root / opf_relative).parent / nav_href
    tree = xhtml_tree(nav_path)
    title_nodes = tree.xpath("//*[local-name()='title']")
    if title_nodes:
        title_nodes[0].text = volume["title"]
    toc_nodes = tree.xpath("//*[local-name()='nav'][@epub:type='toc']", namespaces=NS)
    if not toc_nodes:
        raise RuntimeError("EPUB navigation document has no toc")
    toc = toc_nodes[0]
    headings = toc.xpath("./*[self::x:h1 or self::x:h2 or self::x:h3][1]", namespaces=NS)
    if headings:
        headings[0].text = volume["title"]
    lists = toc.xpath("./*[local-name()='ol'][1]")
    if not lists:
        raise RuntimeError("EPUB navigation toc has no list")
    source_items = list(lists[0].xpath("./*[local-name()='li']"))
    counter = [0]
    filtered: list[etree._Element] = []
    for source_item in source_items:
        item, _ = filtered_nav_item(source_item, nav_href, selected_content, counter)
        if item is not None:
            filtered.append(item)
    toc_list = lists[0]
    for child in list(toc_list):
        toc_list.remove(child)
    title_item = etree.SubElement(toc_list, f"{{{XHTML_NS}}}li", id="split-title")
    etree.SubElement(title_item, f"{{{XHTML_NS}}}a", href=title_href).text = volume["title"]
    note_item = etree.SubElement(toc_list, f"{{{XHTML_NS}}}li", id="split-note")
    etree.SubElement(note_item, f"{{{XHTML_NS}}}a", href="text/volume_note.xhtml").text = "本分冊について"
    for item in filtered:
        toc_list.append(item)

    body = tree.xpath("//*[local-name()='body'][1]")[0]
    for other_nav in list(body.xpath("./*[local-name()='nav']")):
        if other_nav is toc:
            continue
        body.remove(other_nav)
    landmarks = etree.SubElement(body, f"{{{XHTML_NS}}}nav")
    landmarks.set(f"{{{EPUB_NS}}}type", "landmarks")
    landmarks.set("hidden", "hidden")
    etree.SubElement(landmarks, f"{{{XHTML_NS}}}h2").text = "ガイド"
    landmark_list = etree.SubElement(landmarks, f"{{{XHTML_NS}}}ol")
    cover_item = etree.SubElement(landmark_list, f"{{{XHTML_NS}}}li")
    cover_link = etree.SubElement(cover_item, f"{{{XHTML_NS}}}a", href=cover_href)
    cover_link.set(f"{{{EPUB_NS}}}type", "cover")
    cover_link.text = "表紙"
    title_landmark = etree.SubElement(landmark_list, f"{{{XHTML_NS}}}li")
    title_link = etree.SubElement(title_landmark, f"{{{XHTML_NS}}}a", href=title_href)
    title_link.set(f"{{{EPUB_NS}}}type", "titlepage")
    title_link.text = "標題紙"
    write_xml(tree, nav_path, "<!DOCTYPE html>")
    return list(toc_list.xpath("./*[local-name()='li']"))


def create_ncx(volume: dict[str, Any], toc_items: list[etree._Element],
               identifier: str) -> etree._ElementTree:
    root = etree.Element(f"{{{NCX_NS}}}ncx", nsmap={None: NCX_NS}, version="2005-1")
    head = etree.SubElement(root, f"{{{NCX_NS}}}head")
    etree.SubElement(head, f"{{{NCX_NS}}}meta", name="dtb:uid", content=identifier)
    etree.SubElement(head, f"{{{NCX_NS}}}meta", name="dtb:depth", content="6")
    doc_title = etree.SubElement(root, f"{{{NCX_NS}}}docTitle")
    etree.SubElement(doc_title, f"{{{NCX_NS}}}text").text = volume["title"]
    nav_map = etree.SubElement(root, f"{{{NCX_NS}}}navMap")
    play_order = 0

    def append_item(item: etree._Element, parent: etree._Element) -> None:
        nonlocal play_order
        links = item.xpath("./*[local-name()='a'][1]")
        if not links:
            return
        link = links[0]
        play_order += 1
        point = etree.SubElement(
            parent, f"{{{NCX_NS}}}navPoint", id=f"navPoint-{play_order}", playOrder=str(play_order)
        )
        label = etree.SubElement(point, f"{{{NCX_NS}}}navLabel")
        etree.SubElement(label, f"{{{NCX_NS}}}text").text = " ".join("".join(link.itertext()).split())
        etree.SubElement(point, f"{{{NCX_NS}}}content", src=link.get("href"))
        nested = item.xpath("./*[local-name()='ol'][1]/*[local-name()='li']")
        for child in nested:
            append_item(child, point)

    for item in toc_items:
        append_item(item, nav_map)
    return etree.ElementTree(root)


CSS_URL_RE = re.compile(r"url\(\s*(['\"]?)([^'\")]+)\1\s*\)", re.IGNORECASE)
CSS_IMPORT_RE = re.compile(r"@import\s+(?:url\()?\s*['\"]([^'\"]+)['\"]", re.IGNORECASE)


def document_references(path: Path, href: str) -> list[str]:
    references: list[str] = []
    suffix = path.suffix.lower()
    if suffix == ".css":
        value = path.read_text(encoding="utf-8", errors="replace")
        references.extend(match[1] for match in CSS_URL_RE.findall(value))
        references.extend(CSS_IMPORT_RE.findall(value))
    elif suffix in {".xhtml", ".html", ".htm", ".svg", ".xml", ".ncx"}:
        tree = etree.parse(str(path), XML_PARSER)
        for element in tree.getroot().iter():
            for name, value in element.attrib.items():
                local = etree.QName(name).localname
                if local in {"href", "src", "data", "poster"}:
                    references.append(value)
    return [target for reference in references if (target := resolve_href(href, reference))]


def dependency_closure(epub_root: Path, opf_relative: str,
                       initial: set[str], manifest_hrefs: set[str]) -> set[str]:
    opf_dir = (epub_root / opf_relative).parent
    keep = set(initial)
    queue: deque[str] = deque(sorted(initial))
    while queue:
        href = queue.popleft()
        path = opf_dir / href
        if not path.exists():
            raise RuntimeError(f"EPUB resource missing: {href}")
        for target in document_references(path, href):
            if target in manifest_hrefs and target not in keep:
                keep.add(target)
                queue.append(target)
    return keep


def update_opf(publication: dict[str, Any], volume: dict[str, Any],
               epub_root: Path, opf_path: Path, opf_relative: str,
               tree: etree._ElementTree, selected_spine: list[str],
               nav_href: str, cover_page_href: str, title_href: str,
               ncx_href: str, identifier: str) -> tuple[set[str], int]:
    metadata = tree.xpath("//*[local-name()='metadata']")[0]
    title_nodes = metadata.xpath("./dc:title", namespaces=NS)
    if title_nodes:
        title_nodes[0].text = volume["title"]
    else:
        etree.SubElement(metadata, f"{{{DC_NS}}}title").text = volume["title"]
    identifier_nodes = metadata.xpath("./dc:identifier", namespaces=NS)
    if not identifier_nodes:
        identifier_nodes = [etree.SubElement(metadata, f"{{{DC_NS}}}identifier")]
    identifier_nodes[0].text = identifier
    creator_nodes = metadata.xpath("./dc:creator", namespaces=NS)
    if creator_nodes:
        creator_nodes[0].text = publication["original_author"]
    publishers = metadata.xpath("./dc:publisher", namespaces=NS)
    if publishers:
        publishers[0].text = "校訂版"
    else:
        etree.SubElement(metadata, f"{{{DC_NS}}}publisher").text = "校訂版"
    modified_nodes = metadata.xpath("./opf:meta[@property='dcterms:modified']", namespaces=NS)
    if modified_nodes:
        modified_nodes[0].text = "2026-09-06T00:00:00Z"
    else:
        etree.SubElement(metadata, f"{{{OPF_NS}}}meta", property="dcterms:modified").text = "2026-09-06T00:00:00Z"

    manifest = tree.xpath("//*[local-name()='manifest']")[0]
    by_href = {item.get("href"): item for item in manifest}
    if "text/volume_note.xhtml" not in by_href:
        by_href["text/volume_note.xhtml"] = etree.SubElement(
            manifest, f"{{{OPF_NS}}}item", id="volume-note", href="text/volume_note.xhtml",
            **{"media-type": "application/xhtml+xml"},
        )
    if ncx_href not in by_href:
        by_href[ncx_href] = etree.SubElement(
            manifest, f"{{{OPF_NS}}}item", id="ncx", href=ncx_href,
            **{"media-type": "application/x-dtbncx+xml"},
        )
    initial = {
        cover_page_href, title_href, nav_href, "text/volume_note.xhtml", ncx_href, *selected_spine
    }
    keep = dependency_closure(
        epub_root, opf_relative, initial, set(by_href)
    )
    for item in list(manifest):
        if item.get("href") not in keep:
            manifest.remove(item)
    by_href = {item.get("href"): item for item in manifest}
    missing = keep - set(by_href)
    if missing:
        raise RuntimeError(f"EPUB manifest entries missing: {sorted(missing)}")

    spine = tree.xpath("//*[local-name()='spine']")[0]
    spine.set("toc", by_href[ncx_href].get("id"))
    for child in list(spine):
        spine.remove(child)
    spine_hrefs = [cover_page_href, title_href, nav_href, "text/volume_note.xhtml", *selected_spine]
    for href in spine_hrefs:
        attrs = {"idref": by_href[href].get("id")}
        if href == cover_page_href:
            attrs["linear"] = "no"
        etree.SubElement(spine, f"{{{OPF_NS}}}itemref", **attrs)

    for guide in tree.xpath("//*[local-name()='guide']"):
        guide.getparent().remove(guide)
    write_xml(tree, opf_path)
    return keep, len(spine_hrefs)


def internal_xhtml_links_are_valid(epub_root: Path, opf_relative: str,
                                   resources: set[str]) -> None:
    opf_dir = (epub_root / opf_relative).parent
    for href in resources:
        if not href.lower().endswith((".xhtml", ".html", ".htm")):
            continue
        tree = xhtml_tree(opf_dir / href)
        for anchor in tree.xpath("//*[local-name()='a'][@href]"):
            reference = anchor.get("href")
            target = resolve_href(href, reference)
            if target and target.lower().endswith((".xhtml", ".html", ".htm")) and target not in resources:
                raise RuntimeError(f"Dangling EPUB link in {href}: {reference}")


def write_epub(epub_root: Path, opf_relative: str, resources: set[str], output: Path) -> None:
    entries: dict[str, Path] = {}
    for path in sorted((epub_root / "META-INF").rglob("*")):
        if path.is_file():
            entries[path.relative_to(epub_root).as_posix()] = path
    entries[opf_relative] = epub_root / opf_relative
    opf_dir = (epub_root / opf_relative).parent
    for href in resources:
        entries[(PurePosixPath(opf_relative).parent / href).as_posix()] = opf_dir / href
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w") as archive:
        mimetype = zipfile.ZipInfo("mimetype", REVISION_TIMESTAMP)
        mimetype.compress_type = zipfile.ZIP_STORED
        mimetype.external_attr = 0o100644 << 16
        archive.writestr(mimetype, b"application/epub+zip")
        for name, path in sorted(entries.items()):
            info = zipfile.ZipInfo(name, REVISION_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes())


def create_epub(publication: dict[str, Any], volume: dict[str, Any],
                source_root: Path, cover: Image.Image) -> tuple[Path, dict[str, Any]]:
    build_root = BUILD_ROOT / publication["slug"] / volume["id"]
    if build_root.exists():
        shutil.rmtree(build_root)
    shutil.copytree(source_root, build_root, dirs_exist_ok=True)
    opf_path, opf_relative, opf_tree, by_href, spine = opf_data(build_root)
    opf_dir = opf_path.parent
    nav_href = property_href(by_href, "nav")
    ncx_href = media_type_href(by_href, "application/x-dtbncx+xml") or "toc.ncx"
    stylesheet = next(
        (href for href, item in by_href.items() if item.get("media-type") == "text/css"),
        None,
    )
    manifest = opf_tree.xpath("//*[local-name()='manifest']")[0]
    try:
        cover_image_href = property_href(by_href, "cover-image")
    except RuntimeError:
        cover_image_href = "media/cover.jpg"
        by_href[cover_image_href] = etree.SubElement(
            manifest, f"{{{OPF_NS}}}item", id="split-cover-image", href=cover_image_href,
            properties="cover-image", **{"media-type": "image/jpeg"},
        )
    cover_page_href = next(
        (href for href in spine if PurePosixPath(href).name in {"cover.xhtml", "cover.html"}),
        "text/cover.xhtml",
    )
    if cover_page_href not in by_href:
        by_href[cover_page_href] = etree.SubElement(
            manifest, f"{{{OPF_NS}}}item", id="split-cover-page", href=cover_page_href,
            **{"media-type": "application/xhtml+xml"},
        )
        create_cover_xhtml(
            volume, opf_dir / cover_page_href, cover_image_href, stylesheet
        )
    title_href = next(
        (href for href in spine if PurePosixPath(href).name in {"title_page.xhtml", "title.xhtml"}),
        "text/title_page.xhtml",
    )
    selected_spine = select_epub_content(volume, spine)
    selected_content = set(selected_spine)
    editable_selected = {cover_page_href, title_href, nav_href, "text/volume_note.xhtml", *selected_content}

    cover_path = opf_dir / cover_image_href
    cover_path.parent.mkdir(parents=True, exist_ok=True)
    if cover_path.suffix.lower() in {".png"}:
        cover.save(cover_path, "PNG", optimize=True)
    else:
        cover.save(cover_path, "JPEG", quality=94, optimize=True, subsampling=0)

    for href in (cover_page_href, title_href):
        tree = xhtml_tree(opf_dir / href)
        title_nodes = tree.xpath("//*[local-name()='title']")
        if title_nodes:
            title_nodes[0].text = volume["title"]
        if href == title_href:
            headings = tree.xpath("//*[local-name()='h1'][1]")
            if headings:
                headings[0].text = volume["title"]
            publishers = tree.xpath("//*[contains(concat(' ', normalize-space(@class), ' '), ' publisher ')]")
            if publishers:
                publishers[0].text = "校訂版"
        write_xml(tree, opf_dir / href, "<!DOCTYPE html>")

    create_volume_note(
        publication, volume, opf_dir / "text" / "volume_note.xhtml", stylesheet
    )
    text_hashes = sanitize_cross_volume_links(build_root, opf_relative, selected_content)
    toc_items = create_nav(
        publication, volume, build_root, opf_relative, nav_href,
        title_href, cover_page_href, selected_content,
    )
    identifier = "urn:uuid:" + str(uuid.uuid5(
        uuid.NAMESPACE_URL,
        f"https://takochanchan.github.io/publications/{publication['slug']}/#{volume['id']}",
    ))
    ncx_tree = create_ncx(volume, toc_items, identifier)
    write_xml(ncx_tree, opf_dir / ncx_href)
    resources, spine_count = update_opf(
        publication, volume, build_root, opf_path, opf_relative, opf_tree,
        selected_spine, nav_href, cover_page_href, title_href, ncx_href, identifier,
    )
    internal_xhtml_links_are_valid(build_root, opf_relative, resources)
    output = EPUB_OUTPUT / f"{volume['stem']}.epub"
    write_epub(build_root, opf_relative, resources, output)
    report = {
        "selected_source_spine_items": len(selected_spine),
        "output_spine_items": spine_count,
        "manifest_resources": len(resources),
        "source_text_sha256": sha256_bytes(
            "\n".join(f"{href}\t{text_hashes[href]}" for href in sorted(text_hashes)).encode("utf-8")
        ),
    }
    return output, report


def verify_pdf(publication: dict[str, Any], volume: dict[str, Any],
               output: Path, source: fitz.Document) -> None:
    with fitz.open(output) as result:
        source_pages = copied_pdf_pages(volume)
        if result.page_count != len(source_pages) + 2:
            raise RuntimeError(f"PDF page count mismatch: {output.name}")
        if result.metadata.get("title") != volume["title"]:
            raise RuntimeError(f"PDF metadata mismatch: {output.name}")
        sample_numbers: set[int] = set()
        for first, last in volume["pdf_ranges"]:
            sample_numbers.update({first, (first + last) // 2, last})
        for source_number in sorted(sample_numbers):
            output_index = source_pages.index(source_number) + 2
            source_page = source[source_number - 1]
            output_page = result[output_index]
            same_content = source_page.read_contents() == output_page.read_contents()
            same_box = source_page.rect == output_page.rect and source_page.rotation == output_page.rotation
            source_images = [item["digest"] for item in source_page.get_image_info(hashes=True)]
            output_images = [item["digest"] for item in output_page.get_image_info(hashes=True)]
            if not same_content or not same_box or source_images != output_images:
                raise RuntimeError(
                    f"Approved page stream changed: {output.name}, source page {source_number}"
                )
    mapped_pages: set[int] = set()
    page_to_output = {source_number: index + 3 for index, source_number in enumerate(source_pages)}
    for first, last, offset in volume["search_segments"]:
        for source_number in range(first, last + 1):
            if source_number in mapped_pages:
                raise RuntimeError(f"Duplicate search mapping: {publication['slug']} {source_number}")
            mapped_pages.add(source_number)
            if page_to_output.get(source_number) != source_number + offset:
                raise RuntimeError(
                    f"Search mapping offset mismatch: {publication['slug']} {source_number}"
                )


def verify_epub(volume: dict[str, Any], output: Path) -> None:
    with zipfile.ZipFile(output) as archive:
        names = archive.namelist()
        if names[0] != "mimetype" or archive.getinfo("mimetype").compress_type != zipfile.ZIP_STORED:
            raise RuntimeError(f"Invalid EPUB mimetype order: {output.name}")
        if archive.read("mimetype") != b"application/epub+zip":
            raise RuntimeError(f"Invalid EPUB mimetype value: {output.name}")
        container = etree.fromstring(archive.read("META-INF/container.xml"), XML_PARSER)
        opf_relative = container.xpath("string(//*[local-name()='rootfile']/@full-path)")
        opf = etree.fromstring(archive.read(opf_relative), XML_PARSER)
        prefix = str(PurePosixPath(opf_relative).parent)
        if prefix == ".":
            prefix = ""
        manifest = {
            item.get("href"): item.get("id")
            for item in opf.xpath("//*[local-name()='manifest']/*[local-name()='item']")
        }
        for href in manifest:
            archive_name = posixpath.join(prefix, href) if prefix else href
            if archive_name not in names:
                raise RuntimeError(f"Missing manifest resource in {output.name}: {href}")
            if href.endswith((".xhtml", ".xml", ".opf", ".ncx", ".svg")):
                etree.fromstring(archive.read(archive_name), XML_PARSER)
        idrefs = [
            item.get("idref")
            for item in opf.xpath("//*[local-name()='spine']/*[local-name()='itemref']")
        ]
        if any(idref not in set(manifest.values()) for idref in idrefs):
            raise RuntimeError(f"Unresolved EPUB spine idref: {output.name}")
        title = opf.xpath("string(//*[local-name()='metadata']/dc:title[1])", namespaces=NS)
        if title != volume["title"]:
            raise RuntimeError(f"EPUB metadata mismatch: {output.name}")


def validate_publication_input(publication: dict[str, Any]) -> tuple[Path, Path, fitz.Document]:
    directory = INPUT_ROOT / publication["slug"]
    pdf = directory / publication["input_pdf"]
    epub = directory / publication["input_epub"]
    if sha256_file(pdf) != publication["input_pdf_sha256"]:
        raise RuntimeError(f"Approved PDF checksum mismatch: {publication['slug']}")
    if sha256_file(epub) != publication["input_epub_sha256"]:
        raise RuntimeError(f"Approved EPUB checksum mismatch: {publication['slug']}")
    reader = fitz.open(pdf)
    if reader.page_count != publication["combined_page_count"]:
        raise RuntimeError(f"Approved PDF page count mismatch: {publication['slug']}")
    search_pages: Counter[int] = Counter()
    for volume in publication["volumes"]:
        for first, last, _ in volume["search_segments"]:
            search_pages.update(range(first, last + 1))
    duplicates = [page for page, count in search_pages.items() if count != 1]
    if duplicates:
        raise RuntimeError(f"Duplicate search source pages: {publication['slug']} {duplicates[:10]}")
    return pdf, epub, reader


def main() -> None:
    for required in (CONFIG_PATH, FONT_REGULAR, FONT_BOLD, FONT_LATIN, FONT_LATIN_ITALIC):
        if not required.exists():
            raise FileNotFoundError(required)
    config = load_config()
    PDF_OUTPUT.mkdir(parents=True, exist_ok=True)
    EPUB_OUTPUT.mkdir(parents=True, exist_ok=True)
    BUILD_ROOT.mkdir(parents=True, exist_ok=True)
    expected_names = {
        *(f"{volume['stem']}.pdf" for publication in config["publications"] for volume in publication["volumes"]),
        *(f"{volume['stem']}.epub" for publication in config["publications"] for volume in publication["volumes"]),
    }
    for directory in (PDF_OUTPUT, EPUB_OUTPUT):
        for path in directory.iterdir():
            if path.is_file() and path.name not in expected_names:
                path.unlink()

    report: dict[str, Any] = {
        "schema_version": 1,
        "revision_date": config["revision_date"],
        "publications": [],
    }
    checksums: list[tuple[str, str]] = []
    for publication in config["publications"]:
        pdf_input, epub_input, source_pdf = validate_publication_input(publication)
        epub_source = prepare_epub_source(publication, epub_input)
        publication_report = {
            "slug": publication["slug"],
            "input_pdf": {"name": pdf_input.name, "sha256": sha256_file(pdf_input)},
            "input_epub": {"name": epub_input.name, "sha256": sha256_file(epub_input)},
            "volumes": [],
        }
        for volume in publication["volumes"]:
            cover = create_cover(publication, volume)
            note = create_note_page(publication, volume)
            pdf_output = create_pdf(publication, volume, source_pdf, cover, note)
            epub_output, epub_report = create_epub(publication, volume, epub_source, cover)
            verify_pdf(publication, volume, pdf_output, source_pdf)
            verify_epub(volume, epub_output)
            pdf_record = {
                "name": pdf_output.name,
                "size": pdf_output.stat().st_size,
                "sha256": sha256_file(pdf_output),
                "pages": len(copied_pdf_pages(volume)) + 2,
            }
            epub_record = {
                "name": epub_output.name,
                "size": epub_output.stat().st_size,
                "sha256": sha256_file(epub_output),
                **epub_report,
            }
            publication_report["volumes"].append({
                "id": volume["id"],
                "volume_label": volume["volume_label"],
                "pdf_ranges": volume["pdf_ranges"],
                "search_segments": volume["search_segments"],
                "pdf": pdf_record,
                "epub": epub_record,
            })
            checksums.append((pdf_record["sha256"], f"pdf/{pdf_output.name}"))
            checksums.append((epub_record["sha256"], f"epub/{epub_output.name}"))
            print(
                f"{publication['slug']} {volume['volume_label']}: "
                f"PDF {pdf_record['pages']} pages, {pdf_record['size']} bytes; "
                f"EPUB {epub_record['size']} bytes"
            , flush=True)
        source_pdf.close()
        report["publications"].append(publication_report)

    report["outputs"] = len(checksums)
    report["all_pdf_ranges_and_midpoint_streams_verified"] = True
    report["all_selected_epub_text_verified"] = True
    report_path = WORK / "volume-split-generation-report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    sums_path = WORK / "public-volume-SHA256SUMS.txt"
    sums_path.write_text("".join(f"{digest}  {relative}\n" for digest, relative in checksums), encoding="utf-8")
    print(report_path)
    print(sums_path)


if __name__ == "__main__":
    main()
