import { Link, useNavigate, useLocation } from "react-router-dom";
import { Microscope } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-gradient-accent rounded-lg group-hover:scale-105 transition-transform">
            <Microscope className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-primary">ScienceSimplified</h1>
            <p className="text-xs text-muted-foreground">High-Impact Research for Everyone</p>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={handleHome}
            className="text-sm font-medium text-foreground hover:text-accent transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('articles')}
            className="text-sm font-medium text-foreground hover:text-accent transition-colors"
          >
            Articles
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className="text-sm font-medium text-foreground hover:text-accent transition-colors"
          >
            About
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
