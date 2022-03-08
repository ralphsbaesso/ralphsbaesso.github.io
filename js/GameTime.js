function GameTime(canvasId = null, options = {}) {
  // eslint-disable-next-line no-unused-vars
  const _options = options

  const canvas = canvasId ? document.getElementById(canvasId) : document.querySelector('canvas')
  const _ctx = canvas.getContext("2d");
  const _events = ['keydown', 'keyup', 'click']
  const _games = []
  // const _images = []

  this.games = _games

  this.ctx = _ctx

  this.width = 700
  this.height = 450

  _ctx.canvas.width  = 700
  _ctx.canvas.height = 450

  _events.forEach(eventName => {
    document.addEventListener(eventName, event => {
      callEvents(eventName, event)
    })
  })

  this.loop = () => {
    window.requestAnimationFrame(this.loop)
    if (this.beforeLoop())
      return

    drawBackground()
    update()
    draw()
    this.afterLoop()
  }
  this.loopDebugger = (time) => {
    time ||= 300
    setInterval(() => {
      if (this.beforeLoop())
        return

      drawBackground()
      update()
      draw()
      this.afterLoop()
    }, time)
  }

  this.beforeLoop = () => {}
  this.afterLoop = () => {}

  GameTime.time = 0
  setInterval(() =>  GameTime.time += 10, 10)

  this.addRect = (object) => _games.push(new Game(object))
  this.addImage = (object) => _games.push(new GameImage(object))
  this.addElement = (element) => _games.push(element)


  this.removeElement = (element, callback) => {
    const index = _games.findIndex(g => g === element)
    _games.splice(index, 1)

    if (callback)
      callback()
  }

  this.removeAllElement = () => {
    this.games.splice(0, this.games.length)
  }

  const update = () => _games.forEach(game => game.update())
  const draw = () => _games.forEach(game => game.draw(_ctx))

  const grd = _ctx.createLinearGradient(0, 0, 0, this.height);
  grd.addColorStop(0, '#c0c5c5');
  grd.addColorStop(1, '#2c3e50');
  const drawBackground = () => {
    _ctx.fillStyle = grd
    _ctx.fillRect(0, 0, _ctx.canvas.width, _ctx.canvas.width);
  }

  const callEvents = (eventName, event) => {
    _games.forEach(game => {
      if (typeof game[eventName] === 'function')
        game[eventName](event)
    })
  }

  const startGame = new Date()

  this.getTime = () => {
    const date = new Date()

    return {
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      data: date,
      startGame,
      diff: (pDate) => date.getTime() - pDate.getTime()
    }
  }

  function Attributes(attributes) {
    this.attributes = {
      axisX: 0,
      axisY: 0,
      directX: 0,
      directY: 0,
      width: 100,
      height: 100,
      color: '',
      velocity: 1
    }

    const methods = Object.keys(this.attributes)
    methods.forEach(key =>{
      Object.defineProperties(this, {
        [key]: {
          get: () => this.attributes[key],
          set: (value) => this.attributes[key] = value
        }
      })
    })

    Object.entries(attributes).forEach(([key, value]) => {
      if (value === 0 || value) this[key] = value
    })
  }

  function BaseMove(move) {
    this.moveTo = () => ({ x: this.directX, y: this.directY })
    this.keydown = (e) => move(e.keyCode, true)
    this.keyup = (e) => move(e.keyCode)
  }

// eslint-disable-next-line no-unused-vars
  function MoveAxis() {
    const move = (keyCode, keydown) => {
      const negative = keydown ? -1 : 0
      const positive = keydown ? 1 : 0

      if (keyCode === 37) // left
        this.directX = negative
      else if (keyCode === 38) // up
        this.directY = negative
      else if (keyCode === 39) // right
        this.directX = positive
      else if (keyCode === 40) // down
        this.directY = positive
    }

    BaseMove.call(this, move)
  }

// eslint-disable-next-line no-unused-vars
  function MoveAxisY() {
    const move = (keyCode, keydown) => {
      const negative = keydown ? -1 : 0
      const positive = keydown ? 1 : 0

      if (keyCode === 38) // up
        this.directY = negative
      else if (keyCode === 40) // down
        this.directY = positive
    }

    BaseMove.call(this, move)
  }

// eslint-disable-next-line no-unused-vars
  function MoveAxisX() {
    const move = (keyCode, keydown) => {
      const negative = keydown ? -1 : 0
      const positive = keydown ? 1 : 0

      if (keyCode === 37) // left
        this.directX = negative
      else if (keyCode === 39) // right
        this.directX = positive
    }

    BaseMove.call(this, move)
  }

  function Game(options = {}) {
    Attributes.call(this, options)
    MoveAxis.call(this)

    this.update =() => {
      this.axisX += this.velocity * this.directX
      limitAxisX()
      this.axisY += this.velocity * this.directY
      limitAxisY()
    }

    this.draw = (ctx) => {
      ctx.fillStyle = this.color
      ctx.fillRect(this.axisX, this.axisY, this.width, this.height)
    }

    const limitAxisX = () => {
      if (this.axisX < 0)
        this.axisX = 0
      else if ((this.axisX + this.width) > GameTime.width)
        this.axisX = GameTime.width - this.width
    }

    const limitAxisY = () => {
      if (this.axisY < 0)
        this.axisY = 0
      else if ((this.axisY + this.height) > GameTime.height)
        this.axisY = GameTime.height - this.height
    }
  }

  function GameImage(options) {
    Game.call(this, options)
    const objectImage = new Image()
    objectImage.src = options.image

    this.draw = (ctx) => {
      ctx.drawImage(objectImage, this.axisX, this.axisY, this.width, this.height)
    }
  }

  // Limit
  GameTime.width = this.width
  GameTime.height = this.height
  GameTime.Attributes = Attributes
  GameTime.MoveAxis = MoveAxis
  GameTime.MoveAxisX = MoveAxisX
  GameTime.MoveAxisY = MoveAxisY
  GameTime.MoveAxisY = MoveAxisY
  GameTime.BaseMove = BaseMove
}

