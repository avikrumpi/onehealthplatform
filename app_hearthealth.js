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
    "botPrompt": "নমস্কার! আমি নারীশক্তি, আপনার স্বাস্থ্য সংক্রান্ত প্রশ্নে সাহায্য করতে এসেছি। আপনি কোন ধরনের ক্যান্সার নিয়ে কথা বলতে চান?",
    "options": [
        "১. হৃদরোগ / করোনারি আর্টারি ডিজিজ",
        "২. উচ্চ রক্তচাপ / হাইপারটেনশন",
        "৩. স্ট্রোক / ব্রেন অ্যাটাক",
        "৪. হার্ট অ্যাটাক / মায়োকার্ডিয়াল ইনফার্কশন",
        "৫. হৃদপিণ্ডের ফেইলিয়র / কনজেস্টিভ হার্ট ফেইলিয়র",
        "৬. আর্থ্রোস্ক্লেরোসিস / ধমনী শক্ত হয়ে যাওয়া",
        "৭. রিদমের সমস্যা / অ্যারিথমিয়া",
        "৮. হার্ট কেয়ার / হার্ট ভালভ ডিজিজ",
        "৯. পারিফেরাল আর্টারি ডিজিজ",
        "১০. জন্মগত হৃদরোগ / কনজেনিটাল হার্ট ডিজিজ"
    ],
    "nextStateMap": {
        "১. হৃদরোগ / করোনারি আর্টারি ডিজিজ": "coronary_artery_disease",
        "২. উচ্চ রক্তচাপ / হাইপারটেনশন": "hypertension",
        "৩. স্ট্রোক / ব্রেন অ্যাটাক": "stroke",
        "৪. হার্ট অ্যাটাক / মায়োকার্ডিয়াল ইনফার্কশন": "heart_attack",
        "৫. হৃদপিণ্ডের ফেইলিয়র / কনজেস্টিভ হার্ট ফেইলিয়র": "heart_failure",
        "৬. আর্থ্রোস্ক্লেরোসিস / ধমনী শক্ত হয়ে যাওয়া": "atherosclerosis",
        "৭. রিদমের সমস্যা / অ্যারিথমিয়া": "arrhythmia",
        "৮. হার্ট কেয়ার / হার্ট ভালভ ডিজিজ": "valvular_heart_disease",
        "৯. পারিফেরাল আর্টারি ডিজিজ": "peripheral_artery_disease",
        "১০. জন্মগত হৃদরোগ / কনজেনিটাল হার্ট ডিজিজ": "congenital_heart_disease"
    }
},
"coronary_artery_disease": {
    "botPrompt": "করোনারি আর্টারি ডিজিজ সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
    "options": [
      "বুকে ব্যথা",
      "শ্বাসকষ্ট",
      "পরিশ্রমে বুক ধড়ফড়",
      "বুকের চাপ বা ভার",
      "হাত বা চোয়ালে ব্যথা"
    ]
},
"hypertension": {
    "botPrompt": "উচ্চ রক্তচাপ/হাইপারটেনশন সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
    "options": [
      "মাথাব্যথা",
      "চোখে ঝাপসা দেখা",
      "বুকে ব্যথা বা চাপ",
      "ক্লান্তি",
      "নাক দিয়ে রক্ত পড়া"
    ]
},
"stroke": {
    "botPrompt": "স্ট্রোক/ব্রেন অ্যাটাক সংক্রান্ত কোন লক্ষণ নিয়ে জানতে চান?",
    "options": [
      "হাত/পা অবশ",
      "মুখ বেঁকে যাওয়া",
      "কথা বলতে সমস্যা",
      "হঠাৎ দুর্বলতা",
      "দৃষ্টি ঝাপসা"
    ]
},
"heart_attack": {
    "botPrompt": "হার্ট অ্যাটাক সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "হঠাৎ তীব্র বুক ব্যথা",
      "বুকের চাপ বা ভার",
      "শ্বাসকষ্ট",
      "ঘাম হওয়া",
      "বমি ভাব বা বমি"
    ]
},
"heart_failure": {
    "botPrompt": "হৃদপিণ্ডের ফেইলিয়র/কনজেস্টিভ হার্ট ফেইলিয়র সংক্রান্ত কোন লক্ষণ জানতে চান?",
    "options": [
      "শ্বাসকষ্ট",
      "পা ফুলে যাওয়া",
      "বুকে ভার",
      "রাতে শুয়ে শ্বাস নিতে কষ্ট",
      "অনিয়ন্ত্রিত ক্লান্তি"
    ]
},
"atherosclerosis": {
    "botPrompt": "আর্থ্রোস্ক্লেরোসিস/ধমনী শক্ত হয়ে যাওয়া বিষয়ে জানতে চান?",
    "options": [
      "পায়ে ব্যথা হাঁটার সময়",
      "ঠান্ডা পা/হাত",
      "রং-পরিবর্তিত ত্বকে",
      "ক্ষত সহজে সারছে না",
      "বুক ব্যথা"
    ]
},
"arrhythmia": {
    "botPrompt": "রিদমের সমস্যা/অ্যারিথমিয়া সংক্রান্ত লক্ষণ জানতে চান?",
    "options": [
      "হৃদকম্পন",
      "বুক ধড়ফড়",
      "মাথা ঘোরা",
      "অনিয়মিত হৃদ স্পন্দন",
      "অসুস্থ/দুর্বল অনুভব"
    ]
},
"valvular_heart_disease": {
    "botPrompt": "হার্ট ভালভ ডিজিজ সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
    "options": [
      "বুকের চাপ",
      "শ্বাসকষ্ট",
      "পা ফুলে যাওয়া",
      "বুক ধড়ফড়",
      "হঠাৎ দুর্বলতা"
    ]
},
"peripheral_artery_disease": {
    "botPrompt": "পারিফেরাল আর্টারি ডিজিজ সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
    "options": [
      "হাঁটলে পায়ে ব্যথা",
      "পা ঠান্ডা",
      "রং পরিবর্তিত ত্বক",
      "পায়ে ক্ষত",
      "পা অবশ"
    ]
},
"congenital_heart_disease": {
    "botPrompt": "জন্মগত হৃদরোগ/কনজেনিটাল হার্ট ডিজিজ নিয়ে জানতে চান?",
    "options": [
      "শ্বাসকষ্ট শিশুর",
      "বারবার নিউমোনিয়া",
      "হৃদকম্পন",
      "শিশুর বৃদ্ধি কম",
      "ত্বকে নীল ভাব"
    ]
  }
};

// Question sequences matching Python exactly
const QUESTION_SEQUENCES = {
    coronary_artery_disease: [
    "আপনার বয়স কত?",
    "কতদিন ধরে বুকে ব্যথা হচ্ছে?",
    "ব্যথা বিশ্রামে কমে যায় নাকি বাড়ে?",
    "শ্বাসকষ্ট কখন বেশি হয়?",
    "পরিশ্রম করলে বুক ধরফড় বা চাপ লাগে কি?",
    "বুকের ব্যথা হাতে, চোয়ালে ছড়ায় কি?",
    "ব্যথার সময় ঘাম হয় কি?",
    "ডায়াবেটিস, উচ্চ রক্তচাপ আছে কি?",
    "পরিবারে কেউ হৃদরোগে আক্রান্ত?",
    "নিয়মিত কোন ওষুধ নেন?",
    "ধূমপান করেন/করতেন কি?",
    "আগে ECG বা ইকোকার্ডিওগ্রাম হয়েছে কি?",
    "ক্লান্তি বা দুর্বলতা বেশি?",
    "কোলেস্টেরল পরীক্ষা হয়েছে?",
    "বুক ধরফড় বা হৃদকম্পন কখনও হয়েছে?"
  ],

  hypertension: [
    "আপনার বয়স কত?",
    "রক্তচাপ কতদিন ধরে বেশি?",
    "রক্তচাপ নিয়মিত পরিমাপ করেন?",
    "মাথাব্যথা কখন বেশি হয়?",
    "চোখে ঝাপসা দেখে?",
    "বুকে চাপ বা ব্যথা হয়েছে?",
    "ডায়াবেটিস বা কিডনি সমস্যা আছে?",
    "পরিবারে কারো উচ্চ রক্তচাপ?",
    "অনিয়মিত হৃদস্পন্দন হয়?",
    "নিয়মিত কোন ওষুধ নিচ্ছেন?",
    "লবণ খাওয়ার অভ্যাস কেমন?",
    "শরীর ফুলেছে কি?",
    "ঘাম বেশি হয় কি?",
    "ঘুম কম হয় বা বিক্ষিপ্ত?",
    "বাকি শরীরে ভিন্ন কোনো সমস্যা?"
  ],

  stroke: [
    "আপনার বয়স কত?",
    "হাত-পা বা মুখ হঠাৎ অবশ হয়েছিল?",
    "কথা বলতে সমস্যা হয়েছে?",
    "চোখে বা দৃষ্টিতে পরিবর্তন?",
    "বারবার মাথা ঘোরা/বমি?",
    "প্রচণ্ড মাথাব্যথা হয়েছিল?",
    "শরীরের একপাশ দুর্বল হয়েছে?",
    "ব্লাড প্রেসার বা সুগার বাড়ে?",
    "আগে স্ট্রোকের ইতিহাস আছে?",
    "পরিবারে কারো স্ট্রোক হয়েছে?",
    "ধূমপান/মদ্যপান করেন?",
    "কোন চিকিৎসা নিয়েছেন?",
    "শ্বাসকষ্ট দেখা দেয়?",
    "স্মৃতিভ্রংশ হচ্ছে কি?",
    "হাত-পায়ে ঝিঁ-ঝিঁ ভাব?"
  ],

  heart_attack: [
    "আপনার বয়স কত?",
    "বুকের ব্যথা কখন শুরু হয়েছে?",
    "ব্যথা কতক্ষণ ধরে থাকে?",
    "বিশ্রামে কমে নাকি বাড়ে?",
    "শ্বাস নিতে সমস্যা হয়?",
    "ব্যথা ঘাড়, পিঠ, হাত বা চোয়ালে ছড়ায়?",
    "ব্যথার সময় বমি বা বমি ভাব?",
    "ঘাম হয় বা দুর্বল লাগে?",
    "ডায়াবেটিস, উচ্চ রক্তচাপ আছে?",
    "পরিবারে কেউ হার্ট অ্যাটাকের শিকার?",
    "ECG, ট্রোপ-টেস্ট হয়েছে?",
    "আপনি দ্রুত চিকিৎসা নিয়েছেন?",
    "বুক ধড়ফড় হয়েছে?",
    "হার্টের রিং/অ্যাঞ্জিওপ্লাস্টি হয়েছে কি?",
    "জরুরি চিকিৎসা নেওয়ার সময় কতটা হয়েছে?"
  ],

  heart_failure: [
    "আপনার বয়স কত?",
    "কতদিন ধরে শ্বাসকষ্ট?",
    "রাতে শোয়ার সময় শ্বাস নিতে সমস্যা?",
    "পা বা মুখ ফুলে যাচ্ছে?",
    "পরিশ্রমে ক্লান্তি বেশি?",
    "বুকে ভার/চাপ অনুভব?",
    "বুকে কাশি বা কফ?",
    "সম্প্রতি ওজন বাড়তে দেখা গেছে?",
    "পানিশূন্যতা দেখে?",
    "নিয়মিত কোন ওষুধ নেন?",
    "হৃদরোগের ইতিহাস আছে?",
    "ইকো-কার্ডিওগ্রাম হয়েছে?",
    "নুন-জল খাওয়া নিয়ন্ত্রণে রাখেন?",
    "বুক ধরফড় বা অ্যারিথমিয়া হয়েছে?",
    "পেশি দুর্বলতা/কম্পন?"
  ],

  atherosclerosis: [
    "আপনার বয়স কত?",
    "হাঁটলে পা ব্যথা হয়?",
    "পায়ে ঠান্ডা অনুভব করেন?",
    "পায়ে নীল/সাদা রং বা রং পরিবর্তন?",
    "ক্ষত/আঘাত সহজে শুকায় না?",
    "পায়ের তালু/গোড়ালিতে ব্যথা?",
    "অনিয়মিত হৃদস্পন্দন আছে?",
    "ডায়াবেটিস, উচ্চ কোলেস্টেরল?",
    "ধূমপান করেন?",
    "পরিবারে কারো ধমনী রোগ?",
    "পায়ে আশ্চর্য ফোলা বা ভারী মনে?",
    "ডাক্তারের সাথে যোগাযোগ করেছেন?",
    "পায়ে অবশ/ঝিঁঝিঁ?",
    "ওষুধ বা থেরাপি নিচ্ছেন?",
    "বেশি ঠান্ডা থাকলে সমস্যা বাড়ে?"
  ],

  arrhythmia: [
    "আপনার বয়স কত?",
    "হৃদকম্পন/বুক ধড়ফড় কখন বেশি?",
    "হঠাৎ হৃদস্পন্দন বেড়ে যায়?",
    "মাথা ঘোরে, দুর্বল লাগে?",
    "অসুস্থ অনুভব করেন?",
    "কোনো অজ্ঞান হয়ে পড়ার ঘটনা?",
    "বুকের ব্যথা বা চাপ অনুভব?",
    "ডায়াবেটিস, উচ্চ রক্তচাপ আছে?",
    "নিয়মিত কোন ওষুধ নিচ্ছেন?",
    "পরিবারে কারো অ্যারিথমিয়া?",
    "ECG বা হল্টার মনিটরিং হয়েছে?",
    "অ্যালকোহল/ক্যাফেইন খান?",
    "ক্লান্তি বা নিদ্রাহীনতা?",
    "হঠাৎ লাফানি অনুভূত হয়েছে?",
    "শ্বাসকষ্ট হয়েছে?"
  ],

  valvular_heart_disease: [
    "আপনার বয়স কত?",
    "কতদিন ধরে বুকের চাপ অনুভব করেন?",
    "পায়ে ফোলা বা পাতলা?",
    "শ্বাস নিতে সমস্যা হয়?",
    "ক্লান্ত বা দুর্বল লাগে কিনা?",
    "বুক ধরফড়/অনিয়মিত স্পন্দন?",
    "রুটিন একো-কার্ডিওগ্রাম হয়েছে?",
    "কোনো পক্ষাঘাত/স্ট্রোকের ইতিহাস?",
    "জ্বর, গলা ব্যথা বা সংক্রমণ?",
    "শিশুকালে হার্ট রোগ ছিল?",
    "নিয়মিত কোন ওষুধ নিচ্ছেন?",
    "ডাক্তারের সাথে ফলাফল শেয়ার করেন?",
    "বুকের আওয়াজ/মার্মার শুনেছেন?",
    "থেরাপি করেছেন?",
    "নতুন বা পুরাতন সমস্যা?"
  ],

  peripheral_artery_disease: [
    "আপনার বয়স কত?",
    "হাঁটলে বা পরিশ্রমে পায়ে ব্যথা?",
    "পা ঠান্ডা অনুভব করেন?",
    "পায়ে ক্ষত/রং পরিবর্তন করেছে?",
    "পা অবশ/দুর্বল?",
    "চিকিৎসা নেয়া হয়েছে?",
    "হাই সুগার বা ডায়াবেটিস আছে?",
    "ধূমপান/মদ্যপান করেন?",
    "পরিবারে কারো পায়ের সমস্যা?",
    "নিয়মিত চেকআপ করেন?",
    "পায়ে ফুলে গেছে?",
    "ডাক্তারের সাথে যোগাযোগ করছেন?",
    "তলপায়ে ঘাম কমেছে?",
    "ওষুধ নিচ্ছেন?",
    "পরিচর্যা করলে পানি কমে?"
  ],

  congenital_heart_disease: [
    "শিশুর বয়স কত?",
    "শ্বাস নিতে সমস্যা?",
    "শিশুর বৃদ্ধি কম?",
    "ত্বকে নীল বা ফ্যাকাশে দেখতে?",
    "বারবার নিউমোনিয়া/ফুসফুস সমস্যা?",
    "শিশুকে বুক ধরফড়/হৃদকম্পন?",
    "শিশুর খাওয়া/কষ্ট হয়?",
    "বংশগত হার্ট রোগের ইতিহাস?",
    "শিশুর একো/ECG হয়েছে?",
    "জন্মের সময় কোনো জটিলতা ছিল?",
    "বুকের আওয়াজ/মার্মার?",
    "ডাক্তারের সাথে চিকিৎসা নিয়েছেন?",
    "ওষুধ বা থেরাপি নিচ্ছেন?",
    "শিশুর অতিরিক্ত ক্লান্তি?",
    "নতুন/পুরাতন লক্ষণ পরিবর্তন?"
  ]
};

