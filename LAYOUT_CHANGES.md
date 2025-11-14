# Zmiany w layoutzie aplikacji

## Przegląd zmian

Reorganizacja interfejsu użytkownika - przeniesienie sekcji "Mój portfel" z Profile na Dashboard, oraz dodanie karty profilu inwestycyjnego na stronie Profile.

---

## Dashboard (po ankiecie)

### Nowy layout:

1. **Tytuł:** "Dashboard"

2. **Sekcja portfela (jeśli są aktywa):**

   - Wykres kołowy (Pie Chart) - alokacja portfela
   - Podsumowanie - liczba aktywów i łączna wartość
   - Lista aktywów (READ-ONLY) - bez możliwości edycji
     - Nazwa aktywa
     - Kategoria
     - Wartość
     - Procent udziału w portfelu
     - Pasek postępu

3. **Przycisk do zarządzania:**

   - Link "Zarządzaj aktywami →" prowadzący do Profile

4. **Jeśli brak aktywów:**
   - Komunikat zachęcający do dodania pierwszych aktywów
   - Przycisk do Profile

---

## Profile (Zarządzanie portfelem)

### Nowy layout (3-kolumnowy):

**Kolumna lewa (2/3 szerokości):**

- Lista aktywów z możliwością edycji (jak poprzednio)
  - Edytuj wartość
  - Usuń aktywo

**Kolumna prawa (1/3 szerokości - sticky):**

1. **Wykres kołowy** - alokacja portfela
2. **Karta profilu inwestycyjnego** (nowa!)

   - Ikona profilu
   - Nazwa profilu (Ostrożny/Stabilny/Zbilansowany/Dynamiczny)
   - Opis profilu
   - Wynik ankiety (pasek postępu)
   - Odpowiedzi na 6 pytań (grid 3x2)
   - Data ukończenia ankiety
   - Jeśli brak ankiety: komunikat z przyciskiem do ankiety

3. **Karta ustawień portfela** (nowa!)
   - Minimalny poziom gotówki (read-only)
   - Miesięczna kwota oszczędności (read-only)
   - **Mockup sugerowanej alokacji:**
     - Obligacje skarbowe: 40%
     - Fundusze inwestycyjne: 35%
     - Lokaty bankowe: 20%
     - Pozostałe: 5%
   - Wskazówka o dostosowywaniu alokacji

---

## Nowe komponenty

### 1. `AssetListReadOnly.tsx`

- Wyświetla listę aktywów bez możliwości edycji
- Pokazuje:
  - Kolor aktywa
  - Nazwę i kategorię
  - Wartość i procent udziału
  - Pasek postępu
- Łączna wartość portfela na górze
- Link do zarządzania aktywami na dole

### 2. `InvestorProfileCard.tsx`

- Wyświetla profil inwestycyjny z ankiety
- Kolorowe karty dla każdego profilu:
  - Ostrożny (niebieski)
  - Stabilny (zielony)
  - Zbilansowany (fioletowy)
  - Dynamiczny (pomarańczowy)
- Pokazuje:
  - Ikonę profilu
  - Nazwę i opis
  - Wynik ankiety (pasek postępu)
  - Odpowiedzi na 6 pytań
  - Datę ukończenia
- Jeśli brak ankiety: komunikat z przyciskiem

### 3. `UserSettingsCard.tsx`

- Wyświetla ustawienia portfela (read-only)
- Pola:
  - Minimalny poziom gotówki
  - Miesięczna kwota oszczędności
- Mockup sugerowanej alokacji
- Wskazówka o dostosowywaniu

---

## Zmodyfikowane komponenty

### `Dashboard.tsx`

- Dodano import `useAssets` i `useQuestionnaire`
- Dodano import nowych komponentów
- Po ankiecie wyświetla:
  - Wykres kołowy
  - Podsumowanie
  - Listę aktywów (read-only)
  - Komunikat jeśli brak aktywów

### `Profile.tsx`

- Dodano import `useQuestionnaire`
- Dodano import nowych komponentów
- Zmieniono layout na 3-kolumnowy
- Kolumna prawa zawiera:
  - Wykres kołowy
  - Kartę profilu inwestycyjnego
  - Kartę ustawień portfela

---

## Przepływ użytkownika

### Nowy użytkownik:

1. Zalogowanie
2. Dashboard - ekran powitalny ankiety
3. Wypełnienie ankiety (6 pytań)
4. Wyświetlenie wyniku
5. Przejście do Dashboard - widok portfela (pusty)
6. Przycisk do Profile - dodanie aktywów
7. Po dodaniu aktywów - Dashboard pokazuje portfel

### Powracający użytkownik:

1. Zalogowanie
2. Dashboard - portfel z aktywami
3. Możliwość przejścia do Profile do zarządzania
4. W Profile - widok profilu inwestycyjnego i ustawień

---

## Style i kolory

### Profile inwestycyjne:

- **Ostrożny:** Niebieski (#3B82F6)
- **Stabilny:** Zielony (#10B981)
- **Zbilansowany:** Fioletowy (#A855F7)
- **Dynamiczny:** Pomarańczowy (#F97316)

### Komponenty:

- Białe karty z cieniami
- Sticky sidebar w Profile
- Responsywny layout (1 kolumna na mobile, 3 na desktop)
- Smooth transitions i hover effects

---

## Przyszłe rozszerzenia

1. **Edycja ustawień portfela** - pozwolić użytkownikowi edytować:

   - Minimalny poziom gotówki
   - Miesięczną kwotę oszczędności
   - Sugerowaną alokację

2. **Ponowne wypełnienie ankiety** - przycisk do aktualizacji profilu

3. **Alerty** - powiadomienia gdy:

   - Gotówka spadnie poniżej minimum
   - Portfel odbiega od sugerowanej alokacji

4. **Historyczne wykresy** - pokazanie zmian w portfelu w czasie

---

## Testowanie

1. Zaloguj się do aplikacji
2. Wypełnij ankietę MiFID
3. Przejdź do Dashboard - powinieneś zobaczyć pusty portfel
4. Przejdź do Profile - dodaj kilka aktywów
5. Wróć do Dashboard - powinieneś zobaczyć portfel z aktywami
6. W Profile - sprawdź kartę profilu inwestycyjnego i ustawień
