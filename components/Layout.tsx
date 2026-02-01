import React, { useState, useEffect, useRef } from 'react';
import { playClickSound, playTypingSound } from '../utils/audio';

interface LayoutProps {
  children: React.ReactNode;
  onGoHome: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onGoHome }) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'CULTURE' | 'HISTORY' | 'CREATOR'>('NONE');
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Gahanu Pirimi Mal Palaturu',
      text: 'Play the legendary Sri Lankan pen-and-paper game online with friends!',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert('Link copied to clipboard!');
    }
  };



  // ... (imports)

  // Inside Layout component
  // Attempt to play on mount (will likely be blocked by browser until interaction, which is fine)
  // Attempt to play on mount
  useEffect(() => {
    const attemptPlay = async () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.5; // User requested volume
        try {
          await audioRef.current.play();
        } catch (err) {
          // Autoplay blocked, waiting for interaction...
          // Fallback: Play on first interaction if blocked
          const enableAudio = () => {
            audioRef.current?.play().catch(e => console.error("Interaction play failed", e));
            window.removeEventListener('click', enableAudio);
            window.removeEventListener('keydown', enableAudio);
          };
          window.addEventListener('click', enableAudio);
          window.addEventListener('keydown', enableAudio);
        }
      }
    };

    attemptPlay();
  }, []);



  // ... (imports)

  // Inside Layout component
  // Global Sound Listeners
  useEffect(() => {
    const handleGlobalClick = () => {
      playClickSound();
    };

    const handleGlobalKeydown = () => {
      playTypingSound();
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleGlobalKeydown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleGlobalKeydown);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-sl-paper bg-batik-pattern font-sans text-sl-brown bg-fixed bg-cover">
      {/* Background Audio */}
      <audio ref={audioRef} loop src="/goyam_kavi.mp3" />

      {/* Navigation - Dark Glassmorphism */}
      <header className="fixed w-full top-0 z-50 bg-sl-paper/80 backdrop-blur-xl border-b border-white/5 shadow-lg transition-all duration-300">
        <div className="container mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
          <button onClick={onGoHome} className="flex items-center group">
            {/* Logo Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-sl-maroon to-red-900 rounded-xl flex items-center justify-center text-sl-gold font-serif font-bold text-2xl shadow-glow mr-3 transition-transform group-hover:scale-110 group-hover:rotate-3 border border-sl-gold/30">
              ග
            </div>
            <div className="flex flex-col items-start">
              <h1 className="font-bold text-xl text-sl-maroon tracking-tight leading-none group-hover:text-sl-gold transition-colors font-serif">
                <span className="text-sl-brown">Gahanu</span> Pirimi <span className="text-sl-gold">Mal Palaturu</span>
              </h1>
              <span className="text-[10px] uppercase tracking-[0.2em] text-sl-clay font-bold mt-1">Epic Word Battle</span>
            </div>
          </button>

          <nav className="flex items-center space-x-3 md:space-x-6">
            <button
              onClick={toggleMusic}
              className={`p-3 rounded-full transition-all duration-300 border ${isMusicPlaying ? 'bg-sl-maroon/20 border-sl-maroon text-sl-maroon shadow-glow' : 'bg-sl-sand border-white/5 text-sl-clay hover:text-sl-gold'}`}
              title={isMusicPlaying ? "Mute Ambience" : "Play Ambience"}
            >
              {isMusicPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 animate-pulse">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-sl-sand border border-white/5 text-sl-clay hover:text-sl-gold transition-all duration-300 hover:shadow-glow"
              title="Share with Friends"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.287 1.093s-.107.768-.287 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>

            <button
              onClick={() => setActiveModal('CULTURE')}
              className="hidden md:block text-xs font-bold text-sl-clay hover:text-sl-gold transition-colors uppercase tracking-widest hover:underline decoration-sl-maroon underline-offset-4"
            >
              Culture
            </button>
            <button
              onClick={() => setActiveModal('HISTORY')}
              className="hidden md:block text-xs font-bold text-sl-clay hover:text-sl-gold transition-colors uppercase tracking-widest hover:underline decoration-sl-maroon underline-offset-4"
            >
              History
            </button>
            <button
              onClick={() => setActiveModal('CREATOR')}
              className="hidden md:block text-xs font-bold text-sl-clay hover:text-sl-gold transition-colors uppercase tracking-widest hover:underline decoration-sl-maroon underline-offset-4"
            >
              Creator
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col pt-24 relative z-0">
        {children}
      </main>

      {/* Footer - Temple Wall Color */}
      <footer className="bg-sl-sand/50 backdrop-blur-md text-sl-clay py-12 mt-auto border-t border-white/5 relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h4 className="font-serif text-2xl font-bold text-sl-gold mb-2">Heritage Games</h4>
            <p className="text-sm opacity-60 max-w-xs leading-relaxed">
              Inspired by the sounds of the Geta Bera and the colors of the Perahera.
              Preserving Sri Lankan culture digitally.
            </p>
          </div>
          <div className="flex space-x-6 text-sm font-bold uppercase tracking-wider">
            <button onClick={() => setActiveModal('CULTURE')} className="hover:text-sl-maroon transition-colors">Culture</button>
            <button onClick={() => setActiveModal('HISTORY')} className="hover:text-sl-maroon transition-colors">History</button>
            <button onClick={() => setActiveModal('CREATOR')} className="hover:text-sl-maroon transition-colors">Creator</button>
          </div>
        </div>
        <div className="text-center mt-10 pt-6 border-t border-white/5 text-xs opacity-30 font-mono">
          © {new Date().getFullYear()} Made in Sri Lanka.
        </div>
      </footer>

      {/* MODALS */}
      {activeModal !== 'NONE' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal('NONE')}></div>

          <div className="bg-sl-sand w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-sl-gold/20 animate-slide-up flex flex-col max-h-[90vh]">

            {/* Header Image */}
            <div className="h-40 bg-sl-maroon relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-sl-sand to-transparent"></div>

              <button
                onClick={() => setActiveModal('NONE')}
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors border border-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="absolute bottom-0 left-0 p-8">
                <h2 className="text-4xl font-serif font-black text-sl-brown drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-sl-gold to-yellow-200">
                  {activeModal === 'CULTURE' ? 'Our Heritage' : activeModal === 'HISTORY' ? 'Our History' : 'The Creator'}
                </h2>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 overflow-y-auto">
              {activeModal === 'CULTURE' && (
                <div className="space-y-6">
                  <p className="text-sl-brown text-lg leading-relaxed">
                    Sri Lankan culture is a vibrant mix of indigenous traditions and colonial influences, centered heavily around <strong>community, agriculture, and festivals</strong> like the Sinhala & Tamil New Year (Avurudu).
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-sl-paper p-5 rounded-2xl border border-white/5 shadow-inner">
                      <h4 className="font-bold text-sl-maroon mb-2 text-lg">🎭 Masks (Ves Muhunu)</h4>
                      <p className="text-sm text-sl-clay">Used in traditional rituals (Thovil) to heal and protect. The vibrant colors represent different emotions and demons.</p>
                    </div>
                    <div className="bg-sl-paper p-5 rounded-2xl border border-white/5 shadow-inner">
                      <h4 className="font-bold text-sl-maroon mb-2 text-lg">🎲 Avurudu Games</h4>
                      <p className="text-sm text-sl-clay">During April, villages come together to play games like 'Kotta Pora' (Pillow Fight) and 'Kana Mutti' (Pot Breaking).</p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'HISTORY' && (
                <div className="space-y-6">
                  <p className="text-sl-brown text-lg leading-relaxed">
                    "Gahanu Pirimi Mal Palaturu" is a legendary pen-and-paper game played by Sri Lankan school children for decades.
                  </p>

                  <div className="relative border-l-2 border-sl-gold/30 pl-8 space-y-8 ml-3">
                    <div className="relative">
                      <span className="absolute -left-[39px] top-1.5 w-5 h-5 rounded-full bg-sl-maroon border-4 border-sl-sand box-content"></span>
                      <h4 className="font-bold text-sl-gold text-lg">1980s - 1990s</h4>
                      <p className="text-sl-clay mt-1 leading-relaxed">The peak era of the game. Played during free periods in school and on long van rides home.</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[39px] top-1.5 w-5 h-5 rounded-full bg-sl-maroon border-4 border-sl-sand box-content"></span>
                      <h4 className="font-bold text-sl-gold text-lg">The Rules</h4>
                      <p className="text-sl-clay mt-1 leading-relaxed">It taught vocabulary and quick thinking. Before smartphones, this was our "social network".</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[39px] top-1.5 w-5 h-5 rounded-full bg-sl-maroon border-4 border-sl-sand box-content"></span>
                      <h4 className="font-bold text-sl-gold text-lg">Today</h4>
                      <p className="text-sl-clay mt-1 leading-relaxed">We revive this classic to ensure the next generation understands the joy of simple, social play.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'CREATOR' && (
                <div className="space-y-6 text-center pt-8">
                  <div>
                    <h3 className="text-4xl font-bold text-sl-brown mb-2 font-serif">Pamith<p className="text-sl-clay font-medium uppercase tracking-widest text-xs">Developer & Designer</p> </h3>

                    <p className="text-sl-clay font-medium text-sm">Thank you for playing!</p>
                  </div>

                  <div className="flex justify-center">
                    <a
                      href="https://www.instagram.com/pamith__?igsh=bTUwbmoyeHhob3gz&utm_source=qr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-6 py-3 bg-white/50 hover:bg-white rounded-xl border border-white/10 hover:border-sl-maroon/20 hover:shadow-lg transition-all"
                    >
                      <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      </div>
                      <span className="font-bold text-sl-brown group-hover:text-sl-maroon transition-colors">@pamith__</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-sl-sand flex justify-end flex-shrink-0">
              <button
                onClick={() => setActiveModal('NONE')}
                className="bg-sl-paper border border-white/10 text-sl-brown px-8 py-3 rounded-xl font-bold hover:bg-sl-maroon hover:text-white hover:border-sl-maroon transition-all shadow-lg active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};