const diseases = [
{
    name: 'Hypertension (High Blood Pressure)',
    category: 'Cardiovascular Condition',
    ageGroup: 'Adults (can occur at any age, more common >40 years)',
    symptoms: [
        'Often asymptomatic (silent condition)',
        'Headaches',
        'Shortness of breath',
        'Nosebleeds',
        'Fatigue'
    ],
    causes: [
        'Genetic predisposition',
        'Obesity',
        'High sodium diet',
        'Stress',
        'Sedentary lifestyle',
        'Smoking and alcohol abuse'
    ],
    treatment: [
        'Lifestyle modifications (diet, exercise)',
        'Antihypertensive medications (ACE inhibitors, beta-blockers)',
        'Weight management',
        'Stress reduction'
    ],
    prevention: 'Regular exercise, low-sodium diet, maintain healthy weight, stress management.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Hypertension. 2025.</a>'
},
{
    name: 'Coronary Artery Disease (CAD)',
    category: 'Cardiovascular Condition',
    ageGroup: 'Adults (most common >45 years for men, >55 years for women)',
    symptoms: [
        'Chest pain or angina',
        'Shortness of breath',
        'Weakness or fatigue',
        'Nausea',
        'Pain in arms, neck, jaw'
    ],
    causes: [
        'Atherosclerosis (plaque buildup)',
        'High cholesterol',
        'Smoking',
        'Hypertension',
        'Diabetes',
        'Obesity'
    ],
    treatment: [
        'Medications (aspirin, statins, antiplatelet drugs)',
        'Angioplasty and stent placement',
        'Coronary artery bypass grafting (CABG)',
        'Lifestyle modifications'
    ],
    prevention: 'Regular exercise, heart-healthy diet, quit smoking, manage stress, cholesterol control.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Coronary Artery Disease. 2025.</a>'
},
{
    name: 'Acute Myocardial Infarction (Heart Attack)',
    category: 'Cardiovascular Emergency',
    ageGroup: 'Adults (most common >40 years, but can occur at younger ages)',
    symptoms: [
        'Severe chest pain or pressure',
        'Shortness of breath',
        'Sweating',
        'Nausea and vomiting',
        'Arm, jaw, or back pain'
    ],
    causes: [
        'Coronary artery thrombosis',
        'Atherosclerotic plaque rupture',
        'Coronary vasospasm',
        'Previous CAD'
    ],
    treatment: [
        'Immediate hospitalization and reperfusion therapy',
        'Percutaneous coronary intervention (PCI)',
        'Thrombolytic therapy',
        'Cardiac medications (anticoagulants, antiplatelet agents)',
        'Coronary artery bypass (if needed)'
    ],
    prevention: 'Risk factor control (hypertension, cholesterol, diabetes), smoking cessation, stress management.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Heart Attack. 2025.</a>'
},
{
    name: 'Cardiac Arrhythmias (Irregular Heartbeat)',
    category: 'Cardiovascular Condition',
    ageGroup: 'All ages (more common with age, >65 years)',
    symptoms: [
        'Heart palpitations',
        'Dizziness',
        'Shortness of breath',
        'Chest discomfort',
        'Fainting episodes'
    ],
    causes: [
        'Coronary artery disease',
        'Heart valve disease',
        'Hyperthyroidism',
        'Electrolyte imbalances',
        'Excessive caffeine/alcohol'
    ],
    treatment: [
        'Antiarrhythmic medications',
        'Pacemaker implantation',
        'Implantable cardioverter-defibrillator (ICD)',
        'Ablation therapy',
        'Cardioversion'
    ],
    prevention: 'Maintain normal heart rate, manage underlying conditions, avoid excessive stimulants.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Cardiac Arrhythmias. 2025.</a>'
},
{
    name: 'Atrial Fibrillation (AFib)',
    category: 'Cardiovascular Condition (Arrhythmia)',
    ageGroup: 'Adults (most common >65 years, increases with age)',
    symptoms: [
        'Rapid, irregular heartbeat',
        'Heart palpitations',
        'Shortness of breath',
        'Weakness',
        'Chest discomfort',
        'Dizziness'
    ],
    causes: [
        'Hypertension',
        'Coronary artery disease',
        'Heart failure',
        'Hyperthyroidism',
        'Obesity',
        'Sleep apnea'
    ],
    treatment: [
        'Anticoagulation therapy (warfarin, DOACs)',
        'Rate control medications (beta-blockers, calcium channel blockers)',
        'Rhythm control drugs (antiarrhythmics)',
        'Cardioversion',
        'Ablation procedures',
        'Left atrial appendage (LAA) closure'
    ],
    prevention: 'Manage hypertension, maintain healthy weight, limit alcohol, treat sleep apnea.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Atrial Fibrillation. 2025.</a>'
},
{
    name: 'Heart Failure',
    category: 'Cardiovascular Condition',
    ageGroup: 'Adults (more common >65 years, but can occur at younger ages)',
    symptoms: [
        'Shortness of breath (dyspnea)',
        'Fatigue and weakness',
        'Swelling in legs and ankles',
        'Rapid or irregular heartbeat',
        'Persistent cough',
        'Difficulty sleeping'
    ],
    causes: [
        'Coronary artery disease',
        'Hypertension',
        'Previous heart attacks',
        'Cardiomyopathy',
        'Diabetes',
        'Alcohol abuse'
    ],
    treatment: [
        'ACE inhibitors/ARBs',
        'Beta-blockers',
        'Diuretics',
        'Digoxin',
        'Aldosterone antagonists',
        'Device therapy (pacemakers, defibrillators)',
        'Heart transplant (advanced cases)'
    ],
    prevention: 'Control blood pressure and cholesterol, regular exercise, heart-healthy diet, quit smoking.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Heart Failure. 2025.</a>'
},
{
    name: 'Cardiomyopathy',
    category: 'Cardiovascular Condition',
    ageGroup: 'All ages (more common 20–60 years; pediatric forms exist)',
    symptoms: [
        'Shortness of breath',
        'Fatigue',
        'Swelling in legs/ankles',
        'Chest discomfort',
        'Arrhythmias',
        'Fainting'
    ],
    causes: [
        'Genetic mutations (dilated, hypertrophic)',
        'Viral infections',
        'Alcohol abuse',
        'Autoimmune disorders',
        'Hypertension',
        'Diabetes'
    ],
    treatment: [
        'Medications (ACE inhibitors, beta-blockers, diuretics)',
        'Pacemakers/ICD implantation',
        'Device support (ventricular assist devices)',
        'Heart transplant',
        'Ablation (for some types)'
    ],
    prevention: 'Genetic screening for at-risk families, manage risk factors, limit alcohol.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Cardiomyopathy. 2025.</a>'
},
{
    name: 'Stroke (Cerebrovascular Accident)',
    category: 'Cardiovascular Emergency',
    ageGroup: 'Adults (most common >65 years, but can occur at any age)',
    symptoms: [
        'Facial drooping',
        'Arm weakness',
        'Speech difficulty',
        'Sudden numbness',
        'Loss of vision',
        'Severe headache',
        'Dizziness'
    ],
    causes: [
        'Atherosclerosis (ischemic stroke—80%)',
        'Cerebral hemorrhage',
        'Thromboembolism',
        'Atrial fibrillation',
        'Hypertension',
        'Diabetes'
    ],
    treatment: [
        'Thrombolytic therapy (tPA)',
        'Mechanical thrombectomy',
        'Antiplatelet agents (aspirin)',
        'Anticoagulation',
        'Blood pressure management',
        'Rehabilitation therapy'
    ],
    prevention: 'Manage hypertension, control diabetes, healthy diet, regular exercise, quit smoking.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Stroke. 2025.</a>'
},
{
    name: 'Peripheral Arterial Disease (PAD)',
    category: 'Cardiovascular Condition',
    ageGroup: 'Adults (most common >50 years)',
    symptoms: [
        'Leg pain during walking (claudication)',
        'Numbness or weakness in legs',
        'Slow wound healing in legs/feet',
        'Pale or bluish legs',
        'Non-healing sores'
    ],
    causes: [
        'Atherosclerosis',
        'Smoking',
        'Hypertension',
        'High cholesterol',
        'Diabetes',
        'Obesity'
    ],
    treatment: [
        'Antiplatelet therapy (aspirin, clopidogrel)',
        'Statins',
        'ACE inhibitors',
        'Angioplasty and stenting',
        'Bypass grafting',
        'Amputation (severe cases)'
    ],
    prevention: 'Regular exercise, smoking cessation, heart-healthy diet, manage risk factors.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Peripheral Arterial Disease. 2025.</a>'
},
{
    name: 'Aortic Aneurysm',
    category: 'Cardiovascular Emergency',
    ageGroup: 'Adults (most common >65 years, rare in children)',
    symptoms: [
        'Back pain or flank pain',
        'Chest pain',
        'Abdominal pain',
        'Hypotension (in rupture)',
        'Syncope',
        'Sudden-onset severe pain (rupture)'
    ],
    causes: [
        'Hypertension',
        'Atherosclerosis',
        'Tobacco smoking',
        'Family history',
        'Genetic disorders (Marfan syndrome, Ehlers-Danlos)'
    ],
    treatment: [
        'Blood pressure control',
        'Beta-blockers',
        'Surgical repair (open or endovascular)',
        'Emergency surgery (for rupture)'
    ],
    prevention: 'Manage hypertension, quit smoking, genetic screening for at-risk families.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Aortic Aneurysm. 2025.</a>'
},
{
    name: 'Aortic Dissection',
    category: 'Cardiovascular Emergency',
    ageGroup: 'Adults (most common 50–65 years)',
    symptoms: [
        'Sudden, severe chest or back pain',
        'Tearing or ripping sensation',
        'Shortness of breath',
        'Weakness or numbness',
        'Hypotension',
        'Syncope'
    ],
    causes: [
        'Hypertension',
        'Atherosclerosis',
        'Connective tissue disorders',
        'Aortic aneurysm',
        'Cocaine use'
    ],
    treatment: [
        'Emergency stabilization',
        'Blood pressure reduction (nitroprusside, labetalol)',
        'Emergency surgery or endovascular repair',
        'ICU monitoring'
    ],
    prevention: 'Rigorous blood pressure control, manage connective tissue disorders, avoid stimulants.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Aortic Dissection. 2025.</a>'
},
{
    name: 'Valvular Heart Disease (Aortic, Mitral, Tricuspid, Pulmonary)',
    category: 'Cardiovascular Condition',
    ageGroup: 'All ages (varies by valve and cause)',
    symptoms: [
        'Heart murmur',
        'Shortness of breath',
        'Chest pain',
        'Fatigue',
        'Palpitations',
        'Swelling in legs/ankles'
    ],
    causes: [
        'Rheumatic fever',
        'Infective endocarditis',
        'Degenerative disease (age-related)',
        'Trauma',
        'Connective tissue disorders',
        'Congenital abnormalities'
    ],
    treatment: [
        'Anticoagulation (if indicated)',
        'Antibiotics (for endocarditis)',
        'Diuretics',
        'Valve repair or replacement (surgical or transcatheter)',
        'Monitoring with echocardiography'
    ],
    prevention: 'Prophylactic antibiotics for endocarditis risk, treat infections promptly, manage risks.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Valvular Disease. 2025.</a>'
},
{
    name: 'Myocarditis (Heart Muscle Inflammation)',
    category: 'Cardiovascular Condition',
    ageGroup: 'All ages (more common in children, young adults, and elderly)',
    symptoms: [
        'Chest pain',
        'Shortness of breath',
        'Fatigue',
        'Palpitations',
        'Fever',
        'Joint pain'
    ],
    causes: [
        'Viral infections (coxsackievirus, influenza)',
        'Bacterial infections',
        'Autoimmune disorders',
        'Toxic substances (alcohol, chemotherapy)',
        'Post-viral inflammation'
    ],
    treatment: [
        'Bed rest',
        'NSAIDs or corticosteroids',
        'ACE inhibitors',
        'Beta-blockers',
        'Diuretics',
        'Mechanical support (ECMO, VAD) in severe cases'
    ],
    prevention: 'Treat infections promptly, avoid excessive alcohol, manage autoimmune conditions.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Myocarditis. 2025.</a>'
},
{
    name: 'Pericarditis (Pericardium Inflammation)',
    category: 'Cardiovascular Condition',
    ageGroup: 'All ages (more common in adults 20–50 years)',
    symptoms: [
        'Sharp chest pain',
        'Pain worse with breathing',
        'Shoulder pain',
        'Fever',
        'Fatigue',
        'Pericardial friction rub (auscultation)'
    ],
    causes: [
        'Viral infections',
        'Autoimmune disorders',
        'Myocardial infarction',
        'Trauma',
        'Renal failure',
        'Malignancy'
    ],
    treatment: [
        'NSAIDs (aspirin, indomethacin)',
        'Colchicine',
        'Corticosteroids',
        'Pericardiocentesis (if effusion)',
        'Antibiotics (if bacterial)'
    ],
    prevention: 'Treat underlying conditions, manage infections and autoimmune disorders.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Pericarditis. 2025.</a>'
},
{
    name: 'Endocarditis (Heart Lining Infection)',
    category: 'Cardiovascular Infection',
    ageGroup: 'All ages (risk higher in those with predisposing cardiac conditions)',
    symptoms: [
        'Fever',
        'Heart murmur',
        'Chest pain',
        'Shortness of breath',
        'Fatigue',
        'Joint pain',
        'Splinter hemorrhages'
    ],
    causes: [
        'Streptococcus (rheumatic heart disease)',
        'Staphylococcus aureus',
        'Gram-negative organisms',
        'Fungal infections',
        'Intravenous drug use'
    ],
    treatment: [
        'Prolonged intravenous antibiotics (4–6 weeks)',
        'Valve replacement (if valve destroyed)',
        'Surgery for complications'
    ],
    prevention: 'Prophylactic antibiotics for at-risk procedures, maintain dental hygiene, avoid IV drug use.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Endocarditis. 2025.</a>'
},
{
    name: 'Pulmonary Embolism (PE)',
    category: 'Cardiovascular Emergency',
    ageGroup: 'Adults (all ages at risk, more common >50 years)',
    symptoms: [
        'Sudden shortness of breath',
        'Chest pain',
        'Rapid heart rate',
        'Cough (sometimes with blood)',
        'Syncope',
        'Hypotension'
    ],
    causes: [
        'Deep vein thrombosis (DVT)',
        'Immobility (bed rest, long flights)',
        'Surgical procedures',
        'Cancer',
        'Atrial fibrillation',
        'Trauma'
    ],
    treatment: [
        'Anticoagulation (heparin, warfarin, DOACs)',
        'Thrombolytic therapy',
        'Inferior vena cava filter',
        'Mechanical thrombectomy (rare)',
        'Supportive care'
    ],
    prevention: 'Early mobilization post-surgery, compression stockings, prophylactic anticoagulation in high-risk.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Pulmonary Embolism. 2025.</a>'
},
{
    name: 'Deep Vein Thrombosis (DVT)',
    category: 'Cardiovascular Condition',
    ageGroup: 'Adults (all ages, more common >40 years)',
    symptoms: [
        'Swelling in leg',
        'Pain or tenderness',
        'Warmth or redness',
        'Dilated veins',
        'Skin discoloration'
    ],
    causes: [
        'Immobility',
        'Surgery',
        'Cancer',
        'Hypercoagulability disorders',
        'Contraceptive use',
        'Trauma'
    ],
    treatment: [
        'Anticoagulation therapy (heparin, DOACs)',
        'Compression stockings',
        'Leg elevation',
        'Thrombolytic therapy (select cases)',
        'IVC filter (if anticoagulation contraindicated)'
    ],
    prevention: 'Early mobilization, compression stockings, prophylactic anticoagulation in high-risk.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. DVT. 2025.</a>'
},
{
    name: 'Venous Insufficiency (Chronic)',
    category: 'Cardiovascular Condition',
    ageGroup: 'Adults (most common >50 years)',
    symptoms: [
        'Leg swelling (edema)',
        'Varicose veins',
        'Skin discoloration',
        'Leg ulcers',
        'Heaviness in legs',
        'Pain'
    ],
    causes: [
        'Valve dysfunction',
        'Immobility',
        'Obesity',
        'Pregnancy',
        'Prior DVT',
        'Family history'
    ],
    treatment: [
        'Compression stockings',
        'Leg elevation',
        'NSAIDs',
        'Topical treatments',
        'Ablation or sclerotherapy',
        'Surgical repair (severe cases)'
    ],
    prevention: 'Regular exercise, weight management, leg elevation, compression stockings.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Venous Insufficiency. 2025.</a>'
},
{
    name: 'Pulmonary Hypertension',
    category: 'Cardiovascular Condition',
    ageGroup: 'All ages (more common in middle-aged and elderly)',
    symptoms: [
        'Shortness of breath',
        'Chest pain',
        'Syncope',
        'Palpitations',
        'Leg swelling',
        'Fatigue'
    ],
    causes: [
        'Left heart disease',
        'Lung disease (COPD, interstitial lung disease)',
        'Chronic thromboembolism',
        'Idiopathic pulmonary arterial hypertension',
        'Connective tissue disease'
    ],
    treatment: [
        'Pulmonary vasodilators (nitric oxide, sildenafil, tadalafil)',
        'Diuretics',
        'Anticoagulation',
        'Oxygen therapy',
        'Lung transplant (severe cases)'
    ],
    prevention: 'Treat underlying lung/heart disease, avoid hypoxia.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Pulmonary Hypertension. 2025.</a>'
},
{
    name: 'Atherosclerosis',
    category: 'Cardiovascular Condition',
    ageGroup: 'Adults (begins in childhood, symptomatic >40 years)',
    symptoms: [
        'Often asymptomatic until events occur',
        'Chest pain (angina)',
        'Shortness of breath',
        'Leg pain (claudication)',
        'Stroke symptoms'
    ],
    causes: [
        'High cholesterol',
        'Hypertension',
        'Smoking',
        'Diabetes',
        'Obesity',
        'Inflammation'
    ],
    treatment: [
        'Statins',
        'Antiplatelet agents (aspirin)',
        'ACE inhibitors',
        'Beta-blockers',
        'Angioplasty/stenting or bypass'
    ],
    prevention: 'Maintain healthy cholesterol, blood pressure, weight, regular exercise, no smoking.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Atherosclerosis. 2025.</a>'
},
{
    name: 'Hypercholesterolemia (High Cholesterol)',
    category: 'Cardiovascular Risk Factor',
    ageGroup: 'All ages (familial forms present from childhood)',
    symptoms: [
        'Often asymptomatic',
        'Xanthomas (tendon or skin nodules)',
        'Corneal arcus',
        'Premature coronary disease in family'
    ],
    causes: [
        'Genetic predisposition (familial hypercholesterolemia)',
        'Poor diet',
        'Sedentary lifestyle',
        'Obesity',
        'Hypothyroidism'
    ],
    treatment: [
        'Statins',
        'Ezetimibe',
        'PCSK9 inhibitors',
        'Bile acid sequestrants',
        'Dietary modifications'
    ],
    prevention: 'Heart-healthy diet, regular exercise, weight management, screen for familial forms.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Hypercholesterolemia. 2025.</a>'
},
{
    name: 'Myocardial Ischemia (Silent)',
    category: 'Cardiovascular Condition',
    ageGroup: 'Adults (most common >60 years, diabetics)',
    symptoms: [
        'Often asymptomatic',
        'Detected on stress tests or imaging',
        'Dyspnea',
        'Fatigue',
        'Arrhythmias'
    ],
    causes: [
        'Coronary artery disease',
        'Diabetes (silent ischemia more common)',
        'Hypertension',
        'Autonomic neuropathy'
    ],
    treatment: [
        'Antiplatelet therapy',
        'Statins',
        'Beta-blockers',
        'ACE inhibitors',
        'Angioplasty/stenting or CABG'
    ],
    prevention: 'Rigorous risk factor control (cholesterol, blood pressure, glucose), screening for high-risk.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Myocardial Ischemia. 2025.</a>'
},
{
    name: 'Takotsubo Cardiomyopathy (Stress Cardiomyopathy)',
    category: 'Cardiovascular Condition',
    ageGroup: 'Adults (more common in women >50 years)',
    symptoms: [
        'Acute chest pain',
        'Shortness of breath',
        'Palpitations',
        'Syncope',
        'Resembles heart attack'
    ],
    causes: [
        'Emotional or physical stress',
        'Adrenaline surge',
        'Catecholamine surge',
        'Medical illness',
        'Surgery'
    ],
    treatment: [
        'Beta-blockers',
        'ACE inhibitors',
        'Diuretics',
        'Supportive care',
        'Anticoagulation (if thrombus present)',
        'ICU monitoring'
    ],
    prevention: 'Stress management, treat underlying stressors.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Takotsubo Cardiomyopathy. 2025.</a>'
},
{
    name: 'Acute Coronary Syndrome (ACS)',
    category: 'Cardiovascular Emergency',
    ageGroup: 'Adults (most common >40 years)',
    symptoms: [
        'Chest pain or pressure',
        'Shortness of breath',
        'Nausea',
        'Sweating',
        'Radiation to arm/neck/jaw'
    ],
    causes: [
        'Atherosclerotic plaque rupture',
        'Coronary thrombosis',
        'Coronary vasospasm',
        'Myocarditis'
    ],
    treatment: [
        'Aspirin',
        'Antiplatelet agents (clopidogrel, ticagrelor)',
        'Anticoagulation',
        'Beta-blockers',
        'Statins',
        'PCI/stenting or CABG',
        'Thrombolytic therapy'
    ],
    prevention: 'Aggressive risk factor management, smoking cessation, stress reduction.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Acute Coronary Syndrome. 2025.</a>'
},
{
    name: 'Angina Pectoris (Stable)',
    category: 'Cardiovascular Condition',
    ageGroup: 'Adults (most common >50 years)',
    symptoms: [
        'Chest pain or pressure',
        'Discomfort in arms, shoulders, neck, jaw',
        'Shortness of breath',
        'Fatigue',
        'Pain relieved by rest or nitroglycerin'
    ],
    causes: [
        'Coronary artery disease',
        'Reduced blood flow to heart'
    ],
    treatment: [
        'Nitroglycerin (sublingual, long-acting)',
        'Beta-blockers',
        'Calcium channel blockers',
        'Antiplatelet therapy',
        'Statins',
        'Angioplasty/stenting or CABG'
    ],
    prevention: 'Risk factor control, cardiac rehabilitation, stress reduction.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Angina. 2025.</a>'
},
{
    name: 'Unstable Angina',
    category: 'Cardiovascular Condition',
    ageGroup: 'Adults (most common >50 years)',
    symptoms: [
        'Chest pain at rest',
        'New or worsening chest pain',
        'Shortness of breath',
        'Severe angina',
        'Pain not relieved by rest'
    ],
    causes: [
        'Atherosclerotic plaque rupture',
        'Partial thrombosis',
        'Vasospasm',
        'Increased demand'
    ],
    treatment: [
        'Hospitalization',
        'Antiplatelet therapy',
        'Anticoagulation',
        'Beta-blockers',
        'Statins',
        'Urgent angiography and revascularization'
    ],
    prevention: 'Aggressive risk factor management, smoking cessation.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Unstable Angina. 2025.</a>'
},
{
    name: 'Prinzmetal Angina (Vasospastic)',
    category: 'Cardiovascular Condition',
    ageGroup: 'Adults (more common in younger patients, 40–50 years)',
    symptoms: [
        'Chest pain at rest (often early morning)',
        'Chest pain relieved by nitroglycerin',
        'No pain with exertion',
        'EKG changes during episodes'
    ],
    causes: [
        'Coronary artery vasospasm',
        'Smoking',
        'Stress',
        'Cold exposure'
    ],
    treatment: [
        'Long-acting nitrates',
        'Calcium channel blockers',
        'Beta-blockers (caution—may worsen)',
        'Smoking cessation'
    ],
    prevention: 'Quit smoking, stress reduction, avoid triggers.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Prinzmetal Angina. 2025.</a>'
},
{
    name: 'Congenital Heart Disease',
    category: 'Cardiovascular Condition (Congenital)',
    ageGroup: 'All ages (from birth or infancy)',
    symptoms: [
        'Varies by defect',
        'Cyanosis (blue lips/skin)',
        'Shortness of breath',
        'Poor feeding',
        'Failure to thrive',
        'Heart murmur'
    ],
    causes: [
        'Genetic factors',
        'Maternal infections during pregnancy (rubella)',
        'Fetal alcohol exposure',
        'Maternal medications (ACE inhibitors)'
    ],
    treatment: [
        'Surgical repair (varies by defect)',
        'Medication management',
        'Catheter-based interventions',
        'Long-term monitoring'
    ],
    prevention: 'Prenatal care, avoid infections/teratogens, genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Congenital Heart Disease. 2025.</a>'
},
{
    name: 'Rheumatic Heart Disease',
    category: 'Cardiovascular Condition',
    ageGroup: 'All ages (can begin in childhood after rheumatic fever)',
    symptoms: [
        'Heart murmur',
        'Shortness of breath',
        'Chest pain',
        'Palpitations',
        'Fatigue',
        'Swelling'
    ],
    causes: [
        'Rheumatic fever (post-streptococcal)',
        'Repeated Group A streptococcal infections',
        'Autoimmune response'
    ],
    treatment: [
        'Antibiotic prophylaxis',
        'Anticoagulation',
        'Diuretics',
        'Valve replacement (if severe)'
    ],
    prevention: 'Prompt antibiotics for strep throat, prophylactic antibiotics for recurrent strep.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Rheumatic Heart Disease. 2025.</a>'
},
{
    name: 'Sudden Cardiac Death (SCD)',
    category: 'Cardiovascular Emergency',
    ageGroup: 'All ages (more common >45 years, but can occur at any age)',
    symptoms: [
        'Sudden loss of consciousness',
        'No pulse',
        'Cessation of breathing',
        'Collapse'
    ],
    causes: [
        'Ventricular fibrillation',
        'Asystole',
        'Electromechanical dissociation',
        'Underlying CAD, cardiomyopathy, arrhythmias'
    ],
    treatment: [
        'Immediate CPR',
        'Automated external defibrillation (AED)',
        'Advanced cardiac life support (ACLS)',
        'Therapeutic hypothermia',
        'ICD implantation (prevention)'
    ],
    prevention: 'Risk factor management, screening for inherited conditions, ICD placement in high-risk.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Sudden Cardiac Death. 2025.</a>'
},
{
    name: 'Long QT Syndrome',
    category: 'Cardiovascular Condition (Inherited)',
    ageGroup: 'All ages (can present in infants to adults)',
    symptoms: [
        'Palpitations',
        'Syncope (especially with exertion or emotion)',
        'Seizures (misdiagnosed as epilepsy)',
        'Sudden death (undiagnosed)'
    ],
    causes: [
        'Genetic mutations (KCNQ1, KCNH2, SCN5A)',
        'Family history',
        'Medications prolonging QT',
        'Electrolyte abnormalities'
    ],
    treatment: [
        'Beta-blockers',
        'ICD implantation',
        'Genetic counseling',
        'Avoid QT-prolonging medications',
        'Sodium channel blockers (some types)'
    ],
    prevention: 'Genetic screening for family members, activity restriction in some forms.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Long QT Syndrome. 2025.</a>'
},
{
    name: 'Brugada Syndrome',
    category: 'Cardiovascular Condition (Inherited)',
    ageGroup: 'All ages (most commonly presents ages 20–40 years)',
    symptoms: [
        'Often asymptomatic',
        'Syncope (especially at rest)',
        'Ventricular fibrillation',
        'Sudden cardiac death'
    ],
    causes: [
        'Genetic mutations (SCN5A sodium channel)',
        'Family history',
        'More common in males'
    ],
    treatment: [
        'ICD implantation (for high-risk)',
        'Avoid fever (antipyretics)',
        'Genetic counseling',
        'Antiarrhythmic drugs (quinidine)'
    ],
    prevention: 'Family screening, ICD placement for symptomatic or high-risk.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Brugada Syndrome. 2025.</a>'
},
{
    name: 'Catecholaminergic Polymorphic Ventricular Tachycardia (CPVT)',
    category: 'Cardiovascular Condition (Inherited)',
    ageGroup: 'Pediatric and young adults (ages 1–40 years)',
    symptoms: [
        'Syncope with exercise or emotion',
        'Palpitations',
        'Seizure-like episodes',
        'Sudden cardiac death'
    ],
    causes: [
        'Genetic mutations (RYR2, CASQ2)',
        'Abnormal calcium handling',
        'Family history'
    ],
    treatment: [
        'Beta-blockers',
        'ICD implantation',
        'Genetic counseling',
        'Flecainide (select cases)',
        'Activity restriction'
    ],
    prevention: 'Family screening, ICD placement, exercise restriction.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. CPVT. 2025.</a>'
},
{
    name: 'Marfan Syndrome (Cardiovascular Manifestations)',
    category: 'Genetic/Cardiovascular Condition',
    ageGroup: 'All ages (present from birth)',
    symptoms: [
        'Aortic root dilatation',
        'Aortic regurgitation',
        'Mitral valve prolapse',
        'Aortic dissection or rupture',
        'Tall stature, lens dislocation'
    ],
    causes: [
        'Fibrillin-1 gene mutation',
        'Autosomal dominant inheritance'
    ],
    treatment: [
        'Beta-blockers or ARBs (aortic protection)',
        'Regular echocardiography',
        'Surgical repair/replacement of aorta',
        'Activity restriction',
        'Genetic counseling'
    ],
    prevention: 'Genetic screening, early diagnosis, preventive surgery.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Marfan Syndrome. 2025.</a>'
},
{
    name: 'Ehlers-Danlos Syndrome (Cardiovascular Type)',
    category: 'Genetic/Cardiovascular Condition',
    ageGroup: 'All ages (present from birth)',
    symptoms: [
        'Aortic dissection (sudden, often fatal)',
        'Arterial rupture',
        'Joint hypermobility',
        'Skin fragility',
        'Easy bruising'
    ],
    causes: [
        'COL3A1 gene mutation (collagen III deficiency)',
        'Autosomal dominant'
    ],
    treatment: [
        'Beta-blockers or ARBs',
        'Avoiding strenuous activities',
        'Genetic counseling',
        'Emergency surgery if dissection occurs'
    ],
    prevention: 'Genetic screening, activity modification, early diagnosis.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. EDS. 2025.</a>'
},
{
    name: 'Loeys-Dietz Syndrome',
    category: 'Genetic/Cardiovascular Condition',
    ageGroup: 'All ages (present from birth)',
    symptoms: [
        'Aortic root and ascending aorta aneurysm',
        'Aortic dissection (early-onset)',
        'Craniofacial features (hypertelorism, cleft palate)',
        'Joint hypermobility',
        'Skin manifestations'
    ],
    causes: [
        'TGFBR1 or TGFBR2 mutations',
        'Autosomal dominant'
    ],
    treatment: [
        'Beta-blockers or ARBs',
        'TGF-β antagonists (losartan)',
        'Preventive aortic root replacement',
        'Genetic counseling'
    ],
    prevention: 'Genetic screening, early surgery.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Loeys-Dietz Syndrome. 2025.</a>'
},
{
    name: 'Hypertrophic Cardiomyopathy (HCM)',
    category: 'Cardiovascular Condition (Genetic)',
    ageGroup: 'All ages (often detected in childhood or young adults)',
    symptoms: [
        'Chest pain',
        'Shortness of breath',
        'Palpitations',
        'Syncope (especially with exercise)',
        'Heart murmur',
        'Sudden cardiac death (in some)'
    ],
    causes: [
        'Genetic mutations in sarcomeric proteins',
        'Autosomal dominant inheritance'
    ],
    treatment: [
        'Beta-blockers or calcium channel blockers',
        'Disopyramide',
        'ICD implantation',
        'Septal ablation or myectomy (severe)',
        'Activity restriction'
    ],
    prevention: 'Genetic screening for family, activity restriction in symptomatic.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Hypertrophic Cardiomyopathy. 2025.</a>'
},
{
    name: 'Dilated Cardiomyopathy (DCM)',
    category: 'Cardiovascular Condition',
    ageGroup: 'All ages (can present from infancy to adulthood)',
    symptoms: [
        'Shortness of breath',
        'Fatigue',
        'Edema (legs, ankles)',
        'Palpitations',
        'Syncope'
    ],
    causes: [
        'Genetic mutations (30–50% familial)',
        'Viral myocarditis',
        'Myotoxic drugs',
        'Alcohol abuse',
        'Pregnancy (peripartum)',
        'Nutritional deficiency'
    ],
    treatment: [
        'ACE inhibitors/ARBs',
        'Beta-blockers',
        'Aldosterone antagonists',
        'Diuretics',
        'ICD/pacemaker',
        'Heart transplant (advanced)'
    ],
    prevention: 'Genetic screening, avoid alcohol/cardiotoxins, treat myocarditis promptly.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5f15714ae',
    citation: '<a href="https://www.cdc.gov/heartdisease/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Dilated Cardiomyopathy. 2025.</a>'
},
{
    name: 'Restrictive Cardiomyopathy',
    category: 'Cardiovascular Condition',
    ageGroup: 'All ages (more common in developing countries due to amyloidosis)',
    symptoms: [
        'Shortness of breath',
        'Edema',
        'Fatigue',
        'Syncope',
        'Right-sided heart failure'
    ],
    causes: [
        'Amyloidosis',
        'Hemochromatosis',
        'Sarcoidosis',
        'Infiltrative diseases',
        'Genetic mutations'
    ],
    treatment: [
        'Treat underlying condition',
        'Diuretics',
        'Anticoagulation (if AFib)',
        'Transplant (advanced)',
        'Immunosuppression (select cases)'
    ],
    prevention: 'Screen for underlying disorders, genetic counseling.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Restrictive Cardiomyopathy. 2025.</a>'
}

];

