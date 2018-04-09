import React, { Component } from 'react';

class PictureCanvas extends Component {
  constructor(props) {
    super();

    this.state = {
      picture: props.picture,
      startPos: { x: 0, y: 0 }
    };

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
    this.ctx = canvas.getContext('2d');
  }

  // Fills canvas with a series of squares, aka pixels.
  drawPicture(picture, canvas, scale) {
    for (let y = 0; y < picture.height; y++) {
      for (let x = 0; x < picture.width; x++) {
        this.ctx.fillStyle = picture.pixel(x, y);
        this.ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  mouseDown(downEvent, onDown) {
    if (downEvent.button !== 0) return; // button is always 0 on mousemove - remove?
    let pos = this.pointerPosition(downEvent, this.canvas);

    let move = moveEvent => {
      console.log('moving');
      if (moveEvent.buttons === 0) {
        // remove move event listener on lifting of mouse
        this.canvas.removeEventListener('mousemove', move);
      } else {
        // update mouse pixel position
        let newPos = this.pointerPosition(moveEvent, this.canvas);
        if (newPos.x === pos.x && newPos.y === pos.y) return;

        const newPicture = this.props.draw({
          start: pos,
          current: newPos,
          picture: this.state.picture
        });
        this.setState({ picture: newPicture });
      }
    };
    const newPicture = this.props.draw({
      start: pos,
      current: pos,
      picture: this.state.picture
    });
    this.setState({ startPos: pos, picture: newPicture });

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
      this.drawPicture(this.state.picture, this.canvas, this.scale);
    return (
      <canvas
        ref={node => (this.canvas = node)}
        style={{ border: '1px solid black' }}
        onMouseDown={event => {
          this.mouseDown(event, this.props.draw);
        }}
        onMouseUp={() => {
          this.props.updateEditor(this.state.picture);
        }}
      />
    );
  }
}

export default PictureCanvas;
