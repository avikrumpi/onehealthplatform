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
        "১. স্তন ক্যান্সার",
        "২. জরায়ুমুখের ক্যান্সার",
        "৩. ডিম্বাশয়ের ক্যান্সার",
        "৪. মুখ ও গলার ক্যান্সার",
        "৫. ফুসফুসের ক্যান্সার",
        "৬. কোলন/মলাশয়ের ক্যান্সার",
        "৭. পাকস্থলীর ক্যান্সার",
        "৮. থাইরয়েড ক্যান্সার",
        "৯. জরায়ু/এন্ডোমেট্রিয়াল ক্যান্সার",
        "১০. রক্তের ক্যান্সার/লিউকেমিয়া",
        "১১. খাদ্যনালীর ক্যান্সার",
        "১২. লিম্ফোমা"
    ],
    "nextStateMap": {
        "১. স্তন ক্যান্সার": "breast_cancer",
        "২. জরায়ুমুখের ক্যান্সার": "cervical_cancer",
        "৩. ডিম্বাশয়ের ক্যান্সার": "ovarian_cancer",
        "৪. মুখ ও গলার ক্যান্সার": "oral_cancer",
        "৫. ফুসফুসের ক্যান্সার": "lung_cancer",
        "৬. কোলন/মলাশয়ের ক্যান্সার": "colorectal_cancer",
        "৭. পাকস্থলীর ক্যান্সার": "stomach_cancer",
        "৮. থাইরয়েড ক্যান্সার": "thyroid_cancer",
        "৯. জরায়ু/এন্ডোমেট্রিয়াল ক্যান্সার": "uterine_cancer",
        "১০. রক্তের ক্যান্সার/লিউকেমিয়া": "blood_cancer",
        "১১. খাদ্যনালীর ক্যান্সার": "esophageal_cancer",
        "১২. লিম্ফোমা": "lymphoma"
    }
},
"breast_cancer": {
    "botPrompt": "স্তন ক্যান্সার সংক্রান্ত কোন লক্ষণ বা সমস্যা নিয়ে জানতে চান?",
    "options": [
      "স্তনে চাকা বা দলা",
      "স্তনের আকার বা আকৃতির পরিবর্তন",
      "স্তনের বোঁটা থেকে স্রাব",
      "স্তনের ত্বকে পরিবর্তন",
      "বগলে ফোলা বা চাকা"
    ]
},
"cervical_cancer": {
    "botPrompt": "জরায়ুমুখের ক্যান্সার সংক্রান্ত কোন সমস্যা নিয়ে আলোচনা করতে চান?",
    "options": [
      "অস্বাভাবিক যোনিপথে রক্তপাত",
      "সহবাসের পর রক্তপাত",
      "পিরিয়ডের মাঝে রক্তপাত",
      "তলপেটে ব্যথা",
      "যোনিপথে দুর্গন্ধযুক্ত স্রাব"
    ]
},
"ovarian_cancer": {
    "botPrompt": "ডিম্বাশয়ের ক্যান্সার সংক্রান্ত কোন লক্ষণ নিয়ে জানতে চান?",
    "options": [
      "পেট ফোলা বা ফুলে যাওয়া",
      "তলপেটে ক্রমাগত ব্যথা",
      "খেতে অসুবিধা বা তাড়াতাড়ি পেট ভরা",
      "ঘন ঘন প্রস্রাব",
      "অস্বাভাবিক ওজন হ্রাস"
    ]
},
"oral_cancer": {
    "botPrompt": "মুখ ও গলার ক্যান্সার সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
    "options": [
      "মুখে ঘা যা সারছে না",
      "মুখে সাদা বা লাল দাগ",
      "গলা বা মুখে চাকা",
      "গিলতে অসুবিধা",
      "মুখে অবশ অনুভূতি"
    ]
},
"lung_cancer": {
    "botPrompt": "ফুসফুসের ক্যান্সার সংক্রান্ত কোন লক্ষণ নিয়ে কথা বলতে চান?",
    "options": [
      "দীর্ঘস্থায়ী কাশি",
      "কফের সাথে রক্ত",
      "শ্বাসকষ্ট",
      "বুকে ব্যথা",
      "ওজন হ্রাস ও ক্লান্তি"
    ]
},
"colorectal_cancer": {
    "botPrompt": "কোলন/মলাশয়ের ক্যান্সার সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
    "options": [
      "মলত্যাগের অভ্যাসে পরিবর্তন",
      "মলের সাথে রক্ত",
      "পেটে ব্যথা বা খিঁচুনি",
      "দুর্বলতা ও ক্লান্তি",
      "অব্যাখ্যাত ওজন হ্রাস"
    ]
},
"stomach_cancer": {
    "botPrompt": "পাকস্থলীর ক্যান্সার সংক্রান্ত কোন লক্ষণ নিয়ে আলোচনা করতে চান?",
    "options": [
      "পেটের উপরিভাগে ব্যথা",
      "বমি বমি ভাব ও বমি",
      "ক্ষুধামন্দা",
      "খাবারের পর পেট ভরা অনুভূতি",
      "অব্যাখ্যাত ওজন হ্রাস"
    ]
},
"thyroid_cancer": {
    "botPrompt": "থাইরয়েড ক্যান্সার সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
    "options": [
      "গলায় চাকা বা ফোলা",
      "গলার স্বর পরিবর্তন",
      "গিলতে অসুবিধা",
      "শ্বাসকষ্ট",
      "গলায় ব্যথা"
    ]
},
"uterine_cancer": {
    "botPrompt": "জরায়ু/এন্ডোমেট্রিয়াল ক্যান্সার সংক্রান্ত কোন লক্ষণ নিয়ে জানতে চান?",
    "options": [
      "অস্বাভাবিক যোনিপথে রক্তপাত",
      "মেনোপজের পর রক্তপাত",
      "পিরিয়ডের সময় অতিরিক্ত রক্তপাত",
      "তলপেটে ব্যথা",
      "যোনিপথে জলীয় স্রাব"
    ]
},
"blood_cancer": {
    "botPrompt": "রক্তের ক্যান্সার/লিউকেমিয়া সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
    "options": [
      "ঘন ঘন সংক্রমণ",
      "দুর্বলতা ও ক্লান্তি",
      "সহজেই রক্তপাত বা ক্ষত",
      "জ্বর ও রাতে ঘাম",
      "হাড়ে বা জয়েন্টে ব্যথা"
    ]
},
"esophageal_cancer": {
    "botPrompt": "খাদ্যনালীর ক্যান্সার সংক্রান্ত কোন লক্ষণ নিয়ে কথা বলতে চান?",
    "options": [
      "গিলতে অসুবিধা বা ব্যথা",
      "বুকে জ্বালাপোড়া",
      "বুকে ব্যথা বা চাপ",
      "অব্যাখ্যাত ওজন হ্রাস",
      "দীর্ঘস্থায়ী কাশি বা কণ্ঠস্বর পরিবর্তন"
    ]
},
"lymphoma": {
    "botPrompt": "লিম্ফোমা সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
    "options": [
      "ঘাড়, বগল বা কুঁচকিতে ফোলা লসিকা গ্রন্থি",
      "জ্বর ও রাতে ঘাম",
      "ক্লান্তি ও দুর্বলতা",
      "অব্যাখ্যাত ওজন হ্রাস",
      "চুলকানি"
    ]
   }
};

// Question sequences matching Python exactly
const QUESTION_SEQUENCES = {
  breast_cancer: [
    "আপনার বয়স কত?",
    "স্তনে চাকা বা দলা কতদিন ধরে লক্ষ্য করছেন?",
    "চাকার আকার কি বাড়ছে?",
    "স্তনের বোঁটা থেকে কোনো স্রাব আছে কি?",
    "স্তনের ত্বকে কোনো পরিবর্তন দেখছেন কি?",
    "বগলে ফোলা বা চাকা আছে কি?",
    "স্তনে ব্যথা আছে কি?",
    "পরিবারে কারো স্তন বা ডিম্বাশয়ের ক্যান্সার হয়েছে?",
    "আপনার কি সন্তান আছে? কত বছর বয়সে প্রথম সন্তান?",
    "আপনার ওজন বেশি বা স্থূলতা আছে কি?",
    "আগে কি ম্যামোগ্রাম করিয়েছেন?",
    "ডাক্তারের কাছে গেছেন কি?"
  ],

  cervical_cancer: [
    "আপনার বয়স কত?",
    "অস্বাভাবিক রক্তপাত কতদিন ধরে হচ্ছে?",
    "সহবাসের পর রক্তপাত হয় কি?",
    "মাসিকের মাঝে রক্তপাত হচ্ছে কি?",
    "যোনিপথে কোনো অস্বাভাবিক স্রাব বা দুর্গন্ধ আছে কি?",
    "তলপেটে ব্যথা হচ্ছে কি?",
    "প্রস্রাবে জ্বালাপোড়া বা ব্যথা হয় কি?",
    "পরিবারে কারো জরায়ুর ক্যান্সার হয়েছে?",
    "HPV টিকা নিয়েছেন কি?",
    "ধূমপান করেন বা করতেন কি?",
    "আগে কি প্যাপ স্মিয়ার বা HPV টেস্ট করিয়েছেন?",
    "ডাক্তারের কাছে গেছেন কি?"
  ],

  ovarian_cancer: [
    "আপনার বয়স কত?",
    "পেট ফোলা বা ফুলে যাওয়া কতদিন ধরে হচ্ছে?",
    "পেট ফোলার সাথে শক্ত অনুভব করছেন কি?",
    "তলপেটে ক্রমাগত ব্যথা আছে কি?",
    "খেতে অসুবিধা বা তাড়াতাড়ি পেট ভরে যায় কি?",
    "ঘন ঘন প্রস্রাব হচ্ছে কি?",
    "ওজন কমে যাচ্ছে কি?",
    "পিঠে ব্যথা আছে কি?",
    "পরিবারে কারো স্তন বা ডিম্বাশয়ের ক্যান্সার হয়েছে?",
    "আপনার কি সন্তান আছে?",
    "আগে কি পেলভিক আল্ট্রাসাউন্ড করিয়েছেন?",
    "ডাক্তারের কাছে গেছেন কি?"
  ],

  oral_cancer: [
    "আপনার বয়স কত?",
    "মুখে ঘা কতদিন ধরে আছে?",
    "ঘা থেকে রক্ত বের হয় কি?",
    "মুখে সাদা বা লাল দাগ আছে কি?",
    "গলা বা মুখে চাকা অনুভব করছেন কি?",
    "গিলতে অসুবিধা হচ্ছে কি?",
    "মুখে ব্যথা বা অবশ অনুভূতি আছে কি?",
    "কথা বলতে জড়তা বা অসুবিধা হচ্ছে কি?",
    "তামাক বা পান-সুপারি খান কি?",
    "মদ বা অ্যালকোহল পান করেন কি?",
    "পরিবারে কারো মুখ বা গলার ক্যান্সার হয়েছে?",
    "ডাক্তার বা ডেন্টিস্ট দেখিয়েছেন কি?"
  ],

  lung_cancer: [
    "আপনার বয়স কত?",
    "কাশি কতদিন ধরে চলছে?",
    "কাশি কি শুকনো নাকি কফ সহ?",
    "কফের সাথে রক্ত এসেছে কি?",
    "শ্বাসকষ্ট হচ্ছে কি?",
    "বুকে ব্যথা আছে কি?",
    "ওজন ও ক্ষুধা কমে যাচ্ছে কি?",
    "আপনি ধূমপান করেন বা করতেন কি?",
    "দিনে কয়টা সিগারেট খান বা খেতেন?",
    "পরিবারে কারো ফুসফুসের ক্যান্সার হয়েছে?",
    "আগে কি বুকের এক্স-রে বা সিটি স্ক্যান করিয়েছেন?",
    "ডাক্তারের কাছে গেছেন কি?"
  ],

  colorectal_cancer: [
    "আপনার বয়স কত?",
    "মলত্যাগের অভ্যাসে পরিবর্তন কতদিন ধরে হচ্ছে?",
    "মলের সাথে রক্ত দেখেছেন কি?",
    "মলের রং কেমন - লাল, কালো নাকি আলকাতরার মতো?",
    "কোষ্ঠকাঠিন্য বা ডায়রিয়া হচ্ছে কি?",
    "পেটে ব্যথা বা খিঁচুনি আছে কি?",
    "ওজন কমে যাচ্ছে কি?",
    "দুর্বলতা বা ক্লান্তি অনুভব করছেন কি?",
    "পরিবারে কারো কোলন বা মলাশয়ের ক্যান্সার হয়েছে?",
    "ডায়াবেটিস বা স্থূলতা আছে কি?",
    "আগে কি কোলনোস্কোপি করিয়েছেন?",
    "ডাক্তারের কাছে গেছেন কি?"
  ],

  stomach_cancer: [
    "আপনার বয়স কত?",
    "পেটে ব্যথা কতদিন ধরে হচ্ছে?",
    "পেটের ব্যথা কোন জায়গায় - উপরে, মাঝে নাকি নিচে?",
    "বমি বমি ভাব বা বমি হচ্ছে কি?",
    "ক্ষুধামন্দা বা খেতে অনিচ্ছা হচ্ছে কি?",
    "খাবারের পর পেট ভরা অনুভূতি হয় কি?",
    "ওজন কমে যাচ্ছে কি?",
    "পায়খানা কালো বা আলকাতরার মতো হচ্ছে কি?",
    "পরিবারে কারো পাকস্থলীর ক্যান্সার হয়েছে?",
    "নিয়মিত ধূমপান বা মদ পান করেন কি?",
    "আগে কি এন্ডোস্কোপি করিয়েছেন?",
    "ডাক্তারের কাছে গেছেন কি?"
  ],

  thyroid_cancer: [
    "আপনার বয়স কত?",
    "গলায় চাকা বা ফোলা কতদিন ধরে লক্ষ্য করছেন?",
    "চাকা কতটা বড় - ছোট মার্বেল নাকি বড়?",
    "চাকা দ্রুত বাড়ছে কি?",
    "গলার স্বর পরিবর্তন হয়েছে কি?",
    "গিলতে অসুবিধা হচ্ছে কি?",
    "শ্বাসকষ্ট হচ্ছে কি?",
    "গলায় ব্যথা আছে কি?",
    "পরিবারে কারো থাইরয়েড ক্যান্সার হয়েছে?",
    "থাইরয়েডের সমস্যা আছে কি?",
    "আগে কি থাইরয়েড টেস্ট বা আল্ট্রাসাউন্ড করিয়েছেন?",
    "ডাক্তারের কাছে গেছেন কি?"
  ],

  uterine_cancer: [
    "আপনার বয়স কত?",
    "অস্বাভাবিক রক্তপাত কতদিন ধরে হচ্ছে?",
    "মেনোপজের পর রক্তপাত হয়েছে কি?",
    "পিরিয়ডের সময় অতিরিক্ত রক্তপাত হয় কি?",
    "যোনিপথে জলীয় বা রক্তমিশ্রিত স্রাব আছে কি?",
    "তলপেটে ব্যথা বা চাপ অনুভব করছেন কি?",
    "যৌন মিলনে ব্যথা বা অস্বস্তি হয় কি?",
    "পরিবারে কারো জরায়ু বা কোলন ক্যান্সার হয়েছে?",
    "আপনার ওজন বেশি বা ডায়াবেটিস আছে কি?",
    "মাসিক কি অনিয়মিত বা দীর্ঘস্থায়ী ছিল?",
    "আগে কি পেলভিক আল্ট্রাসাউন্ড করিয়েছেন?",
    "ডাক্তারের কাছে গেছেন কি?"
  ],

  blood_cancer: [
    "আপনার বয়স কত?",
    "ঘন ঘন সংক্রমণ হচ্ছে কি?",
    "দুর্বলতা ও ক্লান্তি কতদিন ধরে হচ্ছে?",
    "সহজেই রক্তপাত বা ক্ষত হয় কি?",
    "জ্বর ও রাতে ঘাম হচ্ছে কি?",
    "হাড়ে বা জয়েন্টে ব্যথা আছে কি?",
    "ওজন কমে যাচ্ছে কি?",
    "দাঁতের মাড়ি থেকে রক্ত পড়ে কি?",
    "লিম্ফ নোড ফুলে গেছে কি?",
    "পরিবারে কারো রক্তের ক্যান্সার হয়েছে?",
    "আগে কি রক্ত পরীক্ষা করিয়েছেন?",
    "ডাক্তারের কাছে গেছেন কি?"
  ],

  esophageal_cancer: [
    "আপনার বয়স কত?",
    "গিলতে অসুবিধা কতদিন ধরে হচ্ছে?",
    "কোন ধরনের খাবার গিলতে অসুবিধা - শক্ত নাকি তরল?",
    "খাবার গিলতে ব্যথা হয় কি?",
    "বুকে জ্বালাপোড়া বা অম্বল হচ্ছে কি?",
    "বুকে ব্যথা বা চাপ অনুভব করছেন কি?",
    "ওজন কমে যাচ্ছে কি?",
    "কাশি বা কণ্ঠস্বর পরিবর্তন হয়েছে কি?",
    "তামাক বা মদ ব্যবহার করেন কি?",
    "পরিবারে কারো খাদ্যনালীর ক্যান্সার হয়েছে?",
    "আগে কি এন্ডোস্কোপি করিয়েছেন?",
    "ডাক্তারের কাছে গেছেন কি?"
  ],

  lymphoma: [
    "আপনার বয়স কত?",
    "ঘাড়, বগল বা কুঁচকিতে ফোলা কতদিন ধরে আছে?",
    "ফোলা কত দ্রুত বাড়ছে?",
    "ফোলা জায়গা চাপলে ব্যথা হয় কি?",
    "জ্বর ও রাতে ঘাম হচ্ছে কি?",
    "ক্লান্তি ও দুর্বলতা অনুভব করছেন কি?",
    "ওজন কমে যাচ্ছে কি?",
    "সারা শরীরে চুলকানি হচ্ছে কি?",
    "বুকে ব্যথা বা শ্বাসকষ্ট হচ্ছে কি?",
    "পরিবারে কারো লিম্ফোমা হয়েছে?",
    "আগে কি রক্ত পরীক্ষা বা বায়োপসি করিয়েছেন?",
    "ডাক্তারের কাছে গেছেন কি?"
  ]
};

