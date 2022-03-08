
const jeepImage = 'jeep.png'
const monsterImageToLeft = 'monsterToLeft.png'
const monsterImageToRight = 'monsterToRight.png'

const main = new GameJeep('app-canvas', {
  jeepImage,
  monsterImageToLeft,
  monsterImageToRight
})

window.onload = function() {
  main.loop()
}
