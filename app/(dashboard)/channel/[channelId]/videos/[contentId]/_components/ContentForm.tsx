"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

import { createContent, updateContent } from "@/actions/contentActions";

const FormSchema = z.object({
  contentGenerationScript: z
    .string()
    .min(1, { message: "Content generation script is required." }),
  contentGenerationScriptApproved: z.boolean().default(false),
  contentGenerationVoiceOverUrl: z
    .string()
    // .url({ message: "Valid URL is required." })
    .optional(),
  contentGenerationVoiceOverUrlApproved: z.boolean().default(false),
  contentGenerationCaptions: z.string().optional(),
  contentGenerationCaptionsApproved: z.boolean().default(false),
  contentGenerationBackgroundVideoUrl: z
    .string()
    // .url({ message: "Valid URL is required." })
    .optional(),
  contentGenerationBackgroundVideoUrlApproved: z.boolean().default(false),
  contentPublishingTitle: z.string().optional(),
  contentPublishingDescription: z.string().optional(),
  contentPublishingFinalVideoUrl: z
    .string()
    // .url({ message: "Valid URL is required." })
    .optional(),
  finalPublishingYoutubeUrl: z
    .string()
    // .url({ message: "Valid URL is required." })
    .optional(),
  status: z.string().optional(),
  reviewCounts: z.string().optional(),
  correctionsToBeMade: z.array(z.object({})).optional(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface ContentFormProps {
  channelId: string;
  initialData?: Partial<FormSchemaType>;
  contentId?: string;
}

export const ContentForm = ({
  channelId,
  initialData,
  contentId,
}: ContentFormProps) => {
  const router = useRouter();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData || {
      contentGenerationScript: "",
      contentGenerationScriptApproved: false,
      contentGenerationVoiceOverUrl: "",
      contentGenerationVoiceOverUrlApproved: false,
      contentGenerationCaptions: "",
      contentGenerationCaptionsApproved: false,
      contentGenerationBackgroundVideoUrl: "",
      contentGenerationBackgroundVideoUrlApproved: false,
      contentPublishingTitle: "",
      contentPublishingDescription: "",
      contentPublishingFinalVideoUrl: "",
      finalPublishingYoutubeUrl: "",
      status: "",
      reviewCounts: "",
      correctionsToBeMade: [{}],
    },
  });

  // console.log(initialData);

  const onSubmit = async (data: FormSchemaType) => {
    try {
      let response;

      if (contentId && initialData) {
        // console.log({ ...data, contentId })
        response = await updateContent({ ...data, contentId });
        // console.log({response});
      } else {
        // console.log({ ...data, channelId });

        response = await createContent({ ...data, channelId });
      }

      if (response.success) {
        toast.success(response.message);
        // router.push(`/channel/${channelId}/content`);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error(`Error ${contentId ? "updating" : "creating"} content!`);
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <FormField
            control={form.control}
            name="contentGenerationScript"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Content Generation Script</FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full text-xl bg-transparent border-gray-500 focus:border-gray-500 text-white"
                    rows={20}
                    placeholder="Enter content generation script"
                    {...field}
                  />
                </FormControl>
                <div className="text-right text-sm text-gray-400">
                  {field.value?.length} characters
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contentGenerationScriptApproved"
            render={({ field }) => (
              <FormItem className="h-[50px] space-x-3 flex flex-col mt-[-50px]">
                <FormLabel className="h-[40px]">
                  Content Generation Script Approved
                </FormLabel>
                <FormControl className="h-40px">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-gray-500 w-10 h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center space-x-3">
            <FormField
              control={form.control}
              name="contentGenerationVoiceOverUrl"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Voice Over URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      className="w-full text-xl bg-transparent border-gray-500 focus:border-gray-500 text-white"
                      placeholder="Enter voice over URL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contentGenerationVoiceOverUrlApproved"
              render={({ field }) => (
                <FormItem className="w-full h-full flex flex-col ">
                  <FormLabel className="pt-[16px]">
                    Voice Over URL Approved
                  </FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-gray-500 w-10 h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="contentGenerationCaptions"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Captions</FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full text-xl bg-transparent border-gray-500 focus:border-gray-500 text-white"
                    rows={10}
                    placeholder="Enter captions"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contentGenerationCaptionsApproved"
            render={({ field }) => (
              <FormItem className="h-[50px] space-x-3 flex flex-col mt-[-50px]">
                <FormLabel className="h-[40px]">Captions Approved</FormLabel>
                <FormControl className="h-40px">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-gray-500 w-10 h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center space-x-3">
            <FormField
              control={form.control}
              name="contentGenerationBackgroundVideoUrl"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Background Video URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      className="w-full text-xl bg-transparent border-gray-500 focus:border-gray-500 text-white"
                      placeholder="Enter background video URL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contentGenerationBackgroundVideoUrlApproved"
              render={({ field }) => (
                <FormItem className="w-full h-full flex flex-col ">
                  <FormLabel className="pt-[16px]">
                    Background Video URL Approved
                  </FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-gray-500 w-10 h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="contentPublishingTitle"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Publishing Title</FormLabel>
                <FormControl>
                  <Input
                    className="w-full text-xl bg-transparent border-gray-500 focus:border-gray-500 text-white"
                    type="text"
                    placeholder="Enter publishing title"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contentPublishingDescription"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Publishing Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="w-full text-xl bg-transparent border-gray-500 focus:border-gray-500 text-white"
                    rows={5}
                    placeholder="Enter publishing description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contentPublishingFinalVideoUrl"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Final Video URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    className="w-full text-xl bg-transparent border-gray-500 focus:border-gray-500 text-white"
                    placeholder="Enter final video URL"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="finalPublishingYoutubeUrl"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Final YouTube URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    className="w-full text-xl bg-transparent border-gray-500 focus:border-gray-500 text-white"
                    placeholder="Enter YouTube URL"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="w-full text-xl bg-transparent border-gray-500 focus:border-gray-500 text-white"
                    placeholder="Enter status"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reviewCounts"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Review Counts</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    className="w-full text-xl bg-transparent border-gray-500 focus:border-gray-500 text-white"
                    placeholder="Enter review counts"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            variant="activePrimary"
            type="submit"
            className="w-full cursor-pointer"
          >
            {contentId ? "Update Content" : "Save Content"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
