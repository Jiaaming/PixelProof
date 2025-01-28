"use client";

import React, { useState, useEffect } from "react";

/**
 * TypewriterText 组件
 * @param messages 要循环显示的句子数组
 * @param typingSpeed 打字速度（毫秒/字符）
 * @param deletingSpeed 删除速度（毫秒/字符）
 * @param pauseTime 打完或删完后停顿多少毫秒
 */
interface TypewriterTextProps {
  messages: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

export default function TypewriterText({
  messages,
  typingSpeed = 100,
  deletingSpeed = 70,
  pauseTime = 1000,
}: TypewriterTextProps) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0); // 用来指定当前显示哪一句
  const [isDeleting, setIsDeleting] = useState(false);

  // 这个 effect 用来按“打字/删字”节奏更新 text
  useEffect(() => {
    // 当前要显示的完整句子
    const currentMessage = messages[index % messages.length];

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // 打字阶段
      // 新增一个字符
      const updatedText = currentMessage.slice(0, text.length + 1);
      setText(updatedText);

      // 如果已经打完了当前句子
      if (updatedText === currentMessage) {
        // 暂停一会后再开始删
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      } else {
        // 继续打下一个字符
        timer = setTimeout(() => {}, typingSpeed);
      }
    } else {
      // 删字阶段
      const updatedText = currentMessage.slice(0, text.length - 1);
      setText(updatedText);

      // 如果删完了
      if (updatedText === "") {
        // 进入下一句
        setIsDeleting(false);
        setIndex((prev) => prev + 1);
      }
      timer = setTimeout(() => {}, deletingSpeed);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, index, messages, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <p className="text-lg text-gray-600 mb-8">
      {text}
      <span className="inline-block w-1 animate-[blink_1s_steps(2)_infinite]">
        |
      </span>
    </p>
  );
}