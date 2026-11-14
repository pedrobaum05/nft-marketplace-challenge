
import { useParams } from "@tanstack/react-router"

import { NFTDetailPage } from "@/pages/nft-detail-page"

export function NFTDetailRoute() {
  const { nftId } = useParams({
    from: "/nft/$nftId",
  })

  return <NFTDetailPage nftId={nftId} />
}
