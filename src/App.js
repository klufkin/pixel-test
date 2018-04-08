import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Picture from './Picture';
import PictureCanvas from './PictureCanvas';

class App extends Component {
  constructor() {
    super();
    this.state = {
      tool: 'draw',
      color: '#000000',
      picture: Picture.empty(60, 30, '#f0f0f0')
    };

    this.draw = this.draw.bind(this);
  }

  draw(position) {
    const drawPixel = { x: position.x, y: position.y, color: this.state.color };
    this.setState({ picture: this.state.picture.draw([drawPixel]) });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Pixel Editor</h1>
        </header>
        <PictureCanvas picture={this.state.picture} draw={this.draw} />
      </div>
    );
  }
}

export default App;
