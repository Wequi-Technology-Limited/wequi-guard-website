import { Shield, Twitter, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/assets/wequi-guard.png"; // adjust path


const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                <img
                  src={Logo}
                  alt="WequiGuard logo"
                  className="h-[50px] w-auto"
                />
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Shielding Your Digital World. Effortlessly.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.linkedin.com/company/wequi/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>

              <a
                href="https://www.linkedin.com/company/wequi/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>

              <a
                href="mailto:support@wequiguard.com"
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>

          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/setup" className="text-muted-foreground hover:text-primary transition-colors">
                  Setup Guide
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <p className="text-sm text-muted-foreground">
              Questions? We're here to help.
            </p>
            <a
              href="mailto:support@wequiguard.com"
              className="text-sm text-primary hover:underline inline-block mt-2"
            >
              support@wequiguard.com
            </a>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} WequiGuard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