const diseases = [
{

    name: 'Breast Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (Primarily women age 40+, may affect younger adults)',
    symptoms: [
        'Lump in the breast or underarm',
        'Change in breast shape or size',
        'Nipple discharge',
        'Breast pain or tenderness',
        'Redness or scaling of breast skin'
    ],
    causes: [
        'Genetic mutations (BRCA1/BRCA2)',
        'Age (mostly women over 40)',
        'Family history of breast cancer',
        'Radiation exposure',
        'Obesity, hormonal factors'
    ],
    treatment: [
        'Surgery (lumpectomy or mastectomy)',
        'Radiation therapy',
        'Chemotherapy',
        'Hormone therapy',
        'Targeted therapy'
    ],
    prevention: 'Maintain healthy weight, regular exercise, breast self-exams, regular mammography screening.',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    citation: '<a href="https://www.cancerindia.org.in/types-of-cancer/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Cancer India. Breast Cancer. 2025.</a>'
},
{
    name: 'Cervical Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (Primarily women age 20+, peak 30–50 years)',
    symptoms: [
        'Irregular vaginal bleeding',
        'Pelvic pain',
        'Unusual vaginal discharge',
        'Pain during intercourse'
    ],
    causes: [
        'Human papillomavirus (HPV) infection',
        'Multiple sexual partners',
        'Smoking',
        'Early sexual activity',
        'Weakened immune system'
    ],
    treatment: [
        'Surgical removal of affected tissue',
        'Radiation therapy',
        'Chemotherapy',
        'Targeted therapy'
    ],
    prevention: 'HPV vaccination, safe sexual practices, routine Pap tests, avoiding smoking.',
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    citation: '<a href="https://www.cancerindia.org.in/types-of-cancer/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Cancer India. Cervical Cancer. 2025.</a>'
},
{
    name: 'Ovarian Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (Women age 30+, risk increases after 50)',
    symptoms: [
        'Abdominal bloating',
        'Pelvic pain',
        'Feeling full quickly',
        'Changes in bowel habits',
        'Unusual vaginal bleeding'
    ],
    causes: [
        'Family history',
        'Inherited gene mutations',
        'Endometriosis',
        'Age',
        'Obesity'
    ],
    treatment: [
        'Surgery',
        'Chemotherapy',
        'Targeted therapy'
    ],
    prevention: 'Genetic counseling, oral contraceptive use (for some women), maintaining a healthy weight.',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    citation: '<a href="https://www.indiancancersociety.org/cancer-information/types-cancer/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Indian Cancer Society. Ovarian Cancer. 2025.</a>'
},
{
    name: 'Endometrial (Uterine) Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (Women age 50+, postmenopausal)',
    symptoms: [
        'Unusual vaginal bleeding',
        'Pelvic pain',
        'Pain during intercourse',
        'Unintended weight loss'
    ],
    causes: [
        'Hormonal imbalance',
        'Obesity',
        'Family history',
        'Older age'
    ],
    treatment: [
        'Surgery',
        'Radiation therapy',
        'Hormone treatment',
        'Chemotherapy'
    ],
    prevention: 'Maintain healthy weight, treat hormonal conditions, regular gynecologic exams.',
    imageUrl: 'https://images.unsplash.com/photo-1465101178521-1f9c7febdfc9',
    citation: '<a href="https://gco.iarc.who.int/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">GCO IARC. Endometrial Cancer. 2022.</a>'
},
{
    name: 'Vaginal Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (Women age 50+, rare but possible at younger ages)',
    symptoms: [
        'Vaginal bleeding after intercourse',
        'Pelvic pain',
        'Unusual vaginal discharge'
    ],
    causes: [
        'HPV infection',
        'Smoking',
        'Age (older women)',
        'Previous cervical or vulvar cancer'
    ],
    treatment: [
        'Surgery',
        'Radiation therapy',
        'Chemotherapy'
    ],
    prevention: 'HPV vaccination, avoid smoking, regular gynecological screening.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    citation: '<a href="https://actrec.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACTREC. Vaginal Cancer. 2025.</a>'
},
{
    name: 'Vulvar Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (Women age 50+, but can occur at any adult age)',
    symptoms: [
        'Itching or burning in vulvar area',
        'Change in vulvar skin color or texture',
        'Vulvar lump or ulcer'
    ],
    causes: [
        'HPV infection',
        'Age (older women)',
        'Smoking',
        'Immune system suppression'
    ],
    treatment: [
        'Surgery',
        'Radiation therapy',
        'Chemotherapy'
    ],
    prevention: 'HPV vaccination, regular gynecological checkups, avoid tobacco.',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    citation: '<a href="https://actrec.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACTREC. Vulvar Cancer. 2025.</a>'
},
{
    name: 'Lip Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (mostly age 40+, but can affect younger)',
    symptoms: [
        'Non-healing sore on lip',
        'Lip swelling or bleeding',
        'Lump or thickening in lip'
    ],
    causes: [
        'Tobacco use, smoking and chewing',
        'Sun exposure',
        'Alcohol consumption'
    ],
    treatment: [
        'Surgery',
        'Radiation therapy'
    ],
    prevention: 'Avoid tobacco and excessive sun exposure, lip sunscreen use.',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    citation: '<a href="https://www.cancerindia.org.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Cancer India. Lip Cancer. 2025.</a>'
},


{
    name: 'Oral (Mouth) Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common age 40+, but can occur at younger ages with heavy tobacco/alcohol use)',
    symptoms: [
        'Persistent mouth ulcer',
        'Red or white patches inside mouth',
        'Difficulty chewing or swallowing',
        'Lump or thickening in cheek'
    ],
    causes: [
        'Tobacco usage',
        'Alcohol consumption',
        'HPV infection',
        'Poor oral hygiene'
    ],
    treatment: [
        'Surgery',
        'Radiation therapy',
        'Chemotherapy'
    ],
    prevention: 'Avoid tobacco and alcohol, maintain oral hygiene, regular dental check-ups.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    citation: '<a href="https://www.cancerindia.org.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Cancer India. Oral Cancer. 2025.</a>'
},
{
    name: 'Tongue Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common age 40+, but can affect younger adults with risk factors)',
    symptoms: [
        'Non-healing tongue ulcer',
        'Tongue pain',
        'Difficulty in swallowing',
        'Change in tongue color or texture'
    ],
    causes: [
        'Tobacco usage',
        'Alcohol consumption',
        'HPV infection'
    ],
    treatment: [
        'Surgery',
        'Radiation therapy',
        'Chemotherapy'
    ],
    prevention: 'Avoid tobacco and alcohol, oral hygiene, screening.',
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    citation: '<a href="https://www.cancerindia.org.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Cancer India. Tongue Cancer. 2025.</a>'
},
{
    name: 'Pharyngeal Cancer (Throat)',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common in middle-aged and elderly, rare in children)',
    symptoms: [
        'Throat pain',
        'Difficulty swallowing',
        'Persistent sore throat',
        'Voice changes'
    ],
    causes: [
        'Tobacco usage',
        'Alcohol consumption',
        'HPV infection'
    ],
    treatment: [
        'Radiation therapy',
        'Chemotherapy',
        'Surgery'
    ],
    prevention: 'Avoid tobacco and alcohol, screening for persistent symptoms.',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    citation: '<a href="https://metropolisindia.com/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Metropolis India. Throat Cancer. 2024.</a>'
},
{
    name: 'Laryngeal Cancer (Voice Box)',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common age 50+, may affect younger adults with risk factors)',
    symptoms: [
        'Hoarseness or change in voice',
        'Difficulty swallowing',
        'Sore throat',
        'Persistent cough',
        'Ear pain'
    ],
    causes: [
        'Smoking',
        'Alcohol consumption',
        'Exposure to toxic fumes'
    ],
    treatment: [
        'Surgery',
        'Radiation therapy',
        'Chemotherapy',
        'Voice rehabilitation'
    ],
    prevention: 'Avoid smoking and excessive alcohol, protect against hazardous fumes, early screening for voice changes.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    citation: '<a href="https://actrec.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACTREC. Laryngeal Cancer. 2025.</a>'
},
{
    name: 'Nasal Cavity/Sinus Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common age 45+, rare in children; may affect occupational groups)',
    symptoms: [
        'Persistent nasal congestion',
        'Nosebleeds',
        'Facial pain or numbness',
        'Swelling around the eyes',
        'Loss of smell'
    ],
    causes: [
        'Exposure to industrial chemicals',
        'Smoking',
        'HPV infection'
    ],
    treatment: [
        'Surgery',
        'Radiation therapy',
        'Chemotherapy'
    ],
    prevention: 'Protective masks for industrial workers, avoid tobacco and chemical exposure.',
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    citation: '<a href="https://actrec.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACTREC. Nasal Cancer. 2025.</a>'
},
{
    name: 'Thyroid Cancer',
    category: 'Oncological Condition',
    ageGroup: 'All ages (most common in adults 20–60, but can occur in children and elderly)',
    symptoms: [
        'Lump or swelling in neck',
        'Difficulty swallowing',
        'Voice changes',
        'Swollen lymph nodes in neck'
    ],
    causes: [
        'Radiation exposure',
        'Family history',
        'Certain genetic syndromes'
    ],
    treatment: [
        'Surgery',
        'Radioactive iodine therapy',
        'Hormone therapy'
    ],
    prevention: 'Minimize radiation exposure, genetic counseling for high-risk families.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    citation: '<a href="https://www.cancerindia.org.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Cancer India. Thyroid Cancer. 2025.</a>'
},
{
    name: 'Esophageal Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common age 50+, rare under 30)',
    symptoms: [
        'Difficulty swallowing',
        'Weight loss',
        'Chest pain',
        'Chronic cough',
        'Vomiting'
    ],
    causes: [
        'Tobacco use',
        'Alcohol consumption',
        'Gastroesophageal reflux disease (GERD)',
        'Obesity'
    ],
    treatment: [
        'Surgery',
        'Chemotherapy',
        'Radiation therapy',
        'Endoscopic therapy'
    ],
    prevention: 'Avoid tobacco, limit alcohol, maintain healthy weight, treat GERD early.',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    citation: '<a href="https://www.cghs.mohfw.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CGHS. Esophageal Cancer. 2025.</a>'
},
{
    name: 'Lung Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common age 50+, but can occur earlier in smokers/exposed individuals)',
    symptoms: [
        'Chronic cough',
        'Coughing up blood',
        'Chest pain',
        'Shortness of breath',
        'Unexplained weight loss'
    ],
    causes: [
        'Smoking (major risk)',
        'Exposure to air pollution',
        'Occupational exposure (asbestos, radon)',
        'Family history'
    ],
    treatment: [
        'Surgery',
        'Chemotherapy',
        'Radiation therapy',
        'Targeted drug therapy'
    ],
    prevention: 'No smoking, reduce air pollution exposure, use protection in hazardous jobs.',
    imageUrl: 'https://images.unsplash.com/photo-1465101178521-1f9c7febdfc9',
    citation: '<a href="https://gco.iarc.who.int/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">GCO IARC. Lung Cancer. 2022.</a>'
},
{
    name: 'Stomach (Gastric) Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common age 45+, rare in children)',
    symptoms: [
        'Abdominal pain or discomfort',
        'Poor appetite',
        'Unintentional weight loss',
        'Vomiting',
        'Blood in stool'
    ],
    causes: [
        'Helicobacter pylori infection',
        'Diet high in smoked/salty foods',
        'Family history',
        'Smoking'
    ],
    treatment: [
        'Surgery',
        'Chemotherapy',
        'Radiation therapy'
    ],
    prevention: 'Treat H. pylori, eat fresh fruits/vegetables, limit salty/smoked foods, stop smoking.',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    citation: '<a href="https://www.cghs.mohfw.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CGHS. Stomach Cancer. 2025.</a>'
},
{
    name: 'Colorectal Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common age 45+, risk increases with age; rare in children)',
    symptoms: [
        'Blood in stool',
        'Chronic constipation or diarrhea',
        'Abdominal discomfort or cramps',
        'Unexplained weight loss',
        'Fatigue'
    ],
    causes: [
        'Low-fiber, high-fat diet',
        'Family history',
        'Inflammatory bowel disease',
        'Obesity'
    ],
    treatment: [
        'Surgery',
        'Chemotherapy',
        'Radiation therapy',
        'Targeted therapy'
    ],
    prevention: 'Eat high-fiber diet, maintain healthy weight, routine screening over age 45.',
    imageUrl: 'https://images.unsplash.com/photo-1465101178521-1f9c7febdfc9',
    citation: '<a href="https://cancerindia.org.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Cancer India. Colorectal Cancer. 2025.</a>'
},
{
    name: 'Liver Cancer',
    category: 'Oncological Condition',
    ageGroup: 'All ages (most common in adults, rare in children: pediatric hepatoblastoma)',
    symptoms: [
        'Jaundice (yellow skin/eyes)',
        'Abdominal swelling/pain',
        'Unexplained weight loss',
        'Loss of appetite',
        'Fatigue'
    ],
    causes: [
        'Chronic hepatitis B/C',
        'Cirrhosis',
        'Aflatoxin exposure',
        'Alcohol abuse'
    ],
    treatment: [
        'Surgical removal',
        'Liver transplant',
        'Chemotherapy',
        'Radiofrequency ablation'
    ],
    prevention: 'Vaccinate against hepatitis B, reduce alcohol, avoid aflatoxin in food.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    citation: '<a href="https://gco.iarc.who.int/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">GCO IARC. Liver Cancer. 2022.</a>'
},
{
    name: 'Pancreatic Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common age 50+, rare in children: pancreatoblastoma)',
    symptoms: [
        'Abdominal/back pain',
        'Unintended weight loss',
        'Loss of appetite',
        'Jaundice',
        'Nausea',
        'Fatigue'
    ],
    causes: [
        'Smoking',
        'Chronic pancreatitis',
        'Diabetes',
        'Family history',
        'Obesity'
    ],
    treatment: [
        'Surgery',
        'Chemotherapy',
        'Targeted therapy'
    ],
    prevention: 'No smoking, healthy weight, treat pancreatitis early.',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    citation: '<a href="https://actrec.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACTREC. Pancreatic Cancer. 2025.</a>'
},
{
    name: 'Gall Bladder Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common age 50+, more common in Indian women)',
    symptoms: [
        'Abdominal pain',
        'Jaundice',
        'Nausea',
        'Vomiting'
    ],
    causes: [
        'Gallstones',
        'Chronic inflammation',
        'Older age',
        'Female sex'
    ],
    treatment: [
        'Surgery to remove gall bladder',
        'Chemotherapy',
        'Radiation therapy'
    ],
    prevention: 'Early treatment of gallstones/inflammation, maintain healthy weight.',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    citation: '<a href="https://actrec.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACTREC. Gall Bladder Cancer. 2025.</a>'
},

