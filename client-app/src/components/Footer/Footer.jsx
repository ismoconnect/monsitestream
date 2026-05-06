import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Mail, Phone, MapPin, Instagram, Twitter } from 'lucide-react';

import { images } from '../../utils/images';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white w-full max-w-full overflow-hidden">
      <div className="container mx-auto px-6 py-12 max-w-full">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <div className="flex items-center mb-4">
              <div className="bg-white p-2 rounded-lg inline-block">
                <img
                  src={images.branding.logo}
                  alt={images.branding.alt}
                  className="h-12 w-auto object-contain"
                />
              </div>
            </div>

            <p className="text-gray-300 mb-6 max-w-md">
              Accompagnatrice de luxe offrant des services personnalisés avec discrétion et élégance.
              Votre satisfaction et votre confidentialité sont mes priorités.
            </p>

            <div className="flex space-x-4">
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center hover:bg-pink-500/30 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center hover:bg-purple-500/30 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Mes Services
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Galerie
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-pink-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-pink-400 mr-3" />
                <span className="text-gray-300 text-sm">contact@liliana.com</span>
              </div>

              <div className="flex items-center">
                <Phone className="w-4 h-4 text-pink-400 mr-3" />
                <span className="text-gray-300 text-sm">+33 6 XX XX XX XX</span>
              </div>

              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-pink-400 mr-3" />
                <span className="text-gray-300 text-sm">Paris & Région</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-8 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="w-4 h-4 text-pink-400 mr-2" />
              <span className="text-gray-300 text-sm">
                Confidentialité et discrétion garanties
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <a href="#" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                Politique de confidentialité
              </a>
              <a href="#" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                Conditions d'utilisation
              </a>
              <span className="text-gray-500 text-sm">
                © 2024 Liliana. Tous droits réservés.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
