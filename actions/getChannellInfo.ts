import { Account } from "@/models/Channel";
import { mongooseConnect } from "@/libs/mongoose";

export const getChannelNameById = async (id: string) => {
  try {
    await mongooseConnect();
    const channel = await Account.findById(id, 'account_name').exec();
    if (!channel) {
      throw new Error("Channel not found.");
    }
    // console.log({ channel });
    return channel.account_name;
  } catch (error) {
    console.error("Error fetching channel name:", error);
    throw new Error("Unable to fetch channel name.");
  }
};
