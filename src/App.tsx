/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HeaderNav, MainViewMode } from './components/common/HeaderNav';
import { HomeScreen } from './components/home/HomeScreen';
import { ProfessorPanel } from './components/professor/ProfessorPanel';
import { StudentFlow } from './components/student/StudentFlow';
import { StudentArenaHub } from './components/student/StudentArenaHub';
import { DualScreenView } from './components/split/DualScreenView';
import { ProfessorLogin, isProfessorLoggedIn, setProfessorLoggedIn } from './components/professor/ProfessorLogin';
import { Player } from './types/game';
import { gameStateManager } from './services/gameStateManager';

export default function App() {
  const [currentView, setCurrentView] = React.useState<MainViewMode>('home');
  const [currentPlayer, setCurrentPlayer] = React.useState<Player | null>(null);
  const [isProfessorAuth, setIsProfessorAuth] = React.useState<boolean>(isProfessorLoggedIn());

  // Initialize and check saved player
  React.useEffect(() => {
    setIsProfessorAuth(isProfessorLoggedIn());

    const saved = gameStateManager.getCurrentPlayer();
    if (saved) {
      setCurrentPlayer(saved);
    }

    const unsub = gameStateManager.subscribe(() => {
      const updated = gameStateManager.getCurrentPlayer();
      setCurrentPlayer(updated);
    });

    return unsub;
  }, []);

  const handleStudentEnter = (player: Player) => {
    setCurrentPlayer(player);
    setCurrentView('student');
  };

  const handleStudentExit = () => {
    setCurrentPlayer(null);
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-['Fredoka',sans-serif] flex flex-col">
      {/* Top Header */}
      <HeaderNav
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        activeRoomName={currentPlayer ? currentPlayer.roomId : undefined}
        isProfessorAuth={isProfessorAuth}
        onLogout={() => {
          setProfessorLoggedIn(false);
          setIsProfessorAuth(false);
          setCurrentView('home');
        }}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'home' && (
          <HomeScreen
            onGoToProfessor={() => setCurrentView('professor')}
            onGoToStudent={() => setCurrentView('student')}
            onGoToSplitTest={() => setCurrentView('split')}
          />
        )}

        {currentView === 'professor' && (
          isProfessorAuth ? (
            <ProfessorPanel
              onLogout={() => {
                setProfessorLoggedIn(false);
                setIsProfessorAuth(false);
              }}
              onBackToHome={() => setCurrentView('home')}
            />
          ) : (
            <ProfessorLogin
              onSuccess={() => setIsProfessorAuth(true)}
              onCancel={() => setCurrentView('home')}
            />
          )
        )}

        {currentView === 'student' && (
          currentPlayer ? (
            <StudentArenaHub
              player={currentPlayer}
              onExitArena={handleStudentExit}
            />
          ) : (
            <StudentFlow onEnterArena={handleStudentEnter} />
          )
        )}

        {currentView === 'split' && <DualScreenView />}
      </main>
    </div>
  );
}
