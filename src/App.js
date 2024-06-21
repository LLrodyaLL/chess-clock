import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [player1Time, setPlayer1Time] = useState(300); // 5 minutes in seconds
  const [player2Time, setPlayer2Time] = useState(300); // 5 minutes in seconds
  const [currentTurn, setCurrentTurn] = useState(0); // 0 means no one's turn, 1 means player 1's turn, 2 means player 2's turn
  const [timer, setTimer] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (timer) {
      clearInterval(timer);
    }

    if (!isPaused) {
      if (currentTurn === 1) {
        setTimer(setInterval(() => {
          setPlayer1Time(prevTime => {
            if (prevTime <= 0) {
              clearInterval(timer);
              alert('Время черных истекло!');
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
              alert('Время белых истекло!');
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000));
      }
    }

    return () => clearInterval(timer);
  }, [currentTurn, isPaused]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const switchTurn = (player) => {
    if (!isPaused) {
      clearInterval(timer);
      if (player === 1) {
        setCurrentTurn(2);
      } else {
        setCurrentTurn(1);
      }
    }
  };

  const setTime = (minutes) => {
    setPlayer1Time(minutes * 60);
    setPlayer2Time(minutes * 60);
    clearInterval(timer);
    setCurrentTurn(0);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="App">
      <div className="container">
        <div className="clock" id="player1">
          <div className="player-label">Черные</div>
          <div>{formatTime(player1Time)}</div>
          <button onClick={() => switchTurn(1)}>Ход</button>
        </div>
        <div className="clock" id="player2">
          <div className="player-label">Белые</div>
          <div>{formatTime(player2Time)}</div>
          <button onClick={() => switchTurn(2)}>Ход</button>
        </div>
      </div>
      <div className="set-time">
        <button onClick={() => setTime(1)}>1 минута</button>
        <button onClick={() => setTime(5)}>5 минут</button>
        <button onClick={() => setTime(10)}>10 минут</button>
        <button onClick={() => setTime(30)}>30 минут</button>
        <button onClick={() => setTime(60)}>60 минут</button>
      </div>
      <div className="pause">
        <button onClick={togglePause}>{isPaused ? 'Продолжить' : 'Пауза'}</button>
      </div>
    </div>
  );
}

export default App;
