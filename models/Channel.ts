import { model, Schema, models } from "mongoose";

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
  "Motivational"
];

const AccountSchema = new Schema({
  account_name: {
    type: String,
    required: true,
  },
  account_credentials: {
    type: String,
    required: true,
  },
  account_username: {
    type: String,
    required: true,
  },
  account_gmail: {
    type: String,
    required: true,
  },
  account_category: {
    type: String,
    required: true,
    enum: categories,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

export const Account = models.Account || model('Account', AccountSchema);
