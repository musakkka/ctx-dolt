import { Prompt } from "@/models/Prompt";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { NextApiRequest, NextApiResponse } from 'next';

export async function POST(request: Request, response: NextApiResponse): Promise<any> {
    // const { userId } = auth();

    // if (!userId) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    try {
        const { promptTitle, promptContent, channelId } = await request.json();

        if (!promptTitle || !promptContent || !channelId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await mongooseConnect();

        const newPrompt = await Prompt.create({
            promptTitle,
            promptContent,
            channelId,
        });

        return NextResponse.json(newPrompt, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request, response: NextApiResponse): Promise<any> {
    // const { userId } = auth();

    // if (!userId) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    try {
        const { promptId, promptTitle, promptContent } = await request.json();

        if (!promptId || !promptTitle || !promptContent) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await mongooseConnect();

        const updatedPrompt = await Prompt.findByIdAndUpdate(
            promptId,
            { promptTitle, promptContent },
            { new: true }
        );

        if (!updatedPrompt) {
            return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
        }

        return NextResponse.json(updatedPrompt, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
