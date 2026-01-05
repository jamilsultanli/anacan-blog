import React, { useState, useEffect, useRef } from 'react';

interface TableOfContentsProps {
  content: string;
  locale?: 'az' | 'ru';
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content, locale = 'az' }) => {
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([]);
  const [activeId, setActiveId] = useState<string>('');
  const contentRef = useRef<string>('');

  useEffect(() => {
    if (!content) return;

    // Parse HTML content to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const extractedHeadings: Array<{ id: string; text: string; level: number }> = [];
    
    headingElements.forEach((heading, index) => {
      const text = heading.textContent?.trim() || '';
      if (!text) return;
      
      const level = parseInt(heading.tagName.charAt(1));
      const id = `toc-${index}-${text.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-|-$/g, '')}`;
      
      extractedHeadings.push({ id, text, level });
    });

    setHeadings(extractedHeadings);
    contentRef.current = content;

    // Add IDs to headings in the DOM after a short delay to ensure content is rendered
    const timer = setTimeout(() => {
      const articleContent = document.querySelector('.prose');
      if (articleContent) {
        const headingsInDOM = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headingsInDOM.forEach((heading, index) => {
          if (index < extractedHeadings.length) {
            heading.id = extractedHeadings[index].id;
          }
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    // Add scroll spy with throttling for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 200;
          
          // Find the current active heading
          let currentActiveId = '';
          for (let i = headings.length - 1; i >= 0; i--) {
            const element = document.getElementById(headings[i].id);
            if (element) {
              const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
              if (elementTop <= scrollPosition) {
                currentActiveId = headings[i].id;
                break;
              }
            }
          }
          
          setActiveId(currentActiveId);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Update active ID after scroll
      setTimeout(() => {
        setActiveId(id);
      }, 500);
    }
  };

  return (
    <div className="table-of-contents">
      <nav className="space-y-1.5">
        {headings.map((heading) => {
          const paddingLeft = heading.level === 1 ? '0' : heading.level === 2 ? '1rem' : heading.level === 3 ? '1.75rem' : '2.5rem';
          const isActive = activeId === heading.id;
          
          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToHeading(heading.id);
              }}
              className={`block text-sm py-1.5 px-2 rounded-lg transition-all duration-200 relative ${
                heading.level === 1
                  ? 'font-semibold text-gray-900'
                  : heading.level === 2
                  ? 'font-medium text-gray-700'
                  : 'text-gray-600 font-normal'
              } ${
                isActive
                  ? 'bg-pink-50 text-pink-600 font-semibold shadow-sm'
                  : 'hover:bg-gray-50 hover:text-pink-600'
              }`}
              style={{ paddingLeft }}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-pink-600 rounded-r-full" />
              )}
              <span className="line-clamp-2">{heading.text}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
};

export default TableOfContents;
