import React from 'react';
import ChessBoard from '../components/ChessBoard';

export default function HomePage() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ChessBoard />
    </div>
  );
}