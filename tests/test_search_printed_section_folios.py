import importlib.util
from pathlib import Path
import sys
import unittest

spec = importlib.util.spec_from_file_location('lobo_corpus', Path(__file__).resolve().parents[1] / 'scripts/search/extract-corpus.py')
corpus = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = corpus
spec.loader.exec_module(corpus)

class PrintedSectionFolioTests(unittest.TestCase):
    def test_preliminary_body_and_index_foliation(self):
        for marker in ['〔原刊 前付 f. 1r〕', '〔原刊 前付 f. 11r〕', '〔原刊 f. 76r〕', '〔原刊 巻末目次 f. 2v〕']:
            self.assertTrue(corpus.is_original_page_marker(marker), marker)
    def test_malformed_folio_is_not_a_source_page(self):
        for marker in ['〔原刊 巻末目次 f. 2x〕', '〔原刊 前付 f. 〕']:
            self.assertFalse(corpus.is_original_page_marker(marker), marker)
