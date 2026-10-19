import React, { useMemo } from 'react';
import { Quote } from 'lucide-react';
import { getDailyQuote } from '../../utils/getDailyQuote';

export interface QuoteCardProps {
  role?: string | null;
  customQuote?: string;
  author?: string;
  tag?: string;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ role, customQuote, author, tag }) => {
  const daily = useMemo(() => getDailyQuote(role), [role]);

  const displayQuote = customQuote || daily.quote;
  const displayAuthor = author || daily.author;

  return (
    <div className="quote-card">
      <div className="quote-icon-box">
        <Quote size={20} />
      </div>
      <div className="quote-content">
        <div className="quote-text">"{displayQuote}"</div>
        <div className="quote-tag">
          {displayAuthor ? `— ${displayAuthor}` : tag || 'CẢM HỨNG VẬN HÀNH HÔM NAY'}
        </div>
      </div>
    </div>
  );
};
