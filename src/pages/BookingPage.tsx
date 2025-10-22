import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { UtensilsCrossed, ArrowLeft, Calendar as CalendarIcon, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import RestaurantChatbot from "@/components/RestaurantChatbot";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
}

const BookingPage = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    numberOfGuests: "2",
    time: "19:00",
    specialRequests: "",
  });

  useEffect(() => {
    fetchRestaurant();
  }, [restaurantId]);

  const fetchRestaurant = async () => {
    if (!restaurantId) return;

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching restaurant:', error);
      toast.error("No se pudo cargar el restaurante");
    } else {
      setRestaurant(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !restaurant) return;

    setSubmitting(true);

    const { error } = await supabase.from('reservations').insert({
      restaurant_id: restaurant.id,
      customer_id: '00000000-0000-0000-0000-000000000000', // Temporal para usuarios no autenticados
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      customer_phone: formData.customerPhone,
      reservation_date: format(date, 'yyyy-MM-dd'),
      reservation_time: formData.time,
      number_of_guests: parseInt(formData.numberOfGuests),
      special_requests: formData.specialRequests || null,
      status: 'pending',
    });

    if (error) {
      console.error('Error creating reservation:', error);
      toast.error("Error al crear la reserva. Intenta de nuevo.");
    } else {
      toast.success("¡Reserva creada exitosamente! El restaurante te contactará pronto.");
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        numberOfGuests: "2",
        time: "19:00",
        specialRequests: "",
      });
      setDate(undefined);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Restaurante no encontrado</CardTitle>
            <CardDescription>
              El restaurante que buscas no existe o no está disponible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-smooth">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-6 shadow-card">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-primary">
                  <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-3xl">{restaurant.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {restaurant.description}
                  </CardDescription>
                  <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                    <p>📍 {restaurant.address}</p>
                    <p>📞 {restaurant.phone}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Hacer una Reserva
              </CardTitle>
              <CardDescription>
                Completa el formulario para reservar tu mesa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input
                        id="name"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="juan@ejemplo.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="+34 600 123 456"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guests">
                        <Users className="h-4 w-4 inline mr-1" />
                        Número de personas *
                      </Label>
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max="20"
                        value={formData.numberOfGuests}
                        onChange={(e) => setFormData({ ...formData, numberOfGuests: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Hora *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Fecha de reserva *</Label>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-lg border"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requests">Solicitudes especiales</Label>
                  <Textarea
                    id="requests"
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    placeholder="Alergias, preferencias de mesa, celebraciones..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!date || submitting}
                >
                  {submitting ? "Procesando..." : "Confirmar Reserva"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <RestaurantChatbot restaurantId={restaurant.id} />
    </div>
  );
};

export default BookingPage;