{
    name: 'Skin Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common age 40+, rare in children; risk increases with age and sun exposure)',
    symptoms: [
        'Non-healing sore',
        'Changes in shape/color of mole',
        'Growth that bleeds or oozes',
        'Unusual skin patches'
    ],
    causes: [
        'Excessive sun exposure',
        'Fair skin',
        'Family history'
    ],
    treatment: [
        'Surgical removal',
        'Topical medications',
        'Radiation therapy'
    ],
    prevention: 'Sun protection, regular skin checks.',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    citation: '<a href="https://indianjournalofsurgery.com/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Indian J Surgery. Skin Cancer. 2025.</a>'
},
{
    name: 'Hodgkin’s Lymphoma',
    category: 'Oncological Condition',
    ageGroup: 'All ages (most common in adolescents and young adults, second peak in elderly)',
    symptoms: [
        'Painless swollen lymph nodes',
        'Night sweats',
        'Unexplained weight loss',
        'Persistent fatigue',
        'Fever'
    ],
    causes: [
        'Infection with Epstein-Barr virus',
        'Family history',
        'Immune system impairment'
    ],
    treatment: [
        'Chemotherapy',
        'Radiation therapy',
        'Stem cell transplant (sometimes)'
    ],
    prevention: 'No established prevention; treat infections and maintain healthy immune system.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    citation: '<a href="https://www.indiancancersociety.org/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Indian Cancer Society. Hodgkin’s Lymphoma. 2025.</a>'
},
{
    name: 'Non-Hodgkin’s Lymphoma',
    category: 'Oncological Condition',
    ageGroup: 'All ages (can affect both children and adults, more common >50 yrs)',
    symptoms: [
        'Swollen lymph nodes',
        'Fever',
        'Night sweats',
        'Unexplained weight loss',
        'Fatigue'
    ],
    causes: [
        'Immune system impairment',
        'Family history',
        'Certain viral infections'
    ],
    treatment: [
        'Chemotherapy',
        'Radiation therapy',
        'Immunotherapy'
    ],
    prevention: 'No established prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    citation: '<a href="https://www.indiancancersociety.org/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Indian Cancer Society. Non-Hodgkin’s Lymphoma. 2025.</a>'
},
{
    name: 'Multiple Myeloma',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common age 65+, rare in those under 40)',
    symptoms: [
        'Bone pain (back/ribs)',
        'Fatigue',
        'Frequent infections',
        'Easy bleeding/bruising',
        'Kidney problems'
    ],
    causes: [
        'Older age',
        'Male sex',
        'Family history'
    ],
    treatment: [
        'Chemotherapy',
        'Stem cell transplant',
        'Immunomodulating drugs'
    ],
    prevention: 'No established prevention.',
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    citation: '<a href="https://actrec.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACTREC. Multiple Myeloma. 2025.</a>'
},
{
    name: 'Leukemia',
    category: 'Oncological Condition',
    ageGroup: 'All ages (types vary by age—acute lymphoblastic leukemia more common in children; chronic leukemias in adults)',
    symptoms: [
        'Frequent infections',
        'Fatigue',
        'Easy bruising or bleeding',
        'Bone/joint pain',
        'Swollen lymph nodes'
    ],
    causes: [
        'Genetic mutations',
        'Radiation exposure',
        'Certain viral infections'
    ],
    treatment: [
        'Chemotherapy',
        'Radiation therapy',
        'Stem cell transplant'
    ],
    prevention: 'Reduce radiation exposure, avoid hazardous chemicals.',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    citation: '<a href="https://mathrubhumi.com/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mathrubhumi. Leukemia. 2025.</a>'
},
{
    name: 'Bone Cancer',
    category: 'Oncological Condition',
    ageGroup: 'All ages (Osteosarcoma most common in children/adolescents, other types in adults/elderly)',
    symptoms: [
        'Bone pain (often at night)',
        'Swelling/tenderness near bones',
        'Bone fractures',
        'Fatigue',
        'Weight loss'
    ],
    causes: [
        'Genetic mutations',
        'Radiation exposure',
        'Paget’s disease of bone'
    ],
    treatment: [
        'Surgery (removal of tumor)',
        'Chemotherapy',
        'Radiation therapy'
    ],
    prevention: 'No specific prevention; reduce radiation exposure, monitor bone health in at-risk groups.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    citation: '<a href="https://www.cancerindia.org.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Cancer India. Bone Cancer. 2025.</a>'
},
{
    name: 'Eye Cancer (Retinoblastoma, Melanoma)',
    category: 'Oncological Condition',
    ageGroup: 'All ages (Retinoblastoma—infants/children; melanoma—adults)',
    symptoms: [
        'Change in vision',
        'Eye pain',
        'Visible lump or swelling',
        'White reflection in pupil',
        'Visual field loss'
    ],
    causes: [
        'Genetic predisposition (Retinoblastoma gene)',
        'UV radiation exposure'
    ],
    treatment: [
        'Surgery',
        'Radiation therapy',
        'Cryotherapy',
        'Laser therapy'
    ],
    prevention: 'Regular eye exams for children, proper UV protection for eyes.',
    imageUrl: 'https://images.unsplash.com/photo-1465101178521-1f9c7febdfc9',
    citation: '<a href="https://www.cancerindia.org.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Cancer India. Eye Cancer. 2025.</a>'
},
{
    name: 'Brain Cancer (Glioma, Meningioma, Medulloblastoma)',
    category: 'Oncological Condition',
    ageGroup: 'All ages (Gliomas, meningioma—adults; medulloblastoma—children)',
    symptoms: [
        'Persistent headaches',
        'Nausea/vomiting',
        'Seizures',
        'Vision changes',
        'Weakness or numbness'
    ],
    causes: [
        'Genetic mutations',
        'Radiation exposure',
        'Immune system disorders'
    ],
    treatment: [
        'Surgery',
        'Radiation therapy',
        'Chemotherapy'
    ],
    prevention: 'Use protective equipment around radiation, monitor for neurological symptoms.',
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    citation: '<a href="https://actrec.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACTREC. Brain Cancer. 2025.</a>'
},
{
    name: 'Spleen Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (rare overall, most often 40+ or with predisposing conditions)',
    symptoms: [
        'Abdominal pain (left side)',
        'Swelling of spleen',
        'Fatigue',
        'Frequent infections'
    ],
    causes: [
        'Genetic predisposition',
        'Chronic inflammation',
        'Certain blood disorders'
    ],
    treatment: [
        'Surgery to remove spleen',
        'Chemotherapy',
        'Radiation therapy'
    ],
    prevention: 'Treat underlying inflammation and blood disorders.',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    citation: '<a href="https://www.indiancancersociety.org/cancer-information/types-cancer/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Indian Cancer Society. Spleen Cancer. 2025.</a>'
},
{
    name: 'Peritoneal Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common in older women, rare in men or children)',
    symptoms: [
        'Abdominal pain/swelling',
        'Digestive problems',
        'Fatigue',
        'Unintended weight loss'
    ],
    causes: [
        'Genetic mutations',
        'Spread from ovarian/gastrointestinal cancers'
    ],
    treatment: [
        'Surgery',
        'Chemotherapy',
        'Targeted therapy'
    ],
    prevention: 'Monitor at-risk individuals; treat primary cancers early.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    citation: '<a href="https://www.cancerindia.org.in/types-of-cancer/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Cancer India. Peritoneal Cancer. 2025.</a>'
},
{
    name: 'Small Intestine Cancer',
    category: 'Oncological Condition',
    ageGroup: 'Adults (most common in age 60+, rare overall, especially in children)',
    symptoms: [
        'Abdominal pain',
        'Nausea and vomiting',
        'Blood in stool',
        'Unintended weight loss'
    ],
    causes: [
        'Genetic syndromes (e.g. Crohn’s, celiac, familial polyposis)',
        'Chronic inflammation',
        'Alcohol, tobacco'
    ],
    treatment: [
        'Surgery',
        'Chemotherapy',
        'Radiation therapy'
    ],
    prevention: 'Treat chronic inflammation, healthy lifestyle, genetic counseling for syndromes.',
    imageUrl: 'https://images.unsplash.com/photo-1465101178521-1f9c7febdfc9',
    citation: '<a href="https://www.cghs.mohfw.gov.in/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CGHS. Small Intestine Cancer. 2025.</a>'
},
{
    name: 'Adrenal Gland Cancer',
    category: 'Oncological Condition',
    ageGroup: 'All ages (most cases in adults, but can occur in children with syndromes)',
    symptoms: [
        'High blood pressure',
        'Abdominal pain',
        'Weight changes',
        'Hormonal imbalance'
    ],
    causes: [
        'Genetic mutations',
        'Inherited syndromes (Li-Fraumeni, MEN)',
        'Family history'
    ],
    treatment: [
        'Surgery to remove gland',
        'Chemotherapy',
        'Targeted therapy'
    ],
    prevention: 'Genetic counseling for hereditary syndromes.',
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    citation: '<a href="https://gco.iarc.who.int/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">GCO IARC. Adrenal Cancer. 2022.</a>'
},
{
    name: 'Neuroendocrine Tumors',
    category: 'Oncological Condition',
    ageGroup: 'All ages (most cases in adults, but can affect children with rare syndromes)',
    symptoms: [
        'Abdominal pain',
        'Hormone-related symptoms (flushing, diarrhea)',
        'Unintended weight loss',
        'Fatigue'
    ],
    causes: [
        'Genetic syndromes',
        'Chronic inflammation',
        'Family history'
    ],
    treatment: [
        'Surgery',
        'Targeted therapies',
        'Hormone therapy'
    ],
    prevention: 'Genetic counseling, treat inflammation, monitor at-risk individuals.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    citation: '<a href="https://www.indiancancersociety.org/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Indian Cancer Society. Neuroendocrine Tumors. 2025.</a>'
},
{
    name: 'Retinoblastoma',
    category: 'Pediatric Cancer (Eye)',
    ageGroup: 'Infants, young children (0–5 years)',
    symptoms: [
        'White reflection in pupil',
        'Vision impairment',
        'Eye redness or swelling'
    ],
    causes: [
        'Genetic mutation (RB1 gene)',
        'Family history'
    ],
    treatment: [
        'Chemotherapy',
        'Radiation therapy',
        'Surgery (enucleation)',
        'Laser/cryotherapy'
    ],
    prevention: 'Genetic counseling for affected families, early eye screening in infants.',
    imageUrl: 'https://images.unsplash.com/photo-1465101178521-1f9c7febdfc9',
    citation: '<a href="https://www.indiancancersociety.org/childhood-cancer/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Indian Cancer Society. Retinoblastoma. 2025.</a>'
},
{
    name: 'Rhabdomyosarcoma',
    category: 'Pediatric Cancer (Soft tissue/muscle)',
    ageGroup: 'Children and adolescents (2–20 years; peak <10 years)',
    symptoms: [
        'Lump or swelling (often painless)',
        'Difficulty with movement or function in affected area'
    ],
    causes: [
        'Genetic predisposition',
        'Family syndromes (e.g. Li-Fraumeni)'
    ],
    treatment: [
        'Chemotherapy',
        'Surgical removal',
        'Radiation therapy'
    ],
    prevention: 'Early evaluation of unexplained lumps, awareness for at-risk families.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    citation: '<a href="https://www.hopeandheal.in/childhood-cancers/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Hope and Heal. Rhabdomyosarcoma. 2025.</a>'
},
{
    name: 'Hepatoblastoma',
    category: 'Pediatric Cancer (Liver)',
    ageGroup: 'Infants, young children (0–3 years; peak under 2 years)',
    symptoms: [
        'Abdominal swelling',
        'Pain/tenderness',
        'Unintentional weight loss',
        'Loss of appetite'
    ],
    causes: [
        'Premature birth',
        'Genetic disorders (e.g. familial adenomatous polyposis)'
    ],
    treatment: [
        'Surgery to remove tumor',
        'Chemotherapy',
        'Liver transplantation'
    ],
    prevention: 'Prenatal care, genetic counseling for families with inherited syndromes.',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    citation: '<a href="https://ankurahospitals.com/pediatric-cancers/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Ankura Hospitals. Hepatoblastoma. 2025.</a>'
},
{
    name: 'Ewing’s Sarcoma',
    category: 'Pediatric/Young Adult Cancer (Bone, soft tissue)',
    ageGroup: 'Children & young adults (5–20 years; peak in teenage years)',
    symptoms: [
        'Bone pain',
        'Swelling around affected bone',
        'Fever'
    ],
    causes: [
        'Genetic alterations (EWSR1 gene fusion)',
        'Family history (rare)'
    ],
    treatment: [
        'Chemotherapy',
        'Surgery',
        'Radiation therapy'
    ],
    prevention: 'No known primary prevention; early evaluation for persistent bone pain.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
    citation: '<a href="https://www.hopeandheal.in/childhood-cancers/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Hope and Heal. Ewing’s Sarcoma. 2025.</a>'
},
{
    name: 'Wilms Tumor (Nephroblastoma)',
    category: 'Pediatric Cancer (Kidney)',
    ageGroup: 'Children (2–6 years; rare after age 8)',
    symptoms: [
        'Abdominal swelling/lump',
        'Abdominal pain',
        'Fever',
        'Blood in urine'
    ],
    causes: [
        'Genetic syndromes (WAGR, Beckwith-Wiedemann)',
        'Family history'
    ],
    treatment: [
        'Surgery',
        'Chemotherapy',
        'Radiation therapy (in some cases)'
    ],
    prevention: 'No primary prevention; monitoring for children with congenital syndromes.',
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    citation: '<a href="https://www.indiancancersociety.org/childhood-cancer/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Indian Cancer Society. Wilms Tumor. 2025.</a>'
},
{
    name: 'Neuroblastoma',
    category: 'Pediatric Cancer (Nervous system/adrenal)',
    ageGroup: 'Infants, young children (0–5 years; rare after age 10)',
    symptoms: [
        'Abdominal lump/swelling',
        'Bone pain',
        'Fatigue',
        'Unexplained fever'
    ],
    causes: [
        'Genetic abnormalities',
        'Family history (rare; ALK or PHOX2B gene mutations)'
    ],
    treatment: [
        'Surgery',
        'Chemotherapy',
        'Radiation therapy',
        'Stem cell transplant (advanced cases)'
    ],
    prevention: 'No known reliable prevention; genetic counseling for affected families.',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    citation: '<a href="https://www.indiancancersociety.org/childhood-cancer/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Indian Cancer Society. Neuroblastoma. 2025.</a>'
},
{
    name: 'Pleuropulmonary Blastoma',
    category: 'Pediatric Cancer (lung and pleura)',
    ageGroup: 'Infants, young children (0–6 years)',
    symptoms: [
        'Difficulty breathing',
        'Chest pain',
        'Cough'
    ],
    causes: [
        'Genetic mutations (DICER1 syndrome)'
    ],
    treatment: [
        'Surgical removal of tumor',
        'Chemotherapy',
        'Radiation therapy'
    ],
    prevention: 'Genetic counseling for DICER1 mutation carriers.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    citation: '<a href="https://www.hopeandheal.in/childhood-cancers/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Hope and Heal. Pleuropulmonary Blastoma. 2025.</a>'
},
{
    name: 'Medulloblastoma',
    category: 'Pediatric Cancer (brain)',
    ageGroup: 'Children (3–16 years; peak ages 5–9)',
    symptoms: [
        'Headache',
        'Vomiting',
        'Balance/coordination problems',
        'Vision disturbances'
    ],
    causes: [
        'Genetic syndromes (Gorlin syndrome, Turcot syndrome)',
        'Family history'
    ],
    treatment: [
        'Surgery',
        'Radiation therapy',
        'Chemotherapy'
    ],
    prevention: 'No proven prevention; genetic counseling for syndromic families.',
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    citation: '<a href="https://www.hopeandheal.in/childhood-cancers/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Hope and Heal. Medulloblastoma. 2025.</a>'
},
{
    name: 'Acute Lymphoblastic Leukemia (ALL)',
    category: 'Pediatric/Young Adult Cancer (blood)',
    ageGroup: 'Children (2–12 years), adolescents, young adults (most common childhood leukemia)',
    symptoms: [
        'Pale skin',
        'Fatigue',
        'Easy bruising/bleeding',
        'Frequent infections',
        'Bone pain'
    ],
    causes: [
        'Genetic mutations',
        'Down syndrome',
        'Radiation exposure'
    ],
    treatment: [
        'Chemotherapy',
        'Stem cell transplant',
        'Targeted therapies'
    ],
    prevention: 'Minimize avoidable radiation exposure, screening in at-risk conditions.',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2',
    citation: '<a href="https://www.indiancancersociety.org/childhood-cancer/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Indian Cancer Society. Leukemia. 2025.</a>'
}

];

