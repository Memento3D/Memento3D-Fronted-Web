import React from 'react';
import { Card, Typography, Row, Col, Anchor, Tag, Button, Space, Divider } from 'antd';
import { ArrowLeftOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

export const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'privacy-1',
      title: '1. Giới thiệu và cam kết bảo vệ dữ liệu',
      content: (
        <>
          <Paragraph>
            Memento3D cam kết tôn trọng và bảo vệ quyền riêng tư cũng như dữ liệu cá nhân của mọi khách hàng. Chính sách quyền riêng tư này giải thích cách thức chúng tôi thu thập, sử dụng, lưu trữ, chia sẻ và bảo vệ dữ liệu của bạn khi đăng ký tài khoản, đăng nhập hoặc sử dụng dịch vụ trên nền tảng Memento3D.
          </Paragraph>
          <Paragraph>
            Chính sách này được xây dựng phù hợp với quy định của pháp luật Việt Nam về bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP) và các chuẩn mực bảo mật quốc tế.
          </Paragraph>
        </>
      ),
    },
    {
      id: 'privacy-2',
      title: '2. Các loại dữ liệu cá nhân được thu thập',
      content: (
        <>
          <Paragraph>
            Tùy thuộc vào phương thức tương tác và sử dụng dịch vụ, chúng tôi có thể thu thập các danh mục dữ liệu sau:
          </Paragraph>
          <ul style={{ paddingLeft: 20 }}>
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
          <Paragraph>
            Chúng tôi chỉ xử lý dữ liệu cá nhân cho các mục đích chính đáng, minh bạch và có cơ sở pháp lý:
          </Paragraph>
          <ul style={{ paddingLeft: 20 }}>
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
          <Paragraph>
            Hình ảnh và video tải lên nền tảng chỉ được sử dụng cho mục đích tạo mô hình 3D theo yêu cầu cụ thể của chính bạn.
          </Paragraph>
          <Paragraph>
            <strong>Cam kết đặc biệt:</strong> Memento3D không sử dụng hình ảnh chân dung hoặc mô hình cá nhân của khách hàng cho mục đích quảng cáo công khai, thương mại hóa hoặc huấn luyện mô hình trí tuệ nhân tạo (AI) chung mà không có văn bản thỏa thuận riêng biệt và rõ ràng từ bạn.
          </Paragraph>
        </>
      ),
    },
    {
      id: 'privacy-5',
      title: '5. Quản lý sự đồng ý và rút lại đồng ý',
      content: (
        <>
          <Paragraph>
            Việc đồng ý với Điều khoản sử dụng không cấu thành sự đồng ý mặc nhiên cho mọi hoạt động xử lý dữ liệu khác.
          </Paragraph>
          <Paragraph>
            Sự đồng ý nhận email tiếp thị, quảng cáo được tách biệt hoàn toàn thành ô chọn riêng và mặc định không được tích sẵn. Bạn có toàn quyền rút lại sự đồng ý tiếp thị này bất kỳ lúc nào thông qua cài đặt tài khoản hoặc nhấp vào liên kết hủy đăng ký ở cuối mỗi email mà không ảnh hưởng tới việc sử dụng dịch vụ cốt lõi.
          </Paragraph>
        </>
      ),
    },
    {
      id: 'privacy-6',
      title: '6. Lưu trữ và thời hạn bảo quản dữ liệu',
      content: (
        <>
          <Paragraph>
            Dữ liệu cá nhân được lưu trữ an toàn trong các hệ thống cơ sở dữ liệu có kiểm soát truy cập nghiêm ngặt.
          </Paragraph>
          <Paragraph>
            Dữ liệu IP và User-Agent phục vụ ghi nhận sự đồng ý (Audit Log) chỉ được lưu trữ trong thời hạn cần thiết nhằm bảo đảm bằng chứng tuân thủ pháp luật và sẽ được ẩn danh hoặc xóa sau khi hết thời hiệu quy định. Tệp hình ảnh gốc có thể được lưu trữ tạm thời trong quá trình xử lý đơn hàng và được xóa định kỳ theo chính sách lưu trữ của chúng tôi.
          </Paragraph>
        </>
      ),
    },
    {
      id: 'privacy-7',
      title: '7. Chia sẻ dữ liệu với bên thứ ba',
      content: (
        <>
          <Paragraph>
            Memento3D không bán, trao đổi hoặc cho thuê dữ liệu cá nhân của người dùng. Chúng tôi chỉ chia sẻ dữ liệu với các đối tác dịch vụ tin cậy trong phạm vi tối thiểu cần thiết:
          </Paragraph>
          <ul style={{ paddingLeft: 20 }}>
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
          <Paragraph>
            Bạn có các quyền hợp pháp đối với dữ liệu cá nhân của mình, bao gồm:
          </Paragraph>
          <ul style={{ paddingLeft: 20 }}>
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
          <Paragraph>
            Mọi yêu cầu thực hiện quyền chủ thể dữ liệu hoặc câu hỏi liên quan đến Chính sách quyền riêng tư này, vui lòng liên hệ:
          </Paragraph>
          <Paragraph>
            <strong>Bộ phận Bảo vệ Dữ liệu & Hỗ trợ Khách hàng Memento3D</strong>
            <br />
            Email: <strong>support@memento3d.com</strong>
            <br />
            Chúng tôi cam kết phản hồi và xử lý yêu cầu của bạn trong vòng 72 giờ làm việc.
          </Paragraph>
        </>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#090d16',
        color: '#f8fafc',
        padding: '32px 16px 80px',
      }}
    >
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        {/* Navigation Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 28,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
              }}
            >
              Quay lại
            </Button>
            <Link to="/">
              <Button
                icon={<HomeOutlined />}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                }}
              >
                Trang chủ
              </Button>
            </Link>
          </Space>

          <Space>
            <Link to="/terms">
              <Button type="text" style={{ color: '#38bdf8' }}>
                Điều khoản sử dụng &rarr;
              </Button>
            </Link>
            <Link to="/register">
              <Button
                type="primary"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                Đăng ký tài khoản
              </Button>
            </Link>
          </Space>
        </div>

        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '16px',
            padding: '32px 28px',
            marginBottom: 32,
          }}
        >
          <Space orientation="vertical" size={8}>
            <Space>
              <Tag color="#10b981" style={{ fontWeight: 700 }}>
                PHIÊN BẢN 1.0 (DỰ THẢO)
              </Tag>
              <Tag color="cyan">NGÀY SOẠN: 19/10/2026</Tag>
            </Space>
            <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 800 }}>
              MEMENTO3D — CHÍNH SÁCH QUYỀN RIÊNG TƯ VÀ BẢO VỆ DỮ LIỆU CÁ NHÂN
            </Title>
            <Paragraph style={{ color: '#94a3b8', margin: 0, fontSize: '0.925rem' }}>
              Cam kết bảo mật thông tin, hình ảnh mô hình 3D và minh bạch trong xử lý dữ liệu khách hàng.
            </Paragraph>
          </Space>
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
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                  }}
                  bodyStyle={{ padding: '24px 24px' }}
                >
                  <Title
                    level={4}
                    style={{
                      color: '#10b981',
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontWeight: 700,
                    }}
                  >
                    <LockOutlined style={{ fontSize: '18px' }} />
                    {sec.title}
                  </Title>
                  <div style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.925rem' }}>
                    {sec.content}
                  </div>
                </Card>
              ))}
            </div>
          </Col>

          {/* Sticky Table of Contents */}
          <Col xs={24} lg={7}>
            <div
              style={{
                position: 'sticky',
                top: 24,
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <Text strong style={{ color: '#ffffff', fontSize: '0.95rem', display: 'block', marginBottom: 14 }}>
                Mục lục chính sách
              </Text>
              <Divider style={{ margin: '10px 0', borderColor: 'rgba(255, 255, 255, 0.08)' }} />
              <Anchor
                affix={false}
                offsetTop={40}
                items={sections.map((s) => ({
                  key: s.id,
                  href: `#${s.id}`,
                  title: (
                    <span style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
                      {s.title}
                    </span>
                  ),
                }))}
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
