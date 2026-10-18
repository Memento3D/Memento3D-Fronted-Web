import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { tokenStorage } from '../utils/tokenStorage';
import { getDefaultRouteForRole } from '../utils/resolveActorRoute';

export const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const error = searchParams.get('error');
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken') || undefined;

    if (error) {
      setErrorMessage(decodeURIComponent(error));
      return;
    }

    if (!token) {
      setErrorMessage('No authentication token received from identity provider.');
      return;
    }

    // Authenticate with received tokens and route
    loginWithTokens(token, refreshToken)
      .then((user) => {
        const intended = tokenStorage.getIntendedUrl();
        const destination = intended || getDefaultRouteForRole(user.role);
        navigate(destination, { replace: true });
      })
      .catch((err: any) => {
        setErrorMessage(err.message || 'Failed to initialize session with OAuth credentials.');
      });
  }, [searchParams, loginWithTokens, navigate]);

  if (errorMessage) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#090d16',
          padding: 24,
        }}
      >
        <Result
          status="error"
          title="Google Authentication Failed"
          subTitle={errorMessage}
          extra={[
            <Link to="/login" key="retry">
              <Button type="primary" size="large">
                Return to Login
              </Button>
            </Link>,
          ]}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#090d16',
        gap: 16,
      }}
    >
      <Spin size="large" />
      <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
        Verifying Google security credentials & establishing session...
      </span>
    </div>
  );
};
