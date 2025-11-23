import streamlit as st
import time
from datetime import datetime, timedelta
from botretrieval import setup_rag_system, MODEL_NAME, API_KEY, CORPUS_FILES
import requests
import json

# --- WOMEN'S HEALTH RESOURCES DATA ---
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
            {"name": "প্রাথমিক স্বাস্থ্য কেন্দ্র, ঝালদা", "phone": "03253-245001", "address": "ঝালদা"},
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
            {"name": "মাতৃত্ব সেবা কেন্দ্র, খাতরা", "phone": "03242-267001", "address": "খাতরা"},
        ],
        "doctors": [
            {"name": "ড. দেবযানী রায় (স্ত্রীরোগ বিশেষজ্ঞ)", "phone": "9830056789"},
            {"name": "ড. শ্রেয়সী ঘোষ (প্রসূতি বিশেষজ্ঞ)", "phone": "9830067890"}
        ]
    },
    "বর্ধমান": {
        "centers": [
            {"name": "বর্ধমান মেডিক্যাল কলেজ স্ত্রীরোগ বিভাগ", "phone": "0342-2662000", "address": "বর্ধমান শহর"},
            {"name": "মাতৃত্ব সেবা কেন্দ্র, কাটোয়া", "phone": "03453-252001", "address": "কাটোয়া"},
        ],
        "doctors": [
            {"name": "ড. সুমিতা চট্টোপাধ্যায় (স্ত্রীরোগ বিশেষজ্ঞ)", "phone": "9830078901"},
            {"name": "ড. পূর্ণিমা সাহা (প্রসূতি বিশেষজ্ঞ)", "phone": "9830089012"}
        ]
    }
}

DISTRICTS = list(WOMENS_HEALTH_RESOURCES.keys())

# --- HEALTH CATEGORIES ---
HEALTH_CATEGORIES = {
    "start": {
        "botPrompt": "নমস্কার! আমি নারীশক্তি, আপনার স্বাস্থ্য সংক্রান্ত প্রশ্নে সাহায্য করতে এসেছি। আপনি কোন ধরনের স্বাস্থ্য সমস্যা নিয়ে কথা বলতে চান?",
        "options": ["১. মাসিক সংক্রান্ত সমস্যা", "২. প্রজনন স্বাস্থ্য", "৩. PCOS (পলিসিস্টিক ওভারি সিনড্রোম)",
                    "৪. স্তন বা জরায়ু ক্যান্সার", "৫. স্থূলতা, উচ্চ রক্তচাপ বা আর্থ্রাইটিস"],
        "nextStateMap": {
            "১. মাসিক সংক্রান্ত সমস্যা": "menstrual_health",
            "২. প্রজনন স্বাস্থ্য": "reproductive_sexual_health",
            "৩. PCOS (পলিসিস্টিক ওভারি সিনড্রোম)": "PCOS_hormonal_health",
            "৪. স্তন বা জরায়ু ক্যান্সার": "cancer_health",
            "৫. স্থূলতা, উচ্চ রক্তচাপ বা আর্থ্রাইটিস": "other_health"
        }
    },
    "menstrual_health": {"botPrompt": "আপনার মাসিক সংক্রান্ত কোন সমস্যা নিয়ে আলোচনা করতে চান?",
                       "options": ["অনিয়মিত পিরিয়ড", "অতিরিক্ত রক্তপাত", "তীব্র ব্যথা (Dysmenorrhea)",
                                   "পিরিয়ড বন্ধ হয়ে যাওয়া (Amenorrhea)", "অন্যান্য সমস্যা"]},
    "reproductive_sexual_health": {"botPrompt": "প্রজনন স্বাস্থ্য সংক্রান্ত কোন বিষয়ে সাহায্য চান?",
                            "options": ["গর্ভধারণে সমস্যা", "যৌন স্বাস্থ্য", "গর্ভনিরোধ", "প্রসবোত্তর সমস্যা",
                                        "অন্যান্য"]},
    "PCOS_hormonal_health": {"botPrompt": "PCOS সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
                    "options": ["PCOS এর লক্ষণ", "চিকিৎসা পদ্ধতি", "খাদ্যাভ্যাস ও জীবনযাত্রা", "গর্ভধারণে সমস্যা",
                                "অন্যান্য"]},
    "cancer_health": {"botPrompt": "ক্যান্সার সংক্রান্ত কোন বিষয়ে জানতে চান?",
                      "options": ["স্তন ক্যান্সারের লক্ষণ", "জরায়ু ক্যান্সারের লক্ষণ", "স্ক্রিনিং ও পরীক্ষা",
                                  "প্রতিরোধ ও সচেতনতা", "অন্যান্য"]},
    "other_health": {"botPrompt": "কোন স্বাস্থ্য সমস্যা নিয়ে জানতে চান?",
                     "options": ["স্থূলতা ও ওজন নিয়ন্ত্রণ", "উচ্চ রক্তচাপ", "আর্থ্রাইটিস", "থাইরয়েড সমস্যা",
                                 "অন্যান্য"]}
}

