"""Combine completed, reviewed drafts; refuse partial catalogue coverage."""

import collections
import json
import pathlib
import re

root = pathlib.Path(__file__).resolve().parents[1]
catalogue = json.loads((root.parent / "catalogue.json").read_text())
required = [volume["slug"] for work in catalogue for volume in work["volumes"]]
records = {}
owners = {}
for name in ["drafts.json", *[f"agent-{index}.json" for index in range(1, 7)]]:
    drafts = json.loads((root / "detailed-summary-work" / name).read_text())["records"]
    for slug, text in drafts.items():
        assert slug not in records, ("duplicate slug", slug, name, owners.get(slug))
        assert isinstance(text, str), (slug, "text required")
        assert text.strip() and len(text) <= 1000, (slug, "total characters", len(text))
        assert text == text.strip(), (slug, "outer whitespace")
        records[slug] = text
        owners[slug] = name

assert set(records) == set(required), {
    "missing": sorted(set(required) - set(records)),
    "unknown": sorted(set(records) - set(required)),
}
assert len(set(records.values())) == len(records), "Duplicate complete summaries"

sentences = collections.defaultdict(set)
for slug, text in records.items():
    for sentence in re.split(r"(?<=。)", text):
        sentence = sentence.strip()
        if len(sentence) > 45:
            sentences[sentence].add(slug)
repeated = [{"sentence": sentence, "slugs": sorted(slugs)} for sentence, slugs in sentences.items() if len(slugs) > 1]
production_notes = [
    {"slug": slug, "sentence": sentence.strip()}
    for slug, text in records.items()
    for sentence in re.split(r"(?<=。)", text)
    if re.search(r"原刊頁標識|位置標識|品質管理|翻訳作業|訳文には|レビュー|組版|母版|フォント", sentence)
]
assert not repeated, ("repeated sentences need review", repeated)
assert not production_notes, ("production notes need removal", production_notes)

ordered = {slug: records[slug] for slug in required}
(root / "src/publication-overviews.json").write_text(
    json.dumps({"updatedDate": "2026-10-16", "records": ordered}, ensure_ascii=False, indent=2) + "\n"
)
report = {
    "bibliographyPages": len(catalogue),
    "individualOverviews": len(ordered),
    "multiVolumeWorks": sum(len(work["volumes"]) > 1 for work in catalogue),
    "minimumCharacters": min(map(len, ordered.values())),
    "maximumCharacters": max(map(len, ordered.values())),
    "averageCharacters": round(sum(map(len, ordered.values())) / len(ordered), 1),
    "duplicateSummaries": 0,
    "repeatedLongSentences": 0,
    "productionNotes": 0,
}
(root / "detailed-summary-work/final-audit.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(json.dumps(report, ensure_ascii=False, indent=2))
