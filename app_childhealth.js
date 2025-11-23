// ========================================================================
// WOMEN'S HEALTH EDUCATION - COMPLETE APP.JS (UPDATED FOR IMAGES AND ALL SECTIONS)
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

// Childs's Health Resources (matching Python exactly) - Updated with Asansol
const CHILD_HEALTH_RESOURCES = {
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

const DISTRICTS = Object.keys(CHILD_HEALTH_RESOURCES);

// Health categories matching Python exactly
const HEALTH_CATEGORIES = {
    "start": {
        "botPrompt": "নমস্কার! আমি নারীশক্তি, আপনার স্বাস্থ্য সংক্রান্ত প্রশ্নে সাহায্য করতে এসেছি। আপনি কোন ধরনের স্বাস্থ্য সমস্যা নিয়ে কথা বলতে চান?",
        "options": [
            "১. শীতল-জ্বর ও সর্দি",
            "২. ডায়রিয়া ও পাতলা পায়খানা",
            "৩. নিমোনিয়া ও ব্রঙ্কাইটিস",
            "৪. মূল খাদ্য স্বল্পতা ও অপুষ্টি",
            "৫. কনজাঙ্কটিভাইটিস",
            "৬. ত্বকের সংক্রমণ",
            "৭. আন্ত্রিক কৃমি",
            "৮. মিজলস্/হাম",
            "৯. টিবি/যক্ষ্মা",
            "১০. জন্মজনিত সমস্যা/শিশুদের বিকাশজনিত সমস্যা"
        ],
        "nextStateMap": {
              "১. শীতল-জ্বর ও সর্দি": "cold_fever",
              "২. ডায়রিয়া ও পাতলা পায়খানা": "diarrhea",
              "৩. নিমোনিয়া ও ব্রঙ্কাইটিস": "pneumonia_bronchitis",
              "৪. মূল খাদ্য স্বল্পতা ও অপুষ্টি": "malnutrition",
              "৫. কনজাঙ্কটিভাইটিস": "conjunctivitis",
              "৬. ত্বকের সংক্রমণ": "skin_infection",
              "৭. আন্ত্রিক কৃমি": "intestinal_worm",
              "৮. মিজলস্/হাম": "measles",
              "৯. টিবি/যক্ষ্মা": "tuberculosis",
              "১০. জন্মজনিত সমস্যা/শিশুদের বিকাশজনিত সমস্যা": "congenital_developmental"
        }
    },
     "cold_fever": {
        "botPrompt": "আপনি কি সর্দি, কাশি বা জ্বরের সমস্যা নিয়ে আলোচনা করতে চান?",
        "options": [
          "শিশুর কাশি",
          "জ্বর ও গায়ে ব্যথা",
          "গলা ব্যথা",
          "সর্দি, নাক বন্ধ",
          "নাক দিয়ে পানি পড়া"
        ]
      },
      "diarrhea": {
        "botPrompt": "ডায়রিয়া বা পাতলা পায়খানা সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
        "options": [
          "ঘন ঘন পাতলা পায়খানা",
          "বমি বা ডিহাইড্রেশন",
          "পেট ব্যথা",
          "খাদ্যজনিত অস্বস্তি",
          "মল বাজে গন্ধ"
        ]
      },
      "pneumonia_bronchitis": {
        "botPrompt": "শিশুর শ্বাসকষ্ট, কফ বা নিউমোনিয়া/ব্রঙ্কাইটিস নিয়ে সাহায্য চান?",
        "options": [
          "শ্বাসকষ্ট",
          "কফ বা কাশির সমস্যা",
          "চেস্ট ইনফেকশন",
          "বুকে ঘড়ঘড় শব্দ",
          "উচ্চ জ্বর"
        ]
      },
      "malnutrition": {
        "botPrompt": "শিশুর পুষ্টি ঘাটতি বা অপুষ্টি নিয়ে জানতে চান?",
        "options": [
          "ওজন কমে যাওয়া",
          "শিশুর বৃদ্ধি কম",
          "শিশু খেতে চায় না",
          "অনিয়মিত খাবার",
          "ভিটামিনের ঘাটতি"
        ]
      },
      "conjunctivitis": {
        "botPrompt": "চোখের লাল হওয়া বা কনজাঙ্কটিভাইটিস নিয়ে আলোচনা করতে চান?",
        "options": [
          "চোখ লাল ও জল পড়া",
          "চোখ চুলকানো",
          "চোখে ব্যথা",
          "চোখ দিয়ে পুঁজ পড়া",
          "আলোতে অস্বস্তি"
        ]
      },
      "skin_infection": {
        "botPrompt": "ত্বকের সংক্রমণ বা চুলকানি সংক্রান্ত সমস্যা নিয়ে জানতে চান?",
        "options": [
          "চুলকানি",
          "র‍্যাশ/বিস্তারিত ক্ষত",
          "ফাংগাস/রিংওয়ার্ম",
          "স্ক্যাবিস বা পরজীবী",
          "ত্বকে ফোঁড়া"
        ]
      },
      "intestinal_worm": {
        "botPrompt": "শিশুর আন্ত্রিক কৃমি নিয়ে জানতে চান?",
        "options": [
          "পেটে ব্যথা",
          "কম ক্ষুধা",
          "ঘনঘন পায়খানা",
          "শিশু কুঁচকের কষ্ট",
          "কৃমি দেখা গেছে"
        ]
      },
      "measles": {
        "botPrompt": "হাম (Measles) সংক্রান্ত কোনো সমস্যা?",
        "options": [
          "হাম/Measles এর লক্ষণ",
          "লাল চুলকানি র‍্যাশ",
          "ফ্লু-জাতীয় উপসর্গ",
          "চোখের সমস্যা",
          "জ্বর, দুর্বলতা"
        ]
      },
      "tuberculosis": {
        "botPrompt": "যক্ষ্মা/টিবি সংক্রান্ত কোনো প্রশ্ন?",
        "options": [
          "অনেকদিনের কাশি",
          "ভরপুর রাতে ঘাম",
          "ওজন কমে যাওয়া",
          "বুকব্যথা",
          "ঘন ঘন জ্বর"
        ]
      },
      "congenital_developmental": {
        "botPrompt": "জন্মগত বা শিশু বিকাশ সংক্রান্ত সমস্যা নিয়ে জানতে চান?",
        "options": [
          "বিকাশের বিলম্ব",
          "বক্তৃতা বা হাঁটা দেরি",
          "জন্মগত হৃৎপিণ্ড সমস্যা",
          "শ্রবণ/দৃষ্টির সমস্যা",
          "অন্যান্য জন্মগত সমস্যা"
        ]
    }
};

// Question sequences matching Python exactly
const QUESTION_SEQUENCES = {
  cold_fever: [
    "আপনার শিশুর বয়স কত?",
    "কতদিন ধরে জ্বর বা সর্দি আছে?",
    "তাপমাত্রা কত?",
    "শিশুর কাশি আছে কি?",
    "শ্বাস নিতে অসুবিধা হচ্ছে কি?",
    "শিশু খেতে বা খেলতে আগ্রহী?",
    "বসা বা হাঁটা সমস্যা হচ্ছে?",
    "পরিবারে অন্য কেউ অসুস্থ?",
    "কোনো ওষুধ খাওয়ানো হয়েছে কি?",
    "ডাক্তারের কাছে নিয়ে গেছেন? (হ্যাঁ/না)",
    "জল/খাবার কতটা গ্রহণ করছে?",
    "জ্বর কি একটানা আছে নাকি মাঝে মাঝে কমে যায়?"

  ],
  diarrhea: [
    "শিশুর বয়স কত?",
    "কতবার পাতলা পায়খানা হয়েছে?",
    "বমি হচ্ছে কি?",
    "মল কি পানি-পানির মত?",
    "খাওয়ার প্রতি বিশ্রাম?",
    "জন্মের ওজন কম ছিল?",
    "শিশু দুর্বল/নিষ্প্রাণ?",
    "জল বা খাবার গ্রহণ করছে কি?",
    "শিশুতে জ্বর আছে কি?",
    "কোন দিন ধরে চলছে?",
    "বাড়িতে কেউ আক্রান্ত?",
    "কোন নতুন খাবার খাইয়েছেন?"
  ],
  pneumonia_bronchitis: [
    "শিশুর বয়স কত?",
    "শ্বাসকষ্ট হচ্ছে কি?",
    "কতদিন ধরে কাশি?",
    "বুকে ঘড়ঘড় শব্দ আছে?",
    "জ্বর কতদিন?",
    "খাবার গ্রহণে আগ্রহ?",
    "বমি বা নানা উপসর্গ?",
    "ডাক্তার দেখিয়েছেন কি?",
    "পারিবারিক ইতিহাস?",
    "কোনো ওষুধ খাচ্ছে?",
    "বুকে কফ জমে আছে মনে হচ্ছে কি?",
    "আগে এরকম হয়েছে কি - অ্যাজমা আছে কি?"
  ],
  malnutrition: [
    "শিশুর বয়স ও বর্তমান ওজন কত?",
    "শিশু নিয়মিত খায়?",
    "বৃদ্ধি কেমন হচ্ছে?",
    "দুধ, ফল, সবজি খায় কি?",
    "বারবার অসুস্থ হয়?",
    "অন্য কোনো রোগ আছে?",
    "শিশু দুর্বল/চিটচিটে?",
    "বাড়িতে অপুষ্টি?",
    "প্রোটিনযুক্ত খাবার - ডিম, মাছ, মাংস খায় কি?",
    "শিশুর মাইলস্টোন - বসা, হাঁটা সময়মতো হয়েছে কি?",
    "গ্রোথ চার্টে প্লট করা হয় কি?",
    "কৃমির ওষুধ দেওয়া হয়েছে কি?"
  ],
  conjunctivitis: [
    "শিশুর বয়স কত?",
    "চোখ কতদিন লাল?",
    "জল বের হয় কি?",
    "চোখে ব্যথা/চুলকানি?",
    "আলোতে কষ্ট?",
    "পরিবারে কারো একই সমস্যা?",
    "চোখে কি কিছু পড়েছে/আঘাত?",
    "ডাক্তারের কাছে গেছেন?",
    "চোখ থেকে হলুদ বা সবুজ পুঁজ বের হচ্ছে কি?",
    "সকালে ঘুম থেকে উঠলে চোখ আটকে থাকে কি?",
    "চোখের পাতা ফুলে গেছে কি?",
    "দুই চোখেই সমস্যা নাকি একটিতে?",
    "প্রথম কোন চোখে শুরু হয়েছিল?",
    "দৃষ্টি ঝাপসা হচ্ছে কি?"
  ],
  skin_infection: [
    "শিশুর বয়স কত?",
    "কতদূর ছড়িয়েছে?",
    "চুলকানি কোথায়?",
    "ফোসকা/র‍্যাশ কী আছে?",
    "পরিবারে কারো আছে?",
    "নতুন খাবার/বস্ত্রে সমস্যা?",
    "কোনো ওষুধ খায়?",
    "জ্বর হয়েছে কি?",
    "চুলকানি কোন সময় বেশি - দিন নাকি রাত?",
    "চুলকানোর পর ক্ষত বা ঘা হয়েছে কি?",
    "ফোসকা থেকে পানি বা পুঁজ বের হচ্ছে কি?",
    "ত্বক শুষ্ক, খসখসে নাকি ভেজা ভেজা?",
    "লাল বৃত্তাকার দাগ আছে কি (রিংওয়ার্ম)?"
  ],
  intestinal_worm: [
    "শিশুর বয়স কত?",
    "শিশুর পায়খানায় কৃমি দেখা গেছে?",
    "খাদ্যগ্রহণ কম?",
    "ঘনঘন পেট ব্যথা?",
    "ডায়ারিয়া বা বমি হয়?",
    "কৃমি কত লম্বা ছিল - সাদা সুতার মতো নাকি বড়?",
    "রাতে বা সকালে পায়ুপথে চুলকানি হয় কি?",
    "পেট ফোলা বা ভারী মনে হয় কি?",
    "মুখ দিয়ে লালা পড়ে কি?",
    "দাঁত কিড়মিড় করে কি?",
    "ঘুমের মধ্যে অস্থির থাকে কি?",
     "নখ কামড়ায় বা মাটিতে খেলে কি?",
    "খাবার আগে হাত ধোয়ার অভ্যাস আছে কি?"
  ],
  measles: [
    "শিশুর বয়স কত?",
    "জ্বর ও চুলকানি কবে থেকে?",
    "শরীরে লাল র‍্যাশ?",
    "টিকাদান সম্পূর্ণ?",
    "জ্বরের পাশাপাশি কাশি/চোখে সমস্যা?",
    "পরিবারে কেউ ভাইরাসে আক্রান্ত?",
    "ডাক্তারের কাছে গেছেন?",
    "র‍্যাশ কোথা থেকে শুরু - মুখ, কপাল নাকি শরীর?",
    "র‍্যাশ সারা শরীরে ছড়িয়েছে কি?",
    "চোখ লাল বা জল পড়ছে কি?",
    "কাশি শুকনো নাকি কফযুক্ত?",
    "মুখের ভেতরে সাদা দাগ দেখেছেন কি?",
    "জ্বর কত উঁচু - ১০২-১০৪ ডিগ্রি?",
    "আলোতে চোখে কষ্ট হচ্ছে কি?",
    "শিশু খুব অসুস্থ বা নিস্তেজ?",
    "MMR টিকা নেওয়া হয়েছিল কি?"
  ],
  tuberculosis: [
    "শিশুর বয়স কত?",
    "অনেকদিন ধরে কাশি?",
    "ওজন কমছে?",
    "রাতে ঘাম হচ্ছে?",
    "পরিবারে কারো টিবি?",
    "ডাক্তারের কাছে গেছেন?",
    "টিবি টেস্ট হয়েছে কি?",
    "কাশির সাথে রক্ত বা কফ এসেছে কি?",
    "জ্বর সন্ধ্যায় বা রাতে বেশি হয় কি?",
    "রাতে জামা ভিজিয়ে ঘাম হয় কি?",
    "ক্ষুধা কমে গেছে কি?",
    "বুকে ব্যথা বা শ্বাসকষ্ট আছে কি?",
    "ঘাড়ে বা বগলে চাকা বা ফোলা আছে কি?",
    "পরিবারে কেউ টিবির চিকিৎসা নিচ্ছেন কি?",
    "BCG টিকা নেওয়া হয়েছিল কি? দাগ আছে কি?",
    "Mantoux বা TB skin test করিয়েছেন কি?"
  ],
  congenital_developmental: [
    "শিশুর বয়স কত?",
    "বিকাশ/বক্তৃতা/হাঁটা ঠিকভাবে হচ্ছে?",
    "জন্মগত কোনো অসুবিধা?",
    "পরিবারে কারো সমস্যা ছিল?",
    "নিয়মিত স্বাস্থ্য পরীক্ষায় কি বলা হয়েছিল?",
    "চোখ-কান ঠিক আছে?",
     "শিশু কত মাসে মাথা তুলতে পেরেছিল?",
    "কত মাসে বসতে পেরেছিল?",
    "প্রথম দাঁত কত মাসে উঠেছিল?",
    "কথা বলা শুরু করেছে কি? কয় শব্দ বলে?",
    "চোখে চোখ রেখে তাকায় কি?",
    "ডাকলে সাড়া দেয় কি?",
    "জন্মের সময় কোনো জটিলতা ছিল - কম ওজন, নীল হয়ে গিয়েছিল?",
    "শ্বাসকষ্ট বা হার্টের সমস্যা আছে কি?",
    "খিঁচুনি বা অস্বাভাবিক নড়াচড়া হয় কি?",
    "বাবা-মায়ের মধ্যে আত্মীয়তার সম্পর্ক আছে কি?",
    "গর্ভাবস্থায় মা কোনো ওষুধ বা সংক্রমণ হয়েছিল কি?",
    "থেরাপি - ফিজিও, স্পিচ বা অকুপেশনাল নিচ্ছেন কি?"
  ]
};

const diseases = [
    // Disease Data: 25 comprehensive entries for children's health conditions (ages 01-18 years)
    {
        name: 'Asthma',
        category: 'Respiratory Condition',
        symptoms: [
            'Wheezing and coughing, especially at night or early morning',
            'Shortness of breath',
            'Chest tightness and pain',
            'Difficulty breathing during physical activity'
        ],
        causes: [
            'Genetic predisposition',
            'Allergens (dust mites, pet dander, pollen)',
            'Respiratory infections',
            'Air pollution and tobacco smoke',
            'Exercise-induced bronchospasm'
        ],
        treatment: [
            'Inhaled corticosteroids',
            'Beta-agonist inhalers for quick relief',
            'Avoidance of triggers',
            'Long-term control medications',
            'Asthma action plan with health provider'
        ],
        prevention: 'Avoid exposure to known allergens and irritants, maintain a smoke-free environment, and follow asthma management plans.',
        imageUrl: 'https://images.unsplash.com/photo-1579737151121-65476a213e45?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/asthma/children.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Asthma in Children. 2024.</a>'
    },
    {
        name: 'Chickenpox (Varicella)',
        category: 'Viral Infection',
        symptoms: [
            'Red itchy rash that starts on the chest, back and face',
            'Blisters that turn into scabs',
            'Fever and tiredness',
            'Loss of appetite'
        ],
        causes: [
            'Varicella-zoster virus',
            'Highly contagious through respiratory droplets or direct contact'
        ],
        treatment: [
            'Calamine lotion and antihistamines for itching',
            'Acetaminophen or ibuprofen for fever',
            'Antiviral medications for severe cases',
            'Isolation to prevent spread'
        ],
        prevention: 'Vaccination with varicella vaccine is highly effective in prevention.',
        imageUrl: 'https://images.unsplash.com/photo-1588776814546-40d104ce08ec?w=900&q=80',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/varicella" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Varicella (Chickenpox). 2024.</a>'
    },
        {
        name: 'Measles (Rubeola)',
        category: 'Viral Infection',
        symptoms: [
            'High fever, usually above 101°F (38.3°C)',
            'Cough, runny nose and red, watery eyes',
            'Tiny white spots (Koplik spots) inside the mouth',
            'Red blotchy rash starting on the face then spreading to the body',
            'Fatigue and sensitivity to light'
        ],
        causes: [
            'Measles virus (Paramyxovirus)',
            'Spread by respiratory droplets from coughing or sneezing',
            'Highly contagious, especially in unvaccinated children'
        ],
        treatment: [
            'Supportive care: rest and hydration',
            'Acetaminophen or ibuprofen for fever and pain',
            'Vitamin A supplements (recommended in severe cases)',
            'Isolation to prevent spreading infection'
        ],
        prevention: 'Vaccination with measles-containing vaccine (MMR or MR) is the best prevention.',
        imageUrl: 'https://images.unsplash.com/photo-1584447106484-0b05985c144b?w=900&q=80',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/measles" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Measles. 2024.</a>'
    },
    {
        name: 'Bronchiolitis',
        category: 'Respiratory Infection',
        symptoms: [
            'Runny nose and cough',
            'Rapid or difficult breathing',
            'Wheezing',
            'Fever',
            'Poor feeding'
        ],
        causes: [
            'Respiratory Syncytial Virus (RSV) is the most common cause',
            'Other viruses like rhinovirus'
        ],
        treatment: [
            'Supportive care including oxygen therapy',
            'Hydration and nutrition support',
            'Bronchodilators in some cases',
            'Hospitalization if severe'
        ],
        prevention: 'Hand hygiene, avoiding exposure to sick contacts, and RSV prophylaxis for high-risk infants.',
        imageUrl: 'https://images.unsplash.com/photo-1611162617216-66492dcef99c?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/rsv/high-risk/infants-younger-than-6-months.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Bronchiolitis and RSV. 2023.</a>'
    },
    {
        name: 'Croup',
        category: 'Respiratory Condition',
        symptoms: [
            'Barking cough',
            'Hoarseness',
            'Stridor (noisy breathing)',
            'Fever and respiratory distress in severe cases'
        ],
        causes: [
            'Parainfluenza virus is the most common cause',
            'Other viral infections'
        ],
        treatment: [
            'Humidified air or steam',
            'Steroids to reduce airway inflammation',
            'Nebulized epinephrine in severe cases',
            'Supportive care'
        ],
        prevention: 'Avoiding viral exposures and good hygiene practices.',
        imageUrl: 'https://images.unsplash.com/photo-1601036757837-b5c6fa23c914?w=900&q=80',
        citation: '<a href="https://www.nhs.uk/conditions/croup/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NHS. Croup in Children. 2024.</a>'
    },
    {
        name: 'Diarrhea',
        category: 'Gastrointestinal Infection',
        symptoms: [
            'Frequent loose or watery stools',
            'Stomach cramps',
            'Nausea and vomiting',
            'Dehydration signs (dry mouth, lethargy)'
        ],
        causes: [
            'Viral infections (rotavirus, norovirus)',
            'Bacterial infections (E. coli, Salmonella)',
            'Parasitic infections',
            'Food intolerance'
        ],
        treatment: [
            'Oral rehydration therapy',
            'Zinc supplementation',
            'Appropriate antibiotics for bacterial causes',
            'Nutritional support'
        ],
        prevention: 'Good sanitation, clean water, handwashing, vaccination (rotavirus).',
        imageUrl: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=900&q=80',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Diarrheal Disease. 2024.</a>'
    },
    {
        name: 'Fifth Disease (Erythema Infectiosum)',
        category: 'Viral Infection',
        symptoms: [
            'Mild fever and cold-like symptoms',
            '“Slapped cheek” rash on cheeks',
            'Lacy red rash on body and limbs',
            'Joint pain (rare)'
        ],
        causes: [
            'Parvovirus B19',
            'Transmission via respiratory droplets'
        ],
        treatment: [
            'Supportive care for symptoms',
            'Pain relievers',
            'Rest and fluids'
        ],
        prevention: 'Avoid close contact with infected individuals during contagious stages.',
        imageUrl: 'https://images.unsplash.com/photo-1588776814384-4e3ad09cbbe7?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/parvovirusB19/fifth-disease.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Fifth Disease. 2023.</a>'
    },
    {
        name: 'Hand, Foot, and Mouth Disease (HFMD)',
        category: 'Viral Infection',
        symptoms: [
            'Fever',
            'Sore throat',
            'Painful sores in mouth',
            'Rash on hands and feet'
        ],
        causes: [
            'Coxsackievirus A16 and Enterovirus 71',
            'Spread via respiratory secretions and contact with blister fluid'
        ],
        treatment: [
            'Symptomatic treatment with pain relievers',
            'Hydration',
            'Good hygiene to prevent spread'
        ],
        prevention: 'Hand hygiene, disinfecting surfaces, avoiding close contact during outbreaks.',
        imageUrl: 'https://images.unsplash.com/photo-1596752659383-cb8f88adf2d8?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/hand-foot-mouth/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. HFMD. 2023.</a>'
    },
    {
        name: 'Hepatitis A',
        category: 'Viral Liver Infection',
        symptoms: [
            'Fever, fatigue',
            'Loss of appetite',
            'Nausea and abdominal pain',
            'Jaundice (yellowing of skin and eyes)'
        ],
        causes: [
            'Hepatitis A virus',
            'Fecal-oral transmission through contaminated food or water'
        ],
        treatment: [
            'Supportive care',
            'Hydration',
            'Maintaining nutrition',
            'No specific antiviral treatment'
        ],
        prevention: 'Hepatitis A vaccination, hand hygiene, safe food and water practices.',
        imageUrl: 'https://images.unsplash.com/photo-1596766465011-893322d99d3d?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/hepatitis/hav/index.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Hepatitis A. 2024.</a>'
    },
    {
        name: 'Influenza (Flu)',
        category: 'Viral Infection',
        symptoms: [
            'Fever and chills',
            'Muscle aches',
            'Cough and sore throat',
            'Fatigue and weakness',
            'Runny or stuffy nose'
        ],
        causes: [
            'Influenza virus A and B',
            'Spread by respiratory droplets'
        ],
        treatment: [
            'Antiviral medications (if started early)',
            'Rest and fluids',
            'Fever reducers',
            'Supportive care'
        ],
        prevention: 'Annual flu vaccination, hand hygiene, avoiding close contact with sick individuals.',
        imageUrl: 'https://images.unsplash.com/photo-1588776814364-1755f72b17f8?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/flu/children/index.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Influenza in Children. 2024.</a>'
    },
    {
        name: 'Juvenile Idiopathic Arthritis (JIA)',
        category: 'Autoimmune Disorder',
        symptoms: [
            'Joint pain and swelling',
            'Stiffness, especially in the morning',
            'Reduced range of motion',
            'Persistent fever and rash (in some types)'
        ],
        causes: [
            'Autoimmune attack on joint tissues',
            'Genetic and environmental factors'
        ],
        treatment: [
            'Nonsteroidal anti-inflammatory drugs (NSAIDs)',
            'Disease-modifying antirheumatic drugs (DMARDs)',
            'Physical therapy',
            'Biologic therapies'
        ],
        prevention: 'No known prevention; early diagnosis and treatment help reduce joint damage.',
        imageUrl: 'https://images.unsplash.com/photo-1627883391216-56214309e3e7?w=900&q=80',
        citation: '<a href="https://www.rheumatology.org/I-Am-A/Patient-Caregiver/Diseases-Conditions/Juvenile-Arthritis" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">American College of Rheumatology. JIA. 2024.</a>'
    },
    {
        name: 'Leukemia',
        category: 'Cancer',
        symptoms: [
            'Fatigue and weakness',
            'Frequent infections',
            'Easy bruising or bleeding',
            'Bone or joint pain',
            'Swollen lymph nodes'
        ],
        causes: [
            'Genetic mutations',
            'Environmental exposures',
            'Unknown factors'
        ],
        treatment: [
            'Chemotherapy',
            'Radiation therapy',
            'Stem cell transplant',
            'Targeted therapy'
        ],
        prevention: 'No known prevention; focus on early detection and treatment.',
        imageUrl: 'https://images.unsplash.com/photo-1579737151121-65476a213e45?w=900&q=80',
        citation: '<a href="https://www.cancer.org/cancer/leukemia-in-children.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">American Cancer Society. Childhood Leukemia. 2024.</a>'
    },
    {
        name: 'Measles',
        category: 'Viral Infection',
        symptoms: [
            'High fever',
            'Cough, runny nose, and red eyes',
            'Koplik spots inside mouth',
            'Red rash starting on face and spreading'
        ],
        causes: [
            'Measles virus',
            'Highly contagious respiratory transmission'
        ],
        treatment: [
            'Supportive care (hydration, fever management)',
            'Vitamin A supplements to reduce severity',
            'Isolation to prevent spread'
        ],
        prevention: 'Measles vaccination (MMR vaccine) is highly effective.',
        imageUrl: 'https://images.unsplash.com/photo-1596752659383-cb8f88adf2d8?w=900&q=80',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/measles" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Measles. 2024.</a>'
    },
    {
        name: 'Meningitis',
        category: 'Infection (Bacterial or Viral)',
        symptoms: [
            'High fever and headache',
            'Stiff neck',
            'Nausea and vomiting',
            'Sensitivity to light',
            'Confusion or difficulty concentrating'
        ],
        causes: [
            'Bacterial pathogens (Neisseria meningitidis, Streptococcus pneumoniae)',
            'Viral infections',
            'Fungal infections (rare)'
        ],
        treatment: [
            'Immediate antibiotics for bacterial meningitis',
            'Supportive care',
            'Hospitalization'
        ],
        prevention: 'Vaccinations against meningococcal, pneumococcal, and Hib bacteria; good hygiene.',
        imageUrl: 'https://images.unsplash.com/photo-1627883441551-766b44a30e71?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/meningitis/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Meningitis. 2024.</a>'
    },
    {
        name: 'Mumps',
        category: 'Viral Infection',
        symptoms: [
            'Swollen, painful salivary glands',
            'Fever',
            'Headache',
            'Muscle aches',
            'Fatigue and loss of appetite'
        ],
        causes: [
            'Mumps virus',
            'Spread by respiratory droplets and saliva'
        ],
        treatment: [
            'Rest and hydration',
            'Pain relievers',
            'Isolation during contagious period'
        ],
        prevention: 'Mumps vaccination (MMR vaccine).',
        imageUrl: 'https://images.unsplash.com/photo-1601036757837-b5c6fa23c914?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/mumps/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Mumps. 2024.</a>'
    },
    {
        name: 'Nephrotic Syndrome',
        category: 'Kidney Disorder',
        symptoms: [
            'Swelling around eyes, feet, and ankles',
            'Foamy urine',
            'Weight gain due to fluid retention',
            'Fatigue'
        ],
        causes: [
            'Minimal change disease',
            'Other kidney diseases',
            'Infections or immune disorders'
        ],
        treatment: [
            'Steroids and immunosuppressive drugs',
            'Diuretics',
            'Blood pressure control',
            'Dietary modifications'
        ],
        prevention: 'No known prevention; early diagnosis and treatment are essential.',
        imageUrl: 'https://images.unsplash.com/photo-1627883391216-56214309e3e7?w=900&q=80',
        citation: '<a href="https://www.kidney.org/atoz/content/nephrotic" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Kidney Foundation. Nephrotic Syndrome. 2024.</a>'
    },
    {
        name: 'Pertussis (Whooping Cough)',
        category: 'Bacterial Infection',
        symptoms: [
            'Severe coughing fits with “whooping” sound',
            'Vomiting after coughing',
            'Runny nose and mild fever initially'
        ],
        causes: [
            'Bordetella pertussis bacteria',
            'Highly contagious respiratory transmission'
        ],
        treatment: [
            'Antibiotics (early treatment)',
            'Supportive care',
            'Hospitalization for infants'
        ],
        prevention: 'Pertussis vaccination (DTaP) and booster doses.',
        imageUrl: 'https://images.unsplash.com/photo-1579737151121-65476a213e45?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/pertussis/clinical/features.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Pertussis (Whooping Cough). 2024.</a>'
    },
    {
        name: 'Pneumonia',
        category: 'Respiratory Infection',
        symptoms: [
            'Cough with phlegm',
            'Fever and chills',
            'Difficulty breathing',
            'Chest pain when breathing or coughing'
        ],
        causes: [
            'Bacterial infections',
            'Viral infections',
            'Fungal infections (rare)'
        ],
        treatment: [
            'Antibiotics for bacterial pneumonia',
            'Antiviral drugs for viral pneumonia',
            'Oxygen therapy',
            'Supportive care'
        ],
        prevention: 'Pneumococcal and influenza vaccinations, good hygiene.',
        imageUrl: 'https://images.unsplash.com/photo-1588776814546-40d104ce08ec?w=900&q=80',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/pneumonia" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Pneumonia. 2024.</a>'
    },
    {
        name: 'Rheumatic Fever',
        category: 'Inflammatory Disease',
        symptoms: [
            'Fever',
            'Painful and swollen joints',
            'Chest pain and shortness of breath',
            'Fatigue',
            'Skin rash'
        ],
        causes: [
            'Untreated or poorly treated streptococcal infection',
            'Autoimmune response damaging heart, joints, brain, and skin'
        ],
        treatment: [
            'Antibiotics to treat infection',
            'Anti-inflammatory medications',
            'Long-term prophylaxis to prevent recurrence'
        ],
        prevention: 'Prompt treatment of strep throat infections.',
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=900&q=80',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/rheumatic-fever" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Rheumatic Fever. 2024.</a>'
    },
    {
        name: 'Respiratory Syncytial Virus (RSV) Infection',
        category: 'Viral Respiratory Infection',
        symptoms: [
            'Runny nose',
            'Decrease in appetite',
            'Coughing and sneezing',
            'Fever',
            'Wheezing and difficulty breathing'
        ],
        causes: [
            'RSV virus',
            'Highly contagious via droplets and direct contact'
        ],
        treatment: [
            'Supportive care including oxygen therapy',
            'Hydration',
            'Hospitalization if severe'
        ],
        prevention: 'Good hand hygiene, avoiding close contact with sick individuals.',
        imageUrl: 'https://images.unsplash.com/photo-1601036757837-b5c6fa23c914?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/rsv/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. RSV Infection. 2024.</a>'
    },
    {
        name: 'Scarlet Fever',
        category: 'Bacterial Infection',
        symptoms: [
            'Red rash with sandpaper texture',
            'High fever',
            'Sore throat',
            'Strawberry tongue (red and bumpy)'
        ],
        causes: [
            'Group A Streptococcus bacteria',
            'Spread via respiratory droplets'
        ],
        treatment: [
            'Antibiotics',
            'Fever reducers',
            'Supportive care'
        ],
        prevention: 'Prompt treatment of strep throat, good hygiene.',
        imageUrl: 'https://images.unsplash.com/photo-1596766465011-893322d99d3d?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/groupastrep/diseases-public/scarlet-fever.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Scarlet Fever. 2024.</a>'
    },
    {
        name: 'Strep Throat',
        category: 'Bacterial Infection',
        symptoms: [
            'Sore throat and pain swallowing',
            'Red and swollen tonsils, sometimes with white patches',
            'Fever',
            'Swollen lymph nodes'
        ],
        causes: [
            'Group A Streptococcus bacteria',
            'Spread by respiratory droplets'
        ],
        treatment: [
            'Antibiotics',
            'Pain relievers',
            'Rest and fluids'
        ],
        prevention: 'Good hygiene and avoiding close contact with infected people.',
        imageUrl: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/groupastrep/strep-throat.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Strep Throat. 2024.</a>'
    },
    {
        name: 'Tuberculosis (TB)',
        category: 'Bacterial Infection',
        symptoms: [
            'Persistent cough lasting more than 3 weeks',
            'Weight loss and fatigue',
            'Fever and night sweats',
            'Chest pain'
        ],
        causes: [
            'Mycobacterium tuberculosis bacteria',
            'Airborne transmission'
        ],
        treatment: [
            'Long course of multiple antibiotics',
            'Directly observed therapy (DOT)'
        ],
        prevention: 'BCG vaccination, early diagnosis and treatment.',
        imageUrl: 'https://images.unsplash.com/photo-1588776814384-4e3ad09cbbe7?w=900&q=80',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/tuberculosis" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Tuberculosis. 2024.</a>'
    },
    {
        name: 'Urinary Tract Infection (UTI)',
        category: 'Bacterial Infection',
        symptoms: [
            'Frequent urge to urinate',
            'Burning sensation while urinating',
            'Cloudy or strong-smelling urine',
            'Abdominal pain'
        ],
        causes: [
            'Bacteria, commonly E. coli',
            'Poor hygiene and anatomical factors'
        ],
        treatment: [
            'Antibiotics',
            'Increased fluid intake',
            'Pain relievers'
        ],
        prevention: 'Good personal hygiene, proper wiping technique.',
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=900&q=80',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/urinary-tract-infections/symptoms-causes/syc-20353447" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Urinary Tract Infection in Children. 2024.</a>'
    },
    {
        name: 'Whooping Cough (Pertussis)',
        category: 'Bacterial Infection',
        symptoms: [
            'Severe coughing spells followed by a “whooping” sound',
            'Vomiting after coughing',
            'Exhaustion after coughing fits'
        ],
        causes: [
            'Bordetella pertussis bacteria',
            'Highly contagious through respiratory droplets'
        ],
        treatment: [
            'Antibiotics to treat infection',
            'Supportive care to ease symptoms'
        ],
        prevention: 'Vaccination (DTaP) is the best prevention.',
        imageUrl: 'https://images.unsplash.com/photo-1579737151121-65476a213e45?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/pertussis/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Pertussis (Whooping Cough). 2024.</a>'
    },

    {
        name: 'Type 1 Diabetes',
        category: 'Endocrine Disorder',
        symptoms: [
            'Increased thirst and frequent urination',
            'Extreme hunger',
            'Unintended weight loss',
            'Fatigue and weakness',
            'Blurred vision',
            'Irritability and mood changes',
            'Bedwetting in children who previously didn\'t wet the bed'
        ],
        causes: [
            'Autoimmune destruction of insulin-producing beta cells in pancreas',
            'Genetic predisposition',
            'Environmental triggers (viral infections)',
            'Family history of type 1 diabetes'
        ],
        treatment: [
            'Insulin therapy (injections or insulin pump)',
            'Blood glucose monitoring',
            'Carbohydrate counting and meal planning',
            'Regular physical activity',
            'Continuous glucose monitoring systems'
        ],
        prevention: 'No known prevention; focus on early diagnosis and management to prevent complications.',
        imageUrl: 'https://images.unsplash.com/photo-1579154204845-8b39e10d8c3c?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/diabetes/basics/what-is-type-1-diabetes.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Type 1 Diabetes. 2024.</a>'
    },
    {
        name: 'Attention Deficit Hyperactivity Disorder (ADHD)',
        category: 'Neurodevelopmental Disorder',
        symptoms: [
            'Difficulty paying attention and staying focused',
            'Hyperactivity and excessive movement',
            'Impulsivity and difficulty waiting turn',
            'Forgetfulness and losing things frequently',
            'Difficulty following instructions',
            'Interrupting others frequently',
            'Difficulty organizing tasks'
        ],
        causes: [
            'Genetic factors and family history',
            'Brain structure and function differences',
            'Neurotransmitter imbalances (dopamine)',
            'Premature birth or low birth weight',
            'Environmental factors (lead exposure)'
        ],
        treatment: [
            'Stimulant medications (methylphenidate, amphetamines)',
            'Non-stimulant medications',
            'Behavioral therapy',
            'Parent training and education',
            'School accommodations and support',
            'Cognitive behavioral therapy'
        ],
        prevention: 'No known prevention; early diagnosis and intervention improve outcomes and quality of life.',
        imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/adhd/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. ADHD in Children. 2024.</a>'
    },
    {
        name: 'Autism Spectrum Disorder (ASD)',
        category: 'Neurodevelopmental Disorder',
        symptoms: [
            'Difficulty with social communication and interaction',
            'Repetitive behaviors and restricted interests',
            'Delayed language development',
            'Difficulty understanding social cues',
            'Sensory sensitivities',
            'Preference for routine and difficulty with changes',
            'Avoiding eye contact'
        ],
        causes: [
            'Genetic factors and mutations',
            'Brain development differences',
            'Advanced parental age',
            'Premature birth',
            'Environmental factors (prenatal exposure)'
        ],
        treatment: [
            'Applied Behavior Analysis (ABA) therapy',
            'Speech and language therapy',
            'Occupational therapy',
            'Social skills training',
            'Medications for co-occurring conditions',
            'Educational support and individualized education plans'
        ],
        prevention: 'No known prevention; early intervention and therapy significantly improve outcomes.',
        imageUrl: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/autism/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Autism Spectrum Disorder. 2024.</a>'
    },
    {
        name: 'Epilepsy',
        category: 'Neurological Disorder',
        symptoms: [
            'Recurrent seizures (convulsions)',
            'Temporary confusion after seizure',
            'Staring spells',
            'Loss of consciousness',
            'Uncontrollable jerking movements',
            'Altered awareness or sensations',
            'Developmental delays in some cases'
        ],
        causes: [
            'Genetic factors',
            'Brain injury or trauma',
            'Prenatal injury or infection',
            'Developmental disorders',
            'Brain tumors or stroke',
            'Infections (meningitis, encephalitis)',
            'Unknown causes in many cases'
        ],
        treatment: [
            'Anti-epileptic medications',
            'Ketogenic diet (for some cases)',
            'Vagus nerve stimulation',
            'Surgery (for drug-resistant epilepsy)',
            'Seizure management and safety measures'
        ],
        prevention: 'Preventing head injuries, prenatal care, prompt treatment of infections can reduce risk.',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&q=80',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/epilepsy" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Epilepsy Fact Sheet. 2024.</a>'
    },
    {
        name: 'Atopic Dermatitis (Eczema)',
        category: 'Skin Condition',
        symptoms: [
            'Dry, itchy skin',
            'Red or brownish-gray patches',
            'Small raised bumps that may leak fluid',
            'Thickened, cracked, or scaly skin',
            'Raw, sensitive skin from scratching',
            'Skin infections from scratching'
        ],
        causes: [
            'Genetic factors (filaggrin gene mutations)',
            'Immune system dysfunction',
            'Skin barrier defects',
            'Environmental triggers (allergens, irritants)',
            'Family history of allergies or asthma'
        ],
        treatment: [
            'Moisturizers and emollients',
            'Topical corticosteroids',
            'Topical calcineurin inhibitors',
            'Antihistamines for itching',
            'Avoiding triggers',
            'Wet wrap therapy',
            'Biologic medications for severe cases'
        ],
        prevention: 'Regular moisturizing, avoiding irritants and allergens, gentle skincare routine.',
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=900&q=80',
        citation: '<a href="https://www.niams.nih.gov/health-topics/atopic-dermatitis" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH. Atopic Dermatitis. 2024.</a>'
    },
    {
        name: 'Iron Deficiency Anemia',
        category: 'Blood Disorder',
        symptoms: [
            'Fatigue and weakness',
            'Pale skin and nail beds',
            'Shortness of breath',
            'Cold hands and feet',
            'Poor appetite',
            'Frequent infections',
            'Developmental delays in severe cases'
        ],
        causes: [
            'Inadequate dietary iron intake',
            'Rapid growth periods',
            'Blood loss',
            'Poor iron absorption',
            'Premature birth',
            'Exclusive breastfeeding beyond 6 months without iron supplementation'
        ],
        treatment: [
            'Iron supplements (ferrous sulfate)',
            'Iron-rich diet (red meat, beans, fortified cereals)',
            'Vitamin C to enhance iron absorption',
            'Treating underlying causes of blood loss'
        ],
        prevention: 'Iron-rich diet, iron-fortified formula, iron supplementation starting at 4-6 months for breastfed infants.',
        imageUrl: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/nutrition/infantandtoddlernutrition/vitamins-minerals/iron.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Iron Deficiency in Children. 2024.</a>'
    },
    {
        name: 'Appendicitis',
        category: 'Acute Surgical Condition',
        symptoms: [
            'Sudden pain near the navel that shifts to lower right abdomen',
            'Pain that worsens with movement or coughing',
            'Nausea and vomiting',
            'Loss of appetite',
            'Low-grade fever',
            'Abdominal swelling',
            'Inability to pass gas'
        ],
        causes: [
            'Blockage of the appendix opening',
            'Infection leading to inflammation',
            'Enlarged lymphoid tissue',
            'Fecal matter or foreign body obstruction',
            'Intestinal worms (rare)'
        ],
        treatment: [
            'Surgical removal of appendix (appendectomy)',
            'Laparoscopic surgery (preferred method)',
            'Antibiotics before and after surgery',
            'Intravenous fluids',
            'Pain management',
            'Non-operative treatment with antibiotics in select cases'
        ],
        prevention: 'No known prevention; high-fiber diet may reduce risk.',
        imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=900&q=80',
        citation: '<a href="https://www.ncbi.nlm.nih.gov/books/NBK542191/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCBI. Pediatric Appendicitis. 2023.</a>'
    },
    {
        name: 'Celiac Disease',
        category: 'Autoimmune Disorder',
        symptoms: [
            'Chronic diarrhea or constipation',
            'Abdominal bloating and pain',
            'Failure to thrive or poor weight gain',
            'Fatigue and irritability',
            'Vomiting',
            'Delayed growth and puberty',
            'Dental enamel defects',
            'Anemia'
        ],
        causes: [
            'Autoimmune reaction to gluten protein',
            'Genetic predisposition (HLA-DQ2 and HLA-DQ8 genes)',
            'Environmental triggers',
            'Family history of celiac disease'
        ],
        treatment: [
            'Strict lifelong gluten-free diet',
            'Nutritional supplements (iron, calcium, vitamins)',
            'Consultation with dietitian',
            'Regular monitoring for nutritional deficiencies',
            'Treatment of associated conditions'
        ],
        prevention: 'No known prevention; early diagnosis and gluten-free diet prevent complications.',
        imageUrl: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=900&q=80',
        citation: '<a href="https://celiac.org/about-celiac-disease/what-is-celiac-disease/celiac-disease-in-children/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Celiac Disease Foundation. Celiac Disease in Children. 2021.</a>'
    },
    {
        name: 'Impetigo',
        category: 'Bacterial Skin Infection',
        symptoms: [
            'Red sores that quickly rupture and ooze',
            'Honey-colored crusted sores',
            'Itchy rash',
            'Fluid-filled blisters',
            'Lesions around nose and mouth (most common)',
            'Highly contagious'
        ],
        causes: [
            'Staphylococcus aureus bacteria',
            'Streptococcus pyogenes bacteria',
            'Skin-to-skin contact with infected person',
            'Contact with contaminated objects',
            'Entry through broken skin (cuts, insect bites)'
        ],
        treatment: [
            'Topical antibiotic ointment (mupirocin)',
            'Oral antibiotics for widespread infection',
            'Gentle washing with antibacterial soap',
            'Covering sores to prevent spread',
            'Isolation from school until no longer contagious'
        ],
        prevention: 'Good hygiene, handwashing, covering wounds, avoiding sharing personal items, prompt treatment of skin injuries.',
        imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/groupastrep/diseases-public/impetigo.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Impetigo. 2024.</a>'
    },
    {
        name: 'Ringworm (Tinea)',
        category: 'Fungal Skin Infection',
        symptoms: [
            'Ring-shaped red rash with raised edges',
            'Itchy, scaly patches',
            'Clear skin in the center of the ring',
            'Multiple rings may overlap',
            'Hair loss if on scalp (tinea capitis)',
            'Brittle nails if on nails (tinea unguium)'
        ],
        causes: [
            'Dermatophyte fungus infection',
            'Direct contact with infected person or animal',
            'Contact with contaminated surfaces',
            'Warm, moist environments',
            'Sharing combs, brushes, or clothing'
        ],
        treatment: [
            'Topical antifungal creams (clotrimazole, terbinafine)',
            'Oral antifungal medications for scalp or widespread infection',
            'Keep affected area clean and dry',
            'Wash clothing and bedding in hot water'
        ],
        prevention: 'Good hygiene, keeping skin dry, not sharing personal items, treating infected pets.',
        imageUrl: 'https://images.unsplash.com/photo-1588776814546-40d104ce08ec?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/fungal/diseases/ringworm/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Ringworm. 2024.</a>'
    },
    {
        name: 'Congenital Heart Defects',
        category: 'Structural Heart Abnormality',
        symptoms: [
            'Rapid breathing or difficulty breathing',
            'Bluish tint to skin, lips, and fingernails (cyanosis)',
            'Fatigue during feeding',
            'Poor weight gain and growth',
            'Swelling in legs, abdomen, or around eyes',
            'Heart murmur',
            'Easily tiring during exercise (older children)'
        ],
        causes: [
            'Genetic factors and chromosomal abnormalities',
            'Maternal diabetes',
            'Maternal infections during pregnancy',
            'Certain medications during pregnancy',
            'Maternal alcohol or drug use',
            'Family history of heart defects',
            'Unknown causes in many cases'
        ],
        treatment: [
            'Watchful waiting for minor defects',
            'Medications to help heart function',
            'Catheter-based procedures',
            'Open-heart surgery',
            'Heart transplant (severe cases)',
            'Long-term cardiac monitoring'
        ],
        prevention: 'Prenatal care, managing maternal diabetes, avoiding alcohol and certain medications during pregnancy, genetic counseling.',
        imageUrl: 'https://images.unsplash.com/photo-1579154204845-8b39e10d8c3c?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/heart-defects/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Congenital Heart Defects. 2024.</a>'
    },
    {
        name: 'Childhood Obesity',
        category: 'Metabolic Condition',
        symptoms: [
            'Body Mass Index (BMI) at or above 95th percentile',
            'Excess body fat accumulation',
            'Breathlessness during physical activity',
            'Sleep problems and snoring',
            'Joint pain',
            'Low self-esteem and social isolation',
            'Early signs of type 2 diabetes or heart disease'
        ],
        causes: [
            'Poor dietary habits (high-calorie, low-nutrient foods)',
            'Lack of physical activity',
            'Genetic predisposition',
            'Family lifestyle and habits',
            'Psychological factors',
            'Socioeconomic factors',
            'Hormonal problems (rare)'
        ],
        treatment: [
            'Dietary changes and healthy eating plan',
            'Increased physical activity',
            'Behavioral modification therapy',
            'Family-based interventions',
            'Nutritional counseling',
            'Medical treatment for complications',
            'Weight management programs'
        ],
        prevention: 'Healthy diet, regular physical activity, limiting screen time, adequate sleep, family lifestyle changes.',
        imageUrl: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/obesity/childhood/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Childhood Obesity. 2024.</a>'
    },
    {
        name: 'Sickle Cell Disease',
        category: 'Genetic Blood Disorder',
        symptoms: [
            'Episodes of severe pain (pain crises)',
            'Swelling of hands and feet',
            'Frequent infections',
            'Delayed growth and puberty',
            'Vision problems',
            'Fatigue and anemia',
            'Jaundice (yellowing of skin and eyes)'
        ],
        causes: [
            'Inherited genetic mutation in hemoglobin gene',
            'Autosomal recessive inheritance (both parents must carry gene)',
            'Abnormal hemoglobin causes red blood cells to become sickle-shaped'
        ],
        treatment: [
            'Hydroxyurea medication',
            'Pain management during crises',
            'Antibiotics to prevent infections',
            'Blood transfusions',
            'Bone marrow or stem cell transplant',
            'Vaccinations to prevent infections',
            'Folic acid supplementation'
        ],
        prevention: 'Genetic counseling and testing for carriers; no cure but newborn screening allows early intervention.',
        imageUrl: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/sickle-cell/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Sickle Cell Disease. 2024.</a>'
    },
    {
        name: 'Kawasaki Disease',
        category: 'Inflammatory Condition',
        symptoms: [
            'High fever lasting 5 days or more',
            'Red eyes without discharge',
            'Bright red, cracked lips and strawberry tongue',
            'Red rash on trunk and genital area',
            'Swollen, red hands and feet',
            'Peeling skin on fingers and toes',
            'Swollen lymph nodes in neck'
        ],
        causes: [
            'Unknown exact cause',
            'Possibly immune system overreaction to infection',
            'Genetic factors',
            'More common in children of Asian descent',
            'Most common in children under 5 years'
        ],
        treatment: [
            'Intravenous immunoglobulin (IVIG)',
            'High-dose aspirin',
            'Hospitalization for monitoring',
            'Echocardiography to check heart',
            'Long-term cardiac follow-up if complications occur'
        ],
        prevention: 'No known prevention; prompt treatment reduces risk of heart complications.',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/kawasaki/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Kawasaki Disease. 2024.</a>'
    },
    {
        name: 'Attention Deficit Disorder (ADD) - Inattentive Type',
        category: 'Neurodevelopmental Disorder',
        symptoms: [
            'Difficulty sustaining attention',
            'Easily distracted by external stimuli',
            'Forgetfulness in daily activities',
            'Difficulty organizing tasks',
            'Avoiding tasks requiring sustained mental effort',
            'Losing things frequently',
            'Not following through on instructions',
            'Making careless mistakes'
        ],
        causes: [
            'Genetic factors',
            'Brain chemistry differences (neurotransmitters)',
            'Brain structure abnormalities',
            'Prenatal exposure to toxins',
            'Premature birth or low birth weight'
        ],
        treatment: [
            'Stimulant medications',
            'Non-stimulant medications (atomoxetine)',
            'Behavioral interventions',
            'Organizational skills training',
            'Academic accommodations',
            'Parent and teacher education',
            'Cognitive behavioral therapy'
        ],
        prevention: 'No known prevention; early identification and support improve academic and social outcomes.',
        imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&q=80',
        citation: '<a href="https://www.nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIMH. ADHD Information. 2024.</a>'
    }
];


const doctorsData = {
  'Delhi': [
    {
      name: 'Dr. Arun K Garg',
      credentials: 'MBBS, DCH, MD (Pediatrics)',
      experience: '17+ Years Experience',
      hospital: 'Swastik Maternity Center',
      address: 'G-20/23-24, Sector 7G, Rohini, Delhi, 110085',
      phone: '011 2793 1001',
      hours: 'Mon-Sat 9AM-7PM',
      specializations: 'Infant & Child Care, Vaccination, Nutrition',
      bookingLink: 'https://www.practo.com',
      rating: '4.6/5 (93 reviews)'
    },
    {
      name: 'Dr. Sharwan Gupta',
      credentials: 'MBBS, MD (Pediatrics)',
      experience: '30+ Years Experience',
      hospital: 'Private Clinic',
      address: '1468 Sangatrashan, Pahar Ganj, Delhi 110055',
      phone: '098111 28179',
      hours: 'Mon-Sat 8AM-5PM',
      specializations: 'Vaccination, Nutrition, Developmental Assessment',
      bookingLink: 'https://www.lybrate.com',
      rating: '4.7/5 (81 reviews)'
    },
    {
      name: 'Dr. Sandhya Gupta',
      credentials: 'MBBS, DCH (Pediatrics)',
      experience: '43+ Years Experience',
      hospital: 'Private Practice',
      address: 'Pitampura, Delhi',
      hours: 'Mon-Sat 9AM-6PM',
      specializations: 'General Pediatrics, Youth Care',
      bookingLink: 'https://www.practo.com',
      rating: '4.8/5 (120 reviews)'
    },
    {
      name: 'Dr. Lata Bhat',
      credentials: 'MBBS, DCH, MRCPCH(UK), Fellowship in Neonatology',
      experience: '39+ Years Experience',
      hospital: 'Private Practice',
      address: 'Delhi',
      hours: 'Mon-Sat 9AM-7PM',
      specializations: 'Neonatology, Child Growth, Vaccination',
      bookingLink: 'https://www.practo.com',
      rating: '4.8/5 (95 reviews)'
    },
    {
      name: 'Dr. Amit Agarwal',
      credentials: 'MD - Paediatrics, MBBS',
      experience: '20+ Years Experience',
      hospital: 'Mother & Child Care Center',
      address: 'Noida, Delhi NCR',
      hours: 'Mon-Sat 2PM-3PM',
      specializations: 'Nephrology, Child Vaccinations',
      bookingLink: 'https://www.practo.com',
      rating: '4.7/5 (825 reviews)'
    },
    {
      name: 'Dr. Ajit Kumar',
      credentials: 'MBBS, MD, DNB Neonatology',
      experience: '24+ Years Experience',
      hospital: 'ABC Hospital & IVF Center',
      address: 'Ghaziabad, Delhi NCR',
      hours: 'Mon-Sat 6PM-9PM',
      specializations: 'General Pediatrics, Neonatology',
      bookingLink: 'https://www.lybrate.com',
      rating: '4.6/5 (103 reviews)'
    }
  ],
  'Mumbai': [
    {
      name: 'Dr. Prithvi D Madhok',
      credentials: 'MBBS, MD (Pediatrics)',
      experience: '52+ Years Experience',
      hospital: 'Ashwini Nursing Home',
      address: 'Khar West, Mumbai',
      hours: 'Mon-Sat 8AM-6PM',
      specializations: 'General Pediatrics, Vaccination',
      bookingLink: 'https://www.practo.com',
      rating: '4.7/5 (62 reviews)'
    },
    {
      name: 'Dr. Santanu Sen',
      credentials: 'MBBS, MD, Pediatric Oncology & Hematology',
      experience: '27+ Years Experience',
      hospital: 'Kokilaben Dhirubhai Ambani Hospital',
      address: 'Andheri West, Mumbai',
      phone: '022 6105 4211 Ext: 784',
      hours: 'Mon-Fri 9AM-7PM',
      specializations: 'Oncology, Hematology, Vaccination',
      bookingLink: 'https://www.kokilabenhospital.com',
      rating: '4.9/5 (101 reviews)'
    },
    {
      name: 'Dr. Vipul Mehrotra',
      credentials: 'MBBS, MD (Pediatrics)',
      experience: '22+ Years Experience',
      hospital: 'Shishu Child Care Clinic',
      address: 'Andheri East, Mumbai',
      hours: 'Mon-Fri 10AM-4PM',
      specializations: 'Asthma, Allergy, Childcare',
      bookingLink: 'https://www.practo.com',
      rating: '4.8/5 (96 reviews)'
    },
    {
      name: 'Dr. Prashant Gandhi',
      credentials: 'MBBS, MD (Pediatrics)',
      experience: '19+ Years Experience',
      hospital: 'Own Clinic',
      address: 'Mumbai',
      hours: 'Mon-Sat 9AM-6PM',
      specializations: 'General Pediatrics, Immunization',
      bookingLink: 'https://www.practo.com',
      rating: '4.7/5 (84 reviews)'
    }
    // (Additional Mumbai pediatricians should be similarly structured.)
  ],
  'Bangalore': [
    {
      name: 'Dr. Sreenath S Manikanti',
      credentials: 'MBBS, MD (Pediatrics)',
      experience: '30+ Years Experience',
      hospital: 'Cloudnine Hospital',
      address: 'Old Airport Road, Bangalore',
      phone: '080 4030 4050',
      hours: 'Mon-Fri 8AM-5PM',
      specializations: 'Neonatology, Pediatrics',
      bookingLink: 'https://www.cloudninecare.com',
      rating: '4.9/5 (1256 reviews)'
    },
    {
      name: 'Dr. Tejaswini Nayak',
      credentials: 'MBBS, DNB (Pediatrics), DCH',
      experience: '27+ Years Experience',
      hospital: 'Chinmayi Child Clinic',
      address: 'Outer Ring Road, Bangalore',
      phone: '080 2574 0950',
      hours: 'Mon-Sat 10AM-3PM',
      specializations: 'Vaccination, Endodontics, General Pediatrics',
      bookingLink: 'https://www.practo.com',
      rating: '4.8/5 (138 reviews)'
    },
    {
      name: 'Dr. Ashok Mv',
      credentials: 'MBBS, MD (Pediatrics), Fellowship Neonatology',
      experience: '20+ Years Experience',
      hospital: 'D G Hospital/Little Kids Clinic',
      address: 'Sarjapur Outer Ring Road, Bangalore',
      hours: 'Mon-Sat 9AM-5PM',
      specializations: 'Neonatology, Infectious Diseases',
      bookingLink: 'https://www.practo.com',
      rating: '4.7/5 (112 reviews)'
    }
    // (More Bangalore pediatricians can be added in the same format.)
  ],
  'Kolkata': [
    {
      name: 'Dr. Amitava Pahari',
      credentials: 'MBBS, DCH, MD (Pediatrics)',
      experience: '31+ Years Experience',
      hospital: 'Apollo Gleneagles Hospital',
      address: 'Salt Lake City, Kolkata',
      hours: 'Mon-Fri 9AM-7PM',
      specializations: 'Pediatric Nephrology, Child Health',
      bookingLink: 'https://www.apollohospitals.com',
      rating: '4.7/5 (160 reviews)'
    },
    {
      name: 'Dr. Abhijit Chowdhury',
      credentials: 'MBBS, MD (Pediatrics)',
      experience: '30+ Years Experience',
      hospital: 'Clinic & Dumdum Area',
      address: 'Dumdum, Kolkata',
      hours: 'Mon-Fri 8AM-6PM',
      specializations: 'Vaccination, Nutrition, General Pediatrics',
      rating: '4.8/5 (79 reviews)'
    }
    // (Fill in with more top-rated Kolkata doctors as per sources.)
  ],
  'Chennai': [
    {
      name: 'Dr. Muthiah Periyakaruppan',
      credentials: 'MBBS, MD (Pediatrics), IDPCCM, FPCC',
      experience: '18+ Years Experience',
      hospital: 'Cloudnine Hospital',
      address: 'T Nagar, Chennai',
      phone: '099728 99728',
      hours: 'Mon-Sat 10AM-7PM',
      specializations: 'General Pediatrics, Pediatric Critical Care',
      bookingLink: 'https://www.cloudninecare.com',
      rating: '4.8/5 (121 reviews)'
    },
    {
      name: 'Dr. Mohamed Sajjid',
      credentials: 'MBBS, DCH, DNB',
      experience: '27+ Years Experience',
      hospital: 'M S Child Care Clinic',
      address: 'Royapettah, Chennai',
      hours: 'Mon-Sat 6PM-10PM',
      specializations: 'Child Health, Adolescent Medicine',
      bookingLink: 'https://www.lybrate.com',
      rating: '4.8/5 (98 reviews)'
    },
    {
      name: 'Dr. Merlin Vincy',
      credentials: 'MBBS, DCH',
      experience: '36+ Years Experience',
      hospital: 'Dr Merlin\'s Clinic',
      address: 'Velachery, Chennai',
      hours: 'Mon-Sat 4PM-8PM',
      specializations: 'Childhood Disorders, Immunization',
      bookingLink: 'https://www.lybrate.com',
      rating: '4.7/5 (67 reviews)'
    },
    {
      name: 'Dr. Sivaraman',
      credentials: 'MBBS, DCH',
      experience: '20+ Years Experience',
      hospital: 'Siva Children\'s Hospital',
      address: 'Chennai',
      hours: 'Mon-Fri 7:30PM-8:30PM',
      specializations: 'General Pediatrics, Growth Monitoring',
      bookingLink: 'https://www.lybrate.com',
      rating: '4.6/5 (42 reviews)'
    }
  ],
  'Hyderabad': [
    {
      name: 'Dr. J Naga Sravani',
      credentials: 'MD, Fiap (Neurodevelopmental Pediatrics)',
      experience: '8+ Years Experience',
      hospital: 'Apollo Cradle & Children\'s Hospital',
      address: 'Kondapur, Hyderabad',
      hours: 'Mon-Sat 10AM-6PM',
      specializations: 'Neurodevelopmental Disorders, Neonatology',
      bookingLink: 'https://www.apollocradle.com',
      rating: '4.9/5 (75 reviews)'
    },
    {
      name: 'Dr. Taheer Shaik',
      credentials: 'MBBS, DCH',
      experience: '12+ Years Experience',
      hospital: 'Apollo Cradle & Children\'s Hospital',
      address: 'Kondapur, Hyderabad',
      hours: 'Mon-Sat 10AM-6PM',
      specializations: 'General Pediatrics, Neonatology',
      bookingLink: 'https://www.apollocradle.com',
      rating: '4.8/5 (49 reviews)'
    },
    {
      name: 'Dr. Avash Pani',
      credentials: 'MBBS, MD (Pediatrics)',
      experience: '15+ Years Experience',
      hospital: 'Apollo Cradle & Children\'s Hospital',
      address: 'Kondapur, Hyderabad',
      hours: 'Mon-Sat 10AM-6PM',
      specializations: 'General Pediatrics, Allergy, Immunization',
      bookingLink: 'https://www.apollocradle.com',
      rating: '4.7/5 (41 reviews)'
    }
  ],
  'Pune': [
    {
      name: 'Dr. Parag Kamat',
      credentials: 'MBBS, MD (Pediatrics)',
      experience: '16+ Years Experience',
      hospital: 'Umarji Mother & Child Care',
      address: 'Baner, Pune',
      hours: 'Mon-Sat 9AM-6PM',
      specializations: 'General Pediatrics, Newborn Care',
      bookingLink: 'https://www.practo.com',
      rating: '4.9/5 (85 reviews)'
    },
    {
      name: 'Dr. Upendra Bhalerao',
      credentials: 'MD (Pediatrics)',
      experience: '11+ Years Experience',
      hospital: 'Cloudnine Hospital',
      address: 'Kalyani Nagar, Pune',
      hours: 'Mon-Sat 10AM-7PM',
      specializations: 'General Pediatrics, Infectious Diseases',
      bookingLink: 'https://www.cloudninecare.com',
      rating: '4.8/5 (65 reviews)'
    }
  ],
  'Ahmedabad': [
    {
      name: 'Dr. Alpesh Patel',
      credentials: 'MBBS, MD (Pediatrics)',
      experience: '22+ Years Experience',
      hospital: 'Amardeep Multispeciality Children Hospital',
      address: 'Ellis Bridge, Ahmedabad',
      phone: '079-26442478',
      hours: 'Mon-Sat 10AM-7PM',
      specializations: 'Neonatology, Pediatric Surgery',
      bookingLink: 'https://amardeepchildrenhospital.com',
      rating: '4.8/5 (42 reviews)'
    },
    {
      name: 'Dr. Chinmay Desai',
      credentials: 'MBBS, MD (Pediatrics)',
      experience: '18+ Years Experience',
      hospital: 'CIMS Hospital',
      address: 'Science City Road, Sola, Ahmedabad',
      hours: 'Mon-Sat 9AM-6PM',
      specializations: 'General Pediatrics, Critical Care',
      bookingLink: 'https://www.cims.org',
      rating: '4.8/5 (22 reviews)'
    }
  ]
};

// ========================================================================
// FAQS ARRAY
// ========================================================================
const faqs = [
    {
        question: 'What are the common symptoms of asthma in children?',
        answer: 'Children with asthma often experience wheezing, coughing (especially at night or early morning), shortness of breath, and chest tightness. These symptoms may worsen with exercise, allergies, or respiratory infections.',
        citation: '<a href="https://www.cdc.gov/asthma/children.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Asthma in Children. 2024.</a>'
    },
    {
        question: 'How can chickenpox be prevented in children?',
        answer: 'Chickenpox can be effectively prevented through vaccination with the varicella vaccine. The vaccine is recommended for all children and significantly reduces the risk of disease and complications.',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/varicella" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Varicella (Chickenpox). 2024.</a>'
    },
    {
        question: 'What treatments are available for bronchiolitis in infants?',
        answer: 'Treatment for bronchiolitis is mainly supportive, including oxygen therapy, hydration, and suctioning of nasal secretions. In severe cases, hospitalization may be required for more intensive care.',
        citation: '<a href="https://www.cdc.gov/rsv/high-risk/infants-younger-than-6-months.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Bronchiolitis and RSV. 2023.</a>'
    },
    {
        question: 'What causes croup in young children, and how is it treated?',
        answer: 'Croup is caused primarily by viral infections, commonly the parainfluenza virus. Treatment focuses on humidified air, corticosteroids to reduce airway inflammation, and nebulized epinephrine in severe cases.',
        citation: '<a href="https://www.nhs.uk/conditions/croup/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NHS. Croup in Children. 2024.</a>'
    },
    {
        question: 'How is diarrhea in children managed and prevented?',
        answer: 'Management includes oral rehydration therapy, zinc supplementation, and appropriate antibiotics if bacterial infection is confirmed. Prevention focuses on good sanitation, clean water, handwashing, and rotavirus vaccination.',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Diarrheal Disease. 2024.</a>'
    },
    {
        question: 'What is the typical rash pattern in fifth disease (erythema infectiosum)?',
        answer: 'Fifth disease typically causes a characteristic “slapped cheek” rash on the face followed by a lacy red rash on the body and limbs. It often presents with mild fever and cold-like symptoms beforehand.',
        citation: '<a href="https://www.cdc.gov/parvovirusB19/fifth-disease.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Fifth Disease. 2023.</a>'
    },
    {
        question: 'How is Hand, Foot, and Mouth Disease transmitted and prevented?',
        answer: 'HFMD spreads through respiratory secretions and contact with blister fluid. Prevention includes good hand hygiene, disinfecting surfaces, and avoiding close contact during outbreaks.',
        citation: '<a href="https://www.cdc.gov/hand-foot-mouth/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. HFMD. 2023.</a>'
    },
    {
        question: 'What are common symptoms of Type 1 Diabetes in children?',
        answer: 'Common symptoms include increased thirst and urination, extreme hunger, unintended weight loss, fatigue, blurred vision, irritability, and bedwetting in children who were previously dry.',
        citation: '<a href="https://www.cdc.gov/diabetes/basics/what-is-type-1-diabetes.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Type 1 Diabetes. 2024.</a>'
    },
    {
        question: 'What treatments are available for ADHD in children?',
        answer: 'Treatment includes stimulant and non-stimulant medications, behavioral therapy, parent training, school accommodations, and cognitive behavioral therapy to manage symptoms effectively.',
        citation: '<a href="https://www.cdc.gov/adhd/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. ADHD in Children. 2024.</a>'
    },
    {
        question: 'What therapies help children with Autism Spectrum Disorder?',
        answer: 'Key therapies include Applied Behavior Analysis (ABA), speech and language therapy, occupational therapy, social skills training, and educational support tailored to individual needs.',
        citation: '<a href="https://www.cdc.gov/autism/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Autism Spectrum Disorder. 2024.</a>'
    },
    {
        question: 'How is epilepsy managed in children?',
        answer: 'Epilepsy is managed with anti-epileptic medications, ketogenic diet in some cases, vagus nerve stimulation, surgery for drug-resistant forms, and appropriate seizure safety education.',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/epilepsy" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Epilepsy Fact Sheet. 2024.</a>'
    },
    {
        question: 'What are the signs of atopic dermatitis (eczema) in children?',
        answer: 'Signs include dry, itchy skin with red or brownish-gray patches, small raised bumps that may leak fluid, thickened or scaly skin, and frequent scratching leading to skin infections.',
        citation: '<a href="https://www.niams.nih.gov/health-topics/atopic-dermatitis" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH. Atopic Dermatitis. 2024.</a>'
    },
    {
        question: 'How is iron deficiency anemia detected and treated in children?',
        answer: 'It is detected by symptoms like fatigue, pale skin, and frequent infections. Treatment involves iron supplementation, iron-rich diet, and addressing any underlying causes of blood loss or malabsorption.',
        citation: '<a href="https://www.cdc.gov/nutrition/infantandtoddlernutrition/vitamins-minerals/iron.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Iron Deficiency in Children. 2024.</a>'
    },
    {
        question: 'What symptoms indicate appendicitis in children?',
        answer: 'Symptoms include sudden pain near the navel shifting to lower right abdomen, pain worsening with movement, nausea, vomiting, loss of appetite, low-grade fever, and abdominal swelling.',
        citation: '<a href="https://www.ncbi.nlm.nih.gov/books/NBK542191/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NCBI. Pediatric Appendicitis. 2023.</a>'
    },
    {
        question: 'How can celiac disease be managed in children?',
        answer: 'Management involves a strict lifelong gluten-free diet, nutritional supplementation, regular monitoring for deficiencies, and treatment of associated conditions to prevent complications.',
        citation: '<a href="https://celiac.org/about-celiac-disease/what-is-celiac-disease/celiac-disease-in-children/" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Celiac Disease Foundation. Celiac Disease in Children. 2021.</a>'
    },
    {
        question: 'What is the best way to treat impetigo in children?',
        answer: 'Treatment includes topical antibiotics like mupirocin for localized infection, oral antibiotics for widespread infection, gentle skin cleaning, and covering sores to prevent spread.',
        citation: '<a href="https://www.cdc.gov/groupastrep/diseases-public/impetigo.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Impetigo. 2024.</a>'
    },
    {
        question: 'How is ringworm transmitted and treated?',
        answer: 'Ringworm is transmitted by direct contact with an infected person or animal, or contaminated surfaces. Treatment includes topical antifungal creams and oral antifungals for severe cases, along with good hygiene.',
        citation: '<a href="https://www.cdc.gov/fungal/diseases/ringworm/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Ringworm. 2024.</a>'
    },
    {
        question: 'What are the signs of congenital heart defects in infants?',
        answer: 'Signs include rapid or difficulty breathing, bluish skin coloration, fatigue during feeding, poor weight gain, swelling, and heart murmurs. Early diagnosis is essential for management.',
        citation: '<a href="https://www.cdc.gov/heart-defects/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Congenital Heart Defects. 2024.</a>'
    },
    {
        question: 'How can childhood obesity be prevented?',
        answer: 'Prevention strategies include maintaining a healthy diet, increasing physical activity, limiting screen time, ensuring adequate sleep, and promoting healthy family lifestyle habits.',
        citation: '<a href="https://www.cdc.gov/obesity/childhood/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Childhood Obesity. 2024.</a>'
    },
    {
        question: 'What causes sickle cell disease and how is it managed?',
        answer: 'Sickle cell disease is a genetic disorder causing abnormal red blood cells. Management includes medications to reduce pain and complications, blood transfusions, infection prevention, and in some cases, bone marrow transplant.',
        citation: '<a href="https://www.cdc.gov/sickle-cell/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Sickle Cell Disease. 2024.</a>'
    },
    {
        question: 'What are the typical treatments for Kawasaki disease?',
        answer: 'Treatment involves intravenous immunoglobulin (IVIG), high-dose aspirin, and hospitalization for monitoring to prevent heart complications. Early treatment is critical.',
        citation: '<a href="https://www.cdc.gov/kawasaki/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Kawasaki Disease. 2024.</a>'
    }
];

// ========================================================================
// NEW DATA STRUCTURES FOR EMPTY SECTIONS
// ========================================================================

const whenToSeeData = [

    {
        question: '📅 When should I take my child to a pediatrician?',
        answer: 'Take your child to a pediatrician for regular well-child visits as recommended (typically newborn, 1, 2, 4, 6, 9, 12 months and annually thereafter). Additionally, seek care when your child shows signs of illness such as high fever, difficulty breathing, persistent vomiting or diarrhea, dehydration, rash, or unusual behavior.',
        citation: '<a href="https://www.healthychildren.org/English/family-life/health-management/Pages/When-To-Call-The-Pediatrician.aspx" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">American Academy of Pediatrics (AAP). When to Call the Pediatrician. 2019.</a>'
    },
    {
        question: '🩺 What are the common symptoms of respiratory infections in children?',
        answer: 'Common symptoms include runny or stuffy nose, cough, fever, sore throat, wheezing, difficulty breathing, and fatigue. Most respiratory infections are viral and resolve with supportive care, but persistent or severe symptoms warrant medical evaluation.',
        citation: '<a href="https://www.cdc.gov/flu/children/index.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Influenza in Children. 2024.</a>'
    },
    {
        question: '🦠 How can common contagious childhood illnesses be prevented?',
        answer: 'Prevention strategies include following the recommended vaccination schedule, practicing good hand hygiene, avoiding close contact with sick individuals, disinfecting surfaces regularly, and teaching children to cover coughs and sneezes properly.',
        citation: '<a href="https://www.cdc.gov/vaccines/schedules/hcp/imz/child-adolescent.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Immunization Schedules for Children. 2024.</a>'
    },
    {
        question: '💉 When should my child receive vaccines?',
        answer: 'Vaccines are given according to a schedule starting at birth through adolescence. Key vaccines include Hepatitis B, DTaP, Hib, Polio, MMR, Varicella, Influenza annually, and HPV from age 11–12. Consult your pediatrician for personalized schedules.',
        citation: '<a href="https://www.cdc.gov/vaccines/schedules/hcp/imz/child-adolescent.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Child and Adolescent Immunization Schedule. 2024.</a>'
    },
    {
        question: '🤒 When is a fever serious in children?',
        answer: 'A fever above 104°F (40°C), fever lasting more than 3 days, or associated with lethargy, difficulty breathing, persistent vomiting, rash, or seizures requires immediate medical attention.',
        citation: '<a href="https://www.healthychildren.org/English/health-issues/conditions/fever/Pages/When-to-Call-the-Pediatrician-for-a-Fever.aspx" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAP. When to Call the Pediatrician for a Fever. 2019.</a>'
    },
    {
        question: '🌡️ How should I treat common viral infections at home?',
        answer: 'Ensure adequate hydration, rest, use fever reducers like acetaminophen or ibuprofen appropriately, and monitor symptoms closely. Avoid antibiotics unless prescribed by a doctor as most viral illnesses do not require them.',
        citation: '<a href="https://www.cdc.gov/antibiotic-use/community/for-patients/common-illnesses.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Common Infections in Children. 2024.</a>'
    },
    {
        question: '🦷 How can I prevent dental cavities in children?',
        answer: 'Regular brushing twice daily with fluoride toothpaste, reducing sugary snacks and drinks, routine dental visits starting at age 1, and dental sealants are effective prevention methods.',
        citation: '<a href="https://www.cdc.gov/oralhealth/children_adults/child.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Children’s Oral Health Basics. 2024.</a>'
    },
    {
        question: '🤧 When should I worry about my child’s cough?',
        answer: 'Seek medical care if the cough is persistent (>3 weeks), accompanied by wheezing, difficulty breathing, high fever, coughing up blood, or if your child appears very ill or lethargic.',
        citation: '<a href="https://www.healthychildren.org/English/health-issues/conditions/chest-lungs/Pages/Cough.aspx" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAP. Cough in Children. 2019.</a>'
    },
    {
        question: '🥴 What are febrile seizures, and what should I do?',
        answer: 'Febrile seizures are convulsions triggered by fever in young children (usually 6 months to 5 years). They usually last a few minutes and do not cause harm. Seek emergency medical care if the seizure lasts longer than 5 minutes, if it is the first occurrence, or the child doesn’t regain consciousness quickly.',
        citation: '<a href="https://www.cdc.gov/epilepsy/parents/febrile-seizures.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Febrile Seizures. 2024.</a>'
    },
    {
        question: '🥦 How to manage food allergies in children?',
        answer: 'Avoid known allergens strictly, educate caregivers and schools about allergy management, carry emergency epinephrine auto-injectors, and seek regular follow-up with an allergist.',
        citation: '<a href="https://www.aaaai.org/conditions-and-treatments/allergies/food-allergies" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">American Academy of Allergy, Asthma & Immunology. Food Allergies. 2024.</a>'
    },
    {
        question: '👂 What are the signs of an ear infection in children?',
        answer: 'Symptoms include ear pain, tugging at the ear, difficulty sleeping, fever, irritability, and sometimes fluid drainage from the ear. If these occur, consult a pediatrician for diagnosis and treatment.',
        citation: '<a href="https://www.healthychildren.org/English/health-issues/conditions/ear-nose-throat/Pages/Ear-Infections.aspx" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAP. Ear Infections. 2024.</a>'
    },
    {
        question: '🤧 How can I prevent my child from catching the common cold?',
        answer: 'Prevention includes frequent hand washing, avoiding close contact with sick individuals, disinfecting surfaces, and teaching children to cover their coughs and sneezes.',
        citation: '<a href="https://www.cdc.gov/features/rhinoviruses/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Common Cold Prevention. 2024.</a>'
    },
    {
        question: '🌡️ What is the best way to care for a child with the flu?',
        answer: 'Ensure rest, plenty of fluids, and use fever reducers like acetaminophen or ibuprofen. Seek medical care if the child has difficulty breathing, chest pain, persistent vomiting, or high fever lasting more than a few days.',
        citation: '<a href="https://www.cdc.gov/flu/children/index.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Influenza in Children. 2024.</a>'
    },
    {
        question: '🦠 How to recognize and treat strep throat?',
        answer: 'Strep throat symptoms include sore throat, fever, swollen tonsils, and sometimes stomach pain. Diagnosis is by throat swab, and treatment requires antibiotics to prevent complications.',
        citation: '<a href="https://www.cdc.gov/groupastrep/strep-throat/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Strep Throat. 2024.</a>'
    },
    {
        question: '🧴 How can I prevent skin infections like impetigo in my child?',
        answer: 'Good hygiene, keeping cuts clean and covered, avoiding sharing personal items, and prompt treatment of skin injuries help prevent impetigo.',
        citation: '<a href="https://www.cdc.gov/groupastrep/diseases-public/impetigo.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Impetigo. 2024.</a>'
    },
    {
        question: '💧 What are dehydration signs in children with diarrhea or vomiting?',
        answer: 'Look for dry mouth, lack of tears, sunken eyes, lethargy, irritability, and decreased urine output. Immediate medical care is necessary if these signs appear.',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Diarrheal Disease. 2024.</a>'
    },
    {
        question: '🐛 What should I know about treating head lice in children?',
        answer: 'Use approved medicated shampoos or lotions, comb out nits daily, wash bedding and clothes in hot water, and avoid sharing hats or brushes.',
        citation: '<a href="https://www.cdc.gov/parasites/lice/head/treatment.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Head Lice Treatment. 2024.</a>'
    },
    {
        question: '🦠 How to identify and manage hand, foot, and mouth disease?',
        answer: 'Symptoms include fever, sore throat, painful mouth sores, and a rash on hands and feet. Treatment is symptomatic with hydration and pain control; it usually resolves in 7-10 days.',
        citation: '<a href="https://www.cdc.gov/hand-foot-mouth/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Hand, Foot, and Mouth Disease. 2023.</a>'
    },
    {
        question: '🩺 When should I seek emergency care for my child’s asthma attack?',
        answer: 'Seek emergency care if your child has severe shortness of breath, trouble speaking or eating, bluish lips or face, or if their inhaler is not improving symptoms promptly.',
        citation: '<a href="https://www.cdc.gov/asthma/triggers.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Asthma Triggers and Emergency Care. 2024.</a>'
    },
    {
        question: '🤒 How do I know if my child has pneumonia and what should I do?',
        answer: 'Signs include cough with phlegm, high fever, rapid or difficult breathing, chest pain, and fatigue. Consult a doctor promptly for evaluation and treatment, which may include antibiotics or hospitalization.',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/pneumonia" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Pneumonia. 2024.</a>'
    },

    {
        question: '😷 What causes sore throats in children and when is it serious?',
        answer: 'Most sore throats are viral and resolve on their own. However, strep throat (bacterial) requires antibiotics. Seek medical attention if symptoms last >1 week, are severe, or are accompanied by fever, rash, or difficulty swallowing.',
        citation: '<a href="https://www.cdc.gov/groupastrep/strep-throat/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Strep Throat. 2024.</a>'
    },
    {
        question: '🦠 How can urticaria (hives) be managed in a child?',
        answer: 'Urticaria presents as itchy, raised welts on the skin. Manage by removing triggers, using antihistamines, and seeking medical advice for severe swelling or breathing difficulty, which may indicate anaphylaxis.',
        citation: '<a href="https://www.healthychildren.org/English/health-issues/conditions/skin/Pages/Hives.aspx" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">AAP. Hives in Children. 2024.</a>'
    },
    {
        question: '🦵 What are the symptoms of muscular dystrophy in children?',
        answer: 'Children with muscular dystrophy may experience muscle weakness, difficulty walking, frequent falls, and delayed motor milestones. Diagnosis involves genetic testing and muscle biopsy; physical therapy can help manage symptoms.',
        citation: '<a href="https://www.cdc.gov/ncbddd/musculardystrophy/facts.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Muscular Dystrophy in Children. 2023.</a>'
    },
    {
        question: '🤕 How can I prevent accidental poisoning in children?',
        answer: 'Keep medicines and household chemicals out of reach, store items in childproof containers, and never leave children unattended around potentially toxic products.',
        citation: '<a href="https://www.cdc.gov/homeandrecreationalsafety/poisoning/preventiontips.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Poisoning Prevention. 2024.</a>'
    },
    {
        question: '🏊 How can I protect my child from drowning hazards?',
        answer: 'Always supervise children near water, teach them to swim, use life jackets, and ensure home pools are fenced and secured.',
        citation: '<a href="https://www.cdc.gov/drowning/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Drowning Prevention. 2024.</a>'
    },
    {
        question: '🇩🇪 What is rubella (German measles) and why vaccinate?',
        answer: 'Rubella causes mild fever and rash but can cause serious birth defects if contracted during pregnancy. The MMR vaccine prevents rubella and is recommended for all children.',
        citation: '<a href="https://www.cdc.gov/rubella/about/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Rubella. 2024.</a>'
    },
    {
        question: '🦟 How can parasitic infections (worms) be prevented in kids?',
        answer: 'Prevent by ensuring handwashing, cooking meats thoroughly, wearing shoes outdoors, and regular deworming in high-risk regions.',
        citation: '<a href="https://www.cdc.gov/parasites/children.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Parasitic Infections in Children. 2024.</a>'
    },
    {
        question: '💊 What does “rare disease” mean for children?',
        answer: 'A rare disease affects less than 200,000 people in the US and is often genetic or chronic. Diagnosis can be complex, and symptoms vary widely. Children may need multidisciplinary care and support groups.',
        citation: '<a href="https://www.chop.edu/centers-programs/center-rare-disease-therapy/rare-diseases-and-disorders-we-treat" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Children’s Hospital of Philadelphia. Rare Diseases. 2024.</a>'
    },
    {
        question: '🤕 What are common signs of concussion in children?',
        answer: 'Symptoms include headache, confusion, dizziness, nausea, vomiting, blurred vision, and difficulty concentrating. Seek medical care for suspected head injuries, especially with loss of consciousness or worsening symptoms.',
        citation: '<a href="https://www.cdc.gov/headsup/basics/concussion_whatis.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Concussion Basics. 2024.</a>'
    },
    {
        question: '🩸 What are signs of anemia in children and when should I worry?',
        answer: 'Look for pale skin, fatigue, rapid heartbeat, irritability, or poor appetite. Diagnosis is by blood tests; consult your doctor if these symptoms persist.',
        citation: '<a href="https://www.cdc.gov/nutrition/infantandtoddlernutrition/vitamins-minerals/iron.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Iron Deficiency in Children. 2024.</a>'
    }
];

const preventionData = [

    {
        question: '🏃‍♂️ Regular Exercise for Children',
        answer: 'Children and teens aged 6–17 should get at least 60 minutes of physical activity daily. This helps maintain a healthy weight, strengthens bones and muscles, improves mental health, and reduces the risk of chronic diseases later in life.<br><br><strong>Benefits:</strong> Lower risk of obesity and diabetes, improved fitness and social well-being.',
        citation: '<a href="https://www.cdc.gov/physical-activity-basics/children/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Kids Physical Activity. 2024.</a>'
    },
    {
        question: '🍎 Balanced Nutrition & Healthy Weight in Kids',
        answer: 'A balanced diet for children includes fruits, vegetables, whole grains, lean proteins, and dairy. Avoid sugary drinks and snacks. Good nutrition helps growth, immunity, brain development, dental, and bone health.<br><br><strong>Tip:</strong> Serve half the plate as fruits and veggies.',
        citation: '<a href="https://health.gov/myplate" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">USDA MyPlate for Kids. 2024.</a>'
    },
    {
        question: '💉 Routine Childhood Vaccinations',
        answer: 'Following the recommended vaccination schedule protects children from serious diseases like measles, polio, diphtheria, mumps, rubella, chickenpox, and whooping cough.<br><br>Vaccines also protect those who cannot be vaccinated for medical reasons.',
        citation: '<a href="https://www.cdc.gov/vaccines/schedules/hcp/imz/child-adolescent.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Child Immunization Schedule. 2024.</a>'
    },
    {
        question: '🦷 Dental Health & Hygiene',
        answer: 'Children should brush teeth twice daily with fluoride toothpaste, floss daily, and visit a dentist every 6 months. Limit sugary snacks and drinks to prevent cavities and gum disease.',
        citation: '<a href="https://www.cdc.gov/oralhealth/children_adults/child.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Oral Health Basics. 2024.</a>'
    },
    {
        question: '🤧 Common Cold & Respiratory Illness Prevention',
        answer: 'Teach kids to wash hands often, cover coughs/sneezes, and avoid sharing utensils. Respiratory viruses spread quickly at school—good hygiene is the best prevention.',
        citation: '<a href="https://www.cdc.gov/features/rhinoviruses/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Prevention: Common Cold. 2024.</a>'
    },
    {
        question: '⛑️ Safety: Preventing Injuries & Accidents',
        answer: 'Use car seats, helmets for cycling, adult supervision near water, and teach children about road safety. Childproof your home against poisoning and burns.',
        citation: '<a href="https://www.cdc.gov/safechild/SafeChild-Home.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Keeping Children Safe. 2024.</a>'
    },
    {
        question: '💤 Healthy Sleep in Children & Teens',
        answer: 'Children (ages 6–12) need 9–12 hours, and teens (13–18) need 8–10 hours of sleep per night. Consistent sleep routines support growth, mood, and learning.',
        citation: '<a href="https://www.cdc.gov/sleep/about_sleep/how_much_sleep.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Child Sleep Recommendations. 2024.</a>'
    },
    {
        question: '🧠 Mental Health Support for Kids',
        answer: 'Support children’s mental health by listening, encouraging open communication, monitoring for bullying, and seeking help for persistent sadness, anxiety, or withdrawal.',
        citation: '<a href="https://www.cdc.gov/childrensmentalhealth/features/mental-health-children.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Children’s Mental Health. 2024.</a>'
    },
    {
        question: '🍳 Preventing Childhood Obesity',
        answer: 'Encourage regular physical activity, healthy eating habits (limit fast food, sugary drinks), and screen time restrictions. Family support is crucial.',
        citation: '<a href="https://www.cdc.gov/obesity/childhood/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Childhood Obesity Prevention. 2024.</a>'
    },
    {
        question: '🦷 Oral Hygiene: What About Braces?',
        answer: 'Children can be evaluated for orthodontics (braces) by age 7 for crowded or misaligned teeth, speech issues, and bite concerns. Early treatment may prevent problems later.',
        citation: '<a href="https://www.aaoinfo.org/whats-age-7/" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">AAO. Braces Age Guidelines. 2024.</a>'
    },
    {
        question: '💧 Hydration: Why is Water Important?',
        answer: 'Keep children hydrated with water rather than sugary drinks or sodas. Water supports digestion, skin, concentration, and prevents kidney stones and constipation.',
        citation: '<a href="https://www.healthychildren.org/English/healthy-living/nutrition/Pages/Water-Drinks-for-Kids.aspx" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">AAP. Water for Kids. 2024.</a>'
    },
    {
        question: '🦠 Parasitic Infections: Protect Against Worms',
        answer: 'Ensure proper hand hygiene, avoid walking barefoot outdoors, and regular deworming if recommended, especially in high-risk regions.',
        citation: '<a href="https://www.cdc.gov/parasites/children.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Parasite Prevention. 2024.</a>'
    },
    {
        question: '😷 Preventing Infectious Diseases at School',
        answer: 'Update immunizations, provide healthy meals, teach regular handwashing, and keep sick children home to prevent outbreaks.',
        citation: '<a href="https://www.cdc.gov/features/schools-healthy-kids/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Disease Control in Schools. 2024.</a>'
    },
    {
        question: '🩺 Regular Vision & Hearing Screening',
        answer: 'Annual vision and hearing checks help detect and treat problems early, improving learning and development.',
        citation: '<a href="https://www.cdc.gov/ncbddd/childdevelopment/screening.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Childhood Screening. 2024.</a>'
    },
    {
        question: '👂 Ear Infection: Symptoms & Treatment',
        answer: 'Ear pain, fussiness, or pulling at the ear may signal infections. Treatment ranges from observation to antibiotics; consult a pediatrician if symptoms persist.',
        citation: '<a href="https://www.healthychildren.org/English/health-issues/conditions/ear-nose-throat/Pages/Ear-Infections.aspx" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">AAP. Ear Infections. 2024.</a>'
    },
    {
        question: '🐛 How to Treat Head Lice?',
        answer: 'Use medicated lotions/shampoos, comb nits daily, clean bedding and clothes, and avoid sharing hats or brushes.',
        citation: '<a href="https://www.cdc.gov/parasites/lice/head/treatment.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Head Lice Treatment. 2024.</a>'
    },
    {
        question: '🧒 Monitoring Growth & Development',
        answer: 'Track height, weight, and milestones using growth charts at regular visits. Developmental screenings help catch delays early.',
        citation: '<a href="https://www.cdc.gov/ncbddd/childdevelopment/screening.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Developmental Screening. 2024.</a>'
    },
    {
        question: '🚼 Safe Sleep for Babies',
        answer: 'Place babies on their backs to sleep. Avoid loose bedding, soft objects, and co-sleeping to reduce SIDS risk.',
        citation: '<a href="https://www.cdc.gov/sids/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Safe Sleep for Infants. 2024.</a>'
    },
    {
        question: '🧼 Hand Hygiene: Best Practices',
        answer: 'Teach proper handwashing before meals and after bathroom use. Alcohol-based sanitizers are helpful if soap and water are unavailable.',
        citation: '<a href="https://www.cdc.gov/handwashing/when-how-handwashing.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Hand Hygiene. 2024.</a>'
    },
    {
        question: '😴 Managing Screen Time & Sleep Hygiene',
        answer: 'Limit recreational screen time to less than 2 hours daily for children over 5. Keep devices out of the bedroom and maintain regular sleep schedules.',
        citation: '<a href="https://www.cdc.gov/sleep/about_sleep/how_much_sleep.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Screen Time and Sleep. 2024.</a>'
    },
    {
        question: '🍳 Recognizing and Treating Allergies',
        answer: 'Common symptoms include hives, rash, sneezing, and wheezing. Severe allergies require an epinephrine injector and immediate medical attention.',
        citation: '<a href="https://www.aaaai.org/tools-for-the-public/conditions-library/allergies/common-food-allergies-in-children" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">AAAAI. Food Allergies in Children. 2024.</a>'
    },
    {
        question: '🦟 Mosquito-Borne Diseases Prevention',
        answer: 'Use mosquito nets, repellent, long-sleeve clothing, and eliminate standing water to protect against dengue, malaria, and chikungunya.',
        citation: '<a href="https://www.cdc.gov/mosquitoes/protection/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Mosquito Prevention. 2024.</a>'
    },
    {
        question: '💬 Communication and Social Skills',
        answer: 'Encourage open conversation, model positive interactions, and practice empathy and active listening with children daily.',
        citation: '<a href="https://www.cdc.gov/ncbddd/childdevelopment/features/communication-and-social-skills.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Social Skills in Children. 2024.</a>'
    },
    {
        question: '🔬 Regular Blood Work & Screening for Chronic Disease',
        answer: 'Monitor for anemia, cholesterol, diabetes, and thyroid issues in children at risk. Early screening enables prompt intervention and better outcomes.',
        citation: '<a href="https://www.cdc.gov/ncbddd/childdevelopment/screening.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Chronic Disease Prevention. 2024.</a>'
    },
    {
        question: '🛡️ Protection Against Injury (Home & Play)',
        answer: 'Use safety gates, guard rails, proper sports equipment, and supervise play. Teach children about fire/burn/chemical safety at home.',
        citation: '<a href="https://www.cdc.gov/safechild/SafeChild-Home.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Home Safety for Children. 2024.</a>'
    },
    {
        question: '🧩 Recognizing Developmental Disorders Early',
        answer: 'Autism, ADHD, and learning disabilities often show early signs such as delayed speech, poor social skills, or difficulty concentrating. See a specialist or psychologist for evaluation.',
        citation: '<a href="https://www.cdc.gov/ncbddd/autism/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Autism Spectrum Disorder. 2024.</a>'
    },
    {
        question: '🏊 Water Safety for Kids',
        answer: 'Always supervise children around water, ensure swimming lessons, use life jackets in boats, and secure pools with fences.',
        citation: '<a href="https://www.cdc.gov/drowning/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">CDC. Water Safety. 2024.</a>'
    }
];

//CHATBOT TAB INITIALIZATION CONSTANTS
// ========================================================================

// ====================
// HEALTH ASSISTANT CHATBOT DATA & LOGIC
// ====================

// Main menu options
const healthMainMenu = [
        "১. শীতল-জ্বর ও সর্দি",
        "২. ডায়রিয়া ও পাতলা পায়খানা",
        "৩. নিমোনিয়া ও ব্রঙ্কাইটিস",
        "৪. মূল খাদ্য স্বল্পতা ও অপুষ্টি",
        "৫. কনজাঙ্কটিভাইটিস",
        "৬. ত্বকের সংক্রমণ",
        "৭. আন্ত্রিক কৃমি",
        "৮. মিজলস্/হাম",
        "৯. টিবি/যক্ষ্মা",
        "১০. জন্মজনিত সমস্যা/শিশুদের বিকাশজনিত সমস্যা"
];

// Sub-menu prompts
const healthPromptMap = {

   "cold_fever": {
        "botPrompt": "আপনি কি সর্দি, কাশি বা জ্বরের সমস্যা নিয়ে আলোচনা করতে চান?",
        "options": [
          "শিশুর কাশি",
          "জ্বর ও গায়ে ব্যথা",
          "গলা ব্যথা",
          "সর্দি, নাক বন্ধ",
          "নাক দিয়ে পানি পড়া"
        ]
      },
      "diarrhea": {
        "botPrompt": "ডায়রিয়া বা পাতলা পায়খানা সংক্রান্ত কোন সমস্যা নিয়ে জানতে চান?",
        "options": [
          "ঘন ঘন পাতলা পায়খানা",
          "বমি বা ডিহাইড্রেশন",
          "পেট ব্যথা",
          "খাদ্যজনিত অস্বস্তি",
          "মল বাজে গন্ধ"
        ]
      },
      "pneumonia_bronchitis": {
        "botPrompt": "শিশুর শ্বাসকষ্ট, কফ বা নিউমোনিয়া/ব্রঙ্কাইটিস নিয়ে সাহায্য চান?",
        "options": [
          "শ্বাসকষ্ট",
          "কফ বা কাশির সমস্যা",
          "চেস্ট ইনফেকশন",
          "বুকে ঘড়ঘড় শব্দ",
          "উচ্চ জ্বর"
        ]
      },
      "malnutrition": {
        "botPrompt": "শিশুর পুষ্টি ঘাটতি বা অপুষ্টি নিয়ে জানতে চান?",
        "options": [
          "ওজন কমে যাওয়া",
          "শিশুর বৃদ্ধি কম",
          "শিশু খেতে চায় না",
          "অনিয়মিত খাবার",
          "ভিটামিনের ঘাটতি"
        ]
      },
      "conjunctivitis": {
        "botPrompt": "চোখের লাল হওয়া বা কনজাঙ্কটিভাইটিস নিয়ে আলোচনা করতে চান?",
        "options": [
          "চোখ লাল ও জল পড়া",
          "চোখ চুলকানো",
          "চোখে ব্যথা",
          "চোখ দিয়ে পুঁজ পড়া",
          "আলোতে অস্বস্তি"
        ]
      },
      "skin_infection": {
        "botPrompt": "ত্বকের সংক্রমণ বা চুলকানি সংক্রান্ত সমস্যা নিয়ে জানতে চান?",
        "options": [
          "চুলকানি",
          "র‍্যাশ/বিস্তারিত ক্ষত",
          "ফাংগাস/রিংওয়ার্ম",
          "স্ক্যাবিস বা পরজীবী",
          "ত্বকে ফোঁড়া"
        ]
      },
      "intestinal_worm": {
        "botPrompt": "শিশুর আন্ত্রিক কৃমি নিয়ে জানতে চান?",
        "options": [
          "পেটে ব্যথা",
          "কম ক্ষুধা",
          "ঘনঘন পায়খানা",
          "শিশু কুঁচকের কষ্ট",
          "কৃমি দেখা গেছে"
        ]
      },
      "measles": {
        "botPrompt": "হাম (Measles) সংক্রান্ত কোনো সমস্যা?",
        "options": [
          "হাম/Measles এর লক্ষণ",
          "লাল চুলকানি র‍্যাশ",
          "ফ্লু-জাতীয় উপসর্গ",
          "চোখের সমস্যা",
          "জ্বর, দুর্বলতা"
        ]
      },
      "tuberculosis": {
        "botPrompt": "যক্ষ্মা/টিবি সংক্রান্ত কোনো প্রশ্ন?",
        "options": [
          "অনেকদিনের কাশি",
          "ভরপুর রাতে ঘাম",
          "ওজন কমে যাওয়া",
          "বুকব্যথা",
          "ঘন ঘন জ্বর"
        ]
      },
      "congenital_developmental": {
        "botPrompt": "জন্মগত বা শিশু বিকাশ সংক্রান্ত সমস্যা নিয়ে জানতে চান?",
        "options": [
          "বিকাশের বিলম্ব",
          "বক্তৃতা বা হাঁটা দেরি",
          "জন্মগত হৃৎপিণ্ড সমস্যা",
          "শ্রবণ/দৃষ্টির সমস্যা",
          "অন্যান্য জন্মগত সমস্যা"
        ]
    }
};

// Map Bengali to English keys
const nextStateMap = {
  "১. শীতল-জ্বর ও সর্দি": "cold_fever",
  "২. ডায়রিয়া ও পাতলা পায়খানা": "diarrhea",
  "৩. নিমোনিয়া ও ব্রঙ্কাইটিস": "pneumonia_bronchitis",
  "৪. মূল খাদ্য স্বল্পতা ও অপুষ্টি": "malnutrition",
  "৫. কনজাঙ্কটিভাইটিস": "conjunctivitis",
  "৬. ত্বকের সংক্রমণ": "skin_infection",
  "৭. আন্ত্রিক কৃমি": "intestinal_worm",
  "৮. মিজলস্/হাম": "measles",
  "৯. টিবি/যক্ষ্মা": "tuberculosis",
  "১০. জন্মজনিত সমস্যা/শিশুদের বিকাশজনিত সমস্যা": "congenital_developmental"
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

    // Get doctor info from CHILD_HEALTH_RESOURCES
    const districtData = CHILD_HEALTH_RESOURCES[district];
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
    // The "When to See a Gynecologist" section uses the same FAQ-like structure
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
    const imageUrl = disease.imageUrl || `https://via.placeholder.com/900x250/B9E0F2/fef9fc?text=${encodeURIComponent(disease.name.toUpperCase() + " IMAGE")}`;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="detail-header">
            <span class="disease-category">${disease.category}</span>
            <h2>${disease.name}</h2>
        </div>

        <p style="font-size: 1.1rem; color: var(--color-text); font-style: italic; margin-bottom: 1.5rem;">
            A detailed overview of ${disease.name}, a ${disease.category.toLowerCase()} that primarily affects children health.
        </p>

        <img src="${imageUrl}" alt="${disease.name} Image" class="detail-image">

        <div class="disease-section">
            <h4>Symptoms</h4>
            <ul>
                ${disease.symptoms.map(s => `<li>${s}</li>`).join('')}
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