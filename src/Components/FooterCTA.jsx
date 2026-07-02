import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Instagram, Facebook, Twitter } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const FooterCTA = () => {
  const footerRef = useRef(null);
  const canvasRef = useRef(null);
  const ctaRef = useRef(null);
  const gridRef = useRef(null);

  // Three.js Particle System
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 400, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true 
    });

    renderer.setSize(window.innerWidth, 400);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 150;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xd4a017,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Add golden ring
    const ringGeometry = new THREE.TorusGeometry(2, 0.02, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xd4a017, 
      transparent: true, 
      opacity: 0.3 
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Add second ring
    const ring2Geometry = new THREE.TorusGeometry(2.5, 0.01, 16, 100);
    const ring2 = new THREE.Mesh(ring2Geometry, ringMaterial.clone());
    ring2.rotation.x = Math.PI / 3;
    scene.add(ring2);

    camera.position.z = 5;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;
      
      ring.rotation.z += 0.002;
      ring2.rotation.z -= 0.001;
      ring2.rotation.y += 0.001;

      // Mouse parallax
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animationId = requestAnimationFrame(animate);

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / 400;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 400);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      ring2Geometry.dispose();
      renderer.dispose();
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main CTA animation
      gsap.fromTo(".footer-cta-title",
        { y: 80, opacity: 0, skewY: 3 },
        {
          y: 0,
          opacity: 1,
          skewY: 0,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
          },
        }
      );

      // Subtitle animation
      gsap.fromTo(".footer-cta-subtitle",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
          },
        }
      );

      // Email input animation
      gsap.fromTo(".footer-email-input",
        { width: "0%", opacity: 0 },
        {
          width: "100%",
          opacity: 1,
          duration: 1.2,
          delay: 0.5,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
          },
        }
      );

      // Grid columns stagger animation
      gsap.fromTo(".footer-col",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 90%",
          },
        }
      );

      // Social icons animation
      gsap.fromTo(".social-icon",
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
          },
        }
      );

      // Links hover line animation
      const links = gsap.utils.toArray(".footer-link");
      links.forEach((link) => {
        const line = link.querySelector(".link-line");
        if (line) {
          gsap.set(line, { scaleX: 0, transformOrigin: "left" });
          
          link.addEventListener("mouseenter", () => {
            gsap.to(line, { scaleX: 1, duration: 0.3, ease: "power2.out" });
          });
          
          link.addEventListener("mouseleave", () => {
            gsap.to(line, { scaleX: 0, duration: 0.3, ease: "power2.in", transformOrigin: "right" });
          });
        }
      });

      // Bottom bar animation
      gsap.fromTo(".footer-bottom",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".footer-bottom",
            start: "top 95%",
          },
        }
      );

      // Floating animation for decorative elements
      gsap.to(".footer-float", {
        y: -15,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="bg-black text-white pt-24 pb-12 relative z-20 border-t border-white/10 overflow-hidden">
      {/* 3D Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-[400px] pointer-events-none opacity-40"
      />

      {/* Decorative gradient orbs */}
      <div className="footer-float absolute top-20 left-10 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="footer-float absolute top-40 right-20 w-96 h-96 bg-gold/3 rounded-full blur-3xl pointer-events-none" style={{ animationDelay: "1s" }} />
      
      {/* Animated grid lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-gold/5 to-transparent" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Main CTA */}
        <div ref={ctaRef} className="flex flex-col items-center text-center mb-20">
          <h2 className="footer-cta-title font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tighter">
            THE{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-white to-gold italic relative">
              FUTURE
              <span className="absolute -bottom-2 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            </span>{" "}
            OF BEAUTY
          </h2>
          <p className="footer-cta-subtitle text-neutral-500 max-w-xl text-sm font-mono mb-10 tracking-widest uppercase">
            Junte-se ao clube exclusivo. Acesso antecipado à inovação.
          </p>
          <div className="footer-email-input flex w-full max-w-md border-b border-white/20 focus-within:border-gold transition-colors relative group">
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-gold via-white to-gold scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
            <input
              type="email"
              placeholder="SEU EMAIL"
              className="flex-1 bg-transparent px-0 py-4 outline-none text-white placeholder-neutral-700 font-mono text-sm uppercase tracking-widest"
            />
            <button className="text-gold uppercase text-xs font-bold tracking-[0.2em] hover:text-white transition-colors duration-300 relative overflow-hidden group/btn">
              <span className="relative z-10">Inscrever</span>
              <span className="absolute inset-0 bg-gold/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            </button>
          </div>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-t border-white/5 pt-16">
          <div className="footer-col space-y-6">
            <h3 className="font-heading text-2xl font-bold relative inline-block">
              DJAY<span className="text-gold">.</span>
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
            </h3>
            <p className="text-neutral-500 font-mono text-xs leading-relaxed uppercase tracking-wide">
              Luanda, Angola
              <br />
              Est. 2026
              <br />
              Cosmética de Alta Precisão
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="social-icon w-10 h-10 flex items-center justify-center border border-white/10 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-300 relative group"
              >
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors" />
              </a>
              <a
                href="#"
                className="social-icon w-10 h-10 flex items-center justify-center border border-white/10 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-300 relative group"
              >
                <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors" />
              </a>
              <a
                href="#"
                className="social-icon w-10 h-10 flex items-center justify-center border border-white/10 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-300 relative group"
              >
                <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors" />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="text-gold font-mono text-xs font-bold uppercase tracking-widest mb-8 relative inline-block">
              Coleções
              <span className="absolute -bottom-2 left-0 w-8 h-px bg-gold/50" />
            </h4>
            <ul className="space-y-4 text-neutral-400 text-xs font-mono uppercase tracking-wide">
              {["Face [Base]", "Eyes [Sombra]", "Lips [Batom]", "Skin [Tech]"].map((item, i) => (
                <li key={i}>
                  <a href="#" className="footer-link hover:text-white transition-colors relative inline-block group">
                    <span className="relative z-10">{item}</span>
                    <span className="link-line absolute bottom-0 left-0 w-full h-px bg-gold" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="text-gold font-mono text-xs font-bold uppercase tracking-widest mb-8 relative inline-block">
              Info
              <span className="absolute -bottom-2 left-0 w-8 h-px bg-gold/50" />
            </h4>
            <ul className="space-y-4 text-neutral-400 text-xs font-mono uppercase tracking-wide">
              {["Sobre Nós", "Envios", "FAQ"].map((item, i) => (
                <li key={i}>
                  <a href="#" className="footer-link hover:text-white transition-colors relative inline-block group">
                    <span className="relative z-10">{item}</span>
                    <span className="link-line absolute bottom-0 left-0 w-full h-px bg-gold" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="text-gold font-mono text-xs font-bold uppercase tracking-widest mb-8 relative inline-block">
              Contato
              <span className="absolute -bottom-2 left-0 w-8 h-px bg-gold/50" />
            </h4>
            <ul className="space-y-4 text-neutral-400 text-xs font-mono uppercase tracking-wide">
              <li className="flex items-center space-x-3 group">
                <span className="w-2 h-2 bg-gold/50 rounded-full group-hover:bg-gold transition-colors" />
                <span className="group-hover:text-white transition-colors">Luanda, AO</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <span className="w-2 h-2 bg-gold/50 rounded-full group-hover:bg-gold transition-colors" />
                <span className="group-hover:text-white transition-colors">contato@djay.ao</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom flex flex-col md:flex-row justify-between items-center text-neutral-700 text-[10px] font-mono uppercase tracking-widest border-t border-white/5 pt-8">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            © 2026 Djay Cosméticos. All Systems Operational.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors relative group">
              Privacy Protocol
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#" className="hover:text-white transition-colors relative group">
              Terms of Use
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterCTA;
