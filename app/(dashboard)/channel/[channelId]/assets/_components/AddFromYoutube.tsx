"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Plus, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

const FormSchema = z.object({
  description: z.string().min(1, { message: "Description is required." }),
  videoUrl: z
    .string()
    .url({ message: "Must be a valid URL." })
    .min(1, { message: "Video URL is required." }),
});

type FormData = z.infer<typeof FormSchema>;

export const AddFromYoutube = ({ channelId }: { channelId: string }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: "",
      videoUrl: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);

    try {
      const response = await fetch("/api/addFromYoutube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, channelId }),
      });

      if (response.ok) {
        toast.success("Video added successfully");
        router.refresh();
        form.reset();
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.log("Error: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <div className="flex items-center cursor-pointer">
            <div className="bg-[#6D66FF] rounded-full">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div className="px-2 py-1 rounded-md text-lg font-bold text-white">
              Add From Youtube
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="w-[800px]">
          <DialogHeader>
            <DialogTitle>Add Video from YouTube</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-4"
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="w-full bg-transparent border-gray-500 focus:border-gray-500 text-white"
                        rows={5}
                        placeholder="Enter a brief description of the video"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Textarea
                        className="w-full bg-transparent border-gray-500 focus:border-gray-500 text-white"
                        placeholder="Enter the YouTube video URL"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant="activePrimary"
                  className="w-full"
                  type="submit"
                  disabled={loading}
                >
                  Add from YouTube
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddFromYoutube;
