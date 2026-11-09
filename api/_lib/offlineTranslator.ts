// Offline fallback template engine strictly adhering to Fact Rules with archetype variety (punchy, meme-sized)

const ARCHETYPE_TEMPLATES: Record<string, (fact: string) => string> = {
  announcement: (fact) =>
    `Thrilled to announce that today:\n\n${fact}.\n\nTruly humbled by this milestone. Huge thanks to everyone who supported this chapter.\n\nAgree?\n\n#Milestone #Humbled`,

  lesson: (fact) =>
    `Today: ${fact}.\n\nThe leadership takeaway?\n\nStop waiting for the right moment. Execution compounds.\n\nAgree?\n\n#Leadership #Mindset`,

  story: (fact) =>
    `3 years ago, they said it was impossible.\n\nToday:\n\n${fact}.\n\nYour doubters are your greatest fuel.\n\nRepost if you agree.`,

  hot_take: (fact) =>
    `Unpopular opinion:\n\n${fact}.\n\nMost corporate leaders are afraid to admit this. But the top 1% already know.\n\nAgree?`,

  dad_story: (fact) =>
    `An auto driver looked at me today and said:\n\n"${fact}."\n\nIt shook me. Leadership isn't taught in Harvard, it's lived on the streets.\n\nFollow for more.`,

  list: (fact) =>
    `3 things ${fact} taught me about leadership:\n\n1. Speed is a moat.\n2. Silence is strategy.\n3. Execution wins.\n\nAgree?`,

  broetry: (fact) =>
    `I did something.\n\n${fact}.\n\nNo shortcuts.\n\nNo excuses.\n\nPure grit.\n\nGrowth.`,

  before_after: (fact) =>
    `Day 1: Feared the process.\n\nDay 100: ${fact}.\n\nThe only difference? Showing up.`,

  confession: (fact) =>
    `I was terrified to post this...\n\n${fact}.\n\nVulnerability is the ultimate B2B superpower.\n\nAgree?`,

  thank_you: (fact) =>
    `Deeply grateful today:\n\n${fact}.\n\nThank you to my mentors, my network, and the universe.\n\n#Blessed #Gratitude`,
};

export function generateOfflineLinkedInPost(fact: string, archetypeId?: string): string {
  const clean = fact.trim() || 'taking a moment to focus on focused execution and progress';
  
  if (archetypeId && ARCHETYPE_TEMPLATES[archetypeId]) {
    return ARCHETYPE_TEMPLATES[archetypeId](clean);
  }

  const keys = Object.keys(ARCHETYPE_TEMPLATES);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return ARCHETYPE_TEMPLATES[randomKey](clean);
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