const doctorsData = {

    'Delhi': [{
            name: 'Dr. Neerja Bhatla',
            credentials: 'MD, FICOG, Professor',
            experience: '30+ Years Experience',
            hospital: 'All India Institute of Medical Sciences (AIIMS), Delhi',
            address: 'Ansari Nagar, New Delhi - 110029',
            phone: '011 2659 6509',
            email: 'neerjabhatla@aiims.edu',
            hours: 'Mon-Fri 9AM-5PM',
            specializations: 'Gynecologic Oncology, Cervical Cancer, Ovarian Cancer, HPV',
            bookingLink: 'https://www.aiims.edu',
            rating: '4.9/5 (480 reviews)'
        },

        {
            name: 'Dr. Vandana Jain',
            credentials: 'MBBS, MS (OBGYN), DNB, Fellowship Gynae Oncology',
            experience: '17+ Years Experience',
            hospital: 'RGCIRC, Rohini',
            address: 'Sector 5, Rohini, Delhi - 110085',
            phone: '011 4702 4702',
            email: 'vandana.jain@rgcirc.org',
            hours: 'Mon-Fri 9AM-5PM',
            specializations: 'Gynecologic Oncology, Robotic Surgery',
            bookingLink: 'https://rgcirc.org',
            rating: '4.8/5 (120 reviews)'
        },
        {
            name: 'Dr. Kanika Batra Modi',
            credentials: 'MD, DNB, Fellowship Gynae Oncology',
            experience: '16+ Years Experience',
            hospital: 'Max Hospital Saket',
            address: '1-2, Press Enclave Road, Saket, New Delhi - 110017',
            phone: '011 4055 4055',
            email: 'kanikabatra@maxhealthcare.com',
            hours: 'Mon-Sat 9AM-3PM',
            specializations: 'Gynecologic Surgical Oncology, Early Detection',
            bookingLink: 'https://maxhealthcare.in',
            rating: '4.8/5 (65 reviews)'
        },
        {
            name: 'Dr. Sarika Gupta',
            credentials: 'MBBS, MD',
            experience: '21+ Years Experience',
            hospital: 'Action Cancer Hospital',
            address: 'A-4, Paschim Vihar, New Delhi - 110063',
            phone: '011 4925 4925',
            email: 'sarika.gupta@actioncancerhospital.com',
            hours: 'Mon-Sat 9AM-5:30PM',
            specializations: 'Robotic and Minimal Invasive Gynae Surgery',
            bookingLink: 'https://actioncancerhospital.com',
            rating: '4.9/5 (150 reviews)'
        },
        {
            name: 'Dr. Dinesh Kansal',
            credentials: 'MBBS, MD, DGO, FCPS',
            experience: '26+ Years Experience',
            hospital: 'BLK-Max Hospital',
            address: 'Pusa Road, New Delhi',
            phone: '011 3040 3040',
            email: 'dineshkansal@blkhospital.com',
            hours: 'Mon-Fri 9AM-4PM',
            specializations: 'Advanced Laparoscopic & Hysteroscopic Surgery',
            bookingLink: 'https://www.blkmaxhospital.com',
            rating: '4.7/5 (98 reviews)'
        },
        {
            name: 'Dr. Ranjana Sharma',
            credentials: 'MBBS, MD, FRCOG',
            experience: '32+ Years Experience',
            hospital: 'Apollo Hospital',
            address: 'Sarita Vihar, Delhi Mathura Road, New Delhi - 110076',
            phone: '011 2692 5858',
            email: 'ranjana.sharma@apollohospitals.com',
            hours: 'Mon-Sat 9AM-4PM',
            specializations: 'Gynecologic Oncology, Colposcopy, Pelvic Floor Surgery',
            bookingLink: 'https://practo.com',
            rating: '4.7/5 (120 reviews)'
        },
        {
            name: 'Dr. Yogesh Kulkarni',
            credentials: 'MBBS, MD, DNB',
            experience: '22+ Years Experience',
            hospital: 'Indraprastha Apollo Hospital',
            address: 'Sarita Vihar, Delhi',
            phone: '011 2692 5858',
            email: 'yogesh.kulkarni@apollohospitals.com',
            hours: 'Mon-Sat 10AM-5PM',
            specializations: 'Laparoscopic Oncology, Ovarian Cancer',
            bookingLink: 'https://apollohospitals.com',
            rating: '4.8/5 (142 reviews)'
        },

        {
            name: 'Dr. Amita Maheshwari',
            credentials: 'MD, FRCOG (UK), Fellowship in Gynecologic Oncology',
            experience: '22+ Years Experience',
            hospital: 'Tata Memorial Hospital (Delhi Unit)',
            address: 'Mehrauli Institutional Area, New Delhi',
            phone: 'Available on Request',
            email: 'amita.maheshwari@tmc.gov.in',
            hours: 'Mon-Fri 8AM-4PM',
            specializations: 'Ovarian Cancer, Uterine Cancer, Vulvar and Vaginal Cancer Surgery',
            bookingLink: 'https://tmc.gov.in',
            rating: '4.8/5 (350 reviews)'

        }
    ],
    'Mumbai': [{
            name: 'Dr. Sabita Jiwnani',
            credentials: 'MS, DNB, Gynecologic Oncologist',
            experience: '28+ Years Experience',
            hospital: 'Tata Memorial Hospital',
            address: 'Dr E Borges Road, Parel, Mumbai - 400012',
            phone: '+91 22 2417 7000',
            email: 'sabita.jiwnani@tmc.gov.in',
            hours: 'Mon-Fri 9AM-5PM',
            specializations: 'Gynecologic Cancer Surgery, Breast Cancer, HPV-related Cancers',
            bookingLink: 'https://tmc.gov.in',
            rating: '4.8/5 (620 reviews)'
        },
        {
            name: 'Dr. Sadhana Kulkarni',
            credentials: 'MD, DGO, Gynecologic Oncologist',
            experience: '30+ Years Experience',
            hospital: 'Lilavati Hospital & Research Centre',
            address: 'Bandra Reclamation, Bandra West, Mumbai - 400050',
            phone: '+91 22 2675 1000',
            email: 'sadhana.kulkarni@lilavatihospital.com',
            hours: 'Mon-Sat 10AM-3PM',
            specializations: 'Ovarian, Cervical and Uterine Cancer Surgery',
            bookingLink: 'https://www.lilavatihospital.com',
            rating: '4.7/5 (200 reviews)'
        },

        {
            name: 'Dr. Hemant B Tongaonkar',
            credentials: 'MBBS, MS',
            experience: '36+ Years Experience',
            hospital: 'Nanavati Max Super Speciality Hospital',
            address: '60-A, Bhulabhai Desai Road, Mumbai - 400026',
            phone: '022 2417 7000',
            email: 'hemant.tongaonkar@nanavatihospital.org',
            hours: 'Mon-Sat 8AM-2PM',
            specializations: 'Robotic & Laparoscopic Gynae Oncology',
            bookingLink: 'https://nanavatihospital.org',
            rating: '4.9/5 (210 reviews)'
        },
        {
            name: 'Dr. Maitreyee Parulekar',
            credentials: 'MBBS, MS, Gynae Oncosurgery',
            experience: '20+ Years Experience',
            hospital: 'KEM Hospital',
            address: 'Parel, Mumbai',
            phone: '022 2410 7000',
            email: 'maitreyee.parulekar@kem.edu',
            hours: 'Mon-Fri 9AM-4PM',
            specializations: 'Minimally Invasive Gynae Oncology',
            bookingLink: 'https://drmaitreyeegynec.in',
            rating: '4.7/5 (180 reviews)'
        },
        {
            name: 'Dr. Indira Hinduja',
            credentials: 'MD, PhD, DGO',
            experience: '50+ Years Experience',
            hospital: 'KEM Hospital',
            address: 'Parel, Mumbai',
            phone: '022 2410 7000',
            email: 'indira.hinduja@kem.edu',
            hours: 'Mon-Fri 8:30AM-2PM',
            specializations: 'Gynae Oncology, Infertility Pioneer',
            bookingLink: 'https://msmedical.care',
            rating: '4.7/5 (305 reviews)'
        },
        {
            name: 'Dr. Nandita Palshetkar',
            credentials: 'MBBS, MD',
            experience: '35+ Years Experience',
            hospital: 'Bloom IVF Clinics',
            address: 'Multiple branches, Mumbai',
            phone: 'Available on Request',
            email: 'nandita.palshetkar@bloomivf.com',
            hours: 'Mon-Sat 10AM-5PM',
            specializations: 'IVF, ART, Gynecologic Oncology',
            bookingLink: 'https://bloomivf.com',
            rating: '4.9/5 (292 reviews)'
        },
        {
            name: 'Dr. Duru Shah',
            credentials: 'MD, DGO, FCPS, FICOG',
            experience: '40+ Years Experience',
            hospital: 'Gynaecworld Clinic',
            address: 'Kemps Corner, Mumbai',
            phone: 'Available on Request',
            email: 'info@gynaecworld.com',
            hours: 'Mon-Sat 9:30AM-6:30PM',
            specializations: 'PCOS/PCOD, Onco Surgery',
            bookingLink: 'https://gynaecworld.com',
            rating: '4.8/5 (550 reviews)'
        },
        {
            name: 'Dr. Yogesh Kulkarni',
            credentials: 'MBBS, MD, DNB',
            experience: '22+ Years Experience',
            hospital: 'Kokilaben Dhirubhai Ambani Hospital',
            address: 'Andheri West, Mumbai',
            phone: '022 3069 6969',
            email: 'yogesh.kulkarni@kokilabenhospital.com',
            hours: 'Mon-Sat 10AM-5PM',
            specializations: 'Laparoscopic Gynae Oncology',
            bookingLink: 'https://kokilabenhospital.com',
            rating: '4.9/5 (190 reviews)'
        }

    ],
    'Bangalore': [{
            name: 'Dr. Sandhya Srinivasan',
            credentials: 'MD, DGO, Gynecologic Oncology',
            experience: '20+ Years Experience',
            hospital: 'Fortis Hospital Bannerghatta / Kidwai Cancer Institute',
            address: 'Bannerghatta Road, Bengaluru',
            phone: '+91 80 6621 4444',
            email: 'sandhya.srinivasan@fortishealthcare.com',
            hours: 'Mon-Fri 9AM-5PM',
            specializations: 'Gynecologic Malignancies, Minimally Invasive Cancer Surgery',
            bookingLink: 'https://www.fortishealthcare.com',
            rating: '4.8/5 (340 reviews)'
        },
        {
            name: 'Dr. Anita Ramesh',
            credentials: 'MBBS, MD, DM (Medical Oncology)',
            experience: '23+ Years Experience',
            hospital: 'Manipal Hospital',
            address: 'HAL Old Airport Rd, Kodihalli, Bengaluru - 560017',
            phone: '+91 80 2502 4444',
            email: 'anita.ramesh@manipalhospitals.com',
            hours: 'Mon-Sat 8AM-5PM',
            specializations: 'Gynecologic Oncology, Immunotherapy, Targeted Therapy',
            bookingLink: 'https://www.manipalhospitals.com',
            rating: '4.7/5 (180 reviews)'
        },
        {
            name: 'Dr. Abhilasha Narayan',
            credentials: 'MBBS, MS, DNB',
            experience: '12+ Years Experience',
            hospital: 'HCG Cancer Centre',
            address: 'K. R. Road, Bengaluru',
            phone: '080 3366 0666',
            email: 'abhilasha.narayan@hcgoncology.com',
            hours: 'Mon-Sat 8AM-4PM',
            specializations: 'Robotic & Laparoscopic Oncology, Cervical Cancer',
            bookingLink: 'https://hcgoncology.com',
            rating: '4.8/5 (120 reviews)'
        },
        {
            name: 'Dr. Nirmala Chandrashekar',
            credentials: 'MBBS, MS, Fellowship',
            experience: '20+ Years Experience',
            hospital: 'Gleneagles BGS Hospital',
            address: 'Kengeri, Bengaluru',
            phone: '080 2625 5555',
            email: 'nirmala.chandrashekar@bgshealthcare.com',
            hours: 'Mon-Fri 9AM-5PM',
            specializations: 'High-risk Gynae Cancer Surgery',
            bookingLink: 'https://bgshealthcare.com',
            rating: '4.7/5 (98 reviews)'
        },
        {
            name: 'Dr. Pruthviraj Mo',
            credentials: 'MBBS, DNB, PGD, FMAS, Fellowship',
            experience: '13+ Years Experience',
            hospital: 'Manipal Hospital Varthur Road',
            address: 'Varthur Road, Bengaluru',
            phone: '080 2502 4444',
            email: 'pruthviraj.mo@manipalhospitals.com',
            hours: 'Mon-Sat 8AM-5PM',
            specializations: 'Minimally Invasive Oncology, Laparoscopic Surgery',
            bookingLink: 'https://manipalhospitals.com',
            rating: '4.8/5 (60 reviews)'
        },
        {
            name: 'Dr. Roopa Vernekar',
            credentials: 'MBBS, DGO',
            experience: '28+ Years Experience',
            hospital: 'Manipal Hospitals, Jayanagar',
            address: 'Jayanagar, Bengaluru',
            phone: '080 3065 3065',
            email: 'roopa.vernekar@manipalhospitals.com',
            hours: 'Mon-Sat 8AM-3PM',
            specializations: 'Obstetrics, Gynecology, Laparoscopy',
            bookingLink: 'https://manipalhospitals.com',
            rating: '4.9/5 (92 reviews)'
        },
        {
            name: 'Dr. Rani Akhil Bhat',
            credentials: 'MBBS, MS, Fellowship',
            experience: '24+ Years Experience',
            hospital: 'Apollo Hospitals Bannerghatta',
            address: 'Bannerghatta Road, Bengaluru',
            phone: '080 2630 4050',
            email: 'rani.bhat@apollohospitals.com',
            hours: 'Mon-Fri 9AM-5PM',
            specializations: 'Gynecologic Oncology, Pelvic Exenteration',
            bookingLink: 'https://apollohospitals.com',
            rating: '4.8/5 (150 reviews)'
        }
    ],
    'Chennai': [{
            name: 'Dr. V. Padmini',
            credentials: 'MBBS, MD, DGO, Gynecologic Oncology',
            experience: '30+ Years Experience',
            hospital: 'Apollo Specialty Cancer Hospital',
            address: 'Teynampet, Chennai',
            phone: '+91 44 2433 9581',
            email: 'padmini.v@apollohospitals.com',
            hours: 'Mon-Fri 9AM-6PM',
            specializations: 'Gynecological Tumors, Cancer Surgery',
            bookingLink: 'https://www.apollohospitals.com',
            rating: '4.8/5 (292 reviews)'
        },
        {
            name: 'Dr. T. S. Premalatha',
            credentials: 'MD, DGO, FRCOG',
            experience: '35+ Years Experience',
            hospital: 'Cancer Institute (WIA)',
            address: 'Adyar, Chennai',
            phone: '+91 44 2235 0963',
            email: 'premalatha.ts@cancerinstitutewia.com',
            hours: 'Mon-Fri 10AM-2PM',
            specializations: 'Gynecologic Oncology, Chemotherapy, Cancer Prevention',
            bookingLink: 'https://www.cancerinstitutewia.in',
            rating: '4.7/5 (150 reviews)'
        },

        {
            name: 'Dr. V. Padmini',
            credentials: 'MBBS, MD, DGO',
            experience: '30+ Years Experience',
            hospital: 'Apollo Specialty Cancer Hospital',
            address: 'Teynampet, Chennai',
            phone: '044 2433 9581',
            email: 'padmini.v@apollohospitals.com',
            hours: 'Mon-Fri 9AM-6PM',
            specializations: 'Gynecological Tumors, Cancer Surgery',
            bookingLink: 'https://apollohospitals.com',
            rating: '4.8/5 (292 reviews)'
        },
        {
            name: 'Dr. Premalatha T.S.',
            credentials: 'MD, DGO, FRCOG',
            experience: '35+ Years Experience',
            hospital: 'Cancer Institute (WIA), Adyar',
            address: 'Adyar, Chennai',
            phone: '044 2235 0963',
            email: 'premalatha.ts@cancerinstitutewia.com',
            hours: 'Mon-Fri 10AM-2PM',
            specializations: 'Gynecologic Oncology, Chemotherapy',
            bookingLink: 'https://cancerinstitutewia.in',
            rating: '4.7/5 (150 reviews)'
        },
        {
            name: 'Dr. Meena Kumari',
            credentials: 'MBBS, MD',
            experience: '25+ Years Experience',
            hospital: 'VS Hospitals, Chetpet',
            address: 'Chetpet, Chennai',
            phone: '044 4600 4600',
            email: 'meena.kumari@vshospitals.com',
            hours: 'Mon-Fri 11AM-5PM',
            specializations: 'Ovarian & Cervical Cancer, Advanced Surgery',
            bookingLink: 'https://vshospitals.com',
            rating: '4.8/5 (85 reviews)'
        },
        {
            name: 'Dr. Sai Lakshmi Daayana',
            credentials: 'MBBS, MS, DNB',
            experience: '24+ Years Experience',
            hospital: 'Apollo Cancer Hospital',
            address: 'Teynampet, Chennai',
            phone: '044 2433 9581',
            email: 'sai.daayana@apollohospitals.com',
            hours: 'Mon-Sat 9AM-5PM',
            specializations: 'Gynae Oncology, Fertility-preserving Cancer Surgery',
            bookingLink: 'https://apollohospitals.com',
            rating: '4.7/5 (110 reviews)'
        },
        {
            name: 'Dr. Ganesh Chandra Subudhi',
            credentials: 'MD, DNB',
            experience: '27+ Years Experience',
            hospital: 'Apollo Cancer Hospital',
            address: 'Teynampet, Chennai',
            phone: '044 2433 9581',
            email: 'ganesh.subudhi@apollohospitals.com',
            hours: 'Mon-Sat 9AM-6PM',
            specializations: 'Gynecologic Cancer, Pelvic Surgery',
            bookingLink: 'https://apollohospitals.com',
            rating: '4.8/5 (89 reviews)'
        }

    ],
    'Hyderabad': [{
            name: 'Dr. Rekha Ayyagari',
            credentials: 'MBBS, MD, Consultant Gynecologic Oncology',
            experience: '20+ Years Experience',
            hospital: 'Apollo Cancer Institute',
            address: 'Jubilee Hills, Hyderabad',
            phone: '+91 40 2360 7777',
            email: 'rekha.ayyagari@apollohospitals.com',
            hours: 'Mon-Fri 9AM-5PM',
            specializations: 'Gynecologic Cancer, Prevention & Surgery',
            bookingLink: 'https://www.apollohospitals.com',
            rating: '4.7/5 (115 reviews)'
        },

        {
            name: 'Dr. R Suchitra',
            credentials: 'MBBS, MS, Fellowship',
            experience: '16+ Years Experience',
            hospital: 'American Oncology Institute',
            address: 'Hyderabad',
            phone: '040 6720 9000',
            email: 'suchitra.r@americanoncology.com',
            hours: 'Mon-Fri 9AM-4PM',
            specializations: 'Gynecologic Cancer Surgery, Cancer Awareness',
            bookingLink: 'https://americanoncology.com',
            rating: '4.8/5 (80 reviews)'
        },
        {
            name: 'Dr. Rekha Ayyagari',
            credentials: 'MBBS, MD',
            experience: '20+ Years Experience',
            hospital: 'Apollo Cancer Institute',
            address: 'Jubilee Hills, Hyderabad',
            phone: '040 2360 7777',
            email: 'rekha.ayyagari@apollohospitals.com',
            hours: 'Mon-Fri 9AM-5PM',
            specializations: 'Gynecologic Cancer, Prevention & Surgery',
            bookingLink: 'https://apollohospitals.com',
            rating: '4.7/5 (115 reviews)'
        },
        {
            name: 'Dr. Padmaja Reddy',
            credentials: 'MBBS, MD, Fellowship',
            experience: '19+ Years Experience',
            hospital: 'Care Hospitals',
            address: 'Banjara Hills, Hyderabad',
            phone: '040 6725 8585',
            email: 'padmaja.reddy@carehospitals.com',
            hours: 'Mon-Fri 10AM-6PM',
            specializations: 'Ovarian, Cervical, Uterine Cancer',
            bookingLink: 'https://carehospitals.com',
            rating: '4.7/5 (104 reviews)'
        },
        {
            name: 'Dr. Himabindu Annemraju',
            credentials: 'MS, Fellowship',
            experience: '20+ Years Experience',
            hospital: 'Rainbow Children’s Hospital',
            address: 'Nanakaramguda, Hyderabad',
            phone: '040 4969 4969',
            email: 'himabindu.annemraju@rainbowhospitals.in',
            hours: 'Mon-Fri 9AM-4PM',
            specializations: 'High-risk Gynae Cancer Surgery',
            bookingLink: 'https://rainbowhospitals.in',
            rating: '4.9/5 (68 reviews)'
        }

    ],
    'Kolkata': [{
        name: 'Dr. Indrani Dasgupta',
        credentials: 'MD (OB/GYN), Gynecologic Oncologist',
        experience: '25+ Years Experience',
        hospital: 'Apollo Gleneagles Hospitals',
        address: 'Salt Lake City, Kolkata',
        phone: '+91 33 2320 3040',
        email: 'indrani.dasgupta@apollohospitals.com',
        hours: 'Mon-Fri 9AM-6PM',
        specializations: 'Gynecologic Oncology, Fertility-Preserving Cancer Surgery',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.8/5 (74 reviews)'
    }],
    'Pune': [{
            name: 'Dr. Shweta Bansal',
            credentials: 'MBBS, MD, Gynecologic Oncologist',
            experience: '17+ Years Experience',
            hospital: 'Jupiter Hospital, Pune',
            address: 'Baner, Pune',
            phone: '+91 20 6686 6666',
            email: 'shweta.bansal@jupiterhospital.com',
            hours: 'Mon-Fri 10AM-5PM',
            specializations: 'Gynecologic Cancer, Laparoscopic Surgery',
            bookingLink: 'https://www.jupiterhospital.com',
            rating: '4.7/5 (134 reviews)'
        },

        {
            name: 'Dr. Jaipalreddy',
            credentials: 'MBBS, MD',
            experience: '20+ Years Experience',
            hospital: 'Jupiter Hospital, Pune',
            address: 'Baner, Pune',
            phone: '020 6686 6666',
            email: 'jaipal.reddy@jupiterhospital.com',
            hours: 'Mon-Fri 10AM-5PM',
            specializations: 'Gynecologic Cancer, Laparoscopic Surgery',
            bookingLink: 'https://jupiterhospital.com',
            rating: '4.8/5 (134 reviews)'
        },
        {
            name: 'Dr. Lalit Banswal',
            credentials: 'MS, Fellowship',
            experience: '21+ Years Experience',
            hospital: 'Precision Plus Superspeciality Hospital',
            address: 'Undri, Pune',
            phone: '9158050180',
            email: 'lalit.banswal@pphospital.com',
            hours: 'Mon-Sat 9AM-5PM',
            specializations: 'Laparoscopic and Robotic Cancer Surgery',
            bookingLink: 'https://drlalitbanswal.com',
            rating: '4.8/5 (52 reviews)'
        },
        {
            name: 'Dr. Pratibha Chavan',
            credentials: 'MD, DGO, DNB',
            experience: '17+ Years Experience',
            hospital: 'Galaxy Hospital',
            address: 'Pimple Saudagar, Pune',
            phone: '020 2721 2721',
            email: 'pratibha.chavan@galaxyhospital.in',
            hours: 'Mon-Sat 9AM-5PM',
            specializations: 'Infertility, IVF, Cancer Surgery',
            bookingLink: 'https://practo.com',
            rating: '4.8/5 (2539 reviews)'
        },
        {
            name: 'Dr. Sumit Shah',
            credentials: 'MBBS, MS',
            experience: '20+ Years Experience',
            hospital: 'Prudent International Health Clinic',
            address: 'Kothrud, Pune',
            phone: '020 2546 2546',
            email: 'sumit.shah@prudentclinic.com',
            hours: 'Mon-Fri 10AM-6PM',
            specializations: 'Oncology, Surgery',
            bookingLink: 'https://practo.com',
            rating: '4.9/5 (139 reviews)'
        }
    ],
    'Ahmedabad': [{
            name: 'Dr. Nisha R. Jain',
            credentials: 'MBBS, MD, Gynecologic Oncology',
            experience: '25+ Years Experience',
            hospital: 'HCG Cancer Centre',
            address: 'Sola, Ahmedabad',
            phone: '+91 79 2772 0000',
            email: 'nisha.jain@hcgoncology.com',
            hours: 'Mon-Fri 9AM-5PM',
            specializations: 'Gynecological Cancer, Surgery & Chemotherapy',
            bookingLink: 'https://www.hcghospitals.com',
            rating: '4.8/5 (81 reviews)'
        },

        {
            name: 'Dr. Sneha Baxi',
            credentials: 'MBBS, MD, Fellowship',
            experience: '25+ Years Experience',
            hospital: 'Marengo CIMS Hospital',
            address: 'Sola, Ahmedabad',
            phone: '079 2771 2771',
            email: 'sneha.baxi@cims.org',
            hours: 'Mon-Sat 10AM-7PM',
            specializations: 'High-risk Onco Surgery',
            bookingLink: 'https://cims.org',
            rating: '4.7/5 (195 reviews)'
        },
        {
            name: 'Dr. Manish Shah',
            credentials: 'MS (OB/GYN), DNB',
            experience: '23+ Years Experience',
            hospital: 'Tulip Women’s Hospital',
            address: 'Satellite, Ahmedabad',
            phone: 'Available on Request',
            email: 'manish.shah@tulipwomenshospital.com',
            hours: 'Mon-Fri 10AM-5PM',
            specializations: 'Laparoscopy, Cancer Surgery',
            bookingLink: 'https://practo.com',
            rating: '4.9/5 (17 reviews)'
        },
        {
            name: 'Dr. Ava Desai',
            credentials: 'MD, DGO',
            experience: '30+ Years Experience',
            hospital: 'Zydus Hospital',
            address: 'Thaltej, Ahmedabad',
            phone: '079 6619 0101',
            email: 'ava.desai@zydushospitals.com',
            hours: 'Mon-Sat 10AM-6PM',
            specializations: 'Radical Surgery, Early Detection',
            bookingLink: 'https://zydushospitals.com',
            rating: '4.8/5 (91 reviews)'
        },
        {
            name: 'Dr. Viral Patel',
            credentials: 'MBBS, MS, Fellowship',
            experience: '11+ Years Experience',
            hospital: 'Women’s Cancer Centre',
            address: 'Prahlad Nagar, Ahmedabad',
            phone: '079 2791 4791',
            email: 'viral.patel@womenscancercentre.com',
            hours: 'Mon-Sat 12PM-7PM',
            specializations: 'Robotic Onco-surgery',
            bookingLink: 'https://womenscancercentre.com',
            rating: '4.7/5 (64 reviews)'
        }

    ],

    'Kolkata': [{
            name: 'Dr. Rahul Roy Chowdhury',
            credentials: 'MBBS, MS, FRCSEd',
            experience: '33+ Years Experience',
            hospital: 'Manipal Hospitals Salt Lake',
            address: 'Salt Lake, Kolkata',
            phone: '033 4033 9999',
            email: 'rahul.roychowdhury@manipalhospitals.com',
            hours: 'Mon-Sat 1PM-6PM',
            specializations: 'Endometrial Cancer, Laparoscopic Oncology',
            bookingLink: 'https://gynaecancerkolkata.com',
            rating: '4.8/5 (65 reviews)'
        },
        {
            name: 'Dr. Suvendu Maji',
            credentials: 'MBBS, MS',
            experience: '13+ Years Experience',
            hospital: 'Apollo Gleneagles Hospitals',
            address: 'Salt Lake City, Kolkata',
            phone: '033 2320 3040',
            email: 'suvendu.maji@apollohospitals.com',
            hours: 'Mon-Fri 9AM-6PM',
            specializations: 'Pelvic Cancer Surgery, Gyne Oncology',
            bookingLink: 'https://apollohospitals.com',
            rating: '4.7/5 (40 reviews)'
        },
        {
            name: 'Dr. Sanjoy Mandal',
            credentials: 'MBBS, MS',
            experience: '29+ Years Experience',
            hospital: 'Desun Hospital',
            address: 'Kolkata',
            phone: '033 4033 9999',
            email: 'sanjoy.mandal@desunhospital.com',
            hours: 'Mon-Sat 2PM-7PM',
            specializations: 'Cancer Surgery, Oncology',
            bookingLink: 'https://practo.com',
            rating: '4.8/5 (98 reviews)'
        },
        {
            name: 'Dr. Shantanu Bannerjee',
            credentials: 'MBBS, MS',
            experience: '18+ Years Experience',
            hospital: 'Apollo Multispeciality Hospitals',
            address: 'EM Bypass, Kolkata',
            phone: '033 2320 3040',
            email: 'shantanu.banerjee@apollohospitals.com',
            hours: 'Mon-Sat 9AM-5PM',
            specializations: 'Ovarian, Cervical & Uterine Cancer',
            bookingLink: 'https://apollohospitals.com',
            rating: '4.9/5 (27 reviews)'
        }
    ]
};

