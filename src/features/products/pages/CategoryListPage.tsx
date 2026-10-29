import { ShoppingPageFrame } from '../../../components/layout/ShoppingPageFrame';
import { ErrorState } from '../../../components/ui/ErrorState';
import React from 'react';
import { Row, Col, Card, Typography, Spin, Empty, Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../api/categoryApi';

const { Title, Text, Paragraph } = Typography;

export const CategoryListPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: rawCategories = [], isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['categories-public-list'],
    queryFn: () => categoryApi.list(true),
  });

  const categories = Array.isArray(rawCategories) ? rawCategories : [];

  return (
    <ShoppingPageFrame publicStyle={{ minHeight: '100vh', background: 'var(--bg-app, #F8F5FF)', color: 'var(--text-primary, #28243D)' }} contentStyle={{ maxWidth: 1240, margin: '0 auto', padding: '100px 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1} style={{ color: 'var(--text-primary, #28243D)', fontWeight: 800, margin: '0 0 12px' }}>
            Danh mục Tác phẩm Memento3D
          </Title>
          <Text style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '1rem', maxWidth: 600, display: 'inline-block' }}>
            Khám phá các dòng sản phẩm kỷ vật 3D được thiết kế theo chủ đề và mục đích lưu niệm độc đáo.
          </Text>
        </div>

        {isLoading || (isError && isFetching) ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => { void refetch(); }} />
        ) : categories.length === 0 ? (
          <Empty description={<span style={{ color: 'var(--text-secondary, #6A6282)' }}>Chưa có danh mục nào.</span>} />
        ) : (
          <Row className="shopping-catalog-grid" gutter={[24, 24]}>
            {categories.map((cat) => (
              <Col xs={24} sm={12} md={8} lg={6} key={cat.id}>
                <Card
                  hoverable
                  onClick={() => navigate(`/products?category=${cat.slug}`)}
                  style={{
                    background: 'var(--surface-card, #FFFFFF)',
                    border: '1px solid var(--border-default, #E2D9F7)',
                    borderRadius: 'var(--radius-card-standard, 24px)',
                    boxShadow: 'var(--shadow-card)',
                    overflow: 'hidden',
                    height: '100%',
                    transition: 'all 0.3s ease',
                  }}
                  styles={{ body: { padding: 20 } }}
                  cover={
                    <div
                      style={{
                        height: 180,
                        background: 'var(--surface-container, #F1EBFF)',
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
                        <div style={{ fontSize: '3rem', color: 'var(--primary, #7C5CFC)' }}>✨</div>
                      )}
                    </div>
                  }
                >
                  <Title level={4} style={{ color: 'var(--text-primary, #28243D)', margin: '0 0 8px', fontWeight: 700 }}>
                    {cat.name}
                  </Title>
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{ color: 'var(--text-secondary, #6A6282)', fontSize: '0.85rem', marginBottom: 16 }}
                  >
                    {cat.description || 'Các tác phẩm chế tác 3D tinh xảo.'}
                  </Paragraph>
                  <Button
                    type="link"
                    icon={<ArrowRightOutlined />}
                    style={{ padding: 0, color: 'var(--primary, #7C5CFC)', fontWeight: 600 }}
                  >
                    Khám phá sản phẩm
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        )}
    </ShoppingPageFrame>
  );
};
