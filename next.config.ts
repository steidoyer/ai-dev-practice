import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 원격(외부 도메인) 이미지를 next/image로 쓸 때만 해당 호스트를 명시적으로 허용한다.
    // 현재는 원격 이미지가 없어 비워둔다. CDN/스토리지 등을 쓰게 되면 아래 형태로 추가:
    // remotePatterns: [
    //   { protocol: "https", hostname: "images.example.com", pathname: "/**" },
    //   { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    // ],
    remotePatterns: [],
  },
};

export default nextConfig;
