import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location(
    'extract_printed_folio',
    Path(__file__).parents[1] / 'scripts/search/extract-corpus.py',
)
extractor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extractor)


class PrintedFolioTest(unittest.TestCase):
    def test_printed_folios_follow_continuous_paragraph(self):
        self.assertEqual(
            extractor.paragraphs_with_original_pages([
                '〔原刊 f. 1v〕本文冒頭。〔原刊 f. 2r〕同じ段落の続き。'
            ]),
            [('原刊 f. 1v', '本文冒頭。'), ('原刊 f. 2r', '同じ段落の続き。')],
        )

    def test_printed_folio_requires_a_leaf_number_and_side(self):
        self.assertTrue(extractor.is_original_page_marker('〔原刊 f. 4r〕'))
        self.assertFalse(extractor.is_original_page_marker('〔原刊 f. 〕'))
        self.assertFalse(extractor.is_original_page_marker('〔原刊 f. は補った葉番号〕'))
