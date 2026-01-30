import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TransitionSection = () => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);

  // Three.js DNA-like helix animation
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 500, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true 
    });

    renderer.setSize(window.innerWidth, 500);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create DNA helix structure
    const helixGroup = new THREE.Group();
    const sphereGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const goldMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xd4a017,
      transparent: true,
      opacity: 0.8,
    });
    const whiteMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    });

    // Create helix points
    const helixPoints = 100;
    const helixRadius = 2;
    const helixHeight = 12;

    for (let i = 0; i < helixPoints; i++) {
      const t = i / helixPoints;
      const angle = t * Math.PI * 8;
      
      // First strand
      const sphere1 = new THREE.Mesh(sphereGeometry, goldMaterial.clone());
      sphere1.position.set(
        Math.cos(angle) * helixRadius,
        (t - 0.5) * helixHeight,
        Math.sin(angle) * helixRadius
      );
      helixGroup.add(sphere1);

      // Second strand (opposite)
      const sphere2 = new THREE.Mesh(sphereGeometry, whiteMaterial.clone());
      sphere2.position.set(
        Math.cos(angle + Math.PI) * helixRadius,
        (t - 0.5) * helixHeight,
        Math.sin(angle + Math.PI) * helixRadius
      );
      helixGroup.add(sphere2);

      // Connecting bars every few points
      if (i % 5 === 0) {
        const barGeometry = new THREE.CylinderGeometry(0.02, 0.02, helixRadius * 2, 8);
        const barMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xd4a017,
          transparent: true,
          opacity: 0.3,
        });
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.position.set(0, (t - 0.5) * helixHeight, 0);
        bar.rotation.z = Math.PI / 2;
        bar.rotation.y = angle;
        helixGroup.add(bar);
      }
    }

    scene.add(helixGroup);

    // Add floating particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 15;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xd4a017,
      size: 0.03,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    camera.position.z = 8;

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.005;

      helixGroup.rotation.y += 0.003;
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;

      // Pulse effect on helix
      helixGroup.children.forEach((child, i) => {
        if (child.type === 'Mesh') {
          const scale = 1 + Math.sin(time * 2 + i * 0.1) * 0.2;
          child.scale.setScalar(scale);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Scroll-based animation
    gsap.to(helixGroup.rotation, {
      x: Math.PI * 0.5,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });

    gsap.to(camera.position, {
      z: 5,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });

    const handleResize = () => {
      camera.aspect = window.innerWidth / 500;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 500);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      sphereGeometry.dispose();
      goldMaterial.dispose();
      whiteMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  // Text animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title reveal
      gsap.fromTo(".transition-title",
        { 
          y: 80, 
          opacity: 0,
          clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        },
        {
          y: 0,
          opacity: 1,
          clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 80%",
          },
        }
      );

      // Subtitle reveal
      gsap.fromTo(".transition-subtitle",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 80%",
          },
        }
      );

      // Stats counter animation
      gsap.fromTo(".stat-item",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".stats-container",
            start: "top 85%",
          },
        }
      );

      // Animated lines
      gsap.fromTo(".animated-line",
        { scaleX: 0, transformOrigin: "left" },
        {
          scaleX: 1,
          duration: 1.5,
          ease: "power2.inOut",
          stagger: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[500px] bg-black overflow-hidden"
    >
      {/* Three.js Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none z-10" />
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />

      {/* Animated horizontal lines */}
      <div className="absolute top-1/4 left-0 w-full h-px animated-line bg-gradient-to-r from-transparent via-gold/30 to-transparent z-10" />
      <div className="absolute top-3/4 left-0 w-full h-px animated-line bg-gradient-to-r from-transparent via-gold/20 to-transparent z-10" />

      {/* Content */}
      <div 
        ref={textRef}
        className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4"
      >
        <span className="transition-subtitle text-gold/60 text-xs font-mono uppercase tracking-[0.5em] mb-4">
          Ciência & Beleza
        </span>
        
        <h2 className="transition-title font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tighter mb-6">
          A{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-white to-gold italic">
            Fórmula
          </span>{" "}
          Perfeita
        </h2>

        <p className="transition-subtitle max-w-xl text-neutral-400 text-sm md:text-base font-light leading-relaxed mb-12">
          Combinamos tecnologia de ponta com ingredientes naturais para criar produtos que transformam a sua rotina de beleza.
        </p>

        {/* Stats */}
        <div className="stats-container flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="stat-item text-center">
            <span className="block text-3xl md:text-4xl font-bold text-gold mb-1">98%</span>
            <span className="text-neutral-500 text-xs font-mono uppercase tracking-wider">Satisfação</span>
          </div>
          <div className="stat-item text-center">
            <span className="block text-3xl md:text-4xl font-bold text-white mb-1">50+</span>
            <span className="text-neutral-500 text-xs font-mono uppercase tracking-wider">Produtos</span>
          </div>
          <div className="stat-item text-center">
            <span className="block text-3xl md:text-4xl font-bold text-gold mb-1">10K+</span>
            <span className="text-neutral-500 text-xs font-mono uppercase tracking-wider">Clientes</span>
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l border-t border-gold/20 pointer-events-none z-10" />
      <div className="absolute top-8 right-8 w-16 h-16 border-r border-t border-gold/20 pointer-events-none z-10" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l border-b border-gold/20 pointer-events-none z-10" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r border-b border-gold/20 pointer-events-none z-10" />
    </section>
  );
};

export default TransitionSection;
