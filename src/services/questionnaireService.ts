import { supabase } from "@/lib/supabase";
import { MifidResponse, InvestorProfile } from "@/types/database.types";

export interface QuestionnaireAnswers {
  question_1: string;
  question_2: string;
  question_3: string;
  question_4: string;
  question_5: string;
  question_6: string;
}

export interface QuestionnaireResult {
  answers: QuestionnaireAnswers;
  totalScore: number;
  profile: InvestorProfile;
}

const ANSWER_SCORES: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
};

export function calculateProfile(
  answers: QuestionnaireAnswers
): QuestionnaireResult {
  const scores = [
    ANSWER_SCORES[answers.question_1],
    ANSWER_SCORES[answers.question_2],
    ANSWER_SCORES[answers.question_3],
    ANSWER_SCORES[answers.question_4],
    ANSWER_SCORES[answers.question_5],
    ANSWER_SCORES[answers.question_6],
  ];

  const totalScore = scores.reduce((sum, score) => sum + score, 0);

  let profile: InvestorProfile;
  if (totalScore >= 6 && totalScore <= 9) {
    profile = "cautious";
  } else if (totalScore >= 10 && totalScore <= 14) {
    profile = "stable";
  } else if (totalScore >= 15 && totalScore <= 18) {
    profile = "balanced";
  } else {
    profile = "dynamic";
  }

  return {
    answers,
    totalScore,
    profile,
  };
}

export async function saveQuestionnaireResponse(
  userId: string,
  result: QuestionnaireResult
): Promise<MifidResponse> {
  const { data, error } = await supabase
    .from("mifid_responses")
    .upsert({
      user_id: userId,
      question_1_answer: result.answers.question_1,
      question_2_answer: result.answers.question_2,
      question_3_answer: result.answers.question_3,
      question_4_answer: result.answers.question_4,
      question_5_answer: result.answers.question_5,
      question_6_answer: result.answers.question_6,
      total_score: result.totalScore,
      investor_profile: result.profile,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQuestionnaireResponse(
  userId: string
): Promise<MifidResponse | null> {
  const { data, error } = await supabase
    .from("mifid_responses")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteQuestionnaireResponse(
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("mifid_responses")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}
