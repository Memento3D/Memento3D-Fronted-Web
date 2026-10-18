import React, { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { HowItWorks } from '../components/HowItWorks';
import { ProductShowcase } from '../components/ProductShowcase';
import { ThreeDExperience } from '../components/ThreeDExperience';
import { BenefitsSection } from '../components/BenefitsSection';
import { StorySection } from '../components/StorySection';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';
import '../styles/home.css';

export const HomePage: React.FC = () => {
  useEffect(() => {
    document.title = 'Memento3D — Memories, Reimagined in 3D | Personalized 3D Keepsakes';
    
    // Set meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Transform your favorite memories into personalized 3D keepsakes. Powered by AI neural photogrammetry and industrial-grade 3D print farms.'
      );
    }
  }, []);

  return (
    <div className="home-wrapper">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <ProductShowcase />
        <ThreeDExperience />
        <BenefitsSection />
        <StorySection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
