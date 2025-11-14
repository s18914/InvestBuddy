import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getQuestionnaireResponse,
  saveQuestionnaireResponse,
  calculateProfile,
  QuestionnaireAnswers,
  QuestionnaireResult,
} from "@/services/questionnaireService";
import { MifidResponse } from "@/types/database.types";

export function useQuestionnaire() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<MifidResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchResponse = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getQuestionnaireResponse(user.id);
      setResponse(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch questionnaire"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponse();
  }, [user]);

  const submitQuestionnaire = async (
    answers: QuestionnaireAnswers
  ): Promise<QuestionnaireResult> => {
    if (!user) throw new Error("User not authenticated");

    try {
      const result = calculateProfile(answers);
      const savedResponse = await saveQuestionnaireResponse(user.id, result);
      setResponse(savedResponse);
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save questionnaire"
      );
      throw err;
    }
  };

  return {
    loading,
    response,
    error,
    hasCompleted: !!response,
    submitQuestionnaire,
    refetch: fetchResponse,
  };
}
