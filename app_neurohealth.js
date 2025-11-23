// ========================================================================
// CANCER PATIENT'S HEALTH EDUCATION - COMPLETE APP.JS (UPDATED FOR IMAGES AND ALL SECTIONS)
// ========================================================================

 // Complete application state based on Streamlit app
const appState = {
    currentState: 'start',
    healthCategory: null,
    selectedSubcategory: null,
    selectedDistrict: null,
    askedQuestions: [],
    q1ToQ5History: [],
    q6ToQ12History: [],
    conversationHistory: [],
    awaitingContactConfirmation: false,
    awaitingDistrictSelection: false,
    initialRagDone: false,
    awaitingFollowupDecision: false,
    followupCount: 0,  // ✅ Should already exist
    countdownSeconds: 90,
    countdownTimer: null
};

// District list for Bengal (5 districts)
const DISTRICT_LIST = [
    "বীরভূম",
    "পুরুলিয়া",
    "বাঁকুড়া",
    "বর্ধমান",
    "আসানসোল"
];

// Cancer Patient's Health Resources (matching Python exactly) - Updated with Asansol
const CANCER_HEALTH_RESOURCES = {
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
            {"name": "বাঁকুড়া সম্মিলনী মেডিকেল কলেজ স্ত্রীরোগ বিভাগ", "phone": "7029473375", "address": "বাঁকুড়া সদর"},
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
};

const DISTRICTS = Object.keys(CANCER_HEALTH_RESOURCES);

// Health categories matching Python exactly
const HEALTH_CATEGORIES = {
    "start": {
    "botPrompt": "নমস্কার! আমি নারীশক্তি, আপনার অস্থি ও সন্ধি বিষয়ক স্বাস্থ্য সংক্রান্ত প্রশ্নে সাহায্য করতে এসেছি। আপনি কোন ধরনের হাড়/পেশী/অর্থোপেডিক সমস্যার বিষয়ে কথা বলতে চান?",
    "options": [
        "১. স্ট্রোক / ব্রেন অ্যাটাক",
        "২. আলঝাইমার / স্মৃতিলোপ",
        "৩. পারকিনসন",
        "৪. এপিলেপসি / মৃগী",
        "৫. মাইগ্রেন / মাথাব্যথা",
        "৬. বহুপ্রকার স্ক্লেরোসিস (Multiple Sclerosis)",
        "৭. নারকোলেপসি / ঘুমের সমস্যা",
        "৮. সেরিব্রাল পালসি",
        "৯. বেলস পলসি",
        "১০. নার্ভ পেইন / নিউরোপ্যাথি",
        "১১. গিলিয়ান-ব্যারে সিন্ড্রোম",
        "১২. হান্টিংটন ডিজিজ"
    ],

    "nextStateMap": {
        "১. স্ট্রোক / ব্রেন অ্যাটাক": "stroke",
        "২. আলঝাইমার / স্মৃতিলোপ": "alzheimer",
        "৩. পারকিনসন": "parkinson",
        "৪. এপিলেপসি / মৃগী": "epilepsy",
        "৫. মাইগ্রেন / মাথাব্যথা": "migraine",
        "৬. বহুপ্রকার স্ক্লেরোসিস (Multiple Sclerosis)": "multiple_sclerosis",
        "৭. নারকোলেপসি / ঘুমের সমস্যা": "narcolepsy",
        "৮. সেরিব্রাল পালসি": "cerebral_palsy",
        "৯. বেলস পলসি": "bells_palsy",
        "১০. নার্ভ পেইন / নিউরোপ্যাথি": "neuropathy",
        "১১. গিলিয়ান-ব্যারে সিন্ড্রোম": "guillain_barre",
        "১২. হান্টিংটন ডিজিজ": "huntington"
     }
},
  "stroke": {
    "botPrompt": "স্ট্রোক/ব্রেন অ্যাটাক থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "হঠাৎ হাত-পা অবশ",
      "বক্তব্য বা কথা বলতে সমস্যা",
      "মুখের একদিকে বেঁকে যাওয়া",
      "দৃষ্টিহীনতা বা ঝাপসা দেখার সমস্যা",
      "চলাফেরা/ব্যালেন্স হারানো"
    ]
  },
  "alzheimer": {
    "botPrompt": "আলঝাইমার/স্মৃতিলোপ থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "স্মৃতিভ্রান্তি",
      "বিবেগ/সিদ্ধান্তে সমস্যা",
      "জিনিস ভুলে যাওয়া",
      "পরিবার বা পরিচিত জনকে না চিনতে পারা",
      "নিজের যত্ন নিতে সমস্যা"
    ]
  },
  "parkinson": {
    "botPrompt": "পারকিনসন থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "শরীরে কম্পন বা কাপুনি",
      "চলার সময় কঠিনতা",
      "শরীর শক্ত/স্টিফ হয়ে যাওয়া",
      "মুখে আবেগহীনতা",
      "স্বচ্ছন্দ/asymmetrical চলাচল"
    ]
  },
  "epilepsy": {
    "botPrompt": "এপিলেপসি/মৃগী রোগে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "বারবার খিঁচুনি/সিজ়ার",
      "অজ্ঞান হয়ে যাওয়া",
      "মুখ বা শরীর শক্ত হয়ে যাওয়া",
      "ভবিষ্যৎ নিয়ে আতঙ্ক",
      "নিজেকে বা অন্যকে কামড়ে দেয়া/জরায়ে টান"
    ]
  },
  "migraine": {
    "botPrompt": "মাইগ্রেন/মাথাব্যথা থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "মাথায় প্রবল ব্যথা",
      "আলো/শব্দে অস্বস্তি",
      "বমি ভাব/বমি",
      "চোখে এতকাল ধরা পড়া",
      "ব্যথার কারণে দৈনন্দিন কাজে অসুবিধা"
    ]
  },
  "multiple_sclerosis": {
    "botPrompt": "বহুপ্রকার স্ক্লেরোসিস (Multiple Sclerosis) থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "দৃষ্টিশক্তি কমে যাওয়া",
      "হাত-পা দুর্বল বা অসাড়",
      "চলার সময় ভারসাম্য হারানো",
      "প্রস্রাব ধরে রাখতে না পারা",
      "দীর্ঘকাল ক্লান্তি/ব্যথা"
    ]
  },
  "narcolepsy": {
    "botPrompt": "নারকোলেপসি/ঘুমের সমস্যা কী কী সমস্যা করতে পারে জানতে চান?",
    "options": [
      "দিনের বেলায় অত্যধিক ঘুম ঘুম ভাব",
      "হঠাৎ ঘুমিয়ে পড়া",
      "পেশী দুর্বলতা (cataplexy)",
      "ঘুমের মধ্যে দুর্ভাবনা",
      "কম মনোযোগ/স্মৃতি সমস্যা"
    ]
  },
  "cerebral_palsy": {
    "botPrompt": "সেরিব্রাল পালসি থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "প্রস্রাব/প্রস্রাবের অসুবিধা",
      "চলাফেরা/হাঁটাচলায় বিলম্ব",
      "মাংসপেশি দুর্বলতা ও স্টিফনেস",
      "সঠিক কথাবার্তা/ভাষায় অসুবিধা",
      "ছোট/বিকৃত যৌথ বিকাশ"
    ]
  },
  "bells_palsy": {
    "botPrompt": "বেলস পলসি রোগে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "মুখের একদিকে দুর্বলতা/ঝুলে যাওয়া",
      "কান/মুখে ব্যথা",
      "চোখ বন্ধ করতে অসুবিধা",
      "স্বাদ পাওয়ায় বিঘ্ন",
      "লালা ঝরা"
    ]
  },
  "neuropathy": {
    "botPrompt": "নার্ভ পেইন/নিউরোপ্যাথি থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "হাত/পায়ে ঝাঝ বা পিন পিন অনুভূতি",
      "চামড়ার স্পর্শে অতিরিক্ত ব্যথা",
      "শক্তি/বলের হ্রাস",
      "চলাফেরায় অসুবিধা",
      "আঙুলে বা পায়ে ফোলা"
    ]
  },
  "guillain_barre": {
    "botPrompt": "গিলিয়ান-ব্যারে সিন্ড্রোমে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "হঠাৎ দুর্বলতা/অসাড়তা",
      "হাঁটা/চলতে সমস্যা",
      "শ্বাসকষ্ট",
      "তীব্র পেশী ব্যথা",
      "রিফ্লেক্স কমে যাওয়া"
    ]
  },
  "huntington": {
    "botPrompt": "হান্টিংটন ডিজিজ রোগে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "অস্বাভাবিক চলাফেরা/হঠাৎ টানা",
      "মানসিক পরিবর্তন/বিষণ্নতা",
      "স্মৃতি কমে যাওয়া",
      "বক্তব্য/কথাবার্তায় অসুবিধা",
      "খাদ্য গিলতে সমস্যা"
    ]
  }
};

// Question sequences matching Python exactly
const QUESTION_SEQUENCES = {

   stroke: [
    "আপনার বয়স কত?",
    "কীভাবে স্ট্রোক/ব্রেন অ্যাটাক হয়েছে?",
    "হঠাৎ করে শুরু হয়েছে?",
    "বক্তব্য/শব্দ বলতে সমস্যা?",
    "হাত-পা দুর্বল/অবশ?",
    "মুখের একদিকে ঝুলে গেছে?",
    "দৃষ্টি ঝাপসা বা কমেছে?",
    "চলতে অসুবিধা হচ্ছে?",
    "বানান/লেখা ভুল হচ্ছে?",
    "পরিবারে কারো স্ট্রোক হয়েছে?",
    "জ্বর/হৃদরোগ ছিল?",
    "রক্তচাপ কত?",
    "চিকিৎসক দেখিয়েছেন?",
    "CT/MRI স্ক্যান হয়েছে?",
    "ওষুধ নিচ্ছেন?"
  ],
  alzheimer: [
    "আপনার বয়স কত?",
    "স্মৃতিভ্রান্তি কতদিন ধরে?",
    "পরিবারের পরিচিত জন চিনতে সমস্যা?",
    "নিজের যত্ন নিতে অসুবিধা?",
    "কোনো জিনিস/পথ ভুলে যান?",
    "কথাবার্তায় সমস্যা?",
    "অসাধারণ আচরণ?",
    "মানসিক পরিবর্তন হচ্ছে?",
    "জ্বর/অন্যান্য রোগ আছে?",
    "পরিবারে কারো স্মৃতিলোপ হয়েছে?",
    "ওষুধ নিচ্ছেন?",
    "নিজে দায়িত্ব নিতে পারেন?",
    "লেখাপড়া ভুল হচ্ছে?",
    "ডাক্তারের পরামর্শ নিয়েছেন?",
    "নিয়মিত পরীক্ষা হচ্ছে?"
  ],
  parkinson: [
    "আপনার বয়স কত?",
    "কাপুনি/কম্পন কবে থেকে হচ্ছে?",
    "চলতে সমস্যা?",
    "শরীর শক্ত/স্টিফ হয়েছে?",
    "মুখে আবেগহীন/লাইভলেস?",
    "চিকা/লালা ঝরা হচ্ছে?",
    "কথা বলতে সমস্যা?",
    "খাদ্য গিলতে অসুবিধা?",
    "চলাফেরা স্বচ্ছন্দ?",
    "পরিবারে কারো এই রোগ?",
    "হাত/পা দুর্বলতা?",
    "ওষুধ নিচ্ছেন?",
    "ডাক্তারের পরামর্শ?",
    "নিয়মিত ফলোআপ করছেন?",
    "কোনো নতুন সমস্যা?"
  ],
  epilepsy: [
    "আপনার বয়স কত?",
    "কবে থেকে খিঁচুনি হচ্ছে?",
    "খিঁচুনি চলাকালীন অজ্ঞান?",
    "কোনো আঘাত হয়েছে?",
    "মুখ/শরীর শক্ত হয়?",
    "বারবার হয় কি?",
    "বমি হয়?",
    "রাতের বেলায় বেশি হয়?",
    "ওষুধ নিচ্ছেন?",
    "পরীক্ষা হয়েছে?",
    "পরিবারে কারো এই সমস্যা?",
    "কিছু খেলে/নে হাত লাগলে সমস্যা বাড়ে?",
    "শেষ খিঁচুনি কবে ছিল?",
    "ডাক্তারের ফলোআপ?",
    "ব্যথা বা দুর্বলতা?"
  ],
  migraine: [
    "আপনার বয়স কত?",
    "মাথাব্যথা কতদিন ধরে?",
    "কেমন ধরনের মাথাব্যথা?",
    "আলো/শব্দে সমস্যা?",
    "বমি বা বমি ভাব হয়?",
    "কোনো নির্দিষ্ট সময়ে বাড়ে?",
    "চোখে অসুবিধা?",
    "পরিবারে কারো এই সমস্যা?",
    "ওষুধ নিচ্ছেন?",
    "কিছু খেলেই বেশি হয়?",
    "ডাক্তারের পরামর্শ নিয়েছেন?",
    "কথা বলতে সমস্যা?",
    "ব্যায়াম করেন?",
    "শরীর দুর্বল লাগে?",
    "বিভিন্ন ট্রিগার আছে?"
  ],
  multiple_sclerosis: [
    "আপনার বয়স কত?",
    "দৃষ্টিশক্তি কতদিন ধরে কমে?",
    "হাত-পা দুর্বল?",
    "চলতে/হাঁটতে অসুবিধা?",
    "প্রস্রাব/পায়খানা ধরে রাখতে সমস্যা?",
    "বারবার ক্লান্তি?",
    "চলাফেরায় ভারসাম্য?",
    "পরীক্ষা হয়েছে?",
    "পরিবারে কারো MS?",
    "ওষুধ নিচ্ছেন?",
    "ডাক্তারের পরামর্শ?",
    "নিয়মিত ফলোআপ?",
    "কিছু খেলাকি সমস্যা বাড়ে?",
    "টুংকার/ঝিঁ ঝিঁ ভাব?",
    "নতুন লক্ষণ এসেছে?"
  ],
  narcolepsy: [
    "আপনার বয়স কত?",
    "দিনের বেলায় ঘুম ঘুম ভাব?",
    "হঠাৎ ঘুমিয়ে পড়েন?",
    "রাতের ঘুম কেমন?",
    "কোনো আবেগের সময় দুর্বলতা?",
    "পেশী দুর্বল?",
    "ক্লান্তি কেমন?",
    "কথা বলতে অসুবিধা?",
    "ওষুধ নিচ্ছেন?",
    "ডাক্তারের পরামর্শ?",
    "পরীক্ষা হয়েছে?",
    "পরিবারে কারো সমস্যা?",
    "কি কাজ করলে সমস্যা বাড়ে?",
    "বিভিন্ন ট্রিগার আছে?",
    "শরীর দুর্বল লাগে?"
  ],
  cerebral_palsy: [
    "রোগীর বয়স কত?",
    "হাঁটা/বলতে সমস্যা?",
    "পেশী স্টিফ বা দুর্বল?",
    "নিজে খেতে/চলতে পারে?",
    "কথাবার্তায় সমস্যা?",
    "শ্বাসকষ্ট আছে?",
    "পরিবারে কারো CP?",
    "চলাফেরা তৈরিতে বিলম্ব?",
    "কোনো টাইম/রুটিন চলে?",
    "ওষুধ নিচ্ছেন?",
    "ডাক্তারের ফলোআপ?",
    "কোনো নতুন লক্ষণ?",
    "যোগব্যায়াম/থেরাপি নিচ্ছেন?",
    "রোগীর খাওয়া-দাওয়া কেমন?",
    "কোনো ইনজুরি হয়েছে?"
  ],
  bells_palsy: [
    "আপনার বয়স কত?",
    "মুখে একদিকে দুর্বলতা?",
    "চোখ বন্ধ করতে সমস্যা?",
    "স্বাদ কমে গেছে?",
    "কান/মুখে ব্যথা?",
    "লালা ঝরছে?",
    "কথা বলতে সমস্যা?",
    "কোনো ভাইরাস/ইনফেকশন?",
    "ওষুধ নিচ্ছেন?",
    "পরীক্ষা হয়েছে?",
    "পরিবারে কারো এই সমস্যা?",
    "ডাক্তারের পরামর্শ?",
    "নিয়মিত ফলোআপ?",
    "মুখের অন্য কোথাও অসুবিধা?",
    "নতুন লক্ষণ আছে?"
  ],
  neuropathy: [
    "আপনার বয়স কত?",
    "কোথায় ঝিঁ ঝিঁ বা পিন পিন?",
    "হাত/পায়ে দুর্বলতা?",
    "চামড়া ছোঁয়ায় ব্যথা?",
    "চলাফেরা সমস্যা?",
    "পরীক্ষা হয়েছে?",
    "ডায়াবেটিস আছে?",
    "ওষুধ নিচ্ছেন?",
    "পরিবারে কারো নিউরোপ্যাথি?",
    "শরীরে ফোলা?",
    "ডাক্তারের ফলোআপ?",
    "নিয়মিত ব্যায়াম?",
    "নতুন সমস্যা এসেছে?",
    "বিভিন্ন ট্রিগার?",
    "শরীর দুর্বল?"
  ],
  guillain_barre: [
    "আপনার বয়স কত?",
    "হঠাৎ দুর্বলতা/অসাড়তা শুরু কবে?",
    "হাঁটতে সমস্যা?",
    "শ্বাসকষ্ট?",
    "তীব্র পেশী ব্যথা?",
    "রিফ্লেক্স কমেছে?",
    "পুরাতন ইনফেকশন ছিল?",
    "ওষুধ নিচ্ছেন?",
    "পরীক্ষা হয়েছে?",
    "ডাক্তারের পরামর্শ?",
    "পরিবারে কারো এই সমস্যা?",
    "নিয়মিত ফলোআপ?",
    "শরীরে নতুন সমস্যা?",
    "শরীরে ভারসাম্য আছে?",
    "কোনো ট্রিগার আছে?"
  ],
  huntington: [
    "আপনার বয়স কত?",
    "অস্বাভাবিক চলাফেরা/টানা?",
    "মানসিক পরিবর্তন?",
    "স্মৃতি দুর্বল?",
    "খাদ্য/কথা/গিলতে অসুবিধা?",
    "পরীক্ষা হয়েছে?",
    "পরিবারে কারো HD?",
    "ওষুধ নিচ্ছেন?",
    "ডাক্তারের পরামর্শ?",
    "নিয়মিত ফলোআপ?",
    "নতুন লক্ষণ?",
    "ক্লান্তি/নার্ভ সমস্যা?",
    "শরীর দুর্বল?",
    "বিভিন্ন ট্রিগার?",
    "মানসিক চিকিৎসা?"
  ]
};

