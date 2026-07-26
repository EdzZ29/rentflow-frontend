import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <About />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