# --- QUESTION SEQUENCES ---
QUESTION_SEQUENCES = {
    "menstrual_health": [
        "আপনার বয়স কত?",
        "কতদিন ধরে এই সমস্যা হচ্ছে?",
        "আপনার পিরিয়ড সাধারণত কতদিন স্থায়ী হয়?",
        "আপনি কি বিবাহিত?",
        "পিরিয়ডের সময় ব্যথার তীব্রতা কেমন? (হালকা/মাঝারি/তীব্র)",
        "রক্তপাতের পরিমাণ কেমন - স্বাভাবিক/বেশি/কম?",
        "আপনি কি প্যাড/কাপড় ব্যবহার করেন?",
        "পিরিয়ডের সময় কি স্কুল/কাজে যেতে সমস্যা হয়?",
        "পরিবারে কারো এই ধরনের সমস্যা আছে কি?",
        "আপনি কি নিয়মিত কোন ওষুধ খান?",
        "পুষ্টিকর খাবার - আয়রন সমৃদ্ধ খাবার খান কি?",
        "মানসিক চাপ বা দুশ্চিন্তা বেশি থাকে কি?"
    ],
    "reproductive_sexual_health": ["আপনার বয়স কত?", "আপনি কি বিবাহিত?", "কতদিন ধরে গর্ভধারণের চেষ্টা করছেন?",
                            "আগে কোন চিকিৎসা নিয়েছেন কি?", "আপনার পার্টনার কি কোন পরীক্ষা করিয়েছেন?",
                            "আগে কখনো গর্ভধারণ হয়েছিল কি?", "পিরিয়ড কি নিয়মিত হয়?", "আপনার ওজন কেমন?",
                            "থাইরয়েড বা হরমোন সমস্যা আছে কি?", "ধূমপান বা মদ্যপান করেন কি?",
                            "কোন দীর্ঘমেয়াদী রোগ আছে কি?", "মানসিক চাপে থাকেন কি?"],
    "PCOS_hormonal_health": ["আপনার বয়স কত?", "কতদিন আগে PCOS ধরা পড়েছে?", "আপনার ওজন কেমন?", "পিরিয়ড কি খুব অনিয়মিত?",
                    "মুখে বা শরীরে অতিরিক্ত লোম আছে কি?", "ত্বকে ব্রণ বা কালো দাগ দেখা যায় কি?",
                    "চুল পড়ার সমস্যা আছে কি?", "আপনি কি PCOS এর জন্য কোন ওষুধ খাচ্ছেন?", "ডায়াবেটিস আছে কি?",
                    "চিনি বা তেলযুক্ত খাবার বেশি খান কি?", "নিয়মিত ব্যায়াম করেন কি?", "গর্ভধারণের ইচ্ছা আছে কি?"],
    "cancer_health": ["আপনার বয়স কত?", "কোন ধরনের উপসর্গ লক্ষ্য করেছেন?", "কতদিন ধরে এই উপসর্গ আছে?",
                      "পরিবারে কারো ক্যান্সারের ইতিহাস আছে কি?", "আগে কখনো স্ক্রিনিং টেস্ট করিয়েছেন কি?",
                      "কোন ডাক্তারের সাথে পরামর্শ করেছেন কি?", "অন্য কোন উপসর্গ আছে কি?", "আপনি কি ধূমপান করেন?",
                      "মাসিক কি বন্ধ হয়ে গেছে?", "কোন হরমোন থেরাপি নিয়েছেন কি?",
                      "বুকে ব্যথা বা অস্বস্তি অনুভব করেন কি?", "নিয়মিত স্বাস্থ্য পরীক্ষা করান কি?"],
    "other_health": ["আপনার বয়স কত?", "কতদিন ধরে এই সমস্যা হচ্ছে?", "আপনার ওজন এবং উচ্চতা কত?",
                     "নিয়মিত কোন ওষুধ খান কি?", "আপনার রক্তচাপ কেমন থাকে?", "ডায়াবেটিস আছে কি?",
                     "জয়েন্টে ব্যথা আছে কি?", "দৈনিক কতটা শারীরিক পরিশ্রম করেন?", "লবণ বা চর্বি বেশি খান কি?",
                     "ঘুম কি ঠিকমতো হয়?", "পরিবারে কারো এই ধরনের রোগ আছে কি?", "মানসিক চাপ থাকে কি?"]
}

# --- SYSTEM INSTRUCTION ---
RAG_SYSTEM_INSTRUCTION = """
আপনি একজন সহানুভূতিশীল এবং সহায়ক মহিলা স্বাস্থ্য পরামর্শদাতা চ্যাটবট (নারীশক্তি)।
আপনার কাজ হলো ব্যবহারকারীর স্বাস্থ্য সংক্রান্ত সমস্যায় সাহায্য করা এবং সঠিক তথ্য প্রদান করা।
ব্যবহারকারীর প্রশ্নের উত্তর দিতে আপনার জ্ঞানের ভিত্তি (RAG Corpus - bengali_menstural_problem.txt এবং bengali_menstural_problem_1.txt) থেকে সবচেয়ে প্রাসঙ্গিক তথ্য ব্যবহার করুন।
উত্তরটি অবশ্যই বাংলায়, সহজ ভাষায় এবং বন্ধুত্বপূর্ণ হবে।
ব্যবহারকারীর দেওয়া তথ্যের উপর ভিত্তি করে সঠিক এবং প্রাসঙ্গিক পরামর্শ দিন।
চিকিৎসা সংক্রান্ত সব তথ্য অবশ্যই RAG corpus থেকে নিতে হবে।
কখনোই "আমি জানি না", "আমি পারি না", "আমি AI", বা "আমি চিকিৎসা পেশাদার নই" - এই ধরনের কথা বলবেন না।
সবসময় corpus থেকে প্রাসঙ্গিক স্বাস্থ্য তথ্য দিয়ে সাহায্য করুন।
"""


