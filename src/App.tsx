import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './components/ChessBoard';
import { Play, Users, RefreshCw, Trophy, MoreVertical, X, Undo2 } from 'lucide-react';
import { chessAudio } from './lib/audio';

type GameMode = 'pvp' | 'ai';

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [mode, setMode] = useState<GameMode>('ai');
  const [fen, setFen] = useState(game.fen());
  const [history, setHistory] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Update local state when game changes
  const updateGameState = useCallback(() => {
    setFen(game.fen());
    setHistory(game.history());
  }, [game]);

  const handleMove = (move: string) => {
    try {
      const moveResult = game.move(move);
      if (moveResult) {
        if (moveResult.captured) {
          chessAudio.playCapture();
        } else {
          chessAudio.playMove();
        }
      }
      updateGameState();
    } catch (e) {
      console.error("Invalid move:", move, e);
    }
  };

  const resetGame = (newMode: GameMode) => {
    const newGame = new Chess();
    setGame(newGame);
    setMode(newMode);
    setFen(newGame.fen());
    setHistory([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    game.undo();
    
    // In AI mode, if undoing once puts it to AI's turn, we undo again to give turn back to player
    if (mode === 'ai' && game.turn() === 'b') {
      game.undo();
    }
    
    updateGameState();
  };

  const isGameOver = game.isGameOver();
  const turn = game.turn() === 'w' ? 'Putih' : 'Hitam';
  
  let gameStatus = `Giliran: ${turn}`;
  if (game.isCheckmate()) {
    gameStatus = `Skakmat! ${game.turn() === 'w' ? 'Hitam' : 'Putih'} menang.`;
  } else if (game.isDraw()) {
    gameStatus = 'Seri!';
  } else if (game.isStalemate()) {
    gameStatus = 'Remis (Jalan Buntu)!';
  } else if (game.isCheck()) {
    gameStatus = `Skak! Giliran ${turn}.`;
  }

  // If mode is AI and it's black's turn, it's AI's turn
  const isAiTurn = mode === 'ai' && game.turn() === 'b' && !isGameOver;

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="flex justify-between items-center p-4 lg:px-8 border-b border-stone-800 shrink-0">
         <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Master Catur</h1>
         </div>
         <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:flex items-center gap-2 text-sm font-bold bg-stone-800 px-4 py-2 rounded-full border border-stone-700">
               <div className={`w-4 h-4 rounded-full shadow-inner ${game.turn() === 'w' ? 'bg-white' : 'bg-stone-900 border-2 border-stone-600'}`}></div>
               {gameStatus}
            </div>
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors font-bold text-stone-200"
            >
               <span className="hidden sm:inline">Menu</span>
               <MoreVertical className="w-5 h-5 text-stone-200" />
            </button>
         </div>
      </header>

      {/* Main Board Area */}
      <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950">
          <div className="w-full max-w-[min(100vw-1rem,80vh)] relative flex flex-col gap-4 md:gap-6">
            
            {/* Action Bar - Top (Black) */}
            <div className="flex justify-center w-full">
               <button
                 onClick={handleUndo}
                 disabled={history.length === 0}
                 className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 sm:py-3 bg-stone-800/80 hover:bg-stone-700 active:bg-stone-600 text-stone-200 border border-stone-700 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg rotate-180"
               >
                 <Undo2 className="w-5 h-5" />
                 Batal / Kembali 
               </button>
            </div>

            <div className="relative">
              <ChessBoard 
                game={game} 
                onMove={handleMove} 
                isAiTurn={isAiTurn} 
              />
              
              {isGameOver && (
                <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center z-20 backdrop-blur-md shadow-2xl transition-all">
                  <div className="bg-stone-800 p-6 md:p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full mx-4 border border-stone-700">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 drop-shadow-lg" />
                    <h2 className="text-2xl font-bold text-white mb-2">{gameStatus}</h2>
                    <p className="text-stone-400 mb-6 font-medium">Permainan yang bagus!</p>
                    <button 
                      onClick={() => resetGame(mode)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Main Lagi
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar - Bottom (White) */}
            <div className="flex justify-center w-full">
               <button
                 onClick={handleUndo}
                 disabled={history.length === 0}
                 className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 sm:py-3 bg-stone-800/80 hover:bg-stone-700 active:bg-stone-600 text-stone-200 border border-stone-700 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
               >
                 <Undo2 className="w-5 h-5" />
                 Batal / Kembali 
               </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-stone-600 font-medium tracking-wide">Dev: Andri</p>
            </div>
          </div>
      </main>

      {/* Drawer Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Sidebar Content */}
          <div className="relative w-[320px] sm:w-[380px] h-full bg-stone-900 shadow-2xl border-l border-stone-700 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-6 border-b border-stone-800 flex justify-between items-center bg-stone-800/50">
              <h2 className="text-xl font-bold text-white">Menu & Info</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 bg-stone-800 hover:bg-stone-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-stone-300" />
              </button>
            </div>

            {/* Drawer Body - scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
              {/* Status Card (Mobile Only in drawer) */}
              <div className="bg-stone-800 border border-stone-700 rounded-2xl p-5 shadow-lg sm:hidden">
                <h3 className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-3">Status Permainan</h3>
                <div className={`text-lg font-bold flex items-center gap-3 ${game.isCheck() || game.isCheckmate() ? 'text-rose-400' : 'text-white'}`}>
                  <div className={`w-4 h-4 rounded-full shadow-inner ${game.turn() === 'w' ? 'bg-white' : 'bg-stone-900 border-2 border-stone-600'}`}></div>
                  {gameStatus}
                </div>
              </div>

              {/* Mode Card */}
              <div className="bg-stone-800 border border-stone-700 rounded-xl p-5 shadow-lg">
                <h3 className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-4">Mode Permainan</h3>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { resetGame('ai'); setIsMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold transition-all shadow-sm ${
                      mode === 'ai' 
                        ? 'bg-emerald-600 outline outline-2 outline-offset-2 outline-emerald-600 text-white' 
                        : 'bg-stone-700 hover:bg-stone-600 text-stone-200'
                    }`}
                  >
                    <Play className="w-5 h-5" />
                    Lawan AI (Hitam)
                  </button>
                  <button
                    onClick={() => { resetGame('pvp'); setIsMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold transition-all shadow-sm ${
                      mode === 'pvp' 
                        ? 'bg-stone-200 text-stone-900 outline outline-2 outline-offset-2 outline-stone-300' 
                        : 'bg-stone-700 hover:bg-stone-600 text-stone-200'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    Lawan Teman (Lokal)
                  </button>
                </div>
                <button
                    onClick={() => { resetGame(mode); setIsMenuOpen(false); }}
                    disabled={history.length === 0}
                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 bg-transparent border-2 border-stone-700 rounded-xl text-stone-300 hover:bg-stone-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Mulai Ulang Papan
                </button>
              </div>

              {/* History Card */}
              <div className="bg-stone-800 border border-stone-700 rounded-xl flex-1 min-h-[300px] shadow-lg flex flex-col overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-700 bg-stone-800/95 sticky top-0">
                  <h3 className="text-xs font-bold tracking-widest text-stone-400 uppercase">Riwayat Langkah</h3>
                </div>
                <div className="p-5 overflow-y-auto flex-1 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-stone-600">
                    {history.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-stone-500 italic font-sans font-medium">
                        Belum ada langkah
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {history.reduce((result: string[][], move, index) => {
                          if (index % 2 === 0) {
                            result.push([move]);
                          } else {
                            result[result.length - 1].push(move);
                          }
                          return result;
                        }, []).map((pair, idx) => (
                          <React.Fragment key={idx}>
                            <div className="text-stone-500 text-right pr-4 select-none border-r-2 border-stone-700/50">{idx + 1}.</div>
                            <div className="flex gap-4 pl-2 font-medium">
                              <span className="w-12 text-stone-200">{pair[0]}</span>
                              {pair[1] && <span className="w-12 text-stone-400">{pair[1]}</span>}
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
