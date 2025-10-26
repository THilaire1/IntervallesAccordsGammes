import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import PianoVirtuel from './PianoVirtuel';

const MODES_GRECS = [
  {
    name: 'Ionien',
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    alterations: '0 altérations'
  },
  {
    name: 'Dorien',
    intervals: [0, 2, 3, 5, 7, 9, 10, 12],
    alterations: '2 bémols'
  },
  {
    name: 'Phrygien',
    intervals: [0, 1, 3, 5, 7, 8, 10, 12],
    alterations: '4 bémols'
  },
  {
    name: 'Lydien',
    intervals: [0, 2, 4, 6, 7, 9, 11, 12],
    alterations: '1 dièse'
  },
  {
    name: 'Mixolydien',
    intervals: [0, 2, 4, 5, 7, 9, 10, 12],
    alterations: '1 bémol'
  },
  {
    name: 'Aéolien',
    intervals: [0, 2, 3, 5, 7, 8, 10, 12],
    alterations: '3 bémols'
  },
  {
    name: 'Locrien',
    intervals: [0, 1, 3, 5, 6, 8, 10, 12],
    alterations: '5 bémols'
  },
];

const ExerciceModesGrecs = ({ onReturn }) => {
  const [currentMode, setCurrentMode] = useState(null);
  const [successCount, setSuccessCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongButtons, setWrongButtons] = useState(new Set());
  const [correctButton, setCorrectButton] = useState(null);
  const synthRef = useRef(null);
  const errorSynthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
    }).toDestination();

    errorSynthRef.current = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();

    generateNewMode();

    return () => {
      synthRef.current?.dispose();
      errorSynthRef.current?.dispose();
    };
  }, []);

  const generateNewMode = () => {
    const randomMode = MODES_GRECS[Math.floor(Math.random() * MODES_GRECS.length)];
    setCurrentMode(randomMode);
  };

  const playMode = async () => {
    await Tone.start();
    const baseNote = Tone.Frequency('C4').toMidi();
    const scaleNotes = currentMode.intervals.map(interval => 
      Tone.Frequency(baseNote + interval, 'midi').toNote()
    );

    const now = Tone.now();
    
    // Ascending
    scaleNotes.forEach((note, idx) => {
      synthRef.current.triggerAttackRelease(note, '0.3', now + (idx * 0.25));
    });

    // Descending
    const descendingNotes = [...scaleNotes].reverse();
    descendingNotes.forEach((note, idx) => {
      synthRef.current.triggerAttackRelease(note, '0.3', now + 2 + (scaleNotes.length * 0.25) + (idx * 0.25));
    });
  };

  const handleAnswer = async (selectedMode) => {
    if (showSuccess) return; // Désactiver les clics après succès
    
    setAttemptCount(prev => prev + 1);
    
    if (selectedMode.name === currentMode.name) {
      setSuccessCount(prev => prev + 1);
      setShowSuccess(true);
      setCorrectButton(selectedMode.name);
    } else {
      setWrongButtons(prev => new Set([...prev, selectedMode.name]));
      await Tone.start();
      errorSynthRef.current.triggerAttackRelease('C2', '0.1');
      // Rejouer la gamme en cas d'erreur
      setTimeout(() => playMode(), 200);
    }
  };

  const handleNext = () => {
    setShowSuccess(false);
    setWrongButtons(new Set());
    setCorrectButton(null);
    generateNewMode();
  };

  return (
    <div className="exercise-container" data-testid="exercice-modes">
      <div className="exercise-header">
        <h1>Les Modes Grecs</h1>
        <p style={{ color: '#6b5b3f', fontSize: '1.1rem' }}>Écoutez la gamme et identifiez le mode (tonique Do)</p>
      </div>

      <div className="exercise-content">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={playMode}
            className="btn-primary flex items-center gap-2"
            data-testid="btn-play-mode"
          >
            <Volume2 size={20} />
            Écouter la gamme
          </button>

          {showSuccess && (
            <button
              onClick={handleNext}
              className="btn-primary flex items-center gap-2"
              data-testid="btn-next"
              style={{ background: 'linear-gradient(135deg, #2d7a3e 0%, #1e5a2e 100%)' }}
            >
              Suivant →
            </button>
          )}
        </div>

        <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(212, 175, 55, 0.2)', border: '2px solid #d4af37' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: '#4a3f2a' }}>Référence des modes (tonique Do) :</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2" style={{ color: '#6b5b3f' }}>
            {MODES_GRECS.map((mode) => (
              <div key={mode.name} className="py-1">
                <strong>{mode.name}</strong> : {mode.alterations}
              </div>
            ))}
          </div>
        </div>

        <div className={`answer-buttons ${showSuccess ? 'success-animation' : ''}`}>
          {MODES_GRECS.map((mode) => {
            let buttonStyle = {};
            if (clickedButton === mode.name) {
              if (isCorrect) {
                buttonStyle = {
                  background: 'linear-gradient(135deg, #2d7a3e 0%, #1e5a2e 100%)',
                  color: '#fff',
                  borderColor: '#2d7a3e'
                };
              } else {
                buttonStyle = {
                  background: 'linear-gradient(135deg, #8b2e2e 0%, #5a1e1e 100%)',
                  color: '#fff',
                  borderColor: '#8b2e2e'
                };
              }
            }
            
            return (
              <button
                key={mode.name}
                onClick={() => handleAnswer(mode)}
                className="answer-btn"
                style={buttonStyle}
                data-testid={`mode-${mode.name.toLowerCase()}`}
              >
                {mode.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={onReturn}
          className="btn-primary mt-8"
          data-testid="btn-terminer"
        >
          Terminer l'exercice
        </button>
      </div>

      <PianoVirtuel synth={synthRef.current} />
    </div>
  );
};

export default ExerciceModesGrecs;