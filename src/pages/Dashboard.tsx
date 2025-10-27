import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Copy, Calendar, Users, Settings, Upload, X, Image as ImageIcon, Phone } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Restaurant {
  id: string;
  name: string;
  address: string;
  logo_url?: string;
  gallery_photos?: string[];
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
  const [logoUrl, setLogoUrl] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [isPhoneAssistantOpen, setIsPhoneAssistantOpen] = useState(false);

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

  const updateLogo = async () => {
    if (!restaurant || !logoUrl.trim()) return;

    const { error } = await supabase
      .from('restaurants')
      .update({ logo_url: logoUrl })
      .eq('id', restaurant.id);

    if (error) {
      toast.error("Error al actualizar el logo");
    } else {
      toast.success("Logo actualizado correctamente");
      setRestaurant({ ...restaurant, logo_url: logoUrl });
      setLogoUrl("");
    }
  };

  const addGalleryPhoto = async () => {
    if (!restaurant || !newPhotoUrl.trim()) return;

    const currentPhotos = restaurant.gallery_photos || [];
    const updatedPhotos = [...currentPhotos, newPhotoUrl.trim()];

    const { error } = await supabase
      .from('restaurants')
      .update({ gallery_photos: updatedPhotos })
      .eq('id', restaurant.id);

    if (error) {
      toast.error("Error al añadir la foto");
    } else {
      toast.success("Foto añadida correctamente");
      setRestaurant({ ...restaurant, gallery_photos: updatedPhotos });
      setNewPhotoUrl("");
    }
  };

  const removeGalleryPhoto = async (index: number) => {
    if (!restaurant) return;

    const currentPhotos = restaurant.gallery_photos || [];
    const updatedPhotos = currentPhotos.filter((_, i) => i !== index);

    const { error } = await supabase
      .from('restaurants')
      .update({ gallery_photos: updatedPhotos })
      .eq('id', restaurant.id);

    if (error) {
      toast.error("Error al eliminar la foto");
    } else {
      toast.success("Foto eliminada correctamente");
      setRestaurant({ ...restaurant, gallery_photos: updatedPhotos });
    }
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
            <Card className="gradient-primary">
              <CardHeader>
                <CardTitle className="text-primary-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Enlace de Reservas
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Comparte este enlace con tus clientes para que puedan hacer reservas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link to="/menu-management">
                    <Button variant="secondary" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Gestionar Menú y Chatbot
                    </Button>
                  </Link>
                  <Dialog open={isPhoneAssistantOpen} onOpenChange={setIsPhoneAssistantOpen}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="w-full">
                        <Phone className="h-4 w-4 mr-2" />
                        Asistente Telefónico IA
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Asistente Telefónico con IA</DialogTitle>
                        <DialogDescription>
                          Configura un asistente telefónico inteligente para gestionar llamadas y reservas automáticamente
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            El asistente telefónico con IA puede:
                          </p>
                          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                            <li>Responder llamadas 24/7</li>
                            <li>Gestionar reservas por teléfono</li>
                            <li>Responder preguntas sobre el menú</li>
                            <li>Proporcionar información del restaurante</li>
                          </ul>
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm font-medium mb-2">Estado: No configurado</p>
                          <p className="text-xs text-muted-foreground">
                            Para activar esta funcionalidad, contacta con soporte para integrar servicios de telefonía como Twilio o Vapi.
                          </p>
                        </div>
                        <Button className="w-full" disabled>
                          Próximamente disponible
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Logo del Restaurante
                  </CardTitle>
                  <CardDescription>
                    Sube o actualiza el logo de tu restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {restaurant.logo_url && (
                    <div className="flex justify-center">
                      <img
                        src={restaurant.logo_url}
                        alt="Logo del restaurante"
                        className="h-32 w-32 object-contain rounded-lg border shadow-card"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://ejemplo.com/logo.png"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                    <Button onClick={updateLogo} disabled={!logoUrl.trim()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Galería de Fotos
                  </CardTitle>
                  <CardDescription>
                    Añade fotos de tu restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://ejemplo.com/foto.jpg"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addGalleryPhoto();
                        }
                      }}
                    />
                    <Button onClick={addGalleryPhoto} disabled={!newPhotoUrl.trim()} size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  {restaurant.gallery_photos && restaurant.gallery_photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {restaurant.gallery_photos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={photo}
                            alt={`Foto ${idx + 1}`}
                            className="h-24 w-full object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-smooth"
                            onClick={() => removeGalleryPhoto(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

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
