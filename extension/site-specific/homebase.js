res = {
  notify: {
    x: 0,
    y: 0
  },
  buttons: {
    'up': {
      down: function () {
        window.moveUp();
      },
      x: 20,
      y: 75,
      icon: 'chevron-up'
    },
    'down': {
      down: function () {
        window.moveDown();
      },
      x: 95,
      y: 75,
      icon: 'chevron-down'
    },
    'left': {
      down: function () {
        window.moveLeft();
      },
      x: 170,
      y: 75,
      icon: 'chevron-left'
    },
    'right': {
      down: function () {
        window.moveRight();
      },
      x: 245,
      y: 75,
      icon: 'chevron-right'
    }
  }
}
