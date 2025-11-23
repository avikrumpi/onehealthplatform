import streamlit as st
import time
from botretrieval import setup_rag_system, MODEL_NAME, API_KEY

# --- HARDCODED MENTAL HEALTH RESOURCE DATA (West Bengal Districts) ---
# This data is used for direct lookups when the user asks for doctors/centers
MENTAL_HEALTH_RESOURCES = {
    "বীরভূম": {
        "centers": [
            {"name": "আঞ্চলিক মানসিক স্বাস্থ্য হেল্পলাইন (NIBS)", "phone": "9830027976",
             "address": "সোম-শুক্র, সন্ধ্যে ৬টা-১০টা (কলকাতায় অবস্থিত)"},
            {"name": "Tele-MANAS (জাতীয় ২৪/৭ সহায়তা)", "phone": "14416",
             "address": "২৪/৭ সরকারি সহায়তা, বহু ভাষায় (বাংলা সহ)"},
            {"name": "Lifeline Kolkata (আঞ্চলিক সাপোর্ট)", "phone": "9088030303", "address": "সকাল ১০টা-সন্ধ্যা ৬টা"}
        ],
        "doctors": [
            {"name": "ড. অমল ব্যানার্জী (পরামর্শের জন্য টেলি-মানস)", "phone": "14416"},
            {"name": "ড. সুপ্রিয়া দে (কাউন্সেলর, লাইফলাইন)", "phone": "9088030303"},
            {"name": "ড. পার্থ সান্যাল (সরকারি হেল্পলাইন, কিরণ)", "phone": "1800-599-0019"}
        ]
    },
    "পুরুলিয়া": {
        "centers": [
            {"name": "পুরুলিয়া সদর হাসপাতাল মানসিক বিভাগ", "phone": "03252-222001", "address": "পুরুলিয়া শহর"},
            {"name": "Tele-MANAS (জাতীয় ২৪/৭ সহায়তা)", "phone": "14416",
             "address": "২৪/৭ সরকারি সহায়তা, বহু ভাষায় (বাংলা সহ)"},
            {"name": "Lifeline Kolkata (আঞ্চলিক সাপোর্ট)", "phone": "9088030303", "address": "সকাল ১০টা-সন্ধ্যা ৬টা"}
        ],
        "doctors": [
            {"name": "ড. প্রীতম সিংহ (পরামর্শের জন্য টেলি-মানস)", "phone": "14416"},
            {"name": "ড. ঋতুপর্ণা সেন (কাউন্সেলর, লাইফলাইন)", "phone": "9088030303"},
            {"name": "ড. সুদীপ মুখার্জী (সরকারি হেল্পলাইন, কিরণ)", "phone": "1800-599-0019"}
        ]
    },
    "বাঁকুড়া": {
        "centers": [
            {"name": "বাঁকুড়া সম্মিলনী মেডিকেল কলেজ (মানসিক বিভাগ)", "phone": "7029473375", "address": "বাঁকুড়া সদর"},
            {"name": "Tele-MANAS (জাতীয় ২৪/৭ সহায়তা)", "phone": "14416",
             "address": "২৪/৭ সরকারি সহায়তা, বহু ভাষায় (বাংলা সহ)"},
            {"name": "Lifeline Kolkata (আঞ্চলিক সাপোর্ট)", "phone": "9088030303", "address": "সকাল ১০টা-সন্ধ্যা ৬টা"}
        ],
        "doctors": [
            {"name": "ড. ভাস্কর চৌধুরী (পরামর্শের জন্য টেলি-মানস)", "phone": "14416"},
            {"name": "ড. নন্দিনী রায় (কাউন্সেলর, লাইফলাইন)", "phone": "9088030303"},
            {"name": "ড. অরিন্দম দাস (সরকারি হেল্পলাইন, কিরণ)", "phone": "1800-599-0019"}
        ]
    },
    "বর্ধমান": {
        "centers": [
            {"name": "বর্ধমান মেডিক্যাল কলেজ মানসিক বিভাগ", "phone": "0342-2662000",
             "address": "বর্ধমান শহর (সাধারণ হাসপাতালের যোগাযোগ)"},
            {"name": "Tele-MANAS (জাতীয় ২৪/৭ সহায়তা)", "phone": "14416",
             "address": "২৪/৭ সরকারি সহায়তা, বহু ভাষায় (বাংলা সহ)"},
            {"name": "Lifeline Kolkata (আঞ্চলিক সাপোর্ট)", "phone": "9088030303", "address": "সকাল ১০টা-সন্ধ্যা ৬টা"}
        ],
        "doctors": [
            {"name": "ড. শুভ্রা ঘোষ (পরামর্শের জন্য টেলি-মানস)", "phone": "14416"},
            {"name": "ড. অর্ণব মিত্র (কাউন্সেলর, লাইফলাইন)", "phone": "9088030303"},
            {"name": "ড. সুস্মিতা সেন (সরকারি হেল্পলাইন, কিরণ)", "phone": "1800-599-0019"}
        ]
    }
}
DISTRICTS = list(MENTAL_HEALTH_RESOURCES.keys())