const doctorsData = {

  'Delhi': [
    {
        name: 'Dr. Naresh Trehan',
        credentials: 'MBBS, MS, FRCS, Cardiovascular & Cardiothoracic Surgeon',
        experience: '50+ Years Experience',
        hospital: 'Medanta - The Medicity',
        address: 'Sector 38, Gurugram, Delhi NCR - 122001',
        phone: '+91 124 4141 414',
        email: 'naresh.trehan@medanta.org',
        hours: 'Mon-Sat 9AM-5PM',
        specializations: 'Heart Surgery, Bypass Surgery, Valve Replacement, Aortic Surgery',
        bookingLink: 'https://www.medanta.org',
        rating: '4.9/5 (850 reviews)'
    },
    {
        name: 'Dr. Ashok Seth',
        credentials: 'MBBS, MD, FACC, FSCAI, Chairman Cardiac Sciences',
        experience: '45+ Years Experience',
        hospital: 'Fortis Escorts Heart Institute',
        address: 'Okhla Road, New Delhi - 110025',
        phone: '+91 11 4713 5000',
        email: 'ashok.seth@fortishealthcare.com',
        hours: 'Mon-Fri 10AM-4PM',
        specializations: 'Interventional Cardiology, Complex Angioplasty, TAVR',
        bookingLink: 'https://www.fortishealthcare.com',
        rating: '4.9/5 (720 reviews)'
    },
    {
        name: 'Dr. Vinay Sanghi',
        credentials: 'MBBS, MD, DM (Cardiology), Senior Consultant',
        experience: '30+ Years Experience',
        hospital: 'Indraprastha Apollo Hospital',
        address: 'Sarita Vihar, Delhi - 110076',
        phone: '+91 11 2692 5858',
        email: 'vinay.sanghi@apollohospitals.com',
        hours: 'Mon-Sat 9AM-5PM',
        specializations: 'Interventional Cardiology, Heart Failure, Pacemaker Implantation',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.8/5 (410 reviews)'
    },
    {
        name: 'Dr. Samin K. Sharma',
        credentials: 'MBBS, MD, DM, Director of Interventional Cardiology',
        experience: '40+ Years Experience',
        hospital: 'Mount Sinai Hospital (Visiting), Max Hospital',
        address: 'Saket, New Delhi - 110017',
        phone: '+91 11 2651 5050',
        email: 'samin.sharma@maxhealthcare.com',
        hours: 'Mon-Fri 10AM-4PM',
        specializations: 'Complex Coronary Interventions, Angioplasty, Stenting',
        bookingLink: 'https://www.maxhealthcare.in',
        rating: '4.9/5 (520 reviews)'
    },
    {
        name: 'Dr. Purshotam Lal',
        credentials: 'MBBS, MD, DM, Chairman Cardiology',
        experience: '50+ Years Experience',
        hospital: 'Metro Heart Institute with Multispeciality',
        address: 'Sector 16A, Faridabad, Delhi NCR',
        phone: '+91 129 417 6666',
        email: 'purshotam.lal@metrohospitals.com',
        hours: 'Mon-Sat 10AM-6PM',
        specializations: 'Preventive Cardiology, Angioplasty, Heart Failure',
        bookingLink: 'https://www.metrohospitals.com',
        rating: '4.8/5 (380 reviews)'
    },
    {
        name: 'Dr. Y. K. Mishra',
        credentials: 'MBBS, MS (Surgery), MCh (CTVS)',
        experience: '35+ Years Experience',
        hospital: 'Manipal Hospital, Dwarka',
        address: 'Sector 6, Dwarka, New Delhi - 110075',
        phone: '+91 11 4967 4967',
        email: 'yk.mishra@manipalhospitals.com',
        hours: 'Mon-Fri 9AM-4PM',
        specializations: 'Cardiac Surgery, CABG, Minimally Invasive Heart Surgery',
        bookingLink: 'https://www.manipalhospitals.com',
        rating: '4.8/5 (290 reviews)'
    },
    {
        name: 'Dr. Rajneesh Malhotra',
        credentials: 'MBBS, MS, MCh (CTVS), Vice Chairman Cardiac Sciences',
        experience: '28+ Years Experience',
        hospital: 'Max Super Speciality Hospital, Saket',
        address: 'Press Enclave Road, Saket, New Delhi - 110017',
        phone: '+91 11 2651 5050',
        email: 'rajneesh.malhotra@maxhealthcare.com',
        hours: 'Mon-Sat 10AM-5PM',
        specializations: 'Adult & Pediatric Cardiac Surgery, Valve Repair',
        bookingLink: 'https://www.maxhealthcare.in',
        rating: '4.9/5 (340 reviews)'
    },
    {
        name: 'Dr. Balbir Singh',
        credentials: 'MBBS, MD, DM (Cardiology), Chairman Cardiac Sciences',
        experience: '35+ Years Experience',
        hospital: 'Max Super Speciality Hospital, Saket',
        address: 'Saket, New Delhi - 110017',
        phone: '+91 11 2651 5050',
        email: 'balbir.singh@maxhealthcare.com',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Electrophysiology, Arrhythmia Management, Complex Ablations',
        bookingLink: 'https://www.maxhealthcare.in',
        rating: '4.9/5 (680 reviews)'
    }
],

'Mumbai': [
    {
        name: 'Dr. Ramakanta Panda',
        credentials: 'MBBS, MS, MCh, Vice Chairman & Managing Director',
        experience: '40+ Years Experience',
        hospital: 'Asian Heart Institute',
        address: 'Bandra Kurla Complex, Mumbai - 400070',
        phone: '+91 22 6698 6666',
        email: 'ramakanta.panda@asianheartinstitute.org',
        hours: 'Mon-Sat 9AM-6PM',
        specializations: 'Cardiac Surgery, CABG, Minimally Invasive Surgery, Valve Repair',
        bookingLink: 'https://www.asianheartinstitute.org',
        rating: '4.9/5 (920 reviews)'
    },
    {
        name: 'Dr. Samuel S. Jacob',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '35+ Years Experience',
        hospital: 'Kokilaben Dhirubhai Ambani Hospital',
        address: 'Andheri West, Mumbai - 400053',
        phone: '+91 22 3069 6969',
        email: 'samuel.jacob@kokilabenhospital.com',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Interventional Cardiology, Heart Failure, Angioplasty',
        bookingLink: 'https://www.kokilabenhospital.com',
        rating: '4.8/5 (510 reviews)'
    },
    {
        name: 'Dr. Prafulla Kerkar',
        credentials: 'MBBS, MD, DM, Consultant Cardiologist',
        experience: '40+ Years Experience',
        hospital: 'Asian Heart Institute / Lilavati Hospital',
        address: 'Bandra Reclamation, Mumbai - 400050',
        phone: '+91 22 2640 2040',
        email: 'prafulla.kerkar@asianheartinstitute.org',
        hours: 'Mon-Sat 10AM-4PM',
        specializations: 'Preventive Cardiology, Heart Failure, Hypertension',
        bookingLink: 'https://www.lilavatihospital.com',
        rating: '4.8/5 (620 reviews)'
    },
    {
        name: 'Dr. Tilak Suvarna',
        credentials: 'MBBS, MS, MCh (CTVS)',
        experience: '38+ Years Experience',
        hospital: 'Asian Heart Institute',
        address: 'BKC, Mumbai - 400070',
        phone: '+91 22 6698 6666',
        email: 'tilak.suvarna@asianheartinstitute.org',
        hours: 'Mon-Fri 9AM-5PM',
        specializations: 'Minimally Invasive Cardiac Surgery, Robotic Heart Surgery',
        bookingLink: 'https://www.asianheartinstitute.org',
        rating: '4.9/5 (380 reviews)'
    },
    {
        name: 'Dr. Nitin Deshpande',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '30+ Years Experience',
        hospital: 'Fortis Hospital, Mulund',
        address: 'Mulund Goregaon Link Road, Mumbai - 400078',
        phone: '+91 22 6754 9999',
        email: 'nitin.deshpande@fortishealthcare.com',
        hours: 'Mon-Sat 9AM-5PM',
        specializations: 'Interventional Cardiology, Angioplasty, Stenting',
        bookingLink: 'https://www.fortishealthcare.com',
        rating: '4.8/5 (290 reviews)'
    },
    {
        name: 'Dr. Haresh Mehta',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '32+ Years Experience',
        hospital: 'P. D. Hinduja Hospital',
        address: 'Veer Savarkar Marg, Mahim, Mumbai - 400016',
        phone: '+91 22 2444 9199',
        email: 'haresh.mehta@hindujahospital.com',
        hours: 'Mon-Fri 10AM-4PM',
        specializations: 'Interventional Cardiology, Complex Coronary Interventions',
        bookingLink: 'https://www.hindujahospital.com',
        rating: '4.8/5 (410 reviews)'
    },
    {
        name: 'Dr. Santosh Kumar Dora',
        credentials: 'MBBS, MD, DM, Senior Consultant',
        experience: '27+ Years Experience',
        hospital: 'Asian Heart Institute',
        address: 'BKC, Mumbai - 400070',
        phone: '+91 22 6698 6666',
        email: 'santosh.dora@asianheartinstitute.org',
        hours: 'Mon-Sat 10AM-6PM',
        specializations: 'Pediatric Cardiology, Congenital Heart Defects',
        bookingLink: 'https://www.asianheartinstitute.org',
        rating: '4.9/5 (270 reviews)'
    },
    {
        name: 'Dr. Anil Saxena',
        credentials: 'MBBS, MD, DM, Consultant Interventional Cardiologist',
        experience: '35+ Years Experience',
        hospital: 'Fortis Hospital, Mulund',
        address: 'Mulund, Mumbai - 400078',
        phone: '+91 22 6754 9999',
        email: 'anil.saxena@fortishealthcare.com',
        hours: 'Mon-Fri 9AM-5PM',
        specializations: 'Angioplasty, Heart Attack Management, Cardiac Emergency',
        bookingLink: 'https://www.fortishealthcare.com',
        rating: '4.8/5 (320 reviews)'
    }
],

'Bangalore': [
    {
        name: 'Dr. Devi Prasad Shetty',
        credentials: 'MBBS, MS, FRCS, Chairman & Executive Director',
        experience: '42+ Years Experience',
        hospital: 'Narayana Health (Narayana Hrudayalaya)',
        address: 'Bommasandra Industrial Area, Bangalore - 560099',
        phone: '+91 80 3371 5000',
        email: 'devishetty@narayanahealth.org',
        hours: 'Mon-Sat 10AM-4PM',
        specializations: 'Cardiac Surgery, CABG, Pediatric Cardiac Surgery, Heart Transplant',
        bookingLink: 'https://www.narayanahealth.org',
        rating: '4.9/5 (1200 reviews)'
    },
    {
        name: 'Dr. C. N. Manjunath',
        credentials: 'MBBS, MD, DM (Cardiology), Director',
        experience: '38+ Years Experience',
        hospital: 'Jayadeva Institute of Cardiovascular Sciences',
        address: 'Jayanagar, Bangalore - 560069',
        phone: '+91 80 2653 4477',
        email: 'cn.manjunath@jayadevahospital.org',
        hours: 'Mon-Fri 9AM-5PM',
        specializations: 'Interventional Cardiology, Heart Failure, Primary Angioplasty',
        bookingLink: 'https://www.jayadevahospital.com',
        rating: '4.8/5 (680 reviews)'
    },
    {
        name: 'Dr. Viveka Kumar',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '25+ Years Experience',
        hospital: 'Fortis Hospital, Bannerghatta Road',
        address: 'Bannerghatta Road, Bangalore - 560076',
        phone: '+91 80 6621 4444',
        email: 'viveka.kumar@fortishealthcare.com',
        hours: 'Mon-Sat 9AM-5PM',
        specializations: 'Interventional Cardiology, Complex Angioplasty, TAVR',
        bookingLink: 'https://www.fortishealthcare.com',
        rating: '4.8/5 (390 reviews)'
    },
    {
        name: 'Dr. Srihari Premkumar',
        credentials: 'MBBS, MS, MCh (CTVS)',
        experience: '22+ Years Experience',
        hospital: 'Manipal Hospital, HAL Airport Road',
        address: 'Kodihalli, Bangalore - 560017',
        phone: '+91 80 2502 4444',
        email: 'srihari.premkumar@manipalhospitals.com',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Adult & Pediatric Cardiac Surgery, Minimally Invasive Surgery',
        bookingLink: 'https://www.manipalhospitals.com',
        rating: '4.8/5 (270 reviews)'
    },
    {
        name: 'Dr. Prashanth Rao',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '20+ Years Experience',
        hospital: 'Columbia Asia Hospital, Whitefield',
        address: 'Whitefield, Bangalore - 560066',
        phone: '+91 80 6614 5678',
        email: 'prashanth.rao@columbiaasia.com',
        hours: 'Mon-Sat 10AM-6PM',
        specializations: 'Interventional Cardiology, Structural Heart Disease',
        bookingLink: 'https://www.columbiaasia.com',
        rating: '4.7/5 (210 reviews)'
    },
    {
        name: 'Dr. K. S. Ravindranath',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '32+ Years Experience',
        hospital: 'Apollo Hospital, Bannerghatta Road',
        address: 'Bannerghatta Road, Bangalore - 560076',
        phone: '+91 80 2630 4050',
        email: 'ks.ravindranath@apollohospitals.com',
        hours: 'Mon-Fri 9AM-5PM',
        specializations: 'Interventional Cardiology, Coronary Angioplasty',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.8/5 (310 reviews)'
    },
    {
        name: 'Dr. Shashidharan S',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '18+ Years Experience',
        hospital: 'Sakra World Hospital',
        address: 'Marathahalli, Bangalore - 560103',
        phone: '+91 80 4969 4969',
        email: 'shashidharan.s@sakraworldhospital.com',
        hours: 'Mon-Sat 9AM-5PM',
        specializations: 'Interventional Cardiology, Heart Failure Management',
        bookingLink: 'https://www.sakraworldhospital.com',
        rating: '4.7/5 (180 reviews)'
    }
],

'Chennai': [
    {
        name: 'Dr. K. M. Cherian',
        credentials: 'MBBS, MS, FRCS, Padma Shri Awardee',
        experience: '55+ Years Experience',
        hospital: 'Frontier Lifeline Hospital',
        address: 'Mogappair, Chennai - 600101',
        phone: '+91 44 2656 5656',
        email: 'km.cherian@frontierlifeline.com',
        hours: 'Mon-Sat 10AM-4PM',
        specializations: 'Cardiac Surgery, Pediatric Cardiac Surgery, Heart Transplant Pioneer',
        bookingLink: 'https://www.frontierlifeline.com',
        rating: '4.9/5 (850 reviews)'
    },
    {
        name: 'Dr. Ajit Mullasari',
        credentials: 'MBBS, MD, DM (Cardiology), Director',
        experience: '35+ Years Experience',
        hospital: 'Madras Medical Mission Hospital',
        address: 'Mogappair, Chennai - 600037',
        phone: '+91 44 2476 2476',
        email: 'ajit.mullasari@mmm.org.in',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Interventional Cardiology, Primary Angioplasty, TAVR',
        bookingLink: 'https://www.mmm.org.in',
        rating: '4.8/5 (620 reviews)'
    },
    {
        name: 'Dr. G. Sengottuvelu',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '28+ Years Experience',
        hospital: 'Apollo Hospitals, Greams Road',
        address: 'Greams Lane, Chennai - 600006',
        phone: '+91 44 2829 3333',
        email: 'g.sengottuvelu@apollohospitals.com',
        hours: 'Mon-Sat 9AM-5PM',
        specializations: 'Complex Coronary Interventions, Chronic Total Occlusion',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.9/5 (490 reviews)'
    },
    {
        name: 'Dr. T. S. Kler',
        credentials: 'MBBS, MD, DM, Chairman Cardiology',
        experience: '38+ Years Experience',
        hospital: 'Fortis Malar Hospital',
        address: 'Adyar, Chennai - 600020',
        phone: '+91 44 4289 2222',
        email: 'ts.kler@fortishealthcare.com',
        hours: 'Mon-Fri 10AM-4PM',
        specializations: 'Interventional Cardiology, Structural Heart Disease',
        bookingLink: 'https://www.fortishealthcare.com',
        rating: '4.8/5 (380 reviews)'
    },
    {
        name: 'Dr. V. Rajasekhar',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '25+ Years Experience',
        hospital: 'Kauvery Hospital',
        address: 'Alwarpet, Chennai - 600018',
        phone: '+91 44 4000 6000',
        email: 'v.rajasekhar@kauveryhospital.com',
        hours: 'Mon-Sat 9AM-5PM',
        specializations: 'Interventional Cardiology, Heart Failure',
        bookingLink: 'https://www.kauveryhospital.com',
        rating: '4.7/5 (280 reviews)'
    },
    {
        name: 'Dr. Srikanth Sola',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '22+ Years Experience',
        hospital: 'MIOT International Hospital',
        address: 'Manapakkam, Chennai - 600089',
        phone: '+91 44 4200 2288',
        email: 'srikanth.sola@miotinternational.com',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Electrophysiology, Cardiac Arrhythmia, Ablation',
        bookingLink: 'https://www.miotinternational.com',
        rating: '4.8/5 (230 reviews)'
    },
    {
        name: 'Dr. R. Sabarinath',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '20+ Years Experience',
        hospital: 'Sri Ramachandra Medical Centre',
        address: 'Porur, Chennai - 600116',
        phone: '+91 44 4592 8758',
        email: 'r.sabarinath@sriramachandra.edu.in',
        hours: 'Mon-Sat 10AM-5PM',
        specializations: 'Interventional Cardiology, Angioplasty',
        bookingLink: 'https://www.sriramachandra.edu.in',
        rating: '4.7/5 (190 reviews)'
    }
],

'Hyderabad': [
    {
        name: 'Dr. Alla Gopala Krishna Gokhale',
        credentials: 'MBBS, MS, MCh (CTVS), Chairman',
        experience: '45+ Years Experience',
        hospital: 'CARE Hospitals',
        address: 'Banjara Hills, Hyderabad - 500034',
        phone: '+91 40 6725 8585',
        email: 'gokhale@carehospitals.com',
        hours: 'Mon-Sat 10AM-5PM',
        specializations: 'Cardiac Surgery, CABG, Valve Replacement, Aortic Surgery',
        bookingLink: 'https://www.carehospitals.com',
        rating: '4.9/5 (720 reviews)'
    },
    {
        name: 'Dr. Calambur Narasimhan',
        credentials: 'MBBS, MD, DM, Director Electrophysiology',
        experience: '32+ Years Experience',
        hospital: 'CARE Hospitals',
        address: 'Banjara Hills, Hyderabad - 500034',
        phone: '+91 40 6725 8585',
        email: 'calambur@carehospitals.com',
        hours: 'Mon-Fri 10AM-4PM',
        specializations: 'Cardiac Electrophysiology, Ablation, Pacemaker & ICD Implantation',
        bookingLink: 'https://www.carehospitals.com',
        rating: '4.9/5 (580 reviews)'
    },
    {
        name: 'Dr. B. Hygriv Rao',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '40+ Years Experience',
        hospital: 'KIMS Hospitals',
        address: 'Secunderabad, Hyderabad - 500003',
        phone: '+91 40 4455 5000',
        email: 'hygriv.rao@kimshospitals.com',
        hours: 'Mon-Sat 9AM-5PM',
        specializations: 'Interventional Cardiology, Heart Failure, Angioplasty',
        bookingLink: 'https://www.kimshospitals.com',
        rating: '4.8/5 (490 reviews)'
    },
    {
        name: 'Dr. Suresh Rao PV',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '28+ Years Experience',
        hospital: 'Apollo Hospitals, Jubilee Hills',
        address: 'Jubilee Hills, Hyderabad - 500033',
        phone: '+91 40 2360 7777',
        email: 'suresh.rao@apollohospitals.com',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Interventional Cardiology, Complex PCI',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.8/5 (370 reviews)'
    },
    {
        name: 'Dr. Somaraju Burra',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '25+ Years Experience',
        hospital: 'Yashoda Hospitals',
        address: 'Somajiguda, Hyderabad - 500082',
        phone: '+91 40 4422 7000',
        email: 'somaraju.burra@yashodahospitals.com',
        hours: 'Mon-Sat 9AM-5PM',
        specializations: 'Interventional Cardiology, Angioplasty, Structural Heart Disease',
        bookingLink: 'https://www.yashodahospitals.com',
        rating: '4.7/5 (280 reviews)'
    },
    {
        name: 'Dr. Seshagiri Rao M V',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '30+ Years Experience',
        hospital: 'Continental Hospitals',
        address: 'Gachibowli, Hyderabad - 500032',
        phone: '+91 40 6719 9999',
        email: 'seshagiri.rao@continentalhospitals.com',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Interventional Cardiology, Heart Failure Management',
        bookingLink: 'https://www.continentalhospitals.com',
        rating: '4.8/5 (240 reviews)'
    }
],

'Kolkata': [
    {
        name: 'Dr. Devi Prasad Shetty',
        credentials: 'MBBS, MS, FRCS (Visiting)',
        experience: '42+ Years Experience',
        hospital: 'Rabindranath Tagore International Institute of Cardiac Sciences (RTIICS)',
        address: 'Premises No: 1489, Mukundapur, EM Bypass, Kolkata - 700099',
        phone: '+91 33 6628 6628',
        email: 'contact@rtiics.org',
        hours: 'By Appointment',
        specializations: 'Cardiac Surgery, CABG, Heart Transplant',
        bookingLink: 'https://www.rtiics.org',
        rating: '4.9/5 (650 reviews)'
    },
    {
        name: 'Dr. Aftab Khan',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '35+ Years Experience',
        hospital: 'Apollo Gleneagles Hospitals',
        address: 'Salt Lake City, Kolkata - 700054',
        phone: '+91 33 2320 3040',
        email: 'aftab.khan@apollohospitals.com',
        hours: 'Mon-Fri 10AM-4PM',
        specializations: 'Interventional Cardiology, Complex Angioplasty',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.8/5 (420 reviews)'
    },
    {
        name: 'Dr. Kunal Sarkar',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '28+ Years Experience',
        hospital: 'Medica Superspecialty Hospital',
        address: 'Mukundapur, Kolkata - 700099',
        phone: '+91 33 6652 0000',
        email: 'kunal.sarkar@medicahospitals.in',
        hours: 'Mon-Sat 10AM-5PM',
        specializations: 'Interventional Cardiology, Heart Failure',
        bookingLink: 'https://www.medicahospitals.in',
        rating: '4.8/5 (320 reviews)'
    },
    {
        name: 'Dr. Ramesh Chandra Mishra',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '30+ Years Experience',
        hospital: 'Fortis Hospital, Anandapur',
        address: 'Anandapur, Kolkata - 700107',
        phone: '+91 33 6628 4444',
        email: 'ramesh.mishra@fortishealthcare.com',
        hours: 'Mon-Fri 9AM-5PM',
        specializations: 'Interventional Cardiology, Primary Angioplasty',
        bookingLink: 'https://www.fortishealthcare.com',
        rating: '4.7/5 (280 reviews)'
    },
    {
        name: 'Dr. Sabyasachi Pal',
        credentials: 'MBBS, MS, MCh (CTVS)',
        experience: '22+ Years Experience',
        hospital: 'AMRI Hospital, Salt Lake',
        address: 'Salt Lake City, Kolkata - 700098',
        phone: '+91 33 6606 3800',
        email: 'sabyasachi.pal@amrihospitals.in',
        hours: 'Mon-Sat 10AM-5PM',
        specializations: 'Cardiac Surgery, Minimally Invasive Heart Surgery',
        bookingLink: 'https://www.amrihospitals.in',
        rating: '4.8/5 (220 reviews)'
    },
    {
        name: 'Dr. Santanu Guha',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '27+ Years Experience',
        hospital: 'Rabindranath Tagore International Institute',
        address: 'Mukundapur, Kolkata - 700099',
        phone: '+91 33 6628 6628',
        email: 'santanu.guha@rtiics.org',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Interventional Cardiology, Complex PCI',
        bookingLink: 'https://www.rtiics.org',
        rating: '4.8/5 (260 reviews)'
    }
],

'Pune': [
    {
        name: 'Dr. Ravi R. Kasliwal',
        credentials: 'MBBS, MD, DM (Cardiology), Chairman',
        experience: '35+ Years Experience',
        hospital: 'Ruby Hall Clinic',
        address: 'Grant Road, Pune - 411001',
        phone: '+91 20 6645 5000',
        email: 'ravi.kasliwal@rubyhall.com',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Interventional Cardiology, Preventive Cardiology',
        bookingLink: 'https://www.rubyhall.com',
        rating: '4.9/5 (580 reviews)'
    },
    {
        name: 'Dr. Shirish Hiremath',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '32+ Years Experience',
        hospital: 'Ruby Hall Clinic',
        address: 'Pune - 411001',
        phone: '+91 20 6645 5000',
        email: 'shirish.hiremath@rubyhall.com',
        hours: 'Mon-Sat 9AM-5PM',
        specializations: 'Interventional Cardiology, Angioplasty, Structural Heart Disease',
        bookingLink: 'https://www.rubyhall.com',
        rating: '4.8/5 (450 reviews)'
    },
    {
        name: 'Dr. Ajit Menon',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '28+ Years Experience',
        hospital: 'Jupiter Hospital, Baner',
        address: 'Baner, Pune - 411045',
        phone: '+91 20 6686 6666',
        email: 'ajit.menon@jupiterhospital.com',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Interventional Cardiology, Complex Coronary Interventions',
        bookingLink: 'https://www.jupiterhospital.com',
        rating: '4.8/5 (320 reviews)'
    },
    {
        name: 'Dr. Vivek Chaudhari',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '22+ Years Experience',
        hospital: 'Deenanath Mangeshkar Hospital',
        address: 'Erandwane, Pune - 411004',
        phone: '+91 20 6712 2222',
        email: 'vivek.chaudhari@dmhospital.org',
        hours: 'Mon-Sat 9AM-5PM',
        specializations: 'Interventional Cardiology, Heart Failure',
        bookingLink: 'https://www.dmhospital.org',
        rating: '4.7/5 (240 reviews)'
    },
    {
        name: 'Dr. Hemant Thacker',
        credentials: 'MBBS, MD, FRCP',
        experience: '30+ Years Experience',
        hospital: 'Breach Candy Hospital (Mumbai) / Visiting Pune',
        address: 'Consulting in Pune',
        phone: 'Available on Request',
        email: 'hemant.thacker@breachcandyhospital.org',
        hours: 'By Appointment',
        specializations: 'Preventive Cardiology, Lifestyle Medicine',
        bookingLink: 'https://www.breachcandyhospital.org',
        rating: '4.8/5 (290 reviews)'
    },
    {
        name: 'Dr. Prashant Bharadwaj',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '18+ Years Experience',
        hospital: 'Noble Hospital',
        address: 'Magarpatta City, Hadapsar, Pune - 411013',
        phone: '+91 20 6706 7070',
        email: 'prashant.bharadwaj@noblehospitals.com',
        hours: 'Mon-Sat 10AM-6PM',
        specializations: 'Interventional Cardiology, Angioplasty',
        bookingLink: 'https://www.noblehospitals.com',
        rating: '4.7/5 (180 reviews)'
    }
],

'Ahmedabad': [
    {
        name: 'Dr. Tejas Patel',
        credentials: 'MBBS, MD, DM (Cardiology), Padma Shri Awardee',
        experience: '35+ Years Experience',
        hospital: 'Apex Heart Institute',
        address: 'Memnagar, Ahmedabad - 380052',
        phone: '+91 79 4030 4030',
        email: 'tejas.patel@apexheart.org',
        hours: 'Mon-Sat 10AM-5PM',
        specializations: 'Interventional Cardiology, Radial Angioplasty Pioneer, Complex PCI',
        bookingLink: 'https://www.apexheart.org',
        rating: '4.9/5 (750 reviews)'
    },
    {
        name: 'Dr. Keyur Parikh',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '30+ Years Experience',
        hospital: 'Apollo Hospitals International Limited',
        address: 'Ahmedabad',
        phone: '+91 79 4040 3333',
        email: 'keyur.parikh@apollohospitals.com',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Interventional Cardiology, Structural Heart Disease',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.8/5 (420 reviews)'
    },
    {
        name: 'Dr. Jayesh Prajapati',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '26+ Years Experience',
        hospital: 'Marengo CIMS Hospital',
        address: 'Off Science City Road, Sola, Ahmedabad - 380060',
        phone: '+91 79 2771 2771',
        email: 'jayesh.prajapati@cims.org',
        hours: 'Mon-Sat 10AM-6PM',
        specializations: 'Interventional Cardiology, Angioplasty, Heart Failure',
        bookingLink: 'https://www.cims.org',
        rating: '4.8/5 (310 reviews)'
    },
    {
        name: 'Dr. Sanjay Gandhi',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '28+ Years Experience',
        hospital: 'SAL Hospital',
        address: 'Thaltej, Ahmedabad - 380054',
        phone: '+91 79 4025 7500',
        email: 'sanjay.gandhi@salhospital.org',
        hours: 'Mon-Fri 9AM-5PM',
        specializations: 'Interventional Cardiology, Complex Coronary Interventions',
        bookingLink: 'https://www.salhospital.org',
        rating: '4.7/5 (260 reviews)'
    },
    {
        name: 'Dr. Bhadresh Vyas',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '22+ Years Experience',
        hospital: 'Zydus Hospitals',
        address: 'Thaltej, Ahmedabad - 380054',
        phone: '+91 79 6619 0101',
        email: 'bhadresh.vyas@zydushospitals.com',
        hours: 'Mon-Sat 10AM-5PM',
        specializations: 'Interventional Cardiology, Electrophysiology',
        bookingLink: 'https://www.zydushospitals.com',
        rating: '4.7/5 (210 reviews)'
    },
    {
        name: 'Dr. Hardik Gor',
        credentials: 'MBBS, MD, DM (Cardiology)',
        experience: '15+ Years Experience',
        hospital: 'Sterling Hospital',
        address: 'Off. Gurukul Road, Ahmedabad - 380052',
        phone: '+91 79 6677 0000',
        email: 'hardik.gor@sterlinghospitals.com',
        hours: 'Mon-Sat 9AM-5PM',
        specializations: 'Interventional Cardiology, Angioplasty',
        bookingLink: 'https://www.sterlinghospitals.com',
        rating: '4.7/5 (150 reviews)'
    }
  ]
};

