// Neural Network Animation
class NeuralBackground {
    constructor() {
        this.canvas = document.getElementById('neural-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: -1000, y: -1000, radius: 100 };
        this.animationId = null;
        
        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.resizeCanvas();
        this.createParticles();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.mouse.radius = (this.canvas.height / 100) * (this.canvas.width / 100);
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        const numberOfParticles = Math.min((this.canvas.width * this.canvas.height) / 9000, 150);
        
        for (let i = 0; i < numberOfParticles; i++) {
            const size = Math.random() * 2.5 + 1;
            const x = Math.random() * (this.canvas.width - size * 2) + size;
            const y = Math.random() * (this.canvas.height - size * 2) + size;
            
            this.particles.push({
                x,
                y,
                baseX: x,
                baseY: y,
                directionX: (Math.random() * 0.4) - 0.2,
                directionY: (Math.random() * 0.4) - 0.2,
                size,
                density: Math.random() * 30 + 1,
                pulsPhase: Math.random() * Math.PI * 2,
                floatPhase: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.3 + 0.6
            });
        }
    }

    drawParticle(particle, time) {
        // Enhanced pulsating effect
        const pulsIntensity = Math.sin(time * 0.001 + particle.pulsPhase) * 0.3 + 0.7;
        const actualSize = particle.size * pulsIntensity;
        
        // Enhanced floating motion
        const floatX = Math.sin(time * 0.0005 + particle.floatPhase) * 3;
        const floatY = Math.cos(time * 0.0007 + particle.floatPhase * 0.8) * 2;
        
        const x = particle.x + floatX;
        const y = particle.y + floatY;
        
        // Crisp opacity fluctuation
        const opacityVar = Math.sin(time * 0.002 + particle.pulsPhase * 0.5) * 0.15 + 0.85;
        const finalOpacity = particle.opacity * opacityVar;

        this.ctx.beginPath();
        this.ctx.arc(x, y, actualSize, 0, Math.PI * 2, false);
        
        // Crisp and defined particle effect
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, actualSize * 1.5);
        gradient.addColorStop(0, `rgba(20, 184, 166, ${finalOpacity * 1.8})`);
        gradient.addColorStop(0.6, `rgba(59, 130, 246, ${finalOpacity * 1.4})`);
        gradient.addColorStop(0.85, `rgba(16, 185, 129, ${finalOpacity * 0.8})`);
        gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    connectParticles(time) {
        const connectionOpacity = Math.sin(time * 0.001) * 0.1 + 0.9;
        
        for (let a = 0; a < this.particles.length; a++) {
            for (let b = a + 1; b < this.particles.length; b++) {
                const dx = this.particles[a].x - this.particles[b].x;
                const dy = this.particles[a].y - this.particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < Math.min(this.canvas.width / 7, 150)) {
                    const opacity = (1 - distance / 150) * 0.3 * connectionOpacity;
                    
                    // Crisp connection line fluctuation
                    const lineFluctuation = Math.sin(time * 0.003 + distance * 0.01) * 0.1 + 0.9;
                    const finalOpacity = opacity * lineFluctuation;
                    
                    // Brighter connection lines with gradient
                    const lineGradient = this.ctx.createLinearGradient(
                        this.particles[a].x, this.particles[a].y,
                        this.particles[b].x, this.particles[b].y
                    );
                    lineGradient.addColorStop(0, `rgba(20, 184, 166, ${finalOpacity * 1.2})`);
                    lineGradient.addColorStop(0.5, `rgba(59, 130, 246, ${finalOpacity * 1.4})`);
                    lineGradient.addColorStop(1, `rgba(16, 185, 129, ${finalOpacity * 1.2})`);
                    
                    this.ctx.strokeStyle = lineGradient;
                    this.ctx.lineWidth = 2.5;
                    this.ctx.lineCap = 'round';
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[a].x, this.particles[a].y);
                    this.ctx.lineTo(this.particles[b].x, this.particles[b].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    updateParticles() {
        this.particles.forEach(particle => {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.mouse.radius && distance > 0) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                const directionX = forceDirectionX * force * particle.density * 0.1;
                const directionY = forceDirectionY * force * particle.density * 0.1;
                
                particle.x -= directionX;
                particle.y -= directionY;
            } else {
                // Gentle return to base position
                if (particle.x !== particle.baseX) {
                    const returnX = (particle.x - particle.baseX) * 0.05;
                    particle.x -= returnX;
                }
                if (particle.y !== particle.baseY) {
                    const returnY = (particle.y - particle.baseY) * 0.05;
                    particle.y -= returnY;
                }
            }
        });
    }

    animate(time = 0) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Overall breathing effect for the neural network
        const breatheScale = Math.sin(time * 0.0008) * 0.02 + 1;
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(breatheScale, breatheScale);
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
        
        this.updateParticles();
        
        this.particles.forEach(particle => {
            this.drawParticle(particle, time);
        });
        
        this.connectParticles(time);
        
        this.ctx.restore();
        
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', () => this.resizeCanvas());
        window.removeEventListener('mousemove', () => {});
        window.removeEventListener('mouseleave', () => {});
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NeuralBackground();
});