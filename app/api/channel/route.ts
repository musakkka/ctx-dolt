import { Account } from "@/models/Channel";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { NextApiRequest, NextApiResponse } from 'next';

export async function POST(request: Request, response: NextApiResponse): Promise<any> {
    // const { userId } = auth();

    // if (!userId) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    try {
        const { account_name, account_credentials, account_username, account_gmail, account_category, } = await request.json();

        if (!account_name || !account_credentials) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await mongooseConnect();

        const newAccount = await Account.create({
            account_name,
            account_credentials,
            account_username,
            account_gmail,
            account_category,
        });


        return NextResponse.json(newAccount, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
