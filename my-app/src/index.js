import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={props.isWinner ? "square winner-square" : "square"} onClick={() => props.onClick()}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        isWinner={this.props.winners? this.props.winners.includes(i) : false}
        key={i}
      />);
  }

  renderSquareRow(rowIndex) {
    let row = [];
    for (let i = rowIndex; i < rowIndex + 3; i++) {
      row.push(this.renderSquare(i));
    }

    return (
      <div className="board-row" key={Math.random() * 30}>
        {row}
      </div>
    );
  }

  render() {
    let rows = [];

    for (let i = 0; i < 3; i++) {
      rows.push(this.renderSquareRow(i * 3));
    }

    return (
      <div>
        {rows}
      </div>
    );
  }

}

class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date()
    };
  }

  componentDidMount() {
    this.timeID = setInterval(() => {
      this.tick()
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timeID);
  }

  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (
      <div>
        <h1>Clock is ticking.</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}</h2>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.handleToggleMoveOrder = this.handleToggleMoveOrder.bind(this);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        location: '(col, row)',
      }],
      xIsNext: true,
      stepNumber: 0,
      isAscending: true,
    };

  }

  handleToggleMoveOrder() {
    this.setState({
      isAscending: !this.state.isAscending
    });
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        location: '(' + (i % 3 + 1) + ', ' + (Math.floor(i / 3) + 1) + ')',
      }]),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerInfo = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' at ' + step.location :
        'Go to game start';
      if (move === this.state.stepNumber) {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}><b>{desc}</b></button>
          </li>
        );
      } else {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        );
      }
    });
    if (!this.state.isAscending) {
      moves.reverse();
    }

    let status;
    if (winnerInfo) {
      status = 'Winner: ' + winnerInfo.winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }


    return (
      <div className="game">
        <Clock />
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winners={winnerInfo ? winnerInfo.winSquaresIndex  : null}
          />
        </div>
        <div className="game-info">
          <button onClick={this.handleToggleMoveOrder}>{this.state.isAscending? 'Descending' : 'Ascending'}</button>
          <div>{status}</div>
          <ol>{moves}</ol>
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


function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winSquaresIndex: [a, b, c] 
      };
    }
  }
  return null;
}