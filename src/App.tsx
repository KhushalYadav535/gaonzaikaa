import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Menu from './components/Menu';
import Gallery from './components/Gallery';
import Contact from './components/Contact';

function App() {
  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />
      <Hero />
      <About />
      <Menu />
      <Gallery />
      <Contact />
    </div>
  );
}

export default App;