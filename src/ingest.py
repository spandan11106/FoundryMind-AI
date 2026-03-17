from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import os
import glob

# Paths
knowledge_dir = "./knowledge"
persist_directory = "./chroma_db"

def main():
    # Find all PDFs in the knowledge directory
    pdf_files = glob.glob(os.path.join(knowledge_dir, "*.pdf"))
    
    if not pdf_files:
        print(f"No PDF files found in {knowledge_dir}")
        return

    all_chunks = []
    
    print("Initializing embedding model (this may take a moment to download)...")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", " ", ""]
    )

    for pdf_path in pdf_files:
        print(f"Loading '{pdf_path}'...")
        try:
            loader = PyPDFLoader(pdf_path)
            documents = loader.load()
            print(f"Loaded {len(documents)} pages from {os.path.basename(pdf_path)}.")

            print(f"Splitting {os.path.basename(pdf_path)} into chunks...")
            chunks = text_splitter.split_documents(documents)
            print(f"Split {os.path.basename(pdf_path)} into {len(chunks)} chunks.")
            all_chunks.extend(chunks)
        except Exception as e:
            print(f"Error processing {pdf_path}: {e}")

    if all_chunks:
        # Create and save the Vector Database
        print(f"\nEmbedding a total of {len(all_chunks)} chunks and saving database to '{persist_directory}'...")
        vectorstore = Chroma.from_documents(
            documents=all_chunks,
            embedding=embeddings,
            persist_directory=persist_directory
        )

        print("Success! Your Vector Database is ready.")
    else:
        print("No chunks were created. Database was not updated.")

if __name__ == "__main__":
    main()
