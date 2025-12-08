import { useState } from "react";
import { useTestMode } from "@/contexts/TestModeContext";
import { FlaskConical, Calendar, X } from "lucide-react";

export default function TestModeToggle() {
  const { isTestMode, testDate, enableTestMode, disableTestMode } =
    useTestMode();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split("T")[0];
  });

  const handleEnable = () => {
    enableTestMode(new Date(selectedDate));
    setShowDatePicker(false);
  };

  if (isTestMode) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-amber-800">
            <FlaskConical className="w-5 h-5" />
            <div>
              <p className="font-medium text-sm">Tryb testowy aktywny</p>
              <p className="text-xs">
                Data: {testDate?.toLocaleDateString("pl-PL")}
              </p>
            </div>
            <button
              onClick={disableTestMode}
              className="ml-2 p-1 hover:bg-amber-200 rounded transition-colors"
              title="Wyłącz tryb testowy"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showDatePicker) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg w-72">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="w-5 h-5 text-amber-600" />
            <h3 className="font-medium text-gray-900">Tryb testowy</h3>
            <button
              onClick={() => setShowDatePicker(false)}
              className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Ustaw datę początkową dla danych testowych. Wszystkie rekordy
            utworzone podczas onboardingu będą miały tę datę.
          </p>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data początkowa
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <button
            onClick={handleEnable}
            className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            Włącz tryb testowy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setShowDatePicker(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-gray-600"
        title="Włącz tryb testowy"
      >
        <FlaskConical className="w-4 h-4" />
        <span className="text-sm font-medium">Tryb testowy</span>
      </button>
    </div>
  );
}