// ========================================================================
// FAQS ARRAY
// ========================================================================
const faqs = [
    // --- 1. General Cancer Basics ---
    {
        icon: '❓',
        question: 'What is cancer?',
        answer: 'Cancer is a group of diseases in which abnormal cells grow uncontrollably, invading nearby tissues and sometimes spreading to other organs via blood or lymph.',
        citation: '<a href="https://www.cancer.gov/about-cancer/understanding/what-is-cancer" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Cancer Institute. What is Cancer?</a>'
    },
    {
        icon: '🔢',
        question: 'How many types of cancer are there?',
        answer: 'There are over 100 types of cancer, named after the organ or tissue where they originated, such as breast, lung, prostate, ovarian, colorectal, and skin cancers.',
        citation: '<a href="https://www.cancer.gov/about-cancer/types" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI: Types of Cancer</a>'
    },
    {
        icon: '🔬',
        question: 'Are all tumors cancerous?',
        answer: 'No. Benign tumors are not cancerous and do not spread. Only malignant tumors are cancerous and can invade surrounding tissue or metastasize.',
        citation: '<a href="https://www.cancer.org/cancer/cancer-basics/what-is-cancer.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">American Cancer Society. What is Cancer?</a>'
    },
    {
        icon: '👨‍👩‍👧',
        question: 'Can cancer be inherited?',
        answer: 'Some cancers have a hereditary component due to gene mutations passed from parents, such as BRCA1/2 in breast and ovarian cancers. Most cancers are due to acquired mutations.',
        citation: '<a href="https://www.cancer.gov/about-cancer/causes-prevention/genetics" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI: Genetics of Cancer</a>'
    },

    // --- 2. Risk Factors ---
    {
        icon: '⚠️',
        question: 'What are major risk factors for cancer?',
        answer: 'Risk factors include tobacco use, alcohol, unhealthy diet, obesity, lack of physical activity, certain infections (HPV, hepatitis B/C), family history, and exposure to carcinogens.',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/cancer" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Cancer Fact Sheet</a>'
    },
    {
        icon: '🛡️',
        question: 'Can cancer be prevented?',
        answer: 'Many cancers are preventable by avoiding tobacco, limiting alcohol, maintaining a healthy weight, regular exercise, vaccinations (HPV, hepatitis B), and early screenings.',
        citation: '<a href="https://www.cdc.gov/cancer/dcpc/prevention/index.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Cancer Prevention</a>'
    },
    {
        icon: '🍎',
        question: 'Does diet affect cancer risk?',
        answer: 'Unhealthy diets high in red/processed meats, saturated fat, and low in fruits and vegetables can increase cancer risk. A balanced diet with fiber protects against colorectal cancer.',
        citation: '<a href="https://www.cancer.org/healthy/eat-healthy-get-active/eat-healthy.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Diet & Cancer Risk</a>'
    },
    {
        icon: '🚭',
        question: 'Does tobacco use cause cancer?',
        answer: 'Yes, tobacco is the leading preventable cause of cancer, associated with lung, throat, oral, esophageal, bladder, pancreatic, and ovarian cancers.',
        citation: '<a href="https://www.cancer.org/cancer/cancer-causes/tobacco-and-cancer.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">American Cancer Society. Tobacco and Cancer</a>'
    },

    // --- 3. Symptoms & Diagnosis ---
    {
        icon: '🚨',
        question: 'What are common warning signs of cancer?',
        answer: 'Unexplained weight loss, persistent fatigue, lump or thickening, changes in bowel/bladder, unusual bleeding/discharge, persistent cough, difficulty swallowing, and skin changes.',
        citation: '<a href="https://www.cancer.org/cancer/cancer-symptoms/signs-and-symptoms-of-cancer.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Signs & Symptoms of Cancer</a>'
    },
    {
        icon: '🤐',
        question: 'Can cancer show no symptoms?',
        answer: 'Yes. Many cancers do not cause symptoms until advanced stages. Regular screening increases chances of early detection and effective treatment.',
        citation: '<a href="https://www.cancer.gov/types/common-cancers" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. Common Cancers</a>'
    },
    {
        icon: '🔍',
        question: 'How is cancer diagnosed?',
        answer: 'Diagnosis often involves physical exam, imaging tests (CT, MRI, PET), biopsies, blood tests, and pathology review.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/cancer/diagnosis-treatment/drc-20370588" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Cancer Diagnosis</a>'
    },
    {
        icon: '💉',
        question: 'What is a biopsy?',
        answer: 'A biopsy is a procedure in which a sample of tissue is removed and examined under a microscope to determine if cancer cells are present.',
        citation: '<a href="https://www.cancer.gov/about-cancer/diagnosis-staging/biopsy" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. Biopsy</a>'
    },
    {
        icon: '📊',
        question: 'Why is cancer staging important?',
        answer: 'Staging describes how far cancer has spread and guides decisions for treatment and prognosis.',
        citation: '<a href="https://www.cancer.org/cancer/cancer-staging.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Cancer Staging</a>'
    },

    // --- 4. Screening & Prevention ---
    {
        icon: '🔬',
        question: 'What screening tests detect cancer early?',
        answer: 'Screening methods include mammogram (breast), Pap test (cervical), HPV test, colonoscopy (colorectal), low-dose CT (lung), PSA (prostate), oral exam, and skin check.',
        citation: '<a href="https://www.cancer.gov/about-cancer/screening" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. Cancer Screening Overview</a>'
    },
    {
        icon: '📅',
        question: 'How often should I get screened for cancer?',
        answer: 'It depends on age, gender, family history, and risk factors. Typical guideline: breast (annual mammogram after 40), cervical (Pap/HPV every 3–5 years), colon (colonoscopy every 10 years after 45), prostate (PSA after 50), lung (low-dose CT for smokers >55).',
        citation: '<a href="https://www.cancer.org/healthy/find-cancer-early/screening-tests-and-early-detection.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">American Cancer Society. Screening Guidelines</a>'
    },
    {
        icon: '💉',
        question: 'Can HPV vaccination prevent cancer?',
        answer: 'Yes. HPV vaccine prevents multiple cancers (cervical, vaginal, vulvar, anal, oral, some penile) and is recommended for girls and boys starting age 11–12.',
        citation: '<a href="https://www.cdc.gov/hpv/parents/questions-answers.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. HPV Vaccine Q&A</a>'
    },

    // --- 5. Breast Cancer ---
    {
        icon: '👩',
        question: 'What are early warning signs of breast cancer?',
        answer: 'A painless lump or thickening, nipple changes/discharge, persistent redness, swelling, changes in breast size/shape, or skin dimpling.',
        citation: '<a href="https://www.cancer.org/cancer/types/breast-cancer/symptoms.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Breast Cancer Symptoms</a>'
    },
    {
        icon: '🎯',
        question: 'When should I start getting mammograms?',
        answer: 'Women at average risk should start annual screening from ages 40–44 and continue yearly or biennial after age 55.',
        citation: '<a href="https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Mammogram Guidelines</a>'
    },
    {
        icon: '👨',
        question: 'Can men get breast cancer?',
        answer: 'Yes, about 1% of all breast cancer cases occur in men.',
        citation: '<a href="https://www.cdc.gov/cancer/breast/men/index.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Breast Cancer in Men</a>'
    },

    // --- 6. Cervical & Ovarian Cancer ---
    {
        icon: '🦠',
        question: 'What causes cervical cancer?',
        answer: 'Most cases are caused by persistent infection with certain types of human papillomavirus (HPV).',
        citation: '<a href="https://www.cdc.gov/cancer/cervical/basic_info/causes.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Cervical Cancer Causes</a>'
    },
    {
        icon: '✅',
        question: 'How can cervical cancer be prevented?',
        answer: 'Regular Pap/HPV tests, safe sexual practices, and HPV vaccination can prevent most cases.',
        citation: '<a href="https://www.cdc.gov/cancer/cervical/basic_info/prevention.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Cervical Cancer Prevention</a>'
    },
    {
        icon: '⚡',
        question: 'What are symptoms of ovarian cancer?',
        answer: 'Bloating, pelvic or abdominal pain, difficulty eating, feeling full quickly, urgent/frequent urination—especially if new and persistent.',
        citation: '<a href="https://www.cancer.org/cancer/types/ovarian-cancer/symptoms.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Ovarian Cancer Symptoms</a>'
    },

    // --- 7. Prostate Cancer ---
    {
        icon: '🚽',
        question: 'What are symptoms of prostate cancer?',
        answer: 'Trouble urinating, weak urine stream, frequent urination at night, blood in urine/semen, erectile dysfunction, pelvic pain.',
        citation: '<a href="https://www.cancer.org/cancer/types/prostate-cancer/symptoms.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Prostate Cancer Symptoms</a>'
    },
    {
        icon: '💭',
        question: 'Should all men get PSA screening?',
        answer: 'Men over 50 (or earlier if high risk) should discuss PSA screening with their doctor. Not all need regular tests.',
        citation: '<a href="https://www.cancer.gov/types/prostate/psa-fact-sheet" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. PSA Testing</a>'
    },

    // --- 8. Lung Cancer ---
    {
        icon: '💨',
        question: 'What causes lung cancer most commonly?',
        answer: 'Cigarette smoking is the main cause, but air pollution, radon, and workplace exposures also contribute.',
        citation: '<a href="https://www.cdc.gov/cancer/lung" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Lung Cancer Causes</a>'
    },
    {
        icon: '🫁',
        question: 'What are signs of lung cancer?',
        answer: 'Persistent cough, chest pain, coughing up blood, shortness of breath, hoarseness, new wheezing.',
        citation: '<a href="https://www.cancer.org/cancer/types/lung-cancer/symptoms.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Lung Cancer Symptoms</a>'
    },

    // --- 9. Colorectal Cancer ---
    {
        icon: '🦠',
        question: 'What are symptoms of colon cancer?',
        answer: 'Blood in stool, persistent change in bowel habits, abdominal pain/cramps, unexplained weight loss.',
        citation: '<a href="https://www.cdc.gov/cancer/colorectal/basic_info/symptoms.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Colorectal Cancer Symptoms</a>'
    },
    {
        icon: '🥗',
        question: 'How can I reduce my risk of colon cancer?',
        answer: 'Maintain a healthy weight, be physically active, eat lots of fiber/fruits/vegetables, avoid tobacco and alcohol, get screened regularly.',
        citation: '<a href="https://www.cancer.org/cancer/types/colon-rectal-cancer/prevention.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Colon Cancer Prevention</a>'
    },

    // --- 10. Oral, Skin, Leukemia, Lymphoma ---
    {
        icon: '🦷',
        question: 'Who is at risk for oral cancer?',
        answer: 'Tobacco users, heavy drinkers, people with HPV infection, and poor oral hygiene are at greatest risk.',
        citation: '<a href="https://www.cancer.org/cancer/types/oral-cavity-and-oropharyngeal-cancer/causes-risks-prevention.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Oral Cancer Risk Factors</a>'
    },
    {
        icon: '☀️',
        question: 'How does skin cancer develop?',
        answer: 'Skin cancer, including melanoma, is mainly caused by excessive exposure to ultraviolet (UV) rays from sun or tanning beds.',
        citation: '<a href="https://www.cancer.org/cancer/types/skin-cancer.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Skin Cancer Info</a>'
    },
    {
        icon: '🔴',
        question: 'What are signs of leukemia?',
        answer: 'Frequent infections, fatigue, unexplained fever, easy bruising/bleeding, bone/joint pain, paleness.',
        citation: '<a href="https://www.cancer.org/cancer/types/leukemia/symptoms.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Leukemia Symptoms</a>'
    },
    {
        icon: '🫂',
        question: 'What are symptoms of lymphoma?',
        answer: 'Swollen lymph nodes, fever, night sweats, unexplained weight loss, itching, fatigue.',
        citation: '<a href="https://www.cancer.org/cancer/types/lymphoma/symptoms.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Lymphoma Symptoms</a>'
    },

    // --- 11. Treatment ---
    {
        icon: '💊',
        question: 'What are common treatments for cancer?',
        answer: 'Treatments include surgery, chemotherapy, radiation therapy, targeted therapy, immunotherapy, and hormone therapy. Many people have combined treatments.',
        citation: '<a href="https://www.cancer.gov/about-cancer/treatment/types" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. Cancer Treatment Types</a>'
    },
    {
        icon: '🏥',
        question: 'Does cancer always require chemotherapy?',
        answer: 'Not always. Some early-stage cancers are treated with surgery or radiation alone. Chemo is reserved for when cancer is more advanced or at risk of recurrence.',
        citation: '<a href="https://www.cancer.org/cancer/cancer-treatment/chemotherapy.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Chemotherapy</a>'
    },
    {
        icon: '⚔️',
        question: 'What is immunotherapy?',
        answer: 'Immunotherapy uses the body\'s own immune system to fight cancer. It\'s effective for some cancers, like melanoma, lung, and certain blood cancers.',
        citation: '<a href="https://www.cancer.org/cancer/cancer-treatment/immunotherapy.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Immunotherapy</a>'
    },

    // --- 12. Side Effects & Support ---
    {
        icon: '😴',
        question: 'What are common side effects of cancer treatment?',
        answer: 'Common side effects are fatigue, nausea, hair loss, anemia, infection risk, appetite changes, and emotional stress.',
        citation: '<a href="https://www.cancer.gov/about-cancer/treatment/side-effects" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. Side Effects</a>'
    },
    {
        icon: '🩹',
        question: 'How can I manage cancer pain?',
        answer: 'Cancer pain is treatable with medicine, physical therapy, nerve blocks, counseling, and complementary therapies.',
        citation: '<a href="https://www.cancer.org/treatment/treatments-and-side-effects/physical-side-effects/pain.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Cancer Pain Management</a>'
    },
    {
        icon: '💇',
        question: 'Is hair loss from chemotherapy permanent?',
        answer: 'No. Hair usually regrows a few weeks/months after chemotherapy ends, sometimes with changes in color or texture.',
        citation: '<a href="https://www.cancer.org/cancer/cancer-treatment/chemotherapy/side-effects/hair-loss.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Chemo Side Effects</a>'
    },

    // --- 13. Living with Cancer ---
    {
        icon: '🌱',
        question: 'Can cancer survivors live a normal life?',
        answer: 'Many cancer survivors lead long, healthy lives, but may face ongoing health, emotional, or financial challenges.',
        citation: '<a href="https://www.cancer.org/treatment/survivorship-during-and-after-treatment.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Cancer Survivorship</a>'
    },
    {
        icon: '🔄',
        question: 'Does cancer always come back?',
        answer: 'Not always. Recurrence risk depends on cancer type, stage, and treatment. Regular follow-ups with your doctor help monitor and manage any risks.',
        citation: '<a href="https://www.cancer.org/treatment/treatments-and-side-effects/physical-side-effects/fear-of-recurrence.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Cancer Recurrence</a>'
    },

    // --- 14. Palliative Care & End-of-Life ---
    {
        icon: '🤝',
        question: 'What is palliative care in cancer?',
        answer: 'Palliative care focuses on relief from symptoms and stress of cancer—improving quality of life for patients and families.',
        citation: '<a href="https://www.cancer.gov/about-cancer/advanced-cancer/care-choices/palliative-care" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. Palliative Care</a>'
    },
    {
        icon: '💙',
        question: 'When should someone consider hospice care for cancer?',
        answer: 'Hospice is considered when cancer is not responding to treatment and life expectancy is less than 6 months. Hospice focuses on comfort and dignity.',
        citation: '<a href="https://www.cancer.org/treatment/treatments-and-side-effects/palliative-care/hospice-care.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Hospice Care</a>'
    },

    // --- 15. Cancer and COVID-19 ---
    {
        icon: '🦠',
        question: 'Are cancer patients more at risk for COVID-19 complications?',
        answer: 'Cancer patients, especially those receiving chemotherapy or with blood cancers, are at higher risk of severe COVID-19 infection.',
        citation: '<a href="https://www.cancer.gov/about-cancer/coping/coronavirus/cancer-covid-19" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. Cancer & COVID-19</a>'
    },

    // --- 16. Childhood Cancer ---
    {
        icon: '👶',
        question: 'What are common childhood cancers?',
        answer: 'Leukemia, lymphoma, brain and spinal cord tumors, neuroblastoma, Wilms tumor, and bone cancers are most common in children.',
        citation: '<a href="https://www.cancer.gov/types/childhood-cancers" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. Childhood Cancers</a>'
    },
    {
        icon: '🧬',
        question: 'Are childhood cancers hereditary?',
        answer: 'Most childhood cancers are not inherited. Some rare genetic syndromes do increase the risk.',
        citation: '<a href="https://www.cancer.org/cancer/types/childhood-cancers.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Childhood Cancer Causes</a>'
    },

    // --- 17. Rare and Other Cancers ---
    {
        icon: '🦴',
        question: 'What is a sarcoma?',
        answer: 'Sarcomas are cancers that begin in bones or soft tissues (muscles, fat, nerves, blood vessels, or deep skin tissues).',
        citation: '<a href="https://www.cancer.org/cancer/types/soft-tissue-sarcoma.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Sarcoma Information</a>'
    },
    {
        icon: '🧪',
        question: 'What are neuroendocrine tumors?',
        answer: 'Neuroendocrine tumors (NETs) are rare cancers that develop from hormone-producing cells found throughout the body.',
        citation: '<a href="https://www.cancer.org/cancer/types/neuroendocrine-tumors.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. NET FAQs</a>'
    },

    // --- 18. Genetics & Testing ---
    {
        icon: '🧬',
        question: 'Should I get genetic testing for cancer risk?',
        answer: 'Genetic testing is recommended for people with a strong family history of certain cancers (breast, ovarian, colon, prostate). It can inform future prevention strategies.',
        citation: '<a href="https://www.cancer.gov/about-cancer/causes-prevention/genetics/genetic-testing-fact-sheet" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. Genetic Testing</a>'
    },
    {
        icon: '🔍',
        question: 'What is a BRCA gene mutation?',
        answer: 'BRCA1 and BRCA2 gene mutations greatly increase risk for breast and ovarian cancers and can be inherited.',
        citation: '<a href="https://www.cancer.gov/about-cancer/causes-prevention/genetics/brca-fact-sheet" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. BRCA Information</a>'
    },

    // --- 19. Myths & Facts ---
    {
        icon: '🍬',
        question: 'Does sugar feed cancer?',
        answer: 'There is no direct proof that sugar causes cancer growth, but high sugar intake can lead to obesity, which is a cancer risk factor.',
        citation: '<a href="https://www.cancer.org/cancer/cancer-causes/diet-physical-activity/sugar-and-cancer.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Sugar & Cancer Myth</a>'
    },
    {
        icon: '😰',
        question: 'Can stress cause cancer?',
        answer: 'There is no evidence that stress by itself causes cancer, but chronic stress may impact immune function, healing, and overall well-being.',
        citation: '<a href="https://www.cancer.gov/about-cancer/causes-prevention/risk/chronic-stress" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. Stress and Cancer</a>'
    },
    {
        icon: '🚫',
        question: 'Is cancer contagious?',
        answer: 'No. Cancer is not contagious and cannot be spread from person to person.',
        citation: '<a href="https://www.cancer.gov/about-cancer/understanding/myths" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. Cancer Myths</a>'
    },

    // --- 20. Prognosis & Statistics ---
    {
        icon: '📈',
        question: 'What is the overall survival rate for cancer?',
        answer: 'Overall 5-year survival rate for all cancers is about 69%. Survival rates vary widely by cancer type, stage, and region.',
        citation: '<a href="https://seer.cancer.gov/statfacts/html/all.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">SEER. Survival Stats 2025</a>'
    },
    {
        icon: '🔬',
        question: 'What is a clinical trial?',
        answer: 'A clinical trial is a research study to test new treatments, procedures, or drugs. Patients may join trials after discussing the risks and benefits with their doctor.',
        citation: '<a href="https://www.cancer.gov/about-cancer/treatment/clinical-trials" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCI. Clinical Trials</a>'
    },

    // --- 21. Survivorship & Follow-up ---
    {
        icon: '📋',
        question: 'How important are follow-up visits after cancer treatment?',
        answer: 'Follow-up is critical for monitoring recurrence, managing late side effects, and emotional support.',
        citation: '<a href="https://www.cancer.org/treatment/survivorship-during-and-after-treatment/follow-up-care.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Follow-up Care</a>'
    },
    {
        icon: '✈️',
        question: 'Can people with cancer work and travel?',
        answer: 'With proper treatment and doctor\'s advice, many cancer patients can continue work and travel safely.',
        citation: '<a href="https://www.cancer.net/navigating-cancer-care/living-cancer/cancer-and-work" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ASCO. Cancer & Work FAQ</a>'
    },
    {
        icon: '👶',
        question: 'Is it safe to have children after having cancer?',
        answer: 'Many survivors can safely become parents. Fertility depends on treatment type and age. Discuss options with your oncologist PRIOR to treatment.',
        citation: '<a href="https://www.cancer.net/navigating-cancer-care/dating-sex-and-reproduction/reproductive-health" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ASCO. Reproductive Health FAQ</a>'
    },

    // --- 22. Alternative Therapies & Prevention ---
    {
        icon: '🌿',
        question: 'Are alternative therapies effective for cancer?',
        answer: 'Some complementary therapies help relieve symptoms, but none are proven to cure cancer. Discuss all with your oncologist.',
        citation: '<a href="https://www.cancer.org/treatment/alternative-complementary-therapies.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Alternative Therapies</a>'
    },
    {
        icon: '💪',
        question: 'What can I do to boost my immune system during cancer treatment?',
        answer: 'Eat healthy, get rest, moderate exercise, wash hands often, follow doctor\'s advice. No supplement is proven to directly boost immunity during treatment.',
        citation: '<a href="https://www.cancer.org/treatment/treatments-and-side-effects/immune-suppression/tips-to-avoid-infection.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACS. Immune System Tips</a>'
    }
];

