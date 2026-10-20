import React from 'react';
import { Card, Typography, Row, Col, Anchor, Tag, Button, Space, Divider, Tooltip } from 'antd';
import {
  ArrowLeftOutlined,
  LockOutlined,
  HomeOutlined,
  SunOutlined,
  MoonOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import '../styles/legal.css';

const { Title, Paragraph, Text } = Typography;

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const sections = [
    {
      id: 'privacy-1',
      title: '1. Giới thiệu và cam kết bảo vệ dữ liệu',
      content: (
        <>
          <p>
            Memento3D cam kết tôn trọng và bảo vệ quyền riêng tư cũng như dữ liệu cá nhân của mọi khách hàng. Chính sách quyền riêng tư này giải thích cách thức chúng tôi thu thập, sử dụng, lưu trữ, chia sẻ và bảo vệ dữ liệu của bạn khi đăng ký tài khoản, đăng nhập hoặc sử dụng dịch vụ trên nền tảng Memento3D.
          </p>
          <p>
            Chính sách này được xây dựng phù hợp với quy định của pháp luật Việt Nam về bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP) và các chuẩn mực bảo mật quốc tế.
          </p>
        </>
      ),
    },
    {
      id: 'privacy-2',
      title: '2. Các loại dữ liệu cá nhân được thu thập',
      content: (
        <>
          <p>
            Tùy thuộc vào phương thức tương tác và sử dụng dịch vụ, chúng tôi có thể thu thập các danh mục dữ liệu sau:
          </p>
          <ul>
            <li>
              <strong>Thông tin định danh và tài khoản:</strong> Họ và tên, địa chỉ email, mật khẩu (đã được băm an toàn bằng thuật toán BCrypt, hệ thống không lưu mật khẩu dạng văn bản thuần), ảnh đại diện (avatar).
            </li>
            <li>
              <strong>Thông tin liên kết Google (OAuth2/OIDC):</strong> Mã định danh duy nhất (Google sub ID), địa chỉ email do Google cung cấp, trạng thái xác thực email từ Google.
            </li>
            <li>
              <strong>Dữ liệu hình ảnh và nội dung số:</strong> Hình ảnh, video, chân dung hoặc tệp dữ liệu 3D mà người dùng chủ động tải lên để tạo mô hình xem trước hoặc đặt in 3D.
            </li>
            <li>
              <strong>Dữ liệu kỹ thuật và bằng chứng giao dịch (Audit):</strong> Địa chỉ IP, chuỗi User-Agent trình duyệt, thời điểm ghi nhận đồng ý điều khoản (acceptedAt), phiên bản điều khoản (termsVersion).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'privacy-3',
      title: '3. Mục đích và căn cứ xử lý dữ liệu',
      content: (
        <>
          <p>
            Chúng tôi chỉ xử lý dữ liệu cá nhân cho các mục đích chính đáng, minh bạch và có cơ sở pháp lý:
          </p>
          <ul>
            <li>
              <strong>Cung cấp dịch vụ tài khoản:</strong> Tạo lập, xác minh quyền sở hữu email, quản lý phiên đăng nhập và bảo vệ tài khoản Customer.
            </li>
            <li>
              <strong>Thực hiện hợp đồng và đơn hàng:</strong> Tiếp nhận hình ảnh, tái tạo mô hình 3D, gia công in ấn, giao hàng và thanh toán.
            </li>
            <li>
              <strong>Hỗ trợ khách hàng:</strong> Giải đáp thắc mắc, tiếp nhận khiếu nại, hỗ trợ kỹ thuật liên quan đến bản dựng 3D.
            </li>
            <li>
              <strong>Thông tin sản phẩm và ưu đãi (Tùy chọn):</strong> Gửi email giới thiệu sản phẩm mới hoặc ưu đãi đặc quyền CHỈ KHI người dùng đã chủ động tích chọn đồng ý.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'privacy-4',
      title: '4. Xử lý hình ảnh và dữ liệu quét 3D',
      content: (
        <>
          <p>
            Hình ảnh và video tải lên nền tảng chỉ được sử dụng cho mục đích tạo mô hình 3D theo yêu cầu cụ thể của chính bạn.
          </p>
          <p>
            <strong>Cam kết đặc biệt:</strong> Memento3D không sử dụng hình ảnh chân dung hoặc mô hình cá nhân của khách hàng cho mục đích quảng cáo công khai, thương mại hóa hoặc huấn luyện mô hình trí tuệ nhân tạo (AI) chung mà không có văn bản thỏa thuận riêng biệt và rõ ràng từ bạn.
          </p>
        </>
      ),
    },
    {
      id: 'privacy-5',
      title: '5. Quản lý sự đồng ý và rút lại đồng ý',
      content: (
        <>
          <p>
            Việc đồng ý với Điều khoản sử dụng không cấu thành sự đồng ý mặc nhiên cho mọi hoạt động xử lý dữ liệu khác.
          </p>
          <p>
            Sự đồng ý nhận email tiếp thị, quảng cáo được tách biệt hoàn toàn thành ô chọn riêng và mặc định không được tích sẵn. Bạn có toàn quyền rút lại sự đồng ý tiếp thị này bất kỳ lúc nào thông qua cài đặt tài khoản hoặc nhấp vào liên kết hủy đăng ký ở cuối mỗi email mà không ảnh hưởng tới việc sử dụng dịch vụ cốt lõi.
          </p>
        </>
      ),
    },
    {
      id: 'privacy-6',
      title: '6. Lưu trữ và thời hạn bảo quản dữ liệu',
      content: (
        <>
          <p>
            Dữ liệu cá nhân được lưu trữ an toàn trong các hệ thống cơ sở dữ liệu có kiểm soát truy cập nghiêm ngặt.
          </p>
          <p>
            Dữ liệu IP và User-Agent phục vụ ghi nhận sự đồng ý (Audit Log) chỉ được lưu trữ trong thời hạn cần thiết nhằm bảo đảm bằng chứng tuân thủ pháp luật và sẽ được ẩn danh hoặc xóa sau khi hết thời hiệu quy định. Tệp hình ảnh gốc có thể được lưu trữ tạm thời trong quá trình xử lý đơn hàng và được xóa định kỳ theo chính sách lưu trữ của chúng tôi.
          </p>
        </>
      ),
    },
    {
      id: 'privacy-7',
      title: '7. Chia sẻ dữ liệu với bên thứ ba',
      content: (
        <>
          <p>
            Memento3D không bán, trao đổi hoặc cho thuê dữ liệu cá nhân của người dùng. Chúng tôi chỉ chia sẻ dữ liệu với các đối tác dịch vụ tin cậy trong phạm vi tối thiểu cần thiết:
          </p>
          <ul>
            <li>Cổng thanh toán điện tử được cấp phép (để xử lý giao dịch an toàn).</li>
            <li>Đơn vị vận chuyển (để giao sản phẩm vật lý tới địa chỉ của bạn).</li>
            <li>Dịch vụ lưu trữ đám mây đạt chứng chỉ bảo mật (như Cloudinary) để lưu trữ tệp tin đã mã hóa.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'privacy-8',
      title: '8. Quyền của chủ thể dữ liệu',
      content: (
        <>
          <p>
            Bạn có các quyền hợp pháp đối với dữ liệu cá nhân của mình, bao gồm:
          </p>
          <ul>
            <li>Quyền được biết và xem thông tin dữ liệu cá nhân đang được xử lý.</li>
            <li>Quyền yêu cầu chỉnh sửa, cập nhật thông tin không chính xác.</li>
            <li>Quyền yêu cầu xóa dữ liệu hoặc đóng tài khoản khi không còn nhu cầu sử dụng.</li>
            <li>Quyền rút lại sự đồng ý đã cấp trước đó.</li>
            <li>Quyền khiếu nại nếu phát hiện dữ liệu bị sử dụng sai mục đích.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'privacy-9',
      title: '9. Liên hệ và khiếu nại quyền riêng tư',
      content: (
        <>
          <p>
            Mọi yêu cầu thực hiện quyền chủ thể dữ liệu hoặc câu hỏi liên quan đến Chính sách quyền riêng tư này, vui lòng liên hệ:
          </p>
          <p>
            <strong>Bộ phận Bảo vệ Dữ liệu & Hỗ trợ Khách hàng Memento3D</strong>
            <br />
            Email: <strong>support@memento3d.com</strong>
            <br />
            Chúng tôi cam kết phản hồi và xử lý yêu cầu của bạn trong vòng 72 giờ làm việc.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="legal-page-wrapper">
      <div className="legal-container">
        {/* Navigation Bar */}
        <div className="legal-topbar">
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="legal-btn-ghost"
            >
              Quay lại
            </Button>
            <Link to="/">
              <Button
                icon={<HomeOutlined />}
                className="legal-btn-ghost"
              >
                Trang chủ
              </Button>
            </Link>
          </Space>

          <Space size={12}>
            <Tooltip title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}>
              <Button
                icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
                className="legal-btn-ghost"
              />
            </Tooltip>

            <Link to="/terms" className="legal-link-switch">
              Điều khoản sử dụng &rarr;
            </Link>

            <Link to="/register">
              <Button type="primary" className="legal-btn-primary">
                Đăng ký tài khoản
              </Button>
            </Link>
          </Space>
        </div>

        {/* Page Header */}
        <div className="legal-hero-card privacy">
          <Space>
            <Tag
              style={{
                background: 'var(--mint-subtle, rgba(201, 232, 213, 0.35))',
                color: 'var(--tertiary, #466253)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '2px 10px',
              }}
            >
              PHIÊN BẢN 1.0 (DỰ THẢO)
            </Tag>
            <Tag
              style={{
                background: 'var(--surface-container, #F1EBFF)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontWeight: 600,
                borderRadius: '8px',
                padding: '2px 10px',
              }}
            >
              NGÀY SOẠN: 19/10/2026
            </Tag>
          </Space>
          <Title level={2} className="legal-hero-title">
            MEMENTO3D — CHÍNH SÁCH QUYỀN RIÊNG TƯ VÀ BẢO VỆ DỮ LIỆU CÁ NHÂN
          </Title>
          <Paragraph className="legal-hero-desc">
            Cam kết bảo mật thông tin, hình ảnh mô hình 3D và minh bạch trong xử lý dữ liệu khách hàng.
          </Paragraph>
        </div>

        {/* Content Layout */}
        <Row gutter={[32, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={17}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {sections.map((sec) => (
                <Card
                  id={sec.id}
                  key={sec.id}
                  className="legal-section-card"
                  styles={{ body: { padding: '24px 28px' } }}
                >
                  <Title level={4} className="legal-section-title privacy-accent">
                    <LockOutlined style={{ fontSize: '18px' }} />
                    {sec.title}
                  </Title>
                  <div className="legal-content-body">
                    {sec.content}
                  </div>
                </Card>
              ))}

              {/* Bottom agreement call to action */}
              <Card
                className="legal-cta-card"
                styles={{ body: { padding: '36px 28px' } }}
              >
                <SafetyCertificateOutlined
                  style={{
                    fontSize: '40px',
                    color: 'var(--primary)',
                    marginBottom: 12,
                  }}
                />
                <Title level={4} style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
                  An tâm tuyệt đối cùng Memento3D
                </Title>
                <Paragraph style={{ color: 'var(--text-secondary)', marginTop: 8, marginBottom: 20 }}>
                  Dữ liệu ảnh và mô hình của bạn được mã hóa an toàn và chỉ phục vụ gia công chế tác theo yêu cầu.
                </Paragraph>
                <Link to="/register">
                  <Button
                    type="primary"
                    size="large"
                    className="legal-btn-primary"
                    style={{
                      height: '46px',
                      padding: '0 32px',
                    }}
                  >
                    Tạo tài khoản ngay
                  </Button>
                </Link>
              </Card>
            </div>
          </Col>

          {/* Sticky Table of Contents */}
          <Col xs={24} lg={7}>
            <div className="legal-toc-card">
              <Text className="legal-toc-title">
                Mục lục chính sách
              </Text>
              <Divider />
              <Anchor
                affix={false}
                offsetTop={40}
                items={sections.map((s) => ({
                  key: s.id,
                  href: `#${s.id}`,
                  title: s.title,
                }))}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
