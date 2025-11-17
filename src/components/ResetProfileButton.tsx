import { useState } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";

interface ResetProfileButtonProps {
  onReset: () => Promise<void>;
}

export default function ResetProfileButton({
  onReset,
}: ResetProfileButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    try {
      setIsLoading(true);
      await onReset();
      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to reset profile:", error);
      alert("Błąd podczas resetowania profilu. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
      >
        <RotateCcw className="w-4 h-4" />
        Resetuj profil
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Resetuj profil?
          </h3>
        </div>

        <p className="text-gray-600 mb-2">Ta akcja spowoduje:</p>

        <ul className="space-y-2 mb-6 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">•</span>
            <span>
              Usunięcie Twojego profilu inwestycyjnego (ankieta MiFID)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">•</span>
            <span>Usunięcie wszystkich aktywów z portfela</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">•</span>
            <span>Powrót do stanu początkowego aplikacji</span>
          </li>
        </ul>

        <p className="text-sm text-red-600 font-medium mb-6">
          ⚠️ Tej akcji nie można cofnąć!
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Anuluj
          </button>
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Resetowanie...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Resetuj
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
