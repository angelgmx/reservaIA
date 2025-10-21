import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

const RestaurantSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    cuisineType: "",
    priceRange: "$$",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    // Primero, asignar el rol de restaurant_owner
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: user.id,
        role: 'restaurant_owner'
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      toast.error("Error al asignar permisos");
      setSubmitting(false);
      return;
    }

    // Luego crear el restaurante
    const { error } = await supabase.from('restaurants').insert({
      owner_id: user.id,
      name: formData.name,
      description: formData.description,
      address: formData.address,
      city: formData.city,
      phone: formData.phone,
      email: formData.email,
      cuisine_type: formData.cuisineType,
      price_range: formData.priceRange,
      is_active: true,
    });

    if (error) {
      console.error('Error creating restaurant:', error);
      toast.error("Error al crear el restaurante");
    } else {
      toast.success("¡Restaurante creado exitosamente!");
      navigate('/dashboard');
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-accent/10 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-primary">
                <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Configura tu Restaurante</CardTitle>
                <CardDescription>
                  Completa la información de tu restaurante para empezar a recibir reservas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Restaurante *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="La Bella Italia"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Auténtica cocina italiana con ingredientes frescos..."
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle Principal 123"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Madrid"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+34 912 345 678"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@restaurante.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cuisineType">Tipo de Cocina</Label>
                  <Input
                    id="cuisineType"
                    value={formData.cuisineType}
                    onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                    placeholder="Italiana, Mediterránea, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceRange">Rango de Precio</Label>
                  <select
                    id="priceRange"
                    value={formData.priceRange}
                    onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="$">$ - Económico</option>
                    <option value="$$">$$ - Moderado</option>
                    <option value="$$$">$$$ - Caro</option>
                    <option value="$$$$">$$$$ - Muy Caro</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                size="lg"
                disabled={submitting}
              >
                {submitting ? "Creando restaurante..." : "Crear Restaurante"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantSetup;
