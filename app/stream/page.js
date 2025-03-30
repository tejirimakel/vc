
import Navbar from "@/components/nav";

export default function VideoPlayer() {
  return (
    <div>
    <div className="flex flex-col items-center justify-center h-screen bg-inherit">
      
      <video controls className="w-full max-w-lg rounded-lg">
       
        Your browser does not support the video tag.
      </video>
    </div>
     <Navbar />
    </div>
  );
}
