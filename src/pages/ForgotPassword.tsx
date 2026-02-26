import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage(
        "Sprawdź swoją skrzynkę email - wysłaliśmy link do resetowania hasła."
      );
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Wystąpił błąd podczas wysyłania emaila");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resetowanie hasła
          </h1>
          <p className="text-gray-600">
            Podaj swój email, a wyślemy Ci link do resetowania hasła
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          {message && (
            <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              "Wysyłanie..."
            ) : (
              <>
                <Mail className="h-5 w-5" />
                Wyślij link resetujący
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót do logowania
          </a>
        </div>
      </div>
    </div>
  );
}
