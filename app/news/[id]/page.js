'use client';
import Image from 'next/image';
import Navbar from '@/components/nav';
import NavButtons from '@/components/navButtons';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { decode } from 'he';
import ProtectedRoute from '@/components/protectedRoutes';


export default function NewsArticle() {
  const [newsFeed, setNewsFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams(); // Get URL parameters
  const id = params?.id; // Get the dynamic ID
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

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

    if (!post) return <p className="text-center text-red-600">Article not found.</p>;


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

  const cleanContent = decode(post.content || '')
  .replace(/<\/?p>/g, '')
  .replace(/<[^>]+>/g, '')
  .trim();


  return (
    <ProtectedRoute>
    <div className="container mx-auto py-6">
      <nav className="fixed top-0 left-0 w-full z-50 bg-gray-50/50 dark:bg-neutral-950/50 px-2 py-2">
      <NavButtons onBack={handleBack} onShare={handleShare} />
      </nav>

      <h1 className="text-xl sm:text-3xl font-bold dark:text-neutral-200 mt-8 mb-4">
{post.title}</h1>

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

      <div className="mt-6 mb-12 dark:text-neutral-200 space-y-2">
        <div className='flex justify-between items-center'>
        <span className="bg-red-700 p-2 m-0 text-xs text-neutral-200 rounded-lg">{post.categories}</span>
        <p className="text-xs text-gray-600 dark:text-neutral-400">{formatDate(post.date)}</p>
        </div>
        {cleanContent.split('\n').map((paragraph, index) => (
          <p key={index} className="text-base mt-4 mb-4">
            {paragraph}
          </p>
        ))}
      </div>

      <Navbar />
    </div>
    </ProtectedRoute>
  );
}
