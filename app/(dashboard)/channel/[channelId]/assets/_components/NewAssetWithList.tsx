"use client";

import React, { useRef } from "react";
import { NewAsset } from "./NewAsset";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export const NewAssetWithList = ({ channelId, assets }: { channelId: string, assets: any[] }) => {
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
        <NewAsset channelId={channelId} />
      </div>

      <div className="grid grid-cols-5 gap-x-4 gap-y-10">
        {assets.map((asset, index) => (
          <div
            key={asset._id}
            className="bg-gray-700 rounded-lg h-[350px] w-[250px]"
          >
            {asset.type === "video" ? (
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={asset.url}
                className="w-full h-full object-cover rounded-t-md"
                onClick={() => handlePlayPause(index)}
              ></video>
            ) : (
              <img
                src={asset.url}
                alt="Uploaded asset"
                className="w-full h-full object-cover rounded-t-md"
              />
            )}
            <div className="text-sm px-4">
              <p>{asset.description}</p>
              <p className="text-gray-400">Type: {asset.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewAssetWithList;
