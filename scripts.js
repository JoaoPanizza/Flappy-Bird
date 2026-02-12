function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function cano (reversa = false) {
    this.elemento = novoElemento('div', 'cano')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px` 
}

function parCanos(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-canos')

    this.superior = new cano(true)
    this.inferior = new cano(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

function Canos(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new parCanos(altura, abertura, largura),
        new parCanos(altura, abertura, largura + espaco),
        new parCanos(altura, abertura, largura + espaco * 2),
        new parCanos(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par =>{
            par.setX(par.getX() - deslocamento)

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }
            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if(cruzouMeio) notificarPonto()
        })
    }
}

function bird(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'bird')
    this.elemento.src = 'images/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    this.setY(alturaJogo / 2)

    window.onkeydown = () => voando = true
    window.onkeyup = () => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 7 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }
}

function pontuacao () {
    this.elemento = novoElemento('span', 'pontuacao')
    this.atualizaPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizaPontos(0)
}

function sobreposicao(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colisao(bird, canos) {
    let colisao = false
    canos.pares.forEach(parCanos =>{
        if (!colisao) {
            const superior = parCanos.superior.elemento
            const inferior = parCanos.inferior.elemento
            colisao = sobreposicao(bird.elemento, superior) || sobreposicao(bird.elemento, inferior)
        }
    })
    return colisao
}


function flappyBird() {
    let pontos = 0

    const areaJogo = document.querySelector('.flappy-container')
    const altura = areaJogo.clientHeight
    const largura = areaJogo.clientWidth

    const placar = new pontuacao()
    const canos = new Canos(altura, largura, 200, 400,() => placar.atualizaPontos(++pontos))
    const passaro = new bird(altura)

    areaJogo.appendChild(placar.elemento)
    areaJogo.appendChild(passaro.elemento)
    canos.pares.forEach(par => areaJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            canos.animar()
            passaro.animar()
            if (colisao(passaro, canos)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new flappyBird().start()