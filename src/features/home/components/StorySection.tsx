import React from 'react';
import { Row, Col, Tag } from 'antd';
import {
  HeartFilled,
  SmileOutlined,
  TrophyOutlined,
  CrownOutlined,
} from '@ant-design/icons';

interface StoryCard {
  icon: React.ReactNode;
  tag: string;
  tagColor: string;
  title: string;
  narrative: string;
  quote: string;
}

const STORIES: StoryCard[] = [
  {
    icon: <TrophyOutlined style={{ fontSize: 24, color: '#38bdf8' }} />,
    tag: 'Cột mốc Học tập',
    tagColor: 'cyan',
    title: 'Tốt nghiệp & Những bước ngoặt Cuộc đời',
    narrative:
      'Tấm áo cử nhân, cái bắt tay tự hào cùng thầy cô, tấm bằng tốt nghiệp giơ cao. Lưu giữ khoảnh khắc bứt phá ấy vào một tác phẩm điêu khắc để bàn, nguồn cảm hứng bất tận cho những hoài bão tương lai.',
    quote: '"Ngắm nhìn khoảnh khắc tốt nghiệp được đúc thành vật phẩm mỗi sáng giúp tôi nhớ về những đêm thức trắng và chiến thắng xứng đáng."',
  },
  {
    icon: <SmileOutlined style={{ fontSize: 24, color: '#818cf8' }} />,
    tag: 'Gia đình & Cội nguồn',
    tagColor: 'purple',
    title: 'Gắn kết Các thế hệ',
    narrative:
      'Khoảnh khắc ông bà mỉm cười hiền hậu ngoài hiên nhà, bước đi chập chững đầu đời của con trẻ hay kỷ niệm 40 năm ngày cưới của cha mẹ. Lưu lại hơi ấm thân thương thành bức phù điêu mà con cháu có thể chạm vào.',
    quote: '"Ảnh chụp sẽ chìm vào quên lãng giữa hàng chục ngàn bức ảnh trong máy. Tác phẩm điêu khắc hữu hình sẽ ngự trị mãi mãi nơi phòng khách."',
  },
  {
    icon: <HeartFilled style={{ fontSize: 24, color: '#f43f5e' }} />,
    tag: 'Thú cưng Yêu quý',
    tagColor: 'magenta',
    title: 'Người bạn Trung thành',
    narrative:
      'Chú cún luôn đợi bạn trước cửa mỗi chiều, chú mèo cuộn tròn sưởi ấm những sớm mùa đông. Thú cưng trao tặng ta tình yêu vô điều kiện. Một bức tượng lưu niệm 3D giúp bạn luôn cảm nhận được người bạn trung thành bên cạnh.',
    quote: '"Cầm trên tay bức tượng 3D của chú cún cưng với đúng ánh mắt nghiêng đầu quen thuộc đã mang lại những giọt nước mắt xúc động cho cả gia đình tôi."',
  },
  {
    icon: <CrownOutlined style={{ fontSize: 24, color: '#eab308' }} />,
    tag: 'Tình yêu Vĩnh cửu',
    tagColor: 'gold',
    title: 'Hôn lễ & Kỷ niệm Ngày cưới',
    narrative:
      'Từng bước chân bước vào lễ đường, lời thì thầm ngọt ngào sau điệu nhảy đầu tiên, buổi hoàng hôn trên bờ biển tuần trăng mật. Chuyển hóa khoảnh khắc định nghĩa tình yêu của hai bạn thành tác phẩm thủ công vượt thời gian.',
    quote: '"Thay vì đóng khung một bức ảnh cưới thông thường, chúng tôi chọn đúc bức tượng composite ghi lại cái ôm đầu tiên. Đó luôn là điểm nhấn thiêng liêng nhất trong tổ ấm."',
  },
];

export const StorySection: React.FC = () => {
  return (
    <section id="story" className="home-section" style={{ background: 'rgba(7, 10, 18, 0.7)' }}>
      <div className="home-container">
        {/* Story Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-badge">
            <HeartFilled style={{ color: '#f43f5e' }} />
            <span>Câu chuyện Cảm xúc</span>
          </div>
          <h2 className="section-title">
            Có những khoảnh khắc xứng đáng <span className="gradient-text-indigo">nhiều hơn một bức ảnh.</span>
          </h2>
          <p className="section-subtitle">
            Một bức ảnh kỹ thuật số dễ bị lãng quên giữa hàng ngàn bức ảnh trong điện thoại. Một kỷ vật hữu hình mang sức sống, cảm giác cầm nắm thực tế và giá trị lưu truyền qua nhiều thế hệ.
          </p>
        </div>

        {/* Narrative Cards Grid */}
        <Row gutter={[24, 24]}>
          {STORIES.map((story, idx) => (
            <Col xs={24} md={12} key={idx}>
              <div
                className="home-glass-card"
                style={{
                  padding: 32,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(150deg, rgba(20, 27, 45, 0.75) 0%, rgba(10, 15, 26, 0.85) 100%)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {story.icon}
                    </div>
                    <Tag color={story.tagColor} style={{ borderRadius: 6, fontWeight: 700 }}>
                      {story.tag}
                    </Tag>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
                    {story.title}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: 20 }}>
                    {story.narrative}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: 16,
                    fontStyle: 'italic',
                    fontSize: '0.85rem',
                    color: '#cbd5e1',
                    lineHeight: 1.5,
                  }}
                >
                  {story.quote}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};
export default StorySection;
