'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Figure } from './Figure';
import type { Components } from 'react-markdown';
import type { Element } from 'hast';

interface MarkdownRendererProps {
  content: string;
}

// Helper to check if a paragraph node contains an image (even with other content)
function containsImage(node: Element | undefined): boolean {
  if (!node || !node.children) return false;

  // Check if any child is an image (recursively check all children)
  function hasImage(children: typeof node.children): boolean {
    for (const child of children) {
      if (child.type === 'element') {
        const el = child as Element;
        if (el.tagName === 'img') return true;
        if (el.children && hasImage(el.children as typeof node.children)) return true;
      }
    }
    return false;
  }

  return hasImage(node.children);
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    // Custom image renderer using Next.js Image
    img: ({ src, alt }) => {
      if (!src || typeof src !== 'string') return null;

      // Extract caption from alt text if it ends with a caption marker
      const altText = alt || '';

      return (
        <Figure
          src={src}
          alt={altText}
          caption={altText}
        />
      );
    },
    // Style headings
    h1: ({ children }) => (
      <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6 mt-8 pb-3 border-b-2 border-amber-500">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-semibold text-stone-800 mb-4 mt-8">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-semibold text-stone-700 mb-3 mt-6">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold text-stone-600 mb-2 mt-4">
        {children}
      </h4>
    ),
    // Style paragraphs - unwrap if contains an image to avoid hydration error
    // (<figure> with <div> cannot be inside <p>)
    p: ({ children, node }) => {
      // If the paragraph contains any image, render as div to avoid hydration error
      if (containsImage(node)) {
        return <div className="text-stone-700 leading-relaxed mb-4 text-base md:text-lg">{children}</div>;
      }
      return (
        <p className="text-stone-700 leading-relaxed mb-4 text-base md:text-lg">
          {children}
        </p>
      );
    },
    // Style blockquotes as callout boxes
    blockquote: ({ children }) => (
      <blockquote className="my-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-lg">
        <div className="text-amber-900 italic">
          {children}
        </div>
      </blockquote>
    ),
    // Style lists
    ul: ({ children }) => (
      <ul className="list-disc list-outside ml-6 mb-4 space-y-2 text-stone-700">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-outside ml-6 mb-4 space-y-2 text-stone-700">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    // Style code blocks
    code: ({ className, children }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="px-1.5 py-0.5 bg-stone-100 text-orange-600 rounded text-sm font-mono">
            {children}
          </code>
        );
      }
      return (
        <code className="block p-4 bg-stone-900 text-stone-100 rounded-lg overflow-x-auto text-sm font-mono">
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="my-4 overflow-hidden rounded-lg">
        {children}
      </pre>
    ),
    // Style tables
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 border-b border-stone-200">
        {children}
      </td>
    ),
    tr: ({ children }) => (
      <tr className="even:bg-stone-50">
        {children}
      </tr>
    ),
    // Style links
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-amber-600 hover:text-amber-700 underline decoration-amber-300 hover:decoration-amber-500 transition-colors"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    // Style horizontal rules
    hr: () => (
      <hr className="my-8 border-none h-0.5 bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
    ),
    // Style strong and emphasis
    strong: ({ children }) => (
      <strong className="font-bold text-stone-900">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-stone-600">
        {children}
      </em>
    ),
  };

  return (
    <div className="ebook-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
