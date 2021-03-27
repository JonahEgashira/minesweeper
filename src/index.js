import React from 'react';
import ReactDOM from 'react-dom';
import "bulma/css/bulma.css";
import './index.css';

function Square(props) {
  let value = props.visible ? props.value : '';
  if (value === -1) value = '☀';
  return (
    <button className="square" onClick={props.onClick}>
      {value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, j) {
    return <Square
      value={this.props.squares[i][j]}
      visible={this.props.visible[i][j]}
      onClick={() => this.props.onClick(i, j)} />;
  }
  render() {
    return (
      <div>
        {this.props.squares.map((items, i) => {
          return (
            <div className="board-row" key={i}>
              {items.map((_, j) => {
                return (
                  <span key={i * this.props.row + j}>
                    {this.renderSquare(i, j)}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
}

function generateBoard(squares, visible, row, col, bombCount) {
  // Make Grid Two Dimentional
  for (let i = 0; i < row; i++) {
    squares[i] = new Array(col).fill(0);
    visible[i] = new Array(col).fill(null);
  }

  // Place Bombs
  let bombLeft = bombCount;
  while (bombLeft > 0) {
    const row_index = Math.floor(Math.random() * row);
    const col_index = Math.floor(Math.random() * col);

    if (squares[row_index][col_index] === 0) {
      squares[row_index][col_index] = -1;
      bombLeft--;
    }
  }

  // Count Bombs 
  const dx = [1, 1, 1, 0, 0, -1, -1, -1];
  const dy = [1, 0, -1, 1, -1, 1, 0, -1];

  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      if (squares[i][j] === -1) continue;
      for (let k = 0; k < dx.length; k++) {
        const nx = i + dx[k];
        const ny = j + dy[k];
        if (0 <= nx && nx < row && 0 <= ny && ny < col) {
          if (squares[nx][ny] === -1) {
            squares[i][j]++;
          }
        }
      }
    }
  }
  return [squares, visible];
}

function Header() {
  return (
    <header className="hero is-dark is-bold">
      <div className="hero-body">
        <div className="container">
          <h1 className="title">MineSweeper</h1>
        </div>
      </div>
    </header>
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    const row = 9;
    const col = 9;
    const bombCount = 5;
    this.state = {
      isGameOver: false,
      isGameCleared: false,
      row: row,
      col: col,
      bombCount: bombCount,
      revealedCount: 0,
      squares: Array(row).fill(0),
      visible: Array(row).fill(null),
    }
    const board = generateBoard(this.state.squares, this.state.visible, row, col, bombCount);
    this.state.squares = board[0];
    this.state.visible = board[1];
  }

  searchEmptyCell(i, j, squares, visible) {
    const row = this.state.row;
    const col = this.state.col;
    const dx = [1, 1, 1, 0, 0, -1, -1, -1];
    const dy = [1, 0, -1, 1, -1, 1, 0, -1];

    if (visible[i][j]) return;
    visible[i][j] = true;

    for (let k = 0; k < dx.length; k++) {
      const nx = i + dx[k];
      const ny = j + dy[k];
      if (0 <= nx && nx < row && 0 <= ny && ny < col) {
        if (squares[nx][ny] === -1) {
          return;
        }
        this.setState({ visible: visible });
        if (squares[nx][ny] === 0) {
          this.searchEmptyCell(nx, ny, squares, visible);
        }
        else {
          visible[nx][ny] = true;
          this.setState({ visible: visible });
        }
      }
    }
  }

  revealAllCells(visible) {
    for (let i = 0; i < this.state.row; i++) {
      for (let j = 0; j < this.state.col; j++) {
        visible[i][j] = true;
      }
    }
    this.setState({
      visible : visible,
    })
  }

  countRevealed(visible) {
    let count = 0;
    for (let i = 0; i < this.state.row; i++) {
      for (let j = 0; j < this.state.col; j++) {
        if (visible[i][j]) count++;
      }
    }
    let cleared = false;
    if (count === this.state.row * this.state.col - this.state.bombCount) {
      cleared = true;
    }
    if (cleared) {
      this.revealAllCells(visible)
    }
    this.setState({
      revealedCount: count,
      isGameCleared: cleared,
    });
  }


  handleClick(i, j) {
    const squares = this.state.squares.slice();
    const visible = this.state.visible.slice();

    if (this.state.isGameOver || this.state.isGameCleared) {
      return;
    }
    // Clicked on Bomb
    if (squares[i][j] === -1) {
      this.revealAllCells(visible);
      this.setState({ isGameOver: true });
    }
    // Do nothing when game is over
    if (visible[i][j]) {
      return;
    }
    // show adjacent cells
    if (squares[i][j] === 0) {
      this.searchEmptyCell(i, j, squares, visible);
    } else {
      visible[i][j] = true;
      this.setState({
        visible: visible,
      })
    }
    this.countRevealed(this.state.visible);
  }

  resetGame() {
    const squares = new Array(this.state.row).fill(0);
    const visible = new Array(this.state.row).fill(null);
    const board = generateBoard(squares, visible, this.state.row, this.state.col, this.state.bombCount);
    this.setState({
      isGameOver: false,
      isGameCleared: false,
      revealedCount: 0,
      squares: board[0],
      visible: board[1],
    });
  }

  render() {
    let status = '';
    let reset = '';

    if (this.state.isGameOver || this.state.isGameCleared) {
      status = this.state.isGameOver ? "GAME OVER" : "GAME CLEARED";
      reset = <button onClick={() => this.resetGame()}>{"Restart Game"}</button>;
    }

    return (
      <div>
        <Header />
        <div className="game container">
          <div className="game-board">
            <Board
              squares={this.state.squares}
              visible={this.state.visible}
              row={this.state.row}
              col={this.state.col}
              onClick={(i, j) => this.handleClick(i, j)}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            {reset}
            <div> Opened Cells : {this.state.revealedCount}</div>
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
