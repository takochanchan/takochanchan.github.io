#!/usr/bin/env python3
"""Create volume-specific PDF and EPUB editions from the approved combined files."""

from __future__ import annotations

import hashlib
import io
import os
import re
import shutil
import uuid
import zipfile
from dataclasses import dataclass
from pathlib import Path

from lxml import etree
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader, PdfWriter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / "tmp" / "bancroft"
PDF_SOURCE = WORK / "combined.pdf"
EPUB_SOURCE = WORK / "epub-src"
PDF_OUTPUT = ROOT / "output" / "pdf"
EPUB_OUTPUT = ROOT / "output" / "epub"
FONT_REGULAR = WORK / "fonts-full" / "NotoSansJP-Regular.otf"
FONT_BOLD = WORK / "fonts-full" / "NotoSansJP-Bold.otf"
FONT_LATIN_ITALIC = Path(os.environ.get(
    "BANCROFT_LATIN_ITALIC_FONT",
    "/opt/codex/runtimes/codex-primary-runtime/dependencies/native/"
    "libreoffice-headless/libreoffice/share/fonts/truetype/DejaVuSerif-Italic.ttf",
))
FONT_LATIN = Path(os.environ.get(
    "BANCROFT_LATIN_FONT",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
))

OPF_NS = "http://www.idpf.org/2007/opf"
DC_NS = "http://purl.org/dc/elements/1.1/"
XHTML_NS = "http://www.w3.org/1999/xhtml"
EPUB_NS = "http://www.idpf.org/2007/ops"
NCX_NS = "http://www.daisy.org/z3986/2005/ncx/"
XLINK_NS = "http://www.w3.org/1999/xlink"
NS = {"opf": OPF_NS, "dc": DC_NS, "x": XHTML_NS, "epub": EPUB_NS}


@dataclass(frozen=True)
class Volume:
    number: int
    roman: str
    japanese: str
    years: str
    publication_year: int
    first_pdf_page: int
    last_pdf_page: int
    first_chapter_file: int
    last_chapter_file: int
    chapter_count: int
    special_contents: str
    first_original_page: int
    last_original_page: int

    @property
    def title(self) -> str:
        return f"中央アメリカ史　第{self.japanese}巻　{self.years}年"

    @property
    def english_title(self) -> str:
        return f"History of Central America · Volume {self.roman}"

    @property
    def stem(self) -> str:
        return (
            "Hubert_Howe_Bancroft_History_of_Central_America_"
            f"Volume_{self.roman}_{self.publication_year}_Japanese_Complete_Translation"
        )

    @property
    def output_page_count(self) -> int:
        # Two newly generated front-matter pages precede the unchanged volume pages.
        return 2 + self.last_pdf_page - self.first_pdf_page + 1


VOLUMES = (
    Volume(1, "I", "一", "1501–1530", 1886, 3, 924, 3, 34, 27,
           "全27章・引用典拠一覧", 1, 704),
    Volume(2, "II", "二", "1530–1800", 1886, 925, 1688, 35, 74, 37,
           "全37章", 1, 772),
    Volume(3, "III", "三", "1801–1887", 1887, 1689, 2585, 75, 112, 34,
           "全34章・索引", 1, 796),
)


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


def draw_centered(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str,
                  typeface: ImageFont.FreeTypeFont, fill: str) -> None:
    box = draw.textbbox((0, 0), text, font=typeface)
    width = box[2] - box[0]
    draw.text((xy[0] - width / 2, xy[1]), text, font=typeface, fill=fill)