# --- STATE MACHINE DEFINITION (FSM) ---
CONVERSATION_FLOW = {
    # 1. Greeting & Mood Check
    "start": {
        "botPrompt": "নমস্কার! আমি শান্তি, আপনার মনের কথা শুনতে এসেছি। কেমন আছেন আপনি?",
        "options": ["আমার মন খুব খারাপ লাগছে", "মনটা একটু খারাপ", "মোটামুটি আছি", "আমি ভালো আছি"],
        "nextStateMap": {
            "আমার মন খুব খারাপ লাগছে": "q_education",
            "মনটা একটু খারাপ": "q_education",
            "মোটামুটি আছি": "q_education",
            "আমি ভালো আছি": "q_education"
        }
    },
    # 2. Education/Academic Background
    "q_education": {
        "botPrompt": "আপনার জীবন সম্পর্কে আরও জানতে চাই। আপনার শিক্ষা বা কাজের ক্ষেত্রে কি কোনো চাপ বা উদ্বেগ কাজ করছে?",
        "options": ["কাজের চাপ/ ক্যারিয়ারের চিন্তা", "পড়াশোনার চাপ/ একাডেমিক চিন্তা", "চাকরি নেই, আর্থিক চাপ",
                    "না, এই বিষয়ে কোনো সমস্যা নেই"],
        "nextState": "q_relationship"
    },
    # 3. Relationship Problems
    "q_relationship": {
        "botPrompt": "সম্পর্ক একটি বড় বিষয়। আপনার পারিবারিক সম্পর্ক, বন্ধু বা পার্টনারের সাথে সম্পর্কের টানাপোড়েন কি আপনার উদ্বেগের কারণ?",
        "options": ["পারিবারিক সম্পর্ক জটিল", "বন্ধু/পার্টনারের সাথে সমস্যা", "একাকীত্ব অনুভব করি",
                    "না, সম্পর্কের ক্ষেত্রে সবকিছু ঠিক আছে"],
        "nextState": "q_socioeconomic"
    },
    # 4. Socioeconomic Status / Financial Stress
    "q_socioeconomic": {
        "botPrompt": "আপনার কি কোনো বড় আর্থিক বা সামাজিক-অর্থনৈতিক চাপ (Socioeconomic Stress) রয়েছে যা আপনার মানসিক স্বাস্থ্যের উপর প্রভাব ফেলছে?",
        "options": ["হ্যাঁ, গুরুতর আর্থিক সমস্যা", "সামাজিক মর্যাদা নিয়ে চিন্তা",
                    "আর্থিক চাপ নেই, কিন্তু পরিবেশ ভালো না", "না, কোনো চাপ নেই"],
        "nextState": "q_healthcare"
    },
    # 5. Healthcare / Physical Health Issues
    "q_healthcare": {
        "botPrompt": "আপনার শারীরিক স্বাস্থ্য কেমন আছে? কোনো দীর্ঘমেয়াদী রোগ বা স্বাস্থ্যের উদ্বেগ কি আপনার মানসিক চাপ বাড়াচ্ছে?",
        "options": ["হ্যাঁ, দীর্ঘমেয়াদী স্বাস্থ্য সমস্যা", "ঘুম/খাবারের সমস্যা হচ্ছে", "শারীরিক স্বাস্থ্য ঠিক আছে",
                    "অন্য কোনো অজানা উদ্বেগ"],
        "nextState": "q_geopolitical"
    },
    # 6. Geopolitical/External Stress (Final FSM Question)
    "q_geopolitical": {
        "botPrompt": "আপনার অঞ্চলের বা দেশের কোনো বাহ্যিক ঘটনা বা বড় সমস্যা (যেমন: রাজনৈতিক অস্থিরতা, পরিবেশগত পরিবর্তন) কি আপনাকে গভীরভাবে চিন্তিত করছে?",
        "options": ["হ্যাঁ, আমি খুব চিন্তিত", "মাঝেমধ্যে চিন্তা হয়", "এই বিষয়ে কোনো চিন্তা নেই"],
        "nextState": "allow_typing"  # Transition to RAG/LLM mode
    },
    # 7. Transition State
    "allow_typing": {
        "botPrompt": "আপনার দেওয়া মূল্যবান তথ্যের জন্য ধন্যবাদ। এখন আমি আপনার মনের অবস্থা আরও ভালোভাবে বুঝতে পারছি। **এখন আপনি আপনার প্রশ্ন টাইপ করে জিজ্ঞাসা করতে পারেন**, অথবা কোনো নির্দিষ্ট পরামর্শ চাইতে পারেন।",
        "options": ["মানসিক স্বাস্থ্য টিপস চাই", "বিশেষজ্ঞের খোঁজ চাই"],
        "nextState": None  # This state terminates FSM and enables RAG
    }
}
# --- END FSM DEFINITION ---

