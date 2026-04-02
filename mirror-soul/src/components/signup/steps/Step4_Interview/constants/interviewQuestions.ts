export interface InterviewQuestion {
  id: number;
  category: string;
  question: string;
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    category: "외향성 (Extraversion)",
    question: "가장 소중한 사람과 의견 차이로 크게 다퉜을 때, 당신은 보통 어떻게 행동하나요?"
  },
  {
    id: 2,
    category: "성실성 (Conscientiousness)",
    question: "계획했던 일이 예상치 못한 변수로 완전히 틀어졌을 때, 어떻게 대처하시나요?"
  },
  {
    id: 3,
    category: "개방성 (Openness)",
    question: "여태껏 한 번도 해보지 않은 완전히 낯선 분야의 일을 제안받는다면, 어떤 선택을 하실 건가요?"
  },
  {
    id: 4,
    category: "친화성 (Agreeableness)",
    question: "팀 프로젝트에서 유독 비협조적인 팀원 때문에 전체 일정이 지연되고 있다면, 어떻게 해결하시겠습니까?"
  },
  {
    id: 5,
    category: "신경증 (Neuroticism)",
    question: "중요한 발표나 면접 전날, 극심한 부담감이 몰려올 때 마인드컨트롤을 하는 당신만의 방법이 있나요?"
  }
];
