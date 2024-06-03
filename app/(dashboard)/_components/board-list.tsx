"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { EmptyBoards } from "./empty-boards";
import { EmptyFavorite } from "./empty-favorites";
import { EmptySearch } from "./empty-search";
import { BoardCard } from "./board-card";
import { NewBoardButton } from "./new-board-button";

interface BaordListProps {
  orgId: string;
  query: {
    search?: string;
    favorites?: string;
  };
}

export const BoardList = ({ orgId, query }: BaordListProps) => {
  const data = useQuery(api.boards.get, { 
    orgId, 
    ...query
   });

  if (data === undefined) {
    return (
      <div>
        <h2 className="text-3xl">
          {query.favorites ? "Favorite Boards" : "Team Boards"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
          <NewBoardButton orgId={orgId} disabled />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
        </div>
      </div>
    );
  }

  if (!data?.length && query.search) {
    return (
      <div
        className="h-full flex flex-col items-center
      justify-center"
      >
        <EmptySearch />
      </div>
    );
  }
  if (!data?.length && query.favorites) {
    return (
      <div
        className="h-full flex flex-col items-center
        justify-center"
      >
        <EmptyFavorite />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div
        className="h-full flex flex-col items-center
        justify-center"
      >
        <EmptyBoards />
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-3xl">
        {query.favorites ? "Favorite Boards" : "Team Boards"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
        <NewBoardButton orgId={orgId} />
        {data?.map((board) => (
          <div key={board._id} className="w-full">
            <BoardCard
              id={board._id}
              title={board.title}
              imageUrl={board.imageUrl}
              authorId={board.authorId}
              authorName={board.authorName}
              createdAt={board._creationTime}
              orgId={board.orgId}
              isFavorite={board.isFavorite}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
