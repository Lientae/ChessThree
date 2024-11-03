import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Cylinder, Sphere, Cone, Box, useGLTF } from '@react-three/drei';
import { Howl } from 'howler'; // Si vous utilisez howler.js
import { GLTF } from 'three-stdlib';

interface PieceType {
  color: 'white' | 'black';
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
}

interface GLTFResult extends GLTF {
  nodes: {
    Pawn: { geometry: THREE.BufferGeometry }; // Typage spécifique à votre modèle
    // Ajoutez d'autres types pour les pièces si nécessaire
  };
  materials: {
    Default: THREE.MeshStandardMaterial; // Typage pour les matériaux
  };
}

useGLTF.preload('/models/pawn.glb');

// Définir le son du mouvement
const moveSound = new Howl({
  src: ['assets/videos/move-self.mp3'], // Assurez-vous que le fichier est dans le bon chemin
  volume: 1, // Réglez le volume selon vos préférences
});

// Définir le son de capture
const captureSound = new Howl({
  src: ['assets/videos/capture.mp3'], // Assurez-vous que le fichier est dans le bon chemin
  volume: 1, // Réglez le volume selon vos préférences
});

const PlayerTurnDisplay = ({ turn }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      backgroundColor: 'white',
      padding: '10px',
      border: '1px solid black',
      borderRadius: '5px',
      zIndex: 1000 // Assurez-vous qu'il reste au-dessus
    }}>
      <h2 style={{ margin: 0, color: 'black' }}>
        {turn.charAt(0).toUpperCase() + turn.slice(1)}'s Turn
      </h2>
    </div>
  );
};

const CaptureTable = ({ captures }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: '10px',
      border: '1px solid black',
      borderRadius: '5px',
      zIndex: 1000 // Assurez-vous qu'il reste au-dessus
    }}>
      <h3 style={{ margin: 0 }}>Captured Pieces</h3>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {captures.white.length > 0 && (
          <div><strong>White:</strong> {captures.white.join(', ')}</div>
        )}
        {captures.black.length > 0 && (
          <div><strong>Black:</strong> {captures.black.join(', ')}</div>
        )}
      </div>
    </div>
  );
};

const Board = ({ boardState, validMoves, onSquareClick }) => {
  const boardSquares = useMemo(() => {
    const squares = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const color = (i + j) % 2 === 0 ? 'white' : 'black';
        const isValidMove = validMoves.some(move => move[0] === j && move[1] === i);
        const squareColor = isValidMove ? 'red' : color; // Mettre en surbrillance les mouvements valides en rouge

        squares.push(
          <mesh
            key={`${i}-${j}`}
            position={[i - 4, 0, j - 4]}
            onClick={() => onSquareClick(i, j)} // Appel du gestionnaire de clic passé
          >
            <boxGeometry args={[1, 0.1, 1]} />
            <meshStandardMaterial color={squareColor} />
          </mesh>
        );
      }
    }
    return squares;
  }, [boardState, validMoves, onSquareClick]);

  return <>{boardSquares}</>;
};

const CustomPiece = ({ type, position }) => {
  const { scene } = useGLTF(`/models/pawn.glb`);

  return <primitive object={scene} position={position} />;
};


const Piece = ({ pieceType, onClick, isSelected }) => {
      const colors = {
        white: 'white',
        black: 'black'
      };
    
      const color = colors[pieceType.color];
      const positionY = isSelected ? 0.7 : 0.2; // Légèrement soulever la pièce quand elle est sélectionnée
    
      // Charger le modèle GLB pour le pion
      const { nodes } = useGLTF('/models/pawn.glb');
    
      const pawnMesh = useMemo(() => {
        return nodes.Cylinder; // Remplacez 'Cylinder' par le nom correct de votre maillage
      }, [nodes]);
    
      return (
        <mesh 
          onClick={onClick} 
          position={[0, positionY, 0]} 
          geometry={pawnMesh.geometry} 
          scale={[0.2, 0.2, 0.2]} // Appliquer un facteur d'échelle
        >
          <meshStandardMaterial color={color} />
        </mesh>
      );
    };
    