# --- RAG Core Functions (Same as previous) ---

# Instruction used for RAG responses when typing is enabled
RAG_SYSTEM_INSTRUCTION = """
আপনি একজন সহানুভূতিশীল এবং সহায়ক মানসিক স্বাস্থ্য কাউন্সেলর চ্যাটবট। আপনার কাজ হলো ব্যবহারকারীর মানসিক স্বাস্থ্য সংক্রান্ত সমস্যা সমাধানে সাহায্য করা।
ব্যবহারকারী এখন কথোপকথনে টাইপ করতে পারেন। আপনি তার প্রশ্নের উত্তর দিতে আপনার জ্ঞানের ভিত্তি (RAG Corpus) ব্যবহার করুন।
উত্তরটি অবশ্যই বাংলায় হতে হবে এবং বন্ধুত্বপূর্ণ হবে। যদি আপনি কোনো চূড়ান্ত পরামর্শ দেন, তবে অবশ্যই ব্যবহারকারীকে জিজ্ঞাসা করবেন যে তিনি কি পশ্চিমবঙ্গের কোনো জেলার মানসিক স্বাস্থ্য বিশেষজ্ঞ বা স্বাস্থ্য কেন্দ্রের খোঁজ চান।
"""


# --- Resource Lookup Logic (Same as previous) ---

def get_resource_info(district_bengali, resource_type):
    """Formats the hardcoded mental health resource information."""
    if district_bengali not in MENTAL_HEALTH_RESOURCES:
        return f"দুঃখিত, **{district_bengali}** জেলার জন্য কোনো স্থানীয় তথ্য পাওয়া যায়নি। অনুগ্রহ করে অন্য জেলার নাম বলুন বা জাতীয় হেল্পলাইন নম্বরগুলি ব্যবহার করুন।"

    data = MENTAL_HEALTH_RESOURCES[district_bengali]

    if resource_type == "centers":
        title = f"💡 **{district_bengali} জেলার মানসিক স্বাস্থ্য কেন্দ্র/হেল্পলাইন:**"
        items = data['centers']
        formatter = lambda c: f"- **{c['name']}** (ফোন: {c['phone']}, ঠিকানা: {c['address']})"
    elif resource_type == "doctors":
        title = f"💡 **{district_bengali} জেলার মানসিক স্বাস্থ্য বিশেষজ্ঞ/ডাক্তার:**"
        items = data['doctors']
        formatter = lambda d: f"- **{d['name']}** (ফোন: {d['phone']})"
    else:
        return None

    info_list = "\n".join(formatter(item) for item in items)
    return f"{title}\n{info_list}\n"


