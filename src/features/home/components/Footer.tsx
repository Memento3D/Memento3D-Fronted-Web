import React from 'react';
import { Row, Col } from 'antd';
import {
  CodeSandboxOutlined,
  MailOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  HeartFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './footer.css';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="memento-footer">
      <div className="home-container">
        <Row gutter={[48, 40]}>
          {/* Brand Info */}
          <Col xs={24} md={8}>
            <div className="footer-brand" onClick={() => navigate('/')}>
              <div className="footer-logo-icon">
                <CodeSandboxOutlined />
              </div>
              <span className="footer-brand-name">
                Memento<span className="brand-name-accent">3D</span>
              </span>
            </div>

            <p className="footer-brand-desc">
              Nền tảng kỷ vật 3D cá nhân hóa hàng đầu. Kết hợp công nghệ thị giác máy tính AI với hệ thống in 3D công nghiệp độ chính xác cao để hiện thực hóa những khoảnh khắc quý giá.
            </p>

            <div className="footer-contact-list">
              <div className="contact-item">
                <EnvironmentOutlined style={{ color: 'var(--primary)' }} />
                <span>Khu Công nghệ cao, TP. Thủ Đức, TP. Hồ Chí Minh</span>
              </div>
              <div className="contact-item">
                <MailOutlined style={{ color: 'var(--primary)' }} />
                <span>contact@memento3d.vn</span>
              </div>
              <div className="contact-item">
                <PhoneOutlined style={{ color: 'var(--primary)' }} />
                <span>(+84) 901 333 3D</span>
              </div>
            </div>
          </Col>

          {/* Column: Products */}
          <Col xs={12} sm={8} md={5}>
            <h5 className="footer-col-title">Sản phẩm & Kỷ vật</h5>
            <ul className="footer-links-list">
              <li>
                <span onClick={() => navigate('/products?keyword=figure')}>
                  Tượng Mini Figure cá nhân
                </span>
              </li>
              <li>
                <span onClick={() => navigate('/products?keyword=keychain')}>
                  Móc khóa 3D khắc tên
                </span>
              </li>
              <li>
                <span onClick={() => navigate('/products?keyword=tốt nghiệp')}>
                  Quà tốt nghiệp độc bản
                </span>
              </li>
              <li>
                <span onClick={() => navigate('/products?keyword=couple')}>
                  Quà tặng cặp đôi & Kỷ niệm
                </span>
              </li>
              <li>
                <span onClick={() => navigate('/products?keyword=pet')}>
                  Tượng thú cưng từ ảnh
                </span>
              </li>
            </ul>
          </Col>

          {/* Column: Services */}
          <Col xs={12} sm={8} md={5}>
            <h5 className="footer-col-title">Dịch vụ & Tính năng</h5>
            <ul className="footer-links-list">
              <li>
                <span onClick={() => navigate('/reconstruction/demo')}>
                  Tạo mô hình 3D từ ảnh
                </span>
              </li>
              <li>
                <span onClick={() => navigate('/categories')}>
                  Danh mục sản phẩm
                </span>
              </li>
              <li>
                <span onClick={() => navigate('/orders')}>
                  Theo dõi đơn hàng
                </span>
              </li>
              <li>
                <span onClick={() => navigate('/cart')}>
                  Giỏ hàng của bạn
                </span>
              </li>
            </ul>
          </Col>

          {/* Column: Legal & Support */}
          <Col xs={12} sm={8} md={6}>
            <h5 className="footer-col-title">Hỗ trợ & Chính sách</h5>
            <ul className="footer-links-list">
              <li>
                <span>Hướng dẫn chụp ảnh tạo 3D</span>
              </li>
              <li>
                <span>Chính sách đổi trả & Bảo hành in</span>
              </li>
              <li>
                <span onClick={() => navigate('/privacy')}>
                  Chính sách bảo mật & quyền riêng tư
                </span>
              </li>
              <li>
                <span onClick={() => navigate('/terms')}>
                  Điều khoản dịch vụ khách hàng
                </span>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Footer Bottom */}
        <div className="footer-bottom-bar">
          <div className="copyright-text">
            © {new Date().getFullYear()} Memento3D. All rights reserved. Chế tác với{' '}
            <HeartFilled style={{ color: '#ef4444', margin: '0 2px' }} /> tại Việt Nam.
          </div>

          <div className="footer-bottom-badges">
            <span className="footer-badge-item">SLA Industrial 8K</span>
            <span className="footer-badge-item">SSL 256-Bit Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
