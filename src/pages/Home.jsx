import { Link } from 'react-router-dom';
import { FiFileText, FiCheck, FiList, FiAward, FiLock, FiSearch } from 'react-icons/fi';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-3xl md:text-5xl font-bold mb-6">
          Secure Certificate Validation on the <span className="text-[var(--primary-color)]">Blockchain</span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
          Issue, verify, and manage certificates with unparalleled security using blockchain technology.
          Eliminate certificate fraud and ensure the authenticity of your credentials.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/issue" className="btn btn-primary">
            Issue Certificate
          </Link>
          <Link to="/verify" className="btn btn-secondary">
            Verify Certificate
          </Link>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 bg-[var(--bg-secondary)]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Why Use This Web?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card hover:shadow-lg transition-shadow duration-300">
              <div className="mx-auto bg-[var(--primary-color)] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FiAward className="text-[var(--primary-color)] text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">Issue Certificates</h3>
              <p className="text-[var(--text-secondary)] text-center">
                Issue tamper-proof digital certificates that are securely stored on the Ethereum blockchain.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="card hover:shadow-lg transition-shadow duration-300">
              <div className="mx-auto bg-[var(--secondary-color)] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FiSearch className="text-[var(--secondary-color)] text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">Instant Verification</h3>
              <p className="text-[var(--text-secondary)] text-center">
                Verify the authenticity of certificates instantly with a simple search using the certificate ID.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="card hover:shadow-lg transition-shadow duration-300">
              <div className="mx-auto bg-[var(--accent-color)] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FiLock className="text-[var(--accent-color)] text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">Tamper-Proof</h3>
              <p className="text-[var(--text-secondary)] text-center">
                Leverage blockchain technology to ensure certificates cannot be altered or falsified.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="bg-[var(--primary-color)] text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Issue Certificate</h3>
                    <p className="text-[var(--text-secondary)]">
                      Upload certificate details and document. The certificate is stored on IPFS and registered on the blockchain.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-[var(--primary-color)] text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Receive Certificate ID</h3>
                    <p className="text-[var(--text-secondary)]">
                      Get a unique certificate ID that can be used to verify the certificate's authenticity.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-[var(--primary-color)] text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Verify Anytime</h3>
                    <p className="text-[var(--text-secondary)]">
                      Use the certificate ID to verify the authenticity of certificates instantly, with all details viewable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card p-0 overflow-hidden">
              <div className="bg-[var(--primary-color)] text-white py-3 px-6">
                <h4 className="font-bold">Sample Certificate</h4>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Student Name</p>
                    <p className="font-medium">John Doe</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Course Name</p>
                    <p className="font-medium">Blockchain Development</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Issue Date</p>
                    <p className="font-medium">June 15, 2023</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Certificate ID</p>
                    <p className="font-medium text-[var(--primary-color)] truncate">0x1a2b3c4d5e6f7g8h9i0j...</p>
                  </div>
                  <div className="pt-2">
                    <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm font-medium px-3 py-1 rounded-full inline-block flex items-center">
                      <FiCheck className="mr-1" /> Verified on Blockchain
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-[var(--primary-color)] text-white py-12 md:py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Issue tamper-proof certificates today or verify the authenticity of existing certificates.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/issue" className="btn bg-white text-[var(--primary-color)] hover:bg-opacity-90">
              Issue Certificate
            </Link>
            <Link to="/verify" className="btn bg-transparent border border-white hover:bg-white hover:text-[var(--primary-color)]">
              Verify Certificate
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 