def wrap_text(draw: ImageDraw.ImageDraw, text: str,
              typeface: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    tokens = re.findall(
        r"[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9._:/–—-]*|[ \t]+|.", text
    )
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


def draw_wrapped(draw: ImageDraw.ImageDraw, text: str, x: int, y: int,
                 typeface: ImageFont.FreeTypeFont, fill: str,
                 max_width: int, line_height: int) -> int:
    for line in wrap_text(draw, text, typeface, max_width):
        draw.text((x, y), line, font=typeface, fill=fill)
        y += line_height
    return y


def create_cover(volume: Volume) -> Image.Image:
    image = Image.new("RGB", (1530, 1980), "white")
    draw = ImageDraw.Draw(image)
    navy, grey, brick, blue = "#1f2a32", "#71808a", "#963b2b", "#234f6c"

    draw.text((182, 102),
              f"ヒューバート・ハウ・バンクロフト ｜ 中央アメリカ史　第{volume.japanese}巻",
              font=font(FONT_REGULAR, 27), fill=grey)
    draw_centered(draw, (765, 472), "HISTORY OF CENTRAL AMERICA · 1886–1887",
                  font(FONT_BOLD, 25), brick)
    draw_centered(draw, (765, 608), "中央アメリカ史", font(FONT_BOLD, 72), navy)
    draw_centered(draw, (765, 737), f"第{volume.japanese}巻　{volume.years}年",
                  font(FONT_REGULAR, 39), grey)
    draw_centered(draw, (765, 826), volume.english_title,
                  font(FONT_LATIN_ITALIC, 27), grey)
    draw.line((380, 930, 1150, 930), fill=brick, width=3)
    draw_centered(draw, (765, 1039), "ヒューバート・ハウ・バンクロフト",
                  font(FONT_BOLD, 39), navy)
    draw_centered(draw, (765, 1134), "Hubert Howe Bancroft",
                  font(FONT_LATIN, 25), grey)
    draw_centered(draw, (765, 1285),
                  f"第{volume.japanese}巻 ｜ 原刊本文 {volume.first_original_page}–{volume.last_original_page}頁 ｜ {volume.special_contents}",
                  font(FONT_BOLD, 28), blue)
    draw_centered(draw, (765, 1510), "校訂版 · 2026", font(FONT_REGULAR, 25), grey)
    draw_centered(draw, (765, 1840), "1", font(FONT_LATIN, 23), "#3e454a")
    return image


def create_note_page(volume: Volume) -> Image.Image:
    image = Image.new("RGB", (1530, 1980), "white")
    draw = ImageDraw.Draw(image)
    navy, grey, blue = "#263238", "#71808a", "#26709a"
    regular = font(FONT_REGULAR, 28)
    heading = font(FONT_BOLD, 41)
    subheading = font(FONT_BOLD, 38)

    draw.text((182, 102),
              f"ヒューバート・ハウ・バンクロフト ｜ 中央アメリカ史　第{volume.japanese}巻",
              font=font(FONT_REGULAR, 27), fill=grey)
    draw.text((182, 222), "本訳について", font=heading, fill=blue)
    paragraph = (
        "本書は、Hubert Howe Bancroft, History of Central America, vols. I–III "
        "（San Francisco: The History Company, 1886–1887）の日本語全訳のうち、"
        f"第{volume.japanese}巻（{volume.years}年）を収録する。原刊の前付と全{volume.chapter_count}章、"
        f"原注・図表{('・引用典拠一覧' if volume.number == 1 else '')}"
        f"{('・索引' if volume.number == 3 else '')}を収録し、原刊頁標識は第{volume.japanese}巻の印刷頁を示す。"
        "明白なOCR誤認は主底本画像により修正した。"
    )
    y = draw_wrapped(draw, paragraph, 182, 345, regular, navy, 1165, 52)
    y += 52
    draw.text((182, y), "底本・公開機関・権利／ライセンス", font=subheading, fill=blue)
    y += 92
    notes = [
        "原刊：Hubert Howe Bancroft, The Works of Hubert Howe Bancroft, vols. VI–VIII, History of Central America, The History Company, 1886–1887。原著本文はパブリックドメイン。",
        "主底本画像：Biblioteca Ludwig von Mises, Universidad Francisco Marroquín所蔵のLuis Luján Muñoz寄贈本。同大学のデジタル化支援によりInternet Archiveが公開。",
        "Internet Archive項目：第一巻 histofcenthoweguat、第二巻 histoofcen07howeguatguat、第三巻 historyofcenthoweguat。三項目ともNOT_IN_COPYRIGHT。",
        "校合用電子本文：Project Gutenberg eBooks 58658・58669・62657。刊記・原刊頁・図版・疑義箇所は主底本画像を優先。",
        "日本語翻訳版：独自の再利用ライセンスを設定していない。底本画像・校合用電子本文には、各公開元の表示と利用条件が適用される。",
    ]
    for note in notes:
        y = draw_wrapped(draw, note, 182, y, regular, navy, 1165, 51)
        y += 25
    draw_centered(draw, (765, 1840), "2", font(FONT_LATIN, 23), "#3e454a")
    if y > 1775:
        raise RuntimeError(f"Note page overflow for volume {volume.roman}: {y}")
    return image


def image_pdf_bytes(images: list[Image.Image]) -> bytes:
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=(612, 792), pageCompression=1, invariant=1)
    for image in images:
        jpg = io.BytesIO()
        image.save(jpg, format="JPEG", quality=94, optimize=True, subsampling=0)
        jpg.seek(0)
        pdf.drawImage(ImageReader(jpg), 0, 0, 612, 792)
        pdf.showPage()
    pdf.save()
    return buffer.getvalue()