const ChessPieces = ({ pieces, onSelectPiece, selectedPiece }) => {
  return (
    <>
      {pieces.map((piece, index) => (
        <mesh
          key={index}
          position={[index % 8 - 4, 0, Math.floor(index / 8) - 4]}
        >
          {piece ? (
            <Piece
              pieceType={piece}
              onClick={() => onSelectPiece(index)}
              isSelected={selectedPiece === index}
            />
          ) : null}
        </mesh>
      ))}
    </>
  );
};

const ChessBoard = () => {
  const [turn, setTurn] = useState('white'); // Suivre de qui c'est le tour
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [captures, setCaptures] = useState({ white: [], black: [] }); // Suivre les pièces capturées

  // Configuration initiale des pièces
  const initialPieces = [
    { type: 'rook', color: 'white' }, { type: 'knight', color: 'white' }, { type: 'bishop', color: 'white' }, { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' }, { type: 'bishop', color: 'white' }, { type: 'knight', color: 'white' }, { type: 'rook', color: 'white' },
    { type: 'pawn', color: 'white' }, { type: 'pawn', color: 'white' }, { type: 'pawn', color: 'white' }, { type: 'pawn', color: 'white' },
    { type: 'pawn', color: 'white' }, { type: 'pawn', color: 'white' }, { type: 'pawn', color: 'white' }, { type: 'pawn', color: 'white' },
    ...Array(32).fill(null), // 16 cases vides
    { type: 'pawn', color: 'black' }, { type: 'pawn', color: 'black' }, { type: 'pawn', color: 'black' }, { type: 'pawn', color: 'black' },
    { type: 'pawn', color: 'black' }, { type: 'pawn', color: 'black' }, { type: 'pawn', color: 'black' }, { type: 'pawn', color: 'black' },
    { type: 'rook', color: 'black' }, { type: 'knight', color: 'black' }, { type: 'bishop', color: 'black' }, { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' }, { type: 'bishop', color: 'black' }, { type: 'knight', color: 'black' }, { type: 'rook', color: 'black' },
  ];

  const [boardState, setBoardState] = useState(
    Array(8).fill(0).map((_, row) => initialPieces.slice(row * 8, row * 8 + 8))
  );

  const [pieces, setPieces] = useState(initialPieces);

  const getValidMoves = (row, col, color) => {
    const validMoves = [];
    console.log(`Selected Piece Row: ${row}, Column: ${col}`);
    const pieceType = pieces[row * 8 + col]?.type; // Récupérer le type de pièce
  
    switch (pieceType) {
      case 'pawn':
        if (color === 'white') {
          // Mouvement du pion blanc
          if (row >= 1 && boardState[row + 1][col] === null) {
            validMoves.push([row + 1, col]);
          } // Déplacement simple
          if (row === 1 && boardState[row + 2][col] === null) validMoves.push([row + 2, col]); // Déplacement double
          if (row > 0 && col < 7 && boardState[row + 1][col + 1]?.color === 'black') {
            validMoves.push([row + 1, col + 1]); // Capture droite
          }
          if (row > 0 && col > 0 && boardState[row + 1][col - 1]?.color === 'black') {
            validMoves.push([row + 1, col - 1]); // Capture gauche
          }
        } else {
          // Mouvement du pion noir
          if (row <= 6 && boardState[row - 1][col] === null) validMoves.push([row - 1, col]); // Déplacement simple
          if (row === 6 && boardState[row - 2][col] === null) validMoves.push([row - 2, col]); // Déplacement double
          if (row < 7 && col < 7 && boardState[row - 1][col + 1]?.color === 'white') {
            validMoves.push([row - 1, col + 1]); // Capture droite
          }
          if (row < 7 && col > 0 && boardState[row + 1][col - 1]?.color === 'white') {
            validMoves.push([row - 1, col - 1]); // Capture gauche
          }
        }
        break;
  
      case 'rook':
        for (let i = row + 1; i < 8; i++) {
          if (boardState[i][col]) {
            if (boardState[i][col].color !== color) validMoves.push([i, col]); // Capture
            break; // Arrêtez si une pièce est rencontrée
          }
          validMoves.push([i, col]);
        }
        for (let i = row - 1; i >= 0; i--) {
          if (boardState[i][col]) {
            if (boardState[i][col].color !== color) validMoves.push([i, col]); // Capture
            break;
          }
          validMoves.push([i, col]);
        }
        for (let j = col + 1; j < 8; j++) {
          if (boardState[row][j]) {
            if (boardState[row][j].color !== color) validMoves.push([row, j]); // Capture
            break;
          }
          validMoves.push([row, j]);
        }
        for (let j = col - 1; j >= 0; j--) {
          if (boardState[row][j]) {
            if (boardState[row][j].color !== color) validMoves.push([row, j]); // Capture
            break;
          }
          validMoves.push([row, j]);
        }
        break;
  
      case 'knight':
        const knightMoves = [
          [row + 2, col + 1], [row + 2, col - 1], [row - 2, col + 1], [row - 2, col - 1],
          [row + 1, col + 2], [row + 1, col - 2], [row - 1, col + 2], [row - 1, col - 2]
        ];
        knightMoves.forEach(([r, c]) => {
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!boardState[r][c] || boardState[r][c].color !== color) {
              validMoves.push([r, c]); // Ajout des mouvements valides
            }
          }
        });
        break;
  
      case 'bishop':
        for (let i = 1; row + i < 8 && col + i < 8; i++) {
          if (boardState[row + i][col + i]) {
            if (boardState[row + i][col + i].color !== color) validMoves.push([row + i, col + i]); // Capture
            break;
          }
          validMoves.push([row + i, col + i]);
        }
        for (let i = 1; row + i < 8 && col - i >= 0; i++) {
          if (boardState[row + i][col - i]) {
            if (boardState[row + i][col - i].color !== color) validMoves.push([row + i, col - i]); // Capture
            break;
          }
          validMoves.push([row + i, col - i]);
        }
        for (let i = 1; row - i >= 0 && col + i < 8; i++) {
          if (boardState[row - i][col + i]) {
            if (boardState[row - i][col + i].color !== color) validMoves.push([row - i, col + i]); // Capture
            break;
          }
          validMoves.push([row - i, col + i]);
        }
        for (let i = 1; row - i >= 0 && col - i >= 0; i++) {
          if (boardState[row - i][col - i]) {
            if (boardState[row - i][col - i].color !== color) validMoves.push([row - i, col - i]); // Capture
            break;
          }
          validMoves.push([row - i, col - i]);
        }
        break;
  
      case 'queen':
        // La reine combine les mouvements de la tour et du fou
        // Ajoutez ici la logique de mouvement de la tour
        for (let i = row + 1; i < 8; i++) {
          if (boardState[i][col]) {
            if (boardState[i][col].color !== color) validMoves.push([i, col]); // Capture
            break; // Arrêtez si une pièce est rencontrée
          }
          validMoves.push([i, col]);
        }
        for (let i = row - 1; i >= 0; i--) {
          if (boardState[i][col]) {
            if (boardState[i][col].color !== color) validMoves.push([i, col]); // Capture
            break;
          }
          validMoves.push([i, col]);
        }
        for (let j = col + 1; j < 8; j++) {
          if (boardState[row][j]) {
            if (boardState[row][j].color !== color) validMoves.push([row, j]); // Capture
            break;
          }
          validMoves.push([row, j]);
        }
        for (let j = col - 1; j >= 0; j--) {
          if (boardState[row][j]) {
            if (boardState[row][j].color !== color) validMoves.push([row, j]); // Capture
            break;
          }
          validMoves.push([row, j]);
        }
  
        // Ajoutez ici la logique de mouvement du fou
        for (let i = 1; row + i < 8 && col + i < 8; i++) {
          if (boardState[row + i][col + i]) {
            if (boardState[row + i][col + i].color !== color) validMoves.push([row + i, col + i]); // Capture
            break;
          }
          validMoves.push([row + i, col + i]);
        }
        for (let i = 1; row + i < 8 && col - i >= 0; i++) {
          if (boardState[row + i][col - i]) {
            if (boardState[row + i][col - i].color !== color) validMoves.push([row + i, col - i]); // Capture
            break;
          }
          validMoves.push([row + i, col - i]);
        }
        for (let i = 1; row - i >= 0 && col + i < 8; i++) {
          if (boardState[row - i][col + i]) {
            if (boardState[row - i][col + i].color !== color) validMoves.push([row - i, col + i]); // Capture
            break;
          }
          validMoves.push([row - i, col + i]);
        }
        for (let i = 1; row - i >= 0 && col - i >= 0; i++) {
          if (boardState[row - i][col - i]) {
            if (boardState[row - i][col - i].color !== color) validMoves.push([row - i, col - i]); // Capture
            break;
          }
          validMoves.push([row - i, col - i]);
        }
        break;
  
      case 'king':
        const kingMoves = [
          [row + 1, col], [row - 1, col], [row, col + 1], [row, col - 1],
          [row + 1, col + 1], [row + 1, col - 1], [row - 1, col + 1], [row - 1, col - 1]
        ];
        kingMoves.forEach(([r, c]) => {
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!boardState[r][c] || boardState[r][c].color !== color) {
              validMoves.push([r, c]); // Ajout des mouvements valides
            }
          }
        });
        break;
  
      default:
        console.log('Unknown piece type');
    }
  
    console.log(`Valid moves for ${color} ${pieceType}:`, validMoves);
    return validMoves.filter(move => move[0] >= 0 && move[0] < 8 && move[1] >= 0 && move[1] < 8);
  };
  // Vérifiez si le roi est en échec et s'il y a des mouvements valides disponibles
  
  const handleSelectPiece = (index) => {
    if (selectedPiece === index) {
      setSelectedPiece(null); // Désélectionner la pièce si elle est déjà sélectionnée
      setValidMoves([]);
    } else {
      const row = Math.floor(index / 8);
      const col = index % 8;
      const selectedPiece = pieces[index];

      if (selectedPiece && selectedPiece.color === turn) {
        setSelectedPiece(index); // Sélectionner la pièce
        const moves = getValidMoves(row, col, selectedPiece.color);
        setValidMoves(moves); // Mettre à jour les mouvements valides
      }
    }
  };

  const handleSquareClick = (i, j) => {
    if (selectedPiece !== null) {
      const originalRow = Math.floor(selectedPiece / 8);
      const originalCol = selectedPiece % 8;
      const selectedPieceType = pieces[selectedPiece];

      // Vérifier si le mouvement est valide
      const isValidMove = validMoves.some(move => move[0] === j && move[1] === i);

      // Debugging output
      console.log(`Trying to move piece from [${originalRow}, ${originalCol}] to [${i}, ${j}]`);
      console.log(`Is valid move: ${isValidMove}`);

      if (isValidMove) {
        // Créer une copie de l'état du plateau
        const newBoardState = [...boardState];

        // Vérifier si une capture a eu lieu
        const targetPiece = newBoardState[j][i];
        const isCapture = targetPiece !== null;

        // Placer la pièce dans la nouvelle position
        newBoardState[j][i] = selectedPieceType; 
        // Effacer la position originale
        newBoardState[originalRow][originalCol] = null;

        // Mettre à jour le tableau de pièces pour refléter le mouvement
        const newPieces = [...pieces];
        newPieces[j * 8 + i] = selectedPieceType; // Mettre la pièce dans la nouvelle position
        newPieces[selectedPiece] = null; // Retirer de l'ancienne position

        // Jouer le son de capture si une capture a eu lieu
        if (isCapture) {
          captureSound.play();
        }
        else {
          moveSound.play();
        }

        // Mettre à jour l'état
        setPieces(newPieces);
        setBoardState(newBoardState); // Mettre à jour l'état du plateau

        // Réinitialiser la sélection et les mouvements valides
        setSelectedPiece(null);
        setValidMoves([]);

        // Changer de tour
        setTurn(turn === 'white' ? 'black' : 'white');
      }
    }
  };

  return (
    <>
      <Canvas style={{ height: '100vh' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <spotLight position={[0, 10, 0]} angle={0.15} penumbra={1} intensity={0.5} castShadow />
        <OrbitControls enableZoom={true} minDistance={5} maxDistance={15} />
        <Board boardState={boardState} validMoves={validMoves} onSquareClick={handleSquareClick} />
        <ChessPieces pieces={pieces} onSelectPiece={handleSelectPiece} selectedPiece={selectedPiece} />
      </Canvas>
      <PlayerTurnDisplay turn={turn} /> {/* Affichage du tour du joueur */}
      <CaptureTable captures={captures} />
    </>
  );
};

export default ChessBoard;
