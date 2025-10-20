import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Clock, 
  Smartphone,
  Users,
  Sparkles,
  Globe
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Asistente de IA",
    description: "Atiende llamadas y mensajes automáticamente. Tu restaurante nunca pierde una reserva.",
  },
  {
    icon: Calendar,
    title: "Gestión de Mesas",
    description: "Asigna y organiza mesas en tiempo real según ocupación y disponibilidad.",
  },
  {
    icon: MessageSquare,
    title: "Chat y Voz",
    description: "Los clientes pueden reservar por chat o llamada telefónica con IA.",
  },
  {
    icon: BarChart3,
    title: "Analítica Avanzada",
    description: "Reportes predictivos de ocupación, ventas y comportamiento de clientes.",
  },
  {
    icon: Clock,
    title: "Disponibilidad 24/7",
    description: "El sistema funciona siempre, incluso cuando tu restaurante está cerrado.",
  },
  {
    icon: Smartphone,
    title: "100% Web",
    description: "Sin apps que instalar. Todo desde el navegador, en cualquier dispositivo.",
  },
  {
    icon: Users,
    title: "CRM Integrado",
    description: "Gestiona clientes, historial de visitas, preferencias y fidelización.",
  },
  {
    icon: Sparkles,
    title: "Personalizable",
    description: "Adapta el sistema a tu marca, horarios y necesidades específicas.",
  },
  {
    icon: Globe,
    title: "Fácil Integración",
    description: "Integra el sistema en tu web, redes sociales o perfil de Google con un enlace.",
  },
];

const Features = () => {
  return (
    <section id="caracteristicas" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Todo lo que necesitas para
            <span className="bg-gradient-primary bg-clip-text text-transparent"> gestionar reservas</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Una plataforma completa que combina automatización, inteligencia artificial y simplicidad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 hover:shadow-card transition-smooth bg-card border-border hover:border-primary/30 group"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4 p-3 rounded-xl bg-gradient-primary w-fit group-hover:shadow-glow transition-smooth">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
