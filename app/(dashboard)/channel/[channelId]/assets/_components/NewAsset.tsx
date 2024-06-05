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
import { createPost, getSignedURL } from "./actions";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { createAsset } from "@/actions/assetActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { revalidateTag } from "next/cache";

const FormSchema = z.object({
  asset_description: z
    .string()
    .min(1, { message: "Asset description is required." }),
});

type FormData = z.infer<typeof FormSchema>;

export const NewAsset = ({ channelId }: { channelId: string }) => {
  const [assets, setAssets] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const accountId = channelId; // Replace with actual account ID

  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      asset_description: "",
    },
  });

  const uploadFileToS3 = async (file, onProgress) => {
    try {
      const signedURLResult = await getSignedURL({
        fileSize: file.size,
        fileType: file.type,
        originalName: file.name,
        checksum: await computeSHA256(file),
      });

      if (signedURLResult.failure !== undefined) {
        throw new Error(signedURLResult.failure);
      }

      const { url, key } = signedURLResult.success;

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };

      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);

      return new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            const bucketName = process.env.AWS_BUCKET_NAME;
            const region = process.env.AWS_BUCKET_REGION;
            const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
            resolve(fileUrl);
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed"));
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const computeSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const handleFileChange = async (event) => {
    const files = event.target.files;
    const newAssets = [];

    for (let file of files) {
      const assetId = Date.now() + Math.random();
      const preview = URL.createObjectURL(file);

      // Show preview immediately
      newAssets.push({
        id: assetId,
        file,
        preview,
        type: file.type.startsWith("video") ? "video" : "image",
        url: "", // Placeholder for URL
        progress: 0, // Initial progress
      });

      // Start upload in the background
      uploadFileToS3(file, (progress) => {
        setAssets((prevAssets) =>
          prevAssets.map((asset) =>
            asset.id === assetId ? { ...asset, progress } : asset
          )
        );
      })
        .then((fileUrl) => {
          setAssets((prevAssets) =>
            prevAssets.map((asset) =>
              asset.id === assetId ? { ...asset, url: fileUrl } : asset
            )
          );
        })
        .catch(console.error);
    }
    console.log("AWS_BUCKET_REGION:", process.env.AWS_BUCKET_REGION);
console.log("AWS_ACCESS_KEY:", process.env.AWS_PROJECT_ACCESS_KEY);
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);
console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME);


    setAssets((prevAssets) => [...prevAssets, ...newAssets]);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    const newAssets = [];

    for (let file of files) {
      const assetId = Date.now() + Math.random();
      const preview = URL.createObjectURL(file);

      // Show preview immediately
      newAssets.push({
        id: assetId,
        file,
        preview,
        type: file.type.startsWith("video") ? "video" : "image",
        url: "", // Placeholder for URL
        progress: 0, // Initial progress
      });

      // Start upload in the background
      uploadFileToS3(file, (progress) => {
        setAssets((prevAssets) =>
          prevAssets.map((asset) =>
            asset.id === assetId ? { ...asset, progress } : asset
          )
        );
      })
        .then((fileUrl) => {
          setAssets((prevAssets) =>
            prevAssets.map((asset) =>
              asset.id === assetId ? { ...asset, url: fileUrl } : asset
            )
          );
        })
        .catch(console.error);
    }

    setAssets((prevAssets) => [...prevAssets, ...newAssets]);
  };

  const removeAsset = (id) => {
    setAssets((assets) => assets.filter((asset) => asset.id !== id));
  };

  const togglePlayPause = (event) => {
    const video = event.target;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setStatusMessage("Uploading files...");

    try {
      const assetData = assets.map((asset) => ({
        description: data.asset_description,
        type: asset.type,
        url: asset.url,
        account_id: accountId, // Replace with actual account ID
      }));

      const results = await Promise.all(assetData.map(createAsset));

      results.forEach((result, index) => {
        if (result.success) {
          toast.success(
            `${data.asset_description.substring(0, 20)}... created successfully`
          );
          setIsDialogOpen(false);
          form.reset();
          setAssets([]);
          router.refresh();
          revalidateTag('get-channel-assets'); // Add this line
        } else {
          console.error(`Error creating asset ${index + 1}:`, result.message);
        }
      });

      setStatusMessage("Upload successful!");
    } catch (error) {
      console.error("Error during asset upload:", error);
      setStatusMessage("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                        src={asset.preview}
                        className="w-full h-48 object-cover rounded-md relative"
                        onClick={togglePlayPause}
                      ></video>
                    ) : (
                      <img
                        src={asset.preview}
                        alt="Uploaded asset"
                        className="w-full h-48 object-cover rounded-md"
                      />
                    )}
                    {asset.progress < 100 && (
                      <div className="absolute inset-0 flex items-center justify-center w-16 h-16">
                        <CircularProgressbar
                          value={asset.progress}
                          text={`${Math.round(asset.progress)}%`}
                        />
                      </div>
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
                  disabled={loading}
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
