import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const value = props.visible ? props.value : '';
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
  // Create Grid
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
  // Count Bombs Around the Cell
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

class Game extends React.Component {
  constructor(props) {
    const row = 9;
    const col = 9;
    const bombCount = 10;
    super(props);
    this.state = {
      isGameOver: false,
      row: row,
      col: col,
      bombCount: bombCount,
      squares: Array(row).fill(0),
      visible: Array(row).fill(null),
    }
    const board = generateBoard(this.state.squares, this.state.visible, row, col, bombCount);
    this.state.squares = board[0];
    this.state.visible = board[1];
  }

  searchEmptyCell(i, j) {
    const row = this.state.row;
    const col = this.state.col;
    const dx = [1, 1, 1, 0, 0, -1, -1, -1];
    const dy = [1, 0, -1, 1, -1, 1, 0, -1];
    const squares = this.state.squares;
    const visible = this.state.visible;

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
          this.searchEmptyCell(nx, ny);
        }
        else {
          visible[nx][ny] = true;
          this.setState({ visible: visible });
        }
      }
    }
  }

  handleClick(i, j) {
    const squares = this.state.squares.slice();
    const visible = this.state.visible.slice();

    // 爆弾を押しちゃった
    if (squares[i][j] === -1) {
      this.setState({ isGameOver: true });
    }
    // ゲームオーバーだったら何もしない
    if (this.state.isGameOver) {
      return;
    }
    // 見えてるところをクリックしても何も起きない
    if (visible[i][j]) {
      return;
    }
    // カウントが0なら、周りをみえるようにする
    if (squares[i][j] === 0) {
      this.searchEmptyCell(i, j);
    }
    visible[i][j] = true;
    this.setState({
      squares: squares,
      visible: visible,
    })
  }

  resetGame() {
    const squares = new Array(this.state.row).fill(0);
    const visible = new Array(this.state.row).fill(null);
    const board = generateBoard(squares, visible, this.state.row, this.state.col, this.state.bombCount);

    this.setState({
      isGameOver : false,
      squares : board[0],
      visible : board[1],
    });
  }

  render() {
    let status = '';
    let reset = '';

    if (this.state.isGameOver) {
      status = "GAME OVER";
      reset = <button onClick={() => this.resetGame()}>{"Restart Game"}</button>;
    }

    return (
      <div className="game">
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
