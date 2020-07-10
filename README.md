# AOE2DEOverlay
provides dynamic twitch overlay for steamid specified with match information

## Installation Steps (github hosted)
1) Install Node.JS from [here](https://nodejs.org/en/download/current/)
2) Clone/Download this or a forked repository from github
3) Open CMD prompt and move to the downloaded directory
4) type "npm i" - this will install dependencies
5) click start.bat to start services to proxy requests to aoe2.net bypassing cors restrictions
6) Add source of "Browser" within OBS studio in the scene of your choice
7) Copy link from browser location of repository and paste into the field labeled URL. A customizable link is available below
    - https://predictabilityisgood.github.io/AOE2DEOverlay/?steamid=PlayerSteamIDHere&opacity=YourOpacityBetween0and1
8) Modify the width and height attributes to ensure that the information provided fits properly within your stream display. We recommend 1200w x 200h
9) Utilize the obs resizing options to fit the overlay properly within your stream

## Installation Steps (locally hosted - development or custom builds)
1) Install Node.JS from [here](https://nodejs.org/en/download/current/)
2) Clone/Download this or a forked repository from github
3) Open CMD prompt and move to the downloaded directory
4) type "npm i" - this will install dependencies
5) Install VS Code (Visual studio Code)
6) Install live-server extension within VS Code from ritwick dey 
7) click start.bat to start services to proxy requests to aoe2.net bypassing cors restrictions
8) click the "Go Live" button on the bottom right of visual studio code
9) Take the link from the browser window that opens
10) Add source of "Browser" within OBS studio in the scene of your choice
11) Paste link from step 9 into the field labeled URL
12) Modify the width and height attributes to ensure that the information provided fits properly within your stream display. We recommend 1200w x 200h
13) Utilize the obs resizing options to fit the overlay properly within your stream

## Customization
You can customize the link provided with the following required/optional features

i.e. for Dogao's aoe profile:

https://predictabilityisgood.github.io/AOE2DEOverlay/?steamid=76561197992981071&opacity=.8

i.e. for Miguel's aoe profile:

https://predictabilityisgood.github.io/AOE2DEOverlay/?steamid=76561198242526658&opacity=.8

i.e. for Hera's aoe profile:

https://predictabilityisgood.github.io/AOE2DEOverlay/?steamid=76561198449406083&opacity=.8


### Required
steamid - id of the steam profile that you are looking for the match of 

### Optional
background - color of background, supports hex color codes, rgb, rgba, and all other native css3 color formats

text - color of texet, supports hex color codes, rgb, rgba, and all other native css3 color formats

opacity - translucency of the overlay 0-1

scores - manual override for score display based on teams 1 and 2. i.e. scores=3,2

### Recommendations
1v1 Matches should display the browser widget as 1200 x 200 resized to fit within the area between resources and diplomacy options
Team Matches should display the browser widget as 1800 x 200 resized to fit within other areas. Utilize the opacity property with a low value in order to prevent viewer experience blocking like opacity=.3