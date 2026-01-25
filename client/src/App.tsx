import Navbar from "./components/LandingPage/Navbar";
import Hero from "./components/LandingPage/Hero";
import Features from "./components/LandingPage/Features";
import Highlights from "./components/LandingPage/Highlights";
import Pricing from "./components/LandingPage/Pricing";
import Footer from "./components/LandingPage/Footer";

function App() {
  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-900 overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Highlights />
      <Pricing />
      <Footer />
    </div>
  );
}

export default App;
