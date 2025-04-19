import FloatingChat from "./FloatingChat";

interface Props {
  targetUserId: string;
  targetUsername: string;
  session: any;
}

export default function FloatingChatWrapper({
  targetUserId,
  targetUsername,
  session,
}: Props) {
  const currentUserId = session?.user?.id ?? "guest";
  //sort() แล้ว join ด้วย _ → จะได้ค่าที่ “unique สำหรับคู่ผู้ใช้” เสมอ
  const roomName = [currentUserId, targetUserId].sort().join("_");

  return (
    <FloatingChat
      session={session}
      roomName={roomName}
      targetUsername={targetUsername}
    />
  );
}
