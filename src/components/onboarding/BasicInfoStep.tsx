import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicInfo {
  age: number;
  monthlyLivingCosts: number;
}

interface BasicInfoStepProps {
  onSubmit: (info: BasicInfo) => void;
}

export function BasicInfoStep({ onSubmit }: BasicInfoStepProps) {
  const [age, setAge] = useState("");
  const [monthlyLivingCosts, setMonthlyLivingCosts] = useState("");
  const [errors, setErrors] = useState<{
    age?: string;
    monthlyLivingCosts?: string;
  }>({});

  const validate = () => {
    const newErrors: { age?: string; monthlyLivingCosts?: string } = {};

    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      newErrors.age = "Podaj poprawny wiek (18-100)";
    }

    const costsNum = parseFloat(monthlyLivingCosts);
    if (!monthlyLivingCosts || isNaN(costsNum) || costsNum <= 0) {
      newErrors.monthlyLivingCosts = "Podaj poprawną kwotę (większą od 0)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit({
        age: parseInt(age),
        monthlyLivingCosts: parseFloat(monthlyLivingCosts),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Podstawowe informacje</CardTitle>
        <CardDescription>
          Podaj swoje podstawowe dane, które pomogą nam obliczyć Twoją poduszkę
          finansową
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="age">Wiek</Label>
            <Input
              id="age"
              type="number"
              placeholder="np. 30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={errors.age ? "border-red-500" : ""}
            />
            {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
            <p className="text-sm text-gray-500">
              Twój wiek pomoże nam dostosować rekomendacje inwestycyjne
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyLivingCosts">
              Miesięczne koszty życia (PLN)
            </Label>
            <Input
              id="monthlyLivingCosts"
              type="number"
              step="0.01"
              placeholder="np. 5000"
              value={monthlyLivingCosts}
              onChange={(e) => setMonthlyLivingCosts(e.target.value)}
              className={errors.monthlyLivingCosts ? "border-red-500" : ""}
            />
            {errors.monthlyLivingCosts && (
              <p className="text-sm text-red-500">
                {errors.monthlyLivingCosts}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Uwzględnij wszystkie stałe wydatki: czynsz, jedzenie, rachunki,
              transport, itp.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              💡 Dlaczego to ważne?
            </h4>
            <p className="text-sm text-blue-800">
              Poduszka finansowa to fundament Twojej strategii inwestycyjnej.
              Powinna wynosić 6-miesięczne koszty życia i chronić Cię przed
              nieprzewidzianymi wydatkami.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Dalej →
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
