import FadeIn from "@/components/animations/fade-in"
import CountUp from "@/components/animations/count-up"

export default function StatsSection() {
  const stats = [
    { value: 30, suffix: "M+", label: "Vagas Encontradas", delay: 100 },
    { value: 15, suffix: "+", label: "Cidades Cobertas", delay: 200 },
    { value: 500, suffix: "K+", label: "Usuários Ativos", delay: 300 },
    { value: 45, suffix: "min", label: "Tempo Médio Economizado", delay: 400 },
  ]

  return (
    <section className="py-16 px-6 bg-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <FadeIn key={index} direction="up" delay={stat.delay}>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
