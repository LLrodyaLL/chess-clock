import React, { useState, useEffect } from 'react';
import './App.css';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';

function App() {
  const [player1Time, setPlayer1Time] = useState(300); // 5 minutes in seconds
  const [player2Time, setPlayer2Time] = useState(300); // 5 minutes in seconds
  const [currentTurn, setCurrentTurn] = useState(0); // 0 means no one's turn, 1 means player 1's turn, 2 means player 2's turn
  const [timer, setTimer] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false); // Track if the game has started
  const [assistant, setAssistant] = useState(null);

  useEffect(() => {
    const initializeAssistant = () => {
      if (process.env.NODE_ENV === 'development') {
        return createSmartappDebugger({
          token: process.env.REACT_APP_TOKEN ?? '',
          initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
          getState: () => ({ player1Time, player2Time }),
          nativePanel: {
            defaultText: 'Приветствую!',
            screenshotMode: false,
            tabIndex: -1,
          },
        });
      } else {
        return createAssistant({
          getState: () => ({ player1Time, player2Time }),
        });
      }
    };

    const assistantInstance = initializeAssistant();
    setAssistant(assistantInstance);

    return () => {
      if (assistantInstance) {
        assistantInstance.destroy();
      }
    };
  }, [player1Time, player2Time]);

  useEffect(() => {
    if (timer) {
      clearInterval(timer);
    }

    if (!isPaused && gameStarted) {
      if (currentTurn === 1) {
        setTimer(setInterval(() => {
          setPlayer1Time(prevTime => {
            if (prevTime <= 0) {
              clearInterval(timer);
              if (assistant) {
                assistant.sendData({ action: { action_id: 'game_end', parameters: { winner: 'Player 2' } } });
              }
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000));
      } else if (currentTurn === 2) {
        setTimer(setInterval(() => {
          setPlayer2Time(prevTime => {
            if (prevTime <= 0) {
              clearInterval(timer);
              if (assistant) {
                assistant.sendData({ action: { action_id: 'game_end', parameters: { winner: 'Player 1' } } });
              }
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000));
      }
    }

    return () => clearInterval(timer);
  }, [currentTurn, isPaused, gameStarted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const switchTurn = (player) => {
    if (!isPaused && gameStarted) {
      clearInterval(timer);
      setCurrentTurn(player === 1 ? 2 : 1);
    }
  };

  const setTime = (minutes) => {
    setPlayer1Time(minutes * 60);
    setPlayer2Time(minutes * 60);
    clearInterval(timer);
    setCurrentTurn(0);
    setIsPaused(false);
    setGameStarted(false); // Reset game state to not started
  };

  const togglePause = () => {
    if (gameStarted) {
      setIsPaused(!isPaused);
    }
  };

  const startTimerForPlayer2 = () => {
    if (!isPaused && !gameStarted) {
      setGameStarted(true);
      setCurrentTurn(2);
    }
  };

  return (
    <div className="App">
      <div className="clock-container">
        <div className="clock">
          <div className="player-label">Черные</div>
          <div className="timer">{formatTime(player1Time)}</div>
          <button className="turn-button" onClick={() => switchTurn(1)} disabled={!gameStarted}>Ход</button>
        </div>
        <div className="clock">
          <div className="player-label">Белые</div>
          <div className="timer">{formatTime(player2Time)}</div>
          <button className="turn-button" onClick={() => switchTurn(2)} disabled={!gameStarted}>Ход</button>
        </div>
      </div>
      <div className="button-row">
        <button className="pause-button" onClick={togglePause} disabled={!gameStarted}>{isPaused ? 'Продолжить' : 'Пауза'}</button>
        <button className="time-button start-button" onClick={startTimerForPlayer2}>Начать</button>
      </div>
      <div className="set-time">
        <button className="time-button" onClick={() => setTime(1)}>1 минута</button>
        <button className="time-button" onClick={() => setTime(5)}>5 минут</button>
        <button className="time-button" onClick={() => setTime(10)}>10 минут</button>
        <button className="time-button" onClick={() => setTime(30)}>30 минут</button>
        <button className="time-button" onClick={() => setTime(60)}>60 минут</button>
      </div>
    </div>
  );
}

export default App;
