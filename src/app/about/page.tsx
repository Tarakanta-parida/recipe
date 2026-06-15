import React from 'react';
import { ChefHat, Heart, History, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-12 animate-fade-in">
      <div className="text-center flex flex-col gap-4">
        <h1 className="font-display text-5xl font-bold">About Kavi's Kitchen</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Preserving the authentic flavors and techniques of our ancestors, one recipe at a time.
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-[320px] aspect-square rounded-full overflow-hidden shadow-lg border-4 border-primary/20">
              <img
                src="/assets/logo.jpg"
                alt="Kavi's Kitchen Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <h2 className="font-display text-3xl font-bold">Our Story</h2>
            <p className="text-foreground leading-relaxed">
              Kavi's Traditional Kitchen started as a simple family project to document the heirloom recipes passed down from our grandmother. We realized that as fast food and modern convenience grew, the slow, deliberate, and deeply flavorful traditional cooking methods were slowly being forgotten.
            </p>
            <p className="text-foreground leading-relaxed">
              Our mission is to create a digital sanctuary for cultural dishes—a place where the warmth of a home-cooked meal and the history of traditional ingredients are preserved for future generations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-secondary/30 border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl">Heritage</h3>
          <p className="text-muted-foreground text-sm">
            We document recipes that have stood the test of time, celebrating history on a plate.
          </p>
        </div>
        <div className="bg-secondary/30 border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl">Community</h3>
          <p className="text-muted-foreground text-sm">
            We invite everyone to share their family secrets, building a global cookbook of love.
          </p>
        </div>
        <div className="bg-secondary/30 border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl">Passion</h3>
          <p className="text-muted-foreground text-sm">
            Cooking is our love language. Every recipe shared is a piece of someone's heart.
          </p>
        </div>
      </div>
    </div>
  );
}
