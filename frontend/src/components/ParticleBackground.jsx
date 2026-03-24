import { useEffect, useRef } from "react";

export default function ParticleBackground({ darkMode }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // ── Particle colors ──
        const COLORS = darkMode
            ? ["#a78bfa", "#f472b6", "#6c47ff", "#ff47a3", "#60a5fa", "#34d399"]
            : ["#7c3aed", "#db2777", "#4f46e5", "#e11d48", "#2563eb", "#059669"];

        // ── Create particles ──
        const TOTAL = 55;
        const particles = Array.from({ length: TOTAL }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 4 + 1.5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            speedX: (Math.random() - 0.5) * 0.6,
            speedY: (Math.random() - 0.5) * 0.6,
            opacity: Math.random() * 0.5 + 0.2,
            // wobble
            wobbleX: Math.random() * Math.PI * 2,
            wobbleY: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.01 + 0.005,
            wobbleAmp: Math.random() * 0.4 + 0.1,
            // shape: 0=circle, 1=rect, 2=rounded-rect
            shape: Math.floor(Math.random() * 3),
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02,
        }));

        const drawParticle = (p) => {
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            if (p.shape === 0) {
                // Circle
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.shape === 1) {
                // Small rectangle (like in screenshot)
                const w = p.size * 2.5;
                const h = p.size * 1.2;
                ctx.fillRect(-w / 2, -h / 2, w, h);
            } else {
                // Rounded rect
                const w = p.size * 3;
                const h = p.size * 1.4;
                const r = h / 2;
                ctx.beginPath();
                ctx.moveTo(-w / 2 + r, -h / 2);
                ctx.lineTo(w / 2 - r, -h / 2);
                ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, 0);
                ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
                ctx.lineTo(-w / 2 + r, h / 2);
                ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, 0);
                ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
                ctx.fill();
            }
            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                // Wobble movement
                p.wobbleX += p.wobbleSpeed;
                p.wobbleY += p.wobbleSpeed * 0.7;
                p.x += p.speedX + Math.sin(p.wobbleX) * p.wobbleAmp;
                p.y += p.speedY + Math.cos(p.wobbleY) * p.wobbleAmp;
                p.rotation += p.rotSpeed;

                // Wrap around edges
                if (p.x < -20) p.x = canvas.width + 20;
                if (p.x > canvas.width + 20) p.x = -20;
                if (p.y < -20) p.y = canvas.height + 20;
                if (p.y > canvas.height + 20) p.y = -20;

                drawParticle(p);
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
        };
    }, [darkMode]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: darkMode ? 0.55 : 0.35 }}
        />
    );
}