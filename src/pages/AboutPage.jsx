import About from '../components/About';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <About />
      </main>
      <Footer />
    </div>
  );
}
