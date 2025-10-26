import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2, ArrowUp, ArrowDown } from 'lucide-react';
import PianoVirtuel from './PianoVirtuel';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const TYPES_ACCORDS = [
  { label: 'Maj', name: 'Majeur', intervals: [0, 4, 7] },
  { label: 'min', name: 'Mineur', intervals: [0, 3, 7] },
  { label: 'sus2', name: 'Suspendu 2', intervals: [0, 2, 7] },
  { label: 'sus4', name: 'Suspendu 4', intervals: [0, 5, 7] },
  { label: 'dim', name: 'Diminué', intervals: [0, 3, 6] },
  { label: 'aug', name: 'Augmenté', intervals: [0, 4, 8] },
];

const ExerciceAccords3Notes = ({ onReturn }) => {
  const [currentChord, setCurrentChord] = useState(null);
  const [chordType, setChordType] = useState(null);
  const [userNotes, setUserNotes] = useState(['C', 'E', 'G']);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(0);
  const [phase, setPhase] = useState('notes'); // 'notes' or 'type'
  const [successCount, setSuccessCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongButtons, setWrongButtons] = useState(new Set());
  const [correctButton, setCorrectButton] = useState(null);
  const synthRef = useRef(null);
  const errorSynthRef = useRef(null);

  const generateNewChord = () => {
    const baseNotes = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];
    const randomBase = baseNotes[Math.floor(Math.random() * baseNotes.length)];
    const randomType = TYPES_ACCORDS[Math.floor(Math.random() * TYPES_ACCORDS.length)];
    
    const baseMidi = Tone.Frequency(randomBase).toMidi();
    const chordNotes = randomType.intervals.map(interval => 
      Tone.Frequency(baseMidi + interval, 'midi').toNote()
    );
    
    // Vérifier que toutes les notes restent dans la plage C2-C5
    const maxMidi = Tone.Frequency('C5').toMidi();
    const allNotesInRange = chordNotes.every(note => 
      Tone.Frequency(note).toMidi() <= maxMidi
    );
    
    if (!allNotesInRange) {
      // Recommencer avec une note de base plus basse
      generateNewChord();
      return;
    }

    setCurrentChord(chordNotes);
    setChordType(randomType);
    setPhase('notes');
    setUserNotes(['C', 'E', 'G']);
    setSelectedNoteIndex(0);
  };
  useEffect(() => {
    // Utiliser des vrais samples de piano Salamander avec PolySynth
    const sampler = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
        "D#6": "Ds6.mp3",
        "F#6": "Fs6.mp3",
        A6: "A6.mp3",
        C7: "C7.mp3",
        "D#7": "Ds7.mp3",
        "F#7": "Fs7.mp3",
        A7: "A7.mp3",
        C8: "C8.mp3"
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        console.log("Piano samples loaded for chords");
        generateNewChord();
      }
    }).toDestination();
    
    synthRef.current = sampler;

    errorSynthRef.current = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.3 }
    }).toDestination();

    // Samples will be loaded via onload callback

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

  // generateNewChord function moved above useEffect

  const playChord = async () => {
    await Tone.start();
    const now = Tone.now();
    synthRef.current.triggerAttackRelease(currentChord, '1', now);
    
    currentChord.forEach((note, idx) => {
      synthRef.current.triggerAttackRelease(note, '0.5', now + 1.2 + (idx * 0.3));
    });
  };

  const playUserNotes = async () => {
    await Tone.start();
    
    // Ordre chromatique des notes
    const chromaticOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Assigner les octaves pour que chaque note soit plus aigue que la précédente
    let currentOctave = 3;
    const notesWithOctaves = userNotes.map((note, idx) => {
      const currentIndex = chromaticOrder.indexOf(note);
      
      if (idx > 0) {
        const previousNote = userNotes[idx - 1];
        const previousIndex = chromaticOrder.indexOf(previousNote);
        
        // Si la note actuelle est plus grave ou égale, passer à l'octave supérieure
        if (currentIndex <= previousIndex) {
          currentOctave++;
        }
      }
      
      return note + currentOctave;
    });
    
    // Jouer les notes en arpège lent
    const now = Tone.now();
    notesWithOctaves.forEach((noteWithOctave, idx) => {
      synthRef.current.triggerAttackRelease(noteWithOctave, '0.5', now + (idx * 0.7));
    });
  };

  const changeNote = (direction) => {
    const currentNoteIndex = NOTES.indexOf(userNotes[selectedNoteIndex]);
    const newNoteIndex = (currentNoteIndex + direction + NOTES.length) % NOTES.length;
    const newNotes = [...userNotes];
    newNotes[selectedNoteIndex] = NOTES[newNoteIndex];
    setUserNotes(newNotes);
  };

  const playSuccessSound = async () => {
    await Tone.start();
    // Son de clochette avec piano sampler
    const now = Tone.now();
    synthRef.current.triggerAttackRelease('E5', '0.15', now);
    synthRef.current.triggerAttackRelease('G5', '0.15', now + 0.08);
  };

  const playErrorSound = async () => {
    await Tone.start();
    errorSynthRef.current.triggerAttackRelease('A2', '0.4');
    setTimeout(() => {
      errorSynthRef.current.triggerAttackRelease('F2', '0.4');
    }, 100);
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
      playSuccessSound();
    } else {
      playErrorSound();
      // Pause de 1,2s après le buzz puis rejouer l'accord
      setTimeout(() => playChord(), 1200);
    }
  };

  const playChordPreview = (type) => {
    // Jouer l'accord correspondant au type sélectionné
    const baseMidi = Tone.Frequency(currentChord[0]).toMidi();
    const previewNotes = type.intervals.map(interval => 
      Tone.Frequency(baseMidi + interval, 'midi').toNote()
    );
    
    synthRef.current.triggerAttackRelease(previewNotes, '0.8');
  };

  const checkType = async (selectedType) => {
    if (showSuccess) return; // Désactiver les clics après succès
    
    // Jouer le son de l'accord cliqué
    playChordPreview(selectedType);
    
    setAttemptCount(prev => prev + 1);
    
    if (selectedType.label === chordType.label) {
      setSuccessCount(prev => prev + 1);
      setShowSuccess(true);
      setCorrectButton(selectedType.label);
      setTimeout(() => playSuccessSound(), 900);
    } else {
      setWrongButtons(prev => new Set([...prev, selectedType.label]));
      setTimeout(() => {
        playErrorSound();
        // Pause de 1,2s après le buzz puis rejouer l'accord
        setTimeout(() => playChord(), 1200);
      }, 900);
    }
  };

  const handleNext = () => {
    setShowSuccess(false);
    setWrongButtons(new Set());
    setCorrectButton(null);
    generateNewChord();
  };

  return (
    <div className="exercise-container" data-testid="exercice-accords3">
      <div className="exercise-header">
        <h1>Accords 3 Notes</h1>
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
              Trouvez les 3 notes de l'arpège
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
              <button
                onClick={playUserNotes}
                className="btn-secondary flex items-center justify-center"
                style={{ minWidth: '60px', height: '72px', padding: '0 16px' }}
                data-testid="btn-play-user-notes"
                title="Écouter les notes sélectionnées"
              >
                <Volume2 size={24} />
              </button>
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
              {TYPES_ACCORDS.map((type) => {
                let buttonStyle = {};
                let isDisabled = false;
                
                if (correctButton === type.label) {
                  buttonStyle = {
                    background: 'linear-gradient(135deg, #2d7a3e 0%, #1e5a2e 100%)',
                    color: '#fff',
                    borderColor: '#2d7a3e'
                  };
                  isDisabled = true;
                } else if (wrongButtons.has(type.label)) {
                  buttonStyle = {
                    background: 'linear-gradient(135deg, #8b2e2e 0%, #5a1e1e 100%)',
                    color: '#fff',
                    borderColor: '#8b2e2e'
                  };
                  isDisabled = true;
                }
                
                if (showSuccess) {
                  isDisabled = true;
                }
                
                return (
                  <button
                    key={type.label}
                    onClick={() => checkType(type)}
                    className="answer-btn"
                    style={buttonStyle}
                    disabled={isDisabled}
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

export default ExerciceAccords3Notes;