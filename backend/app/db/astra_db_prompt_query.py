from app.db.config import Config

from langchain_astradb import AstraDBVectorStore
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough

from langchain_openai import (
    ChatOpenAI,
    OpenAIEmbeddings,
)

def get_query_response(question: str, collection_name: str) -> str:
    astra_db_store = AstraDBVectorStore(
        collection_name=collection_name,
        embedding=OpenAIEmbeddings(model="text-embedding-3-small"),
        token=Config.ASTRA_DB_APPLICATION_TOKEN,
        api_endpoint=Config.ASTRA_DB_API_ENDPOINT
    )

    prompt_template = """
    Answer the question based only on the supplied context".
    Context: {context}
    Question: {question}
    Your answer:
    """

    llm = ChatOpenAI(model="gpt-3.5-turbo-16k", streaming=False, temperature=0)

    chain = (
        {"context": astra_db_store.as_retriever(), "question": RunnablePassthrough()}
        | PromptTemplate.from_template(prompt_template)
        | llm
        | StrOutputParser()
    )

    response = chain.invoke(question)
    return response
