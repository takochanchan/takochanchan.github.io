"""Physical bounds, closing labels, and regressions for page-end-only books."""
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location(
    "extract_end_marker", ROOT / "scripts/search/extract-corpus.py"
)
extract = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(extract)
F = json.loads((ROOT / "tests/fixtures/search-page-end-markers.json").read_text())


def chunks(paragraphs=None):
    return extract.page_end_chunks(
        F["paragraphs"] if paragraphs is None else paragraphs,
        preface_heading=F["prefaceHeading"],
        source_heading=F["sourceHeading"],
    )


class PageEndMarkerTests(unittest.TestCase):
    def test_closing_label_commission_restart_annex_and_split_page(self):
        rows, markers = chunks()
        self.assertEqual(markers.count("原刊 p. 1"), 2)
        self.assertFalse(any(row["text"] == F["paragraphs"][0] for row in rows))
        extract.align_page_end_chunks(rows, markers, F["pages"])
        for needle, label, physical_page, mode in F["expected"]:
            with self.subTest(needle=needle):
                match, = [r for r in rows if needle in r["text"]]
                self.assertEqual(
                    (match["originalPage"], match["pdfPage"], match["alignment"]),
                    (label, physical_page, mode),
                )
        self.assertTrue(all("sourceOccurrence" not in row for row in rows))

    def test_pdf_witness_order_and_duplicate_occurrences_cannot_be_lost(self):
        for pages in (
            F["pages"][:-1],
            [*F["pages"][:4], F["pages"][4].replace("〔原刊 p. 1〕", ""), F["pages"][5]],
            [*F["pages"][:3], F["pages"][3].replace("〔原刊 p. IX〕", "").replace("〔原刊 p. X〕", "〔原刊 p. V〕"), *F["pages"][4:]],
        ):
            with self.subTest(pages=len(pages)), self.assertRaisesRegex(ValueError, "sequences differ"):
                extract.align_page_end_chunks(*chunks(), pages)

    def test_off_sequence_roman_x_and_unclosed_body_rejected(self):
        altered = [p for p in F["paragraphs"] if p != "〔原刊 p. IX〕"]
        with self.assertRaisesRegex(ValueError, "unsupported placeholder"):
            chunks(altered)
        with self.assertRaisesRegex(ValueError, "must finish at"):
            chunks(F["paragraphs"][:-1])
        with self.assertRaisesRegex(ValueError, "original title leaf not found"):
            chunks([p for p in F["paragraphs"] if p != F["sourceHeading"]])
        self.assertTrue(extract.is_placeholder_original_marker("原刊 p. X"))

    def test_existing_nonopt_in_stays_forward(self):
        self.assertEqual(
            extract.paragraphs_with_original_pages([
                "頁付なし", "〔原刊 p. 7〕", "原刊七頁本文", "〔原刊 p. 8〕", "原刊八頁本文"
            ]),
            [
                ("底本位置なし（前付）", "頁付なし"),
                ("原刊 p. 7", "原刊七頁本文"),
                ("原刊 p. 8", "原刊八頁本文"),
            ],
        )


if __name__ == "__main__":
    unittest.main()