const diseases = [
{
    name: 'Alzheimer’s Disease',
    category: 'Neurodegenerative Disorder',
    ageGroup: 'Older adults',
    symptoms: [
        'Memory loss',
        'Confusion',
        'Language problems',
        'Impaired reasoning'
    ],
    causes: [
        'Abnormal protein buildup',
        'Genetics',
        'Age'
    ],
    treatment: [
        'Cholinesterase inhibitors',
        'Memantine',
        'Supportive care'
    ],
    prevention: 'Healthy lifestyle, mental stimulation.',
    imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Alzheimer’s Disease</a>'
},
{
    name: 'Parkinson’s Disease',
    category: 'Neurodegenerative Disorder',
    ageGroup: 'Middle-aged and older adults',
    symptoms: [
        'Tremors',
        'Stiffness',
        'Slow movement',
        'Balance problems'
    ],
    causes: [
        'Loss of dopamine-producing cells',
        'Genetics',
        'Environmental risk factors'
    ],
    treatment: [
        'Levodopa',
        'Dopamine agonists',
        'Physical therapy'
    ],
    prevention: 'No proven prevention, but healthy living may help.',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Parkinson’s Disease</a>'
},
{
    name: 'Epilepsy',
    category: 'Seizure Disorder',
    ageGroup: 'All ages',
    symptoms: [
        'Seizures',
        'Confusion',
        'Loss of consciousness',
        'Staring spells'
    ],
    causes: [
        'Genetic factors',
        'Brain injury',
        'Infections',
        'Stroke'
    ],
    treatment: [
        'Antiepileptic drugs',
        'Ketogenic diet',
        'Surgery (select cases)'
    ],
    prevention: 'Reduce brain injury risk, early treatment for infections.',
    imageUrl: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Epilepsy</a>'
},
{
    name: 'Stroke',
    category: 'Neurovascular Disorder',
    ageGroup: 'Older adults',
    symptoms: [
        'Sudden weakness',
        'Speech difficulty',
        'Facial droop',
        'Loss of vision'
    ],
    causes: [
        'Blocked or ruptured blood vessel',
        'High blood pressure',
        'Clotting disorder'
    ],
    treatment: [
        'Clot-busting drugs (for acute ischemic)',
        'Rehabilitation'
    ],
    prevention: 'Control blood pressure and cholesterol, regular exercise.',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d15',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Stroke</a>'
},

{
    name: 'Multiple Sclerosis',
    category: 'Autoimmune CNS Disorder',
    ageGroup: 'Young/middle-aged adults',
    symptoms: [
        'Vision problems',
        'Muscle weakness',
        'Numbness',
        'Coordination issues'
    ],
    causes: [
        'Immune system attacks myelin',
        'Genetic factors'
    ],
    treatment: [
        'Disease-modifying drugs',
        'Symptomatic therapy',
        'Rehabilitation'
    ],
    prevention: 'No proven prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Multiple Sclerosis</a>'
},

{
    name: 'Migraine',
    category: 'Neurological Headache Disorder',
    ageGroup: 'Adolescents to adults',
    symptoms: [
        'Pulsating headache',
        'Nausea',
        'Sensitivity to light',
        'Sensitivity to sound'
    ],
    causes: [
        'Genetics',
        'Hormonal changes',
        'Triggers (stress, foods)'
    ],
    treatment: [
        'Triptans',
        'Analgesics',
        'Preventive medications'
    ],
    prevention: 'Identify triggers, stress reduction, healthy habits.',
    imageUrl: 'https://images.unsplash.com/photo-1455541029258-491ca118e0a9',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Migraine</a>'
},
{
    name: 'Amyotrophic Lateral Sclerosis (ALS)',
    category: 'Motor Neuron Disease',
    ageGroup: 'Middle-aged and older adults',
    symptoms: [
        'Progressive muscle weakness',
        'Difficulty speaking',
        'Difficulty swallowing'
    ],
    causes: [
        'Genetic mutations',
        'Environmental factors'
    ],
    treatment: [
        'Riluzole',
        'Edaravone',
        'Supportive care',
        'Assistive devices'
    ],
    prevention: 'No proven prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, ALS</a>'
},

{
    name: 'Bell’s Palsy',
    category: 'Cranial Nerve Disorder',
    ageGroup: 'All ages, more common in adults',
    symptoms: [
        'Sudden facial paralysis',
        'Facial drooping',
        'Tearing',
        'Change in taste'
    ],
    causes: [
        'Viral infection (often herpes simplex)'
    ],
    treatment: [
        'Steroids',
        'Antiviral drugs',
        'Eye care'
    ],
    prevention: 'No known prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Bell’s Palsy</a>'
},

{
    name: 'Cerebral Palsy',
    category: 'Pediatric Movement Disorder',
    ageGroup: 'Infants and children',
    symptoms: [
        'Motor delays',
        'Stiff or floppy movements',
        'Poor coordination'
    ],
    causes: [
        'Birth injury',
        'Prematurity',
        'Infection'
    ],
    treatment: [
        'Physical therapy',
        'Occupational therapy',
        'Speech therapy',
        'Medication',
        'Surgery'
    ],
    prevention: 'Prenatal care, infection prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Cerebral Palsy</a>'
},

{
    name: 'Huntington’s Disease',
    category: 'Genetic Neurodegenerative Disorder',
    ageGroup: 'Adults (midlife onset)',
    symptoms: [
        'Involuntary movements',
        'Psychiatric problems',
        'Cognitive decline'
    ],
    causes: [
        'HTT gene mutation (autosomal dominant)'
    ],
    treatment: [
        'Supportive care',
        'Medications for symptoms'
    ],
    prevention: 'Genetic counseling for families at risk.',
    imageUrl: 'https://images.unsplash.com/photo-1417732845721-bc1bfd6fd53b',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Huntington’s Disease</a>'
},

{
    name: 'Peripheral Neuropathy',
    category: 'Peripheral Nerve Disorder',
    ageGroup: 'All ages, common in older adults',
    symptoms: [
        'Tingling',
        'Numbness',
        'Pain',
        'Weakness in hands/feet'
    ],
    causes: [
        'Diabetes',
        'Vitamin deficiency',
        'Alcohol',
        'Drugs'
    ],
    treatment: [
        'Glycemic control',
        'Supplements',
        'Pain management'
    ],
    prevention: 'Control diabetes/alcohol, healthy diet.',
    imageUrl: 'https://images.unsplash.com/photo-1454023492550-5696e2f8ab9b',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Peripheral Neuropathy</a>'
},

{
    name: 'Guillain-Barré Syndrome',
    category: 'Autoimmune Peripheral Neuropathy',
    ageGroup: 'All ages',
    symptoms: [
        'Rapid muscle weakness',
        'Tingling',
        'Loss of reflexes'
    ],
    causes: [
        'Immune response after infection (e.g., respiratory/GI)'
    ],
    treatment: [
        'IVIG',
        'Plasmapheresis',
        'Supportive care'
    ],
    prevention: 'No proven prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Guillain-Barré Syndrome</a>'
},

{
    name: 'Myasthenia Gravis',
    category: 'Neuromuscular Junction Disorder',
    ageGroup: 'All ages, more common in women <40 and men >60',
    symptoms: [
        'Muscle weakness',
        'Ptosis',
        'Double vision',
        'Fatigability'
    ],
    causes: [
        'Autoimmune process targeting acetylcholine receptors'
    ],
    treatment: [
        'Acetylcholinesterase inhibitors',
        'Immunosuppressants'
    ],
    prevention: 'No known prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1424746219973-8fe3bd07d8e9',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Myasthenia Gravis</a>'
},

{
    name: 'Encephalitis',
    category: 'Infectious Brain Disorder',
    ageGroup: 'All ages',
    symptoms: [
        'Fever',
        'Headache',
        'Confusion',
        'Seizures'
    ],
    causes: [
        'Viral or bacterial infections (herpes, arbovirus)'
    ],
    treatment: [
        'Antiviral (acyclovir)',
        'Supportive care'
    ],
    prevention: 'Vaccination, mosquito control.',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d15',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Encephalitis</a>'
},

{
    name: 'Meningitis',
    category: 'Infectious CNS Disorder',
    ageGroup: 'All ages',
    symptoms: [
        'Neck stiffness',
        'Fever',
        'Headache',
        'Altered mental status'
    ],
    causes: [
        'Bacterial infections',
        'Viral infections',
        'Fungal infections'
    ],
    treatment: [
        'Antibiotics',
        'Antivirals',
        'Supportive care'
    ],
    prevention: 'Vaccination, hygienic practices.',
    imageUrl: 'https://images.unsplash.com/photo-1417742712349-5fdfb06a03fa',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Meningitis</a>'
},

{
    name: 'Traumatic Brain Injury (TBI)',
    category: 'Neurotraumatic Disorder',
    ageGroup: 'All ages, more common in youth/adults',
    symptoms: [
        'Loss of consciousness',
        'Headache',
        'Confusion',
        'Amnesia'
    ],
    causes: [
        'Falls',
        'Accidents',
        'Sports injuries'
    ],
    treatment: [
        'Emergency care',
        'Rehabilitation',
        'Cognitive therapy'
    ],
    prevention: 'Helmet use, fall prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1453280149-0a2fd7b1b5c7',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, TBI</a>'
},

{
    name: 'Spinal Cord Injury',
    category: 'Neurotraumatic Disorder',
    ageGroup: 'All ages, more common in youth/adults',
    symptoms: [
        'Loss of sensation below injury site',
        'Loss of motor function below injury site'
    ],
    causes: [
        'Accidents',
        'Violence',
        'Falls'
    ],
    treatment: [
        'Emergency stabilization',
        'Rehabilitation'
    ],
    prevention: 'Safety measures, violence prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3e360f',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Spinal Cord Injury</a>'
},

{
    name: 'Essential Tremor',
    category: 'Movement Disorder',
    ageGroup: 'All ages, most common in older adults',
    symptoms: [
        'Uncontrollable shaking of hands',
        'Head shaking',
        'Voice tremor'
    ],
    causes: [
        'Genetic predisposition',
        'Idiopathic'
    ],
    treatment: [
        'Beta-blockers',
        'Anticonvulsants',
        'Deep brain stimulation'
    ],
    prevention: 'None proven.',
    imageUrl: 'https://images.unsplash.com/photo-1457354642327-5a946e8b1b29',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Essential Tremor</a>'
},

{
    name: 'Dystonia',
    category: 'Movement Disorder',
    ageGroup: 'All ages',
    symptoms: [
        'Involuntary muscle contractions',
        'Twisting movements',
        'Repetitive movements'
    ],
    causes: [
        'Genetic',
        'Injury',
        'Drugs'
    ],
    treatment: [
        'Botulinum toxin',
        'Medications',
        'Physiotherapy'
    ],
    prevention: 'Avoid offending drugs, genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Dystonia</a>'
},

{
    name: 'Tourette Syndrome',
    category: 'Tic Disorder',
    ageGroup: 'Children and adolescents',
    symptoms: [
        'Motor tics',
        'Vocal tics',
        'Blinking',
        'Throat clearing'
    ],
    causes: [
        'Genetic',
        'Neurochemical'
    ],
    treatment: [
        'Antipsychotic medications',
        'Behavioral therapy'
    ],
    prevention: 'No known prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1447366371808-6c1f13881fb7',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Tourette Syndrome</a>'
},

{
    name: 'Cluster Headache',
    category: 'Headache Disorder',
    ageGroup: 'Adults, especially males',
    symptoms: [
        'Severe unilateral headache',
        'Red/watery eye',
        'Restlessness'
    ],
    causes: [
        'Unknown',
        'Possibly trigeminal activation'
    ],
    treatment: [
        'Oxygen therapy',
        'Triptans',
        'Preventive medicines'
    ],
    prevention: 'Avoid alcohol, establish regular sleep.',
    imageUrl: 'https://images.unsplash.com/photo-1424746219973-8fe3bd07d8e9',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Cluster Headache</a>'
},

{
    name: 'Neuralgia (Trigeminal)',
    category: 'Cranial Nerve Pain Disorder',
    ageGroup: 'Older adults',
    symptoms: [
        'Brief stabbing facial pain'
    ],
    causes: [
        'Compression/irritation of trigeminal nerve'
    ],
    treatment: [
        'Carbamazepine',
        'Surgery'
    ],
    prevention: 'No known prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1454023492550-5696e2f8ab9b',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Neuralgia</a>'
},

{
    name: 'Restless Legs Syndrome',
    category: 'Movement/Sleep Disorder',
    ageGroup: 'Adults, especially older women',
    symptoms: [
        'Irresistible urge to move legs',
        'Discomfort at rest'
    ],
    causes: [
        'Iron deficiency',
        'Genetics',
        'Neuropathy'
    ],
    treatment: [
        'Dopaminergic drugs',
        'Iron supplements'
    ],
    prevention: 'Treat iron deficiency, healthy habits.',
    imageUrl: 'https://images.unsplash.com/photo-1455541029258-491ca118e0a9',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Restless Legs Syndrome</a>'
},

{
    name: 'Narcolepsy',
    category: 'Sleep Disorder',
    ageGroup: 'Adolescents and young adults',
    symptoms: [
        'Excessive daytime sleepiness',
        'Cataplexy',
        'Sleep attacks'
    ],
    causes: [
        'Loss of hypocretin/orexin produced by hypothalamus',
        'Autoimmune'
    ],
    treatment: [
        'Stimulant medications',
        'Scheduled naps'
    ],
    prevention: 'No known prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Narcolepsy</a>'
},

{
    name: 'Ataxia (Cerebellar type)',
    category: 'Movement Disorder',
    ageGroup: 'All ages',
    symptoms: [
        'Poor balance',
        'Uncoordinated movements',
        'Difficulty walking'
    ],
    causes: [
        'Genetics',
        'Toxins',
        'Stroke',
        'Infection'
    ],
    treatment: [
        'Physiotherapy',
        'Supportive management',
        'Treat underlying cause'
    ],
    prevention: 'Avoid neurotoxins, genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1417742712349-5fdfb06a03fa',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Ataxia</a>'
},

{
    name: 'Pick’s Disease (Frontotemporal Dementia)',
    category: 'Neurodegenerative Dementia',
    ageGroup: 'Older adults',
    symptoms: [
        'Behavioral changes',
        'Language problems'
    ],
    causes: [
        'Abnormal tau protein (pick bodies)',
        'Genetic'
    ],
    treatment: [
        'Supportive care',
        'Behavioral therapy'
    ],
    prevention: 'Genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1417732845721-bc1bfd6fd53b',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Frontotemporal Dementia</a>'
},

{
    name: 'Lewy Body Dementia',
    category: 'Neurodegenerative Dementia',
    ageGroup: 'Older adults',
    symptoms: [
        'Fluctuating cognition',
        'Visual hallucinations',
        'Motor symptoms'
    ],
    causes: [
        'Lewy body accumulation',
        'Genetics'
    ],
    treatment: [
        'Cholinesterase inhibitors',
        'Supportive care'
    ],
    prevention: 'No known prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Lewy Body Dementia</a>'
},

{
    name: 'Progressive Supranuclear Palsy',
    category: 'Parkinsonism',
    ageGroup: 'Older adults',
    symptoms: [
        'Problems with balance',
        'Gaze palsy',
        'Slowed movement'
    ],
    causes: [
        'Tau protein aggregation'
    ],
    treatment: [
        'Supportive care',
        'Physiotherapy'
    ],
    prevention: 'Genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Progressive Supranuclear Palsy</a>'
},

{
    name: 'CADASIL',
    category: 'Genetic Stroke Disorder',
    ageGroup: 'Adults (usually onset in 30s-50s)',
    symptoms: [
        'Recurrent strokes',
        'Migraine',
        'Cognitive decline'
    ],
    causes: [
        'NOTCH3 gene mutation'
    ],
    treatment: [
        'Supportive care',
        'Risk factor control'
    ],
    prevention: 'Genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3e360f',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, CADASIL</a>'
},

{
    name: 'Dravet Syndrome',
    category: 'Genetic Epilepsy',
    ageGroup: 'Infancy',
    symptoms: [
        'Severe recurrent seizures',
        'Developmental delay'
    ],
    causes: [
        'SCN1A gene mutation'
    ],
    treatment: [
        'Anti-seizure medications',
        'Supportive care'
    ],
    prevention: 'Genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1417742712349-5fdfb06a03fa',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Dravet Syndrome</a>'
},

{
    name: 'Charcot-Marie-Tooth Disease',
    category: 'Genetic Peripheral Neuropathy',
    ageGroup: 'All ages',
    symptoms: [
        'Foot drop',
        'Muscle weakness',
        'Sensory loss'
    ],
    causes: [
        'Multiple gene mutations'
    ],
    treatment: [
        'Physical therapy',
        'Orthoses'
    ],
    prevention: 'Genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1424746219973-8fe3bd07d8e9',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Charcot-Marie-Tooth Disease</a>'
},

{
    name: 'Muscular Dystrophy',
    category: 'Genetic Muscle Disease',
    ageGroup: 'Children and young adults',
    symptoms: [
        'Progressive muscle weakness',
        'Gait abnormality'
    ],
    causes: [
        'Dystrophin gene mutations (Duchenne, Becker)'
    ],
    treatment: [
        'Physical therapy',
        'Supportive care',
        'Steroids'
    ],
    prevention: 'Genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Muscular Dystrophy</a>'
},

{
    name: 'Neurofibromatosis',
    category: 'Genetic Tumor Disorder',
    ageGroup: 'All ages',
    symptoms: [
        'Multiple skin tumors',
        'Learning problems',
        'Optic gliomas'
    ],
    causes: [
        'NF1/NF2 gene mutations'
    ],
    treatment: [
        'Surgery (for tumors)',
        'Regular surveillance'
    ],
    prevention: 'Genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1402717405986-d07a16c70a90',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Neurofibromatosis</a>'
},

{
    name: 'Hydrocephalus',
    category: 'CSF Flow Disorder',
    ageGroup: 'Infants, children, adults',
    symptoms: [
        'Head enlargement (children)',
        'Headache',
        'Confusion (adults)'
    ],
    causes: [
        'CSF accumulation',
        'Congenital',
        'Acquired'
    ],
    treatment: [
        'Surgical shunt placement'
    ],
    prevention: 'Early treatment of infections, spina bifida.',
    imageUrl: 'https://images.unsplash.com/photo-1417732845721-bc1bfd6fd53b',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Hydrocephalus</a>'
},

{
    name: 'Locked-In Syndrome',
    category: 'Brainstem Disorder',
    ageGroup: 'Adults',
    symptoms: [
        'Paralysis of all voluntary muscles except eye movement'
    ],
    causes: [
        'Stroke',
        'Trauma',
        'Demyelination'
    ],
    treatment: [
        'Supportive care',
        'Assistive technology'
    ],
    prevention: 'Stroke prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Locked-In Syndrome</a>'
},
{
    name: 'Polio/Post-Polio Syndrome',
    category: 'Infectious Neuromuscular Disorder',
    ageGroup: 'Former polio patients',
    symptoms: [
        'Progressive muscle weakness',
        'Fatigue',
        'Pain'
    ],
    causes: [
        'Late effects of polio virus infection'
    ],
    treatment: [
        'Supportive care',
        'Physiotherapy'
    ],
    prevention: 'Vaccination (prevention of primary polio).',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d15',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Post-Polio Syndrome</a>'
},

{
    name: 'Williams Syndrome',
    category: 'Genetic Neurodevelopmental Disorder',
    ageGroup: 'Children',
    symptoms: [
        'Developmental delay',
        'Unique facial features',
        'Heart defects'
    ],
    causes: [
        'Deletion of genes on chromosome 7'
    ],
    treatment: [
        'Supportive care',
        'Therapy for learning and heart issues'
    ],
    prevention: 'Genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Williams Syndrome</a>'
},

{
    name: 'Rett Syndrome',
    category: 'Genetic Neurodevelopmental Disorder',
    ageGroup: 'Girls (early childhood)',
    symptoms: [
        'Loss of motor skills',
        'Loss of language skills',
        'Handwringing'
    ],
    causes: [
        'MECP2 gene mutation'
    ],
    treatment: [
        'Supportive care',
        'Physiotherapy',
        'Anticonvulsants'
    ],
    prevention: 'Genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1454023492550-5696e2f8ab9b',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Rett Syndrome</a>'
},

{
    name: 'Schizophrenia (Neuropsychiatric)',
    category: 'Neuropsychiatric Disorder',
    ageGroup: 'Adolescents and adults',
    symptoms: [
        'Delusions',
        'Hallucinations',
        'Emotional flattening'
    ],
    causes: [
        'Neurochemical imbalance',
        'Genetic',
        'Environmental factors'
    ],
    treatment: [
        'Antipsychotic drugs',
        'Psychotherapy'
    ],
    prevention: 'Early intervention in symptomatic cases.',
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Schizophrenia</a>'
},

{
    name: 'Autism Spectrum Disorder',
    category: 'Neurodevelopmental Behavioral Disorder',
    ageGroup: 'Children, adolescents',
    symptoms: [
        'Communication deficits',
        'Repetitive behaviors',
        'Social challenges'
    ],
    causes: [
        'Genetic',
        'Environmental factors'
    ],
    treatment: [
        'Behavioral therapy',
        'Special education support'
    ],
    prevention: 'No proven prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1424746219973-8fe3bd07d8e9',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Autism Spectrum Disorder</a>'
},
{
    name: 'Status Epilepticus',
    category: 'Life-Threatening Seizure Disorder',
    ageGroup: 'All ages',
    symptoms: [
        'Prolonged seizures',
        'Repeated seizures without recovery'
    ],
    causes: [
        'Untreated epilepsy',
        'Infection',
        'Metabolic disturbances'
    ],
    treatment: [
        'Emergency antiepileptic drugs'
    ],
    prevention: 'Epilepsy control, infection prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Status Epilepticus</a>'
},

{
    name: 'Sydenham Chorea',
    category: 'Movement Disorder (rheumatic)',
    ageGroup: 'Children (post-strep infection)',
    symptoms: [
        'Jerky involuntary movements',
        'Emotional instability'
    ],
    causes: [
        'Autoimmune response after streptococcal infection'
    ],
    treatment: [
        'Antibiotics',
        'Supportive care'
    ],
    prevention: 'Treat strep infections promptly.',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Sydenham Chorea</a>'
},

{
    name: 'Ramsay Hunt Syndrome',
    category: 'Cranial Nerve Viral Disorder',
    ageGroup: 'Adults',
    symptoms: [
        'Facial paralysis',
        'Ear pain',
        'Blisters',
        'Hearing loss'
    ],
    causes: [
        'Varicella-zoster virus infection'
    ],
    treatment: [
        'Antivirals',
        'Steroids',
        'Supportive care'
    ],
    prevention: 'Shingles vaccination.',
    imageUrl: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Ramsay Hunt Syndrome</a>'
},

{
    name: 'Vasculitic Neuropathy',
    category: 'Autoimmune Peripheral Disorder',
    ageGroup: 'Adults',
    symptoms: [
        'Pain',
        'Weakness of limbs',
        'Loss of sensation'
    ],
    causes: [
        'Blood vessel inflammation (vasculitis)'
    ],
    treatment: [
        'Immunosuppressive drugs',
        'Steroids'
    ],
    prevention: 'Early diagnosis and treatment of autoimmune disease.',
    imageUrl: 'https://images.unsplash.com/photo-1402717405986-d07a16c70a90',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Vasculitic Neuropathy</a>'
},

{
    name: 'Prion Disease (Creutzfeldt-Jakob)',
    category: 'Infectious Neurodegenerative Disorder',
    ageGroup: 'Adults',
    symptoms: [
        'Rapid dementia',
        'Myoclonus',
        'Ataxia',
        'Fatal outcome'
    ],
    causes: [
        'Misfolded prion protein',
        'Sporadic/genetic'
    ],
    treatment: [
        'Supportive care'
    ],
    prevention: 'Medical safety, genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1453280149-0a2fd7b1b5c7',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Prion Disease</a>'
},

{
    name: 'Spinocerebellar Ataxia',
    category: 'Genetic Movement Disorder',
    ageGroup: 'Children/adults',
    symptoms: [
        'Poor balance',
        'Gait abnormality',
        'Speech changes'
    ],
    causes: [
        'Various gene mutations'
    ],
    treatment: [
        'Supportive therapy',
        'Physiotherapy'
    ],
    prevention: 'Genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1447366371808-6c1f13881fb7',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Spinocerebellar Ataxia</a>'
},

{
    name: 'Tuberous Sclerosis',
    category: 'Genetic Neurocutaneous Disorder',
    ageGroup: 'Infancy, childhood',
    symptoms: [
        'Skin lesions',
        'Seizures',
        'Learning problems'
    ],
    causes: [
        'TSC1/TSC2 gene mutations'
    ],
    treatment: [
        'Antiepileptics',
        'Surgery for tumors',
        'Supportive care'
    ],
    prevention: 'Genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3e360f',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Tuberous Sclerosis</a>'
},

{
    name: 'Central Pain Syndrome',
    category: 'Pain Disorder (post-CNS injury)',
    ageGroup: 'All ages',
    symptoms: [
        'Chronic pain after stroke, MS, injury'
    ],
    causes: [
        'CNS injury'
    ],
    treatment: [
        'Pain medications',
        'Rehabilitation'
    ],
    prevention: 'Prevent CNS injury.',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d15',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Central Pain Syndrome</a>'
},

{
    name: 'Delirium',
    category: 'Acute Brain Functional Disorder',
    ageGroup: 'Older adults',
    symptoms: [
        'Sudden confusion',
        'Agitation',
        'Disorientation'
    ],
    causes: [
        'Infection',
        'Drugs',
        'Metabolic imbalance'
    ],
    treatment: [
        'Treat underlying cause',
        'Supportive care'
    ],
    prevention: 'Medication surveillance, infection management.',
    imageUrl: 'https://images.unsplash.com/photo-1455541029258-491ca118e0a9',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Delirium</a>'
},

{
    name: 'Complex Regional Pain Syndrome',
    category: 'Chronic Pain Disorder (post-injury)',
    ageGroup: 'All ages',
    symptoms: [
        'Severe pain',
        'Swelling',
        'Changes in skin color/temperature'
    ],
    causes: [
        'Injury',
        'Abnormal nerve response'
    ],
    treatment: [
        'Pain management',
        'Physical therapy'
    ],
    prevention: 'Early mobilization after injury.',
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    citation: '<a href="https://www.ninds.nih.gov/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NINDS, Complex Regional Pain Syndrome</a>'
}


];

