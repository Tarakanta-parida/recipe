'use client';

import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function ContactPage() {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock sending message
    setTimeout(() => {
      showToast('Your message has been sent successfully! We will get back to you soon.');
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 animate-fade-in">
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <div>
          <h1 className="font-display text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-muted-foreground">
            Have a question, a traditional recipe to share privately, or just want to say hello? We'd love to hear from you.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Email Us</h3>
              <p className="text-muted-foreground text-sm">hello@kaviskitchen.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Our Kitchen</h3>
              <p className="text-muted-foreground text-sm">123 Spice Lane, Heritage City</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Call Us</h3>
              <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-2/3 bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm">
        <h2 className="font-display text-2xl font-bold mb-6">Send us a Message</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-bold">Your Name</label>
              <input
                type="text"
                id="name"
                required
                placeholder="Jane Doe"
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-bold">Your Email</label>
              <input
                type="email"
                id="email"
                required
                placeholder="jane@example.com"
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="subject" className="text-sm font-bold">Subject</label>
            <input
              type="text"
              id="subject"
              required
              placeholder="How can we help?"
              className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm font-bold">Message</label>
            <textarea
              id="message"
              required
              rows={5}
              placeholder="Write your message here..."
              className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 hover:translate-y-[-1px] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Sending...' : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
