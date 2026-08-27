#!/usr/bin/env python3
"""Build reflowable EPUB 3 editions for the archive's published translations.

The preferred input is the final DOCX used to create a publication PDF. For
source-less tagged PDFs, Poppler's complete structured-text view is treated as
the text authority and is paired with the PDF structure tree's figure map:
artifacts such as running heads and page numbers are excluded, while headings,
paragraphs, tables, notes, figures, captions, and figure alt text are retained.

This script is a publication tool, not part of the GitHub Pages build. It
expects the editor-only DOCX files under ``sources/`` and writes completed EPUB
files to ``static/publications/<slug>/``.
"""

from __future__ import annotations

import argparse
import html
import io
import json
import posixpath
import re
import shutil
import subprocess
import tempfile
import unicodedata
import zipfile
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import unquote, urldefrag
from xml.etree import ElementTree as ET

import fitz
import pdfplumber
from PIL import Image, ImageOps
from pypdf import PdfReader
from pypdf.generic import (
    ArrayObject,
    DictionaryObject,
    IndirectObject,
    NumberObject,
)


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
STATIC = ROOT / "static"
SOURCES = ROOT / "sources"
WORK = ROOT / "work"
EPUB_SOURCES = ROOT / "epub-sources"
CSS = ROOT / "scripts" / "epub.css"
LUA_FILTER = ROOT / "scripts" / "epub-filter.lua"
CONTAINER_NS = "urn:oasis:names:tc:opendocument:xmlns:container"
OPF_NS = "http://www.idpf.org/2007/opf"
XHTML_NS = "http://www.w3.org/1999/xhtml"
EPUB_NS = "http://www.idpf.org/2007/ops"
NCX_NS = "http://www.daisy.org/z3986/2005/ncx/"

