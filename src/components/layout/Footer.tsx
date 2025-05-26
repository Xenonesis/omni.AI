import React from 'react';
import { motion } from 'framer-motion';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center mb-4"
            >
              <span className="text-primary-800 font-bold text-xl">omniverse</span>
              <span className="text-accent-600 font-light text-xl">.AI</span>
            </motion.div>
            <p className="text-neutral-600 text-sm">
              Finding the best deals on limited-edition items using advanced voice AI technology.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-neutral-600 hover:text-primary-600 transition-colors text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="/search" className="text-neutral-600 hover:text-primary-600 transition-colors text-sm">
                  Search
                </a>
              </li>
              <li>
                <a href="/saved" className="text-neutral-600 hover:text-primary-600 transition-colors text-sm">
                  Saved Deals
                </a>
              </li>
              <li>
                <a href="/settings" className="text-neutral-600 hover:text-primary-600 transition-colors text-sm">
                  Settings
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-800 mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <a
                href="#"
                className="text-neutral-600 hover:text-primary-600 transition-colors"
                aria-label="Github"
              >
                <Github size={20} />
              </a>
              <a
                href="#"
                className="text-neutral-600 hover:text-primary-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:contact@omniverse.ai"
                className="text-neutral-600 hover:text-primary-600 transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
            <p className="text-neutral-500 text-xs">
              © {new Date().getFullYear()} omniverse.AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;