// ========================================================================
// FAQS ARRAY
// ========================================================================
const faqs = [
  // --- 1. General Cardiovascular Basics ---
    {
        icon: '❤️',
        question: 'What is cardiovascular disease (CVD)?',
        answer: 'Cardiovascular disease is a group of conditions affecting the heart and blood vessels, including coronary artery disease, heart failure, stroke, and arrhythmias.',
        citation: '<a href="https://www.cdc.gov/heartdisease/about.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Heart Disease Basics</a>'
    },
    {
        icon: '🫀',
        question: 'How does the heart work?',
        answer: 'The heart pumps blood through arteries and veins to deliver oxygen and nutrients to all body organs. Four chambers (two atria and two ventricles) work together in a coordinated rhythm.',
        citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Heart Anatomy</a>'
    },
    {
        icon: '💓',
        question: 'What is a normal heart rate?',
        answer: 'A resting heart rate of 60-100 beats per minute is normal for adults. Athletes may have lower rates (40-60 bpm).',
        citation: '<a href="https://www.mayoclinic.org/healthy-lifestyle/fitness/expert-answers/heart-rate/faq-20057979" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Normal Heart Rate</a>'
    },
    {
        icon: '📊',
        question: 'What is blood pressure and why is it important?',
        answer: 'Blood pressure is the force of blood pushing against artery walls, measured as systolic/diastolic. Normal is <120/80 mmHg. High blood pressure increases heart disease risk.',
        citation: '<a href="https://www.cdc.gov/bloodpressure/faqs.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Blood Pressure FAQ</a>'
    },
    
    // --- 2. Risk Factors ---
    {
        icon: '⚠️',
        question: 'What are the major risk factors for heart disease?',
        answer: 'Risk factors include hypertension, high cholesterol, smoking, obesity, sedentary lifestyle, diabetes, family history, age, and stress.',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. CVD Risk Factors</a>'
    },
    {
        icon: '🚭',
        question: 'How does smoking affect the heart?',
        answer: 'Smoking narrows arteries, increases blood clots, raises blood pressure, and reduces oxygen in blood, increasing heart attack and stroke risk.',
        citation: '<a href="https://www.cdc.gov/tobacco/data_statistics/sgr/index.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Smoking & Heart Health</a>'
    },
    {
        icon: '⚖️',
        question: 'What is the link between obesity and heart disease?',
        answer: 'Obesity increases blood pressure, cholesterol, and diabetes risk. Excess weight forces the heart to work harder.',
        citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Obesity & Heart Health</a>'
    },
    {
        icon: '🍷',
        question: 'Is alcohol consumption harmful to the heart?',
        answer: 'Excessive alcohol increases blood pressure, triglycerides, and heart disease risk. Moderate intake (1 drink/day for women, 2 for men) may have some benefits.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/in-depth/blood-pressure/art-20045206" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Alcohol & Heart</a>'
    },
    
    // --- 3. Symptoms & Warning Signs ---
    {
        icon: '🚨',
        question: 'What are warning signs of a heart attack?',
        answer: 'Chest pain or pressure, shortness of breath, arm/jaw/back pain, nausea, cold sweats, and lightheadedness. Call emergency services immediately.',
        citation: '<a href="https://www.cdc.gov/heartdisease/heart_attack.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Heart Attack Symptoms</a>'
    },
    {
        icon: '😵',
        question: 'What are signs of a stroke?',
        answer: 'Facial drooping, arm weakness, speech difficulty, sudden vision loss, severe headache, dizziness. Remember FAST—Face, Arm, Speech, Time.',
        citation: '<a href="https://www.cdc.gov/stroke/signs_symptoms.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Stroke Symptoms</a>'
    },
    {
        icon: '😰',
        question: 'What are symptoms of heart failure?',
        answer: 'Shortness of breath, fatigue, swelling in legs/ankles, rapid heartbeat, difficulty lying flat, persistent cough.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/heart-failure/symptoms-causes/syc-20373142" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Heart Failure Symptoms</a>'
    },
    {
        icon: '💫',
        question: 'What causes palpitations (heart skipping)?',
        answer: 'Palpitations can result from stress, caffeine, exercise, dehydration, arrhythmias, or other conditions. Usually harmless but see a doctor if persistent.',
        citation: '<a href="https://www.cdc.gov/heartdisease/arrhythmia.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Arrhythmias</a>'
    },
    
    // --- 4. Hypertension (High Blood Pressure) ---
    {
        icon: '📈',
        question: 'What is hypertension?',
        answer: 'Hypertension is when blood pressure consistently measures 130/80 mmHg or higher. It\'s the "silent killer" as it often has no symptoms.',
        citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Hypertension</a>'
    },
    {
        icon: '🩺',
        question: 'How is hypertension diagnosed?',
        answer: 'Diagnosis requires multiple blood pressure readings over time using a sphygmomanometer or home BP monitor.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/diagnosis-treatment/drc-20350620" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. BP Diagnosis</a>'
    },
    {
        icon: '💊',
        question: 'What are treatment options for hypertension?',
        answer: 'Lifestyle changes (diet, exercise, weight loss, stress reduction) and medications like ACE inhibitors, beta-blockers, and diuretics manage blood pressure.',
        citation: '<a href="https://www.cdc.gov/bloodpressure/manage_blood_pressure.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Managing Blood Pressure</a>'
    },
    
    // --- 5. Coronary Artery Disease & Angina ---
    {
        icon: '🏥',
        question: 'What is coronary artery disease (CAD)?',
        answer: 'CAD occurs when plaque builds up in arteries supplying the heart, reducing blood flow and increasing heart attack risk.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/coronary-artery-disease/symptoms-causes/syc-20350619" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. CAD</a>'
    },
    {
        icon: '⚡',
        question: 'What is angina?',
        answer: 'Angina is chest pain or discomfort from reduced blood flow to the heart. Stable angina occurs with exertion; unstable angina occurs at rest.',
        citation: '<a href="https://www.cdc.gov/heartdisease/angina.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Angina</a>'
    },
    {
        icon: '🩹',
        question: 'How is CAD treated?',
        answer: 'Treatment includes lifestyle changes, medications (aspirin, statins, beta-blockers), angioplasty, stent placement, or bypass surgery.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/coronary-artery-disease/diagnosis-treatment/drc-20350619" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. CAD Treatment</a>'
    },
    
    // --- 6. Heart Attack (Myocardial Infarction) ---
    {
        icon: '🚑',
        question: 'What is a heart attack?',
        answer: 'A heart attack occurs when blood clots block coronary arteries, stopping blood flow to heart muscle and causing damage or death.',
        citation: '<a href="https://www.cdc.gov/heartdisease/heart_attack.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Heart Attack</a>'
    },
    {
        icon: '⏰',
        question: 'What should I do in a heart attack emergency?',
        answer: 'Call emergency services immediately. If you have aspirin, chew it. Perform CPR if trained. Minutes matter for survival and recovery.',
        citation: '<a href="https://www.mayo clinic.org/diseases-conditions/heart-attack/first-aid/faq-20058436" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Heart Attack First Aid</a>'
    },
    {
        icon: '💔',
        question: 'What is recovery like after a heart attack?',
        answer: 'Recovery involves hospitalization, medications, cardiac rehabilitation (exercise and counseling), lifestyle changes, and regular follow-ups over weeks to months.',
        citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Heart Attack Recovery</a>'
    },
    
    // --- 7. Arrhythmias (Irregular Heartbeat) ---
    {
        icon: '💓',
        question: 'What is atrial fibrillation (AFib)?',
        answer: 'AFib is rapid, irregular heartbeat originating in the atria. It increases stroke and heart failure risk and requires treatment.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/atrial-fibrillation/symptoms-causes/syc-20350624" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Atrial Fibrillation</a>'
    },
    {
        icon: '⚙️',
        question: 'What is a pacemaker?',
        answer: 'A pacemaker is a small device implanted to regulate heart rhythm by sending electrical pulses to maintain normal heartbeat.',
        citation: '<a href="https://www.cdc.gov/heartdisease/pacemaker.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Pacemakers</a>'
    },
    {
        icon: '🔌',
        question: 'What is an ICD (Implantable Cardioverter Defibrillator)?',
        answer: 'An ICD monitors heart rhythm and delivers electrical shocks to correct dangerous arrhythmias and prevent sudden cardiac death.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/arrhythmia/diagnosis-treatment/drc-20350625" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. ICD</a>'
    },
    
    // --- 8. Stroke ---
    {
        icon: '🧠',
        question: 'What is the difference between ischemic and hemorrhagic stroke?',
        answer: 'Ischemic stroke (80%) results from blood clots blocking arteries. Hemorrhagic stroke (20%) occurs when vessels rupture and bleed into the brain.',
        citation: '<a href="https://www.cdc.gov/stroke/types_of_stroke.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Types of Stroke</a>'
    },
    {
        icon: '⏱️',
        question: 'Why is time critical in stroke treatment?',
        answer: 'Thrombolytic therapy ("clot-busting" drugs) works best within 3-4.5 hours. Rapid treatment minimizes brain damage and improves outcomes.',
        citation: '<a href="https://www.cdc.gov/stroke/treatment.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Stroke Treatment</a>'
    },
    {
        icon: '🏃',
        question: 'What is stroke rehabilitation?',
        answer: 'Rehabilitation includes physical therapy, occupational therapy, speech therapy, and psychological support to regain function post-stroke.',
        citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Stroke Rehab</a>'
    },
    
    // --- 9. Heart Failure ---
    {
        icon: '😩',
        question: 'What is the difference between systolic and diastolic heart failure?',
        answer: 'Systolic: heart weakens and can\'t pump effectively. Diastolic: heart stiffens and can\'t relax/fill properly. Both reduce blood flow.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/heart-failure/symptoms-causes/syc-20373142" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Heart Failure Types</a>'
    },
    {
        icon: '💧',
        question: 'Why does heart failure cause swelling?',
        answer: 'The weakened heart can\'t pump blood efficiently, causing fluid buildup in legs, ankles, lungs, and other tissues (edema/congestion).',
        citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Heart Failure Edema</a>'
    },
    {
        icon: '🍽️',
        question: 'What dietary restrictions are needed for heart failure?',
        answer: 'Limit sodium to <2,000 mg/day, reduce fluid intake as directed, avoid alcohol, and follow a heart-healthy diet rich in fruits/vegetables.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/heart-failure/diagnosis-treatment/drc-20373142" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Heart Failure Diet</a>'
    },
    
    // --- 10. Cholesterol ---
    {
        icon: '🧴',
        question: 'What is cholesterol and why does it matter?',
        answer: 'Cholesterol is a lipid needed for body functions, but excess LDL ("bad") cholesterol builds up in arteries, increasing heart disease risk.',
        citation: '<a href="https://www.cdc.gov/cholesterol/facts.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Cholesterol Facts</a>'
    },
    {
        icon: '🩸',
        question: 'What do lipid panel results mean?',
        answer: 'Total cholesterol <200 is desirable. LDL <100, HDL >40 (men) or >50 (women), triglycerides <150 are healthy ranges.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/high-cholesterol/diagnosis-treatment/drc-20350800" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Lipid Panel</a>'
    },
    {
        icon: '💊',
        question: 'How do statins work?',
        answer: 'Statins reduce cholesterol production in the liver and lower LDL levels, reducing plaque buildup and heart disease risk.',
        citation: '<a href="https://www.cdc.gov/cholesterol/cholesterol_management.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Statin Treatment</a>'
    },
    
    // --- 11. Diabetes & Heart Health ---
    {
        icon: '🍬',
        question: 'How does diabetes increase heart disease risk?',
        answer: 'Diabetes damages blood vessels, increases blood pressure and cholesterol, promotes atherosclerosis, and increases inflammation.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/diabetes/in-depth/diabetes-and-heart-disease/art-20047702" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Diabetes & Heart Disease</a>'
    },
    {
        icon: '🩺',
        question: 'What cardiovascular screening should diabetics get?',
        answer: 'Regular blood pressure monitoring, lipid panels, ECGs, and stress tests help detect heart disease early in diabetics.',
        citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Diabetes Screening</a>'
    },
    
    // --- 12. Lifestyle Prevention ---
    {
        icon: '🏃‍♂️',
        question: 'How much exercise prevents heart disease?',
        answer: 'At least 150 minutes/week of moderate aerobic activity or 75 minutes/week of vigorous activity reduces heart disease risk significantly.',
        citation: '<a href="https://www.cdc.gov/physicalactivity/basics/index.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Physical Activity Guidelines</a>'
    },
    {
        icon: '🥗',
        question: 'What is the best diet for heart health?',
        answer: 'Mediterranean and DASH diets rich in fruits, vegetables, whole grains, fish, nuts, and healthy oils reduce heart disease risk.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/heart-disease/in-depth/heart-disease-prevention/art-20046502" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Heart-Healthy Diet</a>'
    },
    {
        icon: '😴',
        question: 'How does sleep affect heart health?',
        answer: 'Poor sleep (less than 6-8 hours) increases blood pressure, inflammation, and heart disease risk. Prioritize quality sleep.',
        citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Sleep & Heart Health</a>'
    },
    
    // --- 13. Screening & Early Detection ---
    {
        icon: '🔍',
        question: 'What screening tests detect heart disease early?',
        answer: 'Blood pressure checks, lipid panels, ECG, stress tests, echocardiograms, and CT scans help diagnose heart disease.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/heart-disease/diagnosis-treatment/drc-20350619" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Heart Disease Screening</a>'
    },
    {
        icon: '❌',
        question: 'Who should get cardiovascular screening?',
        answer: 'Men >40 and women >50 with risk factors should get regular screening. Discuss with your doctor based on family history and risk.',
        citation: '<a href="https://www.cdc.gov/heartdisease/prevention.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Heart Disease Prevention</a>'
    },
    
    // --- 14. Women & Heart Health ---
    {
        icon: '👩',
        question: 'Are heart disease symptoms different in women?',
        answer: 'Women may experience atypical symptoms: fatigue, shortness of breath, nausea, and jaw pain—not just chest pain. Recognize and act on ALL warning signs.',
        citation: '<a href="https://www.cdc.gov/heartdisease/women.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Women & Heart Disease</a>'
    },
    {
        icon: '🤰',
        question: 'Can pregnancy increase heart disease risk?',
        answer: 'Pregnancy-related conditions like preeclampsia and gestational diabetes increase future heart disease risk in women.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/preeclampsia/symptoms-causes/syc-20355745" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Pregnancy & Heart Health</a>'
    },
    {
        icon: '💊',
        question: 'Does hormone replacement therapy affect heart disease risk?',
        answer: 'HRT may increase clot risk slightly. Discuss benefits/risks with your doctor individually.',
        citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. HRT & Heart</a>'
    },
    
    // --- 15. Medications ---
    {
        icon: '💊',
        question: 'What is aspirin therapy?',
        answer: 'Low-dose aspirin (81 mg) reduces clotting for secondary prevention. Discuss if appropriate for you with your doctor.',
        citation: '<a href="https://www.cdc.gov/heartdisease/aspirin_awareness.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Aspirin Therapy</a>'
    },
    {
        icon: '⚕️',
        question: 'What are ACE inhibitors and how do they work?',
        answer: 'ACE inhibitors lower blood pressure and reduce strain on the heart by relaxing blood vessels.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/in-depth/ace-inhibitors/art-20047480" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. ACE Inhibitors</a>'
    },
    {
        icon: '🫀',
        question: 'What do beta-blockers do for the heart?',
        answer: 'Beta-blockers slow heart rate, reduce blood pressure, and decrease heart workload, protecting against damage.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/in-depth/beta-blockers/art-20044522" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Beta-Blockers</a>'
    },
    
    // --- 16. Procedures & Interventions ---
    {
        icon: '🏥',
        question: 'What is cardiac catheterization?',
        answer: 'A thin tube is inserted through blood vessels to the heart for diagnostic imaging or therapeutic interventions (angioplasty, stent placement).',
        citation: '<a href="https://www.mayoclinic.org/tests-procedures/cardiac-catheterization/about/pac-20084868" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Cardiac Catheterization</a>'
    },
    {
        icon: '🫀',
        question: 'What is angioplasty and stent placement?',
        answer: 'Angioplasty widens narrowed arteries; a stent keeps the artery open to restore blood flow.',
        citation: '<a href="https://www.mayoclinic.org/tests-procedures/angioplasty/about/pac-20084710" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Angioplasty & Stent</a>'
    },
    {
        icon: '🏥',
        question: 'What is bypass surgery (CABG)?',
        answer: 'Coronary Artery Bypass Grafting uses vessels to reroute blood around blocked arteries, restoring heart blood flow.',
        citation: '<a href="https://www.mayoclinic.org/tests-procedures/coronary-artery-bypass-graft/about/pac-20084748" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. CABG Surgery</a>'
    },
    
    // --- 17. Stress & Mental Health ---
    {
        icon: '😰',
        question: 'Does stress cause heart disease?',
        answer: 'Chronic stress raises blood pressure, inflammation, and cortisol, increasing heart disease risk. Manage stress through exercise, meditation, counseling.',
        citation: '<a href="https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/stress/art-20046037" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Stress & Heart</a>'
    },
    {
        icon: '😢',
        question: 'Is depression linked to heart disease?',
        answer: 'Depression after heart events is common and increases risk of complications. Seek counseling or medication support.',
        citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Depression & Heart</a>'
    },
    
    // --- 18. Pediatric Cardiac Issues ---
    {
        icon: '👶',
        question: 'What are congenital heart defects?',
        answer: 'Congenital defects are structural heart problems present from birth, ranging from minor (patent foramen ovale) to severe (tetralogy of Fallot).',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/congenital-heart-disease/symptoms-causes/syc-20350619" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Congenital Heart Defects</a>'
    },
    {
        icon: '🧒',
        question: 'Can children have high blood pressure?',
        answer: 'Yes, pediatric hypertension is increasing due to obesity. Regular BP screening helps detect early hypertension in kids.',
        citation: '<a href="https://www.cdc.gov/bloodpressure/children.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Children & Blood Pressure</a>'
    },
    
    // --- 19. Myths & Facts ---
    {
        icon: '❌',
        question: 'Is all cholesterol bad for you?',
        answer: 'No. HDL ("good" cholesterol) is protective. LDL ("bad" cholesterol) raises disease risk. You need HDL.',
        citation: '<a href="https://www.cdc.gov/cholesterol/myths_facts.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Cholesterol Myths</a>'
    },
    {
        icon: '❓',
        question: 'Can young people get heart disease?',
        answer: 'Yes. Heart disease can develop at any age, especially with risk factors like smoking, obesity, or family history.',
        citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Young & Heart Disease</a>'
    },
    {
        icon: '💪',
        question: 'Does exercise increase heart attack risk?',
        answer: 'Regular exercise reduces risk. Excessive strenuous exercise in unfit individuals may briefly increase risk; gradual buildup is safer.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/heart-disease/in-depth/heart-disease-prevention/art-20046502" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Exercise & Heart</a>'
    },
    
    // --- 20. Recovery & Survivorship ---
    {
        icon: '🌱',
        question: 'What is cardiac rehabilitation?',
        answer: 'Cardiac rehab includes supervised exercise, education on heart disease, counseling, and medication management post-event for recovery.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/heart-disease/in-depth/cardiac-rehab/art-20046357" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Cardiac Rehab</a>'
    },
    {
        icon: '✈️',
        question: 'When can I return to work after a heart attack?',
        answer: 'Most people can resume light work in 2-4 weeks, with gradual return to normal. Discuss timeline with your cardiologist.',
        citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Recovery Timeline</a>'
    },
    {
        icon: '❤️',
        question: 'Is it safe to have sexual relations after a heart event?',
        answer: 'Most can safely resume sexual activity 3-4 weeks post-event after doctor clearance. Gradual return and communication are important.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/heart-disease/in-depth/sex-and-heart-disease/art-20047683" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Sex & Heart Health</a>'
    }
];

