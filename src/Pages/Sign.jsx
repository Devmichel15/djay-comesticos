import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { gsap } from "gsap";
import * as THREE from "three";
import { User, Mail, Lock, ArrowLeft } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import "../toastify.css";
import { useAuth } from "../context/AuthContext";

function Sign() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [mode, setMode] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, login } = useAuth();
  
  const canvasRef = useRef(null);
  const formRef = useRef(null);
  const containerRef = useRef(null);

  // Three.js Background
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true 
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xd4a017,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Floating ring
    const ringGeometry = new THREE.TorusGeometry(3, 0.01, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xd4a017, 
      transparent: true, 
      opacity: 0.15 
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

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
      
      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0002;
      ring.rotation.z += 0.001;

      camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
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
      renderer.dispose();
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".sign-title",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );

      gsap.fromTo(".sign-subtitle",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.4 }
      );

      gsap.fromTo(".sign-input",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.5 }
      );

      gsap.fromTo(".sign-btn",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.8 }
      );
    }, formRef);

    return () => ctx.revert();
  }, [mode]);

  const SignUpUser = async (e) => {
    e.preventDefault();
    if (!name || !email || !pass) {
      toast.error("Preencha todos os campos");
      return;
    }
    setIsLoading(true);
    try {
      await signup(email, pass, name);
      toast.success("Conta criada com sucesso!");
      const from = location.state?.from || "/";
      navigate(from);
    } catch (err) {
      toast.error(err.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const SignInUser = async (e) => {
    e.preventDefault();
    if (!email || !pass) {
      toast.error("Preencha email e senha");
      return;
    }
    setIsLoading(true);
    try {
      await login(email, pass);
      toast.success("Conectado com sucesso!");
      const from = location.state?.from || "/";
      navigate(from);
    } catch (err) {
      toast.error(err.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setName("");
    setEmail("");
    setPass("");
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Three.js Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Back button */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white/50 hover:text-gold transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-mono uppercase tracking-wider text-xs">Voltar</span>
      </Link>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-px h-32 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-1/4 right-10 w-px h-32 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />

      {/* Form Container */}
      <div ref={formRef} className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="sign-title font-heading text-4xl md:text-5xl font-bold text-white tracking-tight">
            DJAY<span className="text-gold">.</span>
          </h1>
          <p className="sign-subtitle text-white/40 text-xs font-mono uppercase tracking-[0.3em] mt-3">
            {mode === "login" ? "Bem-vindo de volta" : "Junte-se a nós"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={mode === "login" ? SignInUser : SignUpUser} className="space-y-5">
          {/* Name - only for signup */}
          {mode === "signup" && (
            <div className="sign-input relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 py-4 pl-12 pr-4 text-sm focus:border-gold/50 focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Email */}
          <div className="sign-input relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 py-4 pl-12 pr-4 text-sm focus:border-gold/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div className="sign-input relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="Sua senha"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 py-4 pl-12 pr-4 text-sm focus:border-gold/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Forgot password - only for login */}
          {mode === "login" && (
            <div className="text-right">
              <button type="button" className="text-white/40 text-xs hover:text-gold transition-colors">
                Esqueceu a senha?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="sign-btn w-full py-4 bg-gold text-black font-semibold text-sm uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processando...
              </span>
            ) : (
              mode === "login" ? "Entrar" : "Criar Conta"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/20 text-xs font-mono uppercase tracking-wider">ou</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Switch mode */}
        <p className="text-center text-white/40 text-sm">
          {mode === "login" ? (
            <>
              Ainda não tem conta?{" "}
              <button 
                onClick={switchMode} 
                className="text-gold hover:text-white transition-colors font-medium"
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem uma conta?{" "}
              <button 
                onClick={switchMode} 
                className="text-gold hover:text-white transition-colors font-medium"
              >
                Entrar
              </button>
            </>
          )}
        </p>

        {/* Footer text */}
        <p className="text-center text-white/20 text-[10px] font-mono uppercase tracking-wider mt-10">
          Ao continuar, você aceita nossos termos de uso
        </p>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 right-8 w-16 h-16 border-r border-t border-white/5" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l border-b border-white/5" />

      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar
        theme="dark"
      />
    </div>
  );
}

export default Sign;
