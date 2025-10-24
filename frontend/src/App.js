import React, { useState } from 'react';
import '@/App.css';
import MenuPrincipal from '@/components/MenuPrincipal';
import ExerciceIntervalles from '@/components/ExerciceIntervalles';
import ExerciceAccords3Notes from '@/components/ExerciceAccords3Notes';
import ExerciceAccords4Notes from '@/components/ExerciceAccords4Notes';
import ExerciceModesGrecs from '@/components/ExerciceModesGrecs';

function App() {
  const [currentExercise, setCurrentExercise] = useState(null);

  const handleExerciseSelect = (exercise) => {
    setCurrentExercise(exercise);
  };

  const handleReturnToMenu = () => {
    setCurrentExercise(null);
  };

  const handleQuit = () => {
    if (window.confirm('Voulez-vous vraiment quitter l\'application ?')) {
      window.close();
    }
  };

  return (
    <div className="App" data-testid="app-container">
      {!currentExercise && (
        <MenuPrincipal
          onSelectExercise={handleExerciseSelect}
          onQuit={handleQuit}
        />
      )}

      {currentExercise === 'intervalles' && (
        <ExerciceIntervalles onReturn={handleReturnToMenu} />
      )}

      {currentExercise === 'accords3' && (
        <ExerciceAccords3Notes onReturn={handleReturnToMenu} />
      )}

      {currentExercise === 'accords4' && (
        <ExerciceAccords4Notes onReturn={handleReturnToMenu} />
      )}

      {currentExercise === 'modes' && (
        <ExerciceModesGrecs onReturn={handleReturnToMenu} />
      )}
    </div>
  );
}

export default App;