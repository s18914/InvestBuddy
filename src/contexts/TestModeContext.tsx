import { createContext, useContext, useState, ReactNode } from "react";

interface TestModeContextType {
  isTestMode: boolean;
  testDate: Date | null;
  enableTestMode: (date: Date) => void;
  disableTestMode: () => void;
  getCurrentDate: () => string;
}

const TestModeContext = createContext<TestModeContextType | undefined>(
  undefined
);

export function TestModeProvider({ children }: { children: ReactNode }) {
  const [isTestMode, setIsTestMode] = useState(false);
  const [testDate, setTestDate] = useState<Date | null>(null);

  const enableTestMode = (date: Date) => {
    setIsTestMode(true);
    setTestDate(date);
  };

  const disableTestMode = () => {
    setIsTestMode(false);
    setTestDate(null);
  };

  const getCurrentDate = (): string => {
    if (isTestMode && testDate) {
      return testDate.toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  };

  return (
    <TestModeContext.Provider
      value={{
        isTestMode,
        testDate,
        enableTestMode,
        disableTestMode,
        getCurrentDate,
      }}
    >
      {children}
    </TestModeContext.Provider>
  );
}

export function useTestMode() {
  const context = useContext(TestModeContext);
  if (context === undefined) {
    throw new Error("useTestMode must be used within a TestModeProvider");
  }
  return context;
}