def create_pdf(volume: Volume, source: PdfReader) -> Path:
    front = PdfReader(io.BytesIO(image_pdf_bytes([
        create_cover(volume), create_note_page(volume)
    ])))
    writer = PdfWriter()
    writer.append_pages_from_reader(front)
    for page_number in range(volume.first_pdf_page, volume.last_pdf_page + 1):
        writer.add_page(source.pages[page_number - 1])
    writer.add_outline_item(f"第{volume.japanese}巻　{volume.years}年", 2)
    writer.add_metadata({
        "/Title": volume.title,
        "/Author": "Hubert Howe Bancroft",
        "/Subject": f"Japanese complete translation, Volume {volume.roman}",
        "/Keywords": "Central America; history; Japanese translation",
        "/Creator": "Volume split from the approved complete edition",
        "/Producer": "pypdf",
    })
    output = PDF_OUTPUT / f"{volume.stem}.pdf"
    with output.open("wb") as handle:
        writer.write(handle)
    return output


def chapter_path(number: int) -> str:
    return f"text/ch{number:03d}.xhtml"


def xhtml_tree(path: Path) -> etree._ElementTree:
    return etree.parse(str(path), etree.XMLParser(resolve_entities=False))


def write_xml(tree: etree._ElementTree, path: Path, doctype: str | None = None) -> None:
    path.write_bytes(etree.tostring(
        tree,
        encoding="UTF-8",
        xml_declaration=True,
        doctype=doctype,
        pretty_print=True,
    ))


def selected_nav_items(volume: Volume, nav_tree: etree._ElementTree) -> list[etree._Element]:
    wanted = {
        "text/ch001.xhtml",
        "text/ch002.xhtml",
        chapter_path(volume.first_chapter_file),
        chapter_path(volume.first_chapter_file + 1),
    }
    top_items = nav_tree.xpath(
        "//x:nav[@epub:type='toc']/x:ol/x:li", namespaces=NS
    )
    chosen: list[etree._Element] = []
    for item in top_items:
        href = item.xpath("string(./x:a/@href)", namespaces=NS)
        if href in wanted:
            chosen.append(item)
    if len(chosen) != 4:
        raise RuntimeError(f"Expected four top-level nav items, found {len(chosen)}")
    return chosen


