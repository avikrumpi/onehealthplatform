# FastAPI Backend Server for Narishakti Chatbot
# Fixed RAG retrieval issue - properly extracts Bengali answers and queries corpus
# Added doctor contact retrieval functionality

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
import asyncio
import re
import requests
from bs4 import BeautifulSoup

# Import RAG system setup
try:
    from botretrieval import setup_rag_system, MODEL_NAME, API_KEY, CORPUS_FILES
    from langchain.prompts import PromptTemplate
    from langchain_openai import ChatOpenAI, OpenAIEmbeddings
    from langchain.chains import ConversationalRetrievalChain
    from langchain.memory import ConversationBufferMemory
    from langchain_community.vectorstores import Chroma
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_community.document_loaders import TextLoader

    print("✅ Successfully imported required modules")
except ImportError as e:
    print(f"❌ Error importing modules: {e}")
    exit(1)


# QueryData requires all of these fields
class QueryData(BaseModel):
    prompt: str
    q1ToQ5History: Optional[List[str]] = []  # Added Optional and default
    q6ToQ12History: Optional[List[str]] = []  # Added Optional and default
    conversationHistory: Optional[List[str]] = []  # Added Optional and default
    district_selection: Optional[str] = None

# Women's Health Resources Data - matching chatbotapp.py exactly
WOMENS_HEALTH_RESOURCES = {
    "বীরভূম": {
        "centers": [
            {"name": "বীরভূম জেলা হাসপাতাল স্ত্রীরোগ বিভাগ", "phone": "03462-255200", "address": "সিউড়ি, বীরভূম"},
            {"name": "মাতৃত্ব সেবা কেন্দ্র, রামপুরহাট", "phone": "03461-222001", "address": "রামপুরহাট"},
            {"name": "Tele-MANAS (জাতীয় ২৪/৭ সহায়তা)", "phone": "14416", "address": "২৪/৭ সরকারি সহায়তা"}
        ],
        "doctors": [
            {"name": "ড. মালবিকা মুখার্জী (স্ত্রীরোগ বিশেষজ্ঞ)", "phone": "9830012345"},
            {"name": "ড. শর্মিষ্ঠা ব্যানার্জী (প্রসূতি বিশেষজ্ঞ)", "phone": "9830023456"}
        ]
    },
    "পুরুলিয়া": {
        "centers": [
            {"name": "পুরুলিয়া সদর হাসপাতাল স্ত্রীরোগ বিভাগ", "phone": "03252-222001", "address": "পুরুলিয়া শহর"},
            {"name": "প্রাথমিক স্বাস্থ্য কেন্দ্র, ঝালদা", "phone": "03253-245001", "address": "ঝালদা"}
        ],
        "doctors": [
            {"name": "ড. অনিন্দিতা দাস (স্ত্রীরোগ বিশেষজ্ঞ)", "phone": "9830034567"},
            {"name": "ড. রীতা সেন (প্রসূতি বিশেষজ্ঞ)", "phone": "9830045678"}
        ]
    },
    "বাঁকুড়া": {
        "centers": [
            {"name": "বাঁকুড়া সম্মিলনী মেডিকেল কলেজ স্ত্রীরোগ বিভাগ", "phone": "7029473375",
             "address": "বাঁকুড়া সদর"},
            {"name": "মাতৃত্ব সেবা কেন্দ্র, খাতরা", "phone": "03242-267001", "address": "খাতরা"}
        ],
        "doctors": [
            {"name": "ড. দেবযানী রায় (স্ত্রীরোগ বিশেষজ্ঞ)", "phone": "9830056789"},
            {"name": "ড. শ্রেয়সী ঘোষ (প্রসূতি বিশেষজ্ঞ)", "phone": "9830067890"}
        ]
    },
    "বর্ধমান": {
        "centers": [
            {"name": "বর্ধমান মেডিক্যাল কলেজ স্ত্রীরোগ বিভাগ", "phone": "0342-2662000", "address": "বর্ধমান শহর"},
            {"name": "মাতৃত্ব সেবা কেন্দ্র, কাটোয়া", "phone": "03453-252001", "address": "কাটোয়া"}
        ],
        "doctors": [
            {"name": "ড. সুমিতা চট্টোপাধ্যায় (স্ত্রীরোগ বিশেষজ্ঞ)", "phone": "9830078901"},
            {"name": "ড. পূর্ণিমা সাহা (প্রসূতি বিশেষজ্ঞ)", "phone": "9830089012"}
        ]
    },
    "আসানসোল": {
        "centers": [
            {"name": "আসানসোল জেলা হাসপাতাল স্ত্রীরোগ বিভাগ", "phone": "0341-2203101", "address": "আসানসোল"},
            {"name": "মাতৃত্ব সেবা কেন্দ্র, বার্নপুর", "phone": "0341-2274001", "address": "বার্নপুর"}
        ],
        "doctors": [
            {"name": "ড. কল্যাণী ব্যানার্জী (স্ত্রীরোগ বিশেষজ্ঞ)", "phone": "9830090123"},
            {"name": "ড. মৌসুমী দাস (প্রসূতি বিশেষজ্ঞ)", "phone": "9830091234"}
        ]
    }
}

