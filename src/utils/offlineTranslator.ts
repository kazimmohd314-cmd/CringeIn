// Offline fallback template engine

const LINKEDIN_OPENERS = [
  "Thrilled to announce a major milestone in my journey.",
  "Humbled and truly honored to share this with my network.",
  "Never in my wildest dreams did I imagine I'd be writing this today.",
  "After countless sleepless nights and endless cups of chai, it's finally here.",
];

const LINKEDIN_LESSONS = [
  "What this taught me: Success isn't a straight line. It's an iterative sprint of continuous resilience.",
  "The biggest lesson? Most people wait for the right moment. The top 1% create it from sheer discipline.",
  "Key takeaway: When you align vision with relentless execution, the universe responds.",
  "If there is one truth I've learned, it's this: Your comfort zone is your biggest competitor.",
];

const LINKEDIN_CLOSERS = [
  "Curious to hear your thoughts on this.\n\nAgree?",
  "What has your experience been with this?\n\nAgree?",
  "Do you agree with this mindset?\n\nAgree?",
  "Let's normalize taking risks in public.\n\nAgree?",
];

const LINKEDIN_TAGS = [
  "#Leadership #GrowthMindset #ContinuousLearning #Success #Innovation",
  "#CareerJourney #Entrepreneurship #Milestone #Resilience #Agree",
  "#Motivation #ProfessionalGrowth #StartupLife #Gratitude #Vision",
];

export function generateOfflineLinkedInPost(fact: string): string {
  const clean = fact.trim();
  const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const opener = rand(LINKEDIN_OPENERS);
  const lesson = rand(LINKEDIN_LESSONS);
  const closer = rand(LINKEDIN_CLOSERS);
  const tags = rand(LINKEDIN_TAGS);

  const formattedFact = clean
    ? `Today, I am proud to formally share:\n\n${clean}.\n\nIt hasn't been an easy road. There were doubters. There were setbacks. But every obstacle was simply disguised data pointing toward the north star.`
    : `Today marks the culmination of months of focused execution and strategic alignment.`;

  return `${opener}\n\n${formattedFact}\n\n${lesson}\n\n${closer}\n\n${tags}`;
}

const REAL_PATTERNS: { match: RegExp; responses: string[] }[] = [
  {
    match: /excited for a new chapter|new chapter|next adventure|time to reflect|stepping down|leaving my role|taking some time/i,
    responses: [
      "Naukri se nikaal diya. Ab severance pe araam chal raha hai.",
      "Layoff ho gaya bhai. HR ne 15 minute ki call pe bye bol diya.",
      "Job chali gayi hai. Agli milne tak 'freelance consultant' bol rahe hain."
    ]
  },
  {
    match: /thrilled to announce|excited to share|delighted to join|proud to share/i,
    responses: [
      "Nayi job lag gayi hai aur 30% hike bhi mil gaya. Bas flex karna tha.",
      "Placement ho gaya aakhirkar. Rishtedaaron ko chup karaane ke liye post daali hai.",
      "Offer letter sign ho gaya, ab 6 mahine chill."
    ]
  },
  {
    match: /humbled and honored|truly humbled|deeply honored|blessed/i,
    responses: [
      "Humble hone ka natak hai, ego asmaan pe hai.",
      "Bas brag karna tha taaki puraane college waale dost jal sakein.",
      "Generic sa award mila hai par hero ban ke dikha rahe hain."
    ]
  },
  {
    match: /agree\?|thoughts\?|what are your thoughts/i,
    responses: [
      "Post mein kuch khas nahi tha, bas comments aur engagement chahiye.",
      "Algorithm ko trick karne ke liye end mein 'Agree?' chipka diya.",
      "Reach kam ho rahi thi toh generic gyaan pel ke sawal puch liya."
    ]
  },
  {
    match: /4 am|3:15 am|ice bath|cold plunge|cold shower|grind|hustle/i,
    responses: [
      "Neend kharaab hai aur anxiety peak pe hai. Therapy jaane ke badle post likh di.",
      "Work-life balance zero hai, usko 'alpha grind' bol ke justify kar rahe hain."
    ]
  },
  {
    match: /synergy|bandwidth|paradigm|deliverable|stakeholder/i,
    responses: [
      "Pura din bas Google Meet pe sir hilaya hai, kaam zero hua.",
      "Bhaari angrezi daali hai taaki manager ko lage kaam chal raha hai."
    ]
  }
];

export function generateOfflineRealMeaning(text: string): string {
  const clean = text.trim();
  if (!clean) {
    return "Kuch likha hi nahi hai, khali dimag ki tarah.";
  }

  for (const item of REAL_PATTERNS) {
    if (item.match.test(clean)) {
      const resp = item.responses[Math.floor(Math.random() * item.responses.length)];
      return resp;
    }
  }

  const genericResponses = [
    "Seedhi baat: Aam si cheez thi, par bhaari angrezi daal ke lagta hai Nobel prize mil gaya.",
    "Bhai bas relevance bachaane ke liye hawa baazi kar raha hai. Kaam normal tha.",
    "Translation: 10 minute ka kaam tha, 2 ghante post draft karne mein lagaye.",
    "Kuch naya nahi hua, bas 'Thought Leader' ka chasma pehan ke bakwaas pel di."
  ];

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}
