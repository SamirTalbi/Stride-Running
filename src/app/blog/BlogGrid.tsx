"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  author: string;
  category: string;
  readTime: string;
  publishedAt: string;
};

const INITIAL_COUNT = 6;
const LOAD_MORE_COUNT = 3;

export function BlogGrid({ posts }: { posts: Post[] }) {
  const [visible, setVisible] = useState(INITIAL_COUNT);

  const shown = posts.slice(0, visible);
  const hasMore = visible < posts.length;

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shown.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group">
            <article className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300 h-full flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="default" className="bg-white/90 text-gray-700">{post.category}</Badge>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-brand-500 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <User size={11} />
                    <span>{post.author}</span>
                    <span>·</span>
                    <Clock size={11} />
                    <span>{post.readTime}</span>
                  </div>
                  <ArrowRight size={14} className="text-brand-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-12">
          <button
            onClick={() => setVisible((v) => v + LOAD_MORE_COUNT)}
            className="px-8 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-brand-400 hover:text-brand-500 transition-all"
          >
            Charger plus d&apos;articles ({posts.length - visible} restants)
          </button>
        </div>
      )}
    </>
  );
}
