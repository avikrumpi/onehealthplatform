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
        "১. হাড় ভাঙা / ফ্র্যাকচার",
        "২. হাড় ক্ষয় / অস্টিওপোরোসিস",
        "৩. গাঁটের ব্যথা / আর্থ্রাইটিস",
        "৪. অস্টিওআর্থ্রাইটিস",
        "৫. রিউমাটয়েড আর্থ্রাইটিস",
        "৬. ব্যাক পেইন / মেরুদণ্ডের ব্যথা",
        "৭. স্পন্ডিলাইটিস",
        "৮. স্কোলিওসিস",
        "৯. ডিস্ক সমস্যা / হার্নিয়েটেড ডিস্ক",
        "১০. মাসল স্ট্রেন / পেশী টান",
        "১১. টেন্ডনাইটিস / টেন্ডনের সমস্যা",
        "১২. হাড়ের টিউমার / অস্থি টিউমার"
    ],

    "nextStateMap": {
        "১. হাড় ভাঙা / ফ্র্যাকচার": "fracture",
        "২. হাড় ক্ষয় / অস্টিওপোরোসিস": "osteoporosis",
        "৩. গাঁটের ব্যথা / আর্থ্রাইটিস": "arthritis",
        "৪. অস্টিওআর্থ্রাইটিস": "osteoarthritis",
        "৫. রিউমাটয়েড আর্থ্রাইটিস": "rheumatoid_arthritis",
        "৬. ব্যাক পেইন / মেরুদন্ডের ব্যথা": "back_pain",
        "৭. স্পন্ডিলাইটিস": "spondylitis",
        "৮. স্কোলিওসিস": "scoliosis",
        "৯. ডিস্ক সমস্যা / হার্নিয়েটেড ডিস্ক": "herniated_disk",
        "১০. মাসল স্ট্রেন / পেশী টান": "muscle_strain",
        "১১. টেন্ডনাইটিস / টেন্ডনের সমস্যা": "tendinitis",
        "১২. হাড়ের টিউমার / অস্থি টিউমার": "bone_tumor"
     }
},
 "fracture": {
    "botPrompt": "ফ্র্যাকচার/হাড় ভাঙা সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "হাড়ে তীব্র ব্যথা",
      "ফোলা বা অস্বাভাবিক আকৃতি",
      "চলতে সমস্যা",
      "আঁচড় বা রক্তপাত",
      "পেশী দুর্বলতা"
    ]
  },
  "osteoporosis": {
    "botPrompt": "অস্টিওপোরোসিস/হাড় ক্ষয় সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "সহজেই হাড় ভেঙে যাওয়া",
      "পিঠে ব্যথা",
      "উচ্চতা কমে যাওয়া",
      "কমজোরি লাগা",
      "কোমর বা পিঠে বক্রতা"
    ]
  },
  "arthritis": {
    "botPrompt": "গাঁটের ব্যথা/আর্থ্রাইটিস সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "হাঁটু বা গাঁটে ব্যথা",
      "ফোলা",
      "শক্ত হয়ে যাওয়া",
      "চলাফেরায় অসুবিধা",
      "গাঁট গরম বা লাল"
    ]
  },
  "osteoarthritis": {
    "botPrompt": "অস্টিওআর্থ্রাইটিস সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "জয়েন্টে ব্যথা",
      "জয়েন্ট শক্ত",
      "সকালবেলা বেশি ব্যথা",
      "চলার সময় ব্যথা বাড়ে",
      "জয়েন্ট ফুলে থাকে"
    ]
  },
  "rheumatoid_arthritis": {
    "botPrompt": "রিউমাটয়েড আর্থ্রাইটিস সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "ছোট জয়েন্টে ব্যথা",
      "দুইহাত অথবা দুইপায়ে ফোলা",
      "সকালবেলা শক্ত হয়ে যাওয়া",
      "চলাচলে অসুবিধা",
      "জ্বর বা ক্লান্তি"
    ]
  },
  "back_pain": {
    "botPrompt": "ব্যাক পেইন/মেরুদণ্ডের ব্যথা সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "কোমরে/মেরুদণ্ডে লাগাতার ব্যথা",
      "চলতে বা উঠতে সমস্যা",
      "পা অবশ বা ইনজুরি",
      "নড়াচড়াতে ব্যথা বেড়ে যায়",
      "পেশীতে টান"
    ]
  },
  "spondylitis": {
    "botPrompt": "স্পন্ডিলাইটিস সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "গলা/ঘাড় ব্যথা",
      "হাত অবশ",
      "ঘাড় শক্ত",
      "মাথাব্যথা সাথে ঘাড়ে টান",
      "শুয়ে থাকলে সমস্যা কমে"
    ]
  },
  "scoliosis": {
    "botPrompt": "স্কোলিওসিস সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "মেরুদন্ড বেঁকিয়ে যাওয়া",
      "কোমর একদিকে বেশি উঁচু",
      "পিঠে ব্যথা",
      "অনুপযুক্ত ভঙ্গি",
      "শ্বাসকষ্ট (গুরুতর হলে)"
    ]
  },
  "herniated_disk": {
    "botPrompt": "ডিস্ক সমস্যা/হার্নিয়েটেড ডিস্ক সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "পিঠ বা কোমরে তীব্র ব্যথা",
      "পায়ে ব্যথা ছড়িয়ে যাওয়া",
      "পা অবশ",
      "উঠতে বসতে সমস্যা",
      "চলাফেরা সীমিত"
    ]
  },
  "muscle_strain": {
    "botPrompt": "মাসল স্ট্রেন/পেশী টান সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "পেশীতে হঠাৎ ব্যথা",
      "ফোলা",
      "চলাচলেও অসুবিধা",
      "পেশী দুর্বলতা",
      "ব্যায়ামে সমস্যা"
    ]
  },
  "tendinitis": {
    "botPrompt": "টেন্ডনাইটিস/টেন্ডনের সমস্যা সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "টেন্ডনে ব্যথা",
      "চলাচল করলে ব্যথা বাড়ে",
      "ফোলাভাব",
      "স্থানীয় গরম অনুভূতি",
      "টান বা জ্বর"
    ]
  },
  "bone_tumor": {
    "botPrompt": "হাড়ের টিউমার/অস্থি টিউমার সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "অস্থি বা হাড়ে ফোলাভাব",
      "হাড়ে অস্বাভাবিক ঘা",
      "পেশী দুর্বলতা",
      "স্থানে ব্যথা",
      "হঠাৎ ভাঙা/ক্র্যাক"
      ]
    }
};

// Question sequences matching Python exactly
const QUESTION_SEQUENCES = {

    fracture: [
    "আপনার বয়স কত?",
    "কিভাবে হাড় ভেঙেছে?",
    "কতদিন ধরে সমস্যা?",
    "ব্যথা কেমন?",
    "ফোলা বা রক্তপাত হচ্ছে?",
    "হাঁটা/চলাচলে অসুবিধা?",
    "আঘাতের সময় শব্দ হয়েছে?",
    "যে স্থানে ব্যথা সেখানে ফোলা আছে?",
    "পূর্বে এই স্থানে সমস্যা ছিল?",
    "রোগের জন্য কোনো ওষুধ নিচ্ছেন?",
    "রোগীর জ্বর হয়েছে?",
    "শরীরের অন্যান্য অংশে ব্যথা?",
    "চিকিৎসক দেখিয়েছেন?",
    "X-ray হয়েছে?",
    "গা দুর্বল লাগে?"
  ],
  osteoporosis: [
    "আপনার বয়স কত?",
    "কতদিন ধরে হাড় দুর্বল মনে হচ্ছে?",
    "সহজেই হাড় ভেঙে যাচ্ছে?",
    "পিঠে বা কোমরে ব্যথা?",
    "উচ্চতা কমছে কি?",
    "কোনো আঘাত ছাড়াই ব্যথা হচ্ছে?",
    "কোনো হাড় ভেঙেছে?",
    "খাদ্যে ক্যালসিয়ামের পরিমাণ কেমন?",
    "রোদে থাকেন কতটা?",
    "পরিবারে কারো অস্টিওপোরোসিস?",
    "শরীরে ভার কমেছে?",
    "নিয়মিত ব্যায়াম করেন?",
    "ধূমপান/মদ্যপান করেন?",
    "কোনো ওষুধ নিচ্ছেন?",
    "হাড়ের DEXA স্ক্যান হয়েছে?"
  ],
  arthritis: [
    "আপনার বয়স কত?",
    "কোন জয়েন্টে ব্যথা হচ্ছে?",
    "ব্যথা কতদিন ধরে?",
    "ফোলা বা গরম?",
    "সকালবেলা বেশি শক্ত লাগে?",
    "চলাফেরা করতে সমস্যা?",
    "পরিবারে কেউ আর্থ্রাইটিসে আক্রান্ত?",
    "ওষুধ বা থেরাপি নিচ্ছেন?",
    "জ্বর হচ্ছে?",
    "অন্যান্য জয়েন্টে সমস্যা?",
    "বয়সের সাথে বৃদ্ধি?",
    "জয়েন্টে গর্জন/ আওয়াজ?",
    "রক্তপরীক্ষা হয়েছে?",
    "জয়েন্টে দুর্ঘটনা হয়েছে?",
    "ব্যথা বিশ্রামে কমে?"
  ],
  osteoarthritis: [
    "আপনার বয়স কত?",
    "জয়েন্টে কোন ধরনের ব্যথা?",
    "পায়ের হাঁটু বা কোমর বেশি আক্রান্ত?",
    "চলার সময় ব্যথা বাড়ে?",
    "জয়েন্ট ফুলে গেছে?",
    "সকালবেলা ব্যথা কমে যায়?",
    "পুরনো ইনজুরি ছিল?",
    "বেশি হাঁটেন?",
    "রক্তপরীক্ষা হয়েছে?",
    "ব্যায়াম করেন?",
    "পরিবারে কারো এই রোগ?",
    "ওজন বেশি?",
    "থেরাপি বা ইঞ্জেকশন নিয়েছেন?",
    "জয়েন্টে শক্ত ভাব?",
    "আচরণের পরিবর্তন হয়েছে?"
  ],
  rheumatoid_arthritis: [
    "আপনার বয়স কত?",
    "ছোট জয়েন্টে বেশি ব্যথা?",
    "জ্বর বা ক্লান্তি হচ্ছে?",
    "সকালবেলা বেশি শক্ত?",
    "পরিবারে কেউ RA আক্রান্ত?",
    "শরীরে ফোলা-ব্যথা অন্য কোথাও?",
    "ওষুধ নিচ্ছেন?",
    "ঝিঁ-ঝিঁ ভাব?",
    "চলতে অসুবিধা?",
    "ভিন্ন লক্ষণ আছে?",
    "ব্যথার সময় শীত/গরমের পার্থক্য?",
    "রক্তপরীক্ষা হয়েছে?",
    "হাত-পায়ে দুর্বলতা?",
    "ডাক্তারের ফলোআপ?",
    "কোনো থেরাপি করেছেন?"
  ],
  back_pain: [
    "আপনার বয়স কত?",
    "কোমরে/পিঠে কতদিন ধরে ব্যথা?",
    "চলতে বা উঠতে সমস্যা?",
    "পা অবশ?",
    "ব্যথা বিশ্রামে কমে যায়?",
    "ইতিপূর্বে আঘাত ছিল?",
    "প্রবল ব্যথার সময় তাপ/ঠান্ডা ব্যবহার করেছেন?",
    "পেশীতে টান?",
    "ব্যথা সকালে বেশি?",
    "পেশি দুর্বলতা?",
    "বেশি বসে থাকেন?",
    "এক্সরেতে সমস্যা আছে?",
    "ব্যায়াম বা থেরাপি করছেন?",
    "ওষুধ নিচ্ছেন?",
    "উঠতে সমস্যা?"
  ],
  spondylitis: [
    "আপনার বয়স কত?",
    "কতদিন ধরে গলা/ঘাড় ব্যথা?",
    "ঘাড় শক্ত হয়ে গেছে?",
    "হাত অবশ?",
    "চলতে সমস্যা?",
    "তীব্র মাথাব্যথা হয়েছে?",
    "ঘাড় ঘোরাতে অসুবিধা?",
    "ব্যথা বিশ্রামে কমে?",
    "রক্তপরীক্ষা, এক্সরে বা MRI হয়েছে?",
    "ক্লান্ত বোধ করছেন?",
    "ঘাড়/মাথার পেছনে ফোলা?",
    "বেশি কম্পিউটার ব্যবহার করেন?",
    "ডাক্তারের ফলোআপ?",
    "ওষুধ বা থেরাপি করছেন?",
    "হঠাৎ অবস্থা খারাপ?"
  ],
  scoliosis: [
    "আপনার বয়স কত?",
    "মেরুদন্ডে বেঁকিয়ে গেছে দেখে?",
    "কতদিন ধরে এই সমস্যা?",
    "পিঠের এক পাশে বেশি ফোলা?",
    "চলতে সমস্যা?",
    "শ্বাসকষ্ট আছে?",
    "পরিবারে কারো এই সমস্যা?",
    "ইতিপূর্বে অপারেশন?",
    "এক্সরে বা MRI হয়েছে?",
    "ব্যায়াম বা থেরাপি নিচ্ছেন?",
    "অঙ্গভঙ্গি পরিবর্তন হয়েছে?",
    "মেরুদন্ডে ব্যথা হচ্ছে?",
    "রোগীর উচ্চতা পরিবর্তন?",
    "রক্তপরীক্ষা হয়েছে?",
    "ডাক্তারের পরামর্শ নিয়েছেন?"
  ],
  herniated_disk: [
    "আপনার বয়স কত?",
    "কতদিন ধরে পিঠ/কোমরে ব্যথা?",
    "পায়ে ছড়িয়ে ব্যথা?",
    "বিশ্রামে কমে নাকি বাড়ে?",
    "নড়াচড়াতে ব্যথা বাড়ে?",
    "পা অবশ?",
    "উঠতে বসতে সমস্যা?",
    "পুরনো ইনজুরি ছিল?",
    "পেশী দুর্বলতা?",
    "MRI হয়েছে?",
    "থেরাপি করেছেন?",
    "ওষুধ নিচ্ছেন?",
    "ব্যায়াম করেন?",
    "চলতে অসুবিধা?",
    "হঠাৎ করে খুব অসুবিধা?"
  ],
  muscle_strain: [
    "আপনার বয়স কত?",
    "কোথায় ব্যথা?",
    "কিভাবে পেশী টান লাগলো?",
    "কতদিন ধরে সমস্যা?",
    "ব্যথা বিশ্রামে কমে?",
    "পেশী ফোলা?",
    "অন্য কোথাও সমস্যা?",
    "ওষুধ নিচ্ছেন?",
    "হঠাৎ ব্যথা বেড়েছে?",
    "ব্যায়াম করেন?",
    "চলাচল/ব্যায়ামে সমস্যা?",
    "পুরোনো ইনজুরি ছিল?",
    "তীব্র ব্যথা?",
    "থেরাপি করেছেন?",
    "ডাক্তারের পরামর্শ?"
  ],
  tendinitis: [
    "আপনার বয়স কত?",
    "কোথায় টেন্ডন সমস্যা?",
    "কতদিন ধরে ব্যথা?",
    "চলাচলে বা কাজ করলে ব্যথা বাড়ে?",
    "ফোলাভাব আছে?",
    "স্থানীয় গরম অনুভূতি?",
    "কিছু কষ্ট করলে সমস্যা বাড়ে?",
    "ওষুধ নিচ্ছেন?",
    "পুরনো ইনজুরি ছিল?",
    "ব্যায়াম করেন?",
    "চলাচলে অসুবিধা?",
    "থেরাপি করেছেন?",
    "রক্তপরীক্ষা হয়েছে?",
    "ফিজিওথেরাপি করছেন?",
    "সৌরভ বা আওয়াজ হয়?"
  ],
  bone_tumor: [
    "আপনার বয়স কত?",
    "কোথায় অস্বাভাবিক ফোলা বা ঘা?",
    "কতদিন ধরে সমস্যা?",
    "স্থানে ব্যথা কেমন?",
    "পেশী দুর্বলতা আছে?",
    "হঠাৎ ভাঙা/ক্র্যাক হয়েছে?",
    "ওজন কমেছে কি?",
    "জ্বর হয়েছে?",
    "পরিবারে কারো টিউমার?",
    "রক্তপরীক্ষা হয়েছে?",
    "X-ray/MRI হয়েছে?",
    "চিকিৎসক দেখিয়েছেন?",
    "অন্য কোথাও সমস্যা?",
    "পূর্বে অপারেশন হয়েছে?",
    "ওষুধ নিচ্ছেন?"
  ]
};

