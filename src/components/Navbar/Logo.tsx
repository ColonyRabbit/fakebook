import Image from "next/image";
import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link href="/" className="block w-full">
      <div className="relative w-full h-20">
        <Image
          className="object-cover"
          src="/image/Fakebook.jpg"
          alt="fakebook"
          fill
          quality={100}
        />
      </div>
    </Link>
  );
};

export default Logo;
