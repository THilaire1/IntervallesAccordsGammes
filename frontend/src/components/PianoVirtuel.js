import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

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

  // 3 octaves de Do4 à Do6
  const octaves = [
    { white: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'], black: ['C#4', 'D#4', null, 'F#4', 'G#4', 'A#4', null] },
    { white: ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5'], black: ['C#5', 'D#5', null, 'F#5', 'G#5', 'A#5', null] },
    { white: ['C6'], black: [] }
  ];

  return (
    <div className="piano-container" data-testid="piano-virtuel">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        {octaves.map((octave, octaveIdx) => (
          <div key={octaveIdx} style={{ position: 'relative', display: 'flex' }}>
            {octave.white.map((note, idx) => (
              <div key={note} style={{ position: 'relative' }}>
                <div
                  className={`white-key ${activeKeys.has(note) ? 'active' : ''}`}
                  onClick={() => playNote(note)}
                  data-testid={`piano-key-${note}`}
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
                    {note.replace(/[0-9]/g, '')}
                  </span>
                </div>
                {octave.black[idx] && (
                  <div
                    className={`black-key ${activeKeys.has(octave.black[idx]) ? 'active' : ''}`}
                    onClick={() => playNote(octave.black[idx])}
                    data-testid={`piano-key-${octave.black[idx]}`}
                    style={{
                      position: 'absolute',
                      left: '21px',
                      top: 0,
                      zIndex: 2
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PianoVirtuel;