import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Wallet, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  ChevronDown,
  ShieldCheck,
  Zap,
  Target,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

// Reveal component for scroll animations
const Reveal = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className={`${className} transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      {children}
    </div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body overflow-x-hidden selection:bg-foreground selection:text-background">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="animate-fade-in space-y-8 max-w-5xl z-10">
          <Reveal>
            <h1 className="text-7xl md:text-[10rem] font-heading font-bold tracking-tighter leading-[0.85] uppercase">
              Money<br />
              <span className="italic font-light lowercase">Made</span>
            </h1>
          </Reveal>
          
          <Reveal className="delay-300">
            <p className="text-xl md:text-3xl text-muted-foreground max-w-2xl mx-auto font-light tracking-tight px-4">
              Take control of your financial destiny with a minimal, grayscale interface designed for focus.
            </p>
          </Reveal>

          <Reveal className="delay-500 pt-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="rounded-full px-12 py-8 text-xl hover:scale-105 transition-transform bg-primary text-primary-foreground shadow-2xl"
            >
              Get Started <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Reveal>
        </div>

        {/* Hero Illustration */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none -z-10">
           <img 
            src="/assets/landing/hero.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover scale-110"
           />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-3 text-muted-foreground/50">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-muted-foreground/50 to-transparent"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-32 space-y-4">
            <Reveal>
              <h2 className="text-5xl md:text-7xl font-heading font-bold tracking-tighter uppercase">Features</h2>
            </Reveal>
            <Reveal className="delay-200">
              <p className="text-muted-foreground text-xl max-w-xl">Powerful tools stripped down to their essential core.</p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                icon: <Wallet className="w-10 h-10" />,
                title: "Expense Tracking",
                desc: "Quickly log and categorize every expenditure with zero friction.",
                img: "/assets/landing/expense.png"
              },
               {
                icon: <TrendingUp className="w-10 h-10" />,
                title: "Income Management",
                desc: "Track multiple streams and visualize your growing wealth.",
                img: "/assets/landing/income.png"
              },
               {
                icon: <BarChart3 className="w-10 h-10" />,
                title: "Visual Reports",
                desc: "Deep-dive into spending trends with beautiful grayscale analytics.",
                img: "/assets/landing/reports.png"
              },
               {
                icon: <Calendar className="w-10 h-10" />,
                title: "Monthly Insights",
                desc: "High-level summaries to keep you on track every single month.",
                img: "/assets/landing/monthly.png"
              }
            ].map((feature, i) => (
              <Reveal key={i} className={`delay-${(i % 2) * 200}`}>
                <div className="group space-y-8 p-1">
                  <div className="aspect-[16/9] overflow-hidden rounded-3xl bg-muted border border-border group-hover:border-foreground transition-colors duration-500">
                    <img 
                      src={feature.img} 
                      alt={feature.title} 
                      className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                    />
                  </div>
                  <div className="flex gap-6 items-start">
                    <div className="p-4 bg-muted rounded-2xl group-hover:bg-foreground group-hover:text-background transition-colors duration-500 shrink-0">
                      {feature.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-heading font-bold uppercase tracking-tight">{feature.title}</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed max-w-md">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-40 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-16">
            <Reveal>
              <h2 className="text-5xl md:text-7xl font-heading font-bold tracking-tighter uppercase">How it works</h2>
            </Reveal>

            <div className="space-y-12">
              {[
                { number: "01", title: "Identity", desc: "Create your secure account to start your journey." },
                { number: "02", title: "Action", desc: "Log your income and expenses as they occur." },
                { number: "03", title: "Clarity", desc: "Instantly see where your money goes through reports." }
              ].map((step, i) => (
                <Reveal key={i} className={`delay-${i * 100}`}>
                  <div className="flex gap-8 group">
                    <span className="text-6xl font-heading font-black text-muted-foreground/10 transition-colors group-hover:text-foreground/20">
                      {step.number}
                    </span>
                    <div className="pt-2">
                      <h3 className="text-2xl font-bold uppercase tracking-tight mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-lg max-w-sm">{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal className="lg:pl-12">
            <div className="relative group">
              <div className="absolute -inset-4 bg-foreground/5 blur-3xl -z-10 group-hover:bg-foreground/10 transition-colors duration-700"></div>
              <div className="bg-card border border-border p-3 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
                 <img 
                   src="/assets/landing/dashboard.png" 
                   alt="Dashboard Preview" 
                   className="w-full h-auto rounded-[2rem] grayscale group-hover:scale-[1.02] transition-transform duration-1000"
                 />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Insights Section */}
      <section className="py-40 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <Reveal>
              <h2 className="text-5xl md:text-8xl font-heading font-bold tracking-tighter uppercase">Insights</h2>
            </Reveal>
            <Reveal className="delay-200">
              <p className="text-xl md:text-2xl text-muted-foreground font-light italic">
                “Understand your spending patterns and make smarter decisions.”
              </p>
            </Reveal>
          </div>
          
          <Reveal>
            <div className="relative rounded-[3rem] overflow-hidden border border-border bg-muted/10 group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 z-10"></div>
              <img 
                src="/assets/landing/insights_large.png" 
                alt="Large Analytics" 
                className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 transition-transform duration-[3s]"
              />
              <div className="absolute bottom-12 left-12 z-20">
                 <div className="bg-background/90 backdrop-blur-xl border border-border p-8 rounded-3xl max-w-md shadow-2xl">
                    <p className="text-xl font-heading font-medium leading-relaxed">
                      Our intelligence engine processes your data to find hidden opportunities in your spending.
                    </p>
                 </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-40 px-4 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
             {[
               { icon: <ShieldCheck className="w-12 h-12" />, title: "Stay organized", desc: "A singular destination for your entire financial life." },
               { icon: <Zap className="w-12 h-12" />, title: "Avoid overspending", desc: "Intuitive limits that respect your long-term goals." },
               { icon: <Target className="w-12 h-12" />, title: "Build savings", desc: "Turn tracking into passive wealth generation." }
             ].map((benefit, i) => (
               <Reveal key={i} className={`delay-${i * 200}`}>
                 <div className="space-y-8 group">
                   <div className="w-20 h-20 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                     {benefit.icon}
                   </div>
                   <div className="space-y-4">
                    <h3 className="text-4xl font-heading font-bold tracking-tight uppercase">{benefit.title}</h3>
                    <p className="text-muted-foreground text-xl leading-relaxed">{benefit.desc}</p>
                   </div>
                 </div>
               </Reveal>
             ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-60 px-4 text-center relative">
        <div className="max-w-4xl mx-auto space-y-12">
          <Reveal>
            <h2 className="text-6xl md:text-[8rem] font-heading font-bold tracking-tighter uppercase leading-[0.9]">
              Start your journey today
            </h2>
          </Reveal>
          <Reveal className="delay-300">
            <div className="pt-8">
               <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="rounded-full px-16 py-10 text-2xl hover:scale-105 transition-transform bg-foreground text-background hover:bg-foreground/90 shadow-2xl uppercase tracking-widest font-black"
                >
                  Get Started
                </Button>
            </div>
          </Reveal>
        </div>
        
        {/* Subtle Background Illustration */}
        <div className="absolute inset-x-0 bottom-0 top-1/2 opacity-[0.02] pointer-events-none -z-10 bg-[url('https://images.unsplash.com/photo-1550565118-3d1428df4a78?q=80&w=2000&auto=format&fit=crop&grayscale=1')] bg-cover bg-center"></div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-foreground rounded-full"></div>
            <span className="font-heading font-black text-2xl uppercase tracking-tighter">MoneyMade</span>
          </div>
          <div className="flex gap-12 text-sm font-bold uppercase tracking-widest text-muted-foreground">
             <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
             <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
             <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-tighter opacity-50 text-center md:text-right">
            Grayscale Financial Systems <br />
            Personal Edition 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
