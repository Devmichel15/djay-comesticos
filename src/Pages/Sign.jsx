import { FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi";
import { useState } from "react";
import { Link } from "react-router-dom";

function Sign() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState(0);
  const [pass, setPass] = useState("");

  const SignInUser = () => {
    if (name && email && number && pass) {
      console.log("usuario está inscrito");
    }
    console.log("preencha todos os campos")
  };
  
  return (
    <div className="relative flex flex-col md:flex-row min-h-screen items-center justify-center bg-black font-body">
      {/* Imagem */}
      <div className="absolute inset-0 md:relative">
        <img
          className="w-full h-full object-cover opacity-40 md:opacity-100 md:w-96 md:h-96 md:rounded-l-2xl"
          src="/login-img.jpg"
          alt="Login"
        />
      </div>

      {/* Formulário */}
      <div className="relative z-10 flex items-center justify-center w-full h-full md:w-auto">
        <div className="bg-[#F5F5DC] p-6 md:p-8 rounded-r-2xl w-80 md:w-96 flex flex-col gap-3 md:h-96 shadow-xl border border-[#D4AF37]">
          {/* Título */}
          <h2 className="text-3xl font-heading text-[#D4AF37] text-center mb-2">
            Criar Conta
          </h2>

          {/* Inputs com ícones */}
          <div className="flex items-center border border-gray-300 rounded-lg bg-white p-2 focus-within:ring-2 focus-within:ring-[#D4AF37] transition">
            <FiUser className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Seu nome"
              className="flex-1 p-2 outline-none font-body"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center border border-gray-300 rounded-lg bg-white p-2 focus-within:ring-2 focus-within:ring-[#D4AF37] transition">
            <FiMail className="text-gray-400 mr-2" />
            <input
              type="email"
              placeholder="Seu email"
              className="flex-1 p-2 outline-none font-body"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center border border-gray-300 rounded-lg bg-white p-2 focus-within:ring-2 focus-within:ring-[#D4AF37] transition">
            <FiPhone className="text-gray-400 mr-2" />
            <input
              type="number"
              placeholder="Seu número"
              className="flex-1 p-2 outline-none font-body"
              onChange={(e) => setNumber(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center border border-gray-300 rounded-lg bg-white p-2 focus-within:ring-2 focus-within:ring-[#D4AF37] transition">
            <FiLock className="text-gray-400 mr-2" />
            <input
              type="password"
              placeholder="Sua senha"
              className="flex-1 p-2 outline-none font-body"
              onChange={(e) => setPass(e.target.value)}
              required
            />
          </div>

          {/* Botão */}
          <button
            onClick={SignInUser}
            className="mt-1 bg-[#D4AF37] hover:bg-[#b8942c] text-black font-semibold py-3 rounded-lg transition font-body"
          >
            Criar Conta
          </button>

          {/* Link para login */}
          <p className="text-sm text-black md:text-white text-center mt-2 font-body">
            Já tem conta?{" "}
            <Link to="/">
              <span className="text-[#D4AF37] font-semibold hover:underline cursor-pointer">
                Entrar
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Sign;