const doctorsData = {
  'Delhi': [
    {
      name: 'Dr. Manjari Tripathi',
      credentials: 'MBBS, DM (Neurology), Prof – AIIMS',
      experience: '26+ Years Experience',
      hospital: 'AIIMS, New Delhi',
      address: 'Sri Aurobindo Marg, Ansari Nagar, Delhi - 110029',
      phone: '+91 11 2658 8500',
      email: 'manjari.tripathi@aiims.edu',
      hours: 'Tue/Fri 9AM-2PM',
      specializations: 'Dementia, Alzheimer\'s, Epilepsy, Advanced Neurocare',
      bookingLink: 'https://www.aiims.edu',
      rating: '4.9/5 (1420 reviews)'
    },
    {
      name: 'Dr. V. S. Mehta',
      credentials: 'MBBS, MCh (Neurosurgery), Padma Shri',
      experience: '38+ Years Experience',
      hospital: 'Medanta The Medicity, Gurgaon',
      address: 'Sector 38, Gurgaon, NCR - 122001',
      phone: '+91 124 4141 414',
      email: 'vs.mehta@medanta.org',
      hours: 'Mon, Wed, Sat 10AM–3PM',
      specializations: 'Brain Tumor, Stroke, Spine, Pediatric Neuro',
      bookingLink: 'https://www.medanta.org',
      rating: '4.8/5 (1172 reviews)'
    },

    {
      name: 'Dr. Arun B. Koul',
      credentials: 'MBBS, DM (Neurology)',
      experience: '34+ Years Experience',
      hospital: 'Fortis Flt. Lt. Rajan Dhall Hospital',
      address: 'Sector B, Vasant Kunj, New Delhi - 110070',
      phone: '+91 11 4277 6222',
      email: 'arun.koul@fortishealthcare.com',
      hours: 'Mon-Fri 10AM-1PM',
      specializations: 'Brain Stroke, Epilepsy, Headache, Memory Disorders',
      bookingLink: 'https://www.fortishealthcare.com',
      rating: '4.8/5 (980 reviews)'
    },

    {
      name: 'Dr. Kameshwar Prasad',
      credentials: 'MBBS, MD, DM (Neurology), Prof - AIIMS',
      experience: '37+ Years Experience',
      hospital: 'AIIMS, New Delhi',
      address: 'Sri Aurobindo Marg, Ansari Nagar, Delhi - 110029',
      phone: '+91 11 2658 8500',
      email: 'kprasad@aiims.edu',
      hours: 'Mon, Thu 10AM-2PM',
      specializations: 'Stroke, Neuroepidemiology, Movement Disorders',
      bookingLink: 'https://www.aiims.edu',
      rating: '4.8/5 (1355 reviews)'
    },
    {
      name: 'Dr. Ashok Panagariya',
      credentials: 'MD, DM (Neurology), FRCP, FAMS',
      experience: '40+ Years Experience',
      hospital: 'Sir Ganga Ram Hospital',
      address: 'Rajinder Nagar, New Delhi - 110060',
      phone: '+91 11 4225 5225',
      email: 'ashok.panagariya@sgrh.com',
      hours: 'Tue, Fri 12PM-6PM',
      specializations: 'Epilepsy, Neuromuscular Junction, MS',
      bookingLink: 'https://www.sgrh.com',
      rating: '4.7/5 (888 reviews)'
    },
    {
      name: 'Dr. Achal Kumar Srivastava',
      credentials: 'MBBS, MD, DM, Prof - AIIMS',
      experience: '29+ Years Experience',
      hospital: 'AIIMS, New Delhi',
      address: 'Sri Aurobindo Marg, Ansari Nagar, Delhi - 110029',
      phone: '+91 11 2658 8700',
      email: 'achal@aiims.edu',
      hours: 'Mon-Wed 2PM-6PM',
      specializations: 'Parkinson’s, Movement Disorders, Neurogenetics',
      bookingLink: 'https://www.aiims.edu',
      rating: '4.7/5 (599 reviews)'
    },
    {
      name: 'Dr. Rajinder K. Dhamija',
      credentials: 'MBBS, MD, DM (Neuro), Director, Lady Hardinge',
      experience: '25+ Years Experience',
      hospital: 'Lady Hardinge Medical College',
      address: 'Connaught Place, New Delhi - 110001',
      phone: '+91 11 2340 7000',
      email: 'rkdhamija@lhmc.edu.in',
      hours: 'Tue, Thu 10AM–1PM',
      specializations: 'Headache, Stroke, Neuroinfections',
      bookingLink: 'https://www.lhmc-hosp.gov.in',
      rating: '4.8/5 (799 reviews)'
    }
  ],
  'Mumbai': [
    {
      name: 'Dr. Nirmal Surya',
      credentials: 'MBBS, DM (Neurology), President, Indian Stroke Association',
      experience: '28+ Years Experience',
      hospital: 'Bombay Hospital Institute of Medical Sciences',
      address: 'Marine Lines, Mumbai - 400020',
      phone: '+91 22 2206 4646',
      email: 'nirmal.surya@bombayhospital.com',
      hours: 'Mon-Sat 9AM-1PM',
      specializations: 'Stroke, Epilepsy, Multiple Sclerosis, Rehab Neurology',
      bookingLink: 'https://www.bombayhospital.com',
      rating: '4.8/5 (850 reviews)'
    },
    {
      name: 'Dr. P. N. Renjen',
      credentials: 'MBBS, DM (Neurology)',
      experience: '33+ Years Experience',
      hospital: 'Jaslok Hospital',
      address: 'Dr. G Deshmukh Marg, Mumbai - 400026',
      phone: '+91 22 6657 3333',
      email: 'pn.renjen@jaslokhospital.net',
      hours: 'Mon, Wed, Fri 11AM-4PM',
      specializations: 'Migraine, Neurocritical Care, Botox, Movement Disorders',
      bookingLink: 'https://www.jaslokhospital.net',
      rating: '4.9/5 (1200 reviews)'
    },
    {
      name: 'Dr. Sangeeta Ravat',
      credentials: 'MBBS, DM (Neurology), Prof. & HOD - KEM Hospital',
      experience: '30+ Years Experience',
      hospital: 'KEM Hospital',
      address: 'Parel, Mumbai - 400012',
      phone: '+91 22 2410 7000',
      email: 'sangeeta.ravat@kem.edu',
      hours: 'Mon-Sat 10AM–3PM',
      specializations: 'Epilepsy, EEG, Cognitive Disorders',
      bookingLink: 'https://kem.edu',
      rating: '4.8/5 (915 reviews)'
    },
    {
      name: 'Dr. Suresh Sankhla',
      credentials: 'MBBS, MCh (Neuro), Director Wockhardt',
      experience: '32+ Years Experience',
      hospital: 'Wockhardt Hospitals',
      address: 'Mira Road, Mumbai - 401107',
      phone: '+91 22 6178 5555',
      email: 'sankhlasur@wockhardthospitals.com',
      hours: 'Mon-Sat 10AM-3PM',
      specializations: 'Brain Tumor, Skull Base, Headache',
      bookingLink: 'https://www.wockhardthospitals.com',
      rating: '4.9/5 (945 reviews)'
    },
    {
      name: 'Dr. Ashutosh Shetty',
      credentials: 'MBBS, DM (Neurology)',
      experience: '21+ Years Experience',
      hospital: 'Fortis Hospital',
      address: 'Mulund West, Mumbai - 400078',
      phone: '+91 22 6799 4444',
      email: 'ashutosh.shetty@fortishealthcare.com',
      hours: 'Mon,Weds,Fri 2PM-6PM',
      specializations: 'Stroke, Critical Care, Epilepsy',
      bookingLink: 'https://www.fortishealthcare.com',
      rating: '4.8/5 (603 reviews)'
    },
    {
      name: 'Dr. Gautam Tata',
      credentials: 'MBBS, DM (Neurology)',
      experience: '27+ Years Experience',
      hospital: 'Lilavati Hospital',
      address: 'Bandra West, Mumbai - 400050',
      phone: '+91 22 2675 1000',
      email: 'gautam.tata@lilavatihospital.com',
      hours: 'Tue, Thu 10AM–1PM',
      specializations: 'Movement Disorders, Parkinson\'s, Headache',
      bookingLink: 'https://www.lilavatihospital.com',
      rating: '4.7/5 (788 reviews)'
    }
  ],
  'Bangalore': [
    {
      name: 'Dr. Rajesh B Iyer',
      credentials: 'MBBS, MD, DM (Neurology)',
      experience: '23+ Years Experience',
      hospital: 'Manipal Hospitals',
      address: 'Old Airport Road, Bangalore - 560017',
      phone: '+91 80 2222 1111',
      email: 'rajesh.iyer@manipalhospitals.com',
      hours: 'Mon-Sat 9AM–5PM',
      specializations: 'Epilepsy, Movement Disorders, Headache, Stroke',
      bookingLink: 'https://www.manipalhospitals.com',
      rating: '4.8/5 (850 reviews)'
    },
    {
      name: 'Dr. G. B. Shankaranarayana Rao',
      credentials: 'MBBS, DM (Neurology), Professor NIMHANS',
      experience: '27+ Years Experience',
      hospital: 'NIMHANS',
      address: 'Hosur Road, Bangalore - 560029',
      phone: '+91 80 2699 5000',
      email: 'gbrao@nimhans.ac.in',
      hours: 'Mon-Fri 8AM–2PM',
      specializations: 'Stroke, Cognition, Behavioral Neurology, Memory',
      bookingLink: 'https://nimhans.ac.in',
      rating: '4.9/5 (1222 reviews)'
    },
    {
      name: 'Dr. R Srinivasa',
      credentials: 'MBBS, DM (Neurology)',
      experience: '20+ Years Experience',
      hospital: 'Narayana Health, Bangalore',
      address: 'Hosur Road, Bangalore - 560099',
      phone: '+91 80 6750 0200',
      email: 'rsrinivasa@nhhospitals.org',
      hours: 'Mon-Fri 9AM-6PM',
      specializations: 'Pediatric Neuro, Epilepsy, Neurocritical Care',
      bookingLink: 'https://www.narayanahealth.org',
      rating: '4.8/5 (415 reviews)'
    },
    {
      name: 'Dr. Shankar V B',
      credentials: 'MD, DM, Consultant – Yashoda Hospitals',
      experience: '34+ Years Experience',
      hospital: 'Yashoda Hospitals',
      address: 'Somajiguda, Hyderabad - 500082',
      phone: '+91 40 4567 4567',
      email: 'shankarvb@yashodahospitals.com',
      hours: 'Mon-Sat 8AM-4PM',
      specializations: 'Stroke, Neuroimaging, Headache',
      bookingLink: 'https://www.yashodahospitals.com',
      rating: '4.9/5 (1280 reviews)'
    }
  ],
  'Chennai': [
    {
      name: 'Dr. V. Rajendran',
      credentials: 'MBBS, DM (Neurology)',
      experience: '35+ Years Experience',
      hospital: 'Apollo Hospitals, Greams Road',
      address: 'Greams Road, Chennai - 600006',
      phone: '+91 44 2829 3333',
      email: 'vrajendran@apollohospitals.com',
      hours: 'Mon-Sat 9AM–3PM',
      specializations: 'Stroke, Epilepsy, Parkinsonism, Neuromuscular',
      bookingLink: 'https://www.apollohospitals.com',
      rating: '4.9/5 (910 reviews)'
    },
    {
      name: 'Dr. R. S. Jeyalakshmi',
      credentials: 'MBBS, DM (Neurology)',
      experience: '28+ Years Experience',
      hospital: 'SIMS Hospital',
      address: 'Vadapalani, Chennai - 600026',
      phone: '+91 44 2000 2001',
      email: 'jeyalakshmi@simshospital.com',
      hours: 'Mon-Fri 11AM-4PM',
      specializations: 'Epilepsy, Headache, Neurogenetics',
      bookingLink: 'https://simshospitals.com',
      rating: '4.8/5 (715 reviews)'
    },
    {
      name: 'Dr. K Bagyalakshmi',
      credentials: 'MBBS, DM (Neuro), Consultant',
      experience: '18+ Years Experience',
      hospital: 'Apollo Hospitals',
      address: 'Greams Road, Chennai - 600006',
      phone: '+91 44 2829 3333',
      email: 'k.bagya@apollohospitals.com',
      hours: 'Mon-Fri 9AM-1PM',
      specializations: 'ALS, Dementia, Stroke, Pediatric Neurology',
      bookingLink: 'https://www.apollohospitals.com',
      rating: '4.7/5 (390 reviews)'
    },
    {
      name: 'Dr. Srinivasan R',
      credentials: 'MBBS, DM (Neuro), Prof Madras Med College',
      experience: '30+ Years Experience',
      hospital: 'MMC & Rajiv Gandhi Govt Hospital',
      address: 'Poonamallee High Road, Chennai - 600003',
      phone: '+91 44 2530 5000',
      email: 'srinivasan@mmc.ac.in',
      hours: 'Mon-Sat 10AM-5PM',
      specializations: 'Neuropathies, Neurogenetics',
      bookingLink: 'https://www.mmc.tn.gov.in',
      rating: '4.6/5 (601 reviews)'
    }
  ],
  'Hyderabad': [
    {
      name: 'Dr. Sudhir Kumar',
      credentials: 'MBBS, DM (Neurology)',
      experience: '25+ Years Experience',
      hospital: 'Apollo Hospitals, Jubilee Hills',
      address: 'Jubilee Hills, Hyderabad - 500033',
      phone: '+91 40 2360 7777',
      email: 'sudhirkumar@apollohospitals.com',
      hours: 'Mon-Sat 10AM–5PM',
      specializations: 'Headache, Epilepsy, Neuromuscular Disorders',
      bookingLink: 'https://www.apollohospitals.com',
      rating: '4.8/5 (800 reviews)'
    },
    {
      name: 'Dr. Bindu Menon',
      credentials: 'MBBS, DM (Neurology)',
      experience: '22+ Years Experience',
      hospital: 'Apollo Hospitals',
      address: 'Musheerabad, Hyderabad - 500020',
      phone: '+91 40 4904 4444',
      email: 'bindumenon@apollohospitals.com',
      hours: 'Mon-Sat 12PM-6PM',
      specializations: 'Stroke, Memory Loss, ALS, Neuromuscular',
      bookingLink: 'https://www.apollohospitals.com',
      rating: '4.7/5 (603 reviews)'
    },
    {
      name: 'Dr. Manas Panigrahi',
      credentials: 'MBBS, MCh (Neuro), Senior Consultant',
      experience: '25+ Years Experience',
      hospital: 'CARE Hospitals',
      address: 'Banjara Hills, Hyderabad - 500034',
      phone: '+91 40 3041 8888',
      email: 'manas.panigrahi@carehospitals.com',
      hours: 'Mon-Fri 10AM-4PM',
      specializations: 'Brain Surgery, Tumor, Endovascular Neuro',
      bookingLink: 'https://www.carehospitals.com',
      rating: '4.8/5 (703 reviews)'
    },
    {
      name: 'Dr. Anil Kumar',
      credentials: 'MBBS, DM (Neurology), Consultant',
      experience: '22+ Years Experience',
      hospital: 'Yashoda Hospitals',
      address: 'Secunderabad, Hyderabad - 500003',
      phone: '+91 40 4567 4567',
      email: 'anilkumar@yashodahospitals.com',
      hours: 'Mon, Wed, Fri 12PM-5PM',
      specializations: 'Stroke, Cognitive Disorders',
      bookingLink: 'https://www.yashodahospitals.com',
      rating: '4.7/5 (512 reviews)'
    }
  ],
  'Ahmedabad': [
    {
      name: 'Dr. Sandeep Joshi',
      credentials: 'MBBS, DM (Neurology)',
      experience: '21+ Years Experience',
      hospital: 'Zydus Hospital, Ahmedabad',
      address: 'Thaltej, Ahmedabad - 380059',
      phone: '+91 79 6619 0101',
      email: 'sandeep.joshi@zydushospitals.com',
      hours: 'Mon-Fri 9AM–5PM',
      specializations: 'Stroke, Dementia, Migraine, Epilepsy',
      bookingLink: 'https://www.zydushospitals.com',
      rating: '4.8/5 (458 reviews)'
    },
    {
      name: 'Dr. Jigar Modi',
      credentials: 'MBBS, DM (Neurology)',
      experience: '18+ Years Experience',
      hospital: 'Shalby Hospital',
      address: 'Ghuma, Ahmedabad - 380058',
      phone: '+91 79 4020 3000',
      email: 'jigar.modi@shalby.org',
      hours: 'Mon-Fri 10AM–5PM',
      specializations: 'Epilepsy, Parkinson’s, Nerve Disorders',
      bookingLink: 'https://www.shalby.org',
      rating: '4.9/5 (310 reviews)'
    },
    {
      name: 'Dr. Chetan Patel',
      credentials: 'MBBS, DM (Neurology), Consultant',
      experience: '17+ Years Experience',
      hospital: 'Shalby Hospitals',
      address: 'Vastrapur, Ahmedabad - 380015',
      phone: '+91 79 4020 3000',
      email: 'chetan.patel@shalby.org',
      hours: 'Mon-Fri 10AM-2PM',
      specializations: 'Stroke, Epilepsy, Neuromuscular Disorders',
      bookingLink: 'https://www.shalby.org',
      rating: '4.7/5 (260 reviews)'
    }
  ],
  'Kolkata': [
    {
      name: 'Dr. Manas Kumar Panigrahi',
      credentials: 'MBBS, MS, MCh (Neuro), Consultant Neurologist',
      experience: '30+ Years Experience',
      hospital: 'AMRI Hospitals',
      address: 'Salt Lake, Kolkata - 700091',
      phone: '+91 33 4020 2020',
      email: 'manas.panigrahi@amrihospitals.in',
      hours: 'Mon-Sat 11AM–4PM',
      specializations: 'Stroke, Headache, Neuro-surgery, Migraine',
      bookingLink: 'https://www.amrihospitals.in',
      rating: '4.8/5 (650 reviews)'
    },
    {
      name: 'Dr. Manas Kumar Sahana',
      credentials: 'MBBS, MD, DM (Neurology)',
      experience: '24+ Years Experience',
      hospital: 'Belle Vue Clinic',
      address: 'Minto Park, Kolkata - 700017',
      phone: '+91 33 2287 2321',
      email: 'manas.sahana@bellevueclinic.com',
      hours: 'Mon-Fri 10AM–2PM',
      specializations: 'Stroke, Epilepsy, Headache, Neuropathy',
      bookingLink: 'https://www.bellevueclinic.com',
      rating: '4.7/5 (405 reviews)'
    },
    {
      name: 'Dr. Abhijit Das',
      credentials: 'MBBS, DM (Neurology), Prof, IPGMER & SSKM',
      experience: '23+ Years Experience',
      hospital: 'IPGMER & SSKM Hospital',
      address: 'A.J.C Bose Road, Kolkata - 700020',
      phone: '+91 33 2223 5181',
      email: 'abhijit.das@sskmhospital.org',
      hours: 'Mon, Wed, Fri 9AM–3PM',
      specializations: 'Stroke, Epilepsy, MS, Parkinsonism',
      bookingLink: 'https://www.sskmhospital.org',
      rating: '4.8/5 (400 reviews)'
    },
    {
      name: 'Dr. Joydeep Mukherjee',
      credentials: 'MBBS, MD, DM (Neurology)',
      experience: '21+ Years Experience',
      hospital: 'AMRI Hospital',
      address: 'Mukundapur, Kolkata - 700099',
      phone: '+91 33 7122 3000',
      email: 'joydeep.mukherjee@amrihospitals.in',
      hours: 'Mon-Fri 1PM–5PM',
      specializations: 'Movement Disorders, Parkinson’s, Dementia',
      bookingLink: 'https://www.amrihospitals.in',
      rating: '4.7/5 (344 reviews)'
    }
  ],
  'Nagpur': [
    {
      name: 'Dr. Rahul H. Katakwar',
      credentials: 'MBBS, MD (Med), DM (Neuro)',
      experience: '15+ Years Experience',
      hospital: 'Wockhardt Hospitals, Nagpur',
      address: 'Shankar Nagar, Nagpur - 440010',
      phone: '+91 712 662 4100',
      email: 'rahul.katakwar@wockhardthospitals.com',
      hours: 'Mon-Sat 10AM–6PM',
      specializations: 'Epilepsy, Stroke, Parkinson’s',
      bookingLink: 'https://www.wockhardthospitals.com',
      rating: '4.8/5 (335 reviews)'
    },
    {
      name: 'Dr. Saurabh Chitnis',
      credentials: 'MBBS, DM (Neurology)',
      experience: '11+ Years Experience',
      hospital: 'Indira Gandhi Medical College',
      address: 'Mayo Hospital Campus, Nagpur - 440018',
      phone: '+91 712 272 5423',
      email: 'saurabh.chitnis@igmcnagpur.edu.in',
      hours: 'Mon-Fri 9AM–2PM',
      specializations: 'Neurophysiology, Stroke, Epilepsy',
      bookingLink: 'https://www.igmcnagpur.edu.in',
      rating: '4.6/5 (200 reviews)'
    },
    {
      name: 'Dr. Chandrashekhar Meshram',
      credentials: 'MD (Medicine), DM (Neurology)',
      experience: '28+ Years Experience',
      hospital: 'Central India Neuro Sciences Hospital',
      address: 'Civil Lines, Nagpur - 440001',
      phone: '+91 712 253 3101',
      email: 'meshram@cinhospitals.org',
      hours: 'Mon-Fri 9AM-2PM',
      specializations: 'Stroke, Epilepsy, Public Neuro Health Leader',
      bookingLink: 'https://cinhospitals.org',
      rating: '4.8/5 (310 reviews)'
    }
  ]
};


