'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const params = useSearchParams();
  const error = params.get('error');
  const detail = params.get('detail');

  const errors: Record<string, string> = {
    state: 'Phiên đăng nhập không hợp lệ (state mismatch). Vui lòng thử lại.',
    token: 'Không thể xác thực với Google (token exchange failed).',
    userinfo: 'Không thể lấy thông tin người dùng từ Google.',
  };

  return (
    <div style={{ maxWidth: 480, margin: '80px auto', padding: 24, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Đăng nhập thất bại</h1>
      <p style={{ color: '#dc2626', marginBottom: 12 }}>
        {errors[error || ''] || `Lỗi không xác định: ${error}`}
      </p>
      {detail && (
        <details style={{ marginBottom: 16 }}>
          <summary style={{ cursor: 'pointer', color: '#6b7280' }}>Chi tiết từ Google</summary>
          <pre style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, overflow: 'auto', fontSize: 13, marginTop: 8 }}>
            {decodeURIComponent(detail)}
          </pre>
        </details>
      )}
      <a href="/" style={{ color: '#2563eb' }}>← Về trang chủ</a>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, fontFamily: 'system-ui' }}>Đang tải...</div>}>
      <LoginContent />
    </Suspense>
  );
}