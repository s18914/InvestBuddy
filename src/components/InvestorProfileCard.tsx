import { InvestorProfile, MifidResponse } from "@/types/database.types";
import { Shield, TrendingUp, Target, Sparkles } from "lucide-react";

interface InvestorProfileCardProps {
  response: MifidResponse | null;
  loading?: boolean;
}

const profileConfig: Record<
  InvestorProfile,
  {
    title: string;
    description: string;
    icon: typeof Shield;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  cautious: {
    title: "Profil Ostrożny",
    description: "Priorytetem jest bezpieczeństwo i ochrona kapitału",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  stable: {
    title: "Profil Stabilny",
    description: "Akceptujesz niewielkie ryzyko dla stabilnego wzrostu",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  balanced: {
    title: "Profil Zbilansowany",
    description:
      "Dążysz do znaczącego wzrostu kapitału w dłuższej perspektywie",
    icon: Target,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  dynamic: {
    title: "Profil Dynamiczny",
    description: "Maksymalizujesz zyski, akceptując wyższe ryzyko",
    icon: Sparkles,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
};

export default function InvestorProfileCard({
  response,
  loading,
}: InvestorProfileCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-400">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Profil inwestycyjny
        </h3>
        <p className="text-gray-600 mb-4">
          Uzupełnij ankietę profilującą, aby poznać swój profil inwestycyjny.
        </p>
        <a
          href="/dashboard"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Przejdź do ankiety
        </a>
      </div>
    );
  }

  const config = profileConfig[response.investor_profile];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} rounded-lg shadow border-2 ${config.borderColor} overflow-hidden`}
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center border-2 ${config.borderColor}`}
          >
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${config.color}`}>
              {config.title}
            </h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Wynik ankiety</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all`}
                style={{
                  backgroundColor: config.color
                    .replace("text-", "bg-")
                    .split("-")[1],
                  width: `${(response.total_score / 23) * 100}%`,
                }}
              />
            </div>
            <span className="font-semibold text-gray-900">
              {response.total_score}/23
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Pytanie 1</p>
            <p className="font-semibold text-gray-900">
              {response.question_1_answer}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Pytanie 2</p>
            <p className="font-semibold text-gray-900">
              {response.question_2_answer}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Pytanie 3</p>
            <p className="font-semibold text-gray-900">
              {response.question_3_answer}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Pytanie 4</p>
            <p className="font-semibold text-gray-900">
              {response.question_4_answer}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Pytanie 5</p>
            <p className="font-semibold text-gray-900">
              {response.question_5_answer}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Pytanie 6</p>
            <p className="font-semibold text-gray-900">
              {response.question_6_answer}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-100 border-t border-gray-200 text-xs text-gray-600">
        Ukończono: {new Date(response.completed_at).toLocaleDateString("pl-PL")}
      </div>
    </div>
  );
}
