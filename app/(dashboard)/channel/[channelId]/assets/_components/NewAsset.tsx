"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CloudUpload, Plus, X } from "lucide-react";
import { Hint } from "@/components/ui/hint";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const FormSchema = z.object({
  asset_description: z
    .string()
    .min(1, { message: "Asset description is required." }),
});

type FormData = z.infer<typeof FormSchema>;

export const NewAsset = () => {
  const [assets, setAssets] = useState([]);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      asset_description: "",
    },
  });

  const handleFileChange = (event) => {
    const files = event.target.files;
    const newAssets = [];
    for (let file of files) {
      newAssets.push({
        id: Date.now() + Math.random(),
        file: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
      });
    }
    setAssets((prevAssets) => [...prevAssets, ...newAssets]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    const newAssets = [];
    for (let file of files) {
      newAssets.push({
        id: Date.now() + Math.random(),
        file: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
      });
    }
    setAssets((prevAssets) => [...prevAssets, ...newAssets]);
  };

  const removeAsset = (id) => {
    setAssets(assets.filter((asset) => asset.id !== id));
  };

  const togglePlayPause = (event) => {
    const video = event.target;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {};

  useEffect(() => {
    const handleDragOver = (event) => {
      event.preventDefault();
    };
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <div className="mx-1">
            <Hint
              label="Create a new Channel"
              side="right"
              align="center"
              sideOffset={18}
            >
              <div className="flex items-center cursor-pointer">
                <div className="bg-[#6D66FF] rounded-full">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div className="px-2 py-1 rounded-md text-lg font-bold text-white">
                  Add Video Asset
                </div>
              </div>
            </Hint>
          </div>
        </DialogTrigger>
        <DialogContent className="w-[800px]">
          <DialogHeader>
            <DialogTitle>Upload a new asset</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-4"
            >
              <FormField
                control={form.control}
                name="asset_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="w-full bg-transparent border-gray-500 focus:border-gray-500 text-white"
                        rows={5}
                        placeholder="Enter a brief description of the asset that your colleague can understand"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Upload File</FormLabel>
                <div className="relative flex items-center justify-center w-full h-32 border border-gray-500 rounded-md">
                  <CloudUpload className="text-gray-500" />
                  <input
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    name="media"
                    type="file"
                    accept="image/jpeg,image/png,video/mp4,video/quicktime"
                    onChange={handleFileChange}
                    multiple
                  />
                </div>
              </FormItem>

              <div className="grid grid-cols-2 gap-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="relative">
                    {asset.type === "video" ? (
                      <video
                        src={asset.file}
                        className="w-full h-48 object-cover rounded-md"
                        onClick={togglePlayPause}
                      ></video>
                    ) : (
                      <img
                        src={asset.file}
                        alt="Uploaded asset"
                        className="w-full h-48 object-cover rounded-md"
                      />
                    )}
                    <button
                      onClick={() => removeAsset(asset.id)}
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button
                  variant="activePrimary"
                  className="w-full"
                  type="submit"
                >
                  Upload
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewAsset;
