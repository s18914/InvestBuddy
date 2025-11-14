# Implementacja Ankiety Profilującej MiFID

## Przegląd

Zaimplementowano pełny system ankiety profilującej użytkownika zgodnie z wymaganiami MiFID. System składa się z trzech głównych ekranów:

1. **Ekran powitalny** - wprowadzenie do ankiety
2. **Formularz ankiety** - 6 pytań z systemem punktacji
3. **Ekran wyników** - wyświetlenie profilu inwestycyjnego

## Zmiany w bazie danych

### Zaktualizowana tabela `mifid_responses`

```sql
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
```

### Instrukcje migracji

Zobacz plik `database_migration_instructions.md` dla szczegółowych instrukcji jak zaktualizować bazę danych bez utraty danych.

## Struktura plików

### Nowe pliki

```
src/
├── components/
│   └── questionnaire/
│       ├── WelcomeScreen.tsx          # Ekran powitalny
│       ├── QuestionnaireForm.tsx      # Formularz z pytaniami
│       └── ResultScreen.tsx           # Ekran z wynikami
├── services/
│   └── questionnaireService.ts        # Logika biznesowa i API
└── hooks/
    └── useQuestionnaire.ts            # Hook do zarządzania stanem ankiety
```

### Zmodyfikowane pliki

- `src/pages/Dashboard.tsx` - zintegrowano przepływ ankiety
- `src/types/database.types.ts` - zaktualizowano typy
- `supabase_schema.sql` - zaktualizowano schemat bazy danych

## Funkcjonalność

### 1. Ekran powitalny (WelcomeScreen)

- Przyjazne wprowadzenie do ankiety
- Wyjaśnienie celu ankiety
- Trzy główne obszary: cele, horyzont czasowy, stosunek do ryzyka
- Przycisk "Rozpocznij ankietę"

### 2. Formularz ankiety (QuestionnaireForm)

**6 pytań z opcjami odpowiedzi:**

1. **Cel inwestycyjny** (A-D, 1-4 pkt)
2. **Horyzont czasowy** (A-D, 1-4 pkt)
3. **Doświadczenie** (A-D, 1-4 pkt)
4. **Poduszka bezpieczeństwa** (A-B, 1 lub 3 pkt)
5. **Reakcja na straty** (A-D, 1-4 pkt)
6. **Udział ryzykownych aktywów** (A-D, 1-4 pkt)

**Funkcje:**

- Pasek postępu
- Nawigacja przód/wstecz
- Wizualne zaznaczenie wybranej odpowiedzi
- Walidacja - nie można przejść dalej bez odpowiedzi
- Responsywny design

### 3. Ekran wyników (ResultScreen)

**Wyświetla:**

- Łączną liczbę punktów
- Przypisany profil inwestycyjny
- Szczegółowy opis profilu
- Sugerowane aktywa
- Horyzont inwestycyjny
- Rekomendowane źródła wiedzy (książki i blogi)

**Profile inwestycyjne:**

- **Ostrożny** (6-9 pkt) - niebieski
- **Stabilny** (10-14 pkt) - zielony
- **Zbilansowany** (15-18 pkt) - fioletowy
- **Dynamiczny** (19-23 pkt) - pomarańczowy

### 4. Logika systemu punktacji

```typescript
// Każda odpowiedź ma przypisaną wartość:
A = 1 punkt
B = 2 punkty (lub 3 dla pytania 4)
C = 3 punkty
D = 4 punkty

// Suma punktów określa profil:
6-9 punktów   → Profil Ostrożny
10-14 punktów → Profil Stabilny
15-18 punktów → Profil Zbilansowany
19-23 punkty  → Profil Dynamiczny
```

## Integracja z Dashboard

Dashboard automatycznie:

1. Sprawdza czy użytkownik ukończył ankietę
2. Jeśli NIE - wyświetla przepływ ankiety (welcome → questionnaire → result)
3. Jeśli TAK - wyświetla normalny dashboard z wykresami

## API i serwisy

### questionnaireService.ts

**Funkcje:**

- `calculateProfile(answers)` - oblicza wynik i profil
- `saveQuestionnaireResponse(userId, result)` - zapisuje do bazy
- `getQuestionnaireResponse(userId)` - pobiera z bazy

### useQuestionnaire hook

**Zwraca:**

- `loading` - stan ładowania
- `response` - zapisana odpowiedź (jeśli istnieje)
- `hasCompleted` - czy użytkownik ukończył ankietę
- `submitQuestionnaire(answers)` - funkcja do zapisania odpowiedzi
- `refetch()` - odświeżenie danych

## Bezpieczeństwo

- Row Level Security (RLS) włączone
- Użytkownicy widzą tylko swoje odpowiedzi
- Unique constraint na user_id - jedna ankieta na użytkownika
- Możliwość aktualizacji odpowiedzi (upsert)

## Stylizacja

- Modern, clean design
- TailwindCSS
- Lucide icons
- Gradient backgrounds
- Smooth transitions
- Responsive layout
- Accessible colors

## Testowanie

1. Uruchom dev server: `npm run dev`
2. Zaloguj się do aplikacji
3. Dashboard automatycznie wyświetli ekran powitalny
4. Przejdź przez ankietę
5. Zobacz wyniki
6. Po kliknięciu "Przejdź do aplikacji" - dashboard się przeładuje
7. Przy kolejnym logowaniu - ankieta nie będzie się już wyświetlać

## Następne kroki

Po zaimplementowaniu ankiety, możesz:

1. Dodać możliwość ponownego wypełnienia ankiety (np. raz w roku)
2. Wykorzystać profil do sugerowania alokacji portfela
3. Dodać alerty gdy portfel odbiega od profilu ryzyka
4. Stworzyć raporty porównujące profil z rzeczywistym portfelem

## Uwagi techniczne

- Wszystkie teksty w języku polskim (zgodnie z wymaganiami)
- Brak komentarzy w kodzie (clean code approach)
- TypeScript dla type safety
- Async/await dla operacji bazodanowych
- Error handling z user-friendly messages
- Loading states dla lepszego UX

## Wsparcie

Jeśli napotkasz problemy:

1. Sprawdź czy schemat bazy danych jest zaktualizowany
2. Sprawdź console w przeglądarce dla błędów
3. Zweryfikuj połączenie z Supabase
4. Upewnij się że RLS policies są aktywne
