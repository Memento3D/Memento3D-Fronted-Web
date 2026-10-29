import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ReadState } from '../ReadState';

describe('read presentation', () => {
  const base = { isLoading: false, isError: false, onRetry: vi.fn() };
  const render = (props = {}) => renderToStaticMarkup(
    <ReadState {...base} {...props} emptyTitle="Không có bản ghi."><span>loaded records</span></ReadState>,
  );
  it('prioritizes loading over stale error and empty', () => {
    const html = render({ isLoading: true, isError: true, isEmpty: true });
    expect(html).toContain('Đang tải');
    expect(html).not.toContain('Không có bản ghi.');
    expect(html).not.toContain('loaded records');
  });
  it('preserves successful content', () => expect(render()).toContain('loaded records'));
  it('shows empty only after success', () => {
    const html = render({ isEmpty: true });
    expect(html).toContain('Không có bản ghi.');
    expect(html).not.toContain('Thử lại');
  });
  it('never disguises failure as empty', () => {
    const html = render({ isError: true, isEmpty: true });
    expect(html).toContain('Không thể tải dữ liệu.');
    expect(html).toContain('Thử lại');
    expect(html).not.toContain('Không có bản ghi.');
  });
  it('shows loading on retry and success after recovery', () => {
    expect(render({ isError: true, isFetching: true })).toContain('Đang tải');
    expect(render()).not.toContain('Không thể tải dữ liệu.');
    const element = ReadState({ ...base, isError: true, children: null });
    // The retry action uses the supplied read callback, without scheduling mutations.
    const errorElement = element.props.children[0];
    errorElement.props.onRetry();
    expect(base.onRetry).toHaveBeenCalledOnce();
  });
  it('keeps useful cached data visible during refetch and labels it after failure', () => {
    expect(render({ hasData: true, isFetching: true })).toContain('loaded records');
    const html = render({ hasData: true, isError: true });
    expect(html).toContain('loaded records');
    expect(html).toContain('Đang hiển thị dữ liệu đã tải trước đó.');
  });
});
