import { 
  Link, 
  Button,
  Divider 
} from "@heroui/react";
import { 
  Phone, 
  EnvelopeSimple, 
  MapPin, 
  FacebookLogo, 
  TwitterLogo, 
  LinkedinLogo, 
  InstagramLogo,
  Clock
} from "@phosphor-icons/react";

import Logo from "@/components/common/Logo";

const navigationLinks = [
  {
    title: "Về chúng tôi",
    links: [
      { name: "Giới thiệu", href: "/" },
      { name: "Đội ngũ tư vấn", href: "/" },
      { name: "Thành tích", href: "/" },
      { name: "Đối tác", href: "/" },
    ],
  },
  {
    title: "Dịch vụ",
    links: [
      { name: "Tư vấn tuyển sinh", href: "/" },
      { name: "Hỗ trợ hồ sơ", href: "/" },
      { name: "Luyện phỏng vấn", href: "/" },
      { name: "Học bổng", href: "/" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { name: "Câu hỏi thường gặp", href: "/" },
      { name: "Hướng dẫn", href: "/" },
      { name: "Liên hệ", href: "/" },
      { name: "Góp ý", href: "/" },
    ],
  },
];

const socialLinks = [
  { name: "Facebook", icon: FacebookLogo, href: "#" },
  { name: "Twitter", icon: TwitterLogo, href: "#" },
  { name: "LinkedIn", icon: LinkedinLogo, href: "#" },
  { name: "Instagram", icon: InstagramLogo, href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <Logo />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Hệ thống tư vấn tuyển sinh thông minh, hỗ trợ học sinh và phụ huynh 
              trong quá trình lựa chọn ngành nghề và trường đại học phù hợp.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={16} className="text-blue-600" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <EnvelopeSimple size={16} className="text-blue-600" />
                <span>contact@admissions.edu.vn</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin size={16} className="text-blue-600" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Clock size={16} className="text-blue-600" />
                <span>T2-T6: 8:00-17:30, T7: 8:00-12:00</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          {navigationLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">
              Nhận thông tin mới
            </h3>
            <p className="text-gray-600 text-sm">
              Đăng ký để nhận thông tin tuyển sinh và học bổng mới nhất.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email của bạn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <Button
                color="primary"
                className="w-full"
                size="sm"
              >
                Đăng ký
              </Button>
            </div>

            {/* Social Links */}
            <div className="pt-4">
              <h4 className="font-medium text-gray-900 mb-3 text-sm">
                Theo dõi chúng tôi
              </h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-blue-600 hover:text-white rounded-lg transition-colors duration-200"
                  >
                    <social.icon size={16} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Divider className="mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm">
            © 2024 RAG Admissions Consulting. Tất cả quyền được bảo lưu.
          </div>
          <div className="flex gap-6">
            <Link 
              href="/privacy" 
              className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
            >
              Chính sách bảo mật
            </Link>
            <Link 
              href="/terms" 
              className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
            >
              Điều khoản sử dụng
            </Link>
            <Link 
              href="/cookies" 
              className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
            >
              Chính sách Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 