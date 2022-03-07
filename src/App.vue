<template>
  <div id="app">
    <h3>Carro contra os Monstros</h3>
    <canvas id="app-canvas"/>
    <hr>
  </div>
</template>

<script>
import GameTime from '@/elements/GameJeep'

export default {
  data: () => ({
    main: null
  }),
  mounted() {
    const jeepImage = require('@/assets/jeep.png')
    const monsterImageToLeft = require('@/assets/monsterToLeft.png')
    const monsterImageToRight = require('@/assets/monsterToRight.png')
    
    this.main = new GameTime('app-canvas', {
      jeepImage,
      monsterImageToLeft,
      monsterImageToRight
    })
    this.main.loop()
  },
  methods: {
    addRect() {
      this.main.addRect({ color: 'yellow', velocity: 10 })
    },
    addImage() {
      this.main.addImage({
        color: 'gray',
        image: require('@/assets/jeep.png'),
        velocity: 25
        // width: 50,
        // height: 50
      })
      this.main.addImage({
        color: 'gray',
        image: require('@/assets/monsterToLeft.png'),
        velocity: 10,
        width: 50,
        height: 50,
      })
    }
  },
  name: 'App',
}
</script>

<style>

* {
  margin: 0;
  padding: 0;
}

canvas {
  border: 1px solid
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