DOCX_SOURCES = {
    "squier-observations-zestermann-1851": SOURCES
    / "翻訳サイト"
    / "SQ-ART-027_Observations_on_Zestermann_Japanese_Prepublication.docx",
    "squier-crampton-webster-project-1852": SOURCES
    / "翻訳サイト"
    / "SQ-ART-029_Our_Foreign_Relations_Central_America_Japanese_Prepublication_Corrected.docx",
    "squier-ancient-peru-1853": SOURCES
    / "翻訳サイト"
    / "SQ-ART-031_Ancient_Peru_Japanese_Prepublication_Corrected.docx",
    "squier-great-south-american-earthquakes-1869": SOURCES
    / "翻訳サイト"
    / "SQ-ART-057_Great_South_American_Earthquakes_1868_Japanese_Prepublication_Corrected.docx",
    "squier-chalchihuitls-mexico-central-america-1870": SOURCES
    / "翻訳サイト"
    / "SQ-ART-058_Observations_on_Chalchihuitls_Japanese_Prepublication_Corrected.docx",
    "baily-central-america-1850": SOURCES
    / "翻訳サイト"
    / "John_Baily_Central_America_1850_Japanese_Complete_Translation.docx",
    "childs-nicaragua-canal-survey-1852": SOURCES
    / "翻訳サイト"
    / "Orville_W_Childs_Nicaragua_Canal_1852_Japanese_Complete_Translation.docx",
    "squier-nicaragua-1852": SOURCES
    / "翻訳サイト"
    / "Squier_Nicaragua_1852_Japanese_Complete_Translation.docx",
    "villagutierre-itza-1701": SOURCES
    / "翻訳サイト"
    / "villagutierre_itza_1701_ja.docx",
    "maler-usumacinta": SOURCES
    / "Maler_Usumacinta_Complete_Japanese_Translation.docx",
    "maler-upper-usumacinta": SOURCES
    / "Maler_Upper_Usumacinta_1908_Complete_Japanese_Translation.docx",
    "morelet-1857": SOURCES / "Morelet_1857_Japanese_Complete_Translation.docx",
    "rockstroh-ukes": SOURCES
    / "Rockstroh_Ukes_1881_Complete_Extant_Japanese_Translation.docx",
    "chambon-mexique": SOURCES
    / "Chambon_Un_Gascon_au_Mexique_1892_Complete_Japanese_Translation.docx",
    "arthes-peten-1893": SOURCES
    / "翻訳サイト"
    / "arthes_peten_1893_ja.docx",
    "del-rio-palenque": SOURCES
    / "Del_Rio_Palenque_Ruins_1822_Complete_Japanese_Translation.docx",
    "bourbourg-palenque-1866": SOURCES
    / "Bourbourg_Palenque_Complete_Japanese_Translation.docx",
    "esquinca-usumacinta": SOURCES
    / "Esquinca_Usumacinta_Expedition_1826_Published_Transcription_Complete_Japanese_Translation.docx",
    "humboldt-vues-cordilleres-1810-1813": SOURCES
    / "翻訳サイト"
    / "Humboldt_Vues_des_Cordilleres_1810_1813_ja_review.docx",
    "frias-mexico-guatemala-boundary-1883": SOURCES
    / "翻訳サイト"
    / "frias_cuestion_limites_1883_ja.docx",
    "pastrana-mexico-guatemala-boundary-1897": SOURCES
    / "翻訳サイト"
    / "pastrana_informe_1897_ja.docx",
    "urrutia-guatemala-mexico-boundary-1900": SOURCES
    / "翻訳サイト"
    / "urrutia_limites_1900_ja.docx",
    "byam-chiapas-1897": SOURCES
    / "翻訳サイト"
    / "Byam_A_Sketch_of_the_State_of_Chiapas_Mexico_1897_Japanese_Complete_Translation.docx",
    "thompson-ethnology-mayas-1930": SOURCES
    / "翻訳サイト"
    / "J_Eric_S_Thompson_Ethnology_of_the_Mayas_1930_Japanese_Complete_Translation.docx",
    "young-black-charaibs-st-vincent-1795": SOURCES
    / "翻訳サイト"
    / "Sir_William_Young_Black_Charaibs_1795_Japanese_Complete_Translation.docx",
    "sapper-mittelamerikanische-reisen-studien-1902": SOURCES
    / "翻訳サイト"
    / "Karl_Sapper_Mittelamerikanische_Reisen_und_Studien_1902_Japanese_Complete_Translation.docx",
    "honduras-slaves-correspondence-1823": SOURCES
    / "翻訳サイト"
    / "Great_Britain_House_of_Commons_Slaves_at_Honduras_1823_Japanese_Complete_Translation.docx",
    "defence-settlers-honduras-1824": SOURCES
    / "翻訳サイト"
    / "The_Defence_of_the_Settlers_of_Honduras_1824_Japanese_Complete_Translation.docx",
    "lundell-vegetation-peten-1937": SOURCES
    / "Cyrus_Longworth_Lundell_The_Vegetation_of_Peten_1937_Japanese_Complete_Translation.docx",
    "brigham-guatemala-quetzal-1887": SOURCES
    / "翻訳サイト"
    / "William_Tufts_Brigham_Guatemala_Japanese_review_v12.docx",
    "stoll-guatemala-reisen-schilderungen-1886": SOURCES
    / "翻訳サイト"
    / "Otto_Stoll_Guatemala_Japanese_review_v13.docx",
    "berendt-vermessungsarbeiten-mexiko-1862": SOURCES
    / "Carl_Hermann_Berendt_Vermessungs-Arbeiten_in_Mexiko_1862_Japanese_Complete_Translation.docx",
    "berendt-maasse-gewichte-mexiko-1862": SOURCES
    / "Carl_Hermann_Berendt_Maasse_und_Gewichte_in_Mexiko_1862_Japanese_Complete_Translation.docx",
    "berendt-handel-veracruz-1862": SOURCES
    / "Carl_Hermann_Berendt_Der_Handel_von_Veracruz_1862_Japanese_Complete_Translation.docx",
    "berendt-cochenille-produktion-oaxaca-1862": SOURCES
    / "Carl_Hermann_Berendt_Die_Cochenille-Produktion_des_Staates_von_Oaxaca_1758-1858_1862_Japanese_Complete_Translation.docx",
    "berendt-mexikanische-geographische-literatur-1862-1": SOURCES
    / "Carl_Hermann_Berendt_Die_Mexikanische_Geographische_Literatur_seit_1860_1862_Installment_1_Japanese_Complete_Translation.docx",
    "galindo-caribs-central-america-1833": SOURCES
    / "Galindo_Notice_of_the_Caribs_Central_America_1833_Japanese_Complete_Translation.docx",
    "galindo-antiquities-peten-1834": SOURCES
    / "Galindo_Antiquities_Peten_1834_Japanese_Complete_Translation.docx",
    "galindo-copan-literary-gazette-1835": SOURCES
    / "Galindo_Copan_Literary_Gazette_1835_Japanese_Complete_Translation.docx",
    "galindo-ruins-copan-aas-1836": SOURCES
    / "Galindo_Ruins_of_Copan_AAS_1836_Japanese_Complete_Translation.docx",
    "brinton-chilan-balam-1882": SOURCES
    / "翻訳サイト"
    / "Daniel_G_Brinton_The_Books_of_Chilan_Balam_1882_Japanese_Complete_Translation.docx",
    "roys-chilam-balam-chumayel-1933": SOURCES
    / "翻訳サイト"
    / "Ralph_L_Roys_The_Book_of_Chilam_Balam_of_Chumayel_1933_Japanese_Complete_Translation.docx",
    "elorza-conquista-ytza-1714": SOURCES
    / "翻訳サイト"
    / "Francisco_de_Elorza_y_Rada_Conquista_de_la_Provincia_del_Ytza_1714_Japanese_Complete_Translation.docx",
    "chonay-totonicapan-title-1886": SOURCES
    / "翻訳サイト"
    / "Dionisio_Jose_Chonay_Titulo_de_los_senores_de_Totonicapan_1886_Japanese_Complete_Translation.docx",
    "saville-reports-maya-yucatan-1921": SOURCES
    / "翻訳サイト"
    / "Marshall_H_Saville_Reports_on_the_Maya_Indians_of_Yucatan_1921_Japanese_Complete_Translation.docx",
    "brasseur-rabinal-achi-1862": SOURCES
    / "翻訳サイト"
    / "Charles_Etienne_Brasseur_de_Bourbourg_Grammaire_de_la_langue_quichee_Rabinal_Achi_1862_Japanese_Complete_Translation.docx",
    "santibanez-geografia-regional-chiapas-1907": SOURCES
    / "翻訳サイト"
    / "Enrique_Santibanez_Geografia_regional_de_Chiapas_1907_Japanese_Complete_Translation.docx",
    "pineda-traslado-poderes-chiapas-1892": SOURCES
    / "翻訳サイト"
    / "Vicente_Pineda_Chiapas_Traslado_de_los_poderes_publicos_1892_Japanese_Complete_Translation.docx",
    "montgomery-journey-guatemala-1839": SOURCES
    / "翻訳サイト"
    / "George_Washington_Montgomery_Narrative_of_a_Journey_to_Guatemala_1839_Japanese_Complete_Translation.docx",
    "carrera-memorias-1837-1840-1906": SOURCES
    / "翻訳サイト"
    / "Rafael_Carrera_Memorias_del_General_Carrera_1906_Japanese_Complete_Translation.docx",
    "valle-anexion-centro-america-mexico-1924-1949": SOURCES
    / "翻訳サイト"
    / "Rafael_Heliodoro_Valle_La_anexion_de_Centro_America_a_Mexico_1924_1949_Japanese_Complete_Translation.docx",
    "montufar-memorias-revolucion-centro-america-1832": SOURCES
    / "翻訳サイト"
    / "Manuel_Montufar_Memorias_para_la_historia_de_la_revolucion_de_Centro_America_1832_Japanese_Complete_Translation.docx",
    "ximenez-ayer-ms-1515-volume-2": SOURCES
    / "翻訳サイト"
    / "Francisco_Ximenez_Popol_Vuh_Escolios_Ayer_MS_1515_Vol_2_Japanese_Complete_Translation.docx",
    "dieseldorff-ausgrabungen-coban-1893": SOURCES
    / "Dieseldorff_Ausgrabungen_in_Coban_1893_Japanese_Complete_Translation.docx",
    "dieseldorff-alte-bemalte-thongefaesse-guatemala-1893": SOURCES
    / "Dieseldorff_Alte_bemalte_Thongefaesse_von_Guatemala_1893_Japanese_Complete_Translation.docx",
    "dieseldorff-gefaess-chama-1895": SOURCES
    / "Dieseldorff_Das_Gefaess_von_Chama_1895_Japanese_Complete_Translation.docx",
    "dieseldorff-reliefbild-chipolem-1895": SOURCES
    / "Dieseldorff_Reliefbild_aus_Chipolem_1895_Japanese_Complete_Translation.docx",
    "dieseldorff-cuculcan-1895": SOURCES
    / "Dieseldorff_Cuculcan_1895_Japanese_Complete_Translation.docx",
    "dieseldorff-tolteken-1896": SOURCES
    / "Dieseldorff_Wer_waren_die_Tolteken_1896_Japanese_Complete_Translation.docx",
    "dieseldorff-gegenstaende-guatemala-1893": SOURCES
    / "Dieseldorff_Gegenstaende_aus_Guatemala_1893_Japanese_Complete_Translation.docx",
    "dieseldorff-bemaltes-thongefaess-chama-1894": SOURCES
    / "Dieseldorff_Ein_bemaltes_Thongefaess_aus_Chama_1894_Japanese_Complete_Translation.docx",
    "dieseldorff-vampyrkoepfige-gottheit-1894": SOURCES
    / "Dieseldorff_Vampyrkoepfige_Gottheit_1894_Japanese_Complete_Translation.docx",
    "dieseldorff-neue-ausgrabungen-chajcar-1895": SOURCES
    / "Dieseldorff_Neue_Ausgrabungen_in_Chajcar_1895_Japanese_Complete_Translation.docx",
    "dieseldorff-two-vases-chama-1904": SOURCES
    / "Dieseldorff_Two_Vases_from_Chama_1904_Japanese_Complete_Translation.docx",
    "dieseldorff-jadeit-schmuck-1905": SOURCES
    / "Dieseldorff_Jadeit_und_anderer_Schmuck_1905_Japanese_Complete_Translation.docx",
    "dieseldorff-klassifizierung-funde-1909": SOURCES
    / "Dieseldorff_Klassifizierung_archaeologischer_Funde_1909_Japanese_Complete_Translation.docx",
    "dieseldorff-tzultaca-mam-1926": SOURCES
    / "Dieseldorff_El_Tzultaca_y_el_Mam_1926_Japanese_Complete_Translation.docx",
    "dieseldorff-kunst-religion-band-i-1926": SOURCES
    / "Dieseldorff_Kunst_und_Religion_Band_I_1926_Japanese_Complete_Translation.docx",
    "dieseldorff-kunst-religion-band-ii-1931": SOURCES
    / "Dieseldorff_Kunst_und_Religion_Band_II_1931_Japanese_Complete_Translation.docx",
    "dieseldorff-kekchi-will-1583-1932": SOURCES
    / "Dieseldorff_A_Kekchi_Will_of_1583_1932_Japanese_Complete_Translation.docx",
    "dieseldorff-cauac-thunderbolt-signs-1932": SOURCES
    / "Dieseldorff_Further_Data_on_Cauac_and_Thunderbolt_Signs_1932_Japanese_Complete_Translation.docx",
    "dieseldorff-arqueologia-alta-verapaz-1936": SOURCES
    / "Dieseldorff_Arqueologia_Alta_Verapaz_1936_Japanese_Complete_Translation.docx",
    "dieseldorff-calendario-maya-quirigua-1936": SOURCES
    / "Dieseldorff_El_Calendario_Maya_de_Quirigua_1936_Japanese_Complete_Translation.docx",
    "dieseldorff-plantas-medicinales-alta-verapaz-1939-1940": SOURCES
    / "Dieseldorff_Plantas_Medicinales_Alta_Verapaz_1939_1940_Japanese_Complete_Translation.docx",
    "dieseldorff-causa-calendario-quirigua-1940": SOURCES
    / "Dieseldorff_Causa_Calendario_Quirigua_1940_Japanese_Complete_Translation.docx",
    "schellhas-virchow-deformierter-schaedel-ulpan-1894": SOURCES
    / "Schellhas_Virchow_Deformierter_Schaedel_Ulpan_1894_Japanese_Complete_Translation.docx",
    "virchow-graeberschaedel-guatemala-1897": SOURCES
    / "Virchow_Graeberschaedel_Guatemala_1897_Japanese_Complete_Translation.docx",
    "cortes-y-larraz-descripcion-geografico-moral-1771": SOURCES
    / "Cortes_y_Larraz_Descripcion_Geografico_Moral_1771_Japanese_Complete_Translation.docx",
    "gemelli-careri-giro-del-mondo-nuova-spagna-1700": SOURCES
    / "翻訳サイト"
    / "Gemelli_Careri_Giro_del_Mondo_Parte_VI_Nuova_Spagna_Japanese_Complete_Translation.docx",
    "fuentes-guzman-recordacion-florida-1882-1883": SOURCES
    / "翻訳サイト"
    / "Francisco_Antonio_de_Fuentes_y_Guzman_Recordacion_Florida_1882_1883_Japanese_Complete_Translation.docx",
    "perigny-ruines-nacun-1906": SOURCES
    / "Maurice_de_Perigny_Les_ruines_de_Nacun_1906_Japanese_Complete_Translation.docx",
    "perigny-exploration-yucatan-1906": SOURCES
    / "Maurice_de_Perigny_Une_exploration_au_Yucatan_1906_Japanese_Complete_Translation.docx",
    "lemoine-travers-peten-yucatan-1906": SOURCES
    / "Frederic_Lemoine_A_travers_le_Peten_et_le_Yucatan_1906_Japanese_Complete_Translation.docx",
    "perigny-peten-1907": SOURCES
    / "Maurice_de_Perigny_Le_Peten_1907_Japanese_Complete_Translation.docx",
    "perigny-maya-ruins-quintana-roo-1907": SOURCES
    / "Maurice_de_Perigny_Maya_Ruins_in_Quintana_Roo_1907_Japanese_Complete_Translation.docx",
    "perigny-yucatan-inconnu-1908": SOURCES
    / "Maurice_de_Perigny_Yucatan_inconnu_1908_Japanese_Complete_Translation.docx",
    "perigny-maler-discoveries-yucatan-1908": SOURCES
    / "Maurice_de_Perigny_Les_dernieres_decouvertes_de_Maler_dans_le_Yucatan_1908_Japanese_Complete_Translation.docx",
    "perigny-yucatan-inconnu-geographie-1908": SOURCES
    / "Maurice_de_Perigny_Le_Yucatan_inconnu_1908_Japanese_Complete_Translation.docx",
    "perigny-villes-mortes-amerique-centrale-1909": SOURCES
    / "Maurice_de_Perigny_Villes_mortes_de_l_Amerique_centrale_1909_Japanese_Complete_Translation.docx",
    "perigny-ruines-rio-bec-1909": SOURCES
    / "Maurice_de_Perigny_Ruines_de_Rio_Beque_1909_Japanese_Complete_Translation.docx",
    "ixtlilxochitl-sumaria-todas": SOURCES
    / "翻訳サイト"
    / "Fernando_de_Alva_Ixtlilxochitl_Sumaria_Relacion_Todas_Cosas_Japanese_Complete_Translation.docx",
    "ixtlilxochitl-relacion-sucinta": SOURCES
    / "翻訳サイト"
    / "Fernando_de_Alva_Ixtlilxochitl_Relacion_Sucinta_Memorial_Japanese_Complete_Translation.docx",
    "ixtlilxochitl-compendio-tetzcoco": SOURCES
    / "翻訳サイト"
    / "Fernando_de_Alva_Ixtlilxochitl_Compendio_Historico_Reyes_Tetzcoco_Japanese_Complete_Translation.docx",
    "ixtlilxochitl-sumaria-general": SOURCES
    / "翻訳サイト"
    / "Fernando_de_Alva_Ixtlilxochitl_Sumaria_Relacion_Historia_General_Japanese_Complete_Translation.docx",
    "ixtlilxochitl-historia-chichimeca": SOURCES
    / "翻訳サイト"
    / "Fernando_de_Alva_Ixtlilxochitl_Historia_Nacion_Chichimeca_Japanese_Complete_Translation.docx",
    "tezozomoc-cronica-mexicana-kraus-117": SOURCES
    / "翻訳サイト"
    / "Hernando_Alvarado_Tezozomoc_Cronica_Mexicana_Kraus117_Japanese_Complete_Translation.docx",
    "codice-chimalpahin-volumen-3": SOURCES
    / "翻訳サイト"
    / "Codice_Chimalpahin_Volumen_3_Japanese_Complete_Translation.docx",
    "garcia-icazbalceta-bibliografia-mexicana-siglo-xvi-1886": SOURCES
    / "翻訳サイト"
    / "Joaquin_Garcia_Icazbalceta_Bibliografia_Mexicana_del_Siglo_XVI_1886_Japanese_Complete_Translation.docx",
    "cervantes-salazar-mexico-en-1554-1875": SOURCES
    / "翻訳サイト"
    / "Francisco_Cervantes_de_Salazar_Mexico_en_1554_1875_Latin_Japanese.docx",
    "guzman-apuntamientos-topografia-salvador-1883": SOURCES
    / "翻訳サイト"
    / "Guzman_Apuntamientos_1883_Japanese_Complete_Translation.docx",
    "torquemada-monarquia-indiana-1615": SOURCES
    / "翻訳サイト"
    / "Juan_de_Torquemada_Monarquia_indiana_1615_Japanese_Complete_Translation.docx",
    "siguenza-infortunios-alonso-ramirez-1690": SOURCES
    / "翻訳サイト"
    / "Carlos_de_Siguenza_y_Gongora_Infortunios_de_Alonso_Ramirez_1690_Japanese_Complete_Translation.docx",
    "barberena-fonseca-monografias-departamentales-1909-1914": SOURCES
    / "翻訳サイト"
    / "Barberena_Monografias_7vols_Fancourt_Mother.docx",
}

