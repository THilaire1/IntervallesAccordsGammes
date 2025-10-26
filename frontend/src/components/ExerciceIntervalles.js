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
  { label: '4+', name: 'Quarte augmentée (triton)', semitones: 6 },
  { label: '5j', name: 'Quinte juste', semitones: 7 },
  { label: '6m', name: 'Sixte mineure', semitones: 8 },
  { label: '6M', name: 'Sixte majeure', semitones: 9 },
  { label: '7m', name: 'Septième mineure', semitones: 10 },
  { label: '7M', name: 'Septième majeure', semitones: 11 },
  { label: '8j', name: 'Octave', semitones: 12 },
];

const EXEMPLES_CHANSONS = {
  1: [
    { titre: 'Les Dents de la mer (thème)', direction: 'asc' },
    { titre: 'Lettre à Élise', direction: 'desc' },
    { titre: 'Jaws Theme', direction: 'asc' }
  ],
  2: [
    { titre: 'Frère Jacques', direction: 'asc' },
    { titre: 'Joyeux Anniversaire', direction: 'asc' },
    { titre: 'Au Clair de la Lune', direction: 'asc' },
    { titre: 'Yesterday (Beatles)', direction: 'desc' }
  ],
  3: [
    { titre: 'Greensleeves', direction: 'asc' },
    { titre: 'La Panthère Rose (thème)', direction: 'asc' },
    { titre: 'Smoke on the Water', direction: 'desc' },
    { titre: 'Hey Jude (refrain)', direction: 'desc' }
  ],
  4: [
    { titre: 'Oh When the Saints', direction: 'asc' },
    { titre: 'Hymne à la joie (Beethoven)', direction: 'asc' },
    { titre: 'Can\'t Help Falling in Love', direction: 'asc' }
  ],
  5: [
    { titre: 'La Marseillaise ("Allons enfants")', direction: 'asc' },
    { titre: 'Here Comes the Bride', direction: 'asc' },
    { titre: 'Amazing Grace', direction: 'desc' }
  ],
  6: [
    { titre: 'Maria (West Side Story)', direction: 'asc' },
    { titre: 'The Simpsons (thème)', direction: 'asc' },
    { titre: 'Purple Haze', direction: 'desc' }
  ],
  7: [
    { titre: 'Star Wars (thème)', direction: 'asc' },
    { titre: 'Twinkle Twinkle Little Star', direction: 'asc' },
    { titre: 'Flinstones (thème)', direction: 'desc' }
  ],
  8: [
    { titre: 'Love Story (thème)', direction: 'desc' },
    { titre: 'In My Life (Beatles)', direction: 'desc' },
    { titre: 'Killing Me Softly', direction: 'asc' }
  ],
  9: [
    { titre: 'Il était un petit navire', direction: 'asc' },
    { titre: 'My Way', direction: 'asc' },
    { titre: 'Nobody Knows (Trouble)', direction: 'desc' }
  ],
  10: [
    { titre: 'Winning (thème)', direction: 'asc' },
    { titre: 'There\'s a Place for Us', direction: 'asc' },
    { titre: 'Watermelon Man', direction: 'desc' }
  ],
  11: [
    { titre: 'Take on Me (refrain)', direction: 'asc' },
    { titre: 'I Love You (Barney)', direction: 'asc' },
    { titre: 'Black Orpheus', direction: 'desc' }
  ],
  12: [
    { titre: 'Somewhere Over the Rainbow', direction: 'asc' },
    { titre: 'A Hard Day\'s Night', direction: 'asc' },
    { titre: 'Singin\' in the Rain', direction: 'desc' }
  ],
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
  const [isLoaded, setIsLoaded] = useState(false);
  const synthRef = useRef(null);
  const errorSynthRef = useRef(null);

  const generateNewInterval = () => {
    const notes = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const randomNote1 = notes[Math.floor(Math.random() * notes.length)];
    const randomInterval = INTERVALLES[Math.floor(Math.random() * INTERVALLES.length)];
    
    const note1Midi = Tone.Frequency(randomNote1).toMidi();
    const note2Midi = note1Midi + randomInterval.semitones;
    
    // Vérifier que la note2 reste dans la plage C2-C5
    if (note2Midi > Tone.Frequency('C5').toMidi()) {
      // Recommencer avec une note de départ plus basse
      generateNewInterval();
      return;
    }
    
    const randomNote2 = Tone.Frequency(note2Midi, 'midi').toNote();

    setNote1(randomNote1);
    setNote2(randomNote2);
    setInterval(randomInterval);
  };

  useEffect(() => {
    // Utiliser des vrais samples de piano Salamander
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
        console.log("Piano samples loaded");
        setIsLoaded(true);
        // Générer l'intervalle une fois les samples chargés
        generateNewInterval();
      }
    }).toDestination();
    
    synthRef.current = sampler;

    errorSynthRef.current = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.3 }
    }).toDestination();

    return () => {
      synthRef.current?.dispose();
      errorSynthRef.current?.dispose();
    };
  }, []);

  const playInterval = async () => {
    await Tone.start();
    const now = Tone.now();
    synthRef.current.triggerAttackRelease(note1, '0.5', now);
    synthRef.current.triggerAttackRelease(note2, '0.5', now + 0.6);
  };

  const playSuccessSound = async () => {
    await Tone.start();
    // Son de clochette (ding) - notes aiguës rapides avec piano sampler
    const now = Tone.now();
    synthRef.current.triggerAttackRelease('E5', '0.15', now);
    synthRef.current.triggerAttackRelease('G5', '0.15', now + 0.08);
  };

  const playErrorSound = async () => {
    await Tone.start();
    // Son de buzz - note grave qui descend
    errorSynthRef.current.triggerAttackRelease('A2', '0.4');
    setTimeout(() => {
      errorSynthRef.current.triggerAttackRelease('F2', '0.4');
    }, 100);
  };

  const handleAnswer = async (selectedInterval) => {
    if (showSuccess) return; // Désactiver les clics après succès
    
    setAttemptCount(prev => prev + 1);
    
    if (selectedInterval.semitones === interval.semitones) {
      setSuccessCount(prev => prev + 1);
      setShowSuccess(true);
      setCorrectButton(selectedInterval.label);
      playSuccessSound();
    } else {
      setWrongButtons(prev => new Set([...prev, selectedInterval.label]));
      playErrorSound();
      // Pause de 1,2s après le buzz puis rejouer le son
      setTimeout(() => playInterval(), 1200);
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
              {EXEMPLES_CHANSONS[interval.semitones]?.map((exemple, idx) => (
                <li key={idx} className="py-1">
                  <strong>{exemple.titre}</strong>
                  <span style={{ fontSize: '0.85rem', marginLeft: '8px', opacity: 0.8 }}>
                    ({exemple.direction === 'asc' ? '↑ ascendant' : '↓ descendant'})
                  </span>
                </li>
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