const diseases = [
{
    name: 'Osteoporosis',
    category: 'Metabolic Bone Disease',
    ageGroup: 'Older adults (especially postmenopausal women)',
    symptoms: [
        'Bone fractures (hip, spine, wrist)',
        'Back pain',
        'Loss of height',
        'Stooped posture'
    ],
    causes: [
        'Age-related bone loss',
        'Postmenopausal estrogen deficiency',
        'Calcium or vitamin D deficiency',
        'Sedentary lifestyle',
        'Certain medications (e.g., corticosteroids)'
    ],
    treatment: [
        'Calcium and vitamin D supplementation',
        'Bisphosphonates',
        'Weight-bearing exercise',
        'Lifestyle modification',
        'Hormone replacement therapy (in select cases)'
    ],
    prevention: 'Adequate calcium and vitamin D intake, regular exercise, avoiding smoking and excessive alcohol.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Osteoporosis. 2025.</a>'
},

{
    name: 'Osteomalacia',
    category: 'Metabolic Bone Disease',
    ageGroup: 'Adults (any age)',
    symptoms: [
        'Bone pain',
        'Muscle weakness',
        'Fractures',
        'Difficulty walking'
    ],
    causes: [
        'Vitamin D deficiency',
        'Malabsorption',
        'Chronic kidney disease',
        'Certain medications (e.g., anticonvulsants)'
    ],
    treatment: [
        'Vitamin D supplementation',
        'Calcium supplementation',
        'Treat underlying cause'
    ],
    prevention: 'Adequate vitamin D and calcium intake, sun exposure.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Osteomalacia. 2025.</a>'
},

{
    name: 'Paget’s Disease of Bone',
    category: 'Metabolic Bone Disease',
    ageGroup: 'Older adults (usually >50 years)',
    symptoms: [
        'Bone pain',
        'Bone deformities',
        'Fractures',
        'Hearing loss (if skull affected)'
    ],
    causes: [
        'Unknown, possibly viral infection',
        'Genetic factors'
    ],
    treatment: [
        'Bisphosphonates',
        'Pain relief',
        'Surgery (in severe deformities)'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Paget’s Disease of Bone. 2025.</a>'
},

{
    name: 'Osteogenesis Imperfecta',
    category: 'Genetic Bone Disorder',
    ageGroup: 'All ages (usually detected in childhood)',
    symptoms: [
        'Frequent bone fractures',
        'Blue sclera',
        'Hearing loss',
        'Short stature'
    ],
    causes: [
        'Genetic mutations affecting collagen production',
        'Inherited autosomal dominant/recessive patterns'
    ],
    treatment: [
        'Fracture management',
        'Physical therapy',
        'Bisphosphonates',
        'Surgical interventions'
    ],
    prevention: 'Genetic counseling, prenatal diagnosis in families with history.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Osteogenesis Imperfecta. 2025.</a>'
},

{
    name: 'Osteomyelitis',
    category: 'Infectious Bone Disease',
    ageGroup: 'All ages',
    symptoms: [
        'Bone pain',
        'Fever',
        'Swelling and redness over affected bone',
        'Fatigue'
    ],
    causes: [
        'Bacterial infection (commonly Staphylococcus aureus)',
        'Open fractures',
        'Surgical contamination',
        'Hematogenous spread'
    ],
    treatment: [
        'Long-term antibiotics',
        'Surgical debridement',
        'Supportive care'
    ],
    prevention: 'Prompt treatment of fractures and infections, sterile surgical techniques.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Osteomyelitis. 2025.</a>'
},

{
    name: 'Bone Cancer (Primary: Osteosarcoma)',
    category: 'Malignant Bone Tumor',
    ageGroup: 'Children and young adults',
    symptoms: [
        'Localized bone pain',
        'Swelling',
        'Fractures',
        'Reduced joint movement'
    ],
    causes: [
        'Genetic mutations',
        'Radiation exposure',
        'Pre-existing bone diseases'
    ],
    treatment: [
        'Surgical resection',
        'Chemotherapy',
        'Radiation therapy (select cases)'
    ],
    prevention: 'No known prevention; early detection important',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Osteosarcoma. 2025.</a>'
},

{
    name: 'Avascular Necrosis',
    category: 'Bone Ischemic Disease',
    ageGroup: 'Adults (30-50 years common age group)',
    symptoms: [
        'Joint pain (hip, shoulder)',
        'Limited range of motion',
        'Limping',
        'Collapse of bone structure'
    ],
    causes: [
        'Trauma',
        'Steroid use',
        'Alcoholism',
        'Blood disorders',
        'Idiopathic'
    ],
    treatment: [
        'Medications (pain relief, bisphosphonates)',
        'Core decompression surgery',
        'Joint replacement in advanced cases'
    ],
    prevention: 'Avoid risk factors like excessive steroid use and alcohol abuse.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Avascular Necrosis. 2025.</a>'
},

{
    name: 'Fibrous Dysplasia',
    category: 'Bone Development Disorder',
    ageGroup: 'Children and young adults',
    symptoms: [
        'Bone pain',
        'Bone deformity',
        'Fractures',
        'Swelling'
    ],
    causes: [
        'Mutation in GNAS gene',
        'Abnormal fibrous tissue replaces normal bone'
    ],
    treatment: [
        'Pain management',
        'Surgical correction of deformities',
        'Bisphosphonates'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Fibrous Dysplasia. 2025.</a>'
},

{
    name: 'Osteopetrosis',
    category: 'Genetic Bone Disorder',
    ageGroup: 'All ages (infantile and adult forms)',
    symptoms: [
        'Frequent fractures',
        'Bone pain',
        'Cranial nerve compression',
        'Anemia'
    ],
    causes: [
        'Defective osteoclast function',
        'Genetic mutations'
    ],
    treatment: [
        'Bone marrow transplant (infantile form)',
        'Supportive care',
        'Fracture management'
    ],
    prevention: 'Genetic counseling in affected families',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Osteopetrosis. 2025.</a>'
},

{
    name: 'Bone Cysts',
    category: 'Benign Bone Lesion',
    ageGroup: 'Children and adolescents',
    symptoms: [
        'Pain',
        'Swelling',
        'Fracture',
        'Often asymptomatic'
    ],
    causes: [
        'Unknown exact cause',
        'Possibly developmental anomalies'
    ],
    treatment: [
        'Observation (if asymptomatic)',
        'Surgical curettage and bone grafting',
        'Injection therapies'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Bone Cysts. 2025.</a>'
},

{
    name: 'Chondrosarcoma',
    category: 'Malignant Bone Tumor',
    ageGroup: 'Adults (middle-aged to older adults)',
    symptoms: [
        'Pain',
        'Swelling',
        'Limping if limb affected',
        'Mass formation'
    ],
    causes: [
        'Genetic mutations',
        'Previous bone conditions',
        'Radiation exposure'
    ],
    treatment: [
        'Surgical resection',
        'Radiation therapy (in select cases)'
    ],
    prevention: 'No known prevention; early diagnosis essential',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Chondrosarcoma. 2025.</a>'
},

{
    name: 'Giant Cell Tumor of Bone',
    category: 'Benign but Aggressive Bone Tumor',
    ageGroup: 'Young adults (20-40 years)',
    symptoms: [
        'Pain',
        'Swelling',
        'Limited joint movement',
        'Fractures'
    ],
    causes: [
        'Unknown exact cause',
        'Possibly associated with genetic factors'
    ],
    treatment: [
        'Surgical resection',
        'Curettage and bone grafting',
        'Targeted therapies (denosumab)'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Giant Cell Tumor of Bone. 2025.</a>'
},

{
    name: 'Ewing’s Sarcoma',
    category: 'Malignant Bone Tumor',
    ageGroup: 'Children and adolescents',
    symptoms: [
        'Localized pain and swelling',
        'Fever',
        'Fatigue',
        'Weight loss'
    ],
    causes: [
        'Chromosomal translocations (genetic mutation)',
        'Unknown exact triggers'
    ],
    treatment: [
        'Multi-agent chemotherapy',
        'Surgical excision',
        'Radiation therapy'
    ],
    prevention: 'No known prevention; early diagnosis is critical',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Ewing’s Sarcoma. 2025.</a>'
},

{
    name: 'Rickets',
    category: 'Metabolic Bone Disease',
    ageGroup: 'Children',
    symptoms: [
        'Delayed growth',
        'Bone pain',
        'Skeletal deformities (bowed legs)',
        'Dental problems',
        'Muscle weakness'
    ],
    causes: [
        'Vitamin D deficiency',
        'Calcium deficiency',
        'Phosphate deficiency',
        'Genetic disorders'
    ],
    treatment: [
        'Vitamin D supplementation',
        'Calcium supplementation',
        'Sun exposure',
        'Treatment of underlying genetic disorders'
    ],
    prevention: 'Adequate vitamin D and calcium intake, sun exposure.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Rickets. 2025.</a>'
},

{
    name: 'Bone Metastasis',
    category: 'Secondary Bone Cancer',
    ageGroup: 'Adults (especially with primary cancers)',
    symptoms: [
        'Bone pain',
        'Fractures',
        'Spinal cord compression',
        'Hypercalcemia'
    ],
    causes: [
        'Spread from breast cancer',
        'Spread from prostate cancer',
        'Spread from lung cancer',
        'Other primary cancers'
    ],
    treatment: [
        'Radiation therapy',
        'Chemotherapy',
        'Bisphosphonates',
        'Surgery',
        'Pain management'
    ],
    prevention: 'Early detection and treatment of primary cancers.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Bone Metastasis. 2025.</a>'
},
{
    name: 'Osteochondritis Dissecans',
    category: 'Joint and Bone Disorder',
    ageGroup: 'Children and adolescents',
    symptoms: [
        'Joint pain',
        'Swelling',
        'Joint locking or catching',
        'Reduced range of motion'
    ],
    causes: [
        'Reduced blood flow to bone',
        'Repetitive trauma',
        'Genetic factors'
    ],
    treatment: [
        'Rest and activity modification',
        'Physical therapy',
        'Surgery (in severe cases)'
    ],
    prevention: 'Avoid overuse injuries, proper training techniques.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Osteochondritis Dissecans. 2025.</a>'
},

{
    name: 'Hyperostosis',
    category: 'Bone Growth Disorder',
    ageGroup: 'Adults',
    symptoms: [
        'Bone thickening',
        'Pain',
        'Restricted movement',
        'Nerve compression'
    ],
    causes: [
        'Genetic factors',
        'Metabolic disorders',
        'Chronic inflammation'
    ],
    treatment: [
        'Pain management',
        'Anti-inflammatory medications',
        'Surgery (if nerve compression)'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Hyperostosis. 2025.</a>'
},

{
    name: 'Hypophosphatasia',
    category: 'Genetic Metabolic Bone Disease',
    ageGroup: 'All ages (severity varies)',
    symptoms: [
        'Weak bones',
        'Premature tooth loss',
        'Skeletal deformities',
        'Growth delays'
    ],
    causes: [
        'Mutations in ALPL gene',
        'Defective bone mineralization'
    ],
    treatment: [
        'Enzyme replacement therapy',
        'Supportive care',
        'Orthopedic interventions'
    ],
    prevention: 'Genetic counseling in affected families',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Hypophosphatasia. 2025.</a>'
},


{
    name: 'Enchondroma',
    category: 'Benign Bone Tumor',
    ageGroup: 'Adults (20-40 years)',
    symptoms: [
        'Often asymptomatic',
        'Swelling',
        'Pain',
        'Pathological fractures'
    ],
    causes: [
        'Abnormal cartilage growth',
        'Unknown exact cause'
    ],
    treatment: [
        'Observation (if asymptomatic)',
        'Surgical curettage and bone grafting'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Enchondroma. 2025.</a>'
},

{
    name: 'Osteoid Osteoma',
    category: 'Benign Bone Tumor',
    ageGroup: 'Children and young adults',
    symptoms: [
        'Night pain',
        'Pain relieved by NSAIDs',
        'Localized swelling',
        'Scoliosis (if spine affected)'
    ],
    causes: [
        'Unknown exact cause',
        'Abnormal bone formation'
    ],
    treatment: [
        'NSAIDs for pain relief',
        'Radiofrequency ablation',
        'Surgical excision'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Osteoid Osteoma. 2025.</a>'
},

{
    name: 'Osteoblastoma',
    category: 'Benign Bone Tumor',
    ageGroup: 'Young adults (10-30 years)',
    symptoms: [
        'Persistent pain',
        'Swelling',
        'Neurological symptoms (if spine affected)',
        'Scoliosis'
    ],
    causes: [
        'Unknown exact cause',
        'Similar to osteoid osteoma but larger'
    ],
    treatment: [
        'Surgical excision',
        'Curettage',
        'Radiation (rarely)'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Osteoblastoma. 2025.</a>'
},

{
    name: 'Brown Tumor',
    category: 'Metabolic Bone Lesion',
    ageGroup: 'Adults with hyperparathyroidism',
    symptoms: [
        'Bone pain',
        'Swelling',
        'Fractures',
        'Deformity'
    ],
    causes: [
        'Hyperparathyroidism',
        'Excessive bone resorption',
        'High parathyroid hormone levels'
    ],
    treatment: [
        'Treatment of hyperparathyroidism',
        'Parathyroid surgery',
        'Calcium and vitamin D management'
    ],
    prevention: 'Early detection and treatment of hyperparathyroidism.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Brown Tumor. 2025.</a>'
},

{
    name: 'Chondroblastoma',
    category: 'Benign Bone Tumor',
    ageGroup: 'Adolescents and young adults',
    symptoms: [
        'Joint pain',
        'Swelling',
        'Limited range of motion',
        'Muscle atrophy'
    ],
    causes: [
        'Unknown exact cause',
        'Abnormal cartilage cell growth'
    ],
    treatment: [
        'Surgical curettage',
        'Bone grafting',
        'Cryotherapy'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Chondroblastoma. 2025.</a>'
},

{
    name: 'Bone Infarct',
    category: 'Bone Ischemic Disease',
    ageGroup: 'Adults',
    symptoms: [
        'Often asymptomatic',
        'Pain (if large)',
        'Swelling',
        'Fractures'
    ],
    causes: [
        'Vascular insufficiency',
        'Trauma',
        'Steroid use',
        'Sickle cell disease'
    ],
    treatment: [
        'Usually no treatment needed',
        'Pain management',
        'Treatment of underlying condition'
    ],
    prevention: 'Manage risk factors like steroid use and blood disorders.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Bone Infarct. 2025.</a>'
},

{
    name: 'Juvenile Paget\'s Disease',
    category: 'Genetic Metabolic Bone Disease',
    ageGroup: 'Children',
    symptoms: [
        'Skeletal deformities',
        'Bone pain',
        'Fractures',
        'Short stature'
    ],
    causes: [
        'Genetic mutations (TNFRSF11B gene)',
        'Abnormal bone remodeling'
    ],
    treatment: [
        'Bisphosphonates',
        'Pain management',
        'Orthopedic interventions'
    ],
    prevention: 'Genetic counseling in affected families',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Juvenile Paget\'s Disease. 2025.</a>'
},

{
    name: 'Melorheostosis',
    category: 'Bone Sclerosing Disorder',
    ageGroup: 'Children and young adults',
    symptoms: [
        'Bone pain',
        'Stiffness',
        'Limb deformity',
        'Limited joint movement'
    ],
    causes: [
        'Somatic mutations in MAP2K1 gene',
        'Abnormal bone formation'
    ],
    treatment: [
        'Pain management',
        'Physical therapy',
        'Surgery (for severe deformities)'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Melorheostosis. 2025.</a>'
},

{
    name: 'Ollier Disease',
    category: 'Bone Developmental Disorder',
    ageGroup: 'Children',
    symptoms: [
        'Multiple bone masses',
        'Limb length discrepancy',
        'Deformities',
        'Fractures'
    ],
    causes: [
        'Mutations affecting cartilage development',
        'Multiple enchondromas'
    ],
    treatment: [
        'Surgical correction of deformities',
        'Monitoring for malignant transformation',
        'Limb lengthening procedures'
    ],
    prevention: 'No known prevention; regular monitoring essential',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Ollier Disease. 2025.</a>'
},

{
    name: 'Maffucci Syndrome',
    category: 'Bone and Vascular Disorder',
    ageGroup: 'Children',
    symptoms: [
        'Multiple bone masses',
        'Soft tissue hemangiomas',
        'Limb deformities',
        'High risk of malignancy'
    ],
    causes: [
        'Mutations affecting cartilage and blood vessels',
        'Enchondromas with hemangiomas'
    ],
    treatment: [
        'Surgical removal of lesions',
        'Monitoring for malignant transformation',
        'Management of deformities'
    ],
    prevention: 'No known prevention; lifelong surveillance needed',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Maffucci Syndrome. 2025.</a>'
},

{
    name: 'Stress Fractures',
    category: 'Overuse Bone Injury',
    ageGroup: 'Athletes and active individuals',
    symptoms: [
        'Localized pain during activity',
        'Swelling',
        'Tenderness',
        'Pain relief with rest'
    ],
    causes: [
        'Repetitive mechanical stress',
        'Overuse',
        'Inadequate rest',
        'Poor bone density'
    ],
    treatment: [
        'Rest',
        'Activity modification',
        'Physical therapy',
        'Gradual return to activity'
    ],
    prevention: 'Proper training techniques, adequate rest, nutrition.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Stress Fractures. 2025.</a>'
},

{
    name: 'Compression Fractures',
    category: 'Vertebral Bone Injury',
    ageGroup: 'Older adults',
    symptoms: [
        'Back pain',
        'Loss of height',
        'Kyphosis (stooped posture)',
        'Limited mobility'
    ],
    causes: [
        'Osteoporosis',
        'Trauma',
        'Cancer metastasis',
        'Steroid use'
    ],
    treatment: [
        'Pain management',
        'Bracing',
        'Vertebroplasty or kyphoplasty',
        'Treatment of underlying osteoporosis'
    ],
    prevention: 'Osteoporosis prevention, fall prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Compression Fractures. 2025.</a>'
},
{
    name: 'Osteonecrosis of the Jaw',
    category: 'Bone Ischemic Disease',
    ageGroup: 'Adults (especially on bisphosphonates)',
    symptoms: [
        'Jaw pain',
        'Exposed bone',
        'Swelling',
        'Infection',
        'Loosening of teeth'
    ],
    causes: [
        'Bisphosphonate use',
        'Radiation therapy',
        'Steroid use',
        'Dental procedures'
    ],
    treatment: [
        'Conservative management',
        'Antibiotics',
        'Surgical debridement',
        'Discontinuation of causative medications'
    ],
    prevention: 'Dental care before bisphosphonate therapy, good oral hygiene.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Osteonecrosis of the Jaw. 2025.</a>'
},

{
    name: 'Multiple Myeloma Bone Disease',
    category: 'Malignant Bone Disease',
    ageGroup: 'Older adults',
    symptoms: [
        'Bone pain',
        'Fractures',
        'Hypercalcemia',
        'Anemia',
        'Kidney problems'
    ],
    causes: [
        'Plasma cell cancer',
        'Production of abnormal proteins',
        'Bone marrow involvement'
    ],
    treatment: [
        'Chemotherapy',
        'Radiation therapy',
        'Bisphosphonates',
        'Stem cell transplant',
        'Targeted therapies'
    ],
    prevention: 'No known prevention; early detection important',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Multiple Myeloma Bone Disease. 2025.</a>'
},

{
    name: 'Hyperparathyroidism Bone Disease',
    category: 'Metabolic Bone Disease',
    ageGroup: 'Adults',
    symptoms: [
        'Bone pain',
        'Fractures',
        'Kidney stones',
        'Fatigue',
        'Osteoporosis'
    ],
    causes: [
        'Overactive parathyroid glands',
        'Excessive parathyroid hormone',
        'Adenoma or hyperplasia'
    ],
    treatment: [
        'Parathyroid surgery',
        'Calcium and vitamin D management',
        'Bisphosphonates',
        'Monitoring'
    ],
    prevention: 'Regular screening in at-risk populations.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Hyperparathyroidism Bone Disease. 2025.</a>'
},

{
    name: 'Acromegaly Bone Disease',
    category: 'Endocrine Bone Disorder',
    ageGroup: 'Adults',
    symptoms: [
        'Enlarged hands and feet',
        'Facial changes',
        'Joint pain',
        'Arthritis',
        'Carpal tunnel syndrome'
    ],
    causes: [
        'Excess growth hormone',
        'Pituitary adenoma',
        'Bone and soft tissue overgrowth'
    ],
    treatment: [
        'Surgery to remove pituitary tumor',
        'Medications to reduce growth hormone',
        'Radiation therapy',
        'Management of complications'
    ],
    prevention: 'Early detection and treatment of pituitary tumors.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Acromegaly Bone Disease. 2025.</a>'
},

{
    name: 'Bone Marrow Edema Syndrome',
    category: 'Bone Inflammatory Condition',
    ageGroup: 'Adults (middle-aged)',
    symptoms: [
        'Sudden severe joint pain',
        'Limited weight bearing',
        'Swelling',
        'Reduced range of motion'
    ],
    causes: [
        'Unknown exact cause',
        'Possibly vascular insufficiency',
        'Trauma',
        'Pregnancy'
    ],
    treatment: [
        'Rest and protected weight bearing',
        'Pain management',
        'Physical therapy',
        'Bisphosphonates (in some cases)'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Bone Marrow Edema Syndrome. 2025.</a>'
},

{
    name: 'Diffuse Idiopathic Skeletal Hyperostosis (DISH)',
    category: 'Bone Formation Disorder',
    ageGroup: 'Older adults (>50 years)',
    symptoms: [
        'Stiffness',
        'Pain in spine',
        'Reduced flexibility',
        'Difficulty swallowing (if cervical spine)'
    ],
    causes: [
        'Unknown exact cause',
        'Associated with diabetes and obesity',
        'Calcification of ligaments'
    ],
    treatment: [
        'Pain management',
        'Physical therapy',
        'Anti-inflammatory medications',
        'Surgery (rarely)'
    ],
    prevention: 'Maintain healthy weight, manage diabetes.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. DISH. 2025.</a>'
},

{
    name: 'Hypertrophic Osteoarthropathy',
    category: 'Bone and Joint Disorder',
    ageGroup: 'Adults with chronic diseases',
    symptoms: [
        'Clubbing of fingers',
        'Joint pain and swelling',
        'Periosteal new bone formation',
        'Warmth over joints'
    ],
    causes: [
        'Lung cancer',
        'Chronic lung disease',
        'Congenital heart disease',
        'Liver cirrhosis'
    ],
    treatment: [
        'Treatment of underlying condition',
        'Pain management',
        'Anti-inflammatory medications'
    ],
    prevention: 'Early detection and treatment of underlying diseases.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Hypertrophic Osteoarthropathy. 2025.</a>'
},

{
    name: 'Ankylosing Spondylitis',
    category: 'Inflammatory Arthritis',
    ageGroup: 'Young adults (20-40 years)',
    symptoms: [
        'Chronic back pain',
        'Stiffness',
        'Reduced spinal mobility',
        'Fatigue',
        'Eye inflammation'
    ],
    causes: [
        'Autoimmune disorder',
        'Genetic factors (HLA-B27)',
        'Inflammation of spine joints'
    ],
    treatment: [
        'NSAIDs',
        'Biologic medications (TNF inhibitors)',
        'Physical therapy',
        'Exercise'
    ],
    prevention: 'No known prevention; early diagnosis improves outcomes.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Ankylosing Spondylitis. 2025.</a>'
},

{
    name: 'Rheumatoid Arthritis Bone Erosions',
    category: 'Autoimmune Bone Disease',
    ageGroup: 'Adults (30-60 years common)',
    symptoms: [
        'Joint pain and swelling',
        'Morning stiffness',
        'Bone erosions',
        'Joint deformities',
        'Fatigue'
    ],
    causes: [
        'Autoimmune disorder',
        'Chronic inflammation',
        'Genetic and environmental factors'
    ],
    treatment: [
        'Disease-modifying antirheumatic drugs (DMARDs)',
        'Biologic agents',
        'NSAIDs',
        'Physical therapy',
        'Surgery (in advanced cases)'
    ],
    prevention: 'Early diagnosis and aggressive treatment.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Rheumatoid Arthritis Bone Erosions. 2025.</a>'
},

{
    name: 'Bone Sarcoidosis',
    category: 'Granulomatous Bone Disease',
    ageGroup: 'Adults (20-40 years)',
    symptoms: [
        'Bone pain',
        'Swelling',
        'Cysts in bones',
        'Often asymptomatic',
        'Systemic symptoms'
    ],
    causes: [
        'Granulomatous inflammation',
        'Unknown exact trigger',
        'Immune system abnormality'
    ],
    treatment: [
        'Corticosteroids',
        'Immunosuppressive medications',
        'Treatment of systemic sarcoidosis',
        'Pain management'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Bone Sarcoidosis. 2025.</a>'
},

{
    name: 'Osteochondroma',
    category: 'Benign Bone Tumor',
    ageGroup: 'Children and adolescents',
    symptoms: [
        'Painless bony lump',
        'Pain if pressing on nerves or vessels',
        'Limited joint motion',
        'Often asymptomatic'
    ],
    causes: [
        'Developmental abnormality',
        'Cartilage growth from bone surface'
    ],
    treatment: [
        'Observation (if asymptomatic)',
        'Surgical excision (if symptomatic or growing)'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Osteochondroma. 2025.</a>'
},

{
    name: 'Hypocalcemia-Induced Bone Disease',
    category: 'Metabolic Bone Disease',
    ageGroup: 'All ages',
    symptoms: [
        'Muscle cramps',
        'Tetany',
        'Bone pain',
        'Fractures',
        'Osteomalacia'
    ],
    causes: [
        'Vitamin D deficiency',
        'Hypoparathyroidism',
        'Kidney disease',
        'Malabsorption'
    ],
    treatment: [
        'Calcium supplementation',
        'Vitamin D supplementation',
        'Treatment of underlying cause',
        'Parathyroid hormone replacement'
    ],
    prevention: 'Adequate calcium and vitamin D intake.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Hypocalcemia-Induced Bone Disease. 2025.</a>'
},

{
    name: 'Bone Infarcts in Sickle Cell Disease',
    category: 'Hematological Bone Disease',
    ageGroup: 'All ages (patients with sickle cell disease)',
    symptoms: [
        'Severe bone pain (crisis)',
        'Swelling',
        'Fever',
        'Avascular necrosis'
    ],
    causes: [
        'Vaso-occlusion',
        'Abnormal sickle-shaped red blood cells',
        'Reduced blood flow to bone'
    ],
    treatment: [
        'Pain management',
        'Hydration',
        'Blood transfusions',
        'Hydroxyurea',
        'Surgery (in avascular necrosis)'
    ],
    prevention: 'Management of sickle cell disease, hydration, avoiding triggers.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Bone Infarcts in Sickle Cell Disease. 2025.</a>'
},

{
    name: 'Fibrous Cortical Defect',
    category: 'Benign Bone Lesion',
    ageGroup: 'Children and adolescents',
    symptoms: [
        'Usually asymptomatic',
        'Incidental finding on X-ray',
        'Rarely causes fractures'
    ],
    causes: [
        'Developmental abnormality',
        'Fibrous tissue in bone cortex'
    ],
    treatment: [
        'Observation (most resolve spontaneously)',
        'Surgery (if large or causing symptoms)'
    ],
    prevention: 'No known prevention',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Fibrous Cortical Defect. 2025.</a>'
},

{
    name: 'Bone Dysplasias',
    category: 'Genetic Bone Development Disorders',
    ageGroup: 'All ages (present from birth)',
    symptoms: [
        'Short stature',
        'Skeletal deformities',
        'Joint problems',
        'Fractures',
        'Variable severity'
    ],
    causes: [
        'Genetic mutations',
        'Abnormal bone and cartilage development',
        'Inherited or spontaneous mutations'
    ],
    treatment: [
        'Supportive care',
        'Orthopedic interventions',
        'Physical therapy',
        'Surgery for deformities',
        'Growth hormone (in some cases)'
    ],
    prevention: 'Genetic counseling in affected families',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Bone Dysplasias. 2025.</a>'
},

{
    name: 'Scurvy Bone Disease',
    category: 'Nutritional Bone Disease',
    ageGroup: 'All ages (rare in modern times)',
    symptoms: [
        'Bone pain',
        'Bleeding gums',
        'Poor wound healing',
        'Bone fragility',
        'Subperiosteal hemorrhage'
    ],
    causes: [
        'Severe vitamin C deficiency',
        'Poor diet',
        'Malabsorption'
    ],
    treatment: [
        'Vitamin C supplementation',
        'Dietary improvements',
        'Treatment of underlying malabsorption'
    ],
    prevention: 'Adequate vitamin C intake through diet.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    citation: '<a href="https://www.nhp.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal. Scurvy Bone Disease. 2025.</a>'
}

];

const doctorsData = {

  'Delhi': [
    {
        name: 'Dr. Rajesh Malhotra',
        credentials: 'MBBS, MS (Orthopedics), Head Orthopedics (AIIMS)',
        experience: '44+ Years Experience',
        hospital: 'AIIMS, New Delhi',
        address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029',
        phone: '+91 11 2658 8500',
        email: 'rajesh.malhotra@aiims.edu',
        hours: 'Mon-Sat 9AM-5PM',
        specializations: 'Joint Replacement, Hip & Knee Surgery, Trauma',
        bookingLink: 'https://www.aiims.edu',
        rating: '4.9/5 (1250 reviews)'
    },
    {
        name: 'Dr. Anil Arora',
        credentials: 'MBBS, MS (Orthopedics), Chief, Max Super Speciality',
        experience: '30+ Years Experience',
        hospital: 'Max Super Speciality Hospital, Patparganj',
        address: 'IP Extension, Delhi - 110092',
        phone: '+91 11 4303 3333',
        email: 'anil.arora@maxhealthcare.com',
        hours: 'Mon-Fri 10AM-6PM',
        specializations: 'Joint Replacement, Bone Disorders',
        bookingLink: 'https://www.maxhealthcare.in',
        rating: '4.8/5 (740 reviews)'
      },
      {
        name: 'Dr. Ramkinkar Jha',
        credentials: 'MBBS, MS (Ortho), Fellowship Joint Replacement',
        experience: '20+ Years Experience',
        hospital: 'Artemis Hospital',
        address: 'Sector 51, Gurgaon, Delhi NCR - 122001',
        phone: '+91 124 4511 111',
        email: 'ramkinkar.jha@artemishospitals.com',
        hours: 'Mon-Fri 9AM-5PM',
        specializations: 'Hip & Knee Replacement, Sports Injuries',
        bookingLink: 'https://www.artemishospitals.com',
        rating: '4.8/5 (590 reviews)'
      },
    {
        name: 'Dr. Yash Gulati',
        credentials: 'MBBS, MS, MCh (Ortho), Padma Shri Awardee',
        experience: '38+ Years Experience',
        hospital: 'Indraprastha Apollo Hospital',
        address: 'Sarita Vihar, Delhi - 110076',
        phone: '+91 11 2692 5858',
        email: 'yash.gulati@apollohospitals.com',
        hours: 'Mon-Sat 10AM-2PM',
        specializations: 'Spine Surgery, Joint Replacement, Pediatric Ortho',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.8/5 (980 reviews)'
    },
    {
        name: 'Dr. IPS Oberoi',
        credentials: 'MBBS, MS (Ortho), DNB, FPAS, Fellowship (UK & USA)',
        experience: '30+ Years Experience',
        hospital: 'Artemis Hospital, Gurgaon',
        address: 'Sector 51, Gurgaon, Delhi NCR - 122001',
        phone: '+91 124 4511 111',
        email: 'ips.oberoi@artemishospitals.com',
        hours: 'Mon-Fri 9AM-5PM',
        specializations: 'Sports Injury, Joint Replacement, Hip & Knee Arthroscopy',
        bookingLink: 'https://www.artemishospitals.com',
        rating: '4.9/5 (840 reviews)'
    },
    {
        name: 'Dr. Subhash Jangid',
        credentials: 'MBBS, MS (Ortho), Director of Orthopedics',
        experience: '25+ Years Experience',
        hospital: 'Fortis Memorial Research Institute',
        address: 'Sector 44, Gurgaon, Delhi NCR - 122002',
        phone: '+91 124 4921 000',
        email: 'subhash.jangid@fortishealthcare.com',
        hours: 'Mon-Sat 9AM-6PM',
        specializations: 'Joint Replacement, Trauma, Revision Orthopedics',
        bookingLink: 'https://www.fortishealthcare.com',
        rating: '4.8/5 (560 reviews)'
    }
  ],

  'Mumbai': [
    {
        name: 'Dr. Nilen Shah',
        credentials: 'M.Ch. Ortho (UK), MS (Bombay - Gold Medalist)',
        experience: '33+ Years Experience',
        hospital: 'Hinduja Hospital/Mumbai Spine Clinic',
        address: 'Veer Savarkar Marg, Mahim, Mumbai - 400016',
        phone: '+91 22 2444 9199',
        email: 'nilen.shah@hindujahospital.com',
        hours: 'Mon-Fri 9AM-5PM',
        specializations: 'Joint Replacement, Spine & Sports Orthopedics',
        bookingLink: 'https://www.hindujahospital.com',
        rating: '4.8/5 (730 reviews)'
    },
    {
        name: 'Dr. Mudit Khanna',
        credentials: 'MBBS, MS, MCh (UK), Joint Replacement & Arthroscopy',
        experience: '22+ Years Experience',
        hospital: 'Wockhardt Hospital',
        address: 'Mumbai Central, Mumbai - 400008',
        phone: '+91 22 6178 9000',
        email: 'mudit.khanna@wockhardthospitals.com',
        hours: 'Mon-Sat 11AM-6PM',
        specializations: 'Arthroplasty, Arthroscopy',
        bookingLink: 'https://www.wockhardthospitals.com',
        rating: '4.8/5 (520 reviews)'
      },
      {
        name: 'Dr. Prashant Agrawal',
        credentials: 'MBBS, MS (Ortho), Joint Replacement Surgery',
        experience: '30+ Years Experience',
        hospital: 'Apollo Hospital, Navi Mumbai',
        address: 'Belapur, Navi Mumbai - 400614',
        phone: '+91 22 6280 1000',
        email: 'prashant.agrawal@apollohospitals.com',
        hours: 'Mon-Fri 9AM-2PM',
        specializations: 'Joint Replacement, Trauma',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.8/5 (540 reviews)'
      },
      {
        name: 'Dr. Niranjan Deshmukh',
        credentials: 'MBBS, MS (Ortho), Joint Replacement Specialist',
        experience: '18+ Years Experience',
        hospital: 'Lilavati Hospital',
        address: 'Bandra West, Mumbai - 400050',
        phone: '+91 22 2656 8300',
        email: 'niranjan.deshmukh@lilavatihospital.com',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Hip & Knee Replacement',
        bookingLink: 'https://www.lilavatihospital.com',
        rating: '4.8/5 (430 reviews)'
      },

    {
        name: 'Dr. Mohit Kukreja',
        credentials: 'MBBS, MS (Orthopedics), Ex-Asst. Prof. JJ Hospital',
        experience: '17+ Years Experience',
        hospital: 'Grant Medical College/Sir J.J. Group of Hospitals',
        address: 'JJ Marg, Mumbai - 400008',
        phone: '+91 22 2370 8700',
        email: 'mohit.kukreja@drmohitkukreja.com',
        hours: 'Mon-Sat 10AM-5PM',
        specializations: 'Arthroscopy, Robotic Joint Replacement, Sports Ortho',
        bookingLink: 'https://www.drmohitkukreja.com',
        rating: '4.9/5 (610 reviews)'
    },
    {
        name: 'Dr. Siddharth Shah',
        credentials: 'MS (Ortho), MRCPS (UK), PGDip CAOS (UK)',
        experience: '26+ Years Experience',
        hospital: 'Smt. S R Mehta & Sir K P Cardiac Institute',
        address: 'Sion East, Mumbai - 400022',
        phone: '+91 22 2406 3400',
        email: 'siddharth.shah@srmehtahospital.com',
        hours: 'Mon-Fri 9AM-4PM',
        specializations: 'Computer-Assisted Joint Surgery, Spine, Trauma',
        bookingLink: 'https://www.msmedical.care',
        rating: '4.8/5 (510 reviews)'
    }
  ],
  'Bangalore': [
    {
        name: 'Dr. Chandrashekar P',
        credentials: 'MBBS, MS (Ortho), Director & HOD Orthopedics, Sakra',
        experience: '26+ Years Experience',
        hospital: 'Sakra World Hospital',
        address: 'Outer Ring Road, Marathahalli, Bangalore - 560103',
        phone: '+91 80 4969 4969',
        email: 'chandrashekar.p@sakraworldhospital.com',
        hours: 'Mon-Sat 9AM-4PM',
        specializations: 'Robotic Joint Replacement, Meniscus Transplant, Hip/Knee/Shoulder',
        bookingLink: 'https://www.sakraworldhospital.com',
        rating: '4.9/5 (1500 reviews)'
    },
    {
        name: 'Dr. Shantharam Shetty',
        credentials: 'MBBS, MS (Ortho), Consultant',
        experience: '44+ Years Experience',
        hospital: 'Manipal Hospital',
        address: 'Old Airport Road, Bangalore - 560017',
        phone: '+91 80 2502 4444',
        email: 'shantharam.shetty@manipalhospitals.com',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Joint Replacement, Trauma, Pediatric Ortho',
        bookingLink: 'https://www.manipalhospitals.com',
        rating: '4.8/5 (690 reviews)'
      },
      {
        name: 'Dr. S Vidyadhara',
        credentials: 'MS (Ortho), DNB, Spine & Ortho Surgeon',
        experience: '17+ Years Experience',
        hospital: 'Manipal Hospital',
        address: 'Old Airport Road, Bangalore - 560017',
        phone: '+91 80 2502 4444',
        email: 'vidyadhara.s@manipalhospitals.com',
        hours: 'Mon-Fri 9AM-5PM',
        specializations: 'Spine Surgery, Orthopedics',
        bookingLink: 'https://www.manipalhospitals.com',
        rating: '4.7/5 (430 reviews)'
      },
    {
        name: 'Dr. Abhijit Chavan',
        credentials: 'MBBS, MS (Orthopedics)',
        experience: '22+ Years Experience',
        hospital: 'SPARSH Hospital',
        address: 'Yeshwanthpur, Bangalore - 560022',
        phone: '+91 80 6165 6222',
        email: 'abhijit.chavan@sparshhospital.com',
        hours: 'Mon-Fri 9AM-5PM',
        specializations: 'Joint Replacement, Trauma, Sports Injuries',
        bookingLink: 'https://www.sparshhospital.com',
        rating: '4.8/5 (870 reviews)'
    },
    {
        name: 'Dr. Anil R Patil',
        credentials: 'MBBS, MS (Orthopedics), Consultant',
        experience: '28+ Years Experience',
        hospital: 'SPARSH Hospital',
        address: 'HSR Layout, Bangalore - 560102',
        phone: '+91 80 6165 6222',
        email: 'anil.patil@sparshhospital.com',
        hours: 'Mon-Sat 10AM-5PM',
        specializations: 'Sports Injuries, Trauma, Joint Care',
        bookingLink: 'https://www.sparshhospital.com',
        rating: '4.7/5 (680 reviews)'
    },

    {
      name: 'Dr. Chandrashekar P',
      credentials: 'MBBS, MS (Ortho), Director Sakra World Hospital',
      experience: '26+ Years Experience',
      hospital: 'Sakra World Hospital',
      address: 'Outer Ring Road, Marathahalli, Bangalore - 560103',
      phone: '+91 80 4969 4969',
      email: 'chandrashekar.p@sakraworldhospital.com',
      hours: 'Mon-Sat 9AM-4PM',
      specializations: 'Robotic Joint Replacement, Meniscus Transplant, Hip/Knee/Shoulder',
      bookingLink: 'https://www.sakraworldhospital.com',
      rating: '4.9/5 (1500 reviews)'
    },
    {
      name: 'Dr. Uday Kumar',
      credentials: 'MBBS, MS, DNB – Consultant Orthopedics',
      experience: '30+ Years Experience',
      hospital: 'P.D. Hinduja Sindhi Hospital',
      address: 'Sampangirama Nagar, Bangalore - 560027',
      phone: '+91 80 2676 0700',
      email: 'uday.kumar@hindujasindhihospital.com',
      hours: 'Mon-Fri 9AM-3PM',
      specializations: 'Arthroscopic Surgery, Joint Replacement, Trauma',
      bookingLink: 'https://www.hindujasindhihospital.com',
      rating: '4.8/5 (760 reviews)'
    },
    {
      name: 'Dr. Manohar C.V',
      credentials: 'D.Ortho, DNB – Orthopedic Surgery',
      experience: '25+ Years Experience',
      hospital: 'P.D. Hinduja Sindhi Hospital',
      address: 'Sampangirama Nagar, Bangalore - 560027',
      phone: '+91 80 2676 0700',
      email: 'manohar.cv@hindujasindhihospital.com',
      hours: 'Mon-Sat 10AM-5PM',
      specializations: 'Sports Injuries, Ligament, Trauma Surgery',
      bookingLink: 'https://www.hindujasindhihospital.com',
      rating: '4.7/5 (610 reviews)'
    }
  ],
'Ahmedabad': [
    {
    name: 'Dr. Tejas Gandhi',
    credentials: 'MBBS, MS (Ortho), Joint Replacement Specialist',
    experience: '20+ Years Experience',
    hospital: 'Arihant Orthopaedic Hospital',
    address: 'Satellite, Ahmedabad - 380015',
    phone: '+91 98241 56256',
    email: 'tejasgandhi@gmail.com',
    hours: 'Mon-Fri 10AM-6PM',
    specializations: 'Knee & Hip Replacement, Trauma, Ligaments',
    bookingLink: 'https://drtejasgandhi.com',
    rating: '4.8/5 (420 reviews)'
    },
    {
        name: 'Dr. Rajesh K Shah',
        credentials: 'MBBS, MS, DNB – Ortho, Consultant',
        experience: '25+ Years Experience',
        hospital: 'H N Reliance Hospital',
        address: 'Chelsea, Ahmedabad',
        phone: '+91 22 3987 8999',
        email: 'rajesh.shah@reliancehospital.com',
        hours: 'Mon-Sat 10AM-6PM',
        specializations: 'Knee Replacement, Trauma, Bone Disorders',
        bookingLink: 'https://www.reliancehospital.com',
        rating: '4.7/5 (310 reviews)'
      },
      {
        name: 'Dr. Ramesh Patel',
        credentials: 'MBBS, MS (Ortho), Joint Replacement/Trauma',
        experience: '32+ Years Experience',
        hospital: 'Shalby Hospital',
        address: 'Satellite, Ahmedabad - 380015',
        phone: '+91 79 4020 3000',
        email: 'ramesh.patel@shalby.org',
        hours: 'Mon-Sat 9AM-4PM',
        specializations: 'Arthroscopy, Joint Replacement, Trauma',
        bookingLink: 'https://www.shalby.org',
        rating: '4.8/5 (340 reviews)'
      },
    {
    name: 'Dr. Hardik Padhiyar',
    credentials: 'MBBS, MS (Ortho), Consultant Orthopedic Surgeon',
    experience: '18+ Years Experience',
    hospital: 'Vedant Hospital',
    address: 'Gota, Ahmedabad - 382481',
    phone: '+91 95863 12124',
    email: 'hardikpadhiyar@gmail.com',
    hours: 'Mon-Sat 9AM-5PM',
    specializations: 'Joint Replacement, Shoulder, Trauma',
    bookingLink: 'https://drhardikortho.com',
    rating: '4.8/5 (260 reviews)'
    },
    {
    name: 'Dr. Hiren Patel',
    credentials: 'MBBS, MS (Ortho), Director PMG Hospital',
    experience: '15+ Years Experience',
    hospital: 'PMG Hospital',
    address: 'Nagari Hospital Campus, Ahmedabad - 380004',
    phone: '+91 98790 25000',
    email: 'hiren.patel@pmghospital.com',
    hours: 'Mon-Fri 9AM-5PM',
    specializations: 'Joint Replacement, Hip/Knee, ACL',
    bookingLink: 'https://pmghospital.com',
    rating: '4.7/5 (180 reviews)'
    }
],

'Chennai': [
    {
      name: 'Prof. Dr. S. Sundar',
      credentials: 'MS (Ortho), MCh, Fellowship in Arthroscopy',
      experience: '40+ Years Experience',
      hospital: 'VS Hospitals',
      address: 'Kilpauk, Chennai - 600010',
      phone: '+91 44 4288 8888',
      email: 'sundar.s@vshospitals.com',
      hours: 'Mon-Sat 10AM-5PM',
      specializations: 'Arthroscopy, Joint Replacement, Geriatric Ortho',
      bookingLink: 'https://www.vshospitals.com',
      rating: '4.9/5 (960 reviews)'
    },
    {
        name: 'Dr. C. Rajasekhara Reddy',
        credentials: 'MBBS, MS (Ortho), 39+ Years Experience',
        experience: '39+ Years Experience',
        hospital: 'Vijaya Hospital',
        address: 'Vadapalani, Chennai - 600026',
        phone: '+91 44 6677 8800',
        email: 'rajasekhara.reddy@vijayahospital.in',
        hours: 'Mon-Fri 10AM-6PM',
        specializations: 'Arthroscopy, Hip/Knee Replacement',
        bookingLink: 'https://www.vijayahospital.com',
        rating: '4.8/5 (430 reviews)'
      },
      {
        name: 'Dr. Omer Sheriff',
        credentials: 'MBBS, D.Ortho, MS, Fellowship Joint Replacement',
        experience: '24+ Years Experience',
        hospital: 'Royapettah Orthopedic Center',
        address: 'Royapettah, Chennai - 600014',
        phone: '+91 44 4567 8901',
        email: 'omersheriff@gmail.com',
        hours: 'Mon-Fri 10AM-5PM',
        specializations: 'Knee & Hip Replacement, Trauma Care',
        bookingLink: 'https://www.omerortho.com',
        rating: '4.7/5 (220 reviews)'
      },
    {
      name: 'Dr. L. Bharath',
      credentials: 'MBBS, MS (Ortho), FRCS (UK)',
      experience: '32+ Years Experience',
      hospital: 'Bharath Orthopaedics',
      address: 'Anna Nagar, Chennai - 600040',
      phone: '+91 98408 99575',
      email: 'drbharath@bharathorthopaedics.com',
      hours: 'Mon-Sat 9AM-5PM',
      specializations: 'Knee & Hip Replacement, Sports Injury',
      bookingLink: 'https://www.bharathorthopaedics.com',
      rating: '4.9/5 (820 reviews)'
    },
    {
      name: 'Dr. Madan Mohan Reddy',
      credentials: 'MBBS, MS, MD, FRCS',
      experience: '25+ Years Experience',
      hospital: 'Apollo Hospitals',
      address: 'Greams Road, Chennai - 600006',
      phone: '+91 44 2829 3333',
      email: 'madan.mohan@apollohospitals.com',
      hours: 'Mon-Sat 11AM-7PM',
      specializations: 'Joint Replacement, Trauma, Pediatric Ortho',
      bookingLink: 'https://www.apollohospitals.com',
      rating: '4.8/5 (700 reviews)'
    }
],

'Kolkata': [
    {
      name: 'Dr. Kushal Nag',
      credentials: 'MBBS, MS (Ortho), Fellowship Foot & Ankle Surgery',
      experience: '20+ Years Experience',
      hospital: 'Apollo Multispeciality Hospitals',
      address: 'Canal Circular Road, Kolkata - 700054',
      phone: '+91 33 2320 3040',
      email: 'kushal.nag@apollohospitals.com',
      hours: 'Mon-Sat 10AM-6PM',
      specializations: 'Foot & Ankle Surgery, Joint Replacement',
      bookingLink: 'https://www.apollohospitals.com',
      rating: '4.9/5 (680 reviews)'
    },
    {
        name: 'Dr. Anirban Chatterjee',
        credentials: 'MBBS, MS, DNB, Consultant',
        experience: '20+ Years Experience',
        hospital: 'Apollo Gleneagles Hospital',
        address: 'Salt Lake, Kolkata - 700096',
        phone: '+91 33 2320 3040',
        email: 'anirban.chatterjee@apollohospitals.com',
        hours: 'Mon-Fri 9AM-4PM',
        specializations: 'Joint Replacement, Trauma, Pediatric Ortho',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.8/5 (270 reviews)'
      },
    {
      name: 'Dr. Amitava Narayan Mukherjee',
      credentials: 'MBBS, MCh (Ortho)',
      experience: '38+ Years Experience',
      hospital: 'MED 7 Clinic',
      address: 'Salt Lake, Kolkata - 700091',
      phone: '+91 33 2337 6501',
      email: 'amitava.mukherjee@med7clinic.com',
      hours: 'Mon-Sat 10AM-5PM',
      specializations: 'Joint Replacement, Trauma Surgery, Orthopedic Oncology',
      bookingLink: 'https://www.med7clinic.com',
      rating: '4.8/5 (230 reviews)'
    }
],

'Pune': [
    {
      name: 'Dr. Sachin Tapasvi',
      credentials: 'MBBS, MS (Ortho), DNB, Fellowship in Joint Replacement',
      experience: '18+ Years Experience',
      hospital: 'Ortho Clinic, Pune',
      address: 'FC Road, Pune - 411004',
      phone: '+91 20 2553 5911',
      email: 'sachin.tapasvi@drsachintapasvi.com',
      hours: 'Mon-Sat 10AM-6PM',
      specializations: 'Knee & Hip Replacement, Sports Ortho',
      bookingLink: 'https://www.drsachintapasvi.com',
      rating: '4.9/5 (300 reviews)'
    },
    {
    name: 'Dr. Ashok Shyam',
    credentials: 'MBBS, MS (Ortho), Consultant',
    experience: '18+ Years Experience',
    hospital: 'Deenanath Mangeshkar Hospital',
    address: 'Erandwane, Pune - 411004',
    phone: '+91 20 4015 5555',
    email: 'ashok.shyam@dmhospital.org',
    hours: 'Mon-Sat 10AM-5PM',
    specializations: 'Trauma, Joint Replacement, Research Ortho',
    bookingLink: 'https://www.dmhospital.org',
    rating: '4.6/5 (210 reviews)'
    },
    {
      name: 'Dr. Rahul Bade',
      credentials: 'MBBS, MS (Ortho), Founder Sparsh & Bade Hospital',
      experience: '20+ Years Experience',
      hospital: 'Sparsh Hospital',
      address: 'Wakad, Pune - 411057',
      phone: '+91 20 4921 5040',
      email: 'rahul.bade@sparshhospital.com',
      hours: 'Mon-Sat 9AM-5PM',
      specializations: 'Knee & Shoulder Surgery, Sports Injuries',
      bookingLink: 'https://www.sparshhospital.com',
      rating: '4.8/5 (280 reviews)'
    }
],

'Hyderabad': [
    {
      name: 'Dr. A.V. Gurava Reddy',
      credentials: 'MBBS, MCh Ortho, FRCS – Joint Replacement',
      experience: '33+ Years Experience',
      hospital: 'KIMS Sunshine Hospitals',
      address: 'Begumpet, Hyderabad - 500003',
      phone: '+91 40 4455 5000',
      email: 'guravareddy@kimssunshine.co.in',
      hours: 'Mon-Sat 10AM-6PM',
      specializations: 'Knee Replacement, Hip Replacement, Robotic Surgery',
      bookingLink: 'https://kimssunshine.co.in',
      rating: '4.9/5 (2100 reviews)'
    },
    {
        name: 'Dr. Hari Prakash',
        credentials: 'MBBS, D Ortho, DNB, Joint Replacement',
        experience: '8+ Years Experience',
        hospital: 'KIMS Hospitals',
        address: 'Secunderabad, Hyderabad - 500003',
        phone: '+91 40 4455 5000',
        email: 'hariprakash@kimshospitals.com',
        hours: 'Mon-Sat 10AM-4PM',
        specializations: 'Joint Replacement, Trauma',
        bookingLink: 'https://www.kimshospitals.com',
        rating: '4.7/5 (180 reviews)'
      },
    {
      name: 'Dr. Sunil Dachepalli',
      credentials: 'MS (Ortho), MRCS, CCBST, MSc (Tr & Ortho), MCH (Ortho), FRCS (Tr & Ortho)',
      experience: '19+ Years Experience',
      hospital: 'Sunshine Hospitals',
      address: 'Secunderabad, Hyderabad - 500003',
      phone: '+91 40 4455 5000',
      email: 'dachepalli.sunil@sunshinehospitals.com',
      hours: 'Mon-Fri 10AM-5PM',
      specializations: 'Computer-Assisted Joint Replacement, Sports Ortho',
      bookingLink: 'https://sunshinehospitals.com',
      rating: '4.7/5 (780 reviews)'
    }
],

'Jaipur': [
    {
      name: 'Dr. Sohan Singh Sankhla',
      credentials: 'MBBS, MS (Ortho)',
      experience: '55+ Years Experience',
      hospital: 'Metro MAS Hospital',
      address: 'Mansarovar, Jaipur - 302020',
      phone: '+91 141 3989 800',
      email: 'sohan.sankhla@metrohospital.com',
      hours: 'Mon-Sat 10AM-5PM',
      specializations: 'Spine Surgery, Joint Replacement, Orthopedic Trauma',
      bookingLink: 'https://metromashospital.com',
      rating: '4.8/5 (290 reviews)'
    }
],

'Noida': [
    {
      name: 'Dr. Rajagopalan Krishnan',
      credentials: 'MBBS, MS (Ortho)',
      experience: '40+ Years Experience',
      hospital: 'Apollo Hospitals Noida',
      address: 'Sector 26, Noida - 201301',
      phone: '+91 120 4012 401',
      email: 'rajagopalan.krishnan@apollohospitals.com',
      hours: 'Mon-Fri 9AM-4PM',
      specializations: 'Spine Surgery, Orthopedic Oncology, Joint Replacement',
      bookingLink: 'https://apollohospitals.com',
      rating: '4.7/5 (370 reviews)'
    }
]

};

// ========================================================================
// FAQS ARRAY
// ========================================================================
const faqs = [
  {
    icon: '🦴',
    question: 'What is osteoporosis?',
    answer: 'Osteoporosis is a condition in which bones become weak and brittle due to reduced bone mass, increasing the risk of fractures.',
    citation: '<a href="https://www.nhp.gov.in/disease/musculo-skeletal-bone-joint-/osteoporosis" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Health Portal: Osteoporosis</a>'
  },
  {
    icon: '🦵',
    question: 'What are the main symptoms of osteoarthritis?',
    answer: 'Symptoms include joint pain, stiffness, swelling, reduced flexibility, and a grating sensation during movement.',
    citation: '<a href="https://www.cdc.gov/arthritis/basics/osteoarthritis.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC: Osteoarthritis Basics</a>'
  },
  {
    icon: '🖖',
    question: 'How is a bone fracture diagnosed?',
    answer: 'Diagnosis is made using physical examination and confirmed with imaging studies such as X-rays, CT scans, or MRI.',
    citation: '<a href="https://orthoinfo.aaos.org/en/diseases--conditions/fractures-broken-bones/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Fractures</a>'
  },
  {
    icon: '🦴',
    question: 'How can I keep my bones healthy?',
    answer: 'By eating a balanced diet rich in calcium and vitamin D, performing weight-bearing exercises, and avoiding smoking or excessive alcohol.',
    citation: '<a href="https://www.niams.nih.gov/health-topics/bone-health-and-osteoporosis" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIAMS: Bone Health</a>'
  },
  {
    icon: '🩹',
    question: 'What is the difference between a sprain and a strain?',
    answer: 'A sprain is an injury to ligaments, while a strain is an injury to muscles or tendons.',
    citation: '<a href="https://orthoinfo.aaos.org/en/diseases--conditions/sprains-strains/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Sprains and Strains</a>'
  },
  {
    icon: '🦵',
    question: 'What does a ligament tear feel like?',
    answer: 'A ligament tear usually causes sudden pain, swelling, joint instability, and difficulty in movement.',
    citation: '<a href="https://www.hopkinsmedicine.org/health/conditions-and-diseases/sprains" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Johns Hopkins: Sprains</a>'
  },
  {
    icon: '🏃‍♂️',
    question: 'How can athletes prevent sports injuries?',
    answer: 'Proper warm-up, stretching, using correct equipment, and resting between workouts help prevent sports injuries.',
    citation: '<a href="https://orthoinfo.aaos.org/en/staying-healthy/sports-injury-prevention/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Sports Injury Prevention</a>'
  },
  {
    icon: '🦴',
    question: 'What is spinal stenosis?',
    answer: 'Spinal stenosis is the narrowing of spaces in the spine, putting pressure on spinal nerves and causing pain or numbness.',
    citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/spinal-stenosis" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Spinal Stenosis</a>'
  },
  {
    icon: '💊',
    question: 'What are non-surgical treatments for herniated disc?',
    answer: 'Rest, physiotherapy, anti-inflammatory medication, and steroid injections are common non-surgical treatments.',
    citation: '<a href="https://www.hopkinsmedicine.org/health/conditions-and-diseases/herniated-disc" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Johns Hopkins: Herniated Disc</a>'
  },
  {
    icon: '♿',
    question: 'When is joint replacement surgery recommended?',
    answer: 'It is considered for severe arthritis or joint damage when pain and disability cannot be managed with other treatments.',
    citation: '<a href="https://orthoinfo.aaos.org/en/treatment/joint-replacement/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Joint Replacement</a>'
  },
  {
    icon: '⏳',
    question: 'How long does recovery take after hip replacement?',
    answer: 'Most people recover in 6-12 weeks, but full function may take up to 6 months with proper rehabilitation.',
    citation: '<a href="https://orthoinfo.aaos.org/en/treatment/hip-replacement-surgery/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Hip Replacement</a>'
  },
  {
    icon: '💪',
    question: 'Why is physiotherapy important after fracture or surgery?',
    answer: 'Physiotherapy restores movement, strength, and function, and helps prevent stiffness or complications.',
    citation: '<a href="https://www.nhs.uk/conditions/physiotherapy/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NHS: Physiotherapy</a>'
  },
  {
    icon: '🧒',
    question: 'Can children get bone diseases?',
    answer: 'Yes, conditions like rickets, juvenile arthritis, or congenital disorders can affect children’s bones.',
    citation: '<a href="https://www.cdc.gov/ncbddd/jra/facts.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC: Juvenile Arthritis</a>'
  },
  {
    icon: '✋',
    question: 'What is carpal tunnel syndrome?',
    answer: 'It is caused by compression of the median nerve at the wrist, resulting in numbness and tingling in the hand.',
    citation: '<a href="https://www.nhs.uk/conditions/carpal-tunnel-syndrome/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NHS: Carpal Tunnel Syndrome</a>'
  },
  {
    icon: '🥛',
    question: 'What should I eat for strong bones?',
    answer: 'Calcium- and vitamin D-rich foods such as dairy, leafy green vegetables, eggs, and fish promote bone health.',
    citation: '<a href="https://www.cdc.gov/nutrition/data-statistics/know-your-limit-for-added-sugars.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC: Healthy Eating</a>'
  },
  {
    icon: '🦴',
    question: 'Can osteoporosis be prevented?',
    answer: 'Yes, with regular weight-bearing exercise, sufficient calcium and vitamin D, and avoiding smoking/alcohol.',
    citation: '<a href="https://www.nhs.uk/conditions/osteoporosis/prevention/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NHS: Osteoporosis Prevention</a>'
  },
  {
    icon: '🦶',
    question: 'What is plantar fasciitis?',
    answer: 'It’s inflammation of tissue along the bottom of the foot causing heel pain—common in runners and overweight individuals.',
    citation: '<a href="https://orthoinfo.aaos.org/en/diseases--conditions/plantar-fasciitis-and-bone-spurs/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Plantar Fasciitis</a>'
  },
  {
    icon: '🦴',
    question: 'Are bone tumors always cancerous?',
    answer: 'No, many are benign (non-cancerous), though all abnormal bone growths should be evaluated by a doctor.',
    citation: '<a href="https://www.cancer.gov/types/bone/patient/bone-treatment-pdq" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI: Bone Cancer</a>'
  },
  {
    icon: '🌀',
    question: 'What causes back pain?',
    answer: 'Most commonly muscle strain, disc problems, arthritis, poor posture, or injury.',
    citation: '<a href="https://www.ninds.nih.gov/health-information/disorders/back-pain" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Back Pain</a>'
  },
  {
    icon: '🕰',
    question: 'When should I see a doctor for joint pain?',
    answer: 'If pain persists for more than a few weeks, is severe, or is associated with swelling, redness, or restricted motion.',
    citation: '<a href="https://www.cdc.gov/arthritis/basics/symptoms.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC: Arthritis Symptoms</a>'
  },
  {
    icon: '🦴',
    question: 'What is scoliosis?',
    answer: 'Scoliosis is an abnormal sideways curvature of the spine, often developing during adolescence.',
    citation: '<a href="https://www.niams.nih.gov/health-topics/scoliosis" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIAMS: Scoliosis</a>'
  },
  {
    icon: '🧑‍⚕️',
    question: 'Do all fractures need surgery?',
    answer: 'No, some fractures heal with casting or splints, but displaced or severe fractures may require surgery.',
    citation: '<a href="https://orthoinfo.aaos.org/en/treatment/fractures-broken-bones/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Fractures</a>'
  },
  {
    icon: '🔵',
    question: 'What is kyphosis?',
    answer: 'Kyphosis is excessive forward rounding of the upper back, sometimes called "hunchback."',
    citation: '<a href="https://www.hopkinsmedicine.org/health/conditions-and-diseases/kyphosis" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Johns Hopkins: Kyphosis</a>'
  },
  {
    icon: '💉',
    question: 'What are joint injections, and do they help arthritis?',
    answer: 'Injections like corticosteroids or hyaluronic acid can offer symptom relief for some joint conditions.',
    citation: '<a href="https://www.versusarthritis.org/about-arthritis/treatments/drugs/joint-injections/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Versus Arthritis: Joint Injections</a>'
  },
  {
    icon: '⏸',
    question: 'What is a frozen shoulder?',
    answer: 'Frozen shoulder, or adhesive capsulitis, is painful stiffness and loss of motion in the shoulder joint.',
    citation: '<a href="https://orthoinfo.aaos.org/en/diseases--conditions/frozen-shoulder" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Frozen Shoulder</a>'
  },
  {
    icon: '🔬',
    question: 'What is a bone density test and why is it important?',
    answer: 'A bone density (DEXA) scan measures bone strength, aiding in osteoporosis diagnosis and fracture risk assessment.',
    citation: '<a href="https://www.cdc.gov/nutrition/data-statistics/bone-density-test.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC: Bone Density Test</a>'
  },
  {
    icon: '🧂',
    question: 'What is gout, and how is it related to orthopedics?',
    answer: 'Gout is an inflammatory arthritis caused by uric acid crystal accumulation in the joints—commonly the big toe.',
    citation: '<a href="https://www.cdc.gov/arthritis/basics/gout.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC: Gout</a>'
  },
  {
    icon: '📏',
    question: 'What is leg length discrepancy?',
    answer: 'A difference in leg lengths due to birth defects, injury, or disease, sometimes requiring shoe inserts or surgery.',
    citation: '<a href="https://orthoinfo.aaos.org/en/diseases--conditions/leg-length-discrepancy/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Leg Length Discrepancy</a>'
  },
  {
    icon: '🦴',
    question: 'What are common causes for recurrent dislocation?',
    answer: 'Loose ligaments, shallow joints, or previous severe injuries can cause repeat joint dislocations.',
    citation: '<a href="https://orthoinfo.aaos.org/en/diseases--conditions/dislocated-shoulder/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Dislocated Joint</a>'
  },
  {
    icon: '🔧',
    question: 'What is the purpose of orthopedic implants?',
    answer: 'Implants like plates, screws, or rods stabilize bone fragments in fractures or support joint replacements.',
    citation: '<a href="https://www.fda.gov/medical-devices/orthopedic-devices/overview-orthopedic-implants" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">FDA: Orthopedic Implants</a>'
  },
  {
    icon: '🚶',
    question: 'How soon can you walk after knee replacement?',
    answer: 'Most patients begin walking with assistance a day or two after surgery and progress with physiotherapy.',
    citation: '<a href="https://orthoinfo.aaos.org/en/treatment/total-knee-replacement-surgery/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Knee Replacement</a>'
  },
  {
    icon: '🦴',
    question: 'What is osteomyelitis?',
    answer: 'Osteomyelitis is infection and inflammation of the bone, typically needing antibiotics and sometimes surgery.',
    citation: '<a href="https://orthoinfo.aaos.org/en/diseases--conditions/osteomyelitis" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Osteomyelitis</a>'
  },
  {
    icon: '🧑‍⚕️',
    question: 'Can orthopedic conditions be inherited?',
    answer: 'Some, like osteogenesis imperfecta or certain spine deformities, may run in families due to genetic mutations.',
    citation: '<a href="https://rarediseases.info.nih.gov/diseases/7817/osteogenesis-imperfecta" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Osteogenesis Imperfecta</a>'
  },
  {
    icon: '🔩',
    question: 'How long do orthopedic implants last?',
    answer: 'Many modern joint replacements and implants last 15–20 years, but this varies depending on activity and health.',
    citation: '<a href="https://orthoinfo.aaos.org/en/treatment/total-joint-replacement/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Joint Replacement Longevity</a>'
  },
  {
    icon: '🏥',
    question: "What is minimally invasive orthopedic surgery?",
    answer: "It's surgery with smaller cuts, less tissue damage, and faster healing compared to traditional open procedures.",
    citation: '<a href="https://www.hopkinsmedicine.org/health/treatment-tests-and-therapies/minimally-invasive-orthopedic-surgery" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Johns Hopkins: Minimally Invasive Ortho Surgery</a>'
  },
  {
    icon: '🔬',
    question: 'How is arthritis diagnosed?',
    answer: 'Through symptoms, physical exam, X-rays, blood tests, and sometimes joint fluid analysis.',
    citation: '<a href="https://www.cdc.gov/arthritis/basics/diagnosis.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC: Arthritis Diagnosis</a>'
  },
  {
    icon: '🦵',
    question: 'What is a meniscus tear?',
    answer: 'A cartilage tear in the knee, common with twisting injuries, causing pain and swelling.',
    citation: '<a href="https://orthoinfo.aaos.org/en/diseases--conditions/meniscus-tears/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Meniscus Tear</a>'
  },
  {
    icon: '💡',
    question: 'Can poor posture cause long-term damage?',
    answer: 'Persistent poor posture leads to chronic pain, muscle weakness, spinal alignment issues, and joint stress.',
    citation: '<a href="https://www.acatoday.org/news-publications/newsroom/consumers/poor-posture-and-back-pain/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">American Chiropractic Association: Posture</a>'
  },
  {
    icon: '🥼',
    question: "What's an orthopedic oncologist?",
    answer: 'A doctor specializing in bone and soft tissue cancers, including diagnosis, surgery, and reconstruction.',
    citation: '<a href="https://www.cancer.org/cancer/bone-cancer/about/what-is-bone-cancer.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">American Cancer Society: Bone Cancer</a>'
  },
  {
    icon: '🏃',
    question: 'Which exercises are best for joint health?',
    answer: 'Swimming, cycling, walking, low-impact aerobics, and strengthening and stretching routines are ideal.',
    citation: '<a href="https://www.arthritis.org/health-wellness/healthy-living/physical-activity" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Arthritis Foundation: Physical Activity</a>'
  },
  {
    icon: '🦵',
    question: 'What is bursitis?',
    answer: 'It is the inflammation of the bursa, a fluid-filled sac that provides cushion around joints.',
    citation: '<a href="https://orthoinfo.aaos.org/en/diseases--conditions/bursitis/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Bursitis</a>'
  },
  {
    icon: '🧬',
    question: 'What is osteogenesis imperfecta?',
    answer: 'A rare genetic disorder causing brittle bones that break easily, often with minimal trauma.',
    citation: '<a href="https://rarediseases.info.nih.gov/diseases/7817/osteogenesis-imperfecta" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH: Osteogenesis Imperfecta</a>'
  },
  {
    icon: '⚡',
    question: 'What causes tingling and numbness in my limbs?',
    answer: 'Nerve compression, slipped disc, neuropathy or carpal tunnel syndrome can cause these symptoms.',
    citation: '<a href="https://www.hopkinsmedicine.org/health/symptoms-and-conditions/numbness-or-tingling" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Johns Hopkins: Numbness</a>'
  },
  {
    icon: '🥅',
    question: 'How are sports injuries managed?',
    answer: 'With RICE (rest, ice, compression, elevation), physical therapy, medications, or surgery as needed.',
    citation: '<a href="https://orthoinfo.aaos.org/en/staying-healthy/how-to-prevent-injuries-in-sports/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Sports Injuries</a>'
  },
  {
    icon: '🩹',
    question: 'How do I care for a cast at home?',
    answer: 'Keep it dry, avoid inserting objects inside, and watch for signs of tightness, pain, or swelling.',
    citation: '<a href="https://www.cedars-sinai.org/health-library/diseases-and-conditions/c/cast-care.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Cedars-Sinai: Cast Care</a>'
  },
  {
    icon: '🦴',
    question: 'What is avascular necrosis?',
    answer: 'Avascular necrosis is the death of bone tissue due to loss of blood supply, often affecting the hip.',
    citation: '<a href="https://orthoinfo.aaos.org/en/diseases--conditions/osteonecrosis-avascular-necrosis" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAOS: Osteonecrosis</a>'
  }

];

// ========================================================================
// NEW DATA STRUCTURES FOR EMPTY SECTIONS
// ========================================================================

const whenToSeeData = [

         // --- 1. Bone and Joint Pain ---
        {
            icon: '🦴',
            question: 'Persistent Joint or Bone Pain Lasting More Than 2 Weeks',
            answer: 'See an orthopedist if:<br>• Pain does not improve with rest or medication<br>• Pain disrupts sleep or daily activities<br>• There is visible swelling or warmth<br><br>Early care prevents worsening and joint damage.',
            citation: 'AAOS. Chronic Joint Pain. 2025.'
        },
        {
            icon: '⚡',
            question: 'Sudden Severe Bone Pain After Injury or Trauma',
            answer: 'Seek IMMEDIATE orthopedic evaluation if:<br>• You heard a "crack" at injury<br>• You cannot bear weight or use the limb<br>• The bone appears deformed<br><br>These are signs of possible fracture needing urgent care.',
            citation: 'Mayo Clinic. Fracture Emergency. 2025.'
        },

        // --- 2. Swelling & Redness ---
        {
            icon: '🦵',
            question: 'Joint Swelling With Heat, Redness, or Limited Motion',
            answer: 'See an orthopedist if:<br>• Swelling appears suddenly<br>• Joint feels warm/red<br>• You have fever or are unable to move the joint<br><br>Can indicate infection or inflammatory arthritis.',
            citation: 'Johns Hopkins. Swollen Joints. 2024.'
        },

        // --- 3. Deformity or Instability ---
        {
            icon: '👣',
            question: 'Joint Feels Unstable, Gives Out, or is Deformed',
            answer: 'Orthopedic assessment is needed if:<br>• Joints buckle, lock, or shift on movement<br>• Visible deformity emerged after injury<br><br>Ligament tears, dislocations or fractures require timely intervention.',
            citation: 'AAOS. Joint Instability. 2024.'
        },

        // --- 4. Difficulty Walking or Using Limb ---
        {
            icon: '🚶',
            question: 'Unable to Walk, Bear Weight, or Use Limb Normally',
            answer: 'Immediate attention is required if:<br>• You cannot stand or walk after injury<br>• There’s numbness or tingling<br>• Walking causes intense pain<br><br>These may signal fracture or nerve injury.',
            citation: 'Mayo Clinic. Limb Injury. 2025.'
        },

        // --- 5. Numbness, Tingling, or Loss of Function ---
        {
            icon: '🤚',
            question: 'Numbness, Weakness, or Loss of Movement in Arm/Leg',
            answer: 'See an orthopedist if:<br>• You notice loss of sensation or movement<br>• Symptoms appear suddenly after injury<br><br>May indicate nerve compression or serious trauma.',
            citation: 'AAOS. Nerve Compression. 2025.'
        },

        // --- 6. Obvious Fracture or Open Wound ---
        {
            icon: '🩸',
            question: 'Bone Poking Through Skin or Visible Wound',
            answer: 'This is an emergency.<br>• Call emergency services or go to ER<br>• Do not move the limb unnecessarily<br><br>Open fractures need urgent surgical care.',
            citation: 'Mayo Clinic. Open Fractures. 2025.'
        },

        // --- 7. Locking, Popping, or Catching Sensation ---
        {
            icon: '🔒',
            question: 'Joint “Locks,” “Catches,” or Pops Repeatedly',
            answer: 'See an orthopedist if:<br>• Locking stops you from moving the joint<br>• There is pain or swelling<br><br>These symptoms may mean meniscus tear or cartilage injury.',
            citation: 'AAOS. Joint Locking and Popping. 2024.'
        },

        // --- 8. Unresponsive to Home Treatment ---
        {
            icon: '🏡',
            question: 'Pain or Swelling Not Improving with Home Remedies',
            answer: 'If rest, ice, and over-the-counter medication do not improve your symptoms in 3-5 days,<br>• consult an orthopedist for further evaluation.',
            citation: 'Johns Hopkins. When to See an Orthopedic Specialist. 2025.'
        },

        // --- 9. Suspected Infection ---
        {
            icon: '🌡️',
            question: 'Red, Swollen Joint with Fever or Chills',
            answer: 'Seek urgent orthopedic care as these signs may indicate joint or bone infection, which needs antibiotics and sometimes surgery.',
            citation: 'NHS. Septic Arthritis. 2025.'
        },

        // --- 10. Progressive Loss of Range of Motion ---
        {
            icon: '⬇️',
            question: 'Joint Motion Decreasing Over Time',
            answer: 'Persistent loss of range of motion, stiffness, or contracture over days/weeks should be evaluated by an orthopedic specialist.',
            citation: 'AAOS. Stiff Joints. 2024.'
        },

        // --- 11. Post-Operative Concerns ---
        {
            icon: '🏥',
            question: 'Increased Pain, Redness, or Drainage After Surgery',
            answer: 'After any orthopedic surgery, see your doctor IMMEDIATELY if:<br>• Incision is red, swollen, or leaking pus<br>• You have fever or severe pain<br><br>Signs of infection require urgent care.',
            citation: 'AAOS. Post-Surgery Complications. 2025.'
        },
        {
            icon: '🕒',
            question: 'Pain or Swelling Increasing Weeks After Surgery',
            answer: 'Any worsening symptoms during recovery should be reported to your orthopedic surgeon for evaluation.',
            citation: 'Johns Hopkins. Surgery Follow-up. 2024.'
        },

        // --- 12. Pediatric Signs in Children ---
        {
            icon: '🧒',
            question: 'Child with Persistent Limp, Refusal to Use Arm/Leg, or Deformity',
            answer: 'See a pediatric orthopedist if:<br>• Child avoids weight bearing or movement<br>• There is swelling, deformity, or fever<br><br>Prompt care prevents permanent damage.',
            citation: 'AAP. Pediatric Orthopedic Emergencies. 2025.'
        },

        // --- 13. Elderly with Fall or Fracture Risk ---
        {
            icon: '👴',
            question: 'Elderly Person Fell and Has Hip, Back, or Limb Pain',
            answer: 'See an orthopedist or visit ER to rule out fractures, especially in those with osteoporosis. Delayed care can cause permanent disability.',
            citation: 'CDC. Falls in Older Adults. 2025.'
        },

        // --- 14. Joint Instability Post-Injury ---
        {
            icon: '💥',
            question: 'Joint Feels Loose After Twisting or Sports Injury',
            answer: 'Prompt orthopedic evaluation is needed to avoid long-term instability or cartilage damage.',
            citation: 'AAOS. Sports Injuries. 2025.'
        },

        // --- 15. New Onset Back, Neck, or Spine Pain + Neurological Signs ---
        {
            icon: '🦴',
            question: 'Severe Back Pain with Leg Weakness or Loss of Bladder Control',
            answer: 'Emergency care is needed if:<br>• You lose control of your bladder or bowels<br>• There is sudden limb weakness or numbness<br><br>This could indicate spinal cord compression.',
            citation: 'NIAMS. Spinal Cord Compression. 2025.'
        },

        // --- 16. Bone Pain at Night or Unexplained Weight Loss ---
        {
            icon: '🌃',
            question: 'Bone Pain at Night, Unintentional Weight Loss, or Fever',
            answer: 'Persistent night pain or unexplained weight loss may indicate bone tumor or infection. See an orthopedist urgently.',
            citation: 'Cancer Research UK. Bone Cancer Symptoms. 2024.'
        },

        // --- 17. Non-Healing Wounds Over Bony Areas ---
        {
            icon: '🩺',
            question: 'Sores or Ulcers Over Joints/Bones Not Healing in 2 Weeks',
            answer: 'Chronic wounds may mask underlying infection or osteomyelitis. Orthopedic evaluation ensures prompt treatment.',
            citation: 'NIH. Bone Infection. 2025.'
        },

        // --- 18. Limb Length Discrepancy in Growing Child ---
        {
            icon: '📏',
            question: 'One Leg or Arm Growing Longer/Shorter Than the Other',
            answer: 'Uneven limb growth in children warrants pediatric orthopedic evaluation to prevent developmental problems.',
            citation: 'AAOS. Limb Length Issues. 2024.'
        },

        // --- 19. Post-Cast Concerns ---
        {
            icon: '🦾',
            question: 'Numbness/Tingling/Discoloration in Fingers or Toes after Cast Application',
            answer: 'See your orthopedic doctor immediately—these may be signs of tight cast or impending compartment syndrome.',
            citation: 'AAOS. Cast Care Emergencies. 2024.'
        },

        // --- 20. Recurrent Dislocations or Instability ---
        {
            icon: '🔁',
            question: 'Multiple Shoulder or Joint Dislocations or Sense of Repeated Instability',
            answer: 'See a specialist for advanced imaging and possible stabilizing surgery or rehabilitation.',
            citation: 'AAOS. Shoulder Instability. 2025.'
        },

        // --- 21. Chronic Neck or Back Pain ---
        {
            icon: '🦴',
            question: 'Chronic Neck or Back Pain Lasting More Than 4 Weeks',
            answer: 'See an orthopedist or spine specialist if:<br>• Pain persists despite home care<br>• There’s leg/arm numbness or weakness<br>• Symptoms interfere with daily life<br><br>Serious issues may need further evaluation.',
            citation: 'NIAMS. Neck and Back Pain. 2025.'
        },

        // --- 22. Sciatica Symptoms ---
        {
            icon: '⚡',
            question: 'Leg Pain Radiating from the Lower Back (Sciatica)',
            answer: 'Orthopedic or spine consultation is important if:<br>• Pain runs down the leg<br>• Symptoms worsen with sitting or coughing<br>• Weakness or numbness is present<br><br>This may indicate nerve root compression.',
            citation: 'Johns Hopkins. Sciatica. 2025.'
        },

        // --- 23. Suspected Arthritis in Any Age ---
        {
            icon: '🦵',
            question: 'Morning Joint Stiffness Lasting Over an Hour',
            answer: 'If morning stiffness, swelling or pain lasts >1 hour or recurs daily, see an orthopedic or rheumatology specialist.',
            citation: 'CDC. Arthritis Warning Signs. 2025.'
        },

        // --- 24. Swollen or Warm Joint After Minor Injury or Bite ---
        {
            icon: '🦟',
            question: 'Joint Becomes Painful and Swollen After Minor Injury or Insect Bite',
            answer: 'Sudden pain, redness and swelling may signal infection—seek urgent evaluation if accompanied by fever or rapidly worsening symptoms.',
            citation: 'NHS. Septic Arthritis from Injury. 2025.'
        },

        // --- 25. Pain After Previous Surgery or Old Fracture ---
        {
            icon: '🔄',
            question: 'Pain, Swelling or Instability Years After Bone Surgery',
            answer: 'Late pain may indicate hardware loosening, infection, or arthritis—follow up promptly with your orthopedic surgeon.',
            citation: 'AAOS. Joint Replacement Complications. 2025.'
        },

        // --- 26. Unexplained Limp in Any Child ---
        {
            icon: '👦',
            question: 'Sudden Limp or Refusal to Walk in a Child',
            answer: 'A limp with/without trauma always needs pediatric orthopedic review, especially if fever or inability to weight-bear is present.',
            citation: 'AAP. Limping in Children. 2025.'
        },

        // --- 27. Clicking, Grinding, or Giving Way in the Knee ---
        {
            icon: '🦵',
            question: 'Knee Clicking, Grinding, or Sudden Giving Way',
            answer: 'Persistent mechanical symptoms or instability call for orthopedic evaluation. Could be a cartilage or ligament injury.',
            citation: 'AAOS. Knee Problems. 2025.'
        },

        // --- 28. Hip or Groin Pain in Active Adolescent ---
        {
            icon: '🏃‍♀️',
            question: 'Adolescent Athlete with Persistent Hip or Groin Pain',
            answer: 'See an orthopedic or sports medicine doctor to assess for hip impingement, growth plate or labral injury.',
            citation: 'AAOS. Hip Pain in Teens. 2024.'
        },

        // --- 29. Painful or Growing Lump in Muscle or Bone ---
        {
            icon: '🕳️',
            question: 'Painful Lump, Bump, or Mass in Bone, Muscle, or Joint',
            answer: 'Any new or enlarging lump should be evaluated to rule out tumor or cyst, especially with night pain or fever.',
            citation: 'Cancer Research UK. Bone Tumor Symptoms. 2024.'
        },

        // --- 30. Sudden Loss of Grip or Hand Weakness ---
        {
            icon: '✋',
            question: 'Sudden Loss of Grip Strength or Hand Dexterity',
            answer: 'Could be due to nerve compression or tendon rupture—see an orthopedist promptly for evaluation.',
            citation: 'AAOS. Nerve Injuries of the Hand. 2025.'
        },

        // --- 31. Bruising & Swelling After Minor Injury in Elderly ---
        {
            icon: '🟣',
            question: 'Significant Bruising & Swelling After Minor Trauma (Elderly)',
            answer: 'Elderly adults are at high risk for occult fractures; urgent imaging and evaluation are important.',
            citation: 'CDC. Falls and Fractures in Older Adults. 2025.'
        },

        // --- 32. Chronic Heel Pain ---
        {
            icon: '👣',
            question: 'Heel Pain Lasting More Than 2 Weeks',
            answer: 'If pain worsens over time or limits walking, a podiatrist or orthopedist should exclude plantar fasciitis/bone spur.',
            citation: 'AAOS. Heel Pain. 2025.'
        },

        // --- 33. Worsening Scoliosis or Noticeable Spinal Curve ---
        {
            icon: '🕳️',
            question: 'Noticeable Spine Curve or Rapid Scoliosis Progression',
            answer: 'See an orthopedist if:<br>• Curve increases<br>• Back pain develops<br>• There is uneven shoulder or hip height<br><br>Early intervention may prevent worsening.',
            citation: 'NIAMS. Scoliosis. 2025.'
        },

        // --- 34. Sudden Hip or Groin Pain Without Trauma (Elderly) ---
        {
            icon: '🦵',
            question: 'Sudden Hip or Groin Pain in Elderly Without Fall',
            answer: 'Could indicate occult (hidden) hip fracture—prompt orthopedic imaging and evaluation are needed, even without obvious trauma.',
            citation: 'NIAMS. Osteoporotic Fracture. 2025.'
        },

        // --- 35. Non-Healing Bone or Joint Infection ---
        {
            icon: '🦠',
            question: 'Swelling, Redness or Drainage Over Joint/Bone That Won’t Heal',
            answer: 'Ongoing signs of infection after injury or surgery require urgent evaluation for possible osteomyelitis.',
            citation: 'Mayo Clinic. Bone Infection (Osteomyelitis). 2025.'
        },

        // --- 36. Severe Night Pain in Bone or Joint ---
        {
            icon: '🌙',
            question: 'Severe Night Pain in Bone or Joint in Any Age',
            answer: 'Bone tumors, infections, and aggressive arthritis may cause pain disrupting sleep—get specialist evaluation.',
            citation: 'Cancer Research UK. Bone Cancer Symptoms. 2024.'
        },

        // --- 37. Signs of Compartment Syndrome After Injury ---
        {
            icon: '🚨',
            question: 'Increasing Pain, Tightness, or Numbness After Cast/Splint Application',
            answer: 'Fingers/toes become pale, cold, or numb, or pain is out of proportion: remove constricting bandages and get IMMEDIATE orthopedic emergency care.',
            citation: 'AAOS. Compartment Syndrome. 2025.'
        },

        // --- 38. Trouble Moving Shoulder After Injury ---
        {
            icon: '🤾',
            question: 'Cannot Lift Arm Above Shoulder or Move After Injury',
            answer: 'Suspect rotator cuff or severe ligament/tendon injury—see an orthopedist for assessment and imaging.',
            citation: 'AAOS. Shoulder Injuries. 2025.'
        },

        // --- 39. Frequent Sprains or Sports Injuries ---
        {
            icon: '🏅',
            question: 'Frequent Ankle Sprains, Rolling or Instability During Sports',
            answer: 'Multiple sprains or “giving way” suggest chronic ligament instability—may require bracing or surgery.',
            citation: 'AAOS. Ankle Instability. 2024.'
        },

        // --- 40. Limp That Appears Suddenly in Any Age ---
        {
            icon: '🚶',
            question: 'Sudden Limping With Or Without Recent Injury',
            answer: 'A new limp is always a reason for orthopedic or general check-up, especially if it persists beyond 48 hours.',
            citation: 'AAP. Limping in Children – When to Worry. 2025.'
        },

        // --- 41. Difficulty With Fine Motor Tasks (Typing, Buttoning) ---
        {
            icon: '⌨️',
            question: 'Clumsiness, Dropping Objects, or Difficulty Buttoning Clothing',
            answer: 'See a hand specialist if:<br>• Precision and grip are worsening<br>• There’s numbness in thumb/fingers<br>• Dropping things frequently',
            citation: 'AAOS. Carpal Tunnel Syndrome. 2025.'
        },

        // --- 42. Red Flags for Cancer (Adults) ---
        {
            icon: '🎗️',
            question: 'Bone Pain With Fever, Weight Loss, or Night Sweats (Adults)',
            answer: 'Red flag for tumor or infection; urgent consultation and imaging required.',
            citation: 'NIH. Red Flags for Bone Cancer. 2024.'
        },

        // --- 43. Delayed Healing After Injury (Any Age) ---
        {
            icon: '⏳',
            question: 'Swelling, Pain, or Bruising That Lasts Longer Than 2–3 Weeks',
            answer: 'Delayed healing raises suspicion for fracture, nonunion, or chronic ligament injury—specialist review required.',
            citation: 'AAOS. Fracture Healing. 2025.'
        },

        // --- 44. Cracks, Popping, or Grinding After Injury ---
        {
            icon: '🔊',
            question: 'Persistent Crackling, Grinding or Instability Since Injury',
            answer: 'Mechanical noises with pain/instability indicate cartilage or meniscal damage needing imaging.',
            citation: 'AAOS. Meniscus Tear. 2024.'
        },

        // --- 45. Recurrent Tendonitis Not Improving With Rest ---
        {
            icon: '🎾',
            question: 'Repeated Pain in Elbow, Ankle, or Shoulder With Movement',
            answer: 'Chronic or recurrent tendon inflammation that doesn’t improve with rest/therapy should be assessed for tears or overuse syndromes.',
            citation: 'AAOS. Tendonitis. 2025.'
        },

        // --- 46. Swelling Around Elbow or Knee With Heat/Redness ---
        {
            icon: '🔴',
            question: 'Red, Swollen, Warm Elbow or Knee (Bursitis)',
            answer: 'Swelling and warmth could be infected—needs prompt orthopedic or medical evaluation.',
            citation: 'NHS. Septic Bursitis. 2025.'
        },

        // --- 47. Growth Plate Injury Signs (Children/Teens) ---
        {
            icon: '📏',
            question: 'Child Injures a Limb Near a Joint and Has Persistent Swelling or Limping',
            answer: 'Pediatric growth plate injuries must be ruled out early to avoid long-term deformity.',
            citation: 'AAOS. Growth Plate Injuries. 2025.'
        },

        // --- 48. Hip/Knee Pain That Affects Sleep (Adults) ---
        {
            icon: '🛏️',
            question: 'Joint Pain Wakes You From Sleep (Especially Hips or Knees)',
            answer: 'Persistent night pain is a key reason to see an orthopedist to rule out advanced arthritis or tumor.',
            citation: 'NIAMS. When to See Specialist for Arthritis. 2025.'
        },

        // --- 49. Unexplained Weight Loss with Joint Pain or Swelling ---
        {
            icon: '⚖️',
            question: 'Losing Weight Without Trying While Having Joint/Bone Pain',
            answer: 'Could be a warning sign for underlying malignancy or serious infection; urgent evaluation recommended.',
            citation: 'Cancer Research UK. Bone Tumors. 2024.'
        },

        // --- 50. Inability to Fully Extend or Bend a Joint ---
        {
            icon: '🔄',
            question: 'Joint Cannot Be Fully Straightened or Bent',
            answer: 'May indicate torn tendon/ligament or dislocation—needs orthopedic examination and imaging.',
            citation: 'AAOS. Flexion Contractures. 2025.'
        },

        // --- 51. Color Change in Fingers/Toes After Trauma or Cold ---
        {
            icon: '🧊',
            question: 'Fingers or Toes Turn Pale or Blue After Cold or Injury',
            answer: 'This may mean vascular injury, Raynaud’s, or poor circulation; prompt assessment is important.',
            citation: 'NIH. Acute Limb Ischemia. 2025.'
        }
];

const preventionData = [

    {
        icon: '🚶‍♂️',
        question: 'Regular Weight-Bearing Exercise (30 min/day, 5x/week)',
        answer: 'Activities like brisk walking, jogging, or dancing strengthen bones and muscles, lowering the risk of osteoporosis and fractures.',
        citation: 'NIAMS. Physical Activity for Bone Health. 2025.'
    },
    {
        icon: '🏋️',
        question: 'Strength Training 2–3 Times Per Week',
        answer: 'Resistance exercises with weights or bands help maintain bone density, joint health, and balance.',
        citation: 'Mayo Clinic. Strength Training and Bone Health. 2024.'
    },
    {
        icon: '🦴',
        question: 'Eat Calcium-Rich Foods Daily (Adults: 1000–1200 mg)',
        answer: 'Dairy, fortified plant drinks, leafy greens, and almonds build strong bones and prevent osteoporosis.',
        citation: 'NIH. Calcium and Bones. 2024.'
    },
    {
        icon: '☀️',
        question: 'Adequate Sunlight Exposure (Vitamin D Activation)',
        answer: '10–30 min sunlight daily boosts vitamin D formation, improving calcium absorption. Supplement if needed.',
        citation: 'Mayo Clinic. Vitamin D and Bone Health. 2024.'
    },
    {
        icon: '🥛',
        question: 'Include Vitamin D Sources in Diet (400–800 IU/day)',
        answer: 'Fatty fish, eggs, and fortified foods support bone mineralization. Ask your doctor about supplements.',
        citation: 'NIAMS. Vitamin D Nutrition for Bones. 2024.'
    },
    {
        icon: '💧',
        question: 'Stay Hydrated (6–8 Glasses of Water Daily)',
        answer: 'Good hydration supports joint lubrication and overall bone health, especially in active people.',
        citation: 'AAOS. Hydration and Joint Health. 2025.'
    },
    {
        icon: '🥦',
        question: 'Eat Colorful Vegetables and Fruits (5+ Servings/Day)',
        answer: 'Antioxidant and anti-inflammatory nutrients from vegetables lower arthritis and osteoporosis risk.',
        citation: 'Arthritis Foundation. Nutrition for Joint Health. 2024.'
    },
    {
        icon: '🏥',
        question: 'Regular Bone Density Testing (DEXA) After Age 50',
        answer: 'Early screening identifies osteoporosis and helps guide prevention/treatment plans.',
        citation: 'NIH. Bone Density Testing Guidelines. 2024.'
    },
    {
        icon: '🚭',
        question: 'Avoid Smoking and Tobacco Products',
        answer: 'Smoking reduces bone density and increases fracture risk. Quit for optimal bone and joint health.',
        citation: 'NIAMS. Tobacco and Bone Health. 2024.'
    },
    {
        icon: '🍷',
        question: 'Limit Alcohol to 1–2 Drinks/Day (Maximum)',
        answer: 'Excess alcohol impairs bone remodeling and increases fracture risk.',
        citation: 'NIH. Alcohol and Bones. 2025.'
    },
    {
        icon: '👟',
        question: 'Wear Supportive, Well-Fitting Shoes',
        answer: 'Proper footwear reduces risk of falls, joint injuries, and blisters, especially in older adults.',
        citation: 'CDC. Fall Prevention for Older Adults. 2025.'
    },
    {
        icon: '🛑',
        question: 'Practice Fall Prevention in Home and Outdoors',
        answer: 'Remove tripping hazards, use grab bars, and ensure good lighting to avoid falls and fractures.',
        citation: 'CDC. Home Safety and Fall Prevention. 2025.'
    },
    {
        icon: '🦵',
        question: 'Maintain Healthy Body Weight (BMI 18.5–24.9)',
        answer: 'Excess weight stresses joints, raising arthritis risk. Weight loss improves joint pain and stability.',
        citation: 'Arthritis Foundation. Weight and Joint Health. 2024.'
    },
    {
        icon: '🤸',
        question: 'Regular Stretching and Balance Training',
        answer: 'Yoga, tai chi, and stretching enhance flexibility and reduce injury risk.',
        citation: 'AAOS. Stretching and Injury Prevention. 2025.'
    },
    {
        icon: '🦶',
        question: 'Manage Foot Problems Early (Flatfoot, Bunions, Spurs)',
        answer: 'Timely podiatry and orthopedics intervention prevents chronic pain and gait changes.',
        citation: 'AAOS. Common Foot Problems. 2024.'
    },
    {
        icon: '💺',
        question: 'Take Frequent Breaks from Prolonged Sitting',
        answer: 'Standing and moving frequently reduces stiffness, lower back strain, and improves bone density.',
        citation: 'Arthritis Foundation. Sedentary Lifestyle Risks. 2025.'
    },
    {
        icon: '🚲',
        question: 'Use Safety Gear During Sports and Cycling',
        answer: 'Helmets, knee pads, and elbow guards lessen fracture and joint injury risk during active sports.',
        citation: 'CDC. Sports Injury Prevention. 2025.'
    },
    {
        icon: '🥜',
        question: 'Increase Magnesium Intake in Diet',
        answer: 'Magnesium from nuts, seeds, and whole grains supports bone strength and remodeling.',
        citation: 'NIH. Magnesium and Bone Health. 2024.'
    },
    {
        icon: '👩‍⚕️',
        question: 'Annual Orthopedic and Physical Exams After Age 50',
        answer: 'Regular exams help detect joint, bone, or muscular changes early, allowing prompt intervention.',
        citation: 'AAOS. Physical Examination Guidelines. 2024.'
    },
    {
        icon: '🧘‍♂️',
        question: 'Practice Stress Management and Good Mental Health',
        answer: 'Stress and depression can worsen pain and recovery after orthopedic injuries; mindfulness helps.',
        citation: 'Mayo Clinic. Mindfulness and Pain Management. 2024.'
    },
    {
        icon: '🌡️',
        question: 'Treat Hormonal or Thyroid Disorders Early',
        answer: 'Hormonal imbalances can affect bone metabolism; coordinate care with endocrinologist.',
        citation: 'NIH. Endocrine Disorders and Bone Health. 2025.'
    },
    {
        icon: '🧂',
        question: 'Limit Excess Salt and Caffeinated Beverages',
        answer: 'High salt and caffeine can lead to calcium loss from bones.',
        citation: 'Arthritis Foundation. Diet and Bone Health. 2024.'
    },
    {
        icon: '🦠',
        question: 'Treat Infections Promptly to Prevent Bone Spread',
        answer: 'Untreated infections can cause osteomyelitis. Monitor cuts, wounds, and fever.',
        citation: 'Mayo Clinic. Infection and Bone Health. 2025.'
    },
    {
        icon: '🔄',
        question: 'Vary Types of Exercise for Total Joint Coverage',
        answer: 'Include aerobic, strength, and flexibility workouts to challenge bones and joints in all planes.',
        citation: 'NIAMS. Diverse Exercise for Bones & Joints. 2025.'
    },
    {
        icon: '👨‍👩‍👧',
        question: 'Encourage Bone-Healthy Habits in Children',
        answer: 'Adequate dairy, vitamin D, safe play, and sports build strong bones from childhood.',
        citation: 'CDC. Children’s Bone Health. 2025.'
    },
    {
        icon: '🍎',
        question: 'Eat Plenty of Fiber for Overall Wellness',
        answer: 'Whole grains, vegetables, and fruit help control inflammation and maintain metabolic bone health.',
        citation: 'NIH. Nutrition & Healthy Bones. 2024.'
    },
    {
        icon: '🦾',
        question: 'Perform Range-of-Motion and Strengthening After Injury',
        answer: 'Rehabilitation exercises after orthopedic injury or surgery prevent stiffness and muscle loss.',
        citation: 'AAOS. Rehab for Injury/Surgery. 2024.'
    },
    {
        icon: '👩‍🔬',
        question: 'Discuss Bone Density Testing if Family History of Osteoporosis',
        answer: 'Early testing is crucial for those at increased risk by genetics.',
        citation: 'Arthritis Foundation. Family History and Screening. 2025.'
    },
    {
        icon: '🧑‍🔬',
        question: 'Consider Calcium and Vitamin D Supplements with Doctor Advice',
        answer: 'Supplements may be needed when dietary intake is insufficient, especially after 50.',
        citation: 'NIH. Supplementation for Bones. 2024.'
    },
    {
        icon: '🛡️',
        question: 'Avoid Excessive Use of Steroids and Antacids',
        answer: 'Long-term use can weaken bones; discuss safer alternatives with your healthcare provider.',
        citation: 'AAOS. Medicines Affecting Bones. 2024.'
    },
    {
        icon: '🏡',
        question: 'Keep Living Spaces Safe for Older Adults',
        answer: 'Grab bars in bathrooms and ramps reduce fall and fracture risk.',
        citation: 'CDC. Environmental Safety for Seniors. 2025.'
    },

     {
        icon: '🚶‍♀️',
        question: 'Walk at Least 8,000 Steps a Day',
        answer: 'Daily walking improves bone strength, joint flexibility, and balance, lowering fracture risk in all ages.',
        citation: 'Arthritis Foundation. Walking for Joint Health. 2025.'
    },
    {
        icon: '🪀',
        question: 'Engage in Balance Exercises (Tai Chi, Balance Board)',
        answer: 'Practicing balance prevents falls, reduces fracture risk, and supports joint coordination.',
        citation: 'CDC. Balance Training and Falls Prevention. 2025.'
    },
    {
        icon: '🍊',
        question: 'Increase Vitamin C Intake',
        answer: 'Vitamin C from citrus and vegetables aids collagen production, essential for tendon and bone repair.',
        citation: 'NIH. Vitamin C and Musculoskeletal Health. 2025.'
    },
    {
        icon: '🦵',
        question: 'Vary Your Activities to Reduce Overuse Injuries',
        answer: 'Cross-training (alternating activities) prevents repetitive strain on specific joints and bones.',
        citation: 'AAOS. Overuse Injury Prevention. 2024.'
    },
    {
        icon: '🥑',
        question: 'Include Healthy Fats (Avocado, Olive Oil) in Diet',
        answer: 'Unsaturated fats reduce inflammation and may protect against arthritis and bone loss.',
        citation: 'NIH. Dietary Fat and Bone Health. 2024.'
    },
    {
        icon: '💤',
        question: 'Prioritize Rest and Recovery After Physical Activity',
        answer: 'Adequate sleep and rest days promote bone and muscle healing after stress or exercise.',
        citation: 'Arthritis Foundation. Importance of Rest. 2024.'
    },
    {
        icon: '⛑️',
        question: 'Use Protective Gear for High-Risk Activities',
        answer: 'Helmets, wrist guards, and shin pads prevent fractures and dislocations in sports and recreation.',
        citation: 'CDC. Sports Safety Equipment. 2024.'
    },
    {
        icon: '🧽',
        question: 'Clean Cuts and Wounds Promptly',
        answer: 'Good wound care prevents infections that can spread to bone (osteomyelitis), especially in diabetics.',
        citation: 'Mayo Clinic. Wound Care and Infection Prevention. 2025.'
    },
    {
        icon: '🥗',
        question: 'Eat a Mediterranean Diet for Anti-Inflammatory Benefits',
        answer: 'This diet pattern reduces systemic inflammation and protects against joint degeneration.',
        citation: 'NIAMS. Mediterranean Diet and Arthritis. 2025.'
    },
    {
        icon: '🧂',
        question: 'Limit Processed and Packaged Foods',
        answer: 'These foods are often high in sodium, sugar, and unhealthy fats that weaken bone over time.',
        citation: 'CDC. Processed Foods and Bone Health. 2024.'
    },
    {
        icon: '🏖️',
        question: 'Plan Outdoor Activities for Bone Health',
        answer: 'Sun exposure and physical activity together boost vitamin D and physical strength.',
        citation: 'NIH. Outdoor Activity and Bone Health. 2025.'
    },
    {
        icon: '🧑‍🤝‍🧑',
        question: 'Encourage Group Activities for Motivation and Adherence',
        answer: 'Group walks, exercise classes, or sports keep participants engaged and promote long-term habits.',
        citation: 'Arthritis Foundation. Group Exercise Benefits. 2025.'
    },
    {
        icon: '🧱',
        question: 'Practice Good Posture at Work and Home',
        answer: 'Proper alignment of spine and limbs reduces risk of degenerative joint or spinal diseases.',
        citation: 'AAOS. Posture and Musculoskeletal Health. 2024.'
    },
    {
        icon: '🧺',
        question: 'Lift Heavy Objects with Proper Technique',
        answer: 'Bend your knees, keep objects close to your body, and avoid twisting to prevent back and joint injuries.',
        citation: 'NIOSH. Safe Lifting Guidelines. 2025.'
    },
    {
        icon: '🦶',
        question: 'Use Custom Insoles for Flatfoot or High Arch',
        answer: 'Orthotic devices correct foot posture, reduce pain and prevent ankle/knee stress injuries.',
        citation: 'AAOS. Orthotics for Foot Health. 2024.'
    },
    {
        icon: '⚖️',
        question: 'Aim for Slow, Steady Weight Loss if Needed',
        answer: 'Losing just 5-10% of body weight can significantly reduce knee, hip, and lower back pain.',
        citation: 'NIH. Weight Loss and Orthopedic Outcomes. 2024.'
    },
    {
        icon: '🏕️',
        question: 'Practice Regular Stretching During Travel or Long Sitting',
        answer: 'Stand up, move, and stretch every hour to prevent stiffness and deep vein thrombosis risk.',
        citation: 'CDC. Travel Health. 2025.'
    },
    {
        icon: '🚻',
        question: 'Use Proper Ergonomics for All Devices and Desks',
        answer: 'Set up chairs and monitors so that joints remain in neutral, comfortable positions.',
        citation: 'Occupational Safety and Health Administration. Office Ergonomics. 2024.'
    },
    {
        icon: '💊',
        question: 'Regularly Review Medications for Bone Risk',
        answer: 'Certain medications (like steroids, proton pump inhibitors) increase osteoporosis or fracture risk.',
        citation: 'NIH. Drug-Induced Bone Loss. 2024.'
    },
    {
        icon: '🧴',
        question: 'Moisturize Skin to Prevent Cracks and Ulcers',
        answer: 'Dry, cracked skin increases risk for infections that can invade bone through wounds.',
        citation: 'Mayo Clinic. Skin Care and Infection Risk. 2025.'
    },
    {
        icon: '🦵',
        question: 'Monitor for Early Signs of Joint Stiffness or Swelling',
        answer: 'Early intervention with exercise or therapy can halt or slow arthritis progression.',
        citation: 'CDC. Early Arthritis Detection. 2024.'
    },
    {
        icon: '🚴‍♂️',
        question: 'Choose Low-Impact Activities if Prone to Joint Injury',
        answer: 'Swimming, cycling, and walking minimize joint stress while maintaining fitness.',
        citation: 'Arthritis Foundation. Exercise for Joint Safety. 2024.'
    },
    {
        icon: '👧',
        question: 'Promote Safe Play in Children (Pads, Supervision)',
        answer: 'Teaching kids safe play, appropriate equipment, and adult supervision reduces bone injuries.',
        citation: 'AAOS. Child Safety and Fracture Prevention. 2024.'
    },
    {
        icon: '🧑‍🎓',
        question: 'Learn Signs of Stress Fractures and Report Early',
        answer: 'Persistent pain with activity and after rest could signal a stress fracture, especially in athletes.',
        citation: 'AAOS. Stress Fracture Awareness. 2024.'
    },
    {
        icon: '🦻',
        question: 'Address Hearing or Vision Problems',
        answer: 'Hearing/vision issues increase fall risk, leading to fractures—address these for overall prevention.',
        citation: 'NIH. Falls in the Elderly. 2025.'
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
        "১. হাড় ভাঙা / ফ্র্যাকচার",
        "২. হাড় ক্ষয় / অস্টিওপোরোসিস",
        "৩. গাঁটের ব্যথা / আর্থ্রাইটিস",
        "৪. অস্টিওআর্থ্রাইটিস",
        "৫. রিউমাটয়েড আর্থ্রাইটিস",
        "৬. ব্যাক পেইন / মেরুদণ্ডের ব্যথা",
        "৭. স্পন্ডিলাইটিস",
        "৮. স্কোলিওসিস",
        "৯. ডিস্ক সমস্যা / হার্নিয়েটেড ডিস্ক",
        "১০. মাসল স্ট্রেন / পেশী টান",
        "১১. টেন্ডনাইটিস / টেন্ডনের সমস্যা",
        "১২. হাড়ের টিউমার / অস্থি টিউমার"
];

// Sub-menu prompts
const healthPromptMap = {

"fracture": {
    "botPrompt": "ফ্র্যাকচার/হাড় ভাঙা সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "হাড়ে তীব্র ব্যথা",
      "ফোলা বা অস্বাভাবিক আকৃতি",
      "চলতে সমস্যা",
      "আঁচড় বা রক্তপাত",
      "পেশী দুর্বলতা"
    ]
  },
  "osteoporosis": {
    "botPrompt": "অস্টিওপোরোসিস/হাড় ক্ষয় সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "সহজেই হাড় ভেঙে যাওয়া",
      "পিঠে ব্যথা",
      "উচ্চতা কমে যাওয়া",
      "কমজোরি লাগা",
      "কোমর বা পিঠে বক্রতা"
    ]
  },
  "arthritis": {
    "botPrompt": "গাঁটের ব্যথা/আর্থ্রাইটিস সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "হাঁটু বা গাঁটে ব্যথা",
      "ফোলা",
      "শক্ত হয়ে যাওয়া",
      "চলাফেরায় অসুবিধা",
      "গাঁট গরম বা লাল"
    ]
  },
  "osteoarthritis": {
    "botPrompt": "অস্টিওআর্থ্রাইটিস সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "জয়েন্টে ব্যথা",
      "জয়েন্ট শক্ত",
      "সকালবেলা বেশি ব্যথা",
      "চলার সময় ব্যথা বাড়ে",
      "জয়েন্ট ফুলে থাকে"
    ]
  },
  "rheumatoid_arthritis": {
    "botPrompt": "রিউমাটয়েড আর্থ্রাইটিস সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "ছোট জয়েন্টে ব্যথা",
      "দুইহাত অথবা দুইপায়ে ফোলা",
      "সকালবেলা শক্ত হয়ে যাওয়া",
      "চলাচলে অসুবিধা",
      "জ্বর বা ক্লান্তি"
    ]
  },
  "back_pain": {
    "botPrompt": "ব্যাক পেইন/মেরুদণ্ডের ব্যথা সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "কোমরে/মেরুদণ্ডে লাগাতার ব্যথা",
      "চলতে বা উঠতে সমস্যা",
      "পা অবশ বা ইনজুরি",
      "নড়াচড়াতে ব্যথা বেড়ে যায়",
      "পেশীতে টান"
    ]
  },
  "spondylitis": {
    "botPrompt": "স্পন্ডিলাইটিস সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "গলা/ঘাড় ব্যথা",
      "হাত অবশ",
      "ঘাড় শক্ত",
      "মাথাব্যথা সাথে ঘাড়ে টান",
      "শুয়ে থাকলে সমস্যা কমে"
    ]
  },
  "scoliosis": {
    "botPrompt": "স্কোলিওসিস সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "মেরুদন্ড বেঁকিয়ে যাওয়া",
      "কোমর একদিকে বেশি উঁচু",
      "পিঠে ব্যথা",
      "অনুপযুক্ত ভঙ্গি",
      "শ্বাসকষ্ট (গুরুতর হলে)"
    ]
  },
  "herniated_disk": {
    "botPrompt": "ডিস্ক সমস্যা/হার্নিয়েটেড ডিস্ক সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "পিঠ বা কোমরে তীব্র ব্যথা",
      "পায়ে ব্যথা ছড়িয়ে যাওয়া",
      "পা অবশ",
      "উঠতে বসতে সমস্যা",
      "চলাফেরা সীমিত"
    ]
  },
  "muscle_strain": {
    "botPrompt": "মাসল স্ট্রেন/পেশী টান সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "পেশীতে হঠাৎ ব্যথা",
      "ফোলা",
      "চলাচলেও অসুবিধা",
      "পেশী দুর্বলতা",
      "ব্যায়ামে সমস্যা"
    ]
  },
  "tendinitis": {
    "botPrompt": "টেন্ডনাইটিস/টেন্ডনের সমস্যা সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "টেন্ডনে ব্যথা",
      "চলাচল করলে ব্যথা বাড়ে",
      "ফোলাভাব",
      "স্থানীয় গরম অনুভূতি",
      "টান বা জ্বর"
    ]
  },
  "bone_tumor": {
    "botPrompt": "হাড়ের টিউমার/অস্থি টিউমার সংক্রান্ত কোন সমস্যা জানতে চান?",
    "options": [
      "অস্থি বা হাড়ে ফোলাভাব",
      "হাড়ে অস্বাভাবিক ঘা",
      "পেশী দুর্বলতা",
      "স্থানে ব্যথা",
      "হঠাৎ ভাঙা/ক্র্যাক"
      ]
    }
};

// Map Bengali to English keys
const nextStateMap = {
    "১. হাড় ভাঙা / ফ্র্যাকচার": "fracture",
    "২. হাড় ক্ষয় / অস্টিওপোরোসিস": "osteoporosis",
    "৩. গাঁটের ব্যথা / আর্থ্রাইটিস": "arthritis",
    "৪. অস্টিওআর্থ্রাইটিস": "osteoarthritis",
    "৫. রিউমাটয়েড আর্থ্রাইটিস": "rheumatoid_arthritis",
    "৬. ব্যাক পেইন / মেরুদন্ডের ব্যথা": "back_pain",
    "৭. স্পন্ডিলাইটিস": "spondylitis",
    "৮. স্কোলিওসিস": "scoliosis",
    "৯. ডিস্ক সমস্যা / হার্নিয়েটেড ডিস্ক": "herniated_disk",
    "১০. মাসল স্ট্রেন / পেশী টান": "muscle_strain",
    "১১. টেন্ডনাইটিস / টেন্ডনের সমস্যা": "tendinitis",
    "১২. হাড়ের টিউমার / অস্থি টিউমার": "bone_tumor"
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

// ORTHO COMMUNITY GROUP

// Ensure formData is initialized.
if (typeof formData === "undefined") {
  var formData = {};
}
// Get orthoType and community consent from form
formData.orthoType = document.getElementById('orthoType')?.value || "";
formData.joinCommunity = document.getElementById('joinCommunity')?.checked || false;



// Get orthoType (disease) and community consent from form
const orthoType = document.getElementById('orthoType')?.value || "";
const joinCommunity = document.getElementById('joinCommunity')?.checked || false;
formData.orthoType = orthoType;
formData.joinCommunity = joinCommunity;

// Data for orthopedic community groups
const ORTHO_COMMUNITY_GROUPS = {
  fracture: {
    name: "Bone Fracture Support Network",
    members: 85,
    description: "Share recovery stories, tips, ask questions and connect with others healing from fractures.",
    color: "#1976d2"
  },
  osteoporosis: {
    name: "Osteoporosis Awareness Group",
    members: 120,
    description: "Daily bone health tips, support, expert Q&A and wellness meetups.",
    color: "#fbc02d"
  },
  arthritis: {
    name: "Arthritis Warriors Community",
    members: 140,
    description: "Discuss pain management, share mobility strategies and join live webinars.",
    color: "#388e3c"
  },
  spondylitis: {
    name: "Spondylitis Support Forum",
    members: 65,
    description: "Talk to others, share therapies, and discover latest treatments.",
    color: "#8e24aa"
  },
  muscle_strain: {
    name: "Muscle Strain Recovery Circle",
    members: 50,
    description: "Connect to physiotherapists, share exercises, learn best practices for healing strains.",
    color: "#0288d1"
  },
  // Add additional conditions here
};

// Display community groups based on selected ortho condition
function showRecommendedGroups(userOrthoType) {
  const section = document.getElementById("patientGroupsSection");
  if (!section) return;

  section.innerHTML = `<h3 style="color: var(--color-primary); margin-bottom: 1rem;">Orthopedic Support Communities</h3>`;
  let groupList = "";

  Object.entries(ORTHO_COMMUNITY_GROUPS).forEach(([key, group]) => {
    if (key === userOrthoType || userOrthoType === "") {
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
if (formData.joinCommunity && formData.orthoType) {
  showRecommendedGroups(formData.orthoType);
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
  // Show consent message about profile visibility in the ortho community group
  // e.g. document.getElementById("consentNotice").style.display = "block";
}

// END ORTHO COMMUNITY GROUP

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