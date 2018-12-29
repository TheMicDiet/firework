let width
let height
let rockets = []
let figures = []
let canvas

function preload() {
    figures.push(loadImage('exp.png'))
    figures.push(loadImage('sqr.png'))
    figures.push(loadImage('heart.png'))
    figures.push(loadImage('star.png'))
    figures.push(loadImage('star2.png'))
    figures.push(loadImage('circle.png'))
    figures.push(loadImage('triangle.png'))
    figures.push(loadImage('star3.png'))

}

function setup() {
    width = windowWidth
    height = windowHeight
    colorMode(HSB)
    canvas = createCanvas(width, height)
    background(0, 0.15)
    rockets.push(new Rocket(createVector(width / 2, height), createVector(random(width * 0.2, width * 0.8), random(height * 0.2, height * 0.5))))


}

function draw() {
    background(0, 0.15)
    for (let i = rockets.length - 1; i >= 0; i--) {
        if (rockets[i].finished) {
            rockets.splice(i, 1)
            continue
        }
        rockets[i].display()
        rockets[i].update()



    }
    spawnRocket()

}

function spawnRocket() {

    let target = createVector(random(width * 0.1, width * 0.9), random(height * 0.1, height * 0.9))

    if (rockets.every(rocket => dist(rocket.target.x, rocket.target.y, target.x, target.y) > 200) && rockets.length < 10) {
        rockets.push(new Rocket(createVector(random(width * 0.3, width * 0.6), height), target))
    }



}


class Particle {
    constructor(pos, target, hue) {

        this.pos = pos
        this.target = target
        this.hue = hue
        this.timeToLive = 255
        this.vel = createVector(0, 0)
        this.acc = createVector(0, 0)
        this.max_velocity = 5
        this.max_steering = 1
        this.slowing_radius = 10
        this.dist = Number.MAX_VALUE
        this.seeking = true

    }

    display() {
        push()
        colorMode(HSB)
        strokeWeight(5)
        stroke(this.hue, 255, this.timeToLive)
        point(this.pos.x, this.pos.y)
        pop()
    }

    update() {
        this.timeToLive -= 2.5
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        this.acc.mult(0)
        if (this.seeking) {

            this.seek()
        } else {
            //gravity
            this.acc.add(createVector(0, .01))
        }


    }

    seek() {
        let desired_velocity = p5.Vector.sub(this.target, this.pos)
        let d = desired_velocity.mag()

        let spd = this.max_velocity

        if (d < this.slowing_radius) {
            spd = spd * d / this.slowing_radius

        }
        desired_velocity.setMag(spd)
        let steering = p5.Vector.sub(desired_velocity, this.vel)
        steering.limit(this.max_steering)
        this.acc.add(steering)
        if (d < 3) {
            this.seeking = false
            this.acc.mult(0)
            this.vel.limit(1.5)
        }
    }
}

class Rocket extends Particle {
    constructor(pos, target, hue = random(255)) {
        super(pos, target, hue)
        this.exploded = false
        this.particles = []
        this.finished = false
        this.slowing_radius = 5
        this.max_velocity = 8
        this.max_steering = 6

    }

    display() {
        push()
        colorMode(HSB)
        strokeWeight(8)
        stroke(this.hue, 255, this.timeToLive)
        if (!this.exploded) {
            point(this.pos.x, this.pos.y)
        }
        pop()
        if (this.exploded || this.particles.length > 0) {
            for (let particle of this.particles) {
                particle.display()
                particle.update()
            }
        }

    }

    update() {

        this.vel.add(this.acc)
        this.pos.add(this.vel)
        this.acc.mult(0)
        if (this.exploded && this.timeToLive > 0) {
            this.timeToLive -= 4
        }
        if (abs(this.target.x - this.pos.x) < 1 && abs(this.target.y - this.pos.y) < 1 && !this.exploded) {
            this.explode()
        }
        if (!this.exploded) {
            this.seek()
        }

        this.finished = (this.particles.every((x) => x.timeToLive <= 0)) && this.particles.length > 0



    }

    explode() {
        //create particles (shape)
        this.exploded = true
        let img = random(figures)
        img.loadPixels()
        let imageMidX = img.width / 2
        let imageMidY = img.height / 2

        for (let i = 0; i < img.width; i += 7) {
            for (let j = 0; j < img.height; j += 7) {

                let r = img.pixels[(i + j * img.width) * 4 + 0]
                let g = img.pixels[(i + j * img.width) * 4 + 1]
                let b = img.pixels[(i + j * img.width) * 4 + 2]

                if (r > 100 && g < 100 && b < 100) {
                    let copy_pos = this.pos.copy()
                    this.particles.push(new Particle(copy_pos, createVector(i - imageMidX + copy_pos.x, j - imageMidY + copy_pos.y), this.hue))

                }
            }
        }
    }
    seek() {
        let desired_velocity = p5.Vector.sub(this.target, this.pos)
        let d = desired_velocity.mag()

        let spd = this.max_velocity

        if (d < this.slowing_radius) {
            spd = spd * d / this.slowing_radius

        }
        desired_velocity.setMag(spd)
        let steering = p5.Vector.sub(desired_velocity, this.vel)
        steering.limit(this.max_steering)
        this.acc.add(steering)



    }


}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    width = windowWidth
    height = windowHeight
}