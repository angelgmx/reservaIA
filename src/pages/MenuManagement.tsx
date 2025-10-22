import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
}

interface Restaurant {
  id: string;
  menu_description: string;
  faq_info: string;
  additional_info: string;
}

export default function MenuManagement() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [restaurantInfo, setRestaurantInfo] = useState({
    menu_description: '',
    faq_info: '',
    additional_info: '',
  });

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRestaurantData();
    }
  }, [user]);

  const fetchRestaurantData = async () => {
    try {
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (restaurantError) throw restaurantError;

      setRestaurant(restaurantData);
      setRestaurantInfo({
        menu_description: restaurantData.menu_description || '',
        faq_info: restaurantData.faq_info || '',
        additional_info: restaurantData.additional_info || '',
      });

      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .order('category', { ascending: true });

      if (menuError) throw menuError;

      setMenuItems(menuData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRestaurantInfo = async () => {
    if (!restaurant) return;

    try {
      const { error } = await supabase
        .from('restaurants')
        .update(restaurantInfo)
        .eq('id', restaurant.id);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Información actualizada correctamente',
      });
    } catch (error: any) {
      console.error('Error updating restaurant info:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la información',
        variant: 'destructive',
      });
    }
  };

  const handleAddItem = async () => {
    if (!restaurant || !newItem.name || !newItem.price || !newItem.category) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('menu_items')
        .insert({
          restaurant_id: restaurant.id,
          name: newItem.name,
          description: newItem.description,
          price: parseFloat(newItem.price),
          category: newItem.category,
        });

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Plato añadido correctamente',
      });

      setNewItem({ name: '', description: '', price: '', category: '' });
      fetchRestaurantData();
    } catch (error: any) {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'No se pudo añadir el plato',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Plato eliminado correctamente',
      });

      fetchRestaurantData();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el plato',
        variant: 'destructive',
      });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Gestión de Menú y Chatbot</h1>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Información para el Chatbot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="menu_description">Descripción del Menú</Label>
                <Textarea
                  id="menu_description"
                  value={restaurantInfo.menu_description}
                  onChange={(e) => setRestaurantInfo({ ...restaurantInfo, menu_description: e.target.value })}
                  placeholder="Describe tu menú en general..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="faq_info">Preguntas Frecuentes</Label>
                <Textarea
                  id="faq_info"
                  value={restaurantInfo.faq_info}
                  onChange={(e) => setRestaurantInfo({ ...restaurantInfo, faq_info: e.target.value })}
                  placeholder="Horarios, políticas de cancelación, etc."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="additional_info">Información Adicional</Label>
                <Textarea
                  id="additional_info"
                  value={restaurantInfo.additional_info}
                  onChange={(e) => setRestaurantInfo({ ...restaurantInfo, additional_info: e.target.value })}
                  placeholder="Alergias, opciones veganas, etc."
                  rows={3}
                />
              </div>
              <Button onClick={handleUpdateRestaurantInfo}>
                Guardar Información
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Añadir Plato al Menú</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Plato*</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Ej: Paella Valenciana"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría*</Label>
                  <Input
                    id="category"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    placeholder="Ej: Entrantes, Principales, Postres"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Describe el plato..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="price">Precio (€)*</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="15.50"
                />
              </div>
              <Button onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" />
                Añadir Plato
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Menú Actual</CardTitle>
            </CardHeader>
            <CardContent>
              {menuItems.length === 0 ? (
                <p className="text-muted-foreground">No hay platos en el menú aún.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    menuItems.reduce((acc, item) => {
                      if (!acc[item.category]) {
                        acc[item.category] = [];
                      }
                      acc[item.category].push(item);
                      return acc;
                    }, {} as Record<string, MenuItem[]>)
                  ).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-lg mb-2">{category}</h3>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{item.name}</h4>
                                <span className="text-primary font-semibold">€{item.price}</span>
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
