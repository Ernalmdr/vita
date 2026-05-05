import fitz

pdf_path = r"C:\Users\ernal\Downloads\Vita Cordis 2026 Sessions and Panels.pdf"
doc = fitz.open(pdf_path)
text = ""
for page in doc:
    text += page.get_text()

with open("pdf_text.txt", "w", encoding="utf-8") as f:
    f.write(text)

print("Extraction complete. Output written to pdf_text.txt")
