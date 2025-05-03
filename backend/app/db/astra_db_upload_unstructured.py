import os
import tempfile

from langchain_astradb import AstraDBVectorStore
from langchain_core.documents import Document
from langchain_community.document_loaders import unstructured
from langchain_openai import OpenAIEmbeddings
from app.db.config import Config

def handle_file_upload(file, collection_name: str) -> str:
    suffix = os.path.splitext(file.filename)[-1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
        file.save(tmp_file.name)
        tmp_path = tmp_file.name

    try:
        elements = unstructured.get_elements_from_api(
            file_path=tmp_path,
            api_key=Config.UNSTRUCTURED_API_KEY,
            api_url=Config.UNSTRUCTURED_API_URL,
            strategy="hi_res",
            pdf_infer_table_structure=True,
        )

        #EXAMPLE GIVEN
        # documents = []
        # current_doc = None
        # for el in elements:
        #     if el.category in ["Header", "Footer"]:
        #         continue
        #     if el.category == "Title" and current_doc is not None:
        #         documents.append(current_doc)
        #         current_doc = None
        #     if not current_doc:
        #         current_doc = Document(page_content="", metadata=el.metadata.to_dict())
        #     current_doc.page_content += el.metadata.text_as_html if el.category == "Table" else el.text
        #     if el.category == "Table" and current_doc is not None:
        #         documents.append(current_doc)
        #         current_doc = None
        # if current_doc:
        #     documents.append(current_doc)

        #EXPERIMENTAL
        from bs4 import BeautifulSoup
        documents = []
        for el in elements:
            if el.category in ["Header", "Footer"]:
                continue
            if el.category == "Table":
                # Parse HTML to extract rows
                html = el.metadata.text_as_html
                soup = BeautifulSoup(html, "html.parser")
                rows = soup.find_all("tr")
                
                headers = [th.get_text(strip=True) for th in rows[0].find_all(["td", "th"])]
                for row in rows[1:]:
                    values = [td.get_text(strip=True) for td in row.find_all(["td", "th"])]
                    row_data = dict(zip(headers, values))

                    # Create natural language format for each row
                    row_text = ", ".join([f"{k}: {v}" for k, v in row_data.items()])
                    doc = Document(page_content=row_text, metadata=el.metadata.to_dict())
                    documents.append(doc)
            else:
                # Fallback for other categories
                doc = Document(page_content=el.text.strip(), metadata=el.metadata.to_dict())
                documents.append(doc)

        astra_db_store = AstraDBVectorStore(
            collection_name=collection_name,
            embedding=OpenAIEmbeddings(model="text-embedding-3-small"),
            token=Config.ASTRA_DB_APPLICATION_TOKEN,
            api_endpoint=Config.ASTRA_DB_API_ENDPOINT
        )
        astra_db_store.add_documents(documents)

        return f"{len(documents)} documents uploaded to '{collection_name}'"

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

