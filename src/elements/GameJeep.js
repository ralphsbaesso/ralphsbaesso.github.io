import GameTime from '@/elements/GameTime'

export default function GameJeep(canvasId, options) {
  GameTime.call(this, canvasId, options)
  const engineer = this
  const jeepImage = options.jeepImage
  const FLOOR = 425

  const gameStatus = {
    status: 'stop',
    action: ''
  }

  const hits = {
    monsters: 0,
    bombs: 0,
    bullets: 0
  }

  const arraySize = 5
  let lastSecond = 0

  const arrayMod = [2, 2, 3, 5, 5]
  const arrayVelocity = [1, 2, 3, 4, 5]
  const arrayAxisY = [20, 40, 60, 80, 100]
  let nextMod = arrayMod[Math.floor(Math.random() * arraySize)]
  let nextVelocity = arrayVelocity[Math.floor(Math.random() * arraySize)]
  let nextAxisY = arrayAxisY[Math.floor(Math.random() * arraySize)]

  document.addEventListener('keydown', event => {
    if (event.keyCode === 13) {
      gameStatus.action = 'start'
    }
  })

  this.beforeLoop = () => {
    if (gameStatus.action === 'start' && gameStatus.status === 'stop') {
      this.removeAllElement()
      gameStatus.status = 'run'
      gameStatus.action = ''
      startGame()
    } else if (gameStatus.action === 'dead' && gameStatus.status === 'run') {
      hits.bombs = 0
      hits.bullets = 0
      hits.monsters = 0
      gameStatus.status = 'stop'
      return true
    } else if (gameStatus.action === 'dead' && gameStatus.status === 'stop') {
      return true
    }
  }

  this.ctx.fillStyle = '#2A0C0CBF'
  this.ctx.font = '16px arial';
  this.ctx.fillText('Tecla ENTER para começar!', this.axisX / 2, GameTime.height / 2);

  const startGame = () => {
    this.addElement(new Jeep({image: jeepImage }))
    this.addElement(new Floor())
    this.addElement(new Monster({
      image: options.monsterImageToLeft,
      image1: options.monsterImageToRight,
    }))

    this.addElement(new Panel({}))
  }

  this.afterLoop = () => {
    const second = this.getTime().second

    if (gameStatus.status !== 'run')
      return

    if (lastSecond === second || second % nextMod !== 0)
      return

    let amount = Math.round(hits.monsters / 10) + 1

    for(let i = 0; i < amount; i++) {
      this.addElement(new Monster({
        image: options.monsterImageToLeft,
        image1: options.monsterImageToRight,
        velocity: nextVelocity + i,
        axisY: nextAxisY + i * 3,
        axisX: Math.floor(Math.random() * GameTime.width)
      }))
    }

    nextMod = arrayMod[Math.floor(Math.random() * arraySize)]
    nextVelocity = arrayVelocity[Math.floor(Math.random() * arraySize)]
    nextAxisY = arrayAxisY[Math.floor(Math.random() * arraySize)]
    lastSecond = second
  }

  function Floor() {
    this.axisX = 0
    this.axisY = FLOOR
    this.width = GameTime.width
    this.height = 20
    this.update = () => {}
    this.draw = (ctx) => {
      ctx.fillStyle = '#4E3B31'
      ctx.fillRect(this.axisX, this.axisY, this.width, this.height)
    }
  }

  function Jeep(options) {
    const SIZE = 100

    options.width = SIZE + (SIZE / 2)
    options.height = SIZE
    options.velocity = 2
    options.axisY = GameTime.height - SIZE
    GameTime.MoveAxisX.call(this, options)
    GameTime.Attributes.call(this, options)
    CheckCollision.call(this)

    this.margin = 20

    const objectImage = new Image();
    objectImage.src = options.image

    const target = {
      axisX: this.axisX + this.margin,
      axisY: this.axisY + this.margin,
      width: this.width - this.margin * 2,
      height: this.height - this.margin,
      color: ''
    }

    this.update = () => {
      this.axisX += this.velocity * this.directX
      limitAxisX()

      target.axisX = this.axisX + this.margin
      target.axisY = this.axisY + this.margin
      target.color = ''

      this.checkCollision({
        objectName: ['Bullet', 'Bomb'],
        target: target,
        callback: checkCollision
      })
    }

    const limitAxisX = () => {
      if (this.axisX < 0)
        this.axisX = 0
      else if ((this.axisX + this.width) > GameTime.width)
        this.axisX = GameTime.width - this.width
    }

    this.draw = (ctx) => {
      ctx.fillStyle = target.color
      ctx.fillRect(target.axisX, target.axisY, target.width, target.height)
      ctx.drawImage(objectImage, this.axisX, this.axisY, this.width, this.height)
    }

    engineer.addElement(new Cannon({ jeep: this, }))

    const checkCollision = () => {
      target.color = 'yellow'
      gameStatus.action = 'dead'
    }
  }

  function Cannon(options) {
    GameTime.Attributes.call(this, options)
    GameTime.MoveAxisY.call(this)

    const SHORT_WAIT = 30

    const _jeep = options.jeep
    this.width = 50
    this.height = 20
    this.degrees = 0
    this.margin = 10

    let direction = 0
    let flagSpace = 0
    let lastShot = SHORT_WAIT

    const move = (keyCode, keydown) => {
      const negative = keydown ? -1 : 0
      const positive = keydown ? 1 : 0

      if (keyCode === 38) // up
        direction = negative
      else if (keyCode === 40) // down
        direction = positive
      else if (keyCode === 32)
        flagSpace = positive
    }

    this.update = () => {
      this.axisX = _jeep.axisX + this.margin
      this.axisY = _jeep.axisY + this.margin
      setDegrees(direction)
      setBullet(flagSpace)
      lastShot ++
    }

    this.draw = (ctx) => {
      ctx.save()
      ctx.fillStyle = 'green'
      ctx.translate(_jeep.axisX + this.margin, _jeep.axisY + this.margin)
      ctx.rotate(this.degrees * Math.PI / 180)
      ctx.fillRect( 0 , -10, this.width,  this.height)
      ctx.translate(0, 0)
      ctx.restore()
    }

    const setDegrees = (value) => {
      if (!value) return

      this.degrees += value / 3
      if (this.degrees < -90)
        this.degrees = -90
      else if (this.degrees > 0)
        this.degrees = 0
    }

    const setBullet = (value) => {
      if (!value || lastShot < SHORT_WAIT) return

      lastShot = 0
      const bullet = new Bullet({ cannon: this, angle: this.degrees })
      engineer.addElement(bullet)
      hits.bullets++
    }

    GameTime.BaseMove.call(this, move)
  }

  // eslint-disable-next-line no-unused-vars
  function Bullet(options) {
    GameTime.Attributes.call(this, options)
    this.padding = 10
    this.radius = 5
    this.width = this.radius / 2
    this.height = this.radius / 2

    const GRAVITY = 0.02
    const VELOCITY = 3.8

    const cannon = options.cannon
    const angle = options.angle

    const velocityX = VELOCITY * Math.cos(angle/180*Math.PI)
    let velocityY = VELOCITY * Math.sin(angle/180*Math.PI)

    this.axisX = cannon.axisX + velocityX
    this.axisY = cannon.axisY + velocityY

    this.update = () => {
      setPosition()
      checkLimit()
    }

    this.draw = (ctx) => {
      ctx.beginPath();
      ctx.fillStyle = 'red'
      ctx.arc(this.axisX + this.radius * 2, this.axisY, this.radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    const setPosition = () => {
      this.axisX += velocityX
      this.axisY += velocityY

      if (cannon.width * Math.cos(angle/180*Math.PI) < this.axisX) {
        velocityY += GRAVITY
      }
    }

    const checkLimit = () => {
      if (this.axisX > GameTime.width || this.axisY > GameTime.height)
        engineer.removeElement(this)
    }
  }

  function Monster(options) {
    CheckCollision.call(this)

    const objectImage = new Image()
    objectImage.src = options.image
    const objectImage1 = new Image()
    objectImage1.src = options.image1

    this.createdAt = new Date()
    this.launchBomb = false
    this.lastLaunchBomb = this.createdAt

    this.velocity = options.velocity || 2
    this.width = 50
    this.height = 50
    this.axisX = options.axisX || 0
    this.axisY = options.axisY || 0

    this.direct = { x: 1, y: 0 }

    this.update = () => {
      this.checkCollision({
        objectName: 'Bullet',
        removeTarget: true,
        removeObject: true,
        callback: () => hits.monsters++
      })
      checkCollisionWithWindow()
      launchBomb()
      this.axisX += this.direct.x * this.velocity
    }

    this.draw = (ctx) => {
      if (this.direct.x > 0)
        ctx.drawImage(objectImage, this.axisX, this.axisY, this.width, this.height)
      else
        ctx.drawImage(objectImage1, this.axisX, this.axisY, this.width, this.height)
    }

    const checkCollisionWithWindow = () => {
      if (this.axisX + this.width > GameTime.width)
        this.direct = { x: -1, y: 0 }
      else if (this.axisX < 0)
        this.direct = { x: 1, y: 0 }
    }

    const launchBomb = () => {
      if (engineer.getTime().diff(this.lastLaunchBomb) / 1000 < 1 )
        return

      const diff = engineer.getTime().second - this.createdAt
      this.launchBomb = diff % 5 === 0 || diff % 3 === 0

      if (this.launchBomb) {
        engineer.addElement(new Bomb({ monster: this }))
        this.lastLaunchBomb = new Date()
      }
    }
  }

  function Bomb(options) {
    CheckCollision.call(this)

    const monster = options.monster

    this.id = nextId()
    this.axisX = monster.axisX
    this.axisY = monster.axisY + monster.height
    this.width = 10
    this.height = 10
    this.velocity = 1
    this.rate = 0.1

    this.update =() => {
      this.axisY += this.velocity
      this.width += this.rate
      this.height += this.rate
      limitAxisY()
      this.checkCollision({
        objectName: 'Bullet',
        target: this,
        removeTarget: true,
        removeObject: true,
        callback: () => hits.bombs++
      })
    }

    this.draw = (ctx) => {
      ctx.fillStyle = 'orange'
      ctx.fillRect(this.axisX, this.axisY, this.width, this.height)
    }

    const limitAxisY = () => {
      const bomb = getOtherBomb()
      let max = FLOOR

      if (bomb)
        max = bomb.axisY

      if (this.axisY + this.height > max) {
        this.axisY = max - this.height
        this.rate = 0
      }
    }

    const getOtherBomb = () => {
      let bombs = engineer.games
        .filter(g => g.id !== this.id && g.constructor.name === 'Bomb')
        .reverse()

      const collision = bombs.find(bomb => {
        return bomb.rate === 0 &&
          bomb.axisX + bomb.width > this.axisX &&
          bomb.axisX < this.axisX + this.width &&
          bomb.axisY + bomb.height > this.axisY //&&
          // bomb.axisY < this.axisY + this.height
      })

      return collision
    }
  }

  function CheckCollision() {
    this.checkCollision = ({objectName, target, removeObject, removeTarget, callback}) => {
      target ||= this
      let objects = []

      if (Array.isArray(objects))
        objects = engineer.games.filter(g => objectName.includes(g.constructor.name))
      else
        objects = engineer.games.filter(g => g.constructor.name === objectName)

      const collision = objects.find(object => {
        return object.axisX + object.width > target.axisX &&
          object.axisX < target.axisX + target.width &&
          object.axisY + object.height > target.axisY &&
          object.axisY < target.axisY + target.height
      })

      if (!collision) return

      if (callback)
        callback(collision)
      if (removeObject)
        engineer.removeElement(collision)
      if (removeTarget)
        engineer.removeElement(target)
    }
  }

  function Panel(options) {
    GameTime.Attributes.call(this, options)

    const height = 15

    this.axisX = 0
    this.axisY = GameTime.height - height
    this.width = GameTime.width
    this.height = height

    this.update = () => {}
    this.draw = (ctx) => {
      const phrase = `Tiros: ${hits.bullets}. Monstros: ${hits.monsters}. Bombas: ${hits.bombs}`

      ctx.fillStyle = '#FFF'
      ctx.fillRect(this.axisX, this.axisY, this.width, this.height)

      ctx.fillStyle = '#2A0C0CBF'
      ctx.font = '16px arial'
      ctx.fillText(phrase, this.axisX + 2, GameTime.height - 2)
    }
  }

  let id = 0
  const nextId = () => id++
}

