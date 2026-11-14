import importlib.util
from pathlib import Path
import unittest
spec=importlib.util.spec_from_file_location('extract_patrignani',Path(__file__).parents[1]/'scripts/search/extract-corpus.py')
e=importlib.util.module_from_spec(spec)
spec.loader.exec_module(e)
class PatrignaniSourceMarkers(unittest.TestCase):
    def test_month_bounds(self):
        for m,end in [(1,312),(2,256),(3,224)]:
            for p in range(1,end+1):
                self.assertTrue(e.is_original_page_marker(f'〔原刊 第1巻 {m}月{p}頁〕'))
            self.assertFalse(e.is_original_page_marker(f'〔原刊 第1巻 {m}月{end+1}頁〕'))
    def test_distinct_months_and_supplement(self):
        values=['〔原刊 第1巻 1月1頁〕','甲','〔原刊 第1巻 2月1頁〕','乙','〔原刊 第1巻 3月1頁〕','丙','〔原刊 第1巻 2月146頁、補本の印字46頁〕','丁']
        self.assertEqual(e.paragraphs_with_original_pages(values),[('原刊 第1巻 1月1頁','甲'),('原刊 第1巻 2月1頁','乙'),('原刊 第1巻 3月1頁','丙'),('原刊 第1巻 2月146頁、補本の印字46頁','丁')])
    def test_no_arbitrary_commentary(self):
        for v in ['〔原刊 第1巻 1月0頁〕','〔原刊 第1巻 1月1頁、訳注〕','〔原刊 第1巻 前付 a9r〕']:
            self.assertFalse(e.is_original_page_marker(v))