// ========================================================================
// NEW DATA STRUCTURES FOR EMPTY SECTIONS
// ========================================================================

const whenToSeeData = [

 // --- 1. Hypertension (High Blood Pressure) ---
    {
        icon: '📈',
        question: 'Blood Pressure Readings Consistently Above 130/80 mmHg',
        answer: 'See a cardiologist if:<br>• Multiple readings show high BP<br>• Home BP monitor shows sustained elevation<br>• You experience headaches, shortness of breath, or chest pain<br><br>Early management prevents heart attack and stroke.',
        citation: 'CDC. High Blood Pressure Management. 2025.'
    },
    {
        icon: '💊',
        question: 'Blood Pressure Not Controlled on Current Medications',
        answer: 'Resistant hypertension requires specialist evaluation. A cardiologist may adjust medications or investigate secondary causes.',
        citation: 'American Heart Association (AHA). Resistant Hypertension. 2024.'
    },

    // --- 2. Chest Pain & Angina ---
    {
        icon: '⚡',
        question: 'Chest Pain, Pressure, or Discomfort (Especially with Exertion)',
        answer: 'Seek IMMEDIATE CARE if you have:<br>• Chest pain or pressure radiating to arm/jaw<br>• Shortness of breath<br>• Nausea or sweating<br><br>Call 911 if severe. Stable chest pain still warrants urgent cardiologist evaluation.',
        citation: 'Mayo Clinic. Chest Pain Evaluation. 2024.'
    },
    {
        icon: '😰',
        question: 'Angina at Rest or Worsening Angina (Unstable)',
        answer: 'Unstable angina is a medical emergency. Go to ER immediately or call 911.',
        citation: 'American Heart Association. Unstable Angina. 2025.'
    },

    // --- 3. Heart Attack (Acute Myocardial Infarction) ---
    {
        icon: '🚑',
        question: 'Signs of Heart Attack: Severe Chest Pain, Shortness of Breath, Arm/Jaw Pain',
        answer: 'CALL 911 IMMEDIATELY if you have:<br>• Severe chest pain or pressure<br>• Pain in arms, neck, jaw, or back<br>• Shortness of breath<br>• Nausea, sweating, dizziness<br><br>Minutes matter. Do not drive yourself.',
        citation: 'CDC. Heart Attack Symptoms. 2025.'
    },

    // --- 4. Arrhythmias (Irregular Heartbeat) ---
    {
        icon: '💓',
        question: 'Heart Palpitations, Rapid Heartbeat, or Skipping Beats',
        answer: 'See a cardiologist for:<br>• Persistent palpitations<br>• Heart rate >100 bpm at rest<br>• Feeling faint or dizzy with palpitations<br>• Waking up with rapid heartbeat<br><br>These may indicate arrhythmia needing evaluation.',
        citation: 'Mayo Clinic. Heart Palpitations. 2024.'
    },
    {
        icon: '⏱️',
        question: 'Atrial Fibrillation (AFib) Diagnosis or Symptoms',
        answer: 'If diagnosed with AFib, see a cardiologist for medication management and stroke prevention strategies.',
        citation: 'AHA. Atrial Fibrillation Management. 2024.'
    },
    {
        icon: '😵',
        question: 'Syncope (Fainting) Episodes, Especially with Exertion',
        answer: 'Fainting during exercise or exertion may indicate dangerous arrhythmia. Get immediate cardiologist evaluation.',
        citation: 'American Heart Association. Syncope Evaluation. 2025.'
    },

    // --- 5. Heart Failure ---
    {
        icon: '😩',
        question: 'Shortness of Breath at Rest or with Minimal Activity',
        answer: 'Dyspnea (shortness of breath) may indicate heart failure. See a cardiologist if:<br>• Difficulty breathing worsens over weeks<br>• Shortness of breath when lying flat<br>• Waking at night gasping for breath',
        citation: 'Mayo Clinic. Heart Failure Symptoms. 2024.'
    },
    {
        icon: '💧',
        question: 'Swelling in Legs, Ankles, Feet, or Abdomen (Edema)',
        answer: 'Fluid retention suggests possible heart failure. See a cardiologist to determine cause and start appropriate therapy.',
        citation: 'AHA. Heart Failure Signs. 2025.'
    },
    {
        icon: '😴',
        question: 'Extreme Fatigue, Weakness, or Exercise Intolerance',
        answer: 'Unexplained fatigue and inability to exercise as before may indicate reduced cardiac output. Get cardiologist evaluation.',
        citation: 'Mayo Clinic. Fatigue and Heart Disease. 2024.'
    },
    {
        icon: '🔄',
        question: 'Rapid or Irregular Heartbeat + Difficulty Breathing',
        answer: 'This combination warrants urgent cardiologist or ER evaluation for possible acute decompensation.',
        citation: 'AHA. Acute Heart Failure. 2024.'
    },

    // --- 6. Coronary Artery Disease (CAD) ---
    {
        icon: '🏥',
        question: 'History of Myocardial Infarction (Heart Attack)',
        answer: 'Post-heart attack, regular cardiology follow-ups are essential for medication adjustment, rehabilitation, and secondary prevention.',
        citation: 'Mayo Clinic. Post-MI Care. 2025.'
    },
    {
        icon: '🔍',
        question: 'Abnormal ECG or Stress Test Results',
        answer: 'If your EKG shows signs of ischemia or your stress test is positive, see a cardiologist for further evaluation and possible angiography.',
        citation: 'American Heart Association. Diagnostic Tests. 2024.'
    },

    // --- 7. Stroke & Cerebrovascular Disease ---
    {
        icon: '🧠',
        question: 'TIA (Transient Ischemic Attack) or Stroke Symptoms (FAST)',
        answer: 'CALL 911 immediately if you notice:<br>• Face drooping<br>• Arm weakness<br>• Speech difficulty<br>• Time to call emergency<br><br>Cardiology and neurology may both be involved in post-stroke care.',
        citation: 'CDC. Stroke Symptoms (FAST). 2025.'
    },
    {
        icon: '⏰',
        question: 'History of Stroke or TIA',
        answer: 'Regular cardiology follow-up is critical for secondary stroke prevention and managing atrial fibrillation or other cardiac risk factors.',
        citation: 'American Heart Association. Stroke Prevention. 2024.'
    },

    // --- 8. Hypertrophic Cardiomyopathy (HCM) & Genetic Conditions ---
    {
        icon: '🧬',
        question: 'Family History of Sudden Cardiac Death or Young Cardiomyopathy',
        answer: 'Genetic cardiac conditions like HCM require specialist evaluation, genetic testing, and family screening.',
        citation: 'AHA. Hypertrophic Cardiomyopathy. 2024.'
    },
    {
        icon: '⚠️',
        question: 'Syncope with Family History of Cardiac Disease',
        answer: 'Fainting in young athletes or those with family history of sudden death warrants urgent cardiologist evaluation for HCM or other inherited conditions.',
        citation: 'Mayo Clinic. Inherited Cardiac Conditions. 2025.'
    },

    // --- 9. Valve Disease ---
    {
        icon: '🎵',
        question: 'Heart Murmur Detected on Examination',
        answer: 'A new murmur or known murmur with symptoms requires cardiology evaluation. Echocardiography helps assess valve function.',
        citation: 'AHA. Heart Murmurs. 2024.'
    },
    {
        icon: '🏥',
        question: 'Mitral Valve Prolapse or Other Valve Abnormality',
        answer: 'Periodic cardiologist follow-ups monitor for complications. Most MVP is benign, but some cases need intervention.',
        citation: 'Mayo Clinic. Mitral Valve Prolapse. 2024.'
    },

    // --- 10. Peripheral Arterial Disease (PAD) ---
    {
        icon: '🚶',
        question: 'Leg Pain with Walking (Claudication) That Improves at Rest',
        answer: 'Intermittent claudication suggests PAD. See a cardiologist or vascular specialist for imaging and risk factor management.',
        citation: 'American Heart Association. Peripheral Artery Disease. 2024.'
    },
    {
        icon: '🦵',
        question: 'Non-Healing Wound or Sore on Legs/Feet',
        answer: 'Slow-healing wounds in those with diabetes or PAD risk factors need urgent vascular assessment.',
        citation: 'Mayo Clinic. Peripheral Artery Disease. 2024.'
    },

    // --- 11. Aortic Aneurysm & Dissection ---
    {
        icon: '🔴',
        question: 'Sudden Severe Back or Chest Pain (Aortic Dissection)',
        answer: 'CALL 911 immediately. Aortic dissection is life-threatening and requires emergency surgery.',
        citation: 'Mayo Clinic. Aortic Dissection. 2025.'
    },
    {
        icon: '📏',
        question: 'Known Aortic Aneurysm or Family History',
        answer: 'Regular imaging and cardiologist follow-up monitor aneurysm size. Preventive surgery may be needed if >5.5 cm.',
        citation: 'AHA. Aortic Aneurysm. 2024.'
    },

    // --- 12. Myocarditis & Pericarditis ---
    {
        icon: '🔥',
        question: 'Chest Pain Worse with Breathing or Lying Flat (Pericarditis)',
        answer: 'Sharp chest pain that worsens with deep breathing may indicate pericarditis. Get cardiologist evaluation and imaging.',
        citation: 'Mayo Clinic. Pericarditis. 2024.'
    },
    {
        icon: '🤒',
        question: 'Chest Pain + Recent Viral Illness (Myocarditis)',
        answer: 'Viral myocarditis can mimic heart attack. Urgent cardiology evaluation with ECG and troponin levels is essential.',
        citation: 'American Heart Association. Myocarditis. 2024.'
    },

    // --- 13. Pulmonary Hypertension & PE ---
    {
        icon: '💨',
        question: 'Shortness of Breath + Chest Pain + Leg Swelling (DVT/PE)',
        answer: 'Signs of pulmonary embolism warrant IMMEDIATE ER visit. Call 911 for severe cases.',
        citation: 'CDC. Pulmonary Embolism. 2025.'
    },
    {
        icon: '🫁',
        question: 'Persistent Dyspnea Out of Proportion to Exertion',
        answer: 'Pulmonary hypertension can cause severe dyspnea. Cardiologist evaluation with echocardiography is necessary.',
        citation: 'Mayo Clinic. Pulmonary Hypertension. 2024.'
    },

    // --- 14. Endocarditis (Heart Infection) ---
    {
        icon: '🦠',
        question: 'Fever + New Heart Murmur + General Malaise',
        answer: 'Infective endocarditis is life-threatening. Seek urgent medical evaluation for blood cultures and echo.',
        citation: 'Mayo Clinic. Endocarditis. 2025.'
    },

    // --- 15. Atrial Flutter ---
    {
        icon: '💗',
        question: 'Rapid Regular Heartbeat (Atrial Flutter)',
        answer: 'Flutter may be asymptomatic but requires treatment to prevent AFib progression and stroke risk.',
        citation: 'AHA. Atrial Flutter. 2024.'
    },

    // --- 16. Post-Procedural or Post-Surgical Follow-up ---
    {
        icon: '📋',
        question: 'Recent Cardiac Stent, Bypass, or Device Implantation',
        answer: 'Strict follow-up appointments monitor graft patency, device function, and medication management.',
        citation: 'American Heart Association. Post-Procedure Care. 2024.'
    },

    // --- 17. Preventive Screening & Risk Assessment ---
    {
        icon: '🔍',
        question: 'Family History of Early Heart Disease or Risk Factors',
        answer: 'Those with multiple risk factors (smoking, hypertension, obesity, diabetes, family history) should see a cardiologist for risk assessment and preventive strategies.',
        citation: 'Mayo Clinic. Cardiac Risk Assessment. 2024.'
    },
    {
        icon: '⚕️',
        question: 'High Cholesterol or Abnormal Lipid Panel',
        answer: 'Elevated LDL or low HDL increases CAD risk. Cardiologist can prescribe statins and recommend lifestyle changes.',
        citation: 'American Heart Association. Cholesterol Management. 2024.'
    },
    {
        icon: '🩺',
        question: 'Diabetes + No Recent Cardiac Screening',
        answer: 'Diabetics should have regular ECG, stress testing, and lipid screening. See a cardiologist if any risk factors present.',
        citation: 'AHA. Diabetes and Heart Disease. 2024.'
    },

    // --- 18. Women-Specific Symptoms ---
    {
        icon: '👩',
        question: 'Atypical Angina in Women: Fatigue, Jaw Pain, Nausea',
        answer: 'Women often have different heart attack symptoms. Seek cardiologist evaluation for any of:<br>• Unusual fatigue<br>• Jaw or neck pain<br>• Nausea without chest pain',
        citation: 'CDC. Women and Heart Disease. 2025.'
    },
    {
        icon: '🤰',
        question: 'Postpartum Cardiomyopathy (Peripartum)',
        answer: 'New dyspnea or heart failure symptoms after pregnancy warrant urgent cardiology evaluation.',
        citation: 'Mayo Clinic. Peripartum Cardiomyopathy. 2024.'
    },

    // --- 19. Athletic/Exercise-Related Issues ---
    {
        icon: '🏃‍♂️',
        question: 'Chest Pain or Syncope During or After Exercise',
        answer: 'Young athletes with exercise-induced symptoms need urgent pre-participation cardiac screening (ECG, echo).',
        citation: 'American Heart Association. Sudden Cardiac Death in Athletes. 2024.'
    },
    {
        icon: '⚽',
        question: 'Desire to Return to Sports After Cardiac Event',
        answer: 'Cardiologist clearance and stress testing are needed before returning to competitive athletics.',
        citation: 'AHA. Exercise After Cardiac Events. 2024.'
    },

    // --- 20. Medication & Interaction Issues ---
    {
        icon: '💊',
        question: 'Starting New Medications (Especially Decongestants, NSAIDs, Stimulants)',
        answer: 'Some medications worsen heart conditions. Consult cardiologist before starting new drugs.',
        citation: 'Mayo Clinic. Medications and Heart Health. 2024.'
    },

    // --- 21. Age & Routine Screening ---
    {
        icon: '👴',
        question: 'Age >40 with Multiple Risk Factors',
        answer: 'Baseline ECG and risk assessment recommended for middle-aged and older individuals with smoking, hypertension, obesity, or diabetes.',
        citation: 'American Heart Association. Preventive Screening. 2024.'
    },

    // --- 22. Obesity & Metabolic Syndrome ---
    {
        icon: '⚖️',
        question: 'Obesity + Hypertension + Diabetes (Metabolic Syndrome)',
        answer: 'This combination greatly increases CAD risk. Cardiologist input on comprehensive risk reduction is essential.',
        citation: 'AHA. Metabolic Syndrome. 2024.'
    },

    // --- 23. Sleep Apnea & Cardiovascular Issues ---
    {
        icon: '😴',
        question: 'Diagnosed Sleep Apnea + Cardiovascular Symptoms',
        answer: 'Untreated sleep apnea worsens hypertension and arrhythmia risk. CPAP and cardiologist follow-up are recommended.',
        citation: 'Mayo Clinic. Sleep Apnea and Heart Disease. 2024.'
    },

    // --- 24. Sudden Cardiac Death Risk ---
    {
        icon: '🚨',
        question: 'Family History of Sudden Cardiac Death in Young People',
        answer: 'This suggests inherited arrhythmia syndrome (Long QT, Brugada, CPVT). Genetic testing and specialist evaluation essential.',
        citation: 'American Heart Association. Inherited Arrhythmias. 2024.'
    },

    // --- 25. Viral Illness Recovery ---
    {
        icon: '🦠',
        question: 'Prolonged Fatigue or Chest Symptoms After COVID-19 or Viral Illness',
        answer: 'Post-viral cardiomyopathy or myocarditis is possible. Cardiologist evaluation with troponin and echo is warranted.',
        citation: 'Mayo Clinic. Post-COVID Cardiac Complications. 2024.'
    },

    // --- 1. Lipid & Metabolic Issues ---
    {
        icon: '🧴',
        question: 'Triglycerides Consistently >150 mg/dL Despite Diet',
        answer: 'Elevated triglycerides increase CAD risk. Cardiologist may recommend fibrates or other medications alongside lifestyle changes.',
        citation: 'American Heart Association. Triglyceride Guidelines. 2024.'
    },
    {
        icon: '🔬',
        question: 'Low HDL Cholesterol (<40 mg/dL in Men, <50 in Women)',
        answer: 'Low "good" cholesterol is an independent risk factor. See a cardiologist for optimization strategies.',
        citation: 'Mayo Clinic. HDL Cholesterol. 2024.'
    },
    {
        icon: '🧪',
        question: 'Lipoprotein(a) or Lp(a) Elevation',
        answer: 'High Lp(a) is a genetic risk factor for early CAD. Specialist evaluation may guide aggressive treatment.',
        citation: 'AHA. Lipoprotein(a). 2024.'
    },

    // --- 2. Metabolic/Endocrine Issues ---
    {
        icon: '🦋',
        question: 'Hypothyroidism or Hyperthyroidism Affecting BP/Heart Rate',
        answer: 'Thyroid disorders worsen hypertension and arrhythmias. Cardiologist helps coordinate care with endocrinologist.',
        citation: 'Mayo Clinic. Thyroid and Heart. 2024.'
    },
    {
        icon: '🍬',
        question: 'Type 2 Diabetes Newly Diagnosed or Poorly Controlled (A1C >8%)',
        answer: 'Diabetics have high CAD risk. Cardiologist input on cardio-metabolic syndrome and prevention is crucial.',
        citation: 'AHA. Diabetes and Heart Disease. 2024.'
    },
    {
        icon: '🫀',
        question: 'PCOS (Polycystic Ovary Syndrome) with Hypertension',
        answer: 'PCOS increases cardiovascular risk in women. Cardiologist may screen for subclinical atherosclerosis.',
        citation: 'Mayo Clinic. PCOS and Cardiovascular Health. 2024.'
    },

    // --- 3. Inflammatory & Autoimmune Conditions ---
    {
        icon: '🦠',
        question: 'Rheumatoid Arthritis, Lupus, or Other Autoimmune Disease',
        answer: 'These conditions accelerate atherosclerosis and increase MI risk. Cardiology screening is recommended.',
        citation: 'American Heart Association. Autoimmune Disease and Heart. 2024.'
    },
    {
        icon: '🌡️',
        question: 'Chronic Inflammatory Markers Elevated (CRP, ESR)',
        answer: 'Systemic inflammation increases CAD risk even with normal lipids. Discuss with cardiologist.',
        citation: 'Mayo Clinic. Inflammation and Heart Disease. 2024.'
    },
    {
        icon: '⚠️',
        question: 'Psoriasis with Cardiovascular Risk Factors',
        answer: 'Moderate-severe psoriasis increases MI risk. Cardiologist evaluation alongside dermatology is prudent.',
        citation: 'AHA. Psoriasis and Cardiovascular Disease. 2024.'
    },

    // --- 4. Medication & Drug-Related Issues ---
    {
        icon: '💊',
        question: 'Side Effects from Cancer Chemotherapy (Cardiotoxicity)',
        answer: 'Certain chemo drugs (anthracyclines, HER2 inhibitors) damage the heart. Regular cardiology monitoring is essential.',
        citation: 'Mayo Clinic. Cardiotoxicity. 2024.'
    },
    {
        icon: '🚫',
        question: 'Adverse Drug Reaction or Allergy to Beta-Blockers/ACE Inhibitors',
        answer: 'Cardiologist can identify alternative agents for hypertension or heart failure.',
        citation: 'American Heart Association. Cardiac Drug Allergies. 2024.'
    },
    {
        icon: '💉',
        question: 'Starting Hormone Replacement Therapy (HRT) & Cardiovascular Risk',
        answer: 'HRT can affect clotting and BP. Discuss with cardiologist if you have existing CVD risk.',
        citation: 'Mayo Clinic. HRT and Cardiovascular Risk. 2024.'
    },

    // --- 5. Rhythm & Conduction Issues ---
    {
        icon: '⏱️',
        question: 'Bradycardia (Heart Rate <60 bpm at Rest) with Symptoms',
        answer: 'Symptomatic bradycardia may indicate sick sinus syndrome or heart block requiring pacemaker.',
        citation: 'AHA. Bradycardia Evaluation. 2024.'
    },
    {
        icon: '📊',
        question: 'Multiple Premature Ventricular Contractions (PVCs) on Holter Monitor',
        answer: 'Frequent PVCs may warrant further investigation for underlying CAD or channelopathy.',
        citation: 'Mayo Clinic. Premature Ventricular Contractions. 2024.'
    },
    {
        icon: '🔄',
        question: 'Supraventricular Tachycardia (SVT) Episodes',
        answer: 'SVT recurrence may need ablation or medication adjustments evaluated by electrophysiologist.',
        citation: 'American Heart Association. SVT Management. 2024.'
    },

    // --- 6. Vascular & Structural Issues ---
    {
        icon: '💫',
        question: 'Claudication Progressing or Worsening Despite Exercise',
        answer: 'Worsening PAD may require vascular imaging and intervention. Cardiology involvement helps optimize medical therapy.',
        citation: 'Mayo Clinic. Peripheral Artery Disease Progression. 2024.'
    },
    {
        icon: '🩸',
        question: 'Deep Vein Thrombosis (DVT) or Prior Pulmonary Embolism',
        answer: 'History of venous thromboembolism requires long-term anticoagulation and cardiologist oversight.',
        citation: 'AHA. VTE and Cardiology. 2024.'
    },
    {
        icon: '🫀',
        question: 'Bicuspid Aortic Valve or Other Congenital Cardiac Defect',
        answer: 'Congenital defects require lifelong follow-up to monitor for complications and activity restrictions.',
        citation: 'Mayo Clinic. Bicuspid Aortic Valve. 2024.'
    },

    // --- 7. Pregnancy-Related Cardiac Issues ---
    {
        icon: '🤰',
        question: 'Preeclampsia or Gestational Hypertension in Pregnancy',
        answer: 'These conditions increase long-term cardiac risk. Postpartum cardiologist assessment is recommended.',
        citation: 'American Heart Association. Preeclampsia and Cardiovascular Risk. 2024.'
    },
    {
        icon: '👶',
        question: 'Pregnancy Planning with Known Cardiac Disease',
        answer: 'Pre-conception cardiology consultation helps assess safety and risks of pregnancy.',
        citation: 'Mayo Clinic. Pregnancy and Cardiac Disease. 2024.'
    },

    // --- 8. Athletic & Performance Issues ---
    {
        icon: '⚽',
        question: 'Athlete with Reduced Exercise Capacity or Fatigue',
        answer: 'Declining athletic performance may indicate underlying myocarditis or structural heart disease.',
        citation: 'AHA. Athlete Cardiac Screening. 2024.'
    },
    {
        icon: '🏋️',
        question: 'Weightlifter or Strength Athlete with Hypertension',
        answer: 'Intense strength training can worsen HTN. Cardiologist input on safe training modifications is valuable.',
        citation: 'Mayo Clinic. Exercise and Hypertension. 2024.'
    },

    // --- 9. Age-Related Concerns ---
    {
        icon: '👴',
        question: 'Elderly (>75) with New Onset Atrial Fibrillation',
        answer: 'AFib in older adults requires careful rate/rhythm control and stroke prevention evaluation.',
        citation: 'American Heart Association. AFib in Elderly. 2024.'
    },
    {
        icon: '👵',
        question: 'Women >70 with Multiple Cardiac Risk Factors',
        answer: 'Post-menopausal women lose estrogen\'s protective effects; comprehensive risk reduction is important.',
        citation: 'AHA. Postmenopausal Women and Heart Health. 2024.'
    },

    // --- 10. Substance Use & Abuse ---
    {
        icon: '💉',
        question: 'Cocaine or Amphetamine Use (Current or Recent History)',
        answer: 'Stimulant use dramatically increases MI risk. Urgent cardiology evaluation for baseline damage assessment.',
        citation: 'Mayo Clinic. Cocaine and Heart. 2024.'
    },
    {
        icon: '🚬',
        question: 'E-Cigarette or Vaping Use with New Cardiac Symptoms',
        answer: 'Vaping damages endothelial function and increases clotting. Cardiology evaluation if symptoms present.',
        citation: 'American Heart Association. E-Cigarettes and Cardiovascular Health. 2024.'
    },

    // --- 11. Previous Cardiac Events or Procedures ---
    {
        icon: '📋',
        question: 'Post-Stent or Post-CABG with New Symptoms',
        answer: 'Recurring chest pain or dyspnea after prior intervention suggests in-stent restenosis or graft failure.',
        citation: 'Mayo Clinic. Restenosis. 2024.'
    },
    {
        icon: '⏰',
        question: 'Cardiac Event >5 Years Ago with New Symptoms',
        answer: 'New symptoms after long quiescence may indicate disease progression. Re-evaluation warranted.',
        citation: 'AHA. Recurrent Angina. 2024.'
    }
];

