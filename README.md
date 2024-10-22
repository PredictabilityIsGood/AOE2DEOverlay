# AOE2DEOverlay
provides dynamic twitch overlay for steamid specified with match information with civilization icons, and civ overviews and details

![Civilization Details](https://raw.githubusercontent.com/PredictabilityIsGood/AOE2DEOverlay/master/Civ-Details.PNG)


## Installation Steps (github hosted, internet proxied courtesy VaultLambda.com - out of the box setup - BASIC )
1) Add source of "Browser" within OBS studio in the scene of your choice
2) Copy link from browser location of repository and paste into the field labeled URL. A customizable link is available below
    - https://predictabilityisgood.github.io/AOE2DEOverlay/?steamid=PlayerSteamIDHere&opacity=YourOpacityBetween0and1&proxy=https://proxy.vaultlambda.com/
3) Modify the width and height attributes to ensure that the information provided fits properly within your stream display. We recommend 940w x 600h for both 1v1 and Team games with multiple players. Resizing then will occur within the obs scaler in step 9
4) Utilize the obs resizing options to fit the overlay properly within your stream

## Installation Steps (github hosted, locally proxied - out of the box setup - BASIC )
1) Install Node.JS from [here](https://nodejs.org/en/download/current/)
2) Clone/Download this or a forked repository from github
3) Open CMD prompt and move to the downloaded directory
4) type "npm i cors-anywhere" - this will install dependencies for the file server.js
5) click start.bat to start services to proxy requests to aoe2.net bypassing cors restrictions
6) Add source of "Browser" within OBS studio in the scene of your choice
7) Copy link from browser location of repository and paste into the field labeled URL. A customizable link is available below
    - https://predictabilityisgood.github.io/AOE2DEOverlay/?steamid=PlayerSteamIDHere&opacity=YourOpacityBetween0and1
8) Modify the width and height attributes to ensure that the information provided fits properly within your stream display. We recommend 940w x 600h for both 1v1 and Team games with multiple players. Resizing then will occur within the obs scaler in step 9
9) Utilize the obs resizing options to fit the overlay properly within your stream

## Installation Steps (locally hosted, locally proxied - development or custom builds - ADVANCED )
1) Install Node.JS from [here](https://nodejs.org/en/download/current/)
2) Clone/Download this or a forked repository from github
3) Open CMD prompt and move to the downloaded directory
4) type "npm i cors-anywhere" - this will install dependencies for the file server.js
5) Install VS Code (Visual studio Code)
6) Install live-server extension within VS Code from ritwick dey 
7) click start.bat to start services to proxy requests to aoe2.net bypassing cors restrictions
8) click the "Go Live" button on the bottom right of visual studio code
9) Take the link from the browser window that opens
10) Add source of "Browser" within OBS studio in the scene of your choice
11) Paste link from step 9 into the field labeled URL
12) Modify the width and height attributes to ensure that the information provided fits properly within your stream display. We recommend 940w x 600h for both 1v1 and Team games with multiple players. Resizing then will occur within the obs scaler in step 13
13) Utilize the obs resizing options to fit the overlay properly within your stream

## Customization
You can customize the link provided with the following required/optional features

i.e. for Dogao's aoe profile:

https://predictabilityisgood.github.io/AOE2DEOverlay/?steamid=76561197992981071&opacity=.8&proxy=https://proxy.vaultlambda.com/

i.e. for Miguel's aoe profile:

https://predictabilityisgood.github.io/AOE2DEOverlay/?steamid=76561198242526658&opacity=.8&proxy=https://proxy.vaultlambda.com/

i.e. for Hera's aoe profile:

https://predictabilityisgood.github.io/AOE2DEOverlay/?steamid=76561198449406083&opacity=.8&proxy=https://proxy.vaultlambda.com/


### Required
steamid - id of the steam profile that you are looking for the match of 

### Optional
background - color of background, supports hex color codes, rgb, rgba, and all other native css3 color formats

text - color of text, supports hex color codes, rgb, rgba, and all other native css3 color formats

opacity - translucency of the overlay 0-1 (decimal points in between)

playerTextSize - override value for player text size (percentage, pixels, rem and all other native css3 font size formats)

statsTextSize - override value for stats text size (percentage, pixels, rem and all other native css3 font size formats)

countryTextSize - override value for country text size (percentage, pixels, rem and all other native css3 font size formats)

civTextSize - override value for player text size (percentage, pixels, rem and all other native css3 font size formats)

showPlayerPanel - override for showing/hiding player panel (i.e. true/false) => default true

showStatsPanel - override for showing/hiding stats panel (i.e. true/false) => default true

showCountryPanel - override for showing/hiding country panel (i.e. true/false) => default true

showCivPanel - override for showing/hiding civ panel (i.e. true/false) => default true

showWins - override for showing/hiding stat wins (i.e. true/false) => default true

showLosses - override for showing/hiding stat losses (i.e. true/false) => default true

showAvgElo - override for showing/hiding stat average elo (Team Games Only) (i.e. true/false) => default true

showMaxElo - override for showing/hiding stat elo or Max ELO (Team Games) (i.e. true/false) => default true

showCountryText - override for showing/hiding country text (i.e. true/false) => default true

showCountryFlags - override for showing/hiding country flags (i.e. true/false) => default true

scores - manual override for score display based on teams 1 and 2. i.e. scores=3,2


### Recommendations
1v1 and Team Matches should display the browser source as 940 x 600 resized to fit within the area between resources and diplomacy options with a low value opacity in order to prevent viewer experience blocking like opacity=.3. By utilizing the 600h, brief civ information will be visible as the new match is loaded into memory

### Need Help/Want Customization?
I'd be glad to continue helping anyone who happens to stumble on this little project. If you'd like personal customizations, send me an email or add me on github!

### Special Thanks
Thank you to [Siege Engineers](https://github.com/SiegeEngineers/aoe2techtree) for helping decompress assets from AOE2DE game files which helps create the wonderful civ overviews upon new match load
