"use client"

import { CheckCircle2, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface PlanCardProps {
  title: string
  description: string
  price: string
  period: string
  features: string[]
  isRecommended?: boolean
  isCurrentPlan?: boolean
  isFreePlan?: boolean
  onSubscribe: () => void
  onCancel?: () => void
  isLoading?: boolean
}

export default function PlanCard({
  title,
  description,
  price,
  period,
  features,
  isRecommended = false,
  isCurrentPlan = false,
  isFreePlan = false,
  onSubscribe,
  onCancel,
  isLoading = false,
}: PlanCardProps) {
  const cardClasses = isRecommended
    ? "flex flex-col border-2 border-primary relative transition-all duration-300 hover:shadow-lg hover:scale-105"
    : "flex flex-col border-2 border-gray-200 transition-all duration-300 hover:border-gray-300 hover:shadow-md"

  const buttonClasses = isCurrentPlan
    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-300"
    : ""

  return (
    <Card className={cardClasses}>
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center">
          <Star className="h-3 w-3 mr-1 fill-white" />
          RECOMENDADO
        </div>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4 text-3xl font-bold">{price}</div>
        <p className="text-sm text-gray-500">{period}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex gap-2">
        {isCurrentPlan ? (
          <>
            <Button variant="outline" className={`flex-1 ${buttonClasses}`}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Plano Atual
            </Button>
            {!isFreePlan && onCancel && (
              <Button
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            )}
          </>
        ) : (
          <Button
            className={`w-full group relative overflow-hidden ${isRecommended ? "" : "variant-outline"}`}
            variant={isRecommended ? "default" : "outline"}
            onClick={onSubscribe}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span> Processando...
              </>
            ) : (
              <>
                <span className="flex items-center transition-transform duration-300 group-hover:-translate-x-2">
                  Assinar Agora
                </span>
                <ArrowRight className="absolute right-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:right-6" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 