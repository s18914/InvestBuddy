import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { QuestionnaireAnswers } from "@/services/questionnaireService";

interface QuestionnaireFormProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  onBack: () => void;
}

interface Question {
  id: keyof QuestionnaireAnswers;
  title: string;
  options: {
    value: string;
    label: string;
    points: number;
  }[];
}

const questions: Question[] = [
  {
    id: "question_1",
    title: "Jaki jest Twój główny cel inwestycyjny?",
    options: [
      {
        value: "A",
        label:
          "Ochrona kapitału przed inflacją, bezpieczeństwo jest priorytetem.",
        points: 1,
      },
      {
        value: "B",
        label:
          "Regularne generowanie dodatkowego dochodu (np. odsetek, dywidend) przy umiarkowanym ryzyku.",
        points: 2,
      },
      {
        value: "C",
        label:
          "Znaczący wzrost wartości kapitału w długim terminie, akceptuję umiarkowane wahania wartości.",
        points: 3,
      },
      {
        value: "D",
        label:
          "Maksymalizacja zysków, nawet kosztem dużych, krótkoterminowych wahań wartości portfela.",
        points: 4,
      },
    ],
  },
  {
    id: "question_2",
    title: "Na jak długo planujesz zainwestować swoje środki?",
    options: [
      { value: "A", label: "Do 2 lat.", points: 1 },
      { value: "B", label: "Od 2 do 5 lat.", points: 2 },
      { value: "C", label: "Od 5 do 10 lat.", points: 3 },
      { value: "D", label: "Powyżej 10 lat.", points: 4 },
    ],
  },
  {
    id: "question_3",
    title: "Jakie jest Twoje doświadczenie w inwestowaniu?",
    options: [
      { value: "A", label: "Żadne. To moje pierwsze kroki.", points: 1 },
      {
        value: "B",
        label:
          "Niewielkie. Inwestowałem/am głównie w lokaty lub obligacje skarbowe.",
        points: 2,
      },
      {
        value: "C",
        label:
          "Umiarkowane. Mam doświadczenie z funduszami inwestycyjnymi lub akcjami.",
        points: 3,
      },
      {
        value: "D",
        label:
          "Duże. Aktywnie zarządzam zdywersyfikowanym portfelem i znam złożone instrumenty finansowe.",
        points: 4,
      },
    ],
  },
  {
    id: "question_4",
    title:
      'Czy posiadasz „poduszkę bezpieczeństwa", czyli oszczędności na nieprzewidziane wydatki, pokrywające 3-6 miesięcy Twoich kosztów życia?',
    options: [
      { value: "A", label: "Nie, dopiero zaczynam ją budować.", points: 1 },
      { value: "B", label: "Tak, posiadam.", points: 3 },
    ],
  },
  {
    id: "question_5",
    title:
      "Wyobraź sobie, że Twój portfel traci 15% wartości w ciągu miesiąca. Jak reagujesz?",
    options: [
      {
        value: "A",
        label: "Sprzedaję wszystko. Nie mogę spać, myśląc o stratach.",
        points: 1,
      },
      {
        value: "B",
        label:
          "Poważnie rozważam sprzedaż części aktywów, aby ograniczyć dalsze straty.",
        points: 2,
      },
      {
        value: "C",
        label:
          "Nic nie robię. Rozumiem, że rynki są zmienne i czekam na odbicie.",
        points: 3,
      },
      {
        value: "D",
        label:
          "Dokupuję więcej jednostek, korzystając z niższej ceny. To dla mnie okazja.",
        points: 4,
      },
    ],
  },
  {
    id: "question_6",
    title:
      "Jaka część Twoich oszczędności jest przeznaczona na inwestycje, których wartość może się wahać?",
    options: [
      { value: "A", label: "Mniej niż 25%.", points: 1 },
      { value: "B", label: "Od 25% do 50%.", points: 2 },
      { value: "C", label: "Od 50% do 75%.", points: 3 },
      { value: "D", label: "Ponad 75%.", points: 4 },
    ],
  },
];

export default function QuestionnaireForm({
  onComplete,
  onBack,
}: QuestionnaireFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const currentAnswer = answers[question.id];

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [question.id]: value });
  };

  const handleNext = () => {
    if (!currentAnswer) return;

    if (isLastQuestion) {
      onComplete(answers as QuestionnaireAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onBack();
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              Ankieta profilująca
            </h2>
            <span className="text-blue-100 font-medium">
              Pytanie {currentQuestion + 1} z {questions.length}
            </span>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="px-8 py-10">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">
            {question.title}
          </h3>

          <div className="space-y-4 mb-10">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
                  currentAnswer === option.value
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        currentAnswer === option.value
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {currentAnswer === option.value && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <span className="font-semibold text-blue-600 mr-2">
                      {option.value})
                    </span>
                    <span className="text-gray-800">{option.label}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {currentQuestion === 0 ? "Wróć" : "Poprzednie"}
            </button>

            <button
              onClick={handleNext}
              disabled={!currentAnswer}
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                currentAnswer
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLastQuestion ? "Zakończ" : "Następne"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
