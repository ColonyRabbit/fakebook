"use client";

import { ImageIcon, Smile, Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import usePostCreator from "../hooks/usePostCreator";
import { Card } from "../../../../../@/components/ui/card";
import { Textarea } from "../../../../../@/components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import DOMPurify from "dompurify";

function extractYouTubeEmbedUrl(text: string): string | null {
  const match = text.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/i
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function extractTextWithoutYouTubeUrl(text: string): string {
  return text
    .replace(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\s]+/i,
      ""
    )
    .trim();
}

export default function PostCreator() {
  const {
    content,
    setContent,
    isExpanded,
    setIsExpanded,
    isLoading,
    fileInputRef,
    user,
    handleCreatePost,
    session,
    image,
    setImage,
  } = usePostCreator();

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();

    const clipboardData = event.clipboardData;
    const items = clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          setImage(file);
        }
        return;
      }
    }

    const htmlData = clipboardData.getData("text/html");
    const plainText = clipboardData.getData("text/plain");

    const insertContent = htmlData || plainText;
    const cursorPos = event.currentTarget.selectionStart;
    const newValue =
      content.slice(0, cursorPos) + insertContent + content.slice(cursorPos);

    setContent(newValue);
  };

  if (!session) {
    return (
      <Card className="p-6 text-center bg-gray-50/50 dark:bg-gray-900/50 border-dashed">
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          โปรดเข้าสู่ระบบเพื่อสร้างโพสต์
        </p>
      </Card>
    );
  }

  const youtubeEmbedUrl = extractYouTubeEmbedUrl(content);
  const cleanText = extractTextWithoutYouTubeUrl(content);
  return (
    <div className="flex justify-center max-w-2xl mx-auto p-4 sm:p-6 w-full">
      <Card className="p-4 mb-6 max-w-2xl mx-auto sm:p-6 w-full bg-white dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-4">
          {user?.photoUrl ? (
            <Image
              src={user.photoUrl}
              className="rounded-full w-12 h-12 ring-2 ring-offset-2 ring-gray-100 dark:ring-gray-700 dark:ring-offset-gray-800 object-cover"
              width={48}
              height={48}
              alt={`${user.username}'s avatar`}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold ring-2 ring-offset-2 ring-gray-100 dark:ring-gray-700 dark:ring-offset-gray-800">
              {(user?.username || "A")[0].toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <div
              className="bg-gray-100 dark:bg-gray-700/50 rounded-2xl transition-all duration-200"
              onClick={() => setIsExpanded(true)}
            >
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                placeholder="คุณกำลังคิดอะไรอยู่?"
                className={`min-h-[${
                  isExpanded ? "120px" : "60px"
                }] border-none bg-transparent focus:ring-0 resize-none p-4 text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 dark:text-gray-100`}
                autoFocus={isExpanded}
              />
              {isExpanded && content && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border dark:border-gray-600 text-sm text-gray-800 dark:text-gray-100 space-y-4">
                  {/* ✅ ข้อความ preview */}
                  {cleanText && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(cleanText),
                      }}
                      className="prose prose-sm max-w-none dark:prose-invert"
                    />
                  )}

                  {/* ✅ YouTube embed */}
                  {youtubeEmbedUrl ? (
                    <iframe
                      src={youtubeEmbedUrl}
                      className="w-full h-60 rounded-lg"
                      allowFullScreen
                      onError={(e) => {
                        e.currentTarget.replaceWith(
                          Object.assign(document.createElement("div"), {
                            innerHTML:
                              '<div class="text-sm text-red-500 p-4 bg-red-100 rounded">ไม่สามารถแสดงวิดีโอ YouTube ได้</div>',
                          })
                        );
                      }}
                    />
                  ) : null}
                </div>
              )}
            </div>

            {isExpanded && (
              <>
                <div className="flex justify-between items-center mt-4 rounded-lg p-3 border bg-white/80 dark:bg-gray-800/80 dark:border-gray-700">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    เพิ่มเข้าในโพสต์ของคุณ
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                    <input
                      type="file"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          const file = files[0];
                          setImage(file);
                        }
                      }}
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {image && (
                  <div className="mt-4 relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt="Selected Image"
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5"
                        onClick={() => setImage(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleCreatePost}
                    disabled={isLoading}
                    className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>กำลังโพสต์...</span>
                      </div>
                    ) : (
                      "โพสต์"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {!isExpanded && (
          <div className="grid grid-cols-3 gap-1 mt-4 pt-4 border-t dark:border-gray-700">
            <Button
              variant="ghost"
              className="flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300"
            >
              <Camera className="h-5 w-5 text-red-500" />
              <span>วิดีโอสด</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center justify-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-300"
              onClick={() => setIsExpanded(true)}
            >
              <ImageIcon className="h-5 w-5 text-green-500" />
              <span>รูปภาพ</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center justify-center gap-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-700 dark:text-gray-300"
            >
              <Smile className="h-5 w-5 text-yellow-500" />
              <span>ความรู้สึก</span>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