DISTRICTS = list(WOMENS_HEALTH_RESOURCES.keys())

# Initialize FastAPI app
app = FastAPI(title="Narishakti Health Chatbot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global RAG chain variable
rag_chain = None


def extract_bengali_answers(qa_history: str) -> str:
    """
    Extracts only the Bengali answers from Q&A history
    Removes Q1, A1, Q2, A2 format and English metadata
    """
    answers = []
    lines = qa_history.split('\n')

    for line in lines:
        # Match pattern like "A1: বাংলা text" or "A২: বাংলা text"
        if line.strip().startswith('A') or 'A' in line[:5]:
            # Extract everything after the colon
            parts = line.split(':', 1)
            if len(parts) > 1:
                answer = parts[1].strip()
                if answer:  # Only add non-empty answers
                    answers.append(answer)

    return ' | '.join(answers)


def create_bengali_query(category: str, subcategory: str, answers: str, stage: str) -> str:
    """
    Creates a focused Bengali query that matches corpus content
    """
    # Map English category names to Bengali
    category_map = {
        'menstrual_health': 'মাসিক সমস্যা',
        'reproductive_sexual_health': 'প্রজনন স্বাস্থ্য',
        'PCOS_hormonal_health': 'PCOS সমস্যা',
        'cancer_health': 'ক্যান্সার',
        'other_health': 'অন্যান্য স্বাস্থ্য সমস্যা'
    }

    bengali_category = category_map.get(category, category)

    if stage == "after_q5":
        query = f"{bengali_category} এবং {subcategory} সম্পর্কে পরামর্শ দিন। রোগীর তথ্য: {answers}"
    elif stage == "after_q12":
        query = f"{bengali_category} এবং {subcategory} এর জন্য বিস্তারিত চিকিৎসা পরামর্শ, খাদ্যাভ্যাস এবং প্রতিরোধ সম্পর্কে বলুন। রোগীর সম্পূর্ণ তথ্য: {answers}"
    else:
        query = f"{bengali_category}: {answers}"

    return query


def get_doctor_contacts_for_district(district: str) -> str:
    """
    Returns formatted doctor contact information for a specific district
    """
    if district not in WOMENS_HEALTH_RESOURCES:
        return f"দুঃখিত, '{district}' জেলার তথ্য পাওয়া যায়নি।\n\n**উপলব্ধ জেলা:** {', '.join(DISTRICTS)}"

    data = WOMENS_HEALTH_RESOURCES[district]

    result = f"### 🏥 {district} জেলার স্বাস্থ্য সেবা\n\n"
    result += "#### 🏨 **স্বাস্থ্য কেন্দ্র:**\n\n"

    for center in data["centers"]:
        result += f"**{center['name']}**\n"
        result += f"📞 ফোন: {center['phone']}\n"
        result += f"📍 ঠিকানা: {center['address']}\n\n"

    result += "#### 👩‍⚕️ **স্ত্রীরোগ বিশেষজ্ঞ:**\n\n"

    for doctor in data["doctors"]:
        result += f"**{doctor['name']}**\n"
        result += f"📞 ফোন: {doctor['phone']}\n\n"

    return result


# Initialize RAG system with custom configuration
@app.on_event("startup")
async def startup_event():
    """Initialize RAG system with enhanced retrieval"""
    global rag_chain
    print("\n" + "=" * 60)
    print("🚀 Starting Narishakti Health Chatbot Backend Server...")
    print("=" * 60)

    print("\n🔄 Initializing Enhanced RAG system...")
    print(f"📂 Corpus files: {CORPUS_FILES}")
    print(f"🤖 Model: {MODEL_NAME}")

    # Check corpus files
    missing_files = []
    total_chars = 0
    for file in CORPUS_FILES:
        if not os.path.exists(file):
            missing_files.append(file)
        else:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                chars = len(content)
                total_chars += chars
                print(f"   ✓ {file}: {chars:,} characters")

    if missing_files:
        print(f"\n❌ ERROR: Missing corpus files: {missing_files}")
        exit(1)

    print(f"\n📊 Total corpus size: {total_chars:,} characters")

    try:
        # Load all corpus documents manually for better control
        print("\n📚 Loading corpus documents...")
        all_documents = []
        for corpus_file in CORPUS_FILES:
            try:
                loader = TextLoader(corpus_file, encoding='utf-8')
                documents = loader.load()
                all_documents.extend(documents)
                print(f"   ✓ Loaded {len(documents)} documents from {corpus_file}")
            except Exception as e:
                print(f"   ✗ Error loading {corpus_file}: {e}")

        if not all_documents:
            raise ValueError("No documents loaded from corpus files")

        print(f"\n📄 Total documents loaded: {len(all_documents)}")

        # Split with Bengali-optimized settings
        print("\n✂️ Splitting documents into chunks...")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,  # Smaller chunks for better matching
            chunk_overlap=150,  # More overlap for context
            separators=["\n\n", "\n", "।", ".", " ", ""]
        )
        texts = text_splitter.split_documents(all_documents)
        print(f"   ✓ Created {len(texts)} text chunks")

        # Create embeddings and vector store
        print("\n🔗 Creating embeddings and vector store...")
        embeddings = OpenAIEmbeddings(api_key=API_KEY)
        vectorstore = Chroma.from_documents(texts, embeddings)

        # Enhanced retriever with more chunks
        retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 6}  # Retrieve top 6 chunks instead of 3
        )
        print("   ✓ Vector store created with enhanced retrieval (k=6)")

        # LLM with better configuration for Bengali
        llm = ChatOpenAI(
            model=MODEL_NAME,
            api_key=API_KEY,
            temperature=0.4,  # Slightly more creative
            max_tokens=1300  # Allow longer responses
        )
        print(f"   ✓ LLM initialized: {MODEL_NAME} (temp=0.4, max_tokens=1300)")

        # Conversation memory
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key='answer',
            input_key='question'
        )
        print("   ✓ Conversation memory initialized")

        # Create custom prompt for Bengali health advice
        qa_prompt_template = """তুমি একজন বিশেষজ্ঞ মহিলা স্বাস্থ্য পরামর্শদাতা। নিচের প্রসঙ্গ (Context) থেকে প্রাপ্ত তথ্যের ভিত্তিতে বাংলায় বিস্তারিত পরামর্শ দাও।

**গুরুত্বপূর্ণ: শুধুমাত্র নিচের প্রসঙ্গ থেকে পাওয়া তথ্য ব্যবহার করো। বাইরের কোনো তথ্য ব্যবহার করো না।**

প্রসঙ্গ (Corpus Documents):
{context}

প্রশ্ন: {question}

নির্দেশনা:

-শুধুমাত্র বাংলায় উত্তর দাও (পশ্চিমবঙ্গের চলিত ভাষা ব্যবহার করো)

-৩০০-৫০০ শব্দের মধ্যে বিস্তারিত ও পরিষ্কারভাবে পরামর্শ দাও

-পরামর্শের শুরুতে উল্লেখ করো—‘আপনি যে সমস্যার সম্মুখীন হচ্ছেন, তা হলো:…’, এবং পরবর্তীতে সেই প্রসঙ্গের ভিত্তিতে উত্তর দাও

-একই ধারণা বা বক্তব্য বারংবার পুনরাবৃত্তি এড়িয়ে চলো; সংক্ষিপ্ত, অর্থবহ এবং পরিষ্কার মতামত প্রদান করো

-প্রসঙ্গ (Context) নির্ধারণের জন্য, বট ইউজারকে প্রাসঙ্গিক ফলো-আপ প্রশ্ন জিজ্ঞেস করবে, বট ইউজারকে বিভিন্ন অপশন, প্রশ্ন ও বাটন ক্লিকের মাধ্যমে যেসব উত্তর সংগ্রহ করে, সেগুলো সংক্ষেপে সারাংশ তৈরি করবে । এরপর, নির্ধারিত প্রসঙ্গ অনুযায়ী ব্যাপক, স্পষ্ট ও প্রাসঙ্গিক উত্তর প্রদান করবে

-শুধুমাত্র তৈরি করা প্রসঙ্গ থেকে পাওয়া তথ্যের ভিত্তিতে—চিকিৎসা পরামর্শ, খাদ্যাভ্যাস, জীবনযাত্রা এবং প্রতিরোধ নিয়ে স্পষ্ট পরামর্শ দাও; ইউজার কোনো বিশেষ শর্ত (যেমন: ডায়াবেটিস, গর্ভাবস্থা, খাদ্য-এলার্জি, হৃদরোগ) দিলে, এ নিয়ে আলাদাভাবে নির্দিষ্ট ও পরিষ্কার নির্দেশনা দাও

-সহজবোধ্য ও ইতিবাচক বাংলা ভাষা ব্যবহার করো, যাতে সকলেই বুঝতে পারেন

-যদি প্রসঙ্গে পর্যাপ্ত তথ্য না থাকে বা উত্তর আসেনা, তখন লিখো—
“এ বিষয়ে আরও সঠিক তথ্যের জন্য দয়া করে ওয়েবসাইটটি মনোযোগ দিয়ে দেখো অথবা সরাসরি সংশ্লিষ্ট চিকিৎসকের সঙ্গে যোগাযোগ করো।”

এভাবে, ইউজার-ইন্টারঅ্যাকশন (অপশন-বাটন/প্রশ্ন) থেকে প্রাপ্ত সমস্ত উত্তর একত্রে Context-এ সংক্ষেপে উপস্থাপিত হবে এবং মূল স্বাস্থ্য-উত্তর সেই তথ্যের উপর ভিত্তি করে পুরোপুরি West Bengal-এর বাংলা ভাষায় দেওয়া হবে।”

উত্তর (বাংলায়):"""

        from langchain.prompts import PromptTemplate
        QA_PROMPT = PromptTemplate(
            template=qa_prompt_template,
            input_variables=["context", "question"]
        )

        # Create RAG chain with custom prompt
        rag_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retriever,
            memory=memory,
            return_source_documents=True,
            combine_docs_chain_kwargs={"prompt": QA_PROMPT},
            verbose=True  # Enable verbose for debugging
        )

        print("\n✅ Enhanced RAG Chain initialized successfully!")
        print("   - Optimized for Bengali health queries")
        print("   - Custom prompt for detailed advice")
        print("   - Enhanced retrieval (6 chunks)")
        print("   - Verbose logging enabled")

    except Exception as e:
        print(f"\n❌ Error initializing RAG system: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

    print("\n" + "=" * 60)
    print("🌸 নারীশক্তি RAG System Ready!")
    print("=" * 60 + "\n")


# Request/Response models
class RAGQueryRequest(BaseModel):
    query: str
    conversation_history: List[str]
    question_stage: Optional[str]


class RAGQueryResponse(BaseModel):
    answer: str
    citations: Optional[str] = None  # Not a list, just a string
    status: str

class DoctorContactRequest(BaseModel):
    district: str


class DoctorContactResponse(BaseModel):
    district: str
    contact_info: str
    status: str = "success"

# ============================================================================
# FAVICON ROUTE (Optional - prevents 404 in logs)
# ============================================================================

@app.get("/favicon.ico")
async def favicon():
    """Handle favicon requests"""
    from fastapi.responses import Response
    return Response(status_code=204)  # 204 = No Content

@app.get("/")
async def serve_frontend():
    """Serve HTML frontend"""
    html_path = "index_womenhealth.html"
    if os.path.exists(html_path):
        return FileResponse(
            html_path,
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
    else:
        return {
            "status": "running",
            "message": "Narishakti Health Chatbot API",
            "rag_status": "initialized" if rag_chain else "not_initialized"
        }

@app.get("/app_womenhealth.js")
async def serve_app_js():
    """Serve JavaScript file"""
    js_path = "app_womenhealth.js"
    if os.path.exists(js_path):
        return FileResponse(
            js_path,
            media_type="application/javascript",
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
    raise HTTPException(status_code=404, detail="app_womenhealth.js not found")

@app.get("/style_womenhealth.css")
async def serve_style_css():
    """Serve CSS file"""
    css_path = "style_womenhealth.css"
    if os.path.exists(css_path):
        return FileResponse(
            css_path,
            media_type="text/css",
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
    raise HTTPException(status_code=404, detail="style_womenhealth.css not found")


@app.post("/api/doctor-contacts", response_model=DoctorContactResponse)
async def get_doctor_contacts(request: DoctorContactRequest):
    """
    Get doctor contact information for a specific district
    """
    print(f"\n📞 Doctor contact request for: {request.district}")

    contact_info = get_doctor_contacts_for_district(request.district)

    return DoctorContactResponse(
        district=request.district,
        contact_info=contact_info,
        status="success"
    )


@app.get("/api/districts")
async def get_districts():
    """
    Get list of available districts
    """
    return {
        "districts": DISTRICTS,
        "count": len(DISTRICTS)
    }


@app.post("/query")
async def query(data: QueryData):
    try:
        print("QueryData", data)

        # 1. জেলাভিত্তিক যোগাযোগের তথ্য খোঁজার জন্য চেক করুন
        if data.district_selection and data.district_selection in WOMENS_HEALTH_RESOURCES:
            district_name = data.district_selection

            # রিসোর্স ডেটা বের করুন
            resources = WOMENS_HEALTH_RESOURCES[district_name]["centers"]

            # ডেটা স্ট্রিং হিসেবে সুন্দরভাবে ফরম্যাট করুন
            response_text = f"✅ **{district_name} জেলার স্থানীয় স্বাস্থ্য কেন্দ্র ও ডাক্তারদের যোগাযোগের তথ্য:**\n\n"

            for i, center in enumerate(resources):
                response_text += f"{i + 1}. **{center['name']}**\n"
                response_text += f"   📞 ফোন: {center['phone']}\n"
                response_text += f"   📍 ঠিকানা: {center['address']}\n"

                # ডেটার শেষে একটি অতিরিক্ত লাইন ব্রেক যোগ করুন যদি সেটি শেষ না হয়
                if i < len(resources) - 1:
                    response_text += "\n"

            # RAG লজিক বাইপাস করে সরাসরি যোগাযোগ তথ্য ফেরত দিন
            return {"answer": response_text, "status": "contact_success"}

        # যদি যোগাযোগ তথ্যের অনুরোধ না হয় বা জেলা না পাওয়া যায়, তবে RAG লজিকে চলে যান
        # ... (এখানে আপনার বিদ্যমান RAG লজিক শুরু হবে)

    except Exception as e:
        # 🛑 CRITICAL LOGGING: Print the exact error and the raw request body
        print("\n" + "=" * 50)
        print("🚨 422 VALIDATION ERROR DEBUG START 🚨")
        print(f"Error Type: {type(e).__name__}")

        # Pydantic's validation error has a useful .errors() method
        if hasattr(e, 'errors'):
            print("Pydantic Validation Errors:")
            # Use json.dumps to print the errors cleanly
            import json
            print(json.dumps(e.errors(), indent=4, ensure_ascii=False))

        # Re-raise the exception to send the proper 422 status back to the client
        raise HTTPException(
            status_code=422,
            detail={"message": "Data validation failed. Check server logs for details."}
        )

# @app.post("/api/rag-query", response_model=RAGQueryResponse)
# async def rag_query(request: RAGQueryRequest):
#     """
#     Process RAG query with enhanced Bengali extraction
#     """
#     print("RAG query invoked")
#     if not rag_chain:
#         raise HTTPException(status_code=500, detail="RAG system not initialized")
#
#     try:
#         # Extract category and subcategory from query
#         category_match = re.search(r'বিভাগ:\s*(\w+)', request.query)
#         subcategory_match = re.search(r'উপবিভাগ:\s*([^।]+)', request.query)
#
#         category = category_match.group(1) if category_match else ""
#         subcategory = subcategory_match.group(1).strip() if subcategory_match else ""
#
#         # Extract only Bengali answers from Q&A history
#         if 'Q1:' in request.query or 'A1:' in request.query:
#             # Find the answers section
#             answers_section = re.search(r'উত্তর:\s*(.+)$', request.query, re.DOTALL)
#             if answers_section:
#                 qa_text = answers_section.group(1)
#                 bengali_answers = extract_bengali_answers(qa_text)
#             else:
#                 bengali_answers = extract_bengali_answers(request.query)
#
#             # Create focused Bengali query
#             focused_query = create_bengali_query(
#                 category,
#                 subcategory,
#                 bengali_answers,
#                 request.question_stage
#             )
#         else:
#             # Direct followup question
#             focused_query = request.query
#
#         print(f"\n{'=' * 70}")
#         print(f"📝 Processing RAG Query")
#         print(f"{'=' * 70}")
#         print(f"Stage: {request.question_stage}")
#         print(f"Category: {category}")
#         print(f"Subcategory: {subcategory}")
#         print(f"Original query length: {len(request.query)} chars")
#         print(f"Focused query: {focused_query[:200]}...")
#         print(f"Focused query length: {len(focused_query)} chars")
#
#         # Call RAG chain
#
#         response = rag_chain({"question": focused_query, "chat_history": "\n".join(request.conversation_history)})
#
#         answer = response.get("answer", "")
#         source_docs = response.get("source_documents", [])
#
#         if not answer:
#             answer = "দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। অনুগ্রহ করে আবার চেষ্টা করুন।"
#
#         print(f"\n✅ Response Generated:")
#         print(f"   Answer length: {len(answer)} chars")
#         print(f"   Source documents: {len(source_docs)}")
#         print(f"   Answer preview: {answer[:150]}...")
#
#         # Extract actual source file names from documents
#         source_files = set()
#         if source_docs:
#             for doc in source_docs:
#                 if hasattr(doc, 'metadata') and 'source' in doc.metadata:
#                     source_files.add(os.path.basename(doc.metadata['source']))
#
#         # Add citations with actual source files
#         citations = None
#         if request.question_stage == "after_q5":
#             citations = "\n\n📚 **তথ্যসূত্র:** বিশ্ব স্বাস্থ্য সংস্থা (WHO), ICMR, NFHS-5"
#         elif request.question_stage == "after_q12":
#             citations = "\n\n📚 **তথ্যসূত্র:** বিশ্ব স্বাস্থ্য সংস্থা (WHO), ICMR, NFHS-5, The Lancet, ভারতীয় স্বাস্থ্য মন্ত্রক"
#         else:
#             citations = "\n\n📚 **তথ্যসূত্র:** বিশ্ব স্বাস্থ্য সংস্থা (WHO), ICMR"
#
#         if source_docs:
#             citations += f"\n\n🔍 **ব্যবহৃত উৎস:** {len(source_docs)} টি নথি থেকে তথ্য সংগ্রহ করা হয়েছে"
#             if source_files:
#                 citations += f"\n📄 **ফাইল:** {', '.join(source_files)}"
#
#         print(f"   Source files: {source_files}")
#         print(f"{'=' * 70}\n")
#
#         sourcedocs = response.get("source_documents", [])
#         ncitations = [os.path.basename(doc.metadata["source"]) for doc in sourcedocs if
#                      hasattr(doc, "metadata") and "source" in doc.metadata]
#         print("Final citations", ncitations)
#
#         return RAGQueryResponse(
#             answer=answer,
#             citations=citations,
#             status="success"
#         )
#
#     except Exception as e:
#         print(f"\n❌ Error processing query:")
#         print(f"   {type(e).__name__}: {str(e)}")
#         import traceback
#         traceback.print_exc()
#
#         raise HTTPException(status_code=500, detail=f"Error: {str(e)}")





def fetch_internet_snippet(query: str) -> str:
    url = f"https://duckduckgo.com/html/?q={query}"
    try:
        resp = requests.get(url, timeout=6)
        # crude but effective snippet extraction
        soup = BeautifulSoup(resp.text, 'html.parser')
        result = soup.find("a", {"class": "result__snippet"})
        return result.get_text(strip=True) if result else "No internet info."
    except Exception as e:
        print("DuckDuckGo error:", str(e))
        return "No internet info available."


@app.post("/api/rag-query", response_model=RAGQueryResponse)
async def rag_query(request: RAGQueryRequest):
    print("RAG query invoked")
    if not rag_chain:
        raise HTTPException(status_code=500, detail="RAG system not initialized")
    try:
        # Compose context
        chat_history = "\n".join(request.conversation_history)

        # Custom handling for summary (Q1–Q5) vs detailed answer (Q6–Q12)
        if request.question_stage == 'after_q5':
            prompt = ("Summarize the main health concerns/issues the user described in Q1–Q5 in 2 lines. Begin the answer by referring to the user context only"
                      "Do provide 2-3 lines advice based on the context, do not repeat this summary later.")
        elif request.question_stage == 'after_q12':
            prompt = ("Given ALL information from Q1–Q12, provide a detailed, actionable health answer. "
                      "Reference any symptoms or history, but do NOT repeat the summary from Q1–Q5. "
                      "If local corpus retrieval is insufficient, supplement with info from public internet sources.")
        else:
            prompt = "Respond helpfully using the provided context only, begin the answer by referring to the user context only."

        # Focused query: direct user query + custom prompt
        focused_query = f"{request.query}\n\n{prompt}"

        # Run RAG chain with context
        response = rag_chain({
            "question": focused_query,
            "chat_history": chat_history
        })
        answer = response.get("answer", "")
        sourcedocs = response.get("source_documents", [])

        # --- Internet Fallback Logic ---
        answer_is_short = len(answer.strip()) < 100 or "insufficient" in answer.lower()
        internet_snippet = ""
        if answer_is_short:
            # Replace with your function for external web info, e.g. using Bing or Google API
            internet_snippet = fetch_internet_snippet(request.query)
            if internet_snippet:
                answer += f"\n\n[Web info] {internet_snippet}"

        print("Internet snippet", internet_snippet)
        citations = "jnm.txt"
        # --- Citations ---
        # Existing code builds citations as a list:
        # citations = [os.path.basename(doc.metadata["source"]) for doc in sourcedocs if
        #              hasattr(doc, "metadata") and "source" in doc.metadata]
        # if internet_snippet:
        #     citations.append("internet")
        # citations_str = ", ".join(citations)
        #
        # print(f"Final answer: {answer[:150]}... citations: {citations}")

        return RAGQueryResponse(answer=answer, citations=citations, status="success")
    except Exception as e:
        print("Error processing RAG query", str(e))
        import traceback;
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")



@app.get("/health")
async def health_check():
    """Health check with corpus info"""
    corpus_status = []
    for file in CORPUS_FILES:
        exists = os.path.exists(file)
        size = os.path.getsize(file) if exists else 0
        corpus_status.append({
            "file": file,
            "exists": exists,
            "size_bytes": size
        })

    return {
        "status": "healthy",
        "rag_initialized": rag_chain is not None,
        "model": MODEL_NAME,
        "corpus_files": corpus_status,
        "districts_available": DISTRICTS
    }


# Streamlit compatibility endpoints
@app.get("/_stcore/health")
async def streamlit_health_check():
    return {"status": "ok"}


@app.get("/_stcore/host-config")
async def streamlit_host_config():
    return {
        "allowedOrigins": ["*"],
        "useExternalAuthToken": False,
        "enableXsrfProtection": False
    }


@app.websocket("/_stcore/stream")
async def streamlit_stream(websocket: WebSocket):
    await websocket.accept()
    print("🔌 WebSocket connected")
    try:
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                await websocket.send_json({"type": "ping"})
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "heartbeat"})
    except WebSocketDisconnect:
        print("🔌 WebSocket disconnected")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 Starting Narishakti Backend...")
    print("=" * 60)
    print(f"📡 Server: http://localhost:8502")
    print(f"🤖 Model: {MODEL_NAME}")
    print(f"📚 Corpus: {CORPUS_FILES}")
    print(f"🏥 Districts: {len(DISTRICTS)}")
    print("=" * 60 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8502, log_level="info")