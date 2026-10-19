import React from 'react';
import { Row, Col, Card, Typography, Spin, Empty, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../api/categoryApi';
import { Navbar } from '../../home/components/Navbar';
import { Footer } from '../../home/components/Footer';

const { Title, Text, Paragraph } = Typography;

export const CategoryListPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: rawCategories = [], isLoading } = useQuery({
    queryKey: ['categories-public-list'],
    queryFn: () => categoryApi.list(true),
  });

  const categories = Array.isArray(rawCategories) ? rawCategories : [];

  return (
    <div style={{ minHeight: '100vh', background: '#050811', color: '#f8fafc' }}>
      <Navbar />

      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '100px 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1} style={{ color: '#fff', fontWeight: 800, margin: '0 0 12px' }}>
            Danh mục Tác phẩm Memento3D
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 600, display: 'inline-block' }}>
            Khám phá các dòng sản phẩm kỷ vật 3D được thiết kế theo chủ đề và mục đích lưu niệm độc đáo.
          </Text>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
          </div>
        ) : categories.length === 0 ? (
          <Empty description={<span style={{ color: '#94a3b8' }}>Chưa có danh mục nào.</span>} />
        ) : (
          <Row gutter={[24, 24]}>
            {categories.map((cat) => (
              <Col xs={24} sm={12} md={8} lg={6} key={cat.id}>
                <Card
                  hoverable
                  onClick={() => navigate(`/products?category=${cat.slug}`)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 16,
                    overflow: 'hidden',
                    height: '100%',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: 20 }}
                  cover={
                    <div
                      style={{
                        height: 180,
                        background: '#090d16',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ fontSize: '3rem', color: '#38bdf8' }}>✨</div>
                      )}
                    </div>
                  }
                >
                  <Title level={4} style={{ color: '#fff', margin: '0 0 8px', fontWeight: 700 }}>
                    {cat.name}
                  </Title>
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 16 }}
                  >
                    {cat.description || 'Các tác phẩm chế tác 3D tinh xảo.'}
                  </Paragraph>
                  <Button
                    type="link"
                    icon={<ArrowRightOutlined />}
                    style={{ padding: 0, color: '#38bdf8', fontWeight: 600 }}
                  >
                    Khám phá sản phẩm
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </main>

      <Footer />
    </div>
  );
};
