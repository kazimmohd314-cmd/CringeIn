// Offline fallback template engine strictly adhering to Fact Rules

const LINKEDIN_OPENERS = [
  "Thrilled to announce a major milestone in my journey.",
  "Humbled and truly honored to share this update with my network.",
  "Never in my wildest dreams did I imagine I'd be writing this today.",
  "After countless hours and sheer focus, it's finally here.",
];

const LINKEDIN_LESSONS = [
  "What this taught me: Progress isn't linear. It's a continuous journey of consistency and resilience.",
  "The biggest takeaway? Focus on the process, align with your vision, and the results follow.",
  "Key reflection: When you remain committed to continuous improvement, growth happens naturally.",
  "A quiet reminder: Never underestimate the compound effect of disciplined daily effort.",
];

const LINKEDIN_CLOSERS = [
  "Curious to hear how you approach this.\n\nAgree?",
  "What has your experience been with this mindset?\n\nAgree?",
  "Do you agree with this reflection?\n\nAgree?",
  "Reflecting on this as we move forward.\n\nAgree?",
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

  // Keep every user fact, number, and word intact without adding new facts
  const formattedFact = clean
    ? `Today, I am reflecting on:\n\n${clean}.\n\nIt required patience and unwavering dedication to see this through.`
    : `Today marks an important step forward in focused execution and progress.`;

  return `${opener}\n\n${formattedFact}\n\n${lesson}\n\n${closer}\n\n${tags}`;
}

const REAL_PATTERNS: { match: RegExp; responses: string[] }[] = [
  {
    match: /excited for a new chapter|new chapter|next adventure|time to reflect|stepping down|leaving my role|taking some time|transitioning/i,
    responses: [
      "Job chhod di hai ya nikaal diya gaya hai. Ab agla move plan ho raha hai.",
      "Purani company se nikal chuke hain, ab nayi opportunity dhoondh rahe hain.",
      "Job chali gayi hai, par post mein usko 'nayi shuruat' bol rahe hain."
    ]
  },
  {
    match: /thrilled to announce|excited to share|delighted to join|proud to share|joined/i,
    responses: [
      "Nayi job lag gayi hai. Bas sabko batane ke liye post daali hai.",
      "Naya role shuru ho gaya hai, thoda flex toh banta hai.",
      "Offer accept ho gaya, officially announce kar diya."
    ]
  },
  {
    match: /humbled and honored|truly humbled|deeply honored|blessed|grateful/i,
    responses: [
      "Thoda brag karna tha taaki network ko pata chale.",
      "Apni tareef khud hi humble ban ke kar rahe hain.",
      "Khushi hui hai par formality ke liye 'humbled' likh diya."
    ]
  },
  {
    match: /agree\?|thoughts\?|what are your thoughts|do you agree/i,
    responses: [
      "Post pe comments aur engagement badhane ke liye end mein sawal pucha hai.",
      "Algorithm ko trigger karne ke liye 'Agree?' likha hai.",
      "Chahte hain log comment karein taaki reach badh sake."
    ]
  },
  {
    match: /cold plunge|cold shower|5 am|4 am|hustle|grind|alpha/i,
    responses: [
      "Neend kam aati hai, par usko discipline bol ke post bana diya.",
      "Aam routine ko extra dramatic bana ke dikha rahe hain."
    ]
  },
  {
    match: /synergy|bandwidth|paradigm|deliverable|stakeholder/i,
    responses: [
      "Bhaari corporate shabd use kiye hain taaki baat serious lage.",
      "Normal si meeting ko fancy terms mein wrap kar diya."
    ]
  }
];

export function generateOfflineRealMeaning(text: string): string {
  const clean = text.trim();
  if (!clean) {
    return "Kuch likha hi nahi hai, khali post hai.";
  }

  for (const item of REAL_PATTERNS) {
    if (item.match.test(clean)) {
      const resp = item.responses[Math.floor(Math.random() * item.responses.length)];
      return resp;
    }
  }

  const genericResponses = [
    "Seedhi baat: Aam si baat thi, par corporate tone daal ke badi bana di.",
    "Bhai bas apne network mein active rehne ke liye post daal rahe hain.",
    "Normal update hai, thoda polish karke professional banaya hai.",
    "Translation: Baat simple hai, bas LinkedIn waali language mein likhi hai."
  ];

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}
