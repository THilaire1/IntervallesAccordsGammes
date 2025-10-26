import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2, ArrowUp, ArrowDown } from 'lucide-react';
import PianoVirtuel from './PianoVirtuel';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const TYPES_ACCORDS_4 = [
  { label: 'Maj7', name: 'Majeur 7', intervals: [0, 4, 7, 11] },
  { label: 'min7', name: 'Mineur 7', intervals: [0, 3, 7, 10] },
  { label: '7', name: 'Septième', intervals: [0, 4, 7, 10] },
  { label: 'm7b5', name: 'Mineur 7 quinte bémol', intervals: [0, 3, 6, 10] },
];

const ExerciceAccords4Notes = ({ onReturn }) => {
  const [currentChord, setCurrentChord] = useState(null);
  const [chordType, setChordType] = useState(null);
  const [userNotes, setUserNotes] = useState(['C', 'E', 'G', 'B']);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(0);
  const [phase, setPhase] = useState('notes'); // 'notes' or 'type'
  const [successCount, setSuccessCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [clickedButton, setClickedButton] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const synthRef = useRef(null);
  const errorSynthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
    }).toDestination();

    errorSynthRef.current = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();

    generateNewChord();

    return () => {
      synthRef.current?.dispose();
      errorSynthRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (phase !== 'notes') return;
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        changeNote(1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        changeNote(-1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, selectedNoteIndex, userNotes]);

  const generateNewChord = () => {
    const baseNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'];
    const randomBase = baseNotes[Math.floor(Math.random() * baseNotes.length)];
    const randomType = TYPES_ACCORDS_4[Math.floor(Math.random() * TYPES_ACCORDS_4.length)];
    
    const baseMidi = Tone.Frequency(randomBase).toMidi();
    const chordNotes = randomType.intervals.map(interval => 
      Tone.Frequency(baseMidi + interval, 'midi').toNote()
    );

    setCurrentChord(chordNotes);
    setChordType(randomType);
    setPhase('notes');
    setUserNotes(['C', 'E', 'G', 'B']);
    setSelectedNoteIndex(0);
  };

  const playChord = async () => {
    await Tone.start();
    const now = Tone.now();
    synthRef.current.triggerAttackRelease(currentChord, '1', now);
    
    currentChord.forEach((note, idx) => {
      synthRef.current.triggerAttackRelease(note, '0.5', now + 1.2 + (idx * 0.3));
    });
  };

  const changeNote = (direction) => {
    const currentNoteIndex = NOTES.indexOf(userNotes[selectedNoteIndex]);
    const newNoteIndex = (currentNoteIndex + direction + NOTES.length) % NOTES.length;
    const newNotes = [...userNotes];
    newNotes[selectedNoteIndex] = NOTES[newNoteIndex];
    setUserNotes(newNotes);
  };

  const checkNotes = async () => {
    setAttemptCount(prev => prev + 1);
    
    const userNotesWithoutOctave = userNotes.map(note => note.replace(/[0-9]/g, ''));
    const correctNotesWithoutOctave = currentChord.map(note => note.replace(/[0-9]/g, ''));
    
    const isCorrect = userNotesWithoutOctave.every((note, idx) => 
      note === correctNotesWithoutOctave[idx]
    );

    if (isCorrect) {
      setPhase('type');
    } else {
      await Tone.start();
      errorSynthRef.current.triggerAttackRelease('C2', '0.1');
      // Rejouer l'accord en cas d'erreur
      setTimeout(() => playChord(), 200);
    }
  };

  const checkType = async (selectedType) => {
    setAttemptCount(prev => prev + 1);
    setClickedButton(selectedType.label);
    
    if (selectedType.label === chordType.label) {
      setSuccessCount(prev => prev + 1);
      setShowSuccess(true);
      setIsCorrect(true);
    } else {
      setShowSuccess(false);
      setIsCorrect(false);
      await Tone.start();
      errorSynthRef.current.triggerAttackRelease('C2', '0.1');
      // Rejouer l'accord en cas d'erreur
      setTimeout(() => playChord(), 200);
    }
  };

  const handleNext = () => {
    setShowSuccess(false);
    setClickedButton(null);
    setIsCorrect(null);
    generateNewChord();
  };

  return (
    <div className="exercise-container" data-testid="exercice-accords4">
      <div className="exercise-header">
        <h1>Accords 4 Notes Simples</h1>
        <p style={{ color: '#6b5b3f', fontSize: '1.1rem' }}>Identifiez les notes et le type d'accord</p>
      </div>

      <div className="exercise-content">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={playChord}
            className="btn-primary flex items-center gap-2"
            data-testid="btn-play-chord"
          >
            <Volume2 size={20} />
            Écouter l'accord
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

        {phase === 'notes' && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-center" style={{ color: '#4a3f2a' }}>
              Trouvez les 4 notes de l'arpège
            </h3>
            <p className="text-center mb-4" style={{ color: '#6b5b3f' }}>
              Cliquez sur une note pour la sélectionner, puis utilisez les flèches ↑↓ du clavier
            </p>
            
            <div className="flex justify-center gap-4 mb-6">
              {userNotes.map((note, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedNoteIndex(idx)}
                  className="cursor-pointer p-6 rounded-lg text-2xl font-bold transition-all"
                  style={{
                    background: selectedNoteIndex === idx ? 'rgba(212, 175, 55, 0.5)' : 'rgba(245, 230, 211, 0.5)',
                    border: `3px solid ${selectedNoteIndex === idx ? '#d4af37' : '#a89175'}`,
                    minWidth: '80px',
                    textAlign: 'center'
                  }}
                  data-testid={`note-slot-${idx}`}
                >
                  {note}
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => changeNote(1)}
                className="btn-secondary flex items-center gap-2"
                data-testid="btn-note-up"
              >
                <ArrowUp size={20} />
                Note suivante
              </button>
              <button
                onClick={() => changeNote(-1)}
                className="btn-secondary flex items-center gap-2"
                data-testid="btn-note-down"
              >
                <ArrowDown size={20} />
                Note précédente
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={checkNotes}
                className="btn-primary"
                data-testid="btn-check-notes"
              >
                Ok!
              </button>
            </div>
          </div>
        )}

        {phase === 'type' && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-center" style={{ color: '#4a3f2a' }}>
              Quelle est la nature de cet accord ?
            </h3>
            
            <div className={`answer-buttons ${showSuccess ? 'success-animation' : ''}`}>
              {TYPES_ACCORDS_4.map((type) => {
                let buttonStyle = {};
                if (clickedButton === type.label) {
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
                    key={type.label}
                    onClick={() => checkType(type)}
                    className="answer-btn"
                    style={buttonStyle}
                    data-testid={`chord-type-${type.label}`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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

export default ExerciceAccords4Notes;