import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Piece } from './Piece';
import { getBestMove } from '../lib/engine';

interface ChessBoardProps {
  game: Chess;
  onMove: (move: string) => void;
  isAiTurn: boolean;
}

export function ChessBoard({ game, onMove, isAiTurn }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<{ to: string; move: string }[]>([]);

  const board = game.board();

  // Handle AI turn
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isAiTurn && !game.isGameOver()) {
      timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const bestMove = getBestMove(game, 2); // Reduced depth from 3 to 2 for faster response
            if (bestMove) {
              onMove(bestMove);
            }
          }, 10);
        });
      }, 600); // Adding a natural delay before AI moves
    }
    return () => clearTimeout(timeoutId);
  }, [isAiTurn, game, onMove]);

  const handleSquareClick = (squareStr: string) => {
    if (isAiTurn || game.isGameOver()) return;

    const square = squareStr as Square;
    const piece = game.get(square);

    // If a square is already selected, try to move
    if (selectedSquare) {
      const move = possibleMoves.find((m) => m.to === squareStr);
      if (move) {
        onMove(move.move);
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }
    }

    // Select piece
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      // Get possible moves for this piece
      const moves = game.moves({ square, verbose: true });
      setPossibleMoves(
        moves.map((m) => ({
          to: m.to,
          // We store the SAN move to pass back to game.move() via onMove
          move: m.san,
        }))
      );
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Classic green and cream board colors
  const lightSquare = 'bg-[#EBECD0]';
  const darkSquare = 'bg-[#739552]';

  return (
    // Outer wooden-like border for realism
    <div className="w-full aspect-square mx-auto bg-[#2b1f15] p-2 sm:p-3 md:p-4 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] border-b-[8px] sm:border-b-[12px] border-r-[5px] sm:border-r-8 border-l-[2px] sm:border-l-[3px] border-t-[2px] sm:border-t-[3px] border-[#1a120c] flex flex-col justify-between">
       <div className="w-full h-full border-4 md:border-8 border-[#4a3525] rounded-sm bg-[#4a3525] grid grid-rows-8 grid-cols-8 shadow-inner overflow-hidden relative">
          {ranks.map((rank, rIndex) => (
            files.map((file, fIndex) => {
                const squareStr = `${file}${rank}`;
                const isLight = (rIndex + fIndex) % 2 === 0;
                const piece = board[rIndex][fIndex];
                const isSelected = selectedSquare === squareStr;
                const possibleMove = possibleMoves.find((m) => m.to === squareStr);
                
                // Highlight last move to track game progress easily
                const history = game.history({ verbose: true });
                const lastMove = history.length > 0 ? history[history.length - 1] : null;
                const isLastMove = lastMove?.from === squareStr || lastMove?.to === squareStr;

                return (
                  <div
                    key={squareStr}
                    onClick={() => handleSquareClick(squareStr)}
                    className={`
                      relative w-full h-full flex justify-center items-center cursor-pointer transition-colors duration-150
                      ${isLight ? lightSquare : darkSquare}
                      ${isSelected ? 'bg-[#f4f680]' : ''}
                      ${!isSelected && isLastMove ? 'bg-[#f5f682]/70' : ''}
                    `}
                    style={{ gridRow: rIndex + 1, gridColumn: fIndex + 1 }}
                  >
                    {/* Coordinates on edges */}
                    {fIndex === 0 && (
                      <span className={`absolute top-0.5 md:top-1 left-1 md:left-1.5 text-[8px] md:text-xs font-bold font-sans select-none ${isLight ? 'text-[#739552]' : 'text-[#EBECD0]'}`}>
                        {rank}
                      </span>
                    )}
                    {rIndex === 7 && (
                      <span className={`absolute bottom-0 md:bottom-0.5 right-1 md:right-1.5 text-[8px] md:text-xs font-bold font-sans select-none ${isLight ? 'text-[#739552]' : 'text-[#EBECD0]'}`}>
                        {file}
                      </span>
                    )}

                    {/* Possible move indicator */}
                    {possibleMove && !piece && (
                      <div className="absolute w-[28%] h-[28%] bg-black/45 rounded-full z-10 shadow-sm" />
                    )}
                    
                    {/* Attack indicator overlay */}
                    {possibleMove && piece && (
                      <div className="absolute inset-0 border-[6px] md:border-[8px] border-black/45 rounded-full scale-105 z-10" />
                    )}

                    {/* Chess piece */}
                    {piece && (
                      <Piece
                        type={piece.type as any}
                        color={piece.color as any}
                        className={`w-[85%] h-[85%] drop-shadow-[0_4px_3px_rgba(0,0,0,0.6)] z-10 transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}
                      />
                    )}
                  </div>
                );
            })
          ))}
       </div>
    </div>
  );
}
