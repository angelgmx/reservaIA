import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ReservaIA
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="#caracteristicas" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              Características
            </Link>
            <Link to="#como-funciona" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              Cómo Funciona
            </Link>
            <Link to="#precios" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
              Precios
            </Link>
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero" size="sm">
                Prueba Gratis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-3">
            <Link to="#caracteristicas" className="text-sm font-medium text-foreground hover:text-primary transition-smooth py-2">
              Características
            </Link>
            <Link to="#como-funciona" className="text-sm font-medium text-foreground hover:text-primary transition-smooth py-2">
              Cómo Funciona
            </Link>
            <Link to="#precios" className="text-sm font-medium text-foreground hover:text-primary transition-smooth py-2">
              Precios
            </Link>
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="w-full">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero" size="sm" className="w-full">
                Prueba Gratis
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
