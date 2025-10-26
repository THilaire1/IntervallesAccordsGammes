import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { Piano, X } from 'lucide-react';

const PianoVirtuel = ({ synth }) => {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [localSynth, setLocalSynth] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 250 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

  const handleMouseDown = (e) => {
    if (e.target.closest('.piano-drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

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

  // 3 octaves de Do2 à Do5
  const octaves = [
    { white: ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2'], black: ['C#2', 'D#2', null, 'F#2', 'G#2', 'A#2', null] },
    { white: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'], black: ['C#3', 'D#3', null, 'F#3', 'G#3', 'A#3', null] },
    { white: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'], black: ['C#4', 'D#4', null, 'F#4', 'G#4', 'A#4', null] },
    { white: ['C5'], black: [] }
  ];

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="piano-toggle-btn"
        data-testid="piano-show-btn"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 100
        }}
      >
        <Piano size={32} />
      </button>
    );
  }

  return (
    <div
      className="piano-container-draggable"
      data-testid="piano-virtuel"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 100,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="piano-header piano-drag-handle">
        <span>Piano Virtuel</span>
        <button
          onClick={() => setIsVisible(false)}
          className="piano-close-btn"
          data-testid="piano-hide-btn"
        >
          <X size={20} />
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '15px', overflowX: 'auto', maxWidth: '800px' }}>
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