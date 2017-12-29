const WIDTH = 5

const HEIGHT = 5

class LedPoint {

    x: number

    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    show() {
        led.plot(this.x, this.y)
    }

    hide() {
        led.unplot(this.x, this.y)
    }
}

class Platform extends LedPoint {

    constructor() {
        super(2, 4)
    }

    moveRight() {
        this.hide()
        this.x = Math.min(this.x + 1, WIDTH - 1)
        this.show()
    }

    moveLeft() {
        this.hide()
        this.x = Math.max(this.x - 1, 0)
        this.show()
    }

    collision(x: number, y: number) {
        return this.x == x && this.y == y
    }
}

class Meteor extends LedPoint {

    constructor(x: number) {
        super(x, -1)
    }

    moveDown() {
        this.hide()
        this.y = Math.min(this.y + 1, HEIGHT - 1)
        this.show()
    }

    isOnGround() {
        return this.y >= HEIGHT - 1
    }

    hasCollision() {
        return led.point(this.x, this.y)
    }
}

class Meteors {

    meteors: Meteor[]

    onMeteorMove: (x: number, y: number) => void

    onMeteorExit: () => void

    constructor() {
        this.meteors =[]
        this.onMeteorMove = (x: number, y: number) => { }
        this.onMeteorExit = () => { }
    }

    size() {
        return this.meteors.length
    }

    moveAll() {

        for (let i = 0; i < this.meteors.length; i++) {
            let meteor = this.meteors[i]
            meteor.moveDown()
            this.onMeteorMove(meteor.x, meteor.y)
        }

        for (let i = 0; i < this.meteors.length; i++) {
            if (this.meteors[i].isOnGround()) {
                this.meteors[i].hide()
                this.meteors.removeAt(i)
                this.onMeteorExit()
            }
        }
    }

    spawn() {
        let meteor = new Meteor(Math.random(WIDTH))
        if (!meteor.hasCollision()) {
            this.meteors.push(meteor)
        }
    }
}

class Game {

    isGameOver: boolean

    points: number

    platform: Platform

    meteors: Meteors

    constructor(platform: Platform, meteors: Meteors) {
        this.isGameOver = false
        this.points = 0
        this.platform = platform
        this.meteors = meteors
    }

    initialize() {
        this.meteors.onMeteorMove = (x: number, y: number) => {
            if (!this.isGameOver) {
                this.isGameOver = this.platform.collision(x, y)
            }
        }

        this.meteors.onMeteorExit = () => {
            this.points += 1
        }

        input.onButtonPressed(Button.A, () => {
            if (!this.isGameOver) {
                this.platform.moveLeft()
            }
        })

        input.onButtonPressed(Button.B, () => {
            if (!this.isGameOver) {
                this.platform.moveRight()
            }
        })
    }

    run(delay: number, decrease: number) {

        this.platform.show()

        const halfSecond = 500
        const second = 1000
        const tenSeconds = 15000

        let minDelay = 250
        let numOfMeteors = 2
        let maxNumOfMeteors = 5

        let colors =[Colors.Blue, Colors.Purple, Colors.Violet, Colors.Red]

        basic.forever(() => {
            delay = Math.max(delay - decrease, minDelay)
            basic.pause(halfSecond)
        })

        basic.forever(() => {
            if (numOfMeteors < maxNumOfMeteors) {
                numOfMeteors += 1
            }

            basic.setLedColor(colors[Math.random(colors.length)])
            basic.pause(second)
            basic.setLedColor(0)

            basic.pause(tenSeconds - second)
        })

        basic.forever(() => {

            if (this.isGameOver) {
                basic.clearScreen()
                basic.showNumber(this.points)
            } else {
                if (this.meteors.size() < numOfMeteors) {
                    this.meteors.spawn()
                }

                this.meteors.moveAll()
                basic.pause(delay)
            }
        })
    }
}

let meteorGame = new Game(new Platform(), new Meteors())
meteorGame.initialize()
meteorGame.run(1000, 10)
