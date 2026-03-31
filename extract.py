import sys
try:
    import pypdf
except ImportError:
    print("Oops, pypdf still not found.")
    sys.exit(1)

def extract_pdf_lines(pdf_path):
    import pypdf
    text = ""
    with open(pdf_path, "rb") as file:
        reader = pypdf.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    
    with open("pdf_content.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("PDF content written to pdf_content.txt")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        extract_pdf_lines(sys.argv[1])
    else:
        print("Please provide a PDF path.")
