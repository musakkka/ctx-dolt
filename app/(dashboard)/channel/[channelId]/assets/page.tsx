import AudioEditor from "@/app/(dashboard)/_components/AudioEditor";

export default function ChannelAssetsRootPage() {
  const audioUrl = '/audio.mp3'; // Replace with the actual path to your audio file

  return (
    <div className="flex-1 h-[calc(100%-80px)] p-6 ">
    <div>
      <h1 className="text-white text-xl font-bold">Audio Editor</h1>
      <AudioEditor audioUrl={audioUrl} />
    </div>
    </div>
  );
}