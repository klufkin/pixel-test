import React, { Component } from 'react';
import './App.css';

import Picture from './Picture';
import PictureCanvas from './PictureCanvas';
import Trig from './trig';

let irender = 0;

class App extends Component {
  constructor() {
    super();
    this.state = {
      tool: 'draw',
      color: '#000000',
      picture: Picture.empty(60, 30, '#f0f0f0'),
      canvasState: Picture.empty(60, 30, '#f0f0f0'),
      history: []
    };

    this.draw = this.draw.bind(this);
    this.rectangle = this.rectangle.bind(this);
    this.fill = this.fill.bind(this);
    this.colorPicker = this.colorPicker.bind(this);
    this.updatePicture = this.updatePicture.bind(this);
    this.changeTool = this.changeTool.bind(this);
    this.savePicture = this.savePicture.bind(this);
    this.loadImage = this.loadImage.bind(this);
    this.pictureFromImage = this.pictureFromImage.bind(this);
    this.undo = this.undo.bind(this);
    this.saveHistory = this.saveHistory.bind(this);
  }

  draw({ lastPos, current }) {
    const distance = Trig.distanceBetween2Points(lastPos, current);
    const angle = Trig.angleBetween2Points(lastPos, current);

    // Draws a contiguous line of pixels
    // between the last position and the current position regardless of mouse movement speed
    let canvas = this.state.canvasState;
    for (let z = 0; z <= distance; z++) {
      const x = Math.floor(lastPos.x + Math.sin(angle) * z);
      const y = Math.floor(lastPos.y + Math.cos(angle) * z);
      const pixel = { x, y, color: this.state.color };
      canvas = canvas.draw([pixel]);
    }

    this.setState({ canvasState: canvas });
  }

  rectangle({ start, current }) {
    const { color, picture } = this.state;

    let xStart = Math.min(start.x, current.x);
    let yStart = Math.min(start.y, current.y);
    let xEnd = Math.max(start.x, current.x);
    let yEnd = Math.max(start.y, current.y);
    let drawnRectangle = [];

    for (let y = yStart; y <= yEnd; y++) {
      for (let x = xStart; x <= xEnd; x++) {
        drawnRectangle.push({ x, y, color: color });
      }
    }

    this.setState({ canvasState: picture.draw(drawnRectangle) });
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

    this.setState({ canvasState: picture.draw(fillSpace) });
  }

  colorPicker({ current }) {
    this.setState({ color: this.state.picture.pixel(current.x, current.y) });
  }

  updatePicture() {
    this.setState({ picture: this.state.canvasState });
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

  loadImage() {
    console.log('load image click');
    const loadInput = document.createElement('input');
    loadInput.setAttribute('type', 'file');

    loadInput.addEventListener('change', e => {
      const file = e.target.files[0];
      console.log(file);
      if (!file) return;

      // create file reader to get access to file's contents
      const reader = new FileReader();

      // trigger once file has completed loading
      reader.addEventListener('load', () => {
        console.log('reader loaded');
        // File reader gives us a data URL, use this to create an image so we can gather pixel data
        const image = document.createElement('img');
        image.onload = () => {
          console.log('on loaaad');
          const pixels = this.pictureFromImage(image);
          this.setState({ picture: pixels, canvasState: pixels });
        };
        image.setAttribute('src', reader.result);
      });
      // NOTE: weird performance issue occuring after load
      // read file data
      reader.readAsDataURL(file);
      loadInput.remove();
    });

    // Trigger file loader, and clean up DOM
    document.body.appendChild(loadInput);
    loadInput.click();
  }

  pictureFromImage(image) {
    let width = image.width;
    let height = image.height;
    let canvas = document.createElement('canvas');
    canvas.height = height;
    canvas.width = width;

    let cx = canvas.getContext('2d');
    cx.drawImage(image, 0, 0, width, height);

    let pixels = [];
    let { data } = cx.getImageData(0, 0, width, height);

    function hex(n) {
      return n.toString(16).padStart(2, '0');
    }
    // !! need to pull out scale factor -- V --
    for (let i = 0; i < data.length; i += 40) {
      let [r, g, b] = data.slice(i, i + 3);
      pixels.push('#' + hex(r) + hex(g) + hex(b));
    }
    console.log(pixels);
    return new Picture(width, height, pixels);
  }

  undo() {
    if (this.state.history.length === 0) return;

    this.setState({
      picture: this.state.history[0],
      canvasState: this.state.history[0],
      history: this.state.history.slice(1)
    });
  }

  saveHistory() {
    this.setState({
      history: [this.state.canvasState, ...this.state.history]
    });
  }

  render() {
    const tools = {
      draw: this.draw,
      rectangle: this.rectangle,
      fill: this.fill,
      colorPicker: this.colorPicker
    };
    console.log(irender);
    irender++;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Pixel Editor</h1>
        </header>

        <div className="pixel-editor">
          <PictureCanvas
            canvasState={this.state.canvasState}
            draw={tools[this.state.tool]}
            saveHistory={this.saveHistory}
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

            <button onClick={this.undo}>
              <span role="img" aria-label="Undo">
                ⏪
              </span>{' '}
              Undo
            </button>

            <button onClick={this.savePicture}>
              <span role="img" aria-label="Save">
                💾
              </span>{' '}
              Save
            </button>

            <button onClick={this.loadImage}>
              <span role="img" aria-label="Load">
                📁
              </span>{' '}
              Load
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
