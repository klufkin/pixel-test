import React, { Component } from 'react';

class PictureCanvas extends Component {
  constructor(props) {
    super();
    // determines the scale of the pixel
    // pixel is drawn as a 10x10 square
    this.scale = 10;

    this.mouseDown = this.mouseDown.bind(this);
  }

  componentDidMount() {
    this.setPicture(this.props.picture, this.canvas, this.scale);
    this.drawPicture(this.props.picture, this.canvas, this.scale);
  }

  // sets the size of the canvas based on the scale and picture size,
  setPicture(picture, canvas, scale) {
    canvas.width = picture.width * scale;
    canvas.height = picture.height * scale;
    this.cx = canvas.getContext('2d');
  }

  // Fills canvas with a series of squares, aka pixels.
  drawPicture(picture, canvas, scale) {
    for (let y = 0; y < picture.height; y++) {
      for (let x = 0; x < picture.width; x++) {
        this.cx.fillStyle = picture.pixel(x, y);
        this.cx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  mouseDown(downEvent) {
    if (downEvent.button !== 0) return; // button is always 0 on mousemove - remove?
    let pos = this.pointerPosition(downEvent, this.canvas);
    let move = moveEvent => {
      if (moveEvent.buttons === 0) {
        // remove move event listener on lifting of mouse
        this.canvas.removeEventListener('mousemove', move);
      } else {
        // update mouse pixel position
        let newPos = this.pointerPosition(moveEvent, this.canvas);
        if (newPos.x === pos.x && newPos.y === pos.y) return;
        pos = newPos;
        this.props.draw(pos);
      }
    };

    this.props.draw(pos);
    this.canvas.addEventListener('mousemove', move);
  }

  // Returns the mouse pixel position,
  // calculated based on canvas' x,y position, mouse position, and pixel scale
  pointerPosition(pos, domNode) {
    let rect = domNode.getBoundingClientRect();
    return {
      x: Math.floor((pos.clientX - rect.left) / this.scale),
      y: Math.floor((pos.clientY - rect.top) / this.scale)
    };
  }

  render() {
    if (this.canvas)
      this.drawPicture(this.props.picture, this.canvas, this.scale);
    return (
      <canvas
        ref={node => (this.canvas = node)}
        style={{ border: '1px solid black' }}
        onMouseDown={this.mouseDown}
      />
    );
  }
}

export default PictureCanvas;