def check_for_resource_query(prompt):
    """Detects if the user is asking for a hardcoded resource based on keywords."""
    prompt_lower = prompt.lower()

    is_resource_query = any(keyword in prompt_lower for keyword in
                            ["বিশেষজ্ঞ", "ডাক্তার", "হাসপাতাল", "ক্লিনিক", "কেন্দ্র", "সাপোর্ট", "যোগাযোগ", "ফোন নম্বর",
                             "নাম্বার"])

    found_district = None
    for district in DISTRICTS:
        if district in prompt:
            found_district = district
            break

    resource_type = None
    if found_district:
        if any(keyword in prompt_lower for keyword in ["ডাক্তার", "বিশেষজ্ঞ", "সাইকিয়াট্রিস্ট"]):
            resource_type = "doctors"
        elif any(keyword in prompt_lower for keyword in ["কেন্দ্র", "ক্লিনিক", "হাসপাতাল", "হেল্পলাইন"]):
            resource_type = "centers"
        else:  # If district mentioned without resource type, default to centers
            resource_type = "centers"

    if found_district and resource_type:
        return {"action": "show_resource", "district": found_district, "type": resource_type}

    if is_resource_query and not found_district:
        return {"action": "ask_district", "district": None, "type": None}

    return {"action": "llm_flow", "district": None, "type": None}


# --- SETUP AND CACHING ---

@st.cache_resource
def load_rag_chain():
    """Initializes the Conversational RAG system and caches the resulting chain."""
    try:
        chain = setup_rag_system(api_key=API_KEY, model_name=MODEL_NAME)
        return chain
    except Exception as e:
        st.error(f"Failed to initialize RAG system: {e}")
        return lambda q: {'answer': f"Initialization Error: {e}", 'source_documents': []}


rag_chain = load_rag_chain()

# --- STREAMLIT UI ---
st.set_page_config(page_title="বাংলা মানসিক স্বাস্থ্য চ্যাটবট (FSM & RAG)", layout="wide")
st.title("🩺 বাংলা মানসিক স্বাস্থ্য চ্যাটবট (FSM & RAG)")

# Initialize state variables
if "messages" not in st.session_state:
    st.session_state.messages = []
if "current_state" not in st.session_state:
    st.session_state.current_state = "start"
if "typing_enabled" not in st.session_state:
    st.session_state.typing_enabled = False
if "fsm_history" not in st.session_state:
    st.session_state.fsm_history = []  # To store FSM answers before LLM takes over

# Display chat messages from history on app rerun
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])


# --- CORE CHAT LOGIC ---

def handle_fsm_transition(user_input, current_state_key):
    """Processes user's button click and transitions to the next state."""

    current_state = CONVERSATION_FLOW[current_state_key]

    # 1. Determine next state key
    if "nextStateMap" in current_state:
        # Use explicit map for state transitions (e.g., "start" state)
        next_state_key = current_state["nextStateMap"].get(user_input)
    else:
        # Use universal nextState for the rest of the flow
        next_state_key = current_state["nextState"]

    # 2. Log user response and bot prompt to chat history
    st.session_state.messages.append({"role": "user", "content": user_input})

    # Store the FSM conversation for later context in RAG mode
    st.session_state.fsm_history.append(f"User: {user_input}")

    # 3. Handle transition and update state
    if next_state_key == "allow_typing":
        st.session_state.typing_enabled = True
        st.session_state.current_state = "allow_typing"
    elif next_state_key and next_state_key in CONVERSATION_FLOW:
        st.session_state.current_state = next_state_key
    else:
        # Fallback in case of an error in the flow definition
        st.session_state.typing_enabled = True
        st.session_state.current_state = "allow_typing"

    # Rerun Streamlit to display the new state (bot prompt/buttons)
    st.rerun()