MARKDOWN_SOURCES = {
    "chimalpahin-diario-1577-1615": SOURCES
    / "翻訳サイト"
    / "chimalpahin-diario-1577-1615"
    / "master.md",
    "castillo-historias-mexicanos-conquista-1908": SOURCES
    / "翻訳サイト"
    / "castillo-historias-mexicanos-conquista-1908"
    / "master.md",
    "codex-perez-pmm9-1877": SOURCES
    / "翻訳サイト"
    / "codex-perez-pmm9-1877"
    / "master.md",
    "morelet-exploration-guatemala-1850": SOURCES
    / "Morelet_Exploration_du_Guatemala_1850_Japanese_Complete_Translation.md",
    "morelet-testacea-novissima-pars-i-1849": SOURCES
    / "Morelet_Testacea_Novissima_Pars_I_1849_Japanese_Complete_Translation.md",
    "morelet-testacea-novissima-pars-ii-1851": SOURCES
    / "Morelet_Testacea_Novissima_Pars_II_1851_Japanese_Complete_Translation.md",
}

TAGGED_PDF_SOURCES = {
    "cook-balise-merida-1769",
    "galindo-copan-full-report-1834",
    "galindo-eruption-cosiguina-1835",
    "galindo-noticias-peten-1831",
    "galindo-on-central-america-1836",
    "galindo-palenque-1832",
    "galindo-ruins-palenque-literary-gazette-1831",
    "galindo-usumacinta-1833",
    "squier-british-encroachments-mosquito-question-1850",
    "squier-great-calendar-stone-1849",
    "squier-great-ship-canal-question-1850",
    "squier-judgment-by-default-1851",
    "squier-spanish-american-republics-1850",
    "swett-british-honduras-san-pedro-1868",
    "tribes-and-temples-vol-1",
    "tribes-and-temples-vol-2",
}

STOLL_PDF_SOURCES = {
    "stoll-ethnographie-guatemala-1884",
    "stoll-ixil-language-1887",
    "stoll-pokom-languages-1888-1896",
}

TAGGED_PDF_FIGURE_ALTS = {
    "squier-great-calendar-stone-1849": [
        "図1 ガマの図に基づく。図2 ネベルの図に基づく。",
    ],
    "squier-british-encroachments-mosquito-question-1850": [
        "中央アメリカ地図——モスキート海岸におけるグレートブリテンの要求範囲を示す（原刊189頁）",
    ],
    "squier-great-ship-canal-question-1850": [
        "中央アメリカ地図——モスキート海岸におけるイギリスの主張を示す（原刊445頁）",
    ],
    "cook-balise-merida-1769": [
        "1769年初版の原刊標題紙",
        "原刊1頁の装飾見出し",
    ],
    "galindo-palenque-1832": [
        "原刊別葉図版（図1–12、全紙葉）",
        "原刊206頁の壁孔模式図",
    ],
    "galindo-ruins-palenque-literary-gazette-1831": [
        "『リテラリー・ガゼット』第769号原刊665頁",
        "『リテラリー・ガゼット』第769号原刊666頁",
        "原刊665頁本文内図（方形区画の模式図）",
        "原刊665頁本文内図（窓と壁体の模式図）",
    ],
    "galindo-eruption-cosiguina-1835": [
        "王立地理学協会誌第5巻原刊387頁の論文冒頭",
    ],
    "galindo-on-central-america-1836": [
        "王立地理学協会誌第6巻原刊119頁の論文冒頭",
        "原刊付図『中央アメリカのコスタリカ国略図』西半",
        "原刊付図『中央アメリカのコスタリカ国略図』東半",
    ],
    "galindo-noticias-peten-1831": [
        "『ガセタ・フェデラル』第35号原刊257頁の論文冒頭",
    ],
    "galindo-copan-full-report-1834": [
        "BnF f137――コパンと周辺の地図",
        "BnF f139――ラス・ベンタナス平面図",
        "BnF f141――ラス・ベンタナス水彩全景",
        "BnF f143――図1–3",
        "BnF f145――図4–6",
        "BnF f147――図7–9",
        "BnF f149――図10–12",
        "BnF f151――図13–15",
        "BnF f153――一部図の補助・比較図版",
        "BnF f155――図16–18",
        "BnF f157――一部図の補助・比較図版",
        "BnF f159――図19–23",
        "BnF f161――図24–26",
    ],
}

SAPPER_SLUG = "sapper-eastern-lacandons-1891"
EGAN_SLUG = "egan-wyer-1930"

SAPPER_GLYPH_REPAIRS = {
    "樹皮を\u0000ぎ": "樹皮を剥ぎ",
    "樹皮を ぎ": "樹皮を剥ぎ",
    "その\u0000末": "その顛末",
    "その 末": "その顛末",
    "突き出た\u0000骨": "突き出た頬骨",
    "突き出た 骨": "突き出た頬骨",
}


