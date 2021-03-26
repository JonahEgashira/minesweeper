import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    const row = props.row;
    const col = props.col;
    this.state = {
      squares: new Array(row).fill(0),
    }
    // Create Grid
    for (let i = 0; i < row; i++) {
      this.state.squares[i] = new Array(col).fill(0);
    }
    
    // Place Bombs
    let bombLeft = props.bombCount;
    while (bombLeft > 0) {
      const row_index = Math.floor(Math.random() * row);
      const col_index = Math.floor(Math.random() * col);

      if (this.state.squares[row_index][col_index] === 0) {
        this.state.squares[row_index][col_index] = -1;
        bombLeft--;
      }
    }
    // Count Bombs Around the Cell
    const dx = [1,1,1,0,0,-1,-1,-1];
    const dy = [1,0,-1,1,-1,1,0,-1];

    let squares = this.state.squares;
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        if (squares[i][j] === -1) continue;
        for (let k = 0; k < dx.length; k++) {
          const nx = i+dx[k];
          const ny = j+dy[k];
          if (0 <= nx && nx < row && 0 <= ny && ny < col) {
            if (squares[nx][ny] === -1) {
              squares[i][j]++;
            }
          }
        }
      }
    }
    this.setState({
      squares: squares,
    })
  }

  handleClick(i, j) {
    const squares = this.state.squares.slice();
    squares[i][j] = 2;
    this.setState({
      squares: squares,
    })
  }

  renderSquare(i, j) {
    return <Square
      value={this.state.squares[i][j]}
      onClick={() => this.handleClick(i, j)} />;
  }

  render() {
    return (
      <div>
        {this.state.squares.map((items, i) => {
          return (
            <div className="board-row" key={i}>
              {items.map((_, j) => {
                return (
                  <span key={i*this.props.row+j}>
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

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      row: 9,
      col: 9,
      bombCount: 10,
    }
  }

  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board 
            row={this.state.row}
            col={this.state.col}
            bombCount={this.state.bombCount}
          />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
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