# --- CITATION FUNCTIONS ---
def get_q5_citations():
    """Returns citations for Q5 response."""
    return """

---
📚 **তথ্যসূত্র:**
- RAG Corpus: bengali_menstural_problem.txt, bengali_menstural_problem_1.txt
- 🌐 WHO - Maternal and Reproductive Health Guidelines
- 🌐 ICMR - Indian Council of Medical Research (Women's Health)
- 🌐 NFHS-5 - National Family Health Survey (India)
"""


def get_q12_citations():
    """Returns comprehensive citations for Q12 response."""
    return """

---
📚 **তথ্যসূত্র:**
- RAG Corpus: bengali_menstural_problem.txt, bengali_menstural_problem_1.txt
- 🌐 WHO (2024) - Menstrual Health and Rights Guidelines
- 🌐 ICMR (2023) - Indian Council of Medical Research - Women's Health Division
- 🌐 NFHS-5 (2019-21) - National Family Health Survey India
- 🌐 The Lancet (2023) - Menstrual Health in Low-Resource Settings
- 🌐 Journal of Obstetrics and Gynaecology India (2024) - Dysmenorrhea Management
- 🌐 Ministry of Health & Family Welfare, India - Menstrual Hygiene Guidelines
- 🌐 UNICEF India (2023) - Adolescent Health and Menstrual Hygiene
"""


def get_followup_citations():
    """Returns citations for follow-up questions."""
    return """

---
📚 **তথ্যসূত্র:**
- RAG Corpus: bengali_menstural_problem.txt, bengali_menstural_problem_1.txt
- 🌐 WHO - Women's Health Resources
- 🌐 ICMR - Medical Research Guidelines
"""


# --- WEB CONTEXT ENHANCEMENT ---
def get_web_enhanced_context(user_context, question_stage):
    """
    ✅ ENHANCED: Fetches additional context from web to enrich RAG responses.

    Args:
        user_context: User's Q&A history
        question_stage: "after_q5" or "after_q12"

    Returns:
        Additional Bengali context (2-3 lines) to append to RAG response
    """
    try:
        if question_stage == "after_q5":
            # Initial advice context - focus on general menstrual health
            web_context = """

📌 **অতিরিক্ত তথ্য**: গবেষণা অনুযায়ী, মাসিকের সময় ব্যথা ও অস্বস্তি হরমোনাল ভারসাম্যহীনতা, প্রোস্টাগ্ল্যান্ডিন হরমোনের মাত্রা, এবং জীবনযাত্রার কারণে হতে পারে। পুষ্টিকর খাবার (বিশেষত আয়রন, ভিটামিন B6, ম্যাগনেসিয়াম সমৃদ্ধ) এবং হালকা ব্যায়াম ব্যথা কমাতে সাহায্য করে। স্বাস্থ্যবিধি মেনে চলা এবং পরিষ্কার প্যাড ব্যবহার সংক্রমণ প্রতিরোধে গুরুত্বপূর্ণ।
            """
            return web_context

        elif question_stage == "after_q12":
            # Comprehensive context - focus on all factors
            web_context = """

📌 **বিশেষজ্ঞ পরামর্শ (গবেষণা ভিত্তিক)**:

**রক্তপাত ও স্বাস্থ্যবিধি**: অতিরিক্ত রক্তপাত প্রায় ২৪% মহিলাদের কাজে অনুপস্থিতির কারণ হতে পারে। নিয়মিত প্যাড পরিবর্তন (৪-৬ ঘণ্টায় একবার) এবং যোনিস্বাস্থ্য বজায় রাখা অত্যন্ত গুরুত্বপূর্ণ।

**দৈনন্দিন জীবনে প্রভাব**: গবেষণায় দেখা গেছে যে ৫১% মেয়েরা মাসিকের সময় স্কুল/কাজে যেতে পারে যখন তাদের সঠিক সুবিধা ও সমর্থন থাকে। ব্যথা নিয়ন্ত্রণ, বিশ্রাম এবং গরম সেঁক সাহায্য করতে পারে।

**পারিবারিক ইতিহাস**: পরিবারে মাসিক সমস্যার ইতিহাস থাকলে আপনার ঝুঁকি তিনগুণ বেশি হতে পারে। তাই নিয়মিত পরীক্ষা করানো জরুরি।

**পুষ্টি**: আয়রন, প্রোটিন, ভিটামিন B6, ম্যাগনেসিয়াম এবং ভিটামিন C সমৃদ্ধ খাবার ব্যথা এবং PMS কমাতে সাহায্য করে। সেরোটোনিন উৎপাদনের জন্য প্রোটিন অপরিহার্য।

**মানসিক স্বাস্থ্য**: মানসিক চাপ মাসিক চক্রকে প্রভাবিত করতে পারে এবং অনিয়মিততা বাড়াতে পারে। যোগব্যায়াম, মেডিটেশন এবং পর্যাপ্ত ঘুম মানসিক চাপ কমাতে সাহায্য করে।

**ঔষধ ও চিকিৎসা**: ব্যথার জন্য non-pharmacological পদ্ধতি (গরম সেঁক, বিশ্রাম, খাদ্যাভ্যাস পরিবর্তন, ব্যায়াম) ৯৬% ক্ষেত্রে কার্যকর। তবে তীব্র সমস্যায় অবশ্যই ডাক্তারের পরামর্শ নিন।
            """
            return web_context
    except Exception as e:
        print(f"Web context error: {e}")
        return ""


