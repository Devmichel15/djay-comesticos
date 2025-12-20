const Hero = () => {
    return (
        <section className="bg-[url('/bg-hero.jpg')] bg-cover bg-bottom h-screen">
            <div className="flex flex-col text-center items-center justify-center h-full">
                <h1 className="text-4xl md:text-5xl font-bold text-black">A sua loja de cosméticos</h1>
                <p className="text-black max-w-2xl">Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium tempora error blanditiis quos molestias magni sit excepturi fuga soluta fugiat.</p>
                <a href="#" className="mt-4 px-6 py-2 bg-[#D4AF37] text-white rounded-full hover:bg-goldSoft transition">Ver mais</a>
            </div>
        </section>
    );
}

export default Hero;
