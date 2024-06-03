import Image from "next/image"



export const EmptyFavorite = () => {
  return (
    <div className="justify-center text-center">
        <Image
        src="./empty-favorites.svg"
        alt="Empty"
        width={200}
        height={200}
        />  
        <h2 className="text-2xl font-semibold mt-6">
            No Favorite Board
        </h2>
        <p className="text-muted-foreground text-sm mt-2">
            Try Favoriting Something..
        </p>
    </div>
  )
}
