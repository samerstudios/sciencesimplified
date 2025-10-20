const Hero = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
      
      <div className="container mx-auto px-6 lg:px-12 relative">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-primary leading-tight">
            Making Science
            <span className="block text-accent mt-2">Accessible to All</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            High-impact peer-reviewed research transformed into engaging, digestible reads. 
            Because groundbreaking science shouldn't require a PhD to understand.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
              <span>High Impact Factor</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
              <span>Peer-Reviewed Journals</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
              <span>Expert-Curated Content</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
