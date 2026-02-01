import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
   const navigate = useNavigate();
   const [showHowToPlay, setShowHowToPlay] = useState(false);

   return (
      <div className="flex flex-col w-full animate-fade-in relative">

         {/* 1. HERO SECTION - Cultural & Dramatic (Frameless) */}
         <section className="relative min-h-screen flex items-start justify-start overflow-hidden">
            {/* Background Image - Immersive Cinematic Feel */}
            <div className="absolute inset-0 z-0">
               <img
                  src="/hero_modern_wide.png"
                  alt="Sri Lankan village children playing at sunset"
                  className="w-full h-full object-cover"
               />
               {/* Cinematic Overlay - Dark Gradient for Text Readability */}
               <div className="absolute inset-0 bg-gradient-to-r from-sl-paper/90 via-sl-paper/60 to-transparent"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-sl-paper via-transparent to-transparent opacity-80"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 pt-50 md:pt-20">
               <div className="w-full max-w-2xl">
                  <span className="inline-block py-2 px-4 rounded-full bg-sl-maroon/20 text-sl-gold font-bold text-xs tracking-[0.2em] uppercase mb-6 border border-sl-maroon/30 backdrop-blur-md">
                     Traditional Sri Lankan Games
                  </span>

                  <h1 className="text-5xl md:text-7xl font-serif font-black text-white mb-6 leading-tight drop-shadow-lg">
                     ගැහැණු පිරිමි <br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-sl-maroon to-sl-terracotta drop-shadow-none">මල් පලතුරු</span>
                  </h1>

                  <p className="text-lg md:text-xl text-sl-clay font-medium mb-10 leading-relaxed drop-shadow-md max-w-lg">
                     Step back into the school van days. The classic paper game, reimagined with the spirit of the island.
                  </p>

                  <div className="flex flex-col sm:flex-row items-start gap-4">
                     <button
                        onClick={() => {
                           const element = document.getElementById('game-selection');
                           if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                           }
                        }}
                        className="bg-sl-maroon text-white font-bold py-4 px-10 rounded-2xl shadow-glow hover:bg-white hover:text-sl-maroon transition-all duration-300 transform hover:-translate-y-1 text-base border-2 border-sl-maroon"
                     >
                        Choose a Game
                     </button>
                     <button
                        onClick={() => setShowHowToPlay(true)}
                        className="text-white font-bold py-4 px-6 rounded-2xl hover:bg-white/10 transition-colors flex items-center text-base backdrop-blur-sm border border-white/10"
                     >
                        <span className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center mr-2 text-xs">?</span>
                        How to Play
                     </button>
                  </div>
               </div>
            </div>
         </section>

         {/* 2. GAME SELECTION - Card Grid */}
         <section id="game-selection" className="py-24 px-6 bg-sl-paper relative">
            <div className="container mx-auto max-w-6xl">
               <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-sl-brown mb-4">Choose Your Game</h2>
                  <div className="w-24 h-1 bg-sl-maroon mx-auto rounded-full"></div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                  {/* Main Game Card */}
                  <div
                     onClick={() => navigate('/word-game')}
                     className="group cursor-pointer bg-sl-sand rounded-3xl p-2 shadow-card hover:shadow-glow transition-all duration-500 transform hover:-translate-y-2 border border-white/5 hover:border-sl-gold/30"
                  >
                     <div className="relative h-56 rounded-2xl overflow-hidden bg-sl-brown">
                        <img
                           src="/1st_game.jpeg"
                           alt="Writing on paper"
                           className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-sl-maroon/90 to-transparent flex items-end p-6">
                           <h3 className="text-2xl font-bold text-white leading-tight">ගැහැණු පිරිමි <br />මල් පලතුරු</h3>
                        </div>
                        <div className="absolute top-4 right-4 bg-sl-gold text-sl-brown text-xs font-bold px-3 py-1 rounded-full">
                           POPULAR
                        </div>
                     </div>

                     <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                           <span className="text-xs font-bold text-sl-clay uppercase tracking-wider">Word Game</span>
                           <span className="text-xs font-bold text-sl-maroon bg-sl-maroon/10 px-2 py-1 rounded">3-5 Players</span>
                        </div>
                        <p className="text-sl-clay text-sm mb-6 line-clamp-2">
                           Think fast! Find a Girl's name, Boy's name, Fruit, and Flower starting with the same letter.
                        </p>
                        <div className="w-full py-3 rounded-xl border-2 border-sl-maroon text-sl-maroon font-bold text-center group-hover:bg-sl-maroon group-hover:text-white transition-colors">
                           Start Playing
                        </div>
                     </div>
                  </div>

                  {/* Rahas Wachanaya - Game 2 */}
                  <div
                     onClick={() => navigate('/spy-game')}
                     className="group cursor-pointer bg-sl-paper rounded-3xl p-2 shadow-card hover:shadow-glow transition-all duration-500 transform hover:-translate-y-2 border border-white/5 hover:border-sl-gold/30"
                  >
                     <div className="relative h-56 rounded-2xl overflow-hidden bg-sl-sand">
                        <img
                           src="/spy_game_card_v2.png"
                           alt="Villagers whispering secrets"
                           className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                           <h3 className="text-2xl font-bold text-white leading-tight">රහස් වචනය <br />(Rahas Wachanaya)</h3>
                        </div>
                        <div className="absolute top-4 right-4 bg-sl-maroon text-white text-xs font-bold px-3 py-1 rounded-full">
                           NEW
                        </div>
                     </div>
                     <div className="p-6">
                        <h3 className="text-xl font-bold text-sl-brown mb-2">Find the Imposter</h3>
                        <p className="text-sl-clay text-sm mb-4">4-8 Players. 1 Imposter. Can you find who doesn't know the secret word?</p>
                        <div className="w-full py-2 rounded-lg border border-sl-maroon text-sl-maroon font-bold text-center text-sm group-hover:bg-sl-maroon group-hover:text-white transition-colors">
                           Start Investigation
                        </div>
                     </div>
                  </div>

                  {/* Coming Soon - Daam */}
                  <div className="group opacity-80 bg-sl-paper rounded-3xl p-2 border border-dashed border-sl-clay/30">
                     <div className="relative h-56 rounded-2xl overflow-hidden bg-sl-sand">
                        <img
                           src="/daam_game_card_v2.png"
                           alt="Traditional Daam board with Madatiya seeds"
                           className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <span className="bg-sl-paper/80 backdrop-blur text-sl-gold font-bold px-4 py-2 rounded-lg shadow-sm border border-white/10">Coming Soon</span>
                        </div>
                     </div>
                     <div className="p-6">
                        <h3 className="text-xl font-bold text-sl-brown mb-2">Daam (දාම්)</h3>
                        <p className="text-sl-clay text-sm">Strategic checkers variant played with seeds on a wooden board.</p>
                     </div>
                  </div>

               </div>
            </div>
         </section>

         {/* 3. CULTURE / ABOUT SECTION */}
         <section className="py-24 px-6 bg-sl-sand text-sl-brown relative overflow-hidden border-t border-white/5">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-overlay"></div>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sl-paper to-transparent opacity-50"></div>

            <div className="container mx-auto max-w-6xl relative z-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                  {/* Left: Image Card */}
                  <div className="order-2 md:order-1 relative group">
                     <div className="absolute -inset-2 bg-gradient-to-r from-sl-gold to-sl-maroon rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                     <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-sl-paper">
                        <img
                           src="/temple_of_tooth.png"
                           alt="Temple of the Tooth"
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90 group-hover:opacity-100"
                           onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/0f172a/e2e8f0?text=Heritage+Image';
                           }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-sl-paper via-transparent to-transparent opacity-90"></div>
                        <div className="absolute bottom-6 left-6 border-l-4 border-sl-gold pl-4">
                           <p className="text-sl-gold font-serif text-sm tracking-widest uppercase mb-1">Architecture</p>
                           <p className="text-white font-bold text-xl">The Temple of the Tooth</p>
                        </div>
                     </div>

                     {/* Floating Stat Badge */}
                     <div className="absolute -top-6 -right-6 bg-sl-maroon text-white p-6 rounded-xl shadow-xl shadow-sl-maroon/20 transform rotate-3 border border-white/10 hidden md:block">
                        <div className="text-4xl font-serif font-black">2500+</div>
                        <div className="text-xs uppercase tracking-widest opacity-90 font-bold mt-1">Years of History</div>
                     </div>
                  </div>

                  {/* Right: Text Content */}
                  <div className="order-1 md:order-2">
                     <div className="flex items-center space-x-2 mb-4">
                        <span className="h-px w-8 bg-sl-gold"></span>
                        <span className="text-sl-gold font-bold tracking-widest text-sm uppercase">Our Mission</span>
                     </div>

                     <h2 className="text-4xl md:text-6xl font-serif font-black text-white mb-8 leading-tight">
                        Connecting Through <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sl-terracotta to-sl-gold">Culture & Play</span>
                     </h2>

                     <p className="text-lg text-sl-clay mb-6 leading-relaxed">
                        Sri Lanka has a rich history of communal games. From the "New Year" festivals to rainy afternoons in the village, games were our first social network.
                     </p>
                     <p className="text-lg text-sl-clay mb-10 leading-relaxed border-l-2 border-white/10 pl-6">
                        We built this platform to honor those traditions. No ads, no flashing lights—just the warm, familiar feeling of playing with friends.
                     </p>

                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex flex-col">
                           <span className="text-sl-gold font-bold text-xl mb-1">Sinhala</span>
                           <span className="text-xs text-sl-clay uppercase tracking-wider">Language Support</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sl-gold font-bold text-xl mb-1">Zero Ads</span>
                           <span className="text-xs text-sl-clay uppercase tracking-wider">Premium Experience</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sl-gold font-bold text-xl mb-1">Free</span>
                           <span className="text-xs text-sl-clay uppercase tracking-wider">Forever</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* HOW TO PLAY MODAL */}
         {showHowToPlay && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-sl-brown/80 backdrop-blur-sm" onClick={() => setShowHowToPlay(false)}></div>
               <div className="bg-sl-paper w-full max-w-lg rounded-3xl shadow-2xl relative z-10 p-8 border border-sl-gold animate-slide-up">
                  <div className="text-center mb-6">
                     <h2 className="text-3xl font-serif font-bold text-sl-maroon">Platform Guide</h2>
                     <div className="w-16 h-1 bg-sl-gold mx-auto rounded mt-2"></div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-sl-maroon text-white flex items-center justify-center font-bold flex-shrink-0 mt-1">1</div>
                        <div className="ml-4">
                           <h4 className="font-bold text-sl-brown">Choose a Game</h4>
                           <p className="text-sm text-sl-clay">Select from our collection of traditional games below. New games added regularly!</p>
                        </div>
                     </div>
                     <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-sl-maroon text-white flex items-center justify-center font-bold flex-shrink-0 mt-1">2</div>
                        <div className="ml-4">
                           <h4 className="font-bold text-sl-brown">Host or Join</h4>
                           <p className="text-sm text-sl-clay">Create a room to play with friends, or join an existing public lobby.</p>
                        </div>
                     </div>
                     <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-sl-maroon text-white flex items-center justify-center font-bold flex-shrink-0 mt-1">3</div>
                        <div className="ml-4">
                           <h4 className="font-bold text-sl-brown">Play & Connect</h4>
                           <p className="text-sm text-sl-clay">Enjoy authentic Sri Lankan gameplay mechanics with immersive audio.</p>
                        </div>
                     </div>
                     <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-sl-maroon text-white flex items-center justify-center font-bold flex-shrink-0 mt-1">4</div>
                        <div className="ml-4">
                           <h4 className="font-bold text-sl-brown">Review Results</h4>
                           <p className="text-sm text-sl-clay">Vote on answers or see who won. It's all about fun and fairness!</p>
                        </div>
                     </div>
                  </div>

                  <button
                     onClick={() => setShowHowToPlay(false)}
                     className="w-full bg-sl-maroon text-white font-bold py-3 rounded-xl mt-8 hover:bg-sl-brown transition-colors shadow-lg"
                  >
                     Got it!
                  </button>
               </div>
            </div>
         )}

      </div>
   );
};
