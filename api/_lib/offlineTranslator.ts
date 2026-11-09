// Offline fallback template engine strictly adhering to Fact Rules with archetype variety

const ARCHETYPE_TEMPLATES: Record<string, (fact: string) => string> = {
  announcement: (fact) =>
    `Thrilled to announce a major milestone in my journey.\n\nToday, I am proud to formally share:\n\n${fact}.\n\nIt required patience and unwavering dedication to see this through.\n\nWhat has your experience been with this?\n\nAgree?\n\n#Milestone #CareerJourney #Leadership`,

  lesson: (fact) =>
    `I was reflecting on a seemingly simple moment today:\n\n${fact}.\n\nHere is the leadership lesson most people miss:\n\n1. Progress is never an accident.\n2. Small daily actions compound into monumental outcomes.\n3. The obstacle is simply data pointing to your north star.\n\nDo you agree with this reflection?\n\n#Leadership #Mindset #ContinuousImprovement`,

  story: (fact) =>
    `3 years ago, I had zero clarity and endless doubt.\n\nPeople told me to play it safe.\n\nThey told me not to push forward.\n\nToday:\n\n${fact}.\n\nNever let someone else's comfort zone become your ceiling.\n\nRepost if you agree.\n\n#Resilience #Growth #NeverGiveUp`,

  hot_take: (fact) =>
    `Unpopular opinion:\n\n${fact}.\n\nMost corporate professionals will disagree with this.\n\nThey prefer the comfort of conventional playbooks.\n\nBut the top 1% understand that true breakthroughs happen when you challenge the default.\n\nAgree?`,

  dad_story: (fact) =>
    `Yesterday, an auto rickshaw driver smiled at me while I was reflecting on how:\n\n${fact}.\n\nHe said: "Sahab, kaam shuru karne mein hi jeet hai."\n\nIt hit me right in the chest.\n\nLeadership isn't taught in executive boardrooms.\n\nIt is taught in daily conversations.\n\nFollow me for more insights.`,

  list: (fact) =>
    `5 brutal truths I realized from:\n\n${fact}:\n\n1. Execution eats strategy for breakfast.\n2. Consistency is the only real unfair advantage.\n3. Protect your focus at all costs.\n4. Feedback is a gift, even when uncomfortable.\n5. Don't wait for permission to start.\n\nWhich one resonates most with you?`,

  broetry: (fact) =>
    `I did something.\n\n${fact}.\n\nNo shortcuts.\n\nNo excuses.\n\nJust showing up.\n\nEvery.\n\nSingle.\n\nDay.\n\nGrowth.`,

  before_after: (fact) =>
    `Day 1: Doubted every single step.\n\nDay 100:\n\n${fact}.\n\nThe only difference? Showing up even when no one was watching.\n\nKeep building.\n\n#Transformation #Discipline #Consistency`,

  confession: (fact) =>
    `I was honestly terrified to share this with my network...\n\n${fact}.\n\nWe often hide the daily process behind polished trophies.\n\nToday, I'm choosing to share the raw reality.\n\nVulnerability is not weakness. It is leadership.\n\n#Authenticity #Vulnerability #Leadership`,

  thank_you: (fact) =>
    `A moment of profound gratitude.\n\n${fact}.\n\nNone of this would be possible without my incredible mentors, my team, and the universe aligning this path.\n\nThank you to everyone who believed in this vision.\n\n#Gratitude #Teamwork #Blessed`,
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