def run(args: list[str], *, cwd: Path | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(
        args,
        cwd=cwd,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def load_catalogue() -> list[dict[str, Any]]:
    script = (
        "import {publications} from './src/publications.mjs';"
        "process.stdout.write(JSON.stringify(publications));"
    )
    result = run(["node", "--input-type=module", "-e", script], cwd=ROOT)
    return json.loads(result.stdout)


def pdf_path(item: dict[str, Any]) -> Path:
    candidate = STATIC / item["pdf"]
    if candidate.exists():
        return candidate
    candidate = DIST / item["pdf"]
    if candidate.exists():
        return candidate
    raise FileNotFoundError(f"Missing publication PDF: {item['pdf']}")


def epub_relative_path(item: dict[str, Any]) -> str:
    return item["epub"]


def metadata_args(item: dict[str, Any]) -> list[str]:
    canonical = f"https://takochanchan.github.io/publications/{item['slug']}/"
    return [
        f"--metadata=title:{item['title']}",
        f"--metadata=subtitle:{item['subtitle']}",
        f"--metadata=author:{item['author']}",
        "--metadata=lang:ja",
        "--metadata=language:ja",
        "--metadata=date:2026",
        "--metadata=publisher:中部アメリカ歴史資料 日本語翻訳アーカイブ",
        f"--metadata=identifier:{canonical}",
        f"--metadata=source:{item['originalTitle']}",
        f"--metadata=description:{item['description']}",
        f"--metadata=rights:{item['rights']}",
    ]


def pandoc_to_epub(
    source: Path,
    raw_epub: Path,
    item: dict[str, Any],
    *,
    from_format: str | None = None,
    resource_path: Path | None = None,
) -> None:
    cover = STATIC / item["cover"]
    if not cover.exists():
        cover = DIST / item["cover"]
    args = [
        "pandoc",
        str(source),
        "--to=epub3",
        "--standalone",
        "--toc",
        "--toc-depth=4",
        "--split-level=2",
        f"--epub-cover-image={cover}",
        f"--css={CSS}",
        f"--lua-filter={LUA_FILTER}",
        f"--output={raw_epub}",
        *metadata_args(item),
    ]
    if from_format:
        args.insert(2, f"--from={from_format}")
    if resource_path:
        args.append(f"--resource-path={resource_path}")
    completed = run(args, cwd=ROOT)
    if completed.stderr.strip():
        print(completed.stderr.strip())


def flatten_transparency(image: Image.Image) -> Image.Image:
    if image.mode in {"RGBA", "LA"} or (
        image.mode == "P" and "transparency" in image.info
    ):
        rgba = image.convert("RGBA")
        background = Image.new("RGBA", rgba.size, "white")
        background.alpha_composite(rgba)
        return background.convert("RGB")
    return image.convert("RGB")


def package_epub(directory: Path, output: Path) -> None:
    """Write an EPUB ZIP with the required uncompressed first mimetype entry."""
    mimetype = directory / "mimetype"
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, "w") as archive:
        archive.write(
            mimetype,
            "mimetype",
            compress_type=zipfile.ZIP_STORED,
        )
        for file in sorted(directory.rglob("*")):
            if not file.is_file() or file == mimetype:
                continue
            archive.write(
                file,
                file.relative_to(directory).as_posix(),
                compress_type=zipfile.ZIP_DEFLATED,
                compresslevel=9,
            )


def epub_package_path(directory: Path) -> Path:
    container = ET.parse(directory / "META-INF" / "container.xml").getroot()
    rootfiles = container.findall(f".//{{{CONTAINER_NS}}}rootfile")
    if len(rootfiles) != 1:
        raise ValueError("Expected exactly one EPUB package rootfile")
    return directory / rootfiles[0].attrib["full-path"]


def add_navigation_outline(
    root: ET.Element,
    entries: list[tuple[int, str, str]],
    *,
    ncx: bool = False,
) -> int:
    """Populate a TOC in source order while retaining the heading hierarchy."""
    last_by_level: dict[int, ET.Element] = {}
    child_list_by_parent: dict[int, ET.Element] = {}
    play_order = 0
    maximum_depth = 1

    for level, label, target in entries:
        for stale_level in [value for value in last_by_level if value >= level]:
            del last_by_level[stale_level]
        parent_levels = [value for value in last_by_level if value < level]
        if parent_levels:
            parent = last_by_level[max(parent_levels)]
            parent_key = id(parent)
            if parent_key not in child_list_by_parent:
                if ncx:
                    child_list_by_parent[parent_key] = parent
                else:
                    child_list_by_parent[parent_key] = ET.SubElement(
                        parent,
                        f"{{{XHTML_NS}}}ol",
                        {"class": "toc"},
                    )
            container = child_list_by_parent[parent_key]
            maximum_depth = max(maximum_depth, len(parent_levels) + 1)
        else:
            container = root

        if ncx:
            play_order += 1
            item = ET.SubElement(
                container,
                f"{{{NCX_NS}}}navPoint",
                {
                    "id": f"navPoint-{play_order}",
                    "playOrder": str(play_order),
                },
            )
            nav_label = ET.SubElement(item, f"{{{NCX_NS}}}navLabel")
            ET.SubElement(nav_label, f"{{{NCX_NS}}}text").text = label
            ET.SubElement(
                item,
                f"{{{NCX_NS}}}content",
                {"src": target},
            )
        else:
            item = ET.SubElement(container, f"{{{XHTML_NS}}}li")
            ET.SubElement(
                item,
                f"{{{XHTML_NS}}}a",
                {"href": target},
            ).text = label
        last_by_level[level] = item

    return maximum_depth


def repair_epub_navigation(directory: Path) -> None:
    """Rebuild EPUB 3 and legacy NCX TOCs from actual spine/heading order."""
    ET.register_namespace("", XHTML_NS)
    ET.register_namespace("epub", EPUB_NS)

    opf_path = epub_package_path(directory)
    opf = ET.parse(opf_path).getroot()
    opf_directory = opf_path.parent
    manifest: dict[str, tuple[Path, set[str]]] = {}
    nav_path: Path | None = None
    ncx_path: Path | None = None

    for item in opf.findall(f".//{{{OPF_NS}}}manifest/{{{OPF_NS}}}item"):
        item_id = item.attrib["id"]
        path = opf_directory / unquote(item.attrib["href"])
        properties = set(item.attrib.get("properties", "").split())
        manifest[item_id] = (path, properties)
        if "nav" in properties:
            nav_path = path
        if item.attrib.get("media-type") == "application/x-dtbncx+xml":
            ncx_path = path
    if nav_path is None:
        raise ValueError("EPUB package has no navigation document")

    entries: list[tuple[int, str, str]] = []
    seen_targets: set[str] = set()
    heading_serial = 0
    for itemref in opf.findall(f".//{{{OPF_NS}}}spine/{{{OPF_NS}}}itemref"):
        path, properties = manifest[itemref.attrib["idref"]]
        if path == nav_path or "nav" in properties:
            continue
        if path.suffix.lower() not in {".xhtml", ".html"}:
            continue
        if path.stem in {"cover", "title_page"}:
            continue

        document = ET.parse(path)
        document_root = document.getroot()
        parents = {
            child: parent
            for parent in document_root.iter()
            for child in list(parent)
        }
        changed = False
        for heading in document_root.iter():
            match = re.fullmatch(rf"\{{{re.escape(XHTML_NS)}\}}h([1-4])", heading.tag)
            if not match:
                continue
            ancestor = heading
            unlisted = False
            while ancestor is not None:
                if "unlisted" in ancestor.attrib.get("class", "").split():
                    unlisted = True
                    break
                ancestor = parents.get(ancestor)
            if unlisted:
                continue
            label = " ".join("".join(heading.itertext()).split())
            if not label:
                continue
            heading_serial += 1
            anchor = heading.attrib.get("id", "")
            parent = parents.get(heading)
            while not anchor and parent is not None:
                anchor = parent.attrib.get("id", "")
                parent = parents.get(parent)
            relative = posixpath.relpath(
                path.relative_to(directory).as_posix(),
                start=nav_path.parent.relative_to(directory).as_posix(),
            )
            target = f"{relative}#{anchor}" if anchor else relative
            if target in seen_targets:
                anchor = f"reading-order-heading-{heading_serial:05d}"
                heading.attrib["id"] = anchor
                target = f"{relative}#{anchor}"
                changed = True
            elif not anchor:
                anchor = f"reading-order-heading-{heading_serial:05d}"
                heading.attrib["id"] = anchor
                target = f"{relative}#{anchor}"
                changed = True
            seen_targets.add(target)
            entries.append((int(match.group(1)), label, target))
        if changed:
            document.write(path, encoding="utf-8", xml_declaration=True)

    if not entries:
        raise ValueError("EPUB has no headings for its table of contents")

    nav_document = ET.parse(nav_path)
    nav_root = nav_document.getroot()
    toc_nav = next(
        (
            element
            for element in nav_root.iter(f"{{{XHTML_NS}}}nav")
            if "toc"
            in element.attrib.get(f"{{{EPUB_NS}}}type", "").split()
        ),
        None,
    )
    if toc_nav is None:
        raise ValueError("EPUB navigation document has no toc nav")
    for child in list(toc_nav):
        if child.tag == f"{{{XHTML_NS}}}ol":
            toc_nav.remove(child)
    toc_list = ET.SubElement(toc_nav, f"{{{XHTML_NS}}}ol", {"class": "toc"})
    add_navigation_outline(toc_list, entries)
    nav_document.write(nav_path, encoding="utf-8", xml_declaration=True)

    if ncx_path is not None:
        ET.register_namespace("", NCX_NS)
        ncx_document = ET.parse(ncx_path)
        ncx_root = ncx_document.getroot()
        nav_map = ncx_root.find(f".//{{{NCX_NS}}}navMap")
        if nav_map is None:
            raise ValueError("EPUB NCX has no navMap")
        for child in list(nav_map):
            nav_map.remove(child)
        depth = add_navigation_outline(nav_map, entries, ncx=True)
        for meta in ncx_root.findall(f".//{{{NCX_NS}}}meta"):
            if meta.attrib.get("name") == "dtb:depth":
                meta.set("content", str(depth))
        ncx_document.write(ncx_path, encoding="utf-8", xml_declaration=True)


def optimize_epub(raw_epub: Path, final_epub: Path, max_image_px: int = 2400) -> None:
    with tempfile.TemporaryDirectory(prefix="archive-epub-opt-") as tmp:
        directory = Path(tmp)
        with zipfile.ZipFile(raw_epub) as archive:
            archive.extractall(directory)

        mimetype = directory / "mimetype"
        if mimetype.read_text(encoding="ascii") != "application/epub+zip":
            raise ValueError(f"{raw_epub}: invalid EPUB mimetype")

        for image_path in directory.rglob("*"):
            if image_path.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
                continue
            try:
                with Image.open(image_path) as opened:
                    image = ImageOps.exif_transpose(opened)
                    width, height = image.size
                    if max(width, height) <= max_image_px:
                        continue
                    scale = max_image_px / max(width, height)
                    image = image.resize(
                        (max(1, round(width * scale)), max(1, round(height * scale))),
                        Image.Resampling.LANCZOS,
                    )
                    if image_path.suffix.lower() in {".jpg", ".jpeg"}:
                        flatten_transparency(image).save(
                            image_path,
                            "JPEG",
                            quality=86,
                            optimize=True,
                            progressive=True,
                            subsampling="4:2:0",
                        )
                    else:
                        image.save(image_path, "PNG", optimize=True, compress_level=9)
            except Exception as error:
                raise RuntimeError(f"Could not optimize EPUB image {image_path}") from error

        repair_epub_navigation(directory)
        package_epub(directory, final_epub)


def remove_book_front_matter_from_short_work_spine(epub: Path) -> None:
    """Keep cover metadata but start journal-paper reading order at the article."""
    with tempfile.TemporaryDirectory(prefix="archive-short-work-spine-") as tmp:
        directory = Path(tmp)
        with zipfile.ZipFile(epub) as archive:
            archive.extractall(directory)

        opf_path = epub_package_path(directory)
        tree = ET.parse(opf_path)
        package_root = tree.getroot()
        manifest = {
            item.attrib["id"]: item.attrib["href"]
            for item in package_root.findall(
                f".//{{{OPF_NS}}}manifest/{{{OPF_NS}}}item"
            )
        }
        spine = package_root.find(f".//{{{OPF_NS}}}spine")
        if spine is None:
            raise ValueError("EPUB package has no spine")

        excluded = {"cover.xhtml", "title_page.xhtml", "nav.xhtml"}
        for itemref in list(spine):
            href = manifest.get(itemref.attrib.get("idref", ""), "")
            if PurePosixPath(href).name in excluded:
                spine.remove(itemref)

        remaining = [manifest[item.attrib["idref"]] for item in spine]
        if not remaining or PurePosixPath(remaining[0]).name != "ch001.xhtml":
            raise ValueError(
                f"Unexpected short-work reading-order start: {remaining[:1]}"
            )

        ET.register_namespace("", OPF_NS)
        tree.write(opf_path, encoding="utf-8", xml_declaration=True)
        with tempfile.NamedTemporaryFile(
            prefix=f".{epub.name}.",
            suffix=".tmp",
            dir=epub.parent,
            delete=False,
        ) as temporary:
            replacement = Path(temporary.name)
        try:
            package_epub(directory, replacement)
            replacement.replace(epub)
        finally:
            replacement.unlink(missing_ok=True)


def repair_existing_epub(epub: Path) -> None:
    """Repair navigation without rerunning content extraction or image handling."""
    with tempfile.TemporaryDirectory(prefix="archive-epub-nav-") as tmp:
        directory = Path(tmp)
        contents = directory / "contents"
        contents.mkdir()
        with zipfile.ZipFile(epub) as archive:
            archive.extractall(contents)
        repair_epub_navigation(contents)
        with tempfile.NamedTemporaryFile(
            prefix=f".{epub.name}.",
            suffix=".tmp",
            dir=epub.parent,
            delete=False,
        ) as temporary:
            replacement = Path(temporary.name)
        try:
            package_epub(contents, replacement)
            replacement.replace(epub)
        finally:
            replacement.unlink(missing_ok=True)
    validate_epub(epub)
    print(f"Repaired {epub.relative_to(ROOT)}")


def validate_epub(epub: Path) -> None:
    """Validate the package structure and every XML/XHTML resource."""
    with zipfile.ZipFile(epub) as archive:
        names = archive.namelist()
        if not names or names[0] != "mimetype":
            raise ValueError(f"{epub}: mimetype must be the first ZIP entry")
        if archive.getinfo("mimetype").compress_type != zipfile.ZIP_STORED:
            raise ValueError(f"{epub}: mimetype must be stored without compression")
        if archive.read("mimetype") != b"application/epub+zip":
            raise ValueError(f"{epub}: invalid mimetype")
        if "META-INF/container.xml" not in names:
            raise ValueError(f"{epub}: missing META-INF/container.xml")

        parsed: dict[str, ET.Element] = {}
        for name in names:
            if name.endswith((".xml", ".opf", ".ncx", ".xhtml", ".svg")):
                try:
                    parsed[name] = ET.fromstring(archive.read(name))
                except ET.ParseError as error:
                    raise ValueError(f"{epub}: malformed XML/XHTML in {name}: {error}") from error

        container = parsed["META-INF/container.xml"]
        rootfiles = container.findall(
            ".//{urn:oasis:names:tc:opendocument:xmlns:container}rootfile"
        )
        if len(rootfiles) != 1:
            raise ValueError(f"{epub}: expected exactly one package rootfile")
        opf_name = rootfiles[0].attrib.get("full-path", "")
        if opf_name not in parsed:
            raise ValueError(f"{epub}: missing package document {opf_name}")

        opf = parsed[opf_name]
        package_namespace = "{http://www.idpf.org/2007/opf}"
        manifest_items = opf.findall(f".//{package_namespace}manifest/{package_namespace}item")
        if not manifest_items:
            raise ValueError(f"{epub}: empty manifest")
        manifest_ids: dict[str, str] = {}
        has_navigation = False
        for item in manifest_items:
            item_id = item.attrib.get("id", "")
            href = unquote(item.attrib.get("href", ""))
            if not item_id or not href:
                raise ValueError(f"{epub}: manifest item missing id or href")
            resolved = posixpath.normpath(
                posixpath.join(posixpath.dirname(opf_name), href)
            )
            if resolved not in names:
                raise ValueError(f"{epub}: missing manifest resource {resolved}")
            if archive.getinfo(resolved).file_size == 0:
                raise ValueError(f"{epub}: empty manifest resource {resolved}")
            manifest_ids[item_id] = resolved
            properties = set(item.attrib.get("properties", "").split())
            has_navigation = has_navigation or "nav" in properties
        if not has_navigation:
            raise ValueError(f"{epub}: manifest has no EPUB navigation document")

        spine_items = opf.findall(f".//{package_namespace}spine/{package_namespace}itemref")
        if not spine_items:
            raise ValueError(f"{epub}: empty spine")
        for itemref in spine_items:
            if itemref.attrib.get("idref", "") not in manifest_ids:
                raise ValueError(
                    f"{epub}: spine references unknown id {itemref.attrib.get('idref')}"
                )

        for name, root in parsed.items():
            if not name.endswith((".xhtml", ".svg")):
                continue
            base = posixpath.dirname(name)
            ids: set[str] = set()
            for element in root.iter():
                element_id = element.attrib.get("id")
                if element_id:
                    if element_id in ids:
                        raise ValueError(
                            f"{epub}: duplicate id {element_id!r} in {name}"
                        )
                    ids.add(element_id)
                for attribute in ("href", "src"):
                    value = element.attrib.get(attribute)
                    if not value or value.startswith(
                        ("#", "data:", "http://", "https://", "mailto:", "tel:")
                    ):
                        continue
                    local, _fragment = urldefrag(value)
                    if not local:
                        continue
                    target = posixpath.normpath(
                        posixpath.join(base, unquote(local))
                    )
                    if target not in names:
                        raise ValueError(
                            f"{epub}: {name} references missing resource {target}"
                        )


def resolved(value: Any) -> Any:
    return value.get_object() if isinstance(value, IndirectObject) else value


def pdf_name(value: Any) -> str | None:
    if value is None:
        return None
    return str(value).removeprefix("/")


def page_content_maps(pdf: Path) -> tuple[dict, dict, list]:
    text_by_page: dict[int, dict[int, str]] = {}
    images_by_page: dict[int, dict[int, list[dict[str, Any]]]] = {}
    anomalies: list[dict[str, Any]] = []

    with pdfplumber.open(pdf) as document:
        for page in document.pages:
            chars: dict[int, list[str]] = defaultdict(list)
            images: dict[int, list[dict[str, Any]]] = defaultdict(list)
            for char in page.chars:
                mcid = char.get("mcid")
                tag = char.get("tag")
                if mcid is not None:
                    chars[int(mcid)].append(char["text"])
                elif tag != "Artifact":
                    anomalies.append(
                        {
                            "page": page.page_number,
                            "text": char["text"],
                            "bbox": [
                                char["x0"],
                                char["top"],
                                char["x1"],
                                char["bottom"],
                            ],
                        }
                    )
            for image in page.images:
                mcid = image.get("mcid")
                if mcid is None:
                    continue
                images[int(mcid)].append(
                    {
                        "name": image["name"],
                        "bbox": [
                            image["x0"],
                            image["top"],
                            image["x1"],
                            image["bottom"],
                        ],
                    }
                )
            text_by_page[page.page_number] = {
                mcid: "".join(parts) for mcid, parts in chars.items()
            }
            images_by_page[page.page_number] = dict(images)
    return text_by_page, images_by_page, anomalies


def extract_tagged_image(
    reader: PdfReader,
    page_number: int,
    xobject_name: str,
    output_dir: Path,
    output_stem: str,
) -> str:
    page = reader.pages[page_number - 1]
    key = "/" + xobject_name.removeprefix("/")
    xobject = page["/Resources"]["/XObject"][key].get_object()
    filters = xobject.get("/Filter")
    filter_names = (
        [str(item) for item in filters]
        if isinstance(filters, ArrayObject)
        else [str(filters)]
    )
    output_dir.mkdir(parents=True, exist_ok=True)
    if "/DCTDecode" in filter_names:
        filename = output_stem + ".jpg"
        (output_dir / filename).write_bytes(xobject.get_data())
        return filename

    image_file = page.images[key]
    suffix = Path(image_file.name).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".gif", ".svg"}:
        filename = output_stem + suffix
        (output_dir / filename).write_bytes(image_file.data)
        return filename

    filename = output_stem + ".png"
    image_file.image.save(output_dir / filename, format="PNG")
    return filename


