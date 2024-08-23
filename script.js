const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const numberOfBalls = 20;
const balls= [];
let mouse = { x: canvas.width/2, y: canvas.height/2, isOnCanvas: true };
const blurLevel = 20;
const pushStrength = 5;

function createBall(){
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 3 + 2;
    const hue = Math.random() * 360;
    const color = `hsl(${hue}, 100%, 50%)`;

    return {
        x: canvas.width / 2 + Math.cos(angle) * 50,
        y: canvas.height / 2 + Math.sin(angle) * 50,
        radius: radius,
        angle: angle,
        speed: Math.random() * 0.05 + 0.01,
        trail: [],
        color: color,
        followSpeed: 0.01,//Velocidade de seguir o mouse
        velocity: { x: 0, y: 0 } // Adiciona a propriedade de velocidade para controlar o movimento ao clicar
    };
}

// Inicializar as bolas
for (let i = 0; i < numberOfBalls; i++) {
    balls.push(createBall());
}

// Função para atualizar a posição e o tamanho das bolas
function update() {
    balls.forEach(ball => {
        ball.angle += ball.speed;

        // Adiciona a força da velocidade na direção oposta ao clique
        ball.x += ball.velocity.x;
        ball.y += ball.velocity.y;

        // Gradualmente reduz a velocidade para criar um efeito de desaceleração
        ball.velocity.x *= 0.98;
        ball.velocity.y *= 0.98;

        // Cálculo da posição suave ao seguir o mouse ou voltar ao centro
        const targetX = mouse.isOnCanvas ? mouse.x : canvas.width / 2;
        const targetY = mouse.isOnCanvas ? mouse.y : canvas.height / 2;

        ball.x += (targetX + Math.cos(ball.angle) * 100 - ball.x) * ball.followSpeed;
        ball.y += (targetY + Math.sin(ball.angle) * 100 - ball.y) * ball.followSpeed;

        // Mantém o tamanho da bola constante, sem aumentar
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 50) ball.trail.shift(); // Aumenta o comprimento do rastro
    });
}

// Função para desenhar as bolas e seus rastros
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    balls.forEach(ball => {
        // Adicionar efeito de sombra para neon usando a cor de preenchimento
        ctx.shadowBlur = blurLevel;        // Usar o valor fixo do blur
        ctx.shadowColor = ball.color;      // Usar a mesma cor de preenchimento para a sombra

        // Desenhar bola
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color; // Usa a cor aleatória como preenchimento
        ctx.fill();
        ctx.closePath();

        // Desenhar rastro com a mesma cor da bola, mas com transparência
        for (let i = 0; i < ball.trail.length; i++) {
            ctx.beginPath();
            ctx.arc(ball.trail[i].x, ball.trail[i].y, ball.radius * (i / ball.trail.length) + 1, 0, Math.PI * 2);
            ctx.fillStyle = ball.color.replace('hsl', 'hsla').replace('%)', `%, ${0.2 * (i / ball.trail.length)})`);
            ctx.fill();
            ctx.closePath();
        }
    });

    // Limpar configurações de sombra
    ctx.shadowBlur = 0;
}

// Função principal de animação
function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

// Atualizar posição do mouse
canvas.addEventListener('mousemove', event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.isOnCanvas = true;
});

// Detectar quando o mouse sai do canvas
canvas.addEventListener('mouseleave', () => {
    mouse.isOnCanvas = false;
});

// Detectar clique do mouse
canvas.addEventListener('click', event => {
    balls.forEach(ball => {
        const dx = ball.x - event.clientX;
        const dy = ball.y - event.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        ball.velocity.x += (dx / distance) * pushStrength;
        ball.velocity.y += (dy / distance) * pushStrength;
    });
});


animate();
