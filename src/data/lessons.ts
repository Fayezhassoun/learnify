import type { Lesson, Topic } from "../types";

export const topics: Topic[] = [
  {
    id: "ai-productivity",
    title: "AI Productivity",
    description: "Use AI as a practical daily operator, not a toy.",
    accent: "#4f46e5",
    level: "Beginner",
    lessonCount: 12,
  },
  {
    id: "performance-marketing",
    title: "Performance Marketing",
    description: "Learn media buying logic through fast tactical lessons.",
    accent: "#0f766e",
    level: "Intermediate",
    lessonCount: 18,
  },
  {
    id: "startup-finance",
    title: "Startup Finance",
    description: "Understand margins, runway, pricing, and cash control.",
    accent: "#b45309",
    level: "Beginner",
    lessonCount: 10,
  },
  {
    id: "product-design",
    title: "Product Design",
    description: "Turn vague ideas into focused product flows.",
    accent: "#be123c",
    level: "Intermediate",
    lessonCount: 15,
  },
];

export const lessons: Lesson[] = [
  {
    id: "ai-briefs",
    topicId: "ai-productivity",
    title: "Write AI briefs that produce useful work",
    hook: "Bad prompts ask for answers. Good briefs define the job.",
    creator: "Learnify AI",
    duration: "0:42",
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    transcript:
      "Give the AI context, constraints, examples, and the exact output format. The model should know what decision you are trying to make, not just what topic you are asking about.",
    keyPoints: [
      "Start with the business goal.",
      "Add constraints before examples.",
      "Specify the output shape.",
    ],
    quiz: "What is the first thing a useful AI brief should include?",
    nextStep: "Rewrite one vague prompt into a structured brief.",
    difficulty: "Beginner",
  },
  {
    id: "ai-review-loop",
    topicId: "ai-productivity",
    title: "Use a review loop before trusting AI output",
    hook: "The first answer is a draft, not a decision.",
    creator: "Learnify AI",
    duration: "0:36",
    thumbnail:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    transcript:
      "Ask the model to challenge its own answer. Then ask it to list missing data, weak assumptions, and failure cases. This turns a fast answer into a usable working draft.",
    keyPoints: [
      "Ask for risks and missing data.",
      "Separate facts from assumptions.",
      "Use AI output as a draft.",
    ],
    quiz: "Why should AI output be reviewed before action?",
    nextStep: "Run a critique pass on your last AI answer.",
    difficulty: "Beginner",
  },
  {
    id: "marketing-unit-economics",
    topicId: "performance-marketing",
    title: "CPA means nothing without payout logic",
    hook: "A cheap conversion can still lose money.",
    creator: "Growth Lab",
    duration: "0:48",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    transcript:
      "Always compare CPA to payout, approval rate, refund risk, and downstream retention. Campaigns should be judged by contribution margin, not isolated cost.",
    keyPoints: [
      "CPA is only one input.",
      "Approval and retention change real value.",
      "Margin decides scale.",
    ],
    quiz: "What metric should CPA be compared against?",
    nextStep: "Create a simple CPA to payout margin table.",
    difficulty: "Intermediate",
  },
  {
    id: "marketing-fatigue",
    topicId: "performance-marketing",
    title: "Creative fatigue starts before CTR collapses",
    hook: "Fatigue often shows up in cost before clicks die.",
    creator: "Growth Lab",
    duration: "0:39",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    transcript:
      "Watch frequency, CPA drift, conversion rate, and placement concentration. If CTR is stable but CPA rises, the landing promise or audience freshness may be weakening.",
    keyPoints: [
      "Track CPA drift.",
      "Watch placement concentration.",
      "Refresh the angle, not only the asset.",
    ],
    quiz: "Which signal can reveal fatigue before CTR drops?",
    nextStep: "Audit one campaign for rising CPA with stable CTR.",
    difficulty: "Intermediate",
  },
  {
    id: "finance-runway",
    topicId: "startup-finance",
    title: "Runway is a behavior, not only a number",
    hook: "You do not have runway if spending decisions ignore it.",
    creator: "Operator School",
    duration: "0:45",
    thumbnail:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    transcript:
      "Runway equals cash divided by burn, but the useful version is scenario-based. Model current burn, conservative revenue, delayed payments, and emergency cuts.",
    keyPoints: [
      "Use scenarios, not one estimate.",
      "Model delayed revenue.",
      "Know emergency cuts before you need them.",
    ],
    quiz: "Why is one runway number not enough?",
    nextStep: "Build a base, bad, and emergency runway case.",
    difficulty: "Beginner",
  },
  {
    id: "design-first-screen",
    topicId: "product-design",
    title: "Your first screen should do the product's job",
    hook: "A landing page is not always the right first screen.",
    creator: "Product Studio",
    duration: "0:44",
    thumbnail:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80",
    transcript:
      "For tools and apps, users should land inside the useful workflow quickly. Put the primary action, current state, and next decision above marketing-style explanation.",
    keyPoints: [
      "Start inside the workflow.",
      "Show current state.",
      "Make the next action obvious.",
    ],
    quiz: "What belongs on the first screen of a tool?",
    nextStep: "Remove one explanatory block from a product screen.",
    difficulty: "Intermediate",
  },
];