def normalize_pdf_text(text: str) -> str:
    text = unicodedata.normalize("NFC", text)
    text = text.replace("\u00ad", "").replace("\uf0b7", "•")
    text = text.replace("\u0000", "□")
    return re.sub(r"\s+", " ", text).strip()


class TaggedPdfRenderer:
    def __init__(self, pdf: Path, media_dir: Path):
        self.pdf = pdf
        self.reader = PdfReader(pdf)
        self.text_by_page, self.images_by_page, self.anomalies = page_content_maps(pdf)
        self.media_dir = media_dir
        self.page_numbers = {
            page.indirect_reference.idnum: index + 1
            for index, page in enumerate(self.reader.pages)
        }
        root = resolved(self.reader.trailer["/Root"]["/StructTreeRoot"])
        self.role_map = {
            pdf_name(key): pdf_name(value)
            for key, value in (root.get("/RoleMap") or {}).items()
        }
        self.figure_files: dict[tuple[int, int], str] = {}
        self.figure_cursor: Counter[int] = Counter()
        self.referenced_mcids: set[tuple[int, int]] = set()
        self._extract_figure_files(root)
        self.root = root

    def page_number_for(self, value: Any, inherited: int | None) -> int | None:
        if isinstance(value, IndirectObject):
            return self.page_numbers.get(value.idnum, inherited)
        return inherited

    def children(self, node: DictionaryObject) -> list[Any]:
        kids = resolved(node.get("/K"))
        if kids is None:
            return []
        if isinstance(kids, ArrayObject):
            return list(kids)
        return [kids]

    def scan_figures(
        self,
        value: Any,
        inherited_page: int | None = None,
        counts: Counter[int] | None = None,
    ) -> Counter[int]:
        if counts is None:
            counts = Counter()
        value = resolved(value)
        if isinstance(value, ArrayObject):
            for child in value:
                self.scan_figures(child, inherited_page, counts)
            return counts
        if not isinstance(value, DictionaryObject):
            return counts
        page = self.page_number_for(value.get("/Pg"), inherited_page)
        if pdf_name(value.get("/S")) == "Figure" and page is not None:
            counts[page] += 1
        for child in self.children(value):
            self.scan_figures(child, page, counts)
        return counts

    def _extract_figure_files(self, root: DictionaryObject) -> None:
        expected = self.scan_figures(root)
        actual = {
            page: sum(len(items) for items in page_images.values())
            for page, page_images in self.images_by_page.items()
        }
        mismatches = {
            page: (expected[page], actual.get(page, 0))
            for page in sorted(set(expected) | set(actual))
            if expected[page] != actual.get(page, 0)
        }
        if mismatches:
            raise ValueError(f"{self.pdf.name}: figure/image mismatch: {mismatches}")

        for page_number, mcid_map in self.images_by_page.items():
            serial = 0
            for mcid in sorted(mcid_map):
                for record in mcid_map[mcid]:
                    serial += 1
                    stem = f"p{page_number:04d}-figure-{serial:03d}"
                    filename = extract_tagged_image(
                        self.reader,
                        page_number,
                        record["name"],
                        self.media_dir,
                        stem,
                    )
                    self.figure_files[(page_number, serial)] = filename

    def collect_text(self, value: Any, inherited_page: int | None = None) -> str:
        value = resolved(value)
        if isinstance(value, NumberObject):
            if inherited_page is None:
                return ""
            mcid = int(value)
            self.referenced_mcids.add((inherited_page, mcid))
            return self.text_by_page.get(inherited_page, {}).get(mcid, "")
        if isinstance(value, ArrayObject):
            return "".join(self.collect_text(child, inherited_page) for child in value)
        if not isinstance(value, DictionaryObject):
            return ""
        page = self.page_number_for(value.get("/Pg"), inherited_page)
        if "/MCID" in value:
            mcid = int(value["/MCID"])
            if page is None:
                return ""
            self.referenced_mcids.add((page, mcid))
            return self.text_by_page.get(page, {}).get(mcid, "")
        if pdf_name(value.get("/S")) == "Figure":
            return ""
        return "".join(self.collect_text(child, page) for child in self.children(value))

    def render_children(
        self, node: DictionaryObject, page: int | None
    ) -> str:
        return "".join(self.render(child, page) for child in self.children(node))

    def render(self, value: Any, inherited_page: int | None = None) -> str:
        value = resolved(value)
        if isinstance(value, ArrayObject):
            return "".join(self.render(child, inherited_page) for child in value)
        if isinstance(value, NumberObject):
            text = normalize_pdf_text(self.collect_text(value, inherited_page))
            return html.escape(text)
        if not isinstance(value, DictionaryObject):
            return ""

        page = self.page_number_for(value.get("/Pg"), inherited_page)
        raw_role = pdf_name(value.get("/S")) or "Root"
        standard_role = self.role_map.get(raw_role, raw_role)
        css_class = re.sub(r"[^a-z0-9_-]+", "-", raw_role.lower()).strip("-")

        if raw_role == "Figure":
            if page is None:
                raise ValueError("Figure without page")
            self.figure_cursor[page] += 1
            serial = self.figure_cursor[page]
            filename = self.figure_files[(page, serial)]
            alt = normalize_pdf_text(str(value.get("/Alt") or ""))
            return (
                f'<figure><img src="media/{html.escape(filename)}" '
                f'alt="{html.escape(alt, quote=True)}"/></figure>\n'
            )

        if raw_role in {"Document", "Part", "Art", "Sect", "Div", "Root"}:
            return self.render_children(value, page)

        heading_match = re.fullmatch(r"H([1-6])", standard_role or "")
        if heading_match:
            level = heading_match.group(1)
            text = normalize_pdf_text(self.collect_text(value, page))
            return f"<h{level}>{html.escape(text)}</h{level}>\n" if text else ""
        if raw_role == "Title":
            text = normalize_pdf_text(self.collect_text(value, page))
            return f"<h1>{html.escape(text)}</h1>\n" if text else ""
        if raw_role == "Subtitle":
            text = normalize_pdf_text(self.collect_text(value, page))
            return f"<h2>{html.escape(text)}</h2>\n" if text else ""

        if standard_role == "Table" or raw_role == "Table":
            return f"<table>{self.render_children(value, page)}</table>\n"
        if standard_role == "TR" or raw_role == "TR":
            return f"<tr>{self.render_children(value, page)}</tr>\n"
        if standard_role in {"TH", "TD"} or raw_role in {"TH", "TD"}:
            tag = "th" if (standard_role == "TH" or raw_role == "TH") else "td"
            content = self.render_children(value, page)
            if not content.strip():
                content = html.escape(
                    normalize_pdf_text(self.collect_text(value, page))
                )
            return f"<{tag}>{content}</{tag}>\n"

        if standard_role == "L" or raw_role == "L":
            return f"<ul>{self.render_children(value, page)}</ul>\n"
        if standard_role == "LI" or raw_role == "LI":
            text = normalize_pdf_text(self.collect_text(value, page))
            return f"<li>{html.escape(text)}</li>\n" if text else ""

        text = normalize_pdf_text(self.collect_text(value, page))
        if not text:
            return self.render_children(value, page)
        if standard_role == "Note" or raw_role == "Note":
            return f'<aside class="{css_class}">{html.escape(text)}</aside>\n'
        if standard_role == "Quote" or raw_role == "Quotation":
            return f'<blockquote class="{css_class}">{html.escape(text)}</blockquote>\n'
        if standard_role == "Code":
            return f"<pre><code>{html.escape(text)}</code></pre>\n"
        if raw_role == "Figure Caption":
            return f'<p class="figure-caption">{html.escape(text)}</p>\n'
        if raw_role == "Source Page":
            return f'<p class="source-page">{html.escape(text)}</p>\n'
        return f'<p class="{css_class}">{html.escape(text)}</p>\n'

    def render_document(self) -> str:
        body = self.render(self.root)
        actual_mcids = {
            (page, mcid)
            for page, content in self.text_by_page.items()
            for mcid in content
        } | {
            (page, mcid)
            for page, content in self.images_by_page.items()
            for mcid in content
        }
        missing = self.referenced_mcids - actual_mcids
        if missing:
            raise ValueError(f"{self.pdf.name}: missing tagged content {sorted(missing)}")
        return body


