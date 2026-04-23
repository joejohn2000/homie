import React, { useState } from 'react';
import { AuthModal } from '../components/AuthModal';
import { ArrowRight, LogIn, Star } from 'lucide-react';

export function LandingPage({
  onRegister,
  onLogin,
  isSubmitting,
  errorMessage,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [initialMode, setInitialMode] = useState('register');

  const openModal = (mode) => {
    setInitialMode(mode);
    setModalOpen(true);
  };

  return (
    <main className="min-h-screen w-full px-4 py-8 sm:px-8 lg:px-12 bg-[var(--bg-main)]">
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 lg:min-h-[90vh] lg:grid-cols-2 lg:items-center lg:gap-16">
        
        {/* Left Column: Typography & CTAs */}
        <section className="fade-in flex flex-col gap-6 lg:pl-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[var(--border-dark)] bg-[#F4C27F] shadow-[2px_2px_0px_var(--border-dark)] w-fit">
            <Star size={14} fill="currentColor" className="text-[var(--border-dark)]" />
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--border-dark)]">The Homie Directory</p>
          </div>
          
          <h1 className="max-w-2xl font-serif text-6xl font-normal leading-[0.95] text-[var(--text-primary)] sm:text-7xl lg:text-8xl lg:tracking-tight mt-4">
            Find your <br className="hidden lg:block" />people. <br />
            Find your <br className="hidden lg:block" />place.
          </h1>
          
          <p className="max-w-xl text-xl font-medium leading-relaxed text-[var(--text-secondary)] mt-2">
            A curated directory of real people and vetted spaces. 
            No more random identities—just intentional roommate matching.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg">
            <button 
              onClick={() => openModal('register')}
              className="flex min-h-16 w-full flex-1 items-center justify-center gap-3 rounded-2xl border-2 border-[var(--border-dark)] bg-[var(--primary)] px-8 font-bold uppercase tracking-wider text-white shadow-[6px_6px_0px_var(--border-dark)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_var(--border-dark)] active:translate-y-0 active:shadow-[0px_0px_0px_var(--border-dark)] transition-all text-sm"
            >
              Create Account
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
            
            <button 
              onClick={() => openModal('login')}
              className="flex min-h-16 w-full flex-1 sm:w-auto items-center justify-center gap-3 rounded-2xl border-2 border-[var(--border-dark)] bg-white px-8 font-bold uppercase tracking-wider text-[var(--text-primary)] shadow-[4px_4px_0px_var(--border-dark)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_var(--border-dark)] active:translate-y-0 active:shadow-[0px_0px_0px_var(--border-dark)] transition-all text-sm"
            >
              <LogIn size={20} strokeWidth={2.5} />
              Log In
            </button>
          </div>
        </section>

        {/* Right Column: Editorial Image */}
        <section className="scale-in stagger-2 relative hidden lg:flex items-center justify-center w-full h-[80vh]">
          {/* Decorative background shape */}
          <div className="absolute inset-0 bg-[#F4C27F] rounded-[3rem] border-2 border-[var(--border-dark)] shadow-[12px_12px_0px_var(--border-dark)] transform rotate-2 scale-95" />
          
          {/* Main Image Polaroid */}
          <div className="relative z-10 w-[85%] h-[85%] rounded-[2rem] border-2 border-[var(--border-dark)] bg-white p-4 shadow-[8px_8px_0px_var(--border-dark)] transform -rotate-1 transition-transform hover:rotate-0 duration-500 flex flex-col">
            <div className="w-full flex-1 rounded-xl overflow-hidden border-2 border-[var(--border-dark)] relative">
              <img 
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2000&auto=format&fit=crop" 
                alt="Beautiful curated interior" 
                className="w-full h-full object-cover"
              />
              {/* Overlay Badge */}
              <div className="absolute bottom-4 left-4 bg-white border-2 border-[var(--border-dark)] px-4 py-2 rounded-full shadow-[4px_4px_0px_var(--border-dark)] flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--primary)] animate-pulse" />
                <span className="font-bold text-xs uppercase tracking-widest text-[var(--text-primary)]">Curated Spaces</span>
              </div>
            </div>
            
            {/* Caption */}
            <div className="w-full pt-4 pb-2 px-2 flex justify-between items-end">
              <div>
                <h3 className="font-serif text-3xl leading-none text-[var(--text-primary)]">The Brooklyn Loft</h3>
                <p className="font-medium text-[var(--text-secondary)] mt-1">Available starting Sept 1</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-xl text-[var(--text-primary)]">$1,200</span>
                <span className="text-sm font-medium text-[var(--text-secondary)] block">/mo</span>
              </div>
            </div>
          </div>
          
          {/* Floating Avatar Tag */}
          <div className="absolute -left-6 top-1/4 z-20 bg-[var(--bg-main)] border-2 border-[var(--border-dark)] p-2 rounded-full shadow-[4px_4px_0px_var(--border-dark)] flex items-center gap-3 pr-5 transform -rotate-6">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Host" className="w-10 h-10 rounded-full border-2 border-[var(--border-dark)]" />
            <div className="flex flex-col">
               <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Verified Host</span>
               <span className="text-sm font-bold text-[var(--text-primary)]">Sarah Jenkins</span>
            </div>
          </div>

        </section>

      </div>

      {modalOpen && (
        <AuthModal 
          initialMode={initialMode}
          onClose={() => setModalOpen(false)}
          onRegister={onRegister}
          onLogin={onLogin}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      )}
    </main>
  );
}