// ========================================================================
// FAQS ARRAY
// ========================================================================
const faqs = [
  {
  icon: '🧠',
  question: 'What is Alzheimer’s disease?',
  answer: 'Alzheimer’s is a progressive neurodegenerative disease causing memory loss, confusion, and impaired reasoning, mainly in older adults.',
  citation: '<a href="https://www.nia.nih.gov/health/alzheimers-disease-fact-sheet" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIA: Alzheimer’s Disease</a>'
},
{
  icon: '🧭',
  question: 'What are key symptoms of Parkinson’s disease?',
  answer: 'Tremor, stiffness, slowness of movement, and balance problems are the main symptoms of Parkinson’s.',
  citation: '<a href="https://www.parkinson.org/Understanding-Parkinsons/What-is-Parkinsons" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Parkinson’s Foundation</a>'
},
{
  icon: '⚡',
  question: 'How do seizures present in epilepsy?',
  answer: 'Epilepsy causes recurrent seizures, which can lead to sudden jerking, loss of consciousness, and confusion.',
  citation: '<a href="https://www.epilepsy.com/what-is-epilepsy" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Epilepsy Foundation</a>'
},
{
  icon: '🧠',
  question: 'What is a stroke?',
  answer: 'A stroke occurs when blood flow to the brain is interrupted, causing brain cell death and symptoms like weakness, speech difficulties, and loss of vision.',
  citation: '<a href="https://www.stroke.org/en/about-stroke" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Stroke Association</a>'
},
{
  icon: '🦵',
  question: 'Which symptoms are typical in multiple sclerosis?',
  answer: 'MS symptoms include vision problems, muscle weakness, numbness, and coordination difficulties due to nerve damage.',
  citation: '<a href="https://www.nationalmssociety.org/What-is-MS/Symptoms" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National MS Society</a>'
},
{
  icon: '💥',
  question: 'Why do migraines occur and what are their signs?',
  answer: 'Migraines are severe headaches often accompanied by nausea, sensitivity to light and sound, and sometimes aura visual disturbances.',
  citation: '<a href="https://www.mayoclinic.org/diseases-conditions/migraine-headache/symptoms-causes/syc-20360201" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic: Migraine</a>'
},
{
  icon: '🗣️',
  question: 'What is ALS (Amyotrophic Lateral Sclerosis)?',
  answer: 'ALS is a progressive disease causing loss of muscle control, including speaking, swallowing, and breathing.',
  citation: '<a href="https://www.als.org/understanding-als/what-is-als" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ALS Association</a>'
},
{
  icon: '🙂',
  question: 'What causes sudden facial weakness (Bell’s Palsy)?',
  answer: 'Bell’s Palsy is usually caused by viral infection of the facial nerve, resulting in temporary facial paralysis.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/bells-palsy" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Bell’s Palsy</a>'
},
{
  icon: '🧒',
  question: 'How does cerebral palsy affect children?',
  answer: 'Cerebral palsy causes movement and coordination difficulties due to brain damage before or after birth.',
  citation: '<a href="https://www.cdc.gov/ncbddd/cp/facts.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC: Cerebral Palsy</a>'
},
{
  icon: '🧬',
  question: 'Is Huntington’s disease inherited?',
  answer: 'Yes, Huntington’s is a genetic disorder causing uncontrolled movements and cognitive decline, usually beginning in midlife.',
  citation: '<a href="https://www.hdsa.org/living-with-hd/overview-of-hd" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">HDSA: Huntington’s Disease</a>'
},

{
  icon: '🦶',
  question: 'What is peripheral neuropathy?',
  answer: 'Peripheral neuropathy is damage to the nerves outside the brain and spinal cord, causing tingling, numbness, and weakness, often in the hands and feet.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/peripheral-neuropathy" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Peripheral Neuropathy</a>'
},
{
  icon: '🦵',
  question: 'What causes Guillain-Barré Syndrome?',
  answer: 'Guillain-Barré Syndrome is a rare autoimmune disorder where the immune system attacks nerves, leading to fast muscle weakness and sometimes paralysis.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/guillain-barre-syndrome" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Guillain-Barré Syndrome</a>'
},
{
  icon: '💪',
  question: 'What is Myasthenia Gravis and its main symptom?',
  answer: 'Myasthenia Gravis is an autoimmune disease that causes muscle weakness, especially after exertion, and often affects eye muscles first.',
  citation: '<a href="https://www.myasthenia.org/what-is-myasthenia-gravis" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Myasthenia Gravis Foundation</a>'
},
{
  icon: '🌡️',
  question: 'What are encephalitis and its warning signs?',
  answer: 'Encephalitis is inflammation of the brain most often caused by virus, and can lead to fever, headache, confusion, and seizures.',
  citation: '<a href="https://www.cdc.gov/encephalitis/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC: Encephalitis</a>'
},
{
  icon: '🧑‍⚕️',
  question: 'How is meningitis different from encephalitis?',
  answer: 'Meningitis affects the membranes covering the brain and spinal cord, while encephalitis impacts the brain tissue itself. Both can cause severe headaches and fever.',
  citation: '<a href="https://www.nhs.uk/conditions/meningitis/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NHS: Meningitis</a>'
},
{
  icon: '🚑',
  question: 'What is Traumatic Brain Injury (TBI)?',
  answer: 'TBI is caused by a blow or jolt to the head resulting in temporary or permanent brain dysfunction. Common symptoms include headache, confusion, and memory loss.',
  citation: '<a href="https://www.cdc.gov/traumaticbraininjury/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC: Traumatic Brain Injury</a>'
},
{
  icon: '🦴',
  question: 'What happens in a spinal cord injury?',
  answer: 'Spinal cord injury damages the nerves in the backbone, which may result in loss of movement and sensation below the level of injury.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/spinal-cord-injury" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Spinal Cord Injury</a>'
},
{
  icon: '💢',
  question: 'What causes essential tremor?',
  answer: 'Essential tremor is a neurological condition that causes uncontrollable shaking, most often in the hands or head, and is usually familial.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/essential-tremor" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Essential Tremor</a>'
},
{
  icon: '🤸',
  question: 'What is dystonia?',
  answer: 'Dystonia involves involuntary muscle contractions leading to abnormal postures and repetitive movements, often starting in one part of the body.',
  citation: '<a href="https://www.dystonia.org.uk/about-dystonia/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Dystonia UK</a>'
},
{
  icon: '🙊',
  question: 'What are the main symptoms of Tourette Syndrome?',
  answer: 'Tourette Syndrome causes repetitive involuntary movements (motor tics) and sounds (vocal tics), often beginning in childhood.',
  citation: '<a href="https://www.tourette.org/about-tourette/overview/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Tourette Association of America</a>'
},

{
  icon: '🔥',
  question: 'What is a cluster headache?',
  answer: 'Cluster headaches are severe, repetitive headaches on one side of the head, often accompanied by red/watery eyes. Attacks occur in groups or clusters.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/cluster-headache" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Cluster Headache</a>'
},
{
  icon: '😬',
  question: 'How does trigeminal neuralgia cause pain?',
  answer: 'Trigeminal neuralgia is intense, sudden facial pain triggered by irritation of the main nerve of the face.',
  citation: '<a href="https://www.nhs.uk/conditions/trigeminal-neuralgia/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NHS: Trigeminal Neuralgia</a>'
},
{
  icon: '🦵',
  question: 'What is Restless Legs Syndrome?',
  answer: 'Restless Legs Syndrome causes an irresistible urge to move the legs when sitting or lying down, often disrupting sleep.',
  citation: '<a href="https://www.sleepfoundation.org/legs-and-feet/restless-legs-syndrome" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Sleep Foundation: RLS</a>'
},
{
  icon: '🛏️',
  question: 'How does narcolepsy affect daily life?',
  answer: 'Narcolepsy is a chronic sleep disorder causing overwhelming daytime drowsiness and sudden sleep attacks, sometimes accompanied by loss of muscle control (cataplexy).',
  citation: '<a href="https://www.sleepfoundation.org/sleep-disorders/narcolepsy" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Sleep Foundation: Narcolepsy</a>'
},
{
  icon: '🚶‍♂️',
  question: 'What is ataxia and how does it affect movement?',
  answer: 'Ataxia is a group of disorders resulting in poor coordination, unsteady walk, and problems with fine motor skills.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/ataxia" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Ataxia</a>'
},
{
  icon: '🗯️',
  question: 'What is Pick’s disease?',
  answer: 'Pick’s disease is a rare form of frontotemporal dementia causing personality changes and difficulty with speech or language.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/frontotemporal-disorders" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Frontotemporal Dementia</a>'
},
{
  icon: '🧓',
  question: 'How is Lewy Body Dementia different from Alzheimer’s?',
  answer: 'Lewy Body Dementia features movement problems and visual hallucinations, along with fluctuating confusion and memory issues.',
  citation: '<a href="https://www.nia.nih.gov/health/dementia-lewy-bodies" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIA: Lewy Body Dementia</a>'
},
{
  icon: '🚶',
  question: 'What are typical signs of Progressive Supranuclear Palsy?',
  answer: 'Progressive Supranuclear Palsy presents with balance problems, falls, and difficulty moving the eyes up and down.',
  citation: '<a href="https://www.curepsp.org/iwanttolearnmore/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CurePSP: PSP</a>'
},
{
  icon: '🔬',
  question: 'What is CADASIL and how is it inherited?',
  answer: 'CADASIL is a genetic disorder causing recurrent strokes and migraines due to blood vessel damage in the brain.',
  citation: '<a href="https://www.cadasilfoundation.org/what-is-cadasil/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CADASIL Foundation</a>'
},
{
  icon: '🧒',
  question: 'What are the main features of Dravet Syndrome?',
  answer: 'Dravet Syndrome is a severe, rare genetic epilepsy starting in infancy, causing frequent, prolonged seizures and developmental delays.',
  citation: '<a href="https://dravetfoundation.org/about-dravet-syndrome/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Dravet Syndrome Foundation</a>'
},

{
  icon: '🦶',
  question: 'What is Charcot-Marie-Tooth Disease?',
  answer: 'Charcot-Marie-Tooth Disease is a group of inherited disorders affecting the peripheral nerves, causing muscle weakness and sensory loss in the feet and hands.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/charcot-marie-tooth-disease" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: CMT</a>'
},
{
  icon: '👦',
  question: 'What are common symptoms of Muscular Dystrophy?',
  answer: 'Muscular Dystrophy leads to progressive muscle weakness and wasting. Early signs include trouble running or climbing stairs.',
  citation: '<a href="https://www.mda.org/disease/muscular-dystrophy/overview" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">MDA: Muscular Dystrophy</a>'
},
{
  icon: '🌀',
  question: 'What is Neurofibromatosis?',
  answer: 'Neurofibromatosis causes multiple non-cancerous tumors on nerves and skin, and can lead to learning problems or vision loss.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/neurofibromatosis" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Neurofibromatosis</a>'
},
{
  icon: '💦',
  question: 'What happens in Hydrocephalus?',
  answer: 'Hydrocephalus is a buildup of fluid in the brain, causing increased pressure and symptoms like headache, confusion, and in children, a rapid increase in head size.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/hydrocephalus" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Hydrocephalus</a>'
},
{
  icon: '🧑‍🦽',
  question: 'What is Locked-In Syndrome?',
  answer: 'Locked-In Syndrome is a rare condition in which a person is aware but cannot move or speak due to complete paralysis except for eye movement.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/locked-in-syndrome" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Locked-In Syndrome</a>'
},
{
  icon: '👩‍🦽',
  question: 'What are the effects of Polio/Post-Polio Syndrome?',
  answer: 'Polio can cause paralysis, and Post-Polio Syndrome results in weakness, fatigue and pain years after the original infection.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/post-polio-syndrome" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Post-Polio Syndrome</a>'
},
{
  icon: '👧',
  question: 'What is Williams Syndrome?',
  answer: 'Williams Syndrome is a genetic neurodevelopmental disorder associated with unique facial features, heart defects, and learning disabilities.',
  citation: '<a href="https://www.williams-syndrome.org/what-is-williams-syndrome/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Williams Syndrome Association</a>'
},
{
  icon: '👐',
  question: 'What are characteristics of Rett Syndrome?',
  answer: 'Rett Syndrome, mostly affecting girls, is a neurodevelopmental disorder causing loss of motor and speech skills, repetitive hand movements, and breathing problems.',
  citation: '<a href="https://www.rettsyndrome.org/about-rett-syndrome/what-is-rett-syndrome/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Rett Syndrome Foundation</a>'
},
{
  icon: '🧑‍⚕️',
  question: 'What are common symptoms in Schizophrenia?',
  answer: 'Schizophrenia involves delusions, hallucinations, disorganized thinking, and emotional blunting, requiring lifelong management.',
  citation: '<a href="https://www.nimh.nih.gov/health/topics/schizophrenia/index.shtml" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIMH: Schizophrenia</a>'
},
{
  icon: '🧩',
  question: 'What is Autism Spectrum Disorder?',
  answer: 'ASD is a range of conditions marked by communication difficulties, restricted interests, repetitive behaviors, and sensory sensitivity.',
  citation: '<a href="https://www.cdc.gov/ncbddd/autism/facts.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC: Autism</a>'
},

{
  icon: '⚡',
  question: 'What is Status Epilepticus?',
  answer: 'Status Epilepticus is a life-threatening neurological emergency where a person has a seizure lasting longer than 5 minutes or repeated seizures without regaining consciousness.',
  citation: '<a href="https://www.epilepsy.com/learn/types-seizures/status-epilepticus" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Epilepsy Foundation: Status Epilepticus</a>'
},
{
  icon: '🎯',
  question: 'What are the main features of Sydenham Chorea?',
  answer: 'Sydenham Chorea causes rapid, involuntary movements, emotional instability, and muscle weakness, usually after a streptococcal infection in children.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/sydenham-chorea" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Sydenham Chorea</a>'
},
{
  icon: '👂',
  question: 'What is Ramsay Hunt Syndrome?',
  answer: 'Ramsay Hunt Syndrome is caused by varicella-zoster virus and presents with facial paralysis, ear pain, and a blistering rash affecting the ear.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/ramsay-hunt-syndrome" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Ramsay Hunt Syndrome</a>'
},
{
  icon: '🩸',
  question: 'What are the symptoms of Vasculitic Neuropathy?',
  answer: 'Vasculitic Neuropathy is nerve damage due to blood vessel inflammation, resulting in pain, muscle weakness, and sensory loss in affected areas.',
  citation: '<a href="https://rarediseases.info.nih.gov/diseases/12294/vasculitic-neuropathy" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Vasculitic Neuropathy</a>'
},
{
  icon: '🧪',
  question: 'What are prion diseases like Creutzfeldt-Jakob Disease?',
  answer: 'Prion diseases are rare, fatal brain disorders caused by abnormal prion proteins, leading to rapid dementia, movement difficulties, and behavioral changes.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/prion-diseases" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Prion Diseases</a>'
},
{
  icon: '🦶',
  question: 'What is Spinocerebellar Ataxia?',
  answer: 'Spinocerebellar Ataxias are inherited disorders marked by progressive unsteady gait, poor coordination, and speech difficulties.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/spinocerebellar-ataxia" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Spinocerebellar Ataxia</a>'
},
{
  icon: '💙',
  question: 'What is Tuberous Sclerosis?',
  answer: 'Tuberous Sclerosis is a genetic disorder causing benign tumors in the brain and other organs, often associated with epilepsy and developmental delays.',
  citation: '<a href="https://www.tsalliance.org/what-is-tsc/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Tuberous Sclerosis Alliance</a>'
},
{
  icon: '🔥',
  question: 'How does Central Pain Syndrome develop?',
  answer: 'Central Pain Syndrome is chronic pain that develops after stroke, multiple sclerosis, or spinal cord injury due to damage in the central nervous system.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/central-pain-syndrome" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Central Pain Syndrome</a>'
},
{
  icon: '👵',
  question: 'What are common signs of delirium in older adults?',
  answer: 'Delirium involves sudden confusion, agitation, difficulty concentrating, and hallucinations, usually triggered by illness, medication, or infection.',
  citation: '<a href="https://www.nia.nih.gov/health/delirium" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIA: Delirium</a>'
},
{
  icon: '🦵',
  question: 'What is Complex Regional Pain Syndrome?',
  answer: 'Complex Regional Pain Syndrome is persistent pain, swelling, and sensitivity in an arm or leg, usually following injury or surgery.',
  citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/complex-regional-pain-syndrome" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: CRPS</a>'
}

];

// ========================================================================
// NEW DATA STRUCTURES FOR EMPTY SECTIONS
// ========================================================================

const whenToSeeData = [

    // --- 1. Sudden Loss of Consciousness or Seizure ---
    {
        icon: '⚡',
        question: 'Sudden Loss of Consciousness or Convulsion',
        answer: 'See a neurologist immediately if:<br>• You or someone collapses unexpectedly<br>• There are jerking movements or confusion afterwards<br><br>These may be seizures or neurological emergencies.',
        citation: 'Epilepsy Foundation. Seizure First Aid. 2025.'
    },

    // --- 2. Unexplained Severe Headache ---
    {
        icon: '💥',
        question: 'Severe, Sudden, or Worst Ever Headache',
        answer: 'Seek urgent neurology care if:<br>• Headache is sudden and severe (“thunderclap”)<br>• Accompanied by nausea, vomiting, visual changes, fainting<br><br>Could signal brain bleed, meningitis, or migraine.',
        citation: 'Mayo Clinic. Acute Headache Red Flags. 2025.'
    },

    // --- 3. Sudden Vision Loss, Blurred, or Double Vision ---
    {
        icon: '👀',
        question: 'Sudden Loss or Blurring of Vision',
        answer: 'See a neurologist or ophthalmologist urgently if:<br>• Vision changes occur rapidly or without clear cause<br>• Associated with headache or weakness<br><br>Could indicate optic nerve disease, stroke, or migraine.',
        citation: 'American Academy of Ophthalmology. Vision Loss Emergencies. 2025.'
    },

    // --- 4. Numbness, Tingling, or Weakness in One Side of Body ---
    {
        icon: '🖐️',
        question: 'One-Sided Weakness, Tingling, or Numbness',
        answer: 'Seek neurological exam if:<br>• Symptoms come on suddenly<br>• Weakness, dropping items, slurred speech, or face droop occurs<br><br>These may signal stroke or TIA.',
        citation: 'AHA/ASA. Stroke Warning Signs. 2025.'
    },

    // --- 5. Loss of Coordination or Balance ---
    {
        icon: '🌀',
        question: 'Unsteady Walk or Loss of Balance/Gait',
        answer: 'See a neurologist if:<br>• You feel dizzy, unsteady, or fall repeatedly<br>• Movement or walking becomes hard<br><br>These may be due to cerebellar dysfunction, MS, or nerve disease.',
        citation: 'MS Society. Ataxia & Balance Issues. 2025.'
    },

    // --- 6. Difficulty Swallowing, Speaking, or Understanding ---
    {
        icon: '👄',
        question: 'Difficulty Speaking or Swallowing Suddenly',
        answer: 'Get immediate neuro evaluation if:<br>• Speech is slurred, incoherent, or hard to understand<br>• Drooling or trouble swallowing starts<br><br>Common in stroke, ALS, or myasthenia gravis.',
        citation: 'NIH. Speech and Swallowing Disorders. 2025.'
    },

    // --- 7. Sudden Double Vision or Difficulty Moving Eyes ---
    {
        icon: '👁️',
        question: 'Sudden Double Vision or Eye Movement Abnormality',
        answer: 'See a neurologist if:<br>• Eyes do not move together<br>• Double, blurry, or lost vision<br>• Associated with headache/weakness<br><br>Can be sign of nerve palsy or brainstem issue.',
        citation: 'American Academy of Neurology. Diplopia Evaluation. 2025.'
    },

    // --- 8. Tremors, Jerking, or Uncontrollable Movements ---
    {
        icon: '🤲',
        question: 'Visible Tremors, Jerking or Involuntary Movements',
        answer: 'If shaking, twitches, or abnormal movements interfere with daily life, see a neurologist for evaluation of Parkinson’s, dystonia, or essential tremor.',
        citation: 'Parkinson’s Foundation. Movement Disorders. 2025.'
    },

    // --- 9. Persistent Memory Loss or Confusion ---
    {
        icon: '🧠',
        question: 'Gradual Loss of Memory, Orientation, or Reasoning',
        answer: 'Consult a neurologist for: <br>• Increasing forgetfulness, confusion, mood changes<br>• Repeating questions, losing way in familiar places<br><br>Early evaluation helps with Alzheimer’s and dementia care.',
        citation: 'Alzheimer’s Association. Cognitive Assessment. 2025.'
    },

    // --- 10. Sudden Severe Neck Stiffness with Fever and Headache ---
    {
        icon: '🌡️',
        question: 'Neck Stiffness, Fever, and Headache Together',
        answer: 'If all three symptoms occur, seek immediate neurological or ER care—could be meningitis or brain infection.',
        citation: 'CDC. Meningitis Symptoms. 2025.'
    },
    // --- 11. Recurrent Fainting or Blackouts ---
    {
        icon: '🎭',
        question: 'Repeated Fainting, Blackouts, or Loss of Awareness',
        answer: 'If you pass out, have episodes of staring or sudden lack of response (with or without jerking), see a neurologist to rule out epilepsy or syncope.',
        citation: 'Johns Hopkins. Fainting & Epilepsy. 2024.'
    },

    // --- 12. Difficulty Walking, Slow Movements, or Stiffness ---
    {
        icon: '🚶‍♂️',
        question: 'Gradual Stiffness, Slowness, or Difficulty Walking',
        answer: 'If movement becomes slow, stiff, or shuffling, or you lose facial expression, consult for Parkinson’s or other neurologic disorders.',
        citation: 'Parkinson’s Foundation. Early Symptoms. 2024.'
    },

    // --- 13. Sudden Trouble Understanding, Speaking, or Writing ---
    {
        icon: '📝',
        question: 'Sudden Trouble Understanding Conversation or Writing',
        answer: 'Unexpected confusion, difficulty expressing words, or trouble writing could signal stroke or TIA—seek IMMEDIATE neuro evaluation.',
        citation: 'AHA/ASA. FAST Stroke Signs. 2025.'
    },

    // --- 14. Persistent Vertigo, Dizziness, or Imbalance ---
    {
        icon: '🌀',
        question: 'Unrelenting Vertigo or Dizziness Affecting Balance',
        answer: 'Persistent dizziness, especially with unsteadiness, visual problems, or hearing loss, should be evaluated by neurology for inner ear or brain causes.',
        citation: 'Vestibular Disorders Association. Balance Issues. 2025.'
    },

    // --- 15. Sudden Change in Personality, Mood, or Behavior ---
    {
        icon: '😮',
        question: 'Personality or Mood Changes Not Explained by Stress',
        answer: 'Sudden aggression, apathy, paranoia, or loss of inhibition may indicate neurological disorders such as dementia or frontal lobe disease.',
        citation: 'Alzheimer’s Association. Behavioral Symptoms. 2025.'
    },

    // --- 16. Weakness in Multiple Muscle Groups or Swallowing Difficulty ---
    {
        icon: '💪',
        question: 'Weakness or Fatigue Affecting Multiple Muscles, Unable to Swallow',
        answer: 'Worsening muscle fatigue, inability to swallow or speak, or drooping eyelids may indicate myasthenia gravis or ALS; rapid neuro assessment is important.',
        citation: 'ALS Association. Muscle Weakness Warning. 2025.'
    },

    // --- 17. Sudden Hearing Loss or Ringing in the Ears ---
    {
        icon: '👂',
        question: 'Sudden Hearing Loss or Persistent Ringing',
        answer: 'Unexplained rapid changes in hearing or constant ringing (tinnitus) especially with dizziness, require an urgent neurology or ENT checkup.',
        citation: 'American Academy of Neurology. Sudden Hearing Loss. 2025.'
    },

    // --- 18. Double Vision or Drooping Eyelid with Weakness ---
    {
        icon: '👁️',
        question: 'Double Vision, Droopy Eyelid, and Muscle Weakness',
        answer: 'Combined visual changes and muscle weakness must be checked by a neurologist for possible nerve or neuromuscular disorders.',
        citation: 'Myasthenia Gravis Foundation. Vision & Eyelid Issues. 2025.'
    },

    // --- 19. Unexplained Falls or Drop Attacks ---
    {
        icon: '🔻',
        question: 'Frequent Falls or Sudden Loss of Strength Without Warning',
        answer: 'If you unexpectedly fall or collapse (without fainting), see a neurologist for evaluation of drop attacks or seizure-like events.',
        citation: 'Epilepsy Foundation. Drop Attacks. 2024.'
    },

    // --- 20. Uncontrolled Jerky Movements, Grimacing, or Vocal Tics ---
    {
        icon: '😬',
        question: 'Jerking Movements, Grimacing, or Repeated Sounds (Tics)',
        answer: 'If repeated vocal or motor tics disrupt daily life, assessment for Tourette syndrome or other movement disorders is recommended.',
        citation: 'Tourette Association of America. When to See a Specialist. 2025.'
    },

    // --- 21. Progressive Numbness in Hands, Feet, or Limbs ---
    {
        icon: '🦶',
        question: 'Increasing Numbness, Tingling, or Burning Sensation in Hands/Feet',
        answer: 'If sensation loss spreads or worsens, evaluation for neuropathy, diabetes, or nerve compression is necessary.',
        citation: 'NIH. Peripheral Neuropathy Warning Signs. 2025.'
    },

    // --- 22. Gradual Weakness or Burning Pain in Legs/Arms ---
    {
        icon: '🔥',
        question: 'Gradually Worsening Weakness or Burning in Limbs',
        answer: 'Persistent pain/weakness that increases over weeks/months may signal neuropathy, ALS, or muscular dystrophy.',
        citation: 'ALS Association. Progressing Weakness. 2025.'
    },

    // --- 23. Persistent Unexplained Dizziness or Blackouts ---
    {
        icon: '💫',
        question: 'Ongoing or Recurrent Dizziness/Lightheadedness',
        answer: 'Frequent unexplained dizziness may be neurological, cardiovascular, or metabolic. Assessment can rule out serious causes.',
        citation: 'Vestibular Disorders Association. Dizziness Causes. 2025.'
    },

    // --- 24. Wandering, Getting Lost or Disoriented in Familiar Places ---
    {
        icon: '🗺️',
        question: 'Getting Lost or Becoming Disoriented in Familiar Places',
        answer: 'If you or a loved one forget familiar locations, get lost, or are confused about dates/times, see a neurologist for dementia evaluation.',
        citation: 'Alzheimer’s Association. Wandering in Dementia. 2024.'
    },

    // --- 25. Hallucinations (Seeing/Feeling Things That Aren’t There) ---
    {
        icon: '👻',
        question: 'Seeing Things, Hearing Voices, or Feeling Sensations Without Cause',
        answer: 'Visual or sensory hallucinations—especially in older adults—with memory or behavior changes, require neurological and psychiatric assessment.',
        citation: 'NIMH. Hallucinations and Delusions. 2025.'
    },

    // --- 26. Sudden, Severe Back Pain Plus Leg Weakness, Loss of Bladder/Bowel Control ---
    {
        icon: '🦴',
        question: 'Severe Back Pain With Sudden Loss of Leg Strength or Bladder/Bowel Control',
        answer: 'Emergency neurological evaluation needed. This may indicate spinal cord compression or cauda equina syndrome.',
        citation: 'NIH. Cauda Equina Syndrome Emergency. 2025.'
    },

    // --- 27. Loss of Smell or Taste Not Linked to Sinus or Infection ---
    {
        icon: '👃',
        question: 'Sudden Loss of Smell or Taste Without Obvious Infection',
        answer: 'If sense of smell or taste disappears without congestion, neurodegenerative disease or brain lesion should be excluded.',
        citation: 'NIH. Loss of Smell in Neuro Disorders. 2025.'
    },

    // --- 28. Sudden Trouble Reading, Writing, or Calculating ---
    {
        icon: '📖',
        question: 'Sudden Inability to Read, Write, or Perform Calculations',
        answer: 'If a person suddenly cannot perform routine cognitive tasks, stroke or brain lesion should be ruled out.',
        citation: 'Stroke Association. Cognitive Changes. 2025.'
    },

    // --- 29. New or Worsening Seizure Pattern in Known Epilepsy ---
    {
        icon: '⚡',
        question: 'New or Changing Seizure Frequency, Type, or Severity',
        answer: 'People with epilepsy must see a neurologist for breakthrough or unusually severe seizures, medication review, and further tests.',
        citation: 'Epilepsy Foundation. When to Contact Doctor. 2025.'
    },

    // --- 30. Sudden Muscle Twitching, Cramping, or Loss of Muscle Control ---
    {
        icon: '💢',
        question: 'Sudden Muscle Twitching, Cramping, or Weakness',
        answer: 'If muscle function declines suddenly, see a neurologist to rule out nerve injury or ALS.',
        citation: 'ALS Association. Muscle Symptoms. 2025.'
    },

    // --- 31. Severe Sleep Disturbance or Sudden Onset of Sleep Attacks ---
    {
        icon: '🛌',
        question: 'Sudden & Uncontrollable Falling Asleep or Severe Sleep Disturbance',
        answer: 'Uncontrollable sleep attacks or new severe sleep disruption may signal neurological disorders like narcolepsy or sleep apnea.',
        citation: 'Sleep Foundation. Narcolepsy Symptoms. 2025.'
    },

    // --- 32. Persistent Facial Pain, Weakness, or Drooping ---
    {
        icon: '🙂',
        question: 'New Facial Pain, Weakness, or Drooping',
        answer: 'Facial paralysis or prolonged facial pain should be evaluated promptly for Bell’s palsy or trigeminal neuralgia.',
        citation: 'NIH. Bell’s Palsy & Facial Nerve Disorders. 2025.'
    },

    // --- 33. Difficulty Chewing, Speaking, or Changes in Voice Quality ---
    {
        icon: '🗣️',
        question: 'Difficulty Chewing, Speaking, or Voice Changes',
        answer: 'If speech or swallowing worsens, see a neurologist for possible bulbar palsy, ALS, or myasthenia gravis.',
        citation: 'ALS Association. Speech Changes. 2025.'
    },

    // --- 34. Persistent Involuntary Laughing or Crying (Pseudobulbar Affect) ---
    {
        icon: '😂',
        question: 'Uncontrollable Laughing or Crying Not Linked to Mood',
        answer: 'If emotional outbursts are unpredictable or excessive, neurologic or psychiatric evaluation is needed for conditions like pseudobulbar affect.',
        citation: 'NIH. Pseudobulbar Affect. 2025.'
    },

    // --- 35. Drooping Eyelids or Double Vision That Varies Through the Day ---
    {
        icon: '👁️',
        question: 'Daily Fluctuating Eyelid Droop or Double Vision',
        answer: 'If droopy eyelids or double vision worsen in evenings, this may be myasthenia gravis—get neurological review.',
        citation: 'Myasthenia Gravis Foundation. Signs and Symptoms. 2025.'
    },

    // --- 36. Unexplained Stiff Neck in Child With Fever and Lethargy ---
    {
        icon: '🧒',
        question: 'Child Presents With Stiff Neck, Fever, and Lethargy',
        answer: 'See ER or neurologist as this can signal meningitis or encephalitis—needs urgent diagnosis and treatment.',
        citation: 'CDC. Meningitis Warning Symptoms in Children. 2025.'
    },

    // --- 37. Progressive Difficulty Understanding Speech or Following Conversation ---
    {
        icon: '💬',
        question: 'Increasing Difficulty Understanding Speech or Conversations',
        answer: 'If communication deteriorates progressively, neurological evaluation for dementia or aphasia is warranted.',
        citation: 'Alzheimer’s Association. Speech Difficulties. 2025.'
    },

    // --- 38. Involuntary Repetitive Muscle Movements or Vocalizations (Tics) ---
    {
        icon: '🤖',
        question: 'Sudden, Uncontrolled Repetitive Movements or Sounds',
        answer: 'If you develop repetitive movements or vocal tics, or these worsen, see a neurologist for Tourette syndrome assessment.',
        citation: 'Tourette Association of America. When to See Doctor. 2025.'
    },

    // --- 39. Unexplained Painful Burning in Specific Areas With Skin Change (Neuropathic Pain) ---
    {
        icon: '🔥',
        question: 'Burning, Tingling, or Shooting Pain With Skin Color Change',
        answer: 'Abnormal sensation and skin changes may indicate neuropathic pain or complex regional pain syndrome.',
        citation: 'NIH. Neuropathic Pain Overview. 2025.'
    },

    // --- 40. Family History of Neurodegenerative Disease With Early Symptoms ---
    {
        icon: '👨‍👩‍👧',
        question: 'Family History of Neuro Disease With Memory, Movement, or Behavioral Changes',
        answer: 'Early signs of Alzheimer’s, Huntington’s, or ALS should be discussed with a neurologist, especially with positive family history.',
        citation: 'NIH. Family History and Genetic Neurological Disorders. 2025.'
    },

    // --- 41. Change in Mental Status While Hospitalized or After Surgery ---
    {
        icon: '🏥',
        question: 'Sudden Confusion, Agitation, or Hallucinations in Hospital',
        answer: 'Delirium may occur after operations or illness—neurologist can help diagnosis and management.',
        citation: 'NIH. Hospital Delirium. 2025.'
    },

    // --- 42. New Seizures or Stroke Symptoms in Someone With Cancer ---
    {
        icon: '🎗️',
        question: 'New Seizures, Weakness, or Speech Trouble in Cancer Patient',
        answer: 'If a person with cancer develops neurological symptoms, prompt neuro evaluation is needed to exclude metastasis, infection, or stroke.',
        citation: 'NIH. Neurological Emergencies in Cancer. 2025.'
    },

    // --- 43. Loss of Vision in One Eye With Temporal Headache (Older Adults) ---
    {
        icon: '🧐',
        question: 'Loss of Vision in One Eye + New Headache Over Temple (Age >50)',
        answer: 'Could be temporal arteritis—emergency neuro and eye evaluation needed as blindness may occur.',
        citation: 'NIH. Temporal Arteritis Guide. 2025.'
    },

    // --- 44. Muscle Weakness, Loss of Reflexes After Recent Virus or Illness ---
    {
        icon: '🦠',
        question: 'Sudden Weakness With Loss of Reflexes After Illness',
        answer: 'Guillain-Barré syndrome can cause swift paralysis after infection—urgent neurologist and hospital care.',
        citation: 'CDC. Guillain-Barré Syndrome. 2025.'
    },

    // --- 45. Recurring Headaches With Nausea and Visual Aura ---
    {
        icon: '🧊',
        question: 'Frequent Headaches With Nausea, Light Sensitivity, or Visual Changes',
        answer: 'Symptoms of migraine or possible neurological disorder need neurology referral for management.',
        citation: 'Migraine Trust. Migraine Aura. 2025.'
    },

    // --- 46. Clicking, Grinding, or Popping of Neck With Neurological Symptoms ---
    {
        icon: '🔊',
        question: 'Noises in Neck With Numbness, Tingling, or Weakness',
        answer: 'Mechanical symptoms with nerve impairment require urgent spine and neuro evaluation.',
        citation: 'NIH. Cervical Myelopathy/Disc Disease. 2025.'
    },

    // --- 47. Sudden Limb Pain With Weakness or Swelling ---
    {
        icon: '🦵',
        question: 'Sudden Severe Limb Pain Accompanied by Weakness or Swelling',
        answer: 'Can signal nerve entrapment, deep vein thrombosis, or acute neuropathic event—urgent diagnosis required.',
        citation: 'NIH. Acute Limb Disorders. 2025.'
    },

    // --- 48. Progressive Loss of Speech, Writing, or Comprehension ---
    {
        icon: '💬',
        question: 'Worsening Trouble With Speech, Writing, or Comprehending Language',
        answer: 'Progressive language or writing difficulties merit neurology assessment for dementia, stroke, or motor neuron disease.',
        citation: 'NIH. Aphasia & Language Disorders. 2025.'
    },

    // --- 49. Neurological Symptoms in Pregnancy or Postpartum Period ---
    {
        icon: '🤰',
        question: 'Seizures, Sudden Severe Headache, or Weakness in Pregnancy/Postpartum',
        answer: 'Obstetric neurological emergencies (eclampsia, stroke) require urgent neuro and OB evaluation.',
        citation: 'CDC. Neurological Emergencies in Pregnancy. 2025.'
    },

    // --- 50. Unexplained Frequent Falls, Fainting, or Cognitive Decline in Elderly ---
    {
        icon: '👵',
        question: 'Elderly With Frequent Falls, Fainting, or Declining Memory',
        answer: 'Repeat falls, fainting spells, or rapid cognitive decline in older adults should always prompt neurological review.',
        citation: 'NIH. Falls & Cognitive Decline in Elderly. 2025.'
    }

];


