import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Typography, Space } from 'antd';
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught runtime error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            background: '#050811',
            color: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 640,
              width: '100%',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 20,
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(239, 68, 68, 0.1)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                fontSize: '2rem',
              }}
            >
              <BugOutlined />
            </div>

            <Title level={3} style={{ color: '#fff', margin: '0 0 12px', fontWeight: 800 }}>
              {this.props.fallbackTitle || 'Đã xảy ra sự cố hiển thị giao diện'}
            </Title>

            <Paragraph style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 28 }}>
              Ứng dụng gặp lỗi không mong muốn khi tải dữ liệu hoặc hiển thị thành phần này.
              Dữ liệu của bạn được lưu an toàn trên hệ thống.
            </Paragraph>

            <Space wrap size="middle" orientation="horizontal" style={{ justifyContent: 'center', marginBottom: 24 }}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={this.handleReset}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  borderColor: '#0284c7',
                  height: 40,
                  padding: '0 20px',
                  fontWeight: 600,
                  borderRadius: 10,
                }}
              >
                Thử tải lại thành phần
              </Button>

              <Button
                onClick={this.handleReload}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                  height: 40,
                  padding: '0 20px',
                  borderRadius: 10,
                }}
              >
                Tải lại trang web
              </Button>

              <Button
                icon={<HomeOutlined />}
                onClick={this.handleGoHome}
                style={{
                  background: 'transparent',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  height: 40,
                  padding: '0 16px',
                  borderRadius: 10,
                }}
              >
                Về trang chủ
              </Button>
            </Space>

            {/* Collapsible Error Debug Details */}
            {this.state.error && (
              <div style={{ marginTop: 24, textAlign: 'left' }}>
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  {this.state.showDetails ? 'Ẩn chi tiết kỹ thuật' : 'Xem chi tiết lỗi kỹ thuật'}
                </button>

                {this.state.showDetails && (
                  <pre
                    style={{
                      marginTop: 12,
                      padding: 16,
                      background: '#090d16',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 10,
                      color: '#f87171',
                      fontSize: '0.75rem',
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap',
                      maxHeight: 200,
                    }}
                  >
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