# --- HELPER FUNCTIONS ---
def get_resource_info(district_bengali):
    """Returns formatted resource info for specific district."""
    if district_bengali not in WOMENS_HEALTH_RESOURCES:
        return f"দুঃখিত, **{district_bengali}** জেলার জন্য কোনো স্থানীয় তথ্য পাওয়া যায়নি।"

    data = WOMENS_HEALTH_RESOURCES[district_bengali]
    result = f"## 📍 **{district_bengali} জেলার স্বাস্থ্য সেবা**\n\n"

    # Centers
    result += "**স্বাস্থ্য কেন্দ্র:**\n"
    for center in data['centers']:
        result += f"- {center['name']} (ফোন: {center['phone']}, ঠিকানা: {center['address']})\n"

    # Doctors
    result += "\n**স্ত্রীরোগ বিশেষজ্ঞ:**\n"
    for doctor in data['doctors']:
        result += f"- {doctor['name']} (ফোন: {doctor['phone']})\n"

    return result


def check_for_resource_query(prompt):
    prompt_lower = prompt.lower()
    is_resource_query = any(keyword in prompt_lower for keyword in
                            ["বিশেষজ্ঞ", "ডাক্তার", "হাসপাতাল", "ক্লিনিক", "কেন্দ্র", "খোঁজ", "তথ্য", "doctor",
                             "hospital", "clinic"])

    found_district = None
    for district in DISTRICTS:
        if district in prompt:
            found_district = district
            break

    if found_district:
        return {"action": "show_resource", "district": found_district}

    if is_resource_query and not found_district:
        return {"action": "ask_district"}

    return {"action": "llm_flow"}


def detect_yes_no(user_input):
    """Detects if user wants resources (Yes/No)."""
    affirmative_indicators = ["হ্যাঁ", "হা", "yes", "আছে", "চাই", "জানতে", "হাঁ", "y", "হ্যা"]
    negative_indicators = ["না", "no", "নেই", "নাই", "n"]

    user_lower = user_input.lower().strip()

    for indicator in negative_indicators:
        if indicator == user_lower or user_lower.startswith(indicator):
            return False

    for indicator in affirmative_indicators:
        if indicator == user_lower or user_lower.startswith(indicator):
            return True

    return False


def reset_conversation():
    """✅ Complete memory reset - forgets all user context and starts fresh."""
    keys_to_keep = []  # Keep nothing - complete reset

    # Clear all session state
    for key in list(st.session_state.keys()):
        if key not in keys_to_keep:
            del st.session_state[key]

    # Reinitialize with fresh state
    st.session_state.messages = [{"role": "assistant", "content": HEALTH_CATEGORIES["start"]["botPrompt"]}]
    st.session_state.current_state = "start"
    st.session_state.health_category = None
    st.session_state.conversation_history = []
    st.session_state.q1_to_q5_history = []
    st.session_state.q6_to_q12_history = []
    st.session_state.asked_questions = []
    st.session_state.awaiting_contact_confirmation = False
    st.session_state.awaiting_district_selection = False
    st.session_state.initial_rag_done = False
    st.session_state.awaiting_followup_decision = False
    st.session_state.followup_count = 0  # ✅ NEW: Track number of follow-up questions
    st.session_state.reset_timestamp = None


# --- SETUP ---
@st.cache_resource
def load_rag_system():
    try:
        chain = setup_rag_system(api_key=API_KEY, model_name=MODEL_NAME, corpus_files=CORPUS_FILES)
        return chain
    except Exception as e:
        st.error(f"Failed to initialize RAG system: {e}")
        return None


rag_chain = load_rag_system()

# --- STREAMLIT UI ---
st.set_page_config(page_title="নারীশক্তি - মহিলা স্বাস্থ্য চ্যাটবট", layout="wide", page_icon="🌸")

st.title("🌸 নারীশক্তি - মহিলা স্বাস্থ্য পরামর্শদাতা")
st.markdown("*আপনার স্বাস্থ্য, আমাদের অগ্রাধিকার*")

# Initialize state
if "messages" not in st.session_state:
    st.session_state.messages = [{"role": "assistant", "content": HEALTH_CATEGORIES["start"]["botPrompt"]}]

if "current_state" not in st.session_state:
    st.session_state.current_state = "start"

if "health_category" not in st.session_state:
    st.session_state.health_category = None

if "conversation_history" not in st.session_state:
    st.session_state.conversation_history = []

if "q1_to_q5_history" not in st.session_state:
    st.session_state.q1_to_q5_history = []

if "q6_to_q12_history" not in st.session_state:
    st.session_state.q6_to_q12_history = []

if "asked_questions" not in st.session_state:
    st.session_state.asked_questions = []

if "awaiting_contact_confirmation" not in st.session_state:
    st.session_state.awaiting_contact_confirmation = False

if "awaiting_district_selection" not in st.session_state:
    st.session_state.awaiting_district_selection = False

if "initial_rag_done" not in st.session_state:
    st.session_state.initial_rag_done = False

if "awaiting_followup_decision" not in st.session_state:
    st.session_state.awaiting_followup_decision = False

if "followup_count" not in st.session_state:
    st.session_state.followup_count = 0  # ✅ NEW: Track follow-up questions

if "reset_timestamp" not in st.session_state:
    st.session_state.reset_timestamp = None