def make_ncx(volume: Volume, nav_items: list[etree._Element], identifier: str) -> etree._ElementTree:
    root = etree.Element(f"{{{NCX_NS}}}ncx", nsmap={None: NCX_NS}, version="2005-1")
    head = etree.SubElement(root, f"{{{NCX_NS}}}head")
    etree.SubElement(head, f"{{{NCX_NS}}}meta", name="dtb:uid", content=identifier)
    etree.SubElement(head, f"{{{NCX_NS}}}meta", name="dtb:depth", content="2")
    doc_title = etree.SubElement(root, f"{{{NCX_NS}}}docTitle")
    etree.SubElement(doc_title, f"{{{NCX_NS}}}text").text = volume.title
    nav_map = etree.SubElement(root, f"{{{NCX_NS}}}navMap")
    play_order = 0

    def append_point(item: etree._Element, parent: etree._Element) -> None:
        nonlocal play_order
        play_order += 1
        link = item.find(f"{{{XHTML_NS}}}a")
        point = etree.SubElement(parent, f"{{{NCX_NS}}}navPoint",
                                 id=f"navPoint-{play_order}", playOrder=str(play_order))
        label = etree.SubElement(point, f"{{{NCX_NS}}}navLabel")
        etree.SubElement(label, f"{{{NCX_NS}}}text").text = "".join(link.itertext()).strip()
        etree.SubElement(point, f"{{{NCX_NS}}}content", src=link.get("href"))
        nested = item.find(f"{{{XHTML_NS}}}ol")
        if nested is not None:
            for child in nested.findall(f"{{{XHTML_NS}}}li"):
                append_point(child, point)

    for nav_item in nav_items:
        append_point(nav_item, nav_map)
    return etree.ElementTree(root)


