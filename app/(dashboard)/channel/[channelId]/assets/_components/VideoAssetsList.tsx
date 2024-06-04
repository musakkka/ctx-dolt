"use client";

import { Plus } from "lucide-react";
import React, { useRef } from "react";
import { NewAsset } from "./NewAsset";

const videos = [
  { id: 1, description: "Video description 1", views: "683K views" },
  { id: 2, description: "Video description 2", views: "23M views" },
  { id: 3, description: "Video description 3", views: "190M views" },
  { id: 4, description: "Video description 4", views: "4.1M views" },
  { id: 5, description: "Video description 5", views: "1.2M views" },
  { id: 6, description: "Video description 6", views: "5M views" },
  { id: 7, description: "Video description 7", views: "8M views" },
  { id: 8, description: "Video description 8", views: "12M views" },
  { id: 9, description: "Video description 9", views: "9K views" },
  { id: 10, description: "Video description 10", views: "6.7M views" },
  { id: 11, description: "Video description 11", views: "11M views" },
  { id: 12, description: "Video description 12", views: "2M views" },
];

export const VideoAssetsList = () => {
  const videoRefs = useRef([]);

  const handlePlayPause = (index) => {
    const video = videoRefs.current[index];
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  return (
    <div className="text-white mb-24 mt-10">
      <div className="flex items-center justify-between mb-6">
        <p className="text-white text-3xl font-bold">Videos</p>
        <NewAsset/>
      </div>

      <div className="grid grid-cols-5 gap-x-4 gap-y-10">
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="bg-gray-700 rounded-lg h-[350px] w-[250px]"
          >
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src="/short.mp4"
              className="w-full h-full object-cover rounded-t-md"
              onClick={() => handlePlayPause(index)}
            ></video>
            <div className="text-sm px-4">
              <p>{video.description}</p>
              <p className="text-gray-400">{video.views}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoAssetsList;
