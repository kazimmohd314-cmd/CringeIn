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
      "Bhai 'new chapter' likhne se dard kam nahi hota, severance ka kya scene hai?",
      "Corporate ne tata-bye-bye bol diya aur tu usko 'next adventure' bana raha hai.",
      "Abe seedhe bol na job gayi. 'Time to reflect' toh aise bol raha jaise Vipassana ja raha ho."
    ]
  },
  {
    match: /thrilled to announce|excited to share|delighted to join|proud to share|joined/i,
    responses: [
      "Bhai bol de naukri mili hai, 'journey' kya hota hai. Tu Himalaya nahi ja raha.",
      "Naya role shuru hote hi essay likh diya? Pehle month ki salary toh aane deta bhai.",
      "Itna drama offer letter ke liye? Thoda calm down yaar."
    ]
  },
  {
    match: /humbled and honored|truly humbled|deeply honored|blessed|grateful/i,
    responses: [
      "2 ghante ka course karke 'humbled'? Certificate ke liye itna drama, abe seekh bhi liya kuch?",
      "Apni tareef khud hi kar raha hai aur caption mein 'humbled' chipka diya. Waah bhai.",
      "Bhai humble hone ka natak band kar, seedhe bol flex karna tha."
    ]
  },
  {
    match: /agree\?|thoughts\?|what are your thoughts|do you agree/i,
    responses: [
      "Team ko credit sirf isliye ki comments aa jaye. 'Agree?' likh ke bheek mang raha hai bhai.",
      "Algorithm ko butter lagane ke liye aakhri mein 'Agree?' chipka diya, waah.",
      "Post mein kuch tha nahi, bas engagement ke liye sawal fek ke chala gaya."
    ]
  },
  {
    match: /cold plunge|cold shower|5 am|4 am|hustle|grind|alpha/i,
    responses: [
      "Subah 4 baje uth ke LinkedIn pe gyaan pel raha hai, abe neend poori kar le pehle.",
      "Cold shower lene se Warren Buffett nahi bante bhai, thoda normal behave kar.",
      "Aam si subah ko superhero origin story bana diya yaar."
    ]
  },
  {
    match: /synergy|bandwidth|paradigm|deliverable|stakeholder/i,
    responses: [
      "Itni bhaari angrezi? Seedhi baat bol na bhai, manager ko impress karne ka scene hai.",
      "Pura sentence padh ke bhi kuch samajh nahi aaya. Jargon thoda kam kar yaar."
    ]
  }
];

export function generateOfflineRealMeaning(text: string): string {
  const clean = text.trim();
  if (!clean) {
    return "Abe khali post paste karke kya roast karu? Kuch likha toh ho.";
  }

  for (const item of REAL_PATTERNS) {
    if (item.match.test(clean)) {
      const resp = item.responses[Math.floor(Math.random() * item.responses.length)];
      return resp;
    }
  }

  const genericResponses = [
    "Aam si baat ko aise frame kiya hai jaise Nobel prize milne waala ho. Thoda calm down bhai.",
    "Bhai bas relevance bachaane ke liye hawa baazi kar raha hai. Seedhi baat bolo na.",
    "Bina kisi baat ke 4 paragraph ka gyaan. Itna free time kahan se milta hai yaar?",
    "Post padh ke lag raha hai bas network ko yaad dilana tha ki zinda ho."
  ];

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}