def create_epub(volume: Volume, cover: Image.Image) -> Path:
    build_root = WORK / "epub-build" / f"volume-{volume.roman.lower()}"
    if build_root.exists():
        shutil.rmtree(build_root)
    shutil.copytree(EPUB_SOURCE, build_root)
    epub_root = build_root / "EPUB"
    selected_chapters = [chapter_path(i) for i in range(
        volume.first_chapter_file, volume.last_chapter_file + 1
    )]
    selected_text = ["text/cover.xhtml", "text/title_page.xhtml", "nav.xhtml",
                     "text/ch001.xhtml", "text/ch002.xhtml", *selected_chapters]

    cover.save(epub_root / "media" / "cover.jpg", "JPEG", quality=94,
               optimize=True, subsampling=0)

    # Volume-specific front matter.
    title_tree = xhtml_tree(epub_root / "text" / "title_page.xhtml")
    title_tree.xpath("//x:title", namespaces=NS)[0].text = volume.title
    title_tree.xpath("//x:h1", namespaces=NS)[0].text = volume.title
    title_tree.xpath("//x:p[@class='publisher']", namespaces=NS)[0].text = "校訂版"
    write_xml(title_tree, epub_root / "text" / "title_page.xhtml", "<!DOCTYPE html>")

    cover_tree = xhtml_tree(epub_root / "text" / "cover.xhtml")
    cover_tree.xpath("//x:title", namespaces=NS)[0].text = volume.title
    write_xml(cover_tree, epub_root / "text" / "cover.xhtml", "<!DOCTYPE html>")

    intro_tree = xhtml_tree(epub_root / "text" / "ch001.xhtml")
    intro_section = intro_tree.xpath("//x:section", namespaces=NS)[0]
    for child in list(intro_section):
        intro_section.remove(child)
    etree.SubElement(intro_section, f"{{{XHTML_NS}}}h1").text = "本訳について"
    intro = etree.SubElement(intro_section, f"{{{XHTML_NS}}}p")
    intro.text = (
        "本書は、Hubert Howe Bancroft, History of Central America, vols. I–III "
        "（San Francisco: The History Company, 1886–1887）の日本語全訳のうち、"
        f"第{volume.japanese}巻（{volume.years}年）を収録する。原刊の前付と全{volume.chapter_count}章、"
        f"原注・図表{('・引用典拠一覧' if volume.number == 1 else '')}"
        f"{('・索引' if volume.number == 3 else '')}を収録し、原刊頁標識は第{volume.japanese}巻の印刷頁を示す。"
        "明白なOCR誤認は主底本画像により修正した。"
    )
    write_xml(intro_tree, epub_root / "text" / "ch001.xhtml", "<!DOCTYPE html>")

    nav_tree = xhtml_tree(epub_root / "nav.xhtml")
    nav_tree.xpath("//x:title", namespaces=NS)[0].text = volume.title
    toc = nav_tree.xpath("//x:nav[@epub:type='toc']", namespaces=NS)[0]
    toc_heading = toc.find(f"{{{XHTML_NS}}}h1")
    toc_heading.text = volume.title
    toc_list = toc.find(f"{{{XHTML_NS}}}ol")
    chosen_items = selected_nav_items(volume, nav_tree)
    for child in list(toc_list):
        toc_list.remove(child)
    for item in chosen_items:
        toc_list.append(item)
    write_xml(nav_tree, epub_root / "nav.xhtml", "<!DOCTYPE html>")

    identifier = str(uuid.uuid5(
        uuid.NAMESPACE_URL,
        f"https://takochanchan.github.io/publications/bancroft-history-central-america-1886-1887/#volume-{volume.roman.lower()}",
    ))
    ncx_tree = make_ncx(volume, chosen_items, f"urn:uuid:{identifier}")
    write_xml(ncx_tree, epub_root / "toc.ncx")

    # Keep only images actually referenced by this volume's XHTML plus its cover.
    referenced_media = {"media/cover.jpg"}
    media_pattern = re.compile(r"(?:\.\./)?media/([^\"'()<>\s]+)")
    for rel in selected_text:
        path = epub_root / rel
        for name in media_pattern.findall(path.read_text(encoding="utf-8")):
            referenced_media.add(f"media/{name}")

    opf_tree = etree.parse(str(epub_root / "content.opf"))
    title = opf_tree.xpath("//dc:title", namespaces=NS)[0]
    title.text = volume.title
    identifier_node = opf_tree.xpath("//dc:identifier", namespaces=NS)[0]
    identifier_node.text = f"urn:uuid:{identifier}"
    publisher = opf_tree.xpath("//dc:publisher", namespaces=NS)[0]
    publisher.text = "校訂版"
    modified = opf_tree.xpath("//opf:meta[@property='dcterms:modified']", namespaces=NS)[0]
    modified.text = "2026-09-06T00:00:00Z"

    manifest = opf_tree.xpath("//opf:manifest", namespaces=NS)[0]
    keep_hrefs = {"toc.ncx", "styles/stylesheet1.css", *selected_text, *referenced_media}
    href_to_id: dict[str, str] = {}
    for item in list(manifest):
        href = item.get("href")
        if href not in keep_hrefs:
            manifest.remove(item)
        else:
            href_to_id[href] = item.get("id")
    missing = keep_hrefs - set(href_to_id)
    if missing:
        raise RuntimeError(f"Manifest entries missing: {sorted(missing)}")

    spine = opf_tree.xpath("//opf:spine", namespaces=NS)[0]
    spine.set("toc", href_to_id["toc.ncx"])
    for child in list(spine):
        spine.remove(child)
    for href in selected_text:
        attrs = {"idref": href_to_id[href]}
        if href == "text/title_page.xhtml":
            attrs["linear"] = "yes"
        etree.SubElement(spine, f"{{{OPF_NS}}}itemref", **attrs)
    write_xml(opf_tree, epub_root / "content.opf")

    selected_text_names = {Path(path).name for path in selected_text if path.startswith("text/")}
    for path in (epub_root / "text").glob("*.xhtml"):
        if path.name not in selected_text_names:
            path.unlink()
    selected_media_names = {Path(path).name for path in referenced_media}
    for path in (epub_root / "media").iterdir():
        if path.name not in selected_media_names:
            path.unlink()

    output = EPUB_OUTPUT / f"{volume.stem}.epub"
    timestamp = (2026, 9, 6, 0, 0, 0)
    with zipfile.ZipFile(output, "w") as archive:
        mimetype = zipfile.ZipInfo("mimetype", timestamp)
        mimetype.compress_type = zipfile.ZIP_STORED
        mimetype.external_attr = 0o100644 << 16
        archive.writestr(mimetype, b"application/epub+zip")
        for path in sorted(build_root.rglob("*")):
            if not path.is_file() or path.name == "mimetype":
                continue
            rel = path.relative_to(build_root).as_posix()
            info = zipfile.ZipInfo(rel, timestamp)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes())
    return output


