import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path


MODULE_PATH = Path(__file__).parents[1] / "scripts/search/extract-corpus.py"
SPEC = importlib.util.spec_from_file_location("extract_corpus", MODULE_PATH)
extract_corpus = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(extract_corpus)


class SearchExtractorTest(unittest.TestCase):
    def test_placeholder_marker_is_not_a_real_original_page(self):
        self.assertTrue(
            extract_corpus.is_placeholder_original_marker("〔原刊 p. X〕")
        )
        self.assertFalse(
            extract_corpus.is_placeholder_original_marker("〔原刊 p. 12〕")
        )
        self.assertTrue(
            extract_corpus.is_placeholder_original_marker("〔原資料：○○〕")
        )
        self.assertTrue(
            extract_corpus.is_original_page_marker("〔原誌892頁〕")
        )
        self.assertFalse(
            extract_corpus.is_original_page_marker("〔原刊はこの語を誤記〕")
        )

    def test_markdown_skips_policy_text_and_keeps_unnumbered_front_matter(self):
        source = """# 資料名

本文中の〔原刊 p. X〕は原刊頁を示す。

## **原刊標題紙**

境界調査報告

〔原刊 p. 3〕

ここから本文。
"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "master.md"
            path.write_text(source, encoding="utf-8")
            annotated = extract_corpus.paragraphs_with_original_pages(
                extract_corpus.markdown_paragraphs(path)
            )

        self.assertEqual(
            annotated,
            [
                ("原刊 無頁数（前付）", "原刊標題紙"),
                ("原刊 無頁数（前付）", "境界調査報告"),
                ("原刊 p. 3", "ここから本文。"),
            ],
        )

    def test_placeholder_inside_text_is_removed_without_changing_page(self):
        annotated = extract_corpus.paragraphs_with_original_pages(
            ["案内〔原刊 p. X〕だけ", "〔原刊 p. 7〕本文"]
        )
        self.assertEqual(
            annotated,
            [
                ("原刊 無頁数（前付）", "案内だけ"),
                ("原刊 p. 7", "本文"),
            ],
        )

    def test_source_record_marker_is_preserved_as_the_page_label(self):
        annotated = extract_corpus.paragraphs_with_original_pages(
            ["案内〔原資料：X〕", "〔原資料：CR-AN-001〕本文"]
        )
        self.assertEqual(
            annotated,
            [
                ("原刊 無頁数（前付）", "案内"),
                ("原資料：CR-AN-001", "本文"),
            ],
        )

    def test_standalone_source_image_page_becomes_the_current_label(self):
        annotated = extract_corpus.paragraphs_with_original_pages(
            ["原資料画像頁 2–3", "地形図の本文"]
        )
        self.assertEqual(
            annotated,
            [
                ("原資料画像頁 2–3", "原資料画像頁 2–3"),
                ("原資料画像頁 2–3", "地形図の本文"),
            ],
        )

    def test_epub_mirror_reads_spine_text_and_original_page_markers(self):
        container = """<?xml version="1.0"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles>
</container>"""
        opf = """<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <manifest><item id="c1" href="chapter.xhtml" media-type="application/xhtml+xml"/></manifest>
  <spine><itemref idref="c1"/></spine>
</package>"""
        chapter = """<?xml version="1.0"?>
<html xmlns="http://www.w3.org/1999/xhtml"><body>
  <h1>日本語全訳</h1>
  <p>〔原刊 fol. 12r〕最初の本文。</p>
  <p>続きの本文。</p>
