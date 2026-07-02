import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Hero3D = () => {
  const mountRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const geometry = new THREE.IcosahedronGeometry(2.5, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0xd4a017,
      metalness: 1,
      roughness: 0.1,
      wireframe: true,
      emissive: 0x221a00,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const gridHelper = new THREE.GridHelper(20, 20, 0x333333, 0x111111);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xd4a017, 3);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    camera.position.z = 6;

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      sphere.rotation.y += 0.002;
      sphere.rotation.x += 0.001;
      renderer.render(scene, camera);
    };
    animationId = requestAnimationFrame(animate);

    gsap.to(sphere.rotation, {
      y: Math.PI * 0.5,
      scrollTrigger: {
        trigger: mountRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-text-reveal", {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.5,
      });
    }, textRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div
        ref={mountRef}
        className="absolute inset-0 z-0 pointer-events-none opacity-60"
      />

      <div
        ref={textRef}
        className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-white/10 rounded-full pointer-events-none" />

        <span className="hero-text-reveal text-gold tracking-[0.8em] text-xs font-mono uppercase mb-8 border border-gold/30 px-4 py-1 rounded-full">
          DJAY COSMÉTICOS
        </span>

        <h1 className="hero-text-reveal font-heading text-6xl md:text-8xl lg:text-9xl text-white font-bold mb-6 tracking-tighter">
          Beleza
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold via-white to-gold italic font-light tracking-normal">
            Sem Limites
          </span>
        </h1>

        <p className="hero-text-reveal max-w-lg text-neutral-400 text-sm md:text-base font-light mb-12 leading-relaxed tracking-wide">
          Maquilhagem, cuidados pessoais, fixadores e águas tónicas — tudo o que a
          sua beleza precisa, num só lugar.
        </p>

        <button className="hero-text-reveal group relative px-10 py-4 bg-transparent overflow-hidden border border-white/20 hover:border-gold transition-colors duration-300">
          <div className="absolute inset-0 w-0 bg-gold/10 transition-all duration-[250ms] ease-out group-hover:w-full"></div>
          <span className="relative text-white group-hover:text-gold tracking-[0.3em] uppercase text-xs font-bold transition-colors">
            Comprar Agora
          </span>
        </button>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <span className="text-white/50 text-[10px] tracking-widest uppercase mb-2 animate-pulse">
          Scroll
        </span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent"></div>
      </div>
    </div>
  );
};

export default Hero3D;
