const Hero = () => {
  return (
    <section className="bg-[url('/bg-hero.jpg')] bg-cover bg-bottom h-screen">
      <div className="flex flex-col text-center items-center justify-center h-full px-4">
        <h1 className="text-4xl md:text-5xl text-black font-mono font-semibold leading-tight">
          Descubra a Beleza que Transforma
        </h1>
        <p className="text-black max-w-2xl mt-4 text-2xl font-light">
          Encontre os melhores cosméticos para realçar sua confiança e revelar
          sua verdadeira essência. Qualidade, inovação e estilo em um só lugar.
        </p>
        <a
          href="#"
          className="mt-6 px-8 py-3 bg-[#D4AF37] text-white rounded-full hover:bg-goldSoft transition font-semibold shadow-lg"
        >
          Explore Agora
        </a>
      </div>
    </section>
  );
};

export default Hero;
