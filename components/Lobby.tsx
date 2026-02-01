import React, { useState } from 'react';
import { Player } from '../types';

interface LobbyProps {
    roomCode: string;
    players: Player[];
    isHost: boolean;
    onStartGame: () => void;
    onQuit: () => void;
    gameName?: string; // Optional: To customize title if needed for different games
}

export const Lobby: React.FC<LobbyProps> = ({
    roomCode,
    players,
    isHost,
    onStartGame,
    onQuit,
    gameName
}) => {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;
        const shareData = {
            title: 'Join my game on Gahanu Pirimi Mal Palaturu!',
            text: `Join the game with code: ${roomCode}`,
            url: url
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled or error
            }
        } else {
            navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(() => alert(`Share this link: ${url}`));
        }
    };

    return (
        <div className="container mx-auto px-4 py-10 max-w-lg">
            <div className="bg-sl-sand rounded-[2rem] shadow-card p-8 text-center border-t-8 border-sl-maroon relative overflow-hidden ring-1 ring-white/5">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                </div>

                <span className="inline-block bg-sl-paper px-3 py-1 rounded-full text-sl-clay text-xs font-bold uppercase tracking-widest mb-4 border border-white/5">
                    {gameName ? `${gameName}: ` : ''}Waiting for Players
                </span>

                <div className="mb-8">
                    <div className="text-6xl font-black text-sl-gold font-mono tracking-wider mb-2 drop-shadow-lg">{roomCode}</div>
                    <button onClick={handleShare} className="text-sl-maroon text-sm font-bold hover:text-sl-brown transition-colors flex items-center justify-center bg-white/50 px-4 py-2 rounded-full border border-sl-maroon/20 hover:bg-white mx-auto">
                        {copied ? 'Link Copied!' : 'Invite Friends (Share Link)'}
                        <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    </button>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {players.map(p => (
                        <div key={p.id} className="bg-sl-paper px-4 py-2 rounded-full border border-white/5 shadow-sm text-sm font-bold text-sl-brown flex items-center animate-fade-in ring-1 ring-white/5">
                            <span className={`w-2 h-2 rounded-full mr-2 ${p.isReady ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></span>
                            {p.name} {p.isHost && '👑'}
                        </div>
                    ))}
                    {Array(Math.max(0, 4 - players.length)).fill(0).map((_, i) => (
                        <div key={i} className="px-4 py-2 rounded-full border border-dashed border-sl-clay/30 text-sm text-sl-clay/50">Waiting...</div>
                    ))}
                </div>

                {isHost ? (
                    <div className="space-y-4">
                        <button onClick={onStartGame} className="w-full bg-sl-maroon text-white py-4 rounded-xl font-bold text-xl shadow-glow hover:bg-red-700 transition-all transform hover:scale-[1.02] border border-white/10">Start Game</button>
                    </div>
                ) : (
                    <div className="p-4 bg-sl-paper rounded-xl text-sl-brown font-medium animate-pulse border border-sl-gold/30 flex items-center justify-center">
                        <span className="mr-2">⏳</span> Waiting for host to start the game...
                    </div>
                )}

                <div className="mt-8">
                    <button onClick={onQuit} className="text-red-400 text-xs font-bold hover:text-red-500 tracking-wide opacity-60 hover:opacity-100">LEAVE ROOM</button>
                </div>
            </div>
        </div>
    );
};
