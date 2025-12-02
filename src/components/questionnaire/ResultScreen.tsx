import {
  CheckCircle,
  TrendingUp,
  Shield,
  Target,
  Sparkles,
} from "lucide-react";
import { InvestorProfile } from "@/types/database.types";

interface ResultScreenProps {
  profile: InvestorProfile;
  totalScore: number;
  onContinue: () => void;
}

const profileData: Record<
  InvestorProfile,
  {
    title: string;
    description: string;
    characteristics: string;
    suggestedAssets: string;
    horizon: string;
    color: string;
    bgColor: string;
    icon: typeof Shield;
  }
> = {
  cautious: {
    title: "Profil Ostrożny",
    description:
      "Jesteś inwestorem, dla którego najważniejsze jest bezpieczeństwo i ochrona kapitału.",
    characteristics:
      "Unikasz ryzyka i wolisz mniejszy, ale pewniejszy zysk, niż potencjalnie wysokie stopy zwrotu obarczone dużą niepewnością. Twoim celem jest głównie pokonanie inflacji.",
    suggestedAssets:
      "Głównie obligacje skarbowe (detaliczne i hurtowe), lokaty bankowe, konta oszczędnościowe. Niewielki udział mogą stanowić fundusze dłużne o najniższym poziomie ryzyka.",
    horizon: "Krótki (do 2-3 lat)",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: Shield,
  },
  stable: {
    title: "Profil Stabilny",
    description:
      "Akceptujesz niewielkie ryzyko w zamian za szansę na wyższy zysk niż na lokacie bankowej.",
    characteristics:
      "Zależy Ci na regularnych dochodach z inwestycji i stabilnym wzroście. Jesteś w stanie tolerować niewielkie wahania wartości portfela.",
    suggestedAssets:
      "Zdywersyfikowany portfel oparty na obligacjach (skarbowych i korporacyjnych), uzupełniony o fundusze inwestycyjne mieszane (stabilnego wzrostu) oraz niewielki dodatek funduszy akcji (np. spółek dywidendowych).",
    horizon: "Średni (od 3 do 5 lat)",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: TrendingUp,
  },
  balanced: {
    title: "Profil Zbilansowany",
    description:
      "Dążysz do osiągnięcia znaczącego wzrostu kapitału w dłuższej perspektywie.",
    characteristics:
      "Rozumiesz, że wiąże się to z akceptacją umiarkowanego ryzyka i okresowych spadków wartości portfela. Twój portfel powinien być zrównoważony pomiędzy aktywami bezpiecznymi a ryzykownymi.",
    suggestedAssets:
      "Równowaga między akcjami (lub funduszami akcyjnymi) a obligacjami. Portfel może być uzupełniony o złoto, nieruchomości (np. przez fundusze typu REIT) lub inne aktywa alternatywne w celu dywersyfikacji.",
    horizon: "Długi (od 5 do 10 lat)",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: Target,
  },
  dynamic: {
    title: "Profil Dynamiczny",
    description: "Twoim głównym celem jest maksymalizacja zysków.",
    characteristics:
      'Jesteś gotów podjąć wysokie ryzyko i nie boisz się dużych wahań rynkowych, nawet jeśli oznaczają one przejściowe, głębokie straty. Masz długi horyzont inwestycyjny, który pozwala „przeczekać" rynkowe burze.',
    suggestedAssets:
      "Dominujący udział akcji lub agresywnych funduszy akcyjnych (w tym rynków wschodzących czy spółek technologicznych). Portfel może zawierać również niewielki udział bardziej ryzykownych instrumentów, jeśli zdecydujesz się je dodać jako aktywa własne.",
    horizon: "Bardzo długi (powyżej 10 lat)",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    icon: Sparkles,
  },
};

export default function ResultScreen({
  profile,
  totalScore,
  onContinue,
}: ResultScreenProps) {
  const data = profileData[profile];
  const Icon = data.icon;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-12 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Gratulacje!</h1>
          <p className="text-xl text-green-100">Ankieta została ukończona</p>
        </div>

        <div className="px-8 py-10">
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-gray-100 rounded-full mb-4">
              <span className="text-gray-600 font-medium">
                Twój wynik:{" "}
                <strong className="text-gray-900">{totalScore} punktów</strong>
              </span>
            </div>
          </div>

          <div
            className={`${data.bgColor} rounded-lg p-8 mb-8 border-2 border-${
              profile === "cautious"
                ? "blue"
                : profile === "stable"
                ? "green"
                : profile === "balanced"
                ? "purple"
                : "orange"
            }-200`}
          >
            <div className="flex items-center mb-6">
              <div
                className={`w-16 h-16 ${
                  data.bgColor
                } rounded-full flex items-center justify-center mr-4 border-2 border-${
                  profile === "cautious"
                    ? "blue"
                    : profile === "stable"
                    ? "green"
                    : profile === "balanced"
                    ? "purple"
                    : "orange"
                }-300`}
              >
                <Icon className={`w-8 h-8 ${data.color}`} />
              </div>
              <div>
                <h2 className={`text-3xl font-bold ${data.color}`}>
                  {data.title}
                </h2>
                <p className="text-gray-600 mt-1">Twój profil inwestycyjny</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Charakterystyka:
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {data.description}
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                  {data.characteristics}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Sugerowane aktywa:
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {data.suggestedAssets}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Horyzont inwestycyjny:
                </h3>
                <p className="text-gray-700 leading-relaxed">{data.horizon}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">
              Rekomendowane źródła wiedzy:
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Książki:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>"Inteligentny inwestor" – Benjamin Graham</li>
                <li>"Finansowa forteca" – Maciej Samcik</li>
                <li>"Psychologia pieniądza" – Morgan Housel</li>
                <li>"Błądząc po Wall Street" – Burton G. Malkiel</li>
              </ul>
              <p className="mt-3">
                <strong>Blogi i portale:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>"Jak oszczędzać pieniądze" (appfunds.blogspot.com)</li>
                <li>"Subiektywnie o finansach" (subiektywnieofinansach.pl)</li>
                <li>Analizy.pl</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onContinue}
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Przejdź dalej
              <CheckCircle className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
