import requests
from backend.app.db.config import Config

from langchain_astradb import AstraDBVectorStore
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough

from langchain_community.document_loaders import (
    unstructured,
    UnstructuredAPIFileLoader,
)

from langchain_openai import (
    ChatOpenAI,
    OpenAIEmbeddings,
)

# download pdf
url = "https://raw.githubusercontent.com/datastax/ragstack-ai/48bc55e7dc4de6a8b79fcebcedd242dc1254dd63/examples/notebooks/resources/attention_pages_9_10.pdf"
file_path = "./attention_pages_9_10.pdf"

response = requests.get(url)
if response.status_code == 200:
    with open(file_path, "wb") as file:
        file.write(response.content)
    print("Download complete.")
else:
    print("Error downloading the file.")

# simple parse
loader = UnstructuredAPIFileLoader(
    file_path="./attention_pages_9_10.pdf",
    api_key=Config.UNSTRUCTURED_API_KEY,
    url = Config.UNSTRUCTURED_API_URL,
)
simple_docs = loader.load()

print(len(simple_docs))
print(simple_docs[0].page_content[0:400])

# complex parse
elements = unstructured.get_elements_from_api(
    file_path="./attention_pages_9_10.pdf",
    api_key=Config.UNSTRUCTURED_API_KEY,
    api_url=Config.UNSTRUCTURED_API_URL,
    strategy="hi_res", # default "auto"
    pdf_infer_table_structure=True,
)

print(len(elements))
tables = [el for el in elements if el.category == "Table"]
print(tables[1].metadata.text_as_html)

# create vector store
astra_db_store = AstraDBVectorStore(
    collection_name="langchain_unstructured",
    embedding=OpenAIEmbeddings(),
    token=Config.ASTRA_DB_APPLICATION_TOKEN,
    api_endpoint=Config.ASTRA_DB_API_ENDPOINT
)

# load documents
documents = []
current_doc = None

for el in elements:
    if el.category in ["Header", "Footer"]:
        continue # skip these
    if el.category == "Title":
        if current_doc is not None:
            documents.append(current_doc)
        current_doc = None
    if not current_doc:
        current_doc = Document(page_content="", metadata=el.metadata.to_dict())
    current_doc.page_content += el.metadata.text_as_html if el.category == "Table" else el.text
    if el.category == "Table":
        if current_doc is not None:
            documents.append(current_doc)
        current_doc = None

astra_db_store.add_documents(documents)

# prompt and query
prompt = """
Answer the question based only on the supplied context. If you don't know the answer, say "I don't know".
Context: {context}
Question: {question}
Your answer:
"""

llm = ChatOpenAI(model="gpt-3.5-turbo-16k", streaming=False, temperature=0)

chain = (
    {"context": astra_db_store.as_retriever(), "question": RunnablePassthrough()}
    | PromptTemplate.from_template(prompt)
    | llm
    | StrOutputParser()
)

response_1 = chain.invoke("What does reducing the attention key size do?")
print("\n***********New Unstructured Basic Query Engine***********")
print(response_1)

response_2 = chain.invoke("For the transformer to English constituency results, what was the 'WSJ 23 F1' value for 'Dyer et al. (2016) (5]'?")
print("\n***********New Unstructured Basic Query Engine***********")
print(response_2)

response_3 = chain.invoke("When was George Washington born?")
print("\n***********New Unstructured Basic Query Engine***********")
print(response_3)