'use client';

import React from 'react';
import CodeBlockSandbox from './CodeBlockSandbox';

interface ChatMessageContentProps {
  text: string;
  role: 'user' | 'assistant';
  autoRunFirstCodeBlock?: boolean;
}

interface TextSegment {
  type: 'text';
  content: string;
}

interface CodeSegment {
  type: 'code';
  code: string;
  language: string;
}

type MessageSegment = TextSegment | CodeSegment;

export default function ChatMessageContent({
  text,
  role,
  autoRunFirstCodeBlock = false,
}: ChatMessageContentProps) {
  // If user message, just render clean pre-wrap
  if (role === 'user') {
    return <div className="whitespace-pre-wrap">{text}</div>;
  }

  // Parse fenced code blocks: ```lang\ncode\n```
  const segments: MessageSegment[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\s*\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      segments.push({ type: 'text', content: textBefore });
    }

    const language = match[1] || 'typescript';
    const code = match[2];
    segments.push({ type: 'code', language, code });

    lastIndex = match.index + match[0].length;
  }

  const remainingText = text.slice(lastIndex);
  if (remainingText.trim() || segments.length === 0) {
    segments.push({ type: 'text', content: remainingText || text });
  }

  let codeBlockCount = 0;

  return (
    <div className="space-y-2 leading-relaxed">
      {segments.map((segment, idx) => {
        if (segment.type === 'code') {
          const isFirstCodeBlock = codeBlockCount === 0;
          codeBlockCount += 1;

          return (
            <CodeBlockSandbox
              key={`code-${idx}`}
              code={segment.code}
              language={segment.language}
              autoRun={autoRunFirstCodeBlock && isFirstCodeBlock}
            />
          );
        }

        // Standard text segment with basic markdown formatting
        return (
          <div key={`text-${idx}`} className="whitespace-pre-wrap">
            {segment.content}
          </div>
        );
      })}
    </div>
  );
}

