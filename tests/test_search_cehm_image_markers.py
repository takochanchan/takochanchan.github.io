import importlib.util
from pathlib import Path
import unittest

SPEC = importlib.util.spec_from_file_location(
    'extract_corpus', Path(__file__).parents[1] / 'scripts/search/extract-corpus.py')
extract = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(extract)


class CEHMImageLocationsTest(unittest.TestCase):
    def test_existing_labels_keep_their_meaning(self):
        labels = ['原資料画像0018', '原資料画像0021冒頭', '原資料画像0021残部',
                  '原資料画像0329–0330および0334', '原資料画像0401末尾–0402',
                  '史料画像0001', '史料画像0264–0265']
        for label in labels:
            with self.subTest(label=label):
                self.assertTrue(extract.is_original_page_marker('〔' + label + '〕'))
                self.assertEqual(extract.paragraphs_with_original_pages(
                    ['〔' + label + '〕', '文書の本文。']), [(label, '文書の本文。')])

    def test_prose_does_not_become_a_location(self):
        self.assertFalse(extract.is_original_page_marker('〔原資料画像を参照〕'))
        self.assertFalse(extract.is_original_page_marker('〔史料画像を参照〕'))

    def test_unique_notes_heading_keeps_its_exact_pdf_page(self):
        label = '原資料画像0415–0416'
        paragraphs = [
            '最後の原資料本文には日付と宛名が記されている。',
            '訳注',
            'この訳注は翻訳者による補足説明であり原資料本文ではない。',
        ]
        pages = [f'〔{label}〕\n{paragraphs[0]}', '前の文書の署名。',
                 '訳注\n' + paragraphs[2]]
        chunks = extract.searchable_chunks([(label, text) for text in paragraphs])
        extract.align_chunks_to_pdf(chunks, pages)
        extract.apply_source_page_alignment(chunks, extract.original_labels_for_pdf_pages(pages))
        heading = next(c for c in chunks if c['text'] == '訳注')
        self.assertEqual(heading['pdfPage'], 3)
        self.assertEqual(heading['alignment'], 'exact')


if __name__ == '__main__':
    unittest.main()