</body></html>"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.epub"
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("META-INF/container.xml", container)
                archive.writestr("OEBPS/content.opf", opf)
                archive.writestr("OEBPS/chapter.xhtml", chapter)
            paragraphs = extract_corpus.epub_paragraphs(path)
            annotated = extract_corpus.paragraphs_with_original_pages(paragraphs)

        self.assertEqual(
            annotated,
            [
                ("原刊 fol. 12r", "最初の本文。"),
                ("原刊 fol. 12r", "続きの本文。"),
            ],
        )

    def test_epub_footnote_uses_the_source_page_of_its_backlink(self):
        container = """<?xml version="1.0"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles>
</container>"""
        opf = """<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <manifest><item id="c1" href="chapter.xhtml" media-type="application/xhtml+xml"/></manifest>
  <spine><itemref idref="c1"/></spine>
</package>"""
        chapter = """<?xml version="1.0"?>
<html xmlns="http://www.w3.org/1999/xhtml"><body>
  <p>〔原刊 p. 219〕引用本文<a href="#fn3" class="footnote-ref" id="fnref3">3</a></p>
  <p>〔原刊 p. 220〕次頁の本文。</p>
  <p><a href="#fnref3" class="footnote-back" role="doc-backlink">3</a>. 注の全文。</p>
</body></html>"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.epub"
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("META-INF/container.xml", container)
                archive.writestr("OEBPS/content.opf", opf)
                archive.writestr("OEBPS/chapter.xhtml", chapter)
            annotated = extract_corpus.paragraphs_with_original_pages(
                extract_corpus.epub_paragraphs(path)
            )

        self.assertEqual(annotated[-1], ("原刊 p. 219", "注の全文。"))

    def test_epub_mirror_skips_navigation_document(self):
        container = """<?xml version="1.0"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles>
</container>"""
        opf = """<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="c1" href="chapter.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine><itemref idref="nav"/><itemref idref="c1"/></spine>
</package>"""
        navigation = """<?xml version="1.0"?>
<html xmlns="http://www.w3.org/1999/xhtml"><body><p>重複する目次</p></body></html>"""
        chapter = """<?xml version="1.0"?>
<html xmlns="http://www.w3.org/1999/xhtml"><body><p>本文だけ</p></body></html>"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.epub"
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("META-INF/container.xml", container)
                archive.writestr("OEBPS/content.opf", opf)
                archive.writestr("OEBPS/nav.xhtml", navigation)
                archive.writestr("OEBPS/chapter.xhtml", chapter)
            paragraphs = extract_corpus.epub_paragraphs(path)

        self.assertEqual(paragraphs, ["本文だけ"])

    def test_epub_mirror_skips_dedicated_rights_chapter(self):
        container = """<?xml version="1.0"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles>
</container>"""
        opf = """<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <manifest>
    <item id="rights" href="rights.xhtml" media-type="application/xhtml+xml"/>
    <item id="body" href="body.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine><itemref idref="rights"/><itemref idref="body"/></spine>
</package>"""
        rights = """<?xml version="1.0"?>
<html xmlns="http://www.w3.org/1999/xhtml"><body>
  <section><h2>著作権・利用条件</h2><p>検索本文ではない利用条件。</p></section>
</body></html>"""
        body = """<?xml version="1.0"?>
<html xmlns="http://www.w3.org/1999/xhtml"><body><p>翻訳本文。</p></body></html>"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.epub"
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("META-INF/container.xml", container)
                archive.writestr("OEBPS/content.opf", opf)
                archive.writestr("OEBPS/rights.xhtml", rights)
                archive.writestr("OEBPS/body.xhtml", body)
            paragraphs = extract_corpus.epub_paragraphs(path)

        self.assertEqual(paragraphs, ["翻訳本文。"])

    def test_epub_metadata_section_does_not_hide_later_body_in_same_file(self):
        document = extract_corpus.ET.fromstring(
            """<html xmlns="http://www.w3.org/1999/xhtml"><body>
            <h2>著作権・利用条件</h2><p>検索本文ではない利用条件。</p>
            <h2>原刊 p. 39</h2><p>同じファイル内の翻訳本文。</p>
            </body></html>"""
        )
        body = next(
            node
            for node in document.iter()
            if extract_corpus.xml_local_name(node.tag) == "body"
        )

        paragraphs = extract_corpus.epub_block_paragraphs(body)

        self.assertEqual(paragraphs, ["原刊 p. 39", "同じファイル内の翻訳本文。"])

    def test_epub_metadata_section_resumes_at_printed_page_marker(self):
        document = extract_corpus.ET.fromstring(
            """<html xmlns="http://www.w3.org/1999/xhtml"><body>
            <h2>著作権・翻訳方針</h2><p>検索本文ではない翻訳方針。</p>
            <p>〔原刊 p. 547〕</p><p>見出しなしで続く翻訳本文。</p>
            </body></html>"""
        )
        body = next(
            node
            for node in document.iter()
            if extract_corpus.xml_local_name(node.tag) == "body"
        )

        paragraphs = extract_corpus.epub_block_paragraphs(body)

        self.assertEqual(paragraphs, ["〔原刊 p. 547〕", "見出しなしで続く翻訳本文。"])

    def test_epub_mirror_recovers_text_from_malformed_xhtml(self):
        container = """<?xml version="1.0"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles>
