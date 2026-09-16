"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

interface AutomotiveBlogProps {
  locale?: string;
}

type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
};

function formatDate(raw: string, locale: string): string {
  const d = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale === "ar" ? "ar-AE" : "en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function AutomotiveBlog({ locale = "en" }: AutomotiveBlogProps) {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/blog?pageSize=8&locale=${locale}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setPosts((data?.posts ?? []).filter((p: BlogPost) => p.slug && p.title));
      })
      .catch((err) => {
        console.error("Failed to load blog posts", err);
        if (active) setPosts([]);
      });
    return () => {
      active = false;
    };
  }, [locale]);

  if (posts !== null && posts.length === 0) return null;

  return (
    <section className="section section-padding blogs py-14 lg:py-18 bg-white">
      <div className="container custom-width max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Title */}
        <div className="section-title mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black uppercase tracking-wide text-black m-0">
            Automotive{" "}
            <span className="text-[#ed1c24] theme_color">
              Blog
            </span>
          </h2>
        </div>

        {/* Blog Slider */}
        <div className="blog-slider relative">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={600}
            spaceBetween={20}
            slidesPerView={1}
            pagination={{
              clickable: true,
              bulletClass: "swiper-pagination-bullet !w-3 !h-3 !bg-gray-300 !opacity-100 transition-all cursor-pointer",
              bulletActiveClass: "!bg-[#ed1c24] !w-6 !rounded-full",
            }}
            breakpoints={{
              540: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 3, spaceBetween: 18 },
              1024: { slidesPerView: 4, spaceBetween: 20 },
            }}
            className="pb-10"
          >
            {(posts ?? []).map((post) => {
              const href = `/${locale}/blog/${post.slug}`;

              return (
                <SwiperSlide key={post.slug} className="h-auto">
                  <div className="box flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <Link
                      href={href}
                      className="image-wrap block relative w-full aspect-[16/10] overflow-hidden bg-gray-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image}
                        alt={post.title}
                        width={600}
                        height={375}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    <div className="content flex flex-col flex-1 p-5">
                      <div className="post-info mb-2">
                        <span className="text-xs font-semibold text-gray-500">
                          {formatDate(post.date, locale)}
                        </span>
                      </div>

                      <h3 className="title text-sm sm:text-[15px] font-bold text-black leading-snug mb-2.5 line-clamp-2">
                        <Link
                          href={href}
                          className="text-black group-hover:text-[#ed1c24] transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h3>

                      <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed line-clamp-3 m-0">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* All Blog CTA Button */}
        <div className="blog-more text-center mt-4">
          <Link
            href={`/${locale}/blog`}
            className="button button-primary inline-flex items-center justify-center px-8 py-3 rounded-lg bg-[#ed1c24] text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#c6181d] transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>All Blog</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
