import Image from "next/image";

export const GrandmaAvatar = () => {
  return (
    <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden">
      <Image
        src="/images/grandma-avatar.png"
        alt="AI Grandma"
        fill
        className="object-cover"
      />
    </div>
  );
};
