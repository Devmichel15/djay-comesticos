import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { useAppwrite } from "../hooks/useAppwrite";

gsap.registerPlugin(ScrollTrigger);

const FeatureGrid = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const { fetchAllProducts } = useAppwrite();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const loadFeatured = async () => {
      const all = await fetchAllProducts();
      // Group by category and pick one from each, or just pick first 4 prominent ones
      // For simplicity/visuals, let's pick 4 diverse items
      if (all && all.length > 0) {
        // Unique categories
        const categories = [...new Set(all.map((p) => p.category))];
        const selected = [];
        categories.slice(0, 4).forEach((cat) => {
          const prod = all.find((p) => p.category === cat);
          if (prod) selected.push(prod);
        });

        // If not enough categories, just fill with others
        if (selected.length < 4) {
          const remaining = all
            .filter((p) => !selected.includes(p))
            .slice(0, 4 - selected.length);
          selected.push(...remaining);
        }

        setFeaturedProducts(selected);
      }
    };
    loadFeatured();
  }, []);

  // Three.js Background Animation
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / 600,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, 600);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create floating geometric shapes
    const shapes = [];
    const geometries = [
      new THREE.OctahedronGeometry(0.3, 0),
      new THREE.TetrahedronGeometry(0.25, 0),
      new THREE.IcosahedronGeometry(0.2, 0),
    ];

    const material = new THREE.MeshBasicMaterial({
      color: 0xd4a017,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });

    for (let i = 0; i < 20; i++) {
      const geometry =
        geometries[Math.floor(Math.random() * geometries.length)];
      const mesh = new THREE.Mesh(geometry, material.clone());
      mesh.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );
      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01,
        },
        floatSpeed: Math.random() * 0.002 + 0.001,
        floatOffset: Math.random() * Math.PI * 2,
      };
      shapes.push(mesh);
      scene.add(mesh);
    }

    // Add connecting lines
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(60);
    for (let i = 0; i < 60; i++) {
      linePositions[i] = (Math.random() - 0.5) * 15;
    }
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3),
    );
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xd4a017,
      transparent: true,
      opacity: 0.1,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    camera.position.z = 8;

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      shapes.forEach((shape) => {
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;
        shape.position.y +=
          Math.sin(time + shape.userData.floatOffset) *
          shape.userData.floatSpeed;
      });

      lines.rotation.y += 0.001;

      renderer.render(scene, camera);
    };
    animate();

    // Scroll-based parallax
    gsap.to(camera.position, {
      z: 6,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });

    const handleResize = () => {
      camera.aspect = window.innerWidth / 600;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 600);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      shapes.forEach((shape) => shape.geometry.dispose());
      geometries.forEach((geo) => geo.dispose());
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".feature-title-word",
        { y: 100, opacity: 0, rotationX: -90 },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: "power4.out",
          scrollTrigger: { trigger: titleRef.current, start: "top 85%" },
        },
      );

      const cards = gsap.utils.toArray(".feature-card");
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 100, opacity: 0, rotateY: -15, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            rotateY: 0,
            scale: 1,
            duration: 1,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: { trigger: containerRef.current, start: "top 75%" },
          },
        );
      });

      gsap.to(".blob-svg", {
        scale: 1.05,
        rotation: 5,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "center center",
      });

      gsap.to(".product-img", {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.3,
      });

      const buttons = gsap.utils.toArray(".feature-btn");
      buttons.forEach((btn) => {
        const shine = btn.querySelector(".btn-shine");
        if (shine) {
          btn.addEventListener("mouseenter", () => {
            gsap.fromTo(
              shine,
              { x: "-100%" },
              { x: "100%", duration: 0.6, ease: "power2.out" },
            );
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [featuredProducts]); // Re-run when products load

  const handleCardHover = (e, entering) => {
    const card = e.currentTarget;
    if (entering) {
      gsap.to(card, { scale: 1.05, y: -10, duration: 0.3, ease: "power2.out" });
      gsap.to(card.querySelector(".blob-svg"), {
        scale: 1.1,
        rotation: 10,
        duration: 0.5,
        ease: "power2.out",
      });
    } else {
      gsap.to(card, { scale: 1, y: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(card.querySelector(".blob-svg"), {
        scale: 1,
        rotation: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  };

  if (!featuredProducts || featuredProducts.length === 0) return null;

  return (
    <section
      ref={containerRef}
      className="py-32 bg-black px-4 md:px-0 relative border-t border-white/10 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
      />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-20">
        <div
          ref={titleRef}
          className="flex flex-col md:flex-row justify-between items-end mb-20 px-2"
        >
          <div className="overflow-hidden">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-none tracking-tighter">
              <span className="feature-title-word inline-block">Loja</span>{" "}
              <span className="feature-title-word inline-block">de</span>{" "}
              <span className="feature-title-word inline-block text-transparent bg-clip-text bg-gradient-to-r from-gold via-white to-gold italic font-light">
                Cosméticos
              </span>{" "}
              <span className="feature-title-word inline-block">e</span>{" "}
              <span className="feature-title-word inline-block">Beleza</span>
            </h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="w-16 h-px bg-gradient-to-r from-gold to-transparent" />
              <span className="text-gold/50 text-xs font-mono uppercase tracking-widest">
                Premium Collection
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id || index}
              className="feature-card relative flex flex-col items-center justify-between group cursor-pointer"
              style={{ perspective: "1000px" }}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
              <div className="absolute -inset-4 bg-gold/0 group-hover:bg-gold/5 rounded-3xl blur-xl transition-all duration-500 pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <span className="px-3 py-1 bg-black border border-gold/30 text-gold text-[10px] font-mono uppercase tracking-widest rounded-full">
                  {product.category}
                </span>
              </div>

              <div
                className="relative w-full h-80 flex items-center justify-center -mb-3"
                onClick={() => navigate(`/produto/${product.id}`)}
              >
                <svg
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                  className="blob-svg absolute w-full h-full transition-transform duration-500"
                >
                  <defs>
                    <linearGradient
                      id={`goldPlatinum-${index}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#FFF4D6" stopOpacity="0.9" />
                      <stop
                        offset="35%"
                        stopColor="#E6C97A"
                        stopOpacity="0.8"
                      />
                      <stop
                        offset="65%"
                        stopColor="#D4A017"
                        stopOpacity="0.9"
                      />
                      <stop
                        offset="100%"
                        stopColor="#F1F1F1"
                        stopOpacity="0.7"
                      />
                    </linearGradient>
                    <filter id={`glow-${index}`}>
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path
                    className="blob-path"
                    fill={`url(#goldPlatinum-${index})`}
                    filter={`url(#glow-${index})`}
                    d="M39.6,-44.1C53.6,-35.5,68.7,-25.1,73.5,-11C78.3,3.1,72.8,21,64,37.7C55.2,54.5,43.2,70.2,28.2,74.2C13.2,78.2,-4.9,70.6,-21,62.6C-37.2,54.6,-51.4,46.2,-60.8,33.4C-70.2,20.6,-74.7,3.3,-74.1,-15.3C-73.4,-33.8,-67.6,-53.7,-54.4,-62.5C-41.2,-71.2,-20.6,-68.8,-3.9,-64.1C12.8,-59.5,25.6,-52.6,39.6,-44.1Z"
                    transform="translate(100 100)"
                  />
                </svg>
                <img
                  src={product.image_url || product.imageUrl}
                  alt={product.name}
                  className="product-img relative z-10 w-48 h-48 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
              </div>

              <h3 className="text-sm font-semibold tracking-wide text-white text-center relative">
                {product.name}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
              </h3>

              <button
                onClick={() => navigate(`/produto/${product.id}`)}
                className="feature-btn mt-6 px-8 py-3 bg-transparent border border-white/20 text-white text-xs tracking-widest uppercase relative overflow-hidden group/btn hover:border-gold transition-colors duration-300"
              >
                <span className="btn-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full" />
                <span className="relative z-10 group-hover/btn:text-gold transition-colors">
                  Comprar já
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
