import type {
  ChoiceKey,
  PracticeQuestion,
  QuestionSection,
} from "@/types/questions";

const nepaliPlaceholder = "Nepali explanation coming soon.";

export const ORIGINAL_QUESTION_NOTICE =
  "This is an original practice question. It is not an official EPS-TOPIK question and is not copied from any official textbook or past exam.";

// All questions in this file must be original practice questions. Official EPS-TOPIK
// textbooks may be used only for broad topic and difficulty reference. Do not copy
// official textbook questions, past exam questions, answer options, dialogues,
// passages, or listening scripts.
export const questionPool: PracticeQuestion[] = [
  {
    "id": "lt-a-vocab-001",
    "section": "Vocabulary",
    "context": "daily_life",
    "difficulty": "easy",
    "tags": [
      "noun",
      "daily-life"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "다음 중 'water'의 뜻은 무엇입니까?",
    "options": [
      "밥",
      "물",
      "집",
      "책"
    ],
    "answer": "물",
    "explanationEn": "'물' means water in Korean.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general EPS-TOPIK everyday-life and workplace vocabulary preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-vocab-002",
    "section": "Vocabulary",
    "context": "workplace",
    "difficulty": "easy",
    "tags": [
      "verb",
      "work"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "빈칸에 알맞은 말을 고르십시오. 저는 공장에서 ______.",
    "options": [
      "일합니다",
      "잡니다",
      "삽니다",
      "먹습니다"
    ],
    "answer": "일합니다",
    "explanationEn": "'일합니다' means 'work' and fits the factory sentence.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general EPS-TOPIK everyday-life and workplace vocabulary preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-vocab-003",
    "section": "Vocabulary",
    "context": "safety",
    "difficulty": "medium",
    "tags": [
      "safety",
      "workplace"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "'안전모'와 관계있는 것은 무엇입니까?",
    "options": [
      "머리 보호",
      "점심 식사",
      "출근 시간",
      "한국어 책"
    ],
    "answer": "머리 보호",
    "explanationEn": "'안전모' is a safety helmet used to protect the head.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general EPS-TOPIK everyday-life and workplace vocabulary preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-vocab-004",
    "section": "Vocabulary",
    "context": "daily_life",
    "difficulty": "medium",
    "tags": [
      "adjective",
      "opposites"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "반대말을 고르십시오. '빠르다'",
    "options": [
      "작다",
      "느리다",
      "멀다",
      "춥다"
    ],
    "answer": "느리다",
    "explanationEn": "The opposite of '빠르다' (fast) is '느리다' (slow).",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general EPS-TOPIK everyday-life and workplace vocabulary preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-vocab-005",
    "section": "Vocabulary",
    "context": "manufacturing",
    "difficulty": "medium",
    "tags": [
      "verb",
      "maintenance"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "다음 중 'to repair'의 뜻에 가장 가까운 말은 무엇입니까?",
    "options": [
      "고치다",
      "버리다",
      "기다리다",
      "빌리다"
    ],
    "answer": "고치다",
    "explanationEn": "'고치다' means to fix or repair something.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general EPS-TOPIK everyday-life and workplace vocabulary preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-grammar-001",
    "section": "Grammar",
    "context": "daily_life",
    "difficulty": "easy",
    "tags": [
      "particle",
      "origin"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "빈칸에 알맞은 조사를 고르십시오. 저는 네팔______ 왔습니다.",
    "options": [
      "이",
      "을",
      "에서",
      "도"
    ],
    "answer": "에서",
    "explanationEn": "'에서' is used with a place of origin in this sentence.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with common EPS-TOPIK grammar preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-grammar-002",
    "section": "Grammar",
    "context": "daily_life",
    "difficulty": "easy",
    "tags": [
      "particle",
      "object"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "알맞은 문장을 고르십시오.",
    "options": [
      "저는 한국어를 공부합니다.",
      "저는 한국어가 공부합니다.",
      "저는 한국어에 공부합니다.",
      "저는 한국어도 공부합니다에."
    ],
    "answer": "저는 한국어를 공부합니다.",
    "explanationEn": "'한국어를 공부합니다' correctly marks Korean as the object of study.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with common EPS-TOPIK grammar preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-grammar-003",
    "section": "Grammar",
    "context": "daily_life",
    "difficulty": "medium",
    "tags": [
      "future",
      "condition"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "빈칸에 알맞은 말을 고르십시오. 내일 비가 오면 집에 ______.",
    "options": [
      "있겠습니다",
      "있었습니다",
      "있고",
      "있는"
    ],
    "answer": "있겠습니다",
    "explanationEn": "The sentence talks about tomorrow, so the future form '있겠습니다' fits.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with common EPS-TOPIK grammar preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-grammar-004",
    "section": "Grammar",
    "context": "daily_life",
    "difficulty": "medium",
    "tags": [
      "connector",
      "reason"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "두 문장을 자연스럽게 연결한 것을 고르십시오. 일이 많습니다. 그래서 피곤합니다.",
    "options": [
      "일이 많아서 피곤합니다.",
      "일이 많지만 피곤합니다.",
      "일이 많으러 피곤합니다.",
      "일이 많거나 피곤합니다."
    ],
    "answer": "일이 많아서 피곤합니다.",
    "explanationEn": "'-아서/어서' shows reason, so '일이 많아서' means 'because there is much work.'",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with common EPS-TOPIK grammar preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-grammar-005",
    "section": "Grammar",
    "context": "workplace",
    "difficulty": "hard",
    "tags": [
      "obligation",
      "workplace"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "빈칸에 알맞은 말을 고르십시오. 작업 전에 기계를 ______ 합니다.",
    "options": [
      "확인해야",
      "확인해서",
      "확인하면",
      "확인한"
    ],
    "answer": "확인해야",
    "explanationEn": "'-아/어야 합니다' means 'must,' so workers must check the machine before work.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with common EPS-TOPIK grammar preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-reading-001",
    "section": "Reading",
    "context": "daily_life",
    "difficulty": "easy",
    "tags": [
      "time",
      "reading"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "민수 씨는 아침 8시에 회사에 갑니다. 12시에 점심을 먹습니다. 민수 씨는 몇 시에 점심을 먹습니까?",
    "options": [
      "8시",
      "10시",
      "12시",
      "6시"
    ],
    "answer": "12시",
    "explanationEn": "The text says he eats lunch at 12 o'clock.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general EPS-TOPIK short reading and notice comprehension preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-reading-002",
    "section": "Reading",
    "context": "daily_life",
    "difficulty": "easy",
    "tags": [
      "day",
      "reading"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "오늘은 일요일입니다. 수지 씨는 회사에 가지 않습니다. 무엇이 맞습니까?",
    "options": [
      "수지 씨는 오늘 일합니다.",
      "수지 씨는 오늘 쉽니다.",
      "수지 씨는 오늘 학교에 갑니다.",
      "수지 씨는 오늘 병원에 갑니다."
    ],
    "answer": "수지 씨는 오늘 쉽니다.",
    "explanationEn": "She does not go to work on Sunday, so she rests today.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general EPS-TOPIK short reading and notice comprehension preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-reading-003",
    "section": "Reading",
    "context": "administrative",
    "difficulty": "medium",
    "tags": [
      "notice",
      "rules"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "안내문: 휴게실에서는 음식을 먹을 수 있습니다. 하지만 담배를 피우면 안 됩니다. 휴게실에서 할 수 없는 것은 무엇입니까?",
    "options": [
      "쉬기",
      "음식 먹기",
      "담배 피우기",
      "물 마시기"
    ],
    "answer": "담배 피우기",
    "explanationEn": "The notice says smoking is not allowed in the break room.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general EPS-TOPIK short reading and notice comprehension preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-reading-004",
    "section": "Reading",
    "context": "daily_life",
    "difficulty": "medium",
    "tags": [
      "health",
      "reason"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "지훈 씨는 감기에 걸렸습니다. 그래서 오늘 병원에 가고 약을 샀습니다. 지훈 씨는 왜 병원에 갔습니까?",
    "options": [
      "일이 많아서",
      "감기에 걸려서",
      "친구를 만나서",
      "약속이 있어서"
    ],
    "answer": "감기에 걸려서",
    "explanationEn": "He went to the hospital because he had a cold.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general EPS-TOPIK short reading and notice comprehension preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-reading-005",
    "section": "Reading",
    "context": "administrative",
    "difficulty": "medium",
    "tags": [
      "notice",
      "work-schedule"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "공지: 다음 주 월요일부터 작업 시간이 오전 9시에서 오전 8시 30분으로 바뀝니다. 직원들은 몇 시까지 와야 합니까?",
    "options": [
      "8시",
      "8시 30분",
      "9시",
      "9시 30분"
    ],
    "answer": "8시 30분",
    "explanationEn": "The new start time is 8:30 a.m., so workers should arrive by then.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general EPS-TOPIK short reading and notice comprehension preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-workplace-001",
    "section": "Workplace Korean",
    "context": "workplace",
    "difficulty": "easy",
    "tags": [
      "instruction",
      "place"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "상사가 '회의실로 오세요'라고 말했습니다. 어디로 가야 합니까?",
    "options": [
      "식당",
      "회의실",
      "기숙사",
      "은행"
    ],
    "answer": "회의실",
    "explanationEn": "'회의실' means meeting room.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general workplace Korean safety and communication preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-workplace-002",
    "section": "Workplace Korean",
    "context": "safety",
    "difficulty": "easy",
    "tags": [
      "safety",
      "injury"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "작업장에서 다쳤습니다. 먼저 무엇을 해야 합니까?",
    "options": [
      "혼자 계속 일합니다.",
      "관리자에게 말합니다.",
      "집에 갑니다.",
      "친구에게만 말합니다."
    ],
    "answer": "관리자에게 말합니다.",
    "explanationEn": "In a workplace injury, you should first tell a supervisor or manager.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general workplace Korean safety and communication preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-workplace-003",
    "section": "Workplace Korean",
    "context": "safety",
    "difficulty": "medium",
    "tags": [
      "machine",
      "safety"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "기계가 이상한 소리를 냅니다. 알맞은 행동은 무엇입니까?",
    "options": [
      "기계를 바로 멈추고 보고합니다.",
      "더 빨리 일합니다.",
      "소리를 무시합니다.",
      "안전모를 벗습니다."
    ],
    "answer": "기계를 바로 멈추고 보고합니다.",
    "explanationEn": "If a machine sounds unusual, stop it safely and report the issue.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general workplace Korean safety and communication preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-workplace-004",
    "section": "Workplace Korean",
    "context": "workplace",
    "difficulty": "medium",
    "tags": [
      "instruction",
      "storage"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "동료가 '이 박스를 창고에 놓아 주세요'라고 했습니다. 무엇을 해야 합니까?",
    "options": [
      "박스를 버립니다.",
      "박스를 창고에 둡니다.",
      "박스를 집에 가져갑니다.",
      "박스를 엽니다."
    ],
    "answer": "박스를 창고에 둡니다.",
    "explanationEn": "'창고에 놓아 주세요' means 'please put it in the storage room.'",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general workplace Korean safety and communication preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  },
  {
    "id": "lt-a-workplace-005",
    "section": "Workplace Korean",
    "context": "safety",
    "difficulty": "hard",
    "tags": [
      "ppe",
      "obligation"
    ],
    "usage": {
      "levelTestSets": [
        "levelTestSetA"
      ],
      "dailyPracticeSets": [],
      "marketing": false,
      "replacementPool": false,
      "isActive": true
    },
    "question": "작업 전에 보호 장갑을 착용해야 합니다. 이 문장의 뜻은 무엇입니까?",
    "options": [
      "작업 후에 장갑을 삽니다.",
      "작업 전에 장갑을 껴야 합니다.",
      "장갑 없이 일해도 됩니다.",
      "장갑은 휴게실에 있습니다."
    ],
    "answer": "작업 전에 장갑을 껴야 합니다.",
    "explanationEn": "'착용해야 합니다' means 'must wear,' so gloves are required before work.",
    "explanationNe": nepaliPlaceholder,
    "sourceType": "original",
    "referenceScope": "Original practice item aligned with general workplace Korean safety and communication preparation scope.",
    "officialNotice": ORIGINAL_QUESTION_NOTICE
  }
];

export type Question = PracticeQuestion;

export function getActiveQuestions() {
  return questionPool.filter((question) => question.usage.isActive);
}

export function getLevelTestSet(setId: string) {
  return getActiveQuestions().filter((question) =>
    question.usage.levelTestSets.includes(setId),
  );
}

export function getDailyPracticeSet(setId: string) {
  return getActiveQuestions().filter((question) =>
    question.usage.dailyPracticeSets.includes(setId),
  );
}

export function getMarketingQuestions() {
  return getActiveQuestions().filter((question) => question.usage.marketing);
}

export function getReplacementPool(section?: QuestionSection) {
  return getActiveQuestions().filter(
    (question) =>
      question.usage.replacementPool && (!section || question.section === section),
  );
}

export function validateNoNonOriginalQuestions() {
  return questionPool.every((question) => question.sourceType === "original");
}

export function validateQuestionPoolCounts() {
  return questionPool.reduce(
    (counts, question) => {
      counts.total += 1;
      counts.bySection[question.section] =
        (counts.bySection[question.section] ?? 0) + 1;
      return counts;
    },
    {
      total: 0,
      bySection: {} as Partial<Record<QuestionSection, number>>,
    },
  );
}

export function validateLevelTestSetComposition(setId: string) {
  const levelTestQuestions = getLevelTestSet(setId);
  return levelTestQuestions.reduce(
    (composition, question) => {
      composition.total += 1;
      composition.bySection[question.section] =
        (composition.bySection[question.section] ?? 0) + 1;
      composition.byDifficulty[question.difficulty] += 1;
      return composition;
    },
    {
      total: 0,
      bySection: {} as Partial<Record<QuestionSection, number>>,
      byDifficulty: { easy: 0, medium: 0, hard: 0 },
    },
  );
}

export function getChoiceEntries(question: Question): [ChoiceKey, string][] {
  return question.options.map((option, index) => [
    ["A", "B", "C", "D"][index] as ChoiceKey,
    option,
  ]);
}

export function getChoiceByKey(question: Question, key?: ChoiceKey) {
  if (!key) return undefined;
  return question.options[["A", "B", "C", "D"].indexOf(key)];
}

export function getCorrectChoiceKey(question: Question) {
  return getChoiceEntries(question).find(([, option]) => option === question.answer)?.[0];
}

// The app intentionally uses only Level Test Set A for v0.1.1. Daily Practice
// set assignment is prepared for a future v0.1.2 candidate, but no route/UI is
// implemented here.
export const questions = getLevelTestSet("levelTestSetA");
