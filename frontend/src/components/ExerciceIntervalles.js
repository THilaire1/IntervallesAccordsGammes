import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2, HelpCircle } from 'lucide-react';
import PianoVirtuel from './PianoVirtuel';

const INTERVALLES = [
  { label: '2m', name: 'Seconde mineure', semitones: 1 },
  { label: '2M', name: 'Seconde majeure', semitones: 2 },
  { label: '3m', name: 'Tierce mineure', semitones: 3 },
  { label: '3M', name: 'Tierce majeure', semitones: 4 },
  { label: '4j', name: 'Quarte juste', semitones: 5 },
  { label: '4+', name: 'Quarte augmentée', semitones: 6 },
  { label: '5-', name: 'Quinte diminuée', semitones: 6 },
  { label: '5j', name: 'Quinte juste', semitones: 7 },
  { label: '6m', name: 'Sixte mineure', semitones: 8 },
  { label: '6M', name: 'Sixte majeure', semitones: 9 },
  { label: '7m', name: 'Septième mineure', semitones: 10 },
  { label: '7M', name: 'Septième majeure', semitones: 11 },
  { label: '8j', name: 'Octave', semitones: 12 },
];

const EXEMPLES_CHANSONS = {
  1: ['Les Dents de la Mer (thème)', 'Jaws Theme'],
  2: ['Joyeux Anniversaire', 'Frère Jacques', 'Au Clair de la Lune'],
  3: ['Greensleeves', 'Smoke on the Water', 'Summertime'],
  4: ['Can\'t Help Falling in Love', 'Oh When the Saints', 'La Marseillaise'],
  5: ['Here Comes the Bride', 'Amazing Grace'],
  6: ['Maria (West Side Story)', 'The Simpsons Theme'],
  7: ['Star Wars Theme', 'Twinkle Twinkle Little Star'],
  8: ['Somewhere Over the Rainbow', 'My Bonnie'],
  9: ['My Way', 'A Whole New World'],
  10: ['West Side Story - Maria', 'Swing Low Sweet Chariot'],
  11: ['The Simpsons Theme', 'I Love You (Barney)'],
  12: ['Take on Me', 'Somewhere Over the Rainbow (octave)'],
};

const ExerciceIntervalles = ({ onReturn }) => {
  const [note1, setNote1] = useState(null);
  const [note2, setNote2] = useState(null);
  const [interval, setInterval] = useState(null);
  const [successCount, setSuccessCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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

    generateNewInterval();

    return () => {
      synthRef.current?.dispose();
      errorSynthRef.current?.dispose();
    };
  }, []);

  const generateNewInterval = () => {
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];
    const randomNote1 = notes[Math.floor(Math.random() * notes.length)];
    const randomInterval = INTERVALLES[Math.floor(Math.random() * INTERVALLES.length)];
    
    const note1Midi = Tone.Frequency(randomNote1).toMidi();
    const note2Midi = note1Midi + randomInterval.semitones;
    const randomNote2 = Tone.Frequency(note2Midi, 'midi').toNote();

    setNote1(randomNote1);
    setNote2(randomNote2);
    setInterval(randomInterval);
  };

  const playInterval = async () => {
    await Tone.start();
    const now = Tone.now();
    synthRef.current.triggerAttackRelease(note1, '0.5', now);
    synthRef.current.triggerAttackRelease(note2, '0.5', now + 0.6);
  };

  const handleAnswer = async (selectedInterval) => {
    if (showSuccess) return; // Désactiver les clics après succès
    
    setAttemptCount(prev => prev + 1);
    
    if (selectedInterval.semitones === interval.semitones) {
      setSuccessCount(prev => prev + 1);
      setShowSuccess(true);
      setCorrectButton(selectedInterval.label);
    } else {
      setWrongButtons(prev => new Set([...prev, selectedInterval.label]));
      await Tone.start();
      errorSynthRef.current.triggerAttackRelease('C2', '0.1');
      // Rejouer le son en cas d'erreur
      setTimeout(() => playInterval(), 200);
    }
  };

  const handleNext = () => {
    setShowSuccess(false);
    setWrongButtons(new Set());
    setCorrectButton(null);
    setShowHelp(false);
    generateNewInterval();
  };

  return (
    <div className="exercise-container" data-testid="exercice-intervalles">
      <div className="exercise-header">
        <h1>Déterminer les Intervalles</h1>
        <p style={{ color: '#6b5b3f', fontSize: '1.1rem' }}>Écoutez les deux notes et identifiez l'intervalle</p>
      </div>

      <div className="exercise-content">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={playInterval}
            className="btn-primary flex items-center gap-2"
            data-testid="btn-play-interval"
          >
            <Volume2 size={20} />
            Écouter l'intervalle
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="btn-secondary flex items-center gap-2"
            data-testid="btn-help"
          >
            <HelpCircle size={20} />
            Exemples de chansons
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

        {showHelp && interval && (
          <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(212, 175, 55, 0.2)', border: '2px solid #d4af37' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#4a3f2a' }}>Exemples pour cet intervalle :</h3>
            <ul className="list-disc list-inside" style={{ color: '#6b5b3f' }}>
              {EXEMPLES_CHANSONS[interval.semitones]?.map((chanson, idx) => (
                <li key={idx} className="py-1">{chanson}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={`answer-buttons ${showSuccess ? 'success-animation' : ''}`}>
          {INTERVALLES.map((int) => {
            let buttonStyle = {};
            let isDisabled = false;
            
            if (correctButton === int.label) {
              buttonStyle = {
                background: 'linear-gradient(135deg, #2d7a3e 0%, #1e5a2e 100%)',
                color: '#fff',
                borderColor: '#2d7a3e'
              };
              isDisabled = true;
            } else if (wrongButtons.has(int.label)) {
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
                key={int.label}
                onClick={() => handleAnswer(int)}
                className="answer-btn"
                style={buttonStyle}
                disabled={isDisabled}
                data-testid={`interval-${int.label}`}
              >
                {int.label}
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

export default ExerciceIntervalles;