import { ArrowRight, Target, TrendingUp, Shield } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Witaj w InvestBuddy!</h1>
          <p className="text-xl text-blue-100">
            Zacznijmy od poznania Twojego profilu inwestycyjnego
          </p>
        </div>

        <div className="px-8 py-10">
          <div className="mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              Zanim zaczniemy budować Twój portfel inwestycyjny, chcemy Cię
              lepiej poznać. Poniższa ankieta pomoże nam zrozumieć Twoje cele,
              horyzont czasowy i stosunek do ryzyka.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Twoje cele</h3>
              <p className="text-sm text-gray-600">
                Poznamy Twoje cele inwestycyjne i oczekiwania
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-green-50 rounded-lg">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Horyzont czasowy
              </h3>
              <p className="text-sm text-gray-600">
                Określimy na jak długo planujesz inwestować
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-purple-50 rounded-lg">
              <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Stosunek do ryzyka
              </h3>
              <p className="text-sm text-gray-600">
                Zrozumiemy Twój komfort z wahaniami wartości
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <p className="text-gray-800">
              <strong>Ważne:</strong> Odpowiadaj szczerze – nie ma tu dobrych
              ani złych odpowiedzi. Na podstawie Twoich odpowiedzi określimy
              Twój profil inwestycyjny, co pozwoli nam zaproponować strategię
              najlepiej dopasowaną do Twoich potrzeb.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onStart}
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              Rozpocznij ankietę
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