def generate_rag_response(prompt, chain):
    """Generates response using the RAG chain with full context."""

    # 1. Check for hardcoded resource query
    resource_request = check_for_resource_query(prompt)

    if resource_request['action'] == "ask_district":
        return {
            'answer': "আপনি পশ্চিমবঙ্গের কোন জেলার মানসিক স্বাস্থ্য বিশেষজ্ঞ বা স্বাস্থ্য কেন্দ্রের তথ্য জানতে চান? (যেমন: বীরভূম, পুরুলিয়া, বাঁকুড়া, বা বর্ধমান)",
            'source_documents': []}

    elif resource_request['action'] == "show_resource":
        district = resource_request['district']
        resource_type = resource_request['type']
        info = get_resource_info(district, resource_type)
        response = f"আপনার অনুরোধ অনুযায়ী **{district}** জেলার তথ্য দেওয়া হলো:\n\n{info}\n\nআপনার আর কোনো বিষয়ে সাহায্য দরকার?"
        return {'answer': response, 'source_documents': []}

    # 2. Use RAG/LLM flow
    query_with_instruction = (
        f"{RAG_SYSTEM_INSTRUCTION}\n\n"
        f"ব্যবহারকারীর বর্তমান প্রশ্ন: {prompt}\n"
        f"সম্পূর্ণ কথোপকথন ইতিহাস: {st.session_state.fsm_history + [f'User: {prompt}']}"
    )

    result = chain.invoke({"question": query_with_instruction})
    return result


# --- DISPLAY LOGIC ---

# Phase 1: FSM is active (Button-driven flow)
if not st.session_state.typing_enabled:

    current_state_key = st.session_state.current_state
    current_state = CONVERSATION_FLOW.get(current_state_key)

    if not current_state:
        # Should not happen, but a safe fallback
        st.error("Error: Conversation flow state not found.")
        st.session_state.typing_enabled = True
    else:
        # Display Bot Prompt
        with st.chat_message("assistant"):
            st.markdown(current_state["botPrompt"])
            st.session_state.fsm_history.append(f"Assistant: {current_state['botPrompt']}")

        # Display Buttons (Options)
        cols = st.columns(len(current_state.get("options", [])))
        for i, option in enumerate(current_state.get("options", [])):
            with cols[i]:
                if st.button(option, key=f"fsm_btn_{current_state_key}_{i}"):
                    # Rerun on button click to handle transition
                    handle_fsm_transition(option, current_state_key)

# Phase 2: Typing is enabled (RAG/LLM flow)
if st.session_state.typing_enabled:

    # This ensures the final FSM state prompt is logged before the input appears
    if st.session_state.current_state == "allow_typing":
        st.session_state.current_state = "rag_mode_active"  # Prevent re-logging the final prompt

    prompt = st.chat_input("আপনি কি জানতে চান?")

    if prompt:

        # 1. Log user message
        st.session_state.messages.append({"role": "user", "content": prompt})

        with st.chat_message("user"):
            st.markdown(prompt)

        # 2. Generate response using RAG
        with st.chat_message("assistant"):
            message_placeholder = st.empty()
            full_response = ""

            try:
                with st.spinner('উত্তর খুঁজছি...'):
                    result = generate_rag_response(prompt, rag_chain)

                ai_response = result['answer']
                source_docs = result.get('source_documents', [])

                # Simulate typing effect
                for chunk in ai_response.split():
                    full_response += chunk + " "
                    time.sleep(0.02)
                    message_placeholder.markdown(full_response + "▌")

                message_placeholder.markdown(full_response)

                # --- Display Sources (If RAG was used and sources are available) ---
                if source_docs:
                    st.info(f"**তথ্যের উৎস (Corpus থেকে):** {source_docs[0].page_content.strip()}", icon="📖")

            except Exception as e:
                error_response = f"দুঃখিত, উত্তর দেওয়ার সময় একটি API ত্রুটি ঘটেছে: {e}"
                message_placeholder.markdown(error_response)
                full_response = error_response

        # 3. Final state update
        st.session_state.messages.append({"role": "assistant", "content": full_response})
        st.session_state.fsm_history.append(f"Assistant: {full_response}")