@dataclass
class StructNode:
    role: str
    alt: str = ""
    children: list[Any] = field(default_factory=list)


def parse_poppler_structure(output: str) -> StructNode:
    """Parse ``pdfinfo -struct-text`` into a small semantic tree.

    Poppler supplements the explicit PDF structure tree with marked-content
    fragments that are visually part of a tagged block but are omitted from
    that block's ``/K`` array. Those fragments include meaningful numerals,
    Latin text, punctuation, and diacritics in the Tribes volumes, so this
    complete output is the text authority for tagged-PDF conversions.
    """

    dummy = StructNode("Root")
    stack: list[tuple[int, StructNode]] = [(-1, dummy)]
    node_pattern = re.compile(
        r'(.+?)(?: \((?:block|inline)\))?(?: \[("(?:\\.|[^"\\])*")\])?:?$'
    )

    for line_number, line in enumerate(output.splitlines(), start=1):
        if not line.strip():
            continue
        indent = len(line) - len(line.lstrip(" "))
        value = line.strip()
        if value.startswith("/"):
            continue

        while stack[-1][0] >= indent:
            stack.pop()

        if value.startswith('"'):
            try:
                text_value = json.loads(value)
            except json.JSONDecodeError as error:
                raise ValueError(
                    f"Could not decode pdfinfo text at line {line_number}: {value}"
                ) from error
            stack[-1][1].children.append(text_value)
            continue

        match = node_pattern.fullmatch(value)
        if not match:
            raise ValueError(
                f"Could not parse pdfinfo structure at line {line_number}: {value}"
            )
        alt = json.loads(match.group(2)) if match.group(2) else ""
        node = StructNode(match.group(1), alt=alt)
        stack[-1][1].children.append(node)
        stack.append((indent, node))

    if len(dummy.children) != 1 or not isinstance(dummy.children[0], StructNode):
        raise ValueError("pdfinfo structure output did not contain one document root")
    return dummy.children[0]


class PopplerStructRenderer:
    """Render Poppler's complete tagged text and pair figures with PDF images."""

    def __init__(
        self,
        root: StructNode,
        figures: list[tuple[str, str]],
    ):
        self.root = root
        self.figures = figures
        self.figure_cursor = 0
        self.roles: Counter[str] = Counter()
        self.source_text: list[str] = []

    def collect_text(self, value: Any, *, include_labels: bool = True) -> str:
        if isinstance(value, str):
            self.source_text.append(value)
            return value
        if value.role == "Figure":
            return ""
        if value.role == "Lbl" and not include_labels:
            return ""
        return "".join(
            self.collect_text(child, include_labels=include_labels)
            for child in value.children
        )

    def contains_figure(self, value: Any) -> bool:
        if isinstance(value, str):
            return False
        return value.role == "Figure" or any(
            self.contains_figure(child) for child in value.children
        )

    def render_figure(self, value: StructNode) -> str:
        if self.figure_cursor >= len(self.figures):
            raise ValueError("pdfinfo contained more figures than the PDF image map")
        filename, tagged_alt = self.figures[self.figure_cursor]
        self.figure_cursor += 1
        alt = normalize_pdf_text(value.alt or tagged_alt)
        if not alt:
            raise ValueError(f"Figure {self.figure_cursor} has no alternative text")
        return (
            f'<figure><img src="media/{html.escape(filename, quote=True)}" '
            f'alt="{html.escape(alt, quote=True)}"/></figure>\n'
        )

    def render_paragraph(self, value: StructNode) -> str:
        if not self.contains_figure(value):
            text = normalize_pdf_text(self.collect_text(value))
            return f"<p>{html.escape(text)}</p>\n" if text else ""

        parts: list[str] = []
        buffered: list[Any] = []

        def flush() -> None:
            text = normalize_pdf_text(
                "".join(self.collect_text(child) for child in buffered)
            )
            if text:
                parts.append(f"<p>{html.escape(text)}</p>\n")
            buffered.clear()

        for child in value.children:
            if isinstance(child, StructNode) and self.contains_figure(child):
                flush()
                parts.append(self.render(child))
            else:
                buffered.append(child)
        flush()
        return "".join(parts)

    def render_layout_table(self, value: Any) -> str:
        """Flatten PDF layout tables while keeping their figures and captions."""
        if isinstance(value, str):
            self.source_text.append(value)
            return html.escape(value)
        if value.role in {"Table", "TR", "TH", "TD"}:
            return "".join(
                self.render_layout_table(child) for child in value.children
            )
        return self.render(value)

    def render(self, value: Any) -> str:
        if isinstance(value, str):
            self.source_text.append(value)
            return html.escape(value)

        role = value.role
        self.roles[role] += 1
        if role == "Figure":
            return self.render_figure(value)
        if re.fullmatch(r"H[1-6]", role):
            text = normalize_pdf_text(self.collect_text(value))
            level = role[1]
            return f"<h{level}>{html.escape(text)}</h{level}>\n" if text else ""
        if role == "P":
            return self.render_paragraph(value)
        if role == "Table" and self.contains_figure(value):
            return self.render_layout_table(value)
        if role == "Table":
            return f"<table>{''.join(self.render(child) for child in value.children)}</table>\n"
        if role == "TR":
            return f"<tr>{''.join(self.render(child) for child in value.children)}</tr>\n"
        if role in {"TH", "TD"}:
            tag = role.lower()
            content = "".join(self.render(child) for child in value.children)
            if not content.strip():
                text = normalize_pdf_text(self.collect_text(value))
                content = html.escape(text)
            return f"<{tag}>{content}</{tag}>\n"
        if role == "L":
            return f"<ul>{''.join(self.render(child) for child in value.children)}</ul>\n"
        if role == "LI":
            body = "".join(
                self.render(child)
                for child in value.children
                if not (isinstance(child, StructNode) and child.role == "Lbl")
            )
            return f"<li>{body}</li>\n"
        if role == "Lbl":
            # The list container already supplies the marker.
            self.collect_text(value)
            return ""
        if role == "LBody":
            return "".join(self.render(child) for child in value.children)
        if role == "Note":
            text = normalize_pdf_text(self.collect_text(value))
            return f'<aside class="note">{html.escape(text)}</aside>\n' if text else ""
        if role in {"Span", "Document", "Part", "Art", "Sect", "Div", "Root"}:
            return "".join(self.render(child) for child in value.children)

        # Unknown roles remain as transparent containers so their content is
        # retained. The role count is exposed to the post-build audit.
        return "".join(self.render(child) for child in value.children)

    def render_document(self) -> str:
        body = self.render(self.root)
        if self.figure_cursor != len(self.figures):
            raise ValueError(
                f"Used {self.figure_cursor} of {len(self.figures)} tagged figures"
            )
        return body