const preventionData = [

    {
        icon: '🧠',
        question: 'Engage in Regular Mental Stimulation (Reading, Puzzles, Learning)',
        answer: 'Keeping the brain active through challenging activities can lower the risk of cognitive decline and Alzheimer’s disease.',
        citation: 'Alzheimer’s Association. Keeping Your Brain Healthy. 2025.'
    },
    {
        icon: '🏃',
        question: 'Physical Activity and Aerobic Exercise (30 min/day, 5x/week)',
        answer: 'Exercise supports blood flow to the brain, helps prevent stroke, and reduces risk of Parkinson’s and dementia.',
        citation: 'American Heart Association. Physical Activity & Stroke Prevention. 2025.'
    },
    {
        icon: '🥗',
        question: 'Eat a Mediterranean Diet (Rich in Fruits, Vegetables, Whole Grains)',
        answer: 'A balanced diet rich in antioxidants and healthy fats supports brain health and may reduce risks of dementia and stroke.',
        citation: 'NIH. Nutrition and Neuroprotection. 2024.'
    },
    {
        icon: '🚭',
        question: 'Avoid Smoking and Tobacco Products',
        answer: 'Smoking raises stroke risk, accelerates cognitive decline, and worsens prognosis for many neurological disorders.',
        citation: 'CDC. Smoking and Brain Health. 2024.'
    },
    {
        icon: '🍷',
        question: 'Limit Alcohol Intake to Safe Levels',
        answer: 'Excess drinking increases risk of neuropathy, stroke, and cognitive impairment. Moderation is advised.',
        citation: 'NIH. Alcohol and Nervous System. 2025.'
    },
    {
        icon: '🩺',
        question: 'Control Blood Pressure, Cholesterol & Diabetes',
        answer: 'Managing these risk factors is vital for stroke prevention and slowing progression of vascular dementia.',
        citation: 'American Heart Association. Stroke and Heart Health. 2025.'
    },
    {
        icon: '👩‍⚕️',
        question: 'Regular Medical Check-Ups for Early Detection',
        answer: 'Annual exams may catch early signs of stroke, dementia, and movement disorders, allowing for timely treatment.',
        citation: 'NIH. Preventive Screening for Neurological Disease. 2024.'
    },
    {
        icon: '😴',
        question: 'Prioritize Good Quality Sleep (7–9 Hours Nightly)',
        answer: 'Consistent sleep reduces risk for memory issues, mood disorders, and neurological diseases like Alzheimer’s and epilepsy.',
        citation: 'Sleep Foundation. Sleep and Brain Health. 2025.'
    },
    {
        icon: '🥦',
        question: 'Consume Plenty of Antioxidant-Rich Foods',
        answer: 'Antioxidants can help protect nerves from damage and lower overall risk of neurodegenerative diseases.',
        citation: 'NIH. Antioxidants and Neuroprotection. 2024.'
    },
    {
        icon: '🏥',
        question: 'Vaccinate to Prevent Meningitis & Encephalitis',
        answer: 'Getting recommended vaccines (meningococcal, pneumococcal, influenza) can prevent infections that damage the brain and nerves.',
        citation: 'CDC. Vaccines for Meningitis & Encephalitis. 2025.'
    },
    {
    icon: '🧂',
    question: 'Limit Excess Salt and Processed Foods',
    answer: 'High salt intake increases high blood pressure and risk for stroke and vascular dementia—reduce processed food consumption.',
    citation: 'CDC. Sodium Intake and Stroke Prevention. 2024.'
    },
    {
        icon: '🥤',
        question: 'Avoid Excessive Caffeine and Energy Drinks',
        answer: 'Too much caffeine can trigger headaches, increase blood pressure, and worsen anxiety or epileptic seizures in sensitive individuals.',
        citation: 'NIH. Caffeine Effects on the Brain. 2024.'
    },
    {
        icon: '📱',
        question: 'Take Regular Breaks From Screens and Digital Devices',
        answer: 'Limiting screen time and ensuring proper posture prevents tension headaches and eye strain, and lowers risk of computer vision syndrome.',
        citation: 'American Academy of Neurology. Digital Health & Migraine. 2024.'
    },
    {
        icon: '🧊',
        question: 'Cool Down and Hydrate During Hot Weather to Prevent Stroke',
        answer: 'Staying hydrated and avoiding heat stress lowers risk of heat stroke, which can damage brain cells.',
        citation: 'CDC. Heat-Related Illness and Brain Health. 2025.'
    },
    {
        icon: '🪖',
        question: 'Wear Helmets and Protective Gear During Risky Activities',
        answer: 'Helmets protect against traumatic brain and spinal cord injury in sports, cycling, and construction work.',
        citation: 'CDC. Helmet Use for Head Injury Prevention. 2024.'
    },
    {
        icon: '🤹',
        question: 'Practice Balance and Coordination Training',
        answer: 'Improves mobility and lowers risk of falls and traumatic brain injury in all ages, especially older adults.',
        citation: 'NIH. Balance Therapy for Neuroprotection. 2025.'
    },
    {
        icon: '🦻',
        question: 'Address Hearing and Vision Issues Early',
        answer: 'Hearing loss is linked to cognitive impairment and dementia; regular checks and correction are preventive.',
        citation: 'NIH. Hearing Loss and Dementia Risk. 2025.'
    },
    {
        icon: '🩹',
        question: 'Treat Infections Quickly, Especially in the Head/Neck',
        answer: 'Promptly treating sinus, ear, or dental infections helps prevent the spread to brain or nervous system.',
        citation: 'CDC. Brain Abscess and Infection. 2025.'
    },
    {
        icon: '💉',
        question: 'Stay Up-to-Date on Routine Vaccinations',
        answer: 'Vaccines prevent viral and bacterial infections (e.g. measles, mumps, polio) that can lead to brain damage.',
        citation: 'WHO. Immunization and Neurological Health. 2024.'
    },
    {
        icon: '🧘',
        question: 'Manage Stress With Relaxation and Mindfulness',
        answer: 'Chronic stress increases risk for migraine, stroke, and dementia. Mindfulness techniques reduce neurological risk.',
        citation: 'Mayo Clinic. Stress and the Brain. 2025.'
    },
    {
    icon: '🦵',
    question: 'Maintain Healthy Body Weight (BMI 18.5–24.9)',
    answer: 'Obesity raises risk for stroke, neuropathy, and cognitive impairment. Healthy weight protects brain and nerve health.',
    citation: 'NIH. Obesity and Neurological Disorders. 2024.'
    },
    {
        icon: '🥑',
        question: 'Include Healthy Fats (Omega-3s from Fish, Nuts, Seeds)',
        answer: 'Omega-3 fatty acids reduce brain inflammation, support neuron health, and help prevent Alzheimer’s and depression.',
        citation: 'NIH. Omega-3s and Brain Function. 2025.'
    },
    {
        icon: '🚶‍♂️',
        question: 'Participate in Social Activities and Group Exercise',
        answer: 'Staying socially active and exercising with others supports brain health and reduces risk for dementia and depression.',
        citation: 'Alzheimer’s Association. Social Engagement & Brain Health. 2025.'
    },
    {
        icon: '🧊',
        question: 'Manage Diabetes and Blood Sugar',
        answer: 'Good glucose control prevents nerve damage (neuropathy), stroke, and cognitive decline. Test and manage diabetes regularly.',
        citation: 'American Diabetes Association. Nerve and Brain Health. 2025.'
    },
    {
        icon: '☀️',
        question: 'Regular Exposure to Sunlight for Vitamin D Production',
        answer: 'Adequate vitamin D may lower risk for MS and cognitive decline. Get safe sun daily, supplement if needed.',
        citation: 'NIH. Vitamin D and Brain Health. 2024.'
    },
    {
        icon: '📚',
        question: 'Learn New Skills and Hobbies',
        answer: 'Lifelong learning builds cognitive reserve, protecting against dementia and improving recovery after stroke or injury.',
        citation: 'NIH. Cognitive Reserve and Neurologic Disease. 2024.'
    },
    {
        icon: '🩸',
        question: 'Monitor and Treat High Cholesterol',
        answer: 'Lowering cholesterol through diet and, if needed, medication, helps prevent vascular dementia and stroke.',
        citation: 'AHA. Cholesterol and Brain Health. 2025.'
    },
    {
        icon: '🔬',
        question: 'Genetic Counseling for Inherited Neurological Risks',
        answer: 'If family history of neurological disease, genetic counseling can guide screening and lifestyle choices.',
        citation: 'NIH. Genetic Risk and Prevention. 2025.'
    },
    {
        icon: '🤸‍♂️',
        question: 'Practice Balance, Coordination, and Flexibility Training',
        answer: 'Yoga, tai chi, and dance enhance physical function and lower risks of falls and head injuries.',
        citation: 'NIH. Falls and Neuroprotection. 2025.'
    },
    {
        icon: '💡',
        question: 'Address Mood Disorders Early (Depression, Anxiety)',
        answer: 'Mental health problems increase risk for neurological disease and worsen outcomes—early treatment for depression, anxiety, and stress is vital.',
        citation: 'NIH. Depression and Brain Health. 2025.'
    },
    {
    icon: '🧬',
    question: 'Get Early Screening if Family History of Alzheimer’s or Dementia',
    answer: 'Regular memory, language, and cognitive screening in at-risk individuals help detect early dementia for intervention.',
    citation: 'Alzheimer’s Association. Family History and Early Detection. 2025.'
    },
    {
        icon: '🦻',
        question: 'Use Hearing Aids, Glasses, or Sensory Support Devices',
        answer: 'Correction of hearing and vision reduces risk of confusion, falls, and long-term cognitive impairment.',
        citation: 'NIH. Sensory Correction and Dementia Prevention. 2025.'
    },
    {
        icon: '🍎',
        question: 'Eat Plenty of Whole Fruits, Vegetables, Whole Grains',
        answer: 'Diets rich in fiber, vitamins, and minerals help lower risk of stroke, neuropathy, and cognitive decline.',
        citation: 'CDC. Nutrition for Brain Health. 2025.'
    },
    {
        icon: '💉',
        question: 'Vaccinate for Polio, Measles, Mumps, and Encephalitis',
        answer: 'Routine immunizations prevent infections that can cause paralysis, brain swelling, and lifelong disability.',
        citation: 'CDC. Immunization and Neuroprotection. 2025.'
    },
    {
        icon: '🛡️',
        question: 'Protect Against Tick and Mosquito-Borne Illnesses',
        answer: 'Use repellent and cover skin to avoid tick/flea/virus infections that can cause meningitis or encephalitis.',
        citation: 'CDC. Vector-Borne Disease Prevention. 2025.'
    },
    {
        icon: '🚲',
        question: 'Use Helmets and Protective Gear for Sports',
        answer: 'Helmets prevent head injuries, brain trauma, and concussion.',
        citation: 'CDC. Sports Injury Prevention. 2025.'
    },
    {
        icon: '👩‍⚕️',
        question: 'Annual Review of Medications for Neuro Side Effects',
        answer: 'Review drugs for interactions or risk (e.g., anticholinergics, sedatives) that may harm cognition or nerve function.',
        citation: 'NIH. Medication and Neurological Safety. 2024.'
    },
    {
        icon: '🪥',
        question: 'Practice Good Dental Hygiene',
        answer: 'Oral infections can spread to the brain; regular teeth cleaning and dental checkups lower this risk.',
        citation: 'CDC. Dental Hygiene and Neuro Health. 2025.'
    },
    {
        icon: '🧂',
        question: 'Limit Sodium, Sugar, and Saturated Fats',
        answer: 'High salt and fat consumption increase risk for stroke, obesity, and cognitive decline.',
        citation: 'NIH. Diet and Brain Health. 2025.'
    },
    {
        icon: '💧',
        question: 'Stay Hydrated with Clean Water',
        answer: 'Dehydration can trigger headaches, confusion, and worsen epilepsy or delirium.',
        citation: 'NIH. Hydration and Neurological Wellness. 2024.'
    },
    {
    icon: '🛏️',
    question: 'Take Regular Sleep Hygiene Steps for Healthy Rest',
    answer: 'Maintain a sleep schedule, avoid screens before bed, and ensure restful sleep to reduce risks for memory loss, epilepsy, and mood disorders.',
    citation: 'Sleep Foundation. Sleep Hygiene and Cognitive Health. 2025.'
    },
    {
        icon: '🥔',
        question: 'Avoid Excess Use of Processed and Junk Foods',
        answer: 'Ultra-processed foods contain chemicals and fats that worsen neurodegenerative risks over time.',
        citation: 'NIH. Food Quality and Brain Aging. 2025.'
    },
    {
        icon: '👨‍👩‍👧',
        question: 'Teach and Encourage Helmet, Safety, and Seatbelt Use in Children',
        answer: 'Safe practices from childhood reduce head trauma and long-term risk of epilepsy, cognitive impairment, and physical disabilities.',
        citation: 'CDC. Childhood Injury Prevention. 2025.'
    },
    {
        icon: '🧪',
        question: 'Participate in Regular Blood Tests for Cholesterol, Sugar, and Thyroid Function',
        answer: 'Monitor and treat high risk factors for stroke, dementia, and nerve damage.',
        citation: 'NIH. Blood Test Screening for Neurological Health. 2025.'
    },
    {
        icon: '🚴',
        question: 'Maintain Active Daily Living Activities (Walking, Gardening, Shopping)',
        answer: 'Daily activity keeps nerves, muscles, and brain circuits strong, protecting against movement disorders.',
        citation: 'Alzheimer’s Association. Active Living and Brain Health. 2025.'
    },
    {
        icon: '🦸‍♂️',
        question: 'Advocate Safe Work Environments and Protective Laws',
        answer: 'Promoting workplace safety standards and ergonomics prevents repetitive nerve injury and head trauma.',
        citation: 'NIOSH. Occupational Neuroprotection. 2025.'
    },
    {
        icon: '🔋',
        question: 'Prevent and Treat Vitamin Deficiencies (B12, Folate, D)',
        answer: 'Supplements or fortified food can reverse or prevent neurological problems like neuropathy and dementia.',
        citation: 'NIH. Vitamin Deficiency and Neurological Disease. 2025.'
    },
    {
        icon: '🧍',
        question: 'Optimize Posture and Ergonomics at Desk or Workstation',
        answer: 'Correct posture and regular breaks lower risk for tension headaches and repetitive strain injuries.',
        citation: 'NIOSH. Ergonomics for Brain & Nerve Health. 2025.'
    },
    {
        icon: '🚻',
        question: 'Manage Bladder and Bowel Health, Especially in Neuro Disease',
        answer: 'Healthy elimination habits lower complication risk in MS, Parkinson’s, and spinal disorders.',
        citation: 'National MS Society. Bladder and Bowel Management. 2025.'
    },
    {
        icon: '🧑‍⚕️',
        question: 'Early Intervention for Suspected Neurological Symptoms',
        answer: 'Reporting abnormal symptoms (weakness, confusion, vision loss) promptly improves outcomes through early diagnosis and treatment.',
        citation: 'NIH. Warning Signs and Early Intervention. 2025.'
    }

];


