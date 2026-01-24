import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '../ui/button';

const Footer: React.FC = () => {
  const footerLinks = {
    'Platform': [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Register Land', href: '/register' },
      { name: 'My Properties', href: '/my-lands' },
    ],
    'Resources': [
      { name: 'Documentation', href: '#' },
      { name: 'API Reference', href: '#' },
      { name: 'Smart Contracts', href: '#' },
    ],
    'Support': [
      { name: 'Help Center', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'Bug Reports', href: '#' },
    ],
    'Legal': [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:contact@landchain.com', label: 'Email' },
  ];

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LandChain
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Revolutionizing land registry with blockchain technology. 
              Secure, transparent, and immutable property ownership records.
            </p>
            
            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <a
                    href={social.href}
                    aria-label={social.label}
                    className="hover:text-primary"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2024 LandChain. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>🔒 SSL Secured</span>
            <span>⛓️ Ethereum</span>
            <span>📡 IPFS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;