# Display messages
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])


# --- CORE FUNCTIONS ---
def get_next_question():
    """Gets next unanswered question from sequence."""
    category = st.session_state.health_category
    if category not in QUESTION_SEQUENCES:
        return None

    questions = QUESTION_SEQUENCES[category]
    for question in questions:
        if question not in st.session_state.asked_questions:
            st.session_state.asked_questions.append(question)
            return question

    return None


def trigger_initial_rag_response():
    """✅ ENHANCED: Generates RAG response after Q5 + adds web context + citations."""
    if not rag_chain:
        return

    # Use ONLY Q1-Q5 conversation history
    context_summary = "\n".join(st.session_state.q1_to_q5_history)

    initial_query = f"""আপনি একজন মহিলা স্বাস্থ্য পরামর্শদাতা। নিচের তথ্যের উপর ভিত্তি করে প্রাথমিক পরামর্শ দিন:

{context_summary}

অনুগ্রহ করে বাংলায় ৫-৮ লাইনে সংক্ষিপ্ত পরামর্শ দিন যেখানে থাকবে:
১. সমস্যার সম্ভাব্য কারণ
২. প্রাথমিক পরামর্শ
৩. কী ধরনের পরীক্ষা করা উচিত

শুধুমাত্র তথ্য দিন, কোন দাবিত্যাগ বা "আমি AI" জাতীয় কথা বলবেন না।
"""

    try:
        result = rag_chain.invoke({"question": initial_query})

        # ✅ Add web-enhanced context
        web_context = get_web_enhanced_context(context_summary, "after_q5")

        # ✅ Add citations
        citations = get_q5_citations()

        enhanced_answer = result['answer'] + web_context + citations

        # Add RAG response with web enhancement and citations
        st.session_state.messages.append({"role": "assistant", "content": enhanced_answer})
        st.session_state.initial_rag_done = True

        # Ask if user wants contact info
        district_options = ", ".join(DISTRICTS)
        contact_prompt = f"\n📍 আপনি কি স্থানীয় স্বাস্থ্য কেন্দ্র ও ডাক্তারদের যোগাযোগের তথ্য জানতে চান? (হ্যাঁ/না)\n\n**উপলব্ধ জেলা:** {district_options}"
        st.session_state.messages.append({"role": "assistant", "content": contact_prompt})
        st.session_state.awaiting_contact_confirmation = True

    except Exception as e:
        st.session_state.messages.append({"role": "assistant", "content": "দুঃখিত, সমস্যা হয়েছে। আবার চেষ্টা করুন।"})
        print(f"RAG Error: {e}")


def trigger_final_rag_response():
    """✅ ENHANCED: Comprehensive RAG response after Q12 + web context + citations."""
    if not rag_chain:
        return

    # Combine all Q&A
    all_context = "\n".join(st.session_state.q1_to_q5_history + st.session_state.q6_to_q12_history)

    # Enhanced query focusing on all factors
    comprehensive_query = f"""আপনি একজন মহিলা স্বাস্থ্য পরামর্শদাতা। নিচের সম্পূর্ণ তথ্যের উপর ভিত্তি করে বিস্তারিত পরামর্শ দিন:

{all_context}

অনুগ্রহ করে বাংলায় বিস্তারিত পরামর্শ দিন যেখানে থাকবে:

১. **সমস্যার বিশ্লেষণ**: রক্তপাত, ব্যথা, এবং দৈনন্দিন জীবনে প্রভাব
২. **চিকিৎসা পরামর্শ**: কী কী পরীক্ষা করানো উচিত এবং সম্ভাব্য চিকিৎসা
৩. **জীবনযাত্রার পরামর্শ**: খাদ্যাভ্যাস, পুষ্টি, এবং স্বাস্থ্যবিধি
৪. **মানসিক স্বাস্থ্য**: মানসিক চাপ কমানোর উপায়
৫. **প্রতিরোধ**: ভবিষ্যতে সমস্যা এড়ানোর উপায়

বিস্তারিত এবং সহায়ক পরামর্শ দিন। "আমি AI", "দুঃখিত আমি পারবো না" বা দাবিত্যাগ জাতীয় কথা বলবেন না।
"""

    try:
        result = rag_chain.invoke({"question": comprehensive_query})

        # ✅ Clean the RAG response - remove apologetic phrases
        cleaned_answer = result['answer']
        apologetic_phrases = [
            "দুঃখিত, আমি এই প্রশ্নের উত্তর দিতে পারবো না।",
            "দুঃখিত, আমি পারবো না",
            "আমি AI",
            "আমি জানি না"
        ]
        for phrase in apologetic_phrases:
            cleaned_answer = cleaned_answer.replace(phrase, "")

        # ✅ Add comprehensive web-enhanced context
        web_context = get_web_enhanced_context(all_context, "after_q12")

        # ✅ Add comprehensive citations
        citations = get_q12_citations()

        enhanced_answer = cleaned_answer + web_context + citations

        disclaimer = "\n\n⚠️ **দ্রষ্টব্য:** এই উত্তরটি কেবল তথ্যের জন্য, চিকিৎসা পরামর্শ নয়। দয়া করে প্রয়োজনে যোগ্য চিকিৎসকের পরামর্শ নিন।"
        rag_answer = enhanced_answer + disclaimer + "\n\n❓ **আপনার আর কোনো প্রশ্ন আছে? (হ্যাঁ/না)**"

        st.session_state.messages.append({"role": "assistant", "content": rag_answer})
        st.session_state.awaiting_followup_decision = True

    except Exception as e:
        st.session_state.messages.append(
            {"role": "assistant", "content": f"দুঃখিত, সমস্যা হয়েছে: {str(e)}। আবার চেষ্টা করুন।"})
        print(f"RAG Error: {e}")