//CHATBOT TAB INITIALIZATION CONSTANTS
// ========================================================================

// ====================
// HEALTH ASSISTANT CHATBOT DATA & LOGIC
// ====================

// Main menu options
// Main menu options
const healthMainMenu = [
    "১. স্ট্রোক / ব্রেন অ্যাটাক",
    "২. আলঝাইমার / স্মৃতিলোপ",
    "৩. পারকিনসন",
    "৪. এপিলেপসি / মৃগী",
    "৫. মাইগ্রেন / মাথাব্যথা",
    "৬. বহুপ্রকার স্ক্লেরোসিস (Multiple Sclerosis)",
    "৭. নারকোলেপসি / ঘুমের সমস্যা",
    "৮. সেরিব্রাল পালসি",
    "৯. বেলস পলসি",
    "১০. নার্ভ পেইন / নিউরোপ্যাথি",
    "১১. গিলিয়ান-ব্যারে সিন্ড্রোম",
    "১২. হান্টিংটন ডিজিজ"
];

// Sub-menu prompts
const healthPromptMap = {

 "stroke": {
    "botPrompt": "স্ট্রোক/ব্রেন অ্যাটাক থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "হঠাৎ হাত-পা অবশ",
      "বক্তব্য বা কথা বলতে সমস্যা",
      "মুখের একদিকে বেঁকে যাওয়া",
      "দৃষ্টিহীনতা বা ঝাপসা দেখার সমস্যা",
      "চলাফেরা/ব্যালেন্স হারানো"
    ]
  },
  "alzheimer": {
    "botPrompt": "আলঝাইমার/স্মৃতিলোপ থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "স্মৃতিভ্রান্তি",
      "বিবেগ/সিদ্ধান্তে সমস্যা",
      "জিনিস ভুলে যাওয়া",
      "পরিবার বা পরিচিত জনকে না চিনতে পারা",
      "নিজের যত্ন নিতে সমস্যা"
    ]
  },
  "parkinson": {
    "botPrompt": "পারকিনসন থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "শরীরে কম্পন বা কাপুনি",
      "চলার সময় কঠিনতা",
      "শরীর শক্ত/স্টিফ হয়ে যাওয়া",
      "মুখে আবেগহীনতা",
      "স্বচ্ছন্দ/asymmetrical চলাচল"
    ]
  },
  "epilepsy": {
    "botPrompt": "এপিলেপসি/মৃগী রোগে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "বারবার খিঁচুনি/সিজ়ার",
      "অজ্ঞান হয়ে যাওয়া",
      "মুখ বা শরীর শক্ত হয়ে যাওয়া",
      "ভবিষ্যৎ নিয়ে আতঙ্ক",
      "নিজেকে বা অন্যকে কামড়ে দেয়া/জরায়ে টান"
    ]
  },
  "migraine": {
    "botPrompt": "মাইগ্রেন/মাথাব্যথা থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "মাথায় প্রবল ব্যথা",
      "আলো/শব্দে অস্বস্তি",
      "বমি ভাব/বমি",
      "চোখে এতকাল ধরা পড়া",
      "ব্যথার কারণে দৈনন্দিন কাজে অসুবিধা"
    ]
  },
  "multiple_sclerosis": {
    "botPrompt": "বহুপ্রকার স্ক্লেরোসিস (Multiple Sclerosis) থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "দৃষ্টিশক্তি কমে যাওয়া",
      "হাত-পা দুর্বল বা অসাড়",
      "চলার সময় ভারসাম্য হারানো",
      "প্রস্রাব ধরে রাখতে না পারা",
      "দীর্ঘকাল ক্লান্তি/ব্যথা"
    ]
  },
  "narcolepsy": {
    "botPrompt": "নারকোলেপসি/ঘুমের সমস্যা কী কী সমস্যা করতে পারে জানতে চান?",
    "options": [
      "দিনের বেলায় অত্যধিক ঘুম ঘুম ভাব",
      "হঠাৎ ঘুমিয়ে পড়া",
      "পেশী দুর্বলতা (cataplexy)",
      "ঘুমের মধ্যে দুর্ভাবনা",
      "কম মনোযোগ/স্মৃতি সমস্যা"
    ]
  },
  "cerebral_palsy": {
    "botPrompt": "সেরিব্রাল পালসি থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "প্রস্রাব/প্রস্রাবের অসুবিধা",
      "চলাফেরা/হাঁটাচলায় বিলম্ব",
      "মাংসপেশি দুর্বলতা ও স্টিফনেস",
      "সঠিক কথাবার্তা/ভাষায় অসুবিধা",
      "ছোট/বিকৃত যৌথ বিকাশ"
    ]
  },
  "bells_palsy": {
    "botPrompt": "বেলস পলসি রোগে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "মুখের একদিকে দুর্বলতা/ঝুলে যাওয়া",
      "কান/মুখে ব্যথা",
      "চোখ বন্ধ করতে অসুবিধা",
      "স্বাদ পাওয়ায় বিঘ্ন",
      "লালা ঝরা"
    ]
  },
  "neuropathy": {
    "botPrompt": "নার্ভ পেইন/নিউরোপ্যাথি থেকে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "হাত/পায়ে ঝাঝ বা পিন পিন অনুভূতি",
      "চামড়ার স্পর্শে অতিরিক্ত ব্যথা",
      "শক্তি/বলের হ্রাস",
      "চলাফেরায় অসুবিধা",
      "আঙুলে বা পায়ে ফোলা"
    ]
  },
  "guillain_barre": {
    "botPrompt": "গিলিয়ান-ব্যারে সিন্ড্রোমে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "হঠাৎ দুর্বলতা/অসাড়তা",
      "হাঁটা/চলতে সমস্যা",
      "শ্বাসকষ্ট",
      "তীব্র পেশী ব্যথা",
      "রিফ্লেক্স কমে যাওয়া"
    ]
  },
  "huntington": {
    "botPrompt": "হান্টিংটন ডিজিজ রোগে কি কি সমস্যা হতে পারে জানতে চান?",
    "options": [
      "অস্বাভাবিক চলাফেরা/হঠাৎ টানা",
      "মানসিক পরিবর্তন/বিষণ্নতা",
      "স্মৃতি কমে যাওয়া",
      "বক্তব্য/কথাবার্তায় অসুবিধা",
      "খাদ্য গিলতে সমস্যা"
    ]
  }
};

// Map Bengali to English keys
const nextStateMap = {
   "১. স্ট্রোক / ব্রেন অ্যাটাক": "stroke",
    "২. আলঝাইমার / স্মৃতিলোপ": "alzheimer",
    "৩. পারকিনসন": "parkinson",
    "৪. এপিলেপসি / মৃগী": "epilepsy",
    "৫. মাইগ্রেন / মাথাব্যথা": "migraine",
    "৬. বহুপ্রকার স্ক্লেরোসিস (Multiple Sclerosis)": "multiple_sclerosis",
    "৭. নারকোলেপসি / ঘুমের সমস্যা": "narcolepsy",
    "৮. সেরিব্রাল পালসি": "cerebral_palsy",
    "৯. বেলস পলসি": "bells_palsy",
    "১০. নার্ভ পেইন / নিউরোপ্যাথি": "neuropathy",
    "১১. গিলিয়ান-ব্যারে সিন্ড্রোম": "guillain_barre",
    "১২. হান্টিংটন ডিজিজ": "huntington"
};

// Chatbot state
const chatbotState = {
    awaitingMainMenu: true,
    awaitingSubMenu: false,
    currentSection: null
};


// ====================
// CONVERSATION STATS TRACKING
// ====================

const conversationStats = {
    totalMessages: 0,
    botResponses: 0,
    buttonClicks: 0,
    typedMessages: 0,
    conversationChain: 1
};

/* CHatbot functions taken from standalone chatbot */

/*RAG Integration */

// Trigger RAG with complete Q1-12 context
function triggerFinalRAGWithAllContext() {
    // Combine all Q&A from both Q1-5 and Q6-12
    const allQA = [...appState.q1ToQ5History, ...appState.q6ToQ12History];

    // Format conversation_history as array of strings
    const conversationHistory = allQA.map((qa, index) =>
        `প্রশ্ন ${index + 1}: ${qa.question}\nউত্তর: ${qa.answer}`
    );

    const ragData = {
        query: `${appState.selectedSubcategory} - সম্পূর্ণ তথ্য বিশ্লেষণ`,
        conversation_history: conversationHistory,
        question_stage: 'after_q12'
    };

    console.log('🔍 Calling RAG with COMPLETE Q1-12 context:', ragData);

    // Show loading message
    addChatMessage("assistant", "⏳ আপনার সম্পূর্ণ তথ্য বিশ্লেষণ করছি...");

    fetch('/api/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ragData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('✅ Final RAG Response with Q1-12 context:', data);

        // Remove loading message
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages && chatMessages.lastChild) {
            chatMessages.removeChild(chatMessages.lastChild);
        }

        // ✅ SHOW THE RAG RESPONSE
        const responseText = data.answer || data.response || "দুঃখিত, এই মুহূর্তে বিস্তারিত তথ্য পাওয়া যায়নি।";
        addChatMessage("assistant", responseText);

        // ✅ Enable freeform mode for 2 followup questions
        setTimeout(() => {
            appState.followupCount = 0;
            chatbotState.awaitingFreeformQuestion = true;
            addChatMessage("assistant", "আপনার কি আরও কোনো প্রশ্ন আছে? প্রশ্ন টাইপ করুন:", ["না", "প্রথম থেকে শুরু করুন"]);
        }, 1000);
    })
    .catch(error => {
        console.error('❌ Final RAG Error:', error);

        // Remove loading message
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages && chatMessages.lastChild) {
            chatMessages.removeChild(chatMessages.lastChild);
        }

        addChatMessage("assistant", "দুঃখিত, সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।", ["প্রথম থেকে শুরু করুন"]);
    });
}

// Trigger RAG with all collected context
function triggerRAGWithContext() {
    const ragData = {
        query: appState.selectedSubcategory,
        conversation_history: appState.q1ToQ5History.map(qa =>
            `প্রশ্ন: ${qa.question}\nউত্তর: ${qa.answer}`
        ),
        question_stage: 'initial_with_context',
        health_category: appState.healthCategory
    };

    console.log('🔍 Calling RAG with full context:', ragData);

    fetch('/api/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ragData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('✅ RAG Response received:', data);

        const responseText = data.answer || data.response || "দুঃখিত, এই মুহূর্তে তথ্য পাওয়া যায়নি।";
        addChatMessage("assistant", responseText);

        // Ask if user wants more information
        // Enable free-form followup questions (max 2)
       // Ask if user wants doctor contact information
        setTimeout(() => {
            addChatMessage("assistant", "আপনি কি ডাক্তারের যোগাযোগের তথ্য চান?", ["হ্যাঁ", "না"]);
            chatbotState.awaitingDoctorContactDecision = true;
        }, 1000);
    })
    .catch(error => {
        console.error('❌ RAG Error:', error);
        addChatMessage("assistant", "দুঃখিত, সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।", ["প্রথম থেকে শুরু করুন"]);
    });
}

function triggerInitialRagResponse() {
    const contextSummary = appState.q1ToQ5History.join('\n');
    const query = `বিভাগ: ${appState.healthCategory}, উপবিভাগ: ${appState.selectedSubcategory}। প্রথম ৫টি উত্তর: ${contextSummary}`;

    fetch('http://localhost:8502/api/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: query,
            conversation_history: appState.conversationHistory.map(h => `${h.sender}: ${h.text}`),
            question_stage: 'after_q5'
        })
    })
    .then(response => response.json())
    .then(data => {
        const responseText = data.answer + (data.citations || '');
        addMessage("assistant", responseText);

        appState.initialRagDone = true;

        const districtOptions = DISTRICTS.join(", ");
        const contactPrompt = "আপনি কি স্থানীয় স্বাস্থ্য কেন্দ্র ও ডাক্তারদের যোগাযোগের তথ্য জানতে চান?";
        console.log("Printing contactPrompt")
            setTimeout(() => {
                addMessage("assistant", contactPrompt);
                appState.awaitingContactConfirmation = true;
                console.log("Printing setTimeout")
                enableTextInput();
            }, 2000);

       console.log("After contactPrompt")
    })
    .catch(error => {
        console.error('RAG Error:', error);
        addMessage("assistant", "দুঃখিত, সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        setTimeout(() => {
            askNextQuestion();
        }, 2000);
    });
}

function triggerFinalRagResponse() {
    const allContext = appState.q1ToQ5History.concat(appState.q6ToQ12History).join('\n');
    const query = `সম্পূর্ণ মূল্যায়ন - বিভাগ: ${appState.healthCategory}, উপবিভাগ: ${appState.selectedSubcategory}। সকল উত্তর: ${allContext}`;

    fetch('http://localhost:8502/api/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: query,
            conversation_history: appState.conversationHistory.map(h => `${h.sender}: ${h.text}`),
            question_stage: 'after_q12'
        })
    })
    .then(response => response.json())
    .then(data => {
        const responseText = data.answer + (data.citations || '');
        addMessage("assistant", responseText);

        setTimeout(() => {
            addMessage("assistant", "❓ **আপনার আর কোনো প্রশ্ন আছে? যদি থাকে তাহলে লিখুন:**");
            appState.awaitingFollowupDecision = true;
            enableTextInput();
        }, 2000);
    })
    .catch(error => {
        console.error('RAG Error:', error);
        addMessage("assistant", "দুঃখিত, সমস্যা হয়েছে।");
        setTimeout(() => {
            addMessage("assistant", "❓ **আপনার আর কোনো প্রশ্ন আছে? যদি থাকে তাহলে লিখুন:**");
            appState.awaitingFollowupDecision = true;
            enableTextInput();
        }, 2000);
    });
}

/* CHATBOT END RAG */

/* START CHATBOT Conversational Flow */

// Ask next question
// Ask next question from QUESTION_SEQUENCES
function askNextQuestion() {
    const questions = QUESTION_SEQUENCES[appState.healthCategory];
    if (!questions) {
        console.error('No questions found for category:', appState.healthCategory);
        return;
    }

    const questionNum = appState.askedQuestions.length;

    // Ask first 5 questions only
    if (questionNum < 5) {
        const currentQuestion = questions[questionNum];
        appState.askedQuestions.push(currentQuestion);

        addChatMessage("assistant", `প্রশ্ন ${questionNum + 1}/5: ${currentQuestion}`);

        // Set state to wait for answer
        chatbotState.awaitingQuestionAnswer = true;
        chatbotState.currentQuestionIndex = questionNum;

        console.log(`Asked question ${questionNum + 1}:`, currentQuestion);
    } else {
        // All 5 questions answered, trigger RAG
        triggerRAGWithContext();
    }
}
// Handle user's answer to question
function handleQuestionAnswer(userInput) {
    const questionNum = appState.askedQuestions.length - 1;

    // Determine if this is Q1-5 or Q6-12
    if (questionNum < 5) {
        // Store in Q1-5 history
        appState.q1ToQ5History.push({
            question: appState.askedQuestions[questionNum],
            answer: userInput
        });
        console.log(`Answer ${questionNum + 1} (Q1-5) saved:`, userInput);

        // Ask next question or trigger RAG after Q5
        if (questionNum < 4) {
            setTimeout(() => {
                askNextQuestion();
            }, 500);
        } else {
            // All Q1-5 answered - call RAG with Q1-5 context
            chatbotState.awaitingQuestionAnswer = false;
            setTimeout(() => {
                addChatMessage("assistant", "✅ ধন্যবাদ! আপনার তথ্যের ভিত্তিতে সঠিক পরামর্শ খুঁজছি...");
                triggerRAGWithContext();
            }, 500);
        }
    } else {
        // ✅ Store in Q6-12 history
        appState.q6ToQ12History.push({
            question: appState.askedQuestions[questionNum],
            answer: userInput
        });
        console.log(`Answer ${questionNum + 1} (Q6-12) saved:`, userInput);

        // Ask next question or trigger final RAG after Q12
        if (questionNum < 11) {
            // More Q6-12 questions remaining
            setTimeout(() => {
                // Ask next question from Q6-12
                const questions = QUESTION_SEQUENCES[appState.healthCategory];
                const nextQuestionNum = questionNum + 1;

                if (questions && questions[nextQuestionNum]) {
                    const currentQuestion = questions[nextQuestionNum];
                    appState.askedQuestions.push(currentQuestion);

                    const questionLabel = nextQuestionNum - 4; // Q6=2, Q7=3, etc.
                    addChatMessage("assistant", `প্রশ্ন ${questionLabel}/7: ${currentQuestion}`);

                    chatbotState.awaitingQuestionAnswer = true;
                    chatbotState.currentQuestionIndex = nextQuestionNum;

                    console.log(`Asked followup question ${questionLabel}:`, currentQuestion);
                }
            }, 500);
        } else {
            // ✅ All Q6-12 answered - call RAG with COMPLETE Q1-12 context
            chatbotState.awaitingQuestionAnswer = false;
            setTimeout(() => {
                addChatMessage("assistant", "✅ সব প্রশ্নের উত্তর পেয়েছি! আরও বিস্তারিত পরামর্শ খুঁজছি...");
                triggerFinalRAGWithAllContext();  // ✅ This calls RAG with Q1-12
            }, 500);
        }
    }
}

// Handle free-form followup questions with full Q1-12 context
function handleFreeformFollowupQuestion(userQuestion) {
    // Increment followup counter
    appState.followupCount++;

    console.log(`Followup question ${appState.followupCount}/2:`, userQuestion);

    // Combine all previous Q&A as context
    const allQA = [...appState.q1ToQ5History, ...appState.q6ToQ12History];

    const conversationHistory = allQA.map((qa, index) =>
        `প্রশ্ন ${index + 1}: ${qa.question}\nউত্তর: ${qa.answer}`
    );

    const ragData = {
        query: userQuestion,
        conversation_history: conversationHistory,
        question_stage: 'freeform_followup'
    };

    console.log('🔍 Freeform followup question with Q1-12 context:', ragData);

    // Show loading
    addChatMessage("assistant", "⏳ আপনার প্রশ্নের উত্তর খুঁজছি...");

    fetch('/api/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ragData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('✅ Followup RAG Response:', data);

        // Remove loading message
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages && chatMessages.lastChild) {
            chatMessages.removeChild(chatMessages.lastChild);
        }

        const responseText = data.answer || data.response || "দুঃখিত, উত্তর পাওয়া যায়নি।";
        addChatMessage("assistant", responseText);

        // Check if this was the 2nd followup question
        if (appState.followupCount >= 2) {
            // ✅ After 2 followups, thank and reset
            setTimeout(() => {
                addChatMessage("assistant", "ধন্যবাদ! আশা করি আমি আপনাকে সাহায্য করতে পেরেছি। 🌸");
                setTimeout(() => {
                    addChatMessage("assistant", "নতুন কথোপকথন শুরু করতে চাইলে নিচের বাটনে ক্লিক করুন:", ["প্রথম থেকে শুরু করুন"]);
                }, 1000);
            }, 1000);
        } else {
            // ✅ Still have followups remaining
            setTimeout(() => {
                const remaining = 2 - appState.followupCount;
                addChatMessage("assistant", `আরও প্রশ্ন করতে পারেন (${remaining} টি বাকি):`, ["না", "প্রথম থেকে শুরু করুন"]);
                chatbotState.awaitingFreeformQuestion = true;
            }, 1000);
        }
    })
    .catch(error => {
        console.error('❌ Followup RAG Error:', error);

        // Remove loading message
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages && chatMessages.lastChild) {
            chatMessages.removeChild(chatMessages.lastChild);
        }

        addChatMessage("assistant", "দুঃখিত, সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।", ["প্রথম থেকে শুরু করুন"]);
    });
}

// Handle text input (when user types and presses Enter)
function handleTextInput(userInput) {
    if (!userInput || !userInput.trim()) return;

    addChatMessage("user", userInput);

    if (chatbotState.awaitingQuestionAnswer) {
        // User is answering one of the 5 questions
        handleQuestionAnswer(userInput);
    } else if (chatbotState.awaitingFollowup) {
        // User wants to ask more questions
        chatbotState.awaitingFollowup = false;
        // Treat as free-form question to RAG
        triggerRAGWithFreeformQuestion(userInput);
    }
    // ... other conditions
}

function askFollowupQuestion() {
// Reset state to general information mode
    appState.currentState = 'collecting_info';
    appState.awaitingFollowupDecision = true;

    const followupPrompt = "আপনার কি অন্য কোনো প্রশ্ন বা জিজ্ঞাসা আছে? অথবা অন্য কোনো জেলার তথ্য জানতে চান?";

    // Display the question
    addMessage("assistant", followupPrompt);

    // Enable input and prepare for the user's Yes/No response
    enableTextInput();
}

function handleFollowupDecision(userInput) {
    const wantsFollowup = detectYesNo(userInput);
    appState.awaitingFollowupDecision = false;

    if (wantsFollowup) {
        addMessage("assistant", "ঠিক আছে, আপনি আপনার প্রশ্নটি জিজ্ঞাসা করতে পারেন।");
        appState.currentState = 'collecting_info';
        // The conversation simply continues from here.
    } else {
        addMessage("assistant", "আপনাকে সাহায্য করতে পেরে খুশি হলাম। ধন্যবাদ।");
        // End the conversation / start the countdown timer
        setTimeout(resetConversation, 5000);
    }
    enableTextInput();
}

function handleFollowupQuestion(userInput) {
    appState.followupCount++;

    fetch('http://localhost:8502/api/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: userInput,
            conversation_history: appState.conversationHistory.map(h => `${h.sender}: ${h.text}`),
            question_stage: 'followup'
        })
    })
    .then(response => response.json())
    .then(data => {
        const responseText = data.answer + (data.citations || '');
        addMessage("assistant", responseText);

        if (appState.followupCount < 2) {
            setTimeout(() => {
                addMessage("assistant", "✅ আপনি আরও একটি প্রশ্ন করতে পারেন। আপনার প্রশ্ন লিখুন:");
                enableTextInput();
            }, 2000);
        } else {
            setTimeout(() => {
                addMessage("assistant", "ধন্যবাদ! আপনার সুস্বাস্থ্য কামনা করি। 🌸\n\n*(৯০ সেকেন্ডের মধ্যে নতুন কথোপকথন শুরু হবে)*");
                appState.currentState = 'ready_to_reset';
            }, 2000);
        }

        updateStats();
    })
    .catch(error => {
        console.error('RAG Error:', error);
        addMessage("assistant", "দুঃখিত, সমস্যা হয়েছে।");

        if (appState.followupCount < 2) {
            setTimeout(() => {
                enableTextInput();
            }, 1500);
        } else {
            appState.currentState = 'ready_to_reset';
        }
    });
}

function detectYesNo(userInput) {
    const affirmative = ["হ্যাঁ", "হা", "yes", "আছে", "চাই", "জানতে", "হাঁ", "y", "হ্যা"];
    const negative = ["না", "no", "নেই", "নাই", "n"];
    // Lowercase and remove punctuation/spaces for comparison
    const sanitized = userInput.trim().replace(/[।.!?]/g, "").toLowerCase();

    // 🏆 FIX: Add a check for EXACT match first for common words
    if (affirmative.includes(sanitized)) {
        return true;
    }
    if (negative.includes(sanitized)) {
        return false;
    }

    // Existing startsWith logic (for phrases like 'হ্যাঁ চাই')
    if (negative.some(neg => sanitized.startsWith(neg))) {
        return false;
    }
    if (affirmative.some(pos => sanitized.startsWith(pos))) {
        return true;
    }

    // Default: return false
    return false;
}
/* END CHATBOT Conversational Flow */


