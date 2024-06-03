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

import { createPrompt, updatePrompt } from "@/actions/promptActions";

const FormSchema = z.object({
  promptTitle: z.string().min(1, { message: "Prompt title is required." }),
  promptContent: z.string().min(1, { message: "Prompt content is required." }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

interface PromptFormProps {
  channelId: string;
  initialData?: {
    promptTitle: string;
    promptContent: string;
  };
  promptId?: string;
}

export const PromptForm = ({ channelId, initialData, promptId }: PromptFormProps) => {
  const router = useRouter();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData || {
      promptTitle: "",
      promptContent: "",
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    try {
      let response;
      if (promptId && initialData) {
        // Update existing prompt
        response = await updatePrompt({ ...data, promptId });
      } else {
        // Create new prompt
        response = await createPrompt({ ...data, channelId });
      }

      if (response.success) {
        toast.success(response.message);
        router.push(`/channel/${channelId}/prompts`);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast.error(`Error ${promptId ? 'updating' : 'creating'} prompt!`);
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <FormField
            control={form.control}
            name="promptTitle"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Prompt Title</FormLabel>
                <FormControl>
                  <Textarea className="w-full bg-transparent text-xl border-gray-500 focus:border-gray-500 text-white" rows={2} placeholder="Enter prompt title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="promptContent"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Prompt Content</FormLabel>
                <FormControl>
                  <Textarea className="w-full text-xl bg-transparent border-gray-500 focus:border-gray-500 text-white" rows={20} placeholder="Enter prompt content" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button variant="activePrimary" type="submit" className="w-full cursor-pointer">
            {promptId ? "Update Prompt" : "Save Prompt"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
