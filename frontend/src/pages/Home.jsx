import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="font-sans text-gray-800">
      
      {/* 1. NAVIGATION BAR (Public) */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-secondary">
          Artisan<span className="text-gray-800">Connect</span>
        </div>
        <div className="space-x-6">
          <Link to="/login" className="font-medium hover:text-secondary">Login</Link>
          <Link to="/register" className="bg-secondary text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-700 transition">
            Join Now
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Find reliable artisans</span>{' '}
                  <span className="block text-secondary">for your home needs</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Don't stress over broken pipes or faulty wiring. Connect with verified carpenters, plumbers, and electricians in your area instantly.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link to="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-secondary hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link to="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-secondary bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10">
                      Login
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        
        {/* Hero Image Side */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1581578731117-10d75d5ce3a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="Artisan working"
          />
        </div>
      </header>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-secondary font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Easy as 1-2-3
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900">Search</h3>
                <p className="mt-2 text-gray-500">
                  Browse profiles of skilled carpenters, masons, and plumbers near you.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900">Book</h3>
                <p className="mt-2 text-gray-500">
                  Select a date and describe your problem. Send a request instantly.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900">Get it Done</h3>
                <p className="mt-2 text-gray-500">
                  The artisan accepts the job, fixes the issue, and you relax.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <p>© 2026 ArtisanConnect. All rights reserved.</p>
          <div className="space-x-4">
            <a href="#" className="hover:text-gray-400">Privacy</a>
            <a href="#" className="hover:text-gray-400">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;