</container>"""
        opf = """<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <manifest><item id="c1" href="chapter.xhtml" media-type="application/xhtml+xml"/></manifest>
  <spine><itemref idref="c1"/></spine>
</package>"""
        chapter = """<html><body><p>最初の<strong>本文</p><p>続きの本文</p></body></html>"""
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sample.epub"
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("META-INF/container.xml", container)
                archive.writestr("OEBPS/content.opf", opf)
                archive.writestr("OEBPS/chapter.xhtml", chapter)
            paragraphs = extract_corpus.epub_paragraphs(path)

        self.assertEqual(paragraphs, ["最初の本文", "続きの本文"])

    def test_facsimile_only_chapter_is_not_searchable_duplicate_text(self):
        self.assertTrue(
            extract_corpus.facsimile_labels_only(
                ["原資料画像頁 12", "原資料画像頁 12"]
            )
        )
        self.assertFalse(
            extract_corpus.facsimile_labels_only(
                ["原資料画像頁 12", "翻訳本文"]
            )
        )

    def test_short_repeated_text_cannot_jump_alignment_forward(self):
        chunks = [
            {"text": "最初の十分に長いアンカー本文です。"},
            {"text": "20"},
            {"text": "次のページにある十分に長いアンカー本文です。"},
        ]
        pages = [
            "最初の十分に長いアンカー本文です。",
            "次のページにある十分に長いアンカー本文です。",
            *([""] * 10),
            "20",
        ]

        extract_corpus.align_chunks_to_pdf(chunks, pages)

        self.assertEqual(chunks[1]["alignment"], "inherited")
        self.assertEqual(chunks[2]["pdfPage"], 2)

    def test_short_heading_uses_next_anchor_with_same_source_page(self):
        chunks = [
            {"text": "A001 原資料", "originalPage": "原資料：A001"},
            {
                "text": "次に続く十分に長い本文アンカーとして使える文章です。",
                "originalPage": "原資料：A001",
            },
        ]
        pages = [
            "前付",
            "",
            "",
            "",
            "",
            "",
            "次に続く十分に長い本文アンカーとして使える文章です。",
        ]

        extract_corpus.align_chunks_to_pdf(chunks, pages)

        self.assertEqual(chunks[0]["pdfPage"], 7)

    def test_pdf_page_collects_multiple_page_labels_but_not_editorial_notes(self):
        labels = extract_corpus.original_labels_for_pdf_pages(
            [
                "〔原刊 p. 4〕本文〔原刊はこの語を誤記〕〔原刊 p. 5〕続き",
                "〔原誌892頁〕本文",
            ]
        )
        self.assertEqual(labels, [["原刊 p. 4", "原刊 p. 5"], ["原誌892頁"]])

    def test_unmatched_footnote_uses_unique_printed_page_label(self):
        chunks = [
            {
                "text": "PDFにはないEPUB側の詳しい訳注です。",
                "originalPage": "原刊 p. 219",
                "pdfPage": 3,
                "alignment": "inherited",
            }
        ]
        labels = [[], ["原刊 p. 219"], []]

        extract_corpus.apply_source_page_alignment(chunks, labels)

        self.assertEqual(chunks[0]["pdfPage"], 2)
        self.assertEqual(chunks[0]["alignment"], "sourcePage")


if __name__ == "__main__":
    unittest.main()
