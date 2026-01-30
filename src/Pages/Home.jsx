import React, { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PremiumNavbar from "../Components/PremiumNavbar";
import Hero3D from "../Components/Hero3D";
import FeatureGrid from "../Components/FeatureGrid";
import TransitionSection from "../Components/TransitionSection";
import BestSellersSection from "../Components/BestSellersSection";
import FooterCTA from "../Components/FooterCTA";

gsap.registerPlugin(ScrollTrigger);

// Optional: specific page background or container
function Home() {
  // Clean up any potential overflow issues from previous installs
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Smooth scroll behavior
    gsap.config({
      nullTargetWarn: false,
    });

    // Refresh ScrollTrigger after all content loads
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="bg-black min-h-screen overflow-x-hidden">
      <PremiumNavbar />

      <main>
        <Hero3D />
        <FeatureGrid />
        <TransitionSection />
        <BestSellersSection />
      </main>

      <FooterCTA />
    </div>
  );
}

export default Home;
