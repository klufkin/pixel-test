import React, { Component } from 'react';
import './App.css';

import Picture from './Picture';
import PictureCanvas from './PictureCanvas';

class App extends Component {
  constructor() {
    super();
    this.state = {
      tool: 'draw',
      color: '#000000',
      picture: Picture.empty(60, 30, '#f0f0f0'),
      history: [],
      saveHistoryTime: 0
    };

    this.draw = this.draw.bind(this);
    this.rectangle = this.rectangle.bind(this);
    this.fill = this.fill.bind(this);
    this.colorPicker = this.colorPicker.bind(this);
    this.updatePicture = this.updatePicture.bind(this);
    this.changeTool = this.changeTool.bind(this);
    this.savePicture = this.savePicture.bind(this);
    this.undo = this.undo.bind(this);
    this.saveHistory = this.saveHistory.bind(this);
  }

  draw({ current, picture }) {
    const pixel = { x: current.x, y: current.y, color: this.state.color };
    return picture.draw([pixel]);
  }

  rectangle({ start, current }) {
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

  fill({ start }) {
    const { picture, color } = this.state;

    // Pixel look around
    const lookAround = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 }
    ];

    // pixel color to change
    const targetColor = picture.pixel(start.x, start.y);
    let fillSpace = [{ x: start.x, y: start.y, color: color }];

    for (let i = 0; i < fillSpace.length; i++) {
      for (let { dx, dy } of lookAround) {
        const x = fillSpace[i].x + dx;
        const y = fillSpace[i].y + dy;
        const withinCanvas =
          x >= 0 && x < picture.width && y >= 0 && y < picture.height;
        // check if pixel has already been added to fill space
        const pixelFound = fillSpace.some(
          pixel => pixel.x === x && pixel.y === y
        );

        if (
          withinCanvas &&
          picture.pixel(x, y) === targetColor &&
          !pixelFound
        ) {
          fillSpace.push({ x, y, color: color });
        }
      }
    }

    return picture.draw(fillSpace);
  }

  colorPicker({ current }) {
    this.setState({ color: this.state.picture.pixel(current.x, current.y) });
    return this.state.picture;
  }

  updatePicture(picture) {
    this.setState({ picture });
  }

  changeTool(tool) {
    this.setState({ tool });
  }

  savePicture() {
    const link = document.createElement('a');

    Object.assign(link, {
      href: this.picture.canvas.toDataURL(),
      download: 'pixelart.png'
    });

    // Create and trigger dowload link
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  undo() {
    if (this.state.history.length === 0) return;
    console.log(this.state.history, this.state.history.slice(1));

    this.setState({
      picture: this.state.history[0],
      history: this.state.history.slice(1),
      saveHistoryTime: 0
    });
  }

  saveHistory(picture) {
    if (this.state.saveHistoryTime < Date.now() - 1000) {
      console.log('save history');
      this.setState({
        history: [this.state.picture, ...this.state.history],
        saveHistoryTime: Date.now()
      });
    }
  }

  render() {
    const tools = {
      draw: this.draw,
      rectangle: this.rectangle,
      fill: this.fill,
      colorPicker: this.colorPicker
    };

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Pixel Editor</h1>
        </header>

        <div className="pixel-editor">
          <PictureCanvas
            picture={this.state.picture}
            saveHistory={this.saveHistory}
            draw={tools[this.state.tool]}
            updateEditor={this.updatePicture}
            ref={node => (this.picture = node)}
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
                <option value="fill">Fill</option>
                <option value="colorPicker">Color Picker</option>
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

            <button onClick={this.undo}>Undo</button>

            <button onClick={this.savePicture}>
              <span role="img" aria-label="Save">
                💾
              </span>{' '}
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
