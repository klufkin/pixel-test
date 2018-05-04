import React, { Component } from 'react';

class PictureCanvas extends Component {
  constructor(props) {
    super();

    this.state = {
      startPos: { x: 0, y: 0 },
      lastPos: { x: 0, y: 0 }
    };

    // determines the scale of the pixel
    // pixel is drawn as a 10x10 square
    this.scale = 10;
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseMove = this.mouseMove.bind(this);

    this.savePicture = () => {
      this.props.updateEditor();
      console.log('remove mouse up');
      document.removeEventListener('mouseup', this.savePicture);
    };
  }

  componentDidMount() {
    this.setPicture(this.props.canvasState, this.canvas, this.scale);
    this.drawPicture(this.props.canvasState, this.canvas, this.scale);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.savePicture);
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

  mouseMove(moveEvent) {
    if (moveEvent.buttons === 0) {
      // remove move event listener on lifting of mouse
      this.canvas.removeEventListener('mousemove', this.mouseMove);
    } else {
      const pos = this.state.startPos;
      // update mouse pixel position
      let newPos = this.pointerPosition(moveEvent, this.canvas);
      if (newPos.x === pos.x && newPos.y === pos.y) return;

      this.props.draw({
        start: pos,
        lastPos: this.state.lastPos,
        current: newPos
      });
      this.setState({ lastPos: newPos });
    }
  }

  mouseDown(downEvent, onDown) {
    // save canvas state - to allow for undoing
    this.props.saveHistory();

    document.addEventListener('mouseup', this.savePicture);

    if (downEvent.button !== 0) return; // button is always 0 on mousemove - remove?
    let pos = this.pointerPosition(downEvent, this.canvas);

    this.props.draw({
      start: pos,
      lastPos: pos,
      current: pos
    });
    this.setState({ startPos: pos, lastPos: pos });

    this.canvas.addEventListener('mousemove', this.mouseMove);
  }

  // Returns the mouse pixel position,
  // calculated based on canvas' x,y position, mouse position, and pixel scale
  pointerPosition(pos, domNode) {
    const { left, top } = domNode.getBoundingClientRect();
    const calcX = Math.floor((pos.clientX - left) / this.scale);
    const calcY = Math.floor((pos.clientY - top) / this.scale);

    // ternary operator to handle fractional boundingClientRect properties
    // used to prevent negative indices
    return {
      x: calcX > 0 ? calcX : 0,
      y: calcY > 0 ? calcY : 0
    };
  }

  render() {
    if (this.canvas)
      this.drawPicture(this.props.canvasState, this.canvas, this.scale);

    return (
      <canvas
        ref={node => (this.canvas = node)}
        onMouseDown={event => {
          console.log('mouse down');
          this.mouseDown(event, this.props.draw);
        }}
      />
    );
  }
}

export default PictureCanvas;
