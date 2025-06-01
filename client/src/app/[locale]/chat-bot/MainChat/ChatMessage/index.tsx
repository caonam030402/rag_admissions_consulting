"use client";

import { Robot, User } from "@phosphor-icons/react";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { ActorType } from "@/enums/systemChat";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
}

// Define markdown components outside of render function to avoid re-creation
const markdownComponents = {
  // Custom styles for headings
  h1: ({ children, ...props }: any) => (
    <h1 className="mb-4 mt-6 text-xl font-bold text-gray-800" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="mb-3 mt-5 text-lg font-bold text-gray-800" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="mb-2 mt-4 text-base font-semibold text-gray-700" {...props}>
      {children}
    </h3>
  ),
  // Custom styles for paragraphs
  p: ({ children, ...props }: any) => (
    <p className="mb-3 leading-relaxed text-gray-700" {...props}>
      {children}
    </p>
  ),
  // Custom styles for lists
  ul: ({ children, ...props }: any) => (
    <ul className="mb-4 ml-6 list-disc space-y-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="mb-1 leading-relaxed text-gray-700" {...props}>
      {children}
    </li>
  ),
  // Custom styles for emphasis
  strong: ({ children, ...props }: any) => (
    <strong className="font-bold text-gray-800" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: any) => (
    <em className="italic text-gray-600" {...props}>
      {children}
    </em>
  ),
  // Custom styles for horizontal rule
  hr: (props: any) => (
    <hr className="my-6 border-t-2 border-gray-200" {...props} />
  ),
  // Custom styles for blockquotes
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="my-4 rounded-r-lg border-l-4 border-blue-500 bg-blue-50 py-2 pl-6 italic text-gray-600"
      {...props}
    >
      {children}
    </blockquote>
  ),
  // Custom styles for code
  code: ({ children, ...props }: any) => (
    <code
      className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800"
      {...props}
    >
      {children}
    </code>
  ),
  // Custom styles for divs to support HTML
  div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === ActorType.Human;

  return (
    <div
      className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} items-start gap-2 px-4 py-3`}
    >
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isUser ? "bg-blue-500" : "bg-purple-500"}`}
      >
        {isUser ? (
          <User size={18} color="white" weight="fill" />
        ) : (
          <Robot size={18} color="white" weight="fill" />
        )}
      </div>
      <div
        className={`flex max-w-[80%] flex-col gap-1 rounded-2xl px-4 py-2 ${isUser ? "bg-blue-500 text-white" : "bg-gray-100"}`}
      >
        <div className="text-xs font-medium">
          {isUser ? "You" : "Assistant"}
        </div>
        <div className="text-sm">
          {isUser ? (
            // User messages - plain text with whitespace preservation
            <div className="whitespace-pre-wrap">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            // Assistant messages - render markdown with react-markdown
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