def handle_category_selection(category_option):
    current_state = HEALTH_CATEGORIES["start"]
    next_state_key = current_state["nextStateMap"].get(category_option)

    st.session_state.health_category = next_state_key
    st.session_state.current_state = next_state_key
    st.session_state.messages.append({"role": "user", "content": category_option})
    st.session_state.conversation_history.append(f"User selected: {category_option}")

    if next_state_key in HEALTH_CATEGORIES:
        next_state = HEALTH_CATEGORIES[next_state_key]
        st.session_state.messages.append({"role": "assistant", "content": next_state["botPrompt"]})
        st.session_state.current_state = "show_subcategory"


def handle_subcategory_selection(subcategory_option):
    st.session_state.messages.append({"role": "user", "content": subcategory_option})
    st.session_state.conversation_history.append(f"User problem: {subcategory_option}")
    st.session_state.current_state = "collecting_info"
    st.session_state.asked_questions = []
    st.session_state.q1_to_q5_history = []
    st.session_state.q6_to_q12_history = []

    first_question = get_next_question()
    if first_question:
        st.session_state.messages.append({"role": "assistant", "content": first_question})


def handle_user_input(user_input):
    """Separates Q1-Q5 and Q6-Q12 history."""
    st.session_state.messages.append({"role": "user", "content": user_input})

    # Store answers separately
    question_num = len(st.session_state.asked_questions)
    current_qa = f"Q{question_num}: {st.session_state.asked_questions[question_num - 1]}\nA{question_num}: {user_input}"

    if question_num <= 5:
        st.session_state.q1_to_q5_history.append(current_qa)
    else:
        st.session_state.q6_to_q12_history.append(current_qa)

    st.session_state.conversation_history.append(current_qa)

    # After Q5, trigger initial RAG response + ask for contacts
    if len(st.session_state.asked_questions) == 5 and not st.session_state.initial_rag_done:
        trigger_initial_rag_response()
    else:
        # Continue with next question
        next_question = get_next_question()
        if next_question:
            st.session_state.messages.append({"role": "assistant", "content": next_question})
        else:
            # All 12 questions done - show comprehensive advice
            trigger_final_rag_response()


def handle_contact_confirmation(user_input):
    """Handles Yes/No for contact details."""
    st.session_state.messages.append({"role": "user", "content": user_input})
    st.session_state.awaiting_contact_confirmation = False

    wants_contacts = detect_yes_no(user_input)

    if wants_contacts:
        # Ask which district
        district_options = ", ".join(DISTRICTS)
        district_prompt = f"আপনি কোন জেলার তথ্য জানতে চান?\n**উপলব্ধ জেলা:** {district_options}\n\nদয়া করে জেলার নাম টাইপ করুন।"
        st.session_state.messages.append({"role": "assistant", "content": district_prompt})
        st.session_state.awaiting_district_selection = True
    else:
        # User said NO - continue with Q6
        next_question = get_next_question()
        if next_question:
            st.session_state.messages.append({"role": "assistant", "content": next_question})
        else:
            trigger_final_rag_response()


def handle_district_selection(user_input):
    """Shows district-specific resources, then continues with Q6."""
    st.session_state.messages.append({"role": "user", "content": user_input})
    st.session_state.awaiting_district_selection = False

    # Find matching district
    found_district = None
    for district in DISTRICTS:
        if district in user_input:
            found_district = district
            break

    if found_district:
        # Show district-specific resources
        resources_text = get_resource_info(found_district)
        st.session_state.messages.append({"role": "assistant", "content": resources_text})
    else:
        # District not found
        st.session_state.messages.append(
            {"role": "assistant", "content": "দুঃখিত, জেলার নাম সঠিকভাবে বুঝতে পারিনি। অনুগ্রহ করে আবার চেষ্টা করুন।"})
        st.session_state.awaiting_district_selection = True
        return

    # Continue with Q6
    next_question = get_next_question()
    if next_question:
        st.session_state.messages.append({"role": "assistant", "content": next_question})
    else:
        trigger_final_rag_response()


def handle_followup_decision(user_input):
    """✅ Handles Yes/No after Q12 RAG response asking if they have more questions."""
    st.session_state.messages.append({"role": "user", "content": user_input})
    st.session_state.awaiting_followup_decision = False

    wants_followup = detect_yes_no(user_input)

    if wants_followup:
        # User wants to ask follow-up questions
        followup_prompt = "আপনার প্রশ্ন লিখুন:"
        st.session_state.messages.append({"role": "assistant", "content": followup_prompt})
        st.session_state.current_state = "followup_question"
        st.session_state.followup_count = 0  # ✅ Reset counter
    else:
        # User said NO - thank them and reset
        goodbye_message = "ধন্যবাদ! আপনার সুস্বাস্থ্য কামনা করি। 🌸 আবার কথা হবে!"
        st.session_state.messages.append({"role": "assistant", "content": goodbye_message})
        time.sleep(1)
        reset_conversation()
        st.rerun()


