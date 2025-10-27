import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Upload, X, Image as ImageIcon, Palette, Save } from "lucide-react";
import { toast } from "sonner";

interface Restaurant {
  id: string;
  name: string;
  logo_url?: string;
  theme_colors?: any;
  gallery_photos?: string[];
}

const RestaurantSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [logoUrl, setLogoUrl] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#FF7A59");
  const [secondaryColor, setSecondaryColor] = useState("#2D3748");

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchRestaurant();
  }, [user, navigate]);

  const fetchRestaurant = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching restaurant:', error);
      toast.error("Error al cargar el restaurante");
    } else {
      setRestaurant(data);
      if (data.theme_colors && typeof data.theme_colors === 'object' && !Array.isArray(data.theme_colors)) {
        const colors = data.theme_colors as Record<string, any>;
        setPrimaryColor(colors.primary || "#FF7A59");
        setSecondaryColor(colors.secondary || "#2D3748");
      }
    }
    setLoading(false);
  };

  const updateLogo = async () => {
    if (!restaurant || !logoUrl.trim()) return;

    setSaving(true);
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
    setSaving(false);
  };

  const addGalleryPhoto = async () => {
    if (!restaurant || !newPhotoUrl.trim()) return;

    setSaving(true);
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
    setSaving(false);
  };

  const removeGalleryPhoto = async (index: number) => {
    if (!restaurant) return;

    setSaving(true);
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
    setSaving(false);
  };

  const updateThemeColors = async () => {
    if (!restaurant) return;

    setSaving(true);
    const { error } = await supabase
      .from('restaurants')
      .update({
        theme_colors: {
          primary: primaryColor,
          secondary: secondaryColor,
        }
      })
      .eq('id', restaurant.id);

    if (error) {
      toast.error("Error al actualizar los colores");
    } else {
      toast.success("Colores actualizados correctamente");
      setRestaurant({
        ...restaurant,
        theme_colors: { primary: primaryColor, secondary: secondaryColor }
      });
    }
    setSaving(false);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardHeader>
            <CardTitle>No hay restaurante</CardTitle>
            <CardDescription>
              Primero necesitas crear tu restaurante.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/restaurant-setup')}>
              Crear Restaurante
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Configuración del Restaurante</h1>
          <p className="text-muted-foreground">{restaurant.name}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Logo Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Logo del Restaurante
              </CardTitle>
              <CardDescription>
                El logo aparecerá en tu página de reservas y en las comunicaciones con clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {restaurant.logo_url && (
                <div className="flex justify-center p-6 bg-muted rounded-lg">
                  <img
                    src={restaurant.logo_url}
                    alt="Logo del restaurante"
                    className="h-32 w-32 object-contain rounded-lg"
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
                <Button onClick={updateLogo} disabled={!logoUrl.trim() || saving}>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos recomendados: PNG, JPG, SVG. Tamaño recomendado: 200x200px
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Theme Colors Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Colores del Tema
              </CardTitle>
              <CardDescription>
                Personaliza los colores de tu página de reservas para que coincida con tu marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Color Principal</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#FF7A59"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este color se usa en botones y elementos destacados
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Color Secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#2D3748"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este color se usa en encabezados y textos importantes
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Vista previa:</p>
                <div className="space-y-2">
                  <Button style={{ backgroundColor: primaryColor }} className="text-white">
                    Botón de ejemplo
                  </Button>
                  <div className="p-2 rounded" style={{ backgroundColor: secondaryColor, color: 'white' }}>
                    Texto de ejemplo
                  </div>
                </div>
              </div>

              <Button onClick={updateThemeColors} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Guardar Colores
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Gallery Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Galería de Fotos
              </CardTitle>
              <CardDescription>
                Las fotos aparecerán en tu página de reservas para mostrar tu restaurante a los clientes
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
                <Button onClick={addGalleryPhoto} disabled={!newPhotoUrl.trim() || saving} size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              
              {restaurant.gallery_photos && restaurant.gallery_photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {restaurant.gallery_photos.map((photo, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={photo}
                        alt={`Foto ${idx + 1}`}
                        className="h-32 w-full object-cover rounded-lg border shadow-card transition-smooth"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-smooth"
                        onClick={() => removeGalleryPhoto(idx)}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay fotos en la galería</p>
                  <p className="text-sm">Añade fotos para mostrar tu restaurante</p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Formatos recomendados: JPG, PNG. Tamaño recomendado: al menos 800x600px
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default RestaurantSettings;
