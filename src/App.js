import React, { useState, useEffect, useRef } from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';
import { useSpatnavInitialization, useSection, getCurrentFocusedElement } from '@salutejs/spatial';
import './App.css';

const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? '',
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
    });
  } else {
    return createAssistant({ getState });
  }
};

function App() {
  const [player1Time, setPlayer1Time] = useState(300); // 5 minutes in seconds
  const [player2Time, setPlayer2Time] = useState(300); // 5 minutes in seconds
  const [currentTurn, setCurrentTurn] = useState(0); // 0 means no one's turn, 1 means player 1's turn, 2 means player 2's turn
  const [timer, setTimer] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false); // Track if the game has started
  const [assistant, setAssistant] = useState(null);
  const [character, setCharacter] = useState('sber');
  
  useSpatnavInitialization();
  
  const firstElementRef = useRef(null); 
  const secondElementRef = useRef(null); 
  const [sectionProps, customize1] = useSection('sectionName');

  useEffect(() => {
    const assistant = initializeAssistant(() => getStateForAssistant());
    setAssistant(assistant);

    assistant.on('data', (event) => {
      console.log('assistant.on(data)', event);
      if (event.type === 'character') {
        console.log(`assistant.on(data): character: "${event?.character?.id}"`);
        setCharacter(event.character.id);
      } else if (event.type === 'insets') {
        console.log('assistant.on(data): insets');
      } else {
        const { action } = event;
        dispatchAssistantAction(action);
      }
    });

    assistant.on('start', (event) => {
      let initialData = assistant.getInitialData();
      console.log('assistant.on(start)', event, initialData);
    });

    assistant.on('command', (event) => {
      console.log('assistant.on(command)', event);
    });

    assistant.on('error', (event) => {
      console.log('assistant.on(error)', event);
    });

    assistant.on('tts', (event) => {
      console.log('assistant.on(tts)', event);
    });
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const focusedElement = getCurrentFocusedElement();
      console.log("Focused element:", focusedElement);
    }, 5000); // 5000 миллисекунд = 5 секунд

    // Очистка интервала при размонтировании компонента
    return () => clearInterval(intervalId);
  }, []);

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

  const getStateForAssistant = () => {
    const state = {
      player1Time,
      player2Time,
      currentTurn,
      isPaused,
      gameStarted
    };
    console.log('getStateForAssistant: state:', state);
    return state;
  };

  const dispatchAssistantAction = async (action) => {
    console.log('dispatchAssistantAction', action);
    if (action) {
        switch (action.type) {
            case 'switch_turn':
                console.log('dispatch: switchTurn:', action.player);
                return switchTurn(action.player);
            case 'set_time':
                console.log('dispatch: setTime:', action.minutes);
                return setTime(action.minutes);
            case 'toggle_pause':
                console.log('dispatch: togglePause');
                return togglePause();
            case 'start_game':
                console.log('dispatch: startGame');
                return startTimerForPlayer2();
            default:
                throw new Error();
        }
    }
};

  useEffect(() => {
    if (firstElementRef.current) {
      firstElementRef.current.focus();
    }

    customize1({
      getDefaultElement: (sectionPropsRoot) => sectionPropsRoot.firstElementChild,
      enterTo: 'default-element',
    });
  }, [customize1]); 

  return (
    <div className="App" {...sectionProps}>
      <div className="clock-container">
        <div className="clock">
          <div className="player-label">Черные</div>
          <div className="timer">{formatTime(player1Time)}</div>
          <button ref={firstElementRef} className="turn-button sn-section-item" tabIndex={-1} onClick={() => switchTurn(1)} disabled={!gameStarted}>Ход</button>
        </div>
        <div className="clock">
          <div className="player-label">Белые</div>
          <div className="timer">{formatTime(player2Time)}</div>
          <button ref={secondElementRef} className="turn-button sn-section-item" tabIndex={-1} onClick={() => switchTurn(2)} disabled={!gameStarted}>Ход</button>
        </div>
      </div>
      <div className="button-row">
        <button className="pause-button sn-section-item" tabIndex={-1} onClick={togglePause} disabled={!gameStarted}>{isPaused ? 'Продолжить' : 'Пауза'}</button>
        <button className="time-button start-button sn-section-item" tabIndex={-1} onClick={startTimerForPlayer2}>Начать</button>
      </div>
      <div className="set-time">
        <button className="time-button sn-section-item" tabIndex={-1} onClick={() => setTime(1)}>1 минута</button>
        <button className="time-button sn-section-item" tabIndex={-1} onClick={() => setTime(5)}>5 минут</button>
        <button className="time-button sn-section-item" tabIndex={-1} onClick={() => setTime(10)}>10 минут</button>
        <button className="time-button sn-section-item" tabIndex={-1} onClick={() => setTime(30)}>30 минут</button>
        <button className="time-button sn-section-item" tabIndex={-1} onClick={() => setTime(60)}>60 минут</button>
      </div>
    </div>
  );
}

export default App;
