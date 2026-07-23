import Footer from '../components/Footer';
import Header from '../components/Header';
import Pricing from '../components/Pricing';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
