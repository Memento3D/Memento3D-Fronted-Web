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
            background: 'var(--color-bg)',
            color: 'var(--text-primary)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 640,
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 20,
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)',
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

            <Title level={3} style={{ color: 'var(--text-primary)', margin: '0 0 12px', fontWeight: 800 }}>
              {this.props.fallbackTitle || 'Đã xảy ra sự cố hiển thị giao diện'}
            </Title>

            <Paragraph style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 28 }}>
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
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
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
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
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
                    color: 'var(--text-muted)',
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
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
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
