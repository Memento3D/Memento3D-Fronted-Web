import React from 'react';
import { Card, Typography, Row, Col, Anchor, Tag, Button, Space, Divider, Tooltip } from 'antd';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  HomeOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import '../styles/legal.css';

const { Title, Paragraph, Text } = Typography;

export const TermsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const sections = [
    {
      id: 'sec-1',
      title: '1. Giới thiệu và phạm vi áp dụng',
      content: (
        <>
          <p>
            Memento3D là nền tảng giúp người dùng khám phá, đặt mua sản phẩm quà tặng cá nhân hóa, gửi hình ảnh để tạo bản xem trước và đặt dịch vụ tạo mô hình 3D/in 3D theo phạm vi tính năng thực tế được cung cấp.
          </p>
          <p>
            Điều khoản này áp dụng cho khách hàng đăng ký, đăng nhập, sử dụng tài khoản và dịch vụ tại nền tảng Memento3D. Đơn vị vận hành: <strong>Memento3D Team</strong>, địa chỉ liên hệ và email hỗ trợ chính thức: <strong>support@memento3d.com</strong>.
          </p>
        </>
      ),
    },
    {
      id: 'sec-2',
      title: '2. Điều kiện đăng ký tài khoản',
      content: (
        <>
          <p>
            Người dùng cung cấp thông tin chính xác, hợp pháp, có quyền sử dụng địa chỉ email đăng ký, và có đủ năng lực thực hiện giao dịch theo quy định áp dụng.
          </p>
          <p>
            Với người chưa thành niên hoặc bị hạn chế năng lực hành vi, cần sự tham gia/đồng ý của người đại diện khi pháp luật yêu cầu. Tài khoản tạo qua form hoặc qua Google đăng nhập lần đầu được gán vai trò <strong>Customer (ROLE_USER)</strong>, không tự có quyền quản trị hay các vai trò đặc quyền khác.
          </p>
        </>
      ),
    },
    {
      id: 'sec-3',
      title: '3. Phương thức đăng ký và bảo mật',
      content: (
        <>
          <p>
            Người dùng có thể đăng ký bằng email/mật khẩu hoặc sử dụng Google OAuth2/OIDC. Khi đăng ký bằng Google, Memento3D chỉ tiếp nhận các dữ liệu tài khoản được hiển thị trong Chính sách quyền riêng tư và các quyền truy cập đã thông báo (email, tên hiển thị, ảnh đại diện).
          </p>
          <p>
            Người dùng có trách nhiệm bảo vệ thông tin đăng nhập, thông báo ngay cho Memento3D nếu nghi ngờ tài khoản bị truy cập trái phép. Memento3D áp dụng xác minh quyền sở hữu email, giới hạn số lần đăng nhập và cơ chế mã hóa mật khẩu an toàn.
          </p>
        </>
      ),
    },
    {
      id: 'sec-4',
      title: '4. Chấp nhận điều khoản và quản lý sự đồng ý',
      content: (
        <>
          <p>
            Trước khi tạo tài khoản, người dùng được cung cấp Điều khoản sử dụng và Chính sách quyền riêng tư để xem. Người dùng phải chủ động đánh dấu đồng ý với Điều khoản sử dụng; ô chọn không được tích sẵn.
          </p>
          <p>
            Hệ thống ghi nhận phiên bản điều khoản, thời điểm và phương thức chấp nhận để quản lý bằng chứng giao dịch. Các đồng ý xử lý dữ liệu cá nhân cần thiết được thông báo và thu thập riêng khi pháp luật yêu cầu. Đồng ý nhận quảng cáo/ưu đãi là tùy chọn, được quản lý độc lập và có thể rút lại bất kỳ lúc nào.
          </p>
        </>
      ),
    },
    {
      id: 'sec-5',
      title: '5. Quyền và nghĩa vụ của người dùng',
      content: (
        <>
          <p>
            Người dùng có thể truy cập, cập nhật các thông tin tài khoản được hỗ trợ; xem lịch sử đơn hàng, yêu cầu hỗ trợ, thực hiện quyền đối với dữ liệu cá nhân theo Chính sách quyền riêng tư và pháp luật áp dụng.
          </p>
          <p>
            Người dùng cam kết không giả mạo danh tính, can thiệp trái phép hệ thống, phát tán mã độc, tải lên nội dung bất hợp pháp hoặc xâm phạm quyền và lợi ích hợp pháp của người khác.
          </p>
        </>
      ),
    },
    {
      id: 'sec-6',
      title: '6. Hình ảnh tải lên và quyền sử dụng nội dung',
      content: (
        <>
          <p>
            Người dùng cam kết có quyền sử dụng hình ảnh, chân dung và tài liệu đã tải lên, bao gồm sự cho phép cần thiết của người có trong ảnh khi pháp luật yêu cầu. Người dùng không được cung cấp nội dung xâm phạm sở hữu trí tuệ, quyền riêng tư hoặc danh dự người khác.
          </p>
          <p>
            Trong phạm vi cần thiết để thực hiện yêu cầu của người dùng, Memento3D và các đối tác xử lý phù hợp được phép xử lý nội dung theo mục đích và thời hạn mô tả tại Chính sách quyền riêng tư. Việc dùng ảnh/mô hình cho quảng cáo, huấn luyện AI hoặc công bố công khai không được mặc nhiên suy ra từ việc đăng ký tài khoản.
          </p>
        </>
      ),
    },
    {
      id: 'sec-7',
      title: '7. Bản xem trước, mô hình 3D và giới hạn kỹ thuật',
      content: (
        <>
          <p>
            Kết quả dựng mô hình 3D phụ thuộc chất lượng, số lượng, góc chụp và đặc điểm dữ liệu đầu vào. Bản xem trước miễn phí có thể giảm độ phân giải, có watermark và giới hạn lượt xử lý nếu các giới hạn đó được hiển thị rõ trước khi sử dụng.
          </p>
          <p>
            Memento3D không bảo đảm sản phẩm số hoặc vật lý trùng khớp tuyệt đối với ảnh ban đầu; các đặc tính, dung sai và lựa chọn vật liệu sẽ được công bố tại bước đặt hàng.
          </p>
        </>
      ),
    },
    {
      id: 'sec-8',
      title: '8. Sản phẩm, giá và đặt hàng',
      content: (
        <>
          <p>
            Mô tả, giá niêm yết, tùy chọn kích thước/vật liệu, phụ kiện, phí xử lý, phí vận chuyển và tổng số tiền phải thanh toán được thể hiện ở trang sản phẩm hoặc trước bước xác nhận đơn.
          </p>
          <p>
            Đơn hàng chỉ được ghi nhận theo trạng thái và thông báo xác nhận của hệ thống. Nếu một giá trị hiển thị sai do lỗi kỹ thuật, Memento3D sẽ thông báo và xử lý minh bạch trước khi tiếp tục thực hiện giao dịch, phù hợp quy định pháp luật.
          </p>
        </>
      ),
    },
    {
      id: 'sec-9',
      title: '9. Thanh toán, giao hàng, đổi trả và hoàn tiền',
      content: (
        <>
          <p>
            Phương thức thanh toán, đơn vị nhận tiền, điều kiện hủy/đổi trả, phí phát sinh, thời gian giao hàng dự kiến và cơ chế hoàn tiền được công bố trước khi người dùng xác nhận đặt hàng.
          </p>
          <p>
            Với sản phẩm cá nhân hóa hoặc làm theo yêu cầu, những giới hạn đổi trả (nếu có) phải được thông báo trước và không làm mất quyền bắt buộc của người tiêu dùng theo pháp luật.
          </p>
        </>
      ),
    },
    {
      id: 'sec-10',
      title: '10. Dữ liệu cá nhân và quyền riêng tư',
      content: (
        <>
          <p>
            Memento3D xử lý dữ liệu cá nhân theo mục đích được thông báo, gồm quản lý tài khoản, xác thực đăng nhập, hỗ trợ khách hàng và thực hiện đơn hàng, cùng những mục đích khác nếu có cơ sở pháp lý phù hợp.
          </p>
          <p>
            Các loại dữ liệu, bên nhận dữ liệu, thời gian lưu giữ, cách thực hiện quyền chủ thể dữ liệu và thông tin liên hệ được công bố tại Chính sách quyền riêng tư tại đường dẫn <Link to="/privacy">/privacy</Link>. Điều khoản này không thay thế chính sách quyền riêng tư hoặc các thông báo/đồng ý riêng khi cần.
          </p>
        </>
      ),
    },
    {
      id: 'sec-11',
      title: '11. Tạm ngừng hoặc chấm dứt tài khoản',
      content: (
        <>
          <p>
            Người dùng có thể yêu cầu khóa hoặc xóa tài khoản thông qua kênh hỗ trợ khách hàng. Memento3D có thể tạm ngừng tài khoản khi có dấu hiệu lạm dụng, xâm nhập, gian lận hoặc vi phạm nghiêm trọng, với thông báo và cơ chế khiếu nại thích hợp, trừ trường hợp phải hành động khẩn cấp để bảo vệ an toàn hệ thống.
          </p>
          <p>
            Việc giữ lại dữ liệu sau khi đóng tài khoản chỉ được thực hiện khi có căn cứ pháp lý hoặc nhu cầu thực hiện nghĩa vụ hợp pháp, theo chính sách công bố.
          </p>
        </>
      ),
    },
    {
      id: 'sec-12',
      title: '12. Thông báo và thay đổi điều khoản',
      content: (
        <>
          <p>
            Memento3D có thể cập nhật Điều khoản sử dụng để phản ánh thay đổi chức năng, quy trình hoặc yêu cầu pháp luật. Phiên bản và ngày áp dụng được công bố công khai.
          </p>
          <p>
            Với thay đổi quan trọng cần chấp thuận lại, hệ thống sẽ chủ động yêu cầu người dùng xem và đồng ý trước khi tiếp tục sử dụng chức năng liên quan; không tự động coi sự im lặng là đồng ý nếu pháp luật yêu cầu hành vi chấp thuận tích cực.
          </p>
        </>
      ),
    },
    {
      id: 'sec-13',
      title: '13. Hỗ trợ và giải quyết khiếu nại',
      content: (
        <>
          <p>
            Người dùng có thể gửi yêu cầu, phản ánh hoặc khiếu nại qua email <strong>support@memento3d.com</strong> hoặc cổng hỗ trợ khách hàng. Memento3D sẽ tiếp nhận, phản hồi và xử lý theo thời hạn được công bố, tuân thủ quyền của người tiêu dùng và quy định pháp luật áp dụng.
          </p>
          <p>
            Các tranh chấp được ưu tiên giải quyết bằng thương lượng; nếu không thành, được đưa tới cơ quan có thẩm quyền phù hợp theo pháp luật Việt Nam.
          </p>
        </>
      ),
    },
    {
      id: 'sec-14',
      title: '14. Điều khoản cuối cùng',
      content: (
        <>
          <p>
            Nếu một phần điều khoản không có hiệu lực theo pháp luật, các điều khoản còn lại vẫn được áp dụng trong giới hạn cho phép.
          </p>
          <p>
            Điều khoản này được giải thích theo pháp luật Việt Nam, không loại trừ hoặc hạn chế các quyền bắt buộc mà người tiêu dùng và chủ thể dữ liệu được pháp luật bảo vệ.
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

            <Link to="/privacy" className="legal-link-switch">
              Chính sách quyền riêng tư &rarr;
            </Link>

            <Link to="/register">
              <Button type="primary" className="legal-btn-primary">
                Đăng ký tài khoản
              </Button>
            </Link>
          </Space>
        </div>

        {/* Page Header */}
        <div className="legal-hero-card terms">
          <Space>
            <Tag
              style={{
                background: 'var(--primary-subtle, rgba(124, 92, 252, 0.12))',
                color: 'var(--primary, #7C5CFC)',
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
            MEMENTO3D — ĐIỀU KHOẢN SỬ DỤNG VÀ THỎA THUẬN TÀI KHOẢN
          </Title>
          <Paragraph className="legal-hero-desc">
            Vui lòng đọc kỹ các điều khoản dưới đây trước khi đăng ký tài khoản hoặc sử dụng dịch vụ của Memento3D.
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
                  <Title level={4} className="legal-section-title terms-accent">
                    <FileTextOutlined style={{ fontSize: '18px' }} />
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
                  Sẵn sàng gia nhập Memento3D?
                </Title>
                <Paragraph style={{ color: 'var(--text-secondary)', marginTop: 8, marginBottom: 20 }}>
                  Tạo tài khoản ngay hôm nay để khám phá quà tặng cá nhân hóa và các mô hình 3D độc bản.
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
                    Tạo tài khoản Customer
                  </Button>
                </Link>
              </Card>
            </div>
          </Col>

          {/* Sticky Table of Contents */}
          <Col xs={24} lg={7}>
            <div className="legal-toc-card">
              <Text className="legal-toc-title">
                Mục lục điều khoản
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
