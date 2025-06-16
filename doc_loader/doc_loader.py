import os
from chromadb import HttpClient
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from uuid import uuid4


def process_documents_to_chroma(doc_directory="./data", chunk_size=500, chunk_overlap=200):
    """
    Loads text files from a directory, splits them with overlap, and indexes them into a ChromaDB server.
    """
    print(f"Processing documents from directory: {doc_directory}")
    documents = []
    for filename in os.listdir(doc_directory):
        if filename.endswith(".txt"):
            filepath = os.path.join(doc_directory, filename)
            print(f"Loading {filepath}...")
            try:
                loader = TextLoader(filepath)
                documents.extend(loader.load())
            except Exception as e:
                print(f"Error loading {filepath}: {e}")
                continue

    if not documents:
        print("No documents found or loaded. Exiting.")
        return

    print(
        f"Splitting documents into chunks with chunk_size={chunk_size} and chunk_overlap={chunk_overlap}..."
    )
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=chunk_overlap
    )
    splits = text_splitter.split_documents(documents)
    print(f"Created {len(splits)} chunks.")

    print("Initializing embeddings model...")
    # Using a common open-source embedding model
    embeddings = OpenAIEmbeddingFunction(
        model_name="text-embedding-3-small", api_key=os.getenv("LLM_API_KEY")
    )
    # Create a Chroma client and persist it to disk
    try:
        client = HttpClient(host="vs", port=8000)
        collection = client.get_or_create_collection(
            name="emtelco",
            configuration={
                "hnsw": {
                    "space": "cosine",  # Cohere models often use cosine space
                }
            },
            embedding_function=embeddings,
        )
        for doc in splits:
            collection.add(
                documents=[doc.page_content],
                ids=[str(uuid4())],  # Generate a unique ID for each document
            )
        print("Documents successfully indexed into ChromaDB.")
    except Exception as e:
        print(f"Error indexing documents into ChromaDB: {e}")


if __name__ == "__main__":
    doc_directory = "./data"  # Change this to your document directory
    process_documents_to_chroma(doc_directory)
    print("Document processing complete.")
