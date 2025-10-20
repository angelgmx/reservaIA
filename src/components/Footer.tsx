import { Link } from "react-router-dom";
import { UtensilsCrossed, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-secondary-foreground">
                ReservaIA
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md mb-4">
              El sistema de reservas inteligente que transforma la gestión de tu restaurante. 
              Simple, automatizado y profesional.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@reservaia.com" className="hover:text-primary transition-smooth">
                  info@reservaia.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Madrid, España</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold mb-4 text-secondary-foreground">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="#caracteristicas" className="text-muted-foreground hover:text-primary transition-smooth">
                  Características
                </Link>
              </li>
              <li>
                <Link to="#como-funciona" className="text-muted-foreground hover:text-primary transition-smooth">
                  Cómo Funciona
                </Link>
              </li>
              <li>
                <Link to="#precios" className="text-muted-foreground hover:text-primary transition-smooth">
                  Precios
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 text-secondary-foreground">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-smooth">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-smooth">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-smooth">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ReservaIA. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