// ========================================================================
// NEW DATA STRUCTURES FOR EMPTY SECTIONS
// ========================================================================

const whenToSeeData = [

    // --- Breast Cancer ---
    {
        question: '🍈 Breast Lump or Nipple Changes',
        answer: 'See an oncologist if you find:<br>• A new, persistent lump in the breast or underarm<br>• Nipple discharge (especially bloody)<br>• Skin changes: redness, dimpling, or rash<br>• Sudden change in breast shape/size',
        citation: 'American Cancer Society (ACS). Early Detection of Breast Cancer. 2023.'
    },
    // --- Cervical Cancer ---
    {
        question: '🩸 Abnormal Vaginal Bleeding',
        answer: 'Visit an oncologist for:<br>• Bleeding between periods<br>• Bleeding after sex<br>• Bleeding after menopause<br><br>These are warning signs of cervical or uterine cancer.',
        citation: 'CDC. Signs and Symptoms of Cervical Cancer. 2025.'
    },
    // --- Ovarian Cancer ---
    {
        question: '🚨 Persistent Bloating, Early Satiety',
        answer: 'Ovarian cancer may present as:<br>• Bloating for >2 weeks<br>• Feeling full quickly<br>• Pelvic/abdominal pain',
        citation: 'ACS. Ovarian Cancer Signs. 2023.'
    },
    {
        question: '🚨 Pelvic Mass Found on Imaging',
        answer: 'Any mass or cyst in ovary seen on ultrasound or CT should be evaluated by a gynecologic oncologist.',
        citation: 'ACS. Ovarian Cancer Diagnosis. 2023.'
    },
    // --- Lung Cancer ---
    {
        question: '😮 Chronic Cough Lasting >3 Weeks',
        answer: 'See oncology for:<br>• Chronic cough or hoarseness<br>• Blood in sputum<br>• Shortness of breath',
        citation: 'CDC. Symptoms of Lung Cancer. 2025.'
    },
    {
        question: '🚬 History of Heavy Smoking + New Chest Symptoms',
        answer: 'High-risk adults with chest pain, new cough or weight loss should consult an oncologist for possible lung cancer.',
        citation: 'ACS. Lung Cancer Risk Factors. 2023.'
    },
    // --- Colorectal Cancer ---
    {
        question: '💩 Blood or Mucus in Stool',
        answer: 'Oncologist visit warranted for:<br>• Blood/mucus in stool<br>• Persistent abdominal pain/cramps<br>• New constipation/diarrhea',
        citation: 'CDC. Colorectal Cancer Symptoms. 2025.'
    },
    {
        question: '💩 Unexplained Iron Deficiency Anemia',
        answer: 'Hidden colon cancers can cause chronic blood loss and anemia. Investigate with colonoscopy if unexplained.',
        citation: 'ACS. Colon Cancer Red Flags. 2023.'
    },
    // --- Prostate Cancer ---
    {
        question: '🙍‍♂️ Changes in Urination',
        answer: 'See a urologic oncologist for:<br>• Weak urine stream<br>• Painful urination<br>• Blood in urine',
        citation: 'NCI. Prostate and Bladder Cancer Symptoms. 2025.'
    },
    {
        question: '🙍‍♂️ Bone Pain + History of Prostate Cancer',
        answer: 'Prostate cancer often spreads to bones. New bone pain requires urgent specialist referral.',
        citation: 'ACS. Advanced Prostate Cancer Symptoms. 2023.'
    },
    // --- Skin Cancer ---
     {
        question: '☀️ Rapidly Changing Mole',
        answer: 'See oncology/dermatology for:<br>• Mole changing in color, size, border<br>• Asymmetric or notched edges<br>• Bleeding, crusting lesions',
        citation: 'ACS. Skin Cancer Detection. 2023.'
    },
    {
        question: '☀️ New Pigmented Lesion in Adults',
        answer: 'Any new, pigmented skin lesion in adults should be checked ASAP for melanoma.',
        citation: 'ACS. Skin Cancer Signs. 2023.'
    },
    // --- Oral Cancer ---
    {
        question: '🦷 Persistent Mouth Ulcer or Lump',
        answer: 'See an oncologist for:<br>• Non-healing mouth sore (>2 weeks)<br>• Lump/thickening in mouth or neck<br>• Difficulty swallowing or persistent hoarseness',
        citation: 'American Cancer Society (ACS). Oral Cancer Early Detection. 2023.'
    },
    // --- Blood Cancers (Leukemia, Lymphoma) ---
    {
        question: '🧑‍⚕️ Persistent Fever, Night Sweats, or Lymph Node Swelling',
        answer: 'Contact oncology for:<br>• Persistent, unexplained fever<br>• Swollen lymph nodes (neck, armpits, groin)<br>• Night sweats<br>• Easy bruising/bleeding or rapid weight loss',
        citation: 'American Cancer Society (ACS). Leukemia and Lymphoma Symptoms. 2025.'
    },
    {
        question: '🩸 Unexplained Bruising or Bleeding',
        answer: 'Oncologist needed for:<br>• Frequent unexplained bruising<br>• Petechiae (small red spots)<br>• Persistent fatigue, fevers',
        citation: 'ACS. Leukemia Symptoms. 2025.'
    },

    // --- Childhood Cancer ---
    {
        question: '👶 Unusual Bruising, Lumps, or Persistent Fever in Children',
        answer: 'See a pediatric oncologist for:<br>• Persistent fever<br>• Unusual lumps or swelling<br>• Unexplained bruising/bleeding<br>• Persistent fatigue or bone pain',
        citation: 'American Cancer Society (ACS). Signs of Childhood Cancer. 2025.'
    },

    // --- Head & Neck Cancer ---
    {
        question: '🦷 Lump or Persistent Sore in Mouth, Jaw, or Throat',
        answer: 'Visit oncologist for:<br>• Sore or lump >2 weeks<br>• Difficulty swallowing<br>• White/red patches in mouth',
        citation: 'ACS. Oral Cancer Detection. 2023.'
    },

    // --- Rare Cancers & Hereditary Cancers ---
    {
        question: '🧬 Family History or Known Cancer Syndromes',
        answer: 'Consult an oncologist if:<br>• Multiple relatives have similar cancers<br>• Anyone has a known genetic mutation (BRCA, Lynch, etc.)<br>• Cancer at unusually young age',
        citation: 'National Cancer Institute (NCI). Hereditary Cancer Syndromes. 2025.'
    },
    // --- General Red Flags for All Cancers ---
    {
        question: '🚨 Unexplained Weight Loss, Severe Fatigue, or New Lump',
        answer: 'Visit an oncologist for:<br>• Unintentional weight loss (>5 kg in 6 months)<br>• Persistent fatigue<br>• New or growing lump anywhere in body<br>• Pain that does not go away',
        citation: 'Mayo Clinic. When to See Your Doctor About Cancer. 2024.'
    },

     // --- Kidney/Liver/Pancreas ---
    {
        question: '🧍‍♂️ Swollen Abdomen or Yellowish Skin (Jaundice)',
        answer: 'Oncologist review required for:<br>• Persistent abdominal swelling<br>• Yellow skin/eyes<br>• Persistent abdominal pain',
        citation: 'ACS. Liver/Pancreas Cancer Symptoms. 2023.'
    },
    // --- Thyroid Cancer ---
    {
        question: '🗣️ Lump in Front of Neck or Voice Changes',
        answer: 'Consult oncology for:<br>• Lump in neck<br>• Difficulty swallowing<br>• Hoarseness/voice changes',
        citation: 'ACS. Thyroid Cancer Symptoms. 2023.'
    },
    // --- Testicular/Ovarian ---
    {
        question: '🥚 Lump or Pain in Testicle',
        answer: 'Any lump or persistent pain in a testicle should be urgently checked by an oncologist.',
        citation: 'ACS. Testicular Cancer Warning. 2024.'
    },
    // --- Childhood Cancer ---
    {
        question: '👶 Unusual Bruising, Swelling or Fatigue in Children',
        answer: 'For children:<br>• Persistent, unexplained bruising<br>• Swelling/lumps<br>• Tiredness, bone pain',
        citation: 'ACS. Childhood Cancer Signs. 2025.'
    },
    // --- Brain/CNS Cancer ---
    {
        question: '🧠 Persistent Headaches, Vomiting, Vision or Behavior Changes',
        answer: 'See a neuro-oncologist for:<br>• Headaches not relieved by meds<br>• Persistent vomiting<br>• Behavioral or vision changes',
        citation: 'ACS. Brain Cancer Symptoms. 2025.'
    },
    // --- Bone Cancer ---
    {
        question: '🦴 Persistent Bone Pain or Swelling',
        answer: 'Consult oncology for:<br>• Pain/swelling in bones lasting weeks<br>• Difficulty walking or using limb<br>• Unexplained fractures',
        citation: 'ACS. Bone Cancer Warning Signs. 2023.'
    },
    // --- Cancers with Genetic Predisposition ---
    {
        question: '🧬 Family History of Multiple or Early Cancers',
        answer: 'If you have several close relatives with cancer, or any cancer diagnosed unusually young, seek specialist evaluation for hereditary risk.',
        citation: 'NCI. Hereditary Cancer Syndromes. 2025.'
    },
    // --- General Red Flags ---
    {
        question: '🚨 Sudden Onset of Severe Symptoms',
        answer: 'For any sudden, severe pain, unexplained bleeding, or rapid health decline, see an oncologist or emergency team immediately.',
        citation: 'Mayo Clinic. Urgent Cancer Symptoms. 2024.'
    },
    {
        question: '📅 Missed Screening, High-Risk History',
        answer: 'If you have missed recommended cancer screening or have a prior cancer diagnosis, schedule oncologist follow-up as soon as possible.',
        citation: 'ACS. Cancer Screening Importance. 2023.'
    },
    // --- More Specifics + Indian Context if Needed ---
    {
        question: '🛕 Lump or White Patch in Mouth (Betel/Tobacco Users)',
        answer: 'In India, users of betel nut or chewing tobacco are at high risk of oral cancer. Any non-healing lump or white patch in mouth must be evaluated by oncology.',
        citation: 'WHO. Oral Cancer in South Asia. 2025.'
    },
    {
        question: '🌞 Persistent Sore that Will Not Heal',
        answer: 'Any sore, especially on sun-exposed skin, that lasts longer than 2 weeks should be checked for skin cancer.',
        citation: 'ACS. Skin Cancer Red Flags. 2023.'
    },
    {
        question: '🚨 Unexplained Weight Loss (>5kg/6 Months)',
        answer: 'If you lose more than 5 kilos in 6 months without trying, see your doctor to rule out cancer and other causes.',
        citation: 'Mayo Clinic. Cancer and Weight Loss. 2024.'
    }
];

