'use client';
import Image from 'next/image';
import Navbar from '@/components/nav';
import { notFound } from 'next/navigation';
import NavButtons from '@/components/navButtons';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function NewsArticle() {
  const [newsFeed, setNewsFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams(); // Get URL parameters
  const id = params?.id; // Get the dynamic ID

  useEffect(() => {
    if (!id) return; // Ensure ID is available before fetching data

    async function fetchData() {
      try {
        const response = await fetch("/api/news", {
          next: { revalidate: 86400 }, // Cache for 24 hours
        });
        const data = await response.json();
        setNewsFeed(data.newsFeed);
        
      } catch (error) {
        console.error("Error fetching news feed:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  // Find the post with the matching ID
  const post = newsFeed.find((newsItem) => newsItem.id.toString() === id);

  if (!post) {
    notFound(); // If the post doesn't exist, return a 404 page
  }

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: 'Check out this article!',
          url: window.location.href,
        });
      } else {
        alert('Sharing is not supported on this browser/device.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share this content.');
    }
  };

  const cleanContent = post.content
    .replace(/<\/?p>/g, '') // Remove opening and closing <p> tags
    .replace(/<[^>]+>/g, '') // Remove all other HTML tags
    .trim();

  return (
    <div className="container mx-auto py-6">
      <nav className="fixed top-0 left-0 w-full z-50 bg-gray-50 dark:bg-slate-950 px-2 py-2">
      <NavButtons onBack={handleBack} onShare={handleShare} />
      </nav>

      <h1 className="text-3xl dark:text-gray-200 font-bold mt-8 mb-4">{post.title}</h1>

      {post.image && (
        <Image
          className="w-full h-[300px] object-cover rounded-lg"
          src={post.image}
          alt={post.title}
          width={800}
          height={400}
          quality={100}
        />
      )}

      <div className="mt-6 mb-12 dark:text-gray-200 text-base space-y-2">
        <span className="bg-red-700 p-2 m-auto text-sm text-white rounded-lg">{post.categories}</span>
        {cleanContent.split('\n').map((paragraph, index) => (
          <p key={index} className="mt-4 mb-4">
            {paragraph}
          </p>
        ))}
      </div>

      <Navbar />
    </div>
  );
}
