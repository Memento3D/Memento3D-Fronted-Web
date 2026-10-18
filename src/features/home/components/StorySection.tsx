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
    tag: 'Academic Milestone',
    tagColor: 'cyan',
    title: 'Graduation & Life Transitions',
    narrative:
      'The ceremonial gown, the proud handshake with professors, the diploma held high. Capturing that breakthrough moment into a desk sculpture that serves as an enduring anchor for future ambitions.',
    quote: '"Seeing my graduation moment cast in physical form brings back all the late nights and hard-won triumph every single morning."',
  },
  {
    icon: <SmileOutlined style={{ fontSize: 24, color: '#818cf8' }} />,
    tag: 'Family Legacy',
    tagColor: 'purple',
    title: 'Generational Bonds',
    narrative:
      'Grandparents sharing a quiet smile on the porch, a toddler’s first steps, or parents celebrating forty years together. Preserving their gentle warmth in sculpted relief that children and grandchildren can touch.',
    quote: '"Photographs fade into phone folders with tens of thousands of other pictures. A tactile sculpture belongs on the mantelpiece forever."',
  },
  {
    icon: <HeartFilled style={{ fontSize: 24, color: '#f43f5e' }} />,
    tag: 'Beloved Companions',
    tagColor: 'magenta',
    title: 'Faithful Companions & Pets',
    narrative:
      'The dog that waited at the door every evening, the cat curled up on winter mornings. Our pets give us unconditional love throughout their lives. A custom 3D memorial keeps their loyal spirit close at hand.',
    quote: '"Holding a 3D bust of our golden retriever captures his exact cocked-head expression. It brought tears of joyful remembrance to our whole family."',
  },
  {
    icon: <CrownOutlined style={{ fontSize: 24, color: '#eab308' }} />,
    tag: 'Unforgettable Romance',
    tagColor: 'gold',
    title: 'Weddings & Anniversaries',
    narrative:
      'The walk down the aisle, the quiet whisper after the first dance, the sunset on the honeymoon shore. Transform the defining snapshot of your love story into a timeless artisan heirloom.',
    quote: '"Instead of a traditional framed photo, we gave each other a bronze composite of our first embrace. It remains the centerpiece of our home."',
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
            <span>Emotional Storytelling</span>
          </div>
          <h2 className="section-title">
            Some moments deserve <span className="gradient-text-indigo">more than a photograph.</span>
          </h2>
          <p className="section-subtitle">
            A digital snapshot gets lost in a camera roll of thousands. A physical keepsake has presence, tactile weight, and the permanence to be cherished across generations.
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
