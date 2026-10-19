import React, { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { HomeSearchBar } from '../components/HomeSearchBar';
import { SuggestedCategoriesSection } from '../components/SuggestedCategoriesSection';
import { FeaturedProductsSection } from '../components/FeaturedProductsSection';
import { PopularProductsSection } from '../components/PopularProductsSection';
import { NewArrivalsSection } from '../components/NewArrivalsSection';
import { Personalized3DSection } from '../components/Personalized3DSection';
import { WhyMemento3DSection } from '../components/WhyMemento3DSection';
import { Footer } from '../components/Footer';
import '../styles/home.css';

export const HomePage: React.FC = () => {
  useEffect(() => {
    document.title = 'Memento3D — Kỷ vật 3D Cá nhân hóa | Physical Keepsakes & 3D Printing';

    // Set meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Biến khoảnh khắc của bạn thành mô hình 3D độc nhất. Tải ảnh lên, tạo mô hình 3D và biến những kỷ niệm đáng nhớ thành sản phẩm cá nhân hóa với độ nét công nghiệp.'
      );
    }
  }, []);

  return (
    <div className="home-wrapper">
      <Navbar />
      <main>
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Large Search Bar */}
        <HomeSearchBar />

        {/* 3. Suggested Categories */}
        <SuggestedCategoriesSection />

        {/* 4. Featured Products */}
        <FeaturedProductsSection />

        {/* 5. Popular Products */}
        <PopularProductsSection />

        {/* 6. New Arrivals */}
        <NewArrivalsSection />

        {/* 7. Personalized 3D Service CTA */}
        <Personalized3DSection />

        {/* 8. Why Memento3D */}
        <WhyMemento3DSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
