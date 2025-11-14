# Instrukcja - Ankieta Profilująca

## Jak zaktualizować bazę danych

### Krok 1: Otwórz Supabase SQL Editor

1. Zaloguj się do Supabase
2. Wybierz swój projekt InvestBuddy
3. Przejdź do zakładki "SQL Editor"

### Krok 2: Usuń starą tabelę i stwórz nową

Skopiuj i wklej poniższy kod SQL:

```sql
-- Usuń starą tabelę (jeśli istnieje)
DROP TABLE IF EXISTS mifid_responses CASCADE;

-- Stwórz nową tabelę
CREATE TABLE mifid_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_1_answer TEXT NOT NULL,
  question_2_answer TEXT NOT NULL,
  question_3_answer TEXT NOT NULL,
  question_4_answer TEXT NOT NULL,
  question_5_answer TEXT NOT NULL,
  question_6_answer TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  investor_profile TEXT NOT NULL CHECK (investor_profile IN ('cautious', 'stable', 'balanced', 'dynamic')),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Włącz Row Level Security
ALTER TABLE mifid_responses ENABLE ROW LEVEL SECURITY;

-- Dodaj polityki bezpieczeństwa
CREATE POLICY "Users can view own mifid" ON mifid_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mifid" ON mifid_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mifid" ON mifid_responses FOR UPDATE USING (auth.uid() = user_id);
```

### Krok 3: Uruchom kod

Kliknij przycisk "Run" w SQL Editor

### Krok 4: Zweryfikuj

Sprawdź czy tabela została utworzona:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'mifid_responses';
```

## Jak przetestować ankietę

### Krok 1: Uruchom aplikację

```bash
cd d:\EU\InvestBuddy
npm run dev
```

### Krok 2: Zaloguj się

Otwórz przeglądarkę i przejdź do `http://localhost:5173`

### Krok 3: Przejdź przez ankietę

1. **Ekran powitalny** - kliknij "Rozpocznij ankietę"
2. **Pytania** - odpowiedz na 6 pytań
3. **Wyniki** - zobacz swój profil inwestycyjny
4. **Zakończ** - kliknij "Przejdź do aplikacji"

### Krok 4: Sprawdź bazę danych

```sql
SELECT * FROM mifid_responses WHERE user_id = auth.uid();
```

## Struktura odpowiedzi

### Pytanie 1: Cel inwestycyjny

- A (1 pkt) - Ochrona kapitału
- B (2 pkt) - Regularny dochód
- C (3 pkt) - Wzrost kapitału
- D (4 pkt) - Maksymalizacja zysków

### Pytanie 2: Horyzont czasowy

- A (1 pkt) - Do 2 lat
- B (2 pkt) - 2-5 lat
- C (3 pkt) - 5-10 lat
- D (4 pkt) - Powyżej 10 lat

### Pytanie 3: Doświadczenie

- A (1 pkt) - Żadne
- B (2 pkt) - Niewielkie
- C (3 pkt) - Umiarkowane
- D (4 pkt) - Duże

### Pytanie 4: Poduszka bezpieczeństwa

- A (1 pkt) - Nie
- B (3 pkt) - Tak

### Pytanie 5: Reakcja na straty

- A (1 pkt) - Sprzedaję wszystko
- B (2 pkt) - Rozważam sprzedaż
- C (3 pkt) - Czekam
- D (4 pkt) - Dokupuję

### Pytanie 6: Udział ryzykownych aktywów

- A (1 pkt) - Mniej niż 25%
- B (2 pkt) - 25-50%
- C (3 pkt) - 50-75%
- D (4 pkt) - Ponad 75%

## Profile inwestycyjne

### Ostrożny (6-9 punktów)

- Kolor: Niebieski
- Priorytet: Bezpieczeństwo
- Aktywa: Obligacje, lokaty, konta oszczędnościowe
- Horyzont: Krótki (do 2-3 lat)

### Stabilny (10-14 punktów)

- Kolor: Zielony
- Priorytet: Stabilny wzrost
- Aktywa: Obligacje + fundusze mieszane
- Horyzont: Średni (3-5 lat)

### Zbilansowany (15-18 punktów)

- Kolor: Fioletowy
- Priorytet: Wzrost kapitału
- Aktywa: Akcje + obligacje + złoto
- Horyzont: Długi (5-10 lat)

### Dynamiczny (19-23 punkty)

- Kolor: Pomarańczowy
- Priorytet: Maksymalizacja zysków
- Aktywa: Akcje + fundusze agresywne
- Horyzont: Bardzo długi (10+ lat)

## Rozwiązywanie problemów

### Problem: Ankieta się nie wyświetla

**Rozwiązanie:**

1. Sprawdź czy jesteś zalogowany
2. Sprawdź console w przeglądarce (F12)
3. Zweryfikuj połączenie z Supabase

### Problem: Błąd podczas zapisywania

**Rozwiązanie:**

1. Sprawdź czy tabela `mifid_responses` istnieje
2. Sprawdź czy RLS policies są aktywne
3. Sprawdź czy user_id jest poprawny

### Problem: Ankieta wyświetla się ponownie

**Rozwiązanie:**

1. Sprawdź czy odpowiedź została zapisana w bazie
2. Wyczyść cache przeglądarki
3. Odśwież stronę (F5)

### Problem: Błąd TypeScript

**Rozwiązanie:**

1. Uruchom `npm install`
2. Sprawdź czy wszystkie pliki zostały utworzone
3. Zrestartuj dev server

## Pliki do sprawdzenia

Jeśli coś nie działa, sprawdź te pliki:

1. `src/pages/Dashboard.tsx` - główna logika
2. `src/components/questionnaire/WelcomeScreen.tsx` - ekran powitalny
3. `src/components/questionnaire/QuestionnaireForm.tsx` - formularz
4. `src/components/questionnaire/ResultScreen.tsx` - wyniki
5. `src/services/questionnaireService.ts` - logika biznesowa
6. `src/hooks/useQuestionnaire.ts` - hook
7. `supabase_schema.sql` - schemat bazy

## Kontakt

Jeśli potrzebujesz pomocy, sprawdź:

- `QUESTIONNAIRE_IMPLEMENTATION.md` - szczegółowa dokumentacja techniczna
- `database_migration_instructions.md` - instrukcje migracji bazy danych
