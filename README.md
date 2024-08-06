# Discord Image Embed Manipulator
Change the images displayed for the placeholder blur hash, desktop preview and focus/primary through an easy to use website

## How it works
Discord sends 3 requests when attempting to embed an image:
1. The first request fetches the blur hash source
2. The second request fetches the preview image (bypassed by mobile)
3. The third request fetches the image that is shown when focused