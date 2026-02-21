export function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-accent/10 px-8 py-12">
      <div className="absolute top-4 right-6 font-mono text-[120px] font-bold leading-none text-primary/[0.04] select-none">
        &#916;
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Soil &amp; Water Infrastructure Intelligence
      </p>
      <h1 className="mt-2 font-mono text-3xl font-bold tracking-tight md:text-4xl">
        The Delta
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
        Fusing satellite imagery with IoT sensor ground truth for soil and water
        monitoring, AI-driven risk assessment, and blockchain-verified audit
        trails across Sub-Saharan Africa, South Asia, and Southeast Asia.
      </p>
    </div>
  );
}
