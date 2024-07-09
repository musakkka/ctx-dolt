import { Account } from "@/models/Channel";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { NextApiRequest, NextApiResponse } from 'next';

export const maxDuration = 59; // This function can run for a maximum of 59 seconds
export const dynamic = 'force-dynamic';

export async function GET(request: Request, response: NextApiResponse): Promise<any> {
    // const { userId } = auth();

    // if (!userId) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    try {
        await mongooseConnect();

        const accounts = await Account.find();

        return NextResponse.json(accounts, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
