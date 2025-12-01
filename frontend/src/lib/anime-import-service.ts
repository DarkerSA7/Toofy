/**
 * Anime Cover Import Service
 * Imports high-quality anime cover images from AniList, MyAnimeList, and Bangumi
 */

export async function importCoverFromUrl(url: string): Promise<{ imageFile: File; imageUrl: string }> {
  const anilistMatch = url.match(/anilist\.co\/anime\/(\d+)/)
  const malMatch = url.match(/myanimelist\.net\/anime\/(\d+)/)
  const bangumiMatch = url.match(/bangumi\.tv\/subject\/(\d+)/)

  let coverImageUrl: string | null = null
  let isBangumi = false

  try {
    if (anilistMatch) {
      coverImageUrl = await getAniListCover(anilistMatch[1])
    } else if (malMatch) {
      coverImageUrl = await getMyAnimeListCover(malMatch[1])
    } else if (bangumiMatch) {
      try {
        coverImageUrl = await getBangumiCover(bangumiMatch[1])
        isBangumi = true
      } catch (bangumiError) {
        // If Bangumi fails, try to get the anime name and search on AniList
        throw new Error('Bangumi API error. Please use AniList or MyAnimeList URL instead.')
      }
    } else {
      throw new Error('Invalid URL. Supported: anilist.co/anime/*, myanimelist.net/anime/*, bangumi.tv/subject/*')
    }

    if (!coverImageUrl) {
      throw new Error('No cover image found')
    }

    // Download image with highest quality (same as add-anime-dialog)
    let imageResponse: Response
    
    // For Bangumi images, use backend proxy to bypass CORS
    if (isBangumi) {
      const proxyUrl = `${process.env.NEXT_PUBLIC_API_URL}/proxy-image?url=${encodeURIComponent(coverImageUrl)}`
      imageResponse = await fetch(proxyUrl)
    } else {
      imageResponse = await fetch(coverImageUrl)
    }
    
    if (!imageResponse.ok) {
      throw new Error('Failed to download image')
    }

    const blob = await imageResponse.blob()
    
    // Always use JPEG for consistency (same as add-anime-dialog)
    const imageFile = new File([blob], `anime_cover_${Date.now()}.jpg`, { type: 'image/jpeg' })
    const imageUrl = URL.createObjectURL(imageFile)

    return { imageFile, imageUrl, isBangumi }
  } catch (error) {
    throw error
  }
}

async function getAniListCover(id: string): Promise<string> {
  const query = `
    query {
      Media(id: ${id}, type: ANIME) {
        coverImage {
          extraLarge
          large
          medium
        }
      }
    }
  `

  const response = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })

  const data = await response.json()

  if (data.errors) {
    throw new Error('Failed to fetch from AniList')
  }

  const coverUrl = data.data.Media.coverImage.extraLarge || data.data.Media.coverImage.large || data.data.Media.coverImage.medium

  if (!coverUrl) {
    throw new Error('No cover image found on AniList')
  }

  return coverUrl
}

async function getMyAnimeListCover(id: string): Promise<string> {
  const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`)

  if (!response.ok) {
    throw new Error('Failed to fetch from MyAnimeList')
  }

  const data = await response.json()

  if (!data.data) {
    throw new Error('Anime not found on MyAnimeList')
  }

  // Use large_image_url for highest quality (same as add-anime-dialog)
  const coverUrl = data.data.images?.jpg?.large_image_url || data.data.images?.jpg?.image_url || data.data.images?.webp?.image_url

  if (!coverUrl) {
    throw new Error('No cover image found on MyAnimeList')
  }

  return coverUrl
}

async function getBangumiCover(id: string): Promise<string> {
  try {
    const response = await fetch(`https://api.bgm.tv/v0/subjects/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`Bangumi API returned ${response.status}`)
    }

    const data = await response.json()

    // Try different image fields - prefer common size (balanced quality/size)
    let coverUrl = data.images?.common || data.images?.large || data.image

    if (!coverUrl) {
      throw new Error('No cover image found on Bangumi')
    }

    return coverUrl
  } catch (error) {
    throw new Error('Bangumi: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}
