import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { restaurantId, message } = await req.json();
    console.log('Chatbot request:', { restaurantId, message });

    if (!restaurantId || !message) {
      throw new Error('Missing restaurantId or message');
    }

    // Crear cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener información del restaurante
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      throw new Error('Restaurant not found');
    }

    // Obtener el menú del restaurante
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true);

    if (menuError) {
      console.error('Error fetching menu:', menuError);
    }

    // Construir contexto para la IA
    let contextInfo = `
Eres un asistente virtual para el restaurante "${restaurant.name}".

Información del restaurante:
- Nombre: ${restaurant.name}
- Descripción: ${restaurant.description || 'No disponible'}
- Dirección: ${restaurant.address}, ${restaurant.city}
- Teléfono: ${restaurant.phone}
- Email: ${restaurant.email || 'No disponible'}
- Tipo de cocina: ${restaurant.cuisine_type || 'No especificado'}
- Rango de precios: ${restaurant.price_range || 'No especificado'}
`;

    if (restaurant.menu_description) {
      contextInfo += `\n- Descripción del menú: ${restaurant.menu_description}`;
    }

    if (restaurant.faq_info) {
      contextInfo += `\n- Preguntas frecuentes: ${restaurant.faq_info}`;
    }

    if (restaurant.additional_info) {
      contextInfo += `\n- Información adicional: ${restaurant.additional_info}`;
    }

    if (menuItems && menuItems.length > 0) {
      contextInfo += '\n\nMenú disponible:\n';
      const menuByCategory = menuItems.reduce((acc: any, item: any) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});

      Object.entries(menuByCategory).forEach(([category, items]: [string, any]) => {
        contextInfo += `\n${category}:\n`;
        items.forEach((item: any) => {
          contextInfo += `- ${item.name} (€${item.price})`;
          if (item.description) {
            contextInfo += `: ${item.description}`;
          }
          contextInfo += '\n';
        });
      });
    }

    contextInfo += `\n\nPor favor, responde de manera amable y útil a las preguntas de los clientes sobre el restaurante. Si te preguntan sobre reservas, indícales que pueden hacer una reserva directamente en la página.`;

    // Llamar a Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: contextInfo },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Límite de uso alcanzado. Por favor, inténtalo de nuevo más tarde.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Servicio temporalmente no disponible.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const reply = data.choices[0].message.content;

    console.log('AI response:', reply);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