const preventionData = [
    // GENERAL CARDIOVASCULAR PREVENTION
    {
        icon: '🏃‍♂️',
        question: 'Regular Aerobic Exercise (150 min/week)',
        answer: 'Moderate-intensity exercise like brisk walking, cycling, or swimming for 150 minutes weekly significantly reduces heart disease risk.',
        citation: 'American Heart Association. Exercise Recommendations. 2024.'
    },
    {
        icon: '🚴',
        question: 'Strength Training 2x Per Week',
        answer: 'Adding resistance exercises improves cardiovascular fitness, strengthens heart, and lowers BP.',
        citation: 'AHA. Strength Training Benefits. 2024.'
    },
    {
        icon: '🍎',
        question: 'Mediterranean or DASH Diet',
        answer: 'Diets rich in fruits, vegetables, whole grains, legumes, fish, and healthy oils reduce heart attack and stroke risk.',
        citation: 'Mayo Clinic. Heart-Healthy Diets. 2024.'
    },
    {
        icon: '🍽️',
        question: 'Reduce Sodium Intake (<2,300 mg/day)',
        answer: 'Excess salt raises blood pressure. Limit processed foods, canned goods, and table salt.',
        citation: 'CDC. Sodium and Blood Pressure. 2025.'
    },
    {
        icon: '🥦',
        question: 'Eat More Vegetables & Fruits (5+ Servings/Day)',
        answer: 'Rich in antioxidants, fiber, and potassium; these foods lower BP and reduce inflammation.',
        citation: 'American Heart Association. Nutrition Guidelines. 2024.'
    },
    {
        icon: '🐟',
        question: 'Eat Fish (Especially Fatty Fish) 2x Per Week',
        answer: 'Salmon, mackerel, sardines rich in omega-3 fatty acids reduce triglycerides and inflammation.',
        citation: 'AHA. Omega-3 Fatty Acids. 2024.'
    },
    {
        icon: '🥜',
        question: 'Consume Nuts, Seeds, and Plant-Based Proteins',
        answer: 'Nuts (almonds, walnuts) and plant proteins improve cholesterol levels and provide heart-healthy fats.',
        citation: 'Mayo Clinic. Plant-Based Proteins. 2024.'
    },
    {
        icon: '🚭',
        question: 'Quit Smoking (Most Important Modifiable Risk Factor)',
        answer: 'Smoking damages vessels and increases clot risk. Quitting reduces heart attack risk significantly within weeks.',
        citation: 'CDC. Smoking and Heart Disease. 2025.'
    },
    {
        icon: '🍷',
        question: 'Limit Alcohol (Moderate Intake Only)',
        answer: 'Excess alcohol raises BP and triglycerides. Moderate: ≤1 drink/day for women, ≤2 for men.',
        citation: 'American Heart Association. Alcohol and Heart Health. 2024.'
    },
    {
        icon: '☕',
        question: 'Moderate Caffeine Intake',
        answer: 'Excessive caffeine can raise BP temporarily. 1-2 cups of coffee daily is generally safe.',
        citation: 'Mayo Clinic. Caffeine and Heart Health. 2024.'
    },
    {
        icon: '⚖️',
        question: 'Maintain Healthy Body Weight (BMI 18.5-24.9)',
        answer: 'Obesity increases hypertension, diabetes, and heart disease risk. Gradual weight loss reduces risk significantly.',
        citation: 'WHO. Weight and Cardiovascular Health. 2024.'
    },
    {
        icon: '😴',
        question: 'Get 7-9 Hours of Quality Sleep Nightly',
        answer: 'Poor sleep increases BP and inflammation. Consistent sleep schedule improves cardiac health.',
        citation: 'American Heart Association. Sleep and Heart Health. 2024.'
    },
    {
        icon: '🧘‍♀️',
        question: 'Manage Stress Through Relaxation Techniques',
        answer: 'Meditation, yoga, deep breathing, and tai chi reduce stress hormones and lower BP.',
        citation: 'Mayo Clinic. Stress Management. 2024.'
    },
    {
        icon: '💪',
        question: 'Maintain Healthy Blood Pressure (<120/80 mmHg)',
        answer: 'Monitor BP regularly at home and follow doctor\'s recommendations for lifestyle changes and medication.',
        citation: 'CDC. Blood Pressure Control. 2025.'
    },
    {
        icon: '🩸',
        question: 'Keep Cholesterol at Healthy Levels',
        answer: 'Total <200, LDL <100, HDL >40 (men) or >50 (women), triglycerides <150 mg/dL.',
        citation: 'American Heart Association. Cholesterol Guidelines. 2024.'
    },
    {
        icon: '🍬',
        question: 'Manage Blood Sugar (Fasting <100 mg/dL, Avoid Diabetes)',
        answer: 'Diabetes greatly increases heart disease risk. Maintain healthy glucose through diet and exercise.',
        citation: 'AHA. Diabetes and Cardiovascular Health. 2024.'
    },
    {
        icon: '💊',
        question: 'Take Prescribed Medications Consistently',
        answer: 'Antihypertensives, statins, and antiplatelet drugs reduce risk when used as directed.',
        citation: 'Mayo Clinic. Cardiac Medications. 2024.'
    },
    {
        icon: '🩺',
        question: 'Regular Health Checkups & Risk Screening',
        answer: 'Annual BP, cholesterol, and glucose screening help detect early changes.',
        citation: 'American Heart Association. Preventive Screenings. 2024.'
    },
    {
        icon: '🌞',
        question: 'Get Adequate Sunlight (Vitamin D)',
        answer: 'Vitamin D deficiency is linked to hypertension and cardiovascular disease. Aim for 10-30 min sunlight daily.',
        citation: 'Mayo Clinic. Vitamin D and Heart Health. 2024.'
    },
    {
        icon: '💧',
        question: 'Stay Hydrated (8-10 Glasses of Water Daily)',
        answer: 'Proper hydration maintains blood volume and heart function. Replace sugary drinks with water.',
        citation: 'American Heart Association. Hydration Guidelines. 2024.'
    },
    {
        icon: '🏞️',
        question: 'Avoid Air Pollution & Secondhand Smoke',
        answer: 'Pollution and secondhand smoke damage blood vessels and increase heart attack risk.',
        citation: 'WHO. Air Pollution and Cardiovascular Health. 2024.'
    },
    {
        icon: '👥',
        question: 'Maintain Social Connections & Emotional Support',
        answer: 'Strong social relationships reduce stress and improve outcomes after cardiac events.',
        citation: 'American Heart Association. Social Support. 2024.'
    },
    {
        icon: '📱',
        question: 'Limit Sedentary Time (Stand/Move Every Hour)',
        answer: 'Prolonged sitting increases clot risk and worsens lipid profiles. Break up sedentary time.',
        citation: 'Mayo Clinic. Sedentary Behavior. 2024.'
    },
    {
        icon: '🚗',
        question: 'Avoid Road Rage & Aggressive Driving',
        answer: 'Stress from aggressive driving raises BP and increases heart attack risk.',
        citation: 'American Heart Association. Stress and Heart. 2024.'
    },
    {
        icon: '💻',
        question: 'Limit Screen Time Before Bed',
        answer: 'Blue light from devices disrupts sleep, which worsens cardiovascular health. Avoid screens 1 hour before sleep.',
        citation: 'Mayo Clinic. Screen Time and Sleep. 2024.'
    },
    {
        icon: '🧂',
        question: 'Choose Low-Sodium Food Products & Cook at Home',
        answer: 'Homemade meals allow control of sodium. Read food labels and choose <400 mg Na per serving.',
        citation: 'AHA. Sodium Reduction. 2024.'
    },
    {
        icon: '🍫',
        question: 'Dark Chocolate in Moderation (1 oz, ≥70% Cocoa)',
        answer: 'Dark chocolate contains flavonoids that improve blood vessel function. Keep portion small due to calorie content.',
        citation: 'Mayo Clinic. Chocolate and Heart Health. 2024.'
    },
    {
        icon: '🥛',
        question: 'Choose Low-Fat or Fat-Free Dairy',
        answer: 'Reduces saturated fat intake while maintaining calcium for bone and cardiac health.',
        citation: 'American Heart Association. Dairy Guidelines. 2024.'
    },
    {
        icon: '🌰',
        question: 'Replace Butter with Olive Oil or Plant-Based Oils',
        answer: 'Unsaturated fats lower LDL cholesterol. Use olive oil for cooking and salads.',
        citation: 'AHA. Healthy Fats. 2024.'
    },
    {
        icon: '🏥',
        question: 'Manage Chronic Conditions (Diabetes, Thyroid Disease, etc.)',
        answer: 'Proper control of underlying conditions reduces cardiovascular complications.',
        citation: 'Mayo Clinic. Chronic Disease Management. 2024.'
    },
    {
        icon: '💍',
        question: 'For Women: Consider Aspirin If Age >55 and High Risk',
        answer: 'Discuss with cardiologist for primary prevention in select high-risk women.',
        citation: 'American Heart Association. Aspirin for Women. 2024.'
    },
    {
        icon: '👨‍⚕️',
        question: 'For Men: Discuss Aspirin for Primary Prevention (Age >40)',
        answer: 'Cardiologist may recommend low-dose aspirin for primary prevention in high-risk men.',
        citation: 'AHA. Aspirin for Men. 2024.'
    },
    {
        icon: '🧪',
        question: 'Get Baseline Lipid Panel & Metabolic Screening',
        answer: 'Establish baseline values to track changes and guide preventive interventions.',
        citation: 'Mayo Clinic. Baseline Cardiac Screening. 2024.'
    },
    {
        icon: '🔔',
        question: 'Know Your Family History & Share with Doctor',
        answer: 'Early-onset heart disease in relatives increases your risk. Inform your provider.',
        citation: 'American Heart Association. Family History. 2024.'
    },
    {
        icon: '📋',
        question: 'Develop & Follow a Personalized Cardiac Prevention Plan',
        answer: 'Work with your cardiologist to create a plan addressing your specific risk factors.',
        citation: 'Mayo Clinic. Personalized Cardiac Care. 2024.'
    },
    {
        icon: '🎯',
        question: 'Set Realistic Health Goals & Track Progress',
        answer: 'Monitor BP, weight, exercise, and diet. Celebrate milestones to stay motivated.',
        citation: 'American Heart Association. Goal Setting. 2024.'
    },
    {
        icon: '🏃‍♀️',
        question: 'Gradually Increase Exercise Intensity & Duration',
        answer: 'Start with low-intensity activity and gradually increase to reduce injury risk.',
        citation: 'Mayo Clinic. Exercise Progression. 2024.'
    },
    {
        icon: '🌍',
        question: 'Consider Environmental & Occupational Exposures',
        answer: 'Limit exposure to air pollution, secondhand smoke, and workplace hazards when possible.',
        citation: 'WHO. Environmental Cardiology. 2024.'
    },

     {
        icon: '🧅',
        question: 'Eat Garlic and Onions Regularly',
        answer: 'Sulfur compounds in garlic may help reduce BP and cholesterol slightly. Add fresh garlic to meals.',
        citation: 'Mayo Clinic. Garlic and Heart Health. 2024.'
    },
    {
        icon: '🍵',
        question: 'Drink Green Tea (2-3 Cups Daily)',
        answer: 'Green tea contains catechins that may improve endothelial function and reduce BP.',
        citation: 'American Heart Association. Tea and Cardiovascular Health. 2024.'
    },
    {
        icon: '🥑',
        question: 'Include Avocados in Diet (Rich in Potassium & Monounsaturated Fat)',
        answer: 'Avocados help lower LDL and raise HDL. Enjoy as toast, in salads, or as guacamole.',
        citation: 'AHA. Avocados and Heart Health. 2024.'
    },
    {
        icon: '🍎',
        question: 'Eat an Apple a Day (Pectin & Polyphenols)',
        answer: 'Apples are high in fiber and antioxidants that support vascular health. Red apples highest in polyphenols.',
        citation: 'Mayo Clinic. Apples and Heart Health. 2024.'
    },
    {
        icon: '🫘',
        question: 'Consume Legumes & Beans (3+ Times Per Week)',
        answer: 'Beans provide plant protein, fiber, and minerals that lower cholesterol and BP.',
        citation: 'American Heart Association. Legumes and Cardiovascular Health. 2024.'
    },
    {
        icon: '🥕',
        question: 'Eat Orange & Red Vegetables (Beta-Carotene & Lycopene)',
        answer: 'Carrots, sweet potatoes, tomatoes contain antioxidants that reduce inflammation.',
        citation: 'AHA. Colorful Vegetables. 2024.'
    },
    {
        icon: '🍇',
        question: 'Include Berries in Diet (Anthocyanins)',
        answer: 'Blueberries, raspberries, and strawberries improve endothelial function and reduce inflammation.',
        citation: 'Mayo Clinic. Berries and Vascular Health. 2024.'
    },
    {
        icon: '🧈',
        question: 'Use Coconut Oil Sparingly (If at All)',
        answer: 'Coconut oil is high in saturated fat. Olive and avocado oils are better choices.',
        citation: 'American Heart Association. Oils Comparison. 2024.'
    },
    {
        icon: '🍞',
        question: 'Choose 100% Whole Grain Bread Over Refined White Bread',
        answer: 'Whole grains have more fiber and lower glycemic index, improving cholesterol and glucose control.',
        citation: 'AHA. Whole Grains. 2024.'
    },
    {
        icon: '🥛',
        question: 'Consume Probiotic-Rich Foods (Yogurt, Kefir, Sauerkraut)',
        answer: 'Probiotics may improve gut health and reduce inflammation linked to cardiovascular disease.',
        citation: 'Mayo Clinic. Probiotics and Heart Health. 2024.'
    },
    {
        icon: '🌾',
        question: 'Limit Refined Carbohydrates & Sugary Drinks',
        answer: 'Excess refined sugars worsen obesity, diabetes, and triglycerides. Replace with water or unsweetened beverages.',
        citation: 'American Heart Association. Added Sugars. 2024.'
    },
    {
        icon: '🏊',
        question: 'Swim for Aerobic & Strength Training',
        answer: 'Swimming is low-impact, full-body exercise ideal for joint preservation while improving cardiovascular fitness.',
        citation: 'AHA. Water-Based Exercise. 2024.'
    },
    {
        icon: '🚴‍♀️',
        question: 'Join a Fitness Class for Group Motivation',
        answer: 'Group classes (Zumba, spinning, yoga) increase adherence and make exercise enjoyable.',
        citation: 'Mayo Clinic. Group Fitness Motivation. 2024.'
    },
    {
        icon: '🌳',
        question: 'Walk in Nature Parks (Reduces Stress & Increases Activity)',
        answer: 'Green space exposure lowers cortisol and BP. Combine exercise with mental health benefits.',
        citation: 'American Heart Association. Nature and Stress Reduction. 2024.'
    },
    {
        icon: '👥',
        question: 'Exercise with a Buddy or Family Member',
        answer: 'Social accountability increases exercise consistency and enjoyment.',
        citation: 'AHA. Social Support for Exercise. 2024.'
    },
    {
        icon: '📱',
        question: 'Use Fitness Apps or Wearables to Track Activity',
        answer: 'Step counters and apps provide motivation and help maintain consistency.',
        citation: 'Mayo Clinic. Digital Health Tools. 2024.'
    },
    {
        icon: '🧘‍♂️',
        question: 'Practice Tai Chi for Balance, Flexibility, and BP Reduction',
        answer: 'Tai Chi improves balance, coordination, and lowers BP in older adults.',
        citation: 'American Heart Association. Tai Chi Benefits. 2024.'
    },
    {
        icon: '🎵',
        question: 'Listen to Calming Music to Reduce Stress & BP',
        answer: 'Classical or relaxing music lowers BP and heart rate. Include in daily routine.',
        citation: 'Mayo Clinic. Music and Stress Reduction. 2024.'
    },
    {
        icon: '📞',
        question: 'Maintain Regular Contact with Family & Friends',
        answer: 'Social isolation increases cardiac mortality. Active relationships are protective.',
        citation: 'American Heart Association. Social Connection and Heart Health. 2024.'
    },
    {
        icon: '🏥',
        question: 'Attend Cardiac Rehabilitation Programs Post-Event',
        answer: 'Supervised rehab with exercise, education, and counseling improves outcomes after MI or heart surgery.',
        citation: 'AHA. Cardiac Rehabilitation Benefits. 2024.'
    },
    {
        icon: '📚',
        question: 'Learn CPR & First Aid (Preparedness Reduces Anxiety)',
        answer: 'Knowledge of emergency response increases confidence and may save lives.',
        citation: 'American Heart Association. CPR Training. 2024.'
    },
    {
        icon: '🧴',
        question: 'Use Low-Sodium Cooking Herbs & Spices (Garlic, Pepper, Cumin)',
        answer: 'Replace salt with herbs for flavor without sodium increase.',
        citation: 'CDC. Sodium Alternatives. 2025.'
    },
    {
        icon: '🌶️',
        question: 'Include Chili Peppers (Capsaicin Reduces Inflammation)',
        answer: 'Mild spice heat improves blood flow and may lower BP.',
        citation: 'Mayo Clinic. Spicy Foods and Cardiovascular Health. 2024.'
    },
    {
        icon: '🧴',
        question: 'Reduce Trans Fats by Avoiding Processed & Fried Foods',
        answer: 'Trans fats raise LDL and increase inflammation. Read labels for "partially hydrogenated oils."',
        citation: 'American Heart Association. Trans Fats Elimination. 2024.'
    },
    {
        icon: '🏃‍♀️',
        question: 'Do 30 Minutes Brisk Walking Daily (Cumulative)',
        answer: 'Three 10-minute walks count toward the 150 min/week goal and improve adherence.',
        citation: 'AHA. Accumulated Activity. 2024.'
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
    "১. হৃদরোগ / করোনারি আর্টারি ডিজিজ",
    "২. উচ্চ রক্তচাপ / হাইপারটেনশন",
    "৩. স্ট্রোক / ব্রেন অ্যাটাক",
    "৪. হার্ট অ্যাটাক / মায়োকার্ডিয়াল ইনফার্কশন",
    "৫. হৃদপিণ্ডের ফেইলিয়র / কনজেস্টিভ হার্ট ফেইলিয়র",
    "৬. আর্থ্রোস্ক্লেরোসিস / ধমনী শক্ত হয়ে যাওয়া",
    "৭. রিদমের সমস্যা / অ্যারিথমিয়া",
    "৮. হার্ট কেয়ার / হার্ট ভালভ ডিজিজ",
    "৯. পারিফেরাল আর্টারি ডিজিজ",
    "১০. জন্মগত হৃদরোগ / কনজেনিটাল হার্ট ডিজিজ"
];

// Sub-menu prompts
const healthPromptMap = {

    "coronary_artery_disease": {
        "botPrompt": "করোনারি আর্টারি ডিজিজ সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
        "options": [
          "বুকে ব্যথা",
          "শ্বাসকষ্ট",
          "পরিশ্রমে বুক ধড়ফড়",
          "বুকের চাপ বা ভার",
          "হাত বা চোয়ালে ব্যথা"
        ]
    },
    "hypertension": {
        "botPrompt": "উচ্চ রক্তচাপ/হাইপারটেনশন সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
        "options": [
          "মাথাব্যথা",
          "চোখে ঝাপসা দেখা",
          "বুকে ব্যথা বা চাপ",
          "ক্লান্তি",
          "নাক দিয়ে রক্ত পড়া"
        ]
    },
    "stroke": {
        "botPrompt": "স্ট্রোক/ব্রেন অ্যাটাক সংক্রান্ত কোন লক্ষণ নিয়ে জানতে চান?",
        "options": [
          "হাত/পা অবশ",
          "মুখ বেঁকে যাওয়া",
          "কথা বলতে সমস্যা",
          "হঠাৎ দুর্বলতা",
          "দৃষ্টি ঝাপসা"
        ]
    },
    "heart_attack": {
        "botPrompt": "হার্ট অ্যাটাক সংক্রান্ত কোন সমস্যা জানতে চান?",
        "options": [
          "হঠাৎ তীব্র বুক ব্যথা",
          "বুকের চাপ বা ভার",
          "শ্বাসকষ্ট",
          "ঘাম হওয়া",
          "বমি ভাব বা বমি"
        ]
    },
    "heart_failure": {
        "botPrompt": "হৃদপিণ্ডের ফেইলিয়র/কনজেস্টিভ হার্ট ফেইলিয়র সংক্রান্ত কোন লক্ষণ জানতে চান?",
        "options": [
          "শ্বাসকষ্ট",
          "পা ফুলে যাওয়া",
          "বুকে ভার",
          "রাতে শুয়ে শ্বাস নিতে কষ্ট",
          "অনিয়ন্ত্রিত ক্লান্তি"
        ]
    },
    "atherosclerosis": {
        "botPrompt": "আর্থ্রোস্ক্লেরোসিস/ধমনী শক্ত হয়ে যাওয়া বিষয়ে জানতে চান?",
        "options": [
          "পায়ে ব্যথা হাঁটার সময়",
          "ঠান্ডা পা/হাত",
          "রং-পরিবর্তিত ত্বকে",
          "ক্ষত সহজে সারছে না",
          "বুক ব্যথা"
        ]
    },
    "arrhythmia": {
        "botPrompt": "রিদমের সমস্যা/অ্যারিথমিয়া সংক্রান্ত লক্ষণ জানতে চান?",
        "options": [
          "হৃদকম্পন",
          "বুক ধড়ফড়",
          "মাথা ঘোরা",
          "অনিয়মিত হৃদ স্পন্দন",
          "অসুস্থ/দুর্বল অনুভব"
        ]
    },
    "valvular_heart_disease": {
        "botPrompt": "হার্ট ভালভ ডিজিজ সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
        "options": [
          "বুকের চাপ",
          "শ্বাসকষ্ট",
          "পা ফুলে যাওয়া",
          "বুক ধড়ফড়",
          "হঠাৎ দুর্বলতা"
        ]
    },
    "peripheral_artery_disease": {
        "botPrompt": "পারিফেরাল আর্টারি ডিজিজ সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
        "options": [
          "হাঁটলে পায়ে ব্যথা",
          "পা ঠান্ডা",
          "রং পরিবর্তিত ত্বক",
          "পায়ে ক্ষত",
          "পা অবশ"
        ]
    },
    "congenital_heart_disease": {
        "botPrompt": "জন্মগত হৃদরোগ/কনজেনিটাল হার্ট ডিজিজ নিয়ে জানতে চান?",
        "options": [
          "শ্বাসকষ্ট শিশুর",
          "বারবার নিউমোনিয়া",
          "হৃদকম্পন",
          "শিশুর বৃদ্ধি কম",
          "ত্বকে নীল ভাব"
        ]
     }

};

// Map Bengali to English keys
const nextStateMap = {
    "১. হৃদরোগ / করোনারি আর্টারি ডিজিজ": "coronary_artery_disease",
    "২. উচ্চ রক্তচাপ / হাইপারটেনশন": "hypertension",
    "৩. স্ট্রোক / ব্রেন অ্যাটাক": "stroke",
    "৪. হার্ট অ্যাটাক / মায়োকার্ডিয়াল ইনফার্কশন": "heart_attack",
    "৫. হৃদপিণ্ডের ফেইলিয়র / কনজেস্টিভ হার্ট ফেইলিয়র": "heart_failure",
    "৬. আর্থ্রোস্ক্লেরোসিস / ধমনী শক্ত হয়ে যাওয়া": "atherosclerosis",
    "৭. রিদমের সমস্যা / অ্যারিথমিয়া": "arrhythmia",
    "৮. হার্ট কেয়ার / হার্ট ভালভ ডিজিজ": "valvular_heart_disease",
    "৯. পারিফেরাল আর্টারি ডিজিজ": "peripheral_artery_disease",
    "১০. জন্মগত হৃদরোগ / কনজেনিটাল হার্ট ডিজিজ": "congenital_heart_disease"
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

// HEART COMMUNITY GROUP

// Ensure formData is initialized.
if (typeof formData === "undefined") {
  var formData = {};
}
// Get cardioType and community consent from form
formData.cardioType = document.getElementById('cardioType')?.value || "";
formData.joinCommunity = document.getElementById('joinCommunity')?.checked || false;


// Get cardioType (disease) and community consent from form
const cardioType = document.getElementById('cardioType')?.value || "";
const joinCommunity = document.getElementById('joinCommunity')?.checked || false;
formData.cardioType = cardioType;
formData.joinCommunity = joinCommunity;

// Data for cardio community groups
const CARDIO_COMMUNITY_GROUPS = {
  general: {
    name: "Heart Health Support Hub",
    members: 312,
    description: "Connect, ask general questions, get guidance for any heart concern.",
    color: "#e53935"
  },
  hypertension: {
    name: "Hypertension & BP Warriors",
    members: 228,
    description: "Tips, tracking routines, medication queries, and lifestyle support.",
    color: "#a31545"
  },
  coronary_artery: {
    name: "Coronary Artery Disease Circle",
    members: 194,
    description: "Discussion group for CAD, treatment stories, and living well.",
    color: "#1565c0"
  },
  heart_attack: {
    name: "Myocardial Infarction Survivors",
    members: 121,
    description: "Support, survivor stories, rehab and heart-healthy lifestyle discussion.",
    color: "#8d6e63"
  },
  arrhythmia: {
    name: "Heart Rhythm & Arrhythmia Support",
    members: 143,
    description: "For those with atrial fibrillation and all arrhythmia concerns.",
    color: "#fbc02d"
  },
  heart_failure: {
    name: "Congestive Heart Failure Community",
    members: 87,
    description: "Share care plans, symptom trackers, dietary and daily support.",
    color: "#43a047"
  },
  stroke: {
    name: "Stroke Prevention & Recovery",
    members: 178,
    description: "For stroke survivors, caregivers, and all preventative questions.",
    color: "#3949ab"
  },
  congenital: {
    name: "Congenital Heart Defects Peers",
    members: 59,
    description: "Community for adults and children living with CHD.",
    color: "#ab47bc"
  },
  peripheral: {
    name: "Peripheral Artery Disease Network",
    members: 76,
    description: "Focused on PAD, leg pain, mobility, and circulation tips.",
    color: "#ffa000"
  },
  valve: {
    name: "Heart Valve Support Group",
    members: 66,
    description: "For discussions on valve disease, repair, and replacement.",
    color: "#5d4037"
  },
  aortic: {
    name: "Aortic Disease Awareness Group",
    members: 31,
    description: "Aneurysm, dissection, genetic risk, and surgical support.",
    color: "#004d40"
  },
  women: {
    name: "Women's Heart Health Collective",
    members: 137,
    description: "Community for heart issues unique to women, from pregnancy to menopause.",
    color: "#c2185b"
  },
  men: {
    name: "Men's Cardio Wellbeing Network",
    members: 78,
    description: "Male-specific heart risk awareness, lifestyle and mental health.",
    color: "#1976d2"
  },
  cholesterol: {
    name: "Cholesterol & Lipid Management Forum",
    members: 103,
    description: "Questions on statins, triglycerides, and healthy nutrition.",
    color: "#ffb300"
  },
  cardiac_rehab: {
    name: "Cardiac Rehabilitation Motivation Group",
    members: 48,
    description: "For post-procedure recovery, exercise tips and wellness routines.",
    color: "#689f38"
  },
  young_adults: {
    name: "Young Hearts Community",
    members: 39,
    description: "Heart health awareness and peer chat for ages 16-35.",
    color: "#0288d1"
  },
  senior: {
    name: "Senior Heart Wellness Group",
    members: 95,
    description: "Connect for heart health advice over 60, medication, and aging tips.",
    color: "#bcaaa4"
  },
  diet: {
    name: "Heart-Healthy Diet & Recipes",
    members: 112,
    description: "Share heart-friendly recipes and nutrition advice.",
    color: "#388e3c"
  },
  smoking_cessation: {
    name: "Cardiac Smokers Quit Group",
    members: 52,
    description: "For quitting tobacco and reducing heart disease risk.",
    color: "#757575"
  },
  family_support: {
    name: "Families & Caregivers Cardio Support",
    members: 90,
    description: "Space for family, friends, and caregivers to share and support.",
    color: "#6d4c41"
  },
  rare: {
    name: "Rare Cardiac Diseases Forum",
    members: 28,
    description: "For myocarditis, endocarditis, inherited syndromes, and more.",
    color: "#512da8"
  }
};

// Display community groups based on selected cardio condition
function showRecommendedGroups(userCardioType) {
  const section = document.getElementById("patientGroupsSection");
  if (!section) return;

  section.innerHTML = `<h3 style="color: var(--color-primary); margin-bottom: 1rem;">Cardio/Heart health Support Communities</h3>`;
  let groupList = "";

  Object.entries(CARDIO_COMMUNITY_GROUPS).forEach(([key, group]) => {
    if (key === userCardioType || userCardioType === "") {
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
if (formData.joinCommunity && formData.cardioType) {
  showRecommendedGroups(formData.cardioType);
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
  // Show consent message about profile visibility in the cardio community group
  // e.g. document.getElementById("consentNotice").style.display = "block";
}

// END HEART COMMUNITY GROUP

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