/*Msg Handling Chatbot functions */

// Show doctor contacts for selected district
function showDoctorContacts(district) {
    console.log('Fetching doctors for district:', district);

    // Get doctor info from WOMENSHEALTHRESOURCES
    const districtData = CANCER_HEALTH_RESOURCES[district];
    console.log('Doctor data:', districtData);

    if (!districtData) {
        addChatMessage("assistant", `[দুঃখিত], ${district} [জেলার জন্য এই মুহূর্তে ডাক্তারদের তথ্য পাওয়া যাচ্ছে না।]`);
        return;
    }

    // Format doctor information
    let doctorInfo = `📍 ${district} [জেলার ডাক্তারদের তথ্য:]\n\n`;

    if (districtData.doctors && districtData.doctors.length > 0) {
        districtData.doctors.forEach((doc, index) => {
            doctorInfo += `${index + 1}. ${doc.name}\n`;
            doctorInfo += `   📞 [ফোন]: ${doc.phone}\n\n`;
        });
    }

    // Show centers if available
    if (districtData.centers && districtData.centers.length > 0) {
        doctorInfo += '\n🏥 [স্বাস্থ্যকেন্দ্র:]\n\n';
        districtData.centers.forEach((center, index) => {
            doctorInfo += `${index + 1}. ${center.name}\n`;
            doctorInfo += `   📞 [ফোন]: ${center.phone}\n`;
            if (center.address) {
                doctorInfo += `   📍 [ঠিকানা]: ${center.address}\n`;
            }
            doctorInfo += '\n';
        });
    }

    addChatMessage("assistant", doctorInfo);

    // Ask if user wants more questions (Q6-12)
    setTimeout(() => {
        addChatMessage("assistant", "আপনি কি আরও কিছু প্রশ্ন করতে চান?", ["হ্যাঁ", "না"]);
        chatbotState.awaitingFollowup = true;
    }, 1000);
}

