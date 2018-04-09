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
    this.rectangle = this.rectangle.bind(this);
    this.updatePicture = this.updatePicture.bind(this);
    this.changeTool = this.changeTool.bind(this);
  }

  draw({ current, picture }) {
    const pixel = { x: current.x, y: current.y, color: this.state.color };
    return picture.draw([pixel]);
  }

  rectangle({ start, current, picture }) {
    let xStart = Math.min(start.x, current.x);
    let yStart = Math.min(start.y, current.y);
    let xEnd = Math.max(start.x, current.x);
    let yEnd = Math.max(start.y, current.y);
    let drawnRectangle = [];

    for (let y = yStart; y <= yEnd; y++) {
      for (let x = xStart; x <= xEnd; x++) {
        drawnRectangle.push({ x, y, color: this.state.color });
      }
    }

    return this.state.picture.draw(drawnRectangle);
  }

  updatePicture(picture) {
    this.setState({ picture });
  }

  changeTool(tool) {
    this.setState({ tool });
  }

  render() {
    const tools = { draw: this.draw, rectangle: this.rectangle };

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Pixel Editor</h1>
        </header>

        <div className="pixel-editor">
          <PictureCanvas
            picture={this.state.picture}
            draw={tools[this.state.tool]}
            updateEditor={this.updatePicture}
          />

          <div className="settings">
            <label>
              <span role="img" aria-label="Tool">
                🖌
              </span>Tool:{' '}
              <select
                value={this.state.tool}
                onChange={e => {
                  console.log(e.target.value);
                  this.changeTool(e.target.value);
                }}
              >
                <option value="draw">Draw</option>
                <option value="rectangle">Rectangle</option>
              </select>
            </label>

            <label>
              <span role="img" aria-label="Pixel Color">
                🎨
              </span>Color:{' '}
              <input
                type="color"
                value={this.state.color}
                onChange={e => {
                  this.setState({ color: e.target.value });
                }}
              />
            </label>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
