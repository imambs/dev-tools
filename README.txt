DevKit Studio — AdSense + browser personalization bundle

Project structure
-----------------
index.html
styles.css
layout.js
app.js
adsense.js

components/
  sidebar.html
  topbar.html
  header-ad.html
  dashboard-ad.html
  footer-ad.html
  footer.html

vendor/
  bootstrap/bootstrap.min.css
  bootstrap/bootstrap.bundle.min.js
  bootstrap-icons/bootstrap-icons.min.css

tools/
  json-formatter.html
  chmod-calculator.html

Shared layout
-------------
Each page keeps its own page-specific <main> content.
layout.js injects the shared sidebar, topbar, header ad, footer ad and footer.

Dashboard personalization
-------------------------
Tool cards can be reordered by dragging the grip handle.
The ordering is stored only in the visitor's browser using localStorage.
On keyboard, focus a drag handle and use the arrow keys, Home or End.

Favorites are also stored only in localStorage. Favoriting a tool does NOT change
its position; the entire favorite card receives a distinct green-tinted style.
There is no database/account sync. Clearing browser/site data resets these choices.

Responsive dashboard ad placement
---------------------------------
The in-grid AdSense component remains fixed and is never draggable.
The page keeps it after approximately two tool rows at each responsive grid size:
  desktop 4 columns: after 8 tools
  tablet 2 columns: after 4 tools
  mobile 1 column: after 2 tools

On desktop the dashboard ad occupies half of the 4-column content row, leaving
room for two normal tool tiles in the other half.

Local CSS/JS dependencies
-------------------------
Bootstrap, Bootstrap Bundle and Bootstrap Icons are included in /vendor and all
HTML pages reference those local repository files. There are no CDN stylesheet or
Bootstrap script tags.

Google AdSense setup
--------------------
Open adsense.js and replace the empty values with your real AdSense publisher and
ad-slot IDs:

client: 'ca-pub-...'
slots.header: '...'
slots.dashboard: '...'
slots.footer: '...'

Until real IDs are added, clean advertisement placeholders remain visible and no
Google ad script is loaded.

Important: the Google AdSense delivery script itself must be loaded from Google's
AdSense domain when real ads are enabled. It should not be self-hosted. All UI
framework CSS/JS and icon assets in this project are local.

Run locally
-----------
Because common HTML components are loaded with fetch(), do not open index.html
using file://. Use a local web server, for example:

python3 -m http.server 8000

or

php -S localhost:8000

Then open http://localhost:8000/
