// src/components/Footer.jsx - ✅ Bilingual + Social + Links
import { useTranslation } from "react-i18next";
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Footer({ isAuthenticated, role }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const customerLinks = [
    { path: "/customer", label: t("dashboard.customer") },
    { path: "/catalog", label: t("nav.collection") },
    { path: "/settings", label: t("settings.navLabel", "Settings") },
  ];

  const brandLinks = [
    { path: "/brand", label: t("brand.overview.title") },
    { path: "/brand/quote", label: t("brand.quote.title") },
    { path: "/settings", label: t("settings.navLabel", "Settings") },
  ];

  const dashboardLinks = role === "brand" ? brandLinks : customerLinks;

  return (
    <footer>
      <div className="max-w-7xl mx-auto pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3
              onClick={() => navigate("/")}
              className="font-serif text-2xl cursor-pointer text-[#D9A441] tracking-tight"
            >
              Linces'CKF
            </h3>
            <p className="text-[#4f331a] leading-relaxed">
              {t("footer.description") ||
                "Premium silk garments & bespoke manufacturing services."}
            </p>
            <div className="flex space-x-4 pt-4">
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="group"
              >
                <Facebook className="h-6 w-6 text-[#4f331a] group-hover:text-[#D9A441] transition-colors cursor-pointer" />
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="group"
              >
                <Instagram className="h-6 w-6 text-[#4f331a] group-hover:text-[#D9A441] transition-colors cursor-pointer" />
              </a>
              <a
                href="https://linkedin.com"
                aria-label="LinkedIn"
                className="group"
              >
                <Linkedin className="h-6 w-6 text-[#4f331a] group-hover:text-[#D9A441] transition-colors cursor-pointer" />
              </a>
              <a
                href="https://web.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="group"
              >
                <img
                  src="/whatsapp.svg"
                  alt="WhatsApp"
                  className="h-6 w-6 group-hover:opacity-70 transition-all cursor-pointer"
                />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6 uppercase tracking-wide">
              {t("footer.quickLinks") || "Quick Links"}
            </h4>

            <ul className="space-y-3">
              {!isAuthenticated && (
                <>
                  <li
                    className="hover:text-[#D9A441] transition-colors cursor-pointer"
                    onClick={() => navigate("/")}
                  >
                    {t("nav.home")}
                  </li>
                  <li
                    className="hover:text-[#D9A441] transition-colors cursor-pointer"
                    onClick={() => navigate("/services")}
                  >
                    {t("nav.services")}
                  </li>
                  <li
                    className="hover:text-[#D9A441] transition-colors cursor-pointer"
                    onClick={() => navigate("/about")}
                  >
                    {t("nav.about")}
                  </li>
                </>
              )}

              {isAuthenticated &&
                dashboardLinks.map((link) => (
                  <li
                    key={link.path}
                    onClick={() => navigate(`${link.path}`)}
                    className="hover:text-[#D9A441] transition-colors cursor-pointer"
                  >
                    {link.label}
                  </li>
                ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-lg mb-6 uppercase tracking-wide">
              {t("footer.company") || "Company"}
            </h4>
            <ul className="space-y-3">
              {!isAuthenticated && (
                <li>
                  <a
                    href="/contact"
                    className="hover:text-[#D9A441] transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" /> {t("footer.contactUs")}
                  </a>
                </li>
              )}
              <li
                className="hover:text-[#D9A441] transition-colors cursor-pointer"
                onClick={() => navigate("/privacy")}
              >
                {t("footer.privacy") || "Privacy Policy"}
              </li>
              <li
                className="hover:text-[#D9A441] transition-colors cursor-pointer"
                onClick={() => navigate("/terms")}
              >
                {t("footer.terms") || "Terms of Service"}
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-6 uppercase tracking-wide">
              {t("footer.contact") || "Contact"}
            </h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-1 text-[#D9A441] shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-1 text-[#D9A441] shrink-0" />
                <span>linceswdmwdm@gmail.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-1 text-[#D9A441] shrink-0" />
                <span>
                  {t("footer.address") || "123 Silk Street, Fashion District"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-4 pb-2 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            {t("footer.line1", { year: new Date().getFullYear() })}
          </p>
          <p className="text-sm">{t("footer.line2")}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