def verify_pdf(volume: Volume, path: Path, source: PdfReader) -> None:
    result = PdfReader(path)
    if len(result.pages) != volume.output_page_count:
        raise RuntimeError(f"{path.name}: page count mismatch")
    if result.metadata.title != volume.title:
        raise RuntimeError(f"{path.name}: title metadata mismatch")
    source_indexes = [
        volume.first_pdf_page - 1,
        (volume.first_pdf_page + volume.last_pdf_page) // 2 - 1,
        volume.last_pdf_page - 1,
    ]
    for source_index in source_indexes:
        output_index = 2 + source_index - (volume.first_pdf_page - 1)
        expected = source.pages[source_index].get_contents().get_data()
        actual = result.pages[output_index].get_contents().get_data()
        if expected != actual:
            raise RuntimeError(
                f"{path.name}: approved page stream changed at source page {source_index + 1}"
            )


def verify_epub(volume: Volume, path: Path) -> None:
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        if names[0] != "mimetype" or archive.getinfo("mimetype").compress_type != zipfile.ZIP_STORED:
            raise RuntimeError(f"{path.name}: invalid mimetype entry")
        if archive.read("mimetype") != b"application/epub+zip":
            raise RuntimeError(f"{path.name}: invalid mimetype value")
        for name in names:
            if name.endswith((".xhtml", ".xml", ".opf", ".ncx")):
                etree.fromstring(archive.read(name), etree.XMLParser(resolve_entities=False))
        opf = etree.fromstring(archive.read("EPUB/content.opf"))
        manifest = {
            item.get("href"): item.get("id")
            for item in opf.xpath("//opf:manifest/opf:item", namespaces=NS)
        }
        for href in manifest:
            if f"EPUB/{href}" not in names:
                raise RuntimeError(f"{path.name}: missing manifest resource {href}")
        idrefs = [item.get("idref") for item in opf.xpath("//opf:spine/opf:itemref", namespaces=NS)]
        if any(idref not in set(manifest.values()) for idref in idrefs):
            raise RuntimeError(f"{path.name}: unresolved spine idref")
        title = opf.xpath("string(//dc:title)", namespaces=NS)
        if title != volume.title:
            raise RuntimeError(f"{path.name}: title metadata mismatch")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    for required in (PDF_SOURCE, EPUB_SOURCE / "EPUB" / "content.opf",
                     FONT_REGULAR, FONT_BOLD, FONT_LATIN, FONT_LATIN_ITALIC):
        if not required.exists():
            raise FileNotFoundError(required)
    PDF_OUTPUT.mkdir(parents=True, exist_ok=True)
    EPUB_OUTPUT.mkdir(parents=True, exist_ok=True)
    source_pdf = PdfReader(PDF_SOURCE)
    for volume in VOLUMES:
        cover = create_cover(volume)
        cover_path = WORK / f"cover-volume-{volume.roman.lower()}.jpg"
        cover.save(cover_path, "JPEG", quality=94, optimize=True, subsampling=0)
        pdf_path = create_pdf(volume, source_pdf)
        epub_path = create_epub(volume, cover)
        verify_pdf(volume, pdf_path, source_pdf)
        verify_epub(volume, epub_path)
        print(
            f"{volume.roman}: PDF {pdf_path.stat().st_size} {sha256(pdf_path)} "
            f"({volume.output_page_count} pages)"
        )
        print(f"{volume.roman}: EPUB {epub_path.stat().st_size} {sha256(epub_path)}")


if __name__ == "__main__":
    main()
