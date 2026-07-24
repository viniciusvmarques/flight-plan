import fitz
import os
import re
import json
from pathlib import Path

ROOT = Path(r"C:/Users/awavi/Desktop/flight-plan/frontend/src/data")
ROOT.mkdir(parents=True, exist_ok=True)

PDFS = [
    r"C:/Users/awavi/Downloads/357136727-Navegacao-PC-IFR-Titus-Roos.pdf",
    r"C:/Users/awavi/Downloads/pdfcoffee.com_navegaao-pp-vfr-titus-roos-pdf-free.pdf",
]

extra = []
for rt in [
    r"C:/Users/awavi/Downloads",
    r"C:/Users/awavi/Desktop",
    r"C:/Users/awavi/Documents",
]:
    p = Path(rt)
    if p.exists():
        for f in p.rglob("*.pdf"):
            if "node_modules" in str(f):
                continue
            if re.search(r"Bianch|bianch|Resumao|Resumão|Computador", f.name, re.I):
                extra.append(str(f))


def headings_from(text):
    hs, seen = [], set()
    for line in text.splitlines():
        s = line.strip()
        if len(s) < 4 or len(s) > 100:
            continue
        ok = (
            re.match(r"^\s*(?:CAP[ÍI]TULO|Cap[íi]tulo)\s*\d+", s, re.I)
            or re.match(r"^\s*\d+(?:\.\d+)*\s+\S", s)
            or (s.isupper() and 8 <= len(s) <= 80)
        )
        if ok and s.lower() not in seen:
            seen.add(s.lower())
            hs.append(s)
        if len(hs) >= 30:
            break
    return hs


def ocr_sample(doc):
    try:
        import pytesseract
        import io
        from PIL import Image
    except Exception as e:
        return "", str(e)
    n = len(doc)
    idx = sorted(
        set(
            list(range(min(12, n)))
            + list(range(max(0, n // 2 - 2), min(n, n // 2 + 3)))
        )
    )
    parts = []
    for i in idx:
        try:
            pix = doc[i].get_pixmap(matrix=fitz.Matrix(2, 2))
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            parts.append(pytesseract.image_to_string(img, lang="por+eng"))
        except Exception as e:
            parts.append("")
            if "tesseract" in str(e).lower() or "not found" in str(e).lower():
                return "\n".join(parts), str(e)
    return "\n".join(parts), None


results = []
for path in list(dict.fromkeys(PDFS + extra)):
    item = {"path": path, "exists": os.path.isfile(path)}
    if not item["exists"]:
        results.append(item)
        continue
    doc = fitz.open(path)
    item["pages"] = len(doc)
    native = "".join(
        (doc[i].get_text("text") or "") for i in range(min(45, len(doc)))
    )
    nc = len(native.strip())
    item["native_chars_45"] = nc
    text = native
    method = "native"
    ocr_note = None
    if nc < 500:
        ot, err = ocr_sample(doc)
        if err:
            method = "ocr_failed"
            ocr_note = err
        elif len(ot.strip()) > nc:
            text = ot
            method = "ocr_sample"
    item["method"] = method
    item["text_extracted"] = len(text.strip()) > 200
    item["ocr_note"] = ocr_note
    if not item["text_extracted"]:
        item["note"] = (
            "PDF appears image-only; OCR did not yield usable text "
            "(install Tesseract OCR with Portuguese)."
        )
    item["headings"] = headings_from(text)
    doc.close()
    results.append(item)

summary = {
    "pdfs": results,
    "bianch_found": any(
        "bianch" in x["path"].lower() for x in results if x.get("exists")
    ),
}
(ROOT / "subagent_result.json").write_text(
    json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
)

lines = [
    "AVIATION NAVIGATION BOOK OUTLINE",
    "",
    "=== PDF INVENTORY ===",
    "",
]
for e in results:
    lines.append("File: " + e["path"])
    if e["exists"]:
        st = "TEXT OK" if e.get("text_extracted") else "IMAGE-ONLY / NO TEXT"
        lines.append(
            "  Exists: True | Pages: %s | Method: %s | Native chars (45p): %s | %s"
            % (e.get("pages"), e.get("method"), e.get("native_chars_45"), st)
        )
        if e.get("note"):
            lines.append("  Note: " + e["note"])
        if e.get("ocr_note"):
            lines.append("  OCR: " + e["ocr_note"])
    else:
        lines.append("  Exists: False")
    lines.append("  Chapter / heading candidates:")
    hs = e.get("headings") or []
    if hs:
        lines += ["    - " + h for h in hs[:40]]
    else:
        lines.append("    (none extractable)")
    lines.append("")
if not summary["bianch_found"]:
    lines += [
        "NOTE: No Bianch PDF found in Downloads/Desktop/Documents.",
        "",
    ]
(ROOT / "nav-book-outline.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False))