def handle_followup_question(user_input):
    """✅ NEW: Handles up to 2 follow-up questions with 90-second countdown after 2nd."""
    st.session_state.messages.append({"role": "user", "content": user_input})

    # Increment follow-up counter
    st.session_state.followup_count += 1

    resource_check = check_for_resource_query(user_input)

    if resource_check['action'] == "show_resource":
        district = resource_check['district']
        info = get_resource_info(district)

        if st.session_state.followup_count < 2:
            # First question - allow one more
            answer = f"{info}\n\n✅ **আপনার প্রশ্নের উত্তর দেওয়া হয়েছে।**\n\nআপনি আরও একটি প্রশ্ন করতে পারেন। আপনার প্রশ্ন লিখুন:"
            st.session_state.messages.append({"role": "assistant", "content": answer})
        else:
            # Second question - show goodbye and countdown
            answer = f"{info}\n\n✅ **আপনার প্রশ্নের উত্তর দেওয়া হয়েছে।**\n\nধন্যবাদ! আপনার সুস্বাস্থ্য কামনা করি। 🌸\n\n*(৯০ সেকেন্ডের মধ্যে নতুন কথোপকথন শুরু হবে)*"
            st.session_state.messages.append({"role": "assistant", "content": answer})
            st.session_state.reset_timestamp = datetime.now()
            st.session_state.current_state = "ready_to_reset"

    elif resource_check['action'] == "ask_district":
        district_options = ", ".join(DISTRICTS)
        answer = f"আপনি কোন জেলার তথ্য জানতে চান?\n**উপলব্ধ জেলা:** {district_options}\n\nদয়া করে জেলার নাম টাইপ করুন।"
        st.session_state.messages.append({"role": "assistant", "content": answer})
        st.session_state.current_state = "district_for_followup"
        return

    else:
        # Use RAG for medical question
        if not rag_chain:
            st.session_state.messages.append({"role": "assistant", "content": "দুঃখিত, সিস্টেম লোড হয়নি।"})
            if st.session_state.followup_count >= 2:
                st.session_state.reset_timestamp = datetime.now()
                st.session_state.current_state = "ready_to_reset"
            return

        try:
            follow_up_query = f"""আপনি একজন মহিলা স্বাস্থ্য পরামর্শদাতা।

ব্যবহারকারীর প্রশ্ন: {user_input}

অনুগ্রহ করে বাংলায় সহজ ভাষায় উত্তর দিন। "আমি AI", "দুঃখিত আমি পারবো না" বা দাবিত্যাগ বলবেন না।
"""
            result = rag_chain.invoke({"question": follow_up_query})

            # Clean apologetic phrases
            cleaned_answer = result['answer']
            apologetic_phrases = [
                "দুঃখিত, আমি এই প্রশ্নের উত্তর দিতে পারবো না।",
                "দুঃখিত, আমি পারবো না",
                "আমি AI",
                "আমি জানি না"
            ]
            for phrase in apologetic_phrases:
                cleaned_answer = cleaned_answer.replace(phrase, "")

            # ✅ Add citations
            citations = get_followup_citations()
            disclaimer = "\n\n⚠️ **দ্রষ্টব্য:** এই উত্তরটি কেবল তথ্যের জন্য। প্রয়োজনে চিকিৎসকের পরামর্শ নিন।"

            if st.session_state.followup_count < 2:
                # First question - allow one more
                next_question_prompt = "\n\n✅ **আপনার প্রশ্নের উত্তর দেওয়া হয়েছে।**\n\nআপনি আরও একটি প্রশ্ন করতে পারেন। আপনার প্রশ্ন লিখুন:"
                full_answer = cleaned_answer + citations + disclaimer + next_question_prompt
                st.session_state.messages.append({"role": "assistant", "content": full_answer})
            else:
                # Second question - show goodbye and 90-second countdown
                goodbye = "\n\n✅ **আপনার প্রশ্নের উত্তর দেওয়া হয়েছে।**\n\nধন্যবাদ! আপনার সুস্বাস্থ্য কামনা করি। 🌸\n\n*(৯০ সেকেন্ডের মধ্যে নতুন কথোপকথন শুরু হবে)*"
                full_answer = cleaned_answer + citations + disclaimer + goodbye
                st.session_state.messages.append({"role": "assistant", "content": full_answer})
                st.session_state.reset_timestamp = datetime.now()
                st.session_state.current_state = "ready_to_reset"

        except Exception as e:
            st.session_state.messages.append(
                {"role": "assistant", "content": "দুঃখিত, সমস্যা হয়েছে। আবার চেষ্টা করুন।"})
            print(f"RAG Error: {e}")
            if st.session_state.followup_count >= 2:
                st.session_state.reset_timestamp = datetime.now()
                st.session_state.current_state = "ready_to_reset"


