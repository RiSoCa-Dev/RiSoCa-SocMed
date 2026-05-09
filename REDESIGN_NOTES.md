# Redesign Notes

This build restores the old scheduler idea:

- platform selection
- video upload queue
- platform-specific previews
- 9:16 preview cards for YouTube, Facebook, Instagram, and TikTok
- simplified Buffer-style connection cards
- OAuth callbacks redirect back to `/connections`

Current automation status:

- YouTube upload worker is active.
- Facebook/Instagram connections are available through Meta OAuth.
- Facebook/Instagram publishing workers are the next backend phase.
- TikTok requires Content Posting API approval.
