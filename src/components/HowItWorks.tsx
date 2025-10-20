import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Regístrate",
    description: "Crea tu cuenta en minutos. Sin tarjeta de crédito, sin compromisos.",
    details: [
      "Configura tu restaurante",
      "Define horarios y turnos",
      "Añade tu carta digital"
    ]
  },
  {
    number: "02",
    title: "Personaliza",
    description: "Adapta el sistema a tu marca y necesidades específicas.",
    details: [
      "Configura disponibilidad de mesas",
      "Personaliza mensajes automáticos",
      "Activa el asistente de IA"
    ]
  },
  {
    number: "03",
    title: "Integra",
    description: "Comparte el enlace de reservas en tu web, redes sociales o Google.",
    details: [
      "Copia el enlace de reservas",
      "Añádelo donde quieras",
      "Los clientes reservan al instante"
    ]
  },
  {
    number: "04",
    title: "Automatiza",
    description: "Deja que la IA gestione las reservas mientras te enfocas en cocinar.",
    details: [
      "El sistema atiende llamadas y chats",
      "Confirma reservas automáticamente",
      "Envía recordatorios a los clientes"
    ]
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comienza en
            <span className="bg-gradient-accent bg-clip-text text-transparent"> 4 pasos simples</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No necesitas conocimientos técnicos. El sistema te guía en cada paso.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="relative p-8 bg-card border-border hover:border-accent/50 hover:shadow-card transition-smooth overflow-hidden group"
            >
              {/* Decorative number */}
              <div className="absolute -top-8 -right-8 text-9xl font-bold text-muted/10 group-hover:text-accent/10 transition-smooth">
                {step.number}
              </div>

              <div className="relative z-10">
                <div className="mb-4">
                  <span className="text-5xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {step.description}
                </p>

                <ul className="space-y-3">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