// Add message to chat
function addMessage(sender, text, resources = null, options = null) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    let bubbleContent = text.replace(/\n/g, '<br>');

    if (resources) {
        bubbleContent += resources;
    }

    let optionsHtml = '';
    if (options && options.length > 0) {
        optionsHtml = `
            <div class="options-grid">
                ${options.map((option, index) => `
                    <button class="option-btn" onclick="handleOptionClick('${option.replace(/'/g, "\\'")}', ${index})">
                        ${option}
                    </button>
                `).join('')}
            </div>
        `;
    }

    messageDiv.innerHTML = `
        <div class="message-bubble">${bubbleContent}</div>
        ${optionsHtml}
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    appState.conversationHistory.push({
        sender: sender,
        text: text,
        timestamp: new Date().toISOString()
    });
}

// Send message
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message) return;

    addMessage("user", message);
    input.value = '';
    disableTextInput();

    if (appState.awaitingContactConfirmation) {
        console.log("Going for handleconfirmation")
        handleContactConfirmation(message);
    }
    else if (appState.awaitingDistrictSelection) {
        console.log("Going in")
        handleDistrictSelection(message);
    }
    else if (appState.awaitingFollowupDecision) {
        handleFollowupDecision(message);
    }
    else if (appState.currentState === 'followup_question') {
        handleFollowupQuestion(message);
    }
    else if (appState.currentState === 'collecting_info') {
        handleUserInput(message);
    }
}

// Handle user input (Q1-Q12)
function handleUserInput(userInput) {
    const questionNum = appState.askedQuestions.length;
    const currentQA = `Q${questionNum}: ${appState.askedQuestions[questionNum - 1]}\nA${questionNum}: ${userInput}`;

    if (questionNum <= 5) {
        appState.q1ToQ5History.push(currentQA);
    } else {
        appState.q6ToQ12History.push(currentQA);
    }

    if (questionNum === 5 && !appState.initialRagDone) {
        setTimeout(() => {
            addMessage("assistant", "আপনার প্রথম ৫টি উত্তরের ভিত্তিতে বিশ্লেষণ করছি...");
            triggerInitialRagResponse();
        }, 1000);
    }
    else if (questionNum >= 12) {
        setTimeout(() => {
            addMessage("assistant", "সব প্রশ্নের উত্তর সংগ্রহ সম্পূর্ণ! চূড়ান্ত পরামর্শ ও বিশ্লেষণ করছি...");
            triggerFinalRagResponse();
        }, 1000);
    }
    else {
        setTimeout(() => {
            askNextQuestion();
        }, 1000);
    }
}


// Handle option button click
function handleOptionClick(option) {
    console.log('Option clicked:', option);

    // Add user's selection to chat
    addChatMessage("user", option);
    // ✅ CHECK FOR RESET FIRST (highest priority)
    if (option === "প্রথম থেকে শুরু করুন") {
        resetChatbot();
        return;  // ✅ IMPORTANT: Return immediately
    }

    if (chatbotState.awaitingMainMenu) {
        handleMainMenuSelection(option);
    } else if (chatbotState.awaitingSubMenu) {
        handleSubMenuSelection(option);
    } else if (chatbotState.awaitingQuestionAnswer) {
        handleQuestionAnswer(option);
    } else if (chatbotState.awaitingDoctorContactDecision) {
        // ✅ NEW: Handle doctor contact decision after Q5
        chatbotState.awaitingDoctorContactDecision = false;

        if (option === "হ্যাঁ") {
            // Show district selection
            addChatMessage("assistant", "দয়া করে আপনার জেলা নির্বাচন করুন:", DISTRICT_LIST);
            chatbotState.awaitingDistrictSelection = true;
        } else if (option === "না") {
            // Skip doctor contact, ask about Q6-12
            setTimeout(() => {
                addChatMessage("assistant", "আপনি কি আরও কিছু প্রশ্ন করতে চান?", ["হ্যাঁ", "না"]);
                chatbotState.awaitingFollowup = true;
            }, 500);
        }
    } else if (chatbotState.awaitingDistrictSelection) {
        // ✅ NEW: Handle district selection
        chatbotState.awaitingDistrictSelection = false;
        appState.selectedDistrict = option;
        showDoctorContacts(option);
    } else if (chatbotState.awaitingFollowup) {
    // Handle followup decision (Q6-12 or exit)
    chatbotState.awaitingFollowup = false;

    if (option === "হ্যাঁ") {
            // ✅ FIXED: Start Q6-12 sequence
            setTimeout(() => {
                addChatMessage("assistant", "ঠিক আছে! আমি আরও কয়েকটি প্রশ্ন করব আপনাকে আরও ভালভাবে সাহায্য করার জন্য।");
                setTimeout(() => {
                    // Start from Q6 (index 5)
                    const questionNum = 5;

                    // ✅ ADD VALIDATION AND LOGGING
                    console.log("Starting Q6-12 with healthCategory:", appState.healthCategory);

                    const questions = QUESTION_SEQUENCES[appState.healthCategory];

                    if (!questions) {
                        console.error("❌ No questions found for category:", appState.healthCategory);
                        console.log("Available categories:", Object.keys(QUESTION_SEQUENCES));
                        addChatMessage("assistant", "দুঃখিত, প্রশ্ন লোড করতে সমস্যা হয়েছে। দয়া করে আবার শুরু করুন।", ["প্রথম থেকে শুরু করুন"]);
                        return;
                    }

                    if (!questions[questionNum]) {
                        console.error("❌ Question not found at index:", questionNum);
                        console.log("Total questions available:", questions.length);
                        addChatMessage("assistant", "দুঃখিত, প্রশ্ন পাওয়া যায়নি।", ["প্রথম থেকে শুরু করুন"]);
                        return;
                    }

                    const currentQuestion = questions[questionNum];
                    appState.askedQuestions.push(currentQuestion);

                    const questionLabel = questionNum - 4;  // Q6 = 2
                    addChatMessage("assistant", `প্রশ্ন ${questionLabel}/7: ${currentQuestion}`);

                    chatbotState.awaitingQuestionAnswer = true;
                    chatbotState.currentQuestionIndex = questionNum;

                    console.log(`✅ Starting Q6-12 sequence - Question ${questionLabel}:`, currentQuestion);
                }, 1000);
            }, 500);
         }

    }
}
/* END CHatbot Message Handlers */

/*UI Controls Chatbot */

function disableTextInput() {
            document.getElementById('messageInput').disabled = true;
            document.getElementById('sendBtn').disabled = true;
        }

// Enable/disable text input
function enableTextInput() {
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    document.getElementById('messageInput').focus();
}


function startCountdown() {
        if (appState.countdownTimer) {
            clearInterval(appState.countdownTimer);
        }

        appState.countdownSeconds = 200;

        appState.countdownTimer = setInterval(() => {
            const minutes = Math.floor(appState.countdownSeconds / 60);
            const seconds = appState.countdownSeconds % 60;

            document.getElementById('countdownTimer').textContent =
                `${minutes}:${seconds.toString().padStart(2, '0')}`;

            appState.countdownSeconds--;

            if (appState.countdownSeconds < 0) {
                resetConversation();
            }
        }, 1000);
 }


/* END CHATBOT UI CONTROLS */

/*CORE CHATBOT FUNCTIONS */

function updateStats() {
    document.getElementById('questionsAsked').textContent = `${appState.askedQuestions.length}/12`;
    document.getElementById('followUpCount').textContent = `${appState.followupCount}/2`;
    document.getElementById('currentCategory').textContent = appState.healthCategory || 'প্রারম্ভিক';
    document.getElementById('currentState').textContent = appState.currentState;
}

 // Initialize chatbot
function initializeChatbot() {
    addMessage("assistant", HEALTH_CATEGORIES.start.botPrompt, null, HEALTH_CATEGORIES.start.options);
    startCountdown();
    updateStats();
}


  function resetConversation() {
    if (appState.countdownTimer) {
        clearInterval(appState.countdownTimer);
    }

    // Reset state
    appState.currentState = 'start';
    appState.healthCategory = null;
    appState.selectedSubcategory = null;
    appState.selectedDistrict = null;
    appState.askedQuestions = [];
    appState.q1ToQ5History = [];
    appState.q6ToQ12History = [];
    appState.conversationHistory = [];
    appState.awaitingContactConfirmation = false;
    appState.awaitingDistrictSelection = false;
    appState.initialRagDone = false;
    appState.awaitingFollowupDecision = false;
    appState.followupCount = 0;
    appState.countdownSeconds = 200;

    // Clear chat
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('messageInput').value = '';
    disableTextInput();

    // Restart
    initializeChatbot();
}

/*END CORE CHATBOT FUNCTIONS */


function handleFollowupDecision(userInput) {
    const wantsFollowup = detectYesNo(userInput);
    appState.awaitingFollowupDecision = false;

    if (wantsFollowup) {
        addMessage("assistant", "ঠিক আছে, আপনি আপনার প্রশ্নটি জিজ্ঞাসা করতে পারেন।");
        appState.currentState = 'collecting_info';
        // The conversation simply continues from here.
    } else {
        addMessage("assistant", "আপনাকে সাহায্য করতে পেরে খুশি হলাম। ধন্যবাদ।");
        // End the conversation / start the countdown timer
        setTimeout(resetConversation, 5000);
    }
    enableTextInput();
}


/* START CHATBOT District & Contact */


function handleDistrictSelection(districtName) {

        console.log("handleDistrictSelection")
        // 1. Clean up state and UI
        appState.awaitingDistrictSelection = false;
        appState.selectedDistrict = districtName;
        disableTextInput();

        // 🚨 Critical Log: If this fails, the error is inside 'addMessage' itself.
        console.log("Dis added")

        // 3. Add a loading message
        const loadingMessageId = Date.now();
        addMessage("assistant", "যোগাযোগের তথ্য খুঁজছি, অনুগ্রহ করে অপেক্ষা করুন...", true, null, loadingMessageId);
        console.log("msg added")
        // 🛑 CRITICAL FIX: Format the conversation history into a list of strings
        const formattedConversationHistory = (appState.conversationHistory || []).map(entry => {
            // Format each object as a single string: "sender: text"
            return `${entry.sender}: ${entry.text}`;
        });

        const payload = {
            prompt: `Find health center contacts for ${districtName}.`,
            q1ToQ5History: appState.q1ToQ5History || [],
            q6ToQ12History: appState.q6ToQ12History || [],
            // 🛑 USE THE FORMATTED HISTORY HERE
            conversationHistory: formattedConversationHistory,
            district_selection: districtName
        };
        // 🛑 ADD THIS CRITICAL LOG LINE:
        console.log("Sending payload:", JSON.stringify(payload));

        // 4. Send a request to the backend
        fetch('http://localhost:8502/query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // 🛑 ENSURE THIS BODY MATCHES QueryData EXACTLY 🛑
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            // Remove the loading message
            const messages = document.getElementById('chatMessages');
            messages.removeChild(messages.lastElementChild);

            // 6. Display the result from the backend
            if (data.answer) {
                addMessage("assistant", data.answer);
            } else {
                addMessage("assistant", "দুঃখিত, এই জেলার জন্য যোগাযোগের তথ্য খুঁজে পাওয়া যায়নি।");
            }

            // 7. Re-enable input or continue conversation
            // The conversation should now transition back to the main flow or ask for follow-up
            appState.currentState = 'collecting_info'; // Return to general info collection state
            enableTextInput(); // Ensure input is enabled

            // 🛑 START OF NEW LOGIC TO RESUME QUESTIONS 🛑
            const nextQuestionNum = appState.askedQuestions.length + 1;
            if (appState.initialRagDone && nextQuestionNum <= 12) {
                // If we've done Q1-Q5 and have more questions to ask (Q6-Q12)
                setTimeout(() => {
                    askNextQuestion();
                }, 1000);
            } else {
                // If Q1-Q12 is complete, or if the user asked for contacts before the RAG flow started
                setTimeout(() => {
                    askFollowupQuestion(); // Ask if they need anything else
                }, 1000);
            }
            // 🛑 END OF NEW LOGIC 🛑
        })
        .catch(error => {
            console.error('Error fetching district contacts:', error);
            // Remove loading message and display error
            const messages = document.getElementById('chatMessages');
            messages.removeChild(messages.lastElementChild);
            addMessage("assistant", "যোগাযোগের তথ্য পেতে ব্যর্থ: নেটওয়ার্ক ত্রুটি বা সার্ভার সমস্যা।");
        });
    }


function handleContactConfirmation(userInput) {

        const wantsContacts = detectYesNo(userInput);
        console.log(wantsContacts)
        if (wantsContacts) {
            // Use grid/option buttons for districts
            const districtListText = "আপনার জেলা নির্বাচন করুন: \n" + DISTRICTS.map(d => `• ${d}`).join('\n');
            appState.awaitingContactConfirmation = false;
            addMessage("assistant", districtListText); // Now sends a block of text
            appState.awaitingDistrictSelection = true;
            enableTextInput();

        } else {
            setTimeout(() => {
                askNextQuestion();
            }, 500);
        }
    }

    /* END CHATBOT District & Contact */


// Update stats display
function updateConversationStats() {
    document.getElementById('totalMessages').textContent = conversationStats.totalMessages;
    document.getElementById('botResponses').textContent = conversationStats.botResponses;
    document.getElementById('buttonClicks').textContent = conversationStats.buttonClicks;
    document.getElementById('typedMessages').textContent = conversationStats.typedMessages;
    document.getElementById('conversationChain').textContent = conversationStats.conversationChain;
}

// Track button click
function trackButtonClick() {
    conversationStats.buttonClicks++;
    conversationStats.totalMessages++;
    updateConversationStats();
}

// Track typed message
function trackTypedMessage() {
    conversationStats.typedMessages++;
    conversationStats.totalMessages++;
    updateConversationStats();
}

// Track bot response
function trackBotResponse() {
    conversationStats.botResponses++;
    updateConversationStats();
}

// Increment conversation chain
function incrementChain() {
    conversationStats.conversationChain++;
    updateConversationStats();
}

//CHATBBOT FUNCTIONS


// Handle main menu selection
function handleSubMenuSelection(userInput) {
    chatbotState.awaitingSubMenu = false;

    // Store selected subcategory
    appState.selectedSubcategory = userInput;
    appState.healthCategory = chatbotState.currentSection;
    appState.askedQuestions = [];
    appState.q1ToQ5History = [];

    // Show acknowledgment
    setTimeout(() => {
        addChatMessage("assistant", `ধন্যবাদ! "${userInput}" সম্পর্কে আপনাকে আরও ভালভাবে সাহায্য করার জন্য আমি ৫টি প্রশ্ন করব।`);

        // Start asking questions after a short delay
        setTimeout(() => {
            askNextQuestion();
        }, 1000);
    }, 500);
}


// Reset chatbot and stats
function resetChatbot() {
    // Reset stats
    conversationStats.totalMessages = 0;
    conversationStats.botResponses = 0;
    conversationStats.buttonClicks = 0;
    conversationStats.typedMessages = 0;
    conversationStats.conversationChain = 1;
    updateConversationStats();

    // Reinitialize chatbot
    initializeHealthAssistant();
}

// ====================
// END CHATBOT FUNCTIONS (ADD AFTER YOUR DATA STRUCTURES)
// ====================


// ====================
// CHATBOT TAB INITIALIZATION
// ====================



// Add message to chat
// Modify existing addChatMessage to track stats
function addChatMessage(sender, text, options = null) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.error('❌ chatMessages container not found!');
        return;
    }

    // EXTENSIVE DEBUG LOGGING
    console.log('═══════════════════════════════════════════════════');
    console.log('📨 addChatMessage called');
    console.log('Sender:', sender);
    console.log('Text:', text);
    console.log('Options:', options);
    console.log('Options type:', typeof options);
    console.log('Is Array?', Array.isArray(options));
    console.log('Options length:', options ? options.length : 'N/A');
    if (options) {
        console.log('Options content:', JSON.stringify(options, null, 2));
    }
    console.log('═══════════════════════════════════════════════════');

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    messageDiv.style.cssText = 'margin-bottom: 1rem; padding: 1rem; border-radius: var(--radius-md); max-width: 85%; animation: fadeIn 0.3s ease;' +
                               (sender === 'user' ? 'background: var(--color-primary); color: white; margin-left: auto; border-bottom-right-radius: 4px;' : 'background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); margin-right: auto; border-bottom-left-radius: 4px;');

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = text;
    textDiv.style.cssText = 'line-height: 1.5; margin-bottom: 0;';
    messageDiv.appendChild(textDiv);

    // Track bot response
    if (sender === 'assistant' || sender === 'bot') {
        if (typeof trackBotResponse === 'function') {
            trackBotResponse();
        }
    }

    // CRITICAL: Check if options is actually an array
    if (options && Array.isArray(options) && options.length > 0) {
        console.log('✅ Creating buttons for', options.length, 'options');

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'chat-options';
        optionsDiv.style.cssText = 'display: grid; grid-template-columns: 1fr; gap: 0.5rem; margin-top: 1rem;';

        options.forEach((option, index) => {
            console.log(`  Creating button ${index + 1}:`, option);

            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.style.cssText = 'background: var(--color-secondary); padding: 0.75rem 1rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; text-align: left; transition: all 0.2s ease; font-size: 1rem; font-weight: 500; color: var(--color-text);';

            btn.addEventListener('click', () => {
                console.log('🔘 Button clicked:', option);
                if (typeof trackButtonClick === 'function') {
                    trackButtonClick();
                }
                handleOptionClick(option);
            });

            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'var(--color-primary)';
                btn.style.color = 'white';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'var(--color-secondary)';
                btn.style.color = 'var(--color-text)';
            });

            optionsDiv.appendChild(btn);
        });

        messageDiv.appendChild(optionsDiv);
        console.log('✅ All buttons appended to message');
    } else {
        console.log('❌ No buttons created');
        console.log('  Reason: options is', typeof options, options);
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    console.log('✅ Message added to chat');
}

// Initialize chatbot when tab loads
function initializeHealthAssistant() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.error('Chat messages container not found');
        return;
    }

    // Clear previous messages
    chatMessages.innerHTML = '';

    // Reset state
    chatbotState.awaitingMainMenu = true;
    chatbotState.awaitingSubMenu = false;
    chatbotState.currentSection = null;

    // Add welcome message with options
    addChatMessage("assistant", "আপনার কোন বিষয়ে সাহায্য দরকার? নিচের অপশন থেকে নির্বাচন করুন:", healthMainMenu);
}

// NEURO COMMUNITY GROUP

// Ensure formData is initialized.
if (typeof formData === "undefined") {
  var formData = {};
}
// Get neuroType and community consent from form
formData.neuroType = document.getElementById('neuroType')?.value || "";
formData.joinCommunity = document.getElementById('joinCommunity')?.checked || false;



// Get neuroType (disease) and community consent from form
const neuroType = document.getElementById('neuroType')?.value || "";
const joinCommunity = document.getElementById('joinCommunity')?.checked || false;
formData.neuroType = neuroType;
formData.joinCommunity = joinCommunity;

// Data for neuropedic community groups
const NEURO_COMMUNITY_GROUPS = {
  epilepsy: {
    name: "Epilepsy Warriors Group",
    members: 110,
    description: "Support for pet owners managing seizures and medication routines; share triggers and emergency tips.",
    color: "#673ab7"
  },
  neuralgia: {
    name: "Trigeminal Neuralgia Network",
    members: 78,
    description: "A space for dealing with nerve pain, management strategies and new treatments discussion.",
    color: "#e64a19"
  },
  migraine: {
    name: "Migraine & Chronic Headache Community",
    members: 130,
    description: "Discuss symptom relief, triggers, and clinic updates for companion animal migraine conditions.",
    color: "#ffd600"
  },
  neuropathy: {
    name: "Neuropathy Support Circle",
    members: 68,
    description: "Connect for advice on nerve injury, sensory loss, post-surgical or diabetic neuropathy recovery.",
    color: "#009688"
  },
  muscle_weakness: {
    name: "Muscle Weakness & Paralysis Positivity Group",
    members: 94,
    description: "Share mobility aids, home modifications, therapy strategies and positive rehabilitation stories.",
    color: "#00bcd4"
  },
  tremor: {
    name: "Movement & Tremor Awareness Forum",
    members: 49,
    description: "For those facing tremors, movement disorders, and sharing new therapies or comfort tools.",
    color: "#607d8b"
  },
  cognitive_decline: {
    name: "Cognitive Dysfunction Peer Support",
    members: 122,
    description: "Resources and hope for aging pets with memory loss, confusion or canine/feline dementia.",
    color: "#ff8a65"
  },
  spinal_injury: {
    name: "Spinal Injury Survivor Network",
    members: 74,
    description: "Support for parents managing spinal injury, wheelchair pets, and post-op therapies.",
    color: "#fbc02d"
  },
  ataxia: {
    name: "Ataxia Allies Association",
    members: 55,
    description: "A group for coping with loss of coordination, gait issues and hands-on exercise plans.",
    color: "#43a047"
  },
  hydrocephalus: {
    name: "Hydrocephalus & Fluid Balance Support",
    members: 33,
    description: "Connect for treatment insights, surgery stories, and home care for affected animals.",
    color: "#d84315"
  },
  encephalitis: {
    name: "Encephalitis & Brain Inflammation Community",
    members: 70,
    description: "Share news, therapies, and experiences in managing acute central nervous system disease.",
    color: "#64b5f6"
  },
  vestibular_disease: {
    name: "Vestibular Syndrome Guidance Group",
    members: 62,
    description: "Exchange info about sudden balance loss, assessments, and recovery routines.",
    color: "#7e57c2"
  },
  brain_tumor: {
    name: "Brain Tumor Awareness Network",
    members: 58,
    description: "Peer support for those facing pet brain tumors, prognosis questions and therapy options.",
    color: "#e53935"
  },
  meningitis: {
    name: "Meningitis Recovery Community",
    members: 65,
    description: "Safe space for acute and chronic meningitis management, medicine tips, and shared care.",
    color: "#512da8"
  },
  stroke: {
    name: "Stroke Recovery & Rehabilitation Network",
    members: 77,
    description: "Tips for post-stroke care, pet therapy results and experience sharing.",
    color: "#00e676"
  },
  anxiety: {
    name: "Pet Anxiety & Neurobehavioral Group",
    members: 137,
    description: "Owners connect for managing anxiety, fear, and behavioral therapies for neurological root causes.",
    color: "#0288d1"
  },
  nerve_injury: {
    name: "Nerve Injury Resource Community",
    members: 54,
    description: "Access latest research, physical rehab ideas, and surgical outcome stories for nerve injuries.",
    color: "#afb42b"
  },
  myasthenia_gravis: {
    name: "Myasthenia Gravis Pet Peer Group",
    members: 41,
    description: "Meet others, share medication routines and coping advice for neuromuscular challenges.",
    color: "#8d6e63"
  },
  seizures: {
    name: "Seizure Management Circle",
    members: 100,
    description: "Exchange seizure logs, medication experiences and emergency management tips.",
    color: "#c62828"
  },
  neuro_rehab: {
    name: "Neuro Rehab Motivators",
    members: 86,
    description: "Rehabilitation ideas, adaptive gear, and at-home neuro exercises for pets and their families.",
    color: "#388e3c"
  }
};

// Display community groups based on selected neuro condition
function showRecommendedGroups(userNeuroType) {
  const section = document.getElementById("patientGroupsSection");
  if (!section) return;

  section.innerHTML = `<h3 style="color: var(--color-primary); margin-bottom: 1rem;">Neuro Support Communities</h3>`;
  let groupList = "";

  Object.entries(NEURO_COMMUNITY_GROUPS).forEach(([key, group]) => {
    if (key === userNeuroType || userNeuroType === "") {
      groupList += `
        <div class="group-card" style="border-left: 4px solid ${group.color}; margin-bottom: 1rem; padding: 1rem;">
          <b>${group.name}</b><br>
          <span>Active Members: ${group.members}</span><br>
          <span>${group.description}</span><br>
          <button type="button" class="connect-btn" style="margin-top: 0.8rem;">Join Group</button>
        </div>
      `;
    }
  });

  section.innerHTML += `<div id="groupsList">${groupList}</div>`;
}

// Call after registration/success
if (formData.joinCommunity && formData.Type) {
  showRecommendedGroups(formData.neuroType);
} else if (formData.joinCommunity) {
  showRecommendedGroups(""); // Show all groups
}

// Use only once per page load—after DOM is ready and 'patientGroupsSection' exists
const patientGroupsSection = document.getElementById("patientGroupsSection");
if (patientGroupsSection) {
  patientGroupsSection.addEventListener("click", function(e) {
    if (e.target.classList.contains("connect-btn")) {
      alert("You have joined the group! Check your inbox/community page for next steps.");
      // TODO: Send join request to backend here if needed.
    }
  });
}

// Consent and privacy notification
if (formData.joinCommunity) {
  // Show consent message about profile visibility in the neuro community group
  // e.g. document.getElementById("consentNotice").style.display = "block";
}

// END NEURO COMMUNITY GROUP

// Initialize when DOM is ready
// Handle tab switching for all sections
document.addEventListener('DOMContentLoaded', function() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.section');

    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');

            // Remove active class from all tabs
            navTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // Show target section
            const target = document.getElementById(targetSection);
            if (target) {
                target.style.display = 'block';

                // Special handling for chatbot initialization
                if (targetSection === 'chatbot') {
                    setTimeout(() => {
                        if (typeof initializeHealthAssistant === 'function') {
                            initializeHealthAssistant();
                        }
                    }, 100);
                }

                // Special handling for prevention section
                if (targetSection === 'prevention') {
                    setTimeout(() => {
                        if (typeof loadPreventionData === 'function') {
                            loadPreventionData();
                        }
                    }, 100);
                }
            }
        });
    });

    // Initialize first tab as active if none are active
    if (!document.querySelector('.nav-tab.active')) {
        const firstTab = document.querySelector('.nav-tab');
        if (firstTab) {
            firstTab.click();
        }
    }
});
/*document.addEventListener('DOMContentLoaded', () => {
    // Find and attach to chatbot tab click
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const sectionId = tab.getAttribute('data-section');
            console.log('Tab clicked:', sectionId);

            if (sectionId === 'chatbot') {
                // Small delay to ensure DOM is updated
                setTimeout(() => {
                    initializeHealthAssistant();
                }, 100);
            }
        });
    });
});*/

// ========================================================================
// CHAT INPUT HANDLER - Connect text input to handleTextInput function
// ========================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Get chat input and send button
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');

    if (chatInput && chatSendBtn) {
        console.log('✅ Chat input elements found');

        // Handle Enter key press
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const userMessage = chatInput.value.trim();
                if (userMessage) {
                    handleTextInput(userMessage);
                    chatInput.value = ''; // Clear input
                }
            }
        });

        // Handle send button click
        chatSendBtn.addEventListener('click', function() {
            const userMessage = chatInput.value.trim();
            if (userMessage) {
                handleTextInput(userMessage);
                chatInput.value = ''; // Clear input
            }
        });

        console.log('✅ Chat input handlers connected');
    } else {
        console.error('❌ Chat input elements not found:', {
            chatInput: !!chatInput,
            chatSendBtn: !!chatSendBtn
        });
    }
});

// Modify handleChatbot to track typed messages
window.handleChatbot = () => {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    trackTypedMessage();
    addChatMessage("user", message);
    input.value = '';

    if (message === "প্রথম থেকে শুরু করুন" || message.toLowerCase().includes("restart")) {
        resetChatbot();
        return;
    }

    // Check all possible states in order
    if (chatbotState.awaitingMainMenu) {
        handleMainMenuSelection(message);
    } else if (chatbotState.awaitingSubMenu) {
        handleSubMenuSelection(message);
    } else if (chatbotState.awaitingQuestionAnswer) {
        handleQuestionAnswer(message);
    } else if (chatbotState.awaitingFreeformQuestion) {
        // ✅ Handle freeform followup questions
        handleFreeformFollowupQuestion(message);
    } else if (chatbotState.awaitingFollowup) {
        // ✅ Handle followup state
        addChatMessage("assistant", "দয়া করে বাটনে ক্লিক করুন অথবা প্রশ্ন টাইপ করুন।");
    } else {
        addChatMessage("assistant", "Sorry, I didn't understand. Please select from the options.");
    }
};

// ========================================================================

// ========================================================================
// RENDER DISEASES FUNCTION (MODIFIED)
// ========================================================================
// ... (renderDiseases function is retained as is)

function renderDiseases(diseasesToShow = diseases) {
    const grid = document.getElementById('diseasesGrid');
    const noResults = document.getElementById('noResults');

    if (diseasesToShow.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    noResults.style.display = 'none';

    grid.innerHTML = diseasesToShow.map(disease => `
        <div class="disease-card">
            <span class="disease-category">${disease.category}</span>
            <h3>${disease.name}</h3>

            <div class="disease-section">
                <h4>Symptoms</h4>
                <ul>
                    ${disease.symptoms.slice(0, 4).map(s => `<li>${s}</li>`).join('')}
                    ${disease.symptoms.length > 4 ? '<li><em>...and more</em></li>' : ''}
                </ul>
            </div>


            <div class="disease-section">
                <h4>Age Group</h4>
                <p>${disease.ageGroup}</p>
            </div>


            <div class="disease-section">
                <h4>Common Causes</h4>
                <ul>
                    ${disease.causes.slice(0, 3).map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>

            <div class="disease-section">
                <h4>Treatment Options</h4>
                <ul>
                    ${disease.treatment.slice(0, 3).map(t => `<li>${t}</li>`).join('')}
                    ${disease.treatment.length > 3 ? '<li><em>...and more</em></li>' : ''}
                </ul>
            </div>

            <div class="disease-section">
                <h4>Prevention</h4>
                <p>${disease.prevention}</p>
            </div>

            ${disease.citation ? `
                <div style="background: #e8f4f8; border-left: 3px solid #2196f3; padding: 0.75rem; margin-top: 1rem; border-radius: 4px; font-size: 0.85rem;">
                    <strong style="color: #2196f3;">📚 Research Sources:</strong><br>
                    ${disease.citation}
                </div>
            ` : ''}

            <button class="btn-learn-more" style="margin-top: 1.5rem;" onclick="showDiseaseDetails('${disease.name.replace(/'/g, "\\'")}')">View Full Details</button>
        </div>
    `).join('');
}

// ========================================================================
// RENDER FAQs FUNCTION (UNCHANGED)
// ========================================================================

function renderFAQs() {
    const container = document.getElementById('faqContainer');
    container.innerHTML = faqs.map((faq, index) => `
        <div class="faq-item" data-index="${index}">
            <div class="faq-question">
                <span>${faq.question}</span>
                <span class="faq-toggle">+</span>
            </div>
            <div class="faq-answer">
                ${faq.answer}
                ${faq.citation ? `
                    <div style="background: #e8f4f8; border-left: 3px solid #2196f3; padding: 0.75rem; margin-top: 1rem; border-radius: 4px; font-size: 0.85rem;">
                        <strong style="color: #2196f3;">📚 Research Source:</strong><br>
                        ${faq.citation}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}


// ========================================================================
// NEW RENDER FUNCTIONS FOR MISSING SECTIONS
// ========================================================================

// Reusable function for the FAQ-style sections
function renderSectionContent(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = data.map((item, index) => `
        <div class="faq-item" data-index="${index}">
            <div class="faq-question">
                <span>${item.question}</span>
                <span class="faq-toggle">+</span>
            </div>
            <div class="faq-answer">
                ${item.answer}
                ${item.citation ? `
                    <div style="background: #e8f4f8; border-left: 3px solid #2196f3; padding: 0.75rem; margin-top: 1rem; border-radius: 4px; font-size: 0.85rem;">
                        <strong style="color: #2196f3;">📚 Research Source:</strong><br>
                        ${item.citation}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function renderWhenToSee() {
    // The "When to See a Oncologist" section uses the same FAQ-like structure
    renderSectionContent(whenToSeeData, 'whenToSeeContainer');
}

function renderPrevention() {
    // The "Prevention & Care" section uses the same FAQ-like structure
    renderSectionContent(preventionData, 'preventionContainer');
}

function renderDoctors(doctorsToShow = []) {
    const container = document.getElementById('doctorsContainer');
    if (!container) return;

    if (doctorsToShow.length === 0) {
        container.innerHTML = `<div class="info-card" style="text-align: center; max-width: none;"><h3>No Doctors Found in This City</h3><p>Please try another city or check back later for updated listings.</p></div>`;
        return;
    }

    container.innerHTML = doctorsToShow.map(doctor => `
        <div class="doctor-card">
            <h3>${doctor.name}</h3>
            <div class="credentials">${doctor.specialization} - ${doctor.hospital}</div>
            <div class="experience">Experience: ${doctor.experience}</div>
            <p><strong>City:</strong> ${doctor.city}</p>
            <p><strong>Contact:</strong> ${doctor.phone}</p>
            <a href="${doctor.link}" target="_blank" class="btn-learn-more" style="width: auto; display: inline-block; margin-top: 0.5rem; background: var(--color-info);">Book Appointment (External)</a>
        </div>
    `).join('');
}

// ========================================================================
// SHOW DISEASE DETAILS MODAL FUNCTION (UNCHANGED)
// ========================================================================

window.showDiseaseDetails = (diseaseName) => {
    const disease = diseases.find(d => d.name === diseaseName);
    if (!disease) return;

    // Use the specific image URL from the disease object (which we added above).
    // The placeholder uses the disease name for clear identification in the UI.
    const imageUrl = disease.imageUrl || `https://via.placeholder.com/900x250/8b4f8b/fef9fc?text=${encodeURIComponent(disease.name.toUpperCase() + " IMAGE")}`;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="detail-header">
            <span class="disease-category">${disease.category}</span>
            <h2>${disease.name}</h2>
        </div>

        <p style="font-size: 1.1rem; color: var(--color-text); font-style: italic; margin-bottom: 1.5rem;">
            A detailed overview of ${disease.name}, a ${disease.category.toLowerCase()} that primarily affects cancer patients.
        </p>

        <img src="${imageUrl}" alt="${disease.name} Image" class="detail-image">

        <div class="disease-section">
            <h4>Symptoms</h4>
            <ul>
                ${disease.symptoms.map(s => `<li>${s}</li>`).join('')}
            </ul>
        </div>

         <div class="disease-section">
            <h4>Age Group</h4>
            <ul>
             <p>${disease.ageGroup}</p>
            </ul>
        </div>


        <div class="disease-section">
            <h4>Causes</h4>
            <ul>
                ${disease.causes.map(c => `<li>${c}</li>`).join('')}
            </ul>
        </div>

        <div class="disease-section">
            <h4>Treatment Options</h4>
            <ul>
                ${disease.treatment.map(t => `<li>${t}</li>`).join('')}
            </ul>
        </div>

        <div class="disease-section">
            <h4>Prevention & Care</h4>
            <p>${disease.prevention}</p>
        </div>

        ${disease.citation ? `
            <div style="background: #e8f4f8; border-left: 3px solid #2196f3; padding: 0.75rem; margin-top: 2rem; border-radius: 4px; font-size: 0.9rem;">
                <strong style="color: #2196f3;">📚 Research Sources:</strong><br>
                ${disease.citation}
            </div>
        ` : ''}
    `;

    document.getElementById('diseaseDetailModal').classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevents background scrolling when modal is open
};

// ========================================================================
// SEARCH FUNCTIONALITY (RETAINED)
// ========================================================================

document.getElementById('searchBox').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (!searchTerm) {
        renderDiseases();
        return;
    }

    const filtered = diseases.filter(disease => {
        return disease.name.toLowerCase().includes(searchTerm) ||
               disease.category.toLowerCase().includes(searchTerm) ||
               disease.symptoms.some(s => s.toLowerCase().includes(searchTerm)) ||
               disease.causes.some(c => c.toLowerCase().includes(searchTerm)) ||
               disease.treatment.some(t => t.toLowerCase().includes(searchTerm));
    });

    renderDiseases(filtered);
});

// ========================================================================
// DOCTOR FILTERING LOGIC (UPDATED)
// ========================================================================

// ========================================================================\
// DOCTORS SECTION
// ========================================================================\

function filterDoctorsByCity() {
    const citySelect = document.getElementById('citySelect');
    const selectedCity = citySelect.value;
    const doctorsContainer = document.getElementById('doctorsContainer');

    doctorsContainer.innerHTML = '';

    if (!selectedCity) {
        doctorsContainer.innerHTML = `
            <div class="no-results">
                <h3>Please select a city to find Gynecologists</h3>
                <p>We provide listings for major Indian cities like Delhi, Mumbai, and Bangalore.</p>
            </div>
        `;
        return;
    }

    const doctors = doctorsData[selectedCity] || [];

    if (doctors.length === 0) {
        doctorsContainer.innerHTML = `
            <div class="no-results">
                <h3>No Doctors found in ${selectedCity}</h3>
                <p>We are working to expand our list of verified healthcare providers.</p>
            </div>
        `;
        return;
    }

    doctorsContainer.innerHTML = doctors.map(doctor => `
        <div class="doctor-card">
            <div style="display: flex; gap: 1.5rem; align-items: flex-start;">
                <div style="flex-shrink: 0;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background-color: var(--color-accent); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--color-primary);">👩‍⚕️</div>
                </div>
                <div style="flex-grow: 1;">
                    <h3>${doctor.name}</h3>
                    <p class="credentials">${doctor.credentials}</p>
                    <p class="experience" style="color: var(--color-secondary);">${doctor.experience}</p>
                    <p style="margin-bottom: 0.5rem; color: var(--color-text);"><strong>Hospital:</strong> ${doctor.hospital}</p>
                    <p style="margin-bottom: 0.5rem; font-size: 0.95rem; color: var(--color-text-secondary);">📍 ${doctor.address}</p>
                    <p style="margin-bottom: 0.5rem; font-size: 0.95rem; color: var(--color-text-secondary);">📞 ${doctor.phone}</p>
                    <p style="margin-bottom: 0.5rem; font-size: 0.95rem; color: var(--color-text-secondary);">⭐ ${doctor.rating}</p>
                </div>
            </div>

            <div style="margin-top: 1rem; border-top: 1px dashed var(--color-border); padding-top: 1rem;">
                <p style="font-size: 0.9rem; color: var(--color-primary-dark); margin-bottom: 0.75rem;"><strong>Specializations:</strong> ${doctor.specializations}</p>
                <a href="${doctor.bookingLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: var(--color-primary); color: white; padding: 0.75rem 2rem; border-radius: var(--radius-sm); text-decoration: none; font-weight: 600; transition: all 0.3s ease; box-shadow: var(--shadow-sm);" onmouseover="this.style.background='var(--color-primary-dark)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)';" onmouseout="this.style.background='var(--color-primary)'; this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)';"> 📅 Book Appointment Online </a>
            </div>
        </div>
    `).join('');
}

// ========================================================================
// TAB NAVIGATION (RETAINED)
// ========================================================================

/*document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update active section
        const sectionId = tab.getAttribute('data-section');
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});*/


// ========================================================================
// REGISTRATION & SUBSCRIBE BUTTON
// ========================================================================
function handleRegistration(event) {
    event.preventDefault();

    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('emailAddress').value,
        city: document.getElementById('cityOfResidence').value,
        phone: document.getElementById('phoneNumber')?.value || '',
        preferences: {
            monthly: document.querySelector('input[name="subscribeMonthly"]').checked,
            screening: document.querySelector('input[name="subscribeScreening"]').checked,
            updates: document.querySelector('input[name="subscribeUpdates"]').checked
        },
        timestamp: new Date().toISOString()
    };

    console.log('Registration Data:', formData);

    // Here you would typically send data to your backend
    // For now, show success message

    // Hide form, show success message
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('registrationSuccess').style.display = 'block';

    // Optional: Reset and show form again after 5 seconds
    setTimeout(() => {
        document.getElementById('registrationForm').reset();
        document.getElementById('registrationForm').style.display = 'block';
        document.getElementById('registrationSuccess').style.display = 'none';
    }, 5000);
}

// ========================================================================
// FAQ TOGGLE (RETAINED)
// ========================================================================

document.addEventListener('click', (e) => {
    if (e.target.closest('.faq-item')) {
        const faqItem = e.target.closest('.faq-item');
        faqItem.classList.toggle('active');
    }
});

// ========================================================================
// MODAL CLOSE LISTENERS (RETAINED)
// ========================================================================

// Event listener for closing the modal using the 'x' button
document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('diseaseDetailModal').classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore background scrolling
});

// Close modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
    const modal = document.getElementById('diseaseDetailModal');
    if (event.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore background scrolling
    }
});
// ========================================================================
// MAIN SEARCH HANDLER (FIXED)
// ========================================================================

// ========================================================================
// CORE UTILITY FUNCTIONS
// ========================================================================

// Helper function to get the currently active section ID
function getActiveSection() {
    // This finds the button with the 'active' class in the navigation
    const activeTab = document.querySelector('.nav-tab.active');
    // It returns the data-section attribute, or 'diseases' as a fallback
    return activeTab ? activeTab.getAttribute('data-section') : 'diseases';
}

// Function to handle doctor filtering by city AND search query
function filterDoctorsByCity(searchQuery = '') {
    const city = document.getElementById('citySelect').value;
    let doctorsInCity = doctorsData[city] || [];
    const query = searchQuery.toLowerCase();

    if (query) {
         doctorsInCity = doctorsInCity.filter(doctor =>
            doctor.name.toLowerCase().includes(query) ||
            doctor.specializations.toLowerCase().includes(query) ||
            doctor.hospital.toLowerCase().includes(query) ||
            doctor.credentials.toLowerCase().includes(query)
        );
    }

    renderDoctors(doctorsInCity);
}


// ========================================================================
// MAIN SEARCH HANDLER (FIXED)
// This function is now responsible for ALL tab searches.
// ========================================================================

// Expose the function globally so the event listener can use it
window.handleSearch = () => {
    const query = document.getElementById('searchBox').value.trim().toLowerCase();
    const activeSection = getActiveSection();

    // Manage visibility of any general no-results banner if necessary
    const noResultsElement = document.getElementById('noResults');
    if (noResultsElement) {
        noResultsElement.style.display = 'none';
    }

    switch (activeSection) {
        case 'diseases':
            // HEALTH CONDITIONS
            const filteredDiseases = diseases.filter(disease =>
                disease.name.toLowerCase().includes(query) ||
                disease.category.toLowerCase().includes(query) ||
                disease.symptoms.some(s => s.toLowerCase().includes(query)) ||
                disease.treatment.some(t => t.toLowerCase().includes(query))
            );
            renderDiseases(filteredDiseases);
            break;

        case 'when-to-see':
            // WHEN TO SEE A GYNECOLOGIST
            const filteredWhenToSee = whenToSee.filter(item =>
                item.question.toLowerCase().includes(query) ||
                item.answer.toLowerCase().includes(query)
            );
            renderWhenToSee(filteredWhenToSee);
            break;

        case 'doctors':
            // FIND GYNECOLOGISTS (Delegates to the city filter)
            filterDoctorsByCity(query);
            break;

        case 'prevention':
            // PREVENTION & CARE
            const filteredPrevention = preventionTips.filter(item =>
                item.question.toLowerCase().includes(query) ||
                item.answer.toLowerCase().includes(query)
            );
            renderPrevention(filteredPrevention);
            break;

        case 'faq':
            // FAQ
            const filteredFAQs = faqs.filter(item =>
                item.question.toLowerCase().includes(query) ||
                item.answer.toLowerCase().includes(query)
            );
            renderFAQs(filteredFAQs);
            break;

        case 'chatbot':
        case 'registration':
            // Health Assistant and Registration tabs do not have search functionality
            break;
    }
}

// ========================================================================
// EVENT LISTENERS (FIXED: Attaching the unified search handler)
// ========================================================================

// *** THIS LINE REPLACES the old, hardcoded search block ***
document.getElementById('searchBox').addEventListener('input', window.handleSearch);

// ========================================================================
// INITIALIZE APPLICATION (UPDATED)
// ========================================================================

renderDiseases();
renderFAQs();
renderWhenToSee();   // NEW: Initializes "When to See a Gynecologist" content
renderPrevention();  // NEW: Initializes "Prevention & Care" content
//renderDoctors();     // NEW: Initializes "Find Gynecologists" content
const allDoctors = Object.values(doctorsData).flat();
renderDoctors(allDoctors);

// Placeholder functions to prevent errors for other sections


// On main menu option select
function handleMainMenuSelection(userInput) {

  const cleanInput = userInput.trim();
  const stateKey = nextStateMap[cleanInput];
  chatbotState.awaitingMainMenu = false;  // ✅ Changed from appState
  console.log("In handleMainMenuSelection", stateKey)
  if (stateKey && healthPromptMap[stateKey]) {
    const { botPrompt, options } = healthPromptMap[stateKey];
    //console.log("stateKey", botPrompt, options)
    addChatMessage("assistant", botPrompt, options);
    chatbotState.awaitingSubMenu = true;  // ✅ Changed from appState.awaitingSubMenuSelection
    chatbotState.currentSection = stateKey;  // ✅ Changed from appState
  } else {
    addChatMessage("assistant", "ভুল নির্বাচন। দয়া করে তালিকা থেকে সঠিক বিষয়টি বাছাই করুন:", healthMainMenu);
    chatbotState.awaitingMainMenu = true;  // ✅ Changed from appState
  }
}


window.handleRegistration = (event) => {
    event.preventDefault();
    console.log("Registration submitted!");
    alert("Thank you for registering! We'll send you monthly health tips.");
};