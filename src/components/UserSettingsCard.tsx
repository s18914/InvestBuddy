import { Wallet, AlertCircle } from "lucide-react";

interface UserSettingsCardProps {
  minimumCashLevel?: number;
  monthlySavingsAmount?: number;
}

export default function UserSettingsCard({
  minimumCashLevel = 0,
  monthlySavingsAmount = 0,
}: UserSettingsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Ustawienia portfela
        </h3>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-600" />
              Minimalny poziom gotówki
            </div>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minimumCashLevel}
              disabled
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
            <span className="text-gray-600 font-medium">PLN</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            System wyświetli alert, gdy gotówka spadnie poniżej tej wartości
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-green-600" />
              Miesięczna kwota oszczędności
            </div>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={monthlySavingsAmount}
              disabled
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
            <span className="text-gray-600 font-medium">PLN</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Sugerowana kwota do zainwestowania każdego miesiąca
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            Sugerowana alokacja
          </h4>
          <p className="text-sm text-blue-800 mb-3">
            Na podstawie Twojego profilu inwestycyjnego, oto sugerowana alokacja
            miesięcznych oszczędności:
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-900">Obligacje skarbowe</span>
              <span className="font-semibold text-blue-900">40%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-900">Fundusze inwestycyjne</span>
              <span className="font-semibold text-blue-900">35%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-900">Lokaty bankowe</span>
              <span className="font-semibold text-blue-900">20%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-900">Pozostałe</span>
              <span className="font-semibold text-blue-900">5%</span>
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-3">
            💡 Wskazówka: Alokacja będzie dostosowywana na podstawie Twojego
            profilu inwestycyjnego
          </p>
        </div>
      </div>
    </div>
  );
}
