"use client";

import { useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Hint } from "@/components/ui/hint";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const categories = [
  "Education",
  "Technology",
  "Gaming",
  "Lifestyle",
  "Travel",
  "Food",
  "Health and Fitness",
  "Beauty and Fashion",
  "Music",
  "Comedy",
  "Sports",
  "News",
  "Science",
  "DIY and Crafts",
  "Vlogs",
  "Animation",
  "Movies and TV",
  "Finance",
  "History",
  "Politics",
  "Nature",
  "Books and Literature",
  "Business",
  "Motivational",
];

const FormSchema = z.object({
  account_name: z.string().min(1, { message: "Account name is required." }),
  account_username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters." }),
  account_gmail: z.string().email({ message: "Invalid email address." }),
  account_category: z.enum(categories as [string, ...string[]]),
  account_credentials: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type FormData = z.infer<typeof FormSchema>;

export const NewButton: React.FC = () => {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      account_name: "",
      account_username: "",
      account_gmail: "",
      account_category: "",
      account_credentials: "",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await axios.post("/api/channel", data);
      toast.success("Account Created Successfully!");
      const accountId = response.data._id;
      router.push(`/channel/${accountId}`);
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Error Creating Account!");
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <div className="mx-1 ">
          <Hint
            label="Create a new Channel"
            side="right"
            align="center"
            sideOffset={18}
          >
            <button className="h-full w-full flex-1 rounded-md flex items-center transition justify-between">
              <div className="bg-[#6D66FF] rounded-full p-1">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className=" px-2 py-1 rounded-md text-lg font-bold">Add New</div>
            </button>
          </Hint>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new Channel</DialogTitle>
          <DialogDescription>
            This will be the details for the Channel you create (eg. Youtube,
            Instagram, Tiktok)
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
          >
            <FormField
              control={form.control}
              name="account_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter channel name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter channel username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_gmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Gmail</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter channel Gmail" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Category</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_credentials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Channel</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
