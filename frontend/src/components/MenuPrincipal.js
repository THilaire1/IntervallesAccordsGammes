import React from 'react';
import { Music, Guitar, Piano, Radio } from 'lucide-react';
import '@/App.css';

const MenuPrincipal = ({ onSelectExercise, onQuit }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" data-testid="menu-principal">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold mb-4" style={{ fontFamily: 'EB Garamond, serif', color: '#4a3f2a' }}>
          Entraînement de l'Oreille Musicale
        </h1>
        <p className="text-xl" style={{ color: '#6b5b3f' }}>
          Développez votre discrimination auditive
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mb-8">
        <button
          onClick={() => onSelectExercise('intervalles')}
          className="group relative overflow-hidden rounded-2xl p-8 transition-all hover:-translate-y-2"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 230, 211, 0.8) 0%, rgba(232, 220, 200, 0.8) 100%)',
            border: '3px solid #d4af37',
            boxShadow: '0 8px 24px rgba(107, 91, 63, 0.2)'
          }}
          data-testid="btn-intervalles"
        >
          <div className="flex items-center justify-center mb-4">
            <Music size={48} style={{ color: '#6b5b3f' }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'EB Garamond, serif', color: '#4a3f2a' }}>
            Déterminer les Intervalles
          </h2>
        </button>

        <button
          onClick={() => onSelectExercise('accords3')}
          className="group relative overflow-hidden rounded-2xl p-8 transition-all hover:-translate-y-2"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 230, 211, 0.8) 0%, rgba(232, 220, 200, 0.8) 100%)',
            border: '3px solid #d4af37',
            boxShadow: '0 8px 24px rgba(107, 91, 63, 0.2)'
          }}
          data-testid="btn-accords3"
        >
          <div className="flex items-center justify-center mb-4">
            <Guitar size={48} style={{ color: '#6b5b3f' }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'EB Garamond, serif', color: '#4a3f2a' }}>
            Accords 3 Notes
          </h2>
        </button>

        <button
          onClick={() => onSelectExercise('accords4')}
          className="group relative overflow-hidden rounded-2xl p-8 transition-all hover:-translate-y-2"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 230, 211, 0.8) 0%, rgba(232, 220, 200, 0.8) 100%)',
            border: '3px solid #d4af37',
            boxShadow: '0 8px 24px rgba(107, 91, 63, 0.2)'
          }}
          data-testid="btn-accords4"
        >
          <div className="flex items-center justify-center mb-4">
            <Piano size={48} style={{ color: '#6b5b3f' }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'EB Garamond, serif', color: '#4a3f2a' }}>
            Accords 4 Notes Simples
          </h2>
        </button>

        <button
          onClick={() => onSelectExercise('modes')}
          className="group relative overflow-hidden rounded-2xl p-8 transition-all hover:-translate-y-2"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 230, 211, 0.8) 0%, rgba(232, 220, 200, 0.8) 100%)',
            border: '3px solid #d4af37',
            boxShadow: '0 8px 24px rgba(107, 91, 63, 0.2)'
          }}
          data-testid="btn-modes"
        >
          <div className="flex items-center justify-center mb-4">
            <Radio size={48} style={{ color: '#6b5b3f' }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'EB Garamond, serif', color: '#4a3f2a' }}>
            Les Modes Grecs
          </h2>
        </button>
      </div>

      <button
        onClick={onQuit}
        className="mt-8 px-12 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #8b4513 0%, #654321 100%)',
          color: '#f5e6d3',
          border: '2px solid #4a3f2a',
          boxShadow: '0 4px 12px rgba(107, 91, 63, 0.3)'
        }}
        data-testid="btn-quitter"
      >
        QUITTER
      </button>
    </div>
  );
};

export default MenuPrincipal;