import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Copy, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Restaurant {
  id: string;
  name: string;
  address: string;
}

interface Reservation {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  number_of_guests: number;
  status: string;
  special_requests?: string;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRestaurantData();
      fetchReservations();
    }
  }, [user]);

  const fetchRestaurantData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching restaurant:', error);
    } else {
      setRestaurant(data);
    }
    setLoadingData(false);
  };

  const fetchReservations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true });

    if (error) {
      console.error('Error fetching reservations:', error);
    } else {
      setReservations(data || []);
    }
  };

  const copyBookingLink = () => {
    if (!restaurant) return;
    const link = `${window.location.origin}/booking/${restaurant.id}`;
    navigator.clipboard.writeText(link);
    toast.success("¡Enlace copiado al portapapeles!");
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ReservaIA
            </h1>
            {restaurant && (
              <p className="text-sm text-muted-foreground">{restaurant.name}</p>
            )}
          </div>
          <Button onClick={signOut} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!restaurant ? (
          <Card>
            <CardHeader>
              <CardTitle>Configura tu Restaurante</CardTitle>
              <CardDescription>
                Primero necesitas crear tu restaurante para empezar a recibir reservas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/restaurant-setup')}>
                Crear Restaurante
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="bg-gradient-primary">
              <CardHeader>
                <CardTitle className="text-primary-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Enlace de Reservas
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Comparte este enlace con tus clientes para que puedan hacer reservas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/booking/${restaurant.id}`}
                    className="flex-1 px-3 py-2 rounded-lg bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/30"
                  />
                  <Button onClick={copyBookingLink} variant="secondary">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Reservas Recientes
                </CardTitle>
                <CardDescription>
                  {reservations.length} reserva{reservations.length !== 1 ? 's' : ''} en total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reservations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aún no tienes reservas. Comparte tu enlace de reservas con tus clientes.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="p-4 border rounded-lg hover:shadow-card transition-smooth"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{reservation.customer_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {reservation.customer_email} • {reservation.customer_phone}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              reservation.status === 'confirmed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                : reservation.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                            }`}
                          >
                            {reservation.status === 'confirmed' ? 'Confirmada' : 
                             reservation.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(reservation.reservation_date), 'PPP', { locale: es })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {reservation.number_of_guests} persona{reservation.number_of_guests !== 1 ? 's' : ''}
                          </span>
                          <span>⏰ {reservation.reservation_time}</span>
                        </div>
                        {reservation.special_requests && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Solicitudes: {reservation.special_requests}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
