import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Box, Chip } from '@/components/ui/card';

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const createDeck = () => {
  return SUITS.flatMap(suit => VALUES.map(value => ({ suit, value })));
};

const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const calculateHandValue = (hand) => {
  let value = 0;
  let aceCount = 0;

  for (let card of hand) {
    if (card.value === 'A') {
      aceCount++;
      value += 11;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }

  while (value > 21 && aceCount > 0) {
    value -= 10;
    aceCount--;
  }

  return value;
};

const BlackjackGame = () => {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameState, setGameState] = useState('betting'); // betting, playerTurn, dealerTurn, gameOver
  const [result, setResult] = useState('');
  const [playerChips, setPlayerChips] = useState(1000);
  const [currentBet, setCurrentBet] = useState(0);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);
    setPlayerHand([]);
    setDealerHand([]);
    setGameState('betting');
    setResult('');
    setCurrentBet(0);
  };

  const placeBet = (amount) => {
    if (playerChips >= amount) {
      setCurrentBet(currentBet + amount);
      setPlayerChips(playerChips - amount);
    }
  };

  const dealInitialCards = () => {
    if (currentBet > 0) {
      const newDeck = [...deck];
      const newPlayerHand = [newDeck.pop(), newDeck.pop()];
      const newDealerHand = [newDeck.pop(), newDeck.pop()];
      setPlayerHand(newPlayerHand);
      setDealerHand(newDealerHand);
      setDeck(newDeck);
      setGameState('playerTurn');
    }
  };

  const hit = () => {
    if (gameState !== 'playerTurn') return;

    const newPlayerHand = [...playerHand, deck.pop()];
    setPlayerHand(newPlayerHand);
    setDeck([...deck]);

    if (calculateHandValue(newPlayerHand) > 21) {
      setGameState('gameOver');
      setResult('プレイヤーの負け！バーストしました。');
    }
  };

  const stand = () => {
    if (gameState !== 'playerTurn') return;
    setGameState('dealerTurn');
    dealerPlay();
  };

  const dealerPlay = () => {
    let newDealerHand = [...dealerHand];
    let newDeck = [...deck];

    while (calculateHandValue(newDealerHand) < 17) {
      newDealerHand.push(newDeck.pop());
    }

    setDealerHand(newDealerHand);
    setDeck(newDeck);

    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(newDealerHand);

    if (dealerValue > 21) {
      setResult('プレイヤーの勝ち！ディーラーがバーストしました。');
      setPlayerChips(playerChips + currentBet * 2);
    } else if (dealerValue > playerValue) {
      setResult('ディーラーの勝ち！');
    } else if (dealerValue < playerValue) {
      setResult('プレイヤーの勝ち！');
      setPlayerChips(playerChips + currentBet * 2);
    } else {
      setResult('引き分け！');
      setPlayerChips(playerChips + currentBet);
    }

    setGameState('gameOver');
  };

  const renderHand = (hand, isDealer = false) => (
    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: '10px 0' }}>
      {hand.map((card, index) => (
        <Card key={index} sx={{
          width: 60,
          height: 90,
          margin: '0 5px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '1.5em',
          color: ['♥', '♦'].includes(card.suit) ? 'red' : 'black',
          backgroundColor: isDealer && index === 0 && gameState === 'playerTurn' ? 'gray' : 'white'
        }}>
          {isDealer && index === 0 && gameState === 'playerTurn' ? '?' : `${card.value}${card.suit}`}
        </Card>
      ))}
    </Box>
  );

  return (
    <Box sx={{ textAlign: 'center', marginTop: '50px' }}>
      <Typography variant="h3" sx={{ marginBottom: '20px' }}>ブラックジャック</Typography>
      <Typography variant="h6">チップ: {playerChips}</Typography>
      {gameState === 'betting' && (
        <Box sx={{ margin: '20px 0' }}>
          <Button onClick={() => placeBet(10)} disabled={playerChips < 10}>ベット 10</Button>
          <Button onClick={() => placeBet(50)} disabled={playerChips < 50}>ベット 50</Button>
          <Button onClick={() => placeBet(100)} disabled={playerChips < 100}>ベット 100</Button>
          <Typography variant="h6">現在のベット: {currentBet}</Typography>
          <Button onClick={dealInitialCards} disabled={currentBet === 0}>ディール</Button>
        </Box>
      )}
      {gameState !== 'betting' && (
        <>
          <Box>
            <Typography variant="h5">ディーラーの手札</Typography>
            {renderHand(dealerHand, true)}
            <Typography variant="body1">合計: {gameState === 'playerTurn' ? '?' : calculateHandValue(dealerHand)}</Typography>
          </Box>
          <Box>
            <Typography variant="h5">プレイヤーの手札</Typography>
            {renderHand(playerHand)}
            <Typography variant="body1">合計: {calculateHandValue(playerHand)}</Typography>
          </Box>
        </>
      )}
      {gameState === 'playerTurn' && (
        <Box sx={{ margin: '20px 0' }}>
          <Button onClick={hit}>ヒット</Button>
          <Button onClick={stand}>スタンド</Button>
        </Box>
      )}
      {gameState === 'gameOver' && (
        <Box sx={{ margin: '20px 0' }}>
          <Typography variant="h5">{result}</Typography>
          <Button onClick={startNewGame}>新しいゲームを始める</Button>
        </Box>
      )}
    </Box>
  );
};

export default BlackjackGame;
ReactDOM.render(
  <React.StrictMode>
    <BlackjackGame />
  </React.StrictMode>,
  document.getElementById('root')
);
