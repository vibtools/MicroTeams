export const getEmbedVideoUrl = (url: string): string => {
  if (!url) return '';
  
  // YouTube
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  // Google Drive
  // Matches: drive.google.com/file/d/ID/view, drive.google.com/open?id=ID
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([^"&?\/\s]+)/i);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  // archive.org
  // Matches: archive.org/details/ID
  const archiveMatch = url.match(/archive\.org\/details\/([^"&?\/\s]+)/i);
  if (archiveMatch && archiveMatch[1]) {
    return `https://archive.org/embed/${archiveMatch[1]}`;
  }

  // OneDrive
  // OneDrive embed links are usually generated manually, but if they paste a share link 
  // we can attempt to format it, but OneDrive URLs are tricky. 
  // Let's assume if it has 'onedrive.live.com/embed' it's already an embed.
  // If it's 'onedrive.live.com/redir', replace redir with embed.
  if (url.includes('onedrive.live.com/redir')) {
    return url.replace('redir', 'embed');
  }

  return url;
};
