import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Phone, X } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    comments: ''
  });

  const [showComments, setShowComments] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const offersRef = useRef<HTMLDivElement>(null);
  const brandsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 60000);

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShowPopup(true);
      }
    };

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-view');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsClosing(false);
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        comments: ''
      });
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const executeRecaptcha = async () => {
    try {
      return await window.grecaptcha.execute('6LdZSuMqAAAAACxLSkJ8KgkthaLrFcqLDs2VKX_X', { action: 'submit' });
    } catch (error) {
      console.error('Error executing reCAPTCHA:', error);
      return null;
    }
  };

  const submitToWebhook = async (data: typeof formData, recaptchaToken: string) => {
    try {
      const response = await fetch('https://hook.eu2.make.com/9bgn1tqn4k8r1t942j1na8l7eb4g38vk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken,
          source: 'website_form',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const recaptchaToken = await executeRecaptcha();
      
      if (!recaptchaToken) {
        throw new Error('Failed to execute reCAPTCHA');
      }

      const success = await submitToWebhook(formData, recaptchaToken);
      
      if (success) {
        setIsSubmitted(true);
      } else {
        alert('Hubo un error al enviar el formulario. Por favor, inténtelo de nuevo.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Hubo un error al enviar el formulario. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderThankYouMessage = () => (
    <div className="text-center p-8 animate-fade-in">
      <h3 className="text-2xl font-bold mb-4">¡Gracias {formData.name}!</h3>
      <p className="text-lg mb-6">
        Hemos recibido tu solicitud correctamente. En breve nos pondremos en contacto contigo.
      </p>
      <button
        onClick={handleClose}
        className="bg-[#9c0720] hover:bg-[#666666] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
      >
        Cerrar
      </button>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          name="name"
          placeholder="Tu Nombre"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
      </div>
      <div>
        <input
          type="email"
          name="email"
          placeholder="Tu Email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
      </div>
      <div>
        <input
          type="tel"
          name="phone"
          placeholder="Tu Teléfono"
          value={formData.phone}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
      </div>
      <div>
        <textarea
          name="comments"
          placeholder="¿Quieres comentarnos algo?"
          value={formData.comments}
          onChange={handleInputChange}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all h-24"
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-red-800 hover:bg-red-900 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-200 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? 'Enviando...' : 'Solicitar Información'}
      </button>
      
      <p className="text-xs text-gray-400 mt-4">
        Al hacer clic en enviar, declaras haber leído y aceptado la política de privacidad de audifonosgranviabilbao.com.
      </p>
    </form>
  );

  return (
    <div className="min-h-screen bg-black text-white relative pb-[60px] sm:pb-0">
      {/* Fixed bottom bar for mobile */}
      <div className="fixed bottom-0 left-0 right-0 h-[60px] bg-white z-50 flex items-center justify-around sm:hidden">
        <a 
          href="tel:944987951" 
          className="flex items-center justify-center space-x-2 text-[#9c0720]"
        >
          <Phone className="w-6 h-6" />
          <span className="font-semibold">Llamar</span>
        </a>
        <a 
          href="https://wa.me/34688696427" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center space-x-2 text-[#25D366]"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="font-semibold">WhatsApp</span>
        </a>
      </div>

      {showPopup && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isClosing ? 'popup-overlay closing' : 'popup-overlay'}`}>
          <div className={`relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 ${isClosing ? 'popup-content closing' : 'popup-content'}`}>
            <button 
              onClick={handleClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="grid md:grid-cols-2">
              <div className="relative hidden md:block">
                <img 
                  src="https://www.miempresa.online/wp-content/uploads/2025/02/audifonos-invisible.jpg"
                  alt="Audifonos"
                  className="w-full h-full object-cover rounded-l-xl"
                />
              </div>
              
              <div className="p-8 flex flex-col justify-center">
                {isSubmitted ? renderThankYouMessage() : (
                  <>
                    <h2 className="text-gray-900 text-3xl font-bold mb-6">
                      Te ayudamos a{' '}
                      <span className="block">encontrar el{' '}
                        <span className="text-[#9c0720]">mejor precio</span>
                      </span>
                      <span className="block">para tus audífonos</span>
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <input
                        type="text"
                        name="name"
                        placeholder="Tu Nombre"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-[#9c0720] focus:ring-1 focus:ring-[#9c0720] transition-all placeholder-gray-400 text-gray-900"
                        required
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Tu Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-[#66c5c5] focus:ring-1 focus:ring-[#9c0720] transition-all placeholder-gray-400 text-gray-900"
                        required
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Tu Teléfono"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-[#9c0720] focus:ring-1 focus:ring-[#9c0720] transition-all placeholder-gray-400 text-gray-900"
                        required
                      />
                      <textarea
                        name="comments"
                        placeholder="¿Quieres comentarnos algo?"
                        value={formData.comments}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:border-[#9c0720] focus:ring-1 focus:ring-[#9c0720] transition-all placeholder-gray-400 text-gray-900 h-24"
                      />
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-[#9c0720] hover:bg-[#666666] text-white font-semibold py-3.5 px-6 rounded-lg transition-all duration-300 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        {isSubmitting ? 'Enviando...' : 'Solicitar Información'}
                      </button>
                      
                      <p className="text-xs text-gray-500 text-center">
                        Al hacer clic en enviar declaras haber leído y aceptado la{' '}
                        <a href="https://www.audifonosgranviabilbao.com/politica-de-privacidad" className="text-[#9c0720] hover:text-[#666666] transition-colors">
                          política de privacidad
                        </a>
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <section ref={formRef} className="relative bg-gradient-to-r from-gray-900 to-black pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative animate-fade-in-left">
              <img 
                src="https://www.miempresa.online/wp-content/uploads/2025/02/audifonos-al-mejor-precio.jpg"
                alt="Persona usando audífonos"
                className="rounded-lg shadow-2xl w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 rounded-lg"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="space-y-6">
                  <div className="text-4xl font-bold tracking-tight">
                    Por tiempo limitado
                  </div>
                  <div className="bg-[#9c0720] px-8 py-4 rounded-lg shadow-lg">
                    <span className="block text-2xl font-bold">¡1 MES DE PRUEBA GRATIS!</span>
                    <span className="text-lg opacity-90">Sin compromiso</span>
                  </div>
                  <div className="bg-black/80 backdrop-blur-sm px-8 py-4 rounded-lg shadow-lg">
                    <span className="block text-2xl font-bold text-gray-400 line-through">Antes: 2500€</span>
                    <span className="block text-2xl font-bold text-red-800">Ahora: 995€ (-60%)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-xl animate-fade-in-right">
              <h2 className="text-3xl font-bold mb-2">
                Te ayudamos a encontrar el{' '}
                <span className="text-red-800">mejor precio</span> para tus audífonos
              </h2>
              <p className="text-gray-300 mb-6">Completa el formulario y te contactaremos con la mejor oferta</p>
              
              {isSubmitted ? renderThankYouMessage() : renderForm()}
            </div>
          </div>
        </div>
      </section>

      <header className="relative h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-fixed"
          style={{
            backgroundImage: 'url(https://www.miempresa.online/wp-content/uploads/2025/02/audifonos.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <nav className="fixed top-0 w-full p-6 bg-white shadow-md z-40">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex-1 sm:flex-none flex justify-center sm:justify-start">
              <img 
                src="https://www.audifonosgranviabilbao.com/uploads/logos/audifonosgranviabilbao.png"
                alt="Gran Vía Clínicas Audiológicas"
                className="h-6 sm:h-12"
              />
            </div>
            <div className="hidden sm:flex flex-1 justify-center items-center space-x-12">
              <button 
                onClick={() => scrollToSection(formRef)}
                className="text-gray-800 hover:text-[#9c0720] transition-colors duration-300"
              >
                Solicitar información
              </button>
              <button 
                onClick={() => scrollToSection(benefitsRef)}
                className="text-gray-800 hover:text-[#9c0720] transition-colors duration-300"
              >
                Beneficios
              </button>
              <button 
                onClick={() => scrollToSection(brandsRef)}
                className="text-gray-800 hover:text-[#9c0720] transition-colors duration-300"
              >
                Marcas
              </button>
              <button 
                onClick={() => scrollToSection(offersRef)}
                className="text-gray-800 hover:text-[#9c0720] transition-colors duration-300"
              >
                Ofertas
              </button>
            </div>
            <div className="w-[100px] sm:block hidden"></div>
          </div>
        </nav>
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="max-w-3xl px-6 animate-on-scroll">
            <h1 className="text-6xl font-bold mb-6">-60% DESCUENTO</h1>
            <p className="text-xl mb-8">¡1 més de prueba gratis!</p>
            <button 
              onClick={() => scrollToSection(formRef)}
              className="cta-button bg-white text-black px-8 py-3 rounded-full font-semibold"
            >
              Solicitar oferta
            </button>
          </div>
        </div>
      </header>

      <section ref={benefitsRef} className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center animate-on-scroll">
            <h3 className="text-2xl font-bold mb-4">Revisión auditiva gratis</h3>
            <p className="text-gray-400">Evaluamos tu audición sin compromiso para detectar problemas y ofrecerte la mejor solución personalizada.</p>
          </div>
          <div className="text-center animate-on-scroll">
            <h3 className="text-2xl font-bold mb-4">Prueba gratuita de audífonos</h3>
            <p className="text-gray-400">Prueba nuestros audífonos sin coste durante un mes y experimenta una mejor calidad de sonido.</p>
          </div>
          <div className="text-center animate-on-scroll">
            <h3 className="text-2xl font-bold mb-4">Entregamos los audífonos</h3>
            <p className="text-gray-400">Recibe tus audífonos en el menor tiempo posible, ajustados a tus necesidades auditivas específicas.</p>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section ref={brandsRef} className="py-20 bg-white text-black">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Trabajamos con las mejores marcas</h2>
          
          <div className="logos-slider-container overflow-hidden relative">
            <div className="logos-slider flex animate-marquee">
              <div className="logo-item flex-shrink-0 px-8">
                <img 
                  src="https://www.guiadelaudifono.com/cacheimgwebp/AudifonosSignia?zc=2&w=500&h=500&src=/uploads/casas/eu/guiadelaudifono/tablas/signia.png" 
                  alt="Signia"
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="logo-item flex-shrink-0 px-8">
                <img 
                  src="https://www.guiadelaudifono.com/cacheimgwebp/AudifonosPhonak?zc=2&w=500&h=500&src=/uploads/casas/eu/guiadelaudifono/tablas/phonak.png" 
                  alt="Phonak"
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="logo-item flex-shrink-0 px-8">
                <img 
                  src="https://www.guiadelaudifono.com/cacheimgwebp/AudifonosOticon?zc=2&w=500&h=500&src=/uploads/casas/eu/guiadelaudifono/tablas/oticon.png" 
                  alt="Oticon"
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="logo-item flex-shrink-0 px-8">
                <img 
                  src="https://www.guiadelaudifono.com/cacheimgwebp/AudifonosResound?zc=2&w=500&h=500&src=/uploads/casas/eu/guiadelaudifono/tablas/resound.png" 
                  alt="ReSound"
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="logo-item flex-shrink-0 px-8">
                <img 
                  src="https://www.guiadelaudifono.com/cacheimgwebp/AudifonosWidex?zc=2&w=500&h=500&src=/uploads/casas/eu/guiadelaudifono/tablas/widex.png" 
                  alt="Widex"
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="logo-item flex-shrink-0 px-8">
                <img 
                  src="https://www.guiadelaudifono.com/cacheimgwebp/AudifonosStarkey?zc=2&w=500&h=500&src=/uploads/casas/eu/guiadelaudifono/tablas/starkey.png" 
                  alt="Starkey"
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              
              {/* Duplicate logos for seamless looping */}
              <div className="logo-item flex-shrink-0 px-8">
                <img 
                  src="https://www.guiadelaudifono.com/cacheimgwebp/AudifonosSignia?zc=2&w=500&h=500&src=/uploads/casas/eu/guiadelaudifono/tablas/signia.png" 
                  alt="Signia"
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="logo-item flex-shrink-0 px-8">
                <img 
                  src="https://www.guiadelaudifono.com/cacheimgwebp/AudifonosPhonak?zc=2&w=500&h=500&src=/uploads/casas/eu/guiadelaudifono/tablas/phonak.png" 
                  alt="Phonak"
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="logo-item flex-shrink-0 px-8">
                <img 
                  src="https://www.guiadelaudifono.com/cacheimgwebp/AudifonosOticon?zc=2&w=500&h=500&src=/uploads/casas/eu/guiadelaudifono/tablas/oticon.png" 
                  alt="Oticon"
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="logo-item flex-shrink-0 px-8">
                <img 
                  src="https://www.guiadelaudifono.com/cacheimgwebp/AudifonosResound?zc=2&w=500&h=500&src=/uploads/casas/eu/guiadelaudifono/tablas/resound.png" 
                  alt="ReSound"
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="logo-item flex-shrink-0 px-8">
                <img 
                  src="https://www.guiadelaudifono.com/cacheimgwebp/AudifonosWidex?zc=2&w=500&h=500&src=/uploads/casas/eu/guiadelaudifono/tablas/widex.png" 
                  alt="Widex"
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <div className="logo-item flex-shrink-0 px-8">
                <img 
                  src="https://www.guiadelaudifono.com/cacheimgwebp/AudifonosStarkey?zc=2&w=500&h=500&src=/uploads/casas/eu/guiadelaudifono/tablas/starkey.png" 
                  alt="Starkey"
                  className="h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg mb-6">Trabajamos con las marcas líderes en el mercado para ofrecerte la mejor calidad y tecnología en audífonos</p>
            <button 
              onClick={() => scrollToSection(formRef)}
              className="bg-[#9c0720] hover:bg-[#666666] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Solicitar información
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Nuestros Modelos de Audífonos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="p-6">
                <img 
                  src="https://www.miempresa.online/wp-content/uploads/2025/02/Silk-Charge-Go-IX_black_pair_shadow_1000x1000.jpg" 
                  alt="Alain Afflelou Incognito IC16"
                  className="w-full h-48 object-contain mb-4"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mejores precios</h3>
                <p className="text-gray-600 mb-4">Consigue audífonos al mejor precio y con 1 mes de prueba gratis sin compromiso.</p>
                <button 
                  onClick={() => scrollToSection(formRef)}
                  className="w-full bg-[#9c0720] text-white py-2 px-4 rounded-lg hover:bg-[#666666] transition-colors duration-300"
                >
                  Conseguir descuento
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="p-6">
                <img 
                  src="https://www.miempresa.online/wp-content/uploads/2025/02/Styletto-IX_black_silver_double_1000x1000.jpg" 
                  alt="Resound ONE a medida"
                  className="w-full h-48 object-contain mb-4"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Modernos</h3>
                <p className="text-gray-600 mb-4">Representa una generación nueva de audífonos. Son audífonos recargables para disfrutar de lo mejor de los audífonos y de los auriculares.</p>
                <button 
                  onClick={() => scrollToSection(formRef)}
                  className="w-full bg-[#9c0720] text-white py-2 px-4 rounded-lg hover:bg-[#666666] transition-colors duration-300"
                >
                  Conseguir descuento
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300">
              <div className="p-6">
                <img 
                  src="https://www.miempresa.online/wp-content/uploads/2025/02/Pure-Charge-Go-IX_graphite_pair_1000x1000.jpg" 
                  alt="Phonak Virto Paradise"
                  className="w-full h-48 object-contain mb-4"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Discretos</h3>
                <p className="text-gray-600 mb-4">Audífonos con un diseño discreto y personalizado para cada usuario. Ofrecen una brillante comprensión de la palabra y sonido natural.</p>
                <button 
                  onClick={() => scrollToSection(formRef)}
                  className="w-full bg-[#9c0720] text-white py-2 px-4 rounded-lg hover:bg-[#666666] transition-colors duration-300"
                >
                  Conseguir descuento
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={offersRef} className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <img 
                src="https://www.audifonosgranviabilbao.com/uploads/casas/rd/audifonosgranviabilbao/webs/WhatsApp_Image_2020_11_12_at_11.14.45.jpg"
                alt="Studio Pro"
                className="rounded-lg w-full"
              />
              <div className="flex w-full overflow-hidden max">
                <div className="bg-[#8B1538] text-white py-3 px-6 flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm uppercase">PRECIO OFERTA</div>
                    <div className="text-3xl font-bold">995€</div>
                  </div>
                </div>
                <div className="bg-black text-white py-3 px-6 flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm uppercase">PRECIO ORIGINAL</div>
                    <div className="text-3xl font-bold line-through">2490€</div>
                  </div>
                </div>
                <div className="bg-[#C88B9F] text-white py-3 px-6 flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm uppercase">DESCUENTO</div>
                    <div className="text-3xl font-bold">60%</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6">Audífonos recargable sin pilas</h2>
              <p className="text-gray-400 mb-8">
                incluido el cargador, rehabilitación auditiva valorada en 500€, seguro a todo riesgo incluido, revisiones gratuitas de por vida, por sólo 995€ en lugar de 2.499€ (60% de descuento).
              </p>
              <button 
                onClick={() => scrollToSection(formRef)}
                className="group bg-[#9c0720] hover:bg-[#666666] text-white px-8 py-4 rounded-lg transition-all duration-300 flex items-center space-x-3"
              >
                <span className="font-semibold">¡Lo quiero!</span>
                <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white text-black text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">SOLICITA INFORMACIÓN</h2>
          <p className="text-xl mb-8">Sin compromiso</p>
          <button 
            onClick={() => scrollToSection(formRef)}
            className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition"
          >
            Solicitar
          </button>
        </div>
      </section>

      <footer className="bg-black py-12  px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Copyright © Clinica Gran via Bilbao</a></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2 text-gray-400">
              <li><a href="https://www.audifonosgranviabilbao.com/aviso-legal" target="_blank" rel="noopener noreferrer" className="hover:text-white">Aviso legal</a></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2 text-gray-400">
              <li><a href="https://www.audifonosgranviabilbao.com/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" className="hover:text-white">Términos y Condiciones</a></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2 text-gray-400">
              <li><a href="https://www.audifonosgranviabilbao.com/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="hover:text-white">Política de Privacidad</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;