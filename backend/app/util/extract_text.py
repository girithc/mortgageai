import fitz  # PyMuPDF

def extract_text_from_pdf(file_stream) -> str:
    pdf = fitz.open(stream=file_stream.read(), filetype="pdf")
    text = ""
    for page in pdf:
        text += page.get_text()
    return text  # Limit to text[:4000] chars if needed to avoid token limits
