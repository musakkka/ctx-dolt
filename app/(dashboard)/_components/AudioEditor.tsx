"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import Hover from "wavesurfer.js/dist/plugins/hover.esm.js";
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js'

import { Hand, Move, Pause, Play, Scissors, TableColumnsSplit } from "lucide-react";

interface AudioEditorProps {
  audioUrl: string;
}

const AudioEditor: React.FC<AudioEditorProps> = ({ audioUrl }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const regionsPluginRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMode, setCurrentMode] = useState("playPause");
  const [loop, setLoop] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "rgb(200, 0, 200)",
        progressColor: "rgb(100, 0, 100)",
        cursorWidth: 3,
        cursorColor: "#0000FF",
        autoScroll: true,
        url: audioUrl,
        plugins: [
          Hover.create({
            lineColor: "#ff0000",
            lineWidth: 2,
            labelBackground: "#555",
            labelColor: "#fff",
            labelSize: "11px",
          }),
          TimelinePlugin.create({
            container: '#waveform-timeline',
            primaryLabelInterval: 10,
          }),
        ],
        dragToSeek: true,
      });

      const wsRegions = wavesurfer.current.registerPlugin(
        RegionsPlugin.create()
      );
      regionsPluginRef.current = wsRegions;

      wsRegions.enableDragSelection({
        color: "#0000FF66",
      });

      wsRegions.on("region-created", (region) => {
        console.log("New region created", { region });
        setSelectedRegion(region);
      });

      wsRegions.on("region-updated", (region) => {
        console.log("Region updated", { region });
        setSelectedRegion(region);
      });

      wsRegions.on("region-clicked", (region) => {
        console.log("Region about to be selected", { region });
        setSelectedRegion(region);
      });

      wavesurfer.current.on("finish", () => {
        setIsPlaying(false);
      });
    }

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);

  useEffect(() => {
    console.log({ selectedRegion });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" && selectedRegion) {
        selectedRegion.remove();
        setSelectedRegion(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRegion]);

  const handlePlay = () => {
    wavesurfer.current?.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    wavesurfer.current?.pause();
    setIsPlaying(false);
  };

  const handleLoopToggle = () => {
    setLoop((prevLoop) => !prevLoop);
  };

  const handleTrim = async () => {
    if (selectedRegion && wavesurfer.current) {
      const { start, end } = selectedRegion;
      const audioContext = new (window.AudioContext)();
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const newBuffer = trimAudioBuffer(audioBuffer, start, end, audioContext);

      const newBlob = bufferToWave(newBuffer, newBuffer.length);
      const newUrl = URL.createObjectURL(newBlob);

      wavesurfer.current.load(newUrl);
    }
  };

  const trimAudioBuffer = (buffer: AudioBuffer, start: number, end: number, context: AudioContext) => {
    const channels = [];
    const frameCount = (buffer.duration - (end - start)) * buffer.sampleRate;

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channelData = buffer.getChannelData(i);
      const newChannelData = new Float32Array(frameCount);

      newChannelData.set(channelData.slice(0, start * buffer.sampleRate));
      newChannelData.set(channelData.slice(end * buffer.sampleRate), start * buffer.sampleRate);

      channels.push(newChannelData);
    }

    const newBuffer = context.createBuffer(buffer.numberOfChannels, frameCount, buffer.sampleRate);
    channels.forEach((channelData, i) => {
      newBuffer.copyToChannel(channelData, i);
    });

    return newBuffer;
  };

  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.on("click", async (relativeX) => {
        console.log("Current Mode", currentMode);
        if (currentMode === "split") {
          console.log("Relative X: " + relativeX);
          await handleSplit(relativeX);
        }
      });
    }
  }, [currentMode]);

  const handleSplitMode = () => {
    setCurrentMode("split");
  };

  

  const handleMoveMode = () => {
    setCurrentMode("move");
  };

  const insertSilence = (buffer: AudioBuffer, position: number, duration: number, context: AudioContext) => {
    const channels = [];
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const silenceLength = Math.floor(duration * sampleRate);
    const newBuffer = context.createBuffer(numChannels, buffer.length + silenceLength, sampleRate);

    for (let i = 0; i < numChannels; i++) {
      const channelData = buffer.getChannelData(i);
      const newChannelData = newBuffer.getChannelData(i);
      newChannelData.set(channelData.subarray(0, position * sampleRate));
      newChannelData.set(new Float32Array(silenceLength), position * sampleRate);
      newChannelData.set(channelData.subarray(position * sampleRate), position * sampleRate + silenceLength);
    }

    return newBuffer;
  };

  const handleSplit = async (relativeX: number) => {
    if (wavesurfer.current) {
      const audioContext = new (window.AudioContext)();
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const splitPosition = relativeX * audioBuffer.duration;

      const newBuffer = insertSilence(audioBuffer, splitPosition, 3, audioContext);

      const newBlob = bufferToWave(newBuffer, newBuffer.length);
      const newUrl = URL.createObjectURL(newBlob);

      wavesurfer.current.load(newUrl);
    }
  };

  const bufferToWave = (abuffer: AudioBuffer, len: number) => {
    const numOfChan = abuffer.numberOfChannels,
      length = len * numOfChan * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      channels = [],
      sampleRate = abuffer.sampleRate;

    let offset = 0,
      pos = 0;

    const setUint16 = (data: any) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    const setUint32 = (data : any) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // RIFF identifier
    setUint32(0x46464952);
    // file length minus RIFF identifier length and file description length
    setUint32(length - 8);
    // RIFF type
    setUint32(0x45564157);

    // format chunk identifier
    setUint32(0x20746d66);
    // format chunk length
    setUint32(16);
    // sample format (raw)
    setUint16(1);
    // channel count
    setUint16(numOfChan);
    // sample rate
    setUint32(sampleRate);
    // byte rate (sample rate * block align)
    setUint32(sampleRate * numOfChan * 2);
    // block align (channel count * bytes per sample)
    setUint16(numOfChan * 2);
    // bits per sample
    setUint16(16);

    // data chunk identifier
    setUint32(0x61746164);
    // data chunk length
    setUint32(length - pos - 4);

    // write interleaved data
    for (let i = 0; i < abuffer.numberOfChannels; i++) {
      channels.push(abuffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        // interleave channels
        let sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++; // next source sample
    }

    return new Blob([buffer], { type: "audio/wav" });
  };

  return (
    <div>
      <div ref={waveformRef}></div>
      <div id="waveform-timeline"></div>

      <div className="space-x-4">
        {!isPlaying ? (
          <button onClick={handlePlay} className="p-2 rounded-full bg-gray-700"><Play className="w-10 h-10 text-white"/></button>
        ) : (
          <button onClick={handlePause} className="p-2 rounded-full bg-gray-700"><Pause className="w-10 h-10 text-white"/></button>
        )}
        <button onClick={handleTrim} className="p-2 rounded-full bg-gray-700"><Scissors className="w-10 h-10 text-white"/></button>
        <button onClick={handleSplitMode} className={`p-2 rounded-full ${currentMode === "split" ? "bg-blue-500" : "bg-gray-700"}`}><TableColumnsSplit className="w-10 h-10 text-white"/></button>
        <button onClick={handleMoveMode} className={`p-2 rounded-full ${currentMode === "move" ? "bg-blue-500" : "bg-gray-700"}`}><Hand className="w-10 h-10 text-white"/></button>
      </div>
    </div>
  );
};

export default AudioEditor;
