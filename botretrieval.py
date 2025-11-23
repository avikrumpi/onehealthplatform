from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
import os

# --- CONFIGURATION ---
MODEL_NAME = "gpt-3.5-turbo"
API_KEY = ""  # Replace with your actual API key or use environment variable

# --- CORPUS FILES ---
# Path to your menstrual health corpus files
CORPUS_FILES = [
    "data/Periodic_health.txt",
    "data/reproductive_health.txt",
    "data/Cancer_health.txt",
    "data/Mental_health.txt",
    "data/OtherIssues_health.txt"

]

# --- RAG CHAIN DEFINITION ---
def setup_rag_system(api_key: str, model_name: str, corpus_files: list):
    """
    Initializes and returns the RAG chain (ConversationalRetrievalChain) using OpenAI services.
    Loads multiple corpus files for comprehensive knowledge base (Hybrid RAG).

    Args:
        api_key (str): OpenAI API key
        model_name (str): OpenAI model name (e.g., "gpt-3.5-turbo", "gpt-4")
        corpus_files (list): List of corpus file paths to load

    Returns:
        ConversationalRetrievalChain: Initialized RAG chain with memory
    """
    # 1. API Key Check
    if not api_key:
        api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        error_msg = "🚨 API KEY MISSING! You must set the 'OPENAI_API_KEY' environment variable or provide api_key."
        print(f"Error: {error_msg}")
        return lambda q: {'answer': error_msg, 'source_documents': []}

    # 2. Load documents from multiple files and Split documents
    all_documents = []

    for corpus_file in corpus_files:
        try:
            print(f"Loading corpus file: {corpus_file}")
            loader = TextLoader(corpus_file, encoding='utf-8')
            documents = loader.load()
            all_documents.extend(documents)
            print(f"✅ Successfully loaded {len(documents)} document(s) from {corpus_file}")
        except FileNotFoundError:
            print(f"⚠️ Warning: File not found - {corpus_file}. Skipping...")
        except Exception as e:
            print(f"⚠️ Warning: Could not load {corpus_file}: {e}. Skipping...")

    if not all_documents:
        error_msg = "❌ Failed to load any corpus data. Please check file paths."
        print(error_msg)
        return lambda q: {'answer': error_msg, 'source_documents': []}

    print(f"\n📚 Total documents loaded: {len(all_documents)}")

    # Split documents into smaller chunks for better retrieval
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,  # Size of each text chunk
        chunk_overlap=200,  # Overlap between chunks to maintain context
        separators=["\n\n", "\n", "।", ".", " ", ""]  # Bengali-friendly separators
    )
    texts = text_splitter.split_documents(all_documents)
    print(f"📄 Total text chunks created: {len(texts)}")

    # 3. Create Embeddings (using OpenAIEmbeddings) and Vector Store (Chroma in-memory)
    print("\n🔄 Creating embeddings and vector store...")
    embeddings = OpenAIEmbeddings(api_key=api_key)
    vectorstore = Chroma.from_documents(texts, embeddings)

    # Configure retriever to fetch top 3 most relevant chunks
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 3}  # Retrieve top 3 relevant chunks
    )
    print("✅ Vector store created successfully")

    # 4. Define LLM (using ChatOpenAI)
    llm = ChatOpenAI(
        model=MODEL_NAME,
        api_key=API_KEY,
        temperature=0.4,  # Slightly more creative
        max_tokens=1000  # Allow longer responses (was default 256)
    )
    print(f"✅ LLM initialized: {model_name}")

    # 5. Define the memory component (crucial for conversation history)
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key='answer',  # Tells memory to use 'answer' as the AI's response
        input_key='question'  # Tells memory to expect the user query as 'question'
    )
    print("✅ Conversation memory initialized")

    # 6. Create the Conversational RAG Chain
    rag_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
        return_source_documents=True,  # Return source documents for transparency
        verbose=True  # Set to True for debugging
    )

    print("✅ RAG Chain initialized successfully\n")
    print("=" * 50)
    print("🌸 নারীশক্তি RAG System Ready!")
    print("=" * 50 + "\n")

    return rag_chain


# --- TEST FUNCTION (Optional - for standalone testing) ---
def test_rag_system():
    """
    Test function to verify RAG system is working correctly.
    Run this file directly to test: python botretrieval.py
    """
    print("🧪 Testing RAG System...\n")

    # Initialize RAG chain
    rag_chain = setup_rag_system(
        api_key=API_KEY,
        model_name=MODEL_NAME,
        corpus_files=CORPUS_FILES
    )

    # Test query
    test_query = "অনিয়মিত পিরিয়ডের কারণ কি?"

    print(f"Test Query: {test_query}\n")

    try:
        result = rag_chain.invoke({"question": test_query})

        print("Answer:")
        print("-" * 50)
        print(result['answer'])
        print("-" * 50)

        if result.get('source_documents'):
            print(f"\n📚 Retrieved {len(result['source_documents'])} source documents")
            for i, doc in enumerate(result['source_documents'], 1):
                print(f"\nSource {i}:")
                print(doc.page_content[:200] + "...")  # Print first 200 chars

        print("\n✅ Test completed successfully!")

    except Exception as e:
        print(f"❌ Error during test: {e}")


# --- MAIN EXECUTION ---
if __name__ == "__main__":
    # Run test when file is executed directly
    test_rag_system()