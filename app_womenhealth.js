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

// Women's Health Resources (matching Python exactly) - Updated with Asansol
const WOMENS_HEALTH_RESOURCES = {
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

const DISTRICTS = Object.keys(WOMENS_HEALTH_RESOURCES);

// Health categories matching Python exactly
const HEALTH_CATEGORIES = {
    "start": {
        "botPrompt": "নমস্কার! আমি নারীশক্তি, আপনার স্বাস্থ্য সংক্রান্ত প্রশ্নে সাহায্য করতে এসেছি। আপনি কোন ধরনের স্বাস্থ্য সমস্যা নিয়ে কথা বলতে চান?",
        "options": [
            "১. মাসিক সংক্রান্ত সমস্যা",
            "২. প্রজনন ও যৌন স্বাস্থ্য",
            "৩. PCOS ও হরমোনজনিত সমস্যা",
            "৪. স্তন ও জরায়ু ক্যান্সার এবং অন্যান্য মহিলা-সম্পর্কিত ক্যান্সার",
            "৫. মানসিক স্বাস্থ্য",
            "৬. হৃদরোগ, ডায়াবেটিস এবং অন্যান্য দীর্ঘস্থায়ী রোগ"
        ],
        "nextStateMap": {
            "১. মাসিক সংক্রান্ত সমস্যা": "menstrual_health",
            "২. প্রজনন ও যৌন স্বাস্থ্য": "reproductive_sexual_health",
            "৩. PCOS ও হরমোনজনিত সমস্যা": "PCOS_hormonal_health",
            "৪. স্তন ও জরায়ু ক্যান্সার এবং অন্যান্য মহিলা-সম্পর্কিত ক্যান্সার": "cancer_health",
            "৫. মানসিক স্বাস্থ্য": "mental_health",
            "৬. হৃদরোগ, ডায়াবেটিস এবং অন্যান্য দীর্ঘস্থায়ী রোগ": "other_health"
        }
    },
    "menstrual_health": {
        "botPrompt": "আপনার মাসিক সংক্রান্ত কোন সমস্যা নিয়ে আলোচনা করতে চান?",
        "options": ["অনিয়মিত পিরিয়ড", "অতিরিক্ত রক্তপাত", "তীব্র ব্যথা (Dysmenorrhea)", "পিরিয়ড বন্ধ হয়ে যাওয়া (Amenorrhea)", "অন্যান্য সমস্যা"]
    },
    "reproductive_sexual_health": {
        "botPrompt": "প্রজনন স্বাস্থ্য সংক্রান্ত কোন বিষয়ে সাহায্য চান?",
        "options": [ "গর্ভধারণে সমস্যা ও বন্ধ্যাত্ব",
                    "যৌন স্বাস্থ্য ও যৌনবাহিত সংক্রমণ (STI)",
                    "গর্ভনিরোধ ও পরিবার পরিকল্পনা",
                    "গর্ভাবস্থা ও প্রসবোত্তর সমস্যা",
                    "জরায়ু ফাইব্রয়েড ও এন্ডোমেট্রিওসিস"]
    },
    "PCOS_hormonal_health": {
    "botPrompt": "PCOS বা হরমোনজনিত সমস্যা নিয়ে জানতে চান?",
     "options": [
            "PCOS এর লক্ষণ ও নির্ণয়",
            "হরমোনের ভারসাম্যহীনতা ও অনিয়মিত মাসিক",
            "ওজন বৃদ্ধি ও বিপাকীয় সমস্যা",
            "খাদ্যাভ্যাস, ব্যায়াম ও জীবনযাত্রা",
            "PCOS-এ গর্ভধারণ ও চিকিৎসা"
        ]
    },
    "cancer_health": {
        "botPrompt": "ক্যান্সার সংক্রান্ত কোন বিষয়ে জানতে চান?",
        "options": ["স্তন ক্যান্সারের লক্ষণ", "জরায়ু ক্যান্সারের লক্ষণ", "স্ক্রিনিং ও পরীক্ষা", "প্রতিরোধ ও সচেতনতা", "অন্যান্য"]
    },

    "mental_health": {
        "botPrompt": "আপনার মানসিক স্বাস্থ্য সংক্রান্ত কোন সমস্যা নিয়ে আলোচনা করতে চান?",
        "options": ["বিষণ্ণতা ও মন খারাপ (Depression)","উদ্বেগ ও মানসিক চাপ (Anxiety & Stress)", "প্রসবোত্তর মানসিক সমস্যা (Postpartum Issues)",
            "ঘুমের সমস্যা ও অনিদ্রা",
            "অন্যান্য মানসিক স্বাস্থ্য সমস্যা"]
    },

    "other_health": {
        "botPrompt": "কোন স্বাস্থ্য সমস্যা নিয়ে জানতে চান?",
        "options": ["স্থূলতা ও ওজন নিয়ন্ত্রণ", "উচ্চ রক্তচাপ", "আর্থ্রাইটিস", "থাইরয়েড সমস্যা", "অন্যান্য"]
    }
};

// Question sequences matching Python exactly
const QUESTION_SEQUENCES = {
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
    "reproductive_sexual_health": [
        "আপনার বয়স কত?",
        "আপনি কি বিবাহিত?",
        "কতদিন ধরে গর্ভধারণের চেষ্টা করছেন?",
        "আগে কোন চিকিৎসা নিয়েছেন কি?",
        "আপনার পার্টনার কি কোন পরীক্ষা করিয়েছেন?",
        "আগে কখনো গর্ভধারণ হয়েছিল কি?",
        "পিরিয়ড কি নিয়মিত হয়?",
        "আপনার ওজন কেমন?",
        "থাইরয়েড বা হরমোন সমস্যা আছে কি?",
        "ধূমপান বা মদ্যপান করেন কি?",
        "কোন দীর্ঘমেয়াদী রোগ আছে কি?",
        "মানসিক চাপে থাকেন কি?"
    ],
    "PCOS_hormonal_health": [
        "আপনার বয়স কত?",
        "কতদিন আগে PCOS ধরা পড়েছে?",
        "আপনার ওজন কেমন?",
        "পিরিয়ড কি খুব অনিয়মিত?",
        "মুখে বা শরীরে অতিরিক্ত লোম আছে কি?",
        "ত্বকে ব্রণ বা কালো দাগ দেখা যায় কি?",
        "চুল পড়ার সমস্যা আছে কি?",
        "আপনি কি PCOS এর জন্য কোন ওষুধ খাচ্ছেন?",
        "ডায়াবেটিস আছে কি?",
        "চিনি বা তেলযুক্ত খাবার বেশি খান কি?",
        "নিয়মিত ব্যায়াম করেন কি?",
        "গর্ভধারণের ইচ্ছা আছে কি?"
    ],
    "cancer_health": [
        "আপনার বয়স কত?",
        "কোন ধরনের উপসর্গ লক্ষ্য করেছেন?",
        "কতদিন ধরে এই উপসর্গ আছে?",
        "পরিবারে কারো ক্যান্সারের ইতিহাস আছে কি?",
        "আগে কখনো স্ক্রিনিং টেস্ট করিয়েছেন কি?",
        "কোন ডাক্তারের সাথে পরামর্শ করেছেন কি?",
        "অন্য কোন উপসর্গ আছে কি?",
        "আপনি কি ধূমপান করেন?",
        "মাসিক কি বন্ধ হয়ে গেছে?",
        "কোন হরমোন থেরাপি নিয়েছেন কি?",
        "বুকে ব্যথা বা অস্বস্তি অনুভব করেন কি?",
        "নিয়মিত স্বাস্থ্য পরীক্ষা করান কি?"
    ],
    "mental_health": [
        "আপনার বয়স কত?",
        "কতদিন ধরে মানসিক চাপ বা দুশ্চিন্তা অনুভব করছেন?",
        "আপনি কি নিয়মিত দুঃখী বা হতাশ বোধ করেন?",
        "ঘুম কি ঠিকমতো হয়? (কম/বেশি/অনিয়মিত)",
        "খাওয়ার রুচি কেমন - স্বাভাবিক/কম/বেশি?",
        "দৈনন্দিন কাজকর্মে মনোযোগ দিতে অসুবিধা হয় কি?",
        "আপনি কি একা বা অসহায় বোধ করেন?",
        "পরিবার বা বন্ধুদের সাথে সম্পর্ক কেমন?",
        "নিয়মিত ব্যায়াম বা যোগ করেন কি?",
        "মানসিক স্বাস্থ্যের জন্য কোন ওষুধ খাচ্ছেন কি?",
        "আগে কোন মানসিক স্বাস্থ্য পেশাদারের সাথে কথা বলেছেন কি?",
        "জীবনে কোন বড় চাপ বা দুর্ঘটনা ঘটেছে কি?",
        "কখনো আত্মহানির কথা ভেবেছেন কি?",
        "আপনি কি দৈনন্দিন কাজকর্ম করতে সক্ষম?"
    ],

    "other_health": [
        "আপনার বয়স কত?",
        "কতদিন ধরে এই সমস্যা হচ্ছে?",
        "আপনার ওজন এবং উচ্চতা কত?",
        "নিয়মিত কোন ওষুধ খান কি?",
        "আপনার রক্তচাপ কেমন থাকে?",
        "ডায়াবেটিস আছে কি?",
        "জয়েন্টে ব্যথা আছে কি?",
        "দৈনিক কতটা শারীরিক পরিশ্রম করেন?",
        "লবণ বা চর্বি বেশি খান কি?",
        "ঘুম কি ঠিকমতো হয়?",
        "পরিবারে কারো এই ধরনের রোগ আছে কি?",
        "মানসিক চাপ থাকে কি?"
    ]
};

const diseases = [
    // Disease Data: 20 comprehensive entries for women's health conditions
    {
        name: 'Polycystic Ovary Syndrome (PCOS)',
        category: 'Hormonal Disorder',
        symptoms: [
            'Irregular or missed periods',
            'Excess facial and body hair (hirsutism)',
            'Acne and oily skin',
            'Weight gain or difficulty losing weight',
            'Thinning hair on scalp',
            'Dark patches of skin (insulin resistance)',
            'Difficulty getting pregnant'
        ],
        causes: [
            'Insulin resistance and high insulin levels',
            'Hormonal imbalance (excess androgens)',
            'Low-grade inflammation',
            'Genetic factors and family history'
        ],
        treatment: [
            'Birth control pills to regulate periods',
            'Metformin for insulin resistance',
            'Lifestyle changes (diet and exercise)',
            'Clomiphene for fertility treatment',
            'Hair removal treatments for hirsutism',
            'Weight management programs'
        ],
        prevention: 'Maintain healthy weight, regular exercise, balanced diet low in refined carbohydrates, stress management.',
        // ADDED IMAGE URL PROPERTY
        imageUrl: 'https://images.unsplash.com/photo-1596766465011-893322d99d3d?w=900&q=80',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Polycystic ovary syndrome. 2025.</a> | <a href="https://www.mayoclinic.org/diseases-conditions/PCOS/symptoms-causes/syc-20353439" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. PCOS Symptoms & Causes. 2022.</a>'
    },
    {
        name: 'Endometriosis',
        category: 'Tissue Disorder',
        symptoms: [
            'Painful periods (dysmenorrhea)',
            'Chronic pelvic pain, often worse during periods',
            'Painful intercourse (dyspareunia)',
            'Painful bowel movements or urination',
            'Excessive bleeding',
            'Infertility or difficulty conceiving',
            'Fatigue, nausea, bloating'
        ],
        causes: [
            'Retrograde menstruation (menstrual blood flows back into pelvis)',
            'Induction theory (non-uterine cells convert to endometrial cells)',
            'Embryonic cell transformation',
            'Surgical scar implantation',
            'Immune system disorder'
        ],
        treatment: [
            'Pain medication (NSAIDs)',
            'Hormone therapy (birth control, GnRH agonists)',
            'Laparoscopic surgery to remove endometrial tissue',
            'Hysterectomy (last resort for severe cases)',
            'Acupuncture and dietary changes for symptom management'
        ],
        prevention: 'No proven prevention. Early diagnosis and management are key to preventing chronic pain and progression.',
        imageUrl: 'https://images.unsplash.com/photo-1579737151121-65476a213e45?w=900&q=80',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/endometriosis/symptoms-causes/syc-20354656" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Endometriosis Overview. 2023.</a>'
    },
    {
        name: 'Uterine Fibroids (Leiomyomas)',
        category: 'Benign Tumor',
        symptoms: [
            'Heavy menstrual bleeding',
            'Prolonged periods (over a week)',
            'Pelvic pressure or pain',
            'Frequent urination',
            'Constipation and backache',
            'Difficulty emptying bladder',
            'Anemia due to blood loss'
        ],
        causes: [
            'Genetic changes in the muscle cells',
            'Hormonal factors (Estrogen and Progesterone promotion)',
            'Extracellular matrix accumulation',
            'Family history'
        ],
        treatment: [
            'Medication to control bleeding (GnRH agonists, IUD)',
            'Non-invasive procedures (focused ultrasound surgery)',
            'Minimally invasive procedures (Uterine artery embolization)',
            'Surgery (Myomectomy to remove fibroids, Hysterectomy)',
            'Iron supplements for anemia'
        ],
        prevention: 'Maintaining a healthy weight, exercising regularly, and eating a diet rich in fruits and vegetables may lower the risk.',
        imageUrl: 'https://images.unsplash.com/photo-1520281200388-348507204f14?w=900&q=80',
        citation: '<a href="https://www.womenshealth.gov/a-z-topics/uterine-fibroids" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Office on Women’s Health. Uterine Fibroids. 2024.</a>'
    },
    {
        name: 'Breast Cancer',
        category: 'Oncological Condition',
        symptoms: [
            'Lump or thickening in the breast or underarm',
            'Change in the size or shape of the breast',
            'Dimpling or irritation of the breast skin',
            'Redness or flaky skin in the nipple area or breast',
            'Nipple discharge other than breast milk',
            'Inverted nipple',
            'Pain in the breast or nipple'
        ],
        causes: [
            'Genetic mutations (BRCA1 and BRCA2)',
            'Age (risk increases with age)',
            'Family history of breast cancer',
            'Obesity and lack of physical activity',
            'Alcohol consumption',
            'Exposure to radiation',
            'Hormone replacement therapy'
        ],
        treatment: [
            'Surgery (lumpectomy or mastectomy)',
            'Chemotherapy',
            'Radiation therapy',
            'Hormone therapy (e.g., Tamoxifen)',
            'Targeted drug therapy',
            'Immunotherapy'
        ],
        prevention: 'Regular self-exams and clinical exams, mammograms starting at 40-50, maintaining healthy weight, limiting alcohol, breastfeeding, and physical activity.',
        imageUrl: 'https://images.unsplash.com/photo-1627883391216-56214309e3e7?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/cancer/breast/basic_info/prevention.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Breast Cancer Prevention. 2023.</a>'
    },
    {
        name: 'Cervical Cancer',
        category: 'Oncological Condition',
        symptoms: [
            'Abnormal vaginal bleeding (after intercourse, between periods)',
            'Pelvic pain or pain during intercourse',
            'Watery, bloody, or foul-smelling vaginal discharge',
            'Pain during urination (late stage)',
            'Swelling in the legs (late stage)',
            'Weight loss and fatigue (late stage)'
        ],
        causes: [
            'Human Papillomavirus (HPV) infection (most common cause)',
            'Multiple sexual partners',
            'Early sexual activity',
            'Smoking',
            'Weakened immune system',
            'Long-term use of oral contraceptives'
        ],
        treatment: [
            'Surgery (hysterectomy, conization)',
            'Radiation therapy',
            'Chemotherapy',
            'Targeted drug therapy (for advanced cases)'
        ],
        prevention: 'HPV vaccination (ages 9-26), regular Pap tests (starting at age 21) and HPV co-testing, practicing safe sex, not smoking.',
        imageUrl: 'https://images.unsplash.com/photo-1627883441551-766b44a30e71?w=900&q=80',
        citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/cervical-cancer" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Cervical Cancer Key Facts. 2024.</a>'
    },
    {
        name: 'Menopause and Perimenopause',
        category: 'Life Stage/Hormonal Shift',
        symptoms: [
            'Hot flashes and night sweats',
            'Irregular periods (perimenopause)',
            'Vaginal dryness and painful intercourse',
            'Mood changes (irritability, depression)',
            'Sleep disturbances (insomnia)',
            'Thinning hair and dry skin',
            'Decreased libido'
        ],
        causes: [
            'Natural decline in reproductive hormones (Estrogen and Progesterone)',
            'Aging (typically occurs in the late 40s or early 50s)',
            'Hysterectomy or Oophorectomy (surgical removal of ovaries)',
            'Chemotherapy or radiation therapy'
        ],
        treatment: [
            'Hormone Replacement Therapy (HRT)',
            'Lifestyle changes (diet, exercise, stress reduction)',
            'Non-hormonal medications for hot flashes (SSRIs)',
            'Vaginal estrogen creams for dryness',
            'Mindfulness and cognitive behavioral therapy (CBT)'
        ],
        prevention: 'Not preventable, as it is a natural life stage. Management focuses on minimizing symptoms and preventing long-term issues like osteoporosis and heart disease.',
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=900&q=80',
        citation: '<a href="https://www.nia.nih.gov/health/menopause/menopause-and-perimenopause" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Institute on Aging. Menopause Information. 2023.</a>'
    },
    {
        name: 'Vaginal Yeast Infection (Candidiasis)',
        category: 'Infection',
        symptoms: [
            'Itching and irritation in the vagina and vulva',
            'Burning sensation, especially during intercourse or urination',
            'Redness and swelling of the vulva',
            'Thick, white, odor-free vaginal discharge (cottage cheese appearance)',
            'Vaginal soreness and pain'
        ],
        causes: [
            'Overgrowth of the fungus Candida albicans',
            'Antibiotic use (reduces protective bacteria)',
            'Pregnancy and uncontrolled diabetes',
            'Weakened immune system',
            'Hormone changes (near menstrual cycle)'
        ],
        treatment: [
            'Antifungal creams, ointments, or suppositories (over-the-counter)',
            'Oral antifungal medication (e.g., Fluconazole) for severe cases',
            'Boric acid capsules (for resistant infections)'
        ],
        prevention: 'Wearing cotton underwear, avoiding tight-fitting clothes, not douching, changing out of wet swimwear promptly, and managing blood sugar if diabetic.',
        imageUrl: 'https://images.unsplash.com/photo-1543336332-9457222474f1?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/fungal/diseases/candidiasis/genital/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Genital Candidiasis. 2023.</a>'
    },
    {
        name: 'Urinary Tract Infection (UTI)',
        category: 'Infection',
        symptoms: [
            'Strong, persistent urge to urinate',
            'Burning sensation when urinating (dysuria)',
            'Passing frequent, small amounts of urine',
            'Cloudy, dark, or foul-smelling urine',
            'Pelvic pain in women',
            'Blood in the urine (hematuria)'
        ],
        causes: [
            'Bacteria (most commonly E. coli) entering the urinary tract',
            'Sexual activity and frequent intercourse',
            'Wiping back to front after using the toilet',
            'Use of certain birth control (diaphragms)',
            'Menopause (estrogen decline)'
        ],
        treatment: [
            'Antibiotics (e.g., Trimethoprim/sulfamethoxazole, Ciprofloxacin)',
            'Phenazopyridine for pain relief',
            'Increased fluid intake'
        ],
        prevention: 'Wiping front to back, drinking plenty of fluids, urinating after intercourse, avoiding irritating feminine products, and considering topical estrogen after menopause.',
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=900&q=80',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/urinary-tract-infection/symptoms-causes/syc-20353447" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. UTI Overview. 2022.</a>'
    },
    {
        name: 'Ovarian Cysts',
        category: 'Fluid-Filled Sac',
        symptoms: [
            'Most are asymptomatic and resolve on their own',
            'Pelvic pain (dull or sharp)',
            'Fullness or heaviness in the abdomen',
            'Bloating',
            'Pain during intercourse',
            'Sudden severe pain (if cyst ruptures or causes ovarian torsion)',
            'Frequent urge to urinate'
        ],
        causes: [
            'Normal menstrual cycle function (Follicular and Corpus Luteum cysts)',
            'Endometriosis',
            'PCOS (multiple small cysts)',
            'Severe pelvic infection'
        ],
        treatment: [
            'Watchful waiting and monitoring (for small, simple cysts)',
            'Birth control pills to prevent new cysts',
            'Laparoscopic surgery to remove large or problematic cysts',
            'Emergency surgery for torsion or rupture'
        ],
        prevention: 'Birth control pills may reduce the risk of new functional cysts in women who frequently develop them.',
        imageUrl: 'https://images.unsplash.com/photo-1579737151121-65476a213e45?w=900&q=80',
        citation: '<a href="https://my.clevelandclinic.org/health/diseases/17435-ovarian-cysts" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Cleveland Clinic. Ovarian Cysts. 2024.</a>'
    },
    {
        name: 'Pelvic Inflammatory Disease (PID)',
        category: 'Infection',
        symptoms: [
            'Pain in your lower abdomen and pelvis',
            'Heavy or foul-smelling vaginal discharge',
            'Fever and chills',
            'Painful intercourse',
            'Painful or difficult urination',
            'Irregular bleeding'
        ],
        causes: [
            'Untreated sexually transmitted infections (STIs) like Chlamydia and Gonorrhea',
            'Douching (disrupts natural bacterial balance)',
            'Previous history of PID',
            'IUD insertion (rarely and usually only at the time of insertion)'
        ],
        treatment: [
            'Antibiotics (oral or intravenous) to treat the infection',
            'Treatment for partners to prevent reinfection',
            'Pain management'
        ],
        prevention: 'Practicing safe sex, getting tested for STIs, avoiding douching, and seeking prompt treatment for any signs of infection.',
        imageUrl: 'https://images.unsplash.com/photo-1520281200388-348507204f14?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/std/pid/stdfact-pid.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Pelvic Inflammatory Disease (PID) Fact Sheet. 2022.</a>'
    },
    {
        name: 'Infertility',
        category: 'Reproductive Health Condition',
        symptoms: [
            'Inability to conceive after 1 year of unprotected intercourse (or 6 months if over 35)',
            'Irregular or absent menstrual cycles',
            'Painful or heavy periods',
            'Symptoms related to hormonal imbalance (e.g., hirsutism, acne)',
            'Recurrent pregnancy loss'
        ],
        causes: [
            'Ovulation disorders (PCOS, premature ovarian failure)',
            'Fallopian tube damage (due to PID, endometriosis)',
            'Uterine/Cervical factors (fibroids, polyps)',
            'Advanced maternal age',
            'Thyroid disorders',
            'Male factor infertility (accounts for 30-40% of cases)'
        ],
        treatment: [
            'Fertility drugs (e.g., Clomiphene, Gonadotropins)',
            'In Vitro Fertilization (IVF)',
            'Intrauterine Insemination (IUI)',
            'Surgery to correct uterine or tubal problems',
            'Lifestyle modifications'
        ],
        prevention: 'Maintaining a healthy weight, avoiding smoking/excessive alcohol, getting prompt STI treatment, and knowing your reproductive window.',
        imageUrl: 'https://images.unsplash.com/photo-1627883391216-56214309e3e7?w=900&q=80',
        citation: '<a href="https://www.acog.org/womens-health/faqs/infertility" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACOG. Infertility FAQ. 2023.</a>'
    },
    {
        name: 'Premenstrual Syndrome (PMS) & PMDD',
        category: 'Hormonal/Mood Disorder',
        symptoms: [
            'Mood swings, irritability, anxiety (PMDD is severe)',
            'Depression, feeling out of control (PMDD)',
            'Bloating and breast tenderness',
            'Fatigue and sleep problems',
            'Headaches and joint or muscle pain',
            'Food cravings and appetite changes',
            'Symptoms occur 1-2 weeks before period and stop after it starts'
        ],
        causes: [
            'Cyclic changes in hormones (Estrogen and Progesterone)',
            'Fluctuations in brain chemicals (Serotonin)',
            'Genetic predisposition',
            'Nutritional deficiencies (Calcium, Magnesium)'
        ],
        treatment: [
            'Lifestyle adjustments (diet, exercise, stress reduction)',
            'Nutritional supplements (Calcium, Vitamin B6)',
            'NSAIDs for pain and cramps',
            'Hormonal birth control pills',
            'Antidepressants (SSRIs) for PMDD symptoms'
        ],
        prevention: 'Regular aerobic exercise, stress management techniques, dietary changes (reducing salt, caffeine, sugar), and adequate sleep.',
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=900&q=80',
        citation: '<a href="https://www.hopkinsmedicine.org/health/conditions-and-diseases/premenstrual-dysphoric-disorder-pmdd" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Johns Hopkins Medicine. PMDD. 2024.</a>'
    },
    {
        name: 'Gestational Diabetes',
        category: 'Pregnancy Condition',
        symptoms: [
            'Usually asymptomatic, detected via routine screening',
            'Increased thirst',
            'Frequent urination',
            'Fatigue',
            'Blurred vision (rarely)'
        ],
        causes: [
            'Hormones from the placenta block the mother\'s insulin from working (insulin resistance)',
            'Pancreas cannot produce enough insulin to overcome the block',
            'Risk factors: Overweight/Obesity, family history of diabetes, age over 25'
        ],
        treatment: [
            'Special diet and physical activity',
            'Daily blood glucose monitoring',
            'Insulin injections or oral medication (Metformin)',
            'Closer monitoring of the fetus'
        ],
        prevention: 'Achieving a healthy weight before pregnancy, exercising before and during pregnancy, and eating a balanced diet.',
        imageUrl: 'https://images.unsplash.com/photo-1543336332-9457222474f1?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/diabetes/basics/gestational.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Gestational Diabetes Basics. 2023.</a>'
    },
    {
        name: 'Postpartum Depression (PPD)',
        category: 'Mental Health Condition',
        symptoms: [
            'Severe mood swings and excessive crying',
            'Difficulty bonding with the baby',
            'Withdrawing from family and friends',
            'Loss of appetite or eating much more than usual',
            'Severe anxiety and panic attacks',
            'Thoughts of harming yourself or the baby',
            'Occurs after childbirth, can start during pregnancy'
        ],
        causes: [
            'Dramatic drop in hormones (Estrogen and Progesterone) after birth',
            'Sleep deprivation and physical pain of childbirth',
            'Emotional stress, history of depression',
            'Lack of support system'
        ],
        treatment: [
            'Psychotherapy or counseling',
            'Antidepressant medication (SSRIs)',
            'Support groups',
            'Hormone therapy (in some cases)',
            'Prioritizing sleep and rest'
        ],
        prevention: 'Seeking early screening, having a strong support network, attending postpartum checkups, and maintaining open communication with healthcare providers.',
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=900&q=80',
        citation: '<a href="https://www.nimh.nih.gov/health/topics/postpartum-depression" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIMH. Postpartum Depression. 2023.</a>'
    },
    {
        name: 'Thyroid Disorders (Hypo/Hyper)',
        category: 'Hormonal Disorder',
        symptoms: [
            'Hypo: Fatigue, weight gain, depression, cold intolerance, dry skin, heavy periods',
            'Hyper: Weight loss, anxiety, rapid heartbeat, heat intolerance, light periods',
            'Lump in the neck (Goiter)',
            'Hair loss and muscle weakness',
            'Mood changes'
        ],
        causes: [
            'Autoimmune conditions (Hashimoto\'s - Hypo, Graves\' - Hyper)',
            'Iodine deficiency or excess',
            'Pregnancy and childbirth',
            'Thyroiditis (inflammation)',
            'Genetic factors'
        ],
        treatment: [
            'Hypothyroidism: Synthetic thyroid hormone (Levothyroxine)',
            'Hyperthyroidism: Anti-thyroid drugs, radioactive iodine, surgery',
            'Regular blood testing to monitor hormone levels'
        ],
        prevention: 'Ensure adequate iodine intake (but avoid excessive amounts), regular monitoring if you have a family history or other autoimmune disorders.',
        imageUrl: 'https://images.unsplash.com/photo-1627883391216-56214309e3e7?w=900&q=80',
        citation: '<a href="https://www.womenshealth.gov/a-z-topics/thyroid-disease" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Office on Women’s Health. Thyroid Disease. 2024.</a>'
    },
    {
        name: 'Osteoporosis',
        category: 'Bone Health Condition',
        symptoms: [
            'Often no symptoms until a bone fracture occurs',
            'Back pain, caused by a fractured or collapsed vertebra',
            'Loss of height over time',
            'A stooped posture (Kyphosis)',
            'Bones that break easily'
        ],
        causes: [
            'Decrease in estrogen levels after menopause (primary cause in women)',
            'Aging (bone density naturally decreases)',
            'Long-term corticosteroid use',
            'Thyroid issues and other hormonal problems',
            'Low calcium and Vitamin D intake'
        ],
        treatment: [
            'Bisphosphonates and other bone-building medications',
            'Hormone replacement therapy (HRT)',
            'Calcium and Vitamin D supplements',
            'Weight-bearing exercises'
        ],
        prevention: 'Adequate calcium and Vitamin D intake throughout life, regular weight-bearing exercise (walking, jogging), avoiding smoking, limiting alcohol.',
        imageUrl: 'https://images.unsplash.com/photo-1596766465011-893322d99d3d?w=900&q=80',
        citation: '<a href="https://www.bones.nih.gov/health-info/bone/osteoporosis/overview" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH. Osteoporosis Overview. 2023.</a>'
    },
    {
        name: 'Preeclampsia',
        category: 'Pregnancy Condition',
        symptoms: [
            'High blood pressure (hypertension) after 20 weeks of pregnancy',
            'Protein in the urine (proteinuria)',
            'Severe headaches and vision changes',
            'Upper abdominal pain (usually under the ribs on the right side)',
            'Nausea or vomiting',
            'Swelling in the face and hands'
        ],
        causes: [
            'Abnormal development and function of the placenta',
            'Genetic factors and inadequate blood flow to the uterus',
            'Autoimmune and vascular issues',
            'First pregnancy, history of high blood pressure, age >40'
        ],
        treatment: [
            'Delivery of the baby and placenta (the cure)',
            'Close monitoring (blood pressure, urine, blood tests)',
            'Medications to lower blood pressure and prevent seizures (Magnesium Sulfate)',
            'Bed rest (in some cases)'
        ],
        prevention: 'Low-dose aspirin starting in the second trimester (for high-risk women), adequate prenatal care, managing pre-existing hypertension or diabetes.',
        imageUrl: 'https://images.unsplash.com/photo-1543336332-9457222474f1?w=900&q=80',
        citation: '<a href="https://www.preeclampsia.org/about-preeclampsia/what-is-preeclampsia" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Preeclampsia Foundation. What is Preeclampsia? 2024.</a>'
    },
    {
        name: 'Vaginismus',
        category: 'Sexual Health Condition',
        symptoms: [
            'Involuntary muscle spasms of the pelvic floor muscles',
            'Painful intercourse (dyspareunia)',
            'Inability to tolerate a gynecological exam or tampon insertion',
            'Burning or stinging pain',
            'Fear or anxiety related to sexual penetration'
        ],
        causes: [
            'Fear of pain or penetration (psychological cause)',
            'Past sexual trauma or abuse',
            'Painful first intercourse',
            'Medical conditions (UTI, yeast infection, endometriosis, menopause)',
            'Emotional distress and anxiety'
        ],
        treatment: [
            'Pelvic floor physical therapy (PFPT)',
            'Vaginal dilator therapy (graduated sizes)',
            'Counseling or sex therapy',
            'Pain management and muscle relaxants (Botox, local anesthesia)',
            'Treating any underlying medical cause'
        ],
        prevention: 'Open communication, comprehensive sex education, addressing psychological factors early, and gentle progression during sexual activity or exams.',
        imageUrl: 'https://images.unsplash.com/photo-1579737151121-65476a213e45?w=900&q=80',
        citation: '<a href="https://www.acog.org/womens-health/faqs/vaginismus" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACOG. Vaginismus FAQ. 2023.</a>'
    },
    {
        name: 'Bacterial Vaginosis (BV)',
        category: 'Infection',
        symptoms: [
            'Thin, gray, white, or green vaginal discharge',
            'Strong, unpleasant "fishy" odor (especially after sex)',
            'Vaginal itching or burning',
            'Burning during urination (less common)'
        ],
        causes: [
            'Overgrowth of certain bacteria, disrupting the natural balance',
            'Douching or vaginal washing with harsh soaps',
            'Having new or multiple sex partners',
            'Naturally lacking in Lactobacillus bacteria',
            'Often confused with a yeast infection'
        ],
        treatment: [
            'Antibiotics (Metronidazole or Clindamycin) - oral or vaginal gel/cream',
            'Probiotics (Lactobacillus strains) to restore balance'
        ],
        prevention: 'Avoiding douching, limiting sex partners, using mild soap (if any) only on the outside of the vagina, and completing the full course of antibiotics if prescribed.',
        imageUrl: 'https://images.unsplash.com/photo-1627883441551-766b44a30e71?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/std/bv/stdfact-bacterial-vaginosis.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Bacterial Vaginosis (BV) Fact Sheet. 2022.</a>'
    },
    {
        name: 'Autoimmune Diseases',
        category: 'Immune System Disorder',
        symptoms: [
            'Lupus: Butterfly rash on face, joint pain, fatigue',
            'Rheumatoid Arthritis: Painful swollen joints, morning stiffness',
            'Thyroid Disease: Weight changes, fatigue, mood changes',
            'Multiple Sclerosis: Numbness, vision problems, weakness',
            'Type 1 Diabetes: Excessive thirst, frequent urination',
            'Inflammatory Bowel Disease: Abdominal pain, diarrhea',
            'Sjogren\'s Syndrome: Dry eyes and mouth',
            'General: Chronic fatigue, inflammation, organ-specific symptoms'
        ],
        causes: [
            'Immune system attacks body\'s own tissues',
            'Genetic predisposition',
            'Hormonal factors (estrogen influence)',
            'Environmental triggers',
            'X chromosome factors',
            'Infections or illnesses',
            'Unknown factors (ongoing research)'
        ],
        treatment: [
            'Disease-modifying medications',
            'Immunosuppressants to reduce immune response',
            'Anti-inflammatory drugs (NSAIDs, corticosteroids)',
            'Hormone replacement for thyroid disease',
            'Biologic therapies for targeted treatment',
            'Physical therapy and rehabilitation',
            'Lifestyle modifications and symptom management'
        ],
        prevention: '75% of autoimmune disease cases occur in women. Women with lupus should undergo periodic thyroid monitoring. Prevention: no proven prevention, but early diagnosis and treatment prevent complications. Regular monitoring crucial for women with family history.',
        imageUrl: 'https://images.unsplash.com/photo-1520281200388-348507204f14?w=900&q=80',
        citation: '<a href="https://www.hss.edu/health-library/conditions-and-treatments/lupus-autoimmune-thyroid-diseases-top-10-series" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Hospital for Special Surgery. Lupus and Autoimmune Thyroid Diseases. 2025.</a> | <a href="https://www.frontiersin.org/journals/endocrinology/articles/10.3389/fendo.2017.00138/full" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Ferrari SM, et al. Systemic Lupus Erythematosus and Thyroid Autoimmunity. Front Endocrinol. 2017.</a>'
    }
];

const hi_diseases = [
{
    name: 'पॉलीसिस्टिक ओवरी सिंड्रोम (PCOS)',
    category: 'हॉर्मोनल विकार',
    symptoms: [
    'अनियमित या मिस्ड पीरियड्स',
    'चेहरे और शरीर पर अधिक बाल (हिरसुटिज्म)',
    'मुँहासे और तैलीय त्वचा',
    'वजन बढ़ना या वजन कम करने में कठिनाई',
    'स्कैल्प पर बाल पतले होना',
    'त्वचा पर काले धब्बे (इंसुलिन रेजिस्टेंस)',
    'गर्भवती होने में कठिनाई'
    ],
    causes: [
    'इंसुलिन प्रतिरोध और उच्च इंसुलिन स्तर',
    'हॉर्मोनल असंतुलन (अधिक एंड्रोजन)',
    'कम ग्रेड की सूजन',
    'आनुवांशिक कारक और पारिवारिक इतिहास'
    ],
    treatment: [
    'पीरियड्स रेगुलेट करने के लिए गर्भनिरोधक गोलियां',
    'इंसुलिन रेजिस्टेंस के लिए मेटफॉर्मिन',
    'लाइफस्टाइल परिवर्तन (डाइट और व्यायाम)',
    'फर्टिलिटी के लिए क्लोमिफीन',
    'हिरसुटिज्म के लिए बाल हटाने का उपचार',
    'वजन प्रबंधन कार्यक्रम'
    ],
    prevention: 'स्वस्थ वजन बनाए रखें, नियमित व्यायाम करें, कम रिफाइंड कार्बोहाइड्रेट वाला संतुलित आहार, तनाव प्रबंधन।',
    imageUrl: 'https://images.unsplash.com/photo-1596766465011-893322d99d3d?w=900&q=80',
    citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Polycystic ovary syndrome. 2025.</a> | <a href="https://www.mayoclinic.org/diseases-conditions/PCOS/symptoms-causes/syc-20353439" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. PCOS Symptoms & Causes. 2022.</a>'
    },
    {
    name: 'एंडोमेट्रियोसिस',
    category: 'ऊतक विकार',
    symptoms: [
    'दर्दनाक माहवारी (डिसमेनोरिया)',
    'पुरानी पेल्विक दर्द, अक्सर पीरियड्स के दौरान बढ़ जाती है',
    'दर्दनाक संभोग (डिस्पारेयूनिया)',
    'मलत्याग या पेशाब में दर्द',
    'अत्यधिक रक्तस्राव',
    'बांझपन या गर्भवती होने में कठिनाई',
    'थकान, मतली, फुलाव'
    ],
    causes: [
    'रिट्रोग्रेड माहवारी (माहवारी का खून पेल्विस में वापस जाना)',
    'इंडक्शन थ्योरी (गैर-गर्भाशय कोशिकाएं एंडोमेट्रियल सेल्स में बदल जाती हैं)',
    'भ्रूण कोशिका रूपांतरण',
    'सर्जरी के निशान पर आ जाना',
    'इम्यून डिसऑर्डर'
    ],
    treatment: [
    'दर्द की दवा (NSAIDs)',
    'हॉर्मोन थैरेपी (गर्भनिरोधक, GnRH एगोनिस्ट)',
    'लेप्रोस्कोपिक सर्जरी से ऊतक हटाना',
    'गंभीर मामलों में हिस्टेरेक्टॉमी',
    'लक्षण प्रबंधन के लिए एक्यूपंक्चर और आहार में बदलाव'
    ],
    prevention: 'सिद्ध रोकथाम नहीं। जल्द निदान और प्रबंधन ज़रूरी है।',
    imageUrl: 'https://images.unsplash.com/photo-1579737151121-65476a213e45?w=900&q=80',
    citation: '<a href="https://www.mayoclinic.org/diseases-conditions/endometriosis/symptoms-causes/syc-20354656" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Endometriosis Overview. 2023.</a>'
    },
    {
    name: 'गर्भाशय फाइब्रॉइड्स (लाईयोमायोमा)',
    category: 'सौम्य ट्यूमर',
    symptoms: [
    'अत्यधिक माहवारी रक्तस्राव',
    'लंबी अवधि तक पीरियड्स (एक हफ्ते से ज्यादा)',
    'पेल्विक दबाव या दर्द',
    'बार-बार पेशाब आना',
    'कब्ज और पीठ में दर्द',
    'मूत्राशय पूरी तरह खाली करने में कठिनाई',
    'ब्लड लॉस के कारण एनीमिया'
    ],
    causes: [
    'मांसपेशी कोशिकाओं में आनुवांशिक बदलाव',
    'हॉर्मोनल कारक (एस्ट्रोजन और प्रोजेस्टेरोन)',
    'अतिरिक्त सेल्यूलर मैट्रिक्स का संचय',
    'पारिवारिक इतिहास'
    ],
    treatment: [
    'ब्लीडिंग नियंत्रिण के लिए दवा (GnRH एगोनिस्ट, IUD)',
    'गैर-इंवेसिव प्रक्रिया (फोकस्ड अल्ट्रासाउंड सर्जरी)',
    'मिनिमल-इंवेसिव प्रक्रिया (गर्भाशय आर्टरी एंबोलाइजेशन)',
    'सर्जरी (मायोमेक्टॉमी, हिस्टेरेक्टॉमी)',
    'एनीमिया के लिए आयरन सप्लीमेंट'
    ],
    prevention: 'स्वस्थ वजन बनाए रखें, नियमित व्यायाम करें, फल-सब्जियों वाला आहार अपनाएँ।',
    imageUrl: 'https://images.unsplash.com/photo-1520281200388-348507204f14?w=900&q=80',
    citation: '<a href="https://www.womenshealth.gov/a-z-topics/uterine-fibroids" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Office on Women’s Health. Uterine Fibroids. 2024.</a>'
    },
    {
    name: 'स्तन कैंसर',
    category: 'ऑन्कोलॉजिकल स्थिति',
    symptoms: [
    'स्तन या बगल में गाँठ या मोटाई',
    'स्तन के आकार या रूप में बदलाव',
    'स्तन की त्वचा में डिंपलिंग या जलन',
    'निप्पल एवं स्तन क्षेत्र में लालिमा या झड़ना',
    'निप्पल से अत्यधिक डिस्चार्ज',
    'निप्पल अंदर जाना',
    'स्तन या निप्पल में दर्द'
    ],
    causes: [
    'जेनेटिक बदलाव (BRCA1 और BRCA2)',
    'आयु (उम्र के साथ जोखिम बढ़ना)',
    'परिवार में स्तन कैंसर का इतिहास',
    'मोटापा और शारीरिक क्रियाकलाप की कमी',
    'शराब का सेवन',
    'रेडिएशन का एक्सपोजर',
    'हॉर्मोन रिप्लेसमेंट थैरेपी'
    ],
    treatment: [
    'सर्जरी (लंपेक्टॉमी या मास्टेक्टॉमी)',
    'कीमोथैरेपी',
    'रेडिएशन थैरेपी',
    'हॉर्मोन थैरेपी (टैमोक्सीफेन)',
    'लक्षित दवा चिकित्सा',
    'इम्यूनोथैरेपी'
    ],
    prevention: 'नियमित स्व-जांच, क्लिनिकल जांच, मैमोग्राम, स्वस्थ वजन, शराब सीमित, स्तनपान और एक्सरसाइज़।',
    imageUrl: 'https://images.unsplash.com/photo-1627883391216-56214309e3e7?w=900&q=80',
    citation: '<a href="https://www.cdc.gov/cancer/breast/basic_info/prevention.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Breast Cancer Prevention. 2023.</a>'
    },
    {
    name: 'गर्भाशय ग्रीवा कैंसर',
    category: 'ऑन्कोलॉजिकल स्थिति',
    symptoms: [
    'असामान्य योनि रक्तस्राव (संभोग के बाद, पीरियड्स के बीच)',
    'पेल्विक या संभोग के दौरान दर्द',
    'पानी जैसा, खूनी या गंधयुक्त डिस्चार्ज',
    'पेशाब में दर्द (अंतिम अवस्था)',
    'पैरों में सूजन (अंतिम अवस्था)',
    'वजन कम होना और थकान (अंतिम अवस्था)'
    ],
    causes: [
    'एचपीवी संक्रमण (मुख्य कारण)',
    'कई यौन साथी',
    'जल्दी यौन सक्रियता',
    'धूम्रपान',
    'कमजोर इम्यून सिस्टम',
    'लंबे समय तक ओरल कॉन्ट्रासेप्टिव्स'
    ],
    treatment: [
    'सर्जरी (हिस्टेरेक्टॉमी, कोनाइजेशन)',
    'रेडिएशन थैरेपी',
    'कीमोथैरेपी',
    'लक्षित दवा चिकित्सा (जटिल मामलों के लिए)'
    ],
    prevention: 'एचपीवी का टीका (9-26 वर्ष), नियमित पैप टेस्ट, सुरक्षित सेक्स करें, धूम्रपान न करें।',
    imageUrl: 'https://images.unsplash.com/photo-1627883441551-766b44a30e71?w=900&q=80',
    citation: '<a href="https://www.who.int/news-room/fact-sheets/detail/cervical-cancer" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">WHO. Cervical Cancer Key Facts. 2024.</a>'
    },
    {
        name: 'मेनोपॉज़ और पेरिमेनोपॉज़',
        category: 'जीवन चरण/हॉर्मोनल बदलाव',
        symptoms: [
        'हॉट फ्लैशेस और रात में पसीना',
        'अनियमित पीरियड्स (पेरिमेनोपॉज़)',
        'योनि में सूखापन और संभोग में दर्द',
        'मूड परिवर्तन (चिड़चिड़ापन, डिप्रेशन)',
        'नींद संबंधी समस्याएँ (अनिद्रा)',
        'बाल पतले होना और त्वचा सूखना',
        'कामेच्छा में कमी'
        ],
        causes: [
        'प्रजनन हार्मोन (एस्ट्रोजन और प्रोजेस्टेरोन) में गिरावट',
        'उम्र बढ़ना (आमतौर पर 40-50 साल)',
        'हिस्टेरेक्टमी या ओफोरेक्टमी (डिम्ब ग्रंथि हटाना)',
        'कीमोथैरेपी या रेडिएशन थैरेपी'
        ],
        treatment: [
        'हार्मोन रिप्लेसमेंट थैरेपी (HRT)',
        'लाइफ़स्टाइल बदलाव (आहार, व्यायाम, तनाव कम करना)',
        'गैर-हॉर्मोनल दवा (SSRI) हॉट फ्लैशेस के लिए',
        'सूखापन के लिए योनि एस्ट्रोजन क्रीम',
        'माइंडफुलनेस और CBT'
        ],
        prevention: 'रोकथाम संभव नहीं। प्रबंधन फोकस—लक्षणों में राहत और ऑस्टियोपोरोसिस/दिल की बीमारी को रोकना।',
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=900&q=80',
        citation: '<a href="https://www.nia.nih.gov/health/menopause/menopause-and-perimenopause" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">National Institute on Aging. Menopause Information. 2023.</a>'
        },
        {
        name: 'योनि यीस्ट संक्रमण (कैंडिडायसिस)',
        category: 'संक्रमण',
        symptoms: [
        'योनि और वुल्वा में खुजली और जलन',
        'संभोग या पेशाब में जलन',
        'वुल्वा की लालिमा व सूजन',
        'मोटा, सफेद, दुर्गंध रहित डिस्चार्ज (कॉटेज चीज़ जैसा)',
        'योनि में दर्द और तकलीफ'
        ],
        causes: [
        'कैंडिडा एल्बिकन्स फंगस का अत्यधिक वृद्धि',
        'एंटीबायोटिक्स का उपयोग',
        'गर्भावस्था और अनियंत्रित डायबिटीज',
        'कमजोर इम्यून सिस्टम',
        'हार्मोन बदलाव (मासिक धर्म के नजदीक)'
        ],
        treatment: [
        'ओवर-द-काउंटर एंटीफंगल क्रीम, मलहम, या सपोसिटरी',
        'गंभीर मामलों में ओरल एंटीफंगल दवा (फ्लुकोनाजोल)',
        'जिद्दी संक्रमण के लिए बोरिक एसिड कैप्सूल'
        ],
        prevention: 'सूती अंडरवियर, तंग कपड़ों से बचें, डौचिंग ना करें, गीले कपड़े तुरंत बदलें, डायबिटीज में ब्लड शुगर नियंत्रण।',
        imageUrl: 'https://images.unsplash.com/photo-1543336332-9457222474f1?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/fungal/diseases/candidiasis/genital/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Genital Candidiasis. 2023.</a>'
        },
        {
        name: 'मूत्र मार्ग संक्रमण (UTI)',
        category: 'संक्रमण',
        symptoms: [
        'पेशाब करने की तीव्र, बार-बार इच्छा',
        'पेशाब करते समय जलन (डिस्यूरिया)',
        'बार-बार, कम मात्रा में पेशाब आना',
        'धुंधला, गहरा, या गंधयुक्त पेशाब',
        'महिलाओं में पेल्विक दर्द',
        'पेशाब में खून आना'
        ],
        causes: [
        'बैक्टीरिया (अधिकतर E. coli) का पेशाब मार्ग में पहुंचना',
        'यौन गतिविधि',
        'टॉयलेट के बाद अगला-पिछला पोंछना',
        'निश्चित गर्भनिरोधक (डायाफ्राम)',
        'मेनोपॉज़ (एस्ट्रोजन में गिरावट)'
        ],
        treatment: [
        'एंटीबायोटिक्स',
        'दर्द राहत के लिए फेनाजोपाइरिडीन',
        'तरल पदार्थ अधिक लें'
        ],
        prevention: 'अगला-पिछला दिशा में पोंछना, अधिक पानी पीना, संभोग के बाद पेशाब करना, उत्तेजक उत्पादों से बचना, मेनोपॉज़ के बाद टॉपिकल एस्ट्रोजन।',
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=900&q=80',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/urinary-tract-infection/symptoms-causes/syc-20353447" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. UTI Overview. 2022.</a>'
        },
        {
        name: 'अंडाशय सिस्ट',
        category: 'तरल से भरी थैली',
        symptoms: [
        'अधिकांश बिना लक्षण के और स्वयं ठीक हो जाते हैं',
        'पेल्विक दर्द (हल्का या तेज)',
        'पेट में भारीपन या फुलाव',
        'फुलाव',
        'संभोग के दौरान दर्द',
        'सिस्ट फटने या टॉर्शन का अचानक तेज दर्द',
        'बार-बार पेशाब की इच्छा'
        ],
        causes: [
        'सामान्य माहवारी चक्र की प्रक्रिया (फॉलिक्यूलर और कॉर्पस ल्यूटियम सिस्ट)',
        'एंडोमेट्रियोसिस',
        'पीसीओएस (अनेक छोटे सिस्ट)',
        'गंभीर पेल्विक संक्रमण'
        ],
        treatment: [
        'छोटे, साधारण सिस्ट के लिए निगरानी',
        'नए सिस्ट रोकने के लिए गर्भनिरोधक गोलियां',
        'बड़े सिस्ट के लिए लैप्रोस्कोपी',
        'टॉर्शन या फटने की स्थिति में इमर्जेंसी सर्जरी'
        ],
        prevention: 'प्रवृत्त महिलाओं में गर्भनिरोधक गोलियाँ नए सिस्ट की संभावना कम करती हैं।',
        imageUrl: 'https://images.unsplash.com/photo-1579737151121-65476a213e45?w=900&q=80',
        citation: '<a href="https://my.clevelandclinic.org/health/diseases/17435-ovarian-cysts" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Cleveland Clinic. Ovarian Cysts. 2024.</a>'
        },
        {
        name: 'पेल्विक इंफ्लेमेटरी डिजीज (PID)',
        category: 'संक्रमण',
        symptoms: [
        'निचले पेट व पेल्विस में दर्द',
        'भारी या दुर्गंधयुक्त डिस्चार्ज',
        'बुखार, कपकपी',
        'संभोग के दौरान दर्द',
        'पेशाब में दर्द या कठिनाई',
        'अनियमित ब्लीडिंग'
        ],
        causes: [
        'अनरक्षित यौन रोग (क्लैमिडिया, गोनोरिया)',
        'डौचिंग',
        'PID का अतीत',
        'IUD का लगना (बहुत कम)'
        ],
        treatment: [
        'संक्रमण को ठीक करने के लिए एंटीबायोटिक्स',
        'रिइंफेक्शन रोकने के लिए पार्टनर का ट्रीटमेंट',
        'दर्द प्रबंधन'
        ],
        prevention: 'सुरक्षित सेक्स, STI जांच, डौचिंग से बचाव, संक्रमण के संकेत पर तुरंत इलाज।',
        imageUrl: 'https://images.unsplash.com/photo-1520281200388-348507204f14?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/std/pid/stdfact-pid.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Pelvic Inflammatory Disease (PID) Fact Sheet. 2022.</a>'
        },
        {
        name: 'बांझपन',
        category: 'प्रजनन स्वास्थ्य स्थिति',
        symptoms: [
        '1 वर्ष असुरक्षित संभोग के बाद गर्भ न ठहरना (35 से ऊपर 6 माह)',
        'अनियमित या अनुपस्थित माहवारी',
        'दर्दनाक या भारी माहवारी',
        'हॉर्मोन असंतुलन के लक्षण (हिरसुटिज्म, मुँहासे)',
        'आवर्ती गर्भपात'
        ],
        causes: [
        'ओव्यूलेशन विकार (PCOS, जल्दी ओवरी फेल)',
        'फैलोपियन ट्यूब डैमेज (PID, एंडोमेट्रियोसिस)',
        'गर्भाशय/ग्रीवा समस्या (फाइब्रॉइड, पॉलीप्स)',
        '30-40% पुरुष बांझपन',
        'थायरॉयड रोग'
        ],
        treatment: [
        'फर्टिलिटी ड्रग्स (क्लोमिफीन, गोनाडोट्रॉपिन्स)',
        'इन-विट्रो फर्टिलाइजेशन (IVF)',
        'इन्ट्रायूटेरिन इनसीमिनेशन (IUI)',
        'यूटरस या ट्यूब संबंधी समस्या के लिए सर्जरी',
        'लाइफस्टाइल परिवर्तन'
        ],
        prevention: 'स्वस्थ वजन, धूम्रपान/अत्यधिक शराब से बचना, समय पर STI इलाज, प्रजनन विंडो की जानकारी।',
        imageUrl: 'https://images.unsplash.com/photo-1627883391216-56214309e3e7?w=900&q=80',
        citation: '<a href="https://www.acog.org/womens-health/faqs/infertility" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACOG. Infertility FAQ. 2023.</a>'
        },
        {
        name: 'पूर्व मासिक धर्म सिंड्रोम (PMS) और PMDD',
        category: 'हॉर्मोनल/मूड विकार',
        symptoms: [
        'मूड बदलाव, चिड़चिड़ापन, चिंता (PMDD गंभीर अवसाद)',
        'डिप्रेशन, नियंत्रण खोना (PMDD)',
        'फुलाव और स्तनों में दर्द',
        'थकान, नींद में परेशानी',
        'सरदर्द/जोड़-मांसपेशी में दर्द',
        'खाने की तीव्र इच्छा, भूख में बदलाव',
        'लक्षण पीरियड से 1-2 सप्ताह पूर्व आते हैं और पीरियड शुरू होते ही खत्म हो जाते हैं'
        ],
        causes: [
        'हार्मोन में चक्रीय उतार-चढ़ाव',
        'सेरोटोनिन में बदलाव',
        'आनुवांशिक प्रवृत्ति',
        'पोषक तत्वों की कमी (कैल्शियम, मैग्नीशियम)'
        ],
        treatment: [
        'लाइफस्टाइल परिवर्तन (डाइट, व्यायाम, तनाव प्रबंधन)',
        'पोषक तत्व सप्लीमेंट',
        'दर्द के लिए NSAIDs',
        'हॉर्मोनल गर्भनिरोधक टैबलेट्स',
        'PMDD में एंटीडिप्रेसेंट्स (SSRIs)'
        ],
        prevention: 'नियमित व्यायाम, तनाव प्रबंधन, आहार संयम (कम नमक, कैफीन, चीनी), पर्याप्त नींद।',
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=900&q=80',
        citation: '<a href="https://www.hopkinsmedicine.org/health/conditions-and-diseases/premenstrual-dysphoric-disorder-pmdd" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Johns Hopkins Medicine. PMDD. 2024.</a>'
        },
        {
        name: 'गर्भकालीन डायबिटीज',
        category: 'गर्भावस्था स्थिति',
        symptoms: [
        'अधिकांश मामलों में कोई लक्षण नहीं',
        'प्यास बढ़ना',
        'बार-बार पेशाब आना',
        'थकान',
        'दृष्टि धुंधलाना (कभी-कभी)'
        ],
        causes: [
        'प्लेसेंटा के हार्मोन मां के इंसुलिन को रोकते हैं (इंसुलिन रेजिस्टेंस)',
        'पैंक्रियास पर्याप्त इंसुलिन नहीं उत्पन्न करता',
        'जोखिम: अधिक वजन, डायबिटीज का पारिवारिक इतिहास, उम्र >25'
        ],
        treatment: [
        'विशेष आहार और शारीरिक गतिविधि',
        'रोजाना रक्त शर्करा मापन',
        'इंसुलिन इंजेक्शन या ओरल दवा',
        'फीटस की निगरानी बढ़ाना'
        ],
        prevention: 'गर्भावस्था से पहले स्वस्थ वजन, व्यायाम और संतुलित आहार।',
        imageUrl: 'https://images.unsplash.com/photo-1543336332-9457222474f1?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/diabetes/basics/gestational.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Gestational Diabetes Basics. 2023.</a>'
        },
        {
        name: 'पोस्टपार्टम डिप्रेशन (PPD)',
        category: 'मानसिक स्वास्थ्य स्थिति',
        symptoms: [
        'गंभीर मूड बदलाव, अत्यधिक रोना',
        'बच्चे से जुड़ाव में कठिनाई',
        'परिवार या मित्रों से दूरी बनाना',
        'भूख या तो कम होना या बहुत अधिक लगना',
        'गंभीर चिंता या घबराहट के दौरे',
        'अपने या बच्चे को नुकसान पहुँचाने का विचार आना',
        'डिलीवरी के बाद प्रसवोत्तर समय में (कभी-कभी गर्भावस्था में शुरू)'
        ],
        causes: [
        'बर्थ के बाद हार्मोन में भारी गिरावट',
        'नींद की कमी और प्रसव का दर्द',
        'भावनात्मक तनाव, डिप्रेशन का इतिहास',
        'सपोर्ट सिस्टम की कमी'
        ],
        treatment: [
        'साइटोथेरेपी या काउंसलिंग',
        'एंटीडिप्रेसेंट दवाएं (SSRIs)',
        'सपोर्ट ग्रुप्स',
        'कुछ मामलों में हार्मोन थेरेपी',
        'नींद और आराम को प्राथमिकता देना'
        ],
        prevention: 'प्रारंभिक जांच, मजबूत सपोर्ट नेटवर्क, चेकअप्स, हेल्थ प्रोवाइडर से संवाद।',
        imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=900&q=80',
        citation: '<a href="https://www.nimh.nih.gov/health/topics/postpartum-depression" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIMH. Postpartum Depression. 2023.</a>'
        },
        {
        name: 'थायरॉयड विकार (हाइपो/हाइपर)',
        category: 'हॉर्मोनल विकार',
        symptoms: [
        'हाइपो: थकान, वजन बढ़ना, डिप्रेशन, ठंड सहन न कर पाना, सूखी त्वचा, भारी पीरियड्स',
        'हाइपर: वजन कम होना, चिंता, तेज़ धड़कन, गर्मी सहन न कर पाना, हल्की पीरियड्स',
        'गर्दन में गांठ (गॉयटर)',
        'बाल झड़ना और मांसपेशी कमजोरी',
        'मूड में बदलाव'
        ],
        causes: [
        'ऑटोइम्यून स्थितियाँ (हाशिमोटो-हाइपो, ग्रेव्स-हाइपर)',
        'आयोडीन की कमी या अधिकता',
        'गर्भावस्था व प्रसव',
        'थायराइडिटिस (सूजन)',
        'आनुवांशिक कारक'
        ],
        treatment: [
        'हाइपोथायरॉयडिज्म: सिंथेटिक थायरॉयड हार्मोन (लेवोथायरोक्सिन)',
        'हाइपरथायरॉयडिज्म: एंटी-थायरॉयड दवाएं, रेडियोएक्टिव आयोडीन, सर्जरी',
        'नियमित रक्त जांच'
        ],
        prevention: 'उचित आयोडीन का सेवन, पारिवारिक या ऑटोइम्यून इतिहास में नियमित जाँच।',
        imageUrl: 'https://images.unsplash.com/photo-1627883391216-56214309e3e7?w=900&q=80',
        citation: '<a href="https://www.womenshealth.gov/a-z-topics/thyroid-disease" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Office on Women’s Health. Thyroid Disease. 2024.</a>'
        },
        {
        name: 'ऑस्टियोपोरोसिस',
        category: 'हड्डी स्वास्थ्य स्थिति',
        symptoms: [
        'हड्डी टूटने तक कोई लक्षण नहीं',
        'पीठ दर्द (वर्टेब्रा की फ्रैक्चर/गिरावट द्वारा)',
        'समय के साथ कद का कम होना',
        'झुका हुआ पोस्चर (कायफोसिस)',
        'हड्डियों का आसानी से टूटना'
        ],
        causes: [
        'मेनोपॉज़ के बाद एस्ट्रोजन की कमी',
        'बुढ़ापा',
        'लंबे समय तक स्टेरॉयड का उपयोग',
        'थायरॉयड व अन्य हार्मोन समस्याएं',
        'कम कैल्शियम और विटामिन डी'
        ],
        treatment: [
        'बिसफॉस्फोनेट/हड्डी बनाने की अन्य दवाएं',
        'हार्मोन रिप्लेसमेंट थैरेपी',
        'कैल्शियम व विटामिन डी सप्लीमेंट',
        'वेट-बियरिंग एक्सरसाइज'
        ],
        prevention: 'जीवनभर पर्याप्त कैल्शियम व विटामिन डी लें, नियमित व्यायाम करें, धूम्रपान/अल्कोहल से बचें।',
        imageUrl: 'https://images.unsplash.com/photo-1596766465011-893322d99d3d?w=900&q=80',
        citation: '<a href="https://www.bones.nih.gov/health-info/bone/osteoporosis/overview" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">NIH. Osteoporosis Overview. 2023.</a>'
        },
        {
        name: 'प्रीएक्लेम्पसिया',
        category: 'गर्भावस्था स्थिति',
        symptoms: [
        'गर्भावस्था के 20 सप्ताह बाद उच्च ब्लड प्रेशर',
        'मूत्र में प्रोटीन',
        'तीव्र सिरदर्द व दृष्टि में बदलाव',
        'ऊपरी पेट में दर्द (दाईं ओर)',
        'मतली या उल्टी',
        'चेहरे व हाथों में सूजन'
        ],
        causes: [
        'प्लेसेंटा का असामान्य विकास व फंक्शन',
        'आनुवांशिक/रक्त प्रवाह संबंधी समस्या',
        'ऑटोइम्यून व वेस्कुलर समस्याएँ',
        'पहली बार गर्भावस्था, हाइपरटेंशन का इतिहास, उम्र >40'
        ],
        treatment: [
        'बच्चे और प्लेसेंटा की डिलीवरी (इलाज)',
        'नज़दीकी निगरानी (BP, यूरीन, जांचें)',
        'ब्लड प्रेशर व दौरे रोकने की दवाएं (MgSO4)',
        'कुछ मामलों में बेड रेस्ट'
        ],
        prevention: 'लो-डोज़ एस्पिरिन (जोखिम वालों में), पूरी प्रीनेटल केयर, हाई BP/डायबिटीज का प्रबंधन।',
        imageUrl: 'https://images.unsplash.com/photo-1543336332-9457222474f1?w=900&q=80',
        citation: '<a href="https://www.preeclampsia.org/about-preeclampsia/what-is-preeclampsia" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Preeclampsia Foundation. What is Preeclampsia? 2024.</a>'
        },
        {
        name: 'वेजिनिस्मस',
        category: 'यौन स्वास्थ्य स्थिति',
        symptoms: [
        'पेल्विक फ्लोर मांसपेशियों की अनैच्छिक ऐंठन',
        'संभोग के दौरान दर्द',
        'गाइनेकोलॉजिकल चेकअप या टैम्पॉन डालने में असमर्थता',
        'जलन या चुभन',
        'संभोग को लेकर डर या चिंता'
        ],
        causes: [
        'दर्द या पेनिट्रेशन का डर (मनोवैज्ञानिक कारण)',
        'यौन आघात या दुर्व्यवहार का इतिहास',
        'प्रथम संभोग में दर्द',
        'मेडिकल कंडीशन (UTI, यीस्ट, एंडोमेट्रियोसिस, मेनोपॉज़)',
        'मन:स्थिति संबंधी तनाव/चिंता'
        ],
        treatment: [
        'पेल्विक फ्लोर फिजिकल थैरेपी',
        'वैजिनल डाइलेटर थेरेपी',
        'काउंसलिंग या सेक्स थेरेपी',
        'दर्द प्रबंधन, मसल रिलैक्सेंट्स',
        'कोई भी मूल कारण का इलाज'
        ],
        prevention: 'खुला संवाद, संपूर्ण सेक्स शिक्षा, मनोवैज्ञानिक कारकों का तुरंत समाधान, धीरे-धीरे प्रगति करें।',
        imageUrl: 'https://images.unsplash.com/photo-1579737151121-65476a213e45?w=900&q=80',
        citation: '<a href="https://www.acog.org/womens-health/faqs/vaginismus" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACOG. Vaginismus FAQ. 2023.</a>'
        },
        {
        name: 'बैक्टीरियल वेजिनोसिस (BV)',
        category: 'संक्रमण',
        symptoms: [
        'पतला, ग्रे, सफेद या हरा डिस्चार्ज',
        'तेज, अप्रिय "मछली" गंध (सेक्स के बाद खास)',
        'योनि में खुजली/जलन',
        'पेशाब करते समय जलन (कम आम)'
        ],
        causes: [
        'विशिष्ट बैक्टीरिया वृद्धि, प्राकृतिक बैलेंस बिगड़ना',
        'डौचिंग या कठोर साबुन से धोना',
        'कई या नए यौन साथी',
        'लैक्टोबैसिलस का कमी',
        'अक्सर यीस्ट से भ्रमित'
        ],
        treatment: [
        'एंटीबायोटिक्स (मेट्रोनिडाजोल/क्लिंडामाइसिन), ओरल या जैल/क्रीम',
        'प्रोबायोटिक्स बैलेंस पुनर्स्थापित करने हेतु'
        ],
        prevention: 'डौचिंग से बचें, साझेदार सीमित रखें, हल्का साबुन उपयोग करें, एंटीबायोटिक्स का कोर्स पूरा करें।',
        imageUrl: 'https://images.unsplash.com/photo-1627883441551-766b44a30e71?w=900&q=80',
        citation: '<a href="https://www.cdc.gov/std/bv/stdfact-bacterial-vaginosis.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Bacterial Vaginosis (BV) Fact Sheet. 2022.</a>'
        },
        {
        name: 'ऑटोइम्यून रोग',
        category: 'इम्यून सिस्टम विकार',
        symptoms: [
        'ल्युपस: चेहरे पर तितली जैसा निशान, जोड़ दर्द, थकान',
        'रूमेटॉइड आर्थराइटिस: दर्द, सूजे जोड़, सुबह stiffness',
        'थायरॉयड रोग: वजन, थकान, मूड बदलाव',
        'मल्टीपल स्क्लेरोसिस: सुन्नता, दृष्टि समस्याएँ, कमजोरी',
        'टाइप 1 डायबिटीज़: अधिक प्यास, बार-बार पेशाब',
        'इंफ्लेमेटरी बाउल डिजीज: पेट दर्द, दस्त',
        'स्जोग्रेन सिंड्रोम: आँख/मुँह में सूखापन',
        'सामान्य: लंबे समय तक थकान, सूजन, अंग-विशिष्ट लक्षण'
        ],
        causes: [
        'इम्यून सिस्टम शरीर की अपनी ऊतकों पर हमला करता है',
        'आनुवांशिक प्रवृत्ति',
        'हॉर्मोनल (एस्ट्रोजन प्रभाव)',
        'पर्यावरणीय कारण',
        'X क्रोमोसोम कारक',
        'संक्रमण या बीमारी',
        'अज्ञात कारक (रिसर्च जारी)'
        ],
        treatment: [
        'डिजीज-मॉडिफाईंग दवाएं',
        'इम्यूनोसप्रेसेंट्स',
        'एंटी-इंफ्लेमेटरी (NSAIDs, कॉर्टिकोस्टेरॉयड)',
        'थायरॉयड के लिए हार्मोन रिप्लेसमेंट',
        'लक्षित बायोलॉजिक थैरेपी',
        'फिजिकल थेरेपी और पुनर्वास',
        'लाइफस्टाइल/लक्षण प्रबंधन'
        ],
        prevention: '75% ऑटोइम्यून मामलों में महिलाएं। ल्युपस वाली महिलाएं नियमित थायरॉयड मॉनिटर करें। शुरुआती निदान और उपचार जटिलताओं को रोकता है।',
        imageUrl: 'https://images.unsplash.com/photo-1520281200388-348507204f14?w=900&q=80',
        citation: '<a href="https://www.hss.edu/health-library/conditions-and-treatments/lupus-autoimmune-thyroid-diseases-top-10-series" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Hospital for Special Surgery. Lupus and Autoimmune Thyroid Diseases. 2025.</a> | <a href="https://www.frontiersin.org/journals/endocrinology/articles/10.3389/fendo.2017.00138/full" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Ferrari SM, et al. Systemic Lupus Erythematosus and Thyroid Autoimmunity. Front Endocrinol. 2017.</a>'
        }
    ];

let currentDiseases = diseases;


const doctorsData = {
    'Delhi': [
        {
            name: 'Dr. Kavita Gupta',
            image: '',
            credentials: 'MBBS, DGO, FRCOG',
            experience: '18+ Years Experience',
            hospital: 'Gupta Maternity & Gynecology Center',
            address: '56 Connaught Place, New Delhi - 110001',
            phone: '+91 11 5678 9012',
            email: 'care@guptacenter.com',
            hours: 'Mon-Sat 8AM-8PM',
            specializations: 'Maternal-Fetal Medicine, Fibroid Treatment, Menopause Management',
            bookingLink: 'https://www.practo.com',
            rating: '4.8/5 (256 reviews)'
        },
        {
            name: 'Dr. Sunita Malhotra',
            image: '',
            credentials: 'MD, MS (OB/GYN)',
            experience: '25+ Years Experience',
            hospital: 'Apollo Indraprastha Hospital',
            address: 'Sarita Vihar, Delhi Mathura Road, New Delhi - 110076',
            phone: '+91 11 2692 5858',
            email: 's.malhotra@apollohospitals.com',
            hours: 'Mon-Fri 10AM-5PM',
            specializations: 'High-Risk Pregnancy, Endometriosis Surgery, PCOS Management',
            bookingLink: 'https://www.apollohospitals.com',
            rating: '4.9/5 (410 reviews)'
        },
        {
            name: 'Dr. Priya Sharma',
            image: '',
            credentials: 'MBBS, DNB (OBG)',
            experience: '12+ Years Experience',
            hospital: 'Max Hospital Saket',
            address: '1-2, Press Enclave Road, Saket, New Delhi - 110017',
            phone: '+91 11 4055 4055',
            email: 'priya.sharma@maxhealthcare.com',
            hours: 'Mon-Sat 9AM-4PM',
            specializations: 'Infertility, Minimal Access Surgery, Adolescent Gynecology',
            bookingLink: 'https://www.maxhealthcare.in',
            rating: '4.7/5 (190 reviews)'
        },
        {
            name: 'Dr. Renu Jain',
            image: '',
            credentials: 'MD, DNB (Obs & Gyn)',
            experience: '20+ Years Experience',
            hospital: 'Fortis La Femme',
            address: 'Greater Kailash II, New Delhi',
            phone: 'Available on Request',
            email: 'contact@fortislafemme.com',
            hours: 'Mon-Fri 10AM-5PM',
            specializations: 'IVF, High-Risk Obstetrics, Laparoscopic Surgery',
            bookingLink: 'https://www.practo.com',
            rating: '4.8/5 (310 reviews)'
        },
        {
            name: 'Dr. Surbhi Singh',
            image: '',
            credentials: 'MBBS, MS (OB/GYN), Fellow Infertility',
            experience: '14+ Years Experience',
            hospital: 'BLK-Max Super Speciality Hospital',
            address: 'Pusa Road, Rajendra Place, New Delhi',
            phone: 'Available on Request',
            email: 'surbhi.singh@maxhospital.com',
            hours: 'Mon-Sat 9AM-4PM',
            specializations: 'Infertility Specialist, Reproductive Medicine, PCOD',
            bookingLink: 'https://www.maxhealthcare.in',
            rating: '4.7/5 (245 reviews)'
        },
        {
            name: 'Dr. Alka Sharma',
            image: '',
            credentials: 'MD, DGO',
            experience: '28+ Years Experience',
            hospital: 'Indraprastha Apollo Hospital',
            address: 'Sarita Vihar, New Delhi',
            phone: 'Available on Request',
            email: 'care@apollohospitals.com',
            hours: 'Tue, Thu, Sat 10AM-6PM',
            specializations: 'General Gynecology, Menopause Clinic, Hysterectomy',
            bookingLink: 'https://www.apollohospitals.com',
            rating: '4.9/5 (500 reviews)'
        }
    ],
    'Mumbai': [
        {
            name: 'Dr. Neha Shah',
            image: '',
            credentials: 'MD, DGO, FICOG',
            experience: '16+ Years Experience',
            hospital: 'Breach Candy Hospital',
            address: '60-A, Bhulabhai Desai Road, Mumbai - 400026',
            phone: '+91 22 2367 1234',
            email: 'drshah@breachcandy.com',
            hours: 'Mon-Sat 9AM-6PM',
            specializations: 'Infertility Treatment, IVF, Reproductive Medicine',
            bookingLink: 'https://www.breachcandyhospital.org',
            rating: '4.9/5 (278 reviews)'
        },
        {
            name: 'Dr. Aarti Kulkarni',
            image: '',
            credentials: 'MBBS, MS (OB/GYN), Fellow Gyn Oncology',
            experience: '20+ Years Experience',
            hospital: 'Lilavati Hospital & Research Centre',
            address: 'Bandra Reclamation, Bandra West, Mumbai - 400050',
            phone: '+91 22 2675 1000',
            email: 'a.kulkarni@lilavatihospital.com',
            hours: 'Tue, Thu, Sat 11AM-4PM',
            specializations: 'Gynecological Oncology, High-Risk Obstetrics, Menstrual Irregularities',
            bookingLink: 'https://www.lilavatihospital.com',
            rating: '4.8/5 (350 reviews)'
        },
        {
            name: 'Dr. Hrishikesh Pai',
            image: '',
            credentials: 'MD, FRCOG (UK), DNB, FCPS',
            experience: '41+ Years Experience',
            hospital: 'Fortis Hospital / Lilavati Hospital',
            address: 'Mulund / Bandra, Mumbai',
            phone: 'Available on Request',
            email: 'contact@drhrishikeshpai.com',
            hours: 'Mon-Fri 10AM-5PM',
            specializations: 'Infertility, IVF & ICSI, Reproductive Medicine',
            bookingLink: 'https://www.fortishealthcare.com',
            rating: '4.9/5 (600 reviews)'
        },
        {
            name: 'Dr. Duru Shah',
            image: '',
            credentials: 'MD, DGO, FCPS, FICOG',
            experience: '40+ Years Experience',
            hospital: 'Gynaecworld Clinic',
            address: 'Kemps Corner, Mumbai',
            phone: 'Available on Request',
            email: 'info@gynaecworld.com',
            hours: 'Mon-Sat 9:30AM-6:30PM',
            specializations: 'PCOS/PCOD, Adolescent Gynecology, Menstrual Disorders',
            bookingLink: 'https://www.practo.com',
            rating: '4.8/5 (550 reviews)'
        },
        {
            name: 'Dr. Rekha Ambegaokar',
            image: '',
            credentials: 'MBBS, DGO, MD (OB/GYN)',
            experience: '30+ Years Experience',
            hospital: 'Nanavati Max Super Speciality Hospital',
            address: 'Vile Parle West, Mumbai',
            phone: 'Available on Request',
            email: 'contact@nanavatimaxhospital.org',
            hours: 'Mon-Fri 10AM-6PM',
            specializations: 'High-Risk Obstetrics, Gynaecological Surgery, Uterine Fibroids',
            bookingLink: 'https://www.nanavatimaxhospital.org',
            rating: '4.7/5 (420 reviews)'
        },
        {
            name: 'Dr. Gayatri Deshpande',
            image: '',
            credentials: 'MD, MS (OBG), MRCOG (UK)',
            experience: '22+ Years Experience',
            hospital: 'Nanavati Max Super Speciality Hospital',
            address: 'Vile Parle West, Mumbai',
            phone: 'Available on Request',
            email: 'contact@nanavatimaxhospital.org',
            hours: 'Tue, Thu 11AM-3PM',
            specializations: 'Robotic Surgery, Minimally Invasive Gynecology, Endometriosis',
            bookingLink: 'https://www.nanavatimaxhospital.org',
            rating: '4.6/5 (380 reviews)'
        }
    ],
    'Bangalore': [
        {
            name: 'Dr. Rajeshwari Iyer',
            image: '',
            credentials: 'MBBS, DGO, MRCOG (UK)',
            experience: '15+ Years Experience',
            hospital: 'Manipal Hospital, Old Airport Road',
            address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru - 560017',
            phone: '+91 80 2502 4444',
            email: 'rajeshwari.iyer@manipalhospitals.com',
            hours: 'Mon-Fri 9AM-5PM',
            specializations: 'Laparoscopic Hysterectomy, PCOD/PCOS, Urogynecology',
            bookingLink: 'https://www.manipalhospitals.com',
            rating: '4.7/5 (215 reviews)'
        },
        {
            name: 'Dr. Vasanthi Rao',
            image: '',
            credentials: 'MD (OB/GYN), DNB',
            experience: '10+ Years Experience',
            hospital: 'Aster CMI Hospital',
            address: 'NH 44, Hebbal, Bengaluru - 560092',
            phone: '+91 80 4012 2222',
            email: 'vasanthi.rao@astercmi.com',
            hours: 'Mon-Sat 8AM-7PM',
            specializations: 'Reproductive Endocrinology, Menopause Clinic, Contraception Counseling',
            bookingLink: 'https://www.asterhospitals.com',
            rating: '4.6/5 (180 reviews)'
        },
        {
            name: 'Dr. Chaitra Prasad',
            image: '',
            credentials: 'MS (OB/GYN), Fellowship in Laparoscopy',
            experience: '18+ Years Experience',
            hospital: 'Cloudnine Hospital',
            address: 'Old Airport Road, Bengaluru',
            phone: 'Available on Request',
            email: 'contact@cloudninecare.com',
            hours: 'Mon-Fri 9AM-6PM',
            specializations: 'Laparoscopic & Hysteroscopic Surgery, Infertility, Endometriosis',
            bookingLink: 'https://www.cloudninecare.com',
            rating: '4.9/5 (450 reviews)'
        },
        {
            name: 'Dr. Sunita Mahesh',
            image: '',
            credentials: 'MD, DNB (OBG)',
            experience: '25+ Years Experience',
            hospital: 'Columbia Asia Hospital',
            address: 'Whitefield, Bengaluru',
            phone: 'Available on Request',
            email: 's.mahesh@columbiaasia.com',
            hours: 'Tue, Thu, Sat 10AM-5PM',
            specializations: 'High-Risk Pregnancy, Fetal Medicine, Gynecological Cancer Screening',
            bookingLink: 'https://www.columbiaasia.com',
            rating: '4.8/5 (390 reviews)'
        },
        {
            name: 'Dr. Shilpa Ghosh',
            image: '',
            credentials: 'MBBS, DGO',
            experience: '12+ Years Experience',
            hospital: 'Sakra World Hospital',
            address: 'Bellandur, Bengaluru',
            phone: 'Available on Request',
            email: 'contact@sakraworldhospital.com',
            hours: 'Mon-Sat 11AM-7PM',
            specializations: 'PCOS Management, Contraception Counseling, Normal Delivery',
            bookingLink: 'https://www.practo.com',
            rating: '4.7/5 (280 reviews)'
        },
        {
            name: 'Dr. Sheela Kumari',
            image: '',
            credentials: 'MD, FRCOG (London)',
            experience: '30+ Years Experience',
            hospital: 'Fortis Hospital',
            address: 'Bannerghatta Road, Bengaluru',
            phone: 'Available on Request',
            email: 's.kumari@fortishealthcare.com',
            hours: 'Mon-Fri 9AM-4PM',
            specializations: 'Reproductive Medicine, Menopause Management, Fibroid Removal',
            bookingLink: 'https://www.fortishealthcare.com',
            rating: '4.9/5 (550 reviews)'
        }
    ],
    'Chennai': [
        {
            name: 'Dr. Padma Sridhar',
            image: '',
            credentials: 'MBBS, MS (OB/GYN), FRCOG',
            experience: '22+ Years Experience',
            hospital: 'Apollo Women’s Hospital',
            address: '15, Shafee Mohammed Road, Nungambakkam, Chennai - 600006',
            phone: '+91 44 2829 0200',
            email: 'padma.s@apollohospitals.com',
            hours: 'Mon-Fri 10AM-6PM',
            specializations: 'High-Risk Obstetrics, Fetal Medicine, Gynecological Surgery',
            bookingLink: 'https://www.apollohospitals.com',
            rating: '4.8/5 (305 reviews)'
        },
        {
            name: 'Dr. C. Geetha Haripriya',
            image: '',
            credentials: 'MD, DGO, FOGSI',
            experience: '40+ Years Experience',
            hospital: 'Prashanth Hospitals',
            address: 'Velachery, Chennai',
            phone: 'Available on Request',
            email: 'c.haripriya@prashanthhospitals.org',
            hours: 'Mon-Sat 9AM-5PM',
            specializations: 'Infertility Management, IVF, Reproductive Medicine',
            bookingLink: 'https://prashanthhospitals.org',
            rating: '4.9/5 (480 reviews)'
        },
        {
            name: 'Dr. Vinitha Padmini Mary',
            image: '',
            credentials: 'MBBS, MD, DGO',
            experience: '24+ Years Experience',
            hospital: 'VS Hospitals',
            address: 'Kilpauk, Chennai',
            phone: 'Available on Request',
            email: 'v.mary@vshospitals.com',
            hours: 'Mon-Fri 10AM-6PM',
            specializations: 'Infertility Specialist, Hysterectomy, Cervical Procedures',
            bookingLink: 'https://vshospitals.com',
            rating: '4.7/5 (320 reviews)'
        },
        {
            name: 'Dr. Prema Elizabeth',
            image: '',
            credentials: 'MBBS, MD, Dip. N.B (OB&G)',
            experience: '25+ Years Experience',
            hospital: 'VS Hospitals',
            address: 'Kilpauk, Chennai',
            phone: 'Available on Request',
            email: 'p.elizabeth@vshospitals.com',
            hours: 'Mon-Sat 9AM-5PM',
            specializations: 'High-Risk Obstetrics, Gynae Oncology, Women\'s Wellness',
            bookingLink: 'https://vshospitals.com',
            rating: '4.8/5 (390 reviews)'
        },
        {
            name: 'Dr. K.S. Kavitha Gautham',
            image: '',
            credentials: 'MBBS, MS (OG), DRM (Germany)',
            experience: '18+ Years Experience',
            hospital: 'BloomLife Hospital & Bloom Fertility Centre',
            address: 'Velachery, Chennai',
            phone: 'Available on Request',
            email: 'k.gautham@bloomlifehospital.com',
            hours: 'Tue, Thu, Sat 10AM-4PM',
            specializations: 'High-Risk Obstetrics, Reproductive Medicine, VBAC, Water Birth',
            bookingLink: 'https://bloomlifehospital.com',
            rating: '4.7/5 (210 reviews)'
        },
        {
            name: 'Dr. Usha Todadri',
            image: '',
            credentials: 'MBBS, DNB (OBG)',
            experience: '35+ Years Experience',
            hospital: 'Prashanth Hospitals',
            address: 'Velachery, Chennai',
            phone: 'Available on Request',
            email: 'u.todadri@prashanthhospitals.org',
            hours: 'Mon-Fri 11AM-6PM',
            specializations: 'Maternal and Fetal Medicine, High-Risk Pregnancies, Preventative Care',
            bookingLink: 'https://prashanthhospitals.org',
            rating: '4.6/5 (190 reviews)'
        }
    ],
    'Hyderabad': [
        {
            name: 'Dr. Shalini Reddy',
            image: '',
            credentials: 'MD (OB/GYN), DGO',
            experience: '14+ Years Experience',
            hospital: 'KIMS Hospitals',
            address: '1-8-31/1, Minister Rd, Kavadiguda, Secunderabad - 500003',
            phone: '+91 40 4012 2222',
            email: 's.reddy@kimshospitals.com',
            hours: 'Mon, Wed, Fri 9AM-4PM',
            specializations: 'Fertility Preservation, Adolescent Health, Endometriosis',
            bookingLink: 'https://www.kimshospitals.com',
            rating: '4.7/5 (205 reviews)'
        },
        {
            name: 'Dr. T. Rajeshwari Reddy',
            image: '',
            credentials: 'MD, DNB (OBG)',
            experience: '23+ Years Experience',
            hospital: 'Continental Hospital',
            address: 'Nanakaramguda, Hyderabad',
            phone: 'Available on Request',
            email: 't.reddy@continentalhospitals.com',
            hours: 'Mon-Sat 10AM-5PM',
            specializations: 'Laparoscopy, Infertility, High-Risk Pregnancy Management',
            bookingLink: 'https://www.continentalhospitals.com',
            rating: '4.9/5 (835 reviews)'
        },
        {
            name: 'Dr. Himabindu Annemraju',
            image: '',
            credentials: 'MS (OB/GYN), Fellow Laparoscopy',
            experience: '20+ Years Experience',
            hospital: 'Rainbow Children\'s Hospital',
            address: 'Nanakaramguda, Hyderabad',
            phone: 'Available on Request',
            email: 'h.annemraju@rainbowhospitals.in',
            hours: 'Mon-Fri 9AM-4PM',
            specializations: 'High-Risk Pregnancies, Advanced Laparoscopy, Recurrent Loss',
            bookingLink: 'https://www.rainbowhospitals.in',
            rating: '5.0/5 (368 reviews)'
        },
        {
            name: 'Dr. Anusha Rao P',
            image: '',
            credentials: 'MBBS, MS (OB/GYN), Robotic Fellow',
            experience: '15+ Years Experience',
            hospital: 'Yashoda Hospitals',
            address: 'Secunderabad, Hyderabad',
            phone: 'Available on Request',
            email: 'a.rao@yashodahospitals.com',
            hours: 'Mon-Sat 11AM-7PM',
            specializations: 'Minimally Invasive & Robotic Surgery, Fertility Care, Endometriosis',
            bookingLink: 'https://www.yashodahospitals.com',
            rating: '5.0/5 (270 reviews)'
        },
        {
            name: 'Dr. Sasikala Kola',
            image: '',
            credentials: 'MBBS, MD (OBG), DGO',
            experience: '28+ Years Experience',
            hospital: 'Rainbow Children\'s Hospital & BirthRight',
            address: 'Banjara Hills, Hyderabad',
            phone: 'Available on Request',
            email: 's.kola@rainbowhospitals.in',
            hours: 'Mon-Fri 12PM-2:30PM',
            specializations: 'General Gynecology, Menopause Management, PCOS',
            bookingLink: 'https://www.rainbowhospitals.in',
            rating: '4.7/5 (450 reviews)'
        },
        {
            name: 'Dr. Udita Mukherjee',
            image: '',
            credentials: 'MBBS, DNB, MRCOG',
            experience: '16+ Years Experience',
            hospital: 'Rainbow Children\'s Hospital',
            address: 'Financial District, Hyderabad',
            phone: 'Available on Request',
            email: 'u.mukherjee@rainbowhospitals.in',
            hours: 'Mon-Sat 11AM-6PM',
            specializations: 'High-Risk Pregnancy, Laparoscopic Surgery, Fetal Medicine',
            bookingLink: 'https://www.rainbowhospitals.in',
            rating: '4.6/5 (195 reviews)'
        }
    ],
    'Kolkata': [
        {
            name: 'Dr. Ananya Roy',
            image: '',
            credentials: 'MBBS, DNB, MRCOG',
            experience: '17+ Years Experience',
            hospital: 'AMRI Hospitals, Salt Lake',
            address: 'CB 17, Sector III, Salt Lake City, Kolkata - 700098',
            phone: '+91 33 6606 3800',
            email: 'drananya@amrihospitals.in',
            hours: 'Mon-Fri 10AM-6PM, Sat 10AM-2PM',
            specializations: 'Laparoscopic Surgery, Ovarian Cysts, Menstrual Disorders',
            bookingLink: 'https://www.amrihospitals.in',
            rating: '4.7/5 (201 reviews)'
        },
        {
            name: 'Dr. Ramna Banerjee',
            image: '',
            credentials: 'MBBS, MD, FRCOG (UK)',
            experience: '28+ Years Experience',
            hospital: 'Apollo Gleneagles Hospitals',
            address: 'Salt Lake City, Kolkata',
            phone: 'Available on Request',
            email: 'r.banerjee@apollohospitals.com',
            hours: 'Mon-Sat 11AM-6PM',
            specializations: 'High-Risk Pregnancy, Infertility, Colposcopy, Endometriosis',
            bookingLink: 'https://www.apollohospitals.com',
            rating: '4.8/5 (53 reviews)'
        },
        {
            name: 'Dr. Tanuka Dasgupta',
            image: '',
            credentials: 'MD (OBG), DNB',
            experience: '20+ Years Experience',
            hospital: 'IRIS Hospitals',
            address: 'Bagmari, Kolkata',
            phone: 'Available on Request',
            email: 'contact@irishealthservices.com',
            hours: 'Mon-Fri 10AM-5PM',
            specializations: 'Laparoscopic Hysterectomy, Fibroid Treatment, Menopause Management',
            bookingLink: 'https://irishealthservices.com',
            rating: '4.7/5 (180 reviews)'
        },
        {
            name: 'Dr. Mallinath Mukherjee',
            image: '',
            credentials: 'MBBS, FRCOG (UK), FRCS (Edin)',
            experience: '35+ Years Experience',
            hospital: 'Apollo Multispecialty Hospitals',
            address: 'EM Bypass, Kolkata',
            phone: 'Available on Request',
            email: 'm.mukherjee@apollohospitals.com',
            hours: 'Tue, Thu 2PM-5PM',
            specializations: 'Infertility, Reproductive Endocrinology, Robotic Surgery',
            bookingLink: 'https://www.apollohospitals.com',
            rating: '4.9/5 (210 reviews)'
        },
        {
            name: 'Dr. Subidita Chatterjee',
            image: '',
            credentials: 'MS (OBG)',
            experience: '40+ Years Experience',
            hospital: 'FOR HER Gynae Fertility and Wellness Clinic',
            address: 'Salt Lake, Kolkata',
            phone: 'Available on Request',
            email: 's.chatterjee@gynaefwclinic.com',
            hours: 'Mon-Sat 4PM-7PM',
            specializations: 'General Gynecology, Fertility and Wellness, Menstrual Health',
            bookingLink: 'https://www.practo.com',
            rating: '4.6/5 (596 reviews)'
        },
        {
            name: 'Dr. Rupashree Dasgupta',
            image: '',
            credentials: 'MBBS, DGO, MD, MRCOG (UK)',
            experience: '23+ Years Experience',
            hospital: 'Apollo Multispecialty Hospitals',
            address: 'EM Bypass, Kolkata',
            phone: 'Available on Request',
            email: 'r.dasgupta@apollohospitals.com',
            hours: 'Mon-Sat 10AM-6PM',
            specializations: 'High-Risk Obstetrics, PCOD, Minimally Invasive Surgery',
            bookingLink: 'https://www.apollohospitals.com',
            rating: '4.7/5 (250 reviews)'
        }
    ],
    'Pune': [
        {
            name: 'Dr. Meena Joshi',
            image: '',
            credentials: 'MD (OB/GYN)',
            experience: '19+ Years Experience',
            hospital: 'Jehangir Hospital',
            address: '32 Sassoon Road, Pune - 411001',
            phone: '+91 20 6681 1000',
            email: 'm.joshi@jehangirhospital.com',
            hours: 'Mon-Fri 9AM-5PM',
            specializations: 'Infertility, Menopause Management, General Gynecology',
            bookingLink: 'https://www.jehangirhospital.com',
            rating: '4.8/5 (280 reviews)'
        },
        {
            name: 'Dr. Kishore Pandit',
            image: '',
            credentials: 'MD, DGO, FCPS',
            experience: '28+ Years Experience',
            hospital: 'Gynaeworld Hospital',
            address: 'Shivajinagar, Pune',
            phone: 'Available on Request',
            email: 'contact@gynaeworld.com',
            hours: 'Mon-Sat 10AM-6PM',
            specializations: 'High-Risk Pregnancy, Laparoscopic Surgery, Infertility',
            bookingLink: 'https://www.practo.com',
            rating: '4.9/5 (345 reviews)'
        },
        {
            name: 'Dr. Kirti Joglekar',
            image: '',
            credentials: 'MD, DGO',
            experience: '46+ Years Experience',
            hospital: 'Gynaeworld Hospital',
            address: 'Shivajinagar, Pune',
            phone: 'Available on Request',
            email: 'contact@gynaeworld.com',
            hours: 'Mon-Fri 10AM-2PM',
            specializations: 'Senior Consultant, General Gynecology, Menopause Clinic',
            bookingLink: 'https://www.practo.com',
            rating: '5.0/5 (25 reviews)'
        },
        {
            name: 'Dr. Pratibha Chavan',
            image: '',
            credentials: 'MD, DGO, DNB',
            experience: '17+ Years Experience',
            hospital: 'Galaxy Hospital',
            address: 'Pimple Saudagar, Pune',
            phone: 'Available on Request',
            email: 'p.chavan@galaxyhospital.in',
            hours: 'Mon-Sat 9AM-5PM',
            specializations: 'Infertility Specialist, IVF, PCOD Treatment, High-Risk Obstetrics',
            bookingLink: 'https://www.practo.com',
            rating: '4.8/5 (2539 reviews)'
        },
        {
            name: 'Dr. Nilesh Balkawade',
            image: '',
            credentials: 'MS (OBG), DNB',
            experience: '17+ Years Experience',
            hospital: 'Oasis Fertility',
            address: 'Wakad, Pune',
            phone: 'Available on Request',
            email: 'n.balkawade@oasisfertility.com',
            hours: 'Mon-Fri 9AM-5PM',
            specializations: 'Infertility Specialist, IVF, Reproductive Medicine, Minimal Access Surgery',
            bookingLink: 'https://www.oasisfertility.com',
            rating: '4.7/5 (39 reviews)'
        },
        {
            name: 'Dr. Vaishali Chavan',
            image: '',
            credentials: 'MD, DGO, DNB, Dip Endoscopy (Germany)',
            experience: '25+ Years Experience',
            hospital: 'Cloudnine Hospital',
            address: 'Kalyani Nagar, Pune',
            phone: 'Available on Request',
            email: 'v.chavan@cloudninecare.com',
            hours: 'Tue, Thu, Sat 11AM-4PM',
            specializations: 'Endoscopic Surgery, Hysterectomy, Menopause Management, Fibroids',
            bookingLink: 'https://www.cloudninecare.com',
            rating: '4.7/5 (150 reviews)'
        }
    ],
    'Ahmedabad': [
        {
            name: 'Dr. Alpana Patel',
            image: '',
            credentials: 'MBBS, DGO, FOGSI',
            experience: '16+ Years Experience',
            hospital: 'CIMS Hospital',
            address: 'Off Science City Road, Sola, Ahmedabad - 380060',
            phone: '+91 79 2771 2771',
            email: 'a.patel@cimshospitals.com',
            hours: 'Mon-Sat 10AM-7PM',
            specializations: 'High-Risk Obstetrics, Laparoscopic Surgery, Fetal Ultrasound',
            bookingLink: 'https://www.cims.org',
            rating: '4.7/5 (195 reviews)'
        },
        {
            name: 'Dr. Manish Shah',
            image: '',
            credentials: 'MS (OB/GYN), DNB',
            experience: '23+ Years Experience',
            hospital: 'Tulip Women\'s Hospital',
            address: 'Satellite, Ahmedabad',
            phone: 'Available on Request',
            email: 'm.shah@tulipwomenshospital.com',
            hours: 'Mon-Fri 10AM-5PM',
            specializations: 'Laparoscopic Surgery, High-Risk Pregnancy, Infertility',
            bookingLink: 'https://www.practo.com',
            rating: '4.9/5 (17 reviews)'
        },
        {
            name: 'Dr. Usha Bohra',
            image: '',
            credentials: 'MD (OBG)',
            experience: '34+ Years Experience',
            hospital: 'Apollo Hospital',
            address: 'Bhat, Gandhinagar Bypass, Ahmedabad',
            phone: 'Available on Request',
            email: 'u.bohra@apollohospitals.com',
            hours: 'Mon-Fri 10AM-12PM',
            specializations: 'High-Risk Obstetrics, Gynae Oncology, Uterine Fibroids',
            bookingLink: 'https://www.apollohospitals.com',
            rating: '4.7/5 (10 reviews)'
        },
        {
            name: 'Dr. Bhaumik Shah',
            image: '',
            credentials: 'MD (OBG)',
            experience: '21+ Years Experience',
            hospital: 'Shree Shreeji Hospital',
            address: 'Gota, Ahmedabad',
            phone: 'Available on Request',
            email: 'b.shah@shreejihospital.com',
            hours: 'Mon-Sat 10:30AM-1:30PM',
            specializations: 'Infertility Treatment, PCOS, Normal & Caesarean Delivery',
            bookingLink: 'https://www.practo.com',
            rating: '5.0/5 (525 reviews)'
        },
        {
            name: 'Dr. Rajan Joshi',
            image: '',
            credentials: 'MD Gynaecology, MBBS',
            experience: '39+ Years Experience',
            hospital: 'Dr. Joshi\'s Maternity & Gynaec Hospital',
            address: 'Ellis Bridge, Ahmedabad',
            phone: 'Available on Request',
            email: 'r.joshi@drjoshishospital.com',
            hours: 'Mon-Sat 11AM-5PM',
            specializations: 'General Gynecology, Menstrual Disorders, Menopause Management',
            bookingLink: 'https://www.practo.com',
            rating: '4.7/5 (224 reviews)'
        },
        {
            name: 'Dr. Dipti Jain',
            image: '',
            credentials: 'MS - Obstetrics and Gynaecology',
            experience: '18+ Years Experience',
            hospital: 'Women\'s Clinic India',
            address: 'Paldi, Ahmedabad',
            phone: 'Available on Request',
            email: 'd.jain@womensclinicindia.com',
            hours: 'Mon-Sat 11AM-1:30PM',
            specializations: 'Menstrual Problems, Gynae Problems, Female Sexual Problems, PCOD',
            bookingLink: 'https://www.lybrate.com',
            rating: '4.8/5 (130 ratings)'
        }
    ]
};

let currentDoctorsData = doctorsData; // Default English
let currentCityKey = "Delhi"
let currentLanguage = 'en'; // Track selected language (set default)

document.addEventListener('DOMContentLoaded', function() {
  const langSelector = document.getElementById('languageSelector');
  const govEn = document.getElementById('government-en');
  const govHi = document.getElementById('government-hi');

  function toggleGovernmentSection(lang) {
    if (lang === 'hi') {
      govEn.style.display = 'none';
      govHi.style.display = 'block';
    } else {
      govEn.style.display = 'block';
      govHi.style.display = 'none';
    }
  }

  toggleGovernmentSection(langSelector.value);
  langSelector.addEventListener('change', function(e) {
    toggleGovernmentSection(e.target.value);
  });
});



const hi_doctorsData = {
'Delhi': [
    {
        name: 'डॉ. कविता गुप्ता',
        image: '',
        credentials: 'एमबीबीएस, डीजीओ, एफआरसीओजी',
        experience: '18+ वर्षों का अनुभव',
        hospital: 'गुप्ता मैटरनिटी एवं स्त्री रोग केंद्र',
        address: '56 कनॉट प्लेस, नई दिल्ली - 110001',
        phone: '+91 11 5678 9012',
        email: 'care@guptacenter.com',
        hours: 'सोम-शनि 8AM-8PM',
        specializations: 'मातृ-भ्रूण चिकित्सा, फाइब्रॉइड उपचार, मेनोपॉज़ प्रबंधन',
        bookingLink: 'https://www.practo.com',
        rating: '4.8/5 (256 समीक्षाएँ)'
    },
    {
        name: 'डॉ. सुनीता मल्होत्रा',
        image: '',
        credentials: 'एमडी, एमएस (स्त्री/प्रसूति)',
        experience: '25+ वर्षों का अनुभव',
        hospital: 'अपोलो इंद्रप्रस्थ अस्पताल',
        address: 'सरिता विहार, दिल्ली मथुरा रोड, नई दिल्ली - 110076',
        phone: '+91 11 2692 5858',
        email: 's.malhotra@apollohospitals.com',
        hours: 'सोम-शुक्र 10AM-5PM',
        specializations: 'हाई रिस्क गर्भावस्था, एंडोमेट्रियोसिस सर्जरी, पीसीओएस प्रबंधन',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.9/5 (410 समीक्षाएँ)'
    },
    {
        name: 'डॉ. प्रिया शर्मा',
        image: '',
        credentials: 'एमबीबीएस, डीएनबी (OBG)',
        experience: '12+ वर्षों का अनुभव',
        hospital: 'मैक्स अस्पताल साकेत',
        address: '1-2, प्रेस एंक्लेव रोड, साकेत, नई दिल्ली - 110017',
        phone: '+91 11 4055 4055',
        email: 'priya.sharma@maxhealthcare.com',
        hours: 'सोम-शनि 9AM-4PM',
        specializations: 'बांझपन, न्यूनतम इनवेसिव सर्जरी, किशोर स्त्री रोग',
        bookingLink: 'https://www.maxhealthcare.in',
        rating: '4.7/5 (190 समीक्षाएँ)'
    },
    {
        name: 'डॉ. रेणु जैन',
        image: '',
        credentials: 'एमडी, डीएनबी (OB/GYN)',
        experience: '20+ वर्षों का अनुभव',
        hospital: 'फोर्टिस ला फेम',
        address: 'ग्रेटर कैलाश II, नई दिल्ली',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'contact@fortislafemme.com',
        hours: 'सोम-शुक्र 10AM-5PM',
        specializations: 'आईवीएफ, हाई रिस्क प्रसूति, लैप्रोस्कोपिक सर्जरी',
        bookingLink: 'https://www.practo.com',
        rating: '4.8/5 (310 समीक्षाएँ)'
    },
    {
        name: 'डॉ. सुरभि सिंह',
        image: '',
        credentials: 'एमबीबीएस, एमएस (OB/GYN), फेलो इनफर्टिलिटी',
        experience: '14+ वर्षों का अनुभव',
        hospital: 'बीएलके-मैक्स सुपर स्पेशलिटी अस्पताल',
        address: 'पुसा रोड, राजेंद्र प्लेस, नई दिल्ली',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'surbhi.singh@maxhospital.com',
        hours: 'सोम-शनि 9AM-4PM',
        specializations: 'इनफर्टिलिटी विशेषज्ञ, प्रजनन चिकित्सा, पीसीओडी',
        bookingLink: 'https://www.maxhealthcare.in',
        rating: '4.7/5 (245 समीक्षाएँ)'
    },
    {
        name: 'डॉ. अलका शर्मा',
        image: '',
        credentials: 'एमडी, डीजीओ',
        experience: '28+ वर्षों का अनुभव',
        hospital: 'इंद्रप्रस्थ अपोलो अस्पताल',
        address: 'सरिता विहार, नई दिल्ली',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'care@apollohospitals.com',
        hours: 'मंगल, गुरु, शनि 10AM-6PM',
        specializations: 'जनरल गाइनकोलॉजी, मेनोपॉज क्लिनिक, हाइस्टेरेक्टॉमी',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.9/5 (500 समीक्षाएँ)'
    }
],
'Mumbai': [
    {
        name: 'डॉ. नेहा शाह',
        image: '',
        credentials: 'एमडी, डीजीओ, एफआईसीओजी',
        experience: '16+ वर्षों का अनुभव',
        hospital: 'ब्रीच कैंडी हॉस्पिटल',
        address: '60-A, भुलाभाई देसाई रोड, मुंबई - 400026',
        phone: '+91 22 2367 1234',
        email: 'drshah@breachcandy.com',
        hours: 'सोम-शनि 9AM-6PM',
        specializations: 'इनफर्टिलिटी उपचार, आईवीएफ, प्रजनन चिकित्सा',
        bookingLink: 'https://www.breachcandyhospital.org',
        rating: '4.9/5 (278 समीक्षाएँ)'
    },
    {
        name: 'डॉ. आरती कुलकर्णी',
        image: '',
        credentials: 'एमबीबीएस, एमएस (OB/GYN), फेलो गाइन ऑन्कोलॉजी',
        experience: '20+ वर्षों का अनुभव',
        hospital: 'लिलावती अस्पताल और रिसर्च सेंटर',
        address: 'बांद्रा रिक्लेमेशन, बांद्रा वेस्ट, मुंबई - 400050',
        phone: '+91 22 2675 1000',
        email: 'a.kulkarni@lilavatihospital.com',
        hours: 'मंगल, गुरु, शनि 11AM-4PM',
        specializations: 'स्त्री रोग ऑन्कोलॉजी, उच्च जोखिम गर्भावस्था, माहवारी अनियमितताएँ',
        bookingLink: 'https://www.lilavatihospital.com',
        rating: '4.8/5 (350 समीक्षाएँ)'
    },
    {
        name: 'डॉ. हृषिकेश पाई',
        image: '',
        credentials: 'एमडी, एफआरसीओजी (यूके), डीएनबी, एफसीपीएस',
        experience: '41+ वर्षों का अनुभव',
        hospital: 'फोर्टिस अस्पताल / लिलावती अस्पताल',
        address: 'मुलुंड / बांद्रा, मुंबई',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'contact@drhrishikeshpai.com',
        hours: 'सोम-शुक्र 10AM-5PM',
        specializations: 'इनफर्टिलिटी, आईवीएफ व आईसीएसआई, प्रजनन चिकित्सा',
        bookingLink: 'https://www.fortishealthcare.com',
        rating: '4.9/5 (600 समीक्षाएँ)'
    },
    {
        name: 'डॉ. दुरु शाह',
        image: '',
        credentials: 'एमडी, डीजीओ, एफसीपीएस, एफआईसीओजी',
        experience: '40+ वर्षों का अनुभव',
        hospital: 'गाइनएकवर्ल्ड क्लिनिक',
        address: 'केम्प्स कॉर्नर, मुंबई',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'info@gynaecworld.com',
        hours: 'सोम-शनि 9:30AM-6:30PM',
        specializations: 'पीसीओएस/पीसीओडी, किशोर स्त्री विज्ञान, माहवारी विकार',
        bookingLink: 'https://www.practo.com',
        rating: '4.8/5 (550 समीक्षाएँ)'
    },
    {
        name: 'डॉ. रेखा अंबेगांवकर',
        image: '',
        credentials: 'एमबीबीएस, डीजीओ, एमडी (OB/GYN)',
        experience: '30+ वर्षों का अनुभव',
        hospital: 'नानावटी मैक्स सुपर स्पेशलिटी हॉस्पिटल',
        address: 'विले पार्ले वेस्ट, मुंबई',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'contact@nanavatimaxhospital.org',
        hours: 'सोम-शुक्र 10AM-6PM',
        specializations: 'हाई-रिस्क ऑब्सटेट्रिक्स, स्त्री रोग सर्जरी, गर्भाशय फाइब्रॉइड्स',
        bookingLink: 'https://www.nanavatimaxhospital.org',
        rating: '4.7/5 (420 समीक्षाएँ)'
    },
    {
        name: 'डॉ. गायत्री देशपांडे',
        image: '',
        credentials: 'एमडी, एमएस (OBG), MRCOG (यूके)',
        experience: '22+ वर्षों का अनुभव',
        hospital: 'नानावटी मैक्स सुपर स्पेशलिटी हॉस्पिटल',
        address: 'विले पार्ले वेस्ट, मुंबई',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'contact@nanavatimaxhospital.org',
        hours: 'मंगल, गुरु 11AM-3PM',
        specializations: 'रोबोटिक सर्जरी, न्यूनतम हस्तक्षेप स्त्रीरोग, एंडोमेट्रियोसिस',
        bookingLink: 'https://www.nanavatimaxhospital.org',
        rating: '4.6/5 (380 समीक्षाएँ)'
    }
],
'Bangalore': [
    {
        name: 'डॉ. राजेश्वरी अय्यर',
        image: '',
        credentials: 'एमबीबीएस, डीजीओ, एमआरसीओजी (यूके)',
        experience: '15+ वर्षों का अनुभव',
        hospital: 'मणिपाल अस्पताल, ओल्ड एयरपोर्ट रोड',
        address: '98, एचएएल ओल्ड एयरपोर्ट रोड, कोडिहल्ली, बेंगलुरु - 560017',
        phone: '+91 80 2502 4444',
        email: 'rajeshwari.iyer@manipalhospitals.com',
        hours: 'सोम-शुक्र 9AM-5PM',
        specializations: 'लैप्रोस्कोपिक हायस्टेरेक्टॉमी, पीसीओडी/पीसीओएस, यूरोगाइनकोलॉजी',
        bookingLink: 'https://www.manipalhospitals.com',
        rating: '4.7/5 (215 समीक्षाएँ)'
    },
    {
        name: 'डॉ. वसंती राव',
        image: '',
        credentials: 'एमडी (OB/GYN), डीएनबी',
        experience: '10+ वर्षों का अनुभव',
        hospital: 'आस्टर सीएमआई अस्पताल',
        address: 'एनएच 44, हेब्बल, बेंगलुरु - 560092',
        phone: '+91 80 4012 2222',
        email: 'vasanthi.rao@astercmi.com',
        hours: 'सोम-शनि 8AM-7PM',
        specializations: 'प्रजनन हार्मोन विज्ञान, मेनोपॉज क्लिनिक, गर्भनिरोधक परामर्श',
        bookingLink: 'https://www.asterhospitals.com',
        rating: '4.6/5 (180 समीक्षाएँ)'
    },
    {
        name: 'डॉ. चैत्रा प्रसाद',
        image: '',
        credentials: 'एमएस (OB/GYN), लैप्रोस्कोपी फेलोशिप',
        experience: '18+ वर्षों का अनुभव',
        hospital: 'क्लाउडनाइन अस्पताल',
        address: 'ओल्ड एयरपोर्ट रोड, बेंगलुरु',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'contact@cloudninecare.com',
        hours: 'सोम-शुक्र 9AM-6PM',
        specializations: 'लैप्रोस्कोपिक एवं हिस्टेरोस्कोपिक सर्जरी, इनफर्टिलिटी, एंडोमेट्रियोसिस',
        bookingLink: 'https://www.cloudninecare.com',
        rating: '4.9/5 (450 समीक्षाएँ)'
    },
    {
        name: 'डॉ. सुनीता महेश',
        image: '',
        credentials: 'एमडी, डीएनबी (OBG)',
        experience: '25+ वर्षों का अनुभव',
        hospital: 'कोलंबिया एशिया अस्पताल',
        address: 'व्हाइटफील्ड, बेंगलुरु',
        phone: 'अनुरोध पर उपलब्ध',
        email: 's.mahesh@columbiaasia.com',
        hours: 'मंगल, गुरु, शनि 10AM-5PM',
        specializations: 'हाई-रिस्क प्रेग्नेंसी, भ्रूण चिकित्सा, स्त्री कैंसर स्क्रीनिंग',
        bookingLink: 'https://www.columbiaasia.com',
        rating: '4.8/5 (390 समीक्षाएँ)'
    },
    {
        name: 'डॉ. शिल्पा घोष',
        image: '',
        credentials: 'एमबीबीएस, डीजीओ',
        experience: '12+ वर्षों का अनुभव',
        hospital: 'साकरा वर्ल्ड हॉस्पिटल',
        address: 'बेलंदूर, बेंगलुरु',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'contact@sakraworldhospital.com',
        hours: 'सोम-शनि 11AM-7PM',
        specializations: 'पीसीओएस प्रबंधन, गर्भनिरोधक परामर्श, सामान्य डिलीवरी',
        bookingLink: 'https://www.practo.com',
        rating: '4.7/5 (280 समीक्षाएँ)'
    },
    {
        name: 'डॉ. शीला कुमारी',
        image: '',
        credentials: 'एमडी, एफआरसीओजी (लंदन)',
        experience: '30+ वर्षों का अनुभव',
        hospital: 'फोर्टिस हॉस्पिटल',
        address: 'बन्नेरघट्टा रोड, बेंगलुरु',
        phone: 'अनुरोध पर उपलब्ध',
        email: 's.kumari@fortishealthcare.com',
        hours: 'सोम-शुक्र 9AM-4PM',
        specializations: 'प्रजनन मेडिसिन, मेनोपॉज प्रबंधन, फाइब्रॉइड रिमूवल',
        bookingLink: 'https://www.fortishealthcare.com',
        rating: '4.9/5 (550 समीक्षाएँ)'
    }
  ],
   Chennai :  [
    {
        name: 'डॉ. पद्मा श्रीधर',
        image: '',
        credentials: 'एमबीबीएस, एमएस (OB/GYN), एफआरसीओजी',
        experience: '22+ वर्षों का अनुभव',
        hospital: 'अपोलो वुमेन्स हॉस्पिटल',
        address: '15, शफी मोहम्मद रोड, नुंगमबक्कम, चेन्नई - 600006',
        phone: '+91 44 2829 0200',
        email: 'padma.s@apollohospitals.com',
        hours: 'सोम-शुक्र 10AM-6PM',
        specializations: 'हाई-रिस्क प्रसूति, भ्रूण चिकित्सा, स्त्रीरोग सर्जरी',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.8/5 (305 समीक्षाएँ)'
    },
    {
        name: 'डॉ. सी. गीता हरिप्रिया',
        image: '',
        credentials: 'एमडी, डीजीओ, एफओजीएसआई',
        experience: '40+ वर्षों का अनुभव',
        hospital: 'प्रशांत हॉस्पिटल्स',
        address: 'वेलाचेरी, चेन्नई',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'c.haripriya@prashanthhospitals.org',
        hours: 'सोम-शनि 9AM-5PM',
        specializations: 'इनफर्टिलिटी प्रबंधन, आईवीएफ, प्रजनन चिकित्सा',
        bookingLink: 'https://prashanthhospitals.org',
        rating: '4.9/5 (480 समीक्षाएँ)'
    },
    {
        name: 'डॉ. विनिता पद्मिनी मैरी',
        image: '',
        credentials: 'एमबीबीएस, एमडी, डीजीओ',
        experience: '24+ वर्षों का अनुभव',
        hospital: 'वीएस हॉस्पिटल्स',
        address: 'किलपौक, चेन्नई',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'v.mary@vshospitals.com',
        hours: 'सोम-शुक्र 10AM-6PM',
        specializations: 'इनफर्टिलिटी विशेषज्ञ, हिस्टेरेक्टॉमी, सर्वाइकल प्रक्रियाएँ',
        bookingLink: 'https://vshospitals.com',
        rating: '4.7/5 (320 समीक्षाएँ)'
    },
    {
        name: 'डॉ. प्रेमा एलिजाबेथ',
        image: '',
        credentials: 'एमबीबीएस, एमडी, डिप्लोमा एनबी (OB&G)',
        experience: '25+ वर्षों का अनुभव',
        hospital: 'वीएस हॉस्पिटल्स',
        address: 'किलपौक, चेन्नई',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'p.elizabeth@vshospitals.com',
        hours: 'सोम-शनि 9AM-5PM',
        specializations: 'हाई-रिस्क प्रसूति, स्त्री कैंसर विज्ञान, महिलाओं का स्वास्थ्य',
        bookingLink: 'https://vshospitals.com',
        rating: '4.8/5 (390 समीक्षाएँ)'
    },
    {
        name: 'डॉ. केएस कविता गौतम',
        image: '',
        credentials: 'एमबीबीएस, एमएस (OG), डीआरएम (जर्मनी)',
        experience: '18+ वर्षों का अनुभव',
        hospital: 'ब्लूमलाइफ हॉस्पिटल और ब्लूम फर्टिलिटी सेंटर',
        address: 'वेलाचेरी, चेन्नई',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'k.gautham@bloomlifehospital.com',
        hours: 'मंगल, गुरु, शनि 10AM-4PM',
        specializations: 'हाई-रिस्क प्रसूति, प्रजनन चिकित्सा, VBAC, वॉटर बर्थ',
        bookingLink: 'https://bloomlifehospital.com',
        rating: '4.7/5 (210 समीक्षाएँ)'
    },
    {
        name: 'डॉ. ऊषा टोडडरी',
        image: '',
        credentials: 'एमबीबीएस, डीएनबी (OBG)',
        experience: '35+ वर्षों का अनुभव',
        hospital: 'प्रशांत हॉस्पिटल्स',
        address: 'वेलाचेरी, चेन्नई',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'u.todadri@prashanthhospitals.org',
        hours: 'सोम-शुक्र 11AM-6PM',
        specializations: 'मातृ और भ्रूण चिकित्सा, हाई-रिस्क प्रेग्नेंसी, निवारक देखभाल',
        bookingLink: 'https://prashanthhospitals.org',
        rating: '4.6/5 (190 समीक्षाएँ)'
    }
],

Hyderabad : [
    {
        name: 'डॉ. शालिनी रेड्डी',
        image: '',
        credentials: 'एमडी (OB/GYN), डीजीओ',
        experience: '14+ वर्षों का अनुभव',
        hospital: 'KIMS हॉस्पिटल्स',
        address: '1-8-31/1, मिनिस्टर रोड, कावाडिगुडा, सिकंदराबाद - 500003',
        phone: '+91 40 4012 2222',
        email: 's.reddy@kimshospitals.com',
        hours: 'सोम, बुध, शुक्र 9AM-4PM',
        specializations: 'फर्टिलिटी प्रिजर्वेशन, किशोर स्वास्थ्य, एंडोमेट्रियोसिस',
        bookingLink: 'https://www.kimshospitals.com',
        rating: '4.7/5 (205 समीक्षाएँ)'
    },
    {
        name: 'डॉ. टी. राजेश्वरी रेड्डी',
        image: '',
        credentials: 'एमडी, डीएनबी (OBG)',
        experience: '23+ वर्षों का अनुभव',
        hospital: 'कॉन्टिनेंटल हॉस्पिटल',
        address: 'नानकरामगुड़ा, हैदराबाद',
        phone: 'अनुरोध पर उपलब्ध',
        email: 't.reddy@continentalhospitals.com',
        hours: 'सोम-शनि 10AM-5PM',
        specializations: 'लैप्रोस्कोपी, बांझपन, हाई-रिस्क प्रेग्नेंसी',
        bookingLink: 'https://www.continentalhospitals.com',
        rating: '4.9/5 (835 समीक्षाएँ)'
    },
    {
        name: 'डॉ. हिमाबिंदु अन्नेमराजु',
        image: '',
        credentials: 'एमएस (OB/GYN), लैप्रोस्कोपी फेलोशिप',
        experience: '20+ वर्षों का अनुभव',
        hospital: 'रेनबो चिल्ड्रन हॉस्पिटल',
        address: 'नानकरामगुड़ा, हैदराबाद',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'h.annemraju@rainbowhospitals.in',
        hours: 'सोम-शुक्र 9AM-4PM',
        specializations: 'हाई-रिस्क प्रेग्नेंसी, एडवांस्ड लैप्रोस्कोपी, बार-बार गर्भपात',
        bookingLink: 'https://www.rainbowhospitals.in',
        rating: '5.0/5 (368 समीक्षाएँ)'
    },
    {
        name: 'डॉ. अनुशा राव पी.',
        image: '',
        credentials: 'एमबीबीएस, एमएस (OB/GYN), रोबोटिक फेलोशिप',
        experience: '15+ वर्षों का अनुभव',
        hospital: 'यशोदा हॉस्पिटल्स',
        address: 'सिकंदराबाद, हैदराबाद',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'a.rao@yashodahospitals.com',
        hours: 'सोम-शनि 11AM-7PM',
        specializations: 'मिनिमल इनवेसिव & रोबोटिक सर्जरी, फर्टिलिटी केयर, एंडोमेट्रियोसिस',
        bookingLink: 'https://www.yashodahospitals.com',
        rating: '5.0/5 (270 समीक्षाएँ)'
    },
    {
        name: 'डॉ. शशिकला कोला',
        image: '',
        credentials: 'एमबीबीएस, एमडी (OBG), डीजीओ',
        experience: '28+ वर्षों का अनुभव',
        hospital: 'रेनबो चिल्ड्रन हॉस्पिटल & बर्थराइट',
        address: 'बंजारा हिल्स, हैदराबाद',
        phone: 'अनुरोध पर उपलब्ध',
        email: 's.kola@rainbowhospitals.in',
        hours: 'सोम-शुक्र 12PM-2:30PM',
        specializations: 'जनरल गाइनकोलॉजी, मेनोपॉज प्रबंधन, पीसीओएस',
        bookingLink: 'https://www.rainbowhospitals.in',
        rating: '4.7/5 (450 समीक्षाएँ)'
    },
    {
        name: 'डॉ. उदिता मुखर्जी',
        image: '',
        credentials: 'एमबीबीएस, डीएनबी, एमआरसीओजी',
        experience: '16+ वर्षों का अनुभव',
        hospital: 'रेनबो चिल्ड्रन हॉस्पिटल',
        address: 'फिनांशियल डिस्ट्रिक्ट, हैदराबाद',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'u.mukherjee@rainbowhospitals.in',
        hours: 'सोम-शनि 11AM-6PM',
        specializations: 'हाई-रिस्क प्रेग्नेंसी, लैप्रोस्कोपिक सर्जरी, भ्रूण चिकित्सा',
        bookingLink: 'https://www.rainbowhospitals.in',
        rating: '4.6/5 (195 समीक्षाएँ)'
    }
],

Kolkata : [
    {
        name: 'डॉ. अनन्या राय',
        image: '',
        credentials: 'एमबीबीएस, डीएनबी, एमआरसीओजी',
        experience: '17+ वर्षों का अनुभव',
        hospital: 'एएमआरआई अस्पताल, साल्ट लेक',
        address: 'सीबी 17, सेक्टर III, साल्ट लेक सिटी, कोलकाता - 700098',
        phone: '+91 33 6606 3800',
        email: 'drananya@amrihospitals.in',
        hours: 'सोम-शुक्र 10AM-6PM, शनि 10AM-2PM',
        specializations: 'लैप्रोस्कोपिक सर्जरी, डिम्बग्रंथि सिस्ट, माहवारी विकार',
        bookingLink: 'https://www.amrihospitals.in',
        rating: '4.7/5 (201 समीक्षाएँ)'
    },
    {
        name: 'डॉ. रमना बनर्जी',
        image: '',
        credentials: 'एमबीबीएस, एमडी, एफआरसीओजी (यूके)',
        experience: '28+ वर्षों का अनुभव',
        hospital: 'अपोलो ग्लेनेगल्स हॉस्पिटल्स',
        address: 'साल्ट लेक सिटी, कोलकाता',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'r.banerjee@apollohospitals.com',
        hours: 'सोम-शनि 11AM-6PM',
        specializations: 'हाई-रिस्क प्रेग्नेंसी, बांझपन, कोलपोस्कोपी, एंडोमेट्रियोसिस',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.8/5 (53 समीक्षाएँ)'
    },
    {
        name: 'डॉ. तनुका दासगुप्ता',
        image: '',
        credentials: 'एमडी (OBG), डीएनबी',
        experience: '20+ वर्षों का अनुभव',
        hospital: 'आईरिस हॉस्पिटल्स',
        address: 'बागमारी, कोलकाता',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'contact@irishealthservices.com',
        hours: 'सोम-शुक्र 10AM-5PM',
        specializations: 'लैप्रोस्कोपिक हिस्टेरेक्टोमी, फाइब्रॉइड उपचार, मेनोपॉज प्रबंधन',
        bookingLink: 'https://irishealthservices.com',
        rating: '4.7/5 (180 समीक्षाएँ)'
    },
    {
        name: 'डॉ. मलिनाथ मुखर्जी',
        image: '',
        credentials: 'एमबीबीएस, एफआरसीओजी (यूके), एफआरसीएस (एडिनबरह)',
        experience: '35+ वर्षों का अनुभव',
        hospital: 'अपोलो मल्टीस्पेशलिटी हॉस्पिटल्स',
        address: 'ईएम बाईपास, कोलकाता',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'm.mukherjee@apollohospitals.com',
        hours: 'मंगल, गुरु 2PM-5PM',
        specializations: 'बांझपन, प्रजनन हार्मोन विज्ञान, रोबोटिक सर्जरी',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.9/5 (210 समीक्षाएँ)'
    },
    {
        name: 'डॉ. सुबिदिता चटर्जी',
        image: '',
        credentials: 'एमएस (OBG)',
        experience: '40+ वर्षों का अनुभव',
        hospital: 'फोर हर गाइन फर्टिलिटी वेलनेस क्लिनिक',
        address: 'साल्ट लेक, कोलकाता',
        phone: 'अनुरोध पर उपलब्ध',
        email: 's.chatterjee@gynaefwclinic.com',
        hours: 'सोम-शनि 4PM-7PM',
        specializations: 'सामान्य गाइनकोलॉजी, बांझपन और वेलनेस, माहवारी स्वास्थ्य',
        bookingLink: 'https://www.practo.com',
        rating: '4.6/5 (596 समीक्षाएँ)'
    },
    {
        name: 'डॉ. रुपाश्री दासगुप्ता',
        image: '',
        credentials: 'एमबीबीएस, डीजीओ, एमडी, एमआरसीओजी (यूके)',
        experience: '23+ वर्षों का अनुभव',
        hospital: 'अपोलो मल्टीस्पेशलिटी हॉस्पिटल्स',
        address: 'ईएम बाईपास, कोलकाता',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'r.dasgupta@apollohospitals.com',
        hours: 'सोम-शनि 10AM-6PM',
        specializations: 'हाई-रिस्क प्रसूति, पीसीओडी, न्यूनतम हस्तक्षेप सर्जरी',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.7/5 (250 समीक्षाएँ)'
    }
],

Pune : [
    {
        name: 'डॉ. मीना जोशी',
        image: '',
        credentials: 'एमडी (OB/GYN)',
        experience: '19+ वर्षों का अनुभव',
        hospital: 'जहांगीर अस्पताल',
        address: '32 ससून रोड, पुणे - 411001',
        phone: '+91 20 6681 1000',
        email: 'm.joshi@jehangirhospital.com',
        hours: 'सोम-शुक्र 9AM-5PM',
        specializations: 'इनफर्टिलिटी, मेनोपॉज प्रबंधन, सामान्य गाइनकोलॉजी',
        bookingLink: 'https://www.jehangirhospital.com',
        rating: '4.8/5 (280 समीक्षाएँ)'
    },
    {
        name: 'डॉ. किशोर पंडित',
        image: '',
        credentials: 'एमडी, डीजीओ, एफसीपीएस',
        experience: '28+ वर्षों का अनुभव',
        hospital: 'गाइनइवर्ल्ड अस्पताल',
        address: 'शिवाजीनगर, पुणे',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'contact@gynaeworld.com',
        hours: 'सोम-शनि 10AM-6PM',
        specializations: 'हाई-रिस्क प्रेग्नेंसी, लैप्रोस्कोपिक सर्जरी, इनफर्टिलिटी',
        bookingLink: 'https://www.practo.com',
        rating: '4.9/5 (345 समीक्षाएँ)'
    },
    {
        name: 'डॉ. कीर्ति जोगलेकर',
        image: '',
        credentials: 'एमडी, डीजीओ',
        experience: '46+ वर्षों का अनुभव',
        hospital: 'गाइनइवर्ल्ड अस्पताल',
        address: 'शिवाजीनगर, पुणे',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'contact@gynaeworld.com',
        hours: 'सोम-शुक्र 10AM-2PM',
        specializations: 'वरिष्ठ सलाहकार, सामान्य गाइनकोलॉजी, मेनोपॉज क्लिनिक',
        bookingLink: 'https://www.practo.com',
        rating: '5.0/5 (25 समीक्षाएँ)'
    },
    {
        name: 'डॉ. प्रतिभा चव्हाण',
        image: '',
        credentials: 'एमडी, डीजीओ, डीएनबी',
        experience: '17+ वर्षों का अनुभव',
        hospital: 'गैलेक्सी अस्पताल',
        address: 'पिंपल सौदागर, पुणे',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'p.chavan@galaxyhospital.in',
        hours: 'सोम-शनि 9AM-5PM',
        specializations: 'इनफर्टिलिटी विशेषज्ञ, आईवीएफ, पीसीओडी उपचार, हाई-रिस्क प्रसूति',
        bookingLink: 'https://www.practo.com',
        rating: '4.8/5 (2539 समीक्षाएँ)'
    },
    {
        name: 'डॉ. निलेश बालकवडे',
        image: '',
        credentials: 'एमएस (OBG), डीएनबी',
        experience: '17+ वर्षों का अनुभव',
        hospital: 'ओएसिस फर्टिलिटी',
        address: 'वाकड़, पुणे',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'n.balkawade@oasisfertility.com',
        hours: 'सोम-शुक्र 9AM-5PM',
        specializations: 'इनफर्टिलिटी विशेषज्ञ, आईवीएफ, प्रजनन विज्ञान, मिनिमल एक्सेस सर्जरी',
        bookingLink: 'https://www.oasisfertility.com',
        rating: '4.7/5 (39 समीक्षाएँ)'
    },
    {
        name: 'डॉ. वैशाली चव्हाण',
        image: '',
        credentials: 'एमडी, डीजीओ, डीएनबी, डिप्लोमा एंडोस्कोपी (जर्मनी)',
        experience: '25+ वर्षों का अनुभव',
        hospital: 'क्लाउडनाइन हॉस्पिटल',
        address: 'कल्याणी नगर, पुणे',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'v.chavan@cloudninecare.com',
        hours: 'मंगल, गुरु, शनि 11AM-4PM',
        specializations: 'एंडोस्कोपिक सर्जरी, हिस्टेरेक्टोमी, मेनोपॉज प्रबंधन, फाइब्रॉइड्स',
        bookingLink: 'https://www.cloudninecare.com',
        rating: '4.7/5 (150 समीक्षाएँ)'
    }
],

Ahmedabad : [
    {
        name: 'डॉ. अल्पना पटेल',
        image: '',
        credentials: 'एमबीबीएस, डीजीओ, एफओजीएसआई',
        experience: '16+ वर्षों का अनुभव',
        hospital: 'CIMS अस्पताल',
        address: 'ऑफ साइंस सिटी रोड, सोला, अहमदाबाद - 380060',
        phone: '+91 79 2771 2771',
        email: 'a.patel@cimshospitals.com',
        hours: 'सोम-शनि 10AM-7PM',
        specializations: 'हाई-रिस्क प्रेग्नेंसी, लैप्रोस्कोपिक सर्जरी, भ्रूण अल्ट्रासाउंड',
        bookingLink: 'https://www.cims.org',
        rating: '4.7/5 (195 समीक्षाएँ)'
    },
    {
        name: 'डॉ. मनीष शाह',
        image: '',
        credentials: 'एमएस (OB/GYN), डीएनबी',
        experience: '23+ वर्षों का अनुभव',
        hospital: 'ट्यूलिप विमेंस हॉस्पिटल',
        address: 'सेटेलाइट, अहमदाबाद',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'm.shah@tulipwomenshospital.com',
        hours: 'सोम-शुक्र 10AM-5PM',
        specializations: 'लैप्रोस्कोपिक सर्जरी, हाई-रिस्क प्रेग्नेंसी, इनफर्टिलिटी',
        bookingLink: 'https://www.practo.com',
        rating: '4.9/5 (17 समीक्षाएँ)'
    },
    {
        name: 'डॉ. उषा बोहरा',
        image: '',
        credentials: 'एमडी (OBG)',
        experience: '34+ वर्षों का अनुभव',
        hospital: 'अपोलो अस्पताल',
        address: 'भाट, गांधी नगर बाईपास, अहमदाबाद',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'u.bohra@apollohospitals.com',
        hours: 'सोम-शुक्र 10AM-12PM',
        specializations: 'हाई-रिस्क प्रेग्नेंसी, स्त्री कैंसर विज्ञान, गर्भाशय फाइब्रॉइड्स',
        bookingLink: 'https://www.apollohospitals.com',
        rating: '4.7/5 (10 समीक्षाएँ)'
    },
    {
        name: 'डॉ. भौमिक शाह',
        image: '',
        credentials: 'एमडी (OBG)',
        experience: '21+ वर्षों का अनुभव',
        hospital: 'श्री श्रीजी हॉस्पिटल',
        address: 'गोटा, अहमदाबाद',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'b.shah@shreejihospital.com',
        hours: 'सोम-शनि 10:30AM-1:30PM',
        specializations: 'इनफर्टिलिटी ट्रीटमेंट, पीसीओएस, सामान्य एवं सिजेरियन डिलीवरी',
        bookingLink: 'https://www.practo.com',
        rating: '5.0/5 (525 समीक्षाएँ)'
    },
    {
        name: 'डॉ. रंजन जोशी',
        image: '',
        credentials: 'एमडी गाइनेकोलॉजी, एमबीबीएस',
        experience: '39+ वर्षों का अनुभव',
        hospital: 'डॉ. जोशी मैटरनिटी एवं स्त्री रोग अस्पताल',
        address: 'एलिस ब्रिज, अहमदाबाद',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'r.joshi@drjoshishospital.com',
        hours: 'सोम-शनि 11AM-5PM',
        specializations: 'आम स्त्री रोग, माहवारी विकार, मेनोपॉज प्रबंधन',
        bookingLink: 'https://www.practo.com',
        rating: '4.7/5 (224 समीक्षाएँ)'
    },
    {
        name: 'डॉ. दीप्ति जैन',
        image: '',
        credentials: 'एमएस - ऑब्स्टेट्रिक्स एंड गाइनेकोलॉजी',
        experience: '18+ वर्षों का अनुभव',
        hospital: 'विमेंस क्लिनिक इंडिया',
        address: 'पलड़ी, अहमदाबाद',
        phone: 'अनुरोध पर उपलब्ध',
        email: 'd.jain@womensclinicindia.com',
        hours: 'सोम-शनि 11AM-1:30PM',
        specializations: 'मासिक धर्म समस्याएं, स्त्री समस्याएं, महिला यौन समस्याएं, पीसीओडी',
        bookingLink: 'https://www.lybrate.com',
        rating: '4.8/5 (130 समीक्षाएँ)'
    }
  ]
};

// ========================================================================
// FAQS ARRAY
// ========================================================================
const faqs = [
    {
        question: 'How often should I visit a gynecologist?',
        answer: 'Women should have an annual wellness visit with a gynecologist starting from age 13-15. Pap smears for cervical cancer screening should begin at age 21 and continue every 3 years (ages 21-29) or every 3-5 years with HPV co-testing (ages 30-65). However, you should see your gynecologist sooner if you experience unusual symptoms like abnormal bleeding, severe pain, or unusual discharge.',
        citation: '<a href="https://www.cdc.gov/cervical-cancer/prevention/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Reducing Risk for Cervical Cancer. 2025.</a>'
    },
    {
        question: 'What are the most common signs of PCOS?',
        answer: 'The most common signs of PCOS include **irregular or absent periods**, **excess body/facial hair (hirsutism)**, **severe acne**, and **difficulty losing weight**. A diagnosis requires at least two of the following: irregular periods, high androgen levels, and/or polycystic ovaries visible on ultrasound.',
        citation: '<a href="https://www.cdc.gov/diabetes/basics/PCOS.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. PCOS and Diabetes. 2023.</a>'
    },
    {
        question: 'Is it safe to exercise during pregnancy?',
        answer: 'Yes, for most women, exercise during pregnancy is not only safe but recommended. It can reduce back pain, ease constipation, and decrease the risk of gestational diabetes and preeclampsia. It\'s important to choose low-impact activities like walking, swimming, and prenatal yoga, and always **consult your doctor** before starting any new exercise routine.',
        citation: '<a href="https://www.acog.org/womens-health/faqs/exercise-during-pregnancy" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACOG. Exercise During Pregnancy FAQ. 2022.</a>'
    },
    {
        question: 'What is the importance of the HPV vaccine?',
        answer: 'The Human Papillomavirus (HPV) vaccine prevents infection with the types of HPV that cause about 90% of cervical cancers, as well as most anal, vaginal, vulvar, penile, and oropharyngeal cancers. It is recommended for **all children at age 11 or 12** and can be given up to age 26. Vaccination is one of the most effective ways to prevent HPV-related cancers.',
        citation: '<a href="https://www.cdc.gov/hpv/parents/questions-answers.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. HPV Vaccine Q&A. 2023.</a>'
    },
    {
        question: 'What lifestyle changes can help manage endometriosis pain?',
        answer: 'While medication and surgery are primary treatments, lifestyle changes can significantly manage symptoms. These include: **Anti-inflammatory diet** (reducing red meat, caffeine, and alcohol), **regular, gentle exercise** (like yoga and walking), **heat therapy** (hot baths/pads), and **stress management** (meditation, adequate sleep).',
        citation: '<a href="https://www.endometriosis.org/resources/articles/nutrition" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">World Endometriosis Society. Nutrition and Diet. 2020.</a>'
    },
    {
        question: 'When should I start getting a mammogram?',
        answer: 'The guidelines vary, but the **American Cancer Society (ACS)** recommends women with an average risk start yearly mammograms between the ages of **40 and 44** and continue yearly screening from age 45 to 54. After age 55, women can switch to mammograms every two years or continue yearly screening. Women with a high risk should start earlier.',
        citation: '<a href="https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection/american-cancer-society-guidelines-for-the-early-detection-of-cancer.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">American Cancer Society. Screening Guidelines. 2024.</a>'
    },
    {
        question: 'Is it normal to experience mood changes during menopause?',
        answer: 'Yes, it is very common. The fluctuating and eventually declining levels of estrogen and progesterone during perimenopause and menopause can significantly impact brain chemistry, often leading to **mood swings, anxiety, irritability, and depressive episodes**. Treatment options include Hormone Replacement Therapy (HRT) and counseling.',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/menopause/symptoms-causes/syc-20353390" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Menopause Mood Changes. 2023.</a>'
    },
    {
        question: 'What is the difference between PMS and PMDD?',
        answer: 'Both are premenstrual disorders, but **PMDD (Premenstrual Dysphoric Disorder) is a severe form of PMS**. While PMS causes mild symptoms like bloating and moodiness, PMDD causes severe depression, anxiety, extreme irritability, and feelings of being out of control. PMDD is a serious, diagnosable condition that significantly interferes with daily life and requires professional treatment.',
        citation: '<a href="https://www.hopkinsmedicine.org/health/conditions-and-diseases/premenstrual-dysphoric-disorder-pmdd" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Johns Hopkins Medicine. PMDD Information. 2024.</a>'
    },
    {
        question: 'How do I know if I have a yeast infection or Bacterial Vaginosis (BV)?',
        answer: 'They have different symptoms. A **Yeast Infection** typically causes **thick, white, cottage-cheese-like discharge** with intense **itching** but no strong odor. **Bacterial Vaginosis (BV)** typically causes **thin, gray, or green discharge** with a characteristic strong, **"fishy" odor**. It is crucial to see a doctor for diagnosis as both require different treatments (antifungal for yeast, antibiotics for BV).',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/vaginitis/expert-answers/yeast-infection-bacterial-vaginosis/faq-20058257" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Yeast vs. BV. 2023.</a>'
    },
    {
        question: 'Why are women more prone to autoimmune diseases?',
        answer: 'Approximately 75% of people affected by autoimmune diseases are women. The reasons are complex but thought to be linked to **hormonal factors** (especially estrogen), **genetic factors** (the X chromosome contains many immune-related genes), and differences in the female immune response, which is generally more robust but also more prone to misfiring.',
        citation: '<a href="https://www.frontiersin.org/articles/10.3389/fimmu.2019.01439/full" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Frontiers in Immunology. Sex Differences in Autoimmunity. 2019.</a>'
    }
];

const hi_faqs = [
    {
        question: 'मैं कितनी बार गाइनेकोलॉजिस्ट के पास जाऊं?',
        answer: 'महिलाओं को 13-15 वर्ष की उम्र से हर साल गाइनेकोलॉजिस्ट से वेलनेस विजिट करानी चाहिए। सर्वाइकल कैंसर स्क्रीनिंग के लिए पैप स्मीयर 21 वर्ष की उम्र से शुरू होकर 21-29 वर्ष की उम्र में हर 3 वर्ष, और 30-65 वर्ष की उम्र में हर 3-5 वर्ष में HPV को-टेस्ट के साथ करवाना चाहिए। अगर आपको असामान्य ब्लीडिंग, तीव्र दर्द या अजीब डिस्चार्ज जैसी समस्याएँ हों तो तुरंत डॉक्टर से मिलें।',
        citation: '<a href="https://www.cdc.gov/cervical-cancer/prevention/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Reducing Risk for Cervical Cancer. 2025.</a>'
    },
    {
        question: 'PCOS के सबसे आम लक्षण क्या हैं?',
        answer: '**अनियमित या अनुपस्थित पीरियड्स**, **अत्यधिक बाल/चेहरे पर बाल (हिरसुटिज्म)**, **गंभीर मुंहासे**, और **वजन कम करने में कठिनाई** PCOS के सबसे आम लक्षण हैं। डायग्नोसिस के लिए इनमें से दो: अनियमित पीरियड्स, हाई एंड्रोजन स्तर या अल्ट्रासाउंड में पॉलीसिस्टिक ओवरीज़ जरूर हों।',
        citation: '<a href="https://www.cdc.gov/diabetes/basics/PCOS.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. PCOS and Diabetes. 2023.</a>'
    },
    {
        question: 'क्या गर्भावस्था के दौरान व्यायाम करना सुरक्षित है?',
        answer: 'हाँ, अधिकांश महिलाओं के लिए गर्भावस्था में व्यायाम सुरक्षित ही नहीं बल्कि फायदेमंद है। इससे पीठ दर्द, कब्ज, और गर्भकालीन मधुमेह एवं प्रीक्लेम्प्सिया का जोखिम कम होता है। हल्के व्यायाम जैसे चलना, तैराकी, प्रीनेटल योग करें और कोई भी नया व्यायाम शुरू करने से पहले अपने डॉक्टर से जरूर सलाह लें।',
        citation: '<a href="https://www.acog.org/womens-health/faqs/exercise-during-pregnancy" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">ACOG. Exercise During Pregnancy FAQ. 2022.</a>'
    },
    {
        question: 'HPV वैक्सीन का महत्व क्या है?',
        answer: 'ह्यूमन पैपिलोमावायरस (HPV) वैक्सीन लगभग 90% सर्वाइकल कैंसर और अधिकतर गुदा, योनि, वल्वा, लिंग और ओरल कैंसर के कारण बनने वाले HPV टाइप्स से बचाव करता है। यह सभी बच्चों को 11 या 12 वर्ष की उम्र में लगवाने की सलाह दी जाती है और 26 वर्ष तक दी जा सकती है। टीकाकरण HPV से जुड़ी बीमारियों की रोकथाम के लिए बहुत जरूरी है।',
        citation: '<a href="https://www.cdc.gov/hpv/parents/questions-answers.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. HPV Vaccine Q&A. 2023.</a>'
    },
    {
        question: 'एंडोमेट्रियोसिस दर्द को कम करने के लिए कौन से लाइफस्टाइल बदलाव मदद कर सकते हैं?',
        answer: 'दवाओं और सर्जरी के साथ-साथ लाइफस्टाइल में बदलाव से भी लक्षणों में काफी राहत मिल सकती है। इसमें शामिल है: **एंटी-इंफ्लेमेटरी डाइट** (रेड मीट, कैफीन और शराब कम करें), **नियमित हल्का व्यायाम** (योग और चलना), **हीट थेरेपी** (गर्म स्नान/पैड), और **तनाव प्रबंधन** (मेडिटेशन, पर्याप्त नींद)।',
        citation: '<a href="https://www.endometriosis.org/resources/articles/nutrition" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">World Endometriosis Society. Nutrition and Diet. 2020.</a>'
    },
    {
        question: 'मेमोग्राम कब शुरू करवाना चाहिए?',
        answer: '**अमेरिकन कैंसर सोसाइटी (ACS)** के अनुसार सामान्य जोखिम वाली महिलाएं 40-44 साल की उम्र में सालाना मैमोग्राम शुरू करें और 45-54 वर्ष तक हर साल जारी रखें। 55 वर्ष के बाद दो साल में एक बार या हर साल जांच जारी रखें। उच्च जोखिम वाली महिलाओं को जल्दी शुरुआत करने की सलाह दी जाती है।',
        citation: '<a href="https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection/american-cancer-society-guidelines-for-the-early-detection-of-cancer.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">American Cancer Society. Screening Guidelines. 2024.</a>'
    },
    {
        question: 'मेनोपॉज़ के दौरान मूड बदलना सामान्य है?',
        answer: 'हाँ, यह बहुत सामान्य है। परिमेनोपॉज़ और मेनोपॉज़ में एस्ट्रोजन व प्रोजेस्टेरोन हार्मोन के घटते स्तर से दिमागी कैमिस्ट्री प्रभावित होती है, जिससे **मूड बदलना, चिंता, चिड़चिड़ापन या डिप्रेशन** होता है। इलाज में हॉर्मोन रिप्लेसमेंट थेरेपी (HRT) और काउंसलिंग शामिल है।',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/menopause/symptoms-causes/syc-20353390" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Menopause Mood Changes. 2023.</a>'
    },
    {
        question: 'PMS और PMDD में क्या अंतर है?',
        answer: 'दोनों प्रीमेनस्ट्रुअल डिसऑर्डर्स हैं, लेकिन **PMDD (प्रीमेनस्ट्रुअल डिस्फोरिक डिसऑर्डर) PMS का गंभीर रूप है**। जहां PMS हल्के लक्षण जैसे ब्लोटिंग और मूड बदलना देता है, वहीं PMDD में गंभीर डिप्रेशन, चिंता, ज्यादा चिड़चिड़ापन और नियंत्रण खोने की भावना होती है। यह गंभीर बीमारी है जिसमें डॉक्टर की सलाह जरूरी है।',
        citation: '<a href="https://www.hopkinsmedicine.org/health/conditions-and-diseases/premenstrual-dysphoric-disorder-pmdd" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Johns Hopkins Medicine. PMDD Information. 2024.</a>'
    },
    {
        question: 'मेरे पास यीस्ट संक्रमण है या बैक्टीरियल वेजिनोसिस (BV), कैसे जानें?',
        answer: 'इनके लक्षण अलग होते हैं। **यीस्ट इंफेक्शन** में आमतौर पर मोटा, सफेद, दही जैसा डिस्चार्ज और तीव्र खुजली होती है लेकिन बदबू नहीं होती। **BV** में पतला, ग्रे या हरा डिस्चार्ज और विशिष्ट मछली जैसी गंध होती है। सही उपचार के लिए डॉक्टर से जांच कराएं, क्योंकि अलग-अलग उपचार लगते हैं।',
        citation: '<a href="https://www.mayoclinic.org/diseases-conditions/vaginitis/expert-answers/yeast-infection-bacterial-vaginosis/faq-20058257" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Mayo Clinic. Yeast vs. BV. 2023.</a>'
    },
    {
        question: 'महिलाएं ऑटोइम्यून बीमारियों के प्रति ज्यादा संवेदनशील क्यों होती हैं?',
        answer: 'लगभग 75% ऑटोइम्यून रोग महिलाएं प्रभावित होती हैं। इसके पीछे हार्मोनल कारण (खासकर एस्ट्रोजन), आनुवांशिक कारण (X क्रोमोसोम में ज्यादा इम्यून-जीन) और मजबूत महिला इम्यून सिस्टम की प्रवृत्ति प्रमुख मानी जाती है।',
        citation: '<a href="https://www.frontiersin.org/articles/10.3389/fimmu.2019.01439/full" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Frontiers in Immunology. Sex Differences in Autoimmunity. 2019.</a>'
    }
];

let currentFaqs = faqs; // default as English

// ========================================================================
// NEW DATA STRUCTURES FOR EMPTY SECTIONS
// ========================================================================


const whenToSeeData = [

    {
        question: '📅 First Gynecologist Visit (Ages 13-15)',
        answer: 'The first visit should be between ages 13 and 15, focusing on a basic check-up, health history, and addressing general questions. A pelvic exam is usually *not* needed unless there are specific symptoms or concerns.'
    },
    {
        question: '🩸 Abnormal Bleeding or Pain',
        answer: 'You should see a gynecologist immediately if you experience:<br><br>• <strong>Heavy or prolonged periods (Menorrhagia):</strong> Soaking through pads/tampons hourly, periods lasting >7 days<br>• <strong>Bleeding between periods (Spotting):</strong> Any bleeding outside of your normal cycle<br>• <strong>Bleeding after menopause:</strong> This is a key warning sign for uterine or cervical cancer<br>• <strong>Severe pelvic pain:</strong> Debilitating menstrual cramps (Dysmenorrhea) or chronic pelvic pain',
        citation: 'American College of Obstetricians and Gynecologists (ACOG). FAQs: Abnormal Uterine Bleeding. 2024.'
    },
    {
        question: '🦠 Suspected Infection or Abnormal Discharge',
        answer: 'Consult your doctor if you notice:<br><br>• <strong>Persistent abnormal discharge:</strong> Unusual color (yellow, green, gray), texture, or amount<br>• <strong>Foul odor:</strong> Especially a "fishy" odor<br>• <strong>Severe itching or burning:</strong> In the vaginal or vulvar area<br>• <strong>Painful urination (Dysuria):</strong> Often a sign of UTI or STI<br><br>Early treatment of infections like PID is vital to prevent long-term complications like infertility.',
        citation: 'CDC. Common Reproductive Health Concerns for Women. 2025.'
    },
    {
        question: '🤱 Pregnancy, Preconception, and Contraception',
        answer: 'Schedule a visit for:<br><br>• <strong>Preconception counseling:</strong> Before trying to conceive<br>• <strong>Confirming pregnancy:</strong> Starting prenatal care is crucial<br>• <strong>Contraception management:</strong> Discussing birth control options, IUD insertion/removal<br>• <strong>Infertility concerns:</strong> After 12 months of trying (or 6 months if over 35)',
        citation: 'American College of Obstetricians and Gynecologists (ACOG). Initial Prenatal Care. 2023.'
    },
    {
        question: '🩺 Annual Wellness & Routine Screening',
        answer: 'Even if you feel perfectly healthy, you should visit a gynecologist annually for a well-woman exam, which includes:<br><br>• <strong>Pelvic exam:</strong> Checking for reproductive organ health<br>• <strong>Pap smear:</strong> Cervical cancer screening (typically every 3-5 years, depending on age/risk)<br>• <strong>Breast exam:</strong> Clinical breast exam (CBE) and mammogram referral<br>• <strong>Contraception/STI counseling</strong>',
        citation: 'U.S. Preventive Services Task Force (USPSTF). Screening for Cervical Cancer. 2024.'
    },
    {
        question: '🍈 Breast Lumps or Nipple Changes',
        answer: 'Seek medical attention if you find:<br><br>• <strong>A new lump or thickening:</strong> In the breast or underarm area<br>• <strong>Changes in size or shape of the breast</strong><br>• <strong>Nipple discharge:</strong> Especially if bloody or spontaneous<br>• <strong>Skin changes:</strong> Dimpling, puckering, redness, or "orange peel" texture',
        citation: 'American Cancer Society (ACS). Breast Cancer Early Detection. 2023.'
    },
    {
        question: '👵 Menopause Symptoms or Post-Menopausal Concerns',
        answer: 'It\'s important to consult a specialist for:<br><br>• <strong>Severe hot flashes or night sweats</strong><br>• <strong>Vaginal dryness or painful intercourse</strong><br>• <strong>Mood changes</strong> impacting quality of life<br>• <strong>Bleeding after menopause:</strong> *Crucial to check for endometrial cancer*',
        citation: 'National Institute on Aging (NIA). Menopause: Symptoms and Treatments. 2024.'
    },
    {
        question: '🚨 Persistent Bloating or Unexplained Fatigue (Cancer Red Flags)',
        answer: 'You must seek urgent medical evaluation if you experience:<br><br>• <strong>Persistent bloating:</strong> Abdominal swelling lasting >2 weeks<br>• <strong>Unexplained weight loss:</strong> Losing weight without trying<br>• <strong>Pelvic pressure:</strong> Feeling of fullness or heaviness<br>• <strong>Fatigue:</strong> Extreme tiredness not relieved by rest<br>• <strong>Changes in bowel/bladder habits:</strong> Persistent changes<br>• <strong>Post-menopausal bleeding:</strong> Any bleeding after menopause<br><br>Early detection of ovarian, uterine, or cervical cancer dramatically improves survival rates. Regular screenings save lives.',
        citation: 'American Cancer Society (ACS). Signs and Symptoms of Gynecologic Cancers. 2024.'
    },
    {
        question: '🤰 Routine Pap Smear Screening (Ages 21+)',
        answer: 'Cervical cancer screening (Pap test) begins at age 21, regardless of sexual history. The recommended frequency is every 3 years for ages 21-29. For ages 30-65, co-testing (Pap + HPV) is done every 5 years, or Pap alone every 3 years.'
    },
    {
        question: '🧘‍♀️ Abnormal Symptoms',
        answer: 'Schedule an appointment immediately if you experience: **Abnormal vaginal bleeding** (between periods, after sex, or after menopause), **severe pelvic pain**, **unusual or foul-smelling discharge**, **breast lump or sudden change in breast appearance**, or **painful intercourse**.'
    },
    {
        question: '📅 Annual Wellness Check',
        answer: 'An annual wellness visit is recommended for all women to discuss birth control, STI prevention, vaccination updates, and mental health, even if no physical exam is required.'
    }
];
const hi_whenToSeeData = [
    {
        question: '📅 पहली महिला चिकित्सक विज़िट (आयु 13-15)',
        answer: 'पहली बार किशोरावस्था (13 से 15 वर्ष) में महिला चिकित्सक से मिलना चाहिए। इसमें सामान्य जांच, स्वास्थ्य इतिहास व सामान्य प्रश्नों पर चर्चा होती है। विशेष लक्षण या समस्या न हो तो आमतौर पर पेल्विक जांच आवश्यक नहीं होती।'
    },
    {
        question: '🩸 असामान्य रक्तस्राव या दर्द',
        answer: 'यदि आपको नीचे दिए गए लक्षण हों तो तुरंत स्त्री रोग विशेषज्ञ से मिलें:<br><br>• <strong>बहुत अधिक या लंबे समय तक माहवारी (Menorrhagia):</strong> हर घंटे पैड/टैम्पोन पूरा भीगना, पीरियड्स 7 दिन से ज्यादा<br>• <strong>माहवारी के बीच में रक्तस्राव (Spotting):</strong> नियमित चक्र के अलावा किसी भी समय खून आना<br>• <strong>रजोनिवृत्ति के बाद रक्तस्राव:</strong> गर्भाशय या गर्भाशयग्रीवा (सर्विक्स) कैंसर का संकेत<br>• <strong>गंभीर पेल्विक दर्द:</strong> असहनीय माहवारी दर्द (Dysmenorrhea) या लगातार पेल्विक दर्द',
        citation: '[translate:American College of Obstetricians and Gynecologists (ACOG). FAQs: Abnormal Uterine Bleeding. 2024.]'
    },
    {
        question: '🦠 संक्रमण का संदेह या असामान्य डिस्चार्ज',
        answer: 'डॉक्टर से अवश्य मिलें यदि आपको नीचे दिए गए लक्षण हों:<br><br>• <strong>लगातार असामान्य डिस्चार्ज:</strong> रंग (पीला, हरा, ग्रे), मात्रा या गाढ़ा/पतला<br>• <strong>तेज दुर्गंध:</strong> विशेष रूप से बदबूदार \"फिशी\" गंध<br>• <strong>तीव्र जलन या खुजली:</strong> योनि या बाहर<br>• <strong>पेशाब में दर्द (Dysuria):</strong> पेशाब करते समय जलन — प्रायः यूटीआई/STI का संकेत<br><br>PID जैसे संक्रमण का तुरंत इलाज करवाना जरूरी है, ताकि आगे चलकर बांझपन जैसी जटिलता न हो।',
        citation: '[translate:CDC. Common Reproductive Health Concerns for Women. 2025.]'
    },
    {
        question: '🤱 गर्भावस्था, गर्भधारण पूर्व परामर्श, एवं परिवार नियोजन',
        answer: 'इन स्थितियों के लिए डॉक्टर से मिलें:<br><br>• <strong>गर्भधारण पूर्व परामर्श:</strong> गर्भ ठहराने से पहले<br>• <strong>गर्भावस्था की पुष्टि:</strong> प्रसव पूर्व देखभाल प्रारंभ करें<br>• <strong>परिवार नियोजन:</strong> गर्भनिरोधक विकल्प, IUD लगवाना/निकालना<br>• <strong>बांझपन चिंता:</strong> 12 महीने की कोशिश के बाद (या 35 वर्ष से अधिक होने पर 6 माह के भीतर)',
        citation: '[translate:American College of Obstetricians and Gynecologists (ACOG). Initial Prenatal Care. 2023.]'
    },
    {
        question: '🩺 वार्षिक स्वास्थ्य जांच और नियमित स्क्रीनिंग',
        answer: 'स्वस्थ महसूस कर रही हों तब भी हर महिला को हर साल गाइनिकोलॉजिस्ट से जांच करानी चाहिए, जिसमें शामिल हैं:<br><br>• <strong>पेल्विक जांच:</strong> प्रजनन अंगों का स्वास्थ्य जाँच<br>• <strong>पैप स्मीयर:</strong> गर्भाशयग्रीवा कैंसर की स्क्रीनिंग (3-5 वर्ष में एक बार, उम्र और जोखिम के अनुसार)<br>• <strong>स्तन परीक्षा:</strong> क्लिनिकल ब्रेस्ट एग्ज़ाम और मैमोग्राम सलाह<br>• <strong>गर्भनिरोधक/एसटीआई सलाह:</strong>',
        citation: '[translate:U.S. Preventive Services Task Force (USPSTF). Screening for Cervical Cancer. 2024.]'
    },
    {
        question: '🍈 स्तन में गांठ या निप्पल में बदलाव',
        answer: 'यदि आपको नीचे दिए गए बदलाव दिखें तो डॉक्टर से मिलें:<br><br>• <strong>नई गांठ या कठोरता:</strong> स्तन या बगल में<br>• <strong>स्तन के आकार या रूप में बदलाव</strong><br>• <strong>निप्पल डिस्चार्ज:</strong> खासकर यदि खून हो या अपने-आप निकलता हो<br>• <strong>त्वचा में बदलाव:</strong> सिकुड़न, गढ्डा, लालिमा, या \"संतरे के छिलके\" जैसा रूप',
        citation: '[translate:American Cancer Society (ACS). Breast Cancer Early Detection. 2023.]'
    },
    {
        question: '👵 रजोनिवृत्ति के लक्षण या रजोनिवृत्ति के बाद की चिंता',
        answer: 'इन स्थितियों में डॉक्टर अवश्य दिखाएँ:<br><br>• <strong>बहुत तेज़ गरमाहट या रात में पसीना आना</strong><br>• <strong>योनि में सूखापन या यौन संबंध में दर्द</strong><br>• <strong>मूड बदलना</strong> जिससे रोजमर्रा जीवन प्रभावित हो<br>• <strong>रजोनिवृत्ति के बाद खून आना:</strong> *एंडोमेट्रियल कैंसर की जांच आवश्यक*',
        citation: '[translate:National Institute on Aging (NIA). Menopause: Symptoms and Treatments. 2024.]'
    },
    {
        question: '🚨 लगातार सूजन या असामान्य थकान (कैंसर के रेड फ्लैग्स)',
        answer: 'यदि ये लक्षण हों तो तुरंत डॉक्टर से मिलें:<br><br>• <strong>लगातार पेट फूलना:</strong> 2 हफ्ते से ज्यादा<br>• <strong>बिना वजह वजन घटना:</strong> वजन खुद-ब-खुद कम होना<br>• <strong>पेल्विक दबाव:</strong> पेट में भारीपन<br>• <strong>थकान:</strong> आराम के बाद भी दूर न हो<br>• <strong>मल/पेशाब करने की आदत में बदलाव</strong><br>• <strong>रजोनिवृत्ति के बाद खून आना:</strong> किसी भी तरह का रक्तस्राव<br><br>गर्भाशय, अंडाशय या ग्रीवा कैंसर की जल्द जांच और इलाज से बचाव संभव है। नियमित जांच जरूरी है।',
        citation: '[translate:American Cancer Society (ACS). Signs and Symptoms of Gynecologic Cancers. 2024.]'
    },
    {
        question: '🤰 नियमित पैप स्मीयर (21 वर्ष से ऊपर)',
        answer: 'गर्भाशयग्रीवा कैंसर जांच (Pap test) की शुरुआत 21 साल की उम्र में होती है, चाहे यौन संबंध हुए हों या नहीं। 21-29 साल में हर 3 साल पर जांच। 30-65 में को-टेस्ट (पैप+HPV) हर 5 साल या सिर्फ पैप हर 3 साल में।'
    },
    {
        question: '🧘‍♀️ असामान्य लक्षण',
        answer: 'यदि आपको ये लक्षण हों तो तुरंत डॉक्टर से अपॉइंटमेंट लें: **असामान्य योनि रक्तस्राव** (माहवारी के बीच, सहवास के बाद या रजोनिवृत्ति के बाद), **काफी तेज पेल्विक दर्द**, **असामान्य या बदबूदार डिस्चार्ज**, **स्तन में गांठ या अचानक दिखने में बदलाव**, या **यौन संबंध में दर्द**।'
    },
    {
        question: '📅 वार्षिक स्वास्थ्य जांच',
        answer: 'हर महिला के लिए साल में एक बार डॉक्टर से सलाह जरूरी है, जिसमें गर्भनिरोधक, एसटीआई से बचाव, टीकाकरण और मानसिक स्वास्थ्य की चर्चा हो, भले ही शारीरिक जांच हमेशा जरूरी न हो।'
    }
];

const preventionData = [

    {
        question: '🏃‍♀️ Regular Exercise',
        answer: 'The American Cancer Society recommends at least 150 minutes of moderate-intensity physical activity per week for breast cancer prevention. Physical activity helps regulate hormones, manage weight, reduce stress, and improve overall reproductive health. For women with family history of breast cancer, adherence to exercise guidelines is associated with 44-53% lower overall mortality.<br><br><strong>Benefits:</strong> Reduced menstrual cramps, better hormone balance, lower risk of PCOS complications, improved fertility, significant breast cancer risk reduction.<br><br><em><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9455068/" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">📚 Exercise Guidelines for Cancer Prevention - NIH 2022</a></em>',
        citation: 'American Cancer Society (ACS). Exercise and Physical Activity. 2023.'
    },
    {
        question: '🍎 Balanced Nutrition & Healthy Weight',
        answer: 'Maintaining a healthy body weight is one of the most effective ways to lower the risk of many women\'s cancers (breast, endometrial, ovarian) and manage hormonal conditions like PCOS. A diet rich in fruits, vegetables, whole grains, and lean proteins, while limiting red and processed meats, sugar, and alcohol, is recommended.<br><br><strong>Key Diet Tips:</strong> Increase fiber intake, limit refined carbohydrates, ensure adequate Vitamin D and Calcium for bone health.<br><br><em><a href="https://www.who.int/news-room/fact-sheets/detail/cancer" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">📚 WHO Cancer Fact Sheet 2024</a></em>',
        citation: 'World Health Organization (WHO). Diet, Nutrition and the Prevention of Chronic Diseases. 2003.'
    },
    {
        question: '💉 Vaccinations (HPV & Flu)',
        answer: 'The **HPV vaccine** (Gardasil 9) protects against the types of Human Papillomavirus that cause over 90% of cervical cancers, as well as most anal, vaginal, vulvar, and oropharyngeal cancers. Recommended for ages 9-26, and a shared clinical decision for ages 27-45.<br><br>The **Flu vaccine** and **COVID-19 vaccine** are also crucial for overall health, especially during pregnancy.<br><br><em><a href="https://www.cdc.gov/cervical-cancer/prevention/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">📚 CDC - Reducing Risk for Cervical Cancer 2025</a></em>',
        citation: 'CDC. HPV Vaccine Recommendations. 2024.'
    },
    {
        question: '🩺 Screening Guidelines (Pap Smear & Mammography)',
        answer: 'Adhering to screening schedules is critical for early detection:<br><br>• <strong>Cervical Cancer Screening (Pap Smear):</strong> Begin at age 21. Pap test alone every 3 years (ages 21-29). Pap test + HPV test (co-testing) every 5 years (ages 30-65).<br>• <strong>Breast Cancer Screening (Mammography):</strong> The Women\'s Preventive Services Initiative (WPSI-HRSA) recommends average-risk women initiate mammography screening no earlier than age 40 and no later than age 50. Screening should occur at least biennially (every 2 years) and as frequently as annually. Continue screening through at least age 74 - age alone should not be the basis to discontinue screening.<br><br><strong>High-risk women:</strong> Those with BRCA mutations or strong family history should begin screening earlier and may need breast MRI in addition to mammography.<br><br><em><a href="https://www.hrsa.gov/womens-guidelines-2016" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">📚 WPSI Guidelines - HRSA 2016</a></em>',
        citation: 'U.S. Preventive Services Task Force (USPSTF). Screening for Breast Cancer. 2024. | USPSTF. Screening for Cervical Cancer. 2024.'
    },
    {
        question: '🧘‍♀️ Stress Management & Mental Health',
        answer: 'Chronic stress can disrupt the hormonal balance (e.g., cortisol levels), impacting the menstrual cycle, exacerbating conditions like PCOS and endometriosis, and increasing the risk of depression and anxiety, which are twice as common in women.<br><br><strong>Effective Strategies:</strong> Mindfulness, yoga, meditation, adequate sleep (7-9 hours), social connection, and seeking professional help (counseling or therapy) when needed.<br><br><em><a href="https://www.womenshealth.gov/mental-health/mental-health-conditions/depression" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">📚 Office on Women\'s Health - Depression 2021</a></em>',
        citation: 'National Institute of Mental Health (NIMH). Stress Management. 2023.'
    },

    {
        question: '🏋️‍♀️ Pelvic Floor Health & Kegel Exercises',
        answer: 'The pelvic floor muscles support the bladder, uterus, and bowels. Strengthening these muscles (via Kegels) is vital, particularly during pregnancy, after childbirth, and as you age. Women\'s health across the lifespan requires attention to pelvic floor strength.<br><br><strong>Benefits:</strong> Reduced incontinence risk, enhanced sexual satisfaction, better support for pelvic organs, improved recovery after childbirth, prevention of pelvic organ prolapse.<br><br><em><a href="https://www.cdc.gov/womens-health/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">📚 CDC Office of Women\'s Health 2025</a></em>',
        citation: 'American College of Obstetricians and Gynecologists (ACOG). Pelvic Floor Dysfunction. 2023.'
    },
    {
        question: '🛡️ Cervical Cancer Prevention',
        answer: 'Get the **HPV vaccine** (recommended for ages 9-26), and attend **regular Pap and HPV screenings** as recommended by your doctor. Use barrier methods like condoms to reduce the risk of HPV transmission.',
        citation: '<a href="https://www.cdc.gov/cancer/cervical/basic_info/prevention.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Cervical Cancer Prevention. 2023.</a>',
        icon: '🛡️'
    },
    {
        question: '🎀 Breast Cancer Prevention',
        answer: 'Perform **regular self-exams**, get **clinical breast exams** annually, and follow your doctor’s recommendations for **mammograms** (starting typically between 40-50). Maintain a healthy weight and limit alcohol intake.',
        citation: '<a href="https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">American Cancer Society. Screening Guidelines. 2024.</a>',
        icon: '🎀'
    },
    {
        question: '🏃‍♀️ PCOS and Diabetes Prevention',
        answer: 'Maintain a **healthy, stable weight**, engage in **regular physical exercise** (3-5 times a week), and follow a **balanced diet** low in highly processed foods and refined sugar to improve insulin sensitivity.',
        icon: '🏃‍♀️'
    },
    {
        question: '🦴 Bone Health (Osteoporosis) Prevention',
        answer: 'Ensure adequate daily intake of **Calcium and Vitamin D**. Engage in **weight-bearing exercises** (walking, jogging, dancing) to promote bone density, especially after menopause.',
        icon: '🦴'
    },

    {
        question: "🛡️ Sexual Violence Prevention & Safety",
        answer: "Protect against sexual violence by staying aware, learning consent, practicing safe relationships, and supporting community prevention efforts—early education and empowerment are key.",
        icon: "🛡️"
    },
    {
        question: "💚 Mental Health: Depression & Anxiety Prevention",
        answer: "Prevent depression and anxiety by maintaining regular exercise, a healthy diet, strong social support, adequate sleep, and seeking help if you notice persistent mood changes.",
        icon: "💚"
    },

    {
        question: "⚖️ Obesity Prevention & Weight Management",
        answer: "Maintain a healthy weight through regular physical activity and a balanced diet—obesity increases the risk of heart disease, diabetes, and hormone-related cancers in women; even modest weight loss (5-10%) substantially improves health outcomes",
        icon: "⚖️"
    }
];

const hi_preventionData = [

    {
        question: '🏃‍♀️ नियमित व्यायाम',
        answer: 'अमेरिकन कैंसर सोसाइटी के अनुसार, स्तन कैंसर की रोकथाम के लिए हर सप्ताह कम से कम 150 मिनट मध्यम तीव्रता का व्यायाम ज़रूरी है। शारीरिक गतिविधि हार्मोन को संतुलित करती है, वजन नियंत्रित रखती है, तनाव कम करती है और सम्पूर्ण प्रजनन स्वास्थ्य सुधारती है। जिन महिलाओं के परिवार में स्तन कैंसर का इतिहास है, उनके लिए व्यायाम के दिशानिर्देशों का पालन करने से मृत्यु दर 44-53% तक कम होती है।<br><br><strong>लाभ:</strong> माहवारी में कम ऐंठन, बेहतर हार्मोन बैलेंस, पीसीओएस जटिलताएं घटती हैं, प्रजनन क्षमता सुधरती है, और स्तन कैंसर का बड़ा जोखिम कम होता है।<br><br><em><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9455068/" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">📚 Exercise Guidelines for Cancer Prevention - NIH 2022</a></em>',
        citation: 'American Cancer Society (ACS). Exercise and Physical Activity. 2023.'
    },
    {
        question: '🍎 संतुलित आहार व स्वस्थ वजन',
        answer: 'स्वस्थ शरीर का वजन बनाए रखना महिलाओं में कई कैंसर (स्तन, गर्भाशय, डिंबग्रंथि) के जोखिम को कम करता है और पीसीओएस जैसी हार्मोन संबंधी बीमारियों को नियंत्रित करने में मदद करता है। ताजे फल, सब्ज़ियाँ, साबुत अनाज और कम वसा वाले प्रोटीन का सेवन करें और लाल/प्रोसेस्ड मीट, चीनी व शराब सीमित मात्रा में लें।<br><br><strong>महत्वपूर्ण आहार सुझाव:</strong> फाइबर की मात्रा बढ़ाएँ, रिफाइंड कार्बोहाइड्रेट कम करें, हड्डियों के स्वास्थ्य के लिए विटामिन D व कैल्शियम पर्याप्त मात्रा में लें।<br><br><em><a href="https://www.who.int/news-room/fact-sheets/detail/cancer" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">📚 WHO Cancer Fact Sheet 2024</a></em>',
        citation: 'World Health Organization (WHO). Diet, Nutrition and the Prevention of Chronic Diseases. 2003.'
    },
    {
        question: '💉 टीकाकरण (HPV और फ्लू)',
        answer: '**HPV वैक्सीन** (Gardasil 9) 90% से अधिक गर्भाशयग्रीवा कैंसर के प्रकारों से, साथ ही अधिकतर गुदा, योनि, वुल्वा और गले के कैंसर से बचाता है। 9-26 वर्ष की आयु के लिए अनुशंसित है, और 27-45 वर्ष में डॉक्टरी सलाह पर दिया जा सकता है।<br><br>**फ्लू वैक्सीन** और **कोविड-19 वैक्सीन** भी समग्र स्वास्थ्य, विशेषकर गर्भावस्था में, ज़रूरी हैं।<br><br><em><a href="https://www.cdc.gov/cervical-cancer/prevention/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">📚 CDC - Reducing Risk for Cervical Cancer 2025</a></em>',
        citation: 'CDC. HPV Vaccine Recommendations. 2024.'
    },
    {
        question: '🩺 स्क्रीनिंग दिशानिर्देश (पैप स्मीयर एवं मैमोग्राफी)',
        answer: 'समयसमय पर स्क्रीनिंग करवाना आरंभिक पहचान के लिए महत्वपूर्ण है:<br><br>• <strong>गर्भाशयग्रीवा की स्क्रीनिंग (पैप स्मीयर):</strong> 21 साल की उम्र से शुरू करें। 21-29 साल में हर 3 साल पर केवल पैप टेस्ट। 30-65 में पैप+HPV को-टेस्ट हर 5 साल पर।<br>• <strong>स्तन कैंसर स्क्रीनिंग (मैमोग्राफी):</strong> WPSI-HRSA के अनुसार, औसत जोखिम वाली महिलाओं को 40 वर्ष से पहले और 50 से देर से शुरू नहीं करना चाहिए। कम से कम हर 2 साल पर स्क्रीनिंग करें और ज़रूरत पड़े तो सालाना कराएँ। 74 वर्ष तक जारी रखें, केवल उम्र के हिसाब से रोकें नहीं।<br><br><strong>ऊँचे जोखिम वाली महिलाएं:</strong> BRCA म्यूटेशन वाले या परिवार में तीव्र इतिहास हों तो पहले जांच शुरू करें, और मैमोग्राफी के साथ-साथ ब्रेस्ट MRI भी कराएँ।<br><br><em><a href="https://www.hrsa.gov/womens-guidelines-2016" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">📚 WPSI Guidelines - HRSA 2016</a></em>',
        citation: 'U.S. Preventive Services Task Force (USPSTF). Screening for Breast Cancer. 2024. | USPSTF. Screening for Cervical Cancer. 2024.'
    },
    {
        question: '🧘‍♀️ तनाव प्रबंधन एवं मानसिक स्वास्थ्य',
        answer: 'लगातार तनाव हार्मोन संतुलन (जैसे कोर्टिसोल) को बिगाड़ सकता है, माहवारी चक्र को प्रभावित कर सकता है, पीसीओएस व एंडोमेट्रियोसिस जैसी स्थितियाँ बढ़ा सकता है, और डिप्रेशन व एंग्ज़ायटी (जो महिलाओं में दुगनी होती है) का खतरा बढ़ाता है।<br><br><strong>प्रभावी तरीके:</strong> माइंडफुलनेस, योग, ध्यान, पर्याप्त नींद (7-9 घंटे), सामाजिक जुड़ाव, और जब ज़रूरत हो तब पेशेवर सलाह लें (काउंसलिंग/थेरेपी)।<br><br><em><a href="https://www.womenshealth.gov/mental-health/mental-health-conditions/depression" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">📚 Office on Women\'s Health - Depression 2021</a></em>',
        citation: 'National Institute of Mental Health (NIMH). Stress Management. 2023.'
    },

    {
        question: '🏋️‍♀️ पेल्विक फ्लोर स्वास्थ्य और केगल एक्सरसाइज़',
        answer: 'पेल्विक फ्लोर की मांसपेशियाँ मूत्राशय, गर्भाशय और आंतों को सहारा देती हैं। इन मांसपेशियों को (केगल एक्सरसाइज द्वारा) मजबूत करना ज़रूरी है, खासकर गर्भावस्था, प्रसव के बाद और बढ़ती उम्र में। महिला स्वास्थ्य के हर चरण पर पेल्विक फ्लोर स्ट्रेंथ का ध्यान रखना चाहिए।<br><br><strong>लाभ:</strong> मूत्र असंयम में कमी, यौन संतुष्टि में वृद्धि, पेल्विक अंगों का बेहतर समर्थन, प्रसव के बाद तेज़ सुधार, अंग ढीलापन से बचाव।<br><br><em><a href="https://www.cdc.gov/womens-health/index.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-info);">📚 CDC Office of Women\'s Health 2025</a></em>',
        citation: 'American College of Obstetricians and Gynecologists (ACOG). Pelvic Floor Dysfunction. 2023.'
    },
    {
        question: '🛡️ सर्विक्स कैंसर की रोकथाम',
        answer: '**HPV वैक्सीन** (सिफारिश 9-26 वर्ष के लिए) लगवाएँ, और डॉक्टर की सलाह के अनुसार **नियमित पैप एवं HPV स्क्रीनिंग** कराते रहें। HPV संक्रमण रोकने के लिए कंडोम जैसे बैरियर मेथड्स उपयोग करें।',
        citation: '<a href="https://www.cdc.gov/cancer/cervical/basic_info/prevention.htm" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">CDC. Cervical Cancer Prevention. 2023.</a>',
        icon: '🛡️'
    },
    {
        question: '🎀 स्तन कैंसर की रोकथाम',
        answer: '**नियमित स्वयं-परीक्षण** करें, हर साल **क्लिनिकल स्तन जांच** करवाएँ, और डॉक्टर की सलाह पर **मैमोग्राम्स** (आमतौर पर 40-50 वर्ष से शुरू) करवाएँ। स्वस्थ वजन बनाए रखें और शराब सीमित करें।',
        citation: '<a href="https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection.html" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">American Cancer Society. Screening Guidelines. 2024.</a>',
        icon: '🎀'
    },
    {
        question: '🏃‍♀️ पीसीओएस और डायबिटीज़ की रोकथाम',
        answer: '**स्वस्थ, स्थिर वजन** रखें, सप्ताह में 3-5 बार **नियमित व्यायाम** करें, और **संतुलित आहार** लें जिसमें प्रोसेस्ड फूड और परिष्कृत चीनी कम हो ताकि इंसुलिन संवेदनशीलता बढ़े।',
        icon: '🏃‍♀️'
    },
    {
        question: '🦴 हड्डियों का स्वास्थ्य (ऑस्टियोपोरोसिस) रोकथाम',
        answer: 'हर दिन पर्याप्त मात्रा में **कैल्शियम और विटामिन D** लें। **भार उठाने वाले व्यायाम** (जैसे चलना, दौड़ना, नृत्य) करें जिससे हड्डियों की गुणवत्ता बनी रहे, खासकर रजोनिवृत्ति के बाद।',
        icon: '🦴'
    },

    {
        question: "🛡️ लैंगिक हिंसा से बचाव और सुरक्षा",
        answer: "यौन हिंसा से सुरक्षा के लिए सजग रहें, सहमति (consent) समझें, स्वस्थ रिश्ते बनाए रखें, और सामुदायिक रोकथाम अभियानों को समर्थन दें—सुरक्षा व सशक्तिकरण के लिए पूर्व शिक्षा अत्यंत ज़रूरी है।",
        icon: "🛡️"
    },
    {
        question: "💚 मानसिक स्वास्थ्य: डिप्रेशन और एंग्ज़ायटी रोकथाम",
        answer: "नियमित व्यायाम, संतुलित आहार, मजबूत सामाजिक सपोर्ट, पर्याप्त नींद और मूड में लगातार बदलाव दिखे तो सहायता लें—इनसे डिप्रेशन और एंग्ज़ायटी से बचाव संभव है।",
        icon: "💚"
    },

    {
        question: "⚖️ मोटापा रोकथाम व वजन प्रबंधन",
        answer: "नियमित व्यायाम और संतुलित आहार से स्वस्थ वजन कायम रखें—मोटापा महिलाओं में दिल की बीमारी, डायबिटीज़ और हार्मोन संबंधी कैंसर की आशंका बढ़ाता है। सिर्फ 5-10% वजन कम करने से भी स्वास्थ्य में बेहद सुधार आ सकता है।",
        icon: "⚖️"
    }
];

//CHATBOT TAB INITIALIZATION CONSTANTS
// ========================================================================

// ====================
// HEALTH ASSISTANT CHATBOT DATA & LOGIC
// ====================

// Main menu options
const healthMainMenu = [
    "১. মাসিক সংক্রান্ত সমস্যা",
    "২. প্রজনন ও যৌন স্বাস্থ্য",
    "৩. PCOS (পলিসিস্টিক ওভারি সিনড্রোম) ও হরমোনজনিত সমস্যা",
    "৪. স্তন ও জরায়ু ক্যান্সার এবং অন্যান্য মহিলা-সম্পর্কিত ক্যান্সার",
    "৫. মানসিক স্বাস্থ্য",
    "৬. স্থূলতা, উচ্চ রক্তচাপ, আর্থ্রাইটিস এবং অন্যান্য দীর্ঘস্থায়ী রোগ"
];

// Sub-menu prompts
const healthPromptMap = {
    "menstrual_health": {
        "botPrompt": "আপনার মাসিক সংক্রান্ত কোন সমস্যা নিয়ে আলোচনা করতে চান?",
        "options": ["অনিয়মিত পিরিয়ড", "অতিরিক্ত রক্তপাত", "তীব্র ব্যথা (Dysmenorrhea)", "পিরিয়ড বন্ধ হয়ে যাওয়া (Amenorrhea)", "অন্যান্য সমস্যা"]
    },
    "reproductive_sexual_health": {
        "botPrompt": "প্রজনন স্বাস্থ্য সংক্রান্ত কোন বিষয়ে সাহায্য চান?",
        "options": ["গর্ভধারণে সমস্যা ও বন্ধ্যাত্ব",
                "যৌন স্বাস্থ্য ও যৌনবাহিত সংক্রমণ (STI)",
                "গর্ভনিরোধ ও পরিবার পরিকল্পনা",
                "গর্ভাবস্থা ও প্রসবোত্তর সমস্যা",
                "জরায়ু ফাইব্রয়েড ও এন্ডোমেট্রিওসিস"]
    },
    "PCOS_hormonal_health": {
    "botPrompt": "PCOS বা হরমোনজনিত সমস্যা নিয়ে জানতে চান?",
     "options": [
            "PCOS এর লক্ষণ ও নির্ণয়",
            "হরমোনের ভারসাম্যহীনতা ও অনিয়মিত মাসিক",
            "ওজন বৃদ্ধি ও বিপাকীয় সমস্যা",
            "খাদ্যাভ্যাস, ব্যায়াম ও জীবনযাত্রা",
            "PCOS-এ গর্ভধারণ ও চিকিৎসা"
        ]
    },
    "cancer_health": {
        "botPrompt": "ক্যান্সার সংক্রান্ত কোন বিষয়ে জানতে চান?",
        "options": ["স্তন ক্যান্সারের লক্ষণ", "জরায়ু ক্যান্সারের লক্ষণ", "স্ক্রিনিং ও পরীক্ষা", "প্রতিরোধ ও সচেতনতা", "অন্যান্য"]
    },

    "mental_health": {
        "botPrompt": "আপনার মানসিক স্বাস্থ্য সংক্রান্ত কোন সমস্যা নিয়ে আলোচনা করতে চান?",
        "options": ["বিষণ্ণতা ও মন খারাপ (Depression)","উদ্বেগ ও মানসিক চাপ (Anxiety & Stress)", "প্রসবোত্তর মানসিক সমস্যা (Postpartum Issues)",
            "ঘুমের সমস্যা ও অনিদ্রা",
            "অন্যান্য মানসিক স্বাস্থ্য সমস্যা"]
    },

    "other_health": {
        "botPrompt": "কোন স্বাস্থ্য সমস্যা নিয়ে জানতে চান?",
        "options": ["স্থূলতা ও ওজন নিয়ন্ত্রণ", "উচ্চ রক্তচাপ", "আর্থ্রাইটিস", "থাইরয়েড সমস্যা", "অন্যান্য"]
    }
};

// Map Bengali to English keys
const nextStateMap = {
        "১. মাসিক সংক্রান্ত সমস্যা": "menstrual_health",
        "২. প্রজনন ও যৌন স্বাস্থ্য": "reproductive_sexual_health",
        "৩. PCOS ও হরমোনজনিত সমস্যা": "PCOS_hormonal_health",
        "৪. স্তন ও জরায়ু ক্যান্সার এবং অন্যান্য মহিলা-সম্পর্কিত ক্যান্সার": "cancer_health",
        "৫. মানসিক স্বাস্থ্য": "mental_health",
        "৬. হৃদরোগ, ডায়াবেটিস এবং অন্যান্য দীর্ঘস্থায়ী রোগ": "other_health"
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
    const districtData = WOMENS_HEALTH_RESOURCES[district];
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
        handleContactConfirmation(message);
    }
    else if (appState.awaitingDistrictSelection) {
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

// Gynaeco COMMUNITY GROUP

// Ensure formData is initialized.
if (typeof formData === "undefined") {
  var formData = {};
}
// Get gynaecoType and community consent from form
formData.gynaecoType = document.getElementById('gynaecoType')?.value || "";
formData.joinCommunity = document.getElementById('joinCommunity')?.checked || false;



// Get gynaeco (disease) and community consent from form
const gynaecoType = document.getElementById('gynaecoType')?.value || "";
const joinCommunity = document.getElementById('joinCommunity')?.checked || false;
formData.gynaecoType = gynaecoType;
formData.joinCommunity = joinCommunity;

// Data for gynaeo community groups
const GYNAECO_COMMUNITY_GROUPS = {
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

// Display community groups based on selected gynaeco condition
function showRecommendedGroups(userGynaecoType) {
  const section = document.getElementById("patientGroupsSection");
  if (!section) return;

  section.innerHTML = `<h3 style="color: var(--color-primary); margin-bottom: 1rem;">Gyaneo Support Communities</h3>`;
  let groupList = "";

  Object.entries(GYNAECO_COMMUNITY_GROUPS).forEach(([key, group]) => {
    if (key === userGynaecoType || userGynaecoType === "") {
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
if (formData.joinCommunity && formData.gynaecoType) {
  showRecommendedGroups(formData.gynaecoType);
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
  // Show consent message about profile visibility in the gynaecoType community group
  // e.g. document.getElementById("consentNotice").style.display = "block";
}

// END WOMEN DISEASES COMMUNITY GROUP

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

    console.log("document.addEventListener('DOMContentLoaded")
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

//LANGUAGE SELECTOR

function renderFaqs(faqArray) {
    const container = document.getElementById('faqContainer');
    container.innerHTML = faqArray.map((faq, index) => `
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

    console.log("Render Faqs", container.innerHTML);
}



function renderDoctorsList(doctorsMap, cityKey, selectedLang) {

    console.log("In renderDoctorsList", doctorsMap, cityKey);
    const doctors = doctorsMap[cityKey] || [];
    const container = document.getElementById('doctorsContainer');
    console.log("Container:", container);
    console.log("Doctors:", doctors);

    if (!container) return;

    if (!cityKey) {
    container.innerHTML = '<p>कृपया शहर चुनें।</p>';
    return;
  }

    if (doctors.length === 0) {
        container.innerHTML = '<p>कोई डॉक्टर सूचीबद्ध नहीं है।</p>';
        return;
    }


    if (doctors.length > 0) console.log("First doctor fields:", doctors[0]);

    if(selectedLang == 'hi')
        container.innerHTML = doctors.map(doc => `
            <div class="doctor-card">
                <div class="doctor-header">
                    <strong>${doc.name}</strong>
                    <span class="doctor-credentials">${doc.credentials}</span>
                    <span class="doctor-experience">${doc.experience}</span>
                </div>
                <div class="doctor-hospital">
                    <strong>अस्पताल:</strong> ${doc.hospital}<br>
                    <strong>पता:</strong> ${doc.address}<br>
                    <strong>सम्पर्क:</strong> ${doc.phone}<br>
                    <strong>ईमेल:</strong> ${doc.email}
                </div>
                <div class="doctor-details">
                    <strong>समय:</strong> ${doc.hours}
                    <br>
                    <strong>विशेषज्ञता:</strong> ${doc.specializations}
                    <br>
                    <strong>रेटिंग:</strong> ${doc.rating}
                    <br>
                    <a href="${doc.bookingLink}" target="_blank" rel="noopener noreferrer">ऑनलाइन बुक करें</a>
                </div>
            </div>
        `).join('');

        else
                container.innerHTML = doctors.map(doc => `
                <div class="doctor-card">
                    <div class="doctor-header">
                        <strong>${doc.name}</strong>
                        <span class="doctor-credentials">${doc.credentials}</span>
                        <span class="doctor-experience">${doc.experience}</span>
                    </div>
                    <div class="doctor-hospital">
                        <strong>Hospital:</strong> ${doc.hospital}<br>
                        <strong>Address:</strong> ${doc.address}<br>
                        <strong>Contact:</strong> ${doc.phone}<br>
                        <strong>Email:</strong> ${doc.email}
                    </div>
                    <div class="doctor-details">
                        <strong>Hours:</strong> ${doc.hours}
                        <br>
                        <strong>Specializations:</strong> ${doc.specializations}
                        <br>
                        <strong>Rating:</strong> ${doc.rating}
                        <br>
                        <a href="${doc.bookingLink}" target="_blank" rel="noopener noreferrer">Book Online</a>
                    </div>
                </div>
            `).join('');
}


document.addEventListener('DOMContentLoaded', function() {
    const langSelector = document.getElementById('languageSelector');
    const enDiv = document.getElementById('w-guidelines-en');
    const hiDiv = document.getElementById('w-guidelines-hi');

    // Reusable function to toggle
    function toggleLang(lang) {
        if (lang === 'hi') {
            enDiv.style.display = 'none';
            hiDiv.style.display = 'block';
        } else {
            enDiv.style.display = 'block';
            hiDiv.style.display = 'none';
        }
    }

    // Initial render
    toggleLang(langSelector.value);

    // On selector change
    langSelector.addEventListener('change', function(e) {
        toggleLang(e.target.value);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const langSelector = document.getElementById('languageSelector');
    const enDiv = document.getElementById('registration-en');
    const hiDiv = document.getElementById('registration-hi');
    const enSub = document.getElementById('subscription-en');
    const hiSub = document.getElementById('subscription-hi');
    const navEn = document.getElementById('nav-tabs-en');
    const navHi = document.getElementById('nav-tabs-hi');

    function toggleRegistrationSection(lang) {
        if (lang === 'hi') {
            enDiv.style.display = 'none';
            hiDiv.style.display = 'block';
        } else {
            enDiv.style.display = 'block';
            hiDiv.style.display = 'none';
        }
    }

    function toggleSubscriptionSection(lang) {
    if (lang === 'hi') {
        enSub.style.display = 'none';
        hiSub.style.display = 'block';
    } else {
        enSub.style.display = 'block';
        hiSub.style.display = 'none';
    }
}

     function toggleNavTabs(lang) {
        if (lang === 'hi') {
          navEn.style.display = 'none';
          navHi.style.display = 'flex';  // or 'block' depending on your CSS
        } else {
          navEn.style.display = 'flex';
          navHi.style.display = 'none';
        }
      }

    langSelector.addEventListener('change', function(e) {
        toggleRegistrationSection(e.target.value);
        toggleSubscriptionSection(e.target.value);
        toggleNavTabs(e.target.value);
    });

    // On page load, set default
    toggleRegistrationSection(langSelector.value || 'en');
    toggleSubscriptionSection(langSelector.value || 'en');
    // initial state
    toggleNavTabs(langSelector.value || 'en');

});


document.addEventListener('DOMContentLoaded', function() {

    const initialLang = document.getElementById('languageSelector').value || 'en';
    document.getElementById('languageSelector').addEventListener('change', function(e) {

    if (e.target.value === 'en') {
        document.getElementById('wellnessProdsEn').style.display = 'block';
        document.getElementById('wellnessProdsHi').style.display = 'none';

      //  document.getElementById('guidelines-en').style.display = e.target.value === 'en' ? 'block' : 'none';

    } else {
        document.getElementById('wellnessProdsEn').style.display = 'none';
        document.getElementById('wellnessProdsHi').style.display = 'block';

       // document.getElementById('guidelines-hi').style.display = e.target.value === 'hi' ? 'block' : 'none';
    }

    currentFaqs = e.target.value === 'hi' ? hi_faqs : faqs;

    currentLanguage = e.target.value;
    renderWhenToSee();
    renderPrevention();
    renderFaqs(currentFaqs);

    document.getElementById('citySelect').addEventListener('change', function(e) {
        const cityKey = e.target.value;
        currentCityKey = cityKey;

    });

    const selectedLang = e.target.value;
    if (selectedLang === 'hi') {
        currentDoctorsData = hi_doctorsData;
        //console.log(currentDoctorsData, currentCityKey);
    } else {
        currentDoctorsData = doctorsData;

        //console.log(currentDoctorsData, currentCityKey);
    }

    renderDoctorsList(currentDoctorsData, currentCityKey, selectedLang);

    });

    document.getElementById('citySelect').addEventListener('change', function(e) {
    currentCityKey = e.target.value;

    // If you want to FORCE switch language selector to English on city change:
    currentLanguage = 'en';
    document.getElementById('languageSelector').value = 'en';
    currentDoctorsData = doctorsData;
    document.getElementById('wellnessProdsEn').style.display = 'block';
    document.getElementById('wellnessProdsHi').style.display = 'none';

    renderDoctorsList(currentDoctorsData, currentCityKey, currentLanguage);


});

});


// ========================================================================
// NEW RENDER FUNCTIONS FOR MISSING SECTIONS
// ========================================================================

// Reusable function for the FAQ-style sections
/*function renderSectionContent(data, containerId) {
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
}*/

function renderSectionContent(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(data) || data.length === 0) {
        // Optionally, display "No items" message
        if (container) container.innerHTML = '<div>कोई जानकारी उपलब्ध नहीं है</div>';
        return;
    }

    container.innerHTML = data.map((item, index) => `
        <div class="faq-item" data-index="${index}">
            <div class="faq-question" style="cursor:pointer;">
                <span>${item.question}</span>
                <span class="faq-toggle" style="float:right;">+</span>
            </div>
            <div class="faq-answer" style="display:none;">
                ${item.answer || ""}
                ${item.citation ? `
                    <div style="background: #e8f4f8; border-left: 3px solid #2196f3; padding: 0.75rem; margin-top: 1rem; border-radius: 4px; font-size: 0.85rem;">
                        <strong style="color: #2196f3;">📚 शोध स्रोत:</strong><br>
                        ${item.citation}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    // Attach expand/collapse handler
    Array.from(container.getElementsByClassName('faq-question')).forEach((el, idx) => {
        el.addEventListener('click', function() {
            const answerDiv = this.nextElementSibling;
            if (!answerDiv) return;
            // Toggle display
            if (answerDiv.style.display === "none" || !answerDiv.style.display) {
                answerDiv.style.display = "block";
                this.querySelector('.faq-toggle').textContent = "−";
            } else {
                answerDiv.style.display = "none";
                this.querySelector('.faq-toggle').textContent = "+";
            }
        });
    });

  //  console.log("Inner html", container.innerHTML)
}

function renderWhenToSee() {
    // The "When to See a Gynecologist" section uses the same FAQ-like structure
    const data = currentLanguage === "hi" ? hi_whenToSeeData : whenToSeeData;
    //console.log("renderWhenToSee lang", data);
    renderSectionContent(data, 'whenToSeeContainer');
}

function renderPrevention() {
    // The "Prevention & Care" section uses the same FAQ-like structure
    const data = currentLanguage === "hi" ? hi_preventionData : preventionData;
    console.log("renderPrevention lang", data);
    renderSectionContent(data, 'preventionContainer');
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
// Default as English
document.addEventListener('DOMContentLoaded', function() {
    // Default language is English
    renderDiseases(currentDiseases);

    document.getElementById('languageSelector').addEventListener('change', function(e) {
        const selectedLang = e.target.value;
        if (selectedLang === 'hi') {
            currentDiseases = hi_diseases;
        } else {
            currentDiseases = diseases;
        }
        renderDiseases(currentDiseases);
    });

    // Optional: Ensure diseases tab is shown
    showSection('diseases');
});



window.showDiseaseDetails = (diseaseName) => {
    const disease = currentDiseases.find(d => d.name === diseaseName);
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
            A detailed overview of ${disease.name}, a ${disease.category.toLowerCase()} that primarily affects women's health.
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

document.addEventListener('DOMContentLoaded', function() {
    const langSelector = document.getElementById('languageSelector');
    const enDiv = document.getElementById('guidelines-en');
    const hiDiv = document.getElementById('guidelines-hi');

    function toggleGuidelines(lang) {
        if (lang === 'hi') {
            enDiv.style.display = 'none';
            hiDiv.style.display = 'block';
        } else {
            enDiv.style.display = 'block';
            hiDiv.style.display = 'none';
        }
    }

    langSelector.addEventListener('change', function(e) {
        toggleGuidelines(e.target.value);
    });

    // Set initial state on load
    toggleGuidelines(langSelector.value || 'en');
});

// ========================================================================
// SEARCH FUNCTIONALITY (RETAINED)
// ========================================================================

document.getElementById('searchBox').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (!searchTerm) {
        renderDiseases(diseasesToShow = diseases);
        return;
    }

    const filtered = diseases.filter(disease => {
        return disease.name.toLowerCase().includes(searchTerm) ||
               disease.category.toLowerCase().includes(searchTerm) ||
               disease.symptoms.some(s => s.toLowerCase().includes(searchTerm)) ||
               disease.causes.some(c => c.toLowerCase().includes(searchTerm)) ||
               disease.treatment.some(t => t.toLowerCase().includes(searchTerm));
    });

    renderDiseases(diseasesToShow = filtered);
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
            renderFaqs(filteredFAQs);
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

renderFaqs(currentFaqs);

renderWhenToSee();   // NEW: Initializes "When to See a Gynecologist" content
renderPrevention();  // NEW: Initializes "Prevention & Care" content
//renderDoctors();     // NEW: Initializes "Find Gynecologists" content
const allDoctors = Object.values(doctorsData).flat();
//renderDoctors(allDoctors);
currentDoctorsData = allDoctors
renderDoctorsList(currentDoctorsData, "Delhi", currentLanguage);


// Placeholder functions to prevent errors for other sections
// On main menu option select
function handleMainMenuSelection(userInput) {

  const cleanInput = userInput.trim();
  const stateKey = nextStateMap[cleanInput];
  chatbotState.awaitingMainMenu = false;  // ✅ Changed from appState
  if (stateKey && healthPromptMap[stateKey]) {
    const { botPrompt, options } = healthPromptMap[stateKey];
    addChatMessage("assistant", botPrompt, options);
    chatbotState.awaitingSubMenu = true;  // ✅ Changed from appState.awaitingSubMenuSelection
    chatbotState.currentSection = stateKey;  // ✅ Changed from appState
  } else {
    addChatMessage("assistant", "ভুল নির্বাচন। দয়া করে তালিকা থেকে সঠিক বিষয়টি বাছাই করুন:", healthMainMenu);
    chatbotState.awaitingMainMenu = true;  // ✅ Changed from appState
  }
}

//Show mission statemnet banner on only main page loading
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
  // Show selected one
  document.getElementById(sectionId).style.display = 'block';

  // Hide missionBanner for tabs, show only for main/home/landing section
  const mainSectionIds = ['diseases']; // replace with your main/landing section id(s)
  if (mainSectionIds.includes(sectionId)) {
    //document.getElementById('missionBanner').style.display = 'block';
    console.log("uncomment");
  } else {
    //document.getElementById('missionBanner').style.display = 'none';
    console.log("uncomment");
  }

  if (sectionId === 'diseases') {
     // document.getElementById('missionBanner').classList.remove('hidden');
     console.log("uncomment");
    } else {
      //document.getElementById('missionBanner').classList.add('hidden');
      console.log("uncomment");
    }
}

// Example usage: when a tab is clicked
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    showSection(this.getAttribute('data-section'));
  });
});

window.handleRegistration = (event) => {
    event.preventDefault();
    alert("Thank you for registering! We'll send you monthly health tips.");
};


