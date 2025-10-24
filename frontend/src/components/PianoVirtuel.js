import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const PIANO_KEYS = [
  { note: 'C4', type: 'white', label: 'C' },
  { note: 'C#4', type: 'black', offset: 22 },
  { note: 'D4', type: 'white', label: 'D' },
  { note: 'D#4', type: 'black', offset: 56 },
  { note: 'E4', type: 'white', label: 'E' },
  { note: 'F4', type: 'white', label: 'F' },
  { note: 'F#4', type: 'black', offset: 124 },
  { note: 'G4', type: 'white', label: 'G' },
  { note: 'G#4', type: 'black', offset: 158 },
  { note: 'A4', type: 'white', label: 'A' },
  { note: 'A#4', type: 'black', offset: 192 },
  { note: 'B4', type: 'white', label: 'B' },
  { note: 'C5', type: 'white', label: 'C' },
  { note: 'C#5', type: 'black', offset: 260 },
  { note: 'D5', type: 'white', label: 'D' },
  { note: 'D#5', type: 'black', offset: 294 },
  { note: 'E5', type: 'white', label: 'E' },
  { note: 'F5', type: 'white', label: 'F' },
  { note: 'F#5', type: 'black', offset: 362 },
  { note: 'G5', type: 'white', label: 'G' },
  { note: 'G#5', type: 'black', offset: 396 },
  { note: 'A5', type: 'white', label: 'A' },
  { note: 'A#5', type: 'black', offset: 430 },
  { note: 'B5', type: 'white', label: 'B' },
  { note: 'C6', type: 'white', label: 'C' },
];

const PianoVirtuel = ({ synth }) => {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [localSynth, setLocalSynth] = useState(null);

  useEffect(() => {
    if (!synth) {
      const newSynth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
      }).toDestination();
      setLocalSynth(newSynth);

      return () => {
        newSynth.dispose();
      };
    }
  }, [synth]);

  const playNote = async (note) => {
    await Tone.start();
    const activeSynth = synth || localSynth;
    if (activeSynth) {
      activeSynth.triggerAttackRelease(note, '0.5');
      setActiveKeys(prev => new Set(prev).add(note));
      setTimeout(() => {
        setActiveKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(note);
          return newSet;
        });
      }, 200);
    }
  };

  const whiteKeys = PIANO_KEYS.filter(k => k.type === 'white');
  const blackKeys = PIANO_KEYS.filter(k => k.type === 'black');

  return (
    <div className="piano-container" data-testid="piano-virtuel">
      <div className="piano-keys">
        {whiteKeys.map((key, idx) => (
          <div
            key={key.note}
            className={`white-key ${activeKeys.has(key.note) ? 'active' : ''}`}
            onClick={() => playNote(key.note)}
            data-testid={`piano-key-${key.note}`}
            style={{ position: 'relative' }}
          >
            <span
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.75rem',
                color: '#666',
                fontWeight: '500'
              }}
            >
              {key.label}
            </span>
          </div>
        ))}

        {blackKeys.map((key) => (
          <div
            key={key.note}
            className={`black-key ${activeKeys.has(key.note) ? 'active' : ''}`}
            onClick={() => playNote(key.note)}
            data-testid={`piano-key-${key.note}`}
            style={{ left: `${key.offset}px` }}
          />
        ))}
      </div>
    </div>
  );
};

export default PianoVirtuel;