def tagged_figure_sequence(renderer: TaggedPdfRenderer) -> list[tuple[str, str]]:
    counters: Counter[int] = Counter()
    figures: list[tuple[str, str]] = []

    def walk(value: Any, inherited_page: int | None = None) -> None:
        value = resolved(value)
        if isinstance(value, ArrayObject):
            for child in value:
                walk(child, inherited_page)
            return
        if not isinstance(value, DictionaryObject):
            return
        page = renderer.page_number_for(value.get("/Pg"), inherited_page)
        if pdf_name(value.get("/S")) == "Figure":
            if page is None:
                raise ValueError("Figure without page")
            counters[page] += 1
            filename = renderer.figure_files[(page, counters[page])]
            alt = normalize_pdf_text(str(value.get("/Alt") or ""))
            figures.append((filename, alt))
            return
        for child in renderer.children(value):
            walk(child, page)

    walk(renderer.root)
    return figures


def html_document(title: str, body: str) -> str:
    return (
        "<!doctype html>\n"
        '<html lang="ja"><head><meta charset="utf-8">'
        f"<title>{html.escape(title)}</title></head><body>"
        f"{body}</body></html>\n"
    )


def render_tagged_pdf_html(pdf: Path, item: dict[str, Any], directory: Path) -> Path:
    media = directory / "media"
    pdf_renderer = TaggedPdfRenderer(pdf, media)
    figures = tagged_figure_sequence(pdf_renderer)
    fallback_alts = TAGGED_PDF_FIGURE_ALTS.get(item["slug"], [])
    figures = [
        (
            filename,
            alt
            or (
                fallback_alts[index]
                if index < len(fallback_alts)
                else ""
            ),
        )
        for index, (filename, alt) in enumerate(figures)
    ]
    structured = run(["pdfinfo", "-struct-text", str(pdf)])
    root = parse_poppler_structure(structured.stdout)
    renderer = PopplerStructRenderer(root, figures)
    body = renderer.render_document()
    output = directory / "document.html"
    output.write_text(html_document(item["title"], body), encoding="utf-8")
    print(
        f"{item['slug']}: complete Poppler structure, "
        f"{renderer.figure_cursor} figures, "
        f"{renderer.roles['Table']} tables"
    )
    return output


def join_stoll_lines(left: str, right: str) -> str:
    """Join PDF visual lines without inserting spaces into Japanese prose."""
    left = left.rstrip()
    right = right.lstrip()
    if not left:
        return right
    if not right:
        return left
    if left.endswith("-"):
        return left + right
    left_token = re.search(r"([A-Za-zÀ-ÖØ-öø-ÿ0-9]+)$", left)
    right_token = re.match(r"([A-Za-zÀ-ÖØ-öø-ÿ0-9]+)", right)
    if left_token and right_token:
        if len(left_token.group(1)) == 1:
            return left + right
        return left + " " + right
    return left + right


def stoll_image_alt(item: dict[str, Any], page_number: int, page_text: str) -> str:
    title_pages = {
        "stoll-ethnographie-guatemala-1884": {
            3: "1884年初版『グアテマラ共和国民族誌論』原刊標題紙",
        },
        "stoll-ixil-language-1887": {
            3: "1887年初版『イシル人の言語』原刊標題紙",
        },
        "stoll-pokom-languages-1888-1896": {
            3: "1888年刊『ポコム語群のマヤ諸語』第一部原刊標題紙",
            336: "1896年刊『ポコム語群のマヤ諸語』第二部原刊標題紙",
        },
    }
    if page_number in title_pages.get(item["slug"], {}):
        return title_pages[item["slug"]][page_number]
    source_page = re.search(r"〔原刊\s*p\.\s*([^〕]+)〕", page_text)
    if source_page:
        return f"原刊{source_page.group(1)}頁の比較語彙表・原資料画像"
    heading = next(
        (
            part.strip()
            for part in page_text.splitlines()
            if part.strip().startswith(("付図", "図"))
        ),
        "",
    )
    return heading or f"{item['title']} PDF {page_number}頁の原資料画像"


def render_stoll_pdf_html(pdf: Path, item: dict[str, Any], directory: Path) -> Path:
    """Recover reflow text and every embedded source image from a final PDF.

    The three Stoll PDFs are the approved tagged publication files, but one of
    their structure trees is cyclic.  Visual-line recovery avoids dropping text
    while retaining the exact embedded title leaves, comparative tables, and
    appended figures in PDF reading order.
    """
    media = directory / "media"
    media.mkdir(parents=True, exist_ok=True)
    document = fitz.open(pdf)
    body: list[str] = []
    image_count = 0
    heading_serial = 0

    for page_number, page in enumerate(document, start=1):
        page_dict = page.get_text("dict", sort=True)
        lines: list[dict[str, Any]] = []
        images: list[tuple[float, dict[str, Any]]] = []
        raw_page_text: list[str] = []

        for block in page_dict.get("blocks", []):
            if block.get("type") == 1:
                images.append((float(block["bbox"][1]), block))
                continue
            for line in block.get("lines", []):
                spans = [span for span in line.get("spans", []) if span.get("text")]
                if not spans:
                    continue
                text = "".join(span["text"] for span in spans).strip()
                if not text:
                    continue
                bbox = line["bbox"]
                lines.append(
                    {
                        "y0": float(bbox[1]),
                        "y1": float(bbox[3]),
                        "x0": float(bbox[0]),
                        "x1": float(bbox[2]),
                        "text": text,
                        "size": max(float(span.get("size", 0)) for span in spans),
                        "bold": any("Bold" in span.get("font", "") for span in spans),
                    }
                )
                raw_page_text.append(text)

        # Merge fragments that occupy the same visual baseline.  Wide gaps are
        # explicit cell separators, so vocabulary tables remain intelligible.
        merged: list[dict[str, Any]] = []
        for line in sorted(lines, key=lambda row: (row["y0"], row["x0"])):
            if merged and abs(line["y0"] - merged[-1]["y0"]) <= 2.0:
                previous = merged[-1]
                gap = line["x0"] - previous["x1"]
                separator = " ｜ " if gap > 18 else ""
                previous["text"] += separator + line["text"]
                previous["x1"] = max(previous["x1"], line["x1"])
                previous["y1"] = max(previous["y1"], line["y1"])
                previous["size"] = max(previous["size"], line["size"])
                previous["bold"] = previous["bold"] or line["bold"]
            else:
                merged.append(dict(line))

        elements: list[tuple[float, str, dict[str, Any] | None]] = []
        for line in merged:
            text = normalize_pdf_text(line["text"])
            height = float(page.rect.height)
            if line["y1"] <= 61 and "オットー・シュトル" in text:
                continue
            if line["y0"] >= height * 0.91 and re.fullmatch(r"[0-9IVXLCDM\s–—-]+", text):
                continue
            elements.append((line["y0"], "text", {**line, "text": text}))
        elements.extend((y0, "image", block) for y0, block in images)
        elements.sort(key=lambda value: value[0])

        page_text = "\n".join(raw_page_text)
        body.append(f'<section class="pdf-page" data-pdf-page="{page_number}">\n')
        pending: dict[str, Any] | None = None

        def flush_pending() -> None:
            nonlocal pending
            if not pending:
                return
            escaped = html.escape(pending["text"])
            body.append(f'<p class="{pending["class"]}">{escaped}</p>\n')
            pending = None

        for _position, kind, record in elements:
            if kind == "image":
                flush_pending()
                assert record is not None
                image_count += 1
                extension = str(record.get("ext") or "png").lower()
                if extension == "jpeg":
                    extension = "jpg"
                filename = f"p{page_number:04d}-image-{image_count:03d}.{extension}"
                (media / filename).write_bytes(record["image"])
                alt = stoll_image_alt(item, page_number, page_text)
                body.append(
                    f'<figure><img src="media/{filename}" '
                    f'alt="{html.escape(alt, quote=True)}"/></figure>\n'
                )
                continue

            assert record is not None
            text = record["text"]
            size = record["size"]
            is_source = bool(re.match(r"^[〔【]原刊", text))
            is_table = " ｜ " in text
            is_heading = size >= 14 or (
                record["bold"] and size >= 11.5 and len(text) <= 100
            )
            if is_source:
                flush_pending()
                body.append(f'<p class="source-page">{html.escape(text)}</p>\n')
                continue
            if is_heading:
                flush_pending()
                level = 1 if size >= 22 else (2 if size >= 14 else 3)
                heading_serial += 1
                body.append(
                    f'<h{level} id="stoll-heading-{heading_serial:05d}">'
                    f"{html.escape(text)}</h{level}>\n"
                )
                continue
            if is_table:
                flush_pending()
                body.append(f'<p class="table-row">{html.escape(text)}</p>\n')
                continue

            css_class = "note" if size <= 9.0 else "body"
            if (
                pending
                and pending["class"] == css_class
                and record["y0"] - pending["y1"] <= 15
                and abs(record["x0"] - pending["x0"]) <= 25
            ):
                pending["text"] = join_stoll_lines(pending["text"], text)
                pending["y1"] = record["y1"]
            else:
                flush_pending()
                pending = {
                    "text": text,
                    "class": css_class,
                    "x0": record["x0"],
                    "y1": record["y1"],
                }
        flush_pending()
        body.append("</section>\n")

    document.close()
    expected_images = int(item.get("figureCount", 0)) + int(item.get("plateCount", 0))
    if image_count != expected_images:
        raise ValueError(
            f"{item['slug']}: recovered {image_count} images, expected {expected_images}"
        )
    output = directory / "document.html"
    output.write_text(html_document(item["title"], "".join(body)), encoding="utf-8")
    print(
        f"{item['slug']}: visual-line PDF recovery, "
        f"{len(document) if not document.is_closed else item['pageCount']} pages, "
        f"{image_count} images"
    )
    return output