const preventionData = [
    // GENERAL CANCER PREVENTION
    {
        question: '🏃‍♂️ Regular Exercise',
        answer: 'Aim for at least 150 minutes of moderate exercise weekly. Physical activity lowers risk for breast, colon, and endometrial cancers and helps regulate weight and hormones.<br><br><em><a href="https://www.cancer.org/healthy/eat-healthy-get-active/acs-guidelines-nutrition-physical-activity-cancer-prevention.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">📚 ACS Cancer Prevention Guidelines 2022</a></em>',
        citation: 'American Cancer Society (ACS). Guidelines for Nutrition & Physical Activity. 2023.',
        icon: '🏃‍♂️'
    },
    {
        question: '🍎 Eat More Fruits & Vegetables',
        answer: 'A diet rich in fruits, vegetables, whole grains, and legumes provides antioxidants, fiber, and vitamins that support immune health and reduce cancer risk (esp. colon, esophageal, stomach).',
        citation: 'World Health Organization (WHO). Diet, Nutrition and Cancer. 2023.',
        icon: '🍎'
    },
    {
        question: '🥦 Limit Red & Processed Meat',
        answer: 'Reduce intake of red and processed meats to lower risk of colorectal and stomach cancers. Choose fish, poultry, beans, and plant proteins.',
        citation: 'WHO. Cancer Fact Sheet. 2024.',
        icon: '🥦'
    },
    {
        question: '🍷 Limit Alcohol Consumption',
        answer: 'Alcohol increases risk for mouth, throat, breast, colon, liver, and esophageal cancers. The safest level is none, but if you drink, keep it moderate.',
        citation: 'ACS. Alcohol and Cancer Risk. 2023.',
        icon: '🍷'
    },
    {
        question: '🚭 Quit Smoking and Avoid Tobacco',
        answer: 'Tobacco is linked with nearly every cancer type, especially lung, oral, throat, pancreatic, bladder, and cervical cancers. Quit smoking and avoid all forms of tobacco.',
        citation: 'WHO. Cancer and Tobacco. 2024.',
        icon: '🚭'
    },
    // BREAST CANCER
    {
        question: '🎀 Routine Breast Cancer Screening',
        answer: 'Get clinical breast exams annually and begin mammograms between ages 40-50 (as advised). Report any new lump or breast change promptly.',
        citation: 'ACS. Breast Cancer Early Detection. 2024.',
        icon: '🎀'
    },
    {
        question: '💪 Maintain Healthy Body Weight',
        answer: 'Managing weight reduces risk for breast, uterine, kidney, liver, and colon cancers. Obesity is a major modifiable risk factor.',
        citation: 'WHO. Weight and Cancer. 2023.',
        icon: '💪'
    },
    {
        question: '🧘‍♀️ Manage Stress and Mental Health',
        answer: 'Stress management techniques (yoga, meditation, therapy) can improve immune function and support recovery. Chronic stress may impact cancer risk indirectly.',
        citation: 'NIMH. Stress and Health. 2022.',
        icon: '🧘‍♀️'
    },
    // CERVICAL & OTHER GYNECOLOGIC CANCERS
    {
        question: '💉 HPV Vaccination',
        answer: 'Get the recommended HPV vaccine. It prevents cervical, vaginal, vulvar, anal, and some oral cancers. Ideally, vaccination should occur between ages 9-26.',
        citation: 'CDC. HPV Vaccine Recommendations. 2024.',
        icon: '💉'
    },
    {
        question: '🩺 Routine Pap Smears & HPV Testing',
        answer: 'Start Pap smears at 21 and continue regularly. Add HPV co-testing from age 30. Early detection saves lives.',
        citation: 'CDC. Cervical Cancer Screening Guidelines. 2025.',
        icon: '🩺'
    },
    {
        question: '🔗 Practice Safe Sex',
        answer: 'Using barrier protection and limiting sexual partners lowers the risk of HPV and other viral infections that cause cancer.',
        citation: 'CDC. Sexual Health and Cancer Prevention. 2024.',
        icon: '🔗'
    },
    // LUNG CANCER
    {
        question: '🏞️ Avoid Air Pollution and Carcinogens',
        answer: 'Minimize exposure to pollution, secondhand smoke, and workplace chemicals (radon, asbestos) to reduce lung cancer risk.',
        citation: 'WHO. Environmental Pollution and Cancer. 2024.',
        icon: '🏞️'
    },
    // COLON/RECTAL CANCER
    {
        question: '🍽️ Eat More Fiber',
        answer: 'Fiber-rich diets protect against colorectal cancer. Include whole grains, fruits, vegetables, and legumes daily.',
        citation: 'ACS. Fiber and Colorectal Cancer. 2023.',
        icon: '🍽️'
    },
    {
        question: '🏥 Regular Colonoscopy Screening',
        answer: 'Begin screening colonoscopies at age 45 (or earlier for high risk). Catching early polyps prevents most colorectal cancers.',
        citation: 'USPSTF. Colorectal Cancer Screening. 2023.',
        icon: '🏥'
    },
    // LIVER CANCER
    {
        question: '🦠 Hepatitis B & C Prevention',
        answer: 'Get vaccinated for hepatitis B and screened for hepatitis C. These viruses increase risk for liver cancer.',
        citation: 'World Health Organization (WHO). Hepatitis & Cancer. 2024.',
        icon: '🦠'
    },
    // SKIN CANCER
    {
        question: '🌞 Sun Safety & SPF Use',
        answer: 'Use broad-spectrum sunscreen SPF 30+, limit sun exposure between 10am-4pm, and avoid tanning beds. Protect against UV radiation to lower skin cancer risk.',
        citation: 'CDC. Sun Safety Basics. 2024.',
        icon: '🌞'
    },
    {
        question: '👕 Protective Clothing Outdoors',
        answer: 'Wear hats, sunglasses, and long sleeves when outdoors to reduce UV exposure and skin cancer risk.',
        citation: 'ACS. Skin Cancer Prevention. 2023.',
        icon: '👕'
    },
    // ORAL CANCER
    {
        question: '🥜 Avoid Betel, Areca, and Chewing Tobacco',
        answer: 'Never use betel/areca nut or chewing tobacco products, major oral cancer causes in India.',
        citation: 'WHO. Oral Cancer Fact Sheet, South Asia. 2025.',
        icon: '🥜'
    },
    // BLOOD CANCER
    {
        question: '💧 Radon & Chemical Safety at Work',
        answer: 'Reduce occupational exposure to chemicals (benzene, formaldehyde) and radon to lower leukemia/lymphoma risk.',
        citation: 'ACS. Blood Cancer Risks. 2023.',
        icon: '💧'
    },
    // PROSTATE CANCER
    {
        question: '🥦 Healthy Diet, Less Saturated Fats',
        answer: 'Eat more plant-based foods, limit dairy and saturated fats to lower prostate cancer risk.',
        citation: 'NCI. Diet and Prostate Cancer. 2024.',
        icon: '🥦'
    },
    {
        question: '🏥 Prostate Cancer PSA Screening',
        answer: 'Discuss PSA and DRE screening starting at age 50 (or earlier for high-risk men, e.g., those with family history).',
        citation: 'NCI. Prostate Cancer Screening. 2024.',
        icon: '🏥'
    },
    // OVARIAN CANCER
    {
        question: '🤱 Breastfeeding and Full-Term Pregnancy',
        answer: 'Having children and breastfeeding lowers ovarian cancer risk. Oral contraceptive use also provides some protection.',
        citation: 'ACS. Ovarian Cancer Risk Factors. 2023.',
        icon: '🤱'
    },
    // KIDNEY CANCER
    {
        question: '🚲 Maintain Active Lifestyle & Healthy Blood Pressure',
        answer: 'Regular exercise and controlling hypertension reduce kidney cancer risk.',
        citation: 'ACS. Kidney Cancer Prevention. 2023.',
        icon: '🚲'
    },
    // LYMPHOMA
    {
        question: '💉 Avoid Unnecessary Radiation Exposure',
        answer: 'Limit unnecessary medical x-rays and scans, as cumulative radiation may increase lymphoma risk.',
        citation: 'ACS. Radiation and Cancer Risks. 2023.',
        icon: '💉'
    },
    // THYROID CANCER
    {
        question: '🧂 Iodine-Rich Diet for Thyroid Health',
        answer: 'Consume iodine-rich foods (seafood, dairy, iodized salt) to support thyroid function and reduce risk of thyroid cancer.',
        citation: 'WHO. Thyroid Disease Prevention. 2024.',
        icon: '🧂'
    },
    // GENETICS & FAMILY HISTORY
    {
        question: '📦 Know Your Family Medical History',
        answer: 'Family history is key to early diagnosis and personalized screening. Discuss with your doctor.',
        citation: 'NCI. Family History and Cancer. 2024.',
        icon: '📦'
    },
    {
        question: '🧬 Consider Genetic Counseling if High Risk',
        answer: 'Individuals with multiple relatives with cancer or known mutations (BRCA, Lynch) should consult a genetic counselor.',
        citation: 'ACS. Genetics and Cancer. 2023.',
        icon: '🧬'
    },
    // GENERAL PREVENTION
    {
        question: '💤 Get Sufficient Sleep',
        answer: 'Aim for 7-9 hours of sleep nightly. Poor sleep may affect immune system and long-term cancer risk.',
        citation: 'NHS. Sleep and Cancer Risk. 2023.',
        icon: '💤'
    },
    {
        question: '⚖️ Maintain Healthy Weight',
        answer: 'Avoid weight gain. Every extra 5kg increases risk for several cancers. Weight control is a top preventive measure.',
        citation: 'WHO. Obesity and Cancer Risk. 2024.',
        icon: '⚖️'
    },

     // PANCREATIC CANCER
    {
        question: '🥤 Minimize Sugary Drinks & Maintain Healthy Sugar Control',
        answer: 'Obesity and poorly managed diabetes are linked to pancreatic cancer risk. Maintain good blood sugar, limit soda/energy drinks, and eat complex carbs.',
        citation: 'ACS. Pancreatic Cancer Prevention. 2024.',
        icon: '🥤'
    },
    // TESTICULAR CANCER
    {
        question: '🥚 Monthly Testicular Self-Exam',
        answer: 'Young men (15-40) should perform monthly self-exams to detect early lumps or swelling that may signal testicular cancer.',
        citation: 'ACS. Testicular Cancer Detection. 2023.',
        icon: '🥚'
    },
    // STOMACH (GASTRIC) CANCER
    {
        question: '🧂 Limit Salt-Preserved & Smoked Foods',
        answer: 'Eating large amounts of salt/cured/smoked foods increases gastric cancer risk. Prefer fresh fruits and vegetables.',
        citation: 'WHO. Stomach Cancer Risks. 2025.',
        icon: '🧂'
    },
    {
        question: '🏥 Treat H. pylori Infection',
        answer: 'Helicobacter pylori bacteria increases risk for gastritis and stomach cancer. Get tested and treated if symptomatic.',
        citation: 'ACS. Stomach Cancer Risk Factors. 2024.',
        icon: '🏥'
    },
    // GALLBLADDER & BILIARY CANCER
    {
        question: '⚖️ Avoid Rapid Weight Loss & Control Diabetes',
        answer: 'Rapid weight loss and poorly managed diabetes increase gallstone and gallbladder cancer risk. Gradual weight control is best.',
        citation: 'NCI. Gallbladder Cancer Prevention. 2025.',
        icon: '⚖️'
    },
    // BLADDER CANCER
    {
        question: '🚱 Minimize Occupational Exposure to Chemicals',
        answer: 'Exposure to dyes, chemicals, and pesticides can raise bladder cancer risk (especially in industry jobs). Use protective gear and limit exposure.',
        citation: 'ACS. Bladder Cancer Risks. 2023.',
        icon: '🚱'
    },
    // ESOPHAGEAL CANCER
    {
        question: '🍻 Limit Alcohol & Tobacco',
        answer: 'Drinking, smoking, and chronic heartburn (acid reflux) increase esophageal cancer risk. Treat reflux early and limit alcohol/tobacco.',
        citation: 'WHO. Esophageal Cancer Prevention. 2024.',
        icon: '🍻'
    },
    // ENDOMETRIAL/UTERINE CANCER
    {
        question: '💊 Hormonal Management with Medical Supervision',
        answer: 'Estrogen-only HRT, obesity, and PCOS increase uterine cancer risk. Seek medical advice for hormone management and timely treatment of abnormal periods.',
        citation: 'ACS. Endometrial Cancer Risk Factors. 2024.',
        icon: '💊'
    },
    // MULTIPLE MYELOMA
    {
        question: '💧 Avoid Benzene & Pesticide Exposure',
        answer: 'Some occupations with benzene or pesticide exposure may increase myeloma risk. Use PPE and minimize direct chemical contact.',
        citation: 'ACS. Multiple Myeloma Risks. 2024.',
        icon: '💧'
    },
    // SARCOMA
    {
        question: '🦴 Limit Exposure to Radiation & Certain Chemicals',
        answer: 'Past radiation, vinyl chloride, and certain inherited syndromes increase sarcoma risk. Use workplace protections and limit unnecessary scans.',
        citation: 'ACS. Sarcoma Prevention. 2023.',
        icon: '🦴'
    },
    // NEUROENDOCRINE CANCER
    {
        question: '🤒 Prompt Treatment of Chronic Pancreatitis',
        answer: 'Early diagnosis and management of chronic pancreatitis reduces neuroendocrine tumor risk.',
        citation: 'ACS. Neuroendocrine Tumor Info. 2025.',
        icon: '🤒'
    },
    // HODGKIN/NON-HODGKIN LYMPHOMA
    {
        question: '💉 Prevent/Treat HIV and Hepatitis Infections',
        answer: 'Prolonged immune suppression and viral infections increase lymphoma risk. Practice safe sex, test regularly, and treat promptly.',
        citation: 'CDC. Lymphoma and Infections. 2023.',
        icon: '💉'
    },
    // RETINOBLASTOMA (CHILDHOOD EYE CANCER)
    {
        question: '👁️ Genetic Counseling for At-Risk Families',
        answer: 'Families with history of retinoblastoma should seek genetic counseling for early screening and prevention.',
        citation: 'ACS. Retinoblastoma Prevention. 2024.',
        icon: '👁️'
    },
    // GENERAL - OCCUPATIONAL, ENVIRONMENT, RARE CANCERS
    {
        question: '🔬 Follow Safety Guidelines at Work',
        answer: 'Always wear personal protective equipment and follow local safety regulations to limit risk from occupational hazards.',
        citation: 'WHO. Occupational Cancer Risks. 2024.',
        icon: '🔬'
    },
    {
        question: '🏥 Regular Checkups for Cancer Survivors',
        answer: 'Cancer survivors should maintain regular follow-ups and screenings to catch recurrence or secondary cancers early.',
        citation: 'ACS. Survivor Guidelines. 2024.',
        icon: '🏥'
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
        "১. স্তন ক্যান্সার",
        "২. জরায়ুমুখের ক্যান্সার",
        "৩. ডিম্বাশয়ের ক্যান্সার",
        "৪. মুখ ও গলার ক্যান্সার",
        "৫. ফুসফুসের ক্যান্সার",
        "৬. কোলন/মলাশয়ের ক্যান্সার",
        "৭. পাকস্থলীর ক্যান্সার",
        "৮. থাইরয়েড ক্যান্সার",
        "৯. জরায়ু/এন্ডোমেট্রিয়াল ক্যান্সার",
        "১০. রক্তের ক্যান্সার/লিউকেমিয়া",
        "১১. খাদ্যনালীর ক্যান্সার",
        "১২. লিম্ফোমা"
];

// Sub-menu prompts
const healthPromptMap = {

      "breast_cancer": {
        "botPrompt": "স্তন ক্যান্সার সংক্রান্ত কোন লক্ষণ বা সমস্যা নিয়ে জানতে চান?",
        "options": [
          "স্তনে চাকা বা দলা",
          "স্তনের আকার বা আকৃতির পরিবর্তন",
          "স্তনের বোঁটা থেকে স্রাব",
          "স্তনের ত্বকে পরিবর্তন",
          "বগলে ফোলা বা চাকা"
        ]
    },
    "cervical_cancer": {
        "botPrompt": "জরায়ুমুখের ক্যান্সার সংক্রান্ত কোন সমস্যা নিয়ে আলোচনা করতে চান?",
        "options": [
          "অস্বাভাবিক যোনিপথে রক্তপাত",
          "সহবাসের পর রক্তপাত",
          "পিরিয়ডের মাঝে রক্তপাত",
          "তলপেটে ব্যথা",
          "যোনিপথে দুর্গন্ধযুক্ত স্রাব"
        ]
    },
    "ovarian_cancer": {
        "botPrompt": "ডিম্বাশয়ের ক্যান্সার সংক্রান্ত কোন লক্ষণ নিয়ে জানতে চান?",
        "options": [
          "পেট ফোলা বা ফুলে যাওয়া",
          "তলপেটে ক্রমাগত ব্যথা",
          "খেতে অসুবিধা বা তাড়াতাড়ি পেট ভরা",
          "ঘন ঘন প্রস্রাব",
          "অস্বাভাবিক ওজন হ্রাস"
        ]
    },
    "oral_cancer": {
        "botPrompt": "মুখ ও গলার ক্যান্সার সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
        "options": [
          "মুখে ঘা যা সারছে না",
          "মুখে সাদা বা লাল দাগ",
          "গলা বা মুখে চাকা",
          "গিলতে অসুবিধা",
          "মুখে অবশ অনুভূতি"
        ]
    },
    "lung_cancer": {
        "botPrompt": "ফুসফুসের ক্যান্সার সংক্রান্ত কোন লক্ষণ নিয়ে কথা বলতে চান?",
        "options": [
          "দীর্ঘস্থায়ী কাশি",
          "কফের সাথে রক্ত",
          "শ্বাসকষ্ট",
          "বুকে ব্যথা",
          "ওজন হ্রাস ও ক্লান্তি"
        ]
    },
    "colorectal_cancer": {
        "botPrompt": "কোলন/মলাশয়ের ক্যান্সার সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
        "options": [
          "মলত্যাগের অভ্যাসে পরিবর্তন",
          "মলের সাথে রক্ত",
          "পেটে ব্যথা বা খিঁচুনি",
          "দুর্বলতা ও ক্লান্তি",
          "অব্যাখ্যাত ওজন হ্রাস"
        ]
    },
    "stomach_cancer": {
        "botPrompt": "পাকস্থলীর ক্যান্সার সংক্রান্ত কোন লক্ষণ নিয়ে আলোচনা করতে চান?",
        "options": [
          "পেটের উপরিভাগে ব্যথা",
          "বমি বমি ভাব ও বমি",
          "ক্ষুধামন্দা",
          "খাবারের পর পেট ভরা অনুভূতি",
          "অব্যাখ্যাত ওজন হ্রাস"
        ]
    },
    "thyroid_cancer": {
        "botPrompt": "থাইরয়েড ক্যান্সার সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
        "options": [
          "গলায় চাকা বা ফোলা",
          "গলার স্বর পরিবর্তন",
          "গিলতে অসুবিধা",
          "শ্বাসকষ্ট",
          "গলায় ব্যথা"
        ]
    },
    "uterine_cancer": {
        "botPrompt": "জরায়ু/এন্ডোমেট্রিয়াল ক্যান্সার সংক্রান্ত কোন লক্ষণ নিয়ে জানতে চান?",
        "options": [
          "অস্বাভাবিক যোনিপথে রক্তপাত",
          "মেনোপজের পর রক্তপাত",
          "পিরিয়ডের সময় অতিরিক্ত রক্তপাত",
          "তলপেটে ব্যথা",
          "যোনিপথে জলীয় স্রাব"
        ]
    },
    "blood_cancer": {
        "botPrompt": "রক্তের ক্যান্সার/লিউকেমিয়া সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
        "options": [
          "ঘন ঘন সংক্রমণ",
          "দুর্বলতা ও ক্লান্তি",
          "সহজেই রক্তপাত বা ক্ষত",
          "জ্বর ও রাতে ঘাম",
          "হাড়ে বা জয়েন্টে ব্যথা"
        ]
    },
    "esophageal_cancer": {
        "botPrompt": "খাদ্যনালীর ক্যান্সার সংক্রান্ত কোন লক্ষণ নিয়ে কথা বলতে চান?",
        "options": [
          "গিলতে অসুবিধা বা ব্যথা",
          "বুকে জ্বালাপোড়া",
          "বুকে ব্যথা বা চাপ",
          "অব্যাখ্যাত ওজন হ্রাস",
          "দীর্ঘস্থায়ী কাশি বা কণ্ঠস্বর পরিবর্তন"
        ]
    },
    "lymphoma": {
        "botPrompt": "লিম্ফোমা সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
        "options": [
          "ঘাড়, বগল বা কুঁচকিতে ফোলা লসিকা গ্রন্থি",
          "জ্বর ও রাতে ঘাম",
          "ক্লান্তি ও দুর্বলতা",
          "অব্যাখ্যাত ওজন হ্রাস",
          "চুলকানি"
        ]
    }
};

// Map Bengali to English keys
const nextStateMap = {
    "১. স্তন ক্যান্সার": "breast_cancer",
    "২. জরায়ুমুখের ক্যান্সার": "cervical_cancer",
    "৩. ডিম্বাশয়ের ক্যান্সার": "ovarian_cancer",
    "৪. মুখ ও গলার ক্যান্সার": "oral_cancer",
    "৫. ফুসফুসের ক্যান্সার": "lung_cancer",
    "৬. কোলন/মলাশয়ের ক্যান্সার": "colorectal_cancer",
    "৭. পাকস্থলীর ক্যান্সার": "stomach_cancer",
    "৮. থাইরয়েড ক্যান্সার": "thyroid_cancer",
    "৯. জরায়ু/এন্ডোমেট্রিয়াল ক্যান্সার": "uterine_cancer",
    "১০. রক্তের ক্যান্সার/লিউকেমিয়া": "blood_cancer",
    "১১. খাদ্যনালীর ক্যান্সার": "esophageal_cancer",
    "১২. লিম্ফোমা": "lymphoma"
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

// CANCER COMMUNITY GROUP

// Ensure formData is initialized.
if (typeof formData === "undefined") {
  var formData = {};
}
// Get cancerType and community consent from form
formData.cancerType = document.getElementById('cancerType')?.value || "";
formData.joinCommunity = document.getElementById('joinCommunity')?.checked || false;


// Get cancerType (disease) and community consent from form
const cancerType = document.getElementById('cancerType')?.value || "";
const joinCommunity = document.getElementById('joinCommunity')?.checked || false;
formData.cancerType = cancerType;
formData.joinCommunity = joinCommunity;

// Data for cancer community groups
const CANCER_COMMUNITY_GROUPS = {
  breast: {
    name: "Breast Cancer Support Group",
    members: 170,
    description: "Connect with others, share experiences, join webinars.",
    color: "#f04545"
  },
  cervical: {
    name: "Cervical Cancer Fighters",
    members: 105,
    description: "Patient stories, awareness, expert Q&A.",
    color: "#ab47bc"
  },
  lung: {
    name: "Lung Cancer Warriors",
    members: 98,
    description: "Daily chat, coping strategies, lung health tips.",
    color: "#00acc1"
  },
  ovarian: {
    name: "Ovarian Cancer Network",
    members: 73,
    description: "Support, research updates, live community meetings.",
    color: "#fbc02d"
  },
  oral: {
    name: "Oral Cancer Champions",
    members: 68,
    description: "Survivor stories, prevention tips, peer support.",
    color: "#8d6e63"
  },
  colorectal: {
    name: "Colorectal Cancer Collective",
    members: 91,
    description: "Connect, learn, share your journey – together.",
    color: "#43a047"
  },
  stomach: {
    name: "Stomach Cancer Hope Group",
    members: 56,
    description: "Expert guidance, patient journeys, nutrition tips.",
    color: "#e65100"
  },
  thyroid: {
    name: "Thyroid Cancer Warriors",
    members: 60,
    description: "Daily chat, coping strategies, patient meetups.",
    color: "#d84040"
  },
  uterine: {
    name: "Uterine Cancer Circle",
    members: 39,
    description: "Empowering women, sharing care resources, expert talks.",
    color: "#fb8c00"
  },
  blood: {
    name: "Blood Cancer Alliance",
    members: 120,
    description: "Meet peers, join virtual sessions, get trusted info.",
    color: "#ad1457"
  },
  esophageal: {
    name: "Esophageal Cancer Support",
    members: 22,
    description: "Find friends, get direct support, join webinars.",
    color: "#01579b"
  },
  lymphoma: {
    name: "Lymphoma Warriors Community",
    members: 59,
    description: "Educational events, peer stories, expert connect.",
    color: "#827717"
  },
  pancreatic: {
    name: "Pancreatic Cancer Peer Group",
    members: 34,
    description: "Connect to others, share therapy decisions, Q&A.",
    color: "#4e342e"
  },
  prostate: {
    name: "Prostate Cancer Network",
    members: 71,
    description: "Support, men’s health tips, stories and updates.",
    color: "#0d47a1"
  },
  skin: {
    name: "Skin Cancer Care Forum",
    members: 47,
    description: "Prevention, coping, share experiences and events.",
    color: "#fff176"
  }
};

// Display community groups based on selected cancer condition
function showRecommendedGroups(userCancerType) {
  const section = document.getElementById("patientGroupsSection");
  if (!section) return;

  section.innerHTML = `<h3 style="color: var(--color-primary); margin-bottom: 1rem;">Cancer Support Communities</h3>`;
  let groupList = "";

  Object.entries(CANCER_COMMUNITY_GROUPS).forEach(([key, group]) => {
    if (key === userCancerType || userCancerType === "") {
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
if (formData.joinCommunity && formData.cancerType) {
  showRecommendedGroups(formData.cancerType);
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
  // Show consent message about profile visibility in the cancer community group
  // e.g. document.getElementById("consentNotice").style.display = "block";
}

// END CANCER COMMUNITY GROUP

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