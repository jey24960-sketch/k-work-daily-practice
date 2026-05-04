export type DailyQuestion = {
  id: string;
  section:
    | "vocabulary"
    | "grammar"
    | "reading"
    | "workplace"
    | "mixed";
  prompt: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: "A" | "B" | "C" | "D";
  englishExplanation: string;
  nepaliExplanation: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
};

export const dailyQuestions: DailyQuestion[] = [
  {
    id: "daily-vocab-1",
    section: "vocabulary",
    difficulty: "easy",
    prompt: "Which Korean word means factory?",
    choices: {
      A: "병원",
      B: "공장",
      C: "학교",
      D: "시장",
    },
    correctAnswer: "B",
    englishExplanation:
      "공장 means factory. It is a common workplace word for EPS-TOPIK practice.",
    nepaliExplanation: "Nepali explanation coming soon.",
    tags: ["vocabulary", "workplace"],
  },
  {
    id: "daily-grammar-1",
    section: "grammar",
    difficulty: "medium",
    prompt: "Choose the best form: 저는 한국어를 ______ 있어요.",
    choices: {
      A: "배우고",
      B: "배워서",
      C: "배우면",
      D: "배우지만",
    },
    correctAnswer: "A",
    englishExplanation:
      "-고 있어요 shows an action in progress, so 배우고 있어요 means I am studying.",
    nepaliExplanation: "Nepali explanation coming soon.",
    tags: ["grammar", "progressive"],
  },
  {
    id: "daily-reading-1",
    section: "reading",
    difficulty: "easy",
    prompt:
      "Notice: Safety training starts tomorrow at 9 a.m. All workers should gather in the meeting room. What is the notice about?",
    choices: {
      A: "Lunch time",
      B: "Safety training",
      C: "Salary payment",
      D: "Vacation request",
    },
    correctAnswer: "B",
    englishExplanation:
      "The notice says safety training starts at 9 a.m., so the topic is safety training.",
    nepaliExplanation: "Nepali explanation coming soon.",
    tags: ["reading", "notice", "safety"],
  },
  {
    id: "daily-workplace-1",
    section: "workplace",
    difficulty: "easy",
    prompt: "If you are injured during work, what should you do first?",
    choices: {
      A: "Go home without telling anyone",
      B: "Tell the supervisor or manager",
      C: "Keep working quietly",
      D: "Only tell a friend later",
    },
    correctAnswer: "B",
    englishExplanation:
      "For a workplace injury, you should first tell a supervisor or manager.",
    nepaliExplanation: "Nepali explanation coming soon.",
    tags: ["workplace", "safety", "injury"],
  },
  {
    id: "daily-mixed-1",
    section: "mixed",
    difficulty: "medium",
    prompt: "Choose the most polite workplace request.",
    choices: {
      A: "휴가 줘.",
      B: "휴가 좀 주세요.",
      C: "휴가 가도 될까요?",
      D: "휴가를 신청하고 싶습니다.",
    },
    correctAnswer: "D",
    englishExplanation:
      "휴가를 신청하고 싶습니다 is the most formal option for requesting leave at work.",
    nepaliExplanation: "Nepali explanation coming soon.",
    tags: ["mixed", "workplace", "politeness"],
  },
];