def block_text(block: dict[str, Any]) -> tuple[str, float, bool]:
    lines: list[str] = []
    sizes: list[float] = []
    bold = False
    for line in block.get("lines", []):
        line_text = ""
        for span in line.get("spans", []):
            line_text += span.get("text", "")
            sizes.extend([float(span.get("size", 0))] * max(1, len(span.get("text", ""))))
            bold = bold or "Bold" in span.get("font", "")
        if line_text.strip():
            lines.append(line_text.strip())
    text = "\n".join(lines).strip()
    for wrong, right in SAPPER_GLYPH_REPAIRS.items():
        text = text.replace(wrong, right)
    text = text.replace("\uf0b7", "•")
    size = max(sizes) if sizes else 0
    return text, size, bold


def render_sapper_html(pdf: Path, item: dict[str, Any], directory: Path) -> Path:
    document = fitz.open(pdf)
    parts: list[str] = []
    running_header = re.compile(r"カール・ザッパー.*東部ラカンドン人")
    # Pages 1–5 contain the Japanese translation. Page 6 is a visual-only
    # section divider for the facsimiles, so recreating its text would duplicate
    # the semantic heading added below.
    for page_index in range(5):
        page = document[page_index]
        blocks = sorted(
            (block for block in page.get_text("dict", sort=True)["blocks"] if block["type"] == 0),
            key=lambda block: (block["bbox"][1], block["bbox"][0]),
        )
        for block in blocks:
            text, size, bold = block_text(block)
            if not text:
                continue
            y0, y1 = block["bbox"][1], block["bbox"][3]
            if page_index > 0 and y0 < 70 and running_header.search(text):
                continue
            if y1 > page.rect.height - 38 and re.fullmatch(r"[—\-\s]*\d+[—\-\s]*", text):
                continue
            cleaned = normalize_pdf_text(text)
            if not cleaned:
                continue
            if size >= 20:
                parts.append(f"<h1>{html.escape(cleaned)}</h1>")
            elif size >= 14:
                parts.append(f"<h2>{html.escape(cleaned)}</h2>")
            elif size >= 11 and bold:
                parts.append(f"<h3>{html.escape(cleaned)}</h3>")
            else:
                parts.append(f"<p>{html.escape(cleaned)}</p>")

    media = directory / "media"
    media.mkdir(parents=True, exist_ok=True)
    parts.append("<h1>原誌ファクシミリ</h1>")
    for offset, page_index in enumerate(range(6, 10), start=892):
        page = document[page_index]
        pixmap = page.get_pixmap(matrix=fitz.Matrix(2.2, 2.2), alpha=False)
        image = Image.open(io.BytesIO(pixmap.tobytes("png")))
        filename = f"original-{offset}.jpg"
        flatten_transparency(image).save(
            media / filename,
            "JPEG",
            quality=86,
            optimize=True,
            progressive=True,
        )
        parts.append(
            f'<figure><img src="media/{filename}" '
            f'alt="原誌{offset}頁"/><figcaption>原誌{offset}頁</figcaption></figure>'
        )
    output = directory / "document.html"
    output.write_text(
        html_document(item["title"], "\n".join(parts)), encoding="utf-8"
    )
    return output


def find_egan_source(explicit: Path | None) -> Path:
    if explicit:
        return explicit
    published_source = EPUB_SOURCES / f"{EGAN_SLUG}.md"
    if published_source.is_file():
        return published_source
    candidates = sorted((WORK / EGAN_SLUG).glob("*"))
    candidates = [
        path for path in candidates if path.suffix.lower() in {".md", ".markdown", ".html"}
    ]
    if len(candidates) != 1:
        raise FileNotFoundError(
            "Expected one corrected Egan OCR Markdown/HTML file under "
            f"{WORK / EGAN_SLUG}; pass --egan-source explicitly."
        )
    return candidates[0]


def extract_full_page_image(
    document: fitz.Document,
    page_index: int,
    output: Path,
    *,
    max_px: int = 2200,
) -> None:
    page = document[page_index]
    images = page.get_images(full=True)
    if len(images) == 1 and page.rotation == 0:
        payload = document.extract_image(images[0][0])["image"]
        image = Image.open(io.BytesIO(payload))
    else:
        # Rotated pages can also position the image through the page content
        # matrix. Rendering preserves the complete displayed page geometry;
        # rotating the extracted image stream alone does not.
        pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        image = Image.open(io.BytesIO(pixmap.tobytes("png")))
    image = ImageOps.exif_transpose(image)
    if max(image.size) > max_px:
        scale = max_px / max(image.size)
        image = image.resize(
            (round(image.width * scale), round(image.height * scale)),
            Image.Resampling.LANCZOS,
        )
    flatten_transparency(image).save(
        output,
        "JPEG",
        quality=84,
        optimize=True,
        progressive=True,
    )


def build_egan_markdown(
    pdf: Path,
    corrected_source: Path,
    directory: Path,
) -> Path:
    source_text = corrected_source.read_text(encoding="utf-8")
    media = directory / "media"
    media.mkdir(parents=True, exist_ok=True)
    document = fitz.open(pdf)

    include_pattern = re.compile(
        r"<!--\s*INCLUDE_PAGE_IMAGE:\s*(\d+)(?:;\s*reason=([^>]+))?\s*-->"
    )

    def include_translation_visual(match: re.Match[str]) -> str:
        page_number = int(match.group(1))
        reason = (match.group(2) or "図表").strip()
        reason = {
            "map": "地図",
            "table": "表",
            "diagram": "構造図",
            "illustration": "遺物図",
        }.get(reason, reason)
        if not 1 <= page_number <= 93:
            raise ValueError(f"Invalid Egan translation page marker: {page_number}")
        filename = f"translation-visual-p{page_number:03d}.jpg"
        extract_full_page_image(document, page_number - 1, media / filename)
        return (
            f'\n<figure><img src="media/{filename}" '
            f'alt="訳文PDF {page_number}頁の{html.escape(reason, quote=True)}"/>'
            f"<figcaption>訳文PDF {page_number}頁：{html.escape(reason)}</figcaption>"
            "</figure>\n"
        )

    source_text = include_pattern.sub(include_translation_visual, source_text)
    lines = [
        source_text.rstrip(),
        "",
        "# 原資料ファクシミリ",
        "",
        "原資料107画像頁を、紙葉全体が分かる形で収録する。",
        "",
    ]
    for source_page, page_index in enumerate(range(94, 201), start=1):
        filename = f"source-{source_page:03d}.jpg"
        extract_full_page_image(document, page_index, media / filename)
        lines.extend(
            [
                f"## 原資料画像頁 {source_page} {{.unnumbered .unlisted}}",
                "",
                f'<figure><img src="media/{filename}" '
                f'alt="原資料画像頁 {source_page}"/>'
                f"<figcaption>原資料画像頁 {source_page}</figcaption></figure>",
                "",
            ]
        )
    output = directory / "document.md"
    output.write_text("\n".join(lines), encoding="utf-8")
    return output


def build_one(
    item: dict[str, Any],
    *,
    egan_source: Path | None = None,
) -> Path:
    slug = item["slug"]
    destination = STATIC / epub_relative_path(item)
    with tempfile.TemporaryDirectory(prefix=f"archive-epub-{slug}-") as tmp:
        directory = Path(tmp)
        raw_epub = directory / "raw.epub"

        if slug in DOCX_SOURCES:
            source = DOCX_SOURCES[slug]
            if not source.exists():
                raise FileNotFoundError(f"Missing DOCX source for {slug}: {source}")
            pandoc_to_epub(source, raw_epub, item, from_format="docx+styles")
        elif slug in MARKDOWN_SOURCES:
            source = MARKDOWN_SOURCES[slug]
            if not source.exists():
                raise FileNotFoundError(
                    f"Missing Markdown source for {slug}: {source}"
                )
            pandoc_to_epub(
                source,
                raw_epub,
                item,
                from_format="markdown+raw_html+east_asian_line_breaks",
                resource_path=source.parent,
            )
        elif slug in STOLL_PDF_SOURCES:
            source = render_stoll_pdf_html(pdf_path(item), item, directory)
            pandoc_to_epub(
                source,
                raw_epub,
                item,
                from_format="html+raw_html",
                resource_path=directory,
            )
        elif slug in TAGGED_PDF_SOURCES:
            source = render_tagged_pdf_html(pdf_path(item), item, directory)
            pandoc_to_epub(
                source,
                raw_epub,
                item,
                from_format="html+raw_html",
                resource_path=directory,
            )
        elif slug == SAPPER_SLUG:
            source = render_sapper_html(pdf_path(item), item, directory)
            pandoc_to_epub(
                source,
                raw_epub,
                item,
                from_format="html+raw_html",
                resource_path=directory,
            )
        elif slug == EGAN_SLUG:
            source = build_egan_markdown(
                pdf_path(item),
                find_egan_source(egan_source),
                directory,
            )
            pandoc_to_epub(
                source,
                raw_epub,
                item,
                from_format="markdown+raw_html+east_asian_line_breaks",
                resource_path=directory,
            )
        else:
            raise ValueError(f"No EPUB source route configured for {slug}")

        destination.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(
            prefix=f".{destination.name}.",
            suffix=".tmp",
            dir=destination.parent,
            delete=False,
        ) as handle:
            candidate = Path(handle.name)
        try:
            optimize_epub(raw_epub, candidate)
            if item.get("recordClass") == "short-work":
                remove_book_front_matter_from_short_work_spine(candidate)
            validate_epub(candidate)
            candidate.replace(destination)
        finally:
            candidate.unlink(missing_ok=True)
    print(f"Built {destination.relative_to(ROOT)} ({destination.stat().st_size:,} bytes)")
    return destination


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--slug",
        action="append",
        help="Build only this publication slug; may be repeated.",
    )
    parser.add_argument(
        "--egan-source",
        type=Path,
        help="Corrected reflow Markdown/HTML for Egan-Wyer pages 1–93.",
    )
    parser.add_argument(
        "--repair-existing",
        action="store_true",
        help="Rebuild navigation for existing EPUBs without rebuilding content.",
    )
    args = parser.parse_args()

    catalogue = load_catalogue()
    selected = set(args.slug or [])
    if selected:
        unknown = selected - {item["slug"] for item in catalogue}
        if unknown:
            raise SystemExit(f"Unknown publication slug(s): {', '.join(sorted(unknown))}")
        catalogue = [item for item in catalogue if item["slug"] in selected]

    for item in catalogue:
        if args.repair_existing:
            destination = STATIC / epub_relative_path(item)
            if not destination.exists():
                raise FileNotFoundError(f"Missing EPUB to repair: {destination}")
            repair_existing_epub(destination)
        else:
            build_one(item, egan_source=args.egan_source)


if __name__ == "__main__":
    main()
