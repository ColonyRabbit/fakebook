import FloatingChat from "./FloatingChat";

interface Props {
  targetUserId?: string;
  session?: any; // ปรับตามจริงเป็น `Session` ถ้ามี type
  className?: string;
}

export default function FloatingChatWrapper({
  targetUserId,
  session,
  className,
}: Props) {
  if (!session?.user?.id || !targetUserId) return null;

  const currentUserId = session.user.id;
  const roomName = [currentUserId, targetUserId].sort().join("_");

  return (
    <FloatingChat
      className={className}
      session={session}
      roomName={roomName}
      targetUserId={targetUserId}
    />
  );
}
