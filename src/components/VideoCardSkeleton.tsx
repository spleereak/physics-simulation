export const VideoCardSkeleton = () => {
  return (
    <div className='flex mb-4 rounded-lg overflow-hidden bg-white animate-pulse'>
      <div className='relative flex-shrink-0'>
        <div className='w-40 h-28 bg-gray-300' />
      </div>
      <div className='flex-1 p-4 flex items-center'>
        <div className='space-y-2 w-full'>
          <div className='h-4 bg-gray-300 rounded w-3/4' />
          <div className='h-4 bg-gray-300 rounded w-1/2' />
        </div>
      </div>
    </div>
  )
}