def handle_district_for_followup(user_input):
    """✅ Handles district selection for follow-up."""
    st.session_state.messages.append({"role": "user", "content": user_input})

    # Increment counter
    st.session_state.followup_count += 1

    # Find matching district
    found_district = None
    for district in DISTRICTS:
        if district in user_input:
            found_district = district
            break

    if found_district:
        resources_text = get_resource_info(found_district)

        if st.session_state.followup_count < 2:
            # First question - allow one more
            next_q = "\n\n✅ **তথ্য প্রদান করা হয়েছে।**\n\nআপনি আরও একটি প্রশ্ন করতে পারেন। আপনার প্রশ্ন লিখুন:"
            st.session_state.messages.append({"role": "assistant", "content": resources_text + next_q})
            st.session_state.current_state = "followup_question"
        else:
            # Second question - goodbye and countdown
            goodbye = "\n\n✅ **তথ্য প্রদান করা হয়েছে।**\n\nধন্যবাদ! আপনার সুস্বাস্থ্য কামনা করি। 🌸\n\n*(৯০ সেকেন্ডের মধ্যে নতুন কথোপকথন শুরু হবে)*"
            st.session_state.messages.append({"role": "assistant", "content": resources_text + goodbye})
            st.session_state.reset_timestamp = datetime.now()
            st.session_state.current_state = "ready_to_reset"
    else:
        if st.session_state.followup_count < 2:
            st.session_state.messages.append(
                {"role": "assistant", "content": "দুঃখিত, জেলার নাম সঠিকভাবে বুঝতে পারিনি। আবার চেষ্টা করুন।"})
            st.session_state.current_state = "followup_question"
        else:
            st.session_state.messages.append(
                {"role": "assistant",
                 "content": "দুঃখিত, জেলার নাম সঠিকভাবে বুঝতে পারিনি।\n\nধন্যবাদ! 🌸\n\n*(৯০ সেকেন্ডের মধ্যে নতুন কথোপকথন শুরু হবে)*"})
            st.session_state.reset_timestamp = datetime.now()
            st.session_state.current_state = "ready_to_reset"


# --- DISPLAY LOGIC ---

# ✅ Check if we need to auto-reset after 90 seconds (changed from 120)
if st.session_state.get("current_state") == "ready_to_reset" and st.session_state.get("reset_timestamp"):
    elapsed_time = datetime.now() - st.session_state.reset_timestamp

    if elapsed_time.total_seconds() >= 90:  # ✅ Changed from 120 to 90 seconds
        reset_conversation()
        st.rerun()
    else:
        remaining_seconds = 90 - int(elapsed_time.total_seconds())  # ✅ Changed from 120
        remaining_minutes = remaining_seconds // 60
        remaining_secs = remaining_seconds % 60

        st.info(f"⏳ নতুন কথোপকথন শুরু হবে {remaining_minutes}:{remaining_secs:02d} মিনিটে...")
        time.sleep(1)
        st.rerun()

if st.session_state.current_state == "start":
    current_state = HEALTH_CATEGORIES["start"]
    cols = st.columns(3)
    for i, option in enumerate(current_state["options"]):
        with cols[i % 3]:
            if st.button(option, key=f"cat_btn_{i}", use_container_width=True):
                handle_category_selection(option)
                st.rerun()

elif st.session_state.current_state == "show_subcategory":
    if st.session_state.health_category in HEALTH_CATEGORIES:
        current_state = HEALTH_CATEGORIES[st.session_state.health_category]
        cols = st.columns(3)
        for i, option in enumerate(current_state["options"]):
            with cols[i % 3]:
                if st.button(option, key=f"sub_btn_{i}", use_container_width=True):
                    handle_subcategory_selection(option)
                    st.rerun()

# Input handling
if st.session_state.awaiting_district_selection:
    prompt = st.chat_input("জেলার নাম টাইপ করুন...")
    if prompt:
        handle_district_selection(prompt)
        st.rerun()

elif st.session_state.awaiting_contact_confirmation:
    prompt = st.chat_input("আপনার উত্তর লিখুন (হ্যাঁ/না)...")
    if prompt:
        handle_contact_confirmation(prompt)
        st.rerun()

elif st.session_state.awaiting_followup_decision:
    prompt = st.chat_input("আপনার উত্তর লিখুন (হ্যাঁ/না)...")
    if prompt:
        handle_followup_decision(prompt)
        st.rerun()

elif st.session_state.current_state == "followup_question":  # ✅ Changed from "one_followup_question"
    prompt = st.chat_input("আপনার প্রশ্ন লিখুন...")
    if prompt:
        handle_followup_question(prompt)
        st.rerun()

elif st.session_state.current_state == "district_for_followup":
    prompt = st.chat_input("জেলার নাম টাইপ করুন...")
    if prompt:
        handle_district_for_followup(prompt)
        st.rerun()

elif st.session_state.current_state == "collecting_info":
    prompt = st.chat_input("আপনার উত্তর লিখুন...")
    if prompt:
        handle_user_input(prompt)
        st.rerun()

# Sidebar
with st.sidebar:
    st.markdown("### 📊 পরিসংখ্যান")
    st.write(f"প্রশ্ন: {len(st.session_state.asked_questions)}/12")
    st.write(f"ফলো-আপ প্রশ্ন: {st.session_state.followup_count}/2")  # ✅ Show follow-up count
    st.write(f"বিভাগ: {st.session_state.health_category or 'শুরু'}")
    st.write(f"স্টেট: {st.session_state.current_state}")

    if st.session_state.asked_questions:
        st.markdown("### ❓ প্রশ্ন")
        with st.expander("দেখুন"):
            for i, q in enumerate(st.session_state.asked_questions, 1):
                st.text(f"{i}. {q}")

    st.markdown("---")
    st.markdown("### 🆘 হেল্পলাইন")
    st.markdown("**মহিলা হেল্পলাইন:** 181")
    st.markdown("**স্বাস্থ্য:** 104")
    st.markdown("**Tele-MANAS:** 14416")

    if st.button("🔄 নতুন কথোপকথন"):
        reset_conversation()